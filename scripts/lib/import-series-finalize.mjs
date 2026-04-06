import { randomUUID } from "node:crypto"
import { spawn } from "node:child_process"
import { promises as fs } from "node:fs"
import path from "node:path"
import process from "node:process"

const sleep = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })

function getStatePaths(repoRoot) {
  const stateDir = path.join(repoRoot, ".cache", "import-series")

  return {
    stateDir,
    activeDir: path.join(stateDir, "active"),
    dirtyPath: path.join(stateDir, "dirty.json"),
    finalizedPath: path.join(stateDir, "finalized.json"),
    finalizeLockDir: path.join(stateDir, "finalize.lock"),
  }
}

async function ensureStateDirectories(repoRoot) {
  const { stateDir, activeDir } = getStatePaths(repoRoot)
  await fs.mkdir(stateDir, { recursive: true })
  await fs.mkdir(activeDir, { recursive: true })
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

async function readJson(targetPath) {
  if (!(await pathExists(targetPath))) {
    return null
  }

  try {
    const raw = await fs.readFile(targetPath, "utf8")
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function writeJsonAtomic(targetPath, value) {
  const tempPath = `${targetPath}.${process.pid}.${Date.now()}.${randomUUID()}.tmp`
  await fs.writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`)
  await fs.rename(tempPath, targetPath)
}

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false
  }

  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error?.code === "EPERM"
  }
}

async function cleanupStaleActiveImports(repoRoot) {
  const { activeDir } = getStatePaths(repoRoot)
  const entries = await fs.readdir(activeDir).catch(() => [])

  for (const entry of entries) {
    const sessionPath = path.join(activeDir, entry)
    const session = await readJson(sessionPath)

    if (session?.pid && isProcessAlive(session.pid)) {
      continue
    }

    await fs.rm(sessionPath, { force: true })
  }
}

async function listActiveImports(repoRoot) {
  await cleanupStaleActiveImports(repoRoot)
  const { activeDir } = getStatePaths(repoRoot)
  const entries = await fs.readdir(activeDir).catch(() => [])

  return Promise.all(
    entries.map(async (entry) => {
      const sessionPath = path.join(activeDir, entry)
      const session = await readJson(sessionPath)

      return session
        ? {
            ...session,
            path: sessionPath,
          }
        : null
    }),
  ).then((sessions) => sessions.filter(Boolean))
}

export async function registerImportSession(repoRoot, label) {
  await ensureStateDirectories(repoRoot)

  const { activeDir } = getStatePaths(repoRoot)
  const sessionId = `${Date.now()}-${process.pid}-${randomUUID()}`
  const sessionPath = path.join(activeDir, `${sessionId}.json`)
  const session = {
    id: sessionId,
    pid: process.pid,
    label,
    startedAt: new Date().toISOString(),
  }

  await writeJsonAtomic(sessionPath, session)

  return {
    id: sessionId,
    async release() {
      await fs.rm(sessionPath, { force: true })
    },
  }
}

export async function markSeriesImportsDirty(repoRoot, source) {
  await ensureStateDirectories(repoRoot)
  const { dirtyPath } = getStatePaths(repoRoot)

  const token = `${Date.now()}-${process.pid}-${randomUUID()}`
  await writeJsonAtomic(dirtyPath, {
    token,
    source,
    pid: process.pid,
    updatedAt: new Date().toISOString(),
  })

  return token
}

async function acquireFinalizeLock(repoRoot) {
  await ensureStateDirectories(repoRoot)

  const { finalizeLockDir } = getStatePaths(repoRoot)

  while (true) {
    try {
      await fs.mkdir(finalizeLockDir)
      await writeJsonAtomic(path.join(finalizeLockDir, "owner.json"), {
        pid: process.pid,
        startedAt: new Date().toISOString(),
      })

      return {
        async release() {
          await fs.rm(finalizeLockDir, { recursive: true, force: true })
        },
      }
    } catch (error) {
      if (error?.code !== "EEXIST") {
        throw error
      }

      const ownerPath = path.join(finalizeLockDir, "owner.json")
      const owner = await readJson(ownerPath)

      if (owner?.pid && !isProcessAlive(owner.pid)) {
        await fs.rm(finalizeLockDir, { recursive: true, force: true })
        continue
      }

      await sleep(1000)
    }
  }
}

async function waitForImportStability(repoRoot, onProgress) {
  let previousCount = -1

  while (true) {
    const activeImports = await listActiveImports(repoRoot)

    if (activeImports.length === 0) {
      return
    }

    if (activeImports.length !== previousCount) {
      previousCount = activeImports.length
      onProgress?.("wait", `Waiting for ${activeImports.length} active import(s) to finish before finalizing.`)
    }

    await sleep(1000)
  }
}

async function runScript(repoRoot, relativeScriptPath, args, stdio) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(repoRoot, relativeScriptPath), ...args], {
      cwd: repoRoot,
      stdio,
      env: process.env,
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${path.basename(relativeScriptPath)} exited with code ${code}`))
    })

    child.on("error", reject)
  })
}

export async function finalizeSeriesImports(repoRoot, options = {}) {
  const { onProgress, stdio = "inherit" } = options
  const paths = getStatePaths(repoRoot)
  const lock = await acquireFinalizeLock(repoRoot)

  try {
    await waitForImportStability(repoRoot, onProgress)

    const dirtyState = await readJson(paths.dirtyPath)
    if (!dirtyState?.token) {
      onProgress?.("skip", "No pending series import finalization.")
      return { status: "skipped", reason: "clean" }
    }

    const finalizedState = await readJson(paths.finalizedPath)
    if (finalizedState?.token === dirtyState.token) {
      onProgress?.("skip", "Series import finalization is already up to date.")
      return { status: "skipped", reason: "up-to-date" }
    }

    onProgress?.("sync", "Running sync-runs-content-model --write")
    await runScript(repoRoot, "scripts/sync-runs-content-model.mjs", ["--write"], stdio)

    onProgress?.("images", "Running images:sync")
    await runScript(repoRoot, "scripts/generate-run-image-derivatives.mjs", [], stdio)

    await writeJsonAtomic(paths.finalizedPath, {
      token: dirtyState.token,
      source: dirtyState.source,
      finalizedAt: new Date().toISOString(),
    })

    onProgress?.("done", "Series import finalization completed.")
    return { status: "finalized", token: dirtyState.token }
  } finally {
    await lock.release()
  }
}

import type { Media, MediaList, MediaListOptions, MediaStore, MediaUploadOptions } from "tinacms"

type TinaAuthProvider = {
  fetchWithToken?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  getToken?: () => Promise<{ id_token?: string | null } | null>
}

type TinaClient = {
  authProvider?: TinaAuthProvider
}

export class R2MediaStore implements MediaStore {
  accept = "image/*"

  constructor(private client?: TinaClient) {}

  private async fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
    if (this.client?.authProvider?.fetchWithToken) {
      return this.client.authProvider.fetchWithToken(input, init)
    }

    const token = await this.client?.authProvider?.getToken?.()
    const headers = new Headers(init?.headers)

    if (token?.id_token) {
      headers.set("Authorization", `Bearer ${token.id_token}`)
    }

    return fetch(input, {
      ...init,
      headers,
    })
  }

  async persist(files: MediaUploadOptions[]) {
    return Promise.all(
      files.map(async ({ directory, file }) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("directory", directory || "")

        const response = await this.fetchWithAuth("/api/media/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }

        return response.json() as Promise<Media>
      }),
    )
  }

  async delete(media: Media) {
    const response = await this.fetchWithAuth("/api/media/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: media.id }),
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }
  }

  async list(options?: MediaListOptions) {
    const query = new URLSearchParams()

    if (options?.directory) {
      query.set("directory", options.directory)
    }

    if (options?.limit) {
      query.set("limit", String(options.limit))
    }

    if (options?.offset) {
      query.set("offset", String(options.offset))
    }

    const response = await this.fetchWithAuth(`/api/media/list?${query.toString()}`)

    if (!response.ok) {
      throw new Error(await response.text())
    }

    return response.json() as Promise<MediaList>
  }
}

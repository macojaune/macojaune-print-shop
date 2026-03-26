import type { Media, MediaList, MediaListOptions, MediaStore, MediaUploadOptions } from "tinacms"

export class R2MediaStore implements MediaStore {
  accept = "image/*"

  async persist(files: MediaUploadOptions[]) {
    return Promise.all(
      files.map(async ({ directory, file }) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("directory", directory || "")

        const response = await fetch("/api/media/upload", {
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
    const response = await fetch("/api/media/delete", {
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

    const response = await fetch(`/api/media/list?${query.toString()}`)

    if (!response.ok) {
      throw new Error(await response.text())
    }

    return response.json() as Promise<MediaList>
  }
}

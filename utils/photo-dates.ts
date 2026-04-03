const photoDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
})

export function formatPhotoDate(value?: string | Date | null) {
  if (!value) {
    return ""
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return photoDateFormatter.format(date)
}

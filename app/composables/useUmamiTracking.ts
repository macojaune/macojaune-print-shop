type UmamiPayload = Record<string, string | number | boolean | null | undefined>

export const useUmamiTracking = () => {
  const { $trackUmami } = useNuxtApp()

  return {
    trackUmami: (event: string, payload: UmamiPayload = {}) => {
      $trackUmami?.(event, payload)
    },
  }
}

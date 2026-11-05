import { useCallback, useEffect, useRef, useState } from "react"

/** While the trainer covers the page, the page under it does not scroll. */
export const PAGE_FULL_CLASS = "ed-page-full"

/**
 * Full screen for the trainer. The trainer covers the page (a fixed layer), so it works on an iPhone too, and
 * where the browser can, the page goes to the browser's full screen as well. The button leaves it; so does Esc
 * where the browser has its own full screen. The trainer keeps Esc for itself otherwise (closing a menu,
 * cancelling a rename), so the same key does not also fold the trainer.
 */
export const useFullScreen = (): Readonly<{ full: boolean; toggle: () => void }> => {
  const [full, setFull] = useState(false)

  const leave = useCallback(() => {
    setFull(false)
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
  }, [])

  const enter = useCallback(() => {
    setFull(true)
    const page = document.documentElement
    if (typeof page.requestFullscreen === "function" && document.fullscreenEnabled && !document.fullscreenElement)
      void page.requestFullscreen().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!full) return undefined
    const page = document.documentElement
    page.classList.add(PAGE_FULL_CLASS)
    // The browser left its full screen (Esc, a gesture): the trainer stops covering the page too.
    const onChange = () => {
      if (!document.fullscreenElement) setFull(false)
    }
    document.addEventListener("fullscreenchange", onChange)
    return () => {
      page.classList.remove(PAGE_FULL_CLASS)
      document.removeEventListener("fullscreenchange", onChange)
    }
  }, [full])

  // The trainer leaves the page: the browser's full screen it opened ends with it.
  const isFull = useRef(full)
  isFull.current = full
  useEffect(
    () => () => {
      if (isFull.current && document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
    },
    []
  )

  return { full, toggle: full ? leave : enter }
}

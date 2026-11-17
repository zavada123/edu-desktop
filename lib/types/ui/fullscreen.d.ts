/** While the trainer covers the page, the page under it does not scroll. */
export declare const PAGE_FULL_CLASS = "ed-page-full";
/**
 * The browser's own full screen for the page. Browsers allow it only right after a click or a key press, so a page
 * that opens the trainer from its own button calls this in the click handler, then passes `openFullScreen`.
 */
export declare const requestPageFullScreen: () => void;
/**
 * Full screen for the trainer. The trainer covers the page (a fixed layer), so it works on an iPhone too, and
 * where the browser can, the page goes to the browser's full screen as well. The button leaves it; so does Esc
 * where the browser has its own full screen. The trainer keeps Esc for itself otherwise (closing a menu,
 * cancelling a rename), so the same key does not also fold the trainer.
 */
export declare const useFullScreen: (request?: number) => Readonly<{
    full: boolean;
    toggle: () => void;
    handOver: () => void;
}>;

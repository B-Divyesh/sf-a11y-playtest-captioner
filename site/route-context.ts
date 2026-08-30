/**
 * Gives every full-document route change the same useful starting point.
 * `preventScroll` leaves the browser's Back/Forward scroll restoration alone.
 */
const ROUTE_FOCUS_KEY = "a11y-captioner:route-focus";

/** Marks a full-document navigation so its destination starts at its subject. */
export function prepareRouteFocus(): void {
  sessionStorage.setItem(ROUTE_FOCUS_KEY, "pending");
}

export function establishRouteContext(): void {
  const heading = document.querySelector<HTMLElement>("main h1");
  if (!heading) return;

  heading.tabIndex = -1;
  let announcement = document.getElementById("route-announcement");
  if (!announcement) {
    announcement = document.createElement("p");
    announcement.id = "route-announcement";
    announcement.className = "screen-reader-text";
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    document.body.prepend(announcement);
  }

  document.addEventListener("click", (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
    if (!link) return;
    const target = new URL(link.href, location.href);
    if (target.origin === location.origin && target.pathname !== location.pathname) {
      prepareRouteFocus();
    }
  }, { capture: true });

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const shouldFocus = sessionStorage.getItem(ROUTE_FOCUS_KEY) === "pending" || navigation?.type === "back_forward";
  sessionStorage.removeItem(ROUTE_FOCUS_KEY);
  if (!shouldFocus) return;

  requestAnimationFrame(() => {
    heading.focus({ preventScroll: true });
    announcement.textContent = `Opened ${document.title}`;
  });
}

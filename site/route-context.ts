/**
 * Gives every full-document route change the same useful starting point.
 * `preventScroll` leaves the browser's Back/Forward scroll restoration alone.
 */
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
      sessionStorage.setItem("a11y-captioner:route-focus", "pending");
    }
  }, { capture: true });

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const shouldFocus = sessionStorage.getItem("a11y-captioner:route-focus") === "pending" || navigation?.type === "back_forward";
  sessionStorage.removeItem("a11y-captioner:route-focus");
  if (!shouldFocus) return;

  requestAnimationFrame(() => {
    heading.focus({ preventScroll: true });
    announcement.textContent = `Opened ${document.title}`;
  });
}

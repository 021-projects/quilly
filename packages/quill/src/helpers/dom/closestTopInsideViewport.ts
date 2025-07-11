export default function closestTopInsideViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewHeight =
    window.innerHeight || document.documentElement.clientHeight;

  // If the element is already inside the viewport, return its top position
  if (rect.top >= 0 && rect.bottom <= viewHeight) {
    return rect.top;
  }

  // If the element is above the viewport, return the top of the viewport
  if (rect.bottom < 0) {
    return 0;
  }

  // If the element is below the viewport, return the bottom of the viewport
  if (rect.top > viewHeight) {
    return viewHeight - rect.height;
  }

  // If the element is upper than the viewport, return the top of the viewport
  if (rect.top < 0) {
    return 0;
  }

  // Otherwise, return the top position of the element
  return rect.top;
}

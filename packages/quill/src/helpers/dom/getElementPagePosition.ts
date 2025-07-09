export default function getElementPagePosition(element: HTMLElement) {
  // Get the element's bounding rectangle relative to the viewport
  const elementRect = element.getBoundingClientRect();

  // Get the page's scroll position
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Calculate the absolute position by adding the scroll position
  const absoluteLeft = elementRect.left + scrollLeft;
  const absoluteTop = elementRect.top + scrollTop;

  return { left: absoluteLeft, top: absoluteTop };
}

export default function isOnViewportBottom(element: Element | number): boolean {
  const viewHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const getTopPosition = (el: Element) => {
    const rect = el.getBoundingClientRect();
    return rect.top + rect.height;
  };
  const topPosition =
    typeof element === 'number' ? element : getTopPosition(element);
  return topPosition >= viewHeight;
}

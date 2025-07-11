export default function isOutsideViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewHeight =
    window.innerHeight || document.documentElement.clientHeight;

  return (
    rect.top < 0 ||
    rect.left < 0 ||
    rect.bottom > viewHeight ||
    rect.right > viewWidth
  );
}

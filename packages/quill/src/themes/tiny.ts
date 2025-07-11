import BubbleTheme from './bubble.js';
import type Quill from '@/core/quill.js';
import type { Bounds } from '@/core/quill.js';
import type { ThemeOptions } from '@/core/theme';
import type Toolbar from '@/modules/toolbar.js';
import icons from '@/ui/icons.js';
import Emitter from '@/core/emitter.js';
import { BaseTooltip } from './base.js';
import getElementPagePosition from '@/helpers/dom/getElementPagePosition';
import { Range } from '@/core/quill.js';
import isOutsideViewport from '@/helpers/dom/isOutsideViewport';
import isOnViewportBottom from '@/helpers/dom/isOnViewportBottom';
import closestTopInsideViewport from '@/helpers/dom/closestTopInsideViewport';

class TinyTooltip extends BaseTooltip {
  static TEMPLATE = [
    '<div class="ql-tooltip-editor">',
    '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">',
    '<a class="ql-close"></a>',
    '</div>',
  ].join('');

  constructor(quill: Quill, bounds?: HTMLElement) {
    super(quill, bounds);
    this.quill.on(
      Emitter.events.EDITOR_CHANGE,
      (type, range, oldRange, source) => {
        if (type !== Emitter.events.SELECTION_CHANGE) return;
        if (
          range != null &&
          range.length > 0 &&
          source === Emitter.sources.USER
        ) {
          this.show();
          // Lock our width so we will expand beyond our offsetParent boundaries
          this.root.style.left = '0px';
          this.root.style.width = '';
          this.root.style.width = `${this.root.offsetWidth}px`;
          const lines = this.quill.getLines(range.index, range.length);
          if (lines.length === 1) {
            const bounds = this.quill.getBounds(range);
            if (bounds != null) {
              this.position(bounds);
            }
          } else {
            const lastLine = lines[lines.length - 1];
            const index = this.quill.getIndex(lastLine);
            const length = Math.min(
              lastLine.length() - 1,
              range.index + range.length - index,
            );
            const indexBounds = this.quill.getBounds(new Range(index, length));
            if (indexBounds != null) {
              this.position(indexBounds);
            }
          }
        } else if (
          document.activeElement !== this.textbox &&
          this.quill.hasFocus()
        ) {
          this.hide();
        }
      },
    );

    // If the tooltip is fixed, we need to update its position on scroll and resize
    const updateFixedPosition = () => {
      if (!this.root.classList.contains('ql-fixed')) {
        return;
      }

      const bounds = this.quill.getBounds(this.quill.selection.savedRange);
      if (bounds !== null) {
        this.position(bounds);
      }
    };
    window.addEventListener('resize', updateFixedPosition, { passive: true });
    window.addEventListener('scroll', updateFixedPosition, { passive: true });
  }

  listen() {
    super.listen();
    // @ts-expect-error Fix me later
    this.root.querySelector('.ql-close').addEventListener('click', () => {
      this.root.classList.remove('ql-editing');
    });
    this.quill.on(Emitter.events.SCROLL_OPTIMIZE, () => {
      // Let selection be restored by toolbar handlers before repositioning
      setTimeout(() => {
        if (this.root.classList.contains('ql-hidden')) return;
        const range = this.quill.getSelection();
        if (range != null) {
          const bounds = this.quill.getBounds(range);
          if (bounds != null) {
            this.position(bounds);
          }
        }
      }, 1);
    });
  }

  cancel() {
    this.show();
  }

  position(reference: Bounds) {
    const savedRange = this.quill.selection.savedRange;
    const bounds = this.quill.selection.getBounds(
      savedRange.index,
      savedRange.length,
    );
    const containerBounds = this.boundsContainer.getBoundingClientRect();

    const left =
      (bounds?.left ?? reference.left) +
      reference.width / 2 -
      this.root.offsetWidth / 2;

    // Calculate `top` to place the tooltip above the reference
    // If selection bounds are available, position tooltip fixed
    // To allow it to place in overflow hidden containers
    let top: number;
    if (bounds !== null) {
      top = bounds.top - this.root.offsetHeight;

      const topLimit =
        containerBounds.top < 0
          ? window.scrollY + containerBounds.top
          : containerBounds.top;

      if (top < topLimit) {
        top = topLimit - this.root.offsetHeight;
      }

      this.root.classList.add('ql-fixed');
    } else {
      top = reference.top - this.root.offsetHeight + this.quill.root.scrollTop;

      this.root.classList.remove('ql-fixed');
    }

    // Default placement is above, so add 'ql-flip'
    this.root.style.left = `${left}px`;
    this.root.style.top = `${top}px`;
    this.root.classList.add('ql-flip');

    const rootBounds = this.root.getBoundingClientRect();
    let shift = 0;

    if (rootBounds.right > containerBounds.right) {
      shift = containerBounds.right - rootBounds.right;
      this.root.style.left = `${left + shift}px`;
    }
    if (rootBounds.left < containerBounds.left) {
      shift = containerBounds.left - rootBounds.left;
      this.root.style.left = `${left + shift}px`;
    }

    if (bounds !== null && isOutsideViewport(this.root)) {
      const nearestTop = closestTopInsideViewport(this.root);
      // The tooltip is 10px above the selected text by default
      // If the closest top is the top of the viewport, we add padding so that the tooltip does not press against the borders
      // If the closest top is the bottom of the viewport, we reduce them
      const pagePadding = isOnViewportBottom(nearestTop + rootBounds.height)
        ? 6
        : 12;
      this.root.style.top = `${nearestTop + pagePadding}px`;
    } else if (getElementPagePosition(this.root).top < window.scrollY) {
      // If not enough space above, place below and remove 'ql-flip'
      top = reference.bottom + this.quill.root.scrollTop;

      this.root.style.top = `${top}px`;
      this.root.classList.remove('ql-fixed', 'ql-flip');
    }

    return shift;
  }
}

class TinyTheme extends BubbleTheme {
  style: HTMLStyleElement;

  constructor(quill: Quill, options: ThemeOptions) {
    super(quill, options);

    this.quill.container.classList.remove('ql-bubble');
    this.quill.container.classList.add('ql-tiny');
  }

  override extendToolbar(toolbar: Toolbar) {
    // @ts-expect-error
    this.tooltip = new TinyTooltip(this.quill, this.options.bounds);
    if (!toolbar.container) {
      return;
    }

    this.tooltip.root.appendChild<HTMLElement>(toolbar.container);
    this.buildButtons(toolbar.container.querySelectorAll('button'), icons);
    this.buildPickers(toolbar.container.querySelectorAll('select'), icons);
  }
}

export { TinyTooltip, TinyTheme as default };

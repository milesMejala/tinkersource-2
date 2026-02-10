/**
 * Product Carousel Web Component
 *
 * A lightweight carousel controller that handles:
 * - Prev/Next navigation via scroll
 * - Autoplay with pause-on-hover
 * - Disabled state for navigation buttons at scroll boundaries
 */
if (!customElements.get('product-carousel')) {
  class ProductCarousel extends HTMLElement {
    constructor() {
      super();
      this.track = this.querySelector('[data-carousel-track]');
      this.prevBtn = this.querySelector('[data-carousel-prev]');
      this.nextBtn = this.querySelector('[data-carousel-next]');
      this.autoplayEnabled = this.dataset.autoplay === 'true';
      this.autoplaySpeed = parseInt(this.dataset.autoplaySpeed, 10) * 1000 || 5000;
      this.autoplayInterval = null;
    }

    connectedCallback() {
      if (!this.track) return;

      this.prevBtn?.addEventListener('click', () => this.scroll('prev'));
      this.nextBtn?.addEventListener('click', () => this.scroll('next'));
      this.track.addEventListener('scroll', () => this.updateButtons(), { passive: true });

      // Initial button state
      this.updateButtons();

      // Autoplay
      if (this.autoplayEnabled) {
        this.startAutoplay();
        this.addEventListener('mouseenter', () => this.stopAutoplay());
        this.addEventListener('mouseleave', () => this.startAutoplay());
        this.addEventListener('focusin', () => this.stopAutoplay());
        this.addEventListener('focusout', () => this.startAutoplay());
      }
    }

    disconnectedCallback() {
      this.stopAutoplay();
    }

    /**
     * Scrolls the track by one card width in the given direction.
     * @param {'prev'|'next'} direction
     */
    scroll(direction) {
      const card = this.track.querySelector('.product-carousel__card');
      if (!card) return;

      const gap = parseInt(getComputedStyle(this.track).columnGap, 10) || 0;
      const scrollAmount = card.offsetWidth + gap;

      this.track.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }

    /** Updates the disabled attribute on prev/next buttons based on scroll position. */
    updateButtons() {
      const { scrollLeft, scrollWidth, clientWidth } = this.track;
      const atStart = scrollLeft <= 1;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

      this.prevBtn?.toggleAttribute('disabled', atStart);
      this.nextBtn?.toggleAttribute('disabled', atEnd);
    }

    startAutoplay() {
      this.stopAutoplay();
      this.autoplayInterval = setInterval(() => {
        const { scrollLeft, scrollWidth, clientWidth } = this.track;
        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          // Loop back to start
          this.track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          this.scroll('next');
        }
      }, this.autoplaySpeed);
    }

    stopAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    }
  }

  customElements.define('product-carousel', ProductCarousel);
}

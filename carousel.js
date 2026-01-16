// ========================================
// Carousel Component
// ========================================

class Carousel {
    constructor(element) {
        this.carousel = element;
        this.track = element.querySelector('.carousel-track');
        this.slides = Array.from(element.querySelectorAll('.carousel-slide'));
        this.prevBtn = element.querySelector('.carousel-btn--prev');
        this.nextBtn = element.querySelector('.carousel-btn--next');
        this.dotsContainer = element.querySelector('.carousel-indicators');
        this.dots = [];

        this.currentIndex = 0;
        this.slideCount = this.slides.length;

        this.init();
    }

    init() {
        // Create dots
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
            this.dots.push(dot);
        });

        // Event listeners
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());

        // Touch support
        let startX = 0;
        let endX = 0;

        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        this.carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        }, { passive: true });

        // Keyboard navigation
        this.carousel.setAttribute('tabindex', '0');
        this.carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    }

    updateTrack() {
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;
    }

    updateDots() {
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateTrack();
        this.updateDots();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.slideCount;
        this.updateTrack();
        this.updateDots();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.slideCount) % this.slideCount;
        this.updateTrack();
        this.updateDots();
    }
}

// Initialize all carousels on page load
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => new Carousel(carousel));
});

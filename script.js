(() => {
  'use strict';

  // Top app bar elevation on scroll
  const topbar = document.getElementById('topbar');
  const setScrolled = () => topbar.classList.toggle('is-scrolled', window.scrollY > 4);
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  // Theme toggle (persists in localStorage, defaults to system preference)
  const toggle = document.getElementById('theme-toggle');
  const iconDark = document.getElementById('theme-icon-dark');
  const iconLight = document.getElementById('theme-icon-light');
  const root = document.documentElement;
  const stored = localStorage.getItem('hvs-theme');

  const systemPrefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

  const applyTheme = (theme) => {
    if (theme) {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }
    const isDark = theme ? theme === 'dark' : systemPrefersDark();
    toggle.setAttribute('aria-pressed', String(isDark));
    iconDark.style.display = isDark ? 'none' : 'block';
    iconLight.style.display = isDark ? 'block' : 'none';
  };

  applyTheme(stored);

  toggle.addEventListener('click', () => {
    const currentlyDark = root.getAttribute('data-theme')
      ? root.getAttribute('data-theme') === 'dark'
      : systemPrefersDark();
    const next = currentlyDark ? 'light' : 'dark';
    localStorage.setItem('hvs-theme', next);
    applyTheme(next);
  });

  // Mobile menu
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  };
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 860) closeMenu();
  });

  // Ripple feedback on buttons
  document.querySelectorAll('.btn, .icon-btn').forEach((el) => {
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${(e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2}px`;
      ripple.style.top = `${(e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2}px`;
      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Scroll-triggered reveal — elements are visible by default (see CSS);
  // only opt into the hidden/animate-in state once we know JS can reveal them again.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Work Impact Carousel Controller
  const carouselEl = document.getElementById('impact-carousel');
  if (carouselEl) {
    const track = carouselEl.querySelector('.carousel-track');
    const slides = Array.from(carouselEl.querySelectorAll('.carousel-slide'));
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    let currentIndex = 0;
    let autoPlayTimer = null;
    const autoPlayInterval = 5500;

    // Client tab buttons
    const tabBtns = Array.from(carouselEl.querySelectorAll('.client-tab-btn'));
    tabBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        goToSlide(idx);
        restartAutoPlay();
      });
    });

    // Build pagination dots
    dotsContainer.innerHTML = '';
    const dots = slides.map((slide, idx) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('type', 'button');
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(idx);
        restartAutoPlay();
      });
      dotsContainer.appendChild(dot);
      return dot;
    });

    const updateCarousel = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      slides.forEach((slide, idx) => {
        const isActive = idx === currentIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });
      tabBtns.forEach((btn, idx) => {
        const isActive = idx === currentIndex;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
      dots.forEach((dot, idx) => {
        const isActive = idx === currentIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };

    const goToSlide = (index) => {
      currentIndex = (index + slides.length) % slides.length;
      updateCarousel();
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        restartAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        restartAutoPlay();
      });
    }

    // Auto Play with pause on hover/focus
    const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, autoPlayInterval);
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    const restartAutoPlay = () => {
      stopAutoPlay();
      startAutoPlay();
    };

    carouselEl.addEventListener('mouseenter', stopAutoPlay);
    carouselEl.addEventListener('mouseleave', startAutoPlay);
    carouselEl.addEventListener('focusin', stopAutoPlay);
    carouselEl.addEventListener('focusout', startAutoPlay);

    // Keyboard navigation
    carouselEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        restartAutoPlay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        restartAutoPlay();
      }
    });

    // Touch / Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    const viewport = carouselEl.querySelector('.carousel-viewport');

    if (viewport) {
      viewport.addEventListener(
        'touchstart',
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );

      viewport.addEventListener(
        'touchend',
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          const diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) {
              nextSlide();
            } else {
              prevSlide();
            }
            restartAutoPlay();
          }
        },
        { passive: true }
      );
    }

    // Initialize
    updateCarousel();
    startAutoPlay();
  }
})();

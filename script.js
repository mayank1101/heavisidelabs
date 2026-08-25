(() => {
  'use strict';

  // Top app bar elevation on scroll
  const topbar = document.getElementById('topbar');
  const setScrolled = () => topbar.classList.toggle('is-scrolled', window.scrollY > 4);
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  // Theme toggle (persists in localStorage, defaults to system preference)
  const toggle = document.getElementById('theme-toggle');
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
})();

(() => {
  'use strict';

  // Top app bar elevation once the page leaves the very top.
  // IntersectionObserver on a 1px sentinel avoids a scroll-event listener.
  const topbar = document.getElementById('topbar');
  if (topbar) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        ([entry]) => topbar.classList.toggle('is-scrolled', !entry.isIntersecting)
      ).observe(sentinel);
    } else {
      topbar.classList.add('is-scrolled');
    }
  }

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
    const show = (el) => el.classList.add('is-visible');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));

    // Safety net: a fast scroll (or scrollbar drag) can skip an element between
    // observer frames and leave it stuck hidden. After scrolling settles, reveal
    // anything already at or above the fold. 'scrollend' is not a scroll listener.
    const sweep = () => {
      revealEls.forEach((el) => {
        if (el.classList.contains('is-visible')) return;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
          show(el);
          io.unobserve(el);
        }
      });
    };
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', sweep, { passive: true });
    }
    window.addEventListener('hashchange', () => setTimeout(sweep, 400));
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();

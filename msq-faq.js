/**
 * M SQUARE WATERTECH SERVICE LLP — FAQ Accordion Controller
 * Dedicated for faq.html
 * 
 * Features:
 * - Smooth accessible accordion expand/collapse
 * - Clean state management with .is-open
 * - Chevron rotation & aria-expanded support
 */

(function() {
  'use strict';

  function initFaqAccordion() {
    const tabWraps = document.querySelectorAll('.hero-parent .tab-wrap');
    if (!tabWraps || tabWraps.length === 0) return;

    tabWraps.forEach((wrap, index) => {
      const header = wrap.querySelector('.tab-parent');
      const content = wrap.querySelector('.tab-content');
      if (!header || !content) return;

      // Ensure accessible roles
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');

      // All questions collapsed initially to fit screen matching Image 4
      wrap.classList.remove('is-open');
      header.setAttribute('aria-expanded', 'false');
      content.style.display = 'none';
      content.style.maxHeight = '0px';
      content.style.opacity = '0';

      function toggle() {
        const isOpen = wrap.classList.contains('is-open');
        if (isOpen) {
          wrap.classList.remove('is-open');
          header.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = '0px';
          content.style.opacity = '0';
          setTimeout(() => {
            if (!wrap.classList.contains('is-open')) {
              content.style.display = 'none';
            }
          }, 250);
        } else {
          wrap.classList.add('is-open');
          header.setAttribute('aria-expanded', 'true');
          content.style.display = 'block';
          // Trigger reflow for smooth transition
          void content.offsetHeight;
          content.style.maxHeight = '500px';
          content.style.opacity = '1';
        }
      }

      header.addEventListener('click', (e) => {
        e.preventDefault();
        toggle();
      });

      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaqAccordion);
  } else {
    initFaqAccordion();
  }
})();

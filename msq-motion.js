/**
 * ═══════════════════════════════════════════════════════════════
 * M SQUARE WATERTECH SERVICE LLP — Master Interactive Engine
 * File: msq-motion.js (Vanilla JS · Zero Dependencies · Ultra-Fast)
 * ═══════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ── 1. GLOBAL WHATSAPP & PHONE CONFIG ──
  const MSQ_CONFIG = {
    whatsappNumber: '919962650428',
    kavankaraiPhone: '9710516201',
    kolathurPhone: '9962650428'
  };

  // ── 2. FULLSCREEN NAVIGATION MENU CONTROLLER ──
  const menuParent = document.querySelector('.menu-parent');
  const mobileMenuBtn = document.querySelector('.menu-btn-parent-mobile');
  const desktopMenuBtn = document.querySelector('.menu-btn-parent-desktop');

  if (menuParent) {
    // Add close button if not already present
    if (!menuParent.querySelector('.menu-close-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'menu-close-btn';
      closeBtn.setAttribute('aria-label', 'Close Menu');
      closeBtn.innerHTML = '&times;';
      menuParent.appendChild(closeBtn);

      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeMenu();
      });
    }

    function openMenu() {
      menuParent.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menuParent.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function toggleMenu(e) {
      if (e) e.preventDefault();
      if (menuParent.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', toggleMenu);
      mobileMenuBtn.style.cursor = 'pointer';
    }
    if (desktopMenuBtn) {
      desktopMenuBtn.addEventListener('click', toggleMenu);
      desktopMenuBtn.style.cursor = 'pointer';
    }

    // Close menu when clicking any nav link inside it
    const menuLinks = menuParent.querySelectorAll('a');
    menuLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuParent.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  // ── 2B. MODERN ROYAL BLUE GLASS DRAWER CONTROLLER ──
  const navToggle = document.getElementById('msqNavToggle');
  const drawer = document.getElementById('msqMobileDrawer');
  const drawerClose = document.getElementById('msqDrawerClose');
  const drawerBackdrop = document.getElementById('msqDrawerBackdrop');

  function openDrawer() {
    if (drawer) {
      drawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
    }
  }

  function closeDrawer() {
    if (drawer) {
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (drawer && drawer.classList.contains('is-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', function (e) {
      e.preventDefault();
      closeDrawer();
    });
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', function () {
      closeDrawer();
    });
  }

  if (drawer) {
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeDrawer();
      });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // ── 3. PRE-ORDER / QUICK BOOKING POPUP MODAL ──
  const popUp = document.querySelector('.pop-up-pre-order');
  if (popUp) {
    const closePopupBtn = popUp.querySelector('.plus-parent');
    if (closePopupBtn) {
      closePopupBtn.style.cursor = 'pointer';
      closePopupBtn.addEventListener('click', function (e) {
        e.preventDefault();
        popUp.style.display = 'none';
        popUp.style.opacity = '0';
      });
    }

    // Trigger popup on any element with data-open-popup
    document.querySelectorAll('[data-open-booking]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        popUp.style.display = 'flex';
        popUp.style.opacity = '1';
        popUp.style.zIndex = '99999';
      });
    });
  }

  // ── 4. LEAD CAPTURE & WHATSAPP DISPATCH ENGINE ──
  function setupFormHandler(form) {
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Gather input values
      let nameVal = '';
      let phoneVal = '';
      let areaVal = '';
      let serviceVal = '';

      const nameInput = form.querySelector('input[name*="name" i], input[name*="First" i], input[id*="name" i]');
      const phoneInput = form.querySelector('input[name*="phone" i], input[name*="Last" i], input[name*="Mobile" i], input[id*="phone" i], input[placeholder*="Mobile" i]');
      const areaInput = form.querySelector('input[name*="Email" i], input[name*="area" i], input[placeholder*="Area" i], input[placeholder*="Hub" i]');
      const msgInput = form.querySelector('textarea, input[name*="help" i], input[name*="service" i]');

      if (nameInput) nameVal = nameInput.value.trim();
      if (phoneInput) phoneVal = phoneInput.value.trim();
      if (areaInput) areaVal = areaInput.value.trim();
      if (msgInput) serviceVal = msgInput.value.trim();

      // Basic phone fallback: if phone was entered into area or vice versa
      if (!phoneVal && areaVal && /^[0-9]{10}$/.test(areaVal.replace(/\D/g, ''))) {
        phoneVal = areaVal;
        areaVal = 'Chennai';
      }

      // If empty name, default
      if (!nameVal) nameVal = 'Valued Customer';
      if (!serviceVal) serviceVal = 'Doorstep Water Purifier Service / Inspection';
      if (!areaVal) areaVal = 'Kavankarai / Kolathur / Chennai';

      // Clean phone number
      const cleanPhone = phoneVal.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        alert('Please enter a valid 10-digit mobile number so our technician can reach you.');
        if (phoneInput) phoneInput.focus();
        return;
      }

      // Construct WhatsApp message
      const textMessage =
        `*M SQUARE WATERTECH SERVICE REQUEST*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *Customer Name:* ${nameVal}\n` +
        `📞 *Mobile Number:* ${cleanPhone}\n` +
        `📍 *Location / Area:* ${areaVal}\n` +
        `🛠️ *Service Required:* ${serviceVal}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Please confirm technician availability & dispatch schedule.`;

      const encodedMsg = encodeURIComponent(textMessage);
      const waUrl = `https://wa.me/${MSQ_CONFIG.whatsappNumber}?text=${encodedMsg}`;

      // Show sleek confirmation UI
      const doneBox = form.parentElement.querySelector('.w-form-done, .success-message');
      if (doneBox) {
        doneBox.style.display = 'block';
        doneBox.innerHTML =
          `<div style="padding: 1.5rem; text-align: center; background: #059669; color: #ffffff; border-radius: 14px; font-family: inherit;">` +
          `<div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>` +
          `<h3 style="margin: 0 0 0.5rem; font-size: 1.25rem; font-weight: 800; color: #ffffff;">Service Request Received!</h3>` +
          `<p style="margin: 0 0 1rem; font-size: 0.92rem; color: #e6fffa; line-height: 1.5;">` +
          `Opening WhatsApp directly to connect with our Chennai Dispatch Desk...` +
          `</p>` +
          `<a href="${waUrl}" target="_blank" style="display: inline-block; background: #ffffff; color: #059669; font-weight: 800; padding: 0.65rem 1.4rem; border-radius: 999px; text-decoration: none; font-size: 0.9rem;">` +
          `💬 Open WhatsApp Chat Now &rarr;` +
          `</a>` +
          `</div>`;
        form.style.display = 'none';
      }

      // Automatically launch WhatsApp after brief moment
      setTimeout(function () {
        window.open(waUrl, '_blank');
      }, 350);
    });
  }

  // Bind to all forms on page
  document.querySelectorAll('form').forEach(setupFormHandler);

  // ── 5. FAQ ACCORDION INTERACTIVITY ──
  const faqToggles = document.querySelectorAll('.tab-parent, .faq-question, .accordion-toggle, [data-w-tab]');
  faqToggles.forEach(function (toggle) {
    toggle.style.cursor = 'pointer';
    toggle.addEventListener('click', function () {
      const wrap = toggle.closest('.tab-wrap') || toggle.parentElement;
      if (!wrap) return;
      const content = wrap.querySelector('.tab-content, .faq-answer, .accordion-content, .p-tab');
      if (content) {
        const isHidden = getComputedStyle(content).display === 'none' || content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        content.style.opacity = isHidden ? '1' : '0';
        content.style.transition = 'all 0.3s ease';
      }
    });
  });

  // ── 6. DISMISS PAGE LOADER SAFELY & SMOOTHLY ──
  const loader = document.getElementById('msq-page-loader');
  if (loader) {
    setTimeout(function () {
      loader.classList.add('msq-loader-hidden');
      setTimeout(function () {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      }, 550);
    }, 750);
  }

  // ── 7. LIQUID METAL BUTTON INTERACTIVE RIPPLE EFFECT (Instant Touch + Click) ──
  function createLiquidRipple(e) {
    const btn = e.target.closest('.msq-nav-cta, .msq-drawer-cta, .btn-primary, .btn-secondary, .msq-btn-hero-primary, .msq-btn-hero-secondary, .submit-button, .card-action-btn, .assembly-btn, .msq-prod-book-btn, .msq-matrix-cta, .msq-liquid-btn-primary, .msq-liquid-btn-secondary');
    if (!btn) return;
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : undefined);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : undefined);
    if (clientX === undefined || clientY === undefined) return;
    const rect = btn.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'msq-ripple-wave';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '32px';
    ripple.style.height = '32px';
    btn.appendChild(ripple);
    setTimeout(function () {
      if (ripple && ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 650);
  }

  document.addEventListener('pointerdown', createLiquidRipple, { passive: true });

  console.log('✓ M SQUARE Watertech interactive systems initialized (10/10 ready).');
});

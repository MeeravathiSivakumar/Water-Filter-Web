/* ==========================================================================
   PANI SOURCE - NEXT-GENERATION CRAFT WATER SYSTEM
   Advanced Interactive Logic & Canvas Physics (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // 1. WEB AUDIO SYNTHESIS (WATER DROP SOUND FX)
  // ========================================================================
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playWaterDropSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      const startTime = audioCtx.currentTime;
      osc.type = 'sine';
      // Pitch envelope for realistic "plop" droplet
      osc.frequency.setValueAtTime(600 + Math.random() * 200, startTime);
      osc.frequency.exponentialRampToValueAtTime(1400 + Math.random() * 300, startTime + 0.08);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.16);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  const soundBtn = document.getElementById('soundToggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.innerHTML = soundEnabled ? '💧' : '🔇';
      soundBtn.title = soundEnabled ? 'Sound FX On' : 'Sound FX Muted';
      if (soundEnabled) playWaterDropSound();
    });
  }

  // ========================================================================
  // 2. INTERACTIVE WATER RIPPLE & BUBBLE CANVAS
  // ========================================================================
  const canvas = document.getElementById('waterCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const ripples = [];
    const bubbles = [];

    // Initialize ambient background floating bubbles
    for (let i = 0; i < 40; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3.5 + 1,
        speed: Math.random() * 0.8 + 0.3,
        opacity: Math.random() * 0.4 + 0.1,
        drift: (Math.random() - 0.5) * 0.4
      });
    }

    function createRipple(x, y) {
      ripples.push({
        x,
        y,
        radius: 5,
        maxRadius: Math.random() * 60 + 50,
        opacity: 0.6,
        speed: 2.2
      });
      playWaterDropSound();
    }

    window.addEventListener('mousemove', (e) => {
      if (Math.random() < 0.04) {
        createRipple(e.clientX, e.clientY);
      }
    });

    window.addEventListener('click', (e) => {
      createRipple(e.clientX, e.clientY);
    });

    function animateCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Render ambient bubbles
      ctx.fillStyle = 'rgba(0, 147, 254, 0.4)';
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.y -= b.speed;
        b.x += b.drift;
        if (b.y < -10) {
          b.y = height + 10;
          b.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${b.opacity})`;
        ctx.fill();
      }

      // Render interactive wave ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity *= 0.96;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 180, 255, ${r.opacity})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        if (r.opacity < 0.02 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      requestAnimationFrame(animateCanvas);
    }
    animateCanvas();
  }

  // ========================================================================
  // 3. ADVANCED POD TASTE & MINERAL MIXER STUDIO
  // ========================================================================
  const podsData = [
    { id: 'immunity', name: 'Immunity Boost', color: '#f59e0b', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)', vitamins: 'Vitamin C, Zinc, Elderberry' },
    { id: 'hydration', name: 'Electrolyte Splash', color: '#06b6d4', gradient: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)', vitamins: 'Sodium, Potassium, Magnesium' },
    { id: 'energy', name: 'Vital Energy', color: '#ef4444', gradient: 'linear-gradient(180deg, #f87171 0%, #dc2626 100%)', vitamins: 'B-Complex, Ginseng, Green Tea' },
    { id: 'relax', name: 'Calm & Lavender', color: '#8b5cf6', gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)', vitamins: 'L-Theanine, Chamomile, Ashwagandha' },
    { id: 'glow', name: 'Collagen Glow', color: '#ec4899', gradient: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)', vitamins: 'Marine Collagen, Biotin, Hyaluronic' },
    { id: 'focus', name: 'Clarity & Focus', color: '#10b981', gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)', vitamins: 'Lion’s Mane, B12, Rhodiola' }
  ];

  let selectedPodA = podsData[0];
  let selectedPodB = podsData[1];
  let activeSlot = 'A';

  const liquidFill = document.getElementById('liquidFill');
  const glassTitle = document.getElementById('glassTitle');
  const glassVitamins = document.getElementById('glassVitamins');
  const intensityRange = document.getElementById('intensityRange');
  const intensityValue = document.getElementById('intensityValue');
  const tempRange = document.getElementById('tempRange');
  const tempValue = document.getElementById('tempValue');

  function updateMixerGlass() {
    if (!liquidFill) return;

    const intensity = intensityRange ? intensityRange.value : 50;
    const temp = tempRange ? tempRange.value : 12;

    if (intensityValue) intensityValue.textContent = `${intensity}%`;
    if (tempValue) tempValue.textContent = `${temp}°C (${temp <= 8 ? 'Chilled' : temp <= 18 ? 'Crisp' : temp <= 30 ? 'Ambient' : 'Warm'})`;

    // Blend the two pod colors into fluid glass gradient
    liquidFill.style.background = `linear-gradient(180deg, ${selectedPodA.color}cc 0%, ${selectedPodB.color}ee 100%)`;
    liquidFill.style.height = `${Math.min(92, 40 + (intensity * 0.45))}%`;

    if (glassTitle) {
      glassTitle.textContent = `${selectedPodA.name} + ${selectedPodB.name}`;
    }
    if (glassVitamins) {
      glassVitamins.textContent = `Enriched with: ${selectedPodA.vitamins} & ${selectedPodB.vitamins}`;
    }
  }

  // Set up Pod Chips Click handlers
  const podChips = document.querySelectorAll('.pod-chip');
  podChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const podId = chip.getAttribute('data-pod');
      const pod = podsData.find(p => p.id === podId);
      if (!pod) return;

      if (activeSlot === 'A') {
        selectedPodA = pod;
        const slotA = document.getElementById('slotA');
        if (slotA) slotA.innerHTML = `<strong>Pod 1:</strong> ${pod.name}`;
        activeSlot = 'B';
        document.getElementById('slotA')?.classList.remove('active');
        document.getElementById('slotB')?.classList.add('active');
      } else {
        selectedPodB = pod;
        const slotB = document.getElementById('slotB');
        if (slotB) slotB.innerHTML = `<strong>Pod 2:</strong> ${pod.name}`;
        activeSlot = 'A';
        document.getElementById('slotB')?.classList.remove('active');
        document.getElementById('slotA')?.classList.add('active');
      }

      podChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');

      updateMixerGlass();
      playWaterDropSound();
    });
  });

  const slotA = document.getElementById('slotA');
  const slotB = document.getElementById('slotB');
  if (slotA) slotA.addEventListener('click', () => {
    activeSlot = 'A';
    slotA.classList.add('active');
    slotB?.classList.remove('active');
  });
  if (slotB) slotB.addEventListener('click', () => {
    activeSlot = 'B';
    slotB.classList.add('active');
    slotA?.classList.remove('active');
  });

  if (intensityRange) intensityRange.addEventListener('input', updateMixerGlass);
  if (tempRange) tempRange.addEventListener('input', updateMixerGlass);
  updateMixerGlass();

  // ========================================================================
  // 4. HYDRATION & ENVIRONMENTAL SAVINGS CALCULATOR
  // ========================================================================
  const dailyGlassesSlider = document.getElementById('dailyGlasses');
  const dailyGlassesLabel = document.getElementById('dailyGlassesLabel');
  const calcBottles = document.getElementById('calcBottles');
  const calcMoney = document.getElementById('calcMoney');
  const calcCO2 = document.getElementById('calcCO2');

  function updateSavingsCalculator() {
    if (!dailyGlassesSlider) return;
    const glasses = parseInt(dailyGlassesSlider.value, 10);
    if (dailyGlassesLabel) dailyGlassesLabel.textContent = `${glasses} glasses / day`;

    // Math conversions:
    // 1 glass = 8 oz = 0.5 standard 16 oz plastic bottle
    // Annual bottles = glasses * 0.5 * 365
    const annualBottles = Math.round(glasses * 0.5 * 365);
    // Average bottled water cost = $1.75 per bottle
    const annualSavings = Math.round(annualBottles * 1.75);
    // Plastic bottle manufacturing = ~82.8g CO2
    const co2SavedKg = Math.round((annualBottles * 0.0828));

    if (calcBottles) calcBottles.textContent = annualBottles.toLocaleString();
    if (calcMoney) calcMoney.textContent = `$${annualSavings.toLocaleString()}`;
    if (calcCO2) calcCO2.textContent = `${co2SavedKg} kg`;
  }

  if (dailyGlassesSlider) {
    dailyGlassesSlider.addEventListener('input', updateSavingsCalculator);
    updateSavingsCalculator();
  }

  // ========================================================================
  // 5. HARDWARE TEMPERATURE SELECTOR
  // ========================================================================
  const tempButtons = document.querySelectorAll('.temp-btn');
  const hardwareImage = document.getElementById('hardwareTempImage');
  const tempImages = {
    cold: 'https://cdn.prod.website-files.com/645008656a042eb7d9d2b816/645008656a042ea161d2b8d9_image-temp-01.jpg',
    crisp: 'https://cdn.prod.website-files.com/645008656a042eb7d9d2b816/645008656a042ee4b4d2b8db_image-temp-02.jpg',
    ambient: 'https://cdn.prod.website-files.com/645008656a042eb7d9d2b816/645008656a042ed790d2b8da_image-temp-03.jpg'
  };

  tempButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tempButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tempType = btn.getAttribute('data-temp');
      if (hardwareImage && tempImages[tempType]) {
        hardwareImage.src = tempImages[tempType];
      }
      playWaterDropSound();
    });
  });

  // ========================================================================
  // 6. SCROLL NAVIGATION & INTERSECTION OBSERVERS
  // ========================================================================
  const navBar = document.getElementById('mainNavBar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navBar?.classList.add('scrolled');
    } else {
      navBar?.classList.remove('scrolled');
    }
  });

  // Counter Number Animations
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const duration = 1600;
        const startTime = performance.now();

        function count(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          el.textContent = (easeProgress * target).toFixed(decimals);

          if (progress < 1) {
            requestAnimationFrame(count);
          } else {
            el.textContent = target.toFixed(decimals);
          }
        }
        requestAnimationFrame(count);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

  // ========================================================================
  // 7. WAITLIST MODAL & MOBILE MENU
  // ========================================================================
  const waitlistModal = document.getElementById('waitlistModal');
  const openWaitlistBtns = document.querySelectorAll('.open-waitlist');
  const closeWaitlistBtn = document.getElementById('closeWaitlist');

  openWaitlistBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      waitlistModal?.classList.add('active');
      playWaterDropSound();
    });
  });

  if (closeWaitlistBtn) {
    closeWaitlistBtn.addEventListener('click', () => {
      waitlistModal?.classList.remove('active');
    });
  }

  const waitlistForm = document.getElementById('modalWaitlistForm');
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      waitlistForm.innerHTML = `
        <div style="text-align:center; padding: 20px 0;">
          <div style="font-size: 40px; margin-bottom: 12px;">🌊</div>
          <h3 style="color:#00e5ff; margin-bottom: 8px;">Welcome to Craft Water!</h3>
          <p style="color:rgba(255,255,255,0.8); font-size: 15px;">You’re on the exclusive waitlist. We’ll notify you when pre-orders re-open.</p>
        </div>
      `;
      playWaterDropSound();
    });
  }

  // Mobile Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const closeMobileDrawer = document.getElementById('closeMobileDrawer');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('active');
    });
  }
  if (closeMobileDrawer && mobileDrawer) {
    closeMobileDrawer.addEventListener('click', () => {
      mobileDrawer.classList.remove('active');
    });
  }

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileDrawer?.classList.remove('active');
    });
  });

});

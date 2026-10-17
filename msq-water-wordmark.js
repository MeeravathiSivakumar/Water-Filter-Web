/**
 * M SQUARE WATERTECH - Living Water Bubble Wordmark Engine
 * Inspired by 21st.dev/astro-bubble-hero
 * Realized for realistic aquatic fluid physics, living bubbles,
 * mouse repulsion, click-to-pop water splash droplets,
 * vibrant blue-green color palette, and bold luxury typography.
 */

(function () {
  'use strict';

  // Vibrant Blue & Green Aquatic Palette (Matching User's Request)
  const BUBBLE_PALETTE = [
    { bg: 'rgba(0, 229, 255, 0.94)', rim: '#ffffff', name: 'electric-cyan' },
    { bg: 'rgba(31, 227, 192, 0.92)', rim: '#ffffff', name: 'aquamarine' },
    { bg: 'rgba(0, 196, 154, 0.90)', rim: '#e6fffa', name: 'seafoam-green' },
    { bg: 'rgba(65, 239, 150, 0.88)', rim: '#dcfce7', name: 'emerald-mint' },
    { bg: 'rgba(0, 147, 254, 0.94)', rim: '#e0f2fe', name: 'azure-blue' },
    { bg: 'rgba(2, 132, 199, 0.92)', rim: '#bae6fd', name: 'deep-aqua' },
    { bg: 'rgba(56, 189, 248, 0.94)', rim: '#f0f9ff', name: 'sky-crystal' },
    { bg: 'rgba(255, 255, 255, 0.96)', rim: '#ffffff', name: 'pure-white' }
  ];

  function createWordmark(canvasEl) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const parent = canvasEl.parentElement;
    if (parent) {
      parent.classList.add('msq-has-canvas');
    }

    // Offscreen canvas for rendering the entire living water scene before masking
    const offCv = document.createElement('canvas');
    const offCtx = offCv.getContext('2d');

    let w = 0;
    let h = 0;
    let dpr = 1;
    let running = false;
    let visible = true;
    let rafId = 0;

    const textLines = ['Pure Water.', 'Precision Care.'];
    let isMobile = false;
    let fontSize = 54;
    let lineSpacing = 1.15;

    let bubbles = [];
    let sparks = [];
    let ripples = [];

    const ptr = { x: -9999, y: -9999, on: false, dx: 0, dy: 0, lastX: 0, lastY: 0 };

    function initBubbles() {
      const count = isMobile ? 85 : 140;
      bubbles = [];
      const currentW = w || 540;
      const currentH = h || 180;
      for (let i = 0; i < count; i++) {
        const r = 5 + Math.random() * (isMobile ? 18 : 28);
        bubbles.push({
          x: Math.random() * currentW,
          y: Math.random() * currentH,
          baseR: r,
          r: r,
          scale: 1,
          colorIdx: Math.floor(Math.random() * BUBBLE_PALETTE.length),
          vy: -(0.35 + Math.random() * 0.75), // gentle upward buoyancy
          phase: Math.random() * Math.PI * 2,
          amp: 1.5 + Math.random() * 4.2,     // sinusoidal horizontal wobble
          freq: 0.7 + Math.random() * 1.5,
          ox: 0,
          oy: 0
        });
      }
      // Sort so larger bubbles are behind smaller ones
      bubbles.sort((a, b) => b.baseR - a.baseR);
    }

    function resize() {
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const parentWidth = rect.width || (window.innerWidth - 32);
      isMobile = window.innerWidth < 768;

      if (isMobile) {
        w = Math.round(Math.min(parentWidth || 360, window.innerWidth - 32));
        fontSize = Math.min(Math.max(w * 0.096, 28), 38);
        lineSpacing = 1.16;
        h = Math.round(fontSize * lineSpacing * 2 + 16);
      } else {
        w = Math.min(Math.round(parentWidth || 560), 600);
        fontSize = Math.min(Math.max(w * 0.098, 46), 56);
        lineSpacing = 1.14;
        h = Math.round(fontSize * lineSpacing * 2 + 18);
      }

      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvasEl.width = Math.round(w * dpr);
      canvasEl.height = Math.round(h * dpr);
      canvasEl.style.width = w + 'px';
      canvasEl.style.height = h + 'px';

      offCv.width = canvasEl.width;
      offCv.height = canvasEl.height;

      if (!bubbles.length) {
        initBubbles();
      } else {
        bubbles.forEach(b => {
          if (b.x > w) b.x = Math.random() * w;
          if (b.y > h) b.y = Math.random() * h;
        });
      }
    }

    function popBubble(b) {
      if (b.scale <= 0.2) return;
      b.scale = 0;

      const splashCount = 12 + Math.floor(Math.random() * 6);
      const col = BUBBLE_PALETTE[b.colorIdx % BUBBLE_PALETTE.length];
      for (let i = 0; i < splashCount; i++) {
        const angle = (i / splashCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const speed = 2.5 + Math.random() * 5.2;
        sparks.push({
          x: b.x + b.ox,
          y: b.y + b.oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.9,
          r: Math.max(1.2, b.baseR * (0.16 + Math.random() * 0.18)),
          color: col.bg,
          life: 1.0,
          decay: 0.026 + Math.random() * 0.02
        });
      }

      ripples.push({
        x: b.x + b.ox,
        y: b.y + b.oy,
        r: 3,
        maxR: b.baseR * 2.4,
        opacity: 0.9
      });

      setTimeout(() => {
        b.x = Math.random() * w;
        b.y = h + b.baseR + 10;
        b.scale = 0.05;
        b.colorIdx = Math.floor(Math.random() * BUBBLE_PALETTE.length);
      }, 700 + Math.random() * 400);
    }

    function drawWaterBubble(targetCtx, b, x, y, r) {
      if (r <= 0.6) return;

      const col = BUBBLE_PALETTE[b.colorIdx % BUBBLE_PALETTE.length];

      // 1. Translucent aquatic spherical body gradient
      const grad = targetCtx.createRadialGradient(
        x - r * 0.28, y - r * 0.28, r * 0.08,
        x, y, r
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
      grad.addColorStop(0.35, col.bg);
      grad.addColorStop(0.85, col.bg);
      grad.addColorStop(1, col.rim);

      targetCtx.fillStyle = grad;
      targetCtx.beginPath();
      targetCtx.arc(x, y, r, 0, Math.PI * 2);
      targetCtx.fill();

      // 2. Delicate outer meniscus ring
      targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      targetCtx.lineWidth = Math.max(0.7, r * 0.08);
      targetCtx.stroke();

      // 3. Crisp Top-Left Specular Light Highlight (Unmistakable 3D Water Look)
      const glintR = r * 0.25;
      const glintX = x - r * 0.35;
      const glintY = y - r * 0.35;
      targetCtx.fillStyle = '#ffffff';
      targetCtx.beginPath();
      targetCtx.arc(glintX, glintY, glintR, 0, Math.PI * 2);
      targetCtx.fill();

      // 4. Subtle secondary aquatic reflection at bottom-right
      targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      targetCtx.lineWidth = Math.max(0.5, r * 0.06);
      targetCtx.beginPath();
      targetCtx.arc(x, y, r * 0.78, Math.PI * 0.18, Math.PI * 0.46);
      targetCtx.stroke();
    }

    function render(time) {
      if (!ctx || !offCtx || !w || !h) return;
      const t = time / 1000;

      // ── STEP 1: RENDER LIVING WATER SCENE ONTO OFFSCREEN CANVAS ──
      offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      offCtx.globalCompositeOperation = 'source-over';
      offCtx.clearRect(0, 0, w, h);

      // A. Vibrant Aquatic Ocean-to-Teal Gradient Ground
      const bgGrad = offCtx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#0047ba');    // Rich Royal Ocean Blue
      bgGrad.addColorStop(0.35, '#0070c9'); // Deep Vivid Sapphire
      bgGrad.addColorStop(0.7, '#0096a6');  // Electric Turquoise
      bgGrad.addColorStop(1, '#00876a');    // Deep Emerald Teal
      offCtx.fillStyle = bgGrad;
      offCtx.fillRect(0, 0, w, h);

      // B. Ambient internal water caustics
      const causticGrad = offCtx.createRadialGradient(w * 0.45, h * 0.5, 15, w * 0.5, h * 0.5, w * 0.6);
      causticGrad.addColorStop(0, 'rgba(0, 229, 255, 0.42)');
      causticGrad.addColorStop(0.5, 'rgba(31, 227, 192, 0.22)');
      causticGrad.addColorStop(1, 'transparent');
      offCtx.fillStyle = causticGrad;
      offCtx.fillRect(0, 0, w, h);

      // C. Update & Draw Living Water Bubbles
      const reachR = isMobile ? 65 : 95;
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];

        b.y += b.vy;
        if (b.y < -b.baseR * 2) {
          b.y = h + b.baseR + 5;
          b.x = Math.random() * w;
        }

        const wobble = Math.sin(t * b.freq + b.phase) * b.amp;

        if (ptr.on) {
          const dx = (b.x + b.ox) - ptr.x;
          const dy = (b.y + b.oy) - ptr.y;
          const dist = Math.hypot(dx, dy) || 1;
          const effReach = reachR + b.baseR;
          if (dist < effReach) {
            const force = (1 - dist / effReach) * (isMobile ? 20 : 30);
            b.ox += (dx / dist) * force + ptr.dx * 0.28;
            b.oy += (dy / dist) * force + ptr.dy * 0.28;
          }
        }

        b.ox *= 0.91;
        b.oy *= 0.91;

        if (b.scale < 1) {
          b.scale += (1 - b.scale) * 0.08;
        }

        const renderR = Math.max(0.2, b.baseR * b.scale);
        const renderX = b.x + b.ox + wobble;
        const renderY = b.y + b.oy;

        drawWaterBubble(offCtx, b, renderX, renderY, renderR);
      }

      // D. Draw & Update Splash Sparks
      if (sparks.length) {
        for (let i = 0; i < sparks.length; i++) {
          const s = sparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.94;
          s.vy = s.vy * 0.94 + 0.09;
          s.life -= s.decay;

          if (s.life > 0) {
            offCtx.fillStyle = s.color;
            offCtx.globalAlpha = Math.max(0, s.life);
            offCtx.beginPath();
            offCtx.arc(s.x, s.y, Math.max(0.5, s.r * s.life), 0, Math.PI * 2);
            offCtx.fill();
            offCtx.globalAlpha = 1.0;
          }
        }
        sparks = sparks.filter(s => s.life > 0);
      }

      // E. Draw Water Ripples
      if (ripples.length) {
        for (let i = 0; i < ripples.length; i++) {
          const rp = ripples[i];
          rp.r += 2.0;
          rp.opacity -= 0.045;
          if (rp.opacity > 0 && rp.r < rp.maxR) {
            offCtx.strokeStyle = `rgba(0, 229, 255, ${rp.opacity})`;
            offCtx.lineWidth = 1.3;
            offCtx.beginPath();
            offCtx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
            offCtx.stroke();
          }
        }
        ripples = ripples.filter(rp => rp.opacity > 0 && rp.r < rp.maxR);
      }

      // ── STEP 2: MAIN CANVAS COMPOSITING (SOLID TEXT MASK + SOURCE-IN) ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);

      // A. Draw solid black text glyphs as mask
      ctx.fillStyle = '#000000';
      ctx.font = `900 ${fontSize}px 'Poppins', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.textAlign = isMobile ? 'center' : 'left';

      const lineX = isMobile ? (w / 2) : 2;
      const y1 = 4;
      const y2 = Math.round(y1 + fontSize * lineSpacing);

      ctx.fillText(textLines[0], lineX, y1);
      ctx.fillText(textLines[1], lineX, y2);

      // B. Mask offscreen living water scene strictly inside text glyphs
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(offCv, 0, 0, w, h);

      // C. Draw specular iridescent rim outline along letter borders with aquatic cyan glow
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowColor = 'rgba(0, 229, 255, 0.65)';
      ctx.shadowBlur = 14;
      ctx.lineWidth = Math.max(1.6, fontSize * 0.028);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeText(textLines[0], lineX, y1);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.95)';
      ctx.strokeText(textLines[1], lineX, y2);
      ctx.shadowBlur = 0;

      ptr.dx *= 0.85;
      ptr.dy *= 0.85;
    }

    function loop(time) {
      if (!running) return;
      render(time);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    function getPointerPos(e) {
      const rect = canvasEl.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function onPointerMove(e) {
      const p = getPointerPos(e);
      ptr.dx = p.x - ptr.lastX;
      ptr.dy = p.y - ptr.lastY;
      ptr.lastX = p.x;
      ptr.lastY = p.y;
      ptr.x = p.x;
      ptr.y = p.y;
      ptr.on = p.x >= -30 && p.y >= -30 && p.x <= w + 30 && p.y <= h + 30;
      if (!running && visible) render(performance.now());
    }

    function onPointerLeave() {
      ptr.on = false;
    }

    function onPointerClick(e) {
      const p = getPointerPos(e);
      let poppedAny = false;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const dist = Math.hypot((b.x + b.ox) - p.x, (b.y + b.oy) - p.y);
        if (dist <= b.baseR + 16) {
          popBubble(b);
          poppedAny = true;
          break;
        }
      }
      if (!poppedAny) {
        sparks.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 4.5,
          vy: -2 - Math.random() * 3.5,
          r: 2.8,
          color: 'rgba(0, 229, 255, 0.95)',
          life: 1.0,
          decay: 0.028
        });
        ripples.push({
          x: p.x,
          y: p.y,
          r: 2,
          maxR: 40,
          opacity: 0.85
        });
      }
      if (!running && visible) render(performance.now());
    }

    canvasEl.addEventListener('mousemove', onPointerMove, { passive: true });
    canvasEl.addEventListener('mouseleave', onPointerLeave);
    canvasEl.addEventListener('click', onPointerClick);

    canvasEl.addEventListener('touchstart', (e) => {
      onPointerMove(e);
      onPointerClick(e);
    }, { passive: true });
    canvasEl.addEventListener('touchmove', onPointerMove, { passive: true });
    canvasEl.addEventListener('touchend', onPointerLeave);

    const ro = new ResizeObserver(() => {
      resize();
      render(performance.now());
    });
    ro.observe(parent);
    window.addEventListener('resize', () => {
      resize();
      render(performance.now());
    }, { passive: true });

    // Only pause animation when scrolled past hero section
    window.addEventListener('scroll', () => {
      const isPast = window.scrollY > 900;
      if (isPast && running) stop();
      else if (!isPast && !running) start();
    }, { passive: true });

    // Initial resize and start
    resize();
    render(performance.now());
    start();

    // Re-render when web fonts finish downloading
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        resize();
        render(performance.now());
      });
    }

    return {
      destroy() {
        stop();
        ro.disconnect();
        io.disconnect();
        canvasEl.removeEventListener('mousemove', onPointerMove);
        canvasEl.removeEventListener('mouseleave', onPointerLeave);
        canvasEl.removeEventListener('click', onPointerClick);
      }
    };
  }

  function init() {
    const canvasEl = document.getElementById('msqWaterBubbleTitleCanvas');
    if (canvasEl) {
      createWordmark(canvasEl);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.initMsqWaterWordmark = init;
})();

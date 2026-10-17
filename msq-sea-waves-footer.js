/**
 * M SQUARE WATERTECH SERVICE LLP — Realistic Sea Wave Footer Engine
 * Dedicated for how-it-works.html footer
 * 
 * Features:
 * - Multi-layered harmonic trochoidal ocean waves
 * - Dynamic rolling crests with cyan/aqua highlights and white foam specular glisten
 * - Sunlight caustic ribbons dancing on the sea surface
 * - Deep oceanic volumetric lighting
 * - Highly optimized 60-120 FPS requestAnimationFrame engine
 * - Automatic DPR scaling and prefers-reduced-motion compliance
 */

(function() {
  'use strict';

  function initSeaWaveFooter() {
    const footer = document.querySelector('.msq-footer-master');
    if (!footer) return;

    // Create wave canvas wrapper if not present
    let wrap = footer.querySelector('.msq-sea-wave-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'msq-sea-wave-wrap';
      wrap.setAttribute('aria-hidden', 'true');
      footer.insertBefore(wrap, footer.firstChild);
    }

    let canvas = wrap.querySelector('#msqSeaWaveFooterCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'msqSeaWaveFooterCanvas';
      wrap.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animId = null;
    let isVisible = true; // start true immediately so it renders without delay
    let time = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Wave parameters tuned for deep oceanic waves
    const waveLayers = [
      {
        // Deep background swell
        amplitude: 28,
        wavelength: 280,
        speed: 0.012,
        phase: 0,
        yOffsetRatio: 0.10,
        topColor: '#005f9e',
        bottomColor: '#021226',
        crestColor: 'rgba(56, 189, 248, 0.45)',
        lineWidth: 1.5
      },
      {
        // Mid-depth rolling blue wave
        amplitude: 22,
        wavelength: 220,
        speed: -0.018,
        phase: 1.8,
        yOffsetRatio: 0.14,
        topColor: '#0077b6',
        bottomColor: '#020d1c',
        crestColor: 'rgba(72, 202, 228, 0.6)',
        lineWidth: 2
      },
      {
        // Vivid Azure surge wave
        amplitude: 18,
        wavelength: 170,
        speed: 0.024,
        phase: 3.5,
        yOffsetRatio: 0.18,
        topColor: '#0093fe',
        bottomColor: '#03162e',
        crestColor: 'rgba(144, 224, 239, 0.75)',
        lineWidth: 2.2
      },
      {
        // Foreground crest wave with foam & sunlight highlight
        amplitude: 14,
        wavelength: 130,
        speed: -0.032,
        phase: 0.8,
        yOffsetRatio: 0.22,
        topColor: '#00b4d8',
        bottomColor: '#041d3b',
        crestColor: 'rgba(255, 255, 255, 0.85)',
        lineWidth: 2.5
      }
    ];

    // Sunlight caustic reflections along top surface
    const caustics = Array.from({ length: 16 }, (_, i) => ({
      xRatio: i / 16,
      radiusX: 35 + (i % 4) * 15,
      radiusY: 10 + (i % 3) * 6,
      phase: i * 0.7,
      speed: 0.03 + (i % 5) * 0.01
    }));

    function resize() {
      width = footer.offsetWidth || window.innerWidth;
      height = footer.offsetHeight || 550;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (prefersReducedMotion) {
        drawFrame(0);
      }
    }

    function drawWave(layer, t) {
      const baseY = height * layer.yOffsetRatio;
      const k = (Math.PI * 2) / layer.wavelength;

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY);

      const step = 6;
      for (let x = 0; x <= width + step; x += step) {
        // Trochoidal approximation using sine + cosine harmonic
        const p1 = x * k + t * layer.speed + layer.phase;
        const p2 = x * (k * 1.8) - t * (layer.speed * 0.6) + layer.phase * 1.4;
        const y = baseY +
          Math.sin(p1) * layer.amplitude +
          Math.cos(p2) * (layer.amplitude * 0.28);

        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      // Deep water gradient fill
      const grad = ctx.createLinearGradient(0, baseY - layer.amplitude, 0, height);
      grad.addColorStop(0, layer.topColor);
      grad.addColorStop(0.25, layer.bottomColor);
      grad.addColorStop(1, '#02060e');
      ctx.fillStyle = grad;
      ctx.fill();

      // Wave crest stroke / foam line
      ctx.lineWidth = layer.lineWidth;
      ctx.strokeStyle = layer.crestColor;
      ctx.stroke();
    }

    function drawCaustics(t) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      caustics.forEach(c => {
        const x = ((c.xRatio * width + Math.sin(t * c.speed + c.phase) * 80 + width) % width);
        const y = (height * 0.14) + Math.sin(x * 0.005 + t * 0.02) * 18;
        const pulse = Math.sin(t * 1.8 + c.phase) * 0.5 + 0.5;
        const alpha = 0.15 + pulse * 0.25;

        const radGrad = ctx.createRadialGradient(x, y, 2, x, y, c.radiusX);
        radGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        radGrad.addColorStop(0.35, `rgba(125, 211, 252, ${alpha * 0.7})`);
        radGrad.addColorStop(1, 'rgba(0, 119, 182, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.ellipse(x, y, c.radiusX, c.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    function drawFrame(t) {
      // 1. Deep oceanic night-sky water background
      const skyWater = ctx.createLinearGradient(0, 0, 0, height);
      skyWater.addColorStop(0, '#031429');
      skyWater.addColorStop(0.2, '#042247');
      skyWater.addColorStop(0.5, '#021226');
      skyWater.addColorStop(1, '#01050a');
      ctx.fillStyle = skyWater;
      ctx.fillRect(0, 0, width, height);

      // 2. Volumetric sea light glow across the top 35%
      ctx.save();
      const lightGrad = ctx.createLinearGradient(width * 0.5, 0, width * 0.5, height * 0.4);
      lightGrad.addColorStop(0, 'rgba(0, 147, 254, 0.22)');
      lightGrad.addColorStop(0.5, 'rgba(0, 180, 216, 0.12)');
      lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, width, height * 0.4);
      ctx.restore();

      // 3. Draw multi-layered oceanic waves
      for (let i = 0; i < waveLayers.length; i++) {
        drawWave(waveLayers[i], t);
      }

      // 4. Sunlight caustics on surface
      drawCaustics(t);
    }

    function loop() {
      if (!isVisible) {
        animId = null;
        return;
      }
      time += 1;
      drawFrame(time);
      animId = requestAnimationFrame(loop);
    }

    function start() {
      if (!animId && !prefersReducedMotion) {
        animId = requestAnimationFrame(loop);
      }
    }

    function stop() {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          start();
        } else {
          stop();
        }
      });
    }, { rootMargin: '120px' });

    observer.observe(footer);

    window.addEventListener('resize', () => {
      resize();
      drawFrame(time);
    }, { passive: true });

    // Initial setup
    resize();
    drawFrame(0);
    if (!prefersReducedMotion) {
      start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSeaWaveFooter);
  } else {
    initSeaWaveFooter();
  }
})();

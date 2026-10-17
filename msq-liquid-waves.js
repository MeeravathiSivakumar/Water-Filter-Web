/**
 * M SQUARE WATERTECH SERVICE LLP — Aurel-Inspired Realistic Sea Wave & 3D Monolith Engine
 * Inspired by aurel-liquid-hero.openship.mdxpreview.xyz
 * Features:
 * - Dynamic positioning relative to .msq-about-hero-right (zero collision on all screens)
 * - Light sky-blue atmospheric depth (#EAF8FF to #0284C7)
 * - Realistic multi-octave trochoidal ocean waves with natural frothy foam ribbons & caustics
 * - 3D Monolithic M SQUARE Watertech Emblem rising proudly from the ocean waves
 * - Submerged plinth with laser-etched typography, inverted water reflection & wave spray dynamics
 * - Interactive mouse parallax tilt and smooth 60 FPS animation
 */
(function() {
  const canvas = document.getElementById('msqLiquidCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrameId = null;
  let isVisible = true;
  let startTime = performance.now();

  // Mouse interaction for subtle 3D tilt
  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Particle spray system for crashing waves against the monolith
  const sprayParticles = [];
  const MAX_SPRAY = 40;

  function initSpray() {
    sprayParticles.length = 0;
    for (let i = 0; i < MAX_SPRAY; i++) {
      sprayParticles.push({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3.6 - 1.2,
        size: Math.random() * 2.8 + 1.2,
        alpha: Math.random() * 0.8 + 0.2,
        life: Math.random()
      });
    }
  }
  initSpray();

  function resize() {
    const parent = canvas.parentElement || canvas;
    const rect = parent.getBoundingClientRect();
    width = rect.width || window.innerWidth;
    height = rect.height || (window.innerHeight * 0.94);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    if (prefersReducedMotion) {
      drawStatic();
    }
  }

  // Smooth mouse tracking
  window.addEventListener('mousemove', (e) => {
    const hero = canvas.closest('.msq-about-hero');
    if (!hero) return;
    const r = hero.getBoundingClientRect();
    if (e.clientY >= r.top && e.clientY <= r.bottom) {
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      targetMouseX = nx * 2; // -1 to 1
      targetMouseY = ny * 2;
    }
  }, { passive: true });

  // Realistic Trochoidal Sea Wave Calculator
  function getWaveHeight(x, time, layer) {
    const t = time * 0.001;
    let y = 0;

    if (layer === 0) {
      // Horizon background sea swell
      const w1 = Math.sin(x * 0.0035 + t * 0.82);
      const w2 = Math.cos(x * 0.0072 - t * 0.65);
      y = w1 * 16 + w2 * 8;
    } else if (layer === 1) {
      // Midground sea wave with peaked crests (trochoidal approximation)
      const p1 = Math.sin(x * 0.0044 + t * 1.15);
      const crest = Math.pow(Math.max(0, p1), 1.65) * 20;
      const trough = Math.min(0, p1) * 12;
      const sub = Math.sin(x * 0.009 - t * 0.9) * 6;
      y = crest + trough + sub;
    } else if (layer === 2) {
      // Breaking active wave with steep crest
      const p1 = Math.sin(x * 0.0058 - t * 1.3 + 1.2);
      const crest = Math.pow(Math.max(0, p1), 1.85) * 22;
      const trough = Math.min(0, p1) * 11;
      const sub = Math.cos(x * 0.012 + t * 1.05) * 7;
      y = crest + trough + sub;
    } else {
      // Foreground smooth rolling swell
      const p1 = Math.sin(x * 0.0046 + t * 0.88 + 2.5);
      const crest = Math.pow(Math.max(0, p1), 1.5) * 16;
      const trough = Math.min(0, p1) * 9;
      const sub = Math.sin(x * 0.008 - t * 0.7) * 5;
      y = crest + trough + sub;
    }

    return y;
  }

  // Draw Sky Atmospheric Background
  function drawSky(w, h, sunX, sunY) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
    sky.addColorStop(0, '#EAF8FF');     // Crisp pure sky blue
    sky.addColorStop(0.45, '#DCF3FE');  // Soft morning cyan air
    sky.addColorStop(0.8, '#CEEEFD');   // Shimmering horizon tint
    sky.addColorStop(1, '#B9E5FA');     // Horizon water junction
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Soft celestial sun / light halo behind monument
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, Math.min(w, h) * 0.65);
    sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    sunGrad.addColorStop(0.28, 'rgba(224, 247, 255, 0.6)');
    sunGrad.addColorStop(0.68, 'rgba(202, 240, 255, 0.22)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // Draw 3D Monolithic "M SQUARE" Emblem
  function draw3DMonolith(x, y, scale, time, isReflection = false) {
    ctx.save();
    ctx.translate(x, y);

    // Tilt matrix based on mouse
    const tiltX = (mouseX * 4.5) * (Math.PI / 180);
    const tiltY = (mouseY * 3.5) * (Math.PI / 180);

    if (isReflection) {
      ctx.scale(scale * 1.02, -scale * 0.6);
      ctx.globalAlpha = 0.32;
    } else {
      ctx.scale(scale, scale);
      // Subtle organic breathing motion
      const bob = Math.sin(time * 0.0016) * 3.5;
      ctx.translate(0, bob);
    }

    // Monolith dimensions
    const W = 280;
    const H = 340;
    const D = 46; // depth extrusion
    const halfW = W / 2;
    const halfH = H / 2;

    // Apply 3D perspective skew
    const skewX = Math.tan(tiltX);
    ctx.transform(1, 0, skewX * 0.12, 1, 0, 0);

    // Ambient back aura (Cyan energy)
    if (!isReflection) {
      const aura = ctx.createRadialGradient(0, -15, 20, 0, -15, 210);
      aura.addColorStop(0, 'rgba(0, 191, 255, 0.35)');
      aura.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, -15, 210, 0, Math.PI * 2);
      ctx.fill();
    }

    // Geometry points for Monolithic M
    // Symmetrical architectural monument
    const pTopL = { x: -halfW, y: -halfH };
    const pTopR = { x: halfW, y: -halfH };
    const pBotL = { x: -halfW * 0.88, y: halfH - 25 };
    const pBotR = { x: halfW * 0.88, y: halfH - 25 };

    const pMidApex = { x: 0, y: halfH * 0.18 };
    const pOuterPeakL = { x: -halfW * 0.62, y: -halfH };
    const pOuterPeakR = { x: halfW * 0.62, y: -halfH };

    const pInnerL = { x: -halfW * 0.32, y: -halfH * 0.82 };
    const pInnerR = { x: halfW * 0.32, y: -halfH * 0.82 };

    // ── 1. SUBMERGED PLINTH BASE ──
    const plinthGrad = ctx.createLinearGradient(-halfW * 1.05, halfH - 28, halfW * 1.05 + D, halfH + 25);
    plinthGrad.addColorStop(0, '#034a87');
    plinthGrad.addColorStop(0.5, '#02315c');
    plinthGrad.addColorStop(1, '#001833');
    ctx.fillStyle = plinthGrad;

    ctx.beginPath();
    ctx.roundRect(-halfW * 1.05, halfH - 28, W * 1.05, 52, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // ── 2. EXTRUDED SIDE DEPTH FACETS (Right-facing shadow bevels) ──
    const depthGrad = ctx.createLinearGradient(0, -halfH, halfW + D, halfH);
    depthGrad.addColorStop(0, '#034a87');
    depthGrad.addColorStop(0.5, '#012b54');
    depthGrad.addColorStop(1, '#001933');
    ctx.fillStyle = depthGrad;

    // Right pillar outer depth extrusion
    ctx.beginPath();
    ctx.moveTo(pTopR.x, pTopR.y);
    ctx.lineTo(pTopR.x + D, pTopR.y - D * 0.35);
    ctx.lineTo(pBotR.x + D, pBotR.y - D * 0.35);
    ctx.lineTo(pBotR.x, pBotR.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Top depth bevel on pillars
    const topDepthGrad = ctx.createLinearGradient(0, -halfH - D, 0, -halfH);
    topDepthGrad.addColorStop(0, '#bae6fd');
    topDepthGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = topDepthGrad;

    // Left pillar top
    ctx.beginPath();
    ctx.moveTo(pTopL.x, pTopL.y);
    ctx.lineTo(pTopL.x + D * 0.65, pTopL.y - D * 0.35);
    ctx.lineTo(pOuterPeakL.x + D * 0.65, pOuterPeakL.y - D * 0.35);
    ctx.lineTo(pOuterPeakL.x, pOuterPeakL.y);
    ctx.closePath();
    ctx.fill();

    // Right pillar top
    ctx.beginPath();
    ctx.moveTo(pOuterPeakR.x, pOuterPeakR.y);
    ctx.lineTo(pOuterPeakR.x + D * 0.65, pOuterPeakR.y - D * 0.35);
    ctx.lineTo(pTopR.x + D * 0.65, pTopR.y - D * 0.35);
    ctx.lineTo(pTopR.x, pTopR.y);
    ctx.closePath();
    ctx.fill();

    // ── 3. MONOLITH MAIN FRONT FACES (TITANIUM-ICE & SKY-BLUE) ──
    // Left Wing
    const faceGradL = ctx.createLinearGradient(-halfW, -halfH, 0, halfH);
    faceGradL.addColorStop(0, '#FFFFFF');
    faceGradL.addColorStop(0.3, '#E0F2FE');
    faceGradL.addColorStop(0.68, '#7DD3FC');
    faceGradL.addColorStop(1, '#0284C7');

    ctx.beginPath();
    ctx.moveTo(pTopL.x, pTopL.y);
    ctx.lineTo(pOuterPeakL.x, pOuterPeakL.y);
    ctx.lineTo(pMidApex.x - 10, pMidApex.y);
    ctx.lineTo(-halfW * 0.36, halfH - 26);
    ctx.lineTo(pBotL.x, pBotL.y);
    ctx.closePath();
    ctx.fillStyle = faceGradL;
    ctx.fill();

    // Right Wing
    const faceGradR = ctx.createLinearGradient(0, -halfH, halfW, halfH);
    faceGradR.addColorStop(0, '#F0F9FF');
    faceGradR.addColorStop(0.35, '#BAE6FD');
    faceGradR.addColorStop(0.72, '#38BDF8');
    faceGradR.addColorStop(1, '#0369A1');

    ctx.beginPath();
    ctx.moveTo(pOuterPeakR.x, pOuterPeakR.y);
    ctx.lineTo(pTopR.x, pTopR.y);
    ctx.lineTo(pBotR.x, pBotR.y);
    ctx.lineTo(halfW * 0.36, halfH - 26);
    ctx.lineTo(pMidApex.x + 10, pMidApex.y);
    ctx.closePath();
    ctx.fillStyle = faceGradR;
    ctx.fill();

    // ── 4. CHISELED INNER BEVELS ──
    const innerBevelGrad = ctx.createLinearGradient(0, -halfH * 0.5, 0, halfH * 0.2);
    innerBevelGrad.addColorStop(0, '#0c4a6e');
    innerBevelGrad.addColorStop(0.55, '#0284c7');
    innerBevelGrad.addColorStop(1, '#38bdf8');

    ctx.beginPath();
    ctx.moveTo(pOuterPeakL.x, pOuterPeakL.y);
    ctx.lineTo(pInnerL.x, pInnerL.y);
    ctx.lineTo(pMidApex.x, pMidApex.y - 12);
    ctx.lineTo(pInnerR.x, pInnerR.y);
    ctx.lineTo(pOuterPeakR.x, pOuterPeakR.y);
    ctx.lineTo(pMidApex.x, pMidApex.y);
    ctx.closePath();
    ctx.fillStyle = innerBevelGrad;
    ctx.fill();

    // ── 5. FLOATING FACETED SAPPHIRE CRYSTAL WATERDROP GEMSTONE ──
    const dropY = -halfH * 0.14;
    const dropGrad = ctx.createRadialGradient(0, dropY, 2, 0, dropY, 50);
    dropGrad.addColorStop(0, '#FFFFFF');
    dropGrad.addColorStop(0.32, '#38BDF8');
    dropGrad.addColorStop(0.72, '#0093FE');
    dropGrad.addColorStop(1, 'rgba(2, 132, 199, 0.45)');

    ctx.beginPath();
    ctx.moveTo(0, dropY - 46); // Top sharp apex
    ctx.bezierCurveTo(-26, dropY - 18, -36, dropY + 18, 0, dropY + 44);
    ctx.bezierCurveTo(36, dropY + 18, 26, dropY - 18, 0, dropY - 46);
    ctx.closePath();
    ctx.fillStyle = dropGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Internal crystal facet divider
    ctx.beginPath();
    ctx.moveTo(0, dropY - 46);
    ctx.lineTo(0, dropY + 44);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Specular inner gleam
    ctx.beginPath();
    ctx.ellipse(-9, dropY - 8, 11, 5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();

    // ── 6. LASER-ENGRAVED TYPOGRAPHIC INSIGNIA ON PLINTH ──
    if (!isReflection) {
      ctx.save();
      ctx.font = '900 12px system-ui, -apple-system, sans-serif';
      ctx.letterSpacing = '0.24em';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 191, 255, 0.75)';
      ctx.shadowBlur = 8;
      ctx.fillText('M  S Q U A R E   W A T E R T E C H', 0, halfH - 4);
      ctx.restore();
    }

    // ── 7. SPECULAR CHISELED EDGE ACCENTS ──
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(pTopL.x, pTopL.y);
    ctx.lineTo(pOuterPeakL.x, pOuterPeakL.y);
    ctx.lineTo(pMidApex.x - 10, pMidApex.y);
    ctx.lineTo(-halfW * 0.36, halfH - 26);
    ctx.stroke();

    // Periodic dynamic sunlight gleam sweep
    if (!isReflection) {
      const sweep = ((time * 0.00035) % 1.7) - 0.35;
      const sweepX = -halfW + sweep * (W * 1.6);
      ctx.save();
      ctx.beginPath();
      ctx.rect(-halfW, -halfH, W, H);
      ctx.clip();

      const gleam = ctx.createLinearGradient(sweepX - 35, -halfH, sweepX + 35, halfH);
      gleam.addColorStop(0, 'transparent');
      gleam.addColorStop(0.5, 'rgba(255, 255, 255, 0.52)');
      gleam.addColorStop(1, 'transparent');
      ctx.fillStyle = gleam;
      ctx.fillRect(-halfW, -halfH, W, H);
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Realistic Sea Wave with Continuous Frothy Foam Ribbon
  function drawSeaWave(w, h, time, layerIdx, baseY, topColor, botColor, strokeColor, strokeWidth, drawFoam = true) {
    const step = 6;
    ctx.beginPath();
    ctx.moveTo(0, h);

    const points = [];
    for (let x = 0; x <= w + step; x += step) {
      const dy = getWaveHeight(x, time, layerIdx);
      const y = h * baseY + dy;
      points.push({ x, y });
      if (x === 0) {
        ctx.lineTo(0, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.lineTo(w, h);
    ctx.closePath();

    const waveGrad = ctx.createLinearGradient(0, h * baseY - 35, 0, h);
    waveGrad.addColorStop(0, topColor);
    waveGrad.addColorStop(1, botColor);
    ctx.fillStyle = waveGrad;
    ctx.fill();

    // Wave crest stroke line
    if (strokeColor) {
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth || 1.8;
      ctx.stroke();
    }

    // Natural continuous frothy foam ribbon along wave crests (NOT separate dots!)
    if (drawFoam) {
      ctx.save();
      // Frothy crest highlight wash
      ctx.beginPath();
      let inFoam = false;
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const isPeak = pt.y < h * baseY - 2;
        if (isPeak) {
          if (!inFoam) {
            ctx.moveTo(pt.x, pt.y);
            inFoam = true;
          } else {
            ctx.lineTo(pt.x, pt.y + 1);
          }
        } else {
          inFoam = false;
        }
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Soft translucent foam wash just underneath breaking crests
      ctx.beginPath();
      for (let i = 1; i < points.length - 1; i += 2) {
        const pt = points[i];
        if (pt.y < h * baseY - 4) {
          const foamH = Math.sin(pt.x * 0.04 + time * 0.0025) * 3 + 4;
          ctx.ellipse(pt.x, pt.y + 2.5, 6, foamH * 0.5, 0, 0, Math.PI * 2);
        }
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.fill();
      ctx.restore();
    }
  }

  // Draw Sunlit Water Caustics Shimmer
  function drawWaterCaustics(w, h, time, startY) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const numLines = 4;
    for (let i = 0; i < numLines; i++) {
      const cy = h * startY + i * 26 + Math.sin(time * 0.0012 + i) * 5;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      for (let x = 0; x <= w; x += 22) {
        const ny = cy +
          Math.sin(x * 0.006 + time * 0.0014 + i * 1.5) * 5 +
          Math.cos(x * 0.012 - time * 0.0009) * 3;
        ctx.lineTo(x, ny);
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 - i * 0.04})`;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw Foam Wake, Ripple Collars & Splash Particles around Monolith Base
  function drawMonolithSplash(monoX, monoY, time, scale) {
    ctx.save();

    // 1. Expanding oval water ripple rings
    const numRings = 3;
    for (let i = 0; i < numRings; i++) {
      const progress = ((time * 0.00075 + i * 0.33) % 1);
      const rx = (85 + progress * 110) * scale;
      const ry = (16 + progress * 20) * scale;
      const alpha = (1 - progress) * 0.42;

      ctx.beginPath();
      ctx.ellipse(monoX, monoY + 12 * scale, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 2 * (1 - progress);
      ctx.stroke();
    }

    // 2. Foaming froth base collar
    const collarGrad = ctx.createRadialGradient(monoX, monoY + 10 * scale, 15 * scale, monoX, monoY + 10 * scale, 115 * scale);
    collarGrad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    collarGrad.addColorStop(0.45, 'rgba(224, 247, 255, 0.65)');
    collarGrad.addColorStop(0.85, 'rgba(125, 211, 252, 0.22)');
    collarGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = collarGrad;
    ctx.beginPath();
    ctx.ellipse(monoX, monoY + 10 * scale, 115 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Dynamic spray particles splashing upwards from wave collision
    for (let i = 0; i < sprayParticles.length; i++) {
      const p = sprayParticles[i];
      p.life += 0.02;
      if (p.life >= 1) {
        p.life = 0;
        p.x = monoX + (Math.random() - 0.5) * (150 * scale);
        p.y = monoY + 8 * scale;
        p.vx = (Math.random() - 0.5) * 3;
        p.vy = -Math.random() * 3.4 - 1.2;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.095; // gravity pull

      const alpha = (1 - p.life) * 0.82;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - p.life * 0.4) * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Main Render Loop
  function render(now) {
    if (!isVisible) return;
    const time = now - startTime;

    // Smooth mouse interpolation
    mouseX += (targetMouseX - mouseX) * 0.06;
    mouseY += (targetMouseY - mouseY) * 0.06;

    ctx.clearRect(0, 0, width, height);

    // Dynamic monolith coordinates anchored to .msq-about-hero-right
    let monoX, monoY, monoScale;
    const rightCol = document.querySelector('.msq-about-hero-right');

    if (rightCol) {
      const canvasRect = canvas.getBoundingClientRect();
      const rect = rightCol.getBoundingClientRect();
      const relLeft = rect.left - canvasRect.left;
      const relTop = rect.top - canvasRect.top;

      monoX = relLeft + rect.width / 2;
      monoY = relTop + rect.height * 0.46;
      monoScale = Math.min(rect.width / 310, rect.height / 350, 1.05);
      monoScale = Math.max(monoScale, 0.58);
    } else {
      const isDesktop = width > 991;
      monoX = isDesktop ? width * 0.73 : width * 0.5;
      monoY = isDesktop ? height * 0.48 : height * 0.68;
      monoScale = isDesktop ? Math.min(width * 0.00085, 1.05) : 0.62;
    }

    // 1. Atmosphere & Sky
    drawSky(width, height, monoX, monoY - 80 * monoScale);

    // 2. Horizon Sea Wave Layer 0 (Sits gently below heading)
    drawSeaWave(
      width, height, time, 0,
      0.58,
      'rgba(2, 132, 199, 0.42)',
      'rgba(56, 189, 248, 0.62)',
      'rgba(255, 255, 255, 0.45)',
      1.2,
      false
    );

    // 3. Monolith Inverted Reflection on Water Surface
    draw3DMonolith(monoX, monoY + (16 * monoScale), monoScale, time, true);

    // 4. Midground Sea Wave Layer 1
    drawSeaWave(
      width, height, time, 1,
      0.65,
      'rgba(14, 165, 233, 0.65)',
      'rgba(125, 211, 252, 0.85)',
      'rgba(255, 255, 255, 0.75)',
      2.0,
      true
    );

    // 5. THE 3D MONOLITH (M SQUARE WATERTECH EMBLEM)
    draw3DMonolith(monoX, monoY, monoScale, time, false);

    // 6. Water-Monolith Collision Splash, Foaming Collar & Spray
    drawMonolithSplash(monoX, monoY + (145 * monoScale), time, monoScale);

    // 7. Active Breaking Sea Wave Layer 2 (Crosses in front of monolith base)
    drawSeaWave(
      width, height, time, 2,
      0.75,
      'rgba(56, 189, 248, 0.78)',
      'rgba(186, 230, 253, 0.92)',
      'rgba(255, 255, 255, 0.95)',
      2.6,
      true
    );

    // 8. Sunlit Caustics Shimmer
    drawWaterCaustics(width, height, time, 0.72);

    // 9. Foreground Ocean Swell Layer 3 (Seamlessly transitions into trust section)
    drawSeaWave(
      width, height, time, 3,
      0.86,
      'rgba(186, 230, 253, 0.88)',
      '#f0f7ff',
      'rgba(255, 255, 255, 0.98)',
      2.8,
      true
    );

    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(render);
    }
  }

  function drawStatic() {
    render(startTime + 4000);
  }

  // IntersectionObserver to pause rendering when hero is out of view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !prefersReducedMotion && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      } else if (!isVisible && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    });
  }, { threshold: 0.05 });

  const heroSection = document.querySelector('.msq-about-hero');
  if (heroSection) {
    observer.observe(heroSection);
  }

  window.addEventListener('resize', resize, { passive: true });

  resize();
  if (!prefersReducedMotion) {
    animationFrameId = requestAnimationFrame(render);
  } else {
    drawStatic();
  }
})();

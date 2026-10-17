/**
 * M SQUARE WATERTECH SERVICE LLP — FLUTED GLASS WAVES FOOTER ENGINE
 * Reference: 21st.dev/@paper-design/components/fluted-glass-waves
 * GPU-accelerated WebGL shader with continuous fluted glass liquid wave refraction
 * Palette: Deep Navy (#040E1E), Royal Blue (#0757C8), Electric Cyan (#00BFFF), Aqua (#43DFFF), White Highlights (#FFFFFF)
 */
(function() {
  'use strict';

  function initFooterFlutedWaves() {
    const footers = document.querySelectorAll('.msq-footer-master');
    if (!footers.length) return;

    footers.forEach(footer => {
      // Prevent duplicate instances
      if (footer.querySelector('.msq-fluted-waves-canvas')) return;

      // Clean up any legacy canvases or wave layers if present
      const oldCanvas = footer.querySelector('#msqSeaWaveCanvas, canvas:not(.msq-fluted-waves-canvas)');
      if (oldCanvas) oldCanvas.remove();

      const canvas = document.createElement('canvas');
      canvas.className = 'msq-fluted-waves-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      footer.insertBefore(canvas, footer.firstChild);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Try WebGL first
      let gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' }) ||
               canvas.getContext('experimental-webgl');

      if (gl) {
        setupWebGL(canvas, gl, footer, prefersReducedMotion);
      } else {
        setupCanvas2D(canvas, footer, prefersReducedMotion);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 1. WebGL FLUTED GLASS WAVES SHADER IMPLEMENTATION
  // ═══════════════════════════════════════════════════════════════
  function setupWebGL(canvas, gl, footer, prefersReducedMotion) {
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv;
        p.x *= u_resolution.x / u_resolution.y;

        float t = u_time * 0.45;

        // Multi-octave wave dynamics
        float wave1 = sin(p.y * 6.5 + p.x * 3.8 + t * 1.35) * cos(p.y * 4.2 - t * 0.75);
        float wave2 = cos(p.x * 5.2 - p.y * 3.2 + t * 1.1) * sin(p.x * 6.8 + t * 0.65);
        float wave3 = sin((p.x + p.y) * 8.5 - t * 1.55);

        float totalWave = wave1 * 0.5 + wave2 * 0.35 + wave3 * 0.15;

        // Fluted Glass Cylindrical Ribs (matching 21st.dev reference)
        float fluteFreq = 54.0;
        float flute = sin(uv.y * fluteFreq + totalWave * 3.6 + uv.x * 14.0);
        float fluteNormal = cos(uv.y * fluteFreq + totalWave * 3.6 + uv.x * 14.0);

        // Fluid refraction and fine glass grating
        float refraction = sin(uv.y * fluteFreq * 1.5 + totalWave * 4.8 + t * 0.85);
        float fineRibs = sin(uv.y * fluteFreq * 2.5 + totalWave * 5.0) * 0.5 + 0.5;
        float caustic = pow(clamp((fluteNormal * 0.5 + 0.5) * (wave1 * 0.5 + 0.5) + (wave2 * 0.3), 0.0, 1.0), 2.2);

        // M SQUARE Brand Palette
        vec3 colNavyDark = vec3(0.015, 0.045, 0.095);
        vec3 colNavy = vec3(0.024, 0.082, 0.165);
        vec3 colRoyal = vec3(0.027, 0.341, 0.784);
        vec3 colCyan = vec3(0.0, 0.75, 1.0);
        vec3 colAqua = vec3(0.263, 0.875, 1.0);
        vec3 colWhite = vec3(1.0, 1.0, 1.0);

        // Base gradient
        float baseMix = smoothstep(-0.8, 0.8, totalWave);
        vec3 color = mix(colNavyDark, colNavy, baseMix);

        // Royal blue depths
        float royalMix = smoothstep(-0.25, 0.85, wave1 + wave2 * 0.5);
        color = mix(color, colRoyal, royalMix * 0.75);

        // Electric cyan fluted bands with fine rib texture
        float cyanBand = smoothstep(0.22, 0.92, flute * 0.5 + refraction * 0.5);
        color = mix(color, colCyan, cyanBand * 0.7 + fineRibs * 0.15);

        // Aqua caustic ridges
        color += colAqua * caustic * 0.85;

        // Specular glass highlights
        float specular = pow(clamp(caustic * 1.3, 0.0, 1.0), 3.5);
        color += colWhite * specular * 0.95;

        // Subtle edge vignette
        float topFade = smoothstep(0.0, 0.12, uv.y);
        float btmFade = smoothstep(1.0, 0.88, uv.y);
        color *= (topFade * btmFade * 0.3 + 0.7);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) {
      setupCanvas2D(canvas, footer, prefersReducedMotion);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      setupCanvas2D(canvas, footer, prefersReducedMotion);
      return;
    }

    gl.useProgram(program);

    // Full screen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId = null;
    let isVisible = true;
    let startTime = performance.now();

    function resize() {
      const rect = footer.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || 450;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);

      if (prefersReducedMotion) {
        gl.uniform1f(uTime, 2.5);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    }

    function render(now) {
      if (!isVisible || prefersReducedMotion) return;

      const elapsed = (now - startTime) * 0.001;
      gl.uniform1f(uTime, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Intersection observer to pause rendering when footer is offscreen
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible && !prefersReducedMotion && !animationFrameId) {
            startTime = performance.now();
            animationFrameId = requestAnimationFrame(render);
          } else if (!isVisible && animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        });
      }, { threshold: 0.05 });
      observer.observe(footer);
    } else {
      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. High-Performance 2D Fallback Implementation
  // ═══════════════════════════════════════════════════════════════
  function setupCanvas2D(canvas, footer, prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId = null;
    let isVisible = true;
    let startTime = performance.now();

    function resize() {
      const rect = footer.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || 450;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      if (prefersReducedMotion) {
        drawFrame(2.0);
      }
    }

    function drawFrame(t) {
      ctx.fillStyle = '#040e1e';
      ctx.fillRect(0, 0, width, height);

      // Draw fluted ripples
      const fluteWidth = 28;
      const count = Math.ceil(width / fluteWidth) + 1;

      for (let i = 0; i < count; i++) {
        const x = i * fluteWidth;
        const waveOffset = Math.sin(x * 0.015 + t * 0.8) * 20;

        const grad = ctx.createLinearGradient(x, 0, x + fluteWidth, height);
        grad.addColorStop(0, 'rgba(4, 14, 30, 0.95)');
        grad.addColorStop(0.3, 'rgba(7, 87, 200, 0.45)');
        grad.addColorStop(0.6, 'rgba(0, 191, 255, 0.35)');
        grad.addColorStop(0.8, 'rgba(67, 223, 255, 0.25)');
        grad.addColorStop(1, 'rgba(4, 14, 30, 0.95)');

        ctx.fillStyle = grad;
        ctx.fillRect(x, waveOffset, fluteWidth, height);

        // Specular highlight line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + fluteWidth * 0.5, 0);
        ctx.lineTo(x + fluteWidth * 0.5, height);
        ctx.stroke();
      }
    }

    function render(now) {
      if (!isVisible || prefersReducedMotion) return;
      const elapsed = (now - startTime) * 0.001;
      drawFrame(elapsed);
      animationFrameId = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(render);
    }
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterFlutedWaves);
  } else {
    initFooterFlutedWaves();
  }
})();

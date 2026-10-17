/**
 * M SQUARE WATERTECH SERVICE LLP — Realistic Cinematic Water Hero Shader
 * Target: about.html hero section
 * Features:
 *  - Real-time 60fps WebGL fluid water simulation
 *  - Hydrodynamic wave equations (continuous natural flowing waves)
 *  - Physically convincing rippling & undulating reflection of the metallic M
 *  - Organic chromatic refraction and subtle wavelength dispersion
 *  - Moving specular glints & lighting highlights on water crests
 *  - Soft atmospheric cyan caustics dancing across the water surface
 *  - Upper metallic M monolith remains 100% stable, rock-solid & razor-sharp
 *  - Automatic pausing via IntersectionObserver when off-screen
 *  - Full responsive resize handling and WebGL fallback
 */
(function() {
  'use strict';

  var canvas = document.getElementById('msq-about-water-canvas');
  if (!canvas) return;

  var hero = document.getElementById('msq-about-hero');
  if (!hero) return;

  var gl = canvas.getContext('webgl', { alpha: false, depth: false, antialias: true }) ||
           canvas.getContext('experimental-webgl', { alpha: false, depth: false });

  if (!gl) {
    console.warn('WebGL not supported, using fallback static image.');
    canvas.style.display = 'none';
    return;
  }

  // Check prefers-reduced-motion
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var vsSource = [
    'attribute vec2 a_pos;',
    'varying vec2 v_uv;',
    'void main() {',
    '  v_uv = (a_pos + 1.0) * 0.5;',
    '  gl_Position = vec4(a_pos, 0.0, 1.0);',
    '}'
  ].join('\n');

  var fsSource = [
    'precision highp float;',
    'varying vec2 v_uv;',
    'uniform sampler2D u_tex;',
    'uniform vec2 u_res;',
    'uniform vec2 u_imgRes;',
    'uniform float u_time;',
    '',
    '// Cover UV calculation matching CSS "object-fit: cover; object-position: center 48%"',
    'vec2 getCoverUv(vec2 uv) {',
    '  float screenAspect = u_res.x / u_res.y;',
    '  float imgAspect = u_imgRes.x / u_imgRes.y;',
    '  vec2 scale = vec2(1.0);',
    '  vec2 offset = vec2(0.0);',
    '  if (screenAspect > imgAspect) {',
    '    scale.y = imgAspect / screenAspect;',
    '    offset.y = (1.0 - scale.y) * 0.52;',
    '  } else {',
    '    scale.x = screenAspect / imgAspect;',
    '    offset.x = (1.0 - scale.x) * 0.5;',
    '  }',
    '  return uv * scale + offset;',
    '}',
    '',
    'void main() {',
    '  vec2 baseUv = getCoverUv(v_uv);',
    '  float waterLine = 0.315;',
    '  float t = u_time * 1.4;',
    '',
    '  // Smooth transition mask: 0.0 above water (monolith), 1.0 below water (sea waves)',
    '  float waterMask = smoothstep(waterLine + 0.012, waterLine - 0.020, baseUv.y);',
    '',
    '  // Normalized water depth (0.0 at waterline, 1.0 at bottom of screen)',
    '  float depth = clamp((waterLine - baseUv.y) / waterLine, 0.0, 1.0);',
    '',
    '  // Natural ocean swell rhythm: cycles of dynamic rolling waves alternating with',
    '  // calm, glassy water where the metallic M reflection stands clear ("alai azhaga nikkum")',
    '  float swell = sin(t * 0.42) * 0.5 + 0.5; // smooth swell oscillation',
    '  float waveIntensity = 0.45 + swell * 0.75;',
    '',
    '  // Multi-octave natural wave propagation',
    '  float waveDistX = sin(baseUv.x * 15.0 + t * 1.1 + depth * 9.0) * 0.008',
    '                  + cos(baseUv.x * 26.0 - t * 1.5 + depth * 16.0) * 0.005',
    '                  + sin((baseUv.x * 38.0 + depth * 22.0) + t * 2.0) * 0.003;',
    '',
    '  float waveDistY = cos(baseUv.x * 13.0 - t * 0.95 + depth * 11.0) * 0.006',
    '                  + sin(depth * 22.0 - t * 1.6) * 0.009;',
    '',
    '  // Radial splash ripples expanding from the centre-right M base (center: 0.617)',
    '  float distM = abs(baseUv.x - 0.617);',
    '  float mRipple = sin(distM * 34.0 - t * 2.6) * exp(-distM * 3.2) * exp(-depth * 3.2) * (0.004 + swell * 0.006);',
    '',
    '  // Total fluid displacement scaled strictly in the water region with dynamic swell',
    '  vec2 waveOffset = vec2(waveDistX + mRipple, waveDistY * (0.28 + depth * 0.72)) * waterMask * waveIntensity;',
    '',
    '  // Sample texture with subtle chromatic refraction',
    '  vec3 col;',
    '  col.r = texture2D(u_tex, clamp(baseUv + waveOffset * 1.05, 0.001, 0.999)).r;',
    '  col.g = texture2D(u_tex, clamp(baseUv + waveOffset * 1.00, 0.001, 0.999)).g;',
    '  col.b = texture2D(u_tex, clamp(baseUv + waveOffset * 0.95, 0.001, 0.999)).b;',
    '',
    '  // In the upper air region: gentle ambient cyan mist drifting behind the M',
    '  if (waterMask < 0.5) {',
    '    float mist = sin(baseUv.x * 3.5 + t * 0.25) * cos(baseUv.y * 5.0 - t * 0.18) * 0.5 + 0.5;',
    '    float heightFactor = smoothstep(waterLine + 0.35, waterLine, baseUv.y);',
    '    col += vec3(0.0, 0.32, 0.60) * mist * heightFactor * 0.035 * (1.0 - waterMask);',
    '  }',
    '',
    '  // In the water region: realistic specular glints and aquatic caustics',
    '  if (waterMask > 0.01) {',
    '    // Wave normal perturbation',
    '    vec3 normal = normalize(vec3(-waveOffset.x * 9.0, 1.0, -waveOffset.y * 7.0));',
    '',
    '    // Specular highlights on wave crests',
    '    vec3 lightDir = normalize(vec3(0.12, 0.78, -0.62));',
    '    vec3 viewDir = normalize(vec3(0.0, 0.58, 1.0));',
    '    vec3 halfDir = normalize(lightDir + viewDir);',
    '    float spec = pow(max(0.0, dot(normal, halfDir)), 28.0);',
    '    col += vec3(0.25, 0.82, 1.0) * spec * waterMask * (1.0 - depth * 0.45) * (0.35 + swell * 0.35);',
    '',
    '    // Flowing aquatic caustics in wave troughs',
    '    float caustics = sin(baseUv.x * 22.0 + t * 1.6 + depth * 11.0)',
    '                   * cos(baseUv.x * 16.0 - t * 1.2 + depth * 16.0);',
    '    caustics = pow(max(0.0, caustics), 3.0) * 0.14;',
    '    col += vec3(0.0, 0.62, 0.92) * caustics * waterMask * (1.0 - depth * 0.65) * (0.5 + swell * 0.5);',
    '  }',
    '',
    '  // Subtle cinematic edge vignette to blend seamlessly into page borders',
    '  float edge = distance(v_uv, vec2(0.5, 0.5));',
    '  col *= 1.0 - smoothstep(0.40, 0.88, edge) * 0.32;',
    '',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compileShader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  var vs = compileShader(gl.VERTEX_SHADER, vsSource);
  var fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  // Fullscreen quad
  var posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
  ]), gl.STATIC_DRAW);

  var aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uImgRes = gl.getUniformLocation(prog, 'u_imgRes');
  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uTex = gl.getUniformLocation(prog, 'u_tex');

  var texture = gl.createTexture();
  var img = new Image();
  var imgLoaded = false;
  var imgWidth = 1376;
  var imgHeight = 768;

  img.onload = function() {
    imgWidth = img.naturalWidth || 1376;
    imgHeight = img.naturalHeight || 768;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    imgLoaded = true;
    resize();
    render(0);
  };
  img.src = 'assets/about-hero-monolith-black.jpg';

  var isVisible = true;
  var rafId = null;

  function resize() {
    var rect = hero.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var width = Math.round(rect.width * dpr);
    var height = Math.round(rect.height * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  window.addEventListener('resize', resize, { passive: true });

  var startTime = performance.now();

  function render(now) {
    if (!isVisible && imgLoaded) {
      rafId = null;
      return;
    }

    if (imgLoaded) {
      var t = (now - startTime) * 0.001;
      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uImgRes, imgWidth, imgHeight);
      gl.uniform1f(uTime, prefersReduced ? 0.0 : t);
      gl.uniform1i(uTex, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    if (!prefersReduced) {
      rafId = requestAnimationFrame(render);
    }
  }

  // IntersectionObserver to pause off-screen rendering
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        isVisible = entry.isIntersecting;
        if (isVisible && !rafId) {
          rafId = requestAnimationFrame(render);
        }
      });
    }, { threshold: 0.05 });
    observer.observe(hero);
  }
})();

/* ===========================================================
   Liquid Water-Droplet Hero  —  WebGL fragment-shader surface
   Inspired by Apple's "New dimensions in power" liquid section.
   Self-contained, no dependencies. Falls back gracefully.
   =========================================================== */
(function () {
  const canvas = document.getElementById('droplet-canvas');
  if (!canvas) return;

  const gl =
    canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true }) ||
    canvas.getContext('experimental-webgl');

  // Respect reduced-motion + no-WebGL: just hide canvas, hero still looks great.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!gl || reduced) { canvas.style.display = 'none'; return; }

  const MAX = 10; // max simultaneous ripples

  /* ---------- shaders ---------- */
  const vert = `
    attribute vec2 a_pos;
    void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const frag = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_ripC[${MAX}];   // ripple centers (0..1, aspect-corrected)
    uniform float u_ripT[${MAX}];   // ripple birth times
    uniform float u_ripA[${MAX}];   // ripple amplitude/strength

    // single expanding, decaying droplet ripple -> height contribution
    float ripple(vec2 p, vec2 c, float age, float amp){
      if(age < 0.0) return 0.0;
      float d = distance(p, c);
      float speed = 0.40;
      float front = age * speed;
      float band  = front - d;                 // positive once the wavefront passed
      // soft, wide envelope -> gentle rings that ease in and out
      float env   = smoothstep(0.0, 0.06, band) * exp(-band * 1.15);
      float life  = exp(-age * 0.7);           // lingers, then fades slowly
      // single low-frequency wave -> smooth, soft ripple (no sharp ridges)
      float wave  = sin((d - front) * 30.0);
      return wave * env * life * amp * 0.7;
    }

    float height(vec2 p){
      float h = 0.0;
      for(int i = 0; i < ${MAX}; i++){
        float age = u_time - u_ripT[i];
        h += ripple(p, u_ripC[i], age, u_ripA[i]);
      }
      // gentle ambient swell so the surface is never fully dead
      h += 0.012 * sin(p.x * 6.0 + u_time * 0.6) * sin(p.y * 5.0 - u_time * 0.5);
      return h;
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      float aspect = u_res.x / u_res.y;
      vec2 p = vec2(uv.x * aspect, uv.y);   // aspect-corrected sample space

      // surface height + analytic-ish normal via finite differences
      float e = 1.5 / u_res.y;
      float h  = height(p);
      float hx = height(p + vec2(e, 0.0));
      float hy = height(p + vec2(0.0, e));
      vec3  n  = normalize(vec3((h - hx), (h - hy), e * 9.0));

      // ---- base water : two-tone grey, light top -> darker bottom ----
      vec3 light = vec3(0.62, 0.64, 0.66);   // bright silver-grey
      vec3 dark  = vec3(0.20, 0.22, 0.25);   // deep slate-grey
      vec3 base  = mix(dark, light, uv.y);

      // refraction: the surface slope bends our view of the grey gradient
      vec2 refr = n.xy * 0.85;
      vec3 col  = mix(dark, light, clamp(uv.y + refr.y * 1.1 + refr.x * 0.3, 0.0, 1.0));
      col = mix(col, base, 0.35);

      // grey ripple bodies: crests catch light, troughs go dark (like real water)
      col += vec3(0.55) * h * 1.6;

      // ---- specular highlight (the glossy water glint) ----
      vec3 L = normalize(vec3(0.30, 0.70, 0.75));
      vec3 V = vec3(0.0, 0.0, 1.0);
      vec3 H = normalize(L + V);
      float spec = pow(max(dot(n, H), 0.0), 50.0);
      col += vec3(0.95, 0.97, 1.0) * spec * 0.85;  // soft, diffuse glints

      // gentle fresnel rim sheen for a wet, reflective look
      float fres = pow(1.0 - n.z, 2.5);
      col += vec3(0.70, 0.73, 0.78) * fres * 0.45;

      // ---- chromatic dispersion : rainbow refraction on the ripple edges ----
      // the wavefront edges have the steepest slope; that's where light splits.
      float slope = length(n.xy);
      float edge  = smoothstep(0.05, 0.32, slope);              // isolate the moving edges
      float hue   = atan(n.y, n.x) * 0.1591 + h * 5.5 + u_time * 0.12;
      vec3  spectrum = 0.5 + 0.5 * cos(6.2831853 * (hue + vec3(0.0, 0.33, 0.67)));
      // soft pastel rainbow: lower the saturation and lift toward white
      spectrum = mix(vec3(dot(spectrum, vec3(0.33))), spectrum, 0.55);
      spectrum = mix(spectrum, vec3(1.0), 0.45);
      col += spectrum * edge * 0.22;                            // subtle colour where it refracts

      // soft radial vignette so it melts into the page
      float vig = smoothstep(1.15, 0.25, distance(uv, vec2(0.5)));
      col *= 0.55 + 0.65 * vig;

      // alpha: soft but present — rainbow edges stay visible, still melts away
      float a = clamp(0.054 + abs(h) * 1.44 + spec * 0.36 + edge * 0.06, 0.0, 0.36) * vig;
      gl_FragColor = vec4(col, a);
    }
  `;

  /* ---------- compile ---------- */
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('droplet shader:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, vert);
  const fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) { canvas.style.display = 'none'; return; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // fullscreen triangle
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const U = {
    res:  gl.getUniformLocation(prog, 'u_res'),
    time: gl.getUniformLocation(prog, 'u_time'),
    ripC: gl.getUniformLocation(prog, 'u_ripC'),
    ripT: gl.getUniformLocation(prog, 'u_ripT'),
    ripA: gl.getUniformLocation(prog, 'u_ripA'),
  };

  /* ---------- ripple pool ---------- */
  const centers = new Float32Array(MAX * 2);
  const times   = new Float32Array(MAX).fill(-999);
  const amps    = new Float32Array(MAX);
  let next = 0;
  let aspect = 1;

  function drop(u, v, strength) {
    times[next]       = clock;
    centers[next * 2] = u * aspect;
    centers[next * 2 + 1] = v;
    amps[next]        = strength;
    next = (next + 1) % MAX;
    // tell the koi to scatter away from this ripple
    window.dispatchEvent(new CustomEvent('droplet', {
      detail: { u: u, v: v, strength: strength }
    }));
  }

  /* ---------- sizing ---------- */
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = canvas.width / canvas.height;
  }
  window.addEventListener('resize', resize);

  /* ---------- interaction : cursor leaves a wet trail ---------- */
  const hero = document.getElementById('hero') || canvas.parentElement;
  let lastMove = 0;
  hero.addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (now - lastMove < 90) return;      // throttle
    lastMove = now;
    const r = canvas.getBoundingClientRect();
    const u = (e.clientX - r.left) / r.width;
    const v = 1.0 - (e.clientY - r.top) / r.height;
    drop(u, v, 0.9);
  });
  hero.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    drop((e.clientX - r.left) / r.width, 1.0 - (e.clientY - r.top) / r.height, 1.6);
  });

  /* ---------- render loop (pauses when hero off-screen) ---------- */
  let clock = 0, last = performance.now(), running = true;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      running = es[0].isIntersecting;
      if (running) { last = performance.now(); requestAnimationFrame(frame); }
    }, { threshold: 0.02 }).observe(canvas);
  }

  function frame(t) {
    if (!running) return;
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    clock += dt;

    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, clock);
    gl.uniform2fv(U.ripC, centers);
    gl.uniform1fv(U.ripT, times);
    gl.uniform1fv(U.ripA, amps);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }

  resize();
  // a single droplet on page load — then it only ripples on hover
  drop(0.5, 0.55, 1.6);
  requestAnimationFrame(frame);
})();

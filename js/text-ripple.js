/* ===========================================================
   Liquid text  —  the hero headline distorts like water when
   you hover it. Uses an animated SVG displacement filter that
   eases in on hover and smoothly settles back when you leave.
   =========================================================== */
(function () {
  const title = document.querySelector('.hero-title');
  if (!title) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SVGNS = 'http://www.w3.org/2000/svg';

  // build the filter once and drop it into the page
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = `
    <defs>
      <filter id="liquidText" x="-25%" y="-25%" width="150%" height="150%"
              color-interpolation-filters="sRGB">
        <!-- flowing noise that drives both the warp and the glass highlights -->
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018"
                      numOctaves="2" seed="7" result="noise"/>
        <!-- refract the letters through the water surface (keeps their colour) -->
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0"
                           xChannelSelector="R" yChannelSelector="G" result="disp"/>
        <!-- glassy specular highlights riding on the same noise -->
        <feSpecularLighting in="noise" surfaceScale="3" specularConstant="0"
                            specularExponent="22" lighting-color="#ffffff" result="spec">
          <fePointLight x="-100" y="-160" z="180"/>
        </feSpecularLighting>
        <!-- clip glints to the letters, then ADD them on top (brighten, never darken) -->
        <feComposite in="spec" in2="disp" operator="in" result="specClip"/>
        <feComposite in="disp" in2="specClip" operator="arithmetic"
                     k1="0" k2="1" k3="1" k4="0"/>
      </filter>
    </defs>`;
  document.body.appendChild(svg);

  const turb  = svg.querySelector('feTurbulence');
  const disp  = svg.querySelector('feDisplacementMap');
  const spec  = svg.querySelector('feSpecularLighting');
  const light = svg.querySelector('fePointLight');

  title.style.filter = 'url(#liquidText)';
  title.style.willChange = 'filter';

  const MAX_SCALE = 6;           // how far the letters wobble (kept gentle so text stays legible)
  let intensity = 0;             // current (0..1)
  let target = 0;                // hover target (0..1)
  let t = 0;
  let running = false;

  function start() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    // ease intensity toward the hover target
    intensity += (target - intensity) * Math.min(1, dt * 6);

    // animate the noise so the distortion flows like water
    const bx = 0.010 + 0.008 * Math.sin(t * 1.1);
    const by = 0.016 + 0.008 * Math.cos(t * 0.9);
    turb.setAttribute('baseFrequency', `${bx.toFixed(4)} ${by.toFixed(4)}`);

    // refraction warp
    disp.setAttribute('scale', (intensity * MAX_SCALE).toFixed(2));
    // glassy highlights swell in with the ripple (added on top, so text stays bright)
    spec.setAttribute('specularConstant', (intensity * 1.1).toFixed(2));
    // drift the light so the glass glints shimmer and travel
    light.setAttribute('x', (Math.sin(t * 0.8) * 220).toFixed(0));
    light.setAttribute('y', (-120 + Math.cos(t * 0.7) * 90).toFixed(0));
    // a touch of translucency so the text feels mixed into the water
    title.style.opacity = (1 - intensity * 0.12).toFixed(3);

    // keep going while active; stop once fully settled to save CPU
    if (intensity > 0.002 || target > 0) {
      requestAnimationFrame(loop);
    } else {
      running = false;
      disp.setAttribute('scale', '0');
      spec.setAttribute('specularConstant', '0');
      title.style.opacity = '1';
    }
  }

  // hovering the headline ripples it; moving across gives it a little surge
  title.addEventListener('pointerenter', () => { target = 1; start(); });
  title.addEventListener('pointerleave', () => { target = 0; start(); });
  title.addEventListener('pointermove', () => {
    target = 1;
    intensity = Math.min(1, intensity + 0.04);   // subtle ripple as you move over it
    start();
  });
})();

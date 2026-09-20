/* ── Background FX — cursor-reactive grid + circular cursor ───────────────
   Progressive enhancement. Bails out entirely (leaving the static CSS
   texture and the native arrow cursor) when the device has no fine pointer
   or the visitor asked for reduced motion. The native cursor is only hidden
   AFTER the replacement is on screen, so a JS failure can never leave
   someone without a pointer.                                            */
'use strict';

(function () {
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;

  var root = document.documentElement;

  /* ── the two square tiles, lifted from the .hp-bg-squares data-URIs so the
        canvas renders the exact same scatter the CSS layer did ── */
  var CELL = 62;
  var TILE_A = { size: 372, at: [[186,310,.112],[248,0,.076],[124,62,.097],[248,124,.066],
                                [62,62,.069],[62,0,.074],[62,124,.05],[186,0,.057],[0,0,.102]] };
  var TILE_B = { size: 558, off: 31,
                 at: [[372,0,.09],[372,62,.063],[310,310,.044],[496,310,.053],[186,0,.078],
                      [496,372,.041],[186,434,.062],[248,496,.077],[0,62,.048],[248,124,.075],
                      [124,0,.09],[434,62,.048],[310,186,.063],[310,124,.078],[372,186,.059],[62,0,.054]] };

  var R = 200;       // cursor influence radius
  var PUSH = 86;     // peak displacement, px — must exceed CELL so cells
                     // genuinely clear the pointer rather than just swell

  /* ── canvas ── */
  var cv = document.createElement('canvas');
  cv.className = 'hp-bg-canvas';
  cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  var ctx = cv.getContext('2d');
  var dpr = 1, vw = 0, vh = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth; vh = window.innerHeight;
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    cv.style.width = vw + 'px'; cv.style.height = vh + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  /* ── cursor ── */
  var cur = document.createElement('div');
  cur.className = 'hp-cursor';
  cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<span class="glow"></span><span class="ring"></span>';
  document.body.appendChild(cur);

  var mx = -9999, my = -9999;          // raw pointer
  var sx = -9999, sy = -9999;          // smoothed, drives the field + ring
  var inside = false, over = false;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!inside) { sx = mx; sy = my; inside = true; }   // no swoop on entry
    over = !!(e.target && e.target.closest && e.target.closest('a,button'));
  }, { passive: true });

  document.addEventListener('mouseleave', function () { inside = false; mx = my = -9999; }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });

  /* squares fade out toward the foot of the page, matching the CSS mask */
  function depth(docY) {
    var h = document.documentElement.scrollHeight || 1;
    var t = docY / h;
    return t < 0.58 ? 1 : 1 - ((t - 0.58) / 0.42) * 0.68;
  }

  function drawTile(tile, scrollY) {
    var size = tile.size, off = tile.off || 0;
    var startX = -(((scrollX_ + off) % size) + size) % size;
    var startY = -(((scrollY + off) % size) + size) % size;
    for (var ty = startY; ty < vh + size; ty += size) {
      for (var tx = startX; tx < vw + size; tx += size) {
        for (var i = 0; i < tile.at.length; i++) {
          var s = tile.at[i];
          var x = tx + s[0], y = ty + s[1], a = s[2];
          if (x < -CELL - PUSH || x > vw + PUSH || y < -CELL - PUSH || y > vh + PUSH) continue;

          var cxp = x + CELL / 2, cyp = y + CELL / 2;
          var dx = cxp - sx, dy = cyp - sy;
          var d = Math.sqrt(dx * dx + dy * dy);
          var ox = 0, oy = 0, rot = 0, sc = 1, boost = 1;

          if (inside && d < R) {
            // gentler-than-quadratic falloff: keeps cells moving further out,
            // so the whole neighbourhood scatters instead of only the centre
            var f = Math.pow(1 - d / R, 1.35);
            var inv = d > 0.001 ? 1 / d : 0;
            ox = dx * inv * PUSH * f;
            oy = dy * inv * PUSH * f;
            // deterministic per-square jitter so it scatters rather than bulges
            var j = ((s[0] * 7 + s[1] * 13) % 17) / 17 - 0.5;
            rot = f * j * 1.9;          // tumble as they fly out
            sc = 1 - f * 0.18;          // shrink slightly, reads as receding
            boost = 1 + f * 0.35;       // only a touch brighter — the MOVE is the effect
          }

          var alpha = a * boost * depth(scrollY + y);
          if (alpha <= 0.004) continue;
          ctx.save();
          ctx.translate(cxp + ox, cyp + oy);
          if (rot) ctx.rotate(rot);
          if (sc !== 1) ctx.scale(sc, sc);
          ctx.fillStyle = 'rgba(232,163,61,' + Math.min(alpha, 0.5).toFixed(4) + ')';
          ctx.fillRect(-CELL / 2, -CELL / 2, CELL, CELL);
          ctx.restore();
        }
      }
    }
  }

  var scrollX_ = 0;

  function frame() {
    // ease the field toward the pointer — gives the scatter its trailing feel
    if (inside) { sx += (mx - sx) * 0.18; sy += (my - sy) * 0.18; }

    var scrollY = window.scrollY || 0;
    scrollX_ = window.scrollX || 0;
    ctx.clearRect(0, 0, vw, vh);

    // static 62px lattice
    ctx.fillStyle = 'rgba(199,150,62,0.17)';
    var gx = -(((scrollX_) % CELL) + CELL) % CELL;
    for (var x = gx; x < vw; x += CELL) ctx.fillRect(Math.round(x), 0, 1, vh);
    var gy = -(((scrollY) % CELL) + CELL) % CELL;
    for (var y = gy; y < vh; y += CELL) ctx.fillRect(0, Math.round(y), vw, 1);

    // the cell the cursor is in, gently lit
    if (inside) {
      var cxc = Math.floor((sx + scrollX_) / CELL) * CELL - scrollX_;
      var cyc = Math.floor((sy + scrollY) / CELL) * CELL - scrollY;
      ctx.fillStyle = 'rgba(232,163,61,0.06)';
      ctx.fillRect(cxc, cyc, CELL, CELL);
    }

    drawTile(TILE_A, scrollY);
    drawTile(TILE_B, scrollY);

    // cursor
    if (inside) {
      cur.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      cur.style.opacity = '1';
      cur.classList.toggle('is-over', over);
    } else {
      cur.style.opacity = '0';
    }

    requestAnimationFrame(frame);
  }

  root.classList.add('js-bgfx');    // swaps the CSS texture out for the canvas
  root.classList.add('js-cursor');  // only now is the native arrow hidden
  requestAnimationFrame(frame);
})();

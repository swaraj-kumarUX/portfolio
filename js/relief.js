/* ===========================================================
   Plaster bas-relief garden — hero backdrop.
   Procedural vines, blossoms and leaves rendered as SVG whose
   fill matches the wall; only light (top-left) and shadow
   (bottom-right) reveal the form. Three depth layers drift
   with the mouse for a sculptural parallax.
   =========================================================== */
(function () {
  const host = document.getElementById('relief');
  if (!host) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const NS = 'http://www.w3.org/2000/svg';
  const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };

  const svg = el('svg', { viewBox: '0 0 1440 900', preserveAspectRatio: 'xMidYMid slice' });
  svg.style.width = '100%'; svg.style.height = '100%';
  host.appendChild(svg);

  // relief shading: same tone as the wall, form comes from light + shadow
  const style = el('style', {});
  style.textContent = `
    .rf { fill: #e8e8e8; }
    .rs { fill: none; stroke: #e8e8e8; stroke-linecap: round; }
    .layer { filter:
      drop-shadow(1.6px 2.2px 1.6px rgba(40,36,30,0.38))
      drop-shadow(-1.4px -1.8px 1.4px rgba(255,255,255,0.9)); }
    .layer.far { filter:
      drop-shadow(1px 1.4px 1.2px rgba(40,36,30,0.22))
      drop-shadow(-0.8px -1px 1px rgba(255,255,255,0.7)); }
  `;
  svg.appendChild(style);

  // deterministic pseudo-random so composition is stable
  let seed = 21;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const rr = (a, b) => a + (b - a) * rnd();

  const layers = [
    el('g', { class: 'layer far',  'data-depth': '0.35' }),
    el('g', { class: 'layer',      'data-depth': '0.7'  }),
    el('g', { class: 'layer near', 'data-depth': '1.1'  }),
  ];
  layers.forEach((l) => svg.appendChild(l));

  const grp = (parent, x, y, rot, s) => {
    const g = el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` });
    parent.appendChild(g); return g;
  };

  /* ---- motifs ---- */
  function leaf(p, len, wid) {
    p.appendChild(el('path', { class: 'rf', d:
      `M0 0 C ${wid} ${-len * 0.22}, ${wid * 0.7} ${-len * 0.72}, 0 ${-len}
       C ${-wid * 0.7} ${-len * 0.72}, ${-wid} ${-len * 0.22}, 0 0 Z` }));
    p.appendChild(el('path', { class: 'rs', 'stroke-width': 1.4, d: `M0 -4 L 0 ${-len + 6}` }));
  }
  function blossom(p, R, petals) {
    for (let i = 0; i < petals; i++)
      p.appendChild(el('ellipse', { class: 'rf', cx: 0, cy: -R * 0.58, rx: R * 0.26, ry: R * 0.52,
        transform: `rotate(${(i * 360) / petals} 0 0)` }));
    p.appendChild(el('circle', { class: 'rf', cx: 0, cy: 0, r: R * 0.26 }));
    p.appendChild(el('circle', { class: 'rf', cx: 0, cy: 0, r: R * 0.11 }));
  }
  function bud(p, L) {
    p.appendChild(el('path', { class: 'rf', d:
      `M0 0 C ${L * 0.4} ${-L * 0.2}, ${L * 0.4} ${-L * 0.8}, 0 ${-L}
       C ${-L * 0.4} ${-L * 0.8}, ${-L * 0.4} ${-L * 0.2}, 0 0 Z` }));
  }
  function sprigCluster(p, R) {
    [[0,0],[-0.55,-0.2],[0.55,-0.2],[-0.3,0.42],[0.3,0.42],[0,-0.58],[-0.62,0.22],[0.62,0.22]].forEach((o) => {
      p.appendChild(el('circle', { class: 'rf', cx: o[0] * R, cy: o[1] * R, r: R * 0.2 }));
      p.appendChild(el('circle', { class: 'rf', cx: o[0] * R, cy: o[1] * R, r: R * 0.07 }));
    });
  }

  /* ---- bezier helpers ---- */
  const bz = (P, t) => { const u = 1 - t; return [
    u*u*u*P[0][0] + 3*u*u*t*P[1][0] + 3*u*t*t*P[2][0] + t*t*t*P[3][0],
    u*u*u*P[0][1] + 3*u*u*t*P[1][1] + 3*u*t*t*P[2][1] + t*t*t*P[3][1]]; };
  const bang = (P, t) => { const u = 1 - t;
    const dx = 3*u*u*(P[1][0]-P[0][0]) + 6*u*t*(P[2][0]-P[1][0]) + 3*t*t*(P[3][0]-P[2][0]);
    const dy = 3*u*u*(P[1][1]-P[0][1]) + 6*u*t*(P[2][1]-P[1][1]) + 3*t*t*(P[3][1]-P[2][1]);
    return Math.atan2(dy, dx) * 180 / Math.PI; };

  function vine(parent, P, w) {
    parent.appendChild(el('path', { class: 'rs', 'stroke-width': w,
      d: `M${P[0][0]} ${P[0][1]} C ${P[1][0]} ${P[1][1]}, ${P[2][0]} ${P[2][1]}, ${P[3][0]} ${P[3][1]}` }));
  }

  function branch(parent, P, leaves, tip, scale) {
    vine(parent, P, 6 * scale);
    for (let k = 1; k <= leaves; k++) {
      const t = k / (leaves + 1), pt = bz(P, t), a = bang(P, t), side = k % 2 ? 1 : -1;
      leaf(grp(parent, pt[0], pt[1], a + 90 + side * 55, (0.8 + rr(0, 0.4)) * scale), 42, 17);
      if (k % 3 === 0) bud(grp(parent, pt[0], pt[1], a + 90 - side * 40, 0.6 * scale), 36);
    }
    const e = bz(P, 1), g = grp(parent, e[0], e[1], bang(P, 1) + 90, scale);
    if (tip === 'blossom') blossom(g, 46, 6 + Math.floor(rr(0, 3)));
    else if (tip === 'cluster') sprigCluster(g, 38);
    else bud(g, 44);
  }

  /* ---- composition: corners busy, centre calm for the headline ---- */
  const compose = [
    // far layer — small sprigs scattered high
    { L: 0, items: [
      [[150, 260], 'cluster', 0.5], [[420, 150], 'bud', 0.45], [[1050, 170], 'cluster', 0.5],
      [[1310, 300], 'bud', 0.45], [[720, 120], 'blossom', 0.4],
    ]},
    // mid layer — corner vines
    { L: 1, items: [
      [[130, 760], 'blossom', 0.85], [[1310, 740], 'blossom', 0.85],
      [[260, 200], 'blossom', 0.7], [[1180, 220], 'cluster', 0.7],
    ]},
    // near layer — two large anchor vines low left / low right
    { L: 2, items: [
      [[80, 900], 'blossom', 1.15], [[1360, 900], 'blossom', 1.1],
      [[520, 880], 'cluster', 0.8], [[930, 880], 'bud', 0.8],
    ]},
  ];

  compose.forEach(({ L, items }) => {
    items.forEach(([pos, tip, s]) => {
      const [x, y] = pos;
      const lift = 260 * s, sway = rr(-90, 90);
      branch(layers[L],
        [[x, y], [x + sway * 0.4, y - lift * 0.4], [x - sway * 0.4, y - lift * 0.75], [x + sway * 0.2, y - lift]],
        4 + Math.floor(rr(0, 3)), tip, s);
    });
  });

  /* ---- mouse parallax (gentle, eased) ---- */
  if (reduced) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('mousemove', (e) => {
    tx = (e.clientX / innerWidth - 0.5);
    ty = (e.clientY / innerHeight - 0.5);
  });
  (function drift() {
    cx += (tx - cx) * 0.04;
    cy += (ty - cy) * 0.04;
    layers.forEach((l) => {
      const d = parseFloat(l.dataset.depth);
      l.setAttribute('transform', `translate(${(-cx * 22 * d).toFixed(2)} ${(-cy * 14 * d).toFixed(2)})`);
    });
    requestAnimationFrame(drift);
  })();
})();

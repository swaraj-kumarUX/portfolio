/* ===========================================================
   Interactions — dot cursor, intro fade, staggered reveals,
   0.7s page-fade transitions, work filters, form feedback.
   =========================================================== */
'use strict';

/* ── Intro loader (plays once per session) ────────────────── */
(function () {
  const intro = document.getElementById('intro');
  const seen = sessionStorage.getItem('introSeen') || location.hash;
  if (!intro || seen) {
    intro?.remove();
    document.body.classList.remove('loading');
    requestAnimationFrame(() => document.body.classList.add('ready'));
    return;
  }
  window.addEventListener('load', () => {
    setTimeout(() => {
      intro.classList.add('done');
      document.body.classList.remove('loading');
      document.body.classList.add('ready');
      sessionStorage.setItem('introSeen', '1');
    }, 1600);
  });
})();

/* ── Dot cursor ───────────────────────────────────────────── */
const dot = document.querySelector('.cursor-dot');
if (dot && matchMedia('(hover: hover)').matches) {
  addEventListener('mousemove', (e) => {
    dot.classList.add('live');
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, input, textarea, .piece').forEach((n) => {
    n.addEventListener('mouseenter', () => dot.classList.add('grow'));
    n.addEventListener('mouseleave', () => dot.classList.remove('grow'));
  });
}

/* ── Staggered fade reveals ───────────────────────────────── */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add('in'); });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade, .rule').forEach((n) => io.observe(n));

/* ── Page fade transition (0.7s veil, like the reference) ─── */
const veil = document.getElementById('page-veil');
document.querySelectorAll('a[href]').forEach((link) => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel')
      || link.target === '_blank' || href.toLowerCase().endsWith('.pdf')) return;
  link.addEventListener('click', (e) => {
    if (!veil) return;
    e.preventDefault();
    veil.classList.add('on');
    setTimeout(() => { location.href = href; }, 650);
  });
});

/* ── Work filters ─────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards = document.querySelectorAll('.work-card');
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    workCards.forEach((card) => {
      const show = f === 'all' || card.dataset.category === f;
      card.style.opacity = show ? '' : '0';
      card.style.transform = show ? '' : 'scale(0.98)';
      setTimeout(() => { card.style.display = show ? '' : 'none'; }, show ? 0 : 450);
      if (show) card.style.display = '';
    });
  });
});

/* ── Contact form ─────────────────────────────────────────── */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-send');
    const original = btn.textContent;
    btn.textContent = 'Message sent';
    form.reset();
    setTimeout(() => { btn.textContent = original; }, 3000);
  });
}

/* ── Active nav link ──────────────────────────────────────── */
const here = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.frame a').forEach((a) => {
  if (a.getAttribute('href') === here) a.classList.add('active');
});

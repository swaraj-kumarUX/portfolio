/* ── Image lightbox — click any case-study image to expand ─── */
'use strict';

(function () {
  const lightbox = document.getElementById('ns-lightbox');
  const lbImg = document.getElementById('ns-lightbox-img');
  const lbCaption = document.getElementById('ns-lightbox-caption');
  const closeBtn = document.getElementById('ns-lightbox-close');
  if (!lightbox || !lbImg) return;

  let lastFocused = null;

  function open(src, alt) {
    lastFocused = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbCaption.textContent = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
    if (lastFocused) lastFocused.focus();
  }

  const selector = '.ns-shot img, .ns-research-photo img, .ns-strip-item img, .ns-concept-shot img';
  document.querySelectorAll(selector).forEach((img) => {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.addEventListener('click', () => open(img.currentSrc || img.src, img.alt));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img.currentSrc || img.src, img.alt); }
    });
  });

  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  lbImg.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('open')) close(); });
})();

/* ── Home page — scroll reveals ─────────────────────────────── */
'use strict';

(function () {
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // leave content statically visible, no JS-driven animation

  document.documentElement.classList.add('js-reveal');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.hp-fade').forEach(function (n) { io.observe(n); });
})();

/* ── Contact form — composes a real mailto: draft ───────────
   There is no backend, so rather than fake a send, hand the
   message to the visitor's mail client with everything filled
   in. Native validation runs first (no `novalidate` on the
   form), so this only fires on a valid submit.            */
(function () {
  var form = document.getElementById('hp-contact-form');
  if (!form) return;

  var TO = 'swaraj.kumar0103@gmail.com';

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name    = form.elements.name.value.trim();
    var email   = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();

    var subject = 'Portfolio enquiry from ' + name;
    var body    = message + '\n\n—\n' + name + '\n' + email;

    var btn = form.querySelector('.hp-form-send');
    if (btn) {
      var original = btn.innerHTML;
      btn.innerHTML = 'Opening your mail app…';
      setTimeout(function () { btn.innerHTML = original; }, 3200);
    }

    window.location.href = 'mailto:' + TO +
      '?subject=' + encodeURIComponent(subject) +
      '&body='    + encodeURIComponent(body);
  });
})();

/* ── "Why should you hire me?" video popup ──────────────────
   Progressive enhancement: the link points straight at the mp4, so
   without JS it still opens. Closes on backdrop click, the close
   button, or Escape; the video is paused and rewound on close so it
   never keeps playing out of sight.                              */
(function () {
  var open = document.getElementById('hp-video-open');
  var modal = document.getElementById('hp-video');
  if (!open || !modal) return;

  var video = modal.querySelector('#hp-video-el');
  var closeBtn = modal.querySelector('.hp-video-close');
  var lastFocused = null;

  function show(e) {
    if (e) e.preventDefault();
    // Safari doesn't focus a link on click, so fall back to the trigger
    lastFocused = (document.activeElement && document.activeElement !== document.body)
      ? document.activeElement : open;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    var p = video.play();
    if (p && p.catch) p.catch(function () {});   // autoplay blocked: controls are there
  }

  function hide() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    video.pause();
    video.currentTime = 0;
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  open.addEventListener('click', show);
  closeBtn.addEventListener('click', hide);

  // anything outside the play area — the backdrop, or the padding around it
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.hasAttribute('data-close')) hide();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) hide();
  });

  // keep focus inside the dialog while it is open
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var items = [closeBtn, video];
    var i = items.indexOf(document.activeElement);
    e.preventDefault();
    items[(i + (e.shiftKey ? items.length - 1 : 1)) % items.length].focus();
  });
})();

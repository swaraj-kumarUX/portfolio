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

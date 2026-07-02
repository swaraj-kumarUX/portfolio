/* ============================================================
   SWARAJ KUMAR — Portfolio JS
   Apple-inspired interactions & animations
   ============================================================ */

'use strict';

/* ── Preloader ─────────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('done');
      document.body.classList.remove('loading');
      // Trigger hero animations
      initHero();
    }
  }, 2000);
});

function initHero() {
  // Reveal hero words with stagger
  const words = document.querySelectorAll('.hero-title .word');
  words.forEach((word, i) => {
    word.style.animationDelay = `${2.1 + i * 0.12}s`;
  });
}

/* ── Custom Cursor ─────────────────────────────────────────── */
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX   = 0, ringY   = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (cursorDot) {
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  }
});

// Smooth ring follow
function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;

  if (cursorRing) {
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
  }
  requestAnimationFrame(animateRing);
}
animateRing();

// Hover states
const hoverEls = document.querySelectorAll(
  'a, button, .project-card, .filter-btn, .social-link, .nav-logo, [data-cursor]'
);

hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorRing?.classList.add('hovered');
    cursorDot?.style.setProperty('transform', 'translate(-50%,-50%) scale(2)');
  });
  el.addEventListener('mouseleave', () => {
    cursorRing?.classList.remove('hovered');
    cursorDot?.style.setProperty('transform', 'translate(-50%,-50%) scale(1)');
  });
});

document.addEventListener('mousedown', () => cursorRing?.classList.add('clicking'));
document.addEventListener('mouseup',   () => cursorRing?.classList.remove('clicking'));

/* ── Scroll Progress Bar ───────────────────────────────────── */
const progressBar = document.getElementById('scroll-progress');

function updateProgress() {
  if (!progressBar) return;
  const scrollTop   = window.scrollY;
  const docHeight   = document.documentElement.scrollHeight - window.innerHeight;
  const progress    = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = progress + '%';
}

/* ── Navbar ────────────────────────────────────────────────── */
const nav = document.querySelector('nav');
let lastScroll = 0;

function updateNav() {
  const scrollY = window.scrollY;

  if (scrollY > 60) {
    nav?.classList.add('scrolled');
  } else {
    nav?.classList.remove('scrolled');
  }

  // Hide/show on direction
  if (scrollY > lastScroll && scrollY > 200) {
    nav?.classList.add('hidden');
  } else {
    nav?.classList.remove('hidden');
  }

  lastScroll = scrollY;
}

/* ── Intersection Observer (Reveal on Scroll) ──────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');

      // Animate skill bars inside
      entry.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.width || '0%';
      });
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, .reveal-scale'
).forEach(el => revealObserver.observe(el));

/* ── Counter Animation ─────────────────────────────────────── */
function animateCounter(el, target, suffix = '') {
  const duration = 1800;
  const start    = performance.now();
  const startVal = 0;

  function update(timestamp) {
    const elapsed  = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 4); // ease out quart
    const current  = Math.floor(startVal + (target - startVal) * eased);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = true;
      const target = parseInt(entry.target.dataset.target);
      const suffix = entry.target.dataset.suffix || '';
      animateCounter(entry.target, target, suffix);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

/* ── Scroll Handler ────────────────────────────────────────── */
function onScroll() {
  updateProgress();
  updateNav();
  updateParallax();
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ── Parallax ──────────────────────────────────────────────── */
function updateParallax() {
  const scrollY = window.scrollY;

  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.3;
    el.style.transform = `translateY(${scrollY * speed}px)`;
  });

  // Hero orbs
  document.querySelectorAll('.hero-orb').forEach((orb, i) => {
    const speed = [0.08, -0.06, 0.04][i] || 0.05;
    orb.style.transform = `translateY(${scrollY * speed}px)`;
  });
}

/* ── Magnetic Buttons ──────────────────────────────────────── */
document.querySelectorAll('.btn, .nav-cta').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect   = btn.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) * 0.25;
    const dy     = (e.clientY - cy) * 0.25;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ── Project Card Tilt ─────────────────────────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / rect.width;
    const dy     = (e.clientY - cy) / rect.height;
    const rotX   = dy * -6;
    const rotY   = dx *  6;
    card.style.transform = `
      translateY(-8px)
      perspective(1000px)
      rotateX(${rotX}deg)
      rotateY(${rotY}deg)
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.6s var(--ease-expo), box-shadow 0.6s var(--ease-expo)';
  });
});

/* ── Work Page Filter ──────────────────────────────────────── */
const filterBtns  = document.querySelectorAll('.filter-btn');
const workCards   = document.querySelectorAll('.work-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    workCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.opacity = '';
        card.style.transform = '';
        card.style.display = '';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (filter !== 'all' && card.dataset.category !== filter) {
            card.style.display = 'none';
          }
        }, 400);
      }
    });
  });
});

/* ── Contact Form ──────────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    btn.textContent = 'Message Sent ✓';
    btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
    btn.style.boxShadow  = '0 8px 30px rgba(74, 222, 128, 0.3)';
    contactForm.reset();
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.style.boxShadow  = '';
    }, 3000);
  });
}

/* ── Active Nav Link ───────────────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-links a');
const page     = window.location.pathname.split('/').pop() || 'index.html';

navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href === page || (page === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ── Page Transition ───────────────────────────────────────── */
document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  // skip anchors, mailto/tel, new-tab links, downloads and PDFs (let the browser handle them)
  if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel')
      || link.target === '_blank' || link.hasAttribute('download')
      || href.toLowerCase().endsWith('.pdf')) return;

  link.addEventListener('click', (e) => {
    e.preventDefault();
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: #000;
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      setTimeout(() => { window.location.href = href; }, 400);
    });
  });
});

/* ── Smooth Scroll for anchor links ───────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loading');
  updateProgress();
  updateNav();

  // Stagger reveal for cards
  document.querySelectorAll('.project-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.08}s`;
  });
});

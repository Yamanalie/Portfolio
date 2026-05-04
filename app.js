/* ═══════════════════════════════════════════════════════════════
   yamanalie · js/app.js  v3
   Vanilla JS + in-browser Babel · no Node required
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initCustomCursor();
  initHeader();
  initHeroReveal();
  initScrollReveal();
  initParallax();
  initCarousel();
  initFilterTabs();
  initCardTilt();
  initMagneticButtons();
  initHapticButtons();
  initThemeToggle();
  initLangToggle();
  initHamburger();
  initModals();
  initBlurUpImages();
  initSmoothScroll();
});


/* ═══════════════════════════════════════════════════════════════
   1 · SCROLL PROGRESS BAR
═══════════════════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}


/* ═══════════════════════════════════════════════════════════════
   2 · CUSTOM CURSOR — soft circle, near-natural movement
       lerp factor 0.55 = almost 1:1 with mouse, tiny lag only on ring
═══════════════════════════════════════════════════════════════ */
function initCustomCursor() {
  if (window.matchMedia('(hover: none)').matches) return;
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  const dot  = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');

  let mx = -300, my = -300; // mouse target
  let dx = -300, dy = -300; // dot position  (fast)
  let rx = -300, ry = -300; // ring position (slightly behind)

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    /* Dot follows mouse almost instantly */
    dx = lerp(dx, mx, 0.55);
    dy = lerp(dy, my, 0.55);

    /* Ring follows with a small, natural lag */
    rx = lerp(rx, mx, 0.28);
    ry = lerp(ry, my, 0.28);

    /* Move the whole cursor wrapper to dot position */
    cursor.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;

    /* Offset ring relative to cursor wrapper so it trails slightly */
    if (ring) {
      ring.style.transform = `translate(calc(-50% + ${rx - dx}px), calc(-50% + ${ry - dy}px))`;
    }

    requestAnimationFrame(tick);
  }

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { mx = -300; my = -300; });

  /* State classes */
  document.querySelectorAll('.project-card, .resource-card')
    .forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-on-card'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on-card'));
    });

  document.querySelectorAll('a, button, .filter-tab, .nav-link, .social-link, .mobile-link')
    .forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-on-link'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on-link'));
    });

  tick();
}


/* ═══════════════════════════════════════════════════════════════
   3 · STICKY HEADER
═══════════════════════════════════════════════════════════════ */
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ═══════════════════════════════════════════════════════════════
   4 · HERO HEADLINE REVEAL
═══════════════════════════════════════════════════════════════ */
function initHeroReveal() {
  const lines = document.querySelectorAll('.headline-line');
  setTimeout(() => lines.forEach(l => l.classList.add('in')), 100);

  const extras = document.querySelectorAll(
    '.hero-eyebrow, .hero-sub, .hero-cta-row, .hero-badge'
  );
  extras.forEach((el, i) => setTimeout(() => el.classList.add('in'), 280 + i * 110));
}


/* ═══════════════════════════════════════════════════════════════
   5 · SCROLL REVEAL (IntersectionObserver)
═══════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-item, .reveal-card, .reveal-line');
  if (!targets.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

  targets.forEach(el => obs.observe(el));
}


/* ═══════════════════════════════════════════════════════════════
   6 · PARALLAX — card images
═══════════════════════════════════════════════════════════════ */
function initParallax() {
  if (window.matchMedia('(hover: none)').matches) return;
  const wraps = document.querySelectorAll('.card-img-wrap');
  if (!wraps.length) return;

  const update = () => {
    wraps.forEach(wrap => {
      const rect  = wrap.getBoundingClientRect();
      const ratio = (rect.top + rect.height / 2 - window.innerHeight / 2) / (window.innerHeight / 2);
      const img   = wrap.querySelector('.card-img');
      if (img) img.style.transform = `translateY(${ratio * 8}px)`;
    });
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}


/* ═══════════════════════════════════════════════════════════════
   7 · HERO CAROUSEL — infinite vertical auto-scroll
═══════════════════════════════════════════════════════════════ */
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  /* Duplicate cards for seamless loop */
  const originals = Array.from(track.children);
  originals.forEach(card => track.appendChild(card.cloneNode(true)));

  const BASE_DURATION = 18;
  let currentDuration = BASE_DURATION;

  const updateSpeed = () => {
    const scrollFraction = Math.min(
      window.scrollY / (document.body.scrollHeight - window.innerHeight), 1
    );
    const newDuration = BASE_DURATION - scrollFraction * 10;
    if (Math.abs(newDuration - currentDuration) > 0.3) {
      currentDuration = newDuration;
      track.style.animationDuration = currentDuration + 's';
    }
  };

  window.addEventListener('scroll', updateSpeed, { passive: true });

  const carousel = document.getElementById('heroCarousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    carousel.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  }
}


/* ═══════════════════════════════════════════════════════════════
   8 · FILTER TABS
═══════════════════════════════════════════════════════════════ */
function initFilterTabs() {
  const tabs  = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.project-card');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      cards.forEach((card, i) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('filtered-out', !match);
        card.classList.remove('in');
        if (match) setTimeout(() => card.classList.add('in'), 40 + i * 60);
      });
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   9 · 3D CARD TILT
═══════════════════════════════════════════════════════════════ */
function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(800px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s cubic-bezier(0.22,1,0.36,1)';
      card.style.transform  = '';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   10 · MAGNETIC BUTTONS (50px radius)
═══════════════════════════════════════════════════════════════ */
function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r    = btn.getBoundingClientRect();
      const dx   = e.clientX - (r.left + r.width  / 2);
      const dy   = e.clientY - (r.top  + r.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 50) {
        const s = (1 - dist / 50) * 0.42;
        btn.style.transform = `translate(${dx * s}px, ${dy * s}px)`;
      }
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}


/* ═══════════════════════════════════════════════════════════════
   11 · HAPTIC BUTTON FEEDBACK
═══════════════════════════════════════════════════════════════ */
function initHapticButtons() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.style.transition = 'transform .08s ease';
      btn.style.transform  = 'scale(0.95)';
      setTimeout(() => {
        btn.style.transition = 'transform .4s cubic-bezier(0.34,1.56,0.64,1)';
        btn.style.transform  = 'scale(1)';
      }, 80);
      setTimeout(() => {
        btn.style.transition = '';
        btn.style.transform  = '';
      }, 500);
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   12 · THEME TOGGLE
═══════════════════════════════════════════════════════════════ */
function initThemeToggle() {
  const saved = localStorage.getItem('ya-theme') || 'dark';
  applyTheme(saved);

  ['themeToggle', 'mobileThemeToggle'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  });

  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    localStorage.setItem('ya-theme', t);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = t === 'dark' ? '◑' : '◐';
  }
}


/* ═══════════════════════════════════════════════════════════════
   13 · LANGUAGE TOGGLE — full data-en / data-ar swap
═══════════════════════════════════════════════════════════════ */
function initLangToggle() {
  const saved = localStorage.getItem('ya-lang') || 'en';
  applyLang(saved, false);

  ['langToggle', 'mobileLangToggle'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      applyLang(document.documentElement.dataset.lang === 'en' ? 'ar' : 'en', true);
    });
  });

  function applyLang(lang, animate) {
    if (animate) {
      document.body.classList.add('lang-out');
      setTimeout(() => {
        swapLang(lang);
        document.body.classList.remove('lang-out');
      }, 130);
    } else {
      swapLang(lang);
    }
  }

  function swapLang(lang) {
    document.documentElement.dataset.lang = lang;
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('ya-lang', lang);

    const label = document.getElementById('langLabel');
    if (label) label.textContent = lang === 'en' ? 'EN' : 'AR';

    const mLabel = document.getElementById('mobileLangToggle');
    if (mLabel) mLabel.textContent = lang === 'en' ? 'EN / AR' : 'AR / EN';

    /* Swap all data-en / data-ar text nodes */
    const attr = `data-${lang}`;
    document.querySelectorAll('[data-en], [data-ar]').forEach(el => {
      const val = el.getAttribute(attr);
      if (val === null) return;

      if (el.children.length === 0) {
        el.textContent = val;
      } else {
        const inner = el.querySelector('.btn-text');
        if (inner) {
          inner.textContent = val;
        } else if (el.childNodes.length && el.childNodes[0].nodeType === 3) {
          el.childNodes[0].textContent = val;
        }
      }
    });
  }
}


/* ═══════════════════════════════════════════════════════════════
   14 · HAMBURGER / MOBILE MENU
═══════════════════════════════════════════════════════════════ */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('mobileMenu');
  const overlay   = document.getElementById('mobileOverlay');
  const closeBtn  = document.getElementById('mobileMenuClose');
  if (!hamburger || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    overlay?.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    overlay?.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () =>
    menu.classList.contains('open') ? closeMenu() : openMenu()
  );

  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });
}


/* ═══════════════════════════════════════════════════════════════
   15 · MODALS
═══════════════════════════════════════════════════════════════ */
function initModals() {
  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => el.querySelector('button, a, input')?.focus(), 100);
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = true;
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay:not([hidden])').forEach(ov => closeModal(ov.id));
  });
  /* Resource download buttons */
  document.querySelectorAll('.resource-download-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal('downloadModal'));
  });
  /* Download form submit */
  document.getElementById('downloadForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('downloadEmail')?.value;
    if (!email) return;
    document.getElementById('downloadForm').innerHTML = `
      <div style="text-align:center;padding:24px 0;">
        <div style="font-size:2.5rem;color:var(--accent);margin-bottom:14px;">✓</div>
        <p style="font-weight:700;margin-bottom:8px;">You're on the list!</p>
        <p style="color:var(--fg-2);font-size:13px;line-height:1.6;">
          Check <strong>${email}</strong> — the pack is on its way.
        </p>
      </div>`;
  });
}
  function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = true;
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay:not([hidden])').forEach(ov => closeModal(ov.id));
  });
  /* Resource download buttons */
  document.querySelectorAll('.resource-download-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal('downloadModal'));
  });
  /* Download form submit */
  document.getElementById('downloadForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('downloadEmail')?.value;
    if (!email) return;
    document.getElementById('downloadForm').innerHTML = ;
  });
}

  function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });

  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); });
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay:not([hidden])').forEach(ov => closeModal(ov.id));
  });

  /* "Start a Project" → auth gate */
  document.getElementById('openInquiryBtn')?.addEventListener('click', () => {
    openModal('authGateOverlay');
  });

  /* Intercept #contact links */
  document.querySelectorAll('a[href="#contact"]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); openModal('authGateOverlay'); });
  });

  /* Continue as guest */
  document.getElementById('continueGuestBtn')?.addEventListener('click', () => {
    closeModal('authGateOverlay');
    openModal('inquiryModal');
  });

  /* Resource download buttons */
  document.querySelectorAll('.resource-download-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal('downloadModal'));
  });

  /* Download form submit */
  document.getElementById('downloadForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('downloadEmail')?.value;
    if (!email) return;
    document.getElementById('downloadForm').innerHTML = `
      <div style="text-align:center;padding:24px 0;">
        <div style="font-size:2.5rem;color:var(--accent);margin-bottom:14px;">✓</div>
        <p style="font-weight:700;margin-bottom:8px;">You're on the list!</p>
        <p style="color:var(--fg-2);font-size:13px;line-height:1.6;">
          Check <strong>${email}</strong> — the pack is on its way.
        </p>
      </div>`;
  });
}


 /* ═══════════════════════════════════════════════════════════════
   17 · BLUR-UP IMAGE LOADING
═══════════════════════════════════════════════════════════════ */
function initBlurUpImages() {
  document.querySelectorAll('.card-img').forEach(img => {
    const blur = img.closest('.card-img-wrap')?.querySelector('.card-img-blur');
    img.classList.add('loading');

    const onLoad = () => {
      img.classList.remove('loading');
      img.classList.add('loaded');
      blur?.classList.add('hidden');
      setTimeout(() => blur?.remove(), 700);
    };

    if (img.complete && img.naturalWidth > 0) onLoad();
    else {
      img.addEventListener('load',  onLoad);
      img.addEventListener('error', () => {
        img.classList.remove('loading');
        if (blur) blur.style.opacity = '.3';
      });
    }
  });
}


/* ═══════════════════════════════════════════════════════════════
   18 · SMOOTH SCROLL for anchor links
═══════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href   = a.getAttribute('href');
      const target = document.querySelector(href);
      if (!target) return;
      if (href === '#contact') return; /* handled by modal */
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


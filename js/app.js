/* ════════════════════════════════════════════════════════════════
   yamanalie · js/app.js
   In-browser Babel · window.FramerMotion available but we use
   CSS-class-based reveals + vanilla JS for all interactions.
   Framer Motion is used for modal entrance animations.
   ════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   WAIT FOR DOM
───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  initScrollProgress();
  initCustomCursor();
  initHeader();
  initHeroReveal();
  initScrollReveal();
  initParallax();
  initFilterTabs();
  initCardTilt();
  initMagneticButtons();
  initThemeToggle();
  initLangToggle();
  initHamburger();
  initModals();
  initInquiryForm();
  initBlurUpImages();
  initHapticButtons();

});


/* ════════════════════════════════════════════════════════════════
   1 · SCROLL PROGRESS BAR
════════════════════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  function update() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}


/* ════════════════════════════════════════════════════════════════
   2 · CUSTOM CURSOR
════════════════════════════════════════════════════════════════ */
function initCustomCursor() {
  // Only on pointer devices
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  let mouseX = -200, mouseY = -200;
  let curX   = -200, curY   = -200;
  let raf;

  // Smooth lerp follow
  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    curX = lerp(curX, mouseX, 0.14);
    curY = lerp(curY, mouseY, 0.14);
    cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
    raf = requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouseX = -200;
    mouseY = -200;
  });

  // State classes
  const cardSelectors    = '.project-card, .process-card, .resource-card';
  const linkSelectors    = 'a, button, .filter-tab, .nav-link, .social-link';

  document.querySelectorAll(cardSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-on-card'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on-card'));
  });

  document.querySelectorAll(linkSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-on-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on-link'));
  });

  animate();
}


/* ════════════════════════════════════════════════════════════════
   3 · STICKY HEADER — add .scrolled class
════════════════════════════════════════════════════════════════ */
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ════════════════════════════════════════════════════════════════
   4 · HERO HEADLINE REVEAL (line-by-line mask)
════════════════════════════════════════════════════════════════ */
function initHeroReveal() {
  // Trigger immediately — small delay for page paint
  const lines = document.querySelectorAll('.headline-line');

  setTimeout(() => {
    lines.forEach(line => line.classList.add('in'));
  }, 120);

  // Also trigger other hero reveal-line elements
  const revealLines = document.querySelectorAll(
    '.hero-eyebrow, .hero-sub, .hero-cta-row, .hero-badge'
  );

  revealLines.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('in');
    }, 300 + i * 120);
  });
}


/* ════════════════════════════════════════════════════════════════
   5 · SCROLL REVEAL (IntersectionObserver)
════════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-item, .reveal-card');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
}


/* ════════════════════════════════════════════════════════════════
   6 · PARALLAX — card images shift on scroll
════════════════════════════════════════════════════════════════ */
function initParallax() {
  const cards = document.querySelectorAll('.card-img-wrap');
  if (!cards.length) return;

  // Only on non-touch devices for performance
  if (window.matchMedia('(hover: none)').matches) return;

  function update() {
    cards.forEach(wrap => {
      const rect   = wrap.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const vhalf  = window.innerHeight / 2;
      // How far the card center is from viewport center (-1 to +1)
      const ratio  = (center - vhalf) / vhalf;
      // Shift image up to ±8px
      const shift  = ratio * 8;
      const img    = wrap.querySelector('.card-img');
      if (img) img.style.transform = `translateY(${shift}px)`;
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}


/* ════════════════════════════════════════════════════════════════
   7 · FILTER TABS
════════════════════════════════════════════════════════════════ */
function initFilterTabs() {
  const tabs  = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.project-card');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      // Update active tab
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Show/hide cards with a stagger
      cards.forEach((card, i) => {
        const category = card.dataset.category;
        const match    = filter === 'all' || category === filter;

        if (match) {
          card.classList.remove('filtered-out');
          // Re-trigger reveal stagger
          card.classList.remove('in');
          setTimeout(() => card.classList.add('in'), 40 + i * 60);
        } else {
          card.classList.add('filtered-out');
          card.classList.remove('in');
        }
      });
    });
  });
}


/* ════════════════════════════════════════════════════════════════
   8 · 3D CARD TILT on hover
════════════════════════════════════════════════════════════════ */
function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      // Max tilt: 4 degrees
      const rotX   = -dy * 4;
      const rotY   =  dx * 4;

      card.style.transform = `
        perspective(800px)
        rotateX(${rotX}deg)
        rotateY(${rotY}deg)
        translateY(-6px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}


/* ════════════════════════════════════════════════════════════════
   9 · MAGNETIC BUTTONS
════════════════════════════════════════════════════════════════ */
function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  const buttons = document.querySelectorAll('.magnetic');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect   = btn.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = e.clientX - cx;
      const dy     = e.clientY - cy;
      const dist   = Math.sqrt(dx * dx + dy * dy);
      const radius = 50; // magnetic range px

      if (dist < radius) {
        const strength = (1 - dist / radius) * 0.45;
        btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}


/* ════════════════════════════════════════════════════════════════
   10 · HAPTIC BUTTON FEEDBACK (scale bounce on click)
════════════════════════════════════════════════════════════════ */
function initHapticButtons() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.style.transition = 'transform 0.08s ease';
      btn.style.transform  = 'scale(0.95)';

      setTimeout(() => {
        btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        btn.style.transform  = 'scale(1)';
      }, 80);

      setTimeout(() => {
        btn.style.transition = '';
        btn.style.transform  = '';
      }, 500);
    });
  });
}


/* ════════════════════════════════════════════════════════════════
   11 · THEME TOGGLE
════════════════════════════════════════════════════════════════ */
function initThemeToggle() {
  const btn  = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!btn) return;

  // Persist across reloads
  const saved = localStorage.getItem('ya-theme') || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ya-theme', theme);
    if (icon) icon.textContent = theme === 'dark' ? '◑' : '◐';
  }
}


/* ════════════════════════════════════════════════════════════════
   12 · LANGUAGE TOGGLE (EN / AR)
════════════════════════════════════════════════════════════════ */
function initLangToggle() {
  const btn   = document.getElementById('langToggle');
  const label = document.getElementById('langLabel');
  if (!btn) return;

  const saved = localStorage.getItem('ya-lang') || 'en';
  applyLang(saved, false);

  btn.addEventListener('click', () => {
    const current = document.documentElement.dataset.lang;
    applyLang(current === 'en' ? 'ar' : 'en', true);
  });

  function applyLang(lang, animate) {
    if (animate) {
      document.body.classList.add('lang-transitioning');
      setTimeout(() => document.body.classList.remove('lang-transitioning'), 200);
    }

    document.documentElement.dataset.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('ya-lang', lang);
    if (label) label.textContent = lang === 'en' ? 'EN' : 'AR';

    // Swap all data-en / data-ar text nodes
    const attr = `data-${lang}`;
    document.querySelectorAll(`[${attr}]`).forEach(el => {
      const val = el.getAttribute(attr);
      if (!val) return;

      // If the element has no child elements (pure text node), set textContent
      if (el.children.length === 0) {
        el.textContent = val;
      }
    });
  }
}


/* ════════════════════════════════════════════════════════════════
   13 · HAMBURGER / MOBILE MENU
════════════════════════════════════════════════════════════════ */
function initHamburger() {
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = !mobileMenu.hidden;

    if (isOpen) {
      mobileMenu.hidden = true;
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    } else {
      mobileMenu.hidden = false;
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.hidden = true;
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.hidden) {
      mobileMenu.hidden = true;
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}


/* ════════════════════════════════════════════════════════════════
   14 · MODALS (Auth Gate + Download)
════════════════════════════════════════════════════════════════ */
function initModals() {

  /* ── Open / Close helpers ── */
  function openModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    // Focus first focusable element
    setTimeout(() => {
      const first = overlay.querySelector('button, a, input, [tabindex]');
      if (first) first.focus();
    }, 100);
  }

  function closeModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  // Close buttons (data-modal="overlayId")
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.modal;
      if (id) closeModal(id);
    });
  });

  // Click outside modal card to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay:not([hidden])').forEach(overlay => {
      closeModal(overlay.id);
    });
  });

  /* ── "Start a Project" → Auth Gate modal ── */
  document.getElementById('openInquiryBtn')?.addEventListener('click', () => {
    openModal('authGateOverlay');
  });

  // Also header CTA
  document.querySelectorAll('a[href="#contact"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('authGateOverlay');
    });
  });

  /* ── Auth Gate: Continue as Guest ── */
  document.getElementById('continueGuestBtn')?.addEventListener('click', () => {
    closeModal('authGateOverlay');
    openModal('inquiryModal');
  });

  /* ── Resource Download buttons ── */
  document.querySelectorAll('.resource-download-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openModal('downloadModal');
    });
  });

  /* ── Download form submit ── */
  const downloadForm = document.getElementById('downloadForm');
  if (downloadForm) {
    downloadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = downloadForm.querySelector('#downloadEmail')?.value;
      if (!email) return;

      // Replace form with success message
      downloadForm.innerHTML = `
        <div style="text-align:center; padding: 24px 0;">
          <div style="font-size:2rem; margin-bottom:16px; color:var(--accent);">✓</div>
          <p style="font-weight:600; margin-bottom:8px;">You're on the list!</p>
          <p style="color:var(--fg-2); font-size:13px; line-height:1.6;">
            Check <strong>${email}</strong> — the pack is on its way.<br/>
            Welcome to the yamanalie community.
          </p>
        </div>
      `;
    });
  }
}


/* ════════════════════════════════════════════════════════════════
   15 · INQUIRY FORM (10-step multi-step)
════════════════════════════════════════════════════════════════ */
function initInquiryForm() {

  const stepsContainer = document.getElementById('inquirySteps');
  const progressBar    = document.getElementById('inquiryProgressBar');
  const progressLabel  = document.getElementById('inquiryProgressLabel');
  const prevBtn        = document.getElementById('inquiryPrev');
  const nextBtn        = document.getElementById('inquiryNext');
  const overlay        = document.getElementById('inquiryModal');
  if (!stepsContainer) return;

  /* ── Questions config ── */
  const questions = [
    {
      id:   'brandName',
      q:    "What is the name of your brand or business?",
      type: 'text',
      placeholder: 'e.g. Livil Studio',
    },
    {
      id:   'brandDesc',
      q:    "Describe your business in one sentence.",
      type: 'text',
      placeholder: 'e.g. A sustainable wellness brand for urban professionals.',
    },
    {
      id:   'brandValues',
      q:    "What are the 3 main values you want your brand to communicate?",
      type: 'textarea',
      placeholder: 'e.g. Trust, Simplicity, Growth',
    },
    {
      id:   'audience',
      q:    "Who is your primary target audience?",
      type: 'text',
      placeholder: 'e.g. Millennial entrepreneurs aged 25–35',
    },
    {
      id:   'existing',
      q:    "Do you have an existing visual identity, or are we starting from scratch?",
      type: 'select',
      options: [
        { value: '',           label: '— Select one —' },
        { value: 'scratch',    label: 'Starting from scratch' },
        { value: 'refresh',    label: 'Refreshing an existing identity' },
        { value: 'expansion',  label: 'Expanding an existing system' },
      ],
    },
    {
      id:   'services',
      q:    "Which services do you need?",
      type: 'checkbox',
      options: [
        { value: 'logo',     label: 'Logo Design' },
        { value: 'social',   label: 'Social Media Design' },
        { value: '3d',       label: '3D Mockups' },
        { value: 'strategy', label: 'Full Brand Strategy' },
      ],
    },
    {
      id:   'vibe',
      q:    "What is your preferred visual vibe?",
      type: 'text',
      placeholder: 'e.g. Minimalist, Bold, Traditional, Modern, Earthy…',
    },
    {
      id:   'timeline',
      q:    "What is your estimated timeline for completion?",
      type: 'select',
      options: [
        { value: '',         label: '— Select one —' },
        { value: '1-2w',     label: '1–2 weeks (Rush)' },
        { value: '1m',       label: '1 month' },
        { value: '2-3m',     label: '2–3 months' },
        { value: 'flexible', label: 'Flexible / no rush' },
      ],
    },
    {
      id:   'budget',
      q:    "What is your approximate budget range for this investment?",
      type: 'select',
      options: [
        { value: '',       label: '— Select one —' },
        { value: 'u500',   label: 'Under $500' },
        { value: '500-1k', label: '$500 – $1,000' },
        { value: '1-3k',   label: '$1,000 – $3,000' },
        { value: '3k+',    label: '$3,000+' },
      ],
    },
    {
      id:   'extras',
      q:    "Any 'must-have' elements or inspirations I should know about?",
      type: 'textarea',
      placeholder: 'Share links, keywords, brands you love, colours, anything that helps…',
    },
  ];

  /* ── State ── */
  let currentStep = 0;
  const answers   = {};

  /* ── Build a step ── */
  function buildStep(index) {
    const q   = questions[index];
    const div = document.createElement('div');
    div.className = 'inquiry-step';
    div.id = `step-${index}`;

    let fieldHTML = '';

    if (q.type === 'text') {
      fieldHTML = `
        <div class="form-field">
          <input
            type="text"
            id="q-${q.id}"
            name="${q.id}"
            class="form-input"
            placeholder="${q.placeholder || ''}"
            value="${answers[q.id] || ''}"
            autocomplete="off"
          />
        </div>
      `;
    } else if (q.type === 'textarea') {
      fieldHTML = `
        <div class="form-field">
          <textarea
            id="q-${q.id}"
            name="${q.id}"
            class="form-textarea"
            placeholder="${q.placeholder || ''}"
            rows="4"
          >${answers[q.id] || ''}</textarea>
        </div>
      `;
    } else if (q.type === 'select') {
      const opts = q.options.map(o =>
        `<option value="${o.value}" ${answers[q.id] === o.value ? 'selected' : ''}>${o.label}</option>`
      ).join('');
      fieldHTML = `
        <div class="form-field">
          <select id="q-${q.id}" name="${q.id}" class="form-select">
            ${opts}
          </select>
        </div>
      `;
    } else if (q.type === 'checkbox') {
      const saved = answers[q.id] || [];
      const items = q.options.map(o => `
        <div class="checkbox-item">
          <input
            type="checkbox"
            id="cb-${q.id}-${o.value}"
            name="${q.id}"
            value="${o.value}"
            ${saved.includes(o.value) ? 'checked' : ''}
          />
          <label for="cb-${q.id}-${o.value}">${o.label}</label>
        </div>
      `).join('');
      fieldHTML = `<div class="checkbox-group">${items}</div>`;
    }

    div.innerHTML = `
      <p class="step-question">${q.q}</p>
      ${fieldHTML}
    `;
    return div;
  }

  /* ── Render current step ── */
  function renderStep(index) {
    stepsContainer.innerHTML = '';
    stepsContainer.appendChild(buildStep(index));

    // Update progress
    const pct = ((index + 1) / questions.length) * 100;
    if (progressBar)  progressBar.style.width = pct + '%';
    if (progressLabel) progressLabel.textContent = `${index + 1} / ${questions.length}`;

    // Update aria
    const progressEl = overlay?.querySelector('.inquiry-progress');
    if (progressEl) progressEl.setAttribute('aria-valuenow', index + 1);

    // Show/hide back button
    if (prevBtn) prevBtn.hidden = index === 0;

    // Update next button label
    const isLast = index === questions.length - 1;
    if (nextBtn) {
      const label = nextBtn.querySelector('.btn-text');
      if (label) label.textContent = isLast ? 'Submit →' : 'Next →';
    }

    // Auto-focus first input
    setTimeout(() => {
      const first = stepsContainer.querySelector('input, textarea, select');
      if (first) first.focus();
    }, 80);
  }

  /* ── Save current answer ── */
  function saveAnswer() {
    const q = questions[currentStep];

    if (q.type === 'checkbox') {
      const checked = stepsContainer.querySelectorAll(`input[name="${q.id}"]:checked`);
      answers[q.id] = Array.from(checked).map(c => c.value);
    } else {
      const el = stepsContainer.querySelector(`#q-${q.id}`);
      if (el) answers[q.id] = el.value.trim();
    }
  }

  /* ── Next ── */
  nextBtn?.addEventListener('click', () => {
    saveAnswer();

    if (currentStep < questions.length - 1) {
      currentStep++;
      renderStep(currentStep);
    } else {
      // Submit
      submitInquiry();
    }
  });

  /* ── Prev ── */
  prevBtn?.addEventListener('click', () => {
    saveAnswer();
    if (currentStep > 0) {
      currentStep--;
      renderStep(currentStep);
    }
  });

  /* ── Allow Enter key to advance ── */
  stepsContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      nextBtn?.click();
    }
  });

  /* ── Submit ── */
  function submitInquiry() {
    // Log answers (replace with your fetch/API call)
    console.log('Inquiry submitted:', answers);

    // Show success state
    const modal = overlay?.querySelector('.modal--inquiry');
    if (!modal) return;

    modal.innerHTML = `
      <div style="padding: var(--space-8); text-align: center; min-height: 340px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-5);">
        <div style="font-size: 3rem; color: var(--accent); animation: pulse 2s infinite;">◈</div>
        <h2 style="font-size: clamp(1.4rem,3vw,1.8rem); font-weight:700; letter-spacing:-0.03em;">
          ${answers.brandName ? `Let's build ${answers.brandName}.` : "Message received."}
        </h2>
        <p style="color:var(--fg-2); font-size:14px; line-height:1.75; max-width:380px;">
          I'll review your brief and reach out within 24–48 hours.
          In the meantime, feel free to explore the work.
        </p>
        <a href="#work" class="btn btn-primary" style="margin-top:8px;" onclick="document.getElementById('inquiryModal').hidden=true; document.body.style.overflow='';">
          <span class="btn-text">Explore the Work</span>
          <span class="btn-fill"></span>
        </a>
      </div>
    `;
  }

  /* ── Reset form when modal is re-opened ── */
  overlay?.addEventListener('transitionend', () => {
    if (overlay.hidden) {
      currentStep = 0;
      Object.keys(answers).forEach(k => delete answers[k]);
      renderStep(0);
    }
  });

  // Initial render
  renderStep(0);
}


/* ════════════════════════════════════════════════════════════════
   16 · BLUR-UP IMAGE LOADING
════════════════════════════════════════════════════════════════ */
function initBlurUpImages() {
  const images = document.querySelectorAll('.card-img');

  images.forEach(img => {
    const blur = img.closest('.card-img-wrap')?.querySelector('.card-img-blur');

    // Start blurred
    img.classList.add('loading');

    function onLoad() {
      img.classList.remove('loading');
      img.classList.add('loaded');
      if (blur) {
        blur.classList.add('hidden');
        setTimeout(() => blur.remove(), 700);
      }
    }

    if (img.complete && img.naturalWidth > 0) {
      onLoad();
    } else {
      img.addEventListener('load',  onLoad);
      img.addEventListener('error', () => {
        // Graceful fallback — keep placeholder visible
        img.classList.remove('loading');
        if (blur) blur.style.opacity = '0.4';
      });
    }
  });
}


/* ════════════════════════════════════════════════════════════════
   17 · SMOOTH SCROLL for anchor links
════════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  // Skip links handled by modal logic
  if (link.closest('.modal-actions') || link.closest('.nav-actions')) return;

  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // header height
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

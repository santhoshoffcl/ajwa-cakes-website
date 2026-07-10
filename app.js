/* ==========================================================================
   AJWA CAKES — INTERACTIVE ENGINE v2
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('has-js');

  /* ── 1. LUCIDE ICONS ── */
  if (typeof lucide !== 'undefined') lucide.createIcons();

  /* ── 1b. RESTORE ADMIN-UPLOADED PRODUCT IMAGES FROM LOCALSTORAGE ── */
  const PRODUCT_IDS = [
    'honey-cake','honey-cake-gift','brownie-big','brownie-small',
    'fruit-vanilla','fruit-chocolate','fruit-small-vanilla','pudding-cake'
  ];

  function loadStoredImages() {
    PRODUCT_IDS.forEach(id => {
      const stored = localStorage.getItem(`ajwa_product_img_${id}`);
      if (stored) applyImageToPlaceholder(id, stored);
    });
  }

  function applyImageToPlaceholder(productId, dataUrl) {
    const placeholder = document.getElementById(`img-${productId}`);
    if (!placeholder) return;
    let preview = placeholder.querySelector('.uploaded-preview');
    if (!preview) {
      preview = document.createElement('img');
      preview.className = 'uploaded-preview';
      preview.alt = productId;
      placeholder.prepend(preview);
    }
    preview.src = dataUrl;
    placeholder.classList.add('has-image');
  }

  /* Bind admin file inputs (only visible when admin mode is active) */
  function bindAdminInputs() {
    document.querySelectorAll('.admin-file-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const productId = input.dataset.product;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target.result;
          localStorage.setItem(`ajwa_product_img_${productId}`, dataUrl);
          applyImageToPlaceholder(productId, dataUrl);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  /* Expose admin mode activator — called from admin.html via postMessage or URL param */
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'ajwa2015') {
    document.querySelectorAll('.admin-upload-btn').forEach(btn => {
      btn.style.display = 'flex';
    });
    // Show subtle admin bar
    const adminBar = document.createElement('div');
    adminBar.innerHTML = `<div style="position:fixed;bottom:0;left:0;right:0;background:rgba(196,0,0,0.9);color:#fff;text-align:center;padding:8px;font-size:0.78rem;font-weight:700;z-index:9999;letter-spacing:1px;">⚙ ADMIN MODE — Product images can be uploaded. Changes save automatically.</div>`;
    document.body.appendChild(adminBar);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  loadStoredImages();
  bindAdminInputs();

  /* ── 2. LOADER FADE-OUT ── */
  const loader = document.getElementById('loader-wrapper');
  function hideLoader() {
    if (loader) loader.classList.add('hidden');
  }
  window.addEventListener('load', () => setTimeout(hideLoader, 900));
  setTimeout(hideLoader, 3000); // Fallback

  /* ── 3. HEADER SCROLL BEHAVIOUR ── */
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ── 4. MOBILE NAV ── */
  const toggle = document.querySelector('.mobile-nav-toggle');
  const nav    = document.getElementById('primary-navigation');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
      // Lock body scroll when nav is open
      document.body.style.overflow = open ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── 5. ACTIVE NAV SECTION HIGHLIGHT ── */
  const sections  = Array.from(document.querySelectorAll('section[id]'));
  const navItems  = document.querySelectorAll('.nav-item[href^="#"]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    let current = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });
    navItems.forEach(item => {
      const href = item.getAttribute('href').replace('#','');
      item.classList.toggle('active', href === current || (current === 'home' && href === ''));
    });
  }, { passive: true });

  /* ── 6. CANVAS PARTICLE SYSTEM ── */
  const canvas = document.getElementById('hero-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const COUNT = 55;

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    class Particle {
      spawn() {
        this.x  = Math.random() * W;
        this.y  = H + 20;
        this.r  = Math.random() * 2.2 + 0.8;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -(Math.random() * 0.9 + 0.35);
        this.a  = Math.random() * 0.55 + 0.1;
        this.da = 0.0008 + Math.random() * 0.0004;
        this.color = Math.random() > 0.45 ? '#F8C14A' : '#C40000';
      }
      constructor() { this.spawn(); this.y = Math.random() * H; }
      update() {
        this.x += this.vx; this.y += this.vy; this.a -= this.da;
        if (this.a <= 0 || this.y < -10) this.spawn();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.a;
        ctx.shadowBlur  = 6;
        ctx.shadowColor = this.color;
        ctx.fillStyle   = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < COUNT; i++) particles.push(new Particle());

    (function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    })();
  }

  /* ── 7. SCROLL REVEAL (IntersectionObserver) ── */
  const revealEls = document.querySelectorAll('.scroll-reveal, .feature-card.scroll-reveal');
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObs.observe(el));

  // Also observe feature cards separately (they have stagger delays in CSS)
  document.querySelectorAll('.feature-card').forEach(el => {
    el.classList.add('scroll-reveal');
    revealObs.observe(el);
  });

  /* ── 8. STAT COUNTERS ── */
  const statObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card   = entry.target;
      const target = +card.dataset.count;
      const span   = card.querySelector('.counter');
      const dur    = 2000;
      const step   = Math.max(1, Math.ceil(target / (dur / 20)));
      let val = 0;
      const tick = setInterval(() => {
        val = Math.min(val + step, target);
        span.textContent = val;
        if (val >= target) clearInterval(tick);
      }, 20);
      obs.unobserve(card);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-card').forEach(c => statObserver.observe(c));

  /* ── 9. PRODUCT FILTER ── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card-3d');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      productCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.style.display = '';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.88)';
          setTimeout(() => { card.style.display = 'none'; }, 320);
        }
      });
    });
  });

  /* ── 10. 3D TILT ON PRODUCT CARDS ── */
  productCards.forEach(card => {
    const inner = card.querySelector('.product-card-inner');
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left - r.width  / 2;
      const y = e.clientY - r.top  - r.height / 2;
      inner.style.transform = `rotateX(${-(y / 14).toFixed(1)}deg) rotateY(${(x / 14).toFixed(1)}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'rotateX(0) rotateY(0)';
    });
  });

  /* ── 11. QUALITY PROCESS STEPPER ── */
  const stepDots   = document.querySelectorAll('.step-dot');
  const journeyCards = document.querySelectorAll('.journey-card');
  const progressBar  = document.querySelector('.stepper-progress');

  function goToStep(idx) {
    const total = stepDots.length;
    const pct   = total > 1 ? (idx / (total - 1)) * 100 : 100;
    if (progressBar) progressBar.style.setProperty('--progress-width', `${pct}%`);

    stepDots.forEach((d, i) => {
      d.classList.toggle('active',    i === idx);
      d.classList.toggle('completed', i < idx);
    });
    journeyCards.forEach(c => {
      c.classList.toggle('active', +c.dataset.step === idx);
    });
  }

  stepDots.forEach((dot, i) => dot.addEventListener('click', () => goToStep(i)));

  // Auto-advance stepper every 5s
  let stepIdx = 0;
  setInterval(() => {
    stepIdx = (stepIdx + 1) % stepDots.length;
    goToStep(stepIdx);
  }, 5000);

  /* ── 11b. ABOUT JOURNEY TIMELINE ── */
  const timelineSteps = document.querySelectorAll('.timeline-step');
  const timelineContainer = document.querySelector('.timeline-container');
  const timelineIndicator = document.querySelector('.timeline-indicator');

  let activeTimelineIdx = 0;
  let timelineInterval = null;
  let timelineTimeout = null;

  function updateTimelineIndicator() {
    if (!timelineContainer || !timelineIndicator) return;
    const activeStep = timelineContainer.querySelector('.timeline-step.active');
    if (!activeStep) return;
    const icon = activeStep.querySelector('.timeline-icon');
    if (!icon) return;

    const containerRect = timelineContainer.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();

    const top = iconRect.top - containerRect.top;
    const left = iconRect.left - containerRect.left;
    const width = iconRect.width;
    const height = iconRect.height;

    timelineIndicator.style.top = `${top}px`;
    timelineIndicator.style.left = `${left}px`;
    timelineIndicator.style.width = `${width}px`;
    timelineIndicator.style.height = `${height}px`;
  }

  function setActiveTimelineStep(idx) {
    activeTimelineIdx = idx;
    timelineSteps.forEach((step, i) => {
      step.classList.toggle('active', i === idx);
    });
    updateTimelineIndicator();
  }

  function startTimelineAutoSlide() {
    clearInterval(timelineInterval);
    timelineInterval = setInterval(() => {
      let nextIdx = (activeTimelineIdx + 1) % timelineSteps.length;
      setActiveTimelineStep(nextIdx);
    }, 3000); // 3 seconds per step
  }

  function handleManualTimelineClick(idx) {
    clearInterval(timelineInterval);
    clearTimeout(timelineTimeout);
    
    setActiveTimelineStep(idx);
    
    // Restart auto animation after a 3-second delay
    timelineTimeout = setTimeout(() => {
      startTimelineAutoSlide();
    }, 3000);
  }

  if (timelineSteps.length && timelineContainer && timelineIndicator) {
    // Add click listeners to step nodes
    timelineSteps.forEach((step, i) => {
      step.addEventListener('click', () => {
        handleManualTimelineClick(i);
      });
    });

    // Initialize
    setActiveTimelineStep(0);
    startTimelineAutoSlide();

    // Update position on window resize, load, and interaction
    window.addEventListener('resize', updateTimelineIndicator, { passive: true });
    window.addEventListener('load', updateTimelineIndicator);
    
    // Double check positions after rendering cycles
    setTimeout(updateTimelineIndicator, 150);
    setTimeout(updateTimelineIndicator, 600);
  }

  /* ── 12. CUSTOMER FEEDBACK & REVIEWS SYSTEM ── */
  const feedbackForm = document.getElementById('ajwa-feedback-form');
  const starIcons = document.querySelectorAll('.star-selector-icon');
  const ratingInput = document.getElementById('feedback-rating');
  const feedbackFormStatus = document.getElementById('feedback-form-status');
  
  // Star selector interactivity
  starIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const rating = parseInt(icon.dataset.rating);
      ratingInput.value = rating;
      
      // Update star classes
      starIcons.forEach((star, idx) => {
        if (idx < rating) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });
    });
  });

  // Load reviews from localStorage
  function getReviews() {
    const raw = localStorage.getItem('ajwa_feedback');
    return raw ? JSON.parse(raw) : [];
  }

  // Save reviews to localStorage
  function saveReviews(reviews) {
    localStorage.setItem('ajwa_feedback', JSON.stringify(reviews));
  }

  // Helper to generate star SVGs
  function generateStarsHTML(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starsHTML += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="width: 14px; height: 14px; color: var(--gold); fill: var(--gold); margin-right: 2px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      } else {
        starsHTML += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; color: var(--border-light); margin-right: 2px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      }
    }
    return `<div style="display: flex;">${starsHTML}</div>`;
  }

  // Render Public Reviews (Newest to Oldest)
  const publicContainer = document.getElementById('approved-reviews-container');
  function renderPublicReviews() {
    if (!publicContainer) return;
    const reviews = getReviews();
    
    // Sort reviews newest to oldest (reverse chronological order)
    const sortedReviews = [...reviews].reverse();
    
    if (sortedReviews.length === 0) {
      publicContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-style: italic; margin: 40px 0; width: 100%;">No customer reviews yet. Be the first to share your experience with AJWA Cakes!</p>`;
      return;
    }
    
    publicContainer.innerHTML = sortedReviews.map(r => `
      <div class="review-card">
        <div class="review-card-header">
          <div class="review-card-author">
            <h4>${escapeHTML(r.name)}</h4>
            ${r.company ? `<p>${escapeHTML(r.company)}</p>` : ''}
          </div>
          <span class="review-date">${r.date}</span>
        </div>
        ${generateStarsHTML(r.rating)}
        <p class="review-text" style="margin-top: 12px;">"${escapeHTML(r.reviewText)}"</p>
      </div>
    `).join('');
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Unified endpoint helper to submit enquiry to backend
  async function submitEnquiry(payload) {
    const isLocalFile = window.location.protocol === 'file:';
    const baseUrl = isLocalFile ? 'http://localhost:5000' : '';
    const response = await fetch(`${baseUrl}/api/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit enquiry.');
    }
    return data;
  }

  // Handle Form Submission
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('feedback-name').value.trim();
      const company = document.getElementById('feedback-company').value.trim();
      const email = document.getElementById('feedback-email').value.trim();
      const phone = document.getElementById('feedback-phone').value.trim();
      const rating = parseInt(ratingInput.value) || 5;
      const reviewText = document.getElementById('feedback-review').value.trim();

      // Simple validations
      if (!name || !email || !reviewText) {
        showStatus('Please fill in all required fields.', 'error');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showStatus('Please enter a valid email address.', 'error');
        return;
      }

      const submitBtn = feedbackForm.querySelector('[type="submit"]');
      const submitBtnSpan = submitBtn.querySelector('span');
      const originalText = submitBtnSpan.textContent;

      // Prevent duplicate submissions and show loading state
      submitBtn.disabled = true;
      submitBtnSpan.textContent = 'Submitting Feedback…';

      if (feedbackFormStatus) {
        feedbackFormStatus.className = 'form-status';
        feedbackFormStatus.style.display = 'none';
      }

      try {
        const payload = {
          name,
          email,
          phone,
          company,
          enquiryType: 'Feedback',
          productName: '',
          message: reviewText,
          rating
        };

        // Submit to backend
        const result = await submitEnquiry(payload);

        // Save directly to localStorage (so it displays instantly in the public feed)
        const newReview = {
          id: 'rev_' + Date.now(),
          name,
          company,
          email,
          phone,
          rating,
          reviewText,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        };

        const reviews = getReviews();
        reviews.push(newReview);
        saveReviews(reviews);

        // Show success
        showStatus(result.message || 'Thank you for your feedback! Your review has been submitted successfully.', 'success');
        
        // Reset form
        feedbackForm.reset();
        ratingInput.value = '5';
        starIcons.forEach(star => star.classList.add('active'));
        
        // Refresh reviews list
        renderPublicReviews();
      } catch (err) {
        // Show error from backend or network
        showStatus(err.message || 'Failed to submit feedback. Please try again later.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtnSpan.textContent = originalText;
      }
    });
  }

  function showStatus(msg, type) {
    if (!feedbackFormStatus) return;
    feedbackFormStatus.textContent = msg;
    feedbackFormStatus.className = `form-status ${type}`;
    feedbackFormStatus.style.display = 'block';
    
    // Auto scroll to message
    feedbackFormStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Initial render
  renderPublicReviews();



});

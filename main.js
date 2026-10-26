/**
 * AB Marketing (Ahmed Al Basti Marketing Consultants)
 * Core Interactive Application Logic
 * Single Page App Navigation + Portfolio Filters + Modal Lightbox + Countups
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initNavigation();
  initHeroCarousel();
  initMobileMenu();
  initCountUps();
  initPortfolioFilters();
  initPortfolioLightbox();
  initForms();
  initServiceEnquiryTriggers();
  initEditorialScrollAnimations();
});

/* ── Hero Carousel Auto-Advance & Dots ─────────────────────── */
function initHeroCarousel() {
  const slider = document.getElementById('hero-slider');
  const dotsContainer = document.getElementById('hero-carousel-dots');
  if (!slider || !dotsContainer) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const dots = dotsContainer.querySelectorAll('.h-dot');
  if (slides.length <= 1) return;

  let currentSlide = 0;
  let timer = null;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  }

  function startAutoAdvance() {
    stopAutoAdvance();
    timer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5000); // Exactly 5 seconds
  }

  function stopAutoAdvance() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      startAutoAdvance();
    });
  });

  // Only pause if user is actively interacting with the dots
  dotsContainer.addEventListener('mouseenter', stopAutoAdvance);
  dotsContainer.addEventListener('mouseleave', startAutoAdvance);

  startAutoAdvance();
}

/* ── 1. Sticky Header with Blur ────────────────────────────── */
function initStickyHeader() {
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ── 2. Clean Multi-View Page Navigation ───────────────────── */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const pageViews = document.querySelectorAll('.page-view');

  function switchPage(pageId, updateHistory = true) {
    if (!pageId) pageId = 'home';
    pageId = pageId.replace('#', '');

    // Check if target view exists
    const targetView = document.getElementById(`view-${pageId}`);
    if (!targetView) return;

    // Switch active view
    pageViews.forEach(view => {
      view.classList.remove('active');
      view.style.display = 'none';
    });

    targetView.style.display = 'block';
    targetView.classList.add('active');

    // Update active nav links
    navLinks.forEach(link => {
      const linkPage = link.getAttribute('data-page');
      if (linkPage === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Scroll to top of view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'services') {
      setTimeout(() => {
        initEditorialScrollAnimations();
      }, 60);
    }

    if (updateHistory) {
      history.pushState(null, '', `#${pageId}`);
    }
  }

  // Handle click on any nav link or in-page hash link
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const targetId = href.substring(1);

    // If it's one of the 5 main pages
    if (['home', 'services', 'about', 'portfolio', 'contact'].includes(targetId)) {
      e.preventDefault();
      switchPage(targetId);
      closeMobileMenu();
      if (document.activeElement) {
        document.activeElement.blur();
      }
    } else if (targetId === 'about-detail') {
      // In-page anchor inside about view
      e.preventDefault();
      switchPage('about', false);
      setTimeout(() => {
        const el = document.getElementById('about-detail');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (['home', 'services', 'about', 'portfolio', 'contact'].includes(hash)) {
      switchPage(hash, false);
    } else {
      switchPage('home', false);
    }
  });

  // Initial load based on hash or default to home
  const initialHash = window.location.hash.replace('#', '');
  if (['home', 'services', 'about', 'portfolio', 'contact'].includes(initialHash)) {
    switchPage(initialHash, false);
  } else {
    switchPage('home', false);
  }
}

/* ── 3. Mobile Navigation Drawer ───────────────────────────── */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const drawer = document.getElementById('mobile-drawer');

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });
}

function closeMobileMenu() {
  const drawer = document.getElementById('mobile-drawer');
  if (drawer) drawer.classList.remove('open');
}

/* ── 4. Count-Up Numbers ───────────────────────────────────── */
function initCountUps() {
  const counters = document.querySelectorAll('.count-up');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  if (isNaN(target)) return;
  const suffix = el.getAttribute('data-suffix') || '';

  const duration = 1600;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-out cubic formula
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(easeProgress * target);

    el.textContent = currentVal.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      el.textContent = target.toLocaleString() + suffix;
    }
  }

  requestAnimationFrame(updateCount);
}

/* ── 5. Portfolio Filtering ────────────────────────────────── */
function initPortfolioFilters() {
  const tabs = document.querySelectorAll('.pf-tab');
  const items = document.querySelectorAll('.portfolio-grid-3col .p-item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 20);
        } else {
          item.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 260);
        }
      });
    });
  });
}

/* ── 6. Portfolio Lightbox Modal ───────────────────────────── */
function initPortfolioLightbox() {
  const lightbox = document.getElementById('portfolio-lightbox');
  const overlay = document.getElementById('lightbox-overlay');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const dismissBtn = document.getElementById('lightbox-dismiss-btn');
  const heroImg = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const catEl = document.getElementById('lightbox-cat');
  const items = document.querySelectorAll('.portfolio-grid-3col .p-item');

  if (!lightbox) return;

  function openLightbox(item) {
    const imgSrc = item.getAttribute('data-img');
    const title = item.getAttribute('data-title');
    const catBadge = item.querySelector('.p-cat-badge');

    heroImg.src = imgSrc;
    heroImg.alt = title;
    titleEl.textContent = title;
    catEl.textContent = catBadge ? catBadge.textContent : 'Activation Showcase';

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  items.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (dismissBtn) dismissBtn.addEventListener('click', closeLightbox);
  if (overlay) overlay.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  // If user clicks "Request Similar Activation", close modal and switch to contact
  const modalInquire = document.getElementById('lightbox-inquire-btn');
  if (modalInquire) {
    modalInquire.addEventListener('click', () => {
      closeLightbox();
    });
  }
}

/* ── 7. Pre-select Service Triggers ────────────────────────── */
function initServiceEnquiryTriggers() {
  const serviceButtons = document.querySelectorAll('.btn-service-enquire');
  const selectDropdown = document.getElementById('contact-service-select');

  serviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceName = btn.getAttribute('data-service-name');
      
      // Navigate to Contact view
      const contactLink = document.querySelector('a[href="#contact"]');
      if (contactLink) contactLink.click();

      // Pre-select service in dropdown
      if (selectDropdown && serviceName) {
        for (let i = 0; i < selectDropdown.options.length; i++) {
          if (selectDropdown.options[i].text.includes(serviceName) || serviceName.includes(selectDropdown.options[i].value)) {
            selectDropdown.selectedIndex = i;
            break;
          }
        }
      }
    });
  });
}

/* ── 8. Form Submissions with Instant Feedback Toast ───────── */
function initForms() {
  const mainContactForm = document.getElementById('main-contact-form');
  const homeTouchForm = document.getElementById('home-touch-form');
  const footerConnectForm = document.getElementById('footer-connect-form');

  function handleSubmission(e, formType) {
    e.preventDefault();
    showToast(`✓ Thank you! Your ${formType} has been received. Our activation director will contact you within 2 hours.`);
    e.target.reset();
  }

  if (mainContactForm) {
    mainContactForm.addEventListener('submit', (e) => handleSubmission(e, 'campaign brief'));
  }

  if (homeTouchForm) {
    homeTouchForm.addEventListener('submit', (e) => handleSubmission(e, 'enquiry'));
  }

  if (footerConnectForm) {
    footerConnectForm.addEventListener('submit', (e) => handleSubmission(e, 'subscription'));
  }
}

/* Toast notification helper */
function showToast(message) {
  let toast = document.getElementById('site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 28px;
      background: #7E199D;
      color: #ffffff;
      padding: 16px 28px;
      border-radius: 9999px;
      box-shadow: 0 12px 35px rgba(126, 25, 157, 0.4);
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      z-index: 3000;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 4500);
}

/* ── Editorial Services Scroll Animations (Intersection Observer) ── */
function initEditorialScrollAnimations() {
  const rows = document.querySelectorAll('.editorial-row');
  if (!rows.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        const media = entry.target.querySelector('.scroll-animate');
        if (media) media.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  rows.forEach(row => {
    if (!row.classList.contains('in-view')) {
      observer.observe(row);
    }
  });
}


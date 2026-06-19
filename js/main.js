/* ============================================
   MELONS NAILS SPA & MORE
   Main JavaScript — Loader, Hero & Animations
   ============================================ */

(function () {
  'use strict';

  // ── DOM ELEMENTS ──────────────────────────
  const loader      = document.getElementById('loader');
  const video       = document.getElementById('loaderVideo');
  const skipBtn     = document.getElementById('skipBtn');
  const heroCanvas  = document.getElementById('heroCanvas');
  const navbar      = document.getElementById('navbar');
  const infoLeft    = document.querySelector('.hero-info-left');
  const infoRight   = document.querySelector('.hero-info-right');
  const heroScroll  = document.querySelector('.hero-scroll');
  const ctx         = heroCanvas.getContext('2d');

  let hasTransitioned = false;

  // ── RESPONSIVE VIDEO SOURCE ───────────────
  var isMobile = window.innerWidth <= 1024;
  video.src = isMobile
    ? 'assets/background/mobile/intro.mp4'
    : 'assets/background/desktop/introDesktop.mp4';
  video.load();

  // ── CANVAS SIZING ─────────────────────────
  function sizeCanvas() {
    heroCanvas.width  = window.innerWidth;
    heroCanvas.height = window.innerHeight;
  }
  sizeCanvas();
  window.addEventListener('resize', function () {
    sizeCanvas();
    // Redraw if we already captured the frame
    if (hasTransitioned && video.readyState >= 2) {
      drawCover(ctx, video, heroCanvas.width, heroCanvas.height);
    }
  });

  // ── DRAW VIDEO FRAME WITH "COVER" FIT ─────
  function drawCover(context, videoEl, cw, ch) {
    var vw = videoEl.videoWidth;
    var vh = videoEl.videoHeight;
    if (!vw || !vh) return;

    var videoRatio  = vw / vh;
    var canvasRatio = cw / ch;
    var dw, dh, ox, oy;

    if (canvasRatio > videoRatio) {
      dw = cw;
      dh = cw / videoRatio;
      ox = 0;
      oy = (ch - dh) / 2;
    } else {
      dh = ch;
      dw = ch * videoRatio;
      ox = (cw - dw) / 2;
      oy = 0;
    }

    context.drawImage(videoEl, ox, oy, dw, dh);
  }

  // ── CAPTURE LAST FRAME & START TRANSITION ─
  function captureAndTransition() {
    if (hasTransitioned) return;
    hasTransitioned = true;

    // Draw last frame onto hero canvas
    sizeCanvas();
    drawCover(ctx, video, heroCanvas.width, heroCanvas.height);

    // Show canvas
    heroCanvas.classList.add('visible');

    // Fade out loader
    loader.classList.add('hidden');

    // Start hero animations (navbar, info blocks)
    // Small delay to let loader fade start
    setTimeout(startHeroAnimations, 200);
  }

  function startHeroAnimations() {
    // Navbar slides down (CSS handles the animation + delay)
    navbar.classList.add('visible');
    // Info blocks slide in (CSS transition-delay handles staggering)
    infoLeft.classList.add('visible');
    infoRight.classList.add('visible');
    // Scroll indicator
    if (heroScroll) heroScroll.classList.add('visible');
  }

  // ── VIDEO EVENTS ──────────────────────────
  video.addEventListener('ended', function () {
    captureAndTransition();
  });

  // Fallback: if video takes too long (12s max)
  setTimeout(function () {
    if (!hasTransitioned) {
      // Try to capture whatever frame is showing
      if (video.readyState >= 2) {
        captureAndTransition();
      } else {
        // Video didn't load at all — just show hero without frame
        hasTransitioned = true;
        loader.classList.add('hidden');
        setTimeout(startHeroAnimations, 200);
      }
    }
  }, 12000);

  // ── SKIP BUTTON ───────────────────────────
  skipBtn.addEventListener('click', function () {
    if (hasTransitioned) return;

    // Try to seek to end and capture
    if (video.readyState >= 2 && video.duration) {
      video.currentTime = video.duration - 0.05;
      video.addEventListener('seeked', function onSeeked() {
        video.removeEventListener('seeked', onSeeked);
        captureAndTransition();
      });
    } else {
      // Video not ready — just transition without frame
      hasTransitioned = true;
      loader.classList.add('hidden');
      setTimeout(startHeroAnimations, 200);
    }
  });

  // ── VIDEO ERROR HANDLING ──────────────────
  video.addEventListener('error', function () {
    if (!hasTransitioned) {
      hasTransitioned = true;
      loader.classList.add('hidden');
      setTimeout(startHeroAnimations, 200);
    }
  });

  // ── NAVBAR SCROLL EFFECT ──────────────────
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.style.background = 'rgba(244, 194, 197, 0.95)';
    } else {
      navbar.style.background = '';
    }
  });

  // ── PARALLAX HERO CONTENT ─────────────────
  window.addEventListener('scroll', function () {
    var scroll = window.scrollY;
    if (scroll < window.innerHeight) {
      var factor = scroll * 0.25;
      var opacity = 1 - (scroll / (window.innerHeight * 0.6));
      if (opacity < 0) opacity = 0;

      if (infoLeft) {
        infoLeft.style.transform = 'translateY(' + factor + 'px)';
        infoLeft.style.opacity = opacity;
      }
      if (infoRight) {
        infoRight.style.transform = 'translateY(' + factor + 'px)';
        infoRight.style.opacity = opacity;
      }
    }
  });

  // ── SCROLL REVEAL ─────────────────────────
  var reveals = document.querySelectorAll('.reveal');
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(function (el) {
    revealObserver.observe(el);
  });

  // ── TESTIMONIAL CAROUSEL ──────────────────
  var testimonialItems = document.querySelectorAll('.testimonial-item');
  var dots = document.querySelectorAll('.t-dot');
  var currentTestimonial = 0;

  function showTestimonial(index) {
    testimonialItems.forEach(function (el, i) {
      if (i === index) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    dots.forEach(function (el, i) {
      if (i === index) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    currentTestimonial = index;
  }

  // Dot click handlers
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx = parseInt(this.getAttribute('data-index'));
      showTestimonial(idx);
    });
  });

  // Auto-rotate every 5 seconds
  if (testimonialItems.length > 0) {
    setInterval(function () {
      var next = (currentTestimonial + 1) % testimonialItems.length;
      showTestimonial(next);
    }, 5000);
  }

})();

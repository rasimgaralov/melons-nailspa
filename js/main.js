/* ============================================
   MELONS NAILS SPA & MORE
   Main JavaScript — Loader, Hero & Animations
   ============================================ */

// Always start from top on page load / refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Fix mobile viewport height — set ONCE to prevent layout thrashing
// when mobile browser chrome hides/shows on scroll
(function setVH() {
  document.documentElement.style.setProperty('--vh', window.innerHeight + 'px');
})();

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
  const infoBottom  = document.querySelector('.hero-info-bottom');
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
  var lastW = window.innerWidth;
  function sizeCanvas() {
    heroCanvas.width  = window.innerWidth;
    heroCanvas.height = window.innerHeight;
    lastW = window.innerWidth;
  }
  sizeCanvas();
  window.addEventListener('resize', function () {
    // Only resize on actual width change (orientation/window),
    // ignore height-only changes from mobile browser chrome
    if (Math.abs(window.innerWidth - lastW) < 1) return;
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
    if (infoBottom) infoBottom.classList.add('visible');
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

  // ── MOBILE MENU TOGGLE ────────────────────
  var menuToggle = document.getElementById('menuToggle');
  var navLinks = document.querySelector('.nav-links');
  var navOverlay = document.getElementById('navOverlay');

  if (menuToggle && navLinks) {
    function toggleMenu() {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      if (navOverlay) {
        navOverlay.classList.toggle('active');
      }
      
      // Lock body scroll when menu is open
      if (navLinks.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    function closeMenu() {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
      if (navOverlay) {
        navOverlay.classList.remove('active');
      }
      document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', toggleMenu);

    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
    }

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

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

// ── BOOKING MODAL (global scope) ──────────────
function openBookingModal(branch) {
  var modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Set min date to today
    var dateInput = document.getElementById('bookDate');
    if (dateInput) {
      var today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }
    // Pre-select branch if provided
    if (branch) {
      var branchSelect = document.getElementById('bookBranch');
      if (branchSelect) {
        branchSelect.value = branch;
      }
    }
    // Close mobile menu if open
    var menuToggle = document.getElementById('menuToggle');
    var navLinks = document.querySelector('.nav-links');
    var navOverlay = document.getElementById('navOverlay');
    if (menuToggle && navLinks) {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
      if (navOverlay) {
        navOverlay.classList.remove('active');
      }
    }
  }
}

function closeBookingModal() {
  var modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close on overlay click
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.querySelector('.booking-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeBookingModal);
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeBookingModal();
  });

  // ── SPECIALIST DATA PER SERVICE ─────────────
  var specialists = {
    'Gel Manicure': ['Amira K.', 'Leyla M.', 'Nadia R.'],
    'Nail Art': ['Farida S.', 'Zahra H.', 'Maryam A.'],
    'Acrylic Extensions': ['Amira K.', 'Farida S.', 'Hana T.'],
    'Hair & Styling': ['Rania B.', 'Sara J.', 'Dina F.'],
    'Facials': ['Noura W.', 'Layla D.', 'Yasmin E.'],
    'Asian Spa': ['Mei L.', 'Yuki T.', 'Suki K.'],
    'Other': []
  };

  var serviceSelect = document.getElementById('bookService');
  var specialistRow = document.getElementById('specialistRow');
  var specialistSelect = document.getElementById('bookSpecialist');

  if (serviceSelect && specialistRow && specialistSelect) {
    serviceSelect.addEventListener('change', function () {
      var selected = this.value;
      var list = specialists[selected] || [];
      specialistSelect.innerHTML = '<option value="" selected>No preference</option>';
      if (list.length > 0) {
        list.forEach(function (name) {
          var opt = document.createElement('option');
          opt.value = name;
          opt.textContent = name;
          specialistSelect.appendChild(opt);
        });
        specialistRow.style.display = '';
      } else {
        specialistRow.style.display = 'none';
      }
    });
  }

  // Form submission
  var form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('bookName').value.trim();
      var phone = document.getElementById('bookPhone').value.trim();
      var branch = document.getElementById('bookBranch').value;
      var service = document.getElementById('bookService').value;
      var specialist = document.getElementById('bookSpecialist') ? document.getElementById('bookSpecialist').value : '';
      var date = document.getElementById('bookDate').value;
      var time = document.getElementById('bookTime').value;
      var notes = document.getElementById('bookNotes').value.trim();

      // Format date nicely
      var dateObj = new Date(date + 'T00:00:00');
      var formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Branch display name and WhatsApp number
      var branchName, waNumber;
      if (branch === 'almawaleh') {
        branchName = 'AlMawaleh';
        waNumber = '96879319571';
      } else {
        branchName = "Ministry Street (A'Raya)";
        waNumber = '96872228340';
      }

      // Build WhatsApp message
      var message = '✨ *MELONS — Appointment Request*\n\n';
      message += '👤 *Name:* ' + name + '\n';
      message += '📞 *Phone:* ' + phone + '\n';
      message += '📍 *Branch:* ' + branchName + '\n';
      message += '💅 *Service:* ' + service + '\n';
      if (specialist) {
        message += '👩‍🎨 *Specialist:* ' + specialist + '\n';
      }
      message += '📅 *Date:* ' + formattedDate + '\n';
      message += '🕐 *Time:* ' + time + '\n';
      if (notes) {
        message += '📝 *Notes:* ' + notes + '\n';
      }
      message += '\nThank you! Looking forward to your confirmation. 🍉';

      var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message);
      window.open(waUrl, '_blank');

      // Close modal and reset form
      closeBookingModal();
      form.reset();
      if (specialistRow) specialistRow.style.display = 'none';
    });
  }
});

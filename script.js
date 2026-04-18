document.addEventListener('DOMContentLoaded', () => {
  
  // ===== MENU FUNCTIONALITY =====
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  
  if (menuBtn && nav) {
    // Toggle menu on hamburger click
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('show');
      menuBtn.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('show') && !nav.contains(e.target) && e.target !== menuBtn) {
        nav.classList.remove('show');
        menuBtn.classList.remove('active');
      }
    });

    // Close menu when clicking a nav link
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('show');
        menuBtn.classList.remove('active');
      });
    });
  }

  // ===== SET CURRENT YEAR =====
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ===== SLIDESHOW FUNCTIONALITY =====
  const slides = Array.from(document.querySelectorAll('.slide'));
  if (slides.length > 0) {
    let currentSlide = 0;
    slides[0].classList.add('show');
    
    setInterval(() => {
      slides[currentSlide].classList.remove('show');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('show');
    }, 5000);
  }

  // ===== AUDIO PLAYER FUNCTIONALITY =====
  const audioElements = document.querySelectorAll('audio');
  
  audioElements.forEach(audio => {
    const equalizerContainer = audio.closest('.equalizer-wrapper');
    const equalizer = equalizerContainer ? equalizerContainer.querySelector('.equalizer') : null;
    
    // Set initial opacity
    if (equalizer) {
      equalizer.style.opacity = '0.3';
      equalizer.style.transition = 'opacity 0.3s ease';
    }
    
    // Play event
    audio.addEventListener('play', () => {
      // Pause all other audio elements
      audioElements.forEach(otherAudio => {
        if (otherAudio !== audio) {
          otherAudio.pause();
        }
      });
      
      // Animate equalizer
      if (equalizer) {
        equalizer.style.opacity = '1';
      }
    });
    
    // Pause and ended events
    audio.addEventListener('pause', () => {
      if (equalizer) {
        equalizer.style.opacity = '0.3';
      }
    });
    
    audio.addEventListener('ended', () => {
      if (equalizer) {
        equalizer.style.opacity = '0.3';
      }
    });
  });

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
});

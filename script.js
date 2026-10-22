(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* Header + scroll progress */
  const header = $('.site-header');
  const progress = $('#scrollProgress');

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    }
    const toTop = $('#toTop');
    if (toTop) toTop.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

/* Mobile drawer + backdrop */
const menuBtn = $('#menuBtn');
const nav = $('#nav');

if (menuBtn && nav) {
  // Create backdrop once
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  const openNav = () => {
    nav.classList.add('open');
    menuBtn.classList.add('active');
    backdrop.classList.add('show');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  };

  const closeNav = () => {
    nav.classList.remove('open');
    menuBtn.classList.remove('active');
    backdrop.classList.remove('show');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    nav.classList.contains('open') ? closeNav() : openNav();
  });

  backdrop.addEventListener('click', closeNav);
  $$('.nav-link, .nav-cta').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
}

  /* Year */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- HERO VIDEOS (works on every page) ---------- */
  $$('.hero-video').forEach(v => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = navigator.connection;
    const saveData = conn?.saveData === true;
    const slowNet  = /(^|-)(2g|slow-2g)$/.test(conn?.effectiveType || '');

    if (reduceMotion || saveData || slowNet) { v.remove(); return; }

    v.addEventListener('canplay', () => v.classList.add('ready'), { once: true });
    v.addEventListener('error', () => v.remove(), { once: true });
    v.play().catch(() => {});
  });

  /* Hero equalizer bars (home only) */
  const eq = $('#heroEq');
  if (eq) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 54; i++) {
      const s = document.createElement('span');
      s.style.setProperty('--h', (18 + Math.random() * 82).toFixed(0) + '%');
      s.style.animationDuration = (0.85 + Math.random() * 1.4).toFixed(2) + 's';
      s.style.animationDelay = (-Math.random() * 2).toFixed(2) + 's';
      frag.appendChild(s);
    }
    eq.appendChild(frag);
  }

  /* Reveal on scroll */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    $$('[data-reveal]').forEach(el => io.observe(el));
  } else {
    $$('[data-reveal]').forEach(el => el.classList.add('in'));
  }

  /* Count-up stats */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        cio.unobserve(el);
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur = 1700;
        const t0 = performance.now();
        const tick = now => {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => cio.observe(c));
  } else {
    counters.forEach(c => { c.textContent = c.dataset.count + (c.dataset.suffix || ''); });
  }

  /* Custom audio player */
  const audio = new Audio();
  audio.preload = 'metadata';
  let currentSrc = null;
  let active = null;

  const ICON_PLAY  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

  const fmt = t => {
    if (!isFinite(t) || t < 0) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ':' + String(s).padStart(2, '0');
  };

  const players = $$('.player').map(el => ({
    el,
    src: el.dataset.src,
    dur: el.dataset.dur || '0:00',
    btn: $('.player-play', el),
    bar: $('.player-bar', el),
    fill: $('.player-fill', el),
    cur: $('.cur', el),
    durEl: $('.dur', el),
    title: ($('.player-title', el)?.textContent || 'track').trim()
  }));

  const resetActive = () => {
    if (!active) return;
    active.btn.innerHTML = ICON_PLAY;
    active.btn.setAttribute('aria-label', 'Play ' + active.title);
  };

  players.forEach(p => {
    if (p.durEl) p.durEl.textContent = p.dur;
    p.btn.addEventListener('click', () => {
      const isSame = active === p;
      if (isSame && !audio.paused) { audio.pause(); return; }
      if (active && active !== p) {
        resetActive();
        active.fill.style.width = '0%';
        active.cur.textContent = '0:00';
      }
      if (currentSrc !== p.src) { audio.src = p.src; currentSrc = p.src; }
      active = p;
      p.btn.innerHTML = ICON_PAUSE;
      p.btn.setAttribute('aria-label', 'Pause ' + p.title);
      audio.play().catch(() => {});
    });
    const seekTo = clientX => {
      if (active !== p || !isFinite(audio.duration) || !audio.duration) return;
      const r = p.bar.getBoundingClientRect();
      const ratio = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
      audio.currentTime = ratio * audio.duration;
      p.fill.style.width = (ratio * 100) + '%';
    };
    p.bar.addEventListener('pointerdown', e => {
      if (active !== p) return;
      e.preventDefault();
      p.bar.setPointerCapture(e.pointerId);
      seekTo(e.clientX);
      const move = ev => seekTo(ev.clientX);
      const up = () => {
        p.bar.removeEventListener('pointermove', move);
        p.bar.removeEventListener('pointerup', up);
        p.bar.removeEventListener('pointercancel', up);
      };
      p.bar.addEventListener('pointermove', move);
      p.bar.addEventListener('pointerup', up);
      p.bar.addEventListener('pointercancel', up);
    });
  });

  audio.addEventListener('timeupdate', () => {
    if (!active || !isFinite(audio.duration) || !audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    active.fill.style.width = pct + '%';
    active.cur.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener('loadedmetadata', () => {
    if (active && isFinite(audio.duration)) active.durEl.textContent = fmt(audio.duration);
  });
  audio.addEventListener('pause', () => {
    if (active) { active.btn.innerHTML = ICON_PLAY; active.btn.setAttribute('aria-label', 'Play ' + active.title); }
  });
  audio.addEventListener('ended', () => {
    if (!active) return;
    active.fill.style.width = '0%';
    active.cur.textContent = '0:00';
    active.btn.innerHTML = ICON_PLAY;
  });

  /* Mix filtering */
  const chips = $$('.chip');
  const mixCards = $$('.mix-card');
  if (chips.length && mixCards.length) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const f = chip.dataset.filter;
        mixCards.forEach(card => {
          const genres = (card.dataset.genre || '').split(' ');
          const show = f === 'all' || genres.includes(f);
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* Back to top */
  const toTop = $('#toTop');
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
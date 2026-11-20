/* =========================================================
   ANIMASI WEBSITE SEJARAH KABUPATEN BARRU
   Pengganti animasi.js lama — tidak memerlukan perubahan HTML.
   ========================================================= */

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. PRELOADER: tutup setelah halaman siap, dengan fallback agar tidak macet.
  const preloader = document.getElementById('barru-preloader');
  if (preloader) {
    document.body.classList.add('sedang-memuat');
    let sudahDitutup = false;

    const tutupPreloader = () => {
      if (sudahDitutup) return;
      sudahDitutup = true;
      const jeda = reduceMotion ? 0 : 450;
      window.setTimeout(() => {
        preloader.classList.add('selesai');
        document.body.classList.remove('sedang-memuat');
        window.setTimeout(() => preloader.remove(), reduceMotion ? 0 : 700);
      }, jeda);
    };

    if (document.readyState === 'complete') tutupPreloader();
    else window.addEventListener('load', tutupPreloader, { once: true });
    // Fallback jika event load tertahan oleh aset eksternal.
    window.setTimeout(tutupPreloader, 4500);
  }

  // 2. KELAS JS untuk mengaktifkan animasi CSS.
  document.documentElement.classList.add('js');
  const body = document.body;
  if (!reduceMotion) {
    body.classList.add('page-entering');
    window.addEventListener('pageshow', () => body.classList.remove('page-leaving'));

    document.addEventListener('click', event => {
      if (body.classList.contains('page-leaving')) {
        event.preventDefault();
        return;
      }
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;

      const destination = new URL(link.href, window.location.href);
      if (!['http:', 'https:'].includes(destination.protocol) ||
          destination.origin !== window.location.origin ||
          !(/\.(?:html?|php)$/i.test(destination.pathname) || destination.pathname.endsWith('/')) ||
          (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;

      event.preventDefault();
      body.classList.add('page-leaving');
      window.setTimeout(() => window.location.assign(destination.href), 200);
    });
  }

  if (reduceMotion) {
    document.documentElement.classList.add('motion-reduce');
    return;
  }

  // 3. SCROLL REVEAL + STAGGER untuk kartu.
  const revealSelector = [
    'main > section:not(.hero):not(.p-hero):not(.t-hero):not(.timeline-section)',
    'main .judul-tengah',
    'main .kartu',
    'main .tokoh-card',
    'main .p-card:not(.reveal)',
    'main .p-more:not(.reveal)',
    'main .section-wrap > *',
    '.contact-card',
    '.footer'
  ].join(',');

  const revealItems = [...document.querySelectorAll(revealSelector)].filter(el =>
    !el.classList.contains('reveal') &&
    !el.closest('.reveal') &&
    !el.querySelector('.reveal') &&
    !el.closest('.timeline-section')
  );
  revealItems.forEach((el, index) => {
    el.classList.add('anim-reveal');
    if (el.matches('.kartu, .tokoh-card, .p-card, .p-more')) {
      const siblingCards = [...el.parentElement.querySelectorAll('.kartu, .tokoh-card, .p-card, .p-more')];
      el.style.setProperty('--reveal-delay', `${siblingCards.indexOf(el) * 90}ms`);
    } else {
      el.style.setProperty('--reveal-delay', `${(index % 3) * 65}ms`);
    }
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('is-visible'));
  }

  // 4. HERO: animasi teks bertahap saat halaman dibuka.
  const heroes = document.querySelectorAll('.hero, .p-hero, .t-hero');
  heroes.forEach(hero => hero.classList.add('hero-animasi-mulai'));

  // 5. NAVBAR: muncul dari atas dan memiliki status saat halaman digulir.
  const header = document.querySelector('.site-header');
  if (header) {
    header.classList.add('header-animasi');
    void header.offsetWidth;
    header.classList.add('header-siap');

    let scrollTicking = false;
    const updateHeader = () => {
      header.classList.toggle('header-scrolled', window.scrollY > 18);
      scrollTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateHeader);
        scrollTicking = true;
      }
    }, { passive: true });
    updateHeader();
  }

  // 6. DROPDOWN: deteksi saat menu dibuka oleh CSS atau JavaScript menu utama.
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const menu = dropdown.querySelector('.dropdown-menu');
    const button = dropdown.querySelector('.dropdown-toggle');
    if (!menu) return;

    const animateMenu = () => {
      const style = window.getComputedStyle(menu);
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0;
      if (visible) {
        menu.classList.remove('menu-baru-dibuka');
        // Paksa reflow supaya animasi dapat diputar ulang setiap dibuka.
        void menu.offsetWidth;
        menu.classList.add('menu-baru-dibuka');
      } else {
        menu.classList.remove('menu-baru-dibuka');
      }
    };

    if (button) {
      button.addEventListener('click', () => window.setTimeout(animateMenu, 20));
      button.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') window.setTimeout(animateMenu, 20);
      });
    }
    dropdown.addEventListener('mouseenter', animateMenu);
    dropdown.addEventListener('focusin', animateMenu);
    dropdown.addEventListener('mouseleave', () => menu.classList.remove('menu-baru-dibuka'));
    dropdown.addEventListener('focusout', event => {
      if (!dropdown.contains(event.relatedTarget)) menu.classList.remove('menu-baru-dibuka');
    });

  });

  // 7. SCROLL PROGRESS BAR di bagian paling atas.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  let checkAnimationsInView = () => {};
  let progressTicking = false;
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.setProperty('--scroll-progress', `${Math.min(100, Math.max(0, percent))}%`);
    checkAnimationsInView();
    progressTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      window.requestAnimationFrame(updateProgress);
      progressTicking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  // 8. PARALLAX ringan pada latar hero. Nonaktif di layar kecil.
  const parallaxItems = document.querySelectorAll('.hero-kiri, .p-hero .p-pola');
  if (parallaxItems.length && window.matchMedia('(min-width: 768px)').matches) {
    let parallaxTicking = false;
    const updateParallax = () => {
      parallaxItems.forEach(item => {
        const section = item.closest('.hero, .p-hero');
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
        const offset = Math.max(-18, Math.min(18, rect.top * -0.035));
        item.style.setProperty('--hero-parallax-y', `${offset}px`);
      });
      parallaxTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        window.requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  // 9. ZOOM HALUS pada gambar ketika bagian terkait terlihat.
  const visualItems = document.querySelectorAll(
    '.mengenal .foto, .kartu .gbr, .p-card .p-img, .p-card .p-foto-img, .tokoh-card .tokoh-foto, .g-img'
  );
  if ('IntersectionObserver' in window) {
    const visualObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('gambar-terlihat');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    visualItems.forEach(el => {
      el.classList.add('gambar-animasi');
      visualObserver.observe(el);
    });
  } else {
    visualItems.forEach(el => el.classList.add('gambar-terlihat'));
  }

  // 10. GARIS DAN TITIK TIMELINE: animasikan sekali ketika masuk viewport.
  const timeline = document.querySelector('.timeline');
  const timelineItems = timeline ? timeline.querySelectorAll('.timeline-item') : [];
  if (timeline && 'IntersectionObserver' in window) {
    const timelineObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(entry.target === timeline ? 'timeline-terlihat' : 'timeline-item-terlihat');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    timelineObserver.observe(timeline);
    timelineItems.forEach(item => timelineObserver.observe(item));
  } else if (timeline) {
    timeline.classList.add('timeline-terlihat');
    timelineItems.forEach(item => item.classList.add('timeline-item-terlihat'));
  }

  const legacyRevealItems = document.querySelectorAll('.reveal');
  checkAnimationsInView = () => {
    const revealBoundary = window.innerHeight * 0.88;
    revealItems.forEach(item => {
      if (item.classList.contains('is-visible')) return;
      const rect = item.getBoundingClientRect();
      if (rect.top < revealBoundary && rect.bottom > 0) item.classList.add('is-visible');
    });
    legacyRevealItems.forEach(item => {
      if (item.classList.contains('in')) return;
      const rect = item.getBoundingClientRect();
      if (rect.top < revealBoundary && rect.bottom > 0) item.classList.add('in');
    });
    if (!timeline) return;

    const timelineRect = timeline.getBoundingClientRect();
    if (timelineRect.top < window.innerHeight && timelineRect.bottom > 0) {
      timeline.classList.add('timeline-terlihat');
    }
    timelineItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      if (rect.top < revealBoundary && rect.bottom > 0) item.classList.add('timeline-item-terlihat');
    });
  };
  checkAnimationsInView();

  // 11. MAGNETIC MICRO-INTERACTION ringan untuk tombol utama.
  const magneticItems = document.querySelectorAll('.nav-cta, .hero .btn, .mengenal .btn');
  if (window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches) {
    magneticItems.forEach(item => {
      item.classList.add('magnetic-ready');
      item.addEventListener('pointermove', event => {
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
        item.style.setProperty('--mag-x', `${x * 5}px`);
        item.style.setProperty('--mag-y', `${y * 5}px`);
      });
      item.addEventListener('pointerleave', () => {
        item.style.setProperty('--mag-x', '0px');
        item.style.setProperty('--mag-y', '0px');
      });
    });
  }

  // 12. TILT 3D halus untuk kartu tokoh pada perangkat desktop.
  if (window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
    document.querySelectorAll('.tokoh-card:not(.kosong)').forEach(card => {
      let frame = 0;
      let tiltX = 0;
      let tiltY = 0;

      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width * 2 - 1;
        const y = (event.clientY - rect.top) / rect.height * 2 - 1;
        tiltX = Math.max(-1, Math.min(1, y)) * -4;
        tiltY = Math.max(-1, Math.min(1, x)) * 4;

        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          card.style.setProperty('--tilt-x', `${tiltX}deg`);
          card.style.setProperty('--tilt-y', `${tiltY}deg`);
          frame = 0;
        });
      });

      card.addEventListener('pointerleave', () => {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  // 13. ACTIVE NAV LINK untuk tautan yang mengarah ke bagian halaman.
  const sectionLinks = [...document.querySelectorAll('.main-nav a[href*="#"]')];
  const pageSections = sectionLinks
    .map(link => {
      const destination = new URL(link.href, window.location.href);
      return destination.origin === window.location.origin &&
        destination.pathname === window.location.pathname &&
        destination.hash
        ? document.getElementById(decodeURIComponent(destination.hash.slice(1)))
        : null;
    })
    .filter(Boolean);

  if (pageSections.length && 'IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        sectionLinks.forEach(link => {
          const targetId = link.getAttribute('href').split('#')[1];
          link.classList.toggle('section-active', targetId === id);
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    pageSections.forEach(section => activeObserver.observe(section));
  }
})();

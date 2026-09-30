(() => {
  'use strict';

  // ====== KONFIGURASI: nomor WhatsApp QQ Software (format 62, tanpa + atau 0) ======
  const WHATSAPP_NUMBER = '6281325823911';

  // Buka WhatsApp dengan cara yang lebih andal di HP (lebih tahan pop-up blocker)
  const openWhatsApp = (text) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tahun otomatis di footer
  $('#year').textContent = new Date().getFullYear();

  // Navbar: efek saat scroll
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu mobile
  const burger = $('#burger');
  const menu = $('#menu');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

  // Link menu aktif sesuai section
  const links = $$('.menu a:not(.btn)');
  const sections = links.map((a) => $(a.getAttribute('href')));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => s && spy.observe(s));

  // Animasi muncul saat scroll (stagger untuk kartu)
  const reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const siblings = $$('.reveal', en.target.parentElement);
        const i = siblings.indexOf(en.target);
        en.target.style.transitionDelay = `${(i % 3) * 110}ms`;
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
        setTimeout(() => (en.target.style.transitionDelay = ''), 1200);
      });
    }, { threshold: 0.15 });
    reveals.forEach((el) => io.observe(el));
  }

  // Hitung angka statistik
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const co = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => co.observe(c));

  // Efek gerak halus pada ilustrasi hero (desktop)
  const art = $('.hero__art');
  if (art && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    const hero = $('.hero');
    hero.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 14;
      art.style.transform = `translate(${x}px, ${y}px)`;
    });
    hero.addEventListener('mouseleave', () => (art.style.transform = ''));
  }

  // Tombol "Pesan layanan ini" mengisi pilihan layanan di form
  const select = $('#layanan-select');
  $$('[data-service]').forEach((a) => {
    a.addEventListener('click', () => { select.value = a.dataset.service; });
  });

  // Form: validasi lalu kirim ke WhatsApp
  const form = $('#form');
  const note = $('#note');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = form.nama.value.trim();
    const pesan = form.pesan.value.trim();
    [form.nama, form.pesan].forEach((f) => f.classList.remove('is-error'));

    if (!nama || !pesan) {
      if (!nama) form.nama.classList.add('is-error');
      if (!pesan) form.pesan.classList.add('is-error');
      note.textContent = 'Lengkapi nama dan pesan terlebih dahulu.';
      return;
    }
    const text = `Halo QQ Software, saya ${nama}.\nLayanan: ${form.layanan.value}\n\n${pesan}`;
    openWhatsApp(text);
    note.textContent = 'Terima kasih! WhatsApp terbuka dengan pesan Anda.';
    form.reset();
  });

  // Tombol WA cepat (hero & tombol melayang): langsung kirim template pesan
  $$('[data-wa-template]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openWhatsApp(btn.dataset.waTemplate);
    });
  });
})();
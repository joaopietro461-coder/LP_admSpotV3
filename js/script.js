/* ==========================================================
   AdmSpot - Landing page de Gestão de Ordem de Serviço
   ========================================================== */
(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  var nav = document.getElementById('mainNav');
  var burger = document.getElementById('burger');
  var navItems = document.querySelectorAll('.nav-item');

  /* ---------- Sombra do cabeçalho ao rolar ---------- */
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menus do cabeçalho (abrem ao clicar) ---------- */
  function closeMenus(except) {
    navItems.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('open');
      var btn = item.querySelector('button.nav-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  navItems.forEach(function (item) {
    var btn = item.querySelector('button.nav-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !item.classList.contains('open');
      closeMenus(item);
      item.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });

  /* ---------- Menu no celular ---------- */
  function setNav(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (!open) closeMenus();
  }

  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    setNav(!nav.classList.contains('is-open'));
  });

  // clicar em qualquer link dentro do menu fecha tudo
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenus();
      setNav(false);
    });
  });

  // clicar fora fecha os painéis
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-item')) closeMenus();
    if (nav.classList.contains('is-open') && !header.contains(e.target)) setNav(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeMenus();
    setNav(false);
  });

  /* ---------- Animação de entrada ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('show'); });
  }

  /* ---------- Janela "todos os benefícios" ---------- */
  document.querySelectorAll('[data-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dlg = document.getElementById(btn.getAttribute('data-open'));
      if (!dlg) return;
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
    });
  });

  document.querySelectorAll('dialog.modal').forEach(function (dlg) {
    function close() {
      if (typeof dlg.close === 'function') dlg.close();
      else dlg.removeAttribute('open');
      document.body.style.overflow = '';
    }
    dlg.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); }); // clique no fundo
    dlg.addEventListener('close', function () { document.body.style.overflow = ''; });
  });

  /* ---------- FAQ: abre um item por vez ---------- */
  var faq = document.querySelectorAll('.faq details');
  faq.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faq.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  /* ---------- Infinite marquee (faixa rolando) ----------
     Rolagem contínua por requestAnimationFrame: o conteúdo anda sempre
     para a esquerda e, ao percorrer a largura de 1 grupo, volta ao ponto
     inicial sem salto, corte ou espaço vazio (como carrossel de loja). */
  var track = document.getElementById('stripTrack');
  var marquee = { x: 0, width: 0, speed: 55, last: 0 };

  function buildMarquee() {
    if (!track) return;
    var groups = track.querySelectorAll('.strip-group');
    var base = groups[0];
    if (!base) return;

    for (var i = groups.length - 1; i > 0; i--) track.removeChild(groups[i]);

    var w = base.getBoundingClientRect().width;
    if (!w) return;

    // clones suficientes para sempre preencher a tela inteira
    var copies = Math.ceil(window.innerWidth / w) + 1;
    for (var n = 0; n < copies; n++) {
      var clone = base.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }

    var speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--marquee-speed'));
    marquee.speed = speed > 0 ? speed : 55;
    marquee.width = w;
    marquee.x = -(Math.abs(marquee.x) % w);
  }

  function tick(now) {
    var dt = Math.min(now - (marquee.last || now), 100) / 1000;
    marquee.last = now;
    if (marquee.width) {
      marquee.x -= marquee.speed * dt;
      if (marquee.x <= -marquee.width) marquee.x += marquee.width;
      track.style.transform = 'translate3d(' + marquee.x.toFixed(2) + 'px, 0, 0)';
    }
    requestAnimationFrame(tick);
  }

  if (track) {
    buildMarquee();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildMarquee);
    window.addEventListener('load', buildMarquee);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildMarquee, 150);
    });

    requestAnimationFrame(tick);
  }
})();

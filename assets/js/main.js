// assets/js/main.js

// アンカーリンクをスムーススクロールにする
document.addEventListener('click', (e) => {
  const target = e.target.closest('a.js-scroll, a[href^="#"]');
  if (!target) return;

  const href = target.getAttribute('href');
  if (!href || !href.startsWith('#')) return;

  const el = document.querySelector(href);
  if (!el) return;

  e.preventDefault();
  const header = document.querySelector('.site-header');
  const headerHeight = header ? header.offsetHeight : 0;
  const rect = el.getBoundingClientRect();
  const offset = rect.top + window.pageYOffset - headerHeight - 8;

  window.scrollTo({
    top: offset,
    behavior: 'smooth',
  });
});

// セクション位置に応じてヘッダーナビに is-current を付与
(function () {
  const sections = [
    { id: '#philosophy', link: 'a[href$="#philosophy"]' },
    { id: '#activities', link: 'a[href$="#activities"]' },
    { id: '#contact',    link: 'a[href$="#contact"]' },
  ];

  const links = sections.map(s => ({
    id: s.id,
    el: document.querySelector(s.link),
  }));

  if (!links.length) return;

  const onScroll = () => {
    const y = window.pageYOffset;
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 0;
    const threshold = headerHeight + 40;

    let currentId = null;
    for (const s of sections) {
      const secEl = document.querySelector(s.id);
      if (!secEl) continue;
      const top = secEl.offsetTop - threshold;
      if (y >= top) currentId = s.id;
    }

    links.forEach(l => {
      if (!l.el) return;
      if (l.id === currentId) {
        l.el.classList.add('is-current');
      } else {
        l.el.classList.remove('is-current');
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', onScroll);
})();

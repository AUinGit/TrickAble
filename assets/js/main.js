// assets/js/main.js

// 共通ヘッダー／フッターを読み込む
(async () => {
  const containers = document.querySelectorAll('[data-include]');

  // 共通パーツがないページ（将来の単独ページなど）のため
  if (!containers.length) {
    setupCurrentNav();
    setupSmoothScroll();
    setupSectionCurrent();
    setupContactFormRedirect();
    return;
  }

  for (const el of containers) {
    const url = el.getAttribute('data-include');
    if (!url) continue;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error('include failed (status):', url, res.status);
        continue;
      }
      const html = await res.text();
      el.innerHTML = html;
    } catch (e) {
      console.error('include failed (exception):', url, e);
    }
  }

  // 差し込みが終わってから各種セットアップ
  setupCurrentNav();
  setupSmoothScroll();
  setupSectionCurrent();
  setupContactFormRedirect();
})();

// 現在ページに応じて .global-nav に is-current を付与
function setupCurrentNav() {
  const body = document.body;
  const page = body.getAttribute('data-page') || 'home';
  const nav = document.querySelector('.global-nav');
  if (!nav) return;

  const links = nav.querySelectorAll('a');
  links.forEach(a => a.classList.remove('is-current'));

  if (page === 'about') {
    const link = nav.querySelector('a[href="about.html"]');
    if (link) link.classList.add('is-current');
  } else if (page === 'contact') {
    const link = nav.querySelector('a[href="contact.html"], a[href$="#contact"]');
    if (link) link.classList.add('is-current');
  } else {
    // home の場合はスクロール連動で付与する
  }
}

// アンカーリンクをスムーススクロールにする
function setupSmoothScroll() {
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
}

// セクション位置に応じてヘッダーナビに is-current を付与（トップページ）
function setupSectionCurrent() {
  const body = document.body;
  const page = body.getAttribute('data-page') || 'home';
  if (page !== 'home') return;

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
}

// TrickAble お問い合わせフォーム   Googleフォームへリダイレクト
function setupContactFormRedirect() {
  const form = document.getElementById('ta-contact-form');
  if (!form) return;

  const GOOGLE_FORM_BASE =
    'https://docs.google.com/forms/d/e/1FAIpQLSchlnIKnr24x_NjLuduVKcPFfgoxDsuH5OpgHce6eUvyswR6Q/viewform?usp=pp_url';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl       = document.getElementById('name');
    const emailEl      = document.getElementById('email');
    const telEl        = document.getElementById('tel');
    const orgEl        = document.getElementById('org');
    const typeEl       = document.getElementById('type');
    const typeDetailEl = document.getElementById('type-detail');
    const messageEl    = document.getElementById('message');
    const refEl        = document.getElementById('ref');

    const name       = nameEl       ? nameEl.value.trim()       : '';
    const email      = emailEl      ? emailEl.value.trim()      : '';
    const tel        = telEl        ? telEl.value.trim()        : '';
    const org        = orgEl        ? orgEl.value.trim()        : '';
    const type       = typeEl       ? typeEl.value.trim()       : '';
    const typeDetail = typeDetailEl ? typeDetailEl.value.trim() : '';
    const message    = messageEl    ? messageEl.value.trim()    : '';
    const ref        = refEl        ? refEl.value.trim()        : '';

    if (!name || !email || !type || !message) {
      alert('お名前・メールアドレス・お問い合わせ種別・お問い合わせ内容を入力してください。');
      return;
    }

    const params = new URLSearchParams();

    // 事前入力URLと同じ構造
    params.set('entry.88881716', name);
    params.set('entry.741727298', email);

    if (tel) {
      params.set('entry.1753640320', tel);
    }

    if (org) {
      params.set('entry.2144785332', org);
    }

    if (type === 'その他') {
      params.set('entry.1682830520', '__other_option__');
      params.set(
        'entry.1682830520.other_option_response',
        typeDetail || 'その他'
      );
    } else if (type) {
      params.set('entry.1682830520', type);
    }

    params.set('entry.1713069066', message);

    if (ref) {
      params.set('entry.1711366111', ref);
    }

    const redirectUrl = `${GOOGLE_FORM_BASE}&${params.toString()}`;
    window.location.href = redirectUrl;
  });
}

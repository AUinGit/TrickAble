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

// TrickAble お問い合わせフォーム → Googleフォームへリダイレクト
(function () {
  const form = document.getElementById('ta-contact-form');
  if (!form) return;

  const typeSelect    = document.getElementById('type');
  const typeDetailRow = document.getElementById('type-detail-row');

  // ★ その他欄の表示・非表示を切り替え
  const updateTypeDetailVisibility = () => {
    if (!typeSelect || !typeDetailRow) return;
    const v = typeSelect.value.trim();
    if (v === 'その他') {
      typeDetailRow.style.display = '';
    } else {
      typeDetailRow.style.display = 'none';
    }
  };

  // 初期状態では隠しておく
  if (typeDetailRow) {
    typeDetailRow.style.display = 'none';
  }
  if (typeSelect) {
    typeSelect.addEventListener('change', updateTypeDetailVisibility);
  }

  // Google フォームの事前入力ベースURL
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

    // 必須チェック
    if (!name || !email || !type || !message) {
      alert('お名前・メールアドレス・お問い合わせ種別・お問い合わせ内容を入力してください。');
      return;
    }

    const params = new URLSearchParams();

    // entry マッピング
    // &entry.88881716                     = お名前
    // &entry.741727298                    = メールアドレス
    // &entry.1753640320                   = 電話番号
    // &entry.2144785332                   = 所属
    // &entry.1682830520                   = 種別（通常） or "__other_option__"（その他）
    // &entry.1682830520.other_option_response = その他の内容
    // &entry.1713069066                   = お問い合わせ内容
    // &entry.1711366111                   = 参考リンク

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
})();

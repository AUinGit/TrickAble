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

  // Google フォームの事前入力ベースURL
  const GOOGLE_FORM_BASE =
    'https://docs.google.com/forms/d/e/1FAIpQLSchlnIKnr24x_NjLuduVKcPFfgoxDsuH5OpgHce6eUvyswR6Q/viewform?usp=pp_url';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl    = document.getElementById('name');
    const emailEl   = document.getElementById('email');
    const telEl     = document.getElementById('tel');
    const orgEl     = document.getElementById('org');
    const typeEl    = document.getElementById('type');
    const messageEl = document.getElementById('message');
    const refEl     = document.getElementById('ref');

    const name    = nameEl    ? nameEl.value.trim()    : '';
    const email   = emailEl   ? emailEl.value.trim()   : '';
    const tel     = telEl     ? telEl.value.trim()     : '';
    const org     = orgEl     ? orgEl.value.trim()     : '';
    const type    = typeEl    ? typeEl.value.trim()    : '';
    const message = messageEl ? messageEl.value.trim() : '';
    const ref     = refEl     ? refEl.value.trim()     : '';

    // contact.html 側の required と合わせた必須チェック
    if (!name || !email || !type || !message) {
      alert('お名前・メールアドレス・お問い合わせ種別・お問い合わせ内容を入力してください。');
      return;
    }

    const params = new URLSearchParams();

    // あなたの事前入力URLと同じ形にする：
    // &entry.88881716 = お名前
    // &entry.741727298= メールアドレス
    // &entry.1753640320= 電話番号
    // &entry.2144785332= 所属
    // &entry.1682830520= __other_option__        ← 常に「その他」を選択状態にする
    // &entry.1682830520.other_option_response= 種別テキスト
    // &entry.1713069066= お問い合わせ内容
    // &entry.1711366111= 参考リンク

    // お名前
    params.set('entry.88881716', name);

    // メールアドレス（フォーム設定とは別に、質問欄にも事前入力）
    params.set('entry.741727298', email);

    // 電話番号
    if (tel) {
      params.set('entry.1753640320', tel);
    }

    // ご所属
    if (org) {
      params.set('entry.2144785332', org);
    }

    // お問い合わせ種別：
    // どの選択肢を選んでも Google フォーム側では「その他」をONにし、
    // そのテキスト欄に選択されたラベル文字列を入れる。
    params.set('entry.1682830520', '__other_option__');
    params.set('entry.1682830520.other_option_response', type);

    // お問い合わせ内容（メールアドレスは本文に付けない）
    params.set('entry.1713069066', message);

    // 参考リンク
    if (ref) {
      params.set('entry.1711366111', ref);
    }

    const redirectUrl = `${GOOGLE_FORM_BASE}&${params.toString()}`;

    window.location.href = redirectUrl;
  });
})();

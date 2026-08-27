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

  // GoogleフォームのベースURL（事前入力用）
  const GOOGLE_FORM_BASE =
    'https://docs.google.com/forms/d/e/1FAIpQLSchlnIKnr24x_NjLuduVKcPFfgoxDsuH5OpgHce6eUvyswR6Q/viewform?usp=pp_url';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // TrickAble 側の入力値を取得
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

    // 必須チェック（contact.html 側の required と合わせておく）
    if (!name || !email || !type || !message) {
      alert('お名前・メールアドレス・お問い合わせ種別・お問い合わせ内容を入力してください。');
      return;
    }

    // Googleフォーム項目へのマッピング
    // あなたの事前入力URLから確定した対応：
    //  - entry.88881716           ← お名前
    //  - entry.1753640320         ← 電話番号
    //  - entry.2144785332         ← ご所属
    //  - entry.1682830520         ← お問い合わせ種別（選択式／その他）
    //  - entry.1682830520.other_option_response ← 「その他」の自由入力
    //  - entry.1713069066         ← お問い合わせ内容
    //  - entry.1711366111         ← 参考リンク・URL
    //
    // メールアドレスはフォーム設定の「メールアドレス収集」でGoogle側が自動取得するので、
    // ここからは直接いじらない（メッセージに含めたいなら本文に追記してもよい）。

    const params = new URLSearchParams();

    // お名前
    params.set('entry.88881716', name);

    // 電話番号
    if (tel) {
      params.set('entry.1753640320', tel);
    }

    // ご所属
    if (org) {
      params.set('entry.2144785332', org);
    }

    // お問い合わせ種別
    // Googleフォーム側では通常の選択肢＋「その他」がある構成なので、
    // - 通常の4種（プロダクト企画・デスク環境・UI/インタラクション・メディア/取材）は
    //   そのまま entry.1682830520 に入れる
    // - TrickAble 側で「その他」を選んだ場合は、Googleフォーム側で
    //   「その他」を選んだ状態にしつつ .other_option_response に中身を書く、という運用もできる
    //
    // ここではシンプルに：
    //   通常の選択肢 → そのまま entry.1682830520 に入れる
    //   その他       → entry.1682830520 に "__other_option__",
    //                   entry.1682830520.other_option_response に "その他: ...本文" と入れる
    if (type === 'その他') {
      params.set('entry.1682830520', '__other_option__');
      params.set('entry.1682830520.other_option_response', 'その他');
    } else if (type) {
      params.set('entry.1682830520', type);
    }

    // お問い合わせ内容
    params.set('entry.1713069066', message);

    // 参考リンク
    if (ref) {
      params.set('entry.1711366111', ref);
    }

    // 必要なら、メールアドレスを本文に追記してGoogle側にも残せる
    // （メール収集はGoogleが別でやるが、問い合わせ履歴として本文に残ると便利）
    // params.set('entry.1713069066', `${message}\n\n[連絡先メールアドレス] ${email}`);

    const redirectUrl = `${GOOGLE_FORM_BASE}&${params.toString()}`;

    window.location.href = redirectUrl;
  });
})();

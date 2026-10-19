/* =========================================================
   clair veil — 全ページ共通の処理
   ・ヘッダー / フッター / サンプル表示 / 固定予約ボタンの差し込み
   ・スマホメニューの開閉
   ・スクロール演出、オープニング演出
   ========================================================= */
(function () {
  document.documentElement.classList.add("js");

  const NAV = [
    { href: "index.html",   key: "top",     ja: "トップ",           en: "Top" },
    { href: "concept.html", key: "concept", ja: "コンセプト",       en: "Concept" },
    { href: "menu.html",    key: "menu",    ja: "メニュー・料金",   en: "Menu" },
    { href: "style.html",   key: "style",   ja: "スタイル",         en: "Style" },
    { href: "staff.html",   key: "staff",   ja: "スタッフ",         en: "Staff" },
    { href: "chat.html",    key: "chat",    ja: "来店前チャット相談", en: "Chat" }
  ];
  const current = document.body.dataset.page;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- オープニング（初回のみ・約1.4秒） ---------- */
  let seen = false;
  try { seen = sessionStorage.getItem("cv-opening") === "1"; } catch (e) { seen = true; }
  if (current === "top" && !seen && !reduceMotion) {
    const op = document.createElement("div");
    op.className = "opening";
    op.setAttribute("aria-hidden", "true");
    op.innerHTML = '<div class="opening__logo">clair veil</div>';
    document.body.prepend(op);
    setTimeout(() => op.remove(), 1500);
    try { sessionStorage.setItem("cv-opening", "1"); } catch (e) {}
  }

  /* ---------- ヘッダー ---------- */
  const navItems = NAV.map(n =>
    `<li><a href="${n.href}"${n.key === current ? ' aria-current="page"' : ""}>${n.ja}<span class="en">${n.en}</span></a></li>`
  ).join("");
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="site-header__inner">
      <a class="logo" href="index.html" aria-label="clair veil トップへ">clair veil<small>HAIR SALON</small></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="gnav" aria-label="メニューを開く"><span></span></button>
      <nav class="gnav" id="gnav" aria-label="サイト内メニュー">
        <ul>
          ${navItems}
          <li><a class="gnav__reserve" href="reserve.html"${current === "reserve" ? ' aria-current="page"' : ""}>アクセス・予約</a></li>
        </ul>
      </nav>
    </div>`;
  document.body.prepend(header);

  const toggle = header.querySelector(".menu-toggle");
  const gnav = header.querySelector(".gnav");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    gnav.classList.toggle("is-open", open);
    header.classList.toggle("is-menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  gnav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }, { passive: true });

  /* ---------- フッター（サンプル表示つき） ---------- */
  const s = window.CV && CV.shop;
  const footer = document.createElement("footer");
  footer.innerHTML = `
    <p class="sample-banner">このサイトは制作サンプルです（架空の店舗）</p>
    <div class="site-footer">
      <div class="wrap site-footer__grid">
        <div>
          <a class="logo" href="index.html">clair veil<small>HAIR SALON</small></a>
          <p class="site-footer__info">
            ${s ? `${s.address}<br>${s.access}<br>営業 ${s.hours}／定休 ${s.holiday}` : ""}
          </p>
        </div>
        <nav class="site-footer__nav" aria-label="フッターメニュー">
          <ul>
            ${NAV.map(n => `<li><a href="${n.href}">${n.ja}</a></li>`).join("")}
            <li><a href="reserve.html">アクセス・予約</a></li>
          </ul>
        </nav>
      </div>
      <p class="site-footer__copy">© clair veil — sample site (fictional salon)</p>
    </div>`;
  document.body.append(footer);

  /* ---------- スマホ用 固定予約ボタン ---------- */
  if (current !== "reserve") {
    const fixed = document.createElement("a");
    fixed.className = "btn fixed-reserve";
    fixed.href = "reserve.html";
    fixed.textContent = "予約する";
    document.body.append(fixed);
    // フッター付近では隠して、フッターのリンクを押しやすくする
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => fixed.classList.toggle("is-hidden", en.isIntersecting))
        .observe(footer.querySelector(".site-footer__copy"));
    }
  }

  /* ---------- スクロール演出 ---------- */
  // あとから JavaScript で差し込んだ要素にも使えるよう、関数にしておく
  const io = (!reduceMotion && "IntersectionObserver" in window)
    ? new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 })
    : null;
  CV.observeReveal = (els) => els.forEach(t => io ? io.observe(t) : t.classList.add("is-visible"));
  CV.observeReveal(document.querySelectorAll(".reveal"));

  /* ---------- 便利関数（他のファイルからも使う） ---------- */
  CV.yen = (n) => n.toLocaleString("ja-JP") + "円";
  CV.minutes = (m) => {
    const h = Math.floor(m / 60), r = m % 60;
    return h ? `${h}時間${r ? r + "分" : ""}` : `${r}分`;
  };
  // 料金計算（料金シミュレーターとチャットで共通）
  CV.calc = (len, ids) => {
    const items = ids.map(id => CV.menus.find(m => m.id === id)).filter(Boolean);
    const subtotal = items.reduce((s, m) => s + m.price[len], 0);
    const time = items.reduce((s, m) => s + m.time[len], 0);
    const discounts = CV.discounts.filter(d => d.when(ids));
    const save = discounts.reduce((s, d) => s + d.amount, 0);
    return { len, items, subtotal, time, discounts, save, total: subtotal - save };
  };
})();

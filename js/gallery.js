/* =========================================================
   clair veil — スタイルギャラリー＋カラーシミュレーター
   ========================================================= */
(function () {
  const lenName = Object.fromEntries(CV.lengths.map(l => [l.id, l.name]));
  const toneName = Object.fromEntries(CV.tones.map(t => [t.id, t.name]));
  const menuName = Object.fromEntries(CV.menus.map(m => [m.id, m.name]));
  const staffById = Object.fromEntries(CV.staff.map(s => [s.id, s]));
  const simUrl = (menus, len) => {
    const p = new URLSearchParams();
    if (len) p.set("len", len);
    p.set("menu", menus.join(","));
    return "menu.html?" + p + "#simulator";
  };

  /* ================= ギャラリー ================= */
  const list = document.getElementById("gallery-list");
  const empty = document.getElementById("gallery-empty");
  const count = document.getElementById("g-count");
  const filter = { len: "all", tone: "all" };
  let shown = [];

  // 絞り込みボタン
  const groups = {
    len: [{ id: "all", name: "すべて" }, ...CV.lengths],
    tone: [{ id: "all", name: "すべて" }, ...CV.tones]
  };
  document.querySelectorAll("[data-filter]").forEach(box => {
    const key = box.dataset.filter;
    box.innerHTML = groups[key].map(o =>
      `<button type="button" class="chip" data-value="${o.id}" aria-pressed="${o.id === "all"}">${o.name.replace("系", "")}</button>`
    ).join("");
    box.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      filter[key] = b.dataset.value;
      box.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      renderGallery();
    });
  });
  empty.querySelector("[data-clear]").addEventListener("click", () => {
    filter.len = filter.tone = "all";
    document.querySelectorAll("[data-filter] button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.value === "all")));
    renderGallery();
  });

  function renderGallery() {
    shown = CV.styles.filter(s =>
      (filter.len === "all" || s.len === filter.len) && (filter.tone === "all" || s.tone === filter.tone));
    count.textContent = shown.length;
    empty.hidden = shown.length > 0;
    list.innerHTML = shown.map(s => `
      <li class="g-item">
        <button type="button" class="g-item__btn" data-open="${s.id}" aria-label="${s.name}を拡大表示">
          <span class="g-item__img"><img class="photo" src="images/${s.img}.jpg" alt="" loading="lazy" width="900" height="1125"></span>
          <span class="g-item__name">${s.name}</span>
          <span class="g-item__tag">${lenName[s.len]}／${toneName[s.tone]}</span>
        </button>
      </li>`).join("");
  }

  /* ---------- 拡大表示 ---------- */
  const lb = document.getElementById("lightbox");
  let current = null;
  function openStyle(id) {
    const s = CV.styles.find(x => x.id === id);
    if (!s) return;
    current = s;
    const st = staffById[s.staff];
    lb.querySelector("#lb-img").src = `images/${s.img}.jpg`;
    lb.querySelector("#lb-img").alt = s.name;
    lb.querySelector("#lb-tags").textContent = `${lenName[s.len]}／${toneName[s.tone]}`;
    lb.querySelector("#lb-name").textContent = s.name;
    lb.querySelector("#lb-point").textContent = s.point;
    lb.querySelector("#lb-staff").innerHTML = `
      <img src="${st.photo}" alt="" width="48" height="48">
      <span><small>担当</small>${st.role}　${st.name}</span>`;
    lb.querySelector("#lb-menus").innerHTML = "おすすめメニュー：" + s.menus.map(m => `<span>${menuName[m]}</span>`).join("");
    lb.querySelector("#lb-sim").href = simUrl(s.menus, s.len);
    // 前後のボタン（絞り込み中の一覧の中で移動）
    const idx = shown.findIndex(x => x.id === s.id);
    lb.querySelector('[data-lb="prev"]').disabled = idx <= 0;
    lb.querySelector('[data-lb="next"]').disabled = idx < 0 || idx >= shown.length - 1;
    if (!lb.open) { lb.showModal(); document.body.style.overflow = "hidden"; }
  }
  function closeLb() { lb.close(); }
  lb.addEventListener("close", () => { document.body.style.overflow = ""; });

  list.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) openStyle(Number(b.dataset.open));
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb) return closeLb();           // 外側（暗い部分）を押したら閉じる
    const act = e.target.closest("[data-lb]");
    if (!act) return;
    const idx = shown.findIndex(x => x.id === current.id);
    if (act.dataset.lb === "close") closeLb();
    if (act.dataset.lb === "prev" && idx > 0) openStyle(shown[idx - 1].id);
    if (act.dataset.lb === "next" && idx < shown.length - 1) openStyle(shown[idx + 1].id);
  });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") lb.querySelector('[data-lb="prev"]').click();
    if (e.key === "ArrowRight") lb.querySelector('[data-lb="next"]').click();
  });

  renderGallery();

  // トップページなどから ?open=番号 で来たら、そのスタイルを開く
  const openId = Number(new URLSearchParams(location.search).get("open"));
  if (openId) openStyle(openId);

  /* ================= カラーシミュレーター ================= */
  const sw = document.getElementById("swatches");
  const info = document.getElementById("csim-info");
  const svg = document.getElementById("hair-svg");

  sw.innerHTML = CV.colors.map((c, i) => `
    <button type="button" class="swatch" role="radio" aria-checked="${i === 0}" data-color="${c.id}" tabindex="${i === 0 ? 0 : -1}">
      <span class="swatch__dot" style="background:${c.hex}"></span>
      <span class="swatch__name">${c.name}</span>
    </button>`).join("");

  function pickColor(id) {
    const c = CV.colors.find(x => x.id === id);
    svg.style.setProperty("--hair", c.hex);
    sw.querySelectorAll(".swatch").forEach(b => {
      const on = b.dataset.color === id;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    info.innerHTML = `
      <h3 class="csim__name">${c.name}</h3>
      <p class="csim__text">${c.text}</p>
      <dl class="csim__spec">
        <div><dt>ブリーチ</dt><dd><span class="badge ${c.bleach ? "badge--need" : "badge--ok"}">${c.bleach ? "必要" : "不要"}</span></dd></div>
        <div><dt>色持ちの目安</dt><dd>${c.keep}</dd></div>
        <div><dt>おすすめメニュー</dt><dd>${c.menus.map(m => menuName[m]).join("＋")}</dd></div>
      </dl>
      <a class="btn btn--wide" href="${simUrl(c.menus)}">この色の料金を見る</a>`;
  }
  sw.addEventListener("click", (e) => {
    const b = e.target.closest(".swatch");
    if (b) pickColor(b.dataset.color);
  });
  // 矢印キーでも色を選べるように
  sw.addEventListener("keydown", (e) => {
    const btns = [...sw.querySelectorAll(".swatch")];
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    const next = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!next) return;
    e.preventDefault();
    const b = btns[(i + next + btns.length) % btns.length];
    b.focus(); pickColor(b.dataset.color);
  });
  pickColor(CV.colors[0].id);
})();

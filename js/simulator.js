/* =========================================================
   clair veil — 料金シミュレーター
   STEP1 長さ → STEP2 メニュー → STEP3 結果
   URL で ?len=long&menu=cut,color を渡すと、選ばれた状態で開きます
   ========================================================= */
(function () {
  const lenList = document.getElementById("len-list");
  const menuList = document.getElementById("menu-list");
  const result = document.getElementById("result");
  const priceBody = document.querySelector("#price-table tbody");
  if (!lenList || !menuList) return;

  const state = { len: null, menus: [] };
  const menuById = Object.fromEntries(CV.menus.map(m => [m.id, m]));
  const lenById = Object.fromEntries(CV.lengths.map(l => [l.id, l]));

  /* 長さのイラスト（髪の長さで線の長さが変わる） */
  const lenIcon = (id) => {
    const y = { short: 34, medium: 44, long: 54 }[id];
    return `<svg class="len-icon" viewBox="0 0 60 60" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
      <circle cx="30" cy="22" r="10"/>
      <path d="M18 24c-2 ${y - 24}-1 ${y - 22} 2 ${y - 22}M42 24c2 ${y - 24} 1 ${y - 22}-2 ${y - 22}"/>
      <path d="M19 19c2-9 20-9 22 0"/>
    </svg>`;
  };

  /* 料金の文字（長さ未選択なら最低料金に「〜」を付ける） */
  function priceLabel(m) {
    if (state.len) return CV.yen(m.price[state.len]);
    const vals = Object.values(m.price);
    const min = Math.min(...vals);
    return CV.yen(min) + (Math.max(...vals) > min ? "〜" : "");
  }
  function timeLabel(m) {
    return "約" + CV.minutes(state.len ? m.time[state.len] : m.time.short);
  }

  /* ---------- 画面を作る ---------- */
  lenList.innerHTML = CV.lengths.map(l => `
    <label class="choice choice--len">
      <input type="radio" name="len" value="${l.id}">
      <span class="choice__card">
        ${lenIcon(l.id)}
        <span class="choice__name">${l.name}</span>
        <span class="choice__desc">${l.desc}</span>
      </span>
    </label>`).join("");

  menuList.innerHTML = CV.menus.map(m => `
    <label class="choice">
      <input type="checkbox" name="menu" value="${m.id}">
      <span class="choice__card">
        <span class="choice__name">${m.name}</span>
        <span class="choice__desc">${m.desc}</span>
        <span class="choice__meta"><span class="choice__price" data-price="${m.id}"></span><span class="choice__time" data-time="${m.id}"></span></span>
        <span class="choice__note" data-note="${m.id}"></span>
      </span>
    </label>`).join("");

  if (priceBody) {
    priceBody.innerHTML = CV.menus.map(m => {
      const same = new Set(Object.values(m.price)).size === 1;
      const cells = same
        ? `<td colspan="3" style="text-align:center">${CV.yen(m.price.short)}<span class="time">約${CV.minutes(m.time.short)}</span></td>`
        : CV.lengths.map(l => `<td>${CV.yen(m.price[l.id])}<span class="time">約${CV.minutes(m.time[l.id])}</span></td>`).join("");
      return `<tr><th scope="row">${m.name}<small>${m.desc}</small></th>${cells}</tr>`;
    }).join("");
  }

  /* ---------- 計算 ---------- */
  // 長さ未選択のときは、いちばん安いショート料金で「〜」付きで出す
  const calc = () => CV.calc(state.len || "short", state.menus);

  /* ---------- 表示を更新 ---------- */
  function render(animate) {
    const r = calc();
    const approx = !state.len && r.items.length ? "〜" : "";

    // カードの料金・同時に選べないメニュー
    // swap なら「選ぶと入れ替わる」案内だけ、そうでなければ選べなくする
    const blocked = {};
    state.menus.forEach(id => {
      const m = menuById[id];
      (m.excludes || []).forEach(x => {
        blocked[x] = m.swap
          ? { hard: false, note: `選ぶと「${m.name}」と入れ替わります` }
          : { hard: true, note: m.excludeNote };
      });
    });
    CV.menus.forEach(m => {
      document.querySelector(`[data-price="${m.id}"]`).textContent = priceLabel(m);
      document.querySelector(`[data-time="${m.id}"]`).textContent = timeLabel(m);
      const input = menuList.querySelector(`input[value="${m.id}"]`);
      input.checked = state.menus.includes(m.id);
      input.disabled = !!(blocked[m.id] && blocked[m.id].hard);
      document.querySelector(`[data-note="${m.id}"]`).textContent = blocked[m.id] ? blocked[m.id].note : "";
    });
    lenList.querySelectorAll("input").forEach(i => { i.checked = i.value === state.len; });

    // 合計（PC右側・スマホ下バー）
    document.querySelectorAll('[data-sum="total"]').forEach(el => {
      el.innerHTML = `${r.total.toLocaleString("ja-JP")}<small>円${approx}</small>`;
      if (animate) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    });
    document.querySelectorAll('[data-sum="time"]').forEach(el => { el.textContent = CV.minutes(r.time); });
    document.querySelectorAll('[data-sum="save"]').forEach(el => {
      el.hidden = !r.save;
      el.textContent = `セット割で −${CV.yen(r.save)}`;
    });
    document.querySelectorAll('[data-sum="save-s"]').forEach(el => { el.textContent = r.save ? `セット割 −${CV.yen(r.save)}` : ""; });
    document.querySelectorAll('[data-sum="len"]').forEach(el => {
      el.textContent = state.len
        ? `${lenById[state.len].name}・${r.items.length}メニュー選択中`
        : "STEP1 で髪の長さを選ぶと金額が確定します";
    });

    // STEP3 結果
    if (!r.items.length) {
      result.innerHTML = `<p class="sim-result__empty">STEP2 でメニューを選ぶと、ここに内訳が表示されます。</p>`;
      return;
    }
    const rows = r.items.map(m => {
      const varies = new Set(Object.values(m.price)).size > 1;
      const sub = varies ? (state.len ? `${lenById[state.len].name}料金` : "長さ未選択のため最低料金") : "";
      return `<li><span>${m.name}${sub ? `<span class="sub">${sub}・約${CV.minutes(m.time[r.len])}</span>` : `<span class="sub">約${CV.minutes(m.time[r.len])}</span>`}</span><span>${CV.yen(m.price[r.len])}</span></li>`;
    }).join("");
    const discRows = r.discounts.map(d =>
      `<li class="is-discount"><span>${d.name}</span><span>−${CV.yen(d.amount)}</span></li>`).join("");

    result.innerHTML = `
      <ul class="breakdown">${rows}${discRows}</ul>
      <div class="result-total">
        <span>合計（税込）<br><span class="result-total__price">${CV.yen(r.total)}${approx}</span></span>
        <span class="result-total__time">所要時間 約${CV.minutes(r.time)}</span>
      </div>
      ${state.len ? "" : `<p class="sim-notice" style="color:var(--c-sale)">※ STEP1 で髪の長さを選ぶと、正確な金額になります。</p>`}
      <div class="result-actions">
        <button class="btn btn--ghost" type="button" data-reset>選び直す</button>
        <a class="btn" href="${reserveUrl()}"${state.len ? "" : ' aria-disabled="true"'}>この内容で予約する</a>
      </div>
      <p class="sim-notice">所要時間は目安です。※架空の店舗のため、料金はすべて架空です。</p>`;
  }

  function reserveUrl() {
    const p = new URLSearchParams();
    if (state.len) p.set("len", state.len);
    if (state.menus.length) p.set("menu", state.menus.join(","));
    return "reserve.html?" + p.toString();
  }

  /* ---------- 操作 ---------- */
  lenList.addEventListener("change", (e) => { state.len = e.target.value; render(true); });
  menuList.addEventListener("change", (e) => {
    const id = e.target.value;
    if (e.target.checked) {
      // 同時に選べないメニューを外す
      state.menus = state.menus.filter(x => !(menuById[id].excludes || []).includes(x));
      state.menus.push(id);
      // 表示の順番をメニュー順にそろえる
      state.menus.sort((a, b) => CV.menus.indexOf(menuById[a]) - CV.menus.indexOf(menuById[b]));
    } else {
      state.menus = state.menus.filter(x => x !== id);
    }
    render(true);
  });
  result.addEventListener("click", (e) => {
    if (!e.target.closest("[data-reset]")) return;
    state.len = null; state.menus = [];
    history.replaceState(null, "", location.pathname + "#simulator");
    document.getElementById("sim-from").hidden = true;
    render(false);
    document.getElementById("step1").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- URL から引き継ぎ（チャット相談から来た場合など） ---------- */
  const q = new URLSearchParams(location.search);
  if (lenById[q.get("len")]) state.len = q.get("len");
  (q.get("menu") || "").split(",").forEach(id => {
    if (menuById[id] && !state.menus.includes(id)) state.menus.push(id);
  });
  if (q.get("from") === "chat" && state.menus.length) {
    const from = document.getElementById("sim-from");
    from.hidden = false;
    from.textContent = "チャット相談のおすすめメニューを選んだ状態にしています。自由に変更できます。";
  }

  render(false);
})();

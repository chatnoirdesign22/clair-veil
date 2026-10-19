/* =========================================================
   clair veil — 予約フォームの見本
   ・どこにも送信・保存しません（送信ボタンは画面を切り替えるだけ）
   ・?len=long&menu=cut,color&staff=rin で来た場合は、その内容を入れておきます
   ========================================================= */
(function () {
  const form = document.getElementById("rform");
  if (!form) return;
  const done = document.getElementById("rdone");
  const $ = (id) => document.getElementById(id);
  const menuById = Object.fromEntries(CV.menus.map(m => [m.id, m]));

  /* ---------- 選択肢をつくる ---------- */
  // 日付：明日〜60日後
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date();
  $("f-date").min = ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
  $("f-date").max = ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60));

  // 時間：10:00〜18:30（30分ごと）
  for (let t = 10 * 60; t <= 18 * 60 + 30; t += 30) {
    const v = `${Math.floor(t / 60)}:${pad(t % 60)}`;
    $("f-time").insertAdjacentHTML("beforeend", `<option value="${v}">${v}</option>`);
  }

  $("f-len").innerHTML = CV.lengths.map(l => `
    <label class="choice choice--len choice--sm">
      <input type="radio" name="len" value="${l.id}">
      <span class="choice__card"><span class="choice__name">${l.name}</span><span class="choice__desc">${l.desc}</span></span>
    </label>`).join("");

  $("f-menus").innerHTML = CV.menus.map(m => `
    <label class="choice choice--sm">
      <input type="checkbox" name="menu" value="${m.id}">
      <span class="choice__card"><span class="choice__name">${m.name}</span><span class="choice__desc" data-p="${m.id}"></span></span>
    </label>`).join("");

  CV.staff.forEach(s => $("f-staff").insertAdjacentHTML("beforeend", `<option value="${s.id}">${s.name}（${s.role}）</option>`));

  /* ---------- 合計の目安 ---------- */
  const getLen = () => (form.querySelector('input[name="len"]:checked') || {}).value;
  const getMenus = () => [...form.querySelectorAll('input[name="menu"]:checked')].map(i => i.value);
  function updateSum() {
    const len = getLen(), menus = getMenus();
    CV.menus.forEach(m => {
      form.querySelector(`[data-p="${m.id}"]`).textContent =
        len ? CV.yen(m.price[len]) : CV.yen(m.price.short) + (m.price.long > m.price.short ? "〜" : "");
    });
    if (!menus.length) { $("f-sum").textContent = ""; return; }
    const r = CV.calc(len || "short", menus);
    $("f-sum").innerHTML = `合計の目安 <b>${CV.yen(r.total)}${len ? "" : "〜"}</b>　所要時間 約${CV.minutes(r.time)}` +
      (r.save ? `<span class="rform__save">セット割 −${CV.yen(r.save)}</span>` : "");
  }
  form.addEventListener("change", (e) => {
    // 同時に選べないメニュー（カットと前髪カット、カラーとケアブリーチ）は入れ替える
    if (e.target.name === "menu" && e.target.checked) {
      (menuById[e.target.value].excludes || []).forEach(x => { form.querySelector(`input[value="${x}"]`).checked = false; });
    }
    if (["len", "menu"].includes(e.target.name)) updateSum();
    clearError(e.target.name);
  });

  /* ---------- URL から引き継ぎ ---------- */
  const q = new URLSearchParams(location.search);
  const lenInput = form.querySelector(`input[name="len"][value="${q.get("len")}"]`);
  if (lenInput) lenInput.checked = true;
  (q.get("menu") || "").split(",").forEach(id => {
    const i = form.querySelector(`input[name="menu"][value="${id}"]`);
    if (i) i.checked = true;
  });
  if (CV.staff.some(s => s.id === q.get("staff"))) $("f-staff").value = q.get("staff");
  updateSum();
  // メニューや指名を受け取ったときは、フォームの位置まで移動
  if (q.get("menu") || q.get("staff")) {
    requestAnimationFrame(() => $("form").scrollIntoView({ block: "start" }));
  }

  /* ---------- 入力チェック ---------- */
  function setError(key, msg) { form.querySelector(`[data-error="${key}"]`).textContent = msg; }
  function clearError(key) { const el = form.querySelector(`[data-error="${key}"]`); if (el) el.textContent = ""; }

  function validate() {
    let first = null;
    const fail = (key, msg, el) => { setError(key, msg); first = first || el; };
    const date = $("f-date").value;
    if (!date) fail("date", "日付を選んでください", $("f-date"));
    else if (new Date(date + "T00:00").getDay() === 2) fail("date", "火曜日は定休日です。別の日を選んでください", $("f-date"));
    else if (date < $("f-date").min || date > $("f-date").max) fail("date", "明日から60日先までの日付を選んでください", $("f-date"));
    if (!$("f-time").value) fail("time", "時間を選んでください", $("f-time"));
    if (!getLen()) fail("len", "髪の長さを選んでください", form.querySelector('input[name="len"]'));
    if (!getMenus().length) fail("menu", "メニューを1つ以上選んでください", form.querySelector('input[name="menu"]'));
    if (!$("f-name").value.trim()) fail("name", "お名前を入力してください", $("f-name"));
    if (first) first.focus();
    return !first;
  }

  /* ---------- 「送信」：実際には送らず、完了画面を出すだけ ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    const len = getLen(), menus = getMenus();
    const r = CV.calc(len, menus);
    const d = new Date($("f-date").value + "T00:00");
    const staff = CV.staff.find(s => s.id === $("f-staff").value);
    const rows = [
      ["日時", `${d.getMonth() + 1}月${d.getDate()}日（${"日月火水木金土"[d.getDay()]}）${$("f-time").value}`],
      ["メニュー", r.items.map(m => m.name).join("、")],
      ["合計の目安", `${CV.yen(r.total)}（約${CV.minutes(r.time)}）`],
      ["スタイリスト", staff ? staff.name : "指名なし"],
      ["お名前", $("f-name").value.trim() + " 様"]
    ];
    const list = $("rdone-list");
    list.innerHTML = "";
    rows.forEach(([k, v]) => {      // 入力された文字はそのまま文字として表示（安全のため）
      const dt = document.createElement("dt"); dt.textContent = k;
      const dd = document.createElement("dd"); dd.textContent = v;
      list.append(dt, dd);
    });
    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ block: "center" });
    done.focus({ preventScroll: true });
  });
  $("rdone-back").addEventListener("click", () => {
    done.hidden = true; form.hidden = false;
    $("form").scrollIntoView({ block: "start" });
  });
})();

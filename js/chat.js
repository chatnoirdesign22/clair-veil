/* =========================================================
   clair veil — 来店前チャット相談（選択式）
   会話の文章は data.js の CV.chat にあります。
   入力内容はどこにも送信・保存しません。
   ========================================================= */
(function () {
  const log = document.getElementById("chat-log");
  const choices = document.getElementById("chat-choices");
  const restart = document.getElementById("chat-restart");
  if (!log) return;

  const C = CV.chat;
  const staff = CV.staff.find(s => s.id === C.staff);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const menuName = Object.fromEntries(CV.menus.map(m => [m.id, m.name]));
  let run = 0;            // 「最初から」を押したら古い会話の続きを止めるための番号

  const wait = (ms) => new Promise(r => setTimeout(r, reduceMotion ? Math.min(ms, 200) : ms));
  const scrollDown = () => {
    const rect = choices.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 20 || rect.top < 80) {
      choices.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "end" });
    }
  };

  /* スタッフの吹き出し（「入力中…」を出してから表示） */
  async function say(text, id) {
    const typing = document.createElement("div");
    typing.className = "msg msg--staff";
    typing.innerHTML = `<img class="msg__avatar" src="${staff.photo}" alt="" width="36" height="36"><div class="msg__bubble msg__typing" aria-label="入力中"><span></span><span></span><span></span></div>`;
    log.append(typing); scrollDown();
    await wait(500 + Math.min(text.length * 18, 900));
    if (id !== run) return false;
    typing.querySelector(".msg__bubble").className = "msg__bubble";
    typing.querySelector(".msg__bubble").removeAttribute("aria-label");
    typing.querySelector(".msg__bubble").innerHTML = text;
    scrollDown();
    await wait(250);
    return id === run;
  }
  async function sayAll(texts, id) {
    for (const t of texts) { if (!(await say(t, id))) return false; }
    return true;
  }
  /* お客さまの吹き出し */
  function me(text) {
    const d = document.createElement("div");
    d.className = "msg msg--me";
    d.innerHTML = `<div class="msg__bubble">${text}</div>`;
    log.append(d); scrollDown();
  }
  /* 選択ボタンを出して、押されるまで待つ */
  function ask(options) {
    return new Promise(resolve => {
      choices.innerHTML = options.map((o, i) => `<button type="button" class="chat-choice" data-i="${i}">${o.label}</button>`).join("");
      scrollDown();
      choices.querySelector("button").focus({ preventScroll: true });
      choices.onclick = (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        choices.innerHTML = ""; choices.onclick = null;
        const o = options[Number(b.dataset.i)];
        me(o.label);
        resolve(o);
      };
    });
  }

  /* おすすめメニューのカード */
  function recommend(menus, len) {
    const r = CV.calc(len, menus);
    const p = new URLSearchParams({ len, menu: menus.join(","), from: "chat" });
    const card = document.createElement("div");
    card.className = "msg msg--staff msg--card";
    card.innerHTML = `
      <img class="msg__avatar" src="${staff.photo}" alt="" width="36" height="36">
      <div class="rec">
        <p class="rec__title">あなたへのおすすめメニュー</p>
        <ul class="rec__list">
          ${r.items.map(m => `<li><span>${m.name}</span><span>${CV.yen(m.price[len])}</span></li>`).join("")}
          ${r.discounts.map(d => `<li class="is-discount"><span>${d.name}</span><span>−${CV.yen(d.amount)}</span></li>`).join("")}
        </ul>
        <p class="rec__total">合計の目安 <b>${CV.yen(r.total)}</b><small>（${CV.lengths.find(l => l.id === len).name}・約${CV.minutes(r.time)}）</small></p>
        <a class="btn btn--wide" href="menu.html?${p}#simulator">料金シミュレーターで確認する</a>
        <a class="rec__sub" href="reserve.html?len=${len}&menu=${menus.join(",")}">このまま予約フォームへ</a>
      </div>`;
    log.append(card); scrollDown();
  }

  /* ---------- 会話の流れ ---------- */
  async function start() {
    const id = ++run;
    log.innerHTML = ""; choices.innerHTML = ""; choices.onclick = null;
    if (!(await sayAll(C.greeting, id))) return;
    if (!(await say(C.askConcern, id))) return;
    const concern = await ask(C.concerns);
    if (id !== run) return;

    if (!(await say(C.askLength, id))) return;
    const len = await ask(CV.lengths.map(l => ({ id: l.id, label: `${l.name}（${l.desc}）` })));
    if (id !== run) return;

    if (!(await say(concern.q, id))) return;
    const detail = await ask(concern.options);
    if (id !== run) return;

    if (!(await say(detail.reply, id))) return;
    if (!(await sayAll(concern.advice, id))) return;
    if (!(await say(`以上をふまえて、<b>${concern.menus.map(m => menuName[m]).join("＋")}</b> をおすすめします。`, id))) return;
    await wait(300);
    if (id !== run) return;
    recommend(concern.menus, len.id);
    await wait(600);
    if (id !== run) return;
    await say(C.closing, id);
    choices.innerHTML = `<button type="button" class="chat-choice chat-choice--sub" data-restart>別のお悩みも相談する</button>`;
    choices.onclick = (e) => { if (e.target.closest("[data-restart]")) start(); };
  }

  restart.addEventListener("click", start);
  start();
})();

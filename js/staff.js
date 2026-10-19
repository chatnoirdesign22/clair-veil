/* =========================================================
   clair veil — スタッフ紹介（data.js の CV.staff から作ります）
   ========================================================= */
(function () {
  const list = document.getElementById("staff-list");
  if (!list) return;

  list.innerHTML = CV.staff.map((s, i) => {
    const styles = CV.styles.filter(st => st.staff === s.id).slice(0, 3);
    return `
    <article class="staff-card reveal${i % 2 ? " reveal-delay-1" : ""}" id="${s.id}">
      <div class="staff-card__img"><img class="photo" src="${s.photo}" alt="${s.role} ${s.name}" width="800" height="1000" loading="lazy"></div>
      <div class="staff-card__body">
        <p class="staff-card__role">${s.role}</p>
        <h2 class="staff-card__name">${s.name}<span>${s.kana}</span></h2>
        <p class="staff-card__career">${s.career}</p>
        <h3 class="staff-card__h">得意なこと</h3>
        <ul class="tags">${s.good.map(g => `<li>${g}</li>`).join("")}</ul>
        <blockquote class="staff-card__msg">${s.message}</blockquote>
        ${styles.length ? `
          <h3 class="staff-card__h">担当スタイル</h3>
          <ul class="staff-card__styles">
            ${styles.map(st => `<li><a href="style.html?open=${st.id}"><img class="photo" src="images/${st.img}.jpg" alt="${st.name}" loading="lazy" width="900" height="1125"></a></li>`).join("")}
          </ul>` : ""}
        <a class="btn" href="reserve.html?staff=${s.id}">${s.name.split(" ")[0]}を指名して予約</a>
      </div>
    </article>`;
  }).join("");

  // 差し込んだ要素にもスクロール演出をかける
  CV.observeReveal && CV.observeReveal(list.querySelectorAll(".reveal"));
})();

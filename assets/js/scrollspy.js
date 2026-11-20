/* ===== SEJARAH.JS: tandai bagian yang sedang dibaca pada menu Sejarah ===== */
(() => {
  const bagian = document.querySelectorAll("main section[id]");
  const tautan = document.querySelectorAll(".menu-list a, .menu-feature");
  const pengamat = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting);
    if (!visible.length) return;
    const teratas = visible.reduce(
      (best, e) => (e.intersectionRatio > best.intersectionRatio ? e : best),
      visible[0]
    );
    const id = teratas.target.id;
    tautan.forEach(a =>
      a.classList.toggle("active", a.getAttribute("href").endsWith("#" + id))
    );
  }, { rootMargin: "-35% 0px -55% 0%" });
  bagian.forEach(s => pengamat.observe(s));
})();

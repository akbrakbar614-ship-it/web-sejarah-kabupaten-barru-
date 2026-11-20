/* Animasi dan interaksi halaman Budaya, Peninggalan, Galeri, Tentang */
(() => {
  document.documentElement.classList.add("js");
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const kurangi = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Muncul saat digulir
  const rev = $$(".reveal");
  if ("IntersectionObserver" in window && !kurangi) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    rev.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 80 + "ms"; io.observe(el); });
  } else rev.forEach(el => el.classList.add("in"));

  // Hitung naik pada angka
  const hitung = el => {
    const t = +el.dataset.count; if (kurangi) { el.textContent = t; return; }
    const m = performance.now(); (function f(n) { const p = Math.min((n - m) / 1200, 1); el.textContent = Math.round(t * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(m);
  };
  const angka = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { hitung(e.target); co.unobserve(e.target); } }));
    angka.forEach(el => co.observe(el));
  } else angka.forEach(hitung);

  // Tombol chip aktif sesuai bagian
  const chips = $$(".p-chips a");
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) chips.forEach(c => c.classList.toggle("on", c.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-35% 0px -55% 0px" });
    chips.forEach(c => { const s = document.querySelector(c.getAttribute("href")); if (s) so.observe(s); });
  }

  // Perbesar foto galeri
  const tiles = $$(".g-tile");
  if (tiles.length) {
    const lb = document.createElement("div"); lb.className = "lb"; lb.innerHTML = "<div><p></p></div>"; document.body.appendChild(lb);
    tiles.forEach(t => { t.tabIndex = 0; const buka = () => { const d = lb.firstChild; d.style.setProperty("--g", getComputedStyle(t.querySelector(".g-img")).getPropertyValue("--g") || ""); d.firstChild.textContent = t.dataset.cap; lb.classList.add("open"); };
      t.addEventListener("click", buka); t.addEventListener("keydown", e => { if (e.key === "Enter") buka(); }); });
    lb.addEventListener("click", () => lb.classList.remove("open"));
    addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("open"); });
  }

  // Naik ke atas
  const b = document.createElement("button"); b.className = "p-top"; b.setAttribute("aria-label", "Kembali ke atas"); b.textContent = "↑"; document.body.appendChild(b);
  b.addEventListener("click", () => scrollTo({ top: 0, behavior: kurangi ? "auto" : "smooth" }));
  addEventListener("scroll", () => b.classList.toggle("show", scrollY > 600), { passive: true });
})();

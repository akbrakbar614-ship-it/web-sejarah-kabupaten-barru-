/* ===== MAIN.JS: navbar, dropdown, pencarian (dipakai semua halaman) ===== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const header = $(".site-header");
  const nav = $("#mainNav");
  const burger = $("#menuToggle");
  const dropdowns = $$(".dropdown");
  const rootPrefix = document.body.dataset.rootPrefix || "";

  /* Tahun di footer */
  const tahun = $("#tahun");
  if (tahun) tahun.textContent = new Date().getFullYear();

  /* Tandai menu halaman aktif (body[data-page] cocok dengan [data-page-link]) */
  const halaman = document.body.dataset.page;
  $$("[data-page-link]").forEach(el => el.classList.toggle("active", el.dataset.pageLink === halaman));

  /* Garis bawah navbar saat digulir */
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Dropdown */
  function tutupDropdown(kecuali) {
    dropdowns.forEach(d => {
      if (d === kecuali) return;
      d.classList.remove("open");
      $(".dropdown-toggle", d).setAttribute("aria-expanded", "false");
    });
  }
  dropdowns.forEach(d => {
    const tombol = $(".dropdown-toggle", d);
    tombol.addEventListener("click", e => {
      e.stopPropagation();
      tutupDropdown(d);
      const buka = d.classList.toggle("open");
      tombol.setAttribute("aria-expanded", String(buka));
    });
  });
  document.addEventListener("click", e => {
    if (!e.target.closest(".dropdown")) tutupDropdown();
  });

  /* Menu mobile */
  function tutupMenuMobile() {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.textContent = "☰";
  }
  burger.addEventListener("click", () => {
    const buka = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(buka));
    burger.textContent = buka ? "×" : "☰";
  });
  $$(".main-nav a").forEach(a => a.addEventListener("click", () => { tutupDropdown(); tutupMenuMobile(); }));

  /* Pencarian (Ctrl/Cmd + K). Tambah entri baru di array ini saat halaman baru dibuat. */
  const halamanSitus = [
    ["Home", "Beranda situs", "index.html"],
    ["Mengenal Kabupaten Barru", "Profil singkat daerah", "index.html#mengenal"],
    ["Kabupaten Barru dalam Sejarah", "Ringkasan sejarah di Home", "index.html#sejarah"],
    ["Sejarah Kabupaten Barru", "Halaman sejarah lengkap", "sejarah.html"],
    ["Asal Usul Barru", "Pengantar dan empat wilayah kerajaan", "sejarah.html#asal-usul"],
    ["Masa Kerajaan", "Berru, Tanete, Soppeng Riaja, Mallusetasi", "sejarah.html#masa-kerajaan"],
    ["Masa Penjajahan", "Onder Afdeling Barru di era Belanda", "sejarah.html#masa-penjajahan"],
    ["Masa Kemerdekaan", "Dari Self Bestuur menjadi Swapraja", "sejarah.html#masa-kemerdekaan"],
    ["Pembentukan Kabupaten", "Hari jadi 20 Februari 1960", "sejarah.html#pembentukan"],
    ["Timeline Sejarah", "Ringkasan perjalanan dari masa ke masa", "sejarah.html#timeline"],
    ["Sumber Sejarah", "Referensi dan tautan resmi", "sejarah.html#sumber"],
    ["Tokoh Sejarah", "Raja, pahlawan, dan tokoh masyarakat", "tokoh.html"],
    ["Budaya dan Tradisi", "Adat istiadat, kesenian, kuliner", "budaya.html"],
    ["Adat Istiadat", "Pernikahan adat dan lembaga adat", "budaya.html#adat-istiadat"],
    ["Kesenian", "Seni tradisional Barru", "budaya.html#kesenian"],
    ["Kuliner", "Makanan khas Barru", "budaya.html#kuliner"],
    ["Peninggalan Sejarah", "Situs, bangunan, dan naskah kuno", "peninggalan.html"],
    ["Situs dan Bangunan", "Situs kerajaan dan bangunan bersejarah", "peninggalan.html#situs"],
    ["Naskah Kuno", "Lontara dan naskah peninggalan", "peninggalan.html#naskah"],
    ["Galeri", "Foto dan video", "galeri.html"],
    ["Tentang Kami", "Profil situs dan tim penyusun", "tentang.html"],
    ["Kontak", "Kirim saran atau koreksi", "kontak/index.php"]
  ];
  const overlay = $("#searchOverlay"), input = $("#searchInput"), hasil = $("#searchResults");

  function tampilHasil() {
    const k = input.value.trim().toLowerCase();
    const cocok = halamanSitus.filter(([a, b]) => (a + " " + b).toLowerCase().includes(k));
    hasil.textContent = "";
    if (!cocok.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Tidak ada hasil untuk pencarian ini.";
      hasil.appendChild(li);
      return;
    }
    cocok.forEach(([judul, ket, href]) => {
      const li = document.createElement("li"), a = document.createElement("a"), s = document.createElement("small");
      a.href = rootPrefix + href; a.textContent = judul; s.textContent = ket;
      a.appendChild(s); li.appendChild(a); hasil.appendChild(li);
    });
  }
  function bukaCari() { tutupDropdown(); overlay.classList.add("open"); input.value = ""; tampilHasil(); input.focus(); }
  function tutupCari() { overlay.classList.remove("open"); }

  $("#searchOpen").addEventListener("click", bukaCari);
  input.addEventListener("input", tampilHasil);
  overlay.addEventListener("click", e => { if (e.target === overlay) tutupCari(); });
  hasil.addEventListener("click", e => { if (e.target.closest("a")) tutupCari(); });
  input.addEventListener("keydown", e => {
    const links = $$("a", hasil);
    if (e.key === "Enter" && links[0]) links[0].click();
    if (e.key === "ArrowDown" && links[0]) { e.preventDefault(); links[0].focus(); }
  });
  hasil.addEventListener("keydown", e => {
    const links = $$("a", hasil), i = links.indexOf(document.activeElement);
    if (e.key === "ArrowDown" && links[i + 1]) { e.preventDefault(); links[i + 1].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); (links[i - 1] || input).focus(); }
  });
  window.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); bukaCari(); }
    if (e.key === "Escape") { tutupCari(); tutupDropdown(); tutupMenuMobile(); }
  });
})();

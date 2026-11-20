/* ===== GALERI.JS: pemutar video =====
   Alamat video diatur di assets/css/images.css, bagian VIDEO:
     --video-1: "assets/video/nama-file.mp4";   (file mp4/webm sendiri)
     --video-1: "youtube:ID_VIDEO";             (video YouTube)
     --video-1: none;                           (slot kosong)
   Alamat file dihitung dari folder website (folder yang berisi galeri.html).
   Cara lama lewat atribut data-youtube / data-mp4 di galeri.html tetap bisa dipakai
   dan didahulukan jika diisi. Video baru dimuat saat tombol putar diklik.

   PERBAIKAN SUARA:
   - Video sampul (pratinjau, muted) TIDAK dipakai lagi untuk memutar.
     Saat diklik, sampul dibuang dan dibuat elemen <video> baru yang tidak muted.
   - Jika video tidak punya jalur audio / suara dibisukan, muncul catatan di atas video.
   - Untuk suara yang aman di semua browser, gunakan mp4 H.264 + audio AAC. */
(() => {
  const css = getComputedStyle(document.documentElement);
  const lembar = [...document.styleSheets].find(s => s.href && /images[^/]*\.css/i.test(s.href));
  const cssHref = lembar ? lembar.href : location.href;

  /* Ubah nilai variabel CSS menjadi {type, src/id}, atau null jika kosong */
  function ubah(mentah, cssBase, halamanBase) {
    let v = (mentah || "").trim();
    if (!v || v.toLowerCase() === "none") return null;

    // Bentuk url(...) dihitung dari lokasi images.css
    const u = v.match(/^url\(\s*(["']?)(.*?)\1\s*\)$/i);
    if (u) return { type: "file", src: new URL(u[2].replace(/\\(.)/g, "$1"), cssBase).href };

    // Bentuk "teks" dihitung dari lokasi halaman
    v = v.replace(/^(["'])([\s\S]*)\1$/, "$2").replace(/\\(.)/g, "$1").trim();
    if (!v) return null;
    const yt = v.match(/^youtube:\s*([\w-]{6,})$/i) ||
               v.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/i);
    if (yt) return { type: "youtube", id: yt[1] };
    return { type: "file", src: new URL(v, halamanBase).href };
  }

  document.querySelectorAll(".v-frame").forEach(frame => {
    const nomor = (frame.className.match(/foto-video-(\d+)/) || [])[1];
    const judul = frame.dataset.judul || "video";

    // 1) atribut HTML (jika diisi), 2) variabel di images.css
    const ytAttr = (frame.dataset.youtube || "").trim();
    const mp4Attr = (frame.dataset.mp4 || "").trim();
    let sumber = null;
    if (ytAttr) sumber = { type: "youtube", id: ytAttr };
    else if (mp4Attr) sumber = { type: "file", src: new URL(mp4Attr, location.href).href };
    else if (nomor) sumber = ubah(css.getPropertyValue("--video-" + nomor), cssHref, location.href);
    if (!sumber) return;                                // slot masih kosong

    const poster = nomor ? css.getPropertyValue("--img-video-" + nomor).trim() : "";
    const adaPoster = poster !== "" && poster.toLowerCase() !== "none";

    frame.classList.add("siap");
    frame.setAttribute("role", "button");
    frame.setAttribute("aria-label", "Putar " + judul);
    frame.tabIndex = 0;

    const gagal = () => {
      frame.textContent = "";
      frame.classList.remove("siap");
      frame.removeAttribute("role");
      frame.removeAttribute("tabindex");
      const info = document.createElement("div");
      info.className = "v-info";
      info.style.position = "static";
      const p = document.createElement("p"), s = document.createElement("small");
      p.textContent = "Video tidak dapat dimuat";
      s.textContent = "Periksa alamat file di images.css";
      info.append(p, s);
      frame.appendChild(info);
    };

    // Catatan kecil di atas video, hilang sendiri setelah 10 detik
    const catatan = teks => {
      let c = frame.querySelector(".v-catatan");
      if (!c) {
        c = document.createElement("div");
        c.className = "v-catatan";
        frame.appendChild(c);
        setTimeout(() => c.remove(), 10000);
      }
      c.textContent = teks;
    };

    // Untuk file tanpa poster: tampilkan gambar pertama video sebagai sampul
    // (elemen ini hanya pratinjau, tidak dipakai untuk memutar)
    let sampul = null;
    if (sumber.type === "file" && !adaPoster) {
      sampul = document.createElement("video");
      sampul.src = sumber.src + "#t=0.1";
      sampul.preload = "metadata";
      sampul.muted = true;
      sampul.playsInline = true;
      sampul.setAttribute("aria-hidden", "true");
      sampul.addEventListener("error", gagal);
      frame.prepend(sampul);
    }

    const putar = () => {
      frame.classList.remove("siap");
      frame.removeAttribute("role");
      frame.removeAttribute("tabindex");
      frame.querySelectorAll(".v-play, .v-info").forEach(el => el.remove());

      if (sumber.type === "youtube") {
        const el = document.createElement("iframe");
        el.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(sumber.id) + "?autoplay=1&rel=0";
        el.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        el.allowFullscreen = true;
        el.title = judul;
        frame.appendChild(el);
        return;
      }

      // Buang sampul yang muted, lalu buat elemen video BARU dengan suara aktif
      if (sampul) { sampul.remove(); sampul = null; }
      frame.querySelectorAll("video").forEach(v => v.remove());

      const el = document.createElement("video");
      el.playsInline = true;
      el.controls = true;
      el.preload = "auto";
      el.defaultMuted = false;
      el.removeAttribute("muted");
      el.muted = false;
      el.volume = 1;
      el.autoplay = true;
      el.style.objectFit = "contain";
      el.addEventListener("error", gagal);
      el.src = sumber.src;
      frame.appendChild(el);

      // Setelah berjalan sebentar, periksa apakah video benar-benar punya suara
      el.addEventListener("playing", () => {
        setTimeout(() => {
          const dilihatTidakAdaAudio =
            el.mozHasAudio === false ||
            (el.audioTracks && el.audioTracks.length === 0);

          if (el.muted || el.volume === 0) {
            catatan("Suara sedang dimatikan. Tekan ikon speaker pada pemutar untuk menyalakan.");
            return;
          }
          if (dilihatTidakAdaAudio) {
            catatan("Video ini tidak memiliki trek audio. Tambahkan file MP4/H.264 dengan audio AAC agar tersedia suara.");
          }
        }, 1500);
      }, { once: true });

      const jalan = el.play();
      if (jalan && jalan.catch) {
        // Jika browser memblokir pemutaran bersuara, putar tanpa suara dan beri tahu pengguna
        jalan.catch(() => {
          el.muted = true;
          el.play().catch(() => {});
          catatan("Browser membisukan video. Tekan ikon speaker pada pemutar untuk menyalakan suara.");
        });
      }
    };

    frame.addEventListener("click", putar, { once: true });
    frame.addEventListener("keydown", e => {
      if ((e.key === "Enter" || e.key === " ") && frame.classList.contains("siap")) { e.preventDefault(); putar(); }
    });
  });
})();

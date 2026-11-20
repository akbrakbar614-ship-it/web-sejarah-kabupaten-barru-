# Sejarah Kabupaten Barru

Website sejarah dan budaya Kabupaten Barru. Halaman publik dibuat dengan HTML, CSS,
dan JavaScript; formulir kontak serta kotak masuk admin memakai PHP dan MySQL.

## Menjalankan secara lokal

1. Letakkan atau clone proyek ke `C:\xampp\htdocs\Projek-web-sejarah-kabupaten-Barru-`.
2. Nyalakan Apache dan MySQL melalui XAMPP.
3. Buat database dengan mengimpor `database/kontak.sql` melalui phpMyAdmin.
4. Konfigurasi koneksi melalui variabel lingkungan `DB_HOST`, `DB_NAME`, `DB_USER`,
   dan `DB_PASSWORD`. Tanpa variabel tersebut, konfigurasi memakai nilai lokal XAMPP.
5. Buat akun admin melalui terminal dari folder proyek:

   ```text
   php admin/buat_admin.php admin
   ```

   Ikuti prompt untuk memasukkan kata sandi admin; kata sandi tidak disimpan di kode.
6. Buka `http://localhost/Projek-web-sejarah-kabupaten-Barru-/`.

Formulir kontak lokal tersedia di `/kontak/` dan halaman admin lokal di `/admin/`.

## Hosting

GitHub dapat menyimpan source code proyek ini. Netlify melayani file statis dan tidak
menjalankan PHP atau MySQL. Halaman kontak statis di `/kontak/index.html` memakai Netlify
Forms; aktifkan form detection di pengaturan situs Netlify, lalu lihat kiriman pada
`Forms` → `Submissions` di dashboard. Halaman admin PHP dan database tetap memerlukan
hosting yang mendukung PHP dengan PDO MySQL serta MySQL/MariaDB. Untuk GitHub Pages,
formulir Netlify tidak tersedia kecuali situs dipindahkan ke Netlify.

Jangan gunakan akun database `root` di produksi. Buat akun khusus dengan izin terbatas,
gunakan kata sandi kuat dan HTTPS, serta jangan commit file `.env` atau kredensial.

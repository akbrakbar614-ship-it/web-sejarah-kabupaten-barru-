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

Formulir kontak tersedia di `/kontak/` dan halaman admin di `/admin/`.

## Hosting

GitHub dapat menyimpan source code proyek ini. GitHub Pages hanya melayani file statis
dan tidak menjalankan PHP atau MySQL, sehingga formulir kontak dan halaman admin tidak
berfungsi di sana. Untuk fitur lengkap, gunakan hosting yang mendukung PHP dengan PDO
MySQL serta MySQL/MariaDB, lalu impor skema database dan atur variabel lingkungan
koneksi di hosting tersebut.

Jangan gunakan akun database `root` di produksi. Buat akun khusus dengan izin terbatas,
gunakan kata sandi kuat dan HTTPS, serta jangan commit file `.env` atau kredensial.

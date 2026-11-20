FORM KONTAK + KOTAK MASUK ADMIN

STRUKTUR
  kontak/
    index.php          Formulir saran, validasi, dan penyimpanan pesan
  admin/
    index.php          Login admin dan kotak masuk pesan
    buat_admin.php     Membuat akun admin melalui PHP CLI
  config/
    database.php       Pengaturan koneksi MySQL
    pdo.php            Koneksi PDO bersama
  database/
    kontak.sql         Skema baru untuk pesan dan admin
    migrasi-admin-kontak.sql  Upgrade skema lama yang sudah dipakai
  assets/css/
    kontak.css         Tampilan halaman formulir dan navigasi
    admin.css          Tampilan halaman admin

MENJALANKAN DI XAMPP
1. Letakkan folder proyek di C:\xampp\htdocs\Projek-web-sejarah-kabupaten-Barru.
2. Jalankan Apache dan MySQL dari XAMPP Control Panel.
3. Database yang dikonfigurasi adalah `BARRU WEB SEJARAH`.
   - Jika database belum ada, impor database/kontak.sql melalui phpMyAdmin.
   - Jika database dan tabel pesan_kontak sudah ada, pilih database tersebut di phpMyAdmin,
     lalu impor database/migrasi-admin-kontak.sql satu kali.
4. Periksa config/database.php. Nilai awal memakai pengaturan MySQL lokal standar XAMPP
   (host 127.0.0.1, database BARRU WEB SEJARAH, user root tanpa password).
   Jika database yang Anda gunakan berbeda, ubah nama pada config/database.php dan baris
   USE di file SQL migrasi. Jika MySQL memakai password/user lain, sesuaikan konfigurasi.
5. Buat akun admin dari folder proyek melalui Command Prompt:
   php admin\buat_admin.php admin
   Masukkan kata sandi minimal 12 karakter saat diminta. Kata sandi tidak disimpan dalam kode.
6. Formulir publik: http://localhost/Projek-web-sejarah-kabupaten-Barru/kontak/
   Kotak masuk admin: http://localhost/Projek-web-sejarah-kabupaten-Barru/admin/
7. Pesan tersimpan di database BARRU WEB SEJARAH, tabel pesan_kontak. Admin dapat memfilter,
   menandai pesan telah dibaca, dan mengarsipkannya. Pesan tidak dihapus otomatis.

KEAMANAN
- Pengaturan root tanpa password hanya untuk lingkungan lokal XAMPP.
- Sebelum dipublikasikan, gunakan akun database khusus dengan izin terbatas dan password kuat.
- Jangan menaruh database di folder publik pada server produksi.
- Buat kata sandi admin yang unik dan jangan membagikannya.

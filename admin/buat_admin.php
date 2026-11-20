<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once dirname(__DIR__) . '/config/pdo.php';

$username = isset($argv[1]) ? trim($argv[1]) : '';
if (!preg_match('/\A[a-zA-Z0-9_.-]{3,80}\z/', $username)) {
    fwrite(STDERR, "Pemakaian: php admin\\buat_admin.php nama_pengguna\nNama pengguna harus terdiri dari 3-80 huruf, angka, titik, garis bawah, atau tanda hubung.\n");
    exit(1);
}

fwrite(STDOUT, "Kata sandi admin (minimal 12 karakter): ");
$password = rtrim((string) fgets(STDIN), "\r\n");
fwrite(STDOUT, "Ulangi kata sandi: ");
$confirmation = rtrim((string) fgets(STDIN), "\r\n");

if (strlen($password) < 12 || !hash_equals($password, $confirmation)) {
    fwrite(STDERR, "Kata sandi minimal 12 karakter dan kedua masukan harus sama.\n");
    exit(1);
}

try {
    $pdo = database_connection();
    $statement = $pdo->prepare(
        'INSERT INTO admin_users (username, password_hash) VALUES (:username, :password_hash)'
    );
    $statement->execute([
        'username' => $username,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    ]);
    fwrite(STDOUT, "Akun admin berhasil dibuat.\n");
} catch (PDOException $exception) {
    if ($exception->getCode() === '23000') {
        fwrite(STDERR, "Nama pengguna tersebut sudah digunakan.\n");
        exit(1);
    }
    error_log('Gagal membuat akun admin: ' . $exception->getMessage());
    fwrite(STDERR, "Akun admin gagal dibuat. Pastikan database dan tabel admin sudah disiapkan.\n");
    exit(1);
}

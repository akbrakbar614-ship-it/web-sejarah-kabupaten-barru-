<?php
declare(strict_types=1);

$isHttps = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'httponly' => true,
    'secure' => $isHttps,
    'samesite' => 'Lax',
]);
session_start();
require_once dirname(__DIR__) . '/config/pdo.php';

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$errors = [];
$dbError = '';
$requestedFilter = $requestMethod === 'POST'
    && isset($_POST['status_filter'])
    && is_string($_POST['status_filter'])
    ? $_POST['status_filter']
    : (isset($_GET['status']) && is_string($_GET['status']) ? $_GET['status'] : 'baru');
$filter = $requestedFilter;
$allowedStatuses = ['baru', 'dibaca', 'diarsipkan', 'semua'];
if (!in_array($filter, $allowedStatuses, true)) {
    $filter = 'baru';
}

if ($requestMethod === 'POST') {
    $token = isset($_POST['csrf_token']) && is_string($_POST['csrf_token'])
        ? $_POST['csrf_token']
        : '';
    if (!hash_equals($_SESSION['csrf_token'], $token)) {
        $errors[] = 'Sesi tidak valid. Muat ulang halaman, lalu coba lagi.';
    } elseif (isset($_POST['login'])) {
        $username = isset($_POST['username']) && is_string($_POST['username'])
            ? trim($_POST['username'])
            : '';
        $password = isset($_POST['password']) && is_string($_POST['password'])
            ? $_POST['password']
            : '';

        try {
            $pdo = database_connection();
            $statement = $pdo->prepare(
                'SELECT id, username, password_hash FROM admin_users WHERE username = :username LIMIT 1'
            );
            $statement->execute(['username' => $username]);
            $admin = $statement->fetch();

            if ($admin && password_verify($password, $admin['password_hash'])) {
                session_regenerate_id(true);
                $_SESSION['admin_id'] = (int) $admin['id'];
                $_SESSION['admin_username'] = $admin['username'];
                $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
                header('Location: index.php', true, 303);
                exit;
            }

            $errors[] = 'Nama pengguna atau kata sandi tidak sesuai. Jika ini pertama kali masuk, buat akun admin menggunakan petunjuk di bawah.';
        } catch (PDOException $exception) {
            error_log('Gagal memeriksa akun admin: ' . $exception->getMessage());
            $dbError = 'Database admin belum siap. Jalankan migrasi database dan buat akun admin terlebih dahulu.';
        }
    } elseif (isset($_POST['logout'])) {
        $_SESSION = [];
        session_destroy();
        header('Location: index.php', true, 303);
        exit;
    } elseif (!empty($_SESSION['admin_id']) && isset($_POST['aksi'], $_POST['pesan_id'])) {
        $messageId = is_string($_POST['pesan_id'])
            ? filter_var($_POST['pesan_id'], FILTER_VALIDATE_INT)
            : false;
        $action = is_string($_POST['aksi']) ? $_POST['aksi'] : '';
        $status = $action === 'arsipkan' ? 'diarsipkan' : 'dibaca';

        if ($messageId === false || !in_array($action, ['baca', 'arsipkan'], true)) {
            $errors[] = 'Permintaan perubahan status tidak valid.';
        } else {
            try {
                $pdo = database_connection();
                $statement = $pdo->prepare(
                    'UPDATE pesan_kontak SET status = :status WHERE id = :id'
                );
                $statement->execute(['status' => $status, 'id' => $messageId]);
                header('Location: index.php?status=' . rawurlencode($filter), true, 303);
                exit;
            } catch (PDOException $exception) {
                error_log('Gagal memperbarui status pesan kontak: ' . $exception->getMessage());
                $dbError = 'Status pesan belum dapat diperbarui. Coba lagi nanti.';
            }
        }
    }
}

$messages = [];
$counts = ['baru' => 0, 'dibaca' => 0, 'diarsipkan' => 0];
if (!empty($_SESSION['admin_id'])) {
    try {
        $pdo = database_connection();
        $countStatement = $pdo->query(
            "SELECT
                COALESCE(SUM(status = 'baru'), 0) AS baru,
                COALESCE(SUM(status = 'dibaca'), 0) AS dibaca,
                COALESCE(SUM(status = 'diarsipkan'), 0) AS diarsipkan
             FROM pesan_kontak"
        );
        $counts = $countStatement->fetch();

        if ($filter === 'semua') {
            $statement = $pdo->query(
                'SELECT id, nama, email, subjek, pesan, status, dibuat_pada
                 FROM pesan_kontak ORDER BY dibuat_pada DESC, id DESC LIMIT 100'
            );
        } else {
            $statement = $pdo->prepare(
                'SELECT id, nama, email, subjek, pesan, status, dibuat_pada
                 FROM pesan_kontak WHERE status = :status
                 ORDER BY dibuat_pada DESC, id DESC LIMIT 100'
            );
            $statement->execute(['status' => $filter]);
        }
        $messages = $statement->fetchAll();
    } catch (PDOException $exception) {
        error_log('Gagal memuat kotak masuk kontak: ' . $exception->getMessage());
        $dbError = 'Kotak masuk belum dapat dimuat. Pastikan migrasi database sudah dijalankan.';
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Admin · Pesan Kontak Barru</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/base.css">
  <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body class="admin-page">
  <header class="admin-header">
    <a class="admin-brand" href="../index.html">
      <strong>Sejarah Kabupaten Barru</strong>
      <span>PENGELOLAAN SARAN</span>
    </a>
    <a class="admin-public-link" href="../kontak/index.php">Lihat halaman kontak</a>
  </header>

  <main class="admin-main">
    <?php if (empty($_SESSION['admin_id'])): ?>
      <section class="admin-card login-card" aria-labelledby="admin-title">
        <p class="admin-kicker">Area pengelola</p>
        <h1 id="admin-title">Masuk ke kotak pesan</h1>
        <p>Gunakan akun admin yang telah dibuat untuk membaca saran dan koreksi pengunjung.</p>
        <?php if ($dbError !== ''): ?>
          <p class="admin-alert error" role="alert"><?= e($dbError) ?></p>
        <?php endif; ?>
        <?php if ($errors): ?>
          <ul class="admin-alert error" role="alert">
            <?php foreach ($errors as $error): ?><li><?= e($error) ?></li><?php endforeach; ?>
          </ul>
        <?php endif; ?>
        <form method="post" class="admin-form">
          <input type="hidden" name="csrf_token" value="<?= e($_SESSION['csrf_token']) ?>">
          <label for="username">Nama pengguna</label>
          <input id="username" name="username" type="text" maxlength="80" autocomplete="username" required>
          <label for="password">Kata sandi</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required>
          <button type="submit" name="login" value="1">Masuk</button>
        </form>
        <p class="admin-setup-help">Belum punya akun admin? Dari folder proyek, jalankan <code>php admin\buat_admin.php admin</code>, lalu buat kata sandi minimal 12 karakter.</p>
      </section>
    <?php else: ?>
      <div class="admin-title-row">
        <div>
          <p class="admin-kicker">Kotak masuk saran</p>
          <h1>Pesan pengunjung</h1>
          <p>Masuk sebagai <strong><?= e((string) $_SESSION['admin_username']) ?></strong></p>
        </div>
        <form method="post">
          <input type="hidden" name="csrf_token" value="<?= e($_SESSION['csrf_token']) ?>">
          <button class="button-secondary" type="submit" name="logout" value="1">Keluar</button>
        </form>
      </div>

      <?php if ($dbError !== ''): ?>
        <p class="admin-alert error" role="alert"><?= e($dbError) ?></p>
      <?php endif; ?>
      <?php if ($errors): ?>
        <ul class="admin-alert error" role="alert">
          <?php foreach ($errors as $error): ?><li><?= e($error) ?></li><?php endforeach; ?>
        </ul>
      <?php endif; ?>

      <section class="admin-stats" aria-label="Ringkasan pesan">
        <a class="stat-card <?= $filter === 'baru' ? 'selected' : '' ?>" href="?status=baru"><span>Belum dibaca</span><strong><?= (int) $counts['baru'] ?></strong></a>
        <a class="stat-card <?= $filter === 'dibaca' ? 'selected' : '' ?>" href="?status=dibaca"><span>Sudah dibaca</span><strong><?= (int) $counts['dibaca'] ?></strong></a>
        <a class="stat-card <?= $filter === 'diarsipkan' ? 'selected' : '' ?>" href="?status=diarsipkan"><span>Diarsipkan</span><strong><?= (int) $counts['diarsipkan'] ?></strong></a>
        <a class="stat-card <?= $filter === 'semua' ? 'selected' : '' ?>" href="?status=semua"><span>Semua pesan</span><strong><?= (int) $counts['baru'] + (int) $counts['dibaca'] + (int) $counts['diarsipkan'] ?></strong></a>
      </section>

      <section class="message-list" aria-label="Daftar pesan">
        <?php if (!$messages): ?>
          <div class="admin-card empty-state">
            <h2>Belum ada pesan di bagian ini</h2>
            <p>Pesan dari formulir kontak akan muncul di sini.</p>
          </div>
        <?php endif; ?>

        <?php foreach ($messages as $message): ?>
          <article class="admin-card message-card">
            <div class="message-heading">
              <div>
                <span class="status-badge status-<?= e($message['status']) ?>"><?= e(ucfirst($message['status'])) ?></span>
                <h2><?= e($message['subjek']) ?></h2>
              </div>
              <time datetime="<?= e(date(DATE_ATOM, strtotime($message['dibuat_pada']))) ?>"><?= e(date('d/m/Y H:i', strtotime($message['dibuat_pada']))) ?></time>
            </div>
            <p class="message-sender"><strong><?= e($message['nama']) ?></strong> · <a href="mailto:<?= e($message['email']) ?>"><?= e($message['email']) ?></a></p>
            <p class="message-body"><?= nl2br(e($message['pesan'])) ?></p>
            <div class="message-actions">
              <?php if ($message['status'] !== 'dibaca'): ?>
                <form method="post">
                  <input type="hidden" name="csrf_token" value="<?= e($_SESSION['csrf_token']) ?>">
                  <input type="hidden" name="pesan_id" value="<?= (int) $message['id'] ?>">
                  <input type="hidden" name="status_filter" value="<?= e($filter) ?>">
                  <button type="submit" name="aksi" value="baca">Tandai dibaca</button>
                </form>
              <?php endif; ?>
              <?php if ($message['status'] !== 'diarsipkan'): ?>
                <form method="post">
                  <input type="hidden" name="csrf_token" value="<?= e($_SESSION['csrf_token']) ?>">
                  <input type="hidden" name="pesan_id" value="<?= (int) $message['id'] ?>">
                  <input type="hidden" name="status_filter" value="<?= e($filter) ?>">
                  <button class="button-secondary" type="submit" name="aksi" value="arsipkan">Arsipkan</button>
                </form>
              <?php endif; ?>
            </div>
          </article>
        <?php endforeach; ?>
      </section>
      <p class="admin-note">Menampilkan maksimal 100 pesan terbaru. Pesan lama tidak dihapus otomatis.</p>
    <?php endif; ?>
  </main>
</body>
</html>

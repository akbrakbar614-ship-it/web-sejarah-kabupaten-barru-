USE `BARRU WEB SEJARAH`;

ALTER TABLE pesan_kontak
  ADD COLUMN status ENUM('baru', 'dibaca', 'diarsipkan') NOT NULL DEFAULT 'baru' AFTER pesan,
  ADD INDEX idx_pesan_kontak_status (status);

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(80) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_username (username)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

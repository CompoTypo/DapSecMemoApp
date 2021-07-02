DROP DATABASE IF EXISTS `dapsecproj`;

CREATE DATABASE `dapsecproj` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;

USE `dapsecproj`;

CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `hash` VARCHAR(255) NOT NULL,
  PRIMARY KEY `pk_id`(`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `forum` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `forum_name` VARCHAR(255) NOT NULL,
  `is_private` INT NOT NULL,
  PRIMARY KEY `pk_id`(`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `rank` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `forum_id` BIGINT UNSIGNED,
  `rank_name` VARCHAR(255),
  `rank_value` INT,
  PRIMARY KEY `pk_id`(`id`),
  CONSTRAINT `fk_rank_forum` FOREIGN KEY (`forum_id`) REFERENCES `forum` (`id`) ON DELETE  CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `membership` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED,
  `forum_id` BIGINT UNSIGNED,
  `rank_id` BIGINT UNSIGNED,
  PRIMARY KEY `pk_id`(`id`),
  CONSTRAINT `fk_membership_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_membership_forum` FOREIGN KEY (`forum_id`) REFERENCES `forum` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_membership_rank` FOREIGN KEY (`rank_id`) REFERENCES `rank` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `page` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `forum_id` BIGINT UNSIGNED,
  `min_read_rank_id` BIGINT UNSIGNED,
  `min_write_rank_id` BIGINT UNSIGNED,
  `page_name` VARCHAR(255) NOT NULL,
  PRIMARY KEY `pk_id`(`id`),
  CONSTRAINT `fk_page_forum` FOREIGN KEY (`forum_id`) REFERENCES `forum` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_page_rank_read` FOREIGN KEY (`min_read_rank_id`) REFERENCES `rank` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_page_rank_write` FOREIGN KEY (`min_write_rank_id`) REFERENCES `rank` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `message` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED,
  `page_id` BIGINT UNSIGNED,
  `text` VARCHAR(255),
  `posted` DATETIME DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY `pk_id`(`id`),
  CONSTRAINT `fk_message_page` FOREIGN KEY (`page_id`) REFERENCES `page` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_message_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB;
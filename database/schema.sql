-- ==========================================
-- COMPLETE DATABASE SETUP (Schema + Seed)
-- ==========================================

-- 1. Create and Use Database
CREATE DATABASE IF NOT EXISTS sports_management_system;
USE sports_management_system;

-- 2. Drop existing tables to ensure clean setup (Ordered by dependencies)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS fcm_tokens;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS single_registrations;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS sports;
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Create Tables

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('participant', 'admin') DEFAULT 'participant',
    verified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP Table
CREATE TABLE otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sports Table
CREATE TABLE sports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type ENUM('team', 'single') NOT NULL,
    max_players INT NOT NULL,
    registration_open TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Registrations
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sport_id INT NOT NULL,
    owner_user_id INT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    captain_name VARCHAR(100) NOT NULL,
    captain_email VARCHAR(100) NOT NULL,
    captain_phone VARCHAR(20) NOT NULL,
    approved_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Team Members
CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    member_name VARCHAR(100) NOT NULL,
    section VARCHAR(50) NOT NULL,
    jersey_number INT,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Single Registrations
CREATE TABLE single_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sport_id INT NOT NULL,
    user_id INT NOT NULL,
    player_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    approved_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Matches Table
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sport_id INT NOT NULL,
    round_no INT NOT NULL,
    participant1_type ENUM('team', 'single', 'bye') NOT NULL,
    participant1_id INT NULL,
    participant2_type ENUM('team', 'single', 'bye') NOT NULL,
    participant2_id INT NULL,
    match_datetime DATETIME NOT NULL,
    venue VARCHAR(120) NOT NULL,
    published TINYINT(1) DEFAULT 0,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    match_id INT NULL,
    scheduled_for DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL
);

-- FCM Tokens Table
CREATE TABLE fcm_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    platform VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    UNIQUE(user_id, token),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Session Table (For Express)
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    expires INT(11) UNSIGNED NOT NULL,
    data MEDIUMTEXT COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id)
) ENGINE=InnoDB;

-- 4. Seed Data

-- Admin User (Password: Admin@12345)
INSERT INTO users (full_name, email, password_hash, role, verified) 
VALUES ('System Admin', 'admin@sports.local', '$2b$10$7R4tN6J8M9u0L1K2P3O4S5T6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0', 'admin', 1);

-- Initial Sports
INSERT INTO sports (name, type, max_players, registration_open) VALUES 
('Football', 'team', 11, 1),
('Basketball', 'team', 5, 1),
('Badminton Single', 'single', 1, 1),
('Chess', 'single', 1, 1),
('Volleyball', 'team', 6, 1);

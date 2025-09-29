-- 사용자 데이터 삽입 스크립트
-- users 테이블에 데이터 삽입

INSERT INTO users (user_id, username, email, password_hash, role, status, phone_number, address, birth_date, gender, join_date, last_login, login_count, email_verified) VALUES
('admin', '관리자', 'admin@aratabusan.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', '010-1234-5678', '부산광역시 해운대구', '1985-03-15', 'male', '2024-01-01', '2024-12-19 10:30:00', 45, TRUE),
('user001', '테스트유저', 'user001@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 'active', '010-2345-6789', '부산광역시 중구', '1990-07-22', 'female', '2024-02-15', '2024-12-18 14:20:00', 23, TRUE),
('vipuser', 'vip유저', 'vip@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vip', 'active', '010-3456-7890', '부산광역시 부산진구', '1988-11-08', 'male', '2024-03-10', '2024-12-17 09:15:00', 67, TRUE),
('testuser', '테스트유저1', 'test@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 'inactive', '010-4567-8901', '부산광역시 동래구', '1995-01-30', 'female', '2024-04-20', '2024-11-15 16:45:00', 12, FALSE),
('suspended_user', '정지된유저', 'suspended@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 'suspended', '010-5678-9012', '부산광역시 서구', '1992-09-12', 'male', '2024-05-05', '2024-10-01 11:30:00', 8, FALSE),
('busan_lover', 'busan_lover', 'busan.lover@naver.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vip', 'active', '010-6789-0123', '부산광역시 남구', '1987-04-18', 'female', '2024-06-01', '2024-12-16 13:25:00', 89, TRUE),
('tourist_guide', 'tourist_guide', 'guide@busan.co.kr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 'active', '010-7890-1234', '부산광역시 사하구', '1983-12-03', 'male', '2024-07-12', '2024-12-15 08:40:00', 34, TRUE),
('seafood_fan', 'seafood_fan', 'seafood@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 'active', '010-8901-2345', '부산광역시 영도구', '1991-06-27', 'female', '2024-08-25', '2024-12-14 15:10:00', 56, TRUE),
('beach_walker', 'beach_walker', 'beach@example.org', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 'inactive', '010-9012-3456', '부산광역시 수영구', '1994-02-14', 'male', '2024-09-10', '2024-11-20 12:55:00', 19, FALSE),
('culture_explorer', 'culture_explorer', 'culture@travel.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vip', 'active', '010-0123-4567', '부산광역시 금정구', '1989-08-09', 'female', '2024-10-03', '2024-12-13 17:35:00', 78, TRUE),
('night_market', 'night_market', 'night@market.kr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 'suspended', '010-1357-2468', '부산광역시 강서구', '1996-05-21', 'male', '2024-11-01', '2024-11-28 20:20:00', 5, FALSE),
('mountain_hiker', 'mountain_hiker', 'hiker@nature.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member', 'active', '010-2468-1357', '부산광역시 기장군', '1986-10-16', 'female', '2024-11-15', '2024-12-12 06:50:00', 42, TRUE);

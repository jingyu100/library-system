-- 비밀번호: admin123
INSERT INTO users (username, password, name, contact, memo, user_type) VALUES
    ('admin', '{bcrypt}$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '관리자', '010-0000-0000', '시스템 관리자', 'ADMIN');

-- 샘플 사용자 데이터
INSERT INTO users (username, password, name, contact, memo, user_type) VALUES
                                                                           ('user001', '{bcrypt}$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '김철수', '010-1234-5678', '개발팀', 'USER'),
                                                                           ('user002', '{bcrypt}$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '이영희', '010-2345-6789', '디자인팀', 'USER'),
                                                                           ('user003', '{bcrypt}$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '박민수', '010-3456-7890', '기획팀', 'USER');

-- 샘플 도서 데이터
INSERT INTO books (title, author, publisher, published_year, price, status) VALUES
                                                                                ('Clean Code', 'Robert C. Martin', '인사이트', 2013, 33000, 'AVAILABLE'),
                                                                                ('Spring Boot 완벽 가이드', '김영한', '위키북스', 2023, 45000, 'AVAILABLE'),
                                                                                ('알고리즘 문제 해결 전략', '구종만', '인사이트', 2012, 42000, 'AVAILABLE'),
                                                                                ('Effective Java', 'Joshua Bloch', '인사이트', 2018, 36000, 'AVAILABLE'),
                                                                                ('데이터베이스 첫걸음', '미크', '한빛미디어', 2019, 18000, 'AVAILABLE'),
                                                                                ('HTTP 완벽 가이드', 'David Gourley', '인사이트', 2014, 55000, 'AVAILABLE'),
                                                                                ('자바 ORM 표준 JPA 프로그래밍', '김영한', '에이콘', 2015, 40000, 'AVAILABLE'),
                                                                                ('토비의 스프링 3.1', '이일민', '에이콘', 2012, 50000, 'AVAILABLE'),
                                                                                ('Modern Java in Action', 'Raoul-Gabriel Urma', '한빛미디어', 2019, 40000, 'AVAILABLE'),
                                                                                ('Operating System Concepts', 'Abraham Silberschatz', 'Wiley', 2018, 70000, 'AVAILABLE');
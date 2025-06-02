-- 관리자 계정 추가 (admin/admin123)
INSERT INTO users (username, password, contact, memo, user_type) VALUES
    ('admin', '{bcrypt}$2a$10$PJoErFK3RJ.xfhBcrlS0DO2x9IRAZt1xP.Ba6KAFrpYLvYMvbSbNu', '010-0000-0000', '시스템 관리자', 'ADMIN');

-- 샘플 사용자 데이터 (비밀번호: password123)
INSERT INTO users (username, password, contact, memo, user_type) VALUES
                                                                     ('user001', '{bcrypt}$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '010-1234-5678', '개발팀', 'USER'),
                                                                     ('user002', '{bcrypt}$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '010-2345-6789', '디자인팀', 'USER'),
                                                                     ('user003', '{bcrypt}$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '010-3456-7890', '기획팀', 'USER'),
                                                                     ('user004', '{bcrypt}$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '010-4567-8901', '마케팅팀', 'USER'),
                                                                     ('user005', '{bcrypt}$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', '010-5678-9012', '인사팀', 'USER');

-- 샘플 도서 데이터 (published_year -> published_at으로 수정)
INSERT INTO books (title, author, publisher, published_at, price, status) VALUES
                                                                              ('Clean Code', 'Robert C. Martin', '인사이트', 2013, 33000, 'AVAILABLE'),
                                                                              ('Spring Boot 완벽 가이드', '김영한', '위키북스', 2023, 45000, 'AVAILABLE'),
                                                                              ('알고리즘 문제 해결 전략', '구종만', '인사이트', 2012, 42000, 'LOANED'),
                                                                              ('Effective Java', 'Joshua Bloch', '인사이트', 2018, 36000, 'AVAILABLE'),
                                                                              ('데이터베이스 첫걸음', '미크', '한빛미디어', 2019, 18000, 'AVAILABLE'),
                                                                              ('HTTP 완벽 가이드', 'David Gourley', '인사이트', 2014, 55000, 'AVAILABLE'),
                                                                              ('자바 ORM 표준 JPA 프로그래밍', '김영한', '에이콘', 2015, 40000, 'LOANED'),
                                                                              ('토비의 스프링 3.1', '이일민', '에이콘', 2012, 50000, 'AVAILABLE'),
                                                                              ('Modern Java in Action', 'Raoul-Gabriel Urma', '한빛미디어', 2019, 40000, 'AVAILABLE'),
                                                                              ('Operating System Concepts', 'Abraham Silberschatz', 'Wiley', 2018, 70000, 'AVAILABLE'),
                                                                              ('React 완벽 가이드', '막시밀리안 슈바르츠뮐러', '길벗', 2022, 35000, 'AVAILABLE'),
                                                                              ('Node.js 교과서', '조현영', '길벗', 2021, 30000, 'AVAILABLE'),
                                                                              ('Python 머신러닝 완벽 가이드', '권철민', '위키북스', 2020, 38000, 'AVAILABLE'),
                                                                              ('Docker & Kubernetes', '용찬호', '위키북스', 2022, 32000, 'AVAILABLE'),
                                                                              ('실전 스프링 부트', '김영한', '인프런', 2023, 28000, 'AVAILABLE'),
                                                                              ('Vue.js 프로그래밍', '장기효', '한빛미디어', 2021, 26000, 'AVAILABLE'),
                                                                              ('MongoDB 완벽 가이드', '크리스티나 초도로우', '한빛미디어', 2020, 42000, 'AVAILABLE'),
                                                                              ('Git 교과서', '이고잉', '길벗', 2019, 24000, 'AVAILABLE'),
                                                                              ('AWS 클라우드 완벽 가이드', '김원일', '위키북스', 2022, 48000, 'AVAILABLE'),
                                                                              ('웹 해킹 & 보안 완벽 가이드', '조성원', '한빛미디어', 2021, 35000, 'AVAILABLE');

-- 샘플 대출 데이터 (현재 대출 중) - user_id를 2부터 시작 (1은 admin)
INSERT INTO loans (user_id, book_id, loan_date, due_date, status) VALUES
                                                                      (3, 3, '2024-05-15 10:30:00', '2024-05-30 23:59:59', 'ACTIVE'),
                                                                      (4, 7, '2024-05-20 14:20:00', '2024-06-04 23:59:59', 'ACTIVE');

-- 샘플 대출 이력 데이터 (반납 완료)
INSERT INTO loans (user_id, book_id, loan_date, due_date, return_date, status) VALUES
                                                                                   (2, 1, '2024-04-01 09:00:00', '2024-04-16 23:59:59', '2024-04-14 16:30:00', 'RETURNED'),
                                                                                   (3, 4, '2024-04-05 11:15:00', '2024-04-20 23:59:59', '2024-04-18 10:45:00', 'RETURNED'),
                                                                                   (4, 8, '2024-04-10 13:45:00', '2024-04-25 23:59:59', '2024-04-22 15:20:00', 'RETURNED'),
                                                                                   (2, 5, '2024-04-20 10:00:00', '2024-05-05 23:59:59', '2024-05-03 14:10:00', 'RETURNED'),
                                                                                   (5, 2, '2024-05-01 12:30:00', '2024-05-16 23:59:59', '2024-05-14 09:45:00', 'RETURNED');
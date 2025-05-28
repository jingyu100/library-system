# 미니 도서관 관리 시스템

## 프로젝트 개요
회사, 학교, 학원 등에서 운영하는 소규모 도서관을 위한 웹 기반 관리 시스템입니다.

## 주요 기능

### 사용자 기능
- 도서 검색 (제목, 저자, 출판사)
- 검색 결과 정렬 (제목, 저자, 출간년 기준)
- 대출 가능/불가 상태 확인
- 페이지네이션 지원

### 관리자 기능
- 사용자 관리 (등록, 수정, 삭제, 대출 현황 조회)
- 도서 관리 (등록, 수정, 삭제, 대출 현황 및 이력 조회)
- 대출/반납 처리
- 연체 도서 관리
- 대시보드 (통계 정보)

## 기술 스택

### Backend
- Java 21
- Spring Boot 3.5.0
- Spring Security
- Spring Data JPA
- H2 Database (파일 기반)
- JWT 토큰 인증
- Lombok

### Frontend
- React (Lucide React 아이콘)
- Tailwind CSS
- JavaScript ES6+

## 시스템 요구사항
- JDK 21
- H2 Database (파일: ./data/library)

## 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd librarysystem
```

### 2. 백엔드 실행
```bash
./gradlew bootRun
```

### 3. 애플리케이션 접속
- 메인 페이지: http://localhost:8080
- 사용자 페이지: http://localhost:8080/user
- 관리자 로그인: http://localhost:8080/admin/login
- H2 콘솔: http://localhost:8080/h2-console

## 기본 계정 정보

### 관리자 계정
- **사용자명**: admin
- **비밀번호**: admin123

## API 명세

### 공개 API (인증 불필요)
- `GET /api/public/books/search` - 도서 검색

### 인증 API
- `POST /api/auth/login` - 로그인

### 관리자 API (JWT 토큰 필요)
- `GET /api/admin/users` - 사용자 목록 조회
- `POST /api/admin/users` - 사용자 생성
- `PUT /api/admin/users/{id}` - 사용자 수정
- `DELETE /api/admin/users/{id}` - 사용자 삭제
- `GET /api/admin/books` - 도서 목록 조회
- `POST /api/admin/books` - 도서 생성
- `PUT /api/admin/books/{id}` - 도서 수정
- `DELETE /api/admin/books/{id}` - 도서 삭제
- `GET /api/admin/loans` - 현재 대출 목록
- `GET /api/admin/loans/overdue` - 연체 도서 목록
- `POST /api/admin/loans/loan` - 대출 처리
- `POST /api/admin/loans/return/{loanId}` - 반납 처리

## 데이터베이스 설계

### 주요 테이블
1. **users** - 사용자 정보
   - id (PK)
   - username (unique)
   - password
   - name
   - contact
   - memo
   - user_type (ADMIN, USER)

2. **books** - 도서 정보
   - id (PK)
   - title
   - author
   - publisher
   - published_year
   - price
   - status (AVAILABLE, LOANED)

3. **loans** - 대출 정보
   - id (PK)
   - user_id (FK)
   - book_id (FK)
   - loan_date
   - due_date (대출일 + 15일)
   - return_date
   - status (ACTIVE, RETURNED, OVERDUE)

4. **refresh_tokens** - JWT 리프레시 토큰
   - id (PK)
   - user_id (FK)
   - refresh_token

## 비즈니스 규칙
1. 대출 기간: 15일
2. 연체 판정: 반납 예정일 초과 시
3. 도서별 단일 대출: 한 권당 한 명만 대출 가능
4. 사용자 일련번호와 도서 일련번호로 대출/반납 처리

## 보안
- JWT 기반 인증/인가
- 비밀번호 암호화 (BCrypt)
- CSRF 보호
- API 엔드포인트별 권한 제어

## 개발자 정보
- **개발자**: 조수연 (Cho Suyeon)
- **연도**: 2025

## 라이센스
이 프로젝트는 교육 목적으로 개발되었습니다.
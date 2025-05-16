# backend

FastAPI + MySQL 기반 수강신청 서버 프로젝트입니다.  
JWT 인증·권한 처리, 수강신청 경쟁률·대기목록, 좌석 제한·중복 방지 로직, Docker 이미지 빌드 등을 포함합니다.

---

## 🚀 주요 기능

- **인증/사용자 관리**: JWT 로그인 · 로그아웃 · 사용자 정보 조회  
- **강의 조회**: 강의 목록 조회 · 상세 조회 (필터·페이징 지원)  
- **학생 관리**: 학생 등록 · 조회  
- **수강신청(Registrations)**: 신청 · 내역 조회 · 취소 · 경쟁률 확인 · 대기목록 등록  
- **관리자용**  
  - 학기 관리: 학기 생성·수정·조회  
  - 강의 관리: 강의 개설·수정·삭제 · 수강생 명단 조회  
  - 시스템 모니터링: 상태 확인 · 메트릭 조회 · 오토스케일 설정  
- **부하 테스트**: `/load` 엔드포인트 (옵션)

---

## 📋 요구사항

- Python 3.11.x  
- [uv](https://github.com/uv-dev/uv) (권장) 또는 pip  
- MySQL 8.0 이상  
- Docker (선택)

---

## ⚙️ 설치 및 실행

1. 저장소 클론  
   ```bash
   git clone https://github.com/사용자/프로젝트.git
   cd 프로젝트/backend
   ```

2. 의존성 설치 및 가상환경 설정  
   ```bash
   uv init
   uv sync
   ```

3. 환경 변수 설정  
   프로젝트 루트에 `.env` 파일을 생성하고 다음을 작성하세요:  
   ```dotenv
   DATABASE_URL=mysql+pymysql://root:비밀번호@localhost:3306/your_db
   SECRET_KEY=랜덤한_비밀키
   ```

4. 데이터베이스 및 테이블 생성  
   - 애플리케이션 시작 시 자동으로 SQLModel 메타데이터를 기반으로 테이블이 생성됩니다.  
   - 또는 수동으로 MySQL에 테이블을 생성하세요.

5. 서버 실행  
   ```bash
   uv run uvicorn app.main:app --reload --env-file .env
   ```

6. (선택) Docker로 실행  
   ```bash
   docker build -t your-backend-image .
   docker run -d -p 8000:8000 --env-file .env your-backend-image
   ```

---

## 📄 API 엔드포인트

### 인증 / 사용자
- `POST /api/auth/login` : 로그인  
- `POST /api/auth/logout`: 로그아웃  
- `GET  /api/auth/user`  : 현재 사용자 정보 조회  

### 강의(Courses)
- `GET    /api/courses`            : 강의 목록 조회  
- `GET    /api/courses/{id}`       : 강의 상세 조회  

### 학생(Students)
- `POST   /api/students`           : 학생 등록  
- `GET    /api/students`           : 학생 목록 조회  
- `GET    /api/students/{id}`      : 학생 상세 조회  

### 수강신청(Registrations)
- `POST   /api/registrations`                  : 수강신청  
- `GET    /api/registrations`                  : 수강신청 내역 조회  
- `DELETE /api/registrations/{registrationId}` : 수강신청 취소  
- `GET    /api/courses/{courseId}/competition` : 수강신청 경쟁률 확인  
- `POST   /api/courses/{courseId}/waitlist`    : 대기목록 등록  

### 관리자 (Admin)
- **학기 관리**  
  - `POST /api/admin/semesters`  
  - `PUT  /api/admin/semesters/{id}`  
  - `GET  /api/admin/semesters`  
- **강의 관리**  
  - `POST   /api/admin/courses`  
  - `PUT    /api/admin/courses/{id}`  
  - `DELETE /api/admin/courses/{id}`  
  - `GET    /api/admin/courses/{id}/students`  
- **시스템 관리**  
  - `GET  /api/admin/system/status`  
  - `GET  /api/admin/system/metrics`  
  - `PUT  /api/admin/system/scaling`  

---

## 📚 참고

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)  
- [SQLModel 튜토리얼](https://sqlmodel.tiangolo.com/)  
- [uv 서버 매뉴얼](https://docs.astral.sh/uv/)
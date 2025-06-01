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
   uv run uvicorn app.main:app --reload --env-file .env.test
   ```

6. (선택) Docker로 실행
   ```bash
   docker build -t your-backend-image .
   docker run -d -p 8000:8000 --env-file .env.test your-backend-image
   ```

---

## 🗂 ERD

![Image](https://github.com/user-attachments/assets/f9e65b0c-dfcd-4beb-9d03-44c1ae14276d)

---

## 📄 API 엔드포인트

## 목차

1. [Authentication (인증)](#authentication-인증)
    - `POST /api/register` (Register)
    - `POST /api/login` (Login)
    - `GET /api/profile` (Get Profile)
    - `GET /api/admin/users` (Get All Users)
    - `GET /api/dashboard` (Student Dashboard)

2. [Courses (강의 관리)](#courses-강의-관리)
    - `GET /api/admin/courses` (Read Courses)
    - `POST /api/admin/courses` (Add Course)
    - `GET /api/admin/courses/professor` (Get Courses By Professor)
    - `GET /api/admin/courses/{department_id}` (Read Courses By Department)
    - `GET /api/admin/courses/{course_id}/students` (Read Students By Course)
    - `PUT /api/admin/courses/{course_id}` (Update Course)
    - `DELETE /api/admin/courses/{course_id}` (Delete Course)
    - `GET /api/admin/courses/{course_id}` (Read Course)

1. [Registrations (수강 신청)](#registrations-수강-신청)
    - `GET /api/registrations` (Read Student Register)
    - `POST /api/registrations` (Register)
    - `GET /api/registrations/summary` (Retrieve Summarized Registration)
    - `DELETE /api/registrations/{course_id}` (Unregister)
    - `GET /api/registrations/{course_id}` (Read Register)

5. [Commons (공통)](#commons-공통)
    - `POST /api/getServerTime` (Get Server Time)

6. [Monitor (모니터링)](#monitor-모니터링)
    - `GET /api/grafana/cpu-usage` (Get CPU Usage)
    - `GET /api/grafana/memory-usage` (Get Memory Usage)
    - `GET /api/grafana/pod-status` (Get Pod Status)
    - `GET /api/grafana/node-status` (Get Node Status)
    - `GET /api/grafana/network-traffic` (Get Network Traffic)

7. [Load Test (부하 테스트)](#load-test-부하-테스트)
    - `POST /api/hap/loadtest` (Loadtest)

---

## 📚 참고

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [SQLModel 튜토리얼](https://sqlmodel.tiangolo.com/)
- [uv 서버 매뉴얼](https://docs.astral.sh/uv/)
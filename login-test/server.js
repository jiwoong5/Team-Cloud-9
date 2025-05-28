const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); // JSON 요청 본문을 파싱할 수 있게 해줍니다.

//server 시간 반환 API
app.get("/api/getServerTime", (req, res) => {
  const currentTime = new Date().toISOString(); // ISO 형식으로 현재 시간 가져오기
  const date = currentTime.split("T")[0]; // '2025-05-12' 형식으로 날짜만 추출
  const time = currentTime.split("T")[1].split(".")[0]; // '12:34:56' 형식으로 시간만 추출

  // 날짜와 시간 분리하여 반환
  res.json({ date, time });
});

app.post("/api/summary", (req, res) => {
  const { userId } = req.body;

  // 실제 환경에서는 userId를 기준으로 DB에서 데이터 조회
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  // 예시 응답 데이터 (userId에 따라 다르게 구성할 수 있음)
  const summaryData = {
    appliedCoursesCount: 3,
    appliedCredits: 6.0,
    availableCredits: 6.0,
    remainingCredits: 0.0,
  };

  res.json(summaryData);
});

app.post("/api/registeredCourses", (req, res) => {
  // body에 사용자 ID 등을 활용할 수도 있음: const { userId } = req.body;
  const registeredCourses = [
    {
      courseId: "CS101",
      courseName: "컴퓨터 개론",
      classSection: "001",
      courseCategory: "전공필수",
      credit: 3,
      limit: 40,
      retake: "N",
      scheduleSummary: "월 10:00-12:00 / 수 10:00-12:00",
      changeSection: "가능",
      note: "-"
    },
    {
      courseId: "MA202",
      courseName: "선형대수학",
      classSection: "002",
      courseCategory: "전공선택",
      credit: 3,
      limit: 35,
      retake: "Y",
      scheduleSummary: "화 14:00-16:00 / 목 14:00-16:00",
      changeSection: "불가",
      note: "수강신청 필수"
    }
  ];

  res.status(200).json(registeredCourses);
});

// 테스트용 과목 검색 API
app.post('/api/course/search', (req, res) => {
  // 간단한 고정 응답 예시
  const response = [
  {
    courseId: "ZE1000091",
    courseName: "고전읽기와토론",
    classSection: "001", 
    courseCategory: "교양필수",
    credit: 2,
    limit: "보기",
    waitingCount: "보기",
    professor: "박상현",
    department: "교양교육원 (051-510-3844~6)",
    scheduleSummary: "월 10:00(100) 422-303, 화 10:00(100) 422-303, 수 10:00(100) 422-303, 목 10:00(100) 422-303",
    note: "-"
  },
  {
    courseId: "CS2000150",
    courseName: "자료구조",
    classSection: "002", 
    courseCategory: "전공기초",
    credit: 3,
    limit: "50",
    waitingCount: "5",
    professor: "이정훈",
    department: "컴퓨터공학과",
    scheduleSummary: "화 13:00(100) 301-101, 목 13:00(100) 301-101",
    note: "필수 수강"
  },
  {
    courseId: "EN1000042",
    courseName: "기초영어회화",
    classSection: "003", 
    courseCategory: "일반선택",
    credit: 2,
    limit: "40",
    waitingCount: "0",
    professor: "John Smith",
    department: "영어영문학과",
    scheduleSummary: "월 09:00(100) 201-201, 수 09:00(100) 201-201",
    note: "-"
  }
];

  res.json(response);
});

app.post('/api/register-course', (req, res) => {
  const { studentId, courseId, classSection } = req.body;

  if (!studentId || !courseId || !classSection) {
    return res.status(400).json({ success: false, message: "필수 정보 누락" });
  }

  // 예시 로직 (실제 DB 처리 대신 로그 출력)
  console.log(`학생 ${studentId}님이 ${courseId} (${classSection})를 신청했습니다.`);

  // 성공 응답
  res.status(200).json({
    success: true,
    message: "수강신청이 완료되었습니다.",
    registeredCourse: { studentId, courseId, classSection }
  });
});

// 로그인 API
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;

  if (id === 'admin' && password === 'adminpass') {
    return res.json({
      success: true,
      message: '관리자 로그인 성공',
      user: {
        id: 'admin',
        name: '관리자',
        role: 'admin',
      },
    });
  }

  if (id === 'systemadmin' && password === 'systemadminpass') {
    return res.json({
      success: true,
      message: '시스템관리자 로그인 성공',
      user: {
        id: 'systemadmin',
        name: '시스템관리자',
        role: 'systemadmin',
      },  
    });
  }

  if (id === 'testUser' && password === 'password123') {
    return res.json({
      success: true,
      message: '로그인 성공',
      user: { "id": 1, "name": "아무개", "department": "공과대학", "major": "전기컴퓨터공학부", "year": "6학년", "degree": "학사", "earnedCredits": 999, "availableCredits": 6.0, "role":'student' },
    });
  } else {
    return res.status(401).json({
      success: false,
      message: '아이디 또는 비밀번호가 틀립니다.',
    });
  }
});

//강의개설 api
app.post("/api/lecture/create", (req, res) => {
  const lectureData = req.body;
  console.log("받은 강의 데이터:", lectureData);

  // 예시 응답: DB에 저장했다는 가정
  res.json({
    message: "강의가 성공적으로 등록되었습니다.",
    received: lectureData,
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});


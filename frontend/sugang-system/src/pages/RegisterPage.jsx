import React, { useEffect, useState } from "react";
import "./RegisterPage.css";
import pnuLogo from "../assets/pnu-logo.png";

export default function RegisterPage() {
  // 사용자 정보를 저장할 상태
  const [user, setUser] = useState(null);
  const [serverDate, setServerDate] = useState("");
  const [serverTime, setServerTime] = useState("");
  // CourseSearch 관련 상태
  const [departmentId, setDepartmentId] = useState(""); // 선택한 학과 ID
  const [courses, setCourses] = useState([]); // 조회된 강의 목록
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 메시지

  //register 관련 상태
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [loadingRegistered, setLoadingRegistered] = useState(false);
  const [errorRegistered, setErrorRegistered] = useState(null);
  const [registerResult, setRegisterResult] = React.useState(null);

  //history 관련 상태
  const [summary, setSummary] = useState({
    appliedCoursesCount: 0,
    appliedCredits: 0.0,
    availableCredits: 0.0,
    remainingCredits: 0.0,
  });

  // 컴포넌트가 마운트될 때 사용자 정보 가져오기
  //summary 가져오기 함수
  const fetchSummary = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }), // user.id 전달
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Summary를 가져오는 데 실패했습니다.", error);
    }
  };

  //신청내역 가져오기 함수
  const fetchRegisteredCourses = async () => {
    if (!user?.id) {
      setErrorRegistered("사용자 정보가 없습니다.");
      setRegisteredCourses([]);
      return;
    }

    setLoadingRegistered(true);
    setErrorRegistered(null);

    try {
      const res = await fetch(
        `http://localhost:8000/api/registrations/${user.id}`
      );
      if (!res.ok) throw new Error("등록 강의 조회 실패");

      const registrations = await res.json();

      const courseDetailPromises = registrations.map((reg) =>
        fetch(`http://localhost:8000/api/admin/courses/${reg.course_id}`).then(
          (r) => {
            if (!r.ok) throw new Error(`강의 상세 조회 실패: ${reg.course_id}`);
            return r.json();
          }
        )
      );

      const coursesDetails = await Promise.all(courseDetailPromises);

      setRegisteredCourses(coursesDetails);
    } catch (error) {
      setErrorRegistered(error.message);
      setRegisteredCourses([]);
    } finally {
      setLoadingRegistered(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // 여기서 user 상태 설정
      } catch (error) {
        console.error("Invalid user data in localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchRegisteredCourses(user.id);
      fetchSummary(user.id); // 여기에 summary도 함께 호출 가능
    }
  }, [user]);

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/getServerTime");
        if (response.ok) {
          const data = await response.json();
          setServerDate(data.date);
          setServerTime(data.time);
        } else {
          console.error("서버 응답 실패:", response.status);
        }
      } catch (error) {
        console.error("서버 시간을 가져오는 데 실패했습니다.", error);
      }
    };

    fetchServerTime();
    const interval = setInterval(fetchServerTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    // localStorage에서 사용자 정보 삭제
    localStorage.removeItem("user");

    // 로그아웃 후 로그인 페이지로 리디렉션
    window.location.href = "/login"; // 또는 history.push("/login") (React Router를 사용한다면)
  };

  const handleSearch = async () => {
    if (!departmentId) {
      setError("학과를 선택해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url =
        departmentId === "all"
          ? "http://localhost:8000/api/admin/courses/?page=1&size=50"
          : `http://localhost:8000/api/admin/courses/${departmentId}`;

      const response = await fetch(url);

      if (!response.ok) throw new Error("조회 실패");

      const data = await response.json();

      // 응답 구조에 따라 setCourses 처리
      if (departmentId === "all") {
        setCourses(data.items ?? []);
      } else {
        setCourses(data ?? []);
      }
    } catch (err) {
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCourse = async (courseId, professorId) => {
    try {
      const response = await fetch("http://localhost:8000/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user?.id,
          course_id: courseId,
          professor_id: professorId,
        }),
      });

      if (response.status === 201) {
        setRegisterResult("✅ 수강신청 성공");
        await fetchSummary();
        await fetchRegisteredCourses();
      } else if (response.status === 422) {
        const data = await response.json();
        setRegisterResult(`❌ 수강신청 실패: ${data.message}`);
      } else {
        setRegisterResult("❌ 알 수 없는 오류가 발생했습니다");
      }
    } catch (error) {
      setRegisterResult("❌ 네트워크 오류: 수강신청에 실패했습니다");
    }
  };

  const handleDeleteRegistration = async (courseId) => {
    if (!courseId) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/courses/${courseId}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 204) {
        setRegisterResult("✅ 수강 신청 삭제 성공");
        await fetchRegisteredCourses(); // 삭제 후 목록 갱신
      } else if (response.status === 422) {
        const data = await response.json();
        setRegisterResult(`❌ 삭제 실패: ${data.message || "유효성 오류"}`);
      } else {
        setRegisterResult("❌ 알 수 없는 오류가 발생했습니다");
      }
    } catch (error) {
      setRegisterResult("❌ 네트워크 오류: 삭제에 실패했습니다");
    }
  };

  return (
    <div className="main-page-container">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-left">
          <div className="nav-item">
            <img src={pnuLogo} alt="부산대학교 로고" className="pnu-logo" />
          </div>
          <div className="nav-item">수강신청(계절)</div>
          <div className="nav-item">수강신청(도약)</div>
          <div className="nav-item">공지사항</div>
          <div className="nav-item">학생기본정보</div>
          <div className="nav-item">게시판</div>
        </div>
        <div className="nav-right">
          <div className="nav-item">
            {serverDate}&nbsp;
            {serverTime}
          </div>
          <div className="nav-item">
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Combined Content Area */}
      <div className="content-wrapper">
        {/* User Info Section - Left */}
        {/* 사용자 정보가 있으면 표시 */}
        {user && (
          <div className="user-info">
            <div className="user-header">
              <h2>
                {user.name}({user.id})
              </h2>
              <p>
                {user.department}·{user.major}·{user.year}·{user.degree}
              </p>
            </div>
            <div className="semester-info">
              <h2>2025학년도 여름계절/도약</h2>
              <h3>수강신청(학부)</h3>
            </div>
            <div className="credit-info">
              <div className="credit-item">
                <strong>취득학점</strong> <span>{user.earnedCredits}</span>
              </div>
              <div className="credit-item">
                <strong>수강신청가능학점</strong>{" "}
                <span>{user.availableCredits}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Right */}
        <div className="register-content">
          {/* 
          div1: 교과목번호 + 분반 + 빠른수강신청, 대기순번신청 
          <div className="register-inline-section">
            <div className="input-pair">
              <label>교과목번호</label>
              <input type="text" />
            </div>
            <div className="input-pair">
              <label>분반</label>
              <input type="text" />
            </div>
            <button>빠른 수강신청</button>
            <button>대기순번 신청</button>
          </div>
*/}
          {/* div2: 교과목검색 */}
          <div className="section course-search-section">
            <h3>교과목 검색</h3>
            <div className="course-search-container">
              <table className="search-table">
                <tbody>
                  <tr>
                    <th>학과</th>
                    <td>
                      <select
                        className="select-input"
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                      >
                        <option value="">선택</option>
                        <option value="all">전체</option>
                        <option value="1">컴퓨터공학과</option>
                        <option value="2">전자공학과</option>
                        <option value="3">기계공학과</option>
                        {/* 필요 시 다른 학과 추가 */}
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="button-container">
              <button className="search-button" onClick={handleSearch}>
                조회
              </button>
            </div>
            {courses.length > 0 && (
              <div className="course-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>신청</th>
                      <th>교과목 코드</th>
                      <th>교과목명</th>
                      <th>설명</th>
                      <th>담당 교수 ID</th>
                      <th>학과 ID</th>
                      <th>학점</th>
                      <th>정원</th>
                      <th>신청 인원</th>
                      <th>요일</th>
                      <th>시작 시간</th>
                      <th>종료 시간</th>
                      <th>장소</th>
                      <th>선수 과목</th>
                      <th>학기</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <button
                            onClick={() =>
                              handleRegisterCourse(c.id, c.professor_id)
                            }
                          >
                            신청
                          </button>
                        </td>
                        <td>{c.course_code}</td>
                        <td>{c.name}</td>
                        <td>{c.description}</td>
                        <td>{c.professor_id}</td>
                        <td>{c.department_id}</td>
                        <td>{c.credits}</td>
                        <td>{c.capacity}</td>
                        <td>{c.enrolled}</td>
                        <td>{c.days_of_week}</td>
                        <td>{c.start_time}</td>
                        <td>{c.end_time}</td>
                        <td>{c.location}</td>
                        <td>{c.prerequisite}</td>
                        <td>{c.semester}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* div3: 수강신청 결과 모달 (성공/실패 메시지) */}
          <div className="registration-result">
            {registerResult && <p>{registerResult}</p>}
          </div>

          {/* div4: 수강신청내역, 대기순번신청내역 */}
          <div className="registration-history-container">
            {/* 상단 요약 정보 */}
            <div className="summary-section">
              <div className="summary-item">
                <span className="summary-label">신청과목수</span>
                <span className="summary-value">
                  {summary.appliedCoursesCount}건
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">신청학점</span>
                <span className="summary-value">{summary.appliedCredits}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">신청가능학점</span>
                <span className="summary-value">
                  {summary.availableCredits}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">남은신청가능학점</span>
                <span className="summary-value">
                  {summary.remainingCredits}
                </span>
              </div>
            </div>

            {/* 테이블 영역 */}
            <table className="table-section">
              <thead>
                <tr className="table-header">
                  <th className="header-cell">NO</th>
                  <th className="header-cell">삭제</th>
                  <th className="header-cell">교과목명</th>
                  <th className="header-cell">교과목번호</th>
                  <th className="header-cell">학점</th>
                  <th className="header-cell">정원</th>
                  <th className="header-cell">수강인원</th>
                  <th className="header-cell">요일</th>
                  <th className="header-cell">시간</th>
                  <th className="header-cell">위치</th>
                  <th className="header-cell">비고</th>
                </tr>
              </thead>
              <tbody>
                {loadingRegistered ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: "center" }}>
                      불러오는 중...
                    </td>
                  </tr>
                ) : errorRegistered ? (
                  <tr>
                    <td
                      colSpan="11"
                      style={{ textAlign: "center", color: "red" }}
                    >
                      {errorRegistered}
                    </td>
                  </tr>
                ) : registeredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: "center" }}>
                      등록된 강의가 없습니다.
                    </td>
                  </tr>
                ) : (
                  registeredCourses.map((course, idx) => (
                    <tr key={course.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteRegistration(course.id)}
                        >
                          삭제
                        </button>
                      </td>
                      <td>{course.name}</td>
                      <td>{course.course_code}</td>
                      <td>{course.credits}</td>
                      <td>{course.capacity}</td>
                      <td>{course.enrolled}</td>
                      <td>{course.days_of_week}</td>
                      <td>{(course.start_time, course.end_time)}</td>
                      <td>{course.location}</td>
                      <td>{course.prerequisite || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

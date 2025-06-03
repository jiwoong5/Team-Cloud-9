import React, { useEffect, useState, useCallback } from "react";
import "./RegisterPage.css";
import pnuLogo from "../assets/pnu-logo.png";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function RegisterPage() {
  // 사용자 정보를 저장할 상태
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  //서버시간
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

  // 수강생 수 정보를 저장할 상태 추가
  const [enrollmentCounts, setEnrollmentCounts] = useState({});

  useEffect(() => {
    // 서버 시간을 실시간으로 가져오는 코드 (POST 요청)
    const fetchServerTime = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/getServerTime`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // 빈 body (요청 파라미터 없음)
        });

        if (response.ok) {
          const data = await response.json();
          console.log("서버 응답 데이터:", data);
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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setAccessToken(token);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("프로필 불러오기 실패", response.status);
        }
      } catch (err) {
        console.error("프로필 요청 에러", err);
      }
    };

    fetchProfile();
  }, [accessToken]);

  // 특정 강의의 수강생 수를 조회하는 함수
  const fetchEnrollmentCount = async (courseId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return 0;

      const response = await fetch(
        `${API_BASE_URL}/api/admin/courses/${courseId}/students`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const students = await response.json();
        return Array.isArray(students) ? students.length : 0;
      } else {
        console.error(
          `수강생 조회 실패 for course ${courseId}:`,
          response.status
        );
        return 0;
      }
    } catch (error) {
      console.error(`수강생 조회 에러 for course ${courseId}:`, error);
      return 0;
    }
  };

  // 여러 강의의 수강생 수를 일괄 조회하는 함수
  const fetchAllEnrollmentCounts = async (courseIds) => {
    const counts = {};

    // 병렬로 모든 강의의 수강생 수 조회
    const promises = courseIds.map(async (courseId) => {
      const count = await fetchEnrollmentCount(courseId);
      counts[courseId] = count;
      return { courseId, count };
    });

    await Promise.all(promises);
    setEnrollmentCounts((prev) => ({ ...prev, ...counts }));
  };

  // summary 가져오기 함수
  const fetchSummary = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("Access token이 없습니다.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/registrations/summary`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const appliedCredits = data.credits;
      const availableCredits = 21;
      const remainingCredits = availableCredits - appliedCredits;
      const appliedCoursesCount = Math.floor(appliedCredits / 3);

      // appliedCoursesCount는 현재 응답에서 없으므로 별도 API 필요. 일단 0으로 대체
      setSummary({
        appliedCoursesCount, // 또는 실제 값을 가져올 수 있다면 반영
        appliedCredits,
        availableCredits,
        remainingCredits,
      });
    } catch (error) {
      console.error("Summary를 가져오는 데 실패했습니다.", error);
    }
  }, []);

  // 신청내역 가져오기 함수
  const fetchRegisteredCourses = useCallback(async () => {
    setLoadingRegistered(true);
    setErrorRegistered(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("Access token이 없습니다.");
        setLoadingRegistered(false);
        return;
      }

      console.log(`Fetching registrations for user: ${user.id}`);

      const res = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`등록 강의 조회 실패: ${res.status}`);
      }

      const registrations = await res.json();
      console.log("Registrations received:", registrations);

      if (!Array.isArray(registrations) || registrations.length === 0) {
        setRegisteredCourses([]);
        return;
      }

      // 각 등록 정보에 대해 강의 상세 정보 조회
      const courseDetailPromises = registrations.map(async (reg) => {
        try {
          console.log(
            `Fetching course details for course_id: ${reg.course_id}`
          );
          const response = await fetch(
            `${API_BASE_URL}/api/admin/courses/${reg.course_id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `강의 상세 조회 실패: ${reg.course_id} - ${response.status}`
            );
          }

          const courseData = await response.json();
          console.log(`Course data for ${reg.course_id}:`, courseData);

          // API 응답이 단일 객체인지 확인
          if (!courseData || !courseData.id) {
            console.warn(
              `유효하지 않은 course data for ${reg.course_id}:`,
              courseData
            );
            return null;
          }

          // 등록 정보를 강의 데이터에 추가하여 반환
          return {
            ...courseData,
            registration_id: reg.id, // 등록 ID 추가
            enrolled_at: reg.enrolled_at, // 등록 시간도 추가
          };
        } catch (error) {
          console.error(`Error fetching course ${reg.course_id}:`, error);
          return null;
        }
      });

      const coursesDetails = await Promise.all(courseDetailPromises);

      // null 값 필터링
      const validCourses = coursesDetails.filter((course) => course !== null);
      console.log("Course details received:", validCourses);
      console.log("Setting registered courses to state:", validCourses);

      setRegisteredCourses(validCourses);

      // 등록된 강의들의 수강생 수 조회
      const courseIds = validCourses.map((course) => course.id);
      if (courseIds.length > 0) {
        await fetchAllEnrollmentCounts(courseIds);
      }
    } catch (error) {
      console.error("Error in fetchRegisteredCourses:", error);
      setErrorRegistered(error.message);
      setRegisteredCourses([]);
    } finally {
      setLoadingRegistered(false);
    }
  }, [user?.id]);

  // user가 설정된 후 데이터 fetch
  useEffect(() => {
    if (user?.id) {
      console.log("User loaded, fetching data for user:", user.id);
      fetchRegisteredCourses();
      fetchSummary();
    }
  }, [user?.id, fetchRegisteredCourses, fetchSummary]);

  useEffect(() => {
    console.log("📦 registeredCourses 변경:", registeredCourses);
  }, [registeredCourses]);

  const handleLogout = () => {
    // 로컬 스토리지에서 모든 인증 관련 정보 제거
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    window.location.href = "/login";
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
          ? `${API_BASE_URL}/api/admin/courses/?page=1&size=50`
          : `${API_BASE_URL}/api/admin/courses/department/${departmentId}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("조회 실패");

      const data = await response.json();

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
      const response = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user_id: user?.id,
          course_id: courseId,
        }),
      });
      if (response.status === 201) {
        setRegisterResult("✅ 수강신청 성공");
        // 성공 후 데이터 새로고침
        await fetchSummary();
        await fetchRegisteredCourses();
      } else if (response.status === 422) {
        const data = await response.json();
        setRegisterResult(`❌ 수강신청 실패: ${data.message}`);
      } else if (response.status === 400) {
        const data = await response.json();
        setRegisterResult(`❌ 이미 신청된 과목`);
      } else {
        setRegisterResult("❌ 알 수 없는 오류가 발생했습니다");
      }
    } catch (error) {
      setRegisterResult("❌ 네트워크 오류: 수강신청에 실패했습니다");
    }
  };

  const handleDeleteRegistration = async (registrationId) => {
    if (!registrationId || !user?.id) return;

    try {
      // 수강신청 취소 API 호출 - 등록 ID를 사용
      const response = await fetch(
        `${API_BASE_URL}/api/registrations/${registrationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 204 || response.status === 200) {
        setRegisterResult("✅ 수강 신청 삭제 성공");
        // 삭제 후 데이터 새로고침
        await fetchRegisteredCourses();
        await fetchSummary();
      } else if (response.status === 422) {
        const data = await response.json();
        setRegisterResult(`❌ 삭제 실패: ${data.message || "유효성 오류"}`);
      } else {
        setRegisterResult("❌ 알 수 없는 오류가 발생했습니다");
      }
    } catch (error) {
      console.error("Delete registration error:", error);
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
            {serverDate ? `${serverDate}` : "날짜 로딩 중"}&nbsp;
            {serverTime ? `${serverTime.slice(0, 8)}` : "시간 로딩 중"}
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
        {user && (
          <div className="user-info">
            <div className="user-header">
              <h2>
                {user.username} ({user.id})
              </h2>
              <p>{user.email}</p>
            </div>

            <div className="semester-info">
              <h2>2025학년도 여름계절/도약</h2>
              <h3>수강신청(학부)</h3>
            </div>

            <div className="credit-info">
              <div className="credit-item">
                <strong>역할</strong> <span>{user.role}</span>
              </div>
              <div className="credit-item">
                <strong>계정상태</strong>{" "}
                <span>{user.is_active ? "활성" : "비활성"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Right */}
        <div className="register-content">
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
                      <tr key={`course-${c.id}-${idx}`}>
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
                        <td>{c.user_id}</td>
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
                  {summary.appliedCoursesCount}
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
                  <th className="header-cell">등록ID</th>{" "}
                  {/* 등록 ID 컬럼 추가 */}
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
                    <td colSpan="12" style={{ textAlign: "center" }}>
                      불러오는 중...
                    </td>
                  </tr>
                ) : errorRegistered ? (
                  <tr>
                    <td
                      colSpan="12"
                      style={{ textAlign: "center", color: "red" }}
                    >
                      {errorRegistered}
                    </td>
                  </tr>
                ) : registeredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: "center" }}>
                      등록된 강의가 없습니다.
                    </td>
                  </tr>
                ) : (
                  registeredCourses.map((course, idx) => (
                    <tr key={`registered-${course.registration_id}-${idx}`}>
                      <td>{idx + 1}</td>
                      <td>
                        <button
                          onClick={() =>
                            handleDeleteRegistration(course.registration_id)
                          }
                        >
                          삭제
                        </button>
                      </td>
                      <td>{course.registration_id}</td>
                      <td>{course.name}</td>
                      <td>{course.course_code}</td>
                      <td>{course.credits}</td>
                      <td>{course.capacity}</td>
                      <td>
                        {enrollmentCounts[course.id] !== undefined
                          ? enrollmentCounts[course.id]
                          : course.enrolled}
                      </td>
                      <td>{course.days_of_week}</td>
                      <td>
                        {course.start_time} - {course.end_time}
                      </td>
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

import React, { useEffect, useState } from "react";
import "./AdminPage.css";
import pnuLogo from "../assets/pnu-logo.png";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function AdminPage() {
  // 사용자 정보를 저장할 상태
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  //시간
  const [serverDate, setServerDate] = useState("");
  const [serverTime, setServerTime] = useState("");
  //탭
  const [activeTab, setActiveTab] = useState("create");

  //강의 등록
  const [newLecture, setNewLecture] = useState({
    course_code: "",
    name: "",
    description: "",
    professor_id: "", // 숫자지만 입력은 문자열로 받아서 변환할게요
    location: "",
    days_of_week: "",
    start_time: "",
    end_time: "",
    department_id: "",
    credits: "",
    capacity: "",
    enrolled: "",
    prerequisite: "",
    semester: "",
  });

  //search용
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //수강생 조회 - courses와 별도로 관리
  const [selectedLectureId, setSelectedLectureId] = useState(null);

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
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

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

  useEffect(() => {
    if (user && user.id) {
      setNewLecture((prev) => ({
        ...prev,
        user_id: user.id,
      }));
    }
  }, [user]);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleLogout = () => {
    // 로컬 스토리지에서 모든 인증 관련 정보 제거
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    window.location.href = "/login";
  };

  // 강의 관리 탭에서 실제 수강생 수 조회
  useEffect(() => {
    if (activeTab === "manage" && courses.length > 0 && accessToken) {
      fetchAllStudentsForManage(accessToken);
    }
  }, [activeTab, courses.length, accessToken]);

  // 수강생 조회 탭 활성화 시 수강생 정보 로드
  useEffect(() => {
    if (activeTab === "students" && courses.length > 0 && accessToken) {
      fetchAllStudents(accessToken);
    }
  }, [activeTab, courses.length, accessToken]);

  //강의개설란 입력 감지 함수
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLecture((prev) => ({ ...prev, [name]: value }));
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return null;
    // timeStr이 'HH:mm' 이라 가정
    return timeStr.length === 5 ? timeStr + ":00" : timeStr; // 'HH:mm:ss' 형태로 맞춤
  };

  //강의개설 버튼 함수
  const handleAddLecture = async () => {
    try {
      const body = {
        course_code: newLecture.course_code.trim() || null, // 빈 문자열이면 null
        name: newLecture.name.trim() || null,
        description: newLecture.description.trim() || null,
        professor_id: newLecture.professor_id
          ? Number(newLecture.professor_id)
          : null,
        location: newLecture.location.trim() || null,
        days_of_week: newLecture.days_of_week.trim() || null,
        start_time: formatTime(newLecture.start_time) || null,
        end_time: formatTime(newLecture.end_time) || null,
        department_id: newLecture.department_id
          ? Number(newLecture.department_id)
          : null,
        credits: newLecture.credits ? Number(newLecture.credits) : 3, // DB 기본값 3
        capacity: newLecture.capacity ? Number(newLecture.capacity) : 30, // DB 기본값 30
        enrolled: newLecture.enrolled ? Number(newLecture.enrolled) : 0, // DB 기본값 0
        prerequisite: newLecture.prerequisite.trim() || null,
        semester: newLecture.semester.trim() || null,
        user_id: user?.id || null,
      };
      const response = await fetch(`${API_BASE_URL}/api/admin/courses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.status === 400) {
        const errorData = await response.json();
        alert("중복된 과목입니다: " + (errorData.detail || ""));
        return;
      }

      if (!response.ok) throw new Error("등록 실패");

      const data = await response.json();
      alert("강의 등록 성공: " + JSON.stringify(data));
      handleSearch(); // 등록 후 갱신
    } catch (err) {
      console.error(err);
      alert("강의 등록 실패: " + err.message);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("Access token이 없습니다.");
        return;
      }
      const response = await fetch(
        `${API_BASE_URL}/api/admin/courses/professor`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("서버 응답 오류");
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError("강의 목록을 불러오는 데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("삭제 실패");
      }

      // 삭제 성공 시 상태에서 해당 강의 제거
      setCourses(courses.filter((course) => course.id !== id));
      alert("강의가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error(error);
      alert("강의 삭제 실패: " + error.message);
    }
  };

  // 수강생 정보를 가져오는 함수
  const fetchStudents = async (courseId, accessToken) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/courses/${courseId}/students`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const students = await res.json();
      return students;
    } catch (error) {
      console.error("수강생 정보 조회 실패:", error);
      throw error;
    }
  };

  // 강의 관리 탭용: 실제 수강생 수만 업데이트
  const fetchAllStudentsForManage = async (accessToken) => {
    try {
      // 모든 코스에 대해 수강생 수를 병렬로 가져와서 enrolled 업데이트
      const coursesWithUpdatedEnrolled = await Promise.all(
        courses.map(async (course) => {
          try {
            const students = await fetchStudents(course.id, accessToken);
            return {
              ...course,
              enrolled: students ? students.length : 0, // 실제 수강생 수로 업데이트
            };
          } catch (error) {
            console.error(`코스 ${course.id} 수강생 수 조회 실패:`, error);
            return course; // 실패 시 원본 데이터 유지
          }
        })
      );

      setCourses(coursesWithUpdatedEnrolled);
    } catch (error) {
      console.error("수강생 수 업데이트 실패:", error);
    }
  };

  // 수강생 조회 탭용: 모든 코스의 수강생 정보를 가져와서 courses 상태를 업데이트하는 함수
  const fetchAllStudents = async (accessToken) => {
    setLoading(true);
    try {
      // 모든 코스에 대해 수강생 정보를 병렬로 가져오기
      const coursesWithStudents = await Promise.all(
        courses.map(async (course) => {
          try {
            const students = await fetchStudents(course.id, accessToken);
            return {
              ...course,
              students: students || [],
              enrolled: students ? students.length : 0, // 실제 수강생 수로 업데이트
            };
          } catch (error) {
            console.error(`코스 ${course.id} 수강생 조회 실패:`, error);
            return {
              ...course,
              students: [],
              enrolled: 0,
            };
          }
        })
      );

      setCourses(coursesWithStudents);
    } catch (error) {
      setError("수강생 정보 조회 중 오류가 발생했습니다.");
      console.error("전체 수강생 정보 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 특정 코스의 수강생 정보만 업데이트하는 함수
  const updateCourseStudents = async (courseId, accessToken) => {
    try {
      const students = await fetchStudents(courseId, accessToken);

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId
            ? {
                ...course,
                students: students || [],
                enrolled: students ? students.length : 0, // 실제 수강생 수로 업데이트
              }
            : course
        )
      );

      return students;
    } catch (error) {
      setError(`코스 ${courseId} 수강생 정보 조회 실패`);
      throw error;
    }
  };

  // 테이블에서 강의 클릭 시 수강생 정보를 가져오는 핸들러
  const handleLectureClick = async (courseId) => {
    setSelectedLectureId(courseId);

    // 해당 코스에 이미 수강생 정보가 있는지 확인
    const selectedCourse = courses.find((course) => course.id === courseId);

    if (!selectedCourse?.students) {
      try {
        await updateCourseStudents(courseId, accessToken);
      } catch (error) {
        console.error("수강생 정보 로드 실패:", error);
      }
    }
  };

  return (
    <div className="admin-container">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="nav-left">
          <div className="nav-item">
            <img src={pnuLogo} alt="부산대학교 로고" className="pnu-logo" />
          </div>
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
      <h1 className="admin-title">강의 관리자 페이지</h1>
      <div className="tabs">
        <div className="tab-buttons">
          <button
            className={activeTab === "create" ? "active" : ""}
            onClick={() => setActiveTab("create")}
          >
            강의 개설
          </button>
          <button
            className={activeTab === "manage" ? "active" : ""}
            onClick={() => setActiveTab("manage")}
          >
            강의 관리
          </button>
          <button
            className={activeTab === "students" ? "active" : ""}
            onClick={() => setActiveTab("students")}
          >
            수강생 조회
          </button>
        </div>
        <div className="tab-content-wrapper">
          {activeTab === "create" && (
            <div className="tab-content" id="create-content">
              <h2>강의 개설</h2>

              <input
                name="course_code"
                placeholder="교과목 번호"
                value={newLecture.course_code}
                onChange={handleInputChange}
              />
              <input
                name="name"
                placeholder="교과목명"
                value={newLecture.name}
                onChange={handleInputChange}
              />
              <input
                name="professor_id"
                placeholder="담당교수 ID"
                value={newLecture.professor_id}
                onChange={handleInputChange}
              />
              <input
                name="location"
                placeholder="강의실"
                value={newLecture.location}
                onChange={handleInputChange}
              />
              <input
                name="days_of_week"
                placeholder="요일"
                value={newLecture.days_of_week}
                onChange={handleInputChange}
              />
              <input
                name="start_time"
                placeholder="시작 시간 (예: 09:00)"
                value={newLecture.start_time}
                onChange={handleInputChange}
              />
              <input
                name="end_time"
                placeholder="종료 시간 (예: 10:15)"
                value={newLecture.end_time}
                onChange={handleInputChange}
              />
              <input
                name="department_id"
                placeholder="개설학과 ID"
                value={newLecture.department_id}
                onChange={handleInputChange}
              />
              <input
                name="credits"
                placeholder="학점"
                value={newLecture.credits}
                onChange={handleInputChange}
              />
              <input
                name="capacity"
                placeholder="제한 인원"
                value={newLecture.capacity}
                onChange={handleInputChange}
              />
              <input
                name="enrolled"
                placeholder="수강 인원"
                value={newLecture.enrolled}
                onChange={handleInputChange}
              />
              <input
                name="prerequisite"
                placeholder="선수 과목"
                value={newLecture.prerequisite}
                onChange={handleInputChange}
              />
              <input
                name="semester"
                placeholder="학기"
                value={newLecture.semester}
                onChange={handleInputChange}
              />
              <input
                name="description"
                placeholder="설명"
                value={newLecture.description}
                onChange={handleInputChange}
              />

              <button onClick={handleAddLecture}>강의 등록</button>
            </div>
          )}
          {activeTab === "manage" && (
            <div className="tab-content" id="manage-content">
              <h2>강의 관리</h2>
              {loading && <p>로딩 중...</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}
              <table>
                <thead>
                  <tr>
                    <th>NO</th>
                    <th>관리</th>
                    <th>과목 ID</th>
                    <th>교과목번호</th>
                    <th>교과목명</th>
                    <th>담당교수 ID</th>
                    <th>강의실</th>
                    <th>요일</th>
                    <th>시작 시간</th>
                    <th>종료 시간</th>
                    <th>개설학과 ID</th>
                    <th>학점</th>
                    <th>제한 인원</th>
                    <th>수강 인원</th>
                    <th>선수과목</th>
                    <th>학기</th>
                    <th>설명</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, idx) => (
                    <tr key={c.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <button onClick={() => handleDeleteCourse(c.id)}>
                          삭제
                        </button>
                      </td>

                      <td>{c.id}</td>
                      <td>{c.course_code}</td>
                      <td>{c.name}</td>
                      <td>{c.user_id}</td>
                      <td>{c.location ?? "-"}</td>
                      <td>{c.days_of_week ?? "-"}</td>
                      <td>{c.start_time?.slice(0, 5) ?? "-"}</td>
                      <td>{c.end_time?.slice(0, 5) ?? "-"}</td>
                      <td>{c.department_id}</td>
                      <td>{c.credits}</td>
                      <td>{c.capacity}</td>
                      <td>{c.enrolled}</td>
                      <td>{c.prerequisite ?? "-"}</td>
                      <td>{c.semester ?? "-"}</td>
                      <td>{c.description ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "students" && (
            <div className="tab-content" id="students-content">
              <h2>수강생 조회</h2>
              {loading && <p>수강생 정보를 불러오는 중...</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}
              {courses.length === 0 ? (
                <p>등록된 강의가 없습니다.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>교과목번호</th>
                      <th>교과목명</th>
                      <th>강의실</th>
                      <th>수강생 수</th>
                      <th>수강생 이메일 목록</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr
                        key={course.id}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedLectureId === course.id
                              ? "#eef"
                              : "transparent",
                        }}
                        onClick={() => handleLectureClick(course.id)}
                      >
                        <td>{course.course_code || course.id}</td>
                        <td>{course.name}</td>
                        <td>{course.location || "N/A"}</td>
                        <td>{course.students ? course.students.length : 0}</td>
                        <td>
                          {course.students && course.students.length > 0
                            ? course.students.map((s) => s.email).join(", ")
                            : "수강생 없음"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

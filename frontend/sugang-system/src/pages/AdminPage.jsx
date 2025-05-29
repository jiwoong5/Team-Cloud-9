import React, { useEffect, useState } from "react";
import "./AdminPage.css";
import pnuLogo from "../assets/pnu-logo.png";

export default function AdminPage() {
  // 사용자 정보를 저장할 상태
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
    professor_id: "",
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

  const [lectures, setLectures] = useState([]);

  //search용
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    // localStorage에서 사용자 정보 삭제
    localStorage.removeItem("user");

    // 로그아웃 후 로그인 페이지로 리디렉션
    window.location.href = "/login"; // 또는 history.push("/login") (React Router를 사용한다면)
  };

  const handleDeleteLecture = (id) => {
    setLectures(lectures.filter((lec) => lec.id !== id));
  };

  //강의개설란 입력 감지 함수
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLecture((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/admin/courses/?page=1&size=50"
      );
      if (!response.ok) {
        throw new Error("서버 응답 오류");
      }

      const data = await response.json();
      setCourses(data.items || []);
    } catch (err) {
      setError("강의 목록을 불러오는 데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  //강의개설 버튼 함수
  const handleAddLecture = async () => {
    try {
      // newLecture에서 API 요구 사항에 맞게 변환
      const body = {
        course_code: newLecture.course_code || "",
        name: newLecture.name || "",
        description: newLecture.description || null,
        professor_id: Number(newLecture.professor_id) || 0,
        location: newLecture.location || null,
        days_of_week: newLecture.days_of_week || null,
        start_time: newLecture.start_time
          ? newLecture.start_time.slice(0, 5)
          : null,
        end_time: newLecture.end_time ? newLecture.end_time.slice(0, 5) : null,
        department_id: Number(newLecture.department_id) || 0,
        credits:
          newLecture.credits !== undefined ? Number(newLecture.credits) : null,
        capacity:
          newLecture.capacity !== undefined
            ? Number(newLecture.capacity)
            : null,
        enrolled:
          newLecture.enrolled !== undefined ? Number(newLecture.enrolled) : 0,
        prerequisite: newLecture.prerequisite || null,
        semester: newLecture.semester || null,
      };

      const response = await fetch("http://localhost:8000/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("등록 실패");

      const data = await response.json();
      alert("강의 등록 성공: " + JSON.stringify(data));
      handleSearch();
    } catch (err) {
      console.error(err);
      alert("강의 등록 실패: " + err.message);
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
    handleSearch();
  }, []);

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
              <table>
                <thead>
                  <tr>
                    <th>NO</th>
                    <th>교과목번호</th> {/* course_code */}
                    <th>교과목명</th> {/* name */}
                    <th>담당교수 ID</th> {/* professor_id */}
                    <th>강의실</th> {/* location */}
                    <th>요일</th> {/* days_of_week */}
                    <th>시작 시간</th> {/* start_time */}
                    <th>종료 시간</th> {/* end_time */}
                    <th>개설학과 ID</th> {/* department_id */}
                    <th>학점</th> {/* credits */}
                    <th>제한 인원</th> {/* capacity */}
                    <th>수강 인원</th> {/* enrolled */}
                    <th>선수과목</th> {/* prerequisite */}
                    <th>학기</th> {/* semester */}
                    <th>설명</th> {/* description */}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, idx) => (
                    <tr key={c.id}>
                      <td>{idx + 1}</td>
                      <td>{c.course_code}</td>
                      <td>{c.name}</td>
                      <td>{c.professor_id}</td>
                      <td>{c.location ?? "-"}</td>
                      <td>{c.days_of_week ?? "-"}</td>
                      <td>{c.start_time?.slice(0, 5) ?? "-"}</td>
                      <td>{c.end_time?.slice(0, 5) ?? "-"}</td>
                      <td>{c.department_id}</td>
                      <td>{c.credits ?? "-"}</td>
                      <td>{c.capacity ?? "-"}</td>
                      <td>{c.enrolled ?? "-"}</td>
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
              <table>
                <thead>
                  <tr>
                    <th>교과목번호</th>
                    <th>교과목명</th>
                    <th>분반</th>
                    <th>수강생 수</th>
                    <th>제한인원</th>
                  </tr>
                </thead>
                <tbody>
                  {lectures.map((lecture) => (
                    <tr key={lecture.id}>
                      <td>{lecture.id}</td>
                      <td>{lecture.title}</td>
                      <td>{lecture.classSection || "N/A"}</td>
                      <td>{lecture.students?.length || 0}</td>
                      <td>
                        {lecture.students?.length
                          ? lecture.students.join(", ")
                          : "없음"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

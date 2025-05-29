import React, { useState } from "react";
import "./LoginPage.css";
import pnuLogo from "../assets/pnu-logo.png";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [id, setId] = useState(""); // ID 상태
  const [password, setPassword] = useState(""); // 비밀번호 상태
  const [error, setError] = useState(""); // 오류 메시지 상태
  const navigate = useNavigate();

  // 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 로그인 API 호출 (여기서는 가상의 API로 예시 나중에 상해님 제공 api로 변경)
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 로그인 성공시 처리
        console.log("로그인 성공", data);
        localStorage.setItem("user", JSON.stringify(data.user)); // 로그인 정보 로컬스토리지 저장
        if (data.role === "admin") {
          navigate("/admin"); // 관리자 페이지로
        }
        if (data.role === "systemadmin") {
          navigate("/systemadmin"); //시스템 관리자 페이지로
        } else {
          navigate("/main"); // 일반 사용자 페이지로
        }
      } else {
        // 로그인 실패시 처리
        setError(data.message); // 오류 메시지 상태 업데이트
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다."); // API 호출 실패 시 오류 메시지
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <img src={pnuLogo} alt="부산대학교 로고" className="pnu-logo" />
      </header>

      <div className="login-box">
        <h2 className="login-title">로그인</h2>
        {error && <p className="error-message">{error}</p>}{" "}
        {/* 오류 메시지 출력 */}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="ID"
            className="login-input"
            value={id}
            onChange={(e) => setId(e.target.value)} // 입력값 상태 업데이트
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // 입력값 상태 업데이트
            required
          />
          <button type="submit" className="login-button">
            로그인
          </button>
        </form>
      </div>

      <div className="schedule-section">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>학사일정</th>
              <th>시작일시</th>
              <th>종료일시</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>희망과목담기</td>
              <td>2025-05-08(목) 10:00:00</td>
              <td>2025-05-09(금) 12:00:00</td>
            </tr>
            <tr>
              <td>수강신청(타대생)</td>
              <td>2025-05-14(수) 08:00:00</td>
              <td>2025-05-16(금) 17:00:00</td>
            </tr>
            <tr>
              <td>수강신청(학부)</td>
              <td>2025-05-14(수) 08:00:00</td>
              <td>2025-05-16(금) 17:00:00</td>
            </tr>
            <tr>
              <td>수강신청(대학원)</td>
              <td>2025-05-14(수) 08:00:00</td>
              <td>2025-05-16(금) 17:00:00</td>
            </tr>
            <tr>
              <td>대기순번제 적용기간</td>
              <td>2025-05-14(수) 10:00:00</td>
              <td>2025-05-16(금) 17:00:00</td>
            </tr>
            <tr>
              <td>수강정정(학부,타대생) 1차</td>
              <td>2025-05-26(월) 10:00:00</td>
              <td>2025-05-27(화) 17:00:00</td>
            </tr>
            <tr>
              <td>수강정정(대학원) 1차</td>
              <td>2025-05-26(월) 10:00:00</td>
              <td>2025-05-27(화) 17:00:00</td>
            </tr>
            <tr>
              <td>수강정정(학부,타대생) (최종)</td>
              <td>2025-06-04(수) 10:00:00</td>
              <td>2025-06-05(목) 17:00:00</td>
            </tr>
            <tr>
              <td>수강정정(대학원) (최종)</td>
              <td>2025-06-04(수) 10:00:00</td>
              <td>2025-06-05(목) 17:00:00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

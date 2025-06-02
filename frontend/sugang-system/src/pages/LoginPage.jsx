import React, { useState } from "react";
import "./LoginPage.css";
import pnuLogo from "../assets/pnu-logo.png";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function LoginPage() {
  const [id, setId] = useState(""); // ID 상태
  const [password, setPassword] = useState(""); // 비밀번호 상태
  const [error, setError] = useState(""); // 오류 메시지 상태
  const navigate = useNavigate();

  //회원가입
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(""); // 예: "student"
  const [username, setUsername] = useState("");

  //로그인 확인
  const [isLogin, setIsLogin] = useState(true);

  // 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. 로그인 요청
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: id,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. access_token 저장
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token_type", data.token_type);

        // 3. 프로필 정보 요청
        const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error("프로필 정보를 가져오는 데 실패했습니다.");
        }

        const profile = await profileResponse.json();

        // 4. 사용자 role에 따라 라우팅
        switch (profile.role) {
          case "student":
            navigate("/main");
            break;
          case "professor":
            navigate("/admin");
            break;
          case "admin":
            navigate("/systemadmin");
            break;
          default:
            setError("알 수 없는 사용자 역할입니다.");
            break;
        }
      } else {
        setError("로그인에 실패했습니다. 아이디 또는 비밀번호를 확인하세요.");
      }
    } catch (err) {
      console.error(err);
      setError("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
          username,
        }),
      });

      if (response.ok) {
        const result = await response.text();
        console.log("회원가입 성공:", result);

        //상태 초기화

        setUsername("");
        setEmail("");
        setPassword("");
        setRole("");
        setError(""); // 에러 메시지도 제거

        alert("회원가입이 완료되었습니다.");
        navigate("/login");
      } else {
        const errorData = await response.json();
        console.error("회원가입 실패:", errorData);

        // 사용자 친화적인 메시지 추출
        if (
          errorData.detail &&
          Array.isArray(errorData.detail) &&
          errorData.detail[0].loc?.includes("role")
        ) {
          setError("역할을 선택해주세요. (학생, 교수, 관리자 중에서)");
        } else {
          setError("회원가입에 실패했습니다. 입력값을 확인해주세요.");
        }
      }
    } catch (error) {
      console.error("에러 발생:", error);
      setError("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <img src={pnuLogo} alt="부산대학교 로고" className="pnu-logo" />
      </header>

      <div className="auth-box">
        <div className="auth-toggle">
          <button
            onClick={() => setIsLogin(true)}
            className={isLogin ? "active" : ""}
          >
            로그인
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={!isLogin ? "active" : ""}
          >
            회원가입
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="ID"
              className="login-input"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="login-button">
              로그인
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Username"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <select
              className="login-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">선택</option>
              <option value="student">학생</option>
              <option value="professor">교수</option>
              <option value="admin">관리자</option>
            </select>
            <button type="submit" className="login-button">
              회원가입
            </button>
          </form>
        )}
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

import React, { useEffect, useState } from "react";
import "./MainPage.css";
import pnuLogo from "../assets/pnu-logo.png";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function MainPage() {
  // 사용자 정보 저장
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  //서버시간
  const [serverDate, setServerDate] = useState("");
  const [serverTime, setServerTime] = useState("");

  // 컴포넌트가 마운트될 때 사용자 정보 가져오기
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

  const handleLogout = () => {
    // 로컬 스토리지에서 모든 인증 관련 정보 제거
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    window.location.href = "/login";
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
        {/* 사용자 정보가 있으면 표시 */}
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
        <div className="main-content">
          {/* #1 희망과목담기 안내 */}
          <div className="section">
            <h3 className="section-title">#1 희망과목담기 안내</h3>
            <ul className="notice-list">
              <li>
                <strong>
                  희망과목담기 기간에 희망과목 및 자동신청 교과목을 선택할 수
                  있습니다.
                </strong>
              </li>
              <li>
                희망과목담기 기간 종료 후 희망과목담기 인원이 교과목
                제한인원보다 적은 경우 자동신청 처리되며, 결과를 ‘부산대학교
                스마트캠퍼스’앱으로 알려드립니다.
              </li>
              <li>
                자동신청 결과는 2025.05.12(월) 09:00 ~ 18:00 학생지원시스템 -
                수업 - 수강신청및확인 - 자동신청교과목확인및삭제{" "}
                <span className="checkbox">☑</span> 메뉴에서 확인하실 수
                있습니다.
              </li>
              <li>
                <strong>
                  자동신청을 통해 수강신청된 교과목은 학생지원시스템 - 수업 -
                  수강신청및확인 - 수강확인 <span className="checkbox">☑</span>{" "}
                  메뉴에서 확인 가능합니다.
                </strong>
              </li>
            </ul>
          </div>

          {/* #2 수강신청 안내 */}
          <div className="section">
            <h3 className="section-title">#2 수강신청 안내</h3>
            <ul className="notice-list">
              <li>
                수강신청 전 반드시 학생지원시스템-수업-수강신청 안내 내용 및
                수강편람의 내용을 숙지하여 수강신청하시고, 미숙지로 인해 발생한
                불이익은 본인의 책임입니다.
              </li>
              <li>
                교과목 정보 및 수강신청 증원 관련 문의는 과목개설학과{" "}
                <span className="checkbox">☑</span>로 해주시기 바랍니다.
              </li>
              <li>
                수강신청에 관한 문의는 소속학과{" "}
                <span className="checkbox">☑</span>에서 수강지도를 받은 후
                문의해주시기 바랍니다.
              </li>
              <li>
                외국인 유학생 중 한국어가 불가한 학생이 수강신청 관련 문의가
                있을 시 510-3352로 문의하시기 바랍니다.
              </li>
            </ul>
          </div>

          {/* #3 대기순번제 안내 */}
          <div className="section">
            <h3 className="section-title">#3 대기순번제 안내</h3>
            <div className="notice-block">
              <h4 className="sub-title">
                <strong>대기순번제란?</strong>
              </h4>
              <p>
                수강신청 기간에 수강인원이 초과된 교과목을 신청하는 경우,
                선착순으로 대기순번을 부여하여 수강취소자 발생 시, 순차적으로
                수강신청이 실시간 자동신청 처리되는 제도입니다.
              </p>

              <h4 className="sub-title">대기순번 신청기간</h4>
              <p>
                (1차) 수강신청기간 1일차 10:00 ~ 3일차 17:00 이며, 대기순번신청
                및 자동신청 처리기간은 동일하며 이후에는 신청 및 처리가
                불가합니다.
              </p>

              <h4 className="sub-title">
                <strong>신청과목 :</strong>
              </h4>
              <p>
                수강신청 가능학점 이내 2과목으로 제한됩니다.
                <br />※ 학점 및 시간표 충돌 시 '교환과목' 설정이 필요합니다.
              </p>

              <h4 className="sub-title">
                <strong>제한인원 :</strong>
              </h4>
              <p>
                수강인원의 집단 구분별 30%로 배정됩니다.
                <br />※ 주전공, 부 · 복수 · 교직, 일반선택, 타대생 수강인원의
                30%(반올림 적용)
              </p>
            </div>
          </div>
          <div className="apply-button-wrapper">
            <button
              className="apply-button"
              onClick={() => (window.location.href = "/register")}
            >
              수강신청 바로가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

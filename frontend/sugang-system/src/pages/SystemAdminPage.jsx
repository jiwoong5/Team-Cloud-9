import React, { useState, useEffect } from "react";
import pnuLogo from "../assets/pnu-logo.png";
import "./SystemAdminPage.css";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SystemAdminPage = () => {
  //유저 관련
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  //서버시간
  const [serverDate, setServerDate] = useState("");
  const [serverTime, setServerTime] = useState("");
  //탭 관련
  const [activeTab, setActiveTab] = useState("monitoring"); // 탭 상태: "monitoring" or "scaling"
  //스케일링 설정 관련
  const [deploymentName, setDeploymentName] = useState("");
  const [targetKind, setTargetKind] = useState("");

  const [minReplicas, setMinReplicas] = useState();
  const [maxReplicas, setMaxReplicas] = useState();

  const [metricType, setMetricType] = useState("");
  const [targetUtilization, setTargetUtilization] = useState();

  const [scaleUpPods, setScaleUpPods] = useState();
  const [scaleDownPercent, setScaleDownPercent] = useState();
  //부하 테스트 관련
  const [duration, setDuration] = useState(30); // CPU 부하 지속 시간 (초)
  //결과 메시지
  const [message, setMessage] = useState("");
  //모니터링 페이지
  const [activePage, setActivePage] = useState("backend");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setAccessToken(token);
    }
  }, []);

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
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleScale = async () => {
    if (!deploymentName) {
      setMessage("Deployment 이름을 입력해주세요.");
      return;
    }

    const patchData = [
      {
        op: "replace",
        path: "/spec/minReplicas",
        value: parseInt(minReplicas),
      },
      {
        op: "replace",
        path: "/spec/maxReplicas",
        value: parseInt(maxReplicas),
      },
      {
        op: "replace",
        path: "/spec/metrics",
        value: [
          {
            type: "Resource",
            resource: {
              name: metricType,
              target: {
                type: "Utilization",
                averageUtilization: parseInt(targetUtilization),
              },
            },
          },
        ],
      },
      {
        op: "replace",
        path: "/spec/behavior",
        value: {
          scaleUp: {
            policies: [
              {
                type: "Pods",
                value: parseInt(scaleUpPods),
                periodSeconds: 60,
              },
            ],
            selectPolicy: "Max",
          },
          scaleDown: {
            policies: [
              {
                type: "Percent",
                value: parseInt(scaleDownPercent),
                periodSeconds: 60,
              },
            ],
            selectPolicy: "Min",
          },
        },
      },
    ];

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/hpa/patch/${deploymentName}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json-patch+json",
          },
          body: JSON.stringify(patchData),
        }
      );

      if (response.ok) {
        setMessage("HPA 설정이 성공적으로 적용되었습니다.");
      } else {
        const error = await response.text();
        setMessage(`실패: ${error}`);
      }
    } catch (err) {
      setMessage(`에러 발생: ${err.message}`);
    }
  };
  const handleLoadTest = async () => {
    // duration 유효성 검사
    if (!duration || duration <= 0) {
      const msg = "유효한 CPU 부하 지속 시간을 입력해주세요.";
      setMessage(msg);
      alert(msg);
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("duration", duration.toString());

      const response = await fetch(`${API_BASE_URL}/api/load`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (response.status === 204) {
        const msg = "CPU 부하 테스트가 성공적으로 완료되었습니다.";
        setMessage(msg);
        alert(msg);
      } else if (response.status === 422) {
        const msg =
          "❌ 테스트 실패: 요청 파라미터가 올바르지 않습니다. duration 값을 확인해주세요.";
        setMessage(msg);
        alert(msg);
      } else {
        const errorText = await response.text();
        const msg = `❌ 테스트 실패 (${response.status}): ${
          errorText || "알 수 없는 오류"
        }`;
        setMessage(msg);
        alert(msg);
      }
    } catch (error) {
      const msg = `🚫 에러 발생: ${error.message}`;
      setMessage(msg);
      alert(msg);
    }
  };

  return (
    <div className="system-admin-page">
      {/* 상단 네비게이션 바 */}
      <div className="top-nav">
        <div className="nav-left">
          <div className="nav-item nav-logo">
            <img src={pnuLogo} alt="부산대학교 로고" className="pnu-logo" />
          </div>
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

      {/* 탭 버튼 */}
      <div className="tabs">
        <button
          className={activeTab === "monitoring" ? "tab active" : "tab"}
          onClick={() => setActiveTab("monitoring")}
        >
          시스템 모니터링
        </button>

        <button
          className={activeTab === "system-test" ? "tab active" : "tab"}
          onClick={() => setActiveTab("system-test")}
        >
          시스템 테스트
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "monitoring" && (
        <div className="monitoring-section">
          <h2 className="section-title">시스템 모니터링 (Grafana)</h2>

          <div className="monitoring-tabs">
            <div
              className={
                "monitoring-tab " + (activePage === "backend" ? "active" : "")
              }
              onClick={() => setActivePage("backend")}
            >
              백엔드 모니터링
            </div>
            <div
              className={
                "monitoring-tab " + (activePage === "frontend" ? "active" : "")
              }
              onClick={() => setActivePage("frontend")}
            >
              프론트엔드 모니터링
            </div>
          </div>

          {activePage === "backend" && (
            <div className="monitoring-section-subsection">
              <h3>CPU Usage</h3>
              <iframe
                src="http://nacho2407.duckdns.org:30090/d-solo/a164a7f0339f99e89cea5cb47e9be618/k3s-course-reg-workload?orgId=1&timezone=browser&var-datasource=default&var-cluster=&var-namespace=default&var-type=$__all&var-workload=test-hpa&refresh=10s&theme=light&panelId=1&__feature.dashboardSceneSolo"
                width="640"
                height="360"
                frameBorder="0"
              ></iframe>

              <h3>Memory Usage</h3>
              <iframe
                src="http://nacho2407.duckdns.org:30090/d-solo/a164a7f0339f99e89cea5cb47e9be618/k3s-course-reg-workload?orgId=1&timezone=browser&var-datasource=default&var-cluster=&var-namespace=default&var-type=$__all&var-workload=test-hpa&refresh=10s&theme=light&panelId=3&__feature.dashboardSceneSolo"
                width="640"
                height="360"
                frameBorder="0"
              ></iframe>

              <h3>Transmit Bandwidth</h3>
              <iframe
                src="http://nacho2407.duckdns.org:30090/d-solo/a164a7f0339f99e89cea5cb47e9be618/k3s-course-reg-workload?orgId=1&timezone=browser&var-datasource=default&var-cluster=&var-namespace=default&var-type=$__all&var-workload=test-hpa&refresh=10s&theme=light&panelId=4&__feature.dashboardSceneSolo"
                width="640"
                height="360"
                frameBorder="0"
              ></iframe>

              <h3>Receive Bandwidth</h3>
              <iframe
                src="http://nacho2407.duckdns.org:30090/d-solo/a164a7f0339f99e89cea5cb47e9be618/k3s-course-reg-workload?orgId=1&timezone=browser&var-datasource=default&var-cluster=&var-namespace=default&var-type=$__all&var-workload=test-hpa&refresh=10s&theme=light&panelId=5&__feature.dashboardSceneSolo"
                width="640"
                height="360"
                frameBorder="0"
              ></iframe>
            </div>
          )}

          {activePage === "frontend" && (
            <div className="monitoring-page active">
              <div className="monitoring-section-subsection">
                <h3>CPU Usage</h3>
                <iframe
                  src="http://nacho2407.duckdns.org:30090/d-solo/a164a7f0339f99e89cea5cb47e9be618/k3s-course-reg-workload?orgId=1&timezone=browser&var-datasource=default&var-cluster=&var-namespace=default&var-type=$__all&var-workload=frontend&refresh=10s&theme=light&panelId=1&__feature.dashboardSceneSolo"
                  width="640"
                  height="360"
                  frameBorder="0"
                ></iframe>

                <h3>Memory Usage</h3>
                <iframe
                  src="http://nacho2407.duckdns.org:30090/d-solo/a164a7f0339f99e89cea5cb47e9be618/k3s-course-reg-workload?orgId=1&timezone=browser&var-datasource=default&var-cluster=&var-namespace=default&var-type=$__all&var-workload=frontend&refresh=10s&theme=light&panelId=3&__feature.dashboardSceneSolo"
                  width="640"
                  height="360"
                  frameBorder="0"
                ></iframe>

                <h3>Transmit Bandwidth</h3>
                <iframe
                  src="http://nacho2407.duckdns.org:30090/d-solo/a164a7f0339f99e89cea5cb47e9be618/k3s-course-reg-workload?orgId=1&timezone=browser&var-datasource=default&var-cluster=&var-namespace=default&var-type=$__all&var-workload=frontend&refresh=10s&theme=light&panelId=7&__feature.dashboardSceneSolo"
                  width="640"
                  height="360"
                  frameBorder="0"
                ></iframe>

                <h3>Receive Bandwidth</h3>
                <iframe
                  src="http://nacho2407.duckdns.org:30090/d-solo/a164a7f0339f99e89cea5cb47e9be618/k3s-course-reg-workload?orgId=1&timezone=browser&var-datasource=default&var-cluster=&var-namespace=default&var-type=$__all&var-workload=frontend&refresh=10s&theme=light&panelId=6&__feature.dashboardSceneSolo"
                  width="640"
                  height="360"
                  frameBorder="0"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "system-test" && (
        <div className="system-test-section">
          <h2>CPU 부하 테스트</h2>

          <label htmlFor="duration">CPU 부하 지속 시간 (초)</label>
          <input
            id="duration"
            type="number"
            min="1"
            placeholder="CPU 부하 지속 시간 (초)"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="input-duration"
          />

          <button onClick={handleLoadTest} className="loadtest-button">
            CPU 부하 테스트 실행
          </button>

          {message && <p className="loadtest-message">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default SystemAdminPage;

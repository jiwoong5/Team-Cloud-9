import React, { useState, useEffect } from "react";
import pnuLogo from "../assets/pnu-logo.png";
import "./SystemAdminPage.css";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SystemAdminPage = () => {
  //유저 관련
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  //날짜 관련
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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setAccessToken(token);
    }
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
    if (!deploymentName) {
      setMessage("Deployment 이름을 입력해주세요.");
      return;
    }

    setMessage("CPU 부하 테스트 실행 중...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/hpa/loadtest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deploymentName,
          duration, // CPU 부하 지속 시간
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`CPU 부하 테스트 완료: ${data.result || "성공"}`);
      } else {
        const errorText = await response.text();
        setMessage(`테스트 실패: ${errorText}`);
      }
    } catch (error) {
      setMessage(`에러 발생: ${error.message}`);
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
          <div className="nav-item server-time">
            {serverDate}&nbsp;{serverTime}
          </div>
          <div className="nav-item logout-section">
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
          <iframe
            src="http://localhost:3000/d/your-dashboard-id?orgId=1"
            width="100%"
            height="800"
            title="Grafana Monitoring"
            className="grafana-iframe"
          />
        </div>
      )}

      {activeTab === "system-test" && (
        <div className="system-test-section">
          <h2>CPU 부하 테스트</h2>

          <label htmlFor="deploymentName">Deployment 이름</label>
          <input
            id="deploymentName"
            type="text"
            value={deploymentName}
            onChange={(e) => setDeploymentName(e.target.value)}
            className="input-deployment-name"
          />

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

// Leaflet 지도 초기화
const map = L.map('map').setView([37.5665, 126.9780], 17); // 서울시청 위치 (초기값)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// 내 위치 마커
const userMarker = L.marker([0, 0]).addTo(map);

// 안내 지점 설정 (예시: 학교 정문 등)
const guidePoints = [
  { lat: 37.5667, lon: 126.9784, message: "정문 근처입니다. 오른쪽으로 이동하세요." },
  { lat: 37.5670, lon: 126.9790, message: "도착했습니다. 엘리베이터는 왼쪽에 있습니다." }
];

let spokenPoints = new Set();

// 거리 계산
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 음성 안내
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  speechSynthesis.speak(utterance);
}

// 실시간 위치 추적
function updatePosition(lat, lon) {
  map.setView([lat, lon], 18);
  userMarker.setLatLng([lat, lon]);

  document.getElementById("status").textContent = `현재 위치: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;

  for (const point of guidePoints) {
    const distance = getDistance(lat, lon, point.lat, point.lon);
    if (distance < 20 && !spokenPoints.has(point.message)) {
      speak(point.message);
      spokenPoints.add(point.message);
    }
  }
}

// 위치 확인 시작
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      updatePosition(lat, lon);
    },
    (err) => {
      document.getElementById("status").textContent = "위치 확인 실패: " + err.message;
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    }
  );
} else {
  alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
}

// 장애물/계단 안내 위치 목록 (추가 가능)
const warningPoints = [
  { lat: 37.597212, lon: 126.704624, message: "우회전 후 전방에 있는 계단을 오르세요." },
  { lat: 37.597218, lon: 126.704004, message: "0m 직진하세요." },
  { lat: 37.597038, lon: 126.704834, message: "중앙 현관에 도착하였습니다." },
  { lat: 37.597134, lon: 126.704667, message: "좌측 대각선 방향으로 0m 직진하세요." },
  { lat: 37.597054, lon: 126.704124, message: "좌회전 후 0m 직진하세요" }
];

let spokenWarnings = new Set();

// 거리 계산 함수 (기존과 동일)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// TTS 음성 안내 함수
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ko-KR';
  speechSynthesis.speak(utter);
}

// 실시간 위치 처리 함수 (안내 지점 + 장애물 지점 포함)
function updatePosition(lat, lon) {
  map.setView([lat, lon], 18);
  userMarker.setLatLng([lat, lon]);
  document.getElementById("status").textContent = `현재 위치: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;

  // 일반 안내 지점 안내
  for (const point of guidePoints) {
    const d = getDistance(lat, lon, point.lat, point.lon);
    if (d < 5 && !spokenPoints.has(point.message)) {
      speak(point.message);
      spokenPoints.add(point.message);
    }
  }

  // 장애물/계단 안내 지점 안내
  for (const warning of warningPoints) {
    const d = getDistance(lat, lon, warning.lat, warning.lon);
    if (d < 5 && !spokenWarnings.has(warning.message)) {
      speak(warning.message);
      spokenWarnings.add(warning.message);
    }
  }
}

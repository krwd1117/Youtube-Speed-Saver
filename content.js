let currentSpeed = 1.0;

// 유튜브 플레이어의 속도 조절 메뉴를 찾아 숨기는 함수
const hideSpeedMenuItem = () => {
  const labels = document.querySelectorAll('.ytp-menuitem-label');
  labels.forEach(label => {
    // 안전을 위해 영어와 한국어 라벨을 모두 확인
    if (label.textContent === 'Playback speed' || label.textContent === '재생 속도') {
      const menuItem = label.closest('.ytp-menuitem');
      if (menuItem && menuItem.style.display !== 'none') {
        menuItem.style.display = 'none';
        console.log('Youtube Speed Saver: Playback speed menu hidden.');
      }
    }
  });
};

// 모든 비디오 요소를 찾아 저장된 속도와 일치하도록 재생 속도를 강제하는 함수
const enforcePlaybackSpeed = () => {
  const numericSpeed = parseFloat(currentSpeed);
  if (isNaN(numericSpeed)) {
    console.log('Youtube Speed Saver: Invalid speed value:', currentSpeed);
    return;
  }

  let videoFound = false;
  document.querySelectorAll('video').forEach(video => {
    videoFound = true;
    if (Math.abs(video.playbackRate - numericSpeed) > 0.01) {
      video.playbackRate = numericSpeed;
    }
  });

  if (!videoFound) {
    console.log('Youtube Speed Saver: No video element found on the page.');
  }
};

// 모든 주기적인 작업을 실행하는 단일 함수
const runTasks = () => {
  enforcePlaybackSpeed();
  hideSpeedMenuItem();
};

// --- 스크립트 실행 시작 ---
console.log('Youtube Speed Saver: content.js loaded.');

// 1. 스크립트 로드 시 저장된 속도를 가져옵니다.
chrome.storage.sync.get('playbackSpeed', (data) => {
  currentSpeed = data.playbackSpeed || 1.0;
  console.log('Youtube Speed Saver: Initial speed from storage:', currentSpeed);
  runTasks();
});

// 2. 저장소의 변경 사항을 감지합니다 (예: 사용자가 팝업에서 속도를 변경).
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.playbackSpeed) {
    currentSpeed = changes.playbackSpeed.newValue;
    console.log('Youtube Speed Saver: Storage speed changed to:', currentSpeed);
    runTasks();
  }
});

// 3. MutationObserver를 사용하여 DOM 변경을 감지합니다.
// Debounce function
const debounce = (func, delay) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

const debouncedRunTasks = debounce(runTasks, 500); // Debounce by 500ms

const observer = new MutationObserver(debouncedRunTasks);
observer.observe(document.body, { childList: true, subtree: true });
console.log('Youtube Speed Saver: MutationObserver attached.');

// 4. 마지막으로, 안정적인 대체 수단으로 작업을 주기적으로 실행합니다.
setInterval(runTasks, 5000); // 5초마다 실행
console.log('Youtube Speed Saver: Interval set for tasks.');
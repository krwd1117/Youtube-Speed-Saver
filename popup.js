const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');
const presetBtns = document.querySelectorAll('.preset-btn');

let currentSpeed = 1.0;

// UI를 업데이트하는 함수
const updateUI = (speed) => {
  const formattedSpeed = parseFloat(speed).toFixed(2);
  speedValue.textContent = `${formattedSpeed}x`;
  speedSlider.value = speed;

  // 현재 활성화된 프리셋 버튼을 업데이트
  presetBtns.forEach(btn => {
    if (parseFloat(btn.dataset.speed).toFixed(2) === formattedSpeed) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
};

// 재생 속도를 저장하는 함수
const saveSpeed = (speed) => {
  const newSpeed = parseFloat(speed).toFixed(2);
  currentSpeed = newSpeed;
  chrome.storage.sync.set({ playbackSpeed: newSpeed });
  updateUI(newSpeed);
};

// 저장된 재생 속도를 불러와 UI를 업데이트
chrome.storage.sync.get('playbackSpeed', (data) => {
  currentSpeed = data.playbackSpeed || 1.0;
  updateUI(currentSpeed);
});

// 슬라이더 값이 변경될 때 실시간으로 UI를 업데이트
speedSlider.addEventListener('input', () => {
  updateUI(speedSlider.value);
});

// 슬라이더 조작이 끝나면 값을 저장
speedSlider.addEventListener('change', () => {
  saveSpeed(speedSlider.value);
});

// 버튼 클릭 이벤트 리스너
decreaseBtn.addEventListener('click', () => {
  let newSpeed = parseFloat(currentSpeed) - 0.05;
  if (newSpeed < 0.25) newSpeed = 0.25;
  saveSpeed(newSpeed);
});

increaseBtn.addEventListener('click', () => {
  let newSpeed = parseFloat(currentSpeed) + 0.05;
  if (newSpeed > 4.0) newSpeed = 4.0;
  saveSpeed(newSpeed);
});

presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    saveSpeed(btn.dataset.speed);
  });
});

// 다른 기기에서 값이 변경되었을 때 UI를 동기화
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.playbackSpeed) {
    currentSpeed = changes.playbackSpeed.newValue;
    updateUI(currentSpeed);
  }
});

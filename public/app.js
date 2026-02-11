const formView = document.getElementById('form-view');
const counterView = document.getElementById('counter-view');
const videoForm = document.getElementById('video-form');
const videoUrlInput = document.getElementById('video-url');
const formError = document.getElementById('form-error');
const videoLabel = document.getElementById('video-label');
const counterValue = document.getElementById('counter-value');
const clock = document.getElementById('clock');
const matchStatus = document.getElementById('match-status');
const backButton = document.getElementById('back-button');

const spoilerRegex = /\bspoiler\b/gi;

let timerId = null;
let startedAt = null;
let transcript = [];
let spoilerEntries = [];
let currentIndex = 0;
let currentCount = 0;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

function resetSimulation() {
  if (timerId) {
    clearInterval(timerId);
  }
  timerId = null;
  startedAt = null;
  transcript = [];
  spoilerEntries = [];
  currentIndex = 0;
  currentCount = 0;
  counterValue.textContent = '0';
  clock.textContent = 'Tiempo: 00:00';
  matchStatus.textContent = 'Esperando coincidencias...';
}

function switchToCounter(videoId) {
  formView.classList.add('hidden');
  counterView.classList.remove('hidden');
  videoLabel.textContent = `Video detectado: ${videoId}`;
}

function switchToForm() {
  counterView.classList.add('hidden');
  formView.classList.remove('hidden');
  formError.textContent = '';
  videoUrlInput.focus();
}

function startSimulation() {
  startedAt = Date.now();

  timerId = setInterval(() => {
    const elapsedMs = Date.now() - startedAt;
    const elapsedSeconds = elapsedMs / 1000;
    clock.textContent = `Tiempo: ${formatTime(elapsedSeconds)}`;

    while (currentIndex < spoilerEntries.length && spoilerEntries[currentIndex].offset <= elapsedMs) {
      currentCount += spoilerEntries[currentIndex].count;
      counterValue.textContent = String(currentCount);
      matchStatus.textContent = `Última coincidencia: “${spoilerEntries[currentIndex].text}”`;
      currentIndex += 1;
    }

    const lastOffset = transcript.at(-1)?.offset ?? 0;
    if (elapsedMs > lastOffset + 1_500) {
      clearInterval(timerId);
      timerId = null;
      matchStatus.textContent = 'Simulación finalizada.';
    }
  }, 150);
}

videoForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.textContent = '';
  resetSimulation();

  try {
    const requestedUrl = videoUrlInput.value.trim();
    const response = await fetch(`/api/transcript?url=${encodeURIComponent(requestedUrl)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al cargar la transcripción.');
    }

    transcript = data.transcript;
    spoilerEntries = transcript
      .map((entry) => {
        const matches = entry.text.match(spoilerRegex);
        return {
          ...entry,
          count: matches ? matches.length : 0
        };
      })
      .filter((entry) => entry.count > 0)
      .sort((a, b) => a.offset - b.offset);

    switchToCounter(data.videoId);
    startSimulation();
  } catch (error) {
    formError.textContent = error.message;
  }
});

backButton.addEventListener('click', () => {
  resetSimulation();
  switchToForm();
});

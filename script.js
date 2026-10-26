const targetDate = new Date("2026-10-30T15:00:00-03:00").getTime();

const fields = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds")
};
const statusText = document.getElementById("status");
const soundButton = document.getElementById("sound-toggle");

let soundEnabled = false;
let audioContext = null;
let lastSecond = null;

function twoDigits(value) {
  return String(value).padStart(2, "0");
}

function playTick() {
  if (!soundEnabled) return;

  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === "suspended") audioContext.resume();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.075);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
  } catch (error) {
    // Si el navegador no permite audio, la cuenta regresiva sigue funcionando.
  }
}

function updateCountdown() {
  const now = Date.now();
  const remaining = targetDate - now;

  if (remaining <= 0) {
    fields.days.textContent = "00";
    fields.hours.textContent = "00";
    fields.minutes.textContent = "00";
    fields.seconds.textContent = "00";
    statusText.textContent = "ES HORA. A TOCAR.";
    if (soundEnabled && lastSecond !== "finished") playTick();
    lastSecond = "finished";
    return;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  fields.days.textContent = String(days).padStart(2, "0");
  fields.hours.textContent = twoDigits(hours);
  fields.minutes.textContent = twoDigits(minutes);
  fields.seconds.textContent = twoDigits(seconds);

  if (lastSecond !== totalSeconds) {
    playTick();
    lastSecond = totalSeconds;
  }
}

soundButton.addEventListener("click", async () => {
  soundEnabled = !soundEnabled;
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
  soundButton.innerHTML = soundEnabled
    ? '<span class="sound-icon">♪</span> SILENCIAR PITIDO'
    : '<span class="sound-icon">♪</span> ACTIVAR PITIDO';

  if (soundEnabled) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass && !audioContext) audioContext = new AudioContextClass();
    if (audioContext && audioContext.state === "suspended") await audioContext.resume();
    playTick();
  }
});

updateCountdown();
setInterval(updateCountdown, 100);

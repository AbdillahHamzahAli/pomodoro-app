// Icon render with 1.5 stroke width
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons({ attrs: { "stroke-width": 1.5 } });
});

// State
const modes = {
  pomodoro: 20 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

let currentMode = "pomodoro";
let remaining = modes[currentMode];
let timerId = null;
let running = false;

// Elements
const timeEl = document.getElementById("time");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const modeBtns = document.querySelectorAll(".mode-btn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const cancelSettings = document.getElementById("cancelSettings");
const saveSettings = document.getElementById("saveSettings");
const testSound = document.getElementById("testSound");
const pomodoroInput = document.getElementById("pomodoroInput");
const shortInput = document.getElementById("shortInput");
const longInput = document.getElementById("longInput");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const fsMini = document.getElementById("fsMini");
const bgImage = document.getElementById("bgImage");
const bgInput = document.getElementById("bgInput");
const bgUpload = document.getElementById("bgUpload");
const bgChooseBtn = document.getElementById("bgChooseBtn");
const spotifyWrapper = document.getElementById("spotifyWrapper");
// Custom title bar controls (Electron)
const winMin = document.getElementById("winMin");
const winMax = document.getElementById("winMax");
const winClose = document.getElementById("winClose");
const winMaxIcon = document.getElementById("winMaxIcon");

// Helpers
function formatTime(s) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function renderTime() {
  timeEl.textContent = formatTime(remaining);
}

function setActiveModeButton() {
  modeBtns.forEach((btn) => {
    const isActive = btn.dataset.mode === currentMode;
    btn.classList.toggle("bg-white/90", isActive);
    btn.classList.toggle("text-[#0b1220]", isActive);
    btn.classList.toggle("bg-white/5", !isActive);
    btn.classList.toggle("text-white", !isActive);
  });
}

function togglePlayIcon(playing) {
  startPauseBtn.querySelector("svg")?.remove();
  const icon = playing ? "pause" : "play";
  const i = document.createElement("i");
  i.setAttribute("data-lucide", icon);
  i.className = "h-4 w-4 sm:h-5 sm:w-5";
  startPauseBtn.insertBefore(i, startPauseBtn.querySelector("span"));
  lucide.createIcons({ attrs: { "stroke-width": 1.5 } });
  startPauseBtn.querySelector("span").textContent = playing ? "pause" : "start";
}

// Sound
function beep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(880, ctx.currentTime);
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.4);
}

// Notifications
function requestNotificationPermission() {
  try {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission?.();
    }
  } catch (_) {}
}

function notifyEnd(mode) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      const title = mode === "pomodoro" ? "Pomodoro selesai" : "Break selesai";
      const body = mode === "pomodoro" ? "Waktunya istirahat sebentar." : "Ayo kembali fokus!";
      const n = new Notification(title, {
        body,
        silent: true,
      });
      // Auto-close after a few seconds
      setTimeout(() => n.close?.(), 5000);
    }
  } catch (_) {}
}

// Timer controls
function tick() {
  if (remaining > 0) {
    remaining -= 1;
    renderTime();
    document.title = `${formatTime(remaining)} • Pomodoro | Focus Timer`;
  } else {
    clearInterval(timerId);
    running = false;
    togglePlayIcon(false);
    beep();
    notifyEnd(currentMode);
  }
}

function start() {
  if (running) return;
  running = true;
  togglePlayIcon(true);
  timerId = setInterval(tick, 1000);
}

function pause() {
  running = false;
  clearInterval(timerId);
  togglePlayIcon(false);
}

function reset() {
  pause();
  remaining = modes[currentMode];
  renderTime();
  document.title = "Pomodoro | Focus Timer";
}

function switchMode(mode) {
  currentMode = mode;
  remaining = modes[currentMode];
  setActiveModeButton();
  renderTime();
  pause();
}

// Events
startPauseBtn.addEventListener("click", () => {
  running ? pause() : start();
});

resetBtn.addEventListener("click", reset);

modeBtns.forEach((btn) => btn.addEventListener("click", () => switchMode(btn.dataset.mode)));

// Keyboard shortcuts
window.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
  if (e.code === "Space") {
    e.preventDefault();
    running ? pause() : start();
  } else if (e.key.toLowerCase() === "r") {
    reset();
  } else if (e.key === "1") switchMode("pomodoro");
  else if (e.key === "2") switchMode("short");
  else if (e.key === "3") switchMode("long");
});

// Settings modal
function openSettings() {
  pomodoroInput.value = Math.round(modes.pomodoro / 60);
  shortInput.value = Math.round(modes.short / 60);
  longInput.value = Math.round(modes.long / 60);
  // Prefill background URL with current background
  if (bgInput) {
    bgInput.value = bgImage?.src || "";
  }
  settingsModal.classList.remove("hidden");
  setTimeout(() => {
    settingsModal.classList.add("flex");
  }, 0);
}
function closeSettingsModal() {
  settingsModal.classList.add("hidden");
  settingsModal.classList.remove("flex");
}

settingsBtn.addEventListener("click", openSettings);
closeSettings.addEventListener("click", closeSettingsModal);
cancelSettings.addEventListener("click", closeSettingsModal);
settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) closeSettingsModal();
});

saveSettings.addEventListener("click", () => {
  const p = Math.max(1, Math.min(120, parseInt(pomodoroInput.value || "20", 10)));
  const s = Math.max(1, Math.min(60, parseInt(shortInput.value || "5", 10)));
  const l = Math.max(1, Math.min(90, parseInt(longInput.value || "15", 10)));
  modes.pomodoro = p * 60;
  modes.short = s * 60;
  modes.long = l * 60;
  if (!running) {
    remaining = modes[currentMode];
    renderTime();
  }
  closeSettingsModal();
});

testSound.addEventListener("click", beep);

// Fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}
fullscreenBtn?.addEventListener("click", toggleFullscreen);
fsMini.addEventListener("click", toggleFullscreen);

bgInput?.addEventListener("change", () => {
  if (bgInput.value.trim()) {
    bgImage.src = bgInput.value.trim();
    try {
      localStorage.setItem("bgImage", bgInput.value.trim());
    } catch (_) {}
  }
});

// Change via File Upload
bgUpload?.addEventListener("change", () => {
  const file = bgUpload.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      bgImage.src = e.target.result;
      try {
        localStorage.setItem("bgImage", e.target.result);
      } catch (_) {}
    };
    reader.readAsDataURL(file);
  }
});

// Electron native file dialog
bgChooseBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  const api = window.api;
  if (api && typeof api.chooseBackground === "function") {
    const dataUrl = await api.chooseBackground();
    if (dataUrl) {
      bgImage.src = dataUrl;
      try {
        localStorage.setItem("bgImage", dataUrl);
      } catch (_) {}
      // Reflect into inputs for consistency
      if (bgInput) bgInput.value = dataUrl.startsWith("http") ? dataUrl : "";
      if (bgUpload) bgUpload.value = "";
    }
  } else {
    // Fallback: trigger the regular file input
    bgUpload?.click();
  }
});

function toggleSpotify() {
  if (navigator.onLine) {
    spotifyWrapper.style.display = "flex"; // tampil normal
  } else {
    spotifyWrapper.style.display = "none"; // sembunyikan
  }
}

// Background persistence
function loadBackgroundFromStorage() {
  try {
    const saved = localStorage.getItem("bgImage");
    if (saved) {
      bgImage.src = saved;
    }
  } catch (_) {}
}

// Init
setActiveModeButton();
renderTime();
togglePlayIcon(false);
toggleSpotify();
loadBackgroundFromStorage();
requestNotificationPermission();

window.addEventListener("online", toggleSpotify);
window.addEventListener("offline", toggleSpotify);

const changePlaylistBtn = document.getElementById("changePlaylistBtn");
const playlistModal = document.getElementById("playlistModal");
const playlistInput = document.getElementById("playlistInput");
const cancelPlaylist = document.getElementById("cancelPlaylist");
const savePlaylist = document.getElementById("savePlaylist");
const spotifyFrame = document.getElementById("spotifyFrame");

// Wire window controls for Electron
function updateMaxIcon(isMaximized) {
  if (!winMaxIcon) return;
  // Replace icon element to re-render with lucide
  const parent = winMaxIcon.parentElement;
  const newIcon = document.createElement("i");
  newIcon.id = "winMaxIcon";
  newIcon.setAttribute("data-lucide", isMaximized ? "copy" : "square");
  newIcon.className = "h-4 w-4";
  winMaxIcon.replaceWith(newIcon);
  // Re-create lucide icons
  lucide.createIcons({ attrs: { "stroke-width": 1.5 } });
}

if (window.api?.windowControls) {
  const wc = window.api.windowControls;
  winMin?.addEventListener("click", () => wc.minimize());
  winClose?.addEventListener("click", () => wc.close());
  winMax?.addEventListener("click", async () => {
    const result = await wc.toggleMaximize();
    // result may be the new isMaximized state
    if (typeof result === "boolean") updateMaxIcon(result);
  });
  // Sync on state events from main
  wc.onState((state) => updateMaxIcon(!!state?.isMaximized));
  // Initialize state on load
  wc.getState().then((state) => updateMaxIcon(!!state?.isMaximized));
}

// buka modal
changePlaylistBtn.addEventListener("click", () => {
  playlistModal.classList.remove("hidden");
  playlistModal.classList.add("flex");
  playlistInput.value = "";
});

// tutup modal
function closePlaylistModal() {
  playlistModal.classList.add("hidden");
  playlistModal.classList.remove("flex");
}

cancelPlaylist.addEventListener("click", closePlaylistModal);
playlistModal.addEventListener("click", (e) => {
  if (e.target === playlistModal) closePlaylistModal();
});

savePlaylist.addEventListener("click", () => {
  if (playlistInput.value.trim()) {
    let url = playlistInput.value.trim();
    if (url.includes("open.spotify.com/playlist/")) {
      const playlistId = url.split("playlist/")[1].split("?")[0];
      const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
      spotifyFrame.src = embedUrl;
      localStorage.setItem("spotifyPlaylist", embedUrl); // simpan agar tidak hilang
    }
  }
  closePlaylistModal();
});

if (localStorage.getItem("spotifyPlaylist")) {
  spotifyFrame.src = localStorage.getItem("spotifyPlaylist");
}

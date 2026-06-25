/* ============================================================
   app.js — Plant Power Process AI Video Explainer
   ============================================================ */

const BASE_RAW = 'https://raw.githubusercontent.com/manibrahmamkurakula/AI_video_explainer/main';
const SCRIPT_URL = `${BASE_RAW}/task_qr8q6xixq_script.json`;
const VIDEO_URL  = `${BASE_RAW}/task_qr8q6xixq_final.mp4`;

let scenes = [];
let currentSceneIndex = 0;
const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
let speedIndex = 2;

// ---- DOM refs ----
const video          = document.getElementById('mainVideo');
const videoWrapper   = document.getElementById('videoWrapper');
const videoOverlay   = document.getElementById('videoOverlay');
const playBtnBig     = document.getElementById('playBtnBig');
const playPauseBtn   = document.getElementById('playPauseBtn');
const iconPlay       = playPauseBtn.querySelector('.icon-play');
const iconPause      = playPauseBtn.querySelector('.icon-pause');
const skipBackBtn    = document.getElementById('skipBackBtn');
const skipFwdBtn     = document.getElementById('skipFwdBtn');
const muteBtn        = document.getElementById('muteBtn');
const iconVol        = muteBtn.querySelector('.icon-vol');
const iconMute       = muteBtn.querySelector('.icon-mute');
const volumeSlider   = document.getElementById('volumeSlider');
const speedBtn       = document.getElementById('speedBtn');
const fullscreenBtn  = document.getElementById('fullscreenBtn');
const progressBarWrap= document.getElementById('progressBarWrap');
const progressFill   = document.getElementById('progressFill');
const progressThumb  = document.getElementById('progressThumb');
const sceneMarkers   = document.getElementById('sceneMarkers');
const currentTimeDisp= document.getElementById('currentTimeDisplay');
const totalTimeDisp  = document.getElementById('totalTimeDisplay');
const sceneList      = document.getElementById('sceneList');
const timelineTrack  = document.getElementById('timelineTrack');
const galleryStrip   = document.getElementById('galleryStrip');
const narrationText  = document.getElementById('narrationText');
const narrationMeta  = document.getElementById('narrationMeta');
const sceneLabelNum  = document.getElementById('sceneLabelNum');
const sceneLabelTitle= document.getElementById('sceneLabelTitle');

// ---- Helpers ----
function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2,'0')}`;
}

function getSceneAt(time) {
  for (let i = scenes.length - 1; i >= 0; i--) {
    if (time >= scenes[i].startTime) return i;
  }
  return 0;
}

// ---- Load scenes from JSON ----
async function loadScenes() {
  try {
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();
    scenes = data.scenes;
    buildUI();
  } catch (e) {
    console.error('Failed to load script JSON:', e);
    narrationText.textContent = '⚠️ Could not load scene data. Please check your network.';
  }
}

// ---- Build all dynamic UI ----
function buildUI() {
  buildSceneNav();
  buildTimeline();
  buildGallery();
  buildSceneMarkers();
  updateActiveScene(0);
}

function buildSceneNav() {
  sceneList.innerHTML = '';
  scenes.forEach((scene, i) => {
    const card = document.createElement('div');
    card.className = 'scene-card';
    card.id = `scene-card-${i}`;
    card.innerHTML = `
      <img class="scene-thumb" src="${BASE_RAW}/task_qr8q6xixq_scene_${scene.id}.png"
           alt="Scene ${scene.id}" loading="lazy" />
      <div class="scene-card-info">
        <div class="scene-card-num">Scene ${scene.id}</div>
        <div class="scene-card-title">${scene.summary}</div>
        <div class="scene-card-dur">${fmt(scene.startTime)} – ${fmt(scene.endTime)} · ${scene.duration.toFixed(1)}s</div>
      </div>
    `;
    card.addEventListener('click', () => seekToScene(i));
    sceneList.appendChild(card);
  });
}

function buildTimeline() {
  timelineTrack.innerHTML = '';
  const total = scenes[scenes.length - 1]?.endTime || 42.32;
  scenes.forEach((scene, i) => {
    const weight = scene.duration / total;
    const block = document.createElement('div');
    block.className = 'timeline-scene';
    block.id = `tl-scene-${i}`;
    block.style.flex = weight;
    block.innerHTML = `
      <span class="tl-scene-num">S${scene.id}</span>
      <span class="tl-scene-dur">${scene.duration.toFixed(1)}s</span>
      <div class="tl-progress" id="tl-progress-${i}"></div>
    `;
    block.addEventListener('click', () => seekToScene(i));
    timelineTrack.appendChild(block);
  });
}

function buildGallery() {
  galleryStrip.innerHTML = '';
  scenes.forEach((scene, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.id = `gallery-item-${i}`;
    item.innerHTML = `
      <img class="gallery-img" src="${BASE_RAW}/task_qr8q6xixq_scene_${scene.id}.png"
           alt="${scene.summary}" loading="lazy" />
      <div class="gallery-caption">
        <div class="gallery-caption-num">Scene ${scene.id}</div>
        <div class="gallery-caption-title">${scene.summary}</div>
      </div>
      <div class="gallery-active-bar"></div>
    `;
    item.addEventListener('click', () => seekToScene(i));
    galleryStrip.appendChild(item);
  });
}

function buildSceneMarkers() {
  sceneMarkers.innerHTML = '';
  const total = video.duration || scenes[scenes.length - 1]?.endTime || 42.32;
  scenes.forEach((scene, i) => {
    if (i === 0) return;
    const pct = (scene.startTime / total) * 100;
    const marker = document.createElement('div');
    marker.className = 'scene-marker';
    marker.style.left = `${pct}%`;
    sceneMarkers.appendChild(marker);
  });
}

// ---- Seek to scene ----
function seekToScene(index) {
  if (!scenes[index]) return;
  video.currentTime = scenes[index].startTime;
  if (video.paused) video.play();
}

// ---- Update active scene UI ----
function updateActiveScene(index) {
  if (index === currentSceneIndex && document.getElementById(`scene-card-${index}`)?.classList.contains('active')) return;

  currentSceneIndex = index;
  const scene = scenes[index];
  if (!scene) return;

  // Scene cards
  document.querySelectorAll('.scene-card').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  // Timeline blocks
  document.querySelectorAll('.timeline-scene').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  // Gallery items
  document.querySelectorAll('.gallery-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  // Narration with fade animation
  narrationText.classList.add('updating');
  setTimeout(() => {
    narrationText.textContent = `"${scene.narration}"`;
    narrationMeta.textContent = `Scene ${scene.id} · ${fmt(scene.startTime)} – ${fmt(scene.endTime)}`;
    narrationText.classList.remove('updating');
  }, 200);

  // Video label
  sceneLabelNum.textContent = `Scene ${scene.id}`;
  sceneLabelTitle.textContent = scene.summary;

  // Scroll scene card into view
  const activeCard = document.getElementById(`scene-card-${index}`);
  if (activeCard) activeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

  // Scroll gallery item into view
  const activeGallery = document.getElementById(`gallery-item-${index}`);
  if (activeGallery) activeGallery.scrollIntoView({ inline: 'nearest', behavior: 'smooth' });
}

// ---- Video timeupdate ----
video.addEventListener('timeupdate', () => {
  const current = video.currentTime;
  const total = video.duration || 42.32;

  // Progress bar
  const pct = (current / total) * 100;
  progressFill.style.width = `${pct}%`;
  progressThumb.style.left = `${pct}%`;

  // Time display
  currentTimeDisp.textContent = fmt(current);

  // Active scene
  const idx = getSceneAt(current);
  if (idx !== currentSceneIndex) updateActiveScene(idx);

  // Timeline progress within current scene
  const scene = scenes[idx];
  if (scene) {
    const sceneProgress = (current - scene.startTime) / scene.duration;
    const tlProgress = document.getElementById(`tl-progress-${idx}`);
    if (tlProgress) tlProgress.style.width = `${Math.min(100, sceneProgress * 100)}%`;

    // Reset others
    scenes.forEach((_, i) => {
      if (i !== idx) {
        const tp = document.getElementById(`tl-progress-${i}`);
        if (tp) tp.style.width = i < idx ? '100%' : '0%';
      }
    });
  }
});

// ---- Video metadata loaded ----
video.addEventListener('loadedmetadata', () => {
  totalTimeDisp.textContent = fmt(video.duration);
  buildSceneMarkers();
});

// ---- Play / Pause ----
function togglePlay() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

video.addEventListener('play', () => {
  iconPlay.classList.add('hidden');
  iconPause.classList.remove('hidden');
  videoOverlay.classList.remove('show');
  videoWrapper.classList.add('always-show');
  setTimeout(() => videoWrapper.classList.remove('always-show'), 2000);
});

video.addEventListener('pause', () => {
  iconPlay.classList.remove('hidden');
  iconPause.classList.add('hidden');
  videoOverlay.classList.add('show');
  videoWrapper.classList.add('always-show');
});

video.addEventListener('ended', () => {
  iconPlay.classList.remove('hidden');
  iconPause.classList.add('hidden');
  videoOverlay.classList.add('show');
});

// Show controls when video paused
videoWrapper.classList.add('always-show');

playPauseBtn.addEventListener('click', togglePlay);
playBtnBig.addEventListener('click', togglePlay);

videoWrapper.addEventListener('click', (e) => {
  if (!e.target.closest('.video-controls') && !e.target.closest('.play-btn-big')) {
    togglePlay();
  }
});

// ---- Skip buttons ----
skipBackBtn.addEventListener('click', () => { video.currentTime = Math.max(0, video.currentTime - 5); });
skipFwdBtn.addEventListener('click',  () => { video.currentTime = Math.min(video.duration, video.currentTime + 5); });

// ---- Mute ----
muteBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  iconVol.classList.toggle('hidden', video.muted);
  iconMute.classList.toggle('hidden', !video.muted);
  volumeSlider.value = video.muted ? 0 : video.volume;
});

volumeSlider.addEventListener('input', () => {
  video.volume = volumeSlider.value;
  video.muted = video.volume === 0;
  iconVol.classList.toggle('hidden', video.muted);
  iconMute.classList.toggle('hidden', !video.muted);
});

// ---- Speed ----
speedBtn.addEventListener('click', () => {
  speedIndex = (speedIndex + 1) % speeds.length;
  video.playbackRate = speeds[speedIndex];
  speedBtn.textContent = `${speeds[speedIndex]}x`;
});

// ---- Fullscreen ----
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    videoWrapper.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// ---- Progress bar click / drag ----
let isDragging = false;
progressBarWrap.addEventListener('mousedown', (e) => {
  isDragging = true;
  scrubTo(e);
});
document.addEventListener('mousemove', (e) => {
  if (isDragging) scrubTo(e);
});
document.addEventListener('mouseup', () => { isDragging = false; });

progressBarWrap.addEventListener('touchstart', (e) => {
  isDragging = true;
  scrubTo(e.touches[0]);
}, { passive: true });
document.addEventListener('touchmove', (e) => {
  if (isDragging) scrubTo(e.touches[0]);
}, { passive: true });
document.addEventListener('touchend', () => { isDragging = false; });

function scrubTo(e) {
  const rect = progressBarWrap.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  video.currentTime = pct * (video.duration || 42.32);
}

// ---- Keyboard shortcuts ----
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  switch (e.code) {
    case 'Space':
      e.preventDefault();
      togglePlay();
      break;
    case 'ArrowLeft':
      video.currentTime = Math.max(0, video.currentTime - 5);
      break;
    case 'ArrowRight':
      video.currentTime = Math.min(video.duration, video.currentTime + 5);
      break;
    case 'ArrowUp':
      video.volume = Math.min(1, video.volume + 0.1);
      volumeSlider.value = video.volume;
      break;
    case 'ArrowDown':
      video.volume = Math.max(0, video.volume - 0.1);
      volumeSlider.value = video.volume;
      break;
    case 'KeyM':
      muteBtn.click();
      break;
    case 'KeyF':
      fullscreenBtn.click();
      break;
  }
});

// ---- Init ----
loadScenes();

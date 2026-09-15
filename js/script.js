console.log('%c↑ ↑ ↓ ↓ ← → ← → B A', 'color:#c8441f; font-family:monospace; font-size:14px; font-weight:bold;');
console.log('%cthere\'s a secret level on this site.', 'color:#5c564c; font-family:monospace; font-size:12px;');

// Scroll progress bar
const progressBar = document.getElementById('progressBar');
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Active nav link highlighting via IntersectionObserver
const navLinks = document.querySelectorAll('[data-nav]');
const sections = Array.from(navLinks)
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = '#' + entry.target.id;
    const link = document.querySelector(`[data-nav][href="${id}"]`);
    if (!link) return;
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

sections.forEach(section => observer.observe(section));

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
const mobileNavScrim = document.getElementById('mobileNavScrim');

function closeMobileNav() {
  mobileNav.classList.remove('open');
  mobileNavScrim.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function openMobileNav() {
  mobileNav.classList.add('open');
  mobileNavScrim.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('open');
    isOpen ? closeMobileNav() : openMobileNav();
  });
  mobileNavScrim.addEventListener('click', closeMobileNav);
  document.querySelectorAll('[data-mobile-nav]').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });
}

// Scroll-reveal animations
const revealSelectors = [
  '.section-head', '.feature', '.game-card', '.dispatch',
  '.side-projects', '.index-col', '.award', '.letter-drop',
  '.contact-title', '.contact-text', '.contact-links'
];
const revealEls = document.querySelectorAll(revealSelectors.join(','));
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ---------- Click bursts ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const BURST_COLORS = ['#c8441f', '#1b1712', '#f0dccf'];

function burst(x, y) {
  if (reduceMotion) return;
  const count = 10;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'burst-particle';
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 36 + Math.random() * 36;
    p.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--by', Math.sin(angle) * dist + 'px');
    const size = 4 + Math.random() * 5;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.background = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

document.querySelectorAll('.feature-links a, .contact-links a, .masthead-cv, .mobile-nav-cv').forEach(el => {
  el.addEventListener('click', (e) => burst(e.clientX, e.clientY));
});

// ---------- Press Start: shmup encounter scene ----------
const SHIP_BASE = 'assets/ship-sprites/';
const SHIP_FRAMES = {
  forward: ['main_ship-forward-1.png', 'main_ship-forward-2.png', 'main_ship-forward-3.png'],
  farRight: ['main_ship-far-right-7.png', 'main_ship-far-right-8.png', 'main_ship-far-right-9.png'],
  farLeft: ['main_ship-far-left-13.png', 'main_ship-far-left-14.png', 'main_ship-far-left-15.png'],
};
const ENEMY_BASE = 'assets/Enemy1/';
const ENEMY_FRAMES = ['enemy_1_1.png', 'enemy_1_2.png', 'enemy_1_3.png'];

// Preload all frames so the scene never stutters on first play
[...Object.values(SHIP_FRAMES).flat(), ...ENEMY_FRAMES.map(f => ENEMY_BASE + f)].forEach(name => {
  const img = new Image();
  img.src = name.startsWith(ENEMY_BASE) ? name : SHIP_BASE + name;
});

function spawnFlash(opacity) {
  const flash = document.createElement('div');
  flash.className = 'screen-flash';
  flash.style.setProperty('--flash-opacity', opacity);
  document.body.appendChild(flash);
  flash.addEventListener('animationend', () => flash.remove());
}

function spawnTrailParticle(x, y) {
  const p = document.createElement('div');
  p.className = 'ship-trail-particle';
  p.style.left = x + 'px';
  p.style.top = y + 'px';
  const size = 4 + Math.random() * 4;
  p.style.width = size + 'px';
  p.style.height = size + 'px';
  document.body.appendChild(p);
  p.addEventListener('animationend', () => p.remove());
}

function explosionBurst(x, y) {
  if (reduceMotion) return;
  const colors = ['#ffcf6b', '#f5a623', '#ff7a3d', '#ffffff'];
  const count = 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'explosion-particle';
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 70;
    p.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--by', Math.sin(angle) * dist + 'px');
    const size = 5 + Math.random() * 7;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.color = colors[Math.floor(Math.random() * colors.length)];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

function shakeScreen() {
  if (reduceMotion) return;
  document.body.classList.add('shake-active');
  setTimeout(() => document.body.classList.remove('shake-active'), 360);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function tween(duration, onFrame) {
  return new Promise(resolve => {
    let start = null;
    function step(ts) {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      onFrame(t);
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

function setSpriteTransform(el, x, y, scale) {
  el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
}

async function runShmupScene() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const centerX = vw / 2;
  const playerHoverY = vh * 0.68;
  const enemyHoverY = vh * 0.30;
  const playerStartY = vh + 80;
  const enemyStartY = -100;
  const exitY = -140;

  const darken = document.createElement('div');
  darken.className = 'scene-darken';
  document.body.appendChild(darken);

  const shipEl = document.createElement('img');
  shipEl.className = 'shmup-ship';
  shipEl.src = SHIP_BASE + SHIP_FRAMES.forward[0];
  document.body.appendChild(shipEl);
  setSpriteTransform(shipEl, centerX, playerStartY, 0.85);

  const enemyEl = document.createElement('img');
  enemyEl.className = 'enemy-ship';
  enemyEl.src = ENEMY_BASE + ENEMY_FRAMES[0];
  document.body.appendChild(enemyEl);
  setSpriteTransform(enemyEl, centerX, enemyStartY, 0.85);

  spawnFlash(0.18);
  tween(500, t => { darken.style.opacity = (0.5 * t).toFixed(3); });

  // Phase A: entrances (player leads, enemy follows shortly after)
  let playerTick = 0, prevPlayerX = centerX;
  const playerEntrance = tween(900, t => {
    const easeOut = 1 - Math.pow(1 - t, 3);
    const y = playerStartY + (playerHoverY - playerStartY) * easeOut;
    const x = centerX + Math.sin(t * Math.PI * 2) * 40;
    const dx = x - prevPlayerX; prevPlayerX = x;
    let set = SHIP_FRAMES.forward;
    if (dx > 0.8) set = SHIP_FRAMES.farRight;
    else if (dx < -0.8) set = SHIP_FRAMES.farLeft;
    playerTick++;
    shipEl.src = SHIP_BASE + set[Math.floor(playerTick / 4) % set.length];
    const scale = 0.85 + 0.3 * t;
    setSpriteTransform(shipEl, x, y, scale);
    if (playerTick % 3 === 0) spawnTrailParticle(x, y + 24 * scale);
  });

  await wait(250);

  let enemyTick = 0;
  const enemyEntrance = tween(800, t => {
    const easeOut = 1 - Math.pow(1 - t, 3);
    const y = enemyStartY + (enemyHoverY - enemyStartY) * easeOut;
    enemyTick++;
    enemyEl.src = ENEMY_BASE + ENEMY_FRAMES[Math.floor(enemyTick / 5) % ENEMY_FRAMES.length];
    const scale = 0.85 + 0.3 * t;
    setSpriteTransform(enemyEl, centerX, y, scale);
  });

  await Promise.all([playerEntrance, enemyEntrance]);

  // Phase B: hover / stand-off, both idle-bobbing
  let hoverTick = 0;
  await tween(750, t => {
    hoverTick++;
    const bobP = Math.sin(t * Math.PI * 3) * 5;
    const bobE = Math.sin(t * Math.PI * 4) * 5;
    setSpriteTransform(shipEl, centerX, playerHoverY + bobP, 1.15);
    setSpriteTransform(enemyEl, centerX, enemyHoverY + bobE, 1.15);
    enemyEl.src = ENEMY_BASE + ENEMY_FRAMES[Math.floor(hoverTick / 6) % ENEMY_FRAMES.length];
    shipEl.src = SHIP_BASE + SHIP_FRAMES.forward[Math.floor(hoverTick / 6) % 3];
  });

  // Phase C: player fires twin bullets
  const bulletOffsets = [-18, 18];
  const bullets = bulletOffsets.map(() => {
    const b = document.createElement('div');
    b.className = 'shmup-bullet';
    document.body.appendChild(b);
    return b;
  });
  const bulletStartY = playerHoverY - 48;
  const bulletEndY = enemyHoverY + 26;
  await tween(240, t => {
    bullets.forEach((b, i) => {
      b.style.left = (centerX + bulletOffsets[i]) + 'px';
      b.style.top = (bulletStartY + (bulletEndY - bulletStartY) * t) + 'px';
    });
  });
  bullets.forEach(b => b.remove());

  // Phase D: impact — explosion, shake, enemy destroyed
  explosionBurst(centerX, enemyHoverY);
  shakeScreen();
  enemyEl.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
  enemyEl.style.opacity = '0';
  setSpriteTransform(enemyEl, centerX, enemyHoverY, 1.6);
  await wait(320);
  enemyEl.remove();

  // Phase E: player exits, darken fades back out
  let exitTick = 0, prevExitX = centerX;
  const exitDuration = 1300;
  const fadeOut = tween(exitDuration, t => {
    darken.style.opacity = (0.5 * (1 - t)).toFixed(3);
  });
  const exit = tween(exitDuration, t => {
    const easeIn = t * t;
    const y = playerHoverY + (exitY - playerHoverY) * easeIn;
    const x = centerX + Math.sin(t * Math.PI * 2 * 1.2) * 90;
    const dx = x - prevExitX; prevExitX = x;
    let set;
    if (dx > 0.6) set = SHIP_FRAMES.farRight;
    else if (dx < -0.6) set = SHIP_FRAMES.farLeft;
    else set = SHIP_FRAMES.forward;
    exitTick++;
    shipEl.src = SHIP_BASE + set[Math.floor(exitTick / 4) % set.length];
    const scale = 1.15 - 0.5 * t;
    setSpriteTransform(shipEl, x, y, scale);
    if (exitTick % 2 === 0) spawnTrailParticle(x, y + 22 * scale);
  });
  await Promise.all([exit, fadeOut]);

  shipEl.remove();
  darken.remove();
  spawnFlash(0.22);
  burst(centerX, 20);
}

const pressStartBtn = document.getElementById('pressStartBtn');
let shmupSceneRunning = false;
if (pressStartBtn) {
  pressStartBtn.addEventListener('click', async (e) => {
    burst(e.clientX, e.clientY);
    if (reduceMotion || shmupSceneRunning) return;
    shmupSceneRunning = true;
    pressStartBtn.disabled = true;
    try {
      await runShmupScene();
    } finally {
      shmupSceneRunning = false;
      pressStartBtn.disabled = false;
    }
  });
}

// ---------- Konami code → hidden mini-game ----------
const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === konamiSequence[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiSequence.length) {
      konamiIndex = 0;
      openKonami();
    }
  } else {
    konamiIndex = (key === konamiSequence[0]) ? 1 : 0;
  }
});

const konamiOverlay = document.getElementById('konamiOverlay');
const konamiClose = document.getElementById('konamiClose');
const konamiCanvas = document.getElementById('konamiCanvas');
const konamiScoreEl = document.getElementById('konamiScore');
let konamiCtx = null;
let konamiRAF = null;
let konamiState = null;

const GROUND_Y = 170;
const PLAYER_X = 40;
const PLAYER_SIZE = 22;

function resetKonamiGame() {
  konamiState = {
    playerY: 0,
    velocity: 0,
    gravity: 0.9,
    jumpForce: -12,
    grounded: true,
    obstacles: [],
    frame: 0,
    speed: 4,
    score: 0,
    gameOver: false,
  };
}

function konamiJump() {
  if (konamiState.gameOver) {
    resetKonamiGame();
    return;
  }
  if (konamiState.grounded) {
    konamiState.velocity = konamiState.jumpForce;
    konamiState.grounded = false;
  }
}

function konamiKeyHandler(e) {
  if (e.code === 'Space' || e.key === 'ArrowUp') {
    e.preventDefault();
    konamiJump();
  }
  if (e.key === 'Enter' && konamiState.gameOver) {
    resetKonamiGame();
  }
}

function konamiLoop() {
  if (!konamiOverlay || konamiOverlay.hidden) return;
  const ctx = konamiCtx;
  const w = konamiCanvas.width, h = konamiCanvas.height;

  ctx.fillStyle = '#f7f3ec';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#ddd5c6';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + PLAYER_SIZE);
  ctx.lineTo(w, GROUND_Y + PLAYER_SIZE);
  ctx.stroke();

  if (!konamiState.gameOver) {
    konamiState.velocity += konamiState.gravity;
    konamiState.playerY += konamiState.velocity;
    if (konamiState.playerY >= 0) {
      konamiState.playerY = 0;
      konamiState.velocity = 0;
      konamiState.grounded = true;
    }

    konamiState.frame++;
    if (konamiState.frame % 70 === 0) {
      konamiState.obstacles.push({ x: w, w: 14 + Math.random() * 10 });
    }
    konamiState.obstacles.forEach(o => o.x -= konamiState.speed);
    konamiState.obstacles = konamiState.obstacles.filter(o => o.x + o.w > 0);

    konamiState.score += 1;
    if (konamiState.frame % 500 === 0) konamiState.speed += 0.6;

    const playerRect = { x: PLAYER_X, y: GROUND_Y + konamiState.playerY, w: PLAYER_SIZE, h: PLAYER_SIZE };
    konamiState.obstacles.forEach(o => {
      const obsRect = { x: o.x, y: GROUND_Y, w: o.w, h: PLAYER_SIZE };
      if (playerRect.x < obsRect.x + obsRect.w && playerRect.x + playerRect.w > obsRect.x &&
          playerRect.y < obsRect.y + obsRect.h && playerRect.y + playerRect.h > obsRect.y) {
        konamiState.gameOver = true;
      }
    });
  }

  ctx.fillStyle = '#c8441f';
  ctx.fillRect(PLAYER_X, GROUND_Y + konamiState.playerY, PLAYER_SIZE, PLAYER_SIZE);

  ctx.fillStyle = '#1b1712';
  konamiState.obstacles.forEach(o => ctx.fillRect(o.x, GROUND_Y, o.w, PLAYER_SIZE));

  konamiScoreEl.textContent = 'Score: ' + Math.floor(konamiState.score / 5);

  if (konamiState.gameOver) {
    ctx.fillStyle = 'rgba(27,23,18,0.75)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f7f3ec';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', w / 2, h / 2 - 10);
    ctx.font = '13px monospace';
    ctx.fillText('Tap / Enter to retry', w / 2, h / 2 + 16);
  }

  konamiRAF = requestAnimationFrame(konamiLoop);
}

function openKonami() {
  if (!konamiOverlay) return;
  konamiOverlay.hidden = false;
  konamiCtx = konamiCanvas.getContext('2d');
  resetKonamiGame();
  document.addEventListener('keydown', konamiKeyHandler);
  konamiCanvas.addEventListener('pointerdown', konamiJump);
  konamiLoop();
}

function closeKonami() {
  if (!konamiOverlay) return;
  konamiOverlay.hidden = true;
  cancelAnimationFrame(konamiRAF);
  document.removeEventListener('keydown', konamiKeyHandler);
  konamiCanvas.removeEventListener('pointerdown', konamiJump);
}

if (konamiClose) konamiClose.addEventListener('click', closeKonami);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && konamiOverlay && !konamiOverlay.hidden) closeKonami();
});

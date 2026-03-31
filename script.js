const introScreen = document.getElementById('introScreen');
const startBtn    = document.getElementById('startBtn');
const canvas      = document.getElementById('peekholeCanvas');
const ctx         = canvas.getContext('2d');

// ---- canvas size ----
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ---- peekhole ----
let mx = -999, my = -999;
let radius = 0, targetR = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  targetR = 150;
});

document.addEventListener('mouseleave', () => { targetR = 0; });

(function drawLoop() {
  // clear to fully transparent first
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  radius += (targetR - radius) * 0.1;

  if (radius > 0.5) {
    // draw black everywhere EXCEPT the hole using a cutout shape
    ctx.globalCompositeOperation = 'source-over';
    
    // fill entire canvas black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // cut the hole out — this makes it transparent = ocean shows through
    ctx.globalCompositeOperation = 'destination-out';
    const hole = ctx.createRadialGradient(mx, my, 0, mx, my, radius);
    hole.addColorStop(0,    'rgba(0,0,0,1)');
    hole.addColorStop(0.65, 'rgba(0,0,0,1)');
    hole.addColorStop(0.88, 'rgba(0,0,0,0.5)');
    hole.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(mx, my, radius, 0, Math.PI * 2);
    ctx.fillStyle = hole;
    ctx.fill();

    // reset composite before next frame
    ctx.globalCompositeOperation = 'source-over';

  } else {
    // no mouse — full black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(drawLoop);
})();

// ---- pop sound ----
function playPop() {
  try {
    const ac  = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    const f   = ac.createBiquadFilter();
    osc.connect(f); f.connect(g); g.connect(ac.destination);
    f.type = 'bandpass';
    f.frequency.setValueAtTime(800, ac.currentTime);
    f.frequency.exponentialRampToValueAtTime(150, ac.currentTime + 0.1);
    osc.frequency.setValueAtTime(500, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.1);
    g.gain.setValueAtTime(0.5, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    osc.start(); osc.stop(ac.currentTime + 0.12);
  } catch(e) {}
}

startBtn.addEventListener('click', () => {
  playPop();
  startBgMusic(); 
  introScreen.style.display = 'none';
  canvas.style.display = 'none';
  startOcean();
  aboutBtn.style.display = 'block';
});

document.querySelector('.intro-star').addEventListener('click', () => {
  startBtn.click();
});

// ---- ocean canvas effects ----
function startOcean() {
  const oc = document.createElement('canvas');
  oc.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:1;pointer-events:none;mix-blend-mode:screen;opacity:0.5;';
  document.body.appendChild(oc);
  const ox = oc.getContext('2d');

  function resizeOc() { oc.width = window.innerWidth; oc.height = window.innerHeight; }
  resizeOc();
  window.addEventListener('resize', resizeOc);

  let t = 0;
  const beams = [
    { ox: 0.28, a: 0.55, w: 60, op: 0.12 },
    { ox: 0.32, a: 0.62, w: 40, op: 0.10 },
    { ox: 0.36, a: 0.70, w: 80, op: 0.08 },
    { ox: 0.40, a: 0.50, w: 35, op: 0.09 },
    { ox: 0.24, a: 0.45, w: 50, op: 0.07 },
  ];

  (function draw() {
    ox.clearRect(0, 0, oc.width, oc.height);

    beams.forEach((b, i) => {
      const x   = b.ox * oc.width;
      const len = oc.height * 1.4;
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.6 + i * 1.2);
      const op  = b.op * (0.6 + 0.4 * pulse);
      const cw  = b.w  * (0.85 + 0.15 * pulse);
      const ex  = x + Math.cos(b.a + Math.PI / 2) * len;
      const ey  = Math.sin(b.a + Math.PI / 2) * len;
      const gr  = ox.createLinearGradient(x, 0, ex, ey);
      gr.addColorStop(0,   `rgba(255,255,220,${op})`);
      gr.addColorStop(0.4, `rgba(255,255,220,${op*0.5})`);
      gr.addColorStop(1,   `rgba(255,255,220,0)`);
      ox.save();
      ox.translate(x, 0);
      ox.rotate(b.a);
      ox.beginPath();
      ox.moveTo(-cw/2, 0); ox.lineTo(cw/2, 0);
      ox.lineTo(cw*1.25, len); ox.lineTo(-cw*1.25, len);
      ox.closePath();
      ox.fillStyle = gr;
      ox.fill();
      ox.restore();
    });

    for (let layer = 0; layer < 3; layer++) {
      const sp = 0.3 + layer * 0.2;
      const am = 15  + layer * 10;
      const fr = 0.005 + layer * 0.002;
      const al = 0.04  - layer * 0.01;
      ox.beginPath();
      ox.moveTo(0, oc.height / 2);
      for (let x = 0; x < oc.width; x += 5) {
        const y = oc.height/2
          + Math.sin(x * fr + t * sp) * am
          + Math.sin(x * fr * 2 + t * sp * 1.5) * (am/2);
        ox.lineTo(x, y);
      }
      ox.lineTo(oc.width, oc.height);
      ox.lineTo(0, oc.height);
      ox.closePath();
      ox.fillStyle = `rgba(100,200,200,${al})`;
      ox.fill();
    }

    t += 0.01;
    requestAnimationFrame(draw);
  })();
}
let bgAudio = null;

function startBgMusic() {
  bgAudio = new Audio('assets/music.mp3');
  bgAudio.loop = true;
  bgAudio.volume = 0.6;
  bgAudio.play();
}

const aboutBtn     = document.getElementById('aboutBtn');
const aboutOverlay = document.getElementById('aboutOverlay');

aboutBtn.addEventListener('click', () => {
  aboutOverlay.classList.add('visible');
});

aboutOverlay.addEventListener('click', () => {
  aboutOverlay.classList.remove('visible');
});

// show the button only after entering ocean
const _origStartOcean = startOcean;
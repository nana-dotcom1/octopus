const introScreen = document.getElementById('introScreen');
const startBtn    = document.getElementById('startBtn');
const canvas      = document.getElementById('peekholeCanvas');
const ctx         = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let mx = -999, my = -999;
let radius = 0, targetR = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  targetR = 150;
});

document.addEventListener('mouseleave', () => { targetR = 0; });

(function drawLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  radius += (targetR - radius) * 0.1;

  if (radius > 0.5) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    ctx.globalCompositeOperation = 'source-over';
  } else {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(drawLoop);
})();

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

// ---- speech bubble ----
function showSpeech(text) {
  const bubble = document.getElementById('speechBubble');
  const p      = document.getElementById('speechText');
  p.innerHTML  = text;
  bubble.style.display = 'block';
  setTimeout(() => bubble.classList.add('visible'), 50);
}

function hideSpeech() {
  const bubble = document.getElementById('speechBubble');
  bubble.classList.remove('visible');
  setTimeout(() => bubble.style.display = 'none', 600);
}

startBtn.addEventListener('click', () => {
  playPop();
  startBgMusic();
  introScreen.style.display = 'none';
  canvas.style.display = 'none';
  startOcean();
  aboutBtn.style.display = 'block';
  crabBtn.style.display = 'block';
  document.getElementById('crabText').style.display = 'block';
});

document.querySelector('.intro-star').addEventListener('click', () => {
  startBtn.click();
});

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
const crabBtn      = document.getElementById('crabBtn');

aboutBtn.addEventListener('click', () => {
  aboutOverlay.classList.add('visible');
});

aboutOverlay.addEventListener('click', () => {
  aboutOverlay.classList.remove('visible');
});

crabBtn.addEventListener('click', () => {
  const octo = document.getElementById('octo');

  octo.src = './assets/happyocto.png';
  octo.classList.add('happy');
  octo.style.animation = 'bigBounce 0.5s ease-in-out 4';

  crabBtn.style.display = 'none';
  document.getElementById('crabText').style.display = 'none';

  setTimeout(() => {
    octo.src = './assets/octopus.png';
    octo.classList.remove('happy');
    octo.style.animation = 'float 3s ease-in-out infinite';

    setTimeout(() => {
      const clam = document.getElementById('clam');
      showSpeech("i'm hungry let's go eat something,<br>try to catch the clam!");
      clam.style.display = 'block';
      setTimeout(() => clam.classList.add('swim-in'), 50);

      clam.addEventListener('click', () => {
        clam.classList.remove('swim-in');
        clam.classList.add('caught');
        hideSpeech();
        setTimeout(() => {
          clam.style.display = 'none';
          clam.classList.remove('caught');
          clam.style.opacity = '';

          setTimeout(() => {
            showSpeech("i'm still hungry,<br>let's catch some fishes!");
            const fish = document.getElementById('fishGroup');
            fish.style.display = 'block';
            setTimeout(() => fish.classList.add('swim-in'), 50);

            fish.addEventListener('click', () => {
              fish.classList.remove('swim-in');
              fish.classList.add('caught');
              hideSpeech();
              setTimeout(() => {
                fish.style.display = 'none';
                fish.classList.remove('caught');
                fish.style.opacity = '';
                setTimeout(() => startCamouflageScenario(), 1500);
              }, 1500);
            }, { once: true });

          }, 500);
        }, 1600);
      }, { once: true });

    }, 800);
  }, 2000);
});

// ---- camouflage scenario ----
let camouflageReady  = false;
let camouflageActive = false;
let sealTimer        = null;
let revealTimer      = null;

const octoEl = document.getElementById('octo');
octoEl.style.pointerEvents = 'all';
octoEl.style.cursor = 'pointer';

function onOctoClick(e) {
  e.stopPropagation();
  console.log('octo clicked, camouflageReady:', camouflageReady, 'camouflageActive:', camouflageActive);
  if (!camouflageReady || camouflageActive) return;

  camouflageReady  = false;
  camouflageActive = true;

  const octo     = document.getElementById('octo');
  const scaredEl = document.getElementById('scaredOcto');
  const seal     = document.getElementById('seal');

  octo.style.display     = 'none';
  scaredEl.style.display = 'block';
  scaredEl.style.opacity = '1';
  scaredEl.style.visibility = 'visible';
  hideSpeech();

  clearTimeout(sealTimer);
  clearTimeout(revealTimer);

  // seal stays 20 seconds then swims away
  sealTimer = setTimeout(() => {
    seal.style.transition = 'top 4s ease-out';
    seal.style.top = '130vh';
    setTimeout(() => {
      seal.style.display    = 'none';
      seal.style.top        = '-30vh';
      seal.style.transition = '';
    }, 4000);
  }, 4000);

  // scared octo stays 25 seconds then normal octo comes back
  revealTimer = setTimeout(() => {
    scaredEl.style.display    = 'none';
    octo.style.display        = 'block';
    octo.style.position       = 'fixed';
    octo.style.bottom         = '-18vh';
    octo.style.left           = '-28vw';
    camouflageActive          = false;
    showSpeech("phew! that was so close...");
    setTimeout(() => hideSpeech(), 4000);
  }, 5000);
}

octoEl.addEventListener('click', onOctoClick);

function startCamouflageScenario() {
  const seal = document.getElementById('seal');

  seal.style.transition = '';
  seal.style.top        = '-30vh';
  seal.style.left       = '40vw';
  seal.style.width      = '150px';
  seal.style.height     = 'auto';
  seal.style.display    = 'block';

  setTimeout(() => {
    seal.style.transition = 'top 4s ease-in, width 4s ease-in';
    seal.style.top        = '30vh';
    seal.style.width      = '900px';

    showSpeech("oh no!! i'm scared...");

    setTimeout(() => {
      showSpeech("click me to camouflage!");
      setTimeout(() => {
        camouflageReady = true;
      }, 1500);
    }, 3000);
  }, 100);
}
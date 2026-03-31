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
let currentPredator  = 'seal';

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
  const shark    = document.getElementById('shark');

  octo.style.display     = 'none';
  scaredEl.style.display = 'block';
  scaredEl.style.opacity = '1';
  scaredEl.style.visibility = 'visible';
  hideSpeech();

  clearTimeout(sealTimer);
  clearTimeout(revealTimer);

  sealTimer = setTimeout(() => {
    const activePredator = currentPredator === 'seal' ? seal : shark;
    activePredator.style.transition = 'top 4s ease-out';
    activePredator.style.top = '130vh';
    setTimeout(() => {
      activePredator.style.display    = 'none';
      activePredator.style.top        = '-30vh';
      activePredator.style.transition = '';
    }, 4000);
  }, 4000);

  revealTimer = setTimeout(() => {
    scaredEl.style.display    = 'none';
    octo.style.display        = 'block';
    octo.style.position       = 'fixed';
    octo.style.bottom         = '-18vh';
    octo.style.left           = '-28vw';
    camouflageActive          = false;
    showSpeech("phew! that was so close...");
    setTimeout(() => {
      hideSpeech();
      setTimeout(() => {
        if (currentPredator === 'seal') {
          startJellyScenario();
        } else {
          hideSpeech();
        }
      }, 1500);
    }, 4000);
  }, 5000);
}

octoEl.addEventListener('click', onOctoClick);

function startCamouflageScenario() {
  currentPredator = 'seal';
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

function startJellyScenario() {
  const jelly = document.getElementById('jelly');

  jelly.classList.remove('swim-in', 'swim-to-octo', 'swim-away');
  jelly.style.position   = 'fixed';
  jelly.style.bottom     = '-30vh';
  jelly.style.left       = '30vw';
  jelly.style.opacity    = '1';
  jelly.style.zIndex     = '15';
  jelly.style.width      = '1200px';
  jelly.style.height     = 'auto';
  jelly.style.display    = 'block';
  jelly.style.transition = 'none';
  jelly.getBoundingClientRect();

  setTimeout(() => {
    jelly.style.transition = 'bottom 3s ease-out';
    jelly.style.bottom     = '25vh';
    showSpeech("oh! a jellyfish!");

    setTimeout(() => {
      showSpeech("click on the jellyfish!");

      jelly.addEventListener('click', () => {
        jelly.style.transition = 'bottom 2s ease-in-out, left 2s ease-in-out';
        jelly.style.bottom     = '10vh';
        jelly.style.left       = '5vw';
        showSpeech("i like you, you're cool!");

        setTimeout(() => {
          jelly.style.transition = 'bottom 3s ease-out, opacity 1s ease-in 2s';
          jelly.style.bottom     = '-40vh';
          jelly.style.opacity    = '0';
          hideSpeech();
          setTimeout(() => {
            jelly.style.display = 'none';
            jelly.style.opacity = '1';
            setTimeout(() => startShellScenario(), 1500);
          }, 3500);
        }, 3000);

      }, { once: true });

    }, 2500);
  }, 100);
}

function startShellScenario() {
  const shell = document.getElementById('shellBtn');
  const pearl = document.getElementById('pearl');

  shell.style.display = 'block';
  showSpeech("ooh a shiny shell!<br>i wonder what's inside?");

  shell.addEventListener('click', () => {
    shell.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    shell.style.transform = 'scale(1.4)';
    shell.style.opacity = '0';
    showSpeech("a pearl! it's so pretty...");

    pearl.style.display = 'block';
    pearl.style.transform = 'translate(-50%, -50%)';
    pearl.style.opacity = '0';
    setTimeout(() => {
      pearl.style.transition = 'opacity 1s ease';
      pearl.style.opacity = '1';
    }, 50);

    setTimeout(() => {
      shell.style.display = 'none';
      shell.style.transform = '';
      shell.style.opacity = '1';

      setTimeout(() => {
        hideSpeech();
        setTimeout(() => {
          pearl.style.transition = 'opacity 1s ease';
          pearl.style.opacity = '0';
          setTimeout(() => {
            pearl.style.display = 'none';
            setTimeout(() => startTurtleScenario(), 1500);
          }, 1000);
        }, 2000);
      }, 3000);
    }, 1500);

  }, { once: true });
}

function startTurtleScenario() {
  const turtle = document.getElementById('turtle');
  const octo   = document.getElementById('octo');

  turtle.style.cssText  = '';
  turtle.style.position = 'fixed';
  turtle.style.bottom   = '10vh';
  turtle.style.left     = '110vw';
  turtle.style.width    = '1200px';
  turtle.style.height   = 'auto';
  turtle.style.zIndex   = '999';
  turtle.style.display  = 'block';
  turtle.style.cursor   = 'pointer';
  turtle.style.transition = 'none';

  turtle.getBoundingClientRect();

  setTimeout(() => {
    turtle.style.transition = 'left 3s ease-out';
    turtle.style.left       = '30vw';
    showSpeech("a turtle! hop on,<br>let's go for a ride!");

    setTimeout(() => {
      showSpeech("click the turtle!");

      turtle.addEventListener('click', () => {
        hideSpeech();

        octo.style.transition = 'none';
        octo.style.position   = 'fixed';
        octo.style.bottom     = '-20vh';
        octo.style.left       = '20vw';

        setTimeout(() => {
          showSpeech("wheee!!");

          turtle.style.transition = 'left 4s ease-in-out';
          turtle.style.left       = '-150vw';
          octo.style.transition   = 'left 4s ease-in-out';
          octo.style.left         = '-150vw';

          setTimeout(() => {
            octo.style.transition = 'none';
            octo.style.left       = '-28vw';
            octo.style.bottom     = '-18vh';
            turtle.style.display  = 'none';
            hideSpeech();
            setTimeout(() => startCrabScenario(), 1500);
          }, 4500);

        }, 800);

      }, { once: true });

    }, 2500);
  }, 100);
}

function startCrabScenario() {
  const crab = document.getElementById('crab');

  showSpeech("oh a crab! pinchy pinchy!<br>try to catch it!");
  crab.style.display = 'block';
  setTimeout(() => crab.classList.add('swim-in'), 50);

  crab.addEventListener('click', () => {
    crab.classList.remove('swim-in');
    crab.classList.add('caught');
    hideSpeech();
    setTimeout(() => {
      crab.style.display = 'none';
      crab.classList.remove('caught');
      crab.style.opacity = '';
      setTimeout(() => startCaveScenario(), 1500);
    }, 1600);
  }, { once: true });
}

function startCaveScenario() {
  const cave     = document.getElementById('cave');
  const octo     = document.getElementById('octo');
  const sleepEl  = document.getElementById('sleepOcto');

  cave.style.display = 'block';
  showSpeech("i found a secret cave...<br>should we go in?");

  setTimeout(() => {
    showSpeech("click the cave!");

    cave.addEventListener('click', () => {
      hideSpeech();

      octo.style.transition = 'opacity 0.8s ease';
      octo.style.opacity    = '0';

      setTimeout(() => {
        octo.style.display = 'none';
        octo.style.opacity = '1';

        sleepEl.style.display = 'block';
        showSpeech("zzz... taking a little nap...");

        setTimeout(() => {
          sleepEl.style.display = 'none';
          octo.style.display    = 'block';
          octo.style.transition = 'opacity 0.8s ease';
          octo.style.opacity    = '0';
          setTimeout(() => {
            octo.style.opacity = '1';
          }, 50);
          cave.style.display = 'none';
          showSpeech("that was a great nap!");
          setTimeout(() => {
            hideSpeech();
            setTimeout(() => startSnailScenario(), 1500);
          }, 3000);
        }, 5000);

      }, 800);

    }, { once: true });

  }, 2500);
}

function startSnailScenario() {
  const snail = document.getElementById('snail');

  snail.style.cssText   = '';
  snail.style.position  = 'fixed';
  snail.style.bottom    = '10vh';
  snail.style.left      = '-20vw';
  snail.style.width     = '300px';
  snail.style.height    = 'auto';
  snail.style.zIndex    = '999';
  snail.style.display   = 'block';
  snail.style.cursor    = 'pointer';
  snail.style.transition = 'none';

  snail.getBoundingClientRect();

  showSpeech("whoa... that's the slowest thing<br>i've ever seen!");

  setTimeout(() => {
    snail.style.transition = 'left 25s linear';
    snail.style.left       = '110vw';

    setTimeout(() => {
      showSpeech("click on it!");

      snail.addEventListener('click', () => {
        snail.style.transition = 'left 0.5s ease-in';
        snail.style.left       = '150vw';
        showSpeech("wait... it's FAST?!");

        setTimeout(() => {
          snail.style.display = 'none';
          hideSpeech();
          setTimeout(() => startSharkScenario(), 1500);
        }, 600);

      }, { once: true });

    }, 2000);
  }, 100);
}

function startSharkScenario() {
  currentPredator = 'shark';
  const shark = document.getElementById('shark');

  shark.style.transition = '';
  shark.style.top        = '-30vh';
  shark.style.left       = '40vw';
  shark.style.width      = '150px';
  shark.style.height     = 'auto';
  shark.style.display    = 'block';

  setTimeout(() => {
    shark.style.transition = 'top 4s ease-in, width 4s ease-in';
    shark.style.top        = '30vh';
    shark.style.width      = '900px';

    showSpeech("oh no!! a shark!!<br>click me to hide!");

    setTimeout(() => {
      showSpeech("click me to camouflage!");
      setTimeout(() => {
        camouflageReady = true;
      }, 1500);
    }, 3000);
  }, 100);
}

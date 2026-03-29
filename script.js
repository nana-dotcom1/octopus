const startBtn    = document.getElementById('startBtn');
const introScreen = document.getElementById('introScreen');
const oceanScreen = document.getElementById('oceanScreen');
const canvas      = document.getElementById('peekholeCanvas');
const ctx         = canvas.getContext('2d');

let mouseX = -999;
let mouseY = -999;
let peekRadius = 0;
let targetRadius = 0;
const MAX_RADIUS = 140;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// track mouse
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  targetRadius = MAX_RADIUS;
});

document.addEventListener('mouseleave', () => {
  targetRadius = 0;
});

function drawMask() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // smooth lerp
  peekRadius += (targetRadius - peekRadius) * 0.1;

  // draw solid black covering everything
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (peekRadius > 1) {
    // punch transparent hole through the black
    ctx.globalCompositeOperation = 'destination-out';

    const grad = ctx.createRadialGradient(
      mouseX, mouseY, peekRadius * 0.2,
      mouseX, mouseY, peekRadius
    );
    grad.addColorStop(0,   'rgba(0,0,0,1)');
    grad.addColorStop(0.75,'rgba(0,0,0,0.8)');
    grad.addColorStop(1,   'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, peekRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // grainy ring
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, peekRadius * 0.92, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 20;
    ctx.stroke();
  }

  requestAnimationFrame(drawMask);
}
drawMask();

// button click
startBtn.addEventListener('click', () => {
  startBtn.classList.add('clicked');

  setTimeout(() => {
    introScreen.classList.add('fade-out');
    document.body.classList.add('ocean-active');
  }, 300);

  setTimeout(() => {
    introScreen.style.display = 'none';
    canvas.style.display = 'none';
    startOcean();
  }, 1100);
});

function startOcean() {
  const oceanCanvas = document.createElement('canvas');
  oceanCanvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: 1;
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0.6;
  `;
  document.body.appendChild(oceanCanvas);

  const octx = oceanCanvas.getContext('2d');

  function resize() {
    oceanCanvas.width  = window.innerWidth;
    oceanCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let time = 0;

  const beams = [
    { originX: 0.28, originY: 0.0, angle: 0.55, width: 60, opacity: 0.12 },
    { originX: 0.32, originY: 0.0, angle: 0.62, width: 40, opacity: 0.10 },
    { originX: 0.36, originY: 0.0, angle: 0.70, width: 80, opacity: 0.08 },
    { originX: 0.40, originY: 0.0, angle: 0.50, width: 35, opacity: 0.09 },
    { originX: 0.24, originY: 0.0, angle: 0.45, width: 50, opacity: 0.07 },
  ];

  function draw() {
    octx.clearRect(0, 0, oceanCanvas.width, oceanCanvas.height);

    beams.forEach((beam, i) => {
      const x = beam.originX * oceanCanvas.width;
      const y = beam.originY * oceanCanvas.height;
      const length = oceanCanvas.height * 1.4;
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.6 + i * 1.2);
      const currentOpacity = beam.opacity * (0.6 + 0.4 * pulse);
      const currentWidth = beam.width * (0.85 + 0.15 * pulse);
      const endX = x + Math.cos(beam.angle + Math.PI / 2) * length;
      const endY = y + Math.sin(beam.angle + Math.PI / 2) * length;

      const gradient = octx.createLinearGradient(x, y, endX, endY);
      gradient.addColorStop(0,   `rgba(255,255,220,${currentOpacity})`);
      gradient.addColorStop(0.4, `rgba(255,255,220,${currentOpacity * 0.5})`);
      gradient.addColorStop(1,   `rgba(255,255,220,0)`);

      octx.save();
      octx.translate(x, y);
      octx.rotate(beam.angle);
      octx.beginPath();
      octx.moveTo(-currentWidth / 2, 0);
      octx.lineTo( currentWidth / 2, 0);
      octx.lineTo( currentWidth / 2 * 2.5, length);
      octx.lineTo(-currentWidth / 2 * 2.5, length);
      octx.closePath();
      octx.fillStyle = gradient;
      octx.fill();
      octx.restore();
    });

    for (let layer = 0; layer < 3; layer++) {
      const speed     = 0.3 + layer * 0.2;
      const amplitude = 15  + layer * 10;
      const frequency = 0.005 + layer * 0.002;
      const alpha     = 0.04  - layer * 0.01;

      octx.beginPath();
      octx.moveTo(0, oceanCanvas.height / 2);

      for (let x = 0; x < oceanCanvas.width; x += 5) {
        const y =
          oceanCanvas.height / 2 +
          Math.sin(x * frequency + time * speed) * amplitude +
          Math.sin(x * frequency * 2 + time * speed * 1.5) * (amplitude / 2);
        octx.lineTo(x, y);
      }

      octx.lineTo(oceanCanvas.width, oceanCanvas.height);
      octx.lineTo(0, oceanCanvas.height);
      octx.closePath();
      octx.fillStyle = `rgba(100,200,200,${alpha})`;
      octx.fill();
    }

    time += 0.01;
    requestAnimationFrame(draw);
  }

  draw();
}
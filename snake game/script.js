// --- Snake Game Logic ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const gameOverEl = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

const gridSize = 20;
const tileCount = 20;
let snake, direction, nextDirection, food, score, bestScore, gameInterval, gameOver, speed;

function initGame() {
  snake = [
    {x: 10, y: 10},
    {x: 9, y: 10},
    {x: 8, y: 10}
  ];
  direction = 'RIGHT';
  nextDirection = 'RIGHT';
  score = 0;
  speed = 120;
  gameOver = false;
  placeFood();
  updateScore();
  gameOverEl.classList.add('hidden');
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, speed);
}

function updateScore() {
  scoreEl.textContent = `Score: ${score}`;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('snakeBestScore', bestScore);
  }
  bestScoreEl.textContent = `Best: ${bestScore}`;
}

function placeFood() {
  while (true) {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    if (!snake.some(segment => segment.x === food.x && segment.y === food.y)) break;
  }
}

function gameLoop() {
  // Move snake
  direction = nextDirection;
  const head = {...snake[0]};
  switch (direction) {
    case 'UP': head.y -= 1; break;
    case 'DOWN': head.y += 1; break;
    case 'LEFT': head.x -= 1; break;
    case 'RIGHT': head.x += 1; break;
  }

  // Wall collision
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return endGame();
  }
  // Self collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    return endGame();
  }

  snake.unshift(head);
  // Eating food
  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScore();
    placeFood();
    // Optional: Increase speed/level
    if (score % 5 === 0 && speed > 60) {
      speed -= 8;
      clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, speed);
    }
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw grid (optional for neon look)
  ctx.save();
  ctx.strokeStyle = 'rgba(0,255,255,0.08)';
  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
  ctx.restore();

  // Draw food
  ctx.fillStyle = '#0ff';
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 16;
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
  ctx.shadowBlur = 0;

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? '#fff' : '#1de9b6';
    ctx.shadowColor = i === 0 ? '#fff' : '#0ff';
    ctx.shadowBlur = i === 0 ? 12 : 6;
    ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
  }
  ctx.shadowBlur = 0;
}

function endGame() {
  clearInterval(gameInterval);
  gameOver = true;
  gameOverEl.classList.remove('hidden');
}

function handleKey(e) {
  if (gameOver && e.key === 'Enter') {
    initGame();
    return;
  }
  const key = e.key.toLowerCase();
  if (
    (key === 'arrowup' || key === 'w') && direction !== 'DOWN'
  ) nextDirection = 'UP';
  else if (
    (key === 'arrowdown' || key === 's') && direction !== 'UP'
  ) nextDirection = 'DOWN';
  else if (
    (key === 'arrowleft' || key === 'a') && direction !== 'RIGHT'
  ) nextDirection = 'LEFT';
  else if (
    (key === 'arrowright' || key === 'd') && direction !== 'LEFT'
  ) nextDirection = 'RIGHT';
}

restartBtn.addEventListener('click', initGame);
document.addEventListener('keydown', handleKey);

// Touch controls for mobile
let touchStartX = null, touchStartY = null;
canvas.addEventListener('touchstart', function(e) {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});
canvas.addEventListener('touchmove', function(e) {
  if (touchStartX === null || touchStartY === null) return;
  const t = e.touches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 20 && direction !== 'LEFT') nextDirection = 'RIGHT';
    else if (dx < -20 && direction !== 'RIGHT') nextDirection = 'LEFT';
  } else {
    if (dy > 20 && direction !== 'UP') nextDirection = 'DOWN';
    else if (dy < -20 && direction !== 'DOWN') nextDirection = 'UP';
  }
  touchStartX = touchStartY = null;
});

// Focus canvas for keyboard
canvas.addEventListener('click', () => canvas.focus());

// Load best score
bestScore = Number(localStorage.getItem('snakeBestScore')) || 0;
initGame();

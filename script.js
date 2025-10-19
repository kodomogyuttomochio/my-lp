const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const livesElement = document.getElementById('lives');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const rankingList = document.getElementById('ranking-list');
const playerNameInput = document.getElementById('player-name');
const saveScoreButton = document.getElementById('save-score-button');
const rankingForm = document.getElementById('ranking-form');

canvas.width = 800;
canvas.height = 600;

let player;
let works;
let score;
let lives;
let gameOver;
let keys = {};

const workTypes = ['documents', 'angry_senpai', 'kaeritai'];

function init() {
    player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 60,
        width: 50,
        height: 50,
        speed: 7,
    };

    works = [];
    score = 0;
    lives = 3;
    gameOver = false;
    difficultyLevel = 1;

    updateLivesDisplay();
    scoreElement.textContent = score;
    gameOverScreen.classList.add('hidden');
    rankingForm.classList.add('hidden');
    restartButton.classList.add('hidden');

    keys = {};
    gameLoop();
}

function updateLivesDisplay() {
    livesElement.textContent = '❤️'.repeat(lives);
}

function drawPlayer() {
    const bodyHeight = player.height * 0.6;
    const headHeight = player.height * 0.4;
    const bodyY = player.y + headHeight;

    // Body
    ctx.fillStyle = '#3498db'; // Blue shirt
    ctx.fillRect(player.x, bodyY, player.width, bodyHeight);

    // Head (Laptop)
    const laptopWidth = player.width * 1.2;
    const laptopX = player.x - (laptopWidth - player.width) / 2;

    // Laptop base (keyboard)
    ctx.fillStyle = '#95a5a6'; // Darker grey
    ctx.fillRect(laptopX, player.y + headHeight - 5, laptopWidth, 10);

    // Laptop screen (face)
    ctx.fillStyle = '#ecf0f1'; // Light grey
    ctx.fillRect(laptopX, player.y, laptopWidth, headHeight);

    // Screen content (a simple face)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(laptopX + 15, player.y + 10, 8, 8); // Eye
    ctx.fillRect(laptopX + laptopWidth - 23, player.y + 10, 8, 8); // Eye
}

function spawnWork() {
    const type = workTypes[Math.floor(Math.random() * workTypes.length)];
    const work = {
        x: Math.random() * (canvas.width - 50),
        y: -60,
        width: 50,
        height: 50,
        speed: (Math.random() * 4 + 3) + difficultyLevel * 0.5,
        type: type,
    };
    works.push(work);
}

function drawWorks() {
    works.forEach(work => {
        switch (work.type) {
            case 'documents':
                drawDocuments(work);
                break;
            case 'angry_senpai':
                drawAngrySenpai(work);
                break;
            case 'kaeritai':
                drawKaeritai(work);
                break;
        }
    });
}

function drawDocuments(work) {
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(work.x, work.y, work.width, work.height);
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(work.x + 5, work.y + 5, work.width - 10, 5);
    ctx.fillRect(work.x + 5, work.y + 15, work.width - 10, 5);
    ctx.fillRect(work.x + 5, work.y + 25, work.width - 10, 5);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = 'black';
    ctx.fillText('書類', work.x + 10, work.y + 45);
}

function drawAngrySenpai(work) {
    ctx.fillStyle = '#ffddc1'; // Skin color
    ctx.beginPath();
    ctx.arc(work.x + work.width / 2, work.y + work.height / 2, work.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Angry eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(work.x + 15, work.y + 15);
    ctx.lineTo(work.x + 25, work.y + 25);
    ctx.moveTo(work.x + 25, work.y + 15);
    ctx.lineTo(work.x + 15, work.y + 25);
    ctx.moveTo(work.x + 35, work.y + 15);
    ctx.lineTo(work.x + 45, work.y + 25);
    ctx.moveTo(work.x + 45, work.y + 15);
    ctx.lineTo(work.x + 35, work.y + 25);
    ctx.stroke();

    // Angry mouth
    ctx.beginPath();
    ctx.arc(work.x + work.width / 2, work.y + 40, 10, Math.PI, 2 * Math.PI, true);
    ctx.stroke();
}

function drawKaeritai(work) {
    ctx.fillStyle = '#a29bfe';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('帰りたい', work.x, work.y + work.height / 2);
}

function updateWorks() {
    works.forEach((work, index) => {
        work.y += work.speed;
        if (work.y > canvas.height) {
            works.splice(index, 1);
        }
    });
}

function detectCollision() {
    works.forEach((work, index) => {
        if (
            player.x < work.x + work.width &&
            player.x + player.width > work.x &&
            player.y < work.y + work.height &&
            player.y + player.height > work.y
        ) {
            works.splice(index, 1);
            lives--;
            updateLivesDisplay();
            if (lives <= 0) {
                gameOver = true;
            }
        }
    });
}

function updatePlayerPosition() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

let workSpawnTimer = 0;
function gameLoop() {
    if (gameOver) {
        showGameOver();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayerPosition();
    drawPlayer();

    // Difficulty progression
    if (score > 0 && score % 300 === 0) {
        difficultyLevel++;
    }

    workSpawnTimer++;
    const spawnThreshold = Math.max(10, 30 - difficultyLevel * 2);
    if (workSpawnTimer > spawnThreshold) {
        spawnWork();
        workSpawnTimer = 0;
    }

    updateWorks();
    drawWorks();

    detectCollision();

    score++;
    scoreElement.textContent = score;

    requestAnimationFrame(gameLoop);
}

function showGameOver() {
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
    rankingForm.classList.remove('hidden');
    displayRanking();
}

function saveScore(name, newScore) {
    const scores = JSON.parse(localStorage.getItem('work-escape-scores')) || [];
    scores.push({ name, score: newScore });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('work-escape-scores', JSON.stringify(scores.slice(0, 5)));
    displayRanking();
}

function displayRanking() {
    const scores = JSON.parse(localStorage.getItem('work-escape-scores')) || [];
    rankingList.innerHTML = '';
    scores.forEach((s, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${s.name} - ${s.score}`;
        rankingList.appendChild(li);
    });
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

restartButton.addEventListener('click', () => {
    init();
});

saveScoreButton.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name) {
        saveScore(name, score);
        rankingForm.classList.add('hidden');
        restartButton.classList.remove('hidden');
    }
});

init();
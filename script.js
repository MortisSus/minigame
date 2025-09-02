let score = 0;
let multiplier = 1;
let autoClick = 0;

const scoreEl = document.getElementById("score");
const clickBtn = document.getElementById("clickBtn");
const doubleClickBtn = document.getElementById("doubleClick");
const autoClickBtn = document.getElementById("autoClick");
const nicknameInput = document.getElementById("nickname");
const saveScoreBtn = document.getElementById("saveScore");
const scoresList = document.getElementById("scoresList");

// ==== JSONBIN CONFIG ====
const API_KEY = "$2a$10$DtvJ.cRYmWQwaxY7ZPbEl.Itwtyh2fZjipxKjO/oAQRWHhzSuGDYa"; // твой ключ
const BIN_ID = "68b755c9d0ea881f406fbd27"; // твой Bin ID
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ==== ЛОКАЛЬНОЕ СОХРАНЕНИЕ ====
window.onload = () => {
  const save = JSON.parse(localStorage.getItem("clickerSave"));
  if (save) {
    score = save.score;
    multiplier = save.multiplier;
    autoClick = save.autoClick;
    updateScore();
  }
  loadScores();
};

clickBtn.addEventListener("click", () => {
  score += multiplier;
  updateScore();
  saveGame();
});

doubleClickBtn.addEventListener("click", () => {
  if (score >= 50) {
    score -= 50;
    multiplier *= 2;
    updateScore();
    saveGame();
  }
});

autoClickBtn.addEventListener("click", () => {
  if (score >= 200) {
    score -= 200;
    autoClick++;
    updateScore();
    saveGame();
  }
});

setInterval(() => {
  if (autoClick > 0) {
    score += autoClick;
    updateScore();
    saveGame();
  }
}, 1000);

function saveGame() {
  const save = { score, multiplier, autoClick };
  localStorage.setItem("clickerSave", JSON.stringify(save));
}

function updateScore() {
  scoreEl.innerText = score;
}

// ==== ОНЛАЙН ЛИДЕРБОРД ====

async function loadScores() {
  try {
    const res = await fetch(API_URL, {
      headers: { "X-Master-Key": API_KEY }
    });
    const data = await res.json();
    const scores = data.record || [];
    
    scoresList.innerHTML = "";
    scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .forEach(s => {
        if(s.name) { // игнор пустых объектов
          const li = document.createElement("li");
          li.textContent = `${s.name}: ${s.score}`;
          scoresList.appendChild(li);
        }
      });
  } catch (err) {
    console.error("Ошибка загрузки:", err);
  }
}

saveScoreBtn.addEventListener("click", async () => {
  const nickname = nicknameInput.value.trim();
  if (!nickname) return;

  try {
    const res = await fetch(API_URL, {
      headers: { "X-Master-Key": API_KEY }
    });
    const data = await res.json();
    let scores = data.record || [];

    // удаляем пустые объекты
    scores = scores.filter(s => s.name);

    // Добавляем нового игрока
    scores.push({ name: nickname, score });
    scores.sort((a, b) => b.score - a.score);

    // Сохраняем обратно (топ 50)
    await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(scores.slice(0, 50))
    });

    loadScores();
  } catch (err) {
    console.error("Ошибка сохранения:", err);
  }
});

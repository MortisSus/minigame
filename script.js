let score = 0;
let multiplier = 1;
let autoClick = 0;
let doubleClickCount = 0;

const scoreEl = document.getElementById("score");
const clickBtn = document.getElementById("clickBtn");
const doubleClickBtn = document.getElementById("doubleClick");
const autoClickBtn = document.getElementById("autoClick");
const secretBtn = document.getElementById("secretBtn");
const saveScoreBtn = document.getElementById("saveScore");
const scoresList = document.getElementById("scoresList");

const secretModal = document.getElementById("secretModal");
const secretImg = document.getElementById("secretImg");
const closeModal = document.getElementById("closeModal");

// ==== JSONBIN CONFIG ====
const API_KEY = "$2a$10$DtvJ.cRYmWQwaxY7ZPbEl.Itwtyh2fZjipxKjO/oAQRWHhzSuGDYa";
const BIN_ID = "68b755c9d0ea881f406fbd27";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ==== Získání nicku při vstupu ====
let playerName = localStorage.getItem("playerName");
if (!playerName) {
  playerName = prompt("Zadejte svůj nick:");
  if (!playerName) playerName = "Hráč";
  localStorage.setItem("playerName", playerName);
}

// ==== LOCALE STORAGE ====
window.onload = () => {
  const save = JSON.parse(localStorage.getItem("clickerSave"));
  if (save) {
    score = save.score;
    multiplier = save.multiplier;
    autoClick = save.autoClick;
    doubleClickCount = save.doubleClickCount || 0;
    updateScore();
    updateDoubleClickText();
  }
  loadScores();
};

// ==== Основные кнопки ====
clickBtn.addEventListener("click", () => {
  score += multiplier;
  updateScore();
  saveGame();
});

doubleClickBtn.addEventListener("click", () => {
  if (score >= 50 && doubleClickCount < 3) {
    score -= 50;
    multiplier *= 2;
    doubleClickCount++;
    updateScore();
    updateDoubleClickText();
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

// ==== Тайная кнопка ====
const SECRET_URL = "https://i.ibb.co/JFp0CLL1/molodec.png";

secretBtn.addEventListener("click", () => {
  if (score >= 1000) {
    score -= 1000;
    updateScore();
    saveGame();
    secretImg.src = SECRET_URL;
    secretModal.style.display = "block";
  } else {
    alert("Nemáte dostatek bodů!");
  }
});

closeModal.addEventListener("click", () => {
  secretModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target == secretModal) {
    secretModal.style.display = "none";
  }
});

// ==== Локальное сохранение ====
function saveGame() {
  const save = { score, multiplier, autoClick, doubleClickCount };
  localStorage.setItem("clickerSave", JSON.stringify(save));
}

function updateScore() {
  scoreEl.innerText = score;
}

function updateDoubleClickText() {
  doubleClickBtn.innerText = `x2 (${doubleClickCount}/3) za 50 bodů`;
}

// ==== Online leaderboard ====
async function loadScores() {
  try {
    const res = await fetch(API_URL, {
      headers: { "X-Master-Key": API_KEY }
    });
    const data = await res.json();
    const scores = data.record || [];
    
    scoresList.innerHTML = "";
    scores
      .filter(s => s.name)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.name}: ${s.score}`;
        scoresList.appendChild(li);
      });
  } catch (err) {
    console.error("Chyba při načítání:", err);
  }
}

saveScoreBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(API_URL, {
      headers: { "X-Master-Key": API_KEY }
    });
    const data = await res.json();
    let scores = data.record || [];

    scores = scores.filter(s => s.name);

    const existing = scores.find(s => s.name === playerName);
    if (existing) {
      existing.score = score;
    } else {
      scores.push({ name: playerName, score });
    }

    scores.sort((a, b) => b.score - a.score);

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
    console.error("Chyba při ukládání:", err);
  }
});

let score = 0;

document.getElementById("clickBtn").addEventListener("click", () => {
  score++;
  document.getElementById("score").innerText = score;
});

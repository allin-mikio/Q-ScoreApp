const GAME_COUNT = 6;
const SLOTS_PER_GAME = 3;
const SESSION_COUNT = 3; // 0: 練習1, 1: 練習2, 2: 本番
const SCORE_CANDIDATES = [11, -13, 5, -7, 2, -3];

// sessions[sessionIndex][gameIndex][slotIndex] = number | null
const sessions = Array.from({ length: SESSION_COUNT }, () =>
  Array.from({ length: GAME_COUNT }, () =>
    Array.from({ length: SLOTS_PER_GAME }, () => null)
  )
);

function createGameRow(sessionIndex, gameIndex) {
  const row = document.createElement("div");
  row.className = "game-row";

  const title = document.createElement("div");
  title.className = "game-title";
  title.textContent = `${gameIndex + 1}ゲーム目`;

  const content = document.createElement("div");
  content.className = "game-content";

  // スロット表示
  const slotRow = document.createElement("div");
  slotRow.className = "slot-row";

  const slotDisplay = document.createElement("div");
  slotDisplay.className = "slot-display";

  const slotElements = [];
  for (let s = 0; s < SLOTS_PER_GAME; s++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.textContent = "-";
    slotDisplay.appendChild(slot);
    slotElements.push(slot);
  }

  const buttonsRow = document.createElement("div");
  buttonsRow.className = "buttons-row";

  // 候補得点ボタン
  SCORE_CANDIDATES.forEach((score) => {
    const btn = document.createElement("button");
    btn.className = "btn-score";
    btn.textContent = score > 0 ? `+${score}` : `${score}`;
    btn.classList.add(score > 0 ? "positive" : "negative");

    btn.addEventListener("click", () => {
      applyScore(sessionIndex, gameIndex, score);
      refreshSlots(sessionIndex, gameIndex, slotElements);
      recalcAndRenderSummary(sessionIndex);
    });

    buttonsRow.appendChild(btn);
  });

  // クリアボタン（そのゲームのスロットを全部クリア）
  const clearBtn = document.createElement("button");
  clearBtn.className = "btn-clear";
  clearBtn.textContent = "CLR";
  clearBtn.addEventListener("click", () => {
    clearGame(sessionIndex, gameIndex);
    refreshSlots(sessionIndex, gameIndex, slotElements);
    recalcAndRenderSummary(sessionIndex);
  });
  buttonsRow.appendChild(clearBtn);

  slotRow.appendChild(slotDisplay);
  slotRow.appendChild(buttonsRow);

  content.appendChild(slotRow);

  row.appendChild(title);
  row.appendChild(content);

  return { row, slotElements };
}

function applyScore(sessionIndex, gameIndex, score) {
  const slots = sessions[sessionIndex][gameIndex];
  const emptyIndex = slots.findIndex((v) => v === null);
  if (emptyIndex === -1) {
    // すべて埋まっている場合は最後のスロットを上書き
    slots[SLOTS_PER_GAME - 1] = score;
  } else {
    slots[emptyIndex] = score;
  }
}

function clearGame(sessionIndex, gameIndex) {
  for (let s = 0; s < SLOTS_PER_GAME; s++) {
    sessions[sessionIndex][gameIndex][s] = null;
  }
}

function refreshSlots(sessionIndex, gameIndex, slotElements) {
  const slots = sessions[sessionIndex][gameIndex];
  for (let s = 0; s < SLOTS_PER_GAME; s++) {
    const val = slots[s];
    const el = slotElements[s];
    el.textContent = val === null ? "-" : String(val);
  }
}

function recalcAndRenderSummary(sessionIndex) {
  let plusSum = 0;
  let minusSum = 0;
  let odds = 0;

  for (let g = 0; g < GAME_COUNT; g++) {
    for (let s = 0; s < SLOTS_PER_GAME; s++) {
      const v = sessions[sessionIndex][g][s];
      if (v === null) continue;
      if (v > 0) plusSum += v;
      else minusSum += v;
      odds += 1;
    }
  }

  const baseSum = plusSum + minusSum;
  const addBonus = baseSum === 0 ? 50 : 0;
  const total = odds === 0 ? 0 : (baseSum + addBonus) * odds;

  document.getElementById(`plus-sum-${sessionIndex}`).textContent = plusSum;
  document.getElementById(`minus-sum-${sessionIndex}`).textContent = minusSum;
  document.getElementById(`add-bonus-${sessionIndex}`).textContent = addBonus;
  document.getElementById(`odds-bonus-${sessionIndex}`).textContent = odds;
  document.getElementById(`total-score-${sessionIndex}`).textContent = total;
}

function initSession(sessionIndex) {
  const container = document.getElementById(`games-container-${sessionIndex}`);
  const slotRefs = [];

  for (let g = 0; g < GAME_COUNT; g++) {
    const { row, slotElements } = createGameRow(sessionIndex, g);
    container.appendChild(row);
    slotRefs.push(slotElements);
  }

  for (let g = 0; g < GAME_COUNT; g++) {
    refreshSlots(sessionIndex, g, slotRefs[g]);
  }
  recalcAndRenderSummary(sessionIndex);
}

function init() {
  for (let sessionIndex = 0; sessionIndex < SESSION_COUNT; sessionIndex++) {
    initSession(sessionIndex);
  }
}

window.addEventListener("DOMContentLoaded", init);

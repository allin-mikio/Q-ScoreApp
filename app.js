// ES5互換の実装
var GAME_COUNT = 6;
var SLOTS_PER_GAME = 3;
var SESSION_COUNT = 3; // 0: 練習1, 1: 練習2, 2: 本番
var SCORE_CANDIDATES = [11, -13, 5, -7, 2, -3];

// sessions[sessionIndex][gameIndex][slotIndex] = number | null
var sessions = [];
for (var si = 0; si < SESSION_COUNT; si++) {
  var sessionGames = [];
  for (var g = 0; g < GAME_COUNT; g++) {
    var gameSlots = [];
    for (var s = 0; s < SLOTS_PER_GAME; s++) {
      gameSlots.push(null);
    }
    sessionGames.push(gameSlots);
  }
  sessions.push(sessionGames);
}

function createGameRow(sessionIndex, gameIndex) {
  var row = document.createElement("div");
  row.className = "game-row";

  var title = document.createElement("div");
  title.className = "game-title";
  title.textContent = (gameIndex + 1) + "ゲーム目";

  var content = document.createElement("div");
  content.className = "game-content";

  // スロット表示
  var slotRow = document.createElement("div");
  slotRow.className = "slot-row";

  var slotDisplay = document.createElement("div");
  slotDisplay.className = "slot-display";

  var slotElements = [];
  for (var s = 0; s < SLOTS_PER_GAME; s++) {
    var slot = document.createElement("div");
    slot.className = "slot";
    slot.textContent = "-";
    slotDisplay.appendChild(slot);
    slotElements.push(slot);
  }

  var buttonsRow = document.createElement("div");
  buttonsRow.className = "buttons-row";

  // 候補得点ボタン
  for (var i = 0; i < SCORE_CANDIDATES.length; i++) {
    (function (score) {
      var btn = document.createElement("button");
      btn.className = "btn-score";
      btn.textContent = score > 0 ? "+" + score : String(score);
      btn.className += score > 0 ? " positive" : " negative";

      btn.addEventListener("click", function () {
        applyScore(sessionIndex, gameIndex, score);
        refreshSlots(sessionIndex, gameIndex, slotElements);
        recalcAndRenderSummary(sessionIndex);
      });

      buttonsRow.appendChild(btn);
    })(SCORE_CANDIDATES[i]);
  }

  // クリアボタン（そのゲームのスロットを全部クリア）
  var clearBtn = document.createElement("button");
  clearBtn.className = "btn-clear";
  clearBtn.textContent = "CLR";
  clearBtn.addEventListener("click", function () {
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

  return { row: row, slotElements: slotElements };
}

function applyScore(sessionIndex, gameIndex, score) {
  var slots = sessions[sessionIndex][gameIndex];
  var emptyIndex = -1;
  for (var i = 0; i < SLOTS_PER_GAME; i++) {
    if (slots[i] === null) {
      emptyIndex = i;
      break;
    }
  }
  if (emptyIndex === -1) {
    // すべて埋まっている場合は最後のスロットを上書き
    slots[SLOTS_PER_GAME - 1] = score;
  } else {
    slots[emptyIndex] = score;
  }
}

function clearGame(sessionIndex, gameIndex) {
  for (var s = 0; s < SLOTS_PER_GAME; s++) {
    sessions[sessionIndex][gameIndex][s] = null;
  }
}

function refreshSlots(sessionIndex, gameIndex, slotElements) {
  var slots = sessions[sessionIndex][gameIndex];
  for (var s = 0; s < SLOTS_PER_GAME; s++) {
    var val = slots[s];
    var el = slotElements[s];
    el.textContent = val === null ? "-" : String(val);
  }
}

function recalcAndRenderSummary(sessionIndex) {
  var plusSum = 0;
  var minusSum = 0;
  var odds = 0;

  for (var g = 0; g < GAME_COUNT; g++) {
    for (var s = 0; s < SLOTS_PER_GAME; s++) {
      var v = sessions[sessionIndex][g][s];
      if (v === null) continue;
      if (v > 0) plusSum += v;
      else minusSum += v;
      odds += 1;
    }
  }

  var baseSum = plusSum + minusSum;
  var addBonus = baseSum === 0 ? 50 : 0;
  var total = odds === 0 ? 0 : (baseSum + addBonus) * odds;

  document.getElementById("plus-sum-" + sessionIndex).textContent = plusSum;
  document.getElementById("minus-sum-" + sessionIndex).textContent = minusSum;
  document.getElementById("add-bonus-" + sessionIndex).textContent = addBonus;
  document.getElementById("odds-bonus-" + sessionIndex).textContent = odds;
  document.getElementById("total-score-" + sessionIndex).textContent = total;
}

function initSession(sessionIndex) {
  var container = document.getElementById("games-container-" + sessionIndex);
  var slotRefs = [];

  for (var g = 0; g < GAME_COUNT; g++) {
    var created = createGameRow(sessionIndex, g);
    container.appendChild(created.row);
    slotRefs.push(created.slotElements);
  }

  for (var i = 0; i < GAME_COUNT; i++) {
    refreshSlots(sessionIndex, i, slotRefs[i]);
  }
  recalcAndRenderSummary(sessionIndex);
}

function init() {
  for (var sessionIndex = 0; sessionIndex < SESSION_COUNT; sessionIndex++) {
    initSession(sessionIndex);
  }
}

window.addEventListener("DOMContentLoaded", init);

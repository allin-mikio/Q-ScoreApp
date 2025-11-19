// ES5互換の実装
var GAME_COUNT = 6;
var SLOTS_PER_GAME = 3;
var SESSION_COUNT = 3; // 0: 練習1, 1: 練習2, 2: 本番
var SCORE_CANDIDATES = [11, 5, 2, -13, -7, -3];

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

  // スロット要素
  var slotElements = [];
  for (var s = 0; s < SLOTS_PER_GAME; s++) {
    var slot = document.createElement("div");
    slot.className = "slot";
    slot.textContent = "-";
    slotElements.push(slot);
  }

  // Row1: Gameラベル + CLR
  var row1 = document.createElement("div");
  row1.className = "game-line-row top-row";

  var row1Left = document.createElement("div");
  row1Left.className = "game-line-left";
  var title = document.createElement("div");
  title.className = "game-title";
  title.textContent = "Game" + (gameIndex + 1);
  row1Left.appendChild(title);

  // CLRボタン（そのゲームのスロットを全部クリア）
  var clearBtn = document.createElement("button");
  clearBtn.className = "btn-clear";
  clearBtn.textContent = "CLR";
  clearBtn.addEventListener("click", function () {
    clearGame(sessionIndex, gameIndex);
    refreshSlots(sessionIndex, gameIndex, slotElements);
    recalcAndRenderSummary(sessionIndex);
  });
  row1Left.appendChild(clearBtn);

  // Row2: スロット + 全候補ボタン（プラス/マイナス）
  var row2 = document.createElement("div");
  row2.className = "game-line-row mid-row";

  var row2Left = document.createElement("div");
  row2Left.className = "game-line-left slot-display";
  for (var s2 = 0; s2 < slotElements.length; s2++) {
    row2Left.appendChild(slotElements[s2]);
  }

  var row2Right = document.createElement("div");
  row2Right.className = "game-line-right buttons-row";

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

      row2Right.appendChild(btn);
    })(SCORE_CANDIDATES[i]);
  }

  row1.appendChild(row1Left);

  row2.appendChild(row2Left);
  row2.appendChild(row2Right);

  row.appendChild(row1);
  row.appendChild(row2);

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

    // クラスで色を切り替え
    el.classList.remove("slot-positive", "slot-negative");
    if (val > 0) {
      el.classList.add("slot-positive");
    } else if (val < 0) {
      el.classList.add("slot-negative");
    }
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
  var totalEl = document.getElementById("total-score-" + sessionIndex);
  totalEl.textContent = total;
  if (total < 0) {
    totalEl.classList.add("total-negative");
  } else {
    totalEl.classList.remove("total-negative");
  }
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

  // All Reset ボタン
  var allResetBtn = document.getElementById("all-reset-button");
  if (allResetBtn) {
    allResetBtn.addEventListener("click", function () {
      // 全セッション・全ゲーム・全スロットをクリア
      for (var si = 0; si < SESSION_COUNT; si++) {
        for (var g = 0; g < GAME_COUNT; g++) {
          for (var s = 0; s < SLOTS_PER_GAME; s++) {
            sessions[si][g][s] = null;
          }
        }
      }

      // 表示を再描画
      for (var si2 = 0; si2 < SESSION_COUNT; si2++) {
        var container2 = document.getElementById("games-container-" + si2);
        if (!container2) continue;

        var gameRows = container2.querySelectorAll(".game-row");
        for (var g2 = 0; g2 < gameRows.length; g2++) {
          var slots = gameRows[g2].querySelectorAll(".slot");
          for (var s2 = 0; s2 < slots.length; s2++) {
            slots[s2].textContent = "-";
            slots[s2].classList.remove("slot-positive", "slot-negative");
          }
        }

        recalcAndRenderSummary(si2);
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", init);

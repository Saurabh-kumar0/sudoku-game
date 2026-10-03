"use strict";

const SOLVED_GRID = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

const STARTING_GRID = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const REMOVALS = { easy: 0, medium: 4, hard: 8 };
const boardElement = document.querySelector("#board");
const difficultySelect = document.querySelector("#difficulty");
const timerElement = document.querySelector("#timer");
const mistakesElement = document.querySelector("#mistakes");
const notesButton = document.querySelector("#notes-button");
const toastElement = document.querySelector("#toast");

let solution = [];
let puzzle = [];
let entries = [];
let notes = [];
let selectedCell = null;
let notesMode = false;
let mistakes = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let toastTimeout = null;
let gameFinished = false;

function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

function shuffled(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function makePermutation() {
  const bands = shuffled([0, 1, 2]);
  return bands.flatMap((band) =>
    shuffled([0, 1, 2]).map((row) => band * 3 + row),
  );
}

function generatePuzzle(difficulty) {
  const rows = makePermutation();
  const columns = makePermutation();
  const digits = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  solution = rows.map((row) =>
    columns.map((column) => digits[SOLVED_GRID[row][column] - 1]),
  );
  puzzle = rows.map((row) =>
    columns.map((column) => STARTING_GRID[row][column] === 0
      ? 0
      : digits[SOLVED_GRID[row][column] - 1]),
  );

  const additionalClues = [];
  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      if (puzzle[row][column] !== 0) additionalClues.push([row, column]);
    }
  }
  let removed = 0;
  for (const [row, column] of shuffled(additionalClues)) {
    if (removed >= REMOVALS[difficulty]) break;
    const clue = puzzle[row][column];
    puzzle[row][column] = 0;
    if (countSolutions(cloneGrid(puzzle)) === 1) {
      removed += 1;
    } else {
      puzzle[row][column] = clue;
    }
  }
}

function hasConflict(row, column, value, grid = entries) {
  if (value === 0) return false;
  for (let index = 0; index < 9; index += 1) {
    if (index !== column && grid[row][index] === value) return true;
    if (index !== row && grid[index][column] === value) return true;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxColumn = Math.floor(column / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxColumn; c < boxColumn + 3; c += 1) {
      if ((r !== row || c !== column) && grid[r][c] === value) return true;
    }
  }
  return false;
}

function countSolutions(grid, limit = 2) {
  let bestCell = null;
  let bestCandidates = null;

  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      if (grid[row][column] !== 0) continue;

      const candidates = [];
      for (let value = 1; value <= 9; value += 1) {
        if (!hasConflict(row, column, value, grid)) candidates.push(value);
      }
      if (candidates.length === 0) return 0;
      if (bestCandidates === null || candidates.length < bestCandidates.length) {
        bestCell = [row, column];
        bestCandidates = candidates;
        if (candidates.length === 1) break;
      }
    }
    if (bestCandidates?.length === 1) break;
  }

  if (bestCell === null || bestCandidates === null) return 1;

  const [row, column] = bestCell;
  let solutions = 0;
  for (const value of bestCandidates) {
    grid[row][column] = value;
    solutions += countSolutions(grid, limit - solutions);
    grid[row][column] = 0;
    if (solutions >= limit) return solutions;
  }
  return solutions;
}

function renderBoard() {
  boardElement.replaceChildren();
  boardElement.setAttribute("aria-rowcount", "9");
  boardElement.setAttribute("aria-colcount", "9");

  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      const value = entries[row][column];
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.row = String(row);
      cell.dataset.column = String(column);
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-rowindex", String(row + 1));
      cell.setAttribute("aria-colindex", String(column + 1));
      cell.setAttribute("aria-selected", String(selectedCell?.[0] === row && selectedCell?.[1] === column));
      cell.tabIndex = selectedCell === null
        ? (row === 0 && column === 0 ? 0 : -1)
        : (selectedCell[0] === row && selectedCell[1] === column ? 0 : -1);

      if (puzzle[row][column] !== 0) cell.classList.add("given");
      if (selectedCell !== null) {
        const [selectedRow, selectedColumn] = selectedCell;
        if (selectedRow === row && selectedColumn === column) {
          cell.classList.add("selected");
        } else if (
          selectedRow === row ||
          selectedColumn === column ||
          (Math.floor(selectedRow / 3) === Math.floor(row / 3) &&
            Math.floor(selectedColumn / 3) === Math.floor(column / 3))
        ) {
          cell.classList.add("peer");
        }
        if (value !== 0 && value === entries[selectedRow][selectedColumn]) {
          cell.classList.add("same-number");
        }
      }
      if (hasConflict(row, column, value)) cell.classList.add("conflict");
      if (puzzle[row][column] === 0 && value !== 0 && value !== solution[row][column]) {
        cell.classList.add("incorrect");
      }

      if (value !== 0) {
        const number = document.createElement("span");
        number.className = "cell-number";
        number.textContent = String(value);
        cell.append(number);
      } else {
        const pencilNotes = document.createElement("span");
        pencilNotes.className = "notes-grid";
        pencilNotes.setAttribute("aria-hidden", "true");
        for (let candidate = 1; candidate <= 9; candidate += 1) {
          const note = document.createElement("span");
          note.textContent = notes[row][column].has(candidate) ? String(candidate) : "";
          pencilNotes.append(note);
        }
        cell.append(pencilNotes);
      }

      const cellType = puzzle[row][column] !== 0 ? "given" : value !== 0 ? "your number" : "empty";
      const noteLabel = value === 0 && notes[row][column].size > 0
        ? `, notes ${[...notes[row][column]].sort().join(", ")}`
        : "";
      cell.setAttribute("aria-label", `Row ${row + 1}, column ${column + 1}: ${value || "empty"}${noteLabel}, ${cellType}`);
      cell.addEventListener("click", () => selectCell(row, column));
      boardElement.append(cell);
    }
  }
  updateNumberPad();
}

function updateNumberPad() {
  const selectedValue = selectedCell === null
    ? 0
    : entries[selectedCell[0]][selectedCell[1]];
  document.querySelectorAll(".number-button").forEach((button) => {
    const value = Number(button.dataset.value);
    const count = entries.flat().filter((entry) => entry === value).length;
    button.disabled = count === 9 || gameFinished;
    button.setAttribute("aria-label", `Enter ${value}${count === 9 ? ", all placed" : ""}`);
    button.classList.toggle("number-active", selectedValue === value);
  });
}

function selectCell(row, column, focus = false) {
  selectedCell = [row, column];
  renderBoard();
  if (focus) boardElement.querySelector(`[data-row="${row}"][data-column="${column}"]`)?.focus();
}

function showToast(message, isError = false) {
  window.clearTimeout(toastTimeout);
  toastElement.textContent = message;
  toastElement.classList.toggle("error", isError);
  toastElement.classList.add("visible");
  toastTimeout = window.setTimeout(() => toastElement.classList.remove("visible"), 2600);
}

function updateTimer() {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function checkWin() {
  if (entries.some((row) => row.includes(0))) return false;
  return entries.every((row, rowIndex) =>
    row.every((value, columnIndex) => value === solution[rowIndex][columnIndex]),
  );
}

function finishGame() {
  gameFinished = true;
  window.clearInterval(timerInterval);
  renderBoard();
  document.querySelector("#win-dialog").showModal();
}

function enterNumber(value) {
  if (gameFinished || selectedCell === null) {
    if (!gameFinished) showToast("Choose a square first.");
    return;
  }

  const [row, column] = selectedCell;
  if (puzzle[row][column] !== 0) {
    showToast("That number is a given and can't be changed.", true);
    return;
  }

  if (notesMode) {
    if (entries[row][column] !== 0) entries[row][column] = 0;
    if (notes[row][column].has(value)) notes[row][column].delete(value);
    else notes[row][column].add(value);
  } else {
    entries[row][column] = value;
    notes[row][column].clear();
    if (hasConflict(row, column, value)) {
      mistakes += 1;
      mistakesElement.textContent = String(mistakes);
      showToast("That number conflicts with another square.", true);
    } else if (value !== solution[row][column]) {
      mistakes += 1;
      mistakesElement.textContent = String(mistakes);
      showToast("Not quite right—try another number.", true);
    } else {
      showToast("Nicely placed.");
    }
  }

  renderBoard();
  if (checkWin()) finishGame();
}

function eraseSelected() {
  if (selectedCell === null) {
    showToast("Choose a square to erase.");
    return;
  }
  const [row, column] = selectedCell;
  if (puzzle[row][column] !== 0) {
    showToast("Given numbers can't be erased.", true);
    return;
  }
  entries[row][column] = 0;
  notes[row][column].clear();
  renderBoard();
  showToast("Square cleared.");
}

function giveHint() {
  if (gameFinished) return;
  let target = selectedCell;
  if (target === null || entries[target[0]][target[1]] === solution[target[0]][target[1]]) {
    target = null;
    for (let row = 0; row < 9 && target === null; row += 1) {
      for (let column = 0; column < 9; column += 1) {
        if (puzzle[row][column] === 0 && entries[row][column] !== solution[row][column]) {
          target = [row, column];
          break;
        }
      }
    }
  }
  if (target === null) {
    showToast("There are no squares left to hint at.");
    return;
  }

  const [row, column] = target;
  entries[row][column] = solution[row][column];
  notes[row][column].clear();
  selectCell(row, column);
  showToast(`A little nudge: row ${row + 1}, column ${column + 1} is ${solution[row][column]}.`);
  if (checkWin()) finishGame();
}

function checkBoard() {
  let wrong = 0;
  let empty = 0;
  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      if (entries[row][column] === 0) empty += 1;
      else if (entries[row][column] !== solution[row][column]) wrong += 1;
    }
  }

  if (wrong > 0) showToast(`There ${wrong === 1 ? "is" : "are"} ${wrong} incorrect ${wrong === 1 ? "number" : "numbers"}. Take a second look.`, true);
  else if (empty > 0) showToast(`Everything looks good so far. ${empty} ${empty === 1 ? "square" : "squares"} left to fill.`);
  else if (checkWin()) finishGame();
}

function startNewGame() {
  window.clearInterval(timerInterval);
  elapsedSeconds = 0;
  mistakes = 0;
  gameFinished = false;
  selectedCell = null;
  notesMode = false;
  notesButton.setAttribute("aria-pressed", "false");
  mistakesElement.textContent = "0";
  updateTimer();
  generatePuzzle(difficultySelect.value);
  entries = cloneGrid(puzzle);
  notes = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set()),
  );
  renderBoard();
  timerInterval = window.setInterval(() => {
    elapsedSeconds += 1;
    updateTimer();
  }, 1000);
}

boardElement.addEventListener("keydown", (event) => {
  if (!selectedCell) {
    const focusedCell = event.target.closest(".cell");
    if (!focusedCell) return;
    selectedCell = [Number(focusedCell.dataset.row), Number(focusedCell.dataset.column)];
  }
  const [row, column] = selectedCell;
  const moves = {
    ArrowUp: [Math.max(0, row - 1), column],
    ArrowDown: [Math.min(8, row + 1), column],
    ArrowLeft: [row, Math.max(0, column - 1)],
    ArrowRight: [row, Math.min(8, column + 1)],
  };
  if (Object.hasOwn(moves, event.key)) {
    event.preventDefault();
    selectCell(...moves[event.key], true);
  } else if (/^[1-9]$/.test(event.key)) {
    event.preventDefault();
    enterNumber(Number(event.key));
  } else if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
    event.preventDefault();
    eraseSelected();
  }
});

document.querySelector("#number-pad").addEventListener("click", (event) => {
  const button = event.target.closest("[data-value]");
  if (button && !button.disabled) enterNumber(Number(button.dataset.value));
});

notesButton.addEventListener("click", () => {
  notesMode = !notesMode;
  notesButton.setAttribute("aria-pressed", String(notesMode));
  showToast(notesMode ? "Notes mode is on." : "Notes mode is off.");
});
document.querySelector("#erase-button").addEventListener("click", eraseSelected);
document.querySelector("#hint-button").addEventListener("click", giveHint);
document.querySelector("#check-button").addEventListener("click", checkBoard);
document.querySelector("#new-game").addEventListener("click", startNewGame);
difficultySelect.addEventListener("change", startNewGame);
document.querySelector("#help-button").addEventListener("click", () => {
  document.querySelector("#help-dialog").showModal();
});
document.querySelector("#win-new-game").addEventListener("click", () => {
  document.querySelector("#win-dialog").close();
  startNewGame();
});

startNewGame();

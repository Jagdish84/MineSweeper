'use strict'

var MINE = '💣';
var EMPTY = ' ';
var FLAG = '🚩';

var gTimerId;
var gStartTime = Date.now()
var gTimerInterval;
var gFirstCellClick = 0;

var gLevel = {
    size: 4,
    mines: 2
}

var gGame = {
    isOn: false,
    totalNoMines: gLevel.size ** 2 - gLevel.mines,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoard;

function initGame() {
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.totalNoMines = gLevel.size ** 2 - gLevel.mines;
    clearInterval(gTimerInterval);
    clearTimer();
    gBoard = buildBoard();
    renderBoard(gBoard);
    getModal(false, false);
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
        }
    }
    // board[0][0].isMine = true;
    // board[2][2].isMine = true;

    return board;
}


function renderBoard(board) {
    var strHTML = '';
    // var length = gCurrLevel;
    for (var i = 0; i < gLevel.size; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < gLevel.size; j++) {
            var cell = board[i][j];
            var cellToDisplay = getCellData(cell)
            strHTML += `<td class ="cell${gLevel.size}" data-i="${i}" data-j="${j}" onclick="cellClicked(this)"
            oncontextmenu="cellMarked(event, this)">${cellToDisplay}</td>`;
        }
        strHTML += '</tr>\n';
    }
    var elTable = document.querySelector('.board')
    elTable.innerHTML = strHTML
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) continue
            gBoard[i][j].minesAroundCount = countNegsAround({ i, j }, gBoard);
        }
    }
}

function placeMines(level, numOfMines) {
    var rndLocation = { i: getRandomInt(0, level), j: getRandomInt(0, level) }
    for (var i = 0; i < numOfMines; i++) {
        gBoard[rndLocation.i][rndLocation.j].isMine = true;
        rndLocation = { i: getRandomInt(0, level), j: getRandomInt(0, level) }
    }
}

function cellClicked(elCell) {
    var currLocation = { i: +elCell.dataset.i, j: +elCell.dataset.j };
    var currCell = gBoard[currLocation.i][currLocation.j];
    var elShown = document.querySelector('.shown');
    if (gFirstCellClick === 0) {
        gTimerInterval = setInterval(renderTimer, 100);
        placeMines(gLevel.size, gLevel.mines);
        setMinesNegsCount()
        renderBoard(gBoard);
    }
    gFirstCellClick++
    console.log(gGame.totalNoMines);
    if (!currCell.isShown) {
        currCell.isShown = true;
        gGame.shownCount++;
        gGame.totalNoMines--;
        elShown.innerHTML = `Shown Cells: ${gGame.shownCount}`;
        renderBoard(gBoard);
    }

    if (currCell.isMine === true) {
        showMines(gBoard);
        gameOver(false);
    }
    checkGameOver(gBoard, gLevel.mines);
}

function cellMarked(event, elCell) {
    var i = +elCell.dataset.i;
    var j = +elCell.dataset.j;
    var elMarked = document.querySelector('.marked');

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true;
        gGame.markedCount++;
        elMarked.innerHTML = `Marked Cells: ${gGame.markedCount}`;
        gBoard[i][j].isShown = true;
    } else {
        gBoard[i][j].isMarked = false;
        gGame.markedCount--;
        elMarked.innerHTML = `Marked Cells: ${gGame.markedCount}`;
        gBoard[i][j].isShown = false;
    }
    event.preventDefault();
    renderBoard(gBoard)
}

function checkGameOver(board, mines) {
    if (gGame.totalNoMines === 0) {
        gameOver(true);
    }
}

function expandShown(board, elCell, i, j) {

}

function countNegsAround(position, board) {
    var count = 0;
    for (var i = position.i - 1; i <= position.i + 1; i++) {
        if (i >= board.length || i < 0) continue
        for (var j = position.j - 1; j <= position.j + 1; j++) {
            if (j >= board.length || j < 0) continue
            if (board[i][j].isMine) count++;
        }
    }
    return count;
}

function changeLevel(num) {
    gLevel.size = num;
    if (num === 4) {
        gLevel.mines = 2;
    } else if (num === 8) {
        gLevel.mines = 4;
    } else {
        gLevel.mines = 6;
    }
    gFirstCellClick = 0;
    initGame();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function renderTimer() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerHTML = ` ${(Date.now() - gStartTime) / 1000} sec`
}

function clearTimer() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerHTML = ''
}

function clearScores() {
    var elShown = document.querySelector('.shown');
    elShown.innerHTML = '';
    var elMarked = document.querySelector('.marked');
    elMarked.innerHTML = '';
}

function getCellData(cell) {
    if (!cell.isShown) {
        return EMPTY;
    }
    if (cell.isMine) {
        return MINE;
    }
    if (cell.isMarked) {
        return FLAG;
    }
    else {
        return cell.minesAroundCount
    }
}

function gameOver(isVictory) {
    showMines(gBoard)
    gGame.isOn = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    getModal(true, isVictory);
    clearInterval(gTimerInterval);
    clearScores();
}

function getModal(showModal, isVictory) {

    if (showModal) {
        document.querySelector('.modal').style.visibility = "visible";
    } else {
        document.querySelector('.modal').style.visibility = "hidden";
    }

    if (isVictory) {
        document.querySelector('.game-over-txt').innerText = 'You Won ! ! !';
    } else {
        document.querySelector('.game-over-txt').innerText = 'Game Over';
    }

}

function showMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            if (currCell.isMine === true) {
                currCell.isShown = true
            }
        }
    }
    renderBoard(board)
}

function countShownCells(board) {
    var countShownCell = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            if (currCell.isShown = true) {
                countShownCell++;
            }
        }
    }
    return countShownCell;
}

function countMarkedMines(board) {
    var countMarkedMines = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            if (currCell.isMine === true && currCell.isMarked === true) {
                countMarkedMines++;
            }
        }
    }
    console.log(countMarkedMines);
    return countMarkedMines;
}
'use strict'

var MINE = '💣';
var EMPTY = ' ';
var FLAG = '🚩';
var START = '😃';
var HITMINE = '😰';
var WIN = '😎';


var gStartTime = Date.now()
var gFirstCellClick = 0;
var gTimeScore;

var gLevel = {
    size: 4,
    mines: 2
}

var scoreStorage = window.localStorage;
localStorage.setItem('beginner', Infinity);
localStorage.setItem('medium', Infinity);
localStorage.setItem('expert', Infinity);

var gTimer = {
    seconds: 0,
    minutes: 0
};

var gGame = {
    isOn: false,
    totalNoMines: gLevel.size ** 2 - gLevel.mines,
    shownCount: 0,
    markedCount: 0,
    livesCount: 3,
    safeCount: 3,
    secsPassed: 0,
    timerInterval: 0
}

var gBoard;

function initGame() {
    gStartTime = Date.now()
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.totalNoMines = gLevel.size ** 2 - gLevel.mines;
    gGame.livesCount = 3;
    gGame.safeCount = 3;
    gFirstCellClick = 0;
    clearTimer();
    clearScores()
    resetLives();
    resetSmiley();
    resetSafeCells()
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
        gGame.timerInterval = setInterval(renderTimer, 1000);
        placeMines(gLevel.size, gLevel.mines);
        setMinesNegsCount()
        renderBoard(gBoard);
    }
    gFirstCellClick++

    if (!currCell.isShown && !currCell.isMine) {
        if (currCell.minesAroundCount === 0) {
            var emptyLocations = getEmptyNegsLocations(currLocation);
            for (var i = 0; i < emptyLocations.length; i++) {
                gBoard[emptyLocations[i].i][emptyLocations[i].j].isShown = true;
                gGame.shownCount++;
                gGame.totalNoMines--;
                elShown.innerHTML = `Shown Cells: ${gGame.shownCount}`;
                renderBoard(gBoard);
            }
            // currCell.isShown = true;

        }
    }
    // console.log(gGame.totalNoMines);
    if (!currCell.isShown) {
        currCell.isShown = true;
        if (currCell.isMine === true) {
            renderLives();
            renderSmiley(HITMINE);
            gGame.totalNoMines++;
        }
        gGame.shownCount++;
        gGame.totalNoMines--;
        elShown.innerHTML = `Shown Cells: ${gGame.shownCount}`;
        console.log(gGame.totalNoMines);
        renderBoard(gBoard);
    }
    checkGameOver();
}

function cellMarked(event, elCell) {
    var i = +elCell.dataset.i;
    var j = +elCell.dataset.j;
    var elMarked = document.querySelector('.marked');

    if (gBoard[i][j].isShown && !gBoard[i][j].isMarked) return;

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

function checkGameOver() {
    if (gGame.totalNoMines === 0) {
        showMines(gBoard);
        gameOver(true);
    }
    if (gGame.livesCount === 0) {
        showMines(gBoard);
        gameOver(false);
    }
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

    initGame();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function renderTimer() {
    if (gTimer.seconds === 59) {
        gTimer.minutes++;
        gTimer.seconds = 0;
    } else {
        gTimer.seconds++;
    }

    var formattedSec = "0";
    if (gTimer.seconds < 10) {
        formattedSec += gTimer.seconds;
    } else {
        formattedSec = String(gTimer.seconds);
    }

    var formattedMin = "0";
    if (gTimer.minutes < 10) {
        formattedMin += gTimer.minutes;
    } else {
        formattedMin = String(gTimer.minutes);
    }

    var elTimer = document.querySelector('.timer span');
    elTimer.innerHTML = `${String(formattedMin)}:${formattedSec}`
    gTimeScore = String(formattedMin) + formattedSec
}

function clearTimer() {
    var elTimer = document.querySelector('.timer span');
    elTimer.innerHTML = '00:00';
    gTimer.seconds = 0;
    gTimer.minutes = 0;
    clearInterval(gGame.timerInterval);
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
    if (cell.isMarked) {
        return FLAG;
    }
    if (cell.isMine) {
        return MINE;
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
    clearInterval(gGame.timerInterval);
    // clearScores();
}

function getModal(showModal, isVictory) {

    if (showModal) {
        document.querySelector('.modal').style.visibility = "visible";
    } else {
        document.querySelector('.modal').style.visibility = "hidden";
    }

    if (isVictory && checkHighScore(gLevel.size, gTimeScore) === true) {
        document.querySelector('.game-over-txt').innerHTML = '<br/> You Won ! ! ! <br/> WITH A NEW RECORD!';
        renderSmiley(WIN);
    } else if (isVictory) {
        document.querySelector('.game-over-txt').innerHTML = '<br/> You Won ! ! !';
        renderSmiley(WIN);
    } else {
        document.querySelector('.game-over-txt').innerHTML = '<br/> Game Over';
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

function getEmptyNegsLocations(pos) {
    var locations = [];
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i >= gLevel.size || i < 0) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j >= gLevel.size || j < 0) continue;
            if (i === pos.i && j === pos.j) continue;
            var currCell = gBoard[i][j]
            if (currCell.minesAroundCount >= 0 && !currCell.isMine && !currCell.isShown && !currCell.isMarked) {
                locations.push({ i, j });
            }
        }
    }
    return locations;
}

function resetLives() {
    var elLive = document.querySelector('.lives-container');
    elLive.innerHTML = '';
    elLive.innerHTML += 'Lives: <span class="live1"><img src="./img/heart.png" alt="heart.png"></span><span class="live2"><img src="./img/heart.png" alt="heart.png"></span><span class="live3"><img src="./img/heart.png"alt="heart.png"/></span>';
}

function renderLives() {
    var elLive = document.querySelector(`.live${gGame.livesCount}`);
    elLive.remove();
    gGame.livesCount--;
}

function resetSmiley() {
    var elLive = document.querySelector('.smiley');
    elLive.innerHTML = START;
}

function renderSmiley(smiley) {
    var elLive = document.querySelector('.smiley');
    elLive.innerHTML = '';
    elLive.innerHTML += smiley;
}

function checkHighScore(level, score) {
    var currLevel = '';
    if (level === 4) {
        currLevel = 'beginner';
    } else if (level === 8) {
        currLevel = 'medium';
    } else {
        currLevel = 'expert';
    }
    var currHighScore = localStorage.getItem(currLevel);
    if (score < currHighScore) {
        localStorage.setItem(`${currLevel}`, score);
        renderHighScore(currLevel, score)
        return true;
    }
    return false;
}

function renderHighScore(level, score) {
    var elScore = document.querySelector(`.${level}-highscore span`);
    elScore.innerHTML = score.substring(0, 2) + ':' + score.substring(2, 4);
}

function resetSafeCells() {
    var elSafe = document.querySelector('.safeclick');
    elSafe.innerHTML = '';
    elSafe.innerHTML += `Safe Clicks: <span class="safe1" onclick="getSafeClick()"><img src="./img/safe.png" alt="safe.png"></span> <span class="safe2" onclick="getSafeClick()"><img src="./img/safe.png" alt="safe.png"></span> <span class="safe3" onclick="getSafeClick()"><img src="./img/safe.png"alt="safe.png"/></span> <div>Remaining Safe Clicks: <span>${gGame.safeCount}</span></div>`;
}

function getSafeClick() {
    if (!gGame.safeCount) return;
    var emptyLocations = getAllLocations();
    if (!emptyLocations.length) return;
    var rndCell = getRandomInt(0, emptyLocations.length - 1);
    var rndLocation = emptyLocations[rndCell];

    while (gBoard[rndLocation.i][rndLocation.j].isShown) {
        emptyLocations.splice(rndCell, 1);
        var rndCell = getRandomInteger(0, emptyLocations.length - 1);
        var rndLocation = emptyLocations[rndCell];
        if (!emptyLocations.length) return;
    }
    gBoard[rndLocation.i][rndLocation.j].isShown = true;
    renderSafeCells();
    // renderBoard(gBoard);

    setTimeout(function () {
        gBoard[rndLocation.i][rndLocation.j].isShown = false;
        renderBoard(gBoard);
    }, 1000)

}

function getAllLocations() {
    var locations = [];
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = { i: i, j: j };
            if (!gBoard[i][j].isMine) locations.push(currCell);
        }
    }
    return locations;
}

function renderSafeCells() {
    var elSafe = document.querySelector(`.safe${gGame.safeCount}`);
    elSafe.remove();
    var elSafeCount = document.querySelector('.safeclick div span');
    console.log(elSafeCount);
    gGame.safeCount--;
    elSafeCount.innerHTML = gGame.safeCount;
    renderBoard(gBoard);
}

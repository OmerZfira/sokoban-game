'use strict'

// TODO >>>> Animate the pieces to slide from cell to cell <<<<

// Sokoban
var gBoard;
// Keeps track of game counters
var gGamerPos = { i : 3, j: 4 };
var gScore;
var gStorages= []
// Constants of the game board
var SIZE = 8;


///////// *** Initializes The Game
function initGame() {
    gGamerPos = { i : 3, j: 4 };
    document.querySelector('.gameOver').innerText = '';
    gBoard = buildBoard(SIZE);
    renderBoard(gBoard, '.gameBoard');
    gScore = 30;
    document.querySelector('.gameScore').innerText = gScore;
} // *** End of initGame

///////// *** Builds The Model -> Board With Given Size (size*size)
/////////     Puts An Object In Every Cell Of The Model
function buildBoard(size) {
    // Gets an array of all the mines coords
    var boxesCoords = [{i: 2, j: 3}, {i: 5, j: 2}];
    var storageCoords = [{i: 2, j: 6}, {i: 4, j: 6}];
    // Build game board with objects
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            // Puts walls on edges
            if ((i === 0 || i === size - 1) ||
                (j === 0 || j === size - 1)) {
                board[i][j] = { type: 'wall' };
            // Puts boxes by coords
            } else if (boxesCoords.length > 0 && i === boxesCoords[0].i && j === boxesCoords[0].j) {
                board[i][j] = { type: 'piece', isBox: true };
                boxesCoords.shift();
            // Puts storages by coords
            } else if (storageCoords.length > 0 && i === storageCoords[0].i && j === storageCoords[0].j) {
                board[i][j] = { type: 'storage' , isStorageFilled: false};
                gStorages.push(board[i][j]);
                storageCoords.shift();
            // Puts gamer by coords
            } else if (i === gGamerPos.i && j === gGamerPos.j) {
                board[i][j] = { type: 'piece', isBox: false };
            // Puts empty cell (all object props are false)
            } else {
                board[i][j] = { type: 'floor' };                
            }
        }
    }

    return board;
} // *** End of buildBoard


///////// *** Renders The Board To DOM
function renderBoard(board, elSelector) {
    var strHtml = '';

    board.forEach(function (cells, i) {
        strHtml += '<tr>';
        cells.forEach(function (cell, j) {
            // Creates different id with Model-coords to each cell in DOM
            var tdId = 'cell-' + i + '-' +j;
            // Differernt HTML tags depending on object props
            switch (cell.type) {
                case ('wall'):
                case ('floor'):
                case ('storage'):
                    strHtml +=  '<td id="' + tdId + '" onclick="cellClicked(this)" ' +
                                'class="' + cell.type + '"><img></td>';
                    break;
                case ('piece'):
                    if (cell.isBox) {
                        strHtml +=  '<td id="' + tdId + '" onclick="cellClicked(this)" ' +
                                    'class="floor ' + cell.type + '"><img src="img/box.png" alt="box"></td>';
                        break;
                    } else {
                        strHtml +=  '<td id="' + tdId + '" onclick="cellClicked(this)" ' +
                                    'class="floor ' + cell.type + '"><img src="img/gamer.png" alt="gamer"></td>';
                        break;
                    }

            }
        });
        strHtml += '</tr>';
    });
    // Print into the HTML element
    var elMat = document.querySelector(elSelector);
    elMat.innerHTML = strHtml;
} // *** End of renderBoard

///////// *** Updates Model And DOM After Every Click On A Cell
function cellClicked(elCell) {
    if (gScore <= 0) return;

    // Get current cell coords by #id
    var cellId = getCellCoords(elCell.id);
    var cellI = cellId.i;
    var cellJ = cellId.j;
    var currModelCell = (gBoard[cellI][cellJ]);

    // Checks if the move is legal
    if (((cellI === gGamerPos.i - 1 && cellJ === gGamerPos.j) ||  // moveDirection is [-1, 0] up
        (cellI === gGamerPos.i && cellJ === gGamerPos.j - 1) ||  // moveDirection is [0, -1] left
        (cellI === gGamerPos.i && cellJ === gGamerPos.j + 1) ||  // moveDirection is [0, 1] right
        (cellI === gGamerPos.i + 1 && cellJ === gGamerPos.j)) &&  // moveDirection is [1, 0] down
        (currModelCell.type !== 'wall')) {
        
        //Calculate the indexes of the cell behind the cell that was clicked
        var moveDirection = [cellI - gGamerPos.i, cellJ - gGamerPos.j];
        var cellBehindI = cellI + moveDirection[0];
        var cellBehindJ = cellJ +   moveDirection[1];
        //Get A Pointer To The Cell Behind From The Model
        var cellBehind = gBoard[cellBehindI][cellBehindJ];
        if (currModelCell.type !== 'piece') {
            updateGamerPos(elCell, cellI, cellJ)
        } else if (cellBehind.type !== 'wall' && cellBehind.type !== 'piece') {

            updateGamerPos(elCell, cellI, cellJ);
            updateNextPiecePos(cellBehindI, cellBehindJ);
        }
        gScore--;
        document.querySelector('.gameScore').innerText = gScore;
        checkGameOver();
    }
        
} // *** End of cellClicked

///////// *** Gets A String Auch As:  'cell-2-7' And Returns {i:2, j:7}
function getCellCoords(strCellId) {
    var coords = {i: 0, j : 0};
    coords.i = +strCellId.substring(5,strCellId.lastIndexOf('-'));
    coords.j = +strCellId.substring(strCellId.lastIndexOf('-')+1);
    return coords;
} // *** End of getCellCoords

///////// *** 
function updateGamerPos(elTargetCell, targetCellI, targetCellJ) {
    var prevPosSelector = 'cell-' + gGamerPos.i + '-' + gGamerPos.j;
    var elPrevGamerPos = document.querySelector('#' + prevPosSelector);
    var prevGamerPosObj = gBoard[gGamerPos.i][gGamerPos.j];

    if (prevGamerPosObj.isStorageFilled !== undefined) {
        prevGamerPosObj.type = 'storage';
    } else prevGamerPosObj.type = 'floor';

    // Assign new pos
    gGamerPos = {i: targetCellI, j: targetCellJ};
    if (gBoard[gGamerPos.i][gGamerPos.j].isStorageFilled) gBoard[gGamerPos.i][gGamerPos.j].isStorageFilled = false;
    // gBoard[targetCellI][targetCellJ].type = >>>> TODO: Check this line <<<<
    elPrevGamerPos.classList.remove('piece');
    elPrevGamerPos.firstElementChild.removeAttribute('src');
    elPrevGamerPos.firstElementChild.removeAttribute('alt');
    // console.log('elPrevGamerPosId', elPrevGamerPosId);
    elTargetCell.classList.add('piece');
    elTargetCell.firstElementChild.src="img/gamer.png";
    elTargetCell.firstElementChild.alt="gamer";
    // console.log('gGamerPos', gGamerPos);
} // *** End of updateGamerPos

///////// *** TODO >>>> updates when entering storage
function updateNextPiecePos(targetCellI, targetCellJ) {
    var targetCell = gBoard[targetCellI][targetCellJ];
    if (targetCell.type = 'storage') {
        targetCell.isStorageFilled = true;
    } 
    targetCell.isBox = true;
    targetCell.type = 'piece';
    var cellBehindSelector = 'cell-' + targetCellI + '-' + targetCellJ;
    var elCellBehind = document.querySelector('#' + cellBehindSelector); 
    elCellBehind.classList.add('piece');
    elCellBehind.firstElementChild.src="img/box.png";
    elCellBehind.firstElementChild.alt="box";
    // console.log('gGamerPos', gGamerPos);
} // *** End of updateNextPiecePos


///////// *** Checks If The Game Is Over By Either 1 Of 2 Conditions
function checkGameOver() {
 // checks if all boxes are on storages
    var isWin = 
        gStorages.every(function(obj) {
                return (obj.isStorageFilled === true);
        });
    if (isWin) {
        document.querySelector('.gameOver').innerText = 'Congratulations! You Won';
        gScore = 0;
    // Checks if score is 0
    } else if (gScore === 0) {
        document.querySelector('.gameOver').innerText = 'Zoiks man! You have failed!';
    }
} // *** End of checkGameOver



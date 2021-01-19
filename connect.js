/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

//setting Default width and height
let WIDTH = 7;
let HEIGHT = 6;
let DROPSPEED = 150; //this is to help with the animation
let currPlayer = 1; // active player: 1 or 2
let gameOver = false; //changes to true when the game ends
const board = []; // array of rows, each row is array of cells  (board[y][x])

//function to play a piece

function handleClick(event) {
	//if the game has already ended, no more clicks
	if (gameOver) return;

	// get x from ID of clicked cell
	const x = +event.target.id;
	//the collumn top itself was clicked, return
	if (isNaN(x)) return;
	// get next spot in column (if none, ignore click)
	const y = findSpotForCol(x);
	if (y === null) {
		return;
	}
	// place piece in board and add to HTML table
	animatePiece(y, x);
	//update in-memory board
	board[y][x] = currPlayer;

	// check for win
	if (checkForWin()) {
		currPlayer === 1 ? endGame(`Red won!`, y + 2) : endGame(`Blue won!`, y + 2);
	}
	// if there is a tie
	if (checkForTie()) {
		endGame('Both Players Tied');
	}
	// need to switch players
	currPlayer === 1 ? (currPlayer = 2) : (currPlayer = 1);
	handleMouseOut(event);
	handleMouseIn(event);
}

//preview piece

function handleMouseIn(event) {
	//if the game has already ended, no more hovers
	if (gameOver) return;

	// get x from ID of clicked cell
	const activeColumn = event.target;
	//create a piece of the active color
	const piece = createPiece();
	//append it to the active column
	activeColumn.append(piece);
}

//removes the preview piece

function handleMouseOut(event) {
	event.target.innerHTML = '';
}

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 *    after running board should have HEIGHT arrays and each array should have WIDTH elements inside, all null
 */

function makeBoard() {
	//repeat this from 0 to HEIGHT
	repeat(HEIGHT, (y) => {
		//a row for each row
		board.push([]);
		//repeat this from 0 to WIDTH
		repeat(WIDTH, () => {
			//for each row, add a null for each collumn
			board[y].push(null);
		});
	});
}

/** makeHtmlBoard: make HTML table and row of column tops. */
function makeHtmlBoard() {
	//  get "htmlBoard" variable from the item in HTML w/ID of "board"
	const htmlBoard = document.getElementById('board');

	// creating the top row of the connect four board
	const top = document.createElement('tr');
	top.setAttribute('id', 'column-top');
	top.addEventListener('click', handleClick);
	top.addEventListener('mouseover', handleMouseIn);
	top.addEventListener('mouseout', handleMouseOut);

	//creating the individual td's in the top row of the board
	repeat(WIDTH, (x) => {
		const headCell = document.createElement('td');
		//Sets each id to the horizontal index it is in
		headCell.setAttribute('id', x);
		//appends it to the row in order
		top.append(headCell);
	});
	//appends the whole top row to the board
	htmlBoard.append(top);

	// creates the rest of the rows for the board
	repeat(HEIGHT, (y) => {
		// a row for each row
		const row = document.createElement('tr');
		repeat(WIDTH, (x) => {
			// and a cell for each column on that row
			const cell = document.createElement('td');
			// each cells id contains it's cordinates of format '3-2' meaning
			//    the fourth row from the top, and the third cell from the left
			cell.setAttribute('id', `${y}-${x}`);
			row.append(cell);
		});
		htmlBoard.append(row);
	});
}

// reset the game

function resetGame() {
	board.length = 0;
	gameOver = false;
	updateHeight();
	updateWidth();
	updateUserNote('');
	makeBoard();
	resetHTMLBoard();
}

// true reset on the HTML side

function resetHTMLBoard() {
	const htmlBoard = document.getElementById('board');
	htmlBoard.innerHTML = '';
	makeHtmlBoard();
}

//findSpotForCol: given column x, return top empty y (null if filled)
//if the cell is empty, that cells row number replaces the accumulator
//repeat until you hit the bottom and return the last good row

function findSpotForCol(x) {
	return board.reduce((accecptableRow, row, y) => {
		return row[x] == null ? y : accecptableRow;
	}, null);
}

//found a way to animate the drop! this was awesome! saw this from another user and had to add it

function animatePiece(y, x) {
	let i = 0; //counter variable
	const piece = createPiece(); //a piece of the currplayer color
	playBlip(); //play an initial blip

	//repeat every DROPSPEED
	const animation = setInterval(() => {
		playBlip();
		piece.remove();
		addToTable(piece, i, x); //add the piece to the DOM at the specified cell
		if (i === y) {
			//if this cell is the destination cell...
			clearInterval(animation); //stop the animation, we have arrived
			playCrash(); //play a crash to show we arrived
		}
		i++; //increment our descent
	}, DROPSPEED);
}

//create the piece itself

function createPiece() {
	const piece = document.createElement('div');
	//class based on whose turn it is
	piece.classList.add('piece', 'p' + currPlayer);
	return piece;
}

function placeInTable(y, x) {
	// make a div named piece
	const piece = createPiece();
	// insert into correct table cell
	document.getElementById(`${y}-${x}`).append(piece);
}

function addToTable(piece, y, x) {
	document.getElementById(`${y}-${x}`).append(piece);
}

// end game notification

function endGame(msg, wait = 2) {
	gameOver = true; //the game is now over
	setTimeout(() => {
		alert(msg); //alert the user of msg
	}, DROPSPEED * wait);
}

function checkForTie() {
	return board.every((row) => row.every((cell) => cell != null));
}

// checkForWin

function checkForWin() {
	function _win(cells) {
		// Check four cells to see if they're all color of current player
		//  - cells: list of four (y, x) cells
		//  - returns true if all are legal coordinates & all match currPlayer

		return cells.every(([ y, x ]) => y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH && board[y][x] === currPlayer);
	}

	// loop through every y coordinate from 0 to HEIGHT
	for (let y = 0; y < HEIGHT; y++) {
		// loop through every x coordinate from 0 to WIDTH
		for (let x = 0; x < WIDTH; x++) {
			// make a set of coordinates for every direction from the x and y coordinates you are on
			const horiz = [ [ y, x ], [ y, x + 1 ], [ y, x + 2 ], [ y, x + 3 ] ];
			const vert = [ [ y, x ], [ y + 1, x ], [ y + 2, x ], [ y + 3, x ] ];
			const diagR = [ [ y, x ], [ y + 1, x + 1 ], [ y + 2, x + 2 ], [ y + 3, x + 3 ] ];
			const diagL = [ [ y, x ], [ y + 1, x - 1 ], [ y + 2, x - 2 ], [ y + 3, x - 3 ] ];
			// check every pattern from the current coordinate pair for a win
			if (_win(horiz) || _win(vert) || _win(diagR) || _win(diagL)) {
				//if any of them are a win, return true
				return true;
			}
		}
	}
	return false;
}

//changing the size of the game, saw this on another user and thought this might help the game difficulty

function dimensionsChanged() {
	//if the game hasn't started the board will be updated immediately
	if (board.every((row) => row.every((cell) => cell == null))) {
		updateHeight();
		updateWidth();
		resetGame();
	} else {
		//this will appear under the selection table
		updateUserNote('Change in board will apply next game or restart');
	}
}

function updateUserNote(msg) {
	const userNote = document.getElementById('user-note'); //an HTML Element used to give notes to the user
	userNote.innerText = msg;
}

//updates the stored variable WIDTH
function updateWidth() {
	const widthInput = document.getElementById('width');
	WIDTH = +widthInput.value;
}

/** updates the stored variable HEIGHT with the user input height */
function updateHeight() {
	const heightInput = document.getElementById('height');
	HEIGHT = +heightInput.value;
}

//plays a sound, works with the animation
const playBlip = () => {
	const blip = new Audio('../Blip.mp3');
	blip.play();
};

const playCrash = () => {
	const crash = new Audio('../Slick.mp3');
	crash.play();
};

const playXylo = () => {
	const Xylo = new Audio('../Xylo.mp3');
	Xylo.play();
};

/**
 * repeats a function itertations times. Each time the function is run, it is passed the iteration it is on,
 *    and all the other params passed in to the repeat function
 *
 * @param {number} iterations how many times do you want the selected function repeated
 * @param { function } func the function to repeat
 * @param  {...any} rest other paramaters you want passed into the repeated function
 */
function repeat(iterations, func, ...rest) {
	for (let i = 0; i < iterations; i++) func(i, ...rest);
}

// make the board variable
makeBoard();
// make the board for the user
makeHtmlBoard();

// assign click event to restart button
document.getElementById('restart').addEventListener('click', resetGame);

//assign an onchange listener to the height and width select box
document.getElementById('height').addEventListener('change', dimensionsChanged);
document.getElementById('width').addEventListener('change', dimensionsChanged);

const FILES = new Array(8).fill(undefined).map((value, i) => String.fromCharCode('a'.charCodeAt(0) + i));
const RANKS = new Array(8).fill(undefined).map((_, index) => index + 1);

window.onload = () => {
	setupInitialPiecesPositions();
	addEventListenerOnSquares();
};

const setupInitialPiecesPositions = () => {
	const pawns = new Array(8)
		.fill('pawn');
	const borderPieces = [
		'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
	];
	insertIntoRank(8, borderPieces, 'black');
	insertIntoRank(7, pawns, 'black');
	insertIntoRank(2, pawns, 'white');
	insertIntoRank(1, borderPieces, 'white');
};

const insertIntoRank = (rank, pieces, player) => {
	FILES.forEach((file, i) => {
		const id = `${file}${rank}`;
		const piece = pieces[i];
		const pieceDomElement = document.createElement('div');
		pieceDomElement.setAttribute('class', `piece piece--${player} fas fa-chess-${piece}`);
		pieceDomElement.setAttribute('piece', piece);
		pieceDomElement.setAttribute('player', player);
		document.getElementById(id).appendChild(pieceDomElement);
	});
};

const addEventListenerOnSquares = () => {
	const squares = Array.from(document.getElementsByClassName('square'));
	squares.forEach(square => square.addEventListener('mousedown', event => handleMouseDownOnSquare(event)));
	squares.forEach(square => square.addEventListener('mouseup', event => handleMouseUpOnSquare(event)));
};

const handleMouseUpOnSquare = event => {
	// https://www.samanthaming.com/tidbits/19-2-ways-to-convert-to-boolean/
	const isSquareAvailableMove = event.target.attributes.highlighted
		&& !!event.target.attributes.highlighted.value;
	if (isSquareAvailableMove) {
		const selectedPiece = document.querySelector('[selected=true]');
		const clonePiece = selectedPiece.cloneNode(true);
		selectedPiece.parentNode.removeChild(selectedPiece);
		const elementToRemove = event.target.firstChild;
		if (elementToRemove) {
			const mapPiecesToScore = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };
			const removedPiece = elementToRemove.attributes.piece.value;
			const score = mapPiecesToScore[removedPiece];
			increaseActivePlayerScore(score);
			elementToRemove.parentNode.removeChild(elementToRemove);
		}
		const newPiece = setUpSpecialMoves(clonePiece, event.target.id, clonePiece.attributes.player.value);
		event.target.appendChild(newPiece);
		changeActivePlayer();
	}
	removeSelectedPiece();
	cleanHighlightedSquares();
};

const increaseActivePlayerScore = score => {
	// https://github.com/airbnb/css#javascript-hooks
	const players = Array.from(document.getElementsByClassName('js-player'))
		.filter(player => player.attributes['active-player'].value === 'true');
	const activePlayer = players[0];;
	const oldScore = Number.parseInt(activePlayer.textContent.split(' ')[2]);
	const newScore = oldScore + score;
	activePlayer.innerHTML = activePlayer.textContent
		.split(' ')
		.slice(0, 2)
		.concat(newScore)
		.join(' ');
}

const changeActivePlayer = () => {
	const players = Array.from(document.getElementsByClassName('js-player'))
		.sort((a, b) => a.attributes['active-player'].value === 'true' ? -1 : 1);
	players[0].setAttribute('active-player', false);
	players[1].setAttribute('active-player', true);
}

const removeSelectedPiece = () => {
	const selectedPiece = document.querySelector('[selected=true]');
	if (selectedPiece) {
		selectedPiece.setAttribute('selected', false);
	}
};

const cleanHighlightedSquares = () => {
	document
		.querySelectorAll('[highlighted]')
		.forEach(el => el.removeAttribute('highlighted'));
};

const handleMouseDownOnSquare = event => {
	event.preventDefault() // Impede que tabuleiro seja arrastado junto
	const coordinates = event.target.id;
	const piece = getPieceFromCoordinates(coordinates);
	if (!piece) {
		console.log(`Peça na coordenada ${coordinates.toUpperCase()}: vazio`);
		return;
	}
	event.target.firstChild.setAttribute('selected', true);
	const pieceColor = event.target.firstChild.attributes.player.value;
	console.log(`Peça na coordenada ${coordinates.toUpperCase()}: ${piece} ${pieceColor}`);
	if (!isPieceFromActivePlayer(pieceColor)) {
		return;
	}
	const hightlightAvailableMovesFn = getHighlightAvailableMovesFnBySelectedPiece(piece);
	const alreadyMoved = event.target.firstChild.attributes.alreadyMoved &&
		event.target.firstChild.attributes.alreadyMoved.value;
	hightlightAvailableMovesFn(pieceColor, coordinates, alreadyMoved);
};

const getPieceFromCoordinates = (coordinates, player) => {
	const domElement = document.getElementById(coordinates);
	if (domElement === null) {
		return null;
	}
	const childElement = domElement.firstChild;
	if (!childElement) {
		return null;
	}
	const piece = player === undefined ?
		childElement && childElement.attributes.piece.value :
		childElement && childElement.attributes.piece.value && childElement.attributes.player.value === value;
	return piece;
}

const isPieceFromActivePlayer = pieceColor => {
	const players = Array.from(document.getElementsByClassName('js-player'))
		.filter(player => player.attributes['active-player'].value === 'true');
	const activePlayer = players[0].innerHTML.split(' ')[1].charAt(0);
	return (activePlayer === '1' && pieceColor === 'white')
		|| (activePlayer === '2' && pieceColor === 'black');
}

const getHighlightAvailableMovesFnBySelectedPiece = (piece) => {
	const MapPiescesToAvailableMovesFn = {
		pawn: highlightPawnAvailableMoves,
		knight: highlightKnightAvailableMoves,
		bishop: highlightBishopAvailableMoves,
		rook: highlightRookAvailableMoves,
		queen: highlightQueenAvailableMoves,
		king: highlightKingAvailableMoves,
	};
	return MapPiescesToAvailableMovesFn[piece]
		|| (() => console.log('A peça selecionada não possui uma função de movimento implementada'));
};

const highlightPawnAvailableMoves = (player, coordinates, alreadyMoved) => {
	const [startFile, startRank] = coordinates.split('');
	let availableMovementMoves = [getMoveRankCoordinates(startRank, 1, player)];
	availableMovementMoves = availableMovementMoves
		.map(rank => `${startFile}${rank}`)
		.filter(coordinates => getPieceFromCoordinates(coordinates) === null);
	if (!alreadyMoved && availableMovementMoves.length > 0) {
		const extraMove = getMoveRankCoordinates(startRank, 2, player);
		const extraMoveCoordinates = `${startFile}${extraMove}`;
		if (getPieceFromCoordinates(extraMoveCoordinates) === null) {
			availableMovementMoves.push(extraMoveCoordinates);
		}
	}
	const availableAttackMoves = [
		getMoveFileCoordinates(startFile, 1, player),
		getMoveFileCoordinates(startFile, -1, player)
	]
		.map(file => `${file}${getMoveRankCoordinates(startRank, 1, player)}`)
		.filter(coordinates => getPieceFromCoordinates(coordinates) !== null)
		.filter(coordinates => getPlayerFromCoordinates(coordinates) !== player);
	availableMovementMoves.forEach(square => highlightSquare(square));
	availableAttackMoves.forEach(square => highlightSquare(square));
};

const highlightKnightAvailableMoves = (player, coordinates) => {
	const [startFile, startRank] = coordinates.split('');
	const availableMovementMoves = [
		`${getMoveFileCoordinates(startFile, -1, player)}${getMoveRankCoordinates(startRank, -2, player)}`,
		`${getMoveFileCoordinates(startFile, 1, player)}${getMoveRankCoordinates(startRank, 2, player)}`,
		`${getMoveFileCoordinates(startFile, 1, player)}${getMoveRankCoordinates(startRank, -2, player)}`,
		`${getMoveFileCoordinates(startFile, -1, player)}${getMoveRankCoordinates(startRank, 2, player)}`,
		`${getMoveFileCoordinates(startFile, -2, player)}${getMoveRankCoordinates(startRank, -1, player)}`,
		`${getMoveFileCoordinates(startFile, 2, player)}${getMoveRankCoordinates(startRank, 1, player)}`,
		`${getMoveFileCoordinates(startFile, 2, player)}${getMoveRankCoordinates(startRank, -1, player)}`,
		`${getMoveFileCoordinates(startFile, -2, player)}${getMoveRankCoordinates(startRank, 1, player)}`
	];
	availableMovementMoves
		.filter(coordinates => getPlayerFromCoordinates(coordinates) !== player)
		.forEach(coordinates => highlightSquare(coordinates));
};

const highlightBishopAvailableMoves = (player, coordinates) => {
	const [startFile, startRank] = coordinates.split('');
	const moves = [];
	const edgeCoordinates = [[1, 1],[1, -1],[-1, 1],[-1, -1]];

	edgeCoordinates.forEach(coordinates => {
		let multiplier = 1;
		let moveFile = getMoveFileCoordinates(startFile, coordinates[0] * multiplier, player);
		let moveRank = getMoveRankCoordinates(startRank, coordinates[1] * multiplier, player);
		while (moveFile && moveRank) {
			const coordenadas = `${moveFile}${moveRank}`;
			if (getPieceFromCoordinates(coordenadas)) {
				if (getPlayerFromCoordinates(coordenadas) === player) {
					return;
				}
				moves.push(coordenadas);
				return;
			}
			moves.push(coordenadas);
			multiplier += 1;
			moveFile = getMoveFileCoordinates(startFile, coordinates[0] * multiplier, player);
			moveRank = getMoveRankCoordinates(startRank, coordinates[1] * multiplier, player);			
		}
	});	

	moves
		.filter(coordinates => getPlayerFromCoordinates(coordinates) !== player)
		.forEach(coordinates => highlightSquare(coordinates));
};

const highlightRookAvailableMoves = (player, coordinates) => {
	const getSquaresToHighlight = (ranksOrFiles, operator) => {
		const [startFile, startRank] = coordinates.split('');
		const comparator = ranksOrFiles === 'ranks' ? startRank : startFile;
		const filterFn = operator === 'greaterThan'
			? square => comparator > square
			: square => comparator < square;
		const mapFn = ranksOrFiles === 'ranks'
			? rank => `${startFile}${rank}`
			: file => `${file}${startRank}`;
		const arr = ranksOrFiles === 'ranks' ? RANKS : FILES;
		const squares = arr.filter(filterFn).map(mapFn);
		let indexFoundPiece = squares.findIndex(square => getPieceFromCoordinates(square) !== null);
		if (indexFoundPiece === -1) {
			return squares;
		}
		foundPiece = squares[indexFoundPiece];
		if (operator === 'greaterThan') {
			const squaresThatHasPieces = squares
				.filter(coordinates => getPlayerFromCoordinates(coordinates) !== null);
			foundPiece = squaresThatHasPieces[squaresThatHasPieces.length-1];
			indexFoundPiece = squares.indexOf(foundPiece);
		}
		const greaterThanFilterIndexFn = operator === 'greaterThan'
			? (_, index) => index > indexFoundPiece
			: (_, index) => index < indexFoundPiece;
		const greaterThanEqualFilterIndexFn = operator === 'greaterThan'
			? (_, index) => index >= indexFoundPiece
			: (_, index) => index <= indexFoundPiece;
		const foundPiecePlayer = getPlayerFromCoordinates(foundPiece);
		const squaresToHighlight = foundPiecePlayer === player
			? squares.filter(greaterThanFilterIndexFn)
			: squares.filter(greaterThanEqualFilterIndexFn);
		return squaresToHighlight;
	}
	const squaresDown = getSquaresToHighlight('ranks', 'greaterThan');
	const squaresUp = getSquaresToHighlight('ranks', 'lessThan');
	const squaresLeft = getSquaresToHighlight('files', 'greaterThan');
	const squaresRight = getSquaresToHighlight('files', 'lessThan');
	const squares = [...squaresDown, ...squaresUp, ...squaresLeft, ...squaresRight];

	squares.forEach(quadrado => highlightSquare(quadrado));
};


const highlightQueenAvailableMoves = (player, coordinates) => {
	highlightRookAvailableMoves(player, coordinates);
	highlightBishopAvailableMoves(player, coordinates);
};

const highlightKingAvailableMoves = (player, coordinates) => {
	const [startFile, startRank] = coordinates.split('');
	const directions = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
	const moves = directions
		.map(direction => `${getMoveFileCoordinates(startFile, direction[0], player)}${getMoveRankCoordinates(startRank, direction[1], player)}`)
		.filter(coordinates => getPlayerFromCoordinates(coordinates) !== player);
	moves.forEach(move => highlightSquare(move));
}

const getMoveRankCoordinates = (startRank, numberOfSquares, player) => {
	const playerVariant = player === 'white' ? 1 : -1;
	const startRankNumber = typeof startRank === 'string' ?
		Number.parseInt(startRank) :
		startRank;
	return startRankNumber + numberOfSquares * playerVariant;
}

const getMoveFileCoordinates = (startFile, numberOfSquares, player) => {
	const playerVariant = player === 'white' ? 1 : -1;
	const startFileIndex = FILES.indexOf(startFile);
	const finalFileIndex = startFileIndex + numberOfSquares * playerVariant;
	return FILES[finalFileIndex];
}

const getPlayerFromCoordinates = coordinates => {
	const domElement = document.getElementById(coordinates);
	if (domElement === null) {
		return null;
	}
	const childElement = domElement.firstChild;
	const player = childElement && childElement.attributes.player.value;
	return player;
}

const highlightSquare = (coordinates) => {
	const element = document.getElementById(coordinates);
	if (element === null) {
		return;
	}
	element.setAttribute('highlighted', true);
};

const setUpSpecialMoves = (piece, coordinates, player) => {
	const newPiece = piece.cloneNode(true);
	if (newPiece.attributes.piece.value === 'pawn') {
		newPiece.setAttribute('alreadyMoved', true);
		// promotion
		const rank = coordinates[1];
		if ((player === 'white' && rank === '8') || (player === 'black' && rank === '1')) {
			newPiece.setAttribute('piece', 'rook');
			newPiece.classList.remove('fa-chess-pawn');
			newPiece.classList.add('fa-chess-rook');
		}
	}
	return newPiece;
}
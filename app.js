const FILES = new Array(8).fill(undefined).map((value, i) => String.fromCharCode('a'.charCodeAt(0) + i));
const RANKS = new Array(8).fill(undefined).map((_, index) => index + 1);

// TODO implementar movimentacao por vez do jogador
// TODO implementar pontuacao
// TODO implementar movimentos das outras pecas

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
	const isSquareAvailableMove = event.target.attributes.highlighted
		&& Boolean(event.target.attributes.highlighted.value);
	if (isSquareAvailableMove) {
		const selectedPiece = document.querySelector('[selected=true]');
		const clonePiece = selectedPiece.cloneNode(true);
		selectedPiece.parentNode.removeChild(selectedPiece);
		const elementToRemove = event.target.firstChild;
		if (elementToRemove) {
			const removedPiece = elementToRemove.attributes.piece.value;
			// TODO chamar funcao de pontuacao aqui, passando removedPiece como parametro
			elementToRemove.parentNode.removeChild(elementToRemove);
		}
		const newPiece = setUpSpecialMoves(clonePiece, event.target.id, clonePiece.attributes.player.value);
		event.target.appendChild(newPiece);
	}
	cleanHighlightedSquares();
};

const handleMouseDownOnSquare = event => {
	event.preventDefault() // Impede que tabuleiro seja arrastado junto
	removeSelectedPiece();
	cleanHighlightedSquares();
	const coordinates = event.target.id;
	const piece = getPieceFromCoordinates(coordinates);
	if (!piece) {
		console.log(`Peça na coordenada ${coordinates.toUpperCase()}: vazio`);
		return;
	}
	event.target.firstChild.setAttribute('selected', true);
	const player = event.target.firstChild.attributes.player.value;
	console.log(`Peça na coordenada ${coordinates.toUpperCase()}: ${piece} ${player}`);
	const hightlightAvailableMovesFn = getHighlightAvailableMovesFnBySelectedPiece(piece);
	const alreadyMoved = event.target.firstChild.attributes.alreadyMoved
		&& event.target.firstChild.attributes.alreadyMoved.value;
	hightlightAvailableMovesFn(player, coordinates, alreadyMoved);
};

const removeSelectedPiece = () => {
	const selectedPiece = document.querySelector('[selected=true]');
	if (selectedPiece) {
		selectedPiece.setAttribute('selected', false);
	}
};

const cleanHighlightedSquares = () => {
	document
		.querySelectorAll('[highlighted]')
		.forEach(el => el.setAttribute('highlighted', false));
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
	const piece = player === undefined
	? childElement && childElement.attributes.piece.value
	: childElement && childElement.attributes.piece.value && childElement.attributes.player.value === value;
	return piece;
}

const getHighlightAvailableMovesFnBySelectedPiece = (piece) => {
	const MapPiescesToAvailableMovesFn = {
		pawn: highlightPawnAvailableMoves,
		knight: highlightKnightAvailableMoves
	};
	return MapPiescesToAvailableMovesFn[piece] || (() => console.log('A peça selecionada não possui uma função de movimento implementada'));
};

const highlightKnightAvailableMoves = (player, coordinates) => {
	const [file, rank] = coordinates.split('');
	const newRank = Number.parseInt(rank) + 2;
	const newFileIndex = FILES.indexOf(file) - 1;
	const newFile = FILES[newFileIndex];
	highlightSquare(`${FILES[FILES.indexOf(file) - 1]}${Number.parseInt(rank) - 2}`);
	highlightSquare(`${FILES[FILES.indexOf(file) + 1]}${Number.parseInt(rank) + 2}`);
	highlightSquare(`${FILES[FILES.indexOf(file) + 1]}${Number.parseInt(rank) - 2}`);
	highlightSquare(`${FILES[FILES.indexOf(file) - 1]}${Number.parseInt(rank) + 2}`);
	highlightSquare(`${FILES[FILES.indexOf(file) - 2]}${Number.parseInt(rank) - 1}`);
	highlightSquare(`${FILES[FILES.indexOf(file) + 2]}${Number.parseInt(rank) + 1}`);
	highlightSquare(`${FILES[FILES.indexOf(file) + 2]}${Number.parseInt(rank) - 1}`);
	highlightSquare(`${FILES[FILES.indexOf(file) - 2]}${Number.parseInt(rank) + 1}`);

	// RANKS
	// 	.filter(rank => rank >= startRank)
	// 	.filter(rank => getPieceFromCoordinates(`${file}${rank}`) === null)
	// 	.forEach(rank => highlightSquare(`${file}${rank-2}`));
};

const highlightPawnAvailableMoves = (player, coordinates, alreadyMoved) => {
	const [startFile, startRank] = coordinates.split('');
	let availableMovementMoves = [getMoveRankCoodinates(startRank, 1, player)];
	if (!alreadyMoved) {
		availableMovementMoves.push(getMoveRankCoodinates(startRank, 2, player));
	}
	availableMovementMoves = availableMovementMoves
		.map(rank => `${startFile}${rank}`)
		.filter(coordinates => getPieceFromCoordinates(coordinates) === null);
	const availableAttackMoves = [getMoveFileCoordinates(startFile, 1, player), getMoveFileCoordinates(startFile, -1, player)] 
		.map(file => `${file}${getMoveRankCoodinates(startRank, 1, player)}`)
		.filter(coordinates => getPieceFromCoordinates(coordinates) !== null)
		.filter(coordinates => getPlayerFromCoordinates(coordinates) !== player);
	availableMovementMoves.forEach(square => highlightSquare(square));
	availableAttackMoves.forEach(square => highlightSquare(square));
};

const getMoveRankCoodinates = (startRank, numberOfSquares, player) => {
	const playerVariant = player === 'white' ? 1 : -1;
	const startRankNumber = typeof startRank === 'string'
		? Number.parseInt(startRank)
		: startRank;
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
	}
	// promotion
	const rank = coordinates[1];
	if (player === 'white' && rank === '8') {
		newPiece.setAttribute('piece', 'tower');
		newPiece.classList.remove('fa-chess-pawn');
		newPiece.classList.add('fa-chess-rook');
	}
	return newPiece;
}

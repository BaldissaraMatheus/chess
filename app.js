const FILES = new Array(8).fill(undefined).map((value, i) => String.fromCharCode('a'.charCodeAt(0) + i));
const RANKS = new Array(8).fill(undefined).map((_, index) => index + 1);

// TODO limpar highlightedMoves e selectedPiece no release do mouse
// TODO fazer toda a movimentacao do pawn
// TODO implementar movimentacao por vez do jogador
// TODO implementar movimentacao de ataque
// TODO implementar pontuacao
// TODO implementar movimentos das outras pecas
// TODO implementar jogadas especiais

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

const insertIntoRank = (rank, pieces, type) => {
	FILES.forEach((file, i) => {
		const id = `${file}${rank}`;
		const piece = pieces[i];
		const pieceDomElement = document.createElement('div');
		pieceDomElement.setAttribute('class', `piece piece--${type} fas fa-chess-${piece}`);
		pieceDomElement.setAttribute('piece', piece);
		pieceDomElement.setAttribute('player', type);
		document.getElementById(id).appendChild(pieceDomElement);
	});
};


const addEventListenerOnSquares = () => {
	const squares = Array.from(document.getElementsByClassName('square'));
	squares.forEach(square => square.addEventListener('click', event => handleClickOnSquare(event)));
};

/** 
 * @param { Event } event
 */
const handleClickOnSquare = event => {
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
	const hightlightAvailableMoves = getHighlightAvailableMovesFnBySelectedPiece(piece);
	hightlightAvailableMoves(player, coordinates);
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

const getPieceFromCoordinates = (coordinates) => {
	const domElement = document.getElementById(coordinates);
	const childElement = domElement.firstChild;
	const piece = childElement && childElement.attributes.piece.value;
	return piece;
}

const getHighlightAvailableMovesFnBySelectedPiece = (piece) => {
	const MapPiescesToAvailableMovesFn = {
		pawn: highlightPawnAvailableMoves,
	};
	return MapPiescesToAvailableMovesFn[piece] || (() => console.log('A peça selecionada não possui uma função de movimento implementada'));
};

const highlightPawnAvailableMoves = (player, coordinates) => {
	const [ file, startRank ] = coordinates.split('');
	RANKS
		.filter(rank => rank >= startRank)
		.filter(rank => getPieceFromCoordinates(`${file}${rank}`) === null)
		.forEach(rank => highlightSquare(`${file}${rank}`));
};

const highlightSquare = (coordinate) => {
	const element = document.getElementById(coordinate);
	const elementToInsert = element.cloneNode(true);
	elementToInsert.setAttribute('highlighted', true);
	element.parentNode.replaceChild(elementToInsert, element);
}; 

window.onload = () => {
	setupInitialPiecesPositions();
	addEventListenerOnSquares();
}

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
}

const insertIntoRank = (rank, pieces, type) => {
	const initialCharCode = 'a'.charCodeAt(0);
	const files = new Array(8)
		.fill(undefined)
		.map((value, i) => String.fromCharCode(initialCharCode + i));
	files.forEach((file, i) => {
		const id = `${file}${rank}`;
		const piece = pieces[i];
		const pieceDomElement = document.createElement('div');
		pieceDomElement.setAttribute('class', `piece piece--${type} fas fa-chess-${piece}`);
		pieceDomElement.setAttribute('id', piece);
		document.getElementById(id).appendChild(pieceDomElement);
	});
}

const addEventListenerOnSquares = () => {
	const squares = Array.from(document.getElementsByClassName('square'));
	squares.forEach(square => square.addEventListener('click', event => handleClickOnSquare(event)));
}

const handleClickOnSquare = event => {
	const squareId = event.target.id;
	const domElement = document.getElementById(squareId);
	const childElement = domElement.firstChild;
	const currentPiece = childElement && childElement.id;
	console.log(`Peça na coordenada ${squareId}: ${currentPiece}`);
}

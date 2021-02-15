window.onload = () => {
	setupInitialPiecesPositions();
	const squares = Array.from(document.getElementsByClassName('square'));
	squares.forEach(square => square.addEventListener('click', event => handleClickOnSquare(event)));
}

const setupInitialPiecesPositions = () => {
	const initialCharCode = 'a'.charCodeAt(0);
	const files = new Array(8)
		.fill(undefined)
		.map((value, i) => String.fromCharCode(initialCharCode + i));
	const setPieces = (rank, pieces, type) => {
		files.forEach((file, i) => {
			const id = `${file}${rank}`;
			const piece = pieces[i];
			const pieceDomElement = document.createElement('div');
			pieceDomElement.setAttribute('class', `piece piece--${type} fas fa-chess-${piece}`);
			pieceDomElement.setAttribute('id', piece);
			document.getElementById(id).appendChild(pieceDomElement);
		});
	}
	const pawns = new Array(8)
		.fill(undefined)
		.map(() => 'pawn');
	const borderPieces = [
		'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
	];
	setPieces(8, borderPieces, 'upper');
	setPieces(7, pawns, 'upper');
	setPieces(2, pawns, 'lower');
	setPieces(1, borderPieces, 'lower');
}

const handleClickOnSquare = event => {
	const squareId = event.target.id;
	if (squareId === undefined) {
		return;
	}
	const domElement = document.getElementById(squareId);
	const childElement = domElement.firstChild;
	const currentPiece = childElement && childElement.id;
	console.log(`Peça na coordenada ${squareId}: ${currentPiece}`);
}
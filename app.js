window.onload = () => {
	setupInitialPiecesPositions();
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


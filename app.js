const addKnight = () => {
	const id = 'a8';
	const piece = document
		.createElement('div');
	piece.setAttribute('class', `piece fas fa-chess-knight`);
	document.getElementById(id).appendChild(piece);
}


window.onload = () => {
	addKnight();
}


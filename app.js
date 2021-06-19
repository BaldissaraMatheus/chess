const FILES = new Array(8).fill(undefined).map((_, i) => String.fromCharCode('a'.charCodeAt(0) + i));
const RANKS = new Array(8).fill(undefined).map((_, index) => index + 1);

let observer = new MutationObserver(() => {});

window.onload = () => {
    setupInitialPiecesPositions();
    addEventListenerOnSquares();
    document.getElementById('start-ia-vs-ia').addEventListener('click', () => {
        executeAITurn('white');
        startAIvsAI();
    });
    const player2 = document.getElementById('player-2')

    // https://stackoverflow.com/a/41425087
    observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type == "attributes" && player2.attributes['active-player'].value === 'true') {
                setTimeout(() => executeAITurn('black'), 300);
            } else if (isAIvsAIEnabled()) {
                setTimeout(() => executeAITurn('white'), 300);
            }
        });
    });

    observer.observe(player2, {
        attributes: true
    });
};

const isAIvsAIEnabled = () => {
    return document.getElementById('start-ia-vs-ia').attributes.class 
    && document.getElementById('start-ia-vs-ia').attributes.class.value.split(' ').includes('text-decoration-line-trough');
}

const setupInitialPiecesPositions = () => {
    const pawns = new Array(8)
        .fill('pawn');
    const borderPieces = [
        'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
    ];
    insertIntoFile(8, borderPieces, 'black');
    insertIntoFile(7, pawns, 'black');
    insertIntoFile(2, pawns, 'white');
    insertIntoFile(1, borderPieces, 'white');
};

const insertIntoFile = (rank, pieces, player) => {
    FILES.forEach((file, i) => {
        const id = `${file}${rank}`;
        const piece = pieces[i];
        const pieceDomElement = buildPiece(piece, player);
        document.getElementById(id).appendChild(pieceDomElement);
    });
};

const buildPiece = (piece, player) => {
    const pieceDomElement = document.createElement('div');
    pieceDomElement.setAttribute('class', `piece piece--${player} fas fa-chess-${piece}`);
    pieceDomElement.setAttribute('piece', piece);
    pieceDomElement.setAttribute('player', player);
    return pieceDomElement;
}

const addEventListenerOnSquares = () => {
    const squares = Array.from(document.getElementsByClassName('square'));
    squares.forEach(square => square.addEventListener('mousedown', event => handleMouseDownOnSquare(event)));
    squares.forEach(square => square.addEventListener('mouseup', event => handleMouseUpOnSquare(event)));
};

const removeEventListenerOnSquares = () => {
    const squares = Array.from(document.getElementsByClassName('square'));
    squares.forEach(square => square.replaceWith(square.cloneNode(true)));
}

const handleMouseUpOnSquare = event => {
    // https://www.samanthaming.com/tidbits/19-2-ways-to-convert-to-boolean/
    const isSquareAvailableMove = event.target.attributes.highlighted &&
        !!event.target.attributes.highlighted.value;

    if (isSquareAvailableMove) {
        const selectedPiece = document.querySelector('[selected=true]');
        let clonePiece = selectedPiece.cloneNode(true);
        clonePiece.setAttribute('alreadyMoved', true);
        const initialCoordinates = selectedPiece.parentNode.id;
        clonePiece = setupEnPassant(clonePiece, clonePiece.attributes.player.value, event.target.id);
        selectedPiece.parentNode.removeChild(selectedPiece);
        const elementToRemove = event.target.firstChild;

        if (event.target.attributes.specialMove
            && event.target.attributes.specialMove.value
            && event.target.attributes.specialMove.value === 'enPassant'
        ) {
            enPassant(event.target.id, 'white');
        }

        if (elementToRemove) {
            const mapPiecesToScore = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };
            const elementToRemoveClone = elementToRemove.cloneNode(true);
            const removedPiece = elementToRemove.attributes.piece.value;
            const score = mapPiecesToScore[removedPiece];
            increaseActivePlayerScore(score);
            elementToRemove.parentNode.removeChild(elementToRemove);
            if (removedPiece === 'king') {
                if (isPieceFromActivePlayer(elementToRemoveClone.attributes.player.value) && !isAIvsAIEnabled()) {
                    castling(clonePiece, initialCoordinates, clonePiece.attributes.player.value);
                    cleanHighlightedSquares();
                } else {
                    event.target.appendChild(clonePiece);
                    finishGame();
                }
                return;
            }
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

const finishGame = () => {
    const players = Array.from(document.getElementsByClassName('js-player'))
        .sort((a, b) => a.attributes['active-player'].value === 'true' ? -1 : 1);
    const lostPlayer = players[1];
    const classes = lostPlayer.attributes.class.value;
    const classesWithLineTrough = [...classes.split(' '), 'text-decoration-line-trough'].join(' ');
    lostPlayer.setAttribute('class', classesWithLineTrough);
    removeSelectedPiece();
    cleanHighlightedSquares();
    removeEventListenerOnSquares();
    observer.disconnect();

    console.log(`${players[0].innerHTML.split(':')[0]} ganhou o jogo!`);
}

const changeActivePlayer = () => {
    const players = Array.from(document.getElementsByClassName('js-player'))
        .sort((a, b) => a.attributes['active-player'].value === 'true' ? -1 : 1);
    players[0].setAttribute('active-player', false);
    players[1].setAttribute('active-player', true);
    removeEnPassant(players[1].textContent.substr(0, 8).split(' ').join('-').toLowerCase());
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

const getPieceObjFromCoordinates = (coordinates) => {
    const domElement = document.getElementById(coordinates);
    if (domElement === null) {
        return null;
    }
    const childElement = domElement.firstChild;
    if (!childElement) {
        return null;
    }

    return childElement;
}

const isPieceFromActivePlayer = pieceColor => {
    const players = Array.from(document.getElementsByClassName('js-player'))
        .filter(player => player.attributes['active-player'].value === 'true');
    const activePlayer = players[0].innerHTML.split(' ')[1].charAt(0);
    return (activePlayer === '1' && pieceColor === 'white') ||
        (activePlayer === '2' && pieceColor === 'black');
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
    return MapPiescesToAvailableMovesFn[piece] ||
        (() => console.log('A peça selecionada não possui uma função de movimento implementada'));
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

    const enPassantMoves = [
            getMoveFileCoordinates(startFile, 1, player),
            getMoveFileCoordinates(startFile, -1, player),
        ]
        .map(file => `${file}${startRank}`)
        .filter(square => {
            const piece = getPieceObjFromCoordinates(square);
            return piece &&
                piece.attributes.canExecuteEnPassant &&
                piece.attributes.canExecuteEnPassant.value === 'true';
        })
        .map(square => `${square.split('')[0]}${Number.parseInt(square.split('')[1])+1}`);

    availableMovementMoves.forEach(square => highlightSquare(square));
    availableAttackMoves.forEach(square => highlightSquare(square));
    enPassantMoves.forEach(square => highlightSquare(square, 'enPassant'));
};

const highlightKnightAvailableMoves = (player, coordinates) => {
    const [startFile, startRank] = coordinates.split('');
        const directions = [-1, 1, 2, -2];
        const directionsCombination = directions
            .flatMap(direction => directions.map(value => [direction, value]))
            .filter(combination => !combination.every((value, i, arr) => Math.abs(value) === Math.abs(arr[0])));
    const availableMovementMoves = directionsCombination
        .map(combination => {
            return getMoveFileCoordinates(startFile, combination[0], player)
            + getMoveRankCoordinates(startRank, combination[1], player)
        });
    availableMovementMoves
        .filter(coordinates => getPlayerFromCoordinates(coordinates) !== player)
        .forEach(coordinates => highlightSquare(coordinates));
};

const highlightBishopAvailableMoves = (player, coordinates) => {
    const [startFile, startRank] = coordinates.split('');
    const moves = [];
    const edgeCoordinates = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
    ];

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

const highlightRookAvailableMoves = (player, coordinates, alreadyMoved) => {
    const getSquaresToHighlight = (ranksOrFiles, operator) => {
        const [startFile, startRank] = coordinates.split('');
        const comparator = ranksOrFiles === 'ranks' ? startRank : startFile;
        const filterFn = operator === 'greaterThan' ?
            square => comparator > square :
            square => comparator < square;
        const mapFn = ranksOrFiles === 'ranks' ?
            rank => `${startFile}${rank}` :
            file => `${file}${startRank}`;
        const arr = ranksOrFiles === 'ranks' ? RANKS : FILES;
        const squares = arr.filter(filterFn).map(mapFn);
        let indexFoundPiece = squares
            .findIndex(square => getPieceFromCoordinates(square) !== null);
        if (indexFoundPiece === -1) {
            return squares;
        }
        foundPiece = squares[indexFoundPiece];
        if (operator === 'greaterThan') {
            const squaresThatHasPieces = squares
                .filter(coordinates => getPlayerFromCoordinates(coordinates) !== null);
            foundPiece = squaresThatHasPieces[squaresThatHasPieces.length - 1];
            indexFoundPiece = squares.indexOf(foundPiece);
        }
        const greaterThanFilterIndexFn = operator === 'greaterThan' ?
            (_, index) => index > indexFoundPiece :
            (_, index) => index < indexFoundPiece;
        const greaterThanEqualFilterIndexFn = operator === 'greaterThan' ?
            (_, index) => index >= indexFoundPiece :
            (_, index) => index <= indexFoundPiece;
        const foundPiecePlayer = getPlayerFromCoordinates(foundPiece);
        const squaresToHighlight = foundPiecePlayer === player ?
            squares.filter(greaterThanFilterIndexFn) :
            squares.filter(greaterThanEqualFilterIndexFn);

        return squaresToHighlight;

    }
    const squaresDown = getSquaresToHighlight('ranks', 'greaterThan');
    const squaresUp = getSquaresToHighlight('ranks', 'lessThan');
    const squaresLeft = getSquaresToHighlight('files', 'greaterThan');
    const squaresRight = getSquaresToHighlight('files', 'lessThan');
    const squares = [...squaresDown, ...squaresUp, ...squaresLeft, ...squaresRight];
    
    const currentPiece = getPieceFromCoordinates(coordinates);

    // castling
    if (!alreadyMoved && player === 'white' && currentPiece === 'rook') {
        const piece = getPieceObjFromCoordinates('e1');
        if (piece !== null
            && !piece.attributes.alreadyMoved
            && piece.attributes.piece.value === 'king'
        ) {
            const piecesOnTheWay = [];
            const currentFile = coordinates.split('')[0];
            if (currentFile === 'a') {
                for (let i = 1; i < FILES.indexOf('e'); i++) {
                    const rank = getMoveFileCoordinates('a', i, 'white');
                    piecesOnTheWay.push(`${rank}1`);
                }
            } else {
                for (let i = 7; i > FILES.indexOf('e')+1; i--) {
                    const rank = getMoveFileCoordinates('h', (8 - i) * -1, 'white');
                    piecesOnTheWay.push(`${rank}1`);
                }
            }
            if (piecesOnTheWay.every(coordinates => getPieceFromCoordinates(coordinates) === null)) {
                squares.push('e1')
            }
        }
    }

    squares.forEach(square => highlightSquare(square));
};


const highlightQueenAvailableMoves = (player, coordinates) => {
    highlightRookAvailableMoves(player, coordinates);
    highlightBishopAvailableMoves(player, coordinates);
};

const highlightKingAvailableMoves = (player, coordinates) => {
        const [startFile, startRank] = coordinates.split('');
        const directions = [-1, 0, 1];
        const directionsCombination = directions
            .flatMap(direction => directions.map(value => [direction, value]))
            .filter(combination => combination.every(value => value === 0));
        const moves = directionsCombination
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

const highlightSquare = (coordinates, specialMove) => {
    const element = document.getElementById(coordinates);
    if (element === null) {
        return;
    }
    element.setAttribute('highlighted', true);
    if (specialMove) {
        element.setAttribute('specialMove', specialMove);
    }
};

const setUpSpecialMoves = (piece, coordinates, player) => {
    const newPiece = piece.cloneNode(true);
    // promotion
    if (newPiece.attributes.piece.value === 'pawn') {
        const rank = coordinates[1];
        if ((player === 'white' && rank === '8') || (player === 'black' && rank === '1')) {
            newPiece.setAttribute('piece', 'rook');
            newPiece.classList.remove('fa-chess-pawn');
            newPiece.classList.add('fa-chess-rook');
        }
    }
    return newPiece;
}

const castling = (piece, initialCoordinates, player) => {
    const newPiece = piece.cloneNode(true);
    if (newPiece.attributes.piece.value == 'rook' && player === 'white') {
        newPiece.setAttribute('castling', true);
        const king = buildPiece('king', 'white')

        if (initialCoordinates === 'a1') {
            document.getElementById('d1').appendChild(newPiece);
            document.getElementById('c1').appendChild(king);
        } else {
            document.getElementById('f1').appendChild(newPiece);
            document.getElementById('g1').appendChild(king);
        }

    }
}

const enPassant = (coordinates, player) => {
    const file = coordinates.split('')[1];
    const pieceFile = getMoveRankCoordinates(file, -1, player);
    const pieceCoordinate = `${coordinates.split('')[0]}${pieceFile}`;

    const square = document.getElementById(pieceCoordinate);
    const cloneSquare = square.cloneNode(false);
    square.parentNode.replaceChild(cloneSquare, square);
}

const setupEnPassant = (piece, player, coordinates) => {
    const file = coordinates.split('')[1];
    const newPiece = piece.cloneNode(true);
    const canExecuteEnPassant = !(piece.attributes.canExecuteEnPassant);
    if (
        newPiece.attributes.piece.value == 'pawn' &&
        player === 'black' &&
        newPiece.attributes.alreadyMoved &&
        newPiece.attributes.alreadyMoved.value === 'true' &&
        file === '5'
    ) {

        newPiece.setAttribute('canExecuteEnPassant', canExecuteEnPassant);
    }
    return newPiece;
}

const removeEnPassant = (player) => {
    if (player === 'player-1') {
        return;
    }
    const piecesToRemoveEnPassant = document.querySelectorAll(`[canExecuteEnPassant='true']`);
    const piecesToRemoveEnPassantArr = piecesToRemoveEnPassant ? Array.from(piecesToRemoveEnPassant) : [];
    piecesToRemoveEnPassantArr.forEach(piece => {
        const newPiece = piece.cloneNode(true);
        newPiece.setAttribute('canExecuteEnPassant', 'false');
        const parent = piece.parentNode;
        parent.removeChild(piece);
        parent.appendChild(newPiece);
    });
}

const executeAITurn = (player) => {
    const pieces = Array.from(document.querySelectorAll(`[player='${player}']`));
    const length = pieces.length;
    const randomIndex = Math.floor(Math.random() * length);
    const pieceElement = pieces[randomIndex];

    const hightlightAvailableMovesFn = getHighlightAvailableMovesFnBySelectedPiece(pieceElement.attributes.piece.value);
    hightlightAvailableMovesFn(player, pieceElement.parentElement.id, pieceElement.attributes.alreadyMoved && pieceElement.attributes.alreadyMoved.value);

    const highlightedSquares = Array.from(document.querySelectorAll("[highlighted = 'true']"));
    if (highlightedSquares.length === 0) {
        return executeAITurn(player);
    }
    const destSquare = highlightedSquares[highlightedSquares.length - 1];

    pieceElement.setAttribute('selected', true);
    handleMouseUpOnSquare({ target: destSquare });
}

const startAIvsAI = () => {
    document.getElementById('start-ia-vs-ia').setAttribute('class', 'text-decoration-line-trough');
}
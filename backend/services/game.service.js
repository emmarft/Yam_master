const TURN_DURATION = 40;

const DECK_INIT = {
    dices: [
        { id: 1, value: '', locked: true },
        { id: 2, value: '', locked: true },
        { id: 3, value: '', locked: true },
        { id: 4, value: '', locked: true },
        { id: 5, value: '', locked: true },
    ],
    rollsCounter: 1,
    rollsMaximum: 3
};

const CHOICES_INIT = {
    isDefi: false,
    isSec: false,
    idSelectedChoice: null,
    availableChoices: [],
};

const GRID_INIT = [
    [
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: 'Yam', id: 'yam', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
    ]
];

const ALL_COMBINATIONS = [
    { value: 'Brelan1', id: 'brelan1' },
    { value: 'Brelan2', id: 'brelan2' },
    { value: 'Brelan3', id: 'brelan3' },
    { value: 'Brelan4', id: 'brelan4' },
    { value: 'Brelan5', id: 'brelan5' },
    { value: 'Brelan6', id: 'brelan6' },
    { value: 'Full', id: 'full' },
    { value: 'Carré', id: 'carre' },
    { value: 'Yam', id: 'yam' },
    { value: 'Suite', id: 'suite' },
    { value: '≤8', id: 'moinshuit' },
    { value: 'Sec', id: 'sec' },
    { value: 'Défi', id: 'defi' }
];

const GAME_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: null,
        player1Score: 0,
        player2Score: 0,
        choices: {
        updateRemainingPions: (gameState, playerKey) => {
            if (gameState.remainingPions[playerKey] > 0) {
                gameState.remainingPions[playerKey]--;
                return true;
            }
            return false;
        },},
        deck: {}
    }
}

const GameService = {

    init: {
        gameState: () => {
            const game = { ...GAME_INIT };
            game['gameState']['timer'] = TURN_DURATION;
            game['gameState']['deck'] = { ...DECK_INIT };
            game['gameState']['choices'] = { ...CHOICES_INIT };
            game['gameState']['grid'] = [ ...GRID_INIT];

            game['gameState']['scores'] = { 'player:1': 0, 'player:2': 0 };
            game['gameState']['remainingPions'] = { 'player:1': 12, 'player:2': 12 };
            game['gameState']['winner'] = null;
            return game;
        },

        deck: () => {
            return { ...DECK_INIT };
        },

        choices: () => {
            return { ...CHOICES_INIT };
        },

        grid: () => {
            return [ ...GRID_INIT];
        }
    },

    send: {
        forPlayer: {
            viewGameState: (playerKey, game) => {
                const gameState = {
                    inQueue: false,
                    inGame: true,
                    idPlayer: game.player1Socket ? game.player1Socket.id : null
                };

                if (game.isVsBot) {
                    gameState.idOpponent = 'bot';
                } else {
                    gameState.idOpponent = game.player2Socket ? game.player2Socket.id : null;
                }

                return gameState;
            },

            viewQueueState: () => {
                return {
                    inQueue: true,
                    inGame: false,
                };
            },

            gameTimer: (playerKey, gameState) => {
                const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0;
                const opponentTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer;
                return { playerTimer: playerTimer, opponentTimer: opponentTimer };
            },

            deckViewState: (playerKey, gameState) => {
                const deckViewState = {
                    displayPlayerDeck: gameState.currentTurn === playerKey,
                    displayOpponentDeck: gameState.currentTurn !== playerKey,
                    displayRollButton: gameState.deck.rollsCounter <= gameState.deck.rollsMaximum,
                    rollsCounter: gameState.deck.rollsCounter,
                    rollsMaximum: gameState.deck.rollsMaximum,
                    dices: gameState.deck.dices
                };
                return deckViewState;
            },

            choicesViewState: (playerKey, gameState) => {

                const choicesViewState = {
                    displayChoices: true,
                    canMakeChoice: playerKey === gameState.currentTurn,
                    idSelectedChoice: gameState.choices.idSelectedChoice,
                    availableChoices: gameState.choices.availableChoices
                }

                return choicesViewState;
            },

            gridViewState: (playerKey, gameState) => {
                return {
                    displayGrid: true,
                    canSelectCells: (playerKey === gameState.currentTurn) && 
                                  (gameState.choices.availableChoices.length > 0) && 
                                  (gameState.remainingPions[playerKey] > 0),
                    grid: gameState.grid
                };
            },

            tokensState: (playerKey, gameState) => {
                return gameState.remainingPions;
            }
        }
    },

    timer: {  
        getTurnDuration: () => {
            return TURN_DURATION;
        }
    },

    dices: {
        roll: (dicesToRoll) => {
            const rolledDices = dicesToRoll.map(dice => {
                if (dice.value === "") {
                    const newValue = String(Math.floor(Math.random() * 6) + 1); 
                    return {
                        id: dice.id,
                        value: newValue,
                        locked: false
                    };
                } else if (!dice.locked) {
                    const newValue = String(Math.floor(Math.random() * 6) + 1);
                    return {
                        ...dice,
                        value: newValue
                    };
                } else {
                    return dice;
                }
            });
            return rolledDices;
        },

        lockEveryDice: (dicesToLock) => {
            const lockedDices = dicesToLock.map(dice => ({
                ...dice,
                locked: true 
            }));
            return lockedDices;
        }
    },

    choices: {
        updateRemainingPions: (gameState, playerKey) => {
            if (gameState.remainingPions[playerKey] > 0) {
                gameState.remainingPions[playerKey]--;
                return true;
            }
            return false;
        },
        findCombinations: (dices, isDefi, isSec) => {
            const availableCombinations = [];
            const allCombinations = ALL_COMBINATIONS;

            const counts = Array(7).fill(0); 
            let hasPair = false; 
            let threeOfAKindValue = null; 
            let hasThreeOfAKind = false; 
            let hasFourOfAKind = false; 
            let hasFiveOfAKind = false; 
            let hasStraight = false; 
            let sum = 0;

            for (let i = 0; i < dices.length; i++) {
                const diceValue = parseInt(dices[i].value);
                counts[diceValue]++;
                sum += diceValue;
            }

            // Vérifier les combinaisons possibles
            for (let i = 1; i <= 6; i++) {
                if (counts[i] === 2) {
                    hasPair = true;
                } else if (counts[i] === 3) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                } else if (counts[i] === 4) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                } else if (counts[i] === 5) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                    hasFiveOfAKind = true;
                }
            }

            const sortedValues = dices.map(dice => parseInt(dice.value)).sort((a, b) => a - b); // Trie les valeurs de dé

            hasStraight = sortedValues.every((value, index) => index === 0 || value === sortedValues[index - 1] + 1);

            const isLessThanEqual8 = sum <= 8;

            allCombinations.forEach(combination => {
                if (
                    (combination.id.includes('brelan') && hasThreeOfAKind && parseInt(combination.id.slice(-1)) === threeOfAKindValue) ||
                    (combination.id === 'full' && hasPair && hasThreeOfAKind) ||
                    (combination.id === 'carre' && hasFourOfAKind) ||
                    (combination.id === 'yam' && hasFiveOfAKind) ||
                    (combination.id === 'suite' && hasStraight) ||
                    (combination.id === 'moinshuit' && isLessThanEqual8) ||
                    (combination.id === 'defi' && isDefi)
                ) {
                    availableCombinations.push(combination);
                }
            });


            const notOnlyBrelan = availableCombinations.some(combination => !combination.id.includes('brelan'));

            if (isSec && availableCombinations.length > 0 && notOnlyBrelan) {
                availableCombinations.push(allCombinations.find(combination => combination.id === 'sec'));
            }

            return availableCombinations;
        }
    },

    grid: {
        emitTokensUpdate: (io, game) => {
            io.to(game.player1Socket.id).emit('game.tokens.update', game.gameState.remainingPions);
            io.to(game.player2Socket.id).emit('game.tokens.update', game.gameState.remainingPions);
        },

        resetcanBeCheckedCells: (grid) => {
            const updatedGrid = grid.map(row => row.map(cell => {
                return { ...cell, canBeChecked: false };    
            }));
            return updatedGrid;
        },

        updateGridAfterSelectingChoice: (idSelectedChoice, grid) => {

            const updatedGrid = grid.map(row => row.map(cell => {
                if (cell.id === idSelectedChoice && cell.owner === null) {
                    return { ...cell, canBeChecked: true };
                } else {
                    return cell;
                }
            }));

            return updatedGrid;
        },

        selectCell: (idCell, rowIndex, cellIndex, currentTurn, grid) => {
            const updatedGrid = grid.map((row, rowIndexParsing) => row.map((cell, cellIndexParsing) => {
                if ((cell.id === idCell) && (rowIndexParsing === rowIndex) && (cellIndexParsing === cellIndex)) {
                    return { ...cell, owner: currentTurn };
                } else {
                    return cell;
                }
            }));
        
            return updatedGrid;
        },

        
        updateScore: (idCell, rowIndex, cellIndex, currentTurn, gameState) => {
            const newGrid = GameService.grid.selectCell(idCell, rowIndex, cellIndex, currentTurn, gameState.grid);

            const alignmentCount = GameService.grid.countAlignment(newGrid, rowIndex, cellIndex, currentTurn);

            if (alignmentCount >= 3) {
                if (alignmentCount === 3) {
                    gameState.scores[currentTurn] += 1;
                } else if (alignmentCount === 4) {
                    gameState.scores[currentTurn] += 2;
                }
            }

            gameState.grid = newGrid;

            gameState.remainingPions[currentTurn]--;

            let gameOver = false;
            let winner = null;
            let winReason = null;

            if (alignmentCount === 5) {
                gameOver = true;
                winner = currentTurn;
                winReason = 'alignment';
            }
            
            if (!gameOver && (gameState.remainingPions['player:1'] <= 0 || gameState.remainingPions['player:2'] <= 0)) {
                gameOver = true;
                if (gameState.scores['player:1'] > gameState.scores['player:2']) {
                    winner = 'player:1';
                } else if (gameState.scores['player:1'] < gameState.scores['player:2']) {
                    winner = 'player:2';
                } else {
                    winner = 'draw';
                }
                winReason = 'no_tokens';
            }

            if (gameOver) {
                gameState.winner = winner;
                return {
                    gameOver: true,
                    winner: winner,
                    winReason: winReason,
                    scores: gameState.scores
                };
            }

            return {
                gameOver: false,
                scores: gameState.scores
            };
        },

        isAnyCombinationAvailableOnGridForPlayer: (gameState) => {
            const currentTurn = gameState.currentTurn;
            const grid = gameState.grid;
            const availableChoices = gameState.choices.availableChoices;
        
            for (let row of grid) {
                for (let cell of row) {
                    if (cell.owner === null) {
                        for(let combination of availableChoices){
                            if (cell.id === combination.id) {
                                return true;
                            }
                        }                        
                    }
                }
            }
        
            return false;  
        },

        countAlignment(grid, rowIndex, cellIndex, player) {
            const directions = [
                { dr: 0, dc: 1 },
                { dr: 1, dc: 0 },
                { dr: 1, dc: 1 },
                { dr: 1, dc: -1 }
            ];

            const inBounds = (r, c) => r >= 0 && r < grid.length && c >= 0 && c < grid[0].length;

            let maxAlignment = 1; // minimum : la case jouée elle-même

            for (const { dr, dc } of directions) {
                let count = 1;

                // Vers la direction positive
                let r = rowIndex + dr;
                let c = cellIndex + dc;
                while (inBounds(r, c) && grid[r][c].owner === player) {
                count++;
                r += dr;
                c += dc;
                }

                // Vers la direction négative
                r = rowIndex - dr;
                c = cellIndex - dc;
                while (inBounds(r, c) && grid[r][c].owner === player) {
                count++;
                r -= dr;
                c -= dc;
                }

                if (count > maxAlignment) maxAlignment = count;
            }

            return maxAlignment;
            }

    },

    utils: {
        findGameIndexById: (games, idGame) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].idGame === idGame) {
                    return i; 
                }
            }
            return -1;
        },

        findGameIndexBySocketId: (games, socketId) => {
            for (let i = 0; i < games.length; i++) {
                const game = games[i];
                if (!game || !game.player1Socket) continue;
                
                if (game.player1Socket.id === socketId || 
                    (game.player2Socket && game.player2Socket.id === socketId) || 
                    (game.isVsBot && game.player1Socket.id === socketId)) {
                    return i;
                }
            }
            return -1;
        },

        findDiceIndexByDiceId: (dices, idDice) => {
            for (let i = 0; i < dices.length; i++) {
                if (dices[i].id === idDice) {
                    return i; 
                }
            }
            return -1;
        }
    }
}

module.exports = GameService;
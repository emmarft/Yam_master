const GameService = require('./game.service');

const BotService = {
    init: {
        botState: () => ({
            isThinking: false,
            lastAction: null,
            selectedDices: [],
        })
    },

    decision: {
        chooseDicesToKeep: (dices) => {
            const counts = {};
            dices.forEach(dice => {
                if (!dice.isLocked) {
                    counts[dice.value] = (counts[dice.value] || 0) + 1;
                }
            });

            const maxCount = Math.max(...Object.values(counts));
            if (maxCount >= 2) {
                const valueToKeep = Object.keys(counts).find(key => counts[key] === maxCount);
                return dices.map(dice => ({
                    ...dice,
                    shouldLock: dice.value === parseInt(valueToKeep)
                }));
            }
            return dices.map(dice => ({ ...dice, shouldLock: false }));
        },

        chooseBestCombination: (availableChoices, grid) => {
            const priorities = ['yam', 'carre', 'full', 'brelan', 'suite', 'moinshuit'];
            
            for (const priority of priorities) {
                const choice = availableChoices.find(c => c.id.toLowerCase().includes(priority));
                if (choice) return choice;
            }
            
            return availableChoices[0];
        },

        chooseBestCell: (grid, availableCells) => {
            return availableCells[0];
        }
    },

    action: {
        simulateThinking: async () => {
            const thinkingTime = Math.random() * 1000 + 500;
            return new Promise(resolve => setTimeout(resolve, thinkingTime));
        },

        async playTurn(gameState) {
            await BotService.action.simulateThinking();

            gameState.deck.dices = gameState.deck.dices.map(dice => ({ ...dice, locked: false }));

            while (gameState.deck.rollsCounter <= gameState.deck.rollsMaximum) {
                gameState.deck.dices = GameService.dices.roll(gameState.deck.dices);

                const combinations = GameService.choices.findCombinations(
                    gameState.deck.dices,
                    false,
                    gameState.deck.rollsCounter === 1
                );

                if (combinations.some(c => ['yam', 'carre', 'full'].includes(c.id))) {
                    break;
                }

                if (gameState.deck.rollsCounter < gameState.deck.rollsMaximum) {
                    const dicesToKeep = BotService.decision.chooseDicesToKeep(gameState.deck.dices);
                    gameState.deck.dices = dicesToKeep.map((dice, index) => ({
                        ...gameState.deck.dices[index],
                        locked: dice.shouldLock
                    }));
                }

                gameState.deck.rollsCounter++;
                await BotService.action.simulateThinking();
            }

            gameState.deck.dices = GameService.dices.lockEveryDice(gameState.deck.dices);

            const finalCombinations = GameService.choices.findCombinations(
                gameState.deck.dices,
                false,
                gameState.deck.rollsCounter === 1
            );

            if (finalCombinations.length > 0) {
                const bestCombination = BotService.decision.chooseBestCombination(finalCombinations, gameState.grid);
                gameState.choices.availableChoices = finalCombinations;
                gameState.choices.idSelectedChoice = bestCombination.id;

                gameState.grid = GameService.grid.updateGridAfterSelectingChoice(
                    bestCombination.id,
                    gameState.grid
                );

                let availableCells = [];
                gameState.grid.forEach((row, rowIndex) => {
                    row.forEach((cell, cellIndex) => {
                        if (cell.canBeChecked) {
                            availableCells.push({ ...cell, rowIndex, cellIndex });
                        }
                    });
                });

                if (availableCells.length > 0) {
                    const bestCell = availableCells[0];
                    gameState.grid = GameService.grid.selectCell(
                        bestCell.id,
                        bestCell.rowIndex,
                        bestCell.cellIndex,
                        'player:2',
                        gameState.grid
                    );

                    const result = GameService.grid.updateScore(
                        bestCell.id,
                        bestCell.rowIndex,
                        bestCell.cellIndex,
                        'player:2',
                        gameState
                    );

                    if (result.gameOver) {
                        gameState.winner = result.winner;
                        gameState.scores = result.scores;
                    }
                }
            }
            return gameState;
        }
    }
};

module.exports = BotService;
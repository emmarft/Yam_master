const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var uniqid = require('uniqid');
const GameService = require('./services/game.service');
const BotService = require('./services/bot.service');

console.log('Serveur démarré avec support du mode VS Bot');

let games = [];
let queue = [];

const updateClientsViewTimers = (game) => {
  game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
  game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
};

const updateClientsViewDecks = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
    game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
  }, 200);
};

const updateClientsViewChoices = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
    game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
  }, 200);
}

const updateClientsViewGrid = (game) => {
  setTimeout(() => {
    if (game.isVsBot) {
      game.player1Socket.emit('game.grid.view-state', {
        ...GameService.send.forPlayer.gridViewState('player:1', game.gameState),
        player1Score: game.gameState.player1Score,
        player2Score: game.gameState.player2Score,
      });
      return;
    }
    game.player1Socket.emit('game.grid.view-state', {
      ...GameService.send.forPlayer.gridViewState('player:1', game.gameState),
      player1Score: game.gameState.player1Score,
      player2Score: game.gameState.player2Score,
    });
    game.player2Socket.emit('game.grid.view-state', {
      ...GameService.send.forPlayer.gridViewState('player:2', game.gameState),
      player1Score: game.gameState.player1Score,
      player2Score: game.gameState.player2Score,
    });
  }, 200);
}

const createGame = (player1Socket, player2Socket) => {

  const newGame = GameService.init.gameState();
  newGame['idGame'] = uniqid();
  newGame['player1Socket'] = player1Socket;
  newGame['player2Socket'] = player2Socket;

  games.push(newGame);

  const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

  games[gameIndex].player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', games[gameIndex]));
  games[gameIndex].player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', games[gameIndex]));

  updateClientsViewTimers(games[gameIndex]);
  updateClientsViewDecks(games[gameIndex]);
  updateClientsViewGrid(games[gameIndex]);

  const gameInterval = setInterval(() => {

    games[gameIndex].gameState.timer--;

    updateClientsViewTimers(games[gameIndex]);

    if (games[gameIndex].gameState.timer === 0) {

      games[gameIndex].gameState.currentTurn = games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';

      games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();

      games[gameIndex].gameState.deck = GameService.init.deck();
      games[gameIndex].gameState.choices = GameService.init.choices();
      games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);

      updateClientsViewTimers(games[gameIndex]);
      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
      updateClientsViewGrid(games[gameIndex]);
    }

  }, 1000);

  player1Socket.on('disconnect', () => {
    clearInterval(gameInterval);
  });

  player2Socket.on('disconnect', () => {
    clearInterval(gameInterval);
  });

};

const newPlayerInQueue = (socket) => {

  queue.push(socket);

  if (queue.length >= 2) {
    const player1Socket = queue.shift();
    const player2Socket = queue.shift();
    createGame(player1Socket, player2Socket);
  }
  else {
    socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
  }
};

io.on('connection', socket => {

  console.log(`[${socket.id}] socket connected`);

  socket.on('queue.join', () => {
    console.log(`[${socket.id}] new player in queue `)
    newPlayerInQueue(socket);
  });

  socket.on('game.dices.roll', () => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);

    if (games[gameIndex].gameState.deck.rollsCounter < games[gameIndex].gameState.deck.rollsMaximum) {

      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;

      const dices = games[gameIndex].gameState.deck.dices;
      const isDefi = false;
      const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;

      const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
      games[gameIndex].gameState.choices.availableChoices = combinations;

      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);

    } else {

      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;
      games[gameIndex].gameState.deck.dices = GameService.dices.lockEveryDice(games[gameIndex].gameState.deck.dices);

      const dices = games[gameIndex].gameState.deck.dices;
      const isDefi = Math.random() < 0.15;
      const isSec = false;

      const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
      games[gameIndex].gameState.choices.availableChoices = combinations;

      const isAnyCombinationAvailableOnGridForPlayer = GameService.grid.isAnyCombinationAvailableOnGridForPlayer(games[gameIndex].gameState);
      if (
        combinations.length === 0 ||
        (combinations.length > 0 && !isAnyCombinationAvailableOnGridForPlayer)
      ) {
        games[gameIndex].gameState.timer = 5;

        games[gameIndex].player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', games[gameIndex].gameState));
        games[gameIndex].player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', games[gameIndex].gameState));
      }

      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
    }
  });

  socket.on('game.dices.lock', (idDice) => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    const indexDice = GameService.utils.findDiceIndexByDiceId(games[gameIndex].gameState.deck.dices, idDice);

    games[gameIndex].gameState.deck.dices[indexDice].locked = !games[gameIndex].gameState.deck.dices[indexDice].locked;

    updateClientsViewDecks(games[gameIndex]);
  });

  socket.on('game.choices.selected', (data) => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    games[gameIndex].gameState.choices.idSelectedChoice = data.choiceId;

    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.grid = GameService.grid.updateGridAfterSelectingChoice(data.choiceId, games[gameIndex].gameState.grid);

    updateClientsViewChoices(games[gameIndex]);
    updateClientsViewGrid(games[gameIndex]);
  });

  socket.on('game.grid.selected', (data) => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    const currentTurn = games[gameIndex].gameState.currentTurn;

    if ((currentTurn === 'player:1' && games[gameIndex].gameState.player1Tokens <= 0) ||
        (currentTurn === 'player:2' && games[gameIndex].gameState.player2Tokens <= 0)) {
        return;
    }

    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.grid = GameService.grid.selectCell(
        data.cellId, 
        data.rowIndex, 
        data.cellIndex, 
        currentTurn, 
        games[gameIndex].gameState.grid,
        games[gameIndex].gameState
    );

    if (currentTurn === 'player:1') {
        games[gameIndex].gameState.player1Tokens--;
    } else {
        games[gameIndex].gameState.player2Tokens--;
    }

    const scores = GameService.grid.calculateScores(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.player1Score = scores.player1Score;
    games[gameIndex].gameState.player2Score = scores.player2Score;

    const isGameOver = scores.gameOver || 
                      games[gameIndex].gameState.player1Tokens === 0 || 
                      games[gameIndex].gameState.player2Tokens === 0;

    if (isGameOver) {
        const winner = determineWinner(games[gameIndex].gameState);
        const gameOverData = {
            winner,
            scores: {
                player1: games[gameIndex].gameState.player1Score,
                player2: games[gameIndex].gameState.player2Score
            },
            tokensLeft: {
                player1: games[gameIndex].gameState.player1Tokens,
                player2: games[gameIndex].gameState.player2Tokens
            }
        };

        games[gameIndex].player1Socket.emit('game.over', gameOverData);
        games[gameIndex].player2Socket.emit('game.over', gameOverData);
        return;
    }

    games[gameIndex].gameState.currentTurn = games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
    games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();
    games[gameIndex].gameState.deck = GameService.init.deck();
    games[gameIndex].gameState.choices = GameService.init.choices();

    updateClientsViewDecks(games[gameIndex]);
    updateClientsViewChoices(games[gameIndex]);
    updateClientsViewGrid(games[gameIndex]);
    updateClientsViewTimers(games[gameIndex]);
  });

  socket.on('disconnect', reason => {
    console.log(`[${socket.id}] socket disconnected - ${reason}`);
  });

  socket.on('game.vs-bot.start', () => {
    console.log(`[${socket.id}] Démarrage d'une partie contre le bot`);
    createGameVsBot(socket);
  });
});

const determineWinner = (gameState) => {
    if (gameState.player1Score === gameState.player2Score) return "draw";
    return gameState.player1Score > gameState.player2Score ? "player:1" : "player:2";
};

app.get('/', (req, res) => res.sendFile('index.html'));

http.listen(3000, function () {
  console.log('listening on *:3000');
});

const createGameVsBot = (playerSocket) => {
    console.log('[BOT] Création d\'une partie contre le bot');
    
    const newGame = GameService.init.gameState();
    newGame['idGame'] = uniqid();
    newGame['player1Socket'] = playerSocket;
    newGame['isVsBot'] = true;
    newGame['player2Socket'] = null;
    
    games.push(newGame);
    const gameIndex = games.length - 1;

    playerSocket.emit('game.start', { inGame: true });

    playerSocket.emit('game.grid.view-state', {
        ...GameService.send.forPlayer.gridViewState('player:1', games[gameIndex].gameState),
        player1Score: 0,
        player2Score: 0
    });

    const gameInterval = setInterval(async () => {
        if (!games[gameIndex]) {
            clearInterval(gameInterval);
            return;
        }

        games[gameIndex].gameState.timer--;

        playerSocket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', games[gameIndex].gameState));

        if (games[gameIndex].gameState.timer === 0) {
            games[gameIndex].gameState.currentTurn = 
                games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
            games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();

            if (games[gameIndex].gameState.currentTurn === 'player:2') {
                console.log('[BOT] Tour du bot');
                games[gameIndex].gameState = await BotService.action.playTurn(games[gameIndex].gameState);
                
                playerSocket.emit('game.grid.view-state', {
                    ...GameService.send.forPlayer.gridViewState('player:1', games[gameIndex].gameState),
                    player1Score: games[gameIndex].gameState.player1Score,
                    player2Score: games[gameIndex].gameState.player2Score
                });
            }
        }
    }, 1000);

    playerSocket.on('disconnect', () => {
        clearInterval(gameInterval);
        const idx = games.findIndex(g => g.idGame === newGame.idGame);
        if (idx !== -1) games.splice(idx, 1);
    });
};

// app/components/board/board.component.js

import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import PlayerTimer from './timers/player-timer.component'
import OpponentTimer from './timers/opponent-timer.component'
import PlayerDeck from "./decks/player-deck.component";
import OpponentDeck from "./decks/opponent-deck.component";
import Choices from "./choices/choices.component";
import Grid from "./grid/grid.component";

const OpponentInfos = () => {
  return (
    <View style={styles.opponentInfosContainer}>
      <Text>Opponent infos</Text>
    </View>
  );
};

const OpponentScore = ({ score }) => {
  return (
    <View style={styles.opponentScoreContainer}>
      <Text>Score: {score}</Text>
    </View>
  );
};

const PlayerInfos = () => {
  return (
    <View style={styles.playerInfosContainer}>
      <Text>Player Infos</Text>
    </View>
  );
};

const PlayerScore = ({ score }) => {
  return (
    <View style={styles.playerScoreContainer}>
      <Text>Score: {score}</Text>
    </View>
  );
};

const Board = ({ gameViewState }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.row, { height: '5%' }]}>
        <OpponentInfos />
        <View style={styles.opponentTimerScoreContainer}>
          <OpponentTimer />
          <OpponentScore score={gameViewState.player2Score} />
        </View>
      </View>
      <View style={[styles.row, { height: '25%' }]}>
        <OpponentDeck />
      </View>
      <View style={[styles.row, { height: '40%' }]}>
        <Grid />
        <Choices />
      </View>
      <View style={[styles.row, { height: '25%' }]}>
        <PlayerDeck />
      </View>
      <View style={[styles.row, { height: '5%' }]}>
        <PlayerInfos />
        <View style={styles.playerTimerScoreContainer}>
          <PlayerTimer />
          <PlayerScore score={gameViewState.player1Score} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    borderColor: 'black',
  },
  opponentInfosContainer: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: 'black',
    backgroundColor: "#f0f0f0", // Couleur de fond plus douce
  },
  opponentTimerScoreContainer: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#e6e6e6", // Couleur légèrement différente pour contraste
  },
  opponentScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#d9d9d9", // Ajout d'une couleur de fond
    borderRadius: 5, // Coins arrondis
    padding: 5, // Espacement interne
  },
  deckOpponentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "black"
  },
  gridContainer: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: 'black',
    backgroundColor: "#ffffff", // Fond blanc pour la grille
  },
  playerInfosContainer: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: 'black',
    backgroundColor: "#f0f0f0", // Même couleur que l'opponentInfosContainer
  },
  playerTimerScoreContainer: {
    flex: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#e6e6e6", // Même couleur que opponentTimerScoreContainer
  },
  playerScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#d9d9d9", // Même couleur que opponentScoreContainer
    borderRadius: 5, // Coins arrondis
    padding: 5, // Espacement interne
  },
});

export default Board;

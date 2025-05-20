// app/components/board/board.component.js

import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SocketContext } from "../../contexts/socket.context";
import PlayerTimer from './timers/player-timer.component'
import OpponentTimer from './timers/opponent-timer.component'
import PlayerDeck from "./decks/player-deck.component";
import OpponentDeck from "./decks/opponent-deck.component";
import Choices from "./choices/choices.component";
import Grid from "./grid/grid.component";
import AnimatedBackground from "../common/AnimatedBackground";

const Board = ({ gameViewState }) => {
  const socket = (useContext(SocketContext) && useContext(SocketContext).on) 
    ? useContext(SocketContext) 
    : (typeof window !== "undefined" && window.__BOT_SOCKET__);;
  const navigation = useNavigation();
  const [tokensLeft, setTokensLeft] = useState({ player1: 12, player2: 12 });
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [finalScores, setFinalScores] = useState({ player1: 0, player2: 0 });
  const [lastScorer, setLastScorer] = useState(null);
  const [playerRole, setPlayerRole] = useState(null);
  const [showPlayerRoleBanner, setShowPlayerRoleBanner] = useState(false);
  const [isMobile, setIsMobile] = useState(
    Platform.OS === "ios" ||
    Platform.OS === "android" ||
    Dimensions.get('window').width < 600
  );

  useEffect(() => {
    if (socket) {

      socket.on('game.score.updated', (data) => {
        setLastScorer(data.scorer === 'player:1' ? 'player1' : data.scorer === 'player:2' ? 'player2' : null);
        setTimeout(() => setLastScorer(null), 500); 
      });

    }
  }, [socket]);


  useEffect(() => {
    return () => {
      socket.off('game.score.updated');
      socket.off('game.start');
      socket.off('game.grid.view-state');
      socket.off('game.over');
    };
  }, [socket]);

  useEffect(() => {
    const onGameStart = (data) => {
      setTokensLeft({ player1: 12, player2: 12 });
      setPlayer1Score(0);
      setPlayer2Score(0);
      setFinalScores({ player1: 0, player2: 0 });
      setGameOver(false);
      setWinner(null);
      let role = null;
      if (data && (data.playerRole || data.playerNumber)) {
        role = data.playerRole || (data.playerNumber === 1 ? "Joueur 1" : "Joueur 2");
      } else if (socket && socket.id && data && data.players) {
        if (data.players[0] === socket.id) role = "Joueur 1";
        else if (data.players[1] === socket.id) role = "Joueur 2";
      }
      setPlayerRole(role);
      if (role) {
        setShowPlayerRoleBanner(true);
        setTimeout(() => setShowPlayerRoleBanner(false), 2000); 
      }
    };

    const onGridViewState = (data) => {
      setPlayer1Score(data['player1Score']);
      setPlayer2Score(data['player2Score']);
      setTokensLeft(data['tokensLeft']);
    };

    const onGameOver = (data) => {
      setGameOver(true);
      setWinner(data.winner);
      setFinalScores(data.scores);
    };

    socket.on("game.start", onGameStart);
    socket.on("game.grid.view-state", onGridViewState);
    socket.on("game.over", onGameOver);

    return () => {
      socket.off("game.start", onGameStart);
      socket.off("game.grid.view-state", onGridViewState);
      socket.off("game.over", onGameOver);
    };
  }, [socket]);

  const showPlayerRole =
    playerRole &&
    !gameOver &&
    (player1Score === 0 && player2Score === 0) &&
    (Platform.OS === "ios" || Platform.OS === "android");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        Platform.OS === "ios" ||
        Platform.OS === "android" ||
        Dimensions.get('window').width < 600
      );
    };
    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  if (gameOver) {
    return null;
  }

  return (
    <View style={styles.container}>
      {(showPlayerRoleBanner && playerRole) && (
        <View style={[styles.playerRoleBanner, {zIndex: 9999}]}>
          <Text style={styles.playerRoleText}>
            Vous êtes <Text style={{ fontWeight: 'bold' }}>{playerRole}</Text>
          </Text>
        </View>
      )}
      <AnimatedBackground
        player1Score={player1Score}
        player2Score={player2Score}
        lastScorer={lastScorer}
      />
      <View
        style={[
          styles.row,
          styles.responsiveRow,
          { height: isMobile ? 60 : 70 }
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.responsivePlayerInfoRow}>
          <Text style={styles.playerTitle}>Joueur 2</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.infoText}>{player2Score} points</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.infoText}>{tokensLeft.player2}/12 pions</Text>
        </View>
        <View style={styles.responsiveTimerScoreContainer}>
          <OpponentTimer />
        </View>
      </View>
      <View style={[styles.row, { height: isMobile ? 50 : 70 }]}>
        <OpponentDeck />
      </View>
      {isMobile ? (
        <>
          <View style={[styles.row2, { height: '40%' }]}>
            <View style={styles.gridWrapperMobile}>
              <Grid />
            </View>
          </View>
          <View style={styles.choicesWrapperMobile}>
            <Choices />
          </View>
        </>
      ) : (
      <View style={[styles.row2, { height: '51%' }]}>
        <View style={styles.gridWrapper}>
          <Grid />
          <Choices />
        </View>
      </View>
      )}
      <View style={[
        styles.row,
        {
          height: Platform.OS === "ios" || Platform.OS === "android" ? 90 : 120,
          marginTop: Platform.OS === "ios" || Platform.OS === "android" ? 18 : 0 
        }
      ]}>
        <PlayerDeck />
      </View>
      {(Platform.OS === "ios" || Platform.OS === "android") ? (
        <View style={[styles.playerInfoRowFixed, styles.responsiveRow]}>
          <View style={styles.responsivePlayerInfoRow}>
            <Text style={styles.playerTitle}>Joueur 1</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.infoText}>{player1Score} points</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.infoText}>{tokensLeft.player1}/12 pions</Text>
          </View>
          <View style={styles.responsiveTimerScoreContainer}>
            <PlayerTimer />
          </View>
        </View>
      ) : (
        <View style={[styles.row, styles.responsiveRow, { height: 70 }]}>
          <View style={[styles.responsivePlayerInfoRow, styles.desktopPlayer1Margin]}>
            <Text style={styles.playerTitle}>Joueur 1</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.infoText}>{player1Score} points</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.infoText}>{tokensLeft.player1}/12 pions</Text>
          </View>
          <View style={styles.responsiveTimerScoreContainer}>
            <PlayerTimer />
          </View>
        </View>
      )}
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent', 
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 0, 
    backgroundColor: 'transparent',  
  },
  row2: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 0,  
  },
  opponentInfosContainer: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0, 
    backgroundColor: "#f0f0f0",
  },
  opponentTimerScoreContainer: {
    width: '10%', 
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  opponentScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 5,
    padding: 5,
  },
  deckOpponentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 0,  
  },
  gridContainer: {
    flex: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0,
    backgroundColor: "#ffffff",
  },
  playerInfosContainer: {
    flex: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0, 
    backgroundColor: "#f0f0f0",
  },
  playerTimerScoreContainer: {
    width: '10%', 
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  playerScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 5,
    padding: 5,
  },
  playerInfoContainer: {
    flex: 7,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    margin: 4,
    justifyContent: 'center',
  },
  singleLineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  playerTitle: {
    fontSize: Platform.OS === "ios" || Platform.OS === "android" ? 15 : 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 8, 
    marginLeft: 2,
  },
  dot: {
    fontSize: Platform.OS === "ios" || Platform.OS === "android" ? 14 : 13,
    color: '#007AFF',
    marginHorizontal: 8,
  },
  infoText: {
    fontSize: Platform.OS === "ios" || Platform.OS === "android" ? 14 : 13, 
    color: '#34495e',
    marginHorizontal: 2, 
  },
  horizontalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 4,
    borderRadius: 4,
  },
  tokenCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 4,
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
  },
  playerColumn: {
    flex: 7,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    margin: 4,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  tokenTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  tokenCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tokenText: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },
  playerInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingLeft: 12,
    borderRadius: 12,
    margin: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  responsiveRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: Platform.OS === "ios" || Platform.OS === "android" ? 4 : 12, 
    gap: Platform.OS === "ios" || Platform.OS === "android" ? 2 : 8,
    alignSelf: 'center',
  },
  responsivePlayerInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: Platform.OS === "ios" || Platform.OS === "android" ? 'flex-start' : 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: Platform.OS === "ios" || Platform.OS === "android" ? 6 : 6, 
    paddingHorizontal: Platform.OS === "ios" || Platform.OS === "android" ? 10 : 32, 
    borderRadius: 12,
    marginHorizontal: Platform.OS === "ios" || Platform.OS === "android" ? 4 : 0,
    minWidth: 0,
    flexShrink: 1,
    maxWidth: '90%', 
  },
  responsiveTimerScoreContainer: {
    minWidth: 36,
    maxWidth: 36,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Platform.OS === "ios" || Platform.OS === "android" ? 4 : 0,
    marginRight: Platform.OS === "ios" || Platform.OS === "android" ? 4 : 8,
    padding: 0,
  },
  playerInfoRowFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flex: 1,
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    paddingLeft: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 700,
    alignSelf: 'center',
  },
  backButton: {
    position: 'relative',
    marginRight: Platform.OS === "ios" || Platform.OS === "android" ? 4 : 0,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  backArrow: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 0,
    marginTop: 0,
  },
  gridWrapper: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    width: '100%',
    backgroundColor: 'transparent', 
    elevation: 4,
    marginVertical: 4,
  },
  gridWrapperMobile: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'transparent',
    elevation: 4,
    marginVertical: 10,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choicesWrapperMobile: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  playerRoleBanner: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignSelf: 'center',
    marginHorizontal: 30,
    alignItems: 'center',
  },
  playerRoleText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  desktopPlayer1Margin: {
    marginLeft: '4%',
  },
});

export default Board;


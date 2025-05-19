// app/components/board/decks/player-deck.component.js

import React, { useState, useContext, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import Dice from "./dice.component";

const PlayerDeck = () => {

  const socket = useContext(SocketContext) || (typeof window !== "undefined" && window.__BOT_SOCKET__);;
  const [displayPlayerDeck, setDisplayPlayerDeck] = useState(false);
  const [dices, setDices] = useState(Array(5).fill(false));
  const [displayRollButton, setDisplayRollButton] = useState(false);
  const [rollsCounter, setRollsCounter] = useState(0);
  const [rollsMaximum, setRollsMaximum] = useState(3);

  useEffect(() => {

    socket.on("game.deck.view-state", (data) => {
      setDisplayPlayerDeck(data['displayPlayerDeck']);
      if (data['displayPlayerDeck']) {
        setDisplayRollButton(data['displayRollButton']);
        setRollsCounter(data['rollsCounter']);
        setRollsMaximum(data['rollsMaximum']);
        setDices(data['dices']);
      }
    });
  }, []);

  const toggleDiceLock = (index) => {
    const newDices = [...dices];
    if (newDices[index].value !== '' && displayRollButton) {
      socket.emit("game.dices.lock", newDices[index].id);
    }
  };

  const rollDices = () => {
    if (rollsCounter <= rollsMaximum) {
      socket.emit("game.dices.roll");
    }
  };

  return (

    <View style={styles.deckPlayerContainer}>

      {displayPlayerDeck && (

        <>
          {displayRollButton && (

            <>
              <View style={styles.rollInfoContainer}>
                <Text style={styles.rollInfoText}>
                  Lancer {rollsCounter} / {rollsMaximum}
                </Text>
              </View>
            </>

          )}

          <View style={styles.diceContainer}>
            {dices.map((diceData, index) => (
              <Dice
                key={diceData.id}
                index={index}
                locked={diceData.locked}
                value={diceData.value}
                onPress={toggleDiceLock}
              />
            ))}
          </View>

          {displayRollButton && (

            <>
              <TouchableOpacity style={styles.rollButton} onPress={rollDices}>
                <Text style={styles.rollButtonText}>Lancer</Text>
              </TouchableOpacity>
            </>

          )}
        </>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  deckPlayerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "black"
  },
  rollInfoContainer: {
    marginBottom: 10,
  },
  rollInfoText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  diceContainer: {
    flexDirection: "row",
    width: "70%",
    justifyContent: "space-between",
    marginBottom: 10
  },
  rollButton: {
    width: "30%",
    backgroundColor: "#043F4E", // couleur demandée
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  rollButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    margin: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  dice: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  diceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default PlayerDeck;

import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet } from 'react-native';
import { SocketContext } from '../../../contexts/socket.context';

const OpponentTimer = () => {
  const socket = useContext(SocketContext) || (typeof window !== "undefined" && window.__BOT_SOCKET__);
  const [opponentTimer, setOpponentTimer] = useState(0);

  useEffect(() => {
    socket.on("game.timer", (data) => {
      setOpponentTimer(data['opponentTimer']);
    });

    return () => {
      socket.off("game.timer");
    };
  }, []);

  const isUrgent = opponentTimer <= 10;

  return (
    <View style={styles.timerWrapper}>
      <View style={[styles.circle, isUrgent && styles.urgentCircle]}>
        <Text style={[styles.timerText, isUrgent && styles.urgentText]}>
          {opponentTimer}s
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerWrapper: {
    width: 36,
    height: 36,
    minWidth: 36,
    minHeight: 36,
    maxWidth: 36,
    maxHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginTop: 0,
  },
  urgentCircle: {
    backgroundColor: '#DA313E',
  },
  timerText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00796b',
  },
  urgentText: {
    color: '#fff',
  },
});

export default OpponentTimer;
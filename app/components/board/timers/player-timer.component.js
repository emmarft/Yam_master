import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SocketContext } from '../../../contexts/socket.context';

const PlayerTimer = () => {
  const socket = useContext(SocketContext) || (typeof window !== "undefined" && window.__BOT_SOCKET__);
  const [playerTimer, setPlayerTimer] = useState(0);

  useEffect(() => {
    socket.on("game.timer", (data) => {
      setPlayerTimer(data['playerTimer']);
    });

    return () => {
      socket.off("game.timer");
    };
  }, []);

  const isUrgent = playerTimer <= 10;

  return (
    <View style={styles.timerWrapper}>
      <View style={[styles.circle, isUrgent && styles.urgentCircle]}>
        <Text style={[styles.timerText, isUrgent && styles.urgentText]}>
          {playerTimer}s
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

export default PlayerTimer;

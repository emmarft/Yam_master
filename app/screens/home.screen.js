// app/screens/home.screen.js

import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import AnimatedBackground from "../components/common/AnimatedBackground";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground />
      <View style={styles.centeredContent}>
        <TouchableOpacity style={styles.customButton} onPress={() => navigation.navigate('OnlineGameScreen')}>
          <Text style={styles.customButtonText}>Jouer en ligne</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.customButton} onPress={() => navigation.navigate('VsBotGameScreen')}>
          <Text style={styles.customButtonText}>Jouer contre le bot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  customButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    border: 'none',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  customButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

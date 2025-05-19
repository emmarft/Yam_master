import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const AnimatedBackground = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/hawai.png')}
        style={[styles.backgroundImage, { opacity: 1 }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width,
    height,
    zIndex: -1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
});

export default AnimatedBackground;
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontSize, spacing, commonStyles } from '../utils/responsive';

export const HomeScreen = () => {
  return (
    <View style={[commonStyles.container, styles.container]}>
      <Text style={styles.text}>Hello World</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: fontSize(24),
    fontWeight: 'bold',
    color: '#000',
  },
}); 
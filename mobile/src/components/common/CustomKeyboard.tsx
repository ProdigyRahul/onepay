import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';

interface CustomKeyboardProps {
  onKeyPress: (key: string) => void;
}

export const CustomKeyboard: React.FC<CustomKeyboardProps> = ({ onKeyPress }) => {
  const renderKey = (key: string) => (
    <TouchableOpacity
      style={styles.key}
      onPress={() => onKeyPress(key)}
      activeOpacity={0.7}>
      <Text style={styles.keyText}>{key}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderKey('1')}
        {renderKey('2')}
        {renderKey('3')}
      </View>
      <View style={styles.row}>
        {renderKey('4')}
        {renderKey('5')}
        {renderKey('6')}
      </View>
      <View style={styles.row}>
        {renderKey('7')}
        {renderKey('8')}
        {renderKey('9')}
      </View>
      <View style={styles.row}>
        <View style={styles.key} />
        {renderKey('0')}
        <TouchableOpacity
          style={styles.key}
          onPress={() => onKeyPress('backspace')}
          activeOpacity={0.7}>
          <Text style={styles.keyText}>⌫</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.white,
    paddingBottom: hp(2),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: hp(2),
  },
  key: {
    width: wp(28),
    height: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: wp(2),
  },
  keyText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.black,
  },
}); 
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import theme from '../theme';

type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
};

const Button = React.memo(function Button({ children, variant = 'primary', style, textStyle, onPress }: Props) {
  const containerStyle = [styles.base, variant === 'primary' ? styles.primary : styles.secondary, style];
  const labelStyle = [styles.label, textStyle];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={containerStyle}>
      <Text style={labelStyle}>{children}</Text>
    </TouchableOpacity>
  );
});

export default Button;

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...theme.shadow.sm,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: theme.colors.borderStrong,
  },
  secondary: {
    backgroundColor: theme.colors.cyan,
    borderWidth: 3,
    borderColor: '#0087B8',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.fonts.heading,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

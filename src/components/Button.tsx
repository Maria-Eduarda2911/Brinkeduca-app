import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import theme from '../theme';

type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  disabled?: boolean;
};

const Button = React.memo(function Button({
  children,
  variant = 'primary',
  style,
  textStyle,
  onPress,
  disabled = false,
}: Props) {
  const containerStyle = [
    styles.base,
    variant === 'primary' ? styles.primary : styles.secondary,
    disabled && styles.disabled,
    style,
  ];
  const labelStyle = [styles.label, disabled && styles.labelDisabled, textStyle];

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.85}
      style={containerStyle}
      disabled={disabled}
    >
      <Text style={labelStyle}>{children}</Text>
    </TouchableOpacity>
  );
});

export default Button;

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 3,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.borderStrong,
  },
  secondary: {
    backgroundColor: theme.colors.cyan,
    borderColor: '#0087B8',
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: theme.fonts.heading,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelDisabled: {
    color: '#F3F3F3',
  },
});

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import theme from '../theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const Card = React.memo(function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
});

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 4,
    borderColor: theme.colors.cyan,
    borderRadius: theme.radius.lg,
    padding: 20,
    marginBottom: 16,
    ...theme.shadow.md,
  },
});

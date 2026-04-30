import { ReactNode } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const ActionButton = ({ label, onPress, variant = 'primary' }: ActionButtonProps) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, variant === 'secondary' ? styles.secondary : styles.primary, pressed && styles.pressed]}>
      <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginVertical: 6,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#5b21b6',
  },
  secondary: {
    backgroundColor: '#e5e7eb',
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryLabel: {
    color: '#111827',
  },
});

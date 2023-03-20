import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function ZegoToast(props) {
  const { toast } = props;
  return (
    <View style={styles.toastView}>
      <Text style={styles.text}>{toast}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toastView: {
    position: 'absolute',
    top: 20,
    width: '100%',
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#bc0e07',
    borderRadius: 12,
    height: 40,
  },
  text: {
    paddingBottom: 10,
    lineHeight: 40,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e7e7e7',
  },
});

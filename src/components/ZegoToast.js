import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ZegoToastType } from '../services/defines'

export default function ZegoToast(props) {
    const {
        visable = false,
        text = '',
        type = ZegoToastType.success,
    } = props;
    let color = '#FFFFFF', backgroundColor = '#55BC9E';
    switch (type) {
        case ZegoToastType.default:
        case ZegoToastType.info:
            break;
        case ZegoToastType.success:
            break;
        case ZegoToastType.warning:
            backgroundColor = '#e6a23c';
            break;
        case ZegoToastType.error:
            backgroundColor = '#BD5454';
            break;
        default:
            break;
    }

    const getCustomTextStyle = (color) => StyleSheet.create({
        text: {
            color,
        },
    });
    const getCustomContainerStyle = (visable, backgroundColor) => StyleSheet.create({
        customContainer: {
            display: visable ? 'flex' : 'none',
            backgroundColor,
        },
    });

  return (
    <View style={[styles.container, getCustomContainerStyle(visable, backgroundColor).customContainer]}>
      <Text style={[styles.text, getCustomTextStyle(color).text]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 12,
        height: 70,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 40,
    },
    text: {
        fontSize: 14,
    },
});

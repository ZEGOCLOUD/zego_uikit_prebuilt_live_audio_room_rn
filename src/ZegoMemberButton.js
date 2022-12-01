import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function ZegoMemberButton(props) {
  const { onPressed, width = 48, height = 48 } = props;

  return (
    <View>
      <TouchableOpacity
        style={{ width: width, height: height }}
        onPress={onPressed}
      >
        <Image
          resizeMode="contain"
          source={require('./resources/bottom_button_member.png')}
          style={{ width: '100%', height: '100%' }}
        />
      </TouchableOpacity>
    </View>
  );
}

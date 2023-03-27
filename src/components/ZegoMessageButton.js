import React from 'react';
import { TouchableOpacity, Image } from 'react-native';

export default function ZegoMessageButton(props) {
  const { onPress, width = 36, height = 36 } = props;

  return (
    <TouchableOpacity
      style={{ width: width, height: height }}
      onPress={onPress}
    >
      <Image
        resizeMode="contain"
        source={require('../resources/white_bottom_button_message.png')}
        onLoad={({
          nativeEvent: {
            source: { width, height },
          },
        }) => console.log('>>>>>', width, height)}
        style={{ width: '100%', height: '100%' }}
      />
    </TouchableOpacity>
  );
}

import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { ZegoAudioVideoView } from '@zegocloud/zego-uikit-rn';

export default function ZegoSeatingArea(props) {
  const {
    rowSpacing,
    foregroundBuilder,
    onSeatItemClick,
    backgroundColor,
    backgroundImage,
    seatingAreaData,
    showSoundWaveInAudioMode,
  } = props;
  const flexStyle = [
    'space-around',
    'flex-start',
    'flex-end',
    'center',
    'space-between',
    'space-evenly',
  ];

  const onPress = (index) => {
    onSeatItemClick(index);
  };
  const renderItem = (row, foregroundBuilder) => {
    const rowArr = [];
    row.forEach((value) => {
      rowArr.push(value);
    });
    return rowArr.map((item, index) => (
      <TouchableWithoutFeedback
        key={index}
        style={styles.touch}
        onPress={() => {
          onPress(item.seatIndex);
        }}
      >
        <View
          style={[
            styles.item,
            {
              marginHorizontal:
                item.alignment === 'center' ||
                item.alignment === 'start' ||
                item.alignment === 'end'
                  ? item.seatSpacing
                  : 0,
            },
          ]}
        >
          <View
            style={[styles.defaultSeat, { backgroundColor: backgroundColor }]}
          >
            {item.userID ? (
              <ZegoAudioVideoView
                userID={item.userID}
                foregroundBuilder={
                  foregroundBuilder
                    ? foregroundBuilder
                    : ({ userInfo }) => <View />
                }
                useVideoViewAspectFill={true}
                showSoundWave={showSoundWaveInAudioMode}
                audioViewBackgroudColor={backgroundColor}
                audioViewBackgroudImage={backgroundImage}
                avatarSize={{ width: 54, height: 54 }}
                avatarAlignment={0}
                soundWaveColor="#3655ff"
              />
            ) : (
              <Image
                style={styles.icon}
                source={require('./resources/seating-area-default-icon.png')}
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    ));
  };

  return (
    <View style={styles.container}>
      {seatingAreaData.map((row, index) => (
        <View
          key={index}
          style={[
            styles.row,
            {
              marginVertical: rowSpacing ? rowSpacing : 0,
              justifyContent: flexStyle[row.alignment],
            },
          ]}
        >
          {renderItem(row.seatList, foregroundBuilder)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  item: {
    width: 84,
    height: 84,
  },
  defaultSeat: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 84,
    height: 84,
  },
  icon: {
    width: 54,
    height: 54,
  },
});

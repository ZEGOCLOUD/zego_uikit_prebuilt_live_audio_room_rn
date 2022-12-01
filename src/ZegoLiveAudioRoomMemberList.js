import React from 'react';
import ZegoUIKit, { ZegoMemberList } from '@zegocloud/zego-uikit-rn';
import { StyleSheet, View, Text } from 'react-native';

export default function ZegoLiveAudioRoomMemberList(props) {
  const { showMicrophoneState, itemBuilder, onCloseCallMemberList } = props;
  const memberList = ZegoUIKit.getAllUsers();
  console.log('===ZegoLiveAudioRoomMemberList memberList', memberList);
  return (
    <View style={styles.container}>
      <View style={styles.topLine}></View>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance · {memberList.length}</Text>
      </View>
      <View style={styles.memberListContainer}>
        <ZegoMemberList
          showMicrophoneState={showMicrophoneState}
          itemBuilder={itemBuilder}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#111014',
    width: '100%',
    height: 520,
    zIndex: 4,
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  topLine: {
    marginTop: 7,
    marginBottom: 3,
    width: 40,
    height: 5,
    backgroundColor: '#3B3B3B',
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 43,
    paddingLeft: 16,
  },
  downArrowIcon: {
    marginLeft: 11.5,
    marginRight: 5,
  },
  title: {
    alignContent: 'flex-start',
    fontSize: 18,
    color: '#FFFFFF',
  },
  divide: {
    width: '100%',
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.15,
  },
  memberListContainer: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 14,
  },
});

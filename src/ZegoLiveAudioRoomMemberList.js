import React from 'react';
import ZegoUIKit, { ZegoMemberList } from '@zegocloud/zego-uikit-rn';
import { StyleSheet, View, Text } from 'react-native';
import { ZegoLiveAudioRoomRole } from './define';

export default function ZegoLiveAudioRoomMemberList(props) {
  const {
    showMicrophoneState,
    itemBuilder,
    onCloseCallMemberList,
    seatingAreaData,
  } = props;
  const memberList = ZegoUIKit.getAllUsers();
  console.log('===ZegoLiveAudioRoomMemberList memberList', memberList);

  const sortUserList = (userList) => {
    // Sort by seatingAreaData
    // [{ "seatList": Map { 0 => { "seatIndex": 0, "role": 2, "userID": "xxxx" } } }]
    // you are host: you(host) -> other host -> speaker -> audience
    // yor are not host: host -> you -> speaker -> audience

    const localUserID = ZegoUIKit.getLocalUserInfo().userID;
    // Find out the role of everyone
    const hostArr = [],
      speakerArr = [],
      audienceArr = [];
    seatingAreaData.forEach((element) => {
      Array.from(element.seatList.values()).forEach((item) => {
        if (item.userID) {
          if (item.role === ZegoLiveAudioRoomRole.host) {
            if (item.userID === localUserID) {
              hostArr.unshift(item.userID);
            } else {
              hostArr.push(item.userID);
            }
          } else if (item.role === ZegoLiveAudioRoomRole.speaker) {
            if (item.userID === localUserID) {
              speakerArr.unshift(item.userID);
            } else {
              speakerArr.push(item.userID);
            }
          } else {
            if (item.userID === localUserID) {
              audienceArr.unshift(item.userID);
            } else {
              audienceArr.push(item.userID);
            }
          }
        }
      });
    });
    const allArr = hostArr.concat(speakerArr, audienceArr);
    const newUserList = [];
    console.warn('========allArr==========', allArr);
    allArr.forEach((userID) => {
      const index = userList.findIndex((user) => user.userID === userID);
      if (index !== -1) {
        newUserList.push(userList[index]);
      }
    });
    console.warn('========newUserList==========', newUserList);
    return newUserList;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLine} />
      <View style={styles.header}>
        <Text style={styles.title}>Attendance · {memberList.length}</Text>
      </View>
      <View style={styles.memberListContainer}>
        <ZegoMemberList
          sortUserList={sortUserList}
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

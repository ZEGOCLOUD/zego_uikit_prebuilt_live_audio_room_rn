import React, { useRef, useEffect, useState } from 'react';
import {StyleSheet, View, Image, Text, ImageBackground,Button} from 'react-native';
import KeyCenter from './KeyCenter';
import ZegoUIKitPrebuiltLiveAudioRoom, {
  AUDIENCE_DEFAULT_CONFIG,
  ZegoLiveAudioRoomRole,
  ZegoMenuBarButtonName,
  ZegoLiveAudioRoomLayoutAlignment,
} from '@zegocloud/zego-uikit-prebuilt-live-audio-room-rn';
export default function AudiencePage(props) {
  const prebuiltRef = useRef();
  const {route} = props;
  const {params} = route;
  const {userID, userName, roomID, layoutType} = params;
  let rowConfigs = [];
  let rowSpacing = 0;
  let takeSeatIndexWhenJoining = -1;
  let backgroundColor = 'transparent';
  let hostSeatIndexes = [0];
  switch (layoutType) {
    case 0:
      rowConfigs = [
        {
          count: 4,
          seatSpacing: 16,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceAround,
        },
        {
          count: 4,
          seatSpacing: 16,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceAround,
        },
      ];
      takeSeatIndexWhenJoining = 0;
      break;
    case 1:
      rowConfigs = [
        {
          count: 4,
          seatSpacing: 0,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceBetween,
        },
        {
          count: 4,
          seatSpacing: 0,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceBetween,
        },
        {
          count: 4,
          seatSpacing: 0,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceBetween,
        },
        {
          count: 4,
          seatSpacing: 0,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceBetween,
        },
      ];
      rowSpacing = 5;
      takeSeatIndexWhenJoining = 0;
      break;
    case 2:
      rowConfigs = [
        {
          count: 1,
          seatSpacing: 0,
          alignment: ZegoLiveAudioRoomLayoutAlignment.center,
        },
        {
          count: 3,
          seatSpacing: 0,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceBetween,
        },
        {
          count: 3,
          seatSpacing: 0,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceBetween,
        },
        {
          count: 2,
          seatSpacing: 0,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceEvenly,
        },
      ];
      rowSpacing = 0;
      takeSeatIndexWhenJoining = 0;
      backgroundColor = '#ccc';
      break;
    case 3:
      rowConfigs = [
        {
          count: 3,
          seatSpacing: 0,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceBetween,
        },
        {
          count: 3,
          seatSpacing: 0,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceBetween,
        },
        {
          count: 3,
          seatSpacing: 0,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceBetween,
        },
      ];
      takeSeatIndexWhenJoining = 4;
      hostSeatIndexes = [4];
      break;
    default:
      rowConfigs = [
        {
          count: 2,
          seatSpacing: 16,
          alignment: ZegoLiveAudioRoomLayoutAlignment.spaceAround,
        },
      ];
      takeSeatIndexWhenJoining = 0;
      break;
  }
  const foregroundBuilder = ({userInfo, seatIndex}) => {
    return (
      <View style={styles.builder}>
        <View style={styles.avatarBox}>
          {userInfo.inRoomAttributes?.role === '0' ? (
            <Image
              style={styles.hostIcon}
              source={require('./resources/host-icon.png')}
            />
          ) : null}
          {!userInfo.isMicDeviceOn ? (
            <Image
              style={styles.mic}
              source={require('./resources/close-mic.png')}
            />
          ) : null}
        </View>
        <Text style={styles.name}>{userInfo.userName}</Text>
      </View>
    );
  };
  const image = {uri: 'xxx'};
  const background = () => {
    return (
      <View style={styles.backgroundView}>
        <ImageBackground source={image} style={styles.image}>
          <View style={styles.titleBar}>
            <Text style={styles.title}>A Live Audio Room</Text>
            <Text style={styles.id}>ID:{roomID}</Text>
          </View>
        </ImageBackground>
      </View>
    );
  };
  const itemBuilder = ({ message }) => {
    return <View style={styles.messageContainer}>
      <Text style={styles.nameLabel}>
        {message.sender.userName}
        <Text style={styles.messageLabel}> {message.message}</Text>
      </Text>
      <View style={styles.placeholder}></View>
    </View>
  }
  const [showBtn, setShowBtn] = useState(false);
  useEffect(() => {
    setShowBtn(false);
  }, []);
  var needMuteAudio = false;
  return (
    <View style={styles.container}>
      <View style={styles.prebuiltContainer}>
        <ZegoUIKitPrebuiltLiveAudioRoom
          ref={prebuiltRef}
          appID={KeyCenter.appID}
          appSign={KeyCenter.appSign}
          userID={userID}
          userName={userName}
          roomID={roomID}
          config={{
            ...AUDIENCE_DEFAULT_CONFIG,
            avatar: 'https://robohash.org/2.png',
            userInRoomAttributes: { test: '123' },
            onUserCountOrPropertyChanged: (userList) => {
              console.log('[Demo]AudiencePage onUserCountOrPropertyChanged', userList);
            },
            layoutConfig: {
              rowConfigs,
              rowSpacing,
            },
            takeSeatIndexWhenJoining,
            hostSeatIndexes,
            seatConfig: {
              foregroundBuilder,
              backgroundColor,
            },
            background,
            onLeaveConfirmation: () => {
              props.navigation.navigate('HomePage');
            },
            inRoomMessageViewConfig: {
              itemBuilder
            },
            topMenuBarConfig: {
              buttons: [ZegoMenuBarButtonName.minimizingButton, ZegoMenuBarButtonName.leaveButton],
            },
            onSeatTakingRequestRejected: () => {
              console.log('[Demo]AudiencePage onSeatTakingRequestRejected ');
            },
            onHostSeatTakingInviteSent: () => {
              console.log('[Demo]AudiencePage onHostSeatTakingInviteSent ');
            },
            // onMemberListMoreButtonPressed: (user) => {
            //   console.log('[Demo]AudiencePage onMemberListMoreButtonPressed ', user);
            // },
            onSeatsChanged: (takenSeats, untakenSeats) => {
              console.log('[Demo]AudiencePage onSeatsChanged ', takenSeats, untakenSeats);
              if (untakenSeats.length < 7) {
                needMuteAudio = true;
              } else {
                needMuteAudio = false;
              }
            },
            // playAudioConfig: (localUserID, localRole, speaker) => {
            //   console.log('++++++++++++++playAudioConfig', localUserID, localRole, speaker, needMuteAudio);
            //   if (localRole != ZegoLiveAudioRoomRole.audience) {
            //     return true;
            //   } else {
            //     return !needMuteAudio;
            //   }
            // },
            onSeatsClosed: () => {
              console.log('[Demo]AudiencePage onSeatsClosed ');
            },
            onSeatsOpened: () => {
              console.log('[Demo]AudiencePage onSeatsOpened ');
            },
            onSeatClosed: (index) => {
              console.log('[Demo]AudiencePage onSeatClosed: ', index);
            },
            onSeatOpened: (index) => {
              console.log('[Demo]AudiencePage onSeatOpened: ', index);
            },
            onTurnOnYourMicrophoneRequest: (fromUser) => {
              console.log('[Demo]AudiencePage onTurnOnYourMicrophoneRequest ', fromUser);
            },
            // onSeatClicked: (index, user) => {
            //   console.log('[Demo]AudiencePage onSeatClicked ', index, user);
            // },
            onWindowMinimized: () => {
              console.log('[Demo]AudiencePage onWindowMinimized');
              props.navigation.navigate('HomePage');
            },
            onWindowMaximized: () => {
              console.log('[Demo]AudiencePage onWindowMaximized');
              props.navigation.navigate('AudiencePage', {
                userID: userID,
                userName: 'user_' + userID,
                roomID: roomID,
                layoutType,
              });
            }
          }}
        />
      </View>
      {
        showBtn ? <View style={styles.btnContainer}>
          <Button title='minimizeWindow' onPress={
            () => {
              prebuiltRef.current.minimizeWindow();
            }
          }></Button>
          <Button title='leave' onPress={
            () => {
              prebuiltRef.current.leave(true);
            }
          }></Button>
          <Button title='applyToTakeSeat' onPress={prebuiltRef.current.applyToTakeSeat}></Button>
          <Button title='cancelSeatTakingRequest' onPress={prebuiltRef.current.cancelSeatTakingRequest}></Button>
          <Button title='takeSeat' onPress={prebuiltRef.current.takeSeat.bind(this, 2)}></Button>
          <Button title='leaveSeat' onPress={prebuiltRef.current.leaveSeat}></Button>
          <Button title='acceptHostTakeSeatInvitation' onPress={prebuiltRef.current.acceptHostTakeSeatInvitation}></Button>
        </View> : null
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0,
  },
  btnContainer: {
    alignItems: 'flex-start',
  },
  prebuiltContainer: {
    flex: 1,
  },
  builder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBox: {
    alignItems: 'center',
    width: 54,
    height: 54,
  },
  mic: {
    position: 'absolute',
    width: 54,
    height: 54,
    zIndex: 2,
  },
  name: {
    position: 'absolute',
    bottom: 0,
    lineHeight: 14,
    fontSize: 10,
    color: '#000',
    zIndex: 3,
  },
  hostIcon: {
    position: 'absolute',
    bottom: 0,
    width: 47,
    height: 12,
    zIndex: 3,
  },
  backgroundView: {
    zIndex: -1,
    width: '100%',
    height: '100%',
  },
  titleBar: {
    position: 'absolute',
    top: 55,
    paddingLeft: 18,
    width: '100%',
    height: 54,
  },
  title: {
    fontSize: 16,
    lineHeight: 33,
    color: '#1B1B1B',
  },
  id: {
    fontSize: 10,
    color: '#606060',
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  // message
  messageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(1, 7, 18, 0.3000)',
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 10,
    paddingLeft: 10,
  },
  nameLabel: {
    color: '#8BE7FF',
    fontSize: 13,
    // marginLeft: 10
  },
  messageLabel: {
    color: 'white',
    fontSize: 13,
    marginLeft: 5,
  },
  placeholder: {
    backgroundColor: 'red',
    width: 10,
    height: 10,
    marginLeft: 10,
  },
});

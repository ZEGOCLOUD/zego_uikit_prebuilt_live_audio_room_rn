import React, { useRef, useEffect, useState } from 'react';
import {StyleSheet, View, Text, Image, ImageBackground, Button, Alert} from 'react-native';
import KeyCenter from './KeyCenter';
import ZegoUIKitPrebuiltLiveAudioRoom, {
  HOST_DEFAULT_CONFIG,
  ZegoMenuBarButtonName,
  ZegoLiveAudioRoomLayoutAlignment,
} from '@zegocloud/zego-uikit-prebuilt-live-audio-room-rn';
export default function HostPage(props) {
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
  const avatarBuilder = ({userInfo}) => {
    return <View style={styles.avatarBuilder}>
      {
        userInfo.inRoomAttributes && userInfo.inRoomAttributes.avatar ? <Image 
          style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          resizeMode="cover"
          source={{ uri: userInfo.inRoomAttributes.avatar }}
        /> : null
      }
    </View>
  }
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
    setShowBtn(true);
  }, []);
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
            ...HOST_DEFAULT_CONFIG,
            avatar: 'https://www.zegocloud.com/_nuxt/img/photo_3.fc8eb61.webp',
            userInRoomAttributes: { test: '123' },
            onUserCountOrPropertyChanged: (userList) => {
              console.log('HostPage onUserCountOrPropertyChanged', userList);
            },
            layoutConfig: {
              rowConfigs,
              rowSpacing,
            },
            confirmDialogInfo: {
              title: 'Leave the room',
              message: 'Are you sure to leave the room?',
              cancelButtonName: 'Cancel',
              confirmButtonName: 'OK',
            },
            takeSeatIndexWhenJoining,
            hostSeatIndexes,
            seatConfig: {
              backgroundColor,
              foregroundBuilder,
              avatarBuilder,
            },
            background,
            // onLeaveConfirmation: () => {
            //   props.navigation.navigate('HomePage');
            // },
            onLeave: () => {
              props.navigation.navigate('HomePage');
            },
            onLeaveConfirming: () => {
              return new Promise((resolve, reject) => {
                Alert.alert(
                  'This is your custom dialog.',
                  'You can customize this dialog as needed.',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => reject(),
                      style: 'cancel',
                    },
                    {
                      text: 'Exit',
                      onPress: () => resolve(),
                    },
                  ],
                );
              });
            },
            inRoomMessageViewConfig: {
              itemBuilder
            },
            topMenuBarConfig: {
              buttons: [ZegoMenuBarButtonName.minimizingButton, ZegoMenuBarButtonName.leaveButton],
            },
            onSeatTakingRequested: (audience) => {
              console.log('[Demo]HostPage onSeatTakingRequested ', audience);
            },
            onSeatTakingRequestCanceled: (audience) => {
              console.log('[Demo]HostPage onSeatTakingRequestCanceled ', audience);
            },
            onSeatTakingInviteRejected: () => {
              console.log('[Demo]HostPage onSeatTakingInviteRejected ');
            },
            // onMemberListMoreButtonPressed: (user) => {
            //   console.log('[Demo]HostPage onMemberListMoreButtonPressed ', user);
            // },
            onSeatsChanged: (takenSeats, untakenSeats) => {
              console.log('[Demo]HostPage onSeatsChanged ', takenSeats, untakenSeats);
            },
            onSeatsClosed: () => {
              console.log('[Demo]HostPage onSeatsClosed ');
            },
            onSeatsOpened: () => {
              console.log('[Demo]HostPage onSeatsOpened ');
            },
            onTurnOnYourMicrophoneRequest: (fromUser) => {
              console.log('[Demo]HostPage onTurnOnYourMicrophoneRequest ', fromUser);
            },
            // onSeatClicked: (index, user) => {
            //   console.log('[Demo]HostPage onSeatClicked ', index, user);
            // },
            onWindowMinimized: () => {
              console.log('[Demo]HostPage onWindowMinimized');
              props.navigation.navigate('HomePage');
            },
            onWindowMaximized: () => {
              console.log('[Demo]HostPage onWindowMaximized');
              props.navigation.navigate('HostPage', {
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
          <Button title='inviteAudienceToTakeSeat' onPress={prebuiltRef.current.inviteAudienceToTakeSeat.bind(this, '3379')}></Button>
          <Button title='acceptSeatTakingRequest' onPress={prebuiltRef.current.acceptSeatTakingRequest.bind(this, '3379')}></Button>
          <Button title='rejectSeatTakingRequest' onPress={prebuiltRef.current.rejectSeatTakingRequest.bind(this, '3379')}></Button>
          <Button title='openSeats' onPress={prebuiltRef.current.openSeats}></Button>
          <Button title='closeSeats' onPress={prebuiltRef.current.closeSeats}></Button>
          <Button title='turnMicrophoneOn' onPress={prebuiltRef.current.turnMicrophoneOn.bind(this, '3379', true)}></Button>
          <Button title='removeSpeakerFromSeat' onPress={prebuiltRef.current.removeSpeakerFromSeat.bind(this, '3379')}></Button>
        </View> : null
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
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
  avatarBuilder: {
    width: '100%',
    height: '100%',
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

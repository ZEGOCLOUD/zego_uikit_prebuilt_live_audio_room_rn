import React, { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import ZegoUIKit, {
  ZegoLeaveButton,
  ZegoInRoomMessageInput,
  ZegoInRoomMessageView,
} from '@zegocloud/zego-uikit-rn';
import ZegoBottomBar from './ZegoBottomBar';
import { useKeyboard } from './utils/keyboard';
import ZegoMenuBarButtonName from './ZegoMenuBarButtonName';
import ZegoSeatingArea from './ZegoSeatingArea';
import ZegoLiveAudioRoomMemberList from './ZegoLiveAudioRoomMemberList';
import ZegoPrebuiltPlugins from './utils/plugins';

const ZegoLiveAudioRoomRole = {
  host: 0,
  speaker: 1,
  audience: 2,
};

const HOST_DEFAULT_CONFIG = {
  role: ZegoLiveAudioRoomRole.host,
  turnOnMicrophoneWhenJoining: true,
};
const SPEAKER_DEFAULT_CONFIG = {
  role: ZegoLiveAudioRoomRole.speaker,
  turnOnMicrophoneWhenJoining: true,
};
const AUDIENCE_DEFAULT_CONFIG = {
  role: ZegoLiveAudioRoomRole.audience,
  turnOnMicrophoneWhenJoining: false,
};
const ZegoLiveAudioRoomLayoutAlignment = {
  spaceAround: 0,
  start: 1,
  end: 2,
  center: 3,
  spaceBetween: 4,
  spaceEvenly: 5,
};
const ZegoLiveAudioRoomLayoutRowConfig = {
  count: 4,
  seatSpacing: 16,
  alignment: ZegoLiveAudioRoomLayoutAlignment.spaceAround,
};

export {
  ZegoLiveAudioRoomRole,
  HOST_DEFAULT_CONFIG,
  SPEAKER_DEFAULT_CONFIG,
  AUDIENCE_DEFAULT_CONFIG,
  ZegoLiveAudioRoomLayoutAlignment,
};
export default function ZegoUIKitPrebuiltLiveAudioRoom(props) {
  const { appID, appSign, userID, userName, roomID, config, plugins } = props;
  const {
    role = ZegoLiveAudioRoomRole.audience,
    seatIndex = -1,
    turnOnMicrophoneWhenJoining = false,
    useSpeakerWhenJoining = true,
    bottomMenuBarConfig = {},
    confirmDialogInfo = {},
    onLeaveConfirmation,
    layoutConfig = {},
    lockSeatIndexesForHost = [0],
    seatConfig = {},
    // extends
    memberListConfig = {},
  } = config;
  const {
    showInRoomMessageButton = true,
    hostButtons = [
      ZegoMenuBarButtonName.toggleMicrophoneButton,
      ZegoMenuBarButtonName.showMemberListButton,
    ],
    speakerButtons = [
      ZegoMenuBarButtonName.toggleMicrophoneButton,
      ZegoMenuBarButtonName.showMemberListButton,
    ],
    audienceButtons = [ZegoMenuBarButtonName.showMemberListButton],
    hostExtendButtons = [],
    speakerExtendButtons = [],
    audienceExtendButtons = [],
    maxCount = 5,
  } = bottomMenuBarConfig;
  // const { title, message, cancelButtonName, confirmButtonName } =
  //   confirmDialogInfo;
  const {
    rowConfigs = [
      ZegoLiveAudioRoomLayoutRowConfig,
      ZegoLiveAudioRoomLayoutRowConfig,
    ],
    rowSpacing = 0,
  } = layoutConfig;

  const {
    // showSoundWavesInAudioMode = true,
    foregroundBuilder,
    backgroundColor = 'transparent',
    backgroundImage,
  } = seatConfig;

  const { showMicrophoneState = true, itemBuilder } = memberListConfig;
  const keyboardHeight = useKeyboard();
  const [textInputVisable, setTextInputVisable] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textInputHeight, setTextInputHeight] = useState(45);
  const [isCallMemberListVisable, setIsCallMemberListVisable] = useState(false);

  const [menuBarButtons, setMenuBarButtons] = useState([]);
  const [menuBarExtendedButtons, setMenuBarExtendedButtons] = useState([]);

  const [isInit, setIsInit] = useState(false);
  const [seatingAreaData, setSeatingAreaData] = useState([]); // 坐席区渲染数组
  // const [hostID, setHostID] = useState('');
  const memberList = ZegoUIKit.getAllUsers(); // 判断host（还未做）

  const callbackID =
    'ZegoUIKitPrebuiltLiveAudioRoom' +
    String(Math.floor(Math.random() * 10000));

  const onFullPageTouch = () => {
    setIsCallMemberListVisable(false);
  };

  const grantPermissions = async (callback) => {
    // Android: Dynamically obtaining device permissions
    if (Platform.OS == 'android') {
      // Check if permission granted
      let grantedAudio = PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      let grantedCamera = PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      const ungrantedPermissions = [];
      try {
        const isAudioGranted = await grantedAudio;
        const isVideoGranted = await grantedCamera;
        if (!isAudioGranted) {
          ungrantedPermissions.push(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );
        }
        if (!isVideoGranted) {
          ungrantedPermissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
        }
      } catch (error) {
        ungrantedPermissions.push(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
      }
      // If not, request it
      return PermissionsAndroid.requestMultiple(ungrantedPermissions).then(
        (data) => {
          console.warn('requestMultiple', data);
          if (callback) {
            callback();
          }
        }
      );
    } else if (callback) {
      callback();
    }
  };

  useEffect(() => {
    console.log('===hostid changed', hostID);
  }, [hostID]);
  useEffect(() => {
    return () => {
      // ZegoUIKit.onAudioVideoAvailable(callbackID);
      // ZegoUIKit.onUserJoin(callbackID);
      // ZegoUIKit.onUserLeave(callbackID);
    };
  }, []);

  useEffect(() => {
    console.log('===useeffect');
    ZegoUIKit.init(appID, appSign, { userID: userID, userName: userName })
      .then(() => {
        ZegoUIKit.turnCameraOn('', false);
        ZegoUIKit.turnMicrophoneOn('', turnOnMicrophoneWhenJoining);
        ZegoUIKit.setAudioOutputToSpeaker(useSpeakerWhenJoining);
        grantPermissions(() => {
          ZegoUIKit.joinRoom(roomID).then((data) => {
            console.log(
              '===prebuilt uikit join room success',
              data,
              lockSeatIndexesForHost,
              roomID
            );
            ZegoPrebuiltPlugins.init(
              appID,
              appSign,
              userID,
              userName,
              plugins
            ).then(() => {
              // setIsInit(true);
              pluginJoinRoom(roomID);
            });
          });
        });
      })
      .catch((err) => {
        console.log('===err', err);
      });

    return () => {
      ZegoUIKit.leaveRoom();
      ZegoPrebuiltPlugins.uninit();
    };
  }, []);

  const pluginJoinRoom = (roomID) => {
    return ZegoUIKit.getSignalingPlugin()
      .joinRoom(roomID)
      .then((data) => {
        if (!data.code) {
          console.log('===plugin join room success', role);

          ZegoUIKit.getSignalingPlugin().onUsersInRoomAttributesUpdated(
            callbackID,
            (key, attributes, oldAttributes, editor) => {
              // updateLayout();
              console.log(
                '===onUsersInRoomAttributesUpdated',
                userID,
                seatingAreaData,
                key,
                attributes,
                oldAttributes,
                editor
              );

              // seatingAreaData.forEach((rowSeat, index) => {
              //   rowSeat.forEach((seat) => {
              //     if (!roomProperties.get(seat.seatIndex.toString())) {
              //       // 踢下麦位
              //       seat.userID = '';
              //       seat.role = undefined;
              //     }
              //   });
              // });
            }
          );
          ZegoUIKit.getSignalingPlugin().onRoomPropertiesUpdated(
            callbackID,
            (key, oldValue, newValue) => {
              console.log(
                '===onRoomPropertiesUpdated',
                userID,
                key,
                oldValue,
                newValue,
                ZegoUIKit.getSignalingPlugin().getRoomProperties(),
                hostID
              );
              updateLayout();
            }
          );
          replaceBottomMenuBarButtons(audienceButtons);
          replaceBottomMenuBarExtendButtons(audienceExtendButtons);
          // updateLayout();
          if (config.role === ZegoLiveAudioRoomRole.host) {
            console.log('===1', userID);
            setHostID(userID);
            // updateLayout();
            console.log('===2', hostID);
          } else {
            ZegoUIKit.getSignalingPlugin()
              .queryUsersInRoomAttributes()
              .then((data) => {
                console.log(
                  '===queryUsersInRoomAttributes',
                  data.usersInRoomAttributes
                );
                if (!data.code) {
                  data.usersInRoomAttributes.forEach((v, k) => {
                    if (v.role == 0) {
                      setHostID(k);
                    }
                  });
                  updateLayout();
                }
              });
          }
          if (config.role == ZegoLiveAudioRoomRole.host) {
            console.log('===is host', role, config.role);
            ZegoUIKit.getSignalingPlugin()
              .updateRoomProperty(config.seatIndex, userID, true, true, true)
              .then((data) => {
                // 如果设置成功了，则设置成员的房间属性，标记为host
                console.log('===updateRoomProperty', data);
                if (!data.code) {
                  ZegoUIKit.getSignalingPlugin()
                    .setUsersInRoomAttributes('role', config.role.toString(), [
                      userID,
                    ])
                    .then((data) => {
                      console.log('===setUsersInRoomAttributes', data);
                      if (!data.code) {
                        // 设置成员房间属性成功，更新坐席区视图，更新按钮组件
                        // updateLayout();
                        replaceBottomMenuBarButtons(hostButtons);
                        replaceBottomMenuBarExtendButtons(hostExtendButtons);
                      } else {
                        // 设置成员房间属性失败，回滚为观众身份，回滚坐席坐标为 -1
                        config.role = ZegoLiveAudioRoomRole.audience;
                        config.seatIndex = -1;
                        console.log('Set role attribute failed');
                      }
                    });
                }
              });
          } else if (config.role == ZegoLiveAudioRoomRole.speaker) {
            // 如果是speaker，则尝试抢麦
            ZegoUIKit.getSignalingPlugin().updateRoomProperty(
              config.seatIndex,
              userID,
              true,
              false,
              false,
              (errorCode, errorMessage, errorKeys) => {
                // 如果抢麦位不成功，那么把该成员的角色打回观众
                if (errorCode != 0) {
                  config.role = ZegoLiveAudioRoomRole.audience;
                  config.seatIndex = -1;
                } else {
                  ZegoUIKit.getSignalingPlugin().setUsersInRoomAttributes(
                    'role',
                    config.role.toString(),
                    [userID],
                    (errorCode, errorMessage) => {
                      if (errorCode != 0) {
                        console.warn('Set role attribute failed', errorMessage);
                      } else {
                        // updateLayout();
                        replaceBottomMenuBarButtons(speakerButtons);
                        replaceBottomMenuBarExtendButtons(speakerExtendButtons);
                      }
                    }
                  );
                }
              }
            );
          }
        }
      });
  };
  // const updateLayout = () => {
  // const roomProperties = ZegoUIKit.getSignalingPlugin().getRoomProperties();
  // 先对比一下当前坐席中，是否有席位不在 roomProperties 中，如果是，证明该席位需要销毁
  // seatingAreaData.forEach((rowSeat, index) => {
  //   rowSeat.forEach((seat) => {
  //     if (!roomProperties.get(seat.seatIndex.toString())) {
  //       // 踢下麦位
  //       seat.userID = '';
  //       seat.role = undefined;
  //     }
  //   });
  // });
  // constructData(rowConfigs, roomProperties);
  // };
  const updateLayout = () => {
    const roomProperties = ZegoUIKit.getSignalingPlugin().getRoomProperties();
    console.log('===updateLayout', hostID);
    const arr = [];
    let num = 0;
    rowConfigs.forEach((row, index) => {
      const rowObj = { alignment: row.alignment };
      const rowSeatObj = new Map();
      for (let i = 0; i < row.count; i++) {
        const seatIndex = num;
        num++;
        const userID = roomProperties[seatIndex];
        const role =
          userID == hostID
            ? ZegoLiveAudioRoomRole.host
            : ZegoLiveAudioRoomRole.audience;
        rowSeatObj.set(seatIndex, {
          seatIndex,
          userID,
          role,
          seatSpacing: row.seatSpacing,
        });
      }
      rowObj.seatList = rowSeatObj;
      arr.push(rowObj);
      setSeatingAreaData(arr);
      console.log('===arr', arr, seatingAreaData);
    });
  };
  // replace BottomMenuBarButtons
  const replaceBottomMenuBarButtons = (buttons) => {
    setMenuBarButtons(buttons);
  };
  const replaceBottomMenuBarExtendButtons = (extendButtons) => {
    setMenuBarExtendedButtons(extendButtons);
  };

  const showDefaultLeaveDialog = () => {
    return new Promise((resolve, reject) => {
      if (!confirmDialogInfo) {
        resolve();
      } else {
        const {
          title = 'Leave the live streaming',
          message = 'Are you sure to leave the live streaming?',
          cancelButtonName = 'Cancel',
          confirmButtonName = 'Confirm',
        } = confirmDialogInfo;
        Alert.alert(title, message, [
          {
            text: cancelButtonName,
            onPress: () => reject(),
            style: 'cancel',
          },
          {
            text: confirmButtonName,
            onPress: () => resolve(),
          },
        ]);
      }
    });
  };

  // show or hide member list
  function onOpenCallMemberList() {
    setIsCallMemberListVisable(true);
  }
  function onCloseCallMemberList() {
    setIsCallMemberListVisable(false);
  }

  const onSeatItemClick = (index) => {
    console.log('===onSeatItemClick', role, index);
    const roomProperties = ZegoUIKit.getSignalingPlugin().getRoomProperties();
    if (role == ZegoLiveAudioRoomRole.host) {
      // 遍历房间属性的key，先检查麦位是否被占了（是否有房间属性的key与index相同）
      for (let key in roomProperties) {
        console.log('===key', key, index);
        if (key == index && roomProperties[key] !== userID) {
          ZegoUIKit.getSignalingPlugin()
            .deleteRoomProperties([index.toString()], true)
            .then((data) => {
              console.log('===deleteRoomProperties', data);
              if (!data.code) {
              }
            })
            .catch((err) => {
              console.log('==err', err);
            });
        }
      }
    } else {
      // 检查一下席位是否被占据
      for (let key in roomProperties) {
        if (key == index) {
          console.log('Seat has been taken', index);
          if (roomProperties[key] == userID) {
            // 自己占据，下麦
            console.log('===role', config.role);
          }
        } else {
          // 检查自己是否已有麦位
          const oldIndex = getSeatIndexByUserID(userID);
          if (oldIndex !== -1) {
            // 切换麦位
            ZegoUIKit.getSignalingPlugin().beginRoomPropertiesBatchOperation(
              true,
              false,
              false
            );
            ZegoUIKit.getSignalingPlugin().updateRoomProperty(index, userID);
            ZegoUIKit.getSignalingPlugin().deleteRoomProperties([
              oldIndex.toString(),
            ]);
            ZegoUIKit.getSignalingPlugin()
              .endRoomPropertiesBatchOperation()
              .then((data) => {
                console.log('===endRoomPropertiesBatchOperation data', data);
                if (!data.code) {
                  // updateLayout();
                } else {
                  console.log('Switch seat failed: ');
                }
              });
          } else {
            // 上麦
            console.log('===上麦');
            ZegoUIKit.getSignalingPlugin()
              .updateRoomProperty(index, userID, true, false, false)
              .then((data) => {
                console.log('===update', data);
                if (!data.code) {
                  config.role = ZegoLiveAudioRoomRole.speaker;
                  // updateLayout();

                  replaceBottomMenuBarButtons(speakerButtons);
                  replaceBottomMenuBarExtendButtons(speakerExtendButtons);
                  // 打开麦克风
                  // ZegoUIKit.turnMicrophoneOn(true);
                }
              })
              .catch((err) => {
                console.log('===update err', err);
              });
          }
        }
      }
    }
  };

  const getSeatIndexByUserID = (userID) => {
    const roomProperties = ZegoUIKit.getSignalingPlugin().getRoomProperties();
    for (let key in roomProperties) {
      if (roomProperties[key] == userID) {
        return key;
      }
    }
    return -1;
  };

  return (
    <View style={styles.container} onTouchStart={onFullPageTouch}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>A Live Audio Room</Text>
        <Text style={styles.id}>ID:{roomID}</Text>
      </View>
      <View style={styles.leaveButton}>
        <ZegoLeaveButton
          onLeaveConfirmation={showDefaultLeaveDialog}
          onPressed={onLeaveConfirmation}
          iconLeave={require('./resources/top_button_logout.png')}
          width={34}
          height={34}
        />
      </View>
      <View style={styles.seatingArea}>
        <ZegoSeatingArea
          role={role}
          userID={userID}
          rowSpacing={rowSpacing}
          foregroundBuilder={foregroundBuilder}
          seatIndex={role !== ZegoLiveAudioRoomRole.audience ? seatIndex : -1}
          onSeatItemClick={onSeatItemClick}
          backgroundColor={backgroundColor}
          backgroundImage={backgroundImage}
          seatingAreaData={seatingAreaData}
        ></ZegoSeatingArea>
      </View>
      {isCallMemberListVisable ? (
        <ZegoLiveAudioRoomMemberList
          showMicrophoneState={showMicrophoneState}
          itemBuilder={itemBuilder}
          onCloseCallMemberList={onCloseCallMemberList}
        />
      ) : (
        <View />
      )}
      <View style={styles.messageListView}>
        <ZegoInRoomMessageView style={styles.fillParent} />
      </View>
      <KeyboardAvoidingView
        style={[styles.fillParent, { zIndex: 9 }]}
        behavior={'padding'}
      >
        {Platform.OS != 'ios' && keyboardHeight > 0 ? null : (
          <ZegoBottomBar
            menuBarButtonsMaxCount={maxCount}
            menuBarButtons={menuBarButtons}
            menuBarExtendedButtons={menuBarExtendedButtons}
            turnOnMicrophoneWhenJoining={turnOnMicrophoneWhenJoining}
            useSpeakerWhenJoining={useSpeakerWhenJoining}
            showInRoomMessageButton={showInRoomMessageButton}
            onMessageButtonPress={() => {
              setTextInputVisable(true);
            }}
            onOpenCallMemberList={onOpenCallMemberList}
          />
        )}
        {textInputVisable ? (
          <View
            style={[
              styles.messageInputPannel,
              {
                bottom: Platform.OS == 'ios' ? keyboardHeight : 0,
                height: textInputHeight,
              },
            ]}
          >
            <ZegoInRoomMessageInput
              ref={(input) => {
                setTextInput(input);
              }}
              onContentSizeChange={(width, height) => {
                setTextInputHeight(height);
              }}
              placeholder={'Say something...'}
              onSumit={() => {
                setTextInputVisable(false);
              }}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  fillParent: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  titleBar: {
    width: '100%',
    height: 54,
    position: 'absolute',
    top: 55,
    paddingLeft: 18,
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
  leaveButton: {
    position: 'absolute',
    top: 65,
    right: 10,
    zIndex: 10,
  },
  messageListView: {
    position: 'absolute',
    left: 16,
    bottom: 62,
    width: 270,
    maxHeight: 200,
    zIndex: 12,
  },
  messageInputPannel: {
    position: 'absolute',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7500)',
    width: '100%',
    zIndex: 11,
  },
  memberButton: {
    position: 'absolute',
    top: 42,
    right: 52,
    width: 53,
    height: 28,
    backgroundColor: 'rgba(30, 39, 64, 0.4000)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
    zIndex: 10,
  },
  memberCountLabel: {
    fontSize: 14,
    color: 'white',
    marginLeft: 3,
  },
  seatingArea: {
    position: 'absolute',
    top: 125,
    width: '100%',
    zIndex: 11,
  },
});

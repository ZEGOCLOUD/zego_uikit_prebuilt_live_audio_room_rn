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
import Delegate from 'react-delegate-component';
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
const ZegoDialogInfo = {
  title: '',
  message: '',
  cancelButtonName: '',
  confirmButtonName: '',
};
const ZegoTranslationText = {
  prebuiltTitle: 'Live Audio Room',
  removeSpeakerMenuDialogButton: 'Remove %0 from seat',
  takeSeatMenuDialogButton: 'Take the seat',
  leaveSeatMenuDialogButton: 'Leave the seat',
  cancelMenuDialogButton: 'Cancel',
  memberListTitle: 'Attendance',
  removeSpeakerFailedToast: 'Failed to remove %0 from seat', // 红色
  microphonePermissionSettingDialogInfo: {
    title: 'Can not use Microphone!',
    message: 'Please enable microphone access in the system settings!',
    cancelButtonName: 'Cancel',
    confirmButtonName: 'Settings',
  },
  leaveSeatDialogInfo: {
    title: 'Leave the seat',
    message: 'Are you sure to leave the seat?',
    cancelButtonName: 'Cancel',
    confirmButtonName: 'OK',
  },
  removeSpeakerFromSeatDialogInfo: {
    title: 'Remove from seat',
    message: 'Are you sure to remove %0 from seat?',
    cancelButtonName: 'Cancel',
    confirmButtonName: 'OK',
  },
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
    translationText = ZegoTranslationText,
    layoutConfig = {},
    lockSeatIndexesForHost = [0],
    seatConfig = {},
    background,
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

  let hostID = '';

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
            ZegoPrebuiltPlugins.init(appID, appSign, userID, userName, plugins)
              .then(() => {
                setIsInit(true);
                console.log('===init success');
                pluginJoinRoom(roomID);
              })
              .catch((err) => {
                console.log('===init err', err);
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
    console.log('===plugin join room');
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
                oldValue === userID
              );
              if (oldValue == userID && !newValue) {
                console.log('===被踢下麦');
                config.role = ZegoLiveAudioRoomRole.audience;
                replaceBottomMenuBarButtons(audienceButtons);
                replaceBottomMenuBarExtendButtons(audienceExtendButtons);
                ZegoUIKit.turnMicrophoneOn('', false);
              }
              updateLayout();
            }
          );
          replaceBottomMenuBarButtons(audienceButtons);
          replaceBottomMenuBarExtendButtons(audienceExtendButtons);
          // 设置当前房间的hostID
          if (config.role === ZegoLiveAudioRoomRole.host) {
            hostID = userID;
          } else {
            ZegoUIKit.getSignalingPlugin()
              .queryUsersInRoomAttributes()
              .then((data) => {
                if (!data.code) {
                  data.usersInRoomAttributes.forEach((v, k) => {
                    if (v.role == 0) {
                      hostID = k;
                    }
                  });
                  updateLayout();
                }
              });
          }
          if (config.role == ZegoLiveAudioRoomRole.host) {
            console.log('===is host', role, config.role);
            // 如果是host，先强制抢占指定的麦位
            ZegoUIKit.getSignalingPlugin()
              .updateRoomProperty(config.seatIndex, userID, true, true, true)
              .then((data) => {
                // 如果麦位设置成功了，则设置成员的房间属性，标记为host
                console.log('===updateRoomProperty', data);
                if (!data.code) {
                  ZegoUIKit.getSignalingPlugin()
                    .setUsersInRoomAttributes('role', config.role.toString(), [
                      userID,
                    ])
                    .then((data) => {
                      console.log('===setUsersInRoomAttributes', data);
                      if (!data.code) {
                        // 设置成员房间属性成功
                        replaceBottomMenuBarButtons(hostButtons);
                        replaceBottomMenuBarExtendButtons(hostExtendButtons);
                      } else {
                        // 设置成员房间属性失败，回滚为观众身份
                        leaveSeat(config.seatIndex);
                        config.role = ZegoLiveAudioRoomRole.audience;
                      }
                    });
                }
              });
          } else if (config.role == ZegoLiveAudioRoomRole.speaker) {
            // 如果是speaker，则尝试抢麦
            ZegoUIKit.getSignalingPlugin()
              .updateRoomProperty(config.seatIndex, userID, true, false, false)
              .then((data) => {
                // 如果抢麦位不成功，那么把该成员的角色打回观众
                if (!data.code) {
                  replaceBottomMenuBarButtons(speakerButtons);
                  replaceBottomMenuBarExtendButtons(speakerExtendButtons);
                } else {
                  config.role = ZegoLiveAudioRoomRole.audience;
                }
              });
          }
        }
      });
  };
  const updateLayout = () => {
    // const roomProperties = ZegoUIKit.getSignalingPlugin().queryRoomProperties();
    console.log('==getUser', ZegoUIKit.getUser(userID));
    ZegoUIKit.getSignalingPlugin()
      .queryRoomProperties()
      .then((data) => {
        if (!data.code) {
          const roomProperties = data._roomAttributes;
          const arr = [];
          let num = 0;
          rowConfigs.forEach((row, index) => {
            const rowObj = { alignment: row.alignment };
            const rowSeatObj = new Map();
            for (let i = 0; i < row.count; i++) {
              const seatIndex = num;
              num++;
              const userID = roomProperties[seatIndex];
              let role = ZegoLiveAudioRoomRole.audience;
              if (userID) {
                role =
                  userID == hostID
                    ? ZegoLiveAudioRoomRole.host
                    : ZegoLiveAudioRoomRole.speaker;
              }
              rowSeatObj.set(seatIndex, {
                seatIndex,
                userID,
                role,
                seatSpacing: row.seatSpacing,
              });
            }
            rowObj.seatList = rowSeatObj;
            arr.push(rowObj);
            console.log('===row', rowObj);
          });
          setSeatingAreaData(arr);
        }
      });
  };

  const onSeatItemClick = (index) => {
    console.log('===onSeatItemClick', role, index);
    ZegoUIKit.getSignalingPlugin()
      .queryRoomProperties()
      .then(async (data) => {
        if (!data.code) {
          const roomProperties = data._roomAttributes;
          if (role == ZegoLiveAudioRoomRole.host) {
            // 遍历房间属性的key，先检查麦位是否被占了（是否有房间属性的key与index相同）
            // host 踢 speaker 下麦
            if (roomProperties[index] && roomProperties[index] !== userID) {
              const dialogInfo =
                ZegoTranslationText.removeSpeakerFromSeatDialogInfo;
              if (dialogInfo.message.indexOf('%0') > -1) {
                dialogInfo.message = dialogInfo.message.replace(
                  '%0',
                  roomProperties[index]
                );
              }
              showDialog(dialogInfo)
                .then(() => {
                  console.log('===dialog ok', roomProperties);
                  leaveSeat(index);
                })
                .catch(() => {
                  console.log('===dialog cancel');
                });
            }
          } else {
            // speaker
            // 检查一下席位是否被占据
            let seated = false;
            for (let key in roomProperties) {
              if (key == index) {
                seated = true;
              }
            }
            if (seated) {
              console.log('Seat has been taken', index);
              if (roomProperties[index] == userID) {
                // 自己占据，下麦
                console.log('===role', config.role);
                showDialog(ZegoTranslationText.leaveSeatDialogInfo)
                  .then(() => {
                    console.log('===dialog ok', roomProperties);
                    leaveSeat(index);
                  })
                  .catch(() => {
                    console.log('===dialog cancel');
                  });
              }
            } else {
              // 检查自己是否已有麦位
              const oldIndex = await getSeatIndexByUserID(userID);
              console.log('===oldindex', oldIndex);
              if (oldIndex && oldIndex !== -1) {
                // 切换麦位
                ZegoUIKit.getSignalingPlugin().beginRoomPropertiesBatchOperation(
                  true,
                  false,
                  false
                );
                ZegoUIKit.getSignalingPlugin().updateRoomProperty(
                  index,
                  userID
                );
                ZegoUIKit.getSignalingPlugin()
                  .deleteRoomProperties([oldIndex.toString()])
                  .then((data) => {
                    console.log('===delete room properties success', data);
                  })
                  .catch((err) => {
                    console.log('===delete room properties err', err);
                  });
                ZegoUIKit.getSignalingPlugin()
                  .endRoomPropertiesBatchOperation()
                  .then((data) => {
                    console.log(
                      '===endRoomPropertiesBatchOperation data',
                      data
                    );
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
                    if (!data.code) {
                      config.role = ZegoLiveAudioRoomRole.speaker;
                      replaceBottomMenuBarButtons(speakerButtons);
                      replaceBottomMenuBarExtendButtons(speakerExtendButtons);
                      // 打开麦克风
                      ZegoUIKit.turnMicrophoneOn('', true);
                    }
                  })
                  .catch((err) => {
                    console.log('===update err', err);
                  });
              }
            }
          }
        }
      });
  };

  const leaveSeat = (index) => {
    ZegoUIKit.getSignalingPlugin()
      .deleteRoomProperties([index.toString()], true)
      .then((data) => {
        console.log('===deleteRoomProperties', data);
        if (!data.code) {
          config.role = ZegoLiveAudioRoomRole.audience;
          replaceBottomMenuBarButtons(audienceButtons);
          replaceBottomMenuBarExtendButtons(audienceExtendButtons);
          ZegoUIKit.turnMicrophoneOn('', false);
        }
      })
      .catch((err) => {
        console.log('==err', err);
      });
  };
  const getSeatIndexByUserID = async (userID) => {
    let index = -1;
    await ZegoUIKit.getSignalingPlugin()
      .queryRoomProperties()
      .then((data) => {
        console.log('===getseatindex', data);
        if (!data.code) {
          const roomProperties = data._roomAttributes;
          for (let key in roomProperties) {
            if (roomProperties[key] == userID) {
              index = key;
            }
          }
        }
      });
    return index;
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

  const showDialog = (dialogInfo) => {
    return new Promise((resolve, reject) => {
      Alert.alert(dialogInfo.title, dialogInfo.message, [
        {
          text: dialogInfo.cancelButtonName,
          onPress: () => reject(),
          style: 'cancel',
        },
        {
          text: dialogInfo.confirmButtonName,
          onPress: () => resolve(),
        },
      ]);
    });
  };

  // replace BottomMenuBarButtons
  const replaceBottomMenuBarButtons = (buttons) => {
    setMenuBarButtons(buttons);
  };
  const replaceBottomMenuBarExtendButtons = (extendButtons) => {
    setMenuBarExtendedButtons(extendButtons);
  };

  // show or hide member list
  function onOpenCallMemberList() {
    setIsCallMemberListVisable(true);
  }
  function onCloseCallMemberList() {
    setIsCallMemberListVisable(false);
  }
  function MaskViewDefault(props) {
    const { userInfo } = props;
    const { userName = '' } = userInfo;
    return (
      <View style={styles.defaultMaskContainer}>
        <View style={styles.defaultMaskNameLabelContainer}>
          <Text style={styles.defaultMaskNameLabel}>{userName}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container} onTouchStart={onFullPageTouch}>
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
        {isInit ? (
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
          />
        ) : null}
      </View>
      {isCallMemberListVisable ? (
        // <View >
        <ZegoLiveAudioRoomMemberList
          style={styles.memberListBox}
          seatingAreaData={seatingAreaData}
          showMicrophoneState={showMicrophoneState}
          itemBuilder={itemBuilder}
          onCloseCallMemberList={onCloseCallMemberList}
        />
      ) : (
        // </View>
        <View />
      )}
      <View style={styles.messageListView}>
        <ZegoInRoomMessageView style={styles.fillParent} />
      </View>
      <KeyboardAvoidingView
        style={[styles.fillParent, { zIndex: 0 }]}
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
      <Delegate
        style={styles.mask}
        to={background}
        default={MaskViewDefault}
        props={{ userID }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 2,
    backgroundColor: 'red',
  },
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
    zIndex: 3,
  },
  memberListBox: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 12,
  },
});

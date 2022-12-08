import React, { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Delegate from 'react-delegate-component';
import ZegoUIKit, {
  ZegoLeaveButton,
  ZegoInRoomMessageInput,
  ZegoInRoomMessageView,
} from '@zegocloud/zego-uikit-rn';
import ZegoBottomBar from './ZegoBottomBar';
import { useKeyboard } from './utils/keyboard';
import ZegoSeatingArea from './ZegoSeatingArea';
import ZegoLiveAudioRoomMemberList from './ZegoLiveAudioRoomMemberList';
import ZegoPrebuiltPlugins from './utils/plugins';
import {
  ZegoLiveAudioRoomRole,
  ZegoLiveAudioRoomLayoutAlignment,
  ZegoLiveAudioRoomLayoutRowConfig,
  ZegoBottomMenuBarConfig,
  // ZegoDialogInfo,
  ZegoTranslationText,
} from './define';

const HOST_DEFAULT_CONFIG = {
  role: ZegoLiveAudioRoomRole.host,
  takeSeatIndexWhenJoining: 0,
  turnOnMicrophoneWhenJoining: true,
  confirmDialogInfo: {
    title: 'Stop the live',
    message: 'Are you sure to stop the live?',
    cancelButtonName: 'Cancel',
    confirmButtonName: 'Stop it',
  },
};

const AUDIENCE_DEFAULT_CONFIG = {
  role: ZegoLiveAudioRoomRole.audience,
};

export {
  ZegoLiveAudioRoomRole,
  HOST_DEFAULT_CONFIG,
  AUDIENCE_DEFAULT_CONFIG,
  ZegoLiveAudioRoomLayoutAlignment,
};
export default function ZegoUIKitPrebuiltLiveAudioRoom(props) {
  const { appID, appSign, userID, userName, roomID, config, plugins } = props;
  const {
    role = ZegoLiveAudioRoomRole.audience,
    takeSeatIndexWhenJoining = -1,
    turnOnMicrophoneWhenJoining = false,
    useSpeakerWhenJoining = true,
    bottomMenuBarConfig = ZegoBottomMenuBarConfig,
    confirmDialogInfo = {},
    onLeaveConfirmation,
    translationText = ZegoTranslationText,
    layoutConfig = {},
    lockSeatIndexesForHost = [0],
    seatConfig = {},
    background,
  } = config;
  const {
    rowConfigs = [
      ZegoLiveAudioRoomLayoutRowConfig,
      ZegoLiveAudioRoomLayoutRowConfig,
    ],
    rowSpacing = 0,
  } = layoutConfig;

  const {
    showSoundWavesInAudioMode = true,
    foregroundBuilder,
    backgroundColor = 'transparent',
    backgroundImage,
  } = seatConfig;

  let hostID = '';

  const keyboardHeight = useKeyboard();
  const [textInputVisable, setTextInputVisable] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textInputHeight, setTextInputHeight] = useState(45);
  const [isCallMemberListVisable, setIsCallMemberListVisable] = useState(false);

  const [menuBarButtons, setMenuBarButtons] = useState([]);
  const [menuBarExtendedButtons, setMenuBarExtendedButtons] = useState([]);

  const [isInit, setIsInit] = useState(false);
  const [seatingAreaData, setSeatingAreaData] = useState([]); // 坐席区渲染数组
  const [modalVisible, setModalVisible] = useState(false);
  const [clickSeatIndex, setClickSeatIndex] = useState(-1);
  const [modalText, setModalText] = useState('');
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
      // let grantedCamera = PermissionsAndroid.check(
      //   PermissionsAndroid.PERMISSIONS.CAMERA
      // );
      const ungrantedPermissions = [];
      try {
        const isAudioGranted = await grantedAudio;
        // const isVideoGranted = await grantedCamera;
        if (!isAudioGranted) {
          ungrantedPermissions.push(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );
        }
        // if (!isVideoGranted) {
        //   ungrantedPermissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
        // }
      } catch (error) {
        ungrantedPermissions.push(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          // PermissionsAndroid.PERMISSIONS.CAMERA
        );
      }
      // If not, request it
      return PermissionsAndroid.requestMultiple(ungrantedPermissions).then(
        (data) => {
          console.warn('requestMultiple', data);
          if (callback) {
            callback();
          }
          if (data && data['android.permission.RECORD_AUDIO'] === 'denied') {
            console.log('===拒绝了麦克风权限');
            showDialog(translationText.microphonePermissionSettingDialogInfo)
              .then(() => {
                console.log('===dialog ok');
                PermissionsAndroid.requestMultiple(ungrantedPermissions).then(
                  (data) => {
                    console.log('requestMultiple', data);
                  }
                );
              })
              .catch(() => {
                console.log('===dialog cancel');
              });
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
    if (
      (role == ZegoLiveAudioRoomRole.host ||
        role == ZegoLiveAudioRoomRole.speaker) &&
      takeSeatIndexWhenJoining < 0
    ) {
      config.role = ZegoLiveAudioRoomRole.audience;
      config.takeSeatIndexWhenJoining = -1;
    } else if (
      role == ZegoLiveAudioRoomRole.speaker &&
      lockSeatIndexesForHost.some((item) => item === takeSeatIndexWhenJoining)
    ) {
      config.role = ZegoLiveAudioRoomRole.audience;
      config.takeSeatIndexWhenJoining = -1;
    }
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
                replaceBottomMenuBarButtons(
                  bottomMenuBarConfig.audienceButtons
                );
                replaceBottomMenuBarExtendButtons(
                  bottomMenuBarConfig.audienceExtendButtons
                );
                ZegoUIKit.turnMicrophoneOn('', false);
              }
              updateLayout();
            }
          );
          replaceBottomMenuBarButtons(bottomMenuBarConfig.audienceButtons);
          replaceBottomMenuBarExtendButtons(
            bottomMenuBarConfig.audienceExtendButtons
          );
          // 设置当前房间的hostID
          if (role === ZegoLiveAudioRoomRole.host) {
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
          if (role == ZegoLiveAudioRoomRole.host) {
            console.log('===is host', role, config.role);
            // 如果是host，先强制抢占指定的麦位
            ZegoUIKit.getSignalingPlugin()
              .updateRoomProperty(
                config.takeSeatIndexWhenJoining,
                userID,
                true,
                true,
                true
              )
              .then((data) => {
                // 如果麦位设置成功了，则设置成员的房间属性，标记为host
                console.log('===updateRoomProperty', data);
                if (!data.code) {
                  ZegoUIKit.getSignalingPlugin()
                    .setUsersInRoomAttributes('role', role.toString(), [userID])
                    .then((data) => {
                      console.log('===setUsersInRoomAttributes', data);
                      if (!data.code) {
                        // 设置成员房间属性成功
                        replaceBottomMenuBarButtons(
                          bottomMenuBarConfig.hostButtons
                        );
                        replaceBottomMenuBarExtendButtons(
                          bottomMenuBarConfig.hostExtendButtons
                        );
                      } else {
                        // 设置成员房间属性失败，回滚为观众身份
                        leaveSeat(takeSeatIndexWhenJoining);
                        config.role = ZegoLiveAudioRoomRole.audience;
                      }
                    });
                }
              });
          } else if (role == ZegoLiveAudioRoomRole.speaker) {
            // 如果是speaker，则尝试抢麦
            ZegoUIKit.getSignalingPlugin()
              .updateRoomProperty(
                takeSeatIndexWhenJoining,
                userID,
                true,
                false,
                false
              )
              .then((data) => {
                // 如果抢麦位不成功，那么把该成员的角色打回观众
                if (!data.code) {
                  replaceBottomMenuBarButtons(
                    bottomMenuBarConfig.speakerButtons
                  );
                  replaceBottomMenuBarExtendButtons(
                    bottomMenuBarConfig.speakerExtendButtons
                  );
                } else {
                  config.role = ZegoLiveAudioRoomRole.audience;
                }
              });
          }
        }
      });
  };
  const updateLayout = () => {
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
          });
          setSeatingAreaData(arr);
        }
      });
  };

  const onSeatItemClick = (index) => {
    console.log('===onSeatItemClick', role, index);
    setClickSeatIndex(index);
    ZegoUIKit.getSignalingPlugin()
      .queryRoomProperties()
      .then(async (data) => {
        if (!data.code) {
          const roomProperties = data._roomAttributes;
          console.log('===clickSeatObj', roomProperties);
          if (role == ZegoLiveAudioRoomRole.host) {
            // 遍历房间属性的key，先检查麦位是否被占了（是否有房间属性的key与index相同）
            // host 踢 speaker 下麦
            if (roomProperties[index] && roomProperties[index] !== userID) {
              let text = translationText.removeSpeakerMenuDialogButton;
              if (text.indexOf('%0') > -1) {
                text = text.replace(
                  '%0',
                  ZegoUIKit.getUser(roomProperties[index]).userName
                );
              }
              setModalVisible(true);
              setModalText(text);
            }
          } else {
            // speaker
            if (index === takeSeatIndexWhenJoining) {
              return false;
            }
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
                setModalVisible(true);
                setModalText(translationText.leaveSeatMenuDialogButton);
              }
            } else {
              // 检查自己是否已有麦位
              const oldIndex = await getSeatIndexByUserID(userID);
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
                console.log('===上麦', clickSeatIndex, index);
                setModalVisible(true);
                setModalText(translationText.takeSeatMenuDialogButton);
              }
            }
          }
        }
      });
  };

  const onModalPress = () => {
    setModalVisible(false);
    if (modalText.indexOf('Take the seat') > -1) {
      takeSeat();
    } else if (modalText.indexOf('Remove') > -1) {
      const dialogInfo = translationText.removeSpeakerFromSeatDialogInfo;
      if (dialogInfo.message.indexOf('%0') > -1) {
        dialogInfo.message = dialogInfo.message.replace(
          '%0',
          modalText.split(' ')[1]
        );
      }
      showDialog(dialogInfo)
        .then(() => {
          leaveSeat(clickSeatIndex);
        })
        .catch(() => {});
    } else if (modalText.indexOf('Leave') > -1) {
      showDialog(translationText.leaveSeatDialogInfo)
        .then(() => {
          leaveSeat(clickSeatIndex);
        })
        .catch(() => {});
    }
  };

  const takeSeat = () => {
    ZegoUIKit.getSignalingPlugin()
      .updateRoomProperty(clickSeatIndex, userID, true, false, false)
      .then((data) => {
        if (!data.code) {
          config.role = ZegoLiveAudioRoomRole.speaker;
          replaceBottomMenuBarButtons(bottomMenuBarConfig.speakerButtons);
          replaceBottomMenuBarExtendButtons(
            bottomMenuBarConfig.speakerExtendButtons
          );
          // 打开麦克风
          ZegoUIKit.turnMicrophoneOn('', true);
        }
      })
      .catch((err) => {
        console.log('===update err', err);
      });
  };
  const leaveSeat = (index) => {
    ZegoUIKit.getSignalingPlugin()
      .deleteRoomProperties([index.toString()], true)
      .then((data) => {
        console.log('===deleteRoomProperties', data);
        if (!data.code) {
          config.role = ZegoLiveAudioRoomRole.audience;
          replaceBottomMenuBarButtons(bottomMenuBarConfig.audienceButtons);
          replaceBottomMenuBarExtendButtons(
            bottomMenuBarConfig.audienceExtendButtons
          );
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
      console.log('===confirmDialogInfo', confirmDialogInfo);
      if (!confirmDialogInfo) {
        resolve();
      } else {
        const {
          title = 'Leave the room',
          message = 'Are you sure to leave the room?',
          cancelButtonName = 'Cancel',
          confirmButtonName = 'OK',
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
            seatIndex={
              role !== ZegoLiveAudioRoomRole.audience
                ? takeSeatIndexWhenJoining
                : -1
            }
            onSeatItemClick={onSeatItemClick}
            backgroundColor={backgroundColor}
            backgroundImage={backgroundImage}
            seatingAreaData={seatingAreaData}
            showSoundWavesInAudioMode={showSoundWavesInAudioMode}
          />
        ) : null}
      </View>
      {isCallMemberListVisable ? (
        // <View >
        <ZegoLiveAudioRoomMemberList
          style={styles.memberListBox}
          seatingAreaData={seatingAreaData}
          showMicrophoneState={true}
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
            menuBarButtonsMaxCount={bottomMenuBarConfig.maxCount}
            menuBarButtons={menuBarButtons}
            menuBarExtendedButtons={menuBarExtendedButtons}
            turnOnMicrophoneWhenJoining={turnOnMicrophoneWhenJoining}
            useSpeakerWhenJoining={useSpeakerWhenJoining}
            showInRoomMessageButton={
              bottomMenuBarConfig.showInRoomMessageButton
            }
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
      {/* 菜单 */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalMask}></View>
        </TouchableWithoutFeedback>
        <View style={styles.modalView}>
          <TouchableOpacity onPress={onModalPress}>
            <Text style={styles.modalText}>{modalText}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Delegate style={styles.mask} to={background} props={{ userID }} />
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

  modalMask: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalView: {
    position: 'absolute',
    left: '50%',
    right: '50%',
    bottom: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 315,
    height: 49,
    marginLeft: -157.5,
    marginRight: -157.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    width: 315,
    lineHeight: 49,
    textAlign: 'center',
  },
});

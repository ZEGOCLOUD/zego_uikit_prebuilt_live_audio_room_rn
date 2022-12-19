import React, { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  NativeModules,
  Linking,
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
import ZegoDialogModal from './ZegoDialogModal';
import ZegoToast from './ZegoToast';
import ZegoPrebuiltPlugins from './utils/plugins';
import {
  ZegoLiveAudioRoomRole,
  ZegoLiveAudioRoomLayoutAlignment,
  ZegoLiveAudioRoomLayoutRowConfig,
  ZegoMenuBarButtonName,
} from './define';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const HOST_DEFAULT_CONFIG = {
  role: ZegoLiveAudioRoomRole.host,
  takeSeatIndexWhenJoining: 0,
  turnOnMicrophoneWhenJoining: true,
  confirmDialogInfo: {
    title: 'Leave the room',
    message: 'Are you sure to leave the room?',
    cancelButtonName: 'Cancel',
    confirmButtonName: 'OK',
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
  ZegoMenuBarButtonName,
};
export default function ZegoUIKitPrebuiltLiveAudioRoom(props) {
  const { appID, appSign, userID, userName, roomID, config } = props;
  const {
    role = ZegoLiveAudioRoomRole.audience,
    takeSeatIndexWhenJoining = -1,
    turnOnMicrophoneWhenJoining = false,
    useSpeakerWhenJoining = true,
    bottomMenuBarConfig = {},
    confirmDialogInfo = {},
    onLeaveConfirmation,
    translationText = {},
    layoutConfig = {},
    hostSeatIndexes = [0],
    seatConfig = {},
    background,
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

  const {
    showSoundWavesInAudioMode = true,
    foregroundBuilder,
    backgroundColor = 'transparent',
    backgroundImage,
  } = seatConfig;

  let {
    removeSpeakerMenuDialogButton = 'Remove %0 from seat',
    takeSeatMenuDialogButton = 'Take the seat',
    leaveSeatMenuDialogButton = 'Leave the seat',
    cancelMenuDialogButton = 'Cancel',
    memberListTitle = 'Attendance',
    removeSpeakerFailedToast = 'Failed to remove %0 from seat', // 红色
    microphonePermissionSettingDialogInfo = {
      title: 'Can not use Microphone!',
      message: 'Please enable microphone access in the system settings!',
      cancelButtonName: 'Cancel',
      confirmButtonName: 'Settings',
    },
    leaveSeatDialogInfo = {
      title: 'Leave the seat',
      message: 'Are you sure to leave the seat?',
      cancelButtonName: 'Cancel',
      confirmButtonName: 'OK',
    },
    removeSpeakerFromSeatDialogInfo = {
      title: 'Remove the speaker',
      message: 'Are you sure to remove %0 from the seat?',
      cancelButtonName: 'Cancel',
      confirmButtonName: 'OK',
    },
  } = translationText;

  const {
    rowConfigs = [
      ZegoLiveAudioRoomLayoutRowConfig,
      ZegoLiveAudioRoomLayoutRowConfig,
    ],
    rowSpacing = 0,
  } = layoutConfig;

  let hostID = '';
  // let isRoomAttributesBatching = false;
  const [isRoomAttributesBatching, setIsRoomAttributesBatching] =
    useState(false);
  const [roomProperties, setRoomProperties] = useState({});
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

  const [clickSeatItem, setClickSeatItem] = useState({ index: -1, userID: '' });
  const [changedSeatItem, setChangedSeatItem] = useState({
    index: -1,
    userID: '',
  });

  const [modalText, setModalText] = useState('');

  // dialog
  const [dialogInfo, setDialogInfo] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [onDialogConfirmPress, setOnDialogConfirmPress] = useState(() => {});
  let [onDialogCancelPress, setOnDialogCancelPress] = useState('');

  // toast
  const [toastText, setToastText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const callbackID =
    'ZegoUIKitPrebuiltLiveAudioRoom' +
    String(Math.floor(Math.random() * 10000));

  const grantPermissions = async (callback) => {
    console.log('===grantPermissions');
    // Android: Dynamically obtaining device permissions
    if (Platform.OS == 'android') {
      // Check if permission granted
      let grantedAudio = PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      const ungrantedPermissions = [];
      try {
        const isAudioGranted = await grantedAudio;
        console.log('===isAudioGranted', isAudioGranted);
        if (!isAudioGranted) {
          ungrantedPermissions.push(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );
        }
      } catch (error) {
        ungrantedPermissions.push(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      }
      // If not, request it
      return PermissionsAndroid.requestMultiple(ungrantedPermissions).then(
        (data) => {
          console.warn('requestMultiple', data);
          if (callback) {
            callback();
          }
          if (data) {
            if (
              data['android.permission.RECORD_AUDIO'] === 'denied' ||
              data['android.permission.RECORD_AUDIO'] === 'never_ask_again'
            ) {
              const confirm = () => {
                NativeModules.OpenSettings.openNetworkSettings((data) => {
                  console.log('call back data', data);
                });
                setDialogVisible(false);
              };
              const cancel = () => {
                setDialogVisible(false);
              };
              showDialog(
                microphonePermissionSettingDialogInfo,
                confirm,
                cancel
              );
            }
          }
        }
      );
    } else {
      grantIOSPermissions(callback);
    }
  };

  const grantIOSPermissions = async (callback) => {
    console.log('******Check ios permission start******');
    try {
      const checkResult = await check(PERMISSIONS.IOS.MICROPHONE);
      console.log('******Check ios permission end******', checkResult);
      // RESULTS.UNAVAILABLE  This feature is not available (on this device / in this context)
      // RESULTS.DENIED The permission has not been requested / is denied but requestable
      // RESULTS.GRANTED  The permission is granted
      // RESULTS.LIMITED  The permission is granted but with limitations
      // RESULTS.BLOCKED  The permission is denied and not requestable anymore
      if (checkResult === RESULTS.UNAVAILABLE) {
        console.error(
          '******This feature is not available (on this device / in this context)******'
        );
      } else if (checkResult === RESULTS.DENIED) {
        console.log('******Request ios permission start******');
        const requestResult = await request(PERMISSIONS.IOS.MICROPHONE);
        console.log('******Request ios permission end******', requestResult);
        callback && callback();
      } else if (checkResult === RESULTS.BLOCKED) {
        const confirm = () => {
          console.log('******Open ios settings******');
          Linking.openSettings();
          setDialogVisible(false);
        };
        const cancel = () => {
          console.log('******Cancel open ios settings******');
          setDialogVisible(false);
        };
        showDialog(microphonePermissionSettingDialogInfo, confirm, cancel);
      }
    } catch (error) {
      console.error('******Check ios permission error******', error);
    }
  };

  useEffect(() => {
    if (modalText.indexOf('Leave') > -1 || modalText.indexOf('Remove') > -1) {
      if (changedSeatItem.index === clickSeatItem.index) {
        if (changedSeatItem.userID !== clickSeatItem.userID) {
          setModalVisible(false);
          setDialogVisible(false);
        }
      }
    }
  }, [changedSeatItem]);
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
      hostSeatIndexes.some((item) => item === takeSeatIndexWhenJoining)
    ) {
      config.role = ZegoLiveAudioRoomRole.audience;
      config.takeSeatIndexWhenJoining = -1;
    }
    ZegoUIKit.init(appID, appSign, { userID: userID, userName: userName })
      .then(() => {
        console.log('===zego uikit init success');
        ZegoUIKit.turnCameraOn('', false);
        ZegoUIKit.turnMicrophoneOn('', turnOnMicrophoneWhenJoining);
        ZegoUIKit.setAudioOutputToSpeaker(useSpeakerWhenJoining);
        ZegoUIKit.joinRoom(roomID).then(() => {
          console.log('===prebuilt uikit join room success');
          if (role !== ZegoLiveAudioRoomRole.audience) {
            grantPermissions();
          }
          pluginInit();
        });
      })
      .catch((err) => {
        console.log('===err', err);
      });

    return () => {
      ZegoUIKit.leaveRoom();
      ZegoUIKit.onUserLeave(callbackID);
      ZegoUIKit.getSignalingPlugin().onRoomPropertiesUpdated(callbackID);
      ZegoPrebuiltPlugins.uninit();
    };
  }, []);

  const pluginInit = () => {
    return ZegoPrebuiltPlugins.init(appID, appSign, userID, userName)
      .then(() => {
        setIsInit(true);
        console.log('===init success');
        pluginJoinRoom();
      })
      .catch((err) => {
        console.log('===init err', err);
      });
  };

  const pluginJoinRoom = () => {
    console.log('===plugin join room');
    return ZegoUIKit.getSignalingPlugin()
      .joinRoom(roomID)
      .then((data) => {
        if (!data.code) {
          console.log('===plugin join room success', role);
          registerUIKitListener();
          replaceBottomMenuBarButtons(audienceButtons);
          replaceBottomMenuBarExtendButtons(audienceExtendButtons);
          // 设置当前房间的hostID
          if (role === ZegoLiveAudioRoomRole.host) {
            hostID = userID;
          } else {
            ZegoUIKit.getSignalingPlugin()
              .queryUsersInRoomAttributes()
              .then((data) => {
                if (!data.code) {
                  console.log('===queryUsersInRoomAttributes', data);
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
            takeSeat(config.takeSeatIndexWhenJoining, true, true, true);
          } else if (role == ZegoLiveAudioRoomRole.speaker) {
            // 如果是speaker，则尝试抢麦
            takeSeat(config.takeSeatIndexWhenJoining, true, false, false);
          }
        }
      });
  };

  const registerUIKitListener = () => {
    ZegoUIKit.getSignalingPlugin().onUsersInRoomAttributesUpdated(
      callbackID,
      (key, attributes, oldAttributes, editor) => {
        hostID = editor;
        updateLayout();
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
          hostID,
          modalText,
          roomProperties[key]
        );
        setChangedSeatItem({ index: parseInt(key), userID: newValue });
        if (oldValue == userID && !newValue) {
          config.role = ZegoLiveAudioRoomRole.audience;
          replaceBottomMenuBarButtons(audienceButtons);
          replaceBottomMenuBarExtendButtons(audienceExtendButtons);
          ZegoUIKit.turnMicrophoneOn('', false);
        }
        updateLayout();
      }
    );
    ZegoUIKit.onUserLeave(callbackID, (users) => {
      console.log('===onUserLeave', users);
      users.forEach((user) => {
        if (user.userID == hostID) {
          hostID = '';
        }
      });
    });
  };

  const updateLayout = () => {
    ZegoUIKit.getSignalingPlugin()
      .queryRoomProperties()
      .then((data) => {
        if (!data.code) {
          const roomProperties = data._roomAttributes;
          setRoomProperties(data._roomAttributes);
          const arr = [];
          let num = 0;
          rowConfigs.forEach(async (row) => {
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
    setClickSeatItem({ index, userID: roomProperties[index] });
    console.log(
      '===onSeatItemClick',
      role,
      index,
      roomProperties,
      isRoomAttributesBatching,
      hostID,
      clickSeatItem
    );
    if (role == ZegoLiveAudioRoomRole.host) {
      // host remove speaker
      if (roomProperties[index] && roomProperties[index] !== userID) {
        let text = removeSpeakerMenuDialogButton;
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
      // Check to see if the seat is taken
      let seated = false;
      for (let key in roomProperties) {
        if (key == index) {
          seated = true;
        }
      }
      if (seated) {
        console.log('Seat has been taken', index);
        if (roomProperties[index] == userID) {
          // Seat has been taken by yourself, leave the seat
          setModalVisible(true);
          setModalText(leaveSeatMenuDialogButton);
        }
      } else {
        // Check if you already have a seat
        const oldIndex = getSeatIndexByUserID(userID);
        if (oldIndex && oldIndex !== -1) {
          // switch to seat
          switchToSeat(index, oldIndex);
        } else {
          console.log('===take seat', clickSeatItem, index);
          setModalVisible(true);
          setModalText(takeSeatMenuDialogButton);
        }
      }
    }
  };

  const takeSeat = (index, isDeleteAfterOwnerLeft, isForce, isUpdateOwner) => {
    if (role === ZegoLiveAudioRoomRole.audience) {
      grantPermissions();
    }
    ZegoUIKit.getSignalingPlugin()
      .updateRoomProperty(
        index,
        userID,
        isDeleteAfterOwnerLeft,
        isForce,
        isUpdateOwner
      )
      .then((data) => {
        if (!data.code) {
          if (role === ZegoLiveAudioRoomRole.host) {
            ZegoUIKit.getSignalingPlugin()
              .setUsersInRoomAttributes('role', role.toString(), [userID])
              .then((data) => {
                if (!data.code) {
                  console.log('===setUsersInRoomAttributes success', data);
                  updateLayout();
                  replaceBottomMenuBarButtons(hostButtons);
                  replaceBottomMenuBarExtendButtons(hostExtendButtons);
                } else {
                  console.log('===setUsersInRoomAttributes err', data);
                  leaveSeat(takeSeatIndexWhenJoining);
                  config.role = ZegoLiveAudioRoomRole.audience;
                }
              });
          } else {
            config.role = ZegoLiveAudioRoomRole.speaker;
            replaceBottomMenuBarButtons(speakerButtons);
            replaceBottomMenuBarExtendButtons(speakerExtendButtons);
            ZegoUIKit.turnMicrophoneOn('', true);
          }
        } else {
          // If you don't succeed, put the role back in the audience
          config.role = ZegoLiveAudioRoomRole.audience;
        }
      })
      .catch((err) => {
        console.log('===update err', err);
      });
  };

  const leaveSeat = (index, removeUserID) => {
    console.log(
      '===leave seat',
      index,
      roomProperties[index],
      removeUserID,
      userID
    );
    if (removeUserID) {
      // host remove someone
      if (roomProperties[index] !== removeUserID) {
        return false;
      }
    } else {
      // speaker leave seat
      if (roomProperties[index] !== userID) {
        return false;
      }
    }
    ZegoUIKit.getSignalingPlugin()
      .deleteRoomProperties([index.toString()], true)
      .then((data) => {
        console.log('===deleteRoomProperties', data);
        if (!data.code) {
          if (role !== ZegoLiveAudioRoomRole.host) {
            config.role = ZegoLiveAudioRoomRole.audience;
            replaceBottomMenuBarButtons(audienceButtons);
            replaceBottomMenuBarExtendButtons(audienceExtendButtons);
            ZegoUIKit.turnMicrophoneOn('', false);
          }
        } else {
          if (removeSpeakerFailedToast.indexOf('%0') > -1) {
            removeSpeakerFailedToast = removeSpeakerFailedToast.replace(
              '%0',
              modalText.split(' ')[1]
            );
          }
          setToastVisible(true);
          setToastText(removeSpeakerFailedToast);
          setTimeout(() => {
            setToastVisible(false);
          }, 3000);
        }
      })
      .catch((err) => {
        console.log('==deleteRoomProperties err', err);
        if (removeSpeakerFailedToast.indexOf('%0') > -1) {
          removeSpeakerFailedToast = removeSpeakerFailedToast.replace(
            '%0',
            modalText.split(' ')[1]
          );
        }
        setToastVisible(true);
        setToastText(removeSpeakerFailedToast);
        setTimeout(() => {
          setToastVisible(false);
        }, 3000);
      });
  };

  const switchToSeat = async (index, oldIndex) => {
    if (isRoomAttributesBatching) {
      return false;
    }
    setIsRoomAttributesBatching(true);
    ZegoUIKit.getSignalingPlugin().beginRoomPropertiesBatchOperation(
      true,
      false,
      false
    );
    ZegoUIKit.getSignalingPlugin().updateRoomProperty(index, userID);
    ZegoUIKit.getSignalingPlugin()
      .deleteRoomProperties([oldIndex.toString()])
      .then((data) => {
        console.log('===delete room properties success', data);
      })
      .catch((err) => {
        console.log('===delete room properties err', err);
      });
    await ZegoUIKit.getSignalingPlugin()
      .endRoomPropertiesBatchOperation()
      .then((data) => {
        console.log('===endRoomPropertiesBatchOperation data', data);
        setIsRoomAttributesBatching(false);
        if (data.code) {
          console.log('Switch seat failed: ');
        }
      })
      .catch((err) => {
        console.log('===end room properties err', err);
        setIsRoomAttributesBatching(false);
      });
  };

  const onModalPress = () => {
    setModalVisible(false);
    if (modalText.indexOf('Take the seat') > -1) {
      takeSeat(clickSeatItem.index, true, false, false);
    } else if (modalText.indexOf('Remove') > -1) {
      const dialogInfo = removeSpeakerFromSeatDialogInfo;
      if (dialogInfo.message.indexOf('%0') > -1) {
        dialogInfo.message = dialogInfo.message.replace(
          '%0',
          modalText.split(' ')[1]
        );
      }
      const confirm = () => {
        leaveSeat(clickSeatItem.index, roomProperties[clickSeatItem.index]);
        setDialogVisible(false);
      };
      const cancel = () => {
        setDialogVisible(false);
      };
      showDialog(dialogInfo, confirm, cancel);
    } else if (modalText.indexOf('Leave') > -1) {
      const confirm = () => {
        leaveSeat(clickSeatItem.index);
        setDialogVisible(false);
      };
      const cancel = () => {
        setDialogVisible(false);
      };
      showDialog(leaveSeatDialogInfo, confirm, cancel);
    }
  };

  const getSeatIndexByUserID = (userID) => {
    let index = -1;
    console.log(
      '===getSeatIndexByUserID',
      userID,
      roomProperties,
      seatingAreaData
    );
    for (let key in roomProperties) {
      if (roomProperties[key] == userID) {
        index = key;
      }
    }
    return index;
  };

  const showDefaultLeaveDialog = () => {
    return new Promise((resolve, reject) => {
      console.log('===confirmDialogInfo', confirmDialogInfo);
      if (!confirmDialogInfo.title) {
        resolve();
      } else {
        const confirm = () => {
          resolve();
        };
        const cancel = () => {
          // reject();
          setDialogVisible(false);
        };
        showDialog(confirmDialogInfo, confirm, cancel);
      }
    });
  };

  const showDialog = (dialogInfo, confirm, cancel) => {
    setDialogInfo(dialogInfo);
    setDialogVisible(true);
    setOnDialogConfirmPress(() => confirm);
    setOnDialogCancelPress(() => cancel);
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
    <View style={styles.container}>
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
        <View style={styles.memberListContainer}>
          <TouchableWithoutFeedback
            onPress={() => {
              setIsCallMemberListVisable(false);
            }}
          >
            <View style={styles.memberListBoxMask} />
          </TouchableWithoutFeedback>
          <View style={styles.memberListBox}>
            <ZegoLiveAudioRoomMemberList
              seatingAreaData={seatingAreaData}
              showMicrophoneState={true}
              onCloseCallMemberList={onCloseCallMemberList}
              memberListTitle={memberListTitle}
            />
          </View>
        </View>
      ) : (
        <View />
      )}
      <View style={styles.messageListView}>
        <ZegoInRoomMessageView style={styles.fillParent} />
      </View>
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
        <TouchableWithoutFeedback
          onPress={() => {
            setTextInputVisable(false);
          }}
        >
          <KeyboardAvoidingView
            style={[styles.fillParent, { zIndex: 4 }]}
            behavior={'padding'}
          >
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
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      ) : null}

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalMask} />
        </TouchableWithoutFeedback>
        <View style={styles.modalView}>
          <TouchableOpacity onPress={onModalPress}>
            <Text style={styles.btnText}>{modalText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <Text
              style={[
                styles.btnText,
                { borderTopWidth: 1, borderTopColor: '#ccc' },
              ]}
            >
              {cancelMenuDialogButton}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <ZegoDialogModal
        dialogInfo={dialogInfo}
        dialogVisible={dialogVisible}
        onDialogConfirmPress={onDialogConfirmPress}
        onDialogCancelPress={onDialogCancelPress}
      />
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
    zIndex: 5,
    position: 'absolute',
    top: 65,
    right: 10,
  },
  messageListView: {
    zIndex: 3,
    position: 'absolute',
    left: 16,
    bottom: 62,
    width: 270,
    maxHeight: 200,
  },
  messageInputPannel: {
    position: 'absolute',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7500)',
    width: '100%',
  },
  memberButton: {
    zIndex: 5,
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
  },
  memberCountLabel: {
    fontSize: 14,
    color: 'white',
    marginLeft: 3,
  },
  seatingArea: {
    zIndex: 3,
    position: 'absolute',
    top: 125,
    width: '100%',
  },
  memberListContainer: {
    zIndex: 4,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  memberListBoxMask: {
    width: '100%',
    height: '100%',
  },
  memberListBox: {
    zIndex: 5,
    position: 'absolute',
    bottom: 0,
    width: '100%',
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
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 15,
  },
  btnText: {
    height: 50,
    lineHeight: 50,
    textAlign: 'center',
  },
});

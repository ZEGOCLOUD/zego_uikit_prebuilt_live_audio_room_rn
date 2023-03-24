import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Delegate from 'react-delegate-component';
import ZegoUIKit, {
  ZegoLeaveButton,
  ZegoInRoomMessageInput,
  ZegoInRoomMessageView,
  ZegoAudioVideoResourceMode,
  ZegoUIKitPluginType,
} from '@zegocloud/zego-uikit-rn';
import ZegoBottomBar from './components/ZegoBottomBar';
import { useKeyboard } from './utils/keyboard';
import { grantPermissions } from './utils';
import ZegoSeatingArea from './components/ZegoSeatingArea';
import ZegoLiveAudioRoomMemberList from './components/ZegoLiveAudioRoomMemberList';
import ZegoDialogModal from './components/ZegoDialogModal';
import ZegoToast from './components/ZegoToast';
import ZegoDialog from './components/ZegoDialog';
import ZegoCoHostMenuDialog from './components/ZegoCoHostMenuDialog';
import ZegoPrebuiltPlugins from './services/plugins';
import {
  HOST_DEFAULT_CONFIG,
  AUDIENCE_DEFAULT_CONFIG,
  ZegoLiveAudioRoomRole,
  ZegoLiveAudioRoomLayoutAlignment,
  ZegoLiveAudioRoomLayoutRowConfig,
  ZegoMenuBarButtonName,
  ZegoInnerText,
  ZegoToastType,
  ZegoCoHostConnectState,
  ZegoInvitationType,
  ZegoSeatsState,
} from './services/defines';

export {
  HOST_DEFAULT_CONFIG,
  AUDIENCE_DEFAULT_CONFIG,
  ZegoLiveAudioRoomRole,
  ZegoMenuBarButtonName,
  ZegoLiveAudioRoomLayoutAlignment,
};

function ZegoUIKitPrebuiltLiveAudioRoom(props, ref) {
  const { appID, appSign, userID, userName, roomID, config } = props;
  Object.assign(ZegoInnerText, config.innerText || {}, config.translationText || {});
  const {
    turnOnMicrophoneWhenJoining = false,
    useSpeakerWhenJoining = true,
    bottomMenuBarConfig = {},
    confirmDialogInfo = {},
    onLeaveConfirmation,
    layoutConfig = {},
    hostSeatIndexes = [0],
    seatConfig = {},
    background,
    avatar = '',
    userInRoomAttributes = { },
    onUserCountOrPropertyChanged,
    closeSeatsWhenJoin = true,
    // Host callback
    onSeatTakingRequested,
    onSeatTakingRequestCanceled,
    onSeatTakingInviteRejected,
    
    // Audience callback
    onSeatTakingRequestRejected,
    onHostSeatTakingInviteSent,

    onMemberListMoreButtonPressed,
    onSeatsChanged,
    onSeatClosed,
    onSeatsOpened,
    onTurnOnYourMicrophoneRequest,
    onSeatClicked,
  
    inRoomMessageViewConfig = {},
  } = config;
  // When entering the room, if there is a seat conflict, change the role to the audience
  config.role === undefined && (config.role = ZegoLiveAudioRoomRole.audience);
  config.takeSeatIndexWhenJoining === undefined && (config.takeSeatIndexWhenJoining = -1);
  if (
    (config.role == ZegoLiveAudioRoomRole.host ||
      config.role == ZegoLiveAudioRoomRole.speaker) &&
      config.takeSeatIndexWhenJoining < 0
  ) {
    config.role = ZegoLiveAudioRoomRole.audience;
    config.takeSeatIndexWhenJoining = -1;
  } else if (
    config.role == ZegoLiveAudioRoomRole.speaker &&
    hostSeatIndexes.some((item) => item === config.takeSeatIndexWhenJoining)
  ) {
    config.role = ZegoLiveAudioRoomRole.audience;
    config.takeSeatIndexWhenJoining = -1;
  }
  const { takeSeatIndexWhenJoining } = config;

  const {
    showInRoomMessageButton = true,
    hostButtons = [
      ZegoMenuBarButtonName.toggleMicrophoneButton,
      ZegoMenuBarButtonName.showMemberListButton,
      ZegoMenuBarButtonName.closeSeatButton,
    ],
    speakerButtons = [
      ZegoMenuBarButtonName.toggleMicrophoneButton,
      ZegoMenuBarButtonName.showMemberListButton,
    ],
    audienceButtons = [ZegoMenuBarButtonName.showMemberListButton, ZegoMenuBarButtonName.applyToTakeSeatButton],
    hostExtendButtons = [],
    speakerExtendButtons = [],
    audienceExtendButtons = [],
    maxCount = 5,
  } = bottomMenuBarConfig;

  const {
    foregroundColor = 'transparent',
    openIcon = require('./resources/seating-area-default-icon.png'),
    closeIcon = require('./resources/seating-area-lock-icon.png'),
    showSoundWaveInAudioMode = true,
    foregroundBuilder,
    backgroundColor = 'transparent',
    backgroundImage,
  } = seatConfig;

  const {
    rowConfigs = [
      ZegoLiveAudioRoomLayoutRowConfig,
      ZegoLiveAudioRoomLayoutRowConfig,
    ],
    rowSpacing = 0,
  } = layoutConfig;

  const {
    visible = true,
    itemBuilder,
  } = inRoomMessageViewConfig;

  // let hostID = '';
  const [isRoomAttributesBatching, setIsRoomAttributesBatching] =
    useState(false);
  const [roomProperties, setRoomProperties] = useState({});
  const keyboardHeight = useKeyboard();
  const [textInputVisable, setTextInputVisable] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textInputHeight, setTextInputHeight] = useState(45);
  const [isMemberListVisable, setIsMemberListVisable] = useState(false);

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

  // Role
  const [role, setRole] = useState(config.role);

  // HostID
  const [hostID, setHostID] = useState('');

  const [memberCount, setMemberCount] = useState(1);

  // Dialog
  const [dialogInfo, setDialogInfo] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [onDialogConfirmPress, setOnDialogConfirmPress] = useState(() => {});
  let [onDialogCancelPress, setOnDialogCancelPress] = useState('');

  const hideCountdownOn_Dialog = useRef();
  const hideCountdownOn_DialogTimer = useRef();
  const [isDialogVisable, setIsDialogVisable] = useState(false);
  const [dialogExtendedData, setDialogExtendedData] = useState({});
  const hideCountdownOnDialogLimit = 60;

  // CoHost Dialog
  const [isCoHostDialogVisable, setIsCoHostDialogVisable] = useState(false);
  const [coHostDialogExtendedData, setCoHostDialogExtendedData] = useState({});

  // Toast
  const [isToastVisable, setIsToastVisable] = useState(false);
  const [toastExtendedData, setToastExtendedData] = useState({});
  const hideCountdownOn_Toast = useRef();
  const hideCountdownOn_ToastTimer = useRef();
  const hideCountdownOnToastLimit = 5;

  // Red dot
  const [requestCoHostCount, setRequestCoHostCount] = useState(0);

  // The connection status of the current member
  const [memberConnectStateMap, setMemberConnectStateMap] = useState({});

  // Seats lock
  const [isLocked, setIsLocked] = useState(false);

  // Resolve the problem where closures cannot obtain new values, add as needed
  const realTimeData = useRef();

  const callbackID =
    'ZegoUIKitPrebuiltLiveAudioRoom' +
    String(Math.floor(Math.random() * 10000));

  // Plugin callback
  const registerPluginCallback = () => {
    if (ZegoUIKit.getPlugin(ZegoUIKitPluginType.signaling)) {
      ZegoUIKit.getSignalingPlugin().onInvitationReceived(callbackID, ({ callID, type, inviter, data }) => {
        if (!realTimeData.current.isLocked) return;
        console.log('[Prebuilt]onInvitationReceived', JSON.stringify(realTimeData.current), requestCoHostCount, type, userID, inviter);
        if (type === ZegoInvitationType.requestCoHost && userID === realTimeData.current.hostID) {
          // The audience created a cohost request
          realTimeData.current.requestCoHostCount += 1;
          setRequestCoHostCount(realTimeData.current.requestCoHostCount);

          realTimeData.current.memberConnectStateMap[inviter.id] = ZegoCoHostConnectState.connecting;
          // memberConnectStateMap = realTimeData.current.memberConnectStateMap;
          setMemberConnectStateMap({...realTimeData.current.memberConnectStateMap});

          setTimeout(() => {
            // The sorting will not be triggered if the member list pop-up is not reopened, the sorting must be forced
            ZegoUIKit.forceSortMemberList();
          }, 50);

          typeof onSeatTakingRequested === 'function' && onSeatTakingRequested(ZegoUIKit.getUser(inviter.id));
        } else if (type === ZegoInvitationType.inviteToCoHost) {
          // The audience is invited to connect the cohost by host
          // Cancel request
          ZegoUIKit.getSignalingPlugin().cancelInvitation([realTimeData.current.hostID]);
          // Update own connection state
          realTimeData.current.memberConnectStateMap[userID] = ZegoCoHostConnectState.idle;
          setMemberConnectStateMap({ ...realTimeData.current.memberConnectStateMap });

          setIsDialogVisableHandle(true);
          setDialogExtendedData({
            title: ZegoInnerText.hostInviteTakeSeatDialog.title,
            content: ZegoInnerText.hostInviteTakeSeatDialog.message,
            cancelText: ZegoInnerText.hostInviteTakeSeatDialog.cancelButtonName,
            okText: ZegoInnerText.hostInviteTakeSeatDialog.confirmButtonName,
            onCancel: () => {
              // Refuse the cohost request of the host
              ZegoUIKit.getSignalingPlugin().refuseInvitation(inviter.id).then(() => {
                realTimeData.current.memberConnectStateMap[userID] = ZegoCoHostConnectState.idle;
                setMemberConnectStateMap({ ...realTimeData.current.memberConnectStateMap });

                ZegoUIKit.turnMicrophoneOn('', false);
                setIsDialogVisableHandle(false);
              });
            },
            onOk: () => {
              // Accept the cohost request of the host
              ZegoUIKit.getSignalingPlugin().acceptInvitation(inviter.id).then(async () => {
                setIsDialogVisableHandle(false);
                coHostAcceptedHandle(true);
              });
            }
          });

          typeof onHostSeatTakingInviteSent === 'function' && onHostSeatTakingInviteSent();
        }
      });
      ZegoUIKit.getSignalingPlugin().onInvitationCanceled(callbackID, ({ callID, inviter, data }) => {
        if (userID === realTimeData.current.hostID) {
          // The audience canceled the cohost request
          realTimeData.current.requestCoHostCount && (realTimeData.current.requestCoHostCount -= 1);
          setRequestCoHostCount(realTimeData.current.requestCoHostCount);

          realTimeData.current.memberConnectStateMap[inviter.id] = ZegoCoHostConnectState.idle;
          setMemberConnectStateMap({ ...realTimeData.current.memberConnectStateMap });

          typeof onSeatTakingRequestCanceled === 'function' && onSeatTakingRequestCanceled(ZegoUIKit.getUser(inviter.id));
        }
      });
      ZegoUIKit.getSignalingPlugin().onInvitationTimeout(callbackID, ({ callID, inviter, data }) => {
        if (userID === realTimeData.current.hostID) {
          // The host did not process the cohost request, resulting in a timeout
          realTimeData.current.requestCoHostCount && (realTimeData.current.requestCoHostCount -= 1);
          setRequestCoHostCount(realTimeData.current.requestCoHostCount);

          realTimeData.current.memberConnectStateMap[inviter.id] = ZegoCoHostConnectState.idle;
          setMemberConnectStateMap({ ...realTimeData.current.memberConnectStateMap });
        }
      });
      ZegoUIKit.getSignalingPlugin().onInvitationAccepted(callbackID, ({ callID, invitee, data }) => {
        if (userID === realTimeData.current.hostID) {
          // The audience accept the cohost request
          realTimeData.current.memberConnectStateMap[invitee.id] = ZegoCoHostConnectState.connected;
          setMemberConnectStateMap({ ...realTimeData.current.memberConnectStateMap });

          // Reset invitation timer
          setCoHostDialogExtendedData({ resetTimer: true, inviteeID: invitee.id});
        }
      });
      ZegoUIKit.getSignalingPlugin().onInvitationRefused(callbackID, ({ callID, invitee, data }) => {
        if (userID === realTimeData.current.hostID) {
          // The audience reject the cohost request
          realTimeData.current.memberConnectStateMap[invitee.id] = ZegoCoHostConnectState.idle;
          setMemberConnectStateMap({ ...realTimeData.current.memberConnectStateMap });

          // Reset invitation timer
          setCoHostDialogExtendedData({ resetTimer: true, inviteeID: invitee.id });

          typeof onSeatTakingInviteRejected === 'function' && onSeatTakingInviteRejected();
        }
      });
    }
  };
  const unRegisterPluginCallback = () => {
    if (ZegoUIKit.getPlugin(ZegoUIKitPluginType.signaling)) {
      ZegoUIKit.getSignalingPlugin().onInvitationReceived(callbackID);
      ZegoUIKit.getSignalingPlugin().onInvitationCanceled(callbackID);
      ZegoUIKit.getSignalingPlugin().onInvitationTimeout(callbackID);
      ZegoUIKit.getSignalingPlugin().onInvitationAccepted(callbackID);
      ZegoUIKit.getSignalingPlugin().onInvitationRefused(callbackID);
    }
  };
  // Toast
  const initToastTimer = () => {
    clearInterval(hideCountdownOn_ToastTimer.current);
    hideCountdownOn_ToastTimer.current = null;
    hideCountdownOn_Toast.current = hideCountdownOnToastLimit;
  }
  const startToastTimer = () => {
    clearInterval(hideCountdownOn_ToastTimer.current);
    hideCountdownOn_ToastTimer.current = setInterval(() => {
      if (hideCountdownOn_Toast.current === 0) {
        setIsToastVisableHandle(false);
      } else {
        hideCountdownOn_Toast.current -= 1;
      }
    }, 1000);
  }
  const setIsToastVisableHandle = (visable) => {
    setIsToastVisable(visable);
    if (visable) {
      startToastTimer();
    } else {
      initToastTimer();
      setToastExtendedData({});
    }
  }
  // Dialog
  const initDialogTimer = () => {
    clearInterval(hideCountdownOn_DialogTimer.current);
    hideCountdownOn_DialogTimer.current = null;
    hideCountdownOn_Dialog.current = hideCountdownOnDialogLimit;
  }
  const startDialogTimer = () => {
    clearInterval(hideCountdownOn_DialogTimer.current);
    hideCountdownOn_DialogTimer.current = setInterval(() => {
      if (hideCountdownOn_Dialog.current === 0) {
        setIsDialogVisableHandle(false);
      } else {
        hideCountdownOn_Dialog.current -= 1;
      }
    }, 1000);
  }
  const setIsDialogVisableHandle = (visable) => {
    setIsDialogVisable(visable);
    if (visable) {
      startDialogTimer();
    } else {
      initDialogTimer();
      setDialogExtendedData({});
    }
  }
  // Connect state changed
  const connectStateChangedHandle = (changedUserID, connectState, isClosure) => {
    console.log('#########connectStateChangedHandle', changedUserID, connectState, memberConnectStateMap, realTimeData.current.memberConnectStateMap);
    // The audience connection status changes
    changedUserID = changedUserID || userID;
    const temp = connectState === ZegoCoHostConnectState.connected ? ZegoLiveAudioRoomRole.speaker : ZegoLiveAudioRoomRole.audience;
    if (!isClosure) {
      // Just take the value in state, because there's no closure
      memberConnectStateMap[changedUserID] = connectState;
      // Rerendering causes realTimeData.current to be empty, so a reassignment is required here
      role !== ZegoLiveAudioRoomRole.host && (realTimeData.current.role = temp);
      realTimeData.current.memberConnectStateMap = { ...memberConnectStateMap };

      role !== ZegoLiveAudioRoomRole.host && setRole(temp);
      setMemberConnectStateMap({ ...memberConnectStateMap });
    } else {
      // There are closures, status values cannot be used directly
      realTimeData.current.memberConnectStateMap[changedUserID] = connectState;
      setMemberConnectStateMap({ ...realTimeData.current.memberConnectStateMap });
      if (realTimeData.current.role !== ZegoLiveAudioRoomRole.host) {
        realTimeData.current.role = temp;
        setRole(temp);
      }
    }
  }
  // Host operation
  const coHostDisagreeHandle = (changedUserID) => {
    // Just take the value in state, because there's no closure
    memberConnectStateMap[changedUserID] = ZegoCoHostConnectState.idle;

    // Rerendering causes realTimeData.current to be empty, so a reassignment is required here
    realTimeData.current.requestCoHostCount = requestCoHostCount - 1 || 0;
    realTimeData.current.memberConnectStateMap = { ...memberConnectStateMap };

    setMemberConnectStateMap({ ...memberConnectStateMap });
    setRequestCoHostCount(requestCoHostCount - 1 || 0);
  }
  const coHostAgreeHandle = (changedUserID) => {
    // Just take the value in state, because there's no closure
    memberConnectStateMap[changedUserID] = ZegoCoHostConnectState.connected;
  
    realTimeData.current.requestCoHostCount = requestCoHostCount - 1 || 0;
    realTimeData.current.memberConnectStateMap = { ...memberConnectStateMap };

    setMemberConnectStateMap({ ...memberConnectStateMap });
    setRequestCoHostCount(requestCoHostCount - 1 || 0);
  }
  // Get free seat index 
  const getFreeSeatIndexList = (seatingAreaData) => {
    const freeSeatIndexList = [];
    seatingAreaData.forEach((element) => {
      const subTemp = element.seatList;
      const subKeys = Array.from(subTemp.keys());
      subKeys.forEach((subKey) => {
        if (!subTemp.get(subKey).userID) {
          freeSeatIndexList.push(subKey);
        }
      });
    });
    return freeSeatIndexList;
  }
  // Get free seat index of the most front
  const getFreeSeatIndex = (seatingAreaData) => {
    let freeSeatIndex;
    for (let index = 0, len = seatingAreaData.length; index < len; index++) {
      const element = seatingAreaData[index];
      const subTemp = element.seatList;
      const subKeys = Array.from(subTemp.keys());
      for (let subIndex = 0, subLen = subKeys.length; subIndex < subLen; subIndex++) {
        const subKey = subKeys[subIndex];
        const subElement = subTemp.get(subKey);
        if (!subElement.userID) {
          freeSeatIndex = subKey;
          break;
        }
      }
      if (freeSeatIndex) {
        break;
      }
    }
    return freeSeatIndex;
  }
  // The host accepted your cohost request
  const coHostAcceptedHandle = (isClosure) => {
    // If there is a free seat, then in order to find the most front of the mic; Otherwise turn back to the request button.
    // [{ "seatList": Map { 0 => { "seatIndex": 0, "role": 2, "userID": "xxxx" } } }]
    if (isClosure) {
      // There are closures, status values cannot be used directly
      const temp = realTimeData.current.seatingAreaData;
      const freeSeatIndex = getFreeSeatIndex(temp);
      if (freeSeatIndex) {
        // Take seat
        takeSeat(freeSeatIndex, true, false, false).then(() => {
          realTimeData.current.memberConnectStateMap[userID] = ZegoCoHostConnectState.connected;
          setMemberConnectStateMap({ ...realTimeData.current.memberConnectStateMap });
        }).catch(() => {
          console.log('coHostAcceptedHandle error');
          realTimeData.current.memberConnectStateMap[userID] = ZegoCoHostConnectState.idle;
          console.log('coHostAcceptedHandle error', realTimeData.current.memberConnectStateMap);
          setMemberConnectStateMap({ ...realTimeData.current.memberConnectStateMap });
        });
      } else {
        realTimeData.current.memberConnectStateMap[userID] = ZegoCoHostConnectState.idle;
        setMemberConnectStateMap({ ...realTimeData.current.memberConnectStateMap });
      }
    }
  }

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
    initToastTimer();
    initDialogTimer();
    realTimeData.current = {
      role: config.role,
      hostID: '',
      requestCoHostCount: 0,
      memberConnectStateMap: {},
      seatingAreaData: [],
    };
    ZegoUIKit.init(appID, appSign, { userID: userID, userName: userName })
      .then(() => {
        console.log('===zego uikit init success');
        ZegoUIKit.setAudioVideoResourceMode(ZegoAudioVideoResourceMode.RTCOnly);
        ZegoUIKit.turnCameraOn('', false);
        ZegoUIKit.turnMicrophoneOn('', turnOnMicrophoneWhenJoining);
        ZegoUIKit.setAudioOutputToSpeaker(useSpeakerWhenJoining);
        ZegoUIKit.joinRoom(roomID).then(() => {
          console.log('===prebuilt uikit join room success');
          // It is not a callback that executes later, so you can use 'role' field directly
          if (role !== ZegoLiveAudioRoomRole.audience) {
            grantPermissions();
          }
          pluginInit();
        });
      })
      .catch((err) => {
        console.log('===err', err);
      });
    ZegoUIKit.onUserCountOrPropertyChanged(callbackID, (userList) => {
      console.log('########### Custom onUserCountOrPropertyChanged', userID, userList);
      typeof onUserCountOrPropertyChanged === 'function' && onUserCountOrPropertyChanged(userList);
    });
    ZegoUIKit.onRoomPropertyUpdated(callbackID, (key, oldvalue, newValue) => {
      console.log('###########onRoomPropertyUpdated', key, oldvalue, newValue);
      if (key === 'lockseat') {
        // Clear all connect state
        realTimeData.current.requestCoHostCount = 0;
        realTimeData.current.memberConnectStateMap = {};
        setRequestCoHostCount(0);
        setMemberConnectStateMap({});
        // Hidden dialog
        setIsDialogVisableHandle(false);
        // Reset invitation timer
        setCoHostDialogExtendedData({ resetTimer: true });

        const isLocked = newValue === ZegoSeatsState.lock;
        setIsLocked(isLocked);
        realTimeData.current.isLocked = isLocked;
        if (isLocked) {
          typeof onSeatClosed === 'function' && onSeatClosed();
        } else {
          const { role, hostID } = realTimeData.current;
          if (role === ZegoLiveAudioRoomRole.host) {
            // Cancel invitation
            // TODO
          } else {
            // Cancel request
            ZegoUIKit.getSignalingPlugin().cancelInvitation([hostID]);
          }
          typeof onSeatsOpened === 'function' && onSeatsOpened();
        }
      }
    });
    ZegoUIKit.onTurnOnYourMicrophoneRequest(callbackID, async (formUser) => {
      console.log('########onTurnOnYourMicrophoneRequest', formUser);
      // Allow to open
      try {
        await grantPermissions();
      } catch (error) {
      }
      ZegoUIKit.turnMicrophoneOn('', true);
      typeof onTurnOnYourMicrophoneRequest === 'function' && onTurnOnYourMicrophoneRequest(formUser);
    });
    ZegoUIKit.onUserJoin(callbackID, (userList) => {
      setMemberCount(ZegoUIKit.getAllUsers().length);
    });
    return () => {
      ZegoUIKit.leaveRoom();
      ZegoUIKit.onUserLeave(callbackID);
      ZegoUIKit.onUserCountOrPropertyChanged(callbackID);
      ZegoUIKit.onRoomPropertyUpdated(callbackID);
      ZegoUIKit.onTurnOnYourMicrophoneRequest(callbackID);
      ZegoUIKit.onUserJoin(callbackID);
    
      unRegisterPluginCallback();
      ZegoUIKit.getSignalingPlugin().onRoomPropertyUpdated(callbackID);
      ZegoUIKit.getSignalingPlugin().onUsersInRoomAttributesUpdated(callbackID);
      ZegoPrebuiltPlugins.uninit();
    };
  }, []);

  const pluginInit = () => {
    return ZegoPrebuiltPlugins.init(appID, appSign, userID, userName)
      .then(() => {
        setIsInit(true);
        console.log('===init success');
        registerPluginCallback();
        pluginJoinRoom();
      })
      .catch((err) => {
        console.log('===init err', err);
      });
  };

  // Set the avatar url and user-defined additional properties
  const setUserCustomRoomAttributes = () => {
    console.log('###########setUserCustomRoomAttributes', userID, avatar, userInRoomAttributes);
    ZegoUIKit.getSignalingPlugin().setUsersInRoomAttributes('avatar', avatar, [userID]);
    Object.keys(userInRoomAttributes).forEach((key) => {
      console.log('###########setUserCustomRoomAttributes', userID, key, userInRoomAttributes[key]);
      ZegoUIKit.getSignalingPlugin().setUsersInRoomAttributes(key, userInRoomAttributes[key], [userID]);
    });
  }

  const pluginJoinRoom = () => {
    console.log('===plugin join room');
    return ZegoUIKit.getSignalingPlugin()
      .joinRoom(roomID)
      .then((data) => {
        if (!data.code) {
          console.log('===plugin join room success', role);
          // Set the avatar url and user-defined additional properties
          setUserCustomRoomAttributes();
          registerUIKitListener();
          if (role === ZegoLiveAudioRoomRole.host) {
            // Active query to get other people's properties
            ZegoUIKit.getSignalingPlugin().queryUsersInRoomAttributes();
            // hostID = userID;
            setHostID(userID);
            realTimeData.current.hostID = userID;
            replaceBottomMenuBarButtons(hostButtons);
            replaceBottomMenuBarExtendButtons(hostExtendButtons);
          } else {
            replaceBottomMenuBarButtons(audienceButtons);
            replaceBottomMenuBarExtendButtons(audienceExtendButtons);
            ZegoUIKit.getSignalingPlugin()
              .queryUsersInRoomAttributes()
              .then((data) => {
                if (!data.code) {
                  console.log('===queryUsersInRoomAttributes', data);
                  data.usersInRoomAttributes.forEach((v, k) => {
                    if (v.role === ZegoLiveAudioRoomRole.host.toString()) {
                      // hostID = k;
                      setHostID(k);
                      realTimeData.current.hostID = k;
                    }
                  });
                  updateLayout();
                }
              });
          }
          if (role == ZegoLiveAudioRoomRole.host) {
            console.log('===is host', role, config.role);
            // If the value is host, the specified mic bit is forcibly preempted
            takeSeat(takeSeatIndexWhenJoining, true, true, true);
          } else if (role == ZegoLiveAudioRoomRole.speaker) {
            // If it is a speaker, try to grab the mic
            takeSeat(takeSeatIndexWhenJoining, true, false, false);
          }
        }
      });
  };

  const registerUIKitListener = () => {
    ZegoUIKit.getSignalingPlugin().onUsersInRoomAttributesUpdated(
      callbackID,
      (keys, attributes, oldAttributes, editor) => {
        // Only host can set role, so it's the host who sets the role
        if (keys.includes('role')) {
          // hostID = editor;
          setHostID(editor);
          realTimeData.current.hostID = editor;
          updateLayout();
        }
      }
    );
    ZegoUIKit.getSignalingPlugin().onRoomPropertyUpdated(
      callbackID,
      (key, oldValue, newValue) => {
        console.log(
          '===onRoomPropertyUpdated',
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
          // config.role = ZegoLiveAudioRoomRole.audience;
          setRole(ZegoLiveAudioRoomRole.audience);
          realTimeData.current.role = ZegoLiveAudioRoomRole.audience;
          realTimeData.current.memberConnectStateMap[oldValue] = ZegoCoHostConnectState.idle;
          setMemberConnectStateMap({...realTimeData.current.memberConnectStateMap});

          replaceBottomMenuBarButtons(audienceButtons);
          replaceBottomMenuBarExtendButtons(audienceExtendButtons);
          ZegoUIKit.turnMicrophoneOn('', false);
        } else if (oldValue && !newValue) {
          // Users become audience
          realTimeData.current.memberConnectStateMap[oldValue] = ZegoCoHostConnectState.idle;
          setMemberConnectStateMap({...realTimeData.current.memberConnectStateMap});
        } else if (!oldValue && newValue) {
          // Users become speaker
          realTimeData.current.memberConnectStateMap[newValue] = ZegoCoHostConnectState.connected;
          setMemberConnectStateMap({...realTimeData.current.memberConnectStateMap});
        }
        updateLayout().then(() => {
          const takenSeats = { [key]: ZegoUIKit.getUser(newValue) };
          const untakenSeats = getFreeSeatIndexList(realTimeData.current.seatingAreaData);
          typeof onSeatsChanged === 'function' && onSeatsChanged(takenSeats, untakenSeats);
        });
      }
    );
    ZegoUIKit.onUserLeave(callbackID, (userList) => {
      console.log('===onUserLeave', userList);
      setMemberCount(ZegoUIKit.getAllUsers().length);
      const isHostLeft = userList.find((user) => { return user.userID === realTimeData.current.hostID; });
      if (isHostLeft) {
        setIsDialogVisableHandle(false);
        setHostID('');
        realTimeData.current.hostID = '';
      }
    });
  };

  const updateLayout = () => {
    return ZegoUIKit.getSignalingPlugin()
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
                  userID == realTimeData.current.hostID
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
          realTimeData.current.seatingAreaData = [...arr];
        }
      });
  };

  const onSeatItemClick = (index) => {
    if (typeof onSeatClicked === 'function') {
      onSeatClicked(index, ZegoUIKit.getUser(roomProperties[index]));
      return;
    }
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
        let text = ZegoInnerText.removeSpeakerMenuDialogButton;
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
          setModalText(ZegoInnerText.leaveSeatMenuDialogButton);
        }
      } else {
        if (isLocked) {
          console.log('Seat has been locked', index);
          return false;
        }
        // Check if you already have a seat
        const oldIndex = getSeatIndexByUserID(userID);
        if (oldIndex && oldIndex !== -1) {
          // switch to seat
          switchToSeat(index, oldIndex);
        } else {
          console.log('===take seat', clickSeatItem, index);
          setModalVisible(true);
          setModalText(ZegoInnerText.takeSeatMenuDialogButton);
        }
      }
    }
  };

  const takeSeat = (index, isDeleteAfterOwnerLeft, isForce, isUpdateOwner) => {
    if (role === ZegoLiveAudioRoomRole.audience) {
      grantPermissions();
    }
    return ZegoUIKit.getSignalingPlugin()
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
                  // config.role = ZegoLiveAudioRoomRole.audience;
                  setRole(ZegoLiveAudioRoomRole.audience);
                  realTimeData.current.role = ZegoLiveAudioRoomRole.audience;
                }
              });
          } else {
            // config.role = ZegoLiveAudioRoomRole.speaker;
            setRole(ZegoLiveAudioRoomRole.speaker);
            realTimeData.current.role = ZegoLiveAudioRoomRole.speaker;
            replaceBottomMenuBarButtons(speakerButtons);
            replaceBottomMenuBarExtendButtons(speakerExtendButtons);
            ZegoUIKit.turnMicrophoneOn('', true);
          }
        } else {
          // If you don't succeed, put the role back in the audience
          // config.role = ZegoLiveAudioRoomRole.audience;
          setRole(ZegoLiveAudioRoomRole.audience);
          realTimeData.current.role = ZegoLiveAudioRoomRole.audience;
        }
      })
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
        return Promise.reject();
      }
    } else {
      // speaker leave seat
      if (roomProperties[index] !== userID) {
        return Promise.reject();
      }
    }
    return ZegoUIKit.getSignalingPlugin()
      .deleteRoomProperties([index.toString()], true)
      .then((data) => {
        console.log('===deleteRoomProperties', data, role);
        if (!data.code) {
          if (role !== ZegoLiveAudioRoomRole.host) {
            // config.role = ZegoLiveAudioRoomRole.audience;
            setRole(ZegoLiveAudioRoomRole.audience);
            realTimeData.current.role = ZegoLiveAudioRoomRole.audience;

            replaceBottomMenuBarButtons(audienceButtons);
            replaceBottomMenuBarExtendButtons(audienceExtendButtons);
            ZegoUIKit.turnMicrophoneOn('', false);
          }
          memberConnectStateMap[removeUserID || userID] = ZegoCoHostConnectState.idle;
          realTimeData.current.memberConnectStateMap[removeUserID || userID] = ZegoCoHostConnectState.idle;
          setMemberConnectStateMap({...memberConnectStateMap});
        }
      })
      .catch((err) => {
        console.log('==deleteRoomProperties err', err);
        if (role === ZegoLiveAudioRoomRole.host) {
          let temp = ZegoInnerText.removeSpeakerFailedToast;
          if (ZegoInnerText.removeSpeakerFailedToast.indexOf('%0') > -1) {
            temp = ZegoInnerText.removeSpeakerFailedToast.replace(
              '%0',
              modalText.split(' ')[1]
            );
          }
          setIsToastVisableHandle(true);
          setToastExtendedData({ type: ZegoToastType.error, text: temp });
        }
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
  const removeSeatByConfirmHandle = () => {
    const dialogInfo = ZegoInnerText.removeSpeakerFromSeatDialogInfo;
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
  };
  const leaveSeatByConfirmHandle = () => {
    const confirm = () => {
      leaveSeat(clickSeatItem.index);
      setDialogVisible(false);
    };
    const cancel = () => {
      setDialogVisible(false);
    };
    showDialog(ZegoInnerText.leaveSeatDialogInfo, confirm, cancel);
  };
  const onModalPress = () => {
    setModalVisible(false);
    if (modalText.indexOf('Take the seat') > -1) {
      if (!isLocked) {
        takeSeat(clickSeatItem.index, true, false, false);
      }
    } else if (modalText.indexOf('Remove') > -1) {
      removeSeatByConfirmHandle();
    } else if (modalText.indexOf('Leave') > -1) {
      leaveSeatByConfirmHandle();
    }
  };

  const muteHandle = () => {
    ZegoUIKit.turnMicrophoneOn(clickSeatItem.userID, false).then(() => {
      setModalVisible(false);
    }).catch(() => {
      console.error('Mute failed', clickSeatItem.userID);
    });
  }

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

  useImperativeHandle(ref, () => ({
    applyToTakeSeat: () => {
      return new Promise((resolve, reject) => {
        ZegoUIKit.getSignalingPlugin().sendInvitation(
          [hostID],
          60,
          ZegoInvitationType.requestCoHost,
        ).then(({ errorInvitees }) => {
          if (!errorInvitees.length) {
            resolve();
            connectStateChangedHandle('', ZegoCoHostConnectState.connecting);
          } else {
            reject();
          }
        }).catch(() => {
          reject();
        });
      });
    },
    cancelSeatTakingRequest: () => {
      return new Promise((resolve, reject) => {
        ZegoUIKit.getSignalingPlugin().cancelInvitation(
          [hostID],
          60,
        ).then(({ errorInvitees }) => {
          if (!errorInvitees.length) {
            resolve();
            connectStateChangedHandle('', ZegoCoHostConnectState.idle);
          } else {
            reject();
          }
        }).catch(() => {
          reject();
        });
      });
    },
    takeSeat: (index) => {},
    leaveSeat: () => {
      const seatIndex = getSeatIndexByUserID(userID);
      if (seatIndex !== -1) {
        return leaveSeat(seatIndex);
      } else {
        return Promise.reject();
      }
    },
    acceptSeatTakingRequest: (audienceUserID) => {
      return ZegoUIKit.getSignalingPlugin().acceptInvitation(audienceUserID).then(() => {
        coHostAgreeHandle(audienceUserID);
      });
    },
    rejectSeatTakingRequest: (audienceUserID) => {
      return ZegoUIKit.getSignalingPlugin().refuseInvitation(audienceUserID).then(() => {
        coHostDisagreeHandle(audienceUserID);
      });
    },
    inviteAudienceToTakeSeat: (audienceUserID) => {
      return new Promise((resolve, reject) => {
        ZegoUIKit.getSignalingPlugin().sendInvitation(
          [audienceUserID],
          60,
          ZegoInvitationType.inviteToCoHost,
        ).then(({ errorInvitees }) => {
          if (!errorInvitees.length) {
            resolve();
          } else {
            reject();
          }
        }).catch(() => {
          reject();
        });
      });
    },
    acceptHostTakeSeatInvitation: () => {
      return ZegoUIKit.getSignalingPlugin().acceptInvitation(hostID).then(() => {
        // Cancel request
        ZegoUIKit.getSignalingPlugin().cancelInvitation([hostID]);
        coHostAcceptedHandle(false);
      });
    },
    closeSeats: () => {
      return ZegoUIKit.updateRoomProperties({ lockseat: ZegoSeatsState.lock }).then(() => {
        setIsLocked(true);
        realTimeData.current.isLocked = true;
      })
    },
    openSeats: () => {
      return ZegoUIKit.updateRoomProperties({ lockseat: ZegoSeatsState.unlock }).then(() => {
        setIsLocked(false);
        realTimeData.current.isLocked = false;
      })
    },
    turnMicrophoneOn: (userID, isOn) => {
      return ZegoUIKit.turnMicrophoneOn(userID, isOn);
    },
    removeSpeakerFromSeat: (userID) => {
      const seatIndex = getSeatIndexByUserID(userID);
      if (seatIndex !== -1) {
        return leaveSeat(seatIndex, userID);
      } else {
        return Promise.reject();
      }
    },
  }));

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
            showSoundWaveInAudioMode={showSoundWaveInAudioMode}
            foregroundColor={foregroundColor}
            openIcon={openIcon}
            closeIcon={closeIcon}
            isLocked={isLocked}
          />
        ) : null}
      </View>

      {isMemberListVisable ? (
        <View style={styles.memberListContainer}>
          <TouchableWithoutFeedback
            onPress={() => {
              setIsMemberListVisable(false);
            }}
          >
            <View style={styles.memberListBoxMask} />
          </TouchableWithoutFeedback>
          <View style={styles.memberListBox}>
            <ZegoLiveAudioRoomMemberList
              seatingAreaData={seatingAreaData}
              showMicrophoneState={true}
              onCloseMemberList={() => setIsMemberListVisable(false)}
              memberConnectStateMap={memberConnectStateMap}
              hostID={hostID}
              isLocked={isLocked}
              memberCount={memberCount}
              onMemberListMoreButtonPressed={onMemberListMoreButtonPressed}
              onCoHostDisagree={coHostDisagreeHandle}
              onCoHostAgree={coHostAgreeHandle}
              setIsCoHostDialogVisable={(visable) => setIsCoHostDialogVisable(visable)}
              setCoHostDialogExtendedData={(coHostDialogExtendedData) => setCoHostDialogExtendedData(coHostDialogExtendedData)}
            />
          </View>
        </View>
      ) : (
        <View />
      )}
      {
        visible ? <View style={styles.messageListView}>
          <ZegoInRoomMessageView style={styles.fillParent} itemBuilder={itemBuilder} />
        </View> : null
      }
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
          onOpenMemberList={() => setIsMemberListVisable(true)}
          onSeatTakingRequestRejected={onSeatTakingRequestRejected}
          onConnectStateChanged={connectStateChangedHandle}
          onCoHostAccepted={coHostAcceptedHandle}
          closeSeatsWhenJoin={closeSeatsWhenJoin}
          hostID={hostID}
          isPluginsInit={isInit}
          isLocked={isLocked}
          requestCoHostCount={requestCoHostCount}
          memberConnectState={memberConnectStateMap[userID]}
          setIsToastVisable={setIsToastVisableHandle}
          setToastExtendedData={(toastExtendedData) => setToastExtendedData(toastExtendedData)}
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
          {
            role === ZegoLiveAudioRoomRole.host ? <TouchableOpacity onPress={muteHandle}>
              <Text
                style={[
                  styles.btnText,
                  { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)'},
                ]}
              >
                {
                  ZegoInnerText.muteCoHostButton.includes('%0') ?
                  ZegoInnerText.muteCoHostButton.replace('%0', clickSeatItem.userID) : 
                  ZegoInnerText.muteCoHostButton
                }
              </Text>
            </TouchableOpacity> : null
          }
          <TouchableOpacity
            onPress={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <Text
              style={[
                styles.btnText,
                { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)'},
              ]}
            >
              {ZegoInnerText.cancelMenuDialogButton}
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
      {/* Cohost dialog */}
      <ZegoCoHostMenuDialog
        visable={isCoHostDialogVisable}
        inviteeID={coHostDialogExtendedData.inviteeID}
        invitationType={coHostDialogExtendedData.invitationType}
        onCancel={coHostDialogExtendedData.onCancel}
        onOk={coHostDialogExtendedData.onOk}
        resetTimer={coHostDialogExtendedData.resetTimer}
        isLocked={isLocked}
        memberConnectStateMap={memberConnectStateMap}
        seatIndex={getSeatIndexByUserID(coHostDialogExtendedData.inviteeID)}
      />
      {/* Common toast */}
      <ZegoToast
        visable={isToastVisable}
        text={toastExtendedData.text}
        type={toastExtendedData.type}
      />
      {/* Common dialog */}
      <ZegoDialog
        visable={isDialogVisable}
        title={dialogExtendedData.title}
        content={dialogExtendedData.content}
        cancelText={dialogExtendedData.cancelText}
        okText={dialogExtendedData.okText}
        onCancel={dialogExtendedData.onCancel}
        onOk={dialogExtendedData.onOk}
      />
      <Delegate style={styles.mask} to={background} props={{ userID }} />
    </View>
  );
}

export default forwardRef(ZegoUIKitPrebuiltLiveAudioRoom);

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
    backgroundColor: 'rgba(17,16,20,0.9)',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 15,
  },
  btnText: {
    height: 50,
    lineHeight: 50,
    textAlign: 'center',
    color: '#fff'
  },
});

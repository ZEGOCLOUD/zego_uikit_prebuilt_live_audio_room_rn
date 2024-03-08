import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ZegoToggleMicrophoneButton,
  ZegoSwitchAudioOutputButton,
  ZegoLeaveButton,
} from '@zegocloud/zego-uikit-rn';

import ZegoMoreButton from '../components/ZegoMoreButton';
import ZegoMessageButton from '../components/ZegoMessageButton';
import ZegoMenuBarButtonName from '../components/ZegoMenuBarButtonName';
import ZegoMemberButton from '../components/ZegoMemberButton';
import ZegoCoHostControlButton from '../components/ZegoCoHostControlButton';
import ZegoLockButton from '../components/ZegoLockButton';

export default function ZegoBottomBar(props) {
  const {
    menuBarButtonsMaxCount = 5,
    menuBarButtons = [],
    menuBarExtendedButtons = [],
    turnOnMicrophoneWhenJoining,
    onMoreButtonPress,
    onMessageButtonPress,
    showInRoomMessageButton = false,
    onOpenMemberList,
    useSpeakerWhenJoining,
    onLeaveConfirmation,
    onLeave,
    onSeatTakingRequestRejected,
    onConnectStateChanged,
    onCoHostAccepted,
    hostID,
    closeSeatsWhenJoin,
    isPluginsInit,
    isLocked,
    requestCoHostCount,
    memberConnectState,
  } = props;
  const [isNormalStyle, setIsNormalStyle] = useState(true);

  const getButtonByButtonIndex = (buttonIndex, isFirstLevel) => {
    const buttonSize = isFirstLevel ? 36 : 48;
    switch (buttonIndex) {
      case ZegoMenuBarButtonName.toggleMicrophoneButton:
        return (
          <ZegoToggleMicrophoneButton
            key={buttonIndex}
            isOn={turnOnMicrophoneWhenJoining}
            width={buttonSize}
            height={buttonSize}
            iconMicOn={require('../resources/bottom_button_mic_on.png')}
            iconMicOff={require('../resources/bottom_button_mic_off.png')}
          />
        );
      case ZegoMenuBarButtonName.showMemberListButton:
        return (
          <View>
            <ZegoMemberButton
              key={buttonIndex}
              onPressed={onOpenMemberList}
              width={buttonSize}
              height={buttonSize}
            />
            { requestCoHostCount ? <View style={styles.memberRedDot}></View> : null }
          </View>
        );
      case ZegoMenuBarButtonName.switchAudioOutputButton:
        return (
          <ZegoSwitchAudioOutputButton
            key={buttonIndex}
            useSpeaker={useSpeakerWhenJoining}
            width={buttonSize}
            height={buttonSize}
          />
        );
      case ZegoMenuBarButtonName.leaveButton:
        return (
          <ZegoLeaveButton
            key={buttonIndex}
            onLeaveConfirmation={onLeaveConfirmation}
            onPressed={onLeave}
            iconLeave={require('../resources/white_bottom_button_close.png')}
            width={buttonSize}
            height={buttonSize}
          />
        );
      case ZegoMenuBarButtonName.applyToTakeSeatButton:
        return (
          isLocked ? <ZegoCoHostControlButton
            key={buttonIndex}
            hostID={hostID}
            isPluginsInit={isPluginsInit}
            memberConnectState={memberConnectState}
            onSeatTakingRequestRejected={onSeatTakingRequestRejected}
            onConnectStateChanged={onConnectStateChanged}
            onCoHostAccepted={onCoHostAccepted}
          /> : null
        );
      case ZegoMenuBarButtonName.closeSeatButton:
        return (
          <ZegoLockButton key={buttonIndex} closeSeatsWhenJoin={closeSeatsWhenJoin} />
        );
    }
  };
  const getDisplayButtons = () => {
    var maxCount = menuBarButtonsMaxCount < 1 ? 1 : menuBarButtonsMaxCount;
    maxCount = maxCount > 5 ? 5 : maxCount;
    const needMoreButton =
      menuBarButtons.length + menuBarExtendedButtons.length > maxCount;
    const firstLevelButtons = [];
    const secondLevelButtons = [];
    menuBarButtons.forEach((buttonIndex) => {
      const limitCount = needMoreButton ? maxCount - 1 : maxCount;
      if (firstLevelButtons.length < limitCount) {
        firstLevelButtons.push(getButtonByButtonIndex(buttonIndex, true));
      } else {
        secondLevelButtons.push(getButtonByButtonIndex(buttonIndex, false));
      }
    });
    menuBarExtendedButtons.forEach((button) => {
      const limitCount = needMoreButton ? maxCount - 1 : maxCount;
      if (firstLevelButtons.length < limitCount) {
        firstLevelButtons.push(button, true);
      } else {
        secondLevelButtons.push(button, false);
      }
    });
    if (needMoreButton) {
      firstLevelButtons.push(
        <ZegoMoreButton
          onPress={() => {
            setIsNormalStyle(false);
            if (onMoreButtonPress) onMoreButtonPress();
          }}
        />
      );
    }
    return {
      firstLevelButtons: firstLevelButtons,
      secondLevelButtons: secondLevelButtons,
    };
  };

  var allButtons = getDisplayButtons();
  var firstLevelButtons = allButtons['firstLevelButtons'];
  var secondLevelButtons = allButtons['secondLevelButtons'];

  return isNormalStyle ? (
    <View style={styles.normalBar}>
      {showInRoomMessageButton ? (
        <ZegoMessageButton
          onPress={() => {
            if (typeof onMessageButtonPress === 'function') {
              onMessageButtonPress();
            }
          }}
        />
      ) : null}

      <View style={styles.rightBar}>
        {firstLevelButtons.map((button, index) => (
          <View style={styles.rightBtn} key={index}>
            {button}
          </View>
        ))}
      </View>
    </View>
  ) : (
    <View style={[styles.popupContainer, styles.fillParent]}>
      <View style={[styles.popupMask, styles.fillParent]}>
        <TouchableOpacity
          style={styles.fillParent}
          onPress={() => {
            setIsNormalStyle(true);
          }}
        />
      </View>
      <View style={styles.popupBar}>
        {secondLevelButtons.map((button, index) => (
          <View
            style={{
              marginBottom: 20,
              marginRight: 32 / 2,
              marginLeft: 32 / 2,
            }}
          >
            {button}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageButton: {
    position: 'absolute',
    alignSelf: 'flex-start',
    width: 16,
    height: 16,
  },
  rightBar: {
    flex: 1,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    zIndex: 2,
  },
  normalBar: {
    position: 'absolute',
    justifyContent: 'flex-end',
    marginLeft: 16,
    marginBottom: 16,
    left: 0,
    right: 0,
    height: 50,
    bottom: 0,
    zIndex: 2,
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fillParent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  popupMask: {
    backgroundColor: '#262A2D',
    opacity: 0.3,
  },
  popupBar: {
    flex: 1,
    paddingTop: 27,
    paddingBottom: 3,
    paddingLeft: 28.5,
    paddingRight: 28.5,
    position: 'absolute',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    width: '100%',
    bottom: 0,
    zIndex: 2,
    backgroundColor: '#262A2D',
  },
  rightBtn: {
    marginRight: 16,
  },
  memberRedDot: {
    backgroundColor: '#FF0D23',
    borderRadius: 1000,
    width: 8,
    height: 8,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

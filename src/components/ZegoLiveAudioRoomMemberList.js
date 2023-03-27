import React, { Fragment } from 'react';
import ZegoUIKit, { ZegoMemberList } from '@zegocloud/zego-uikit-rn';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import {
  ZegoLiveAudioRoomRole,
  ZegoInnerText,
  ZegoCoHostConnectState,
  ZegoInvitationType,
} from '../services/defines';
import { getShotName } from '../utils';
import ZegoAgreeCoHostButton from "./ZegoAgreeCoHostButton";
import ZegoDisagreeCoHostButton from "./ZegoDisagreeCoHostButton";

export default function ZegoLiveAudioRoomMemberList(props) {
  const {
    showMicrophoneState,
    onCloseMemberList,
    seatingAreaData,
    memberConnectStateMap,
    hostID,
    isLocked,
    memberCount,
    onMemberListMoreButtonPressed,
    onCoHostDisagree,
    onCoHostAgree,
    setIsCoHostDialogVisable,
    setCoHostDialogExtendedData,
  } = props;
  const localUserID = ZegoUIKit.getLocalUserInfo().userID;

  const sortUserList = (userList) => {
    // Sort by seatingAreaData
    // [{ "seatList": Map { 0 => { "seatIndex": 0, "role": 2, "userID": "xxxx" } } }]
    // you are host: you(host) -> other host -> speaker -> audience
    // yor are not host: host -> you -> speaker -> audience

    // Find out the role of everyone
    const userIDRoleMap = new Map();
    const hostArr = [],
      speakerArr = [],
      audienceArr = [];
    seatingAreaData.forEach((element) => {
      Array.from(element.seatList.values()).forEach((item) => {
        if (item.userID) {
          userIDRoleMap.set(
            item.userID,
            item.role.toString() || ZegoLiveAudioRoomRole.audience.toString()
          );
        }
      });
    });
    userList.forEach((item) => {
      if (
        userIDRoleMap.get(item.userID) === ZegoLiveAudioRoomRole.host.toString()
      ) {
        if (item.userID === localUserID) {
          hostArr.unshift(item);
        } else {
          hostArr.push(item);
        }
      } else if (
        userIDRoleMap.get(item.userID) ===
        ZegoLiveAudioRoomRole.speaker.toString()
      ) {
        if (item.userID === localUserID) {
          speakerArr.unshift(item);
        } else {
          speakerArr.push(item);
        }
      } else {
        if (item.userID === localUserID) {
          // localUser is audience, sort after hostArr
          speakerArr.unshift(item);
        } else {
          if (memberConnectStateMap[item.userID] === ZegoCoHostConnectState.connecting) {
            audienceArr.unshift(item);
          } else {
            audienceArr.push(item);
          }
        }
      }
    });
    const allArr = hostArr.concat(speakerArr, audienceArr);
    return allArr;
  };
  const roleDescription = (item) => {
    const showMe = item.userID == localUserID ? 'You' : '';
    let roleName = '';
    seatingAreaData.forEach((element) => {
      Array.from(element.seatList.values()).forEach((seatItem) => {
        if (seatItem.userID === item.userID) {
          const roleValue = seatItem.role.toString();
          if (roleValue) {
            roleName =
              roleValue === ZegoLiveAudioRoomRole.host.toString()
                ? 'Host'
                : roleValue === ZegoLiveAudioRoomRole.speaker.toString()
                ? 'Speaker'
                : '';
          }
        }
      });
    });
    if (!showMe && !roleName) {
      return '';
    } else {
      return `(${showMe + (showMe && roleName ? ',' : '') + roleName})`;
    }
  };
  // Determine whether you are the host and whether the current member has sent a cohost request
  const showOperationButton = (userID) => {
    return isLocked && localUserID === hostID && memberConnectStateMap[userID] === ZegoCoHostConnectState.connecting;
  };
  const showOperationIcon = (userID) => {
    return localUserID === hostID && userID !== localUserID && memberConnectStateMap[userID] !== ZegoCoHostConnectState.connecting;
  };
  const showAvatar = (userInfo) => {
    return userInfo.inRoomAttributes && userInfo.inRoomAttributes.avatar;
  };
  const operateHandle = (userInfo) => {
    onCloseMemberList();
    const { userID } = userInfo;
    if (typeof onMemberListMoreButtonPressed === 'function') {
      onMemberListMoreButtonPressed(userInfo);
    } else {
      setIsCoHostDialogVisable(true);
      // You can invite to cohost
      setCoHostDialogExtendedData({
        inviteeID: userID,
        invitationType: ZegoInvitationType.inviteToCoHost,
        onOk: () => {
          setIsCoHostDialogVisable(false);
        },
        onCancel: () => {
          setIsCoHostDialogVisable(false);
        },
      });
    }
  };
  const itemBuilder = ({ userInfo }) => {
    return (
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <View style={[styles.avatar, { backgroundColor: showAvatar(userInfo) ? 'transparent' : '#DBDDE3' }]}>
            {
              showAvatar(userInfo) ? 
              <Image 
                source={{ uri: userInfo.inRoomAttributes.avatar }} 
                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                resizeMode="contain"
              /> :
              <Text style={styles.nameLabel}>
                {getShotName(userInfo.userName)}
              </Text>
            }
          </View>
          <Text style={styles.name}>
            {userInfo.userName + roleDescription(userInfo)}
          </Text>
        </View>
        <View style={styles.itemRight}>
        {
          showOperationButton(userInfo.userID) ? <Fragment>
            <View style={{marginRight: 6}}>
              <ZegoDisagreeCoHostButton onPressed={onCoHostDisagree.bind(this, userInfo.userID)} inviterID={userInfo.userID} />
            </View>
            <View>
              <ZegoAgreeCoHostButton onPressed={onCoHostAgree.bind(this, userInfo.userID)} inviterID={userInfo.userID} />
            </View>
          </Fragment> : null
        }
        {
          showOperationIcon(userInfo.userID) ? <TouchableOpacity onPress={operateHandle.bind(this, userInfo)}>
            <Image source={require('../resources/icon_more_vertical.png')} />
            </TouchableOpacity> : null
        }
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLine} />
      <View style={styles.header}>
        <Text style={styles.title}>
          {ZegoInnerText.memberListTitle} · {memberCount}
        </Text>
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
    backgroundColor: 'rgba(17, 16, 20, 0.9)',
    width: '100%',
    height: 350,
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

  item: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 17,
    height: 62,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: '#DBDDE3',
    borderRadius: 1000,
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#222222',
    fontSize: 16,
  },
  name: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

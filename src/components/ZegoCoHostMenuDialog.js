import React, { useEffect, useState, useRef, Fragment }from "react";
import ZegoUIKit from '@zegocloud/zego-uikit-rn';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { ZegoSendInvitationButton } from '@zegocloud/zego-uikit-rn';
import { ZegoInnerText, ZegoInvitationType } from "../services/defines";

export default function ZegoCoHostMenuDialog(props) {
    const countdownMap = useRef();
    const countdownTimerMap = useRef();
    const {
        visable,
        inviteeID,
        invitationType = ZegoInvitationType.inviteToCoHost,
        onCancel,
        onOk,
        resetTimer,
        isLocked,
        memberConnectStateMap,
        getSeatIndexByUserID,
    } = props;

    if (visable) {
        const inviteeCountdown = countdownMap.current.get(inviteeID);
        if (!inviteeCountdown) {
            countdownMap.current.set(inviteeID, 60);
        }
    }
    if (resetTimer) {
        // Reset invitation timer
        const inviteeIDs = inviteeID ? [inviteeID] : Array.from(countdownTimerMap.current.keys());
        inviteeIDs.forEach((inviteeID) => {
            clearInterval(countdownTimerMap.current.get(inviteeID));
            countdownMap.current.set(inviteeID, 60);
            countdownTimerMap.current.set(inviteeID, null);
        })
    }

    const getCustomContainerStyle = (visable) => StyleSheet.create({
        customContainer: {
            display: visable ? 'flex' : 'none',
        },
    });
    // Verify whether invitations can be sent
    const willPressedHandle = () => {
        let result = true;
        if (invitationType === ZegoInvitationType.inviteToCoHost) {
            // Check whether the timer is running out
            console.log('#########Timer: Check whether the timer is running out', countdownMap.current, countdownTimerMap.current);

            if (countdownTimerMap.current.get(inviteeID)) {
                // The timer did not complete and the request was not allowed to occur
                console.log('#########Timer: The timer did not complete and the request was not allowed to occur', countdownMap.current, countdownTimerMap.current);
                onCancel();
                result = false;
            } else {
                // Restart timer
                clearInterval(countdownTimerMap.current.get(inviteeID));
                countdownTimerMap.current.set(inviteeID ,setInterval(() => {
                    console.log('#########Timer: countdown', countdownMap.current, countdownTimerMap.current);
                    if (countdownMap.current.get(inviteeID) === 0) {
                        clearInterval(countdownTimerMap.current.get(inviteeID));
                        countdownTimerMap.current.set(inviteeID, null);
                        countdownMap.current.set(inviteeID, 60);
                    } else {
                        countdownMap.current.set(inviteeID, countdownMap.current.get(inviteeID) - 1);
                    }
                }, 1000));
                if (!ZegoUIKit.getUser(inviteeID)) {
                    result = false;
                    onCancel();
                }
            }
        }
        return result;
    }

    const getUserName = (userID) => {
      const user = ZegoUIKit.getUser(userID);
      return user ? user.userName : userID;
    }

    // 

    useEffect(() => {
        // First render initializes and clears timer
        console.log('#########Timer: First render initializes and clears timer', countdownMap.current, countdownTimerMap.current);
        countdownMap.current = new Map();
        countdownTimerMap.current = new Map();
        return () => {
            // Initializes and clears timer when component is destroyed
            console.log('#########Timer: Initializes and clears timer when component is destroyed', countdownMap.current, countdownTimerMap.current);
            Array.from(countdownTimerMap.current.keys()).forEach((key) => {
                clearInterval(countdownTimerMap.current.get(key));
                countdownTimerMap.current.set(key, null);
            });
        };
    }, []);

    return <View style={[styles.container, getCustomContainerStyle(visable).customContainer]}>
        <TouchableWithoutFeedback onPress={onCancel} >
            <View style={styles.mask} />
        </TouchableWithoutFeedback>
        <View style={styles.main}>
            {
                // seatIndex = -1 : it's accepting an invitation but failing to get on the mic
                isLocked && getSeatIndexByUserID(inviteeID) === -1 ?
                    <ZegoSendInvitationButton
                        backgroundColor={'transparent'}
                        width='100%'
                        height={50}
                        fontSize={14}
                        color='#fff'
                        text={
                            ZegoInnerText.inviteToTakeSeatMenuDialogButton.includes('%0') ? 
                                ZegoInnerText.inviteToTakeSeatMenuDialogButton.replace('%0', getUserName(inviteeID)) :
                                ZegoInnerText.inviteToTakeSeatMenuDialogButton
                        }
                        invitees={[inviteeID]}
                        type={invitationType}
                        onWillPressed={willPressedHandle}
                        onPressed={onOk}
                    /> : null
            }
            <View style={styles.divide}></View>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>{ZegoInnerText.cancelMenuDialogButton}</Text>
            </TouchableOpacity>
        </View>
    </View>
}
 
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 12,
    },
    mask: {
        width: '100%',
        height: '100%',
    },
    main: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        backgroundColor: 'rgba(17,16,20,0.9)',
    },
    divide: {
        width: '100%',
        height: 1,
        backgroundColor: '#FFFFFF',
        opacity: 0.1,
    },
    cancelButton: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 14,
        color: '#fff',
    },
});
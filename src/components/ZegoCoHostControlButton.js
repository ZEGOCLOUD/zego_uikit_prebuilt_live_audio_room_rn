import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { ZegoCoHostConnectState } from '../services/defines';
import ZegoRequestCoHostButton from './ZegoRequestCoHostButton';
import ZegoCancelRequestCoHostButton from './ZegoCancelRequestCoHostButton';
import ZegoUIKit from '@zegocloud/zego-uikit-rn';
import { zloginfo } from "../utils/logger";

export default function ZegoCoHostControlButton(props) {
    const {
        hostID,
        isPluginsInit,
        memberConnectState = ZegoCoHostConnectState.idle,
        onSeatTakingRequestRejected,
        onConnectStateChanged,
        onCoHostAccepted,
    } = props;
    const ZegoCoHostControlButtonType = {
        request: 0,
        cancel: 1,
    };

    const coHostControlHandle = (btnType) => {
        let newConnectState = memberConnectState;
        if (btnType === ZegoCoHostControlButtonType.request) {
            newConnectState = ZegoCoHostConnectState.connecting;
        } else if (btnType === ZegoCoHostControlButtonType.cancel) {
            newConnectState = ZegoCoHostConnectState.idle;
        }
        onConnectStateChanged('', newConnectState);
    };
    const cancelUnsuccessfullyHandle = () => {
        onConnectStateChanged('', ZegoCoHostConnectState.idle);
    };

    useEffect(() => {
        const callbackID = 'ZegoCoHostControlButton' + String(Math.floor(Math.random() * 10000));
        if (isPluginsInit) {
            // Plugins init success and register plugins callback
            zloginfo('[ZegoCoHostControlButton]Plugins init success and register plugins callback');
            ZegoUIKit.getSignalingPlugin().onInvitationResponseTimeout(callbackID, ({ callID, invitees, data }) => {
                // The host did not process your cohost request, resulting in a timeout
                console.log('#######onInvitationResponseTimeout, The host did not process your cohost request, resulting in a timeout');
                onConnectStateChanged('', ZegoCoHostConnectState.idle, true);
            });
            ZegoUIKit.getSignalingPlugin().onInvitationAccepted(callbackID, async ({ callID, invitee, data }) => {
                // The host accepted your cohost request
                console.log('#######onInvitationAccepted, The host accepted your cohost request');
                onCoHostAccepted(true);
            });
            ZegoUIKit.getSignalingPlugin().onInvitationRefused(callbackID, ({ callID, invitee, data }) => {
                // The host rejected your cohost request
                console.log('#######onInvitationRefused, The host rejected your cohost request');
                onConnectStateChanged('', ZegoCoHostConnectState.idle, true);
                typeof onSeatTakingRequestRejected === 'function' && onSeatTakingRequestRejected();
            });
        }
        return () => {
            if (isPluginsInit) {
                ZegoUIKit.getSignalingPlugin().onInvitationResponseTimeout(callbackID);
                ZegoUIKit.getSignalingPlugin().onInvitationAccepted(callbackID);
                ZegoUIKit.getSignalingPlugin().onInvitationRefused(callbackID);
            }
        };
    }, [isPluginsInit]);

    return (
        <View style={styles.btnContainer}>
            {
                !memberConnectState ? <ZegoRequestCoHostButton
                    hostID={hostID}
                    onRequestSuccessfully={coHostControlHandle.bind(this, ZegoCoHostControlButtonType.request)}
                /> :
                memberConnectState === ZegoCoHostConnectState.connecting ? <ZegoCancelRequestCoHostButton
                    hostID={hostID}
                    onCancelUnsuccessfully={cancelUnsuccessfullyHandle}
                    onCancelSuccessfully={coHostControlHandle.bind(this, ZegoCoHostControlButtonType.cancel)}
                /> : null
            }
        </View>
    )
}

const styles = StyleSheet.create({
    btnContainer: {},
});

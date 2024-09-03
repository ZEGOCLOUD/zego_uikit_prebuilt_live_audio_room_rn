import React from "react";
import { ZegoInnerText, ZegoLiveAudioRoomInvitationType, ZegoToastType } from "../services/defines";
import { ZegoSendInvitationButton } from '@zegocloud/zego-uikit-rn';

export default function ZegoRequestCoHostButton(props) {
    const {
        hostID,
        onRequestSuccessfully,
    } = props;
    console.log('ZegoRequestCoHostButton hostID', hostID);

    // Verify whether invitations can be sent
    const willPressedHandle = () => {
        console.log('ZegoRequestCoHostButton willPressedHandle hostID', hostID);
        let result = true;
        if (!hostID) {
            result = false;
        }
        return result;
    }
    const pressedHandle = () => {
        onRequestSuccessfully();
    };

    return (
        <ZegoSendInvitationButton
            icon={require('../resources/icon_request_cohost.png')}
            backgroundColor={'rgba(30, 39, 64, 0.4)'}
            width={165}
            height={36}
            fontSize={13}
            color='#fff'
            text={ZegoInnerText.applyToTakeSeatButton}
            verticalLayout={false}
            invitees={[hostID]}
            type={ZegoLiveAudioRoomInvitationType.requestCoHost}
            onWillPressed={willPressedHandle}
            onPressed={pressedHandle}
        ></ZegoSendInvitationButton>
    )
}
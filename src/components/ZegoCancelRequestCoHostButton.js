import React from "react";

import { ZegoInnerText } from "../services/defines";
import { ZegoCancelInvitationButton } from '@zegocloud/zego-uikit-rn';

export default function ZegoCancelRequestCoHostButton(props) {
    const {
        hostID,
        onCancelSuccessfully,
        onCancelUnsuccessfully,
    } = props;

    const pressedHandle = () => {
        onCancelSuccessfully();
    };
    const willPressedHandle = () => {
        let result = true;
        if (!hostID) {
            result = false;
            onCancelUnsuccessfully();
        }
        return result;
    };

    return (
        <ZegoCancelInvitationButton
            icon={require('../resources/icon_request_cohost.png')}
            backgroundColor={'rgba(30, 39, 64, 0.4)'}
            width={100}
            height={36}
            fontSize={13}
            color='#fff'
            text={ZegoInnerText.cancelTheTakeSeatApplicationButton}
            verticalLayout={false}
            invitees={[hostID]}
            onWillPressed={willPressedHandle}
            onPressed={pressedHandle}
        ></ZegoCancelInvitationButton>
    )
}
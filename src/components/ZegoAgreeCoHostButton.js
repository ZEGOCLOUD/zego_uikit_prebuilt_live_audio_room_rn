import React from "react";

import { ZegoAcceptInvitationButton } from '@zegocloud/zego-uikit-rn';

export default function ZegoAgreeCoHostButton(props) {
    const { onPressed, inviterID } = props;

    return (
        <ZegoAcceptInvitationButton
            backgroundColor={'rgba(16, 84, 255, 0.4)'}
            width={63}
            height={32}
            fontSize={14}
            color='#FFFFFF'
            text='Agree'
            inviterID={inviterID}
            onPressed={onPressed}
        ></ZegoAcceptInvitationButton>
    )
}

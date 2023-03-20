import React from "react";

import { ZegoRefuseInvitationButton } from '@zegocloud/zego-uikit-rn';

export default function ZegoDisagreeCoHostButton(props) {
    const { onPressed, inviterID } = props;

    return (
        <ZegoRefuseInvitationButton
            backgroundColor={'rgba(255, 255, 255, 0.1)'}
            width={82.5}
            height={32}
            fontSize={14}
            color='#A7A6B7'
            text='Disagree'
            inviterID={inviterID}
            onPressed={onPressed}
        ></ZegoRefuseInvitationButton>
    )
}
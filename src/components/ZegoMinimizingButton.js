import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import MinimizingHelper from "../services/minimizing_helper";
import { getMethodReturnValue } from "../utils"

export default function ZegoMinimizingButton(props) {
    const {
        width = 20,
        height = 20,
        icon = require('../resources/icon_minimize.png'),
        onPressed,
        onWillPressed,
    } = props;

    const pressedHandle = async () => {
        const canMinimize = await getMethodReturnValue(onWillPressed);
        if (canMinimize) {
            MinimizingHelper.getInstance().minimize();

            typeof onPressed === 'function' && onPressed();
        }
    };

    return (
        <TouchableOpacity
            style={{ width, height }}
            onPress={pressedHandle}
        >
            <Image
                source={icon}
                style={{ width: '100%', height: '100%' }}
            />
        </TouchableOpacity>
    );
}
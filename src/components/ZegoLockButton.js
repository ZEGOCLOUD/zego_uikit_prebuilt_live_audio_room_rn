import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import ZegoUIKit from '@zegocloud/zego-uikit-rn';
import { ZegoSeatsState } from '../services/defines';

export default function ZegoLockButton(props) {
    const {
        width = 36,
        height = 36,
        iconLock = require('../resources/bottom_button_lock.png'),
        iconUnLock = require('../resources/bottom_button_unlock.png'),
        closeSeatsWhenJoin,
    } = props;

    const lockseat = ZegoUIKit.getRoomProperties().lockseat;
    const [isLocked, setIsLocked] = useState(lockseat === ZegoSeatsState.lock);

    useEffect(()=> {
        console.log('ZegoLockButton', lockseat, closeSeatsWhenJoin);
        if (lockseat === undefined && closeSeatsWhenJoin) {
            ZegoUIKit.updateRoomProperties({ lockseat: ZegoSeatsState.lock }).then(() => {
                setIsLocked(true);
            })
        }

        const callbackID = 'ZegoLockButton' + String(Math.floor(Math.random() * 10000));
        ZegoUIKit.onRoomPropertyUpdated(callbackID, (key, oldvalue, newValue) => {
            if (key === 'lockseat') {
              const isLocked = newValue === ZegoSeatsState.lock;
              setIsLocked(isLocked);
            }
          });
    }, []);

    const pressedHandle = () => {
        ZegoUIKit.updateRoomProperties({ lockseat: isLocked ? ZegoSeatsState.unlock : ZegoSeatsState.lock }).then(() => {
            setIsLocked(!isLocked);
        })
    };

    return (
        <TouchableOpacity
            style={{ width, height }}
            onPress={pressedHandle}
        >
            <Image
                source={isLocked ? iconLock : iconUnLock}
                style={{ width: '100%', height: '100%' }}
            />
        </TouchableOpacity>
    );
}

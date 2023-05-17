import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    Animated,
    PanResponder,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { ZegoAudioVideoView } from '@zegocloud/zego-uikit-rn';
import MinimizingHelper from "../services/minimizing_helper";
import { zloginfo } from "../utils/logger";
  
export default function ZegoMinimizeRoomFloat(props, ref) {
    const window = useWindowDimensions();
    const { width, height } = window;

    const [isInit, setIsInit] = useState(false);
    const [isVisable, setIsVisable] = useState(false);
    const [layout, setLayout] = useState({
        left: 0,
        top: 0,
    });
    const [floatViewInfo, setFloatViewInfo] = useState({
        width: 0, height: 0,
    });
    const [seatConfig, setSeatConfig] = useState({
        showSoundWaveInAudioMode: true,
        foregroundBuilder: null,
        backgroundColor: 'transparent',
        backgroundImage: null,
    });
    const [activeUserID, setActiveUserID] = useState('');
    const [isMoving, setIsMoving] = useState(false);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onPanResponderGrant: (evt, gestureState) => {
            zloginfo('[ZegoMinimizeRoomFloat] onPanResponderGrant gestureState', gestureState);
            setIsMoving(false);
        },
        onPanResponderMove: (evt, gestureState) => {
            // zloginfo('[ZegoMinimizeRoomFloat] onPanResponderMove layout', layout);
            // zloginfo('[ZegoMinimizeRoomFloat] onPanResponderMove gestureState', gestureState);
            if (
                Math.abs(gestureState.dx) < 5 &&
                Math.abs(gestureState.dy) < 5 &&
                !isMoving
            ) {
                setIsMoving(false);
            } else {
                setIsMoving(true);
                const newLeft = layout.left + gestureState.dx;
                const newTop = layout.top + gestureState.dy;
                if (newLeft >= (width - floatViewInfo.width) || newTop >= (height - floatViewInfo.height) || newLeft <= 0 || newTop <= 0) return;
                setLayout({
                    left: newLeft,
                    top: newTop,
                });
            }
        },
        onPanResponderEnd: (evt, gestureState) => {
            zloginfo('[ZegoMinimizeRoomFloat] onPanResponderEnd layout', layout);
            zloginfo('[ZegoMinimizeRoomFloat] onPanResponderEnd gestureState', gestureState);
        },
        onPanResponderRelease: () => {
            if (!isMoving) {
                // Click
                pressedHandle();
            }
            setIsMoving(false);
        },
    });

    const callbackID = 'ZegoMinimizeRoom' + String(Math.floor(Math.random() * 10000));
    
    const layoutHandle = useCallback((e) => {
        const  { x, y, width, height } = e.nativeEvent.layout;
        zloginfo('[ZegoMinimizeRoomFloat] layoutHandle', x, y, width, height);
        setFloatViewInfo({ width, height });
    }, []);
    const pressedHandle = async () => {
        zloginfo('[ZegoMinimizeRoomFloat] pressedHandle');
        MinimizingHelper.getInstance().notifyMaximize();
    }

    useEffect(() => {
        MinimizingHelper.getInstance().onLiveAudioRoomInit(callbackID, () => {
            zloginfo('[ZegoMinimizeRoomFloat] init success');
            setIsInit(true);

            const initConfig = MinimizingHelper.getInstance().getInitConfig();
            const { seatConfig: _seatConfig = {} } = initConfig;
            setSeatConfig({ ...seatConfig, ..._seatConfig });
            zloginfo('[ZegoMinimizeRoomFloat] seatConfig', initConfig.seatConfig);
        });
        return () => {
            MinimizingHelper.getInstance().onLiveAudioRoomInit(callbackID);
        };
    }, []);
    useEffect(() => {
        if (isInit) {
            MinimizingHelper.getInstance().onMinimize(callbackID, () => {
                setIsVisable(true);
                const initConfig = MinimizingHelper.getInstance().getInitConfig();
                const { onMinimize } = initConfig;

                if (typeof onMinimize === 'function') {
                    onMinimize({
                        origin: 'ZegoMinimizeRoomFloat'
                    });
                    MinimizingHelper.getInstance().setIsMinimizeSwitch(true);
                }
            });
            MinimizingHelper.getInstance().onMaximize(callbackID, () => {
                setIsVisable(false);
                const initConfig = MinimizingHelper.getInstance().getInitConfig();
                const { onMaximize } = initConfig;

                if (typeof onMaximize === 'function') {
                    onMaximize({
                        origin: 'ZegoMinimizeRoomFloat'
                    });
                    MinimizingHelper.getInstance().setIsMinimizeSwitch(true);
                }
            });
            MinimizingHelper.getInstance().onActiveUserIDUpdate(callbackID, (activeUserID) => {
                zloginfo(`[ZegoMinimizeRoomFloat] onActiveUserIDUpdate`, activeUserID);
                setActiveUserID(activeUserID);
            });
        }
        return () => {
            MinimizingHelper.getInstance().onMinimize(callbackID);
            MinimizingHelper.getInstance().onMaximize(callbackID);
            MinimizingHelper.getInstance().onActiveUserIDUpdate(callbackID);
        }
    }, [isInit]);
    return (
        <Animated.View
            style={[
                { position: 'absolute', left: layout.left, top: layout.top },
                { display: isVisable ? 'flex' : 'none' },
            ]}
            onLayout={layoutHandle}
            {...panResponder.panHandlers}
        >
            <View
                style={styles.floatAudioView}
            >
                {
                    activeUserID ? <ZegoAudioVideoView
                        key={activeUserID}
                        userID={activeUserID}
                        foregroundBuilder={
                            seatConfig.foregroundBuilder
                                ? ({ userInfo }) => seatConfig.foregroundBuilder({ userInfo, seatIndex: 1 })
                                : ({ userInfo }) => <View />
                        }
                        useVideoViewAspectFill={true}
                        showSoundWave={seatConfig.showSoundWaveInAudioMode}
                        audioViewBackgroudColor={seatConfig.backgroundColor}
                        audioViewBackgroudImage={seatConfig.backgroundImage}
                        avatarSize={{ width: 54, height: 54 }}
                        avatarAlignment={0}
                        soundWaveColor="#3655ff"
                    /> : <View />
                }
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    floatAudioView: {
        width: 100,
        height: 100,
        borderRadius: 50,
        zIndex: 10000,
    },
    floatAudioViewText: {
        color: 'white',
        fontSize: 16,
    },
});
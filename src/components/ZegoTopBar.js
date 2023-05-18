import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ZegoLeaveButton } from '@zegocloud/zego-uikit-rn';
import ZegoMinimizingButton from './ZegoMinimizingButton';
import ZegoMenuBarButtonName from "./ZegoMenuBarButtonName";

export default function ZegoTopBar(props) {
    const { menuBarButtons = [], onLeave, onLeaveConfirmation } = props;

    const getButtonByButtonIndex = (buttonIndex) => {
        switch (buttonIndex) {
            case ZegoMenuBarButtonName.minimizingButton:
                return <ZegoMinimizingButton />;
            case ZegoMenuBarButtonName.leaveButton:
                return <ZegoLeaveButton 
                    onLeaveConfirmation={onLeaveConfirmation}
                    onPressed={onLeave}
                    iconLeave={require('../resources/top_button_logout.png')}
                    width={34}
                    height={34}
                />;
        }
    };

    return <View style={styles.topRightBar}>
        {
            menuBarButtons.map((buttonIndex) => <View key={buttonIndex} style={styles.customIconContainer}>
                {getButtonByButtonIndex(buttonIndex)}
            </View>)
        }
    </View>;
}

const styles = StyleSheet.create({
    topRightBar: {
      zIndex: 5,
      position: 'absolute',
      top: 65,
      right: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',    
    },
    customIconContainer: {
        marginLeft: 8,
    }
});
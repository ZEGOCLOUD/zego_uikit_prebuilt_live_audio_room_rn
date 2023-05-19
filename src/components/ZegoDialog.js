import React from 'react';
import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MinimizingHelper from "../services/minimizing_helper";

export default function ZegoDialog(props) {
    const {
        title = '',
        content = '',
        cancelText = 'cancel',
        okText = 'ok',
        onCancel,
        onOk,
    } = props;

    const [visable, setVisable] = useState(false);
    
    const getCustomContainerStyle = (visable) => StyleSheet.create({
        customContainer: {
            display: visable ? 'flex' : 'none',
        },
    });

    useEffect(() => {
        const callbackID = 'ZegoDialog' + String(Math.floor(Math.random() * 10000));
        MinimizingHelper.getInstance().onZegoDialogTrigger(callbackID, (visable) => {
            setVisable(visable);
        });
        return () => {
            MinimizingHelper.getInstance().onZegoDialogTrigger(callbackID);
        };
    }, []);
   
    return (
        <View style={[styles.container, getCustomContainerStyle(visable).customContainer]}>
            <View style={styles.mask}>
                <View style={styles.main}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.desc}>{content}</Text>
                    </View>
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={onCancel} style={styles.opaButton}>
                            <Text style={styles.opaText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onOk} style={[styles.opaButton, {borderLeftWidth: 1, borderLeftColor: 'rgba(255, 255, 255, 0.1)'}]}>
                            <Text style={styles.opaText}>{okText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 13,
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    mask: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    main: {
        width: 300,
        backgroundColor: 'rgba(17, 16, 20, 0.84)',
        borderRadius: 16,
        paddingTop: 15,
    },
    header: {
        paddingBottom: 14.5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 45,
        paddingRight: 45,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
    },
    content: {
        paddingBottom: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },
    desc: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
        paddingLeft: 45,
        paddingRight: 45,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        flexDirection: 'row',
    },
    opaButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 14,
        paddingBottom: 13.5,
    },
    opaText: {
        color: '#FFFFFF',
        fontSize: 16,
    }
});

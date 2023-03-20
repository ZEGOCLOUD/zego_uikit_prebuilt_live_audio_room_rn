import { Platform, PermissionsAndroid } from 'react-native';

const getShotName = (name) => {
    if (!name) {
        return '';
    }
    const nl = name.split(' ');
    var shotName = '';
    nl.forEach((part) => {
        if (part !== '') {
            shotName += part.substring(0, 1);
        }
    });
    return shotName;
};

const grantPermissions = async (callback) => {
    // Android: Dynamically obtaining device permissions
    if (Platform.OS === 'android') {
        // Check if permission granted
        let grantedAudio = PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        // let grantedCamera = PermissionsAndroid.check(
        //     PermissionsAndroid.PERMISSIONS.CAMERA
        // );
        const ungrantedPermissions = [];
        try {
            const isAudioGranted = await grantedAudio;
            // const isVideoGranted = await grantedCamera;
            if (!isAudioGranted) {
                ungrantedPermissions.push(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
                );
            }
            // if (!isVideoGranted) {
            //     ungrantedPermissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
            // }
        } catch (error) {
            ungrantedPermissions.push(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                // PermissionsAndroid.PERMISSIONS.CAMERA
            );
        }
        // If not, request it
        return PermissionsAndroid.requestMultiple(ungrantedPermissions).then(
            (data) => {
                if (callback) {
                    callback();
                }
            }
        );
    } else if (callback) {
        callback();
    }
};

export { getShotName, grantPermissions };

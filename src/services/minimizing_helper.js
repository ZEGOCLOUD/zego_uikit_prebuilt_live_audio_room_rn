import ZegoUIKit from '@zegocloud/zego-uikit-rn';

export default class MinimizingHelper {
    _instance;
    _isMinimizeSwitch = false;
    _activeUserID = '';
    _rangeSoundLevels = {};
    _onActiveUserIDUpdateCallbackMap = {};
    _onMinimizeCallbackMap = {};
    _onMaximizeCallbackMap = {};
    _updateTimer = null;
    _appInfo = {};
    _localUser = {};
    _roomID = '';
    _config = {};
    _plugins = [];
    _onLiveAudioRoomInitCallbackMap = {};
    constructor() { }
    static getInstance() {
        return this._instance || (this._instance = new MinimizingHelper());
    }
    setIsMinimizeSwitch(isMinimizeSwitch) {
        this._isMinimizeSwitch = !!isMinimizeSwitch;
    }
    getIsMinimizeSwitch() {
        return this._isMinimizeSwitch;
    }
    setInitParams(appID, appSign, userID, userName, roomID, config = {}) {
        this._appInfo = { appID, appSign };
        this._localUser = { userID, userName };
        this._roomID = roomID;
        Object.assign(this._config, config);
    }
    getInitAppInfo() {
        return this._appInfo;
    }
    getInitUser() {
        return this._localUser;
    }
    getInitRoomID() {
        return this._roomID;
    }
    getInitConfig() {
        return this._config;
    }
    getInitPlugins() {
        return this._plugins;
    }
    minimize() {
        const callbackID = 'MinimizingHelper' + String(Math.floor(Math.random() * 10000));
        this.unRegisterAudioVideoListCallback(callbackID);
        this.registerAudioVideoListCallback(callbackID);

        this.notifyMinimize();
        this.startUpdateTimer();
    }
    startUpdateTimer() {
        this.updateActiveUserIDByTimer();

        this.initUpdateTimer();
        this._updateTimer = setInterval(() => {
            this.updateActiveUserIDByTimer();
        }, 10000)
    }
    initUpdateTimer() {
        clearInterval(this._updateTimer);
        this._updateTimer = null;
    }
    updateActiveUserIDByTimer() {
        // console.log('[MinimizingHelper]updateActiveUserIDByTimer', this._rangeSoundLevels);
        let maxAverageSoundLevel = 0;
        Object.entries(this._rangeSoundLevels).forEach(([userID, soundLevels]) => {
            const averageSoundLevel =
                soundLevels.reduce((a, b) => a + b) / soundLevels.length;

            if (averageSoundLevel > maxAverageSoundLevel) {
                this._activeUserID = userID;
                maxAverageSoundLevel = averageSoundLevel;
            }
        });

        this._activeUserID = this._activeUserID || ZegoUIKit.getLocalUserInfo().userID || '';
        this._rangeSoundLevels = {};
        
        // console.log('[MinimizingHelper]updateActiveUserIDByTimer', this._activeUserID);
        this.notifyActiveUserIDUpdate(this._activeUserID);
    }
    registerAudioVideoListCallback(callbackID) {
        ZegoUIKit.onAudioVideoAvailable(callbackID, (userList) => {
            console.log('[MinimizingHelper]onAudioVideoAvailable', this._activeUserID);
            userList.forEach((user) => {
                if (this._rangeSoundLevels[user.userID]) {
                    this._rangeSoundLevels[user.userID].push(user.soundLevel);
                } else {
                    this._rangeSoundLevels[user.userID] = [user.soundLevel];
                }
            });
        });
        ZegoUIKit.onAudioVideoUnavailable(callbackID, (userList) => {
            console.log('[MinimizingHelper]onAudioVideoUnavailable', this._activeUserID);
            userList.forEach((user) => {
                delete this._rangeSoundLevels[user.userID];
            });
        });
        ZegoUIKit.onSoundLevelUpdated(callbackID, (userID, soundLevel) => {
            // console.log('[MinimizingHelper]onSoundLevelUpdated', this._rangeSoundLevels, userID, soundLevel);
            if (this._rangeSoundLevels[userID]) {
                this._rangeSoundLevels[userID].push(soundLevel);
            } else {
                this._rangeSoundLevels[userID] = [soundLevel];
            }
        });
    }
    unRegisterAudioVideoListCallback(callbackID) {
        ZegoUIKit.onAudioVideoAvailable(callbackID);
        ZegoUIKit.onAudioVideoUnavailable(callbackID);
        ZegoUIKit.onSoundLevelUpdated(callbackID);
    }
    notifyLiveAudioRoomInit() {
        Object.keys(this._onLiveAudioRoomInitCallbackMap).forEach((callbackID) => {
            if (this._onLiveAudioRoomInitCallbackMap[callbackID]) {
                this._onLiveAudioRoomInitCallbackMap[callbackID]();
            }
        });
    }
    notifyActiveUserIDUpdate(activeUserID) {
        Object.keys(this._onActiveUserIDUpdateCallbackMap).forEach((callbackID) => {
            if (this._onActiveUserIDUpdateCallbackMap[callbackID]) {
                this._onActiveUserIDUpdateCallbackMap[callbackID](activeUserID);
            }
        })
    }
    notifyMinimize() {
        Object.keys(this._onMinimizeCallbackMap).forEach((callbackID) => {
            if (this._onMinimizeCallbackMap[callbackID]) {
                this._onMinimizeCallbackMap[callbackID]();
            }
        })
    }
    notifyMaximize() {
        Object.keys(this._onMaximizeCallbackMap).forEach((callbackID) => {
            if (this._onMaximizeCallbackMap[callbackID]) {
                this._onMaximizeCallbackMap[callbackID]();
            }
        })
    }
    onLiveAudioRoomInit(callbackID, callback) {
        if (typeof callback !== 'function') {
            delete this._onLiveAudioRoomInitCallbackMap[callbackID];
        } else {
            this._onLiveAudioRoomInitCallbackMap[callbackID] = callback;
        }
    }
    onActiveUserIDUpdate(callbackID, callback) {
        if (typeof callback !== 'function') {
            delete this._onActiveUserIDUpdateCallbackMap[callbackID];
        } else {
            this._onActiveUserIDUpdateCallbackMap[callbackID] = callback;
        }
    }
    onMinimize(callbackID, callback) {
        if (typeof callback !== 'function') {
            delete this._onMinimizeCallbackMap[callbackID];
        } else {
            this._onMinimizeCallbackMap[callbackID] = callback;
        }
    }
    onMaximize(callbackID, callback) {
        if (typeof callback !== 'function') {
            delete this._onMaximizeCallbackMap[callbackID];
        } else {
            this._onMaximizeCallbackMap[callbackID] = callback;
        }
    }
}
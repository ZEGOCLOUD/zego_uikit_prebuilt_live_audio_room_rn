import ZegoUIKit from '@zegocloud/zego-uikit-rn';
import { zloginfo } from "../utils/logger";

export default class MinimizingHelper {
    _instance;
    _isMinimize = false;
    _isMinimizeSwitch = false;
    _activeUserID = '';
    _rangeSoundLevels = {};
    _onActiveUserIDUpdateCallbackMap = {};
    _onWindowMinimizeCallbackMap = {};
    _onWindowMaximizeCallbackMap = {};
    _onEntryNormalCallbackMap = {};
    _updateTimer = null;
    _appInfo = {};
    _localUser = {};
    _roomID = '';
    _config = {};
    _plugins = [];
    _onLiveAudioRoomInitCallbackMap = {};
    _onZegoDialogTriggerCallbackMap = {};
    constructor() { }
    static getInstance() {
        return this._instance || (this._instance = new MinimizingHelper());
    }
    getIsMinimize() {
        return this._isMinimize;
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
    minimizeWindow() {
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
        }, 1000)
    }
    initUpdateTimer() {
        clearInterval(this._updateTimer);
        this._updateTimer = null;
    }
    updateActiveUserIDByTimer() {
        // zloginfo('[MinimizingHelper]updateActiveUserIDByTimer', this._rangeSoundLevels);
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
        
        // zloginfo('[MinimizingHelper]updateActiveUserIDByTimer', this._activeUserID);
        this.notifyActiveUserIDUpdate(this._activeUserID);
    }
    registerAudioVideoListCallback(callbackID) {
        ZegoUIKit.onAudioVideoAvailable(callbackID, (userList) => {
            zloginfo('[MinimizingHelper]onAudioVideoAvailable', this._activeUserID);
            userList.forEach((user) => {
                if (this._rangeSoundLevels[user.userID]) {
                    this._rangeSoundLevels[user.userID].push(user.soundLevel);
                } else {
                    this._rangeSoundLevels[user.userID] = [user.soundLevel];
                }
            });
        });
        ZegoUIKit.onAudioVideoUnavailable(callbackID, (userList) => {
            zloginfo('[MinimizingHelper]onAudioVideoUnavailable', this._activeUserID);
            userList.forEach((user) => {
                delete this._rangeSoundLevels[user.userID];
            });
        });
        ZegoUIKit.onSoundLevelUpdated(callbackID, (userID, soundLevel) => {
            // zloginfo('[MinimizingHelper]onSoundLevelUpdated', this._rangeSoundLevels, userID, soundLevel);
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
        this._isMinimize = true;

        Object.keys(this._onWindowMinimizeCallbackMap).forEach((callbackID) => {
            if (this._onWindowMinimizeCallbackMap[callbackID]) {
                this._onWindowMinimizeCallbackMap[callbackID]();
            }
        })
    }
    notifyMaximize() {
        this._isMinimize = false;

        Object.keys(this._onWindowMaximizeCallbackMap).forEach((callbackID) => {
            if (this._onWindowMaximizeCallbackMap[callbackID]) {
                this._onWindowMaximizeCallbackMap[callbackID]();
            }
        })
    }
    notifyEntryNormal() {
        this._isMinimize = false;

        Object.keys(this._onEntryNormalCallbackMap).forEach((callbackID) => {
            if (this._onEntryNormalCallbackMap[callbackID]) {
                this._onEntryNormalCallbackMap[callbackID]();
            }
        })
    }
    notifyZegoDialogTrigger(visable) {
        Object.keys(this._onZegoDialogTriggerCallbackMap).forEach((callbackID) => {
            if (this._onZegoDialogTriggerCallbackMap[callbackID]) {
                this._onZegoDialogTriggerCallbackMap[callbackID](visable);
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
    onWindowMinimized(callbackID, callback) {
        if (typeof callback !== 'function') {
            delete this._onWindowMinimizeCallbackMap[callbackID];
        } else {
            this._onWindowMinimizeCallbackMap[callbackID] = callback;
        }
    }
    onWindowMaximized(callbackID, callback) {
        if (typeof callback !== 'function') {
            delete this._onWindowMaximizeCallbackMap[callbackID];
        } else {
            this._onWindowMaximizeCallbackMap[callbackID] = callback;
        }
    }
    onEntryNormal(callbackID, callback) {
        if (typeof callback !== 'function') {
            delete this._onEntryNormalCallbackMap[callbackID];
        } else {
            this._onEntryNormalCallbackMap[callbackID] = callback;
        }
    }
    // Temporarily resolved an issue where dialog shutdown could not be triggered
    onZegoDialogTrigger(callbackID, callback) {
        if (typeof callback !== 'function') {
            delete this._onZegoDialogTriggerCallbackMap[callbackID];
        } else {
            this._onZegoDialogTriggerCallbackMap[callbackID] = callback;
        }
    }
}
export default class LiveAudioRoomHelper {
    _instance;
    _realTimeData = {
        role: 0,
        hostID: '',
        requestCoHostCount: 0,
        memberConnectStateMap: {},
        seatingAreaData: [],
        roomProperties: {},
        isLocked: false,
    };
    _stateData = {};
    _notifyData = {};
    constructor() { }
    static getInstance() {
        return this._instance || (this._instance = new LiveAudioRoomHelper());
    }
    // Use reference types directly, so the set method is not provided here
    getRealTimeData() {
        return this._realTimeData;
    }
    getStateData() {
        return this._stateData;
    }
    getNotifyData() {
        return this._notifyData;
    }
    clearRealTimeData() {
        this._realTimeData = {
            role: 0,
            hostID: '',
            requestCoHostCount: 0,
            memberConnectStateMap: {},
            seatingAreaData: [],
            roomProperties: {},
            isLocked: false,
        }
    }
    clearState() {
        this._stateData = {};
    }
    clearNotify() {
        this._notifyData = {};
    }
}
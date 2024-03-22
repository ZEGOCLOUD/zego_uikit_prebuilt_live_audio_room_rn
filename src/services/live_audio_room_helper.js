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
        seatLockStateMap: {},
    };
    _stateData = {};
    _notifyData = {};
    _cacheSeatIndex = -1;
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
    setCacheSeatIndex(cacheSeatIndex) {
        this._cacheSeatIndex = cacheSeatIndex;
    }
    getCacheSeatIndex() {
        return this._cacheSeatIndex;
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
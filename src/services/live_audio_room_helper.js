export default class LiveAudioRoomHelper {
    _instance;
    stateData = {};
    notifyData = {};
    constructor() { }
    static getInstance() {
        return this._instance || (this._instance = new LiveAudioRoomHelper());
    }
    clearState() {
        this.stateData = {};
    }
    clearNotify() {
        this.notifyData = {};
    }
}
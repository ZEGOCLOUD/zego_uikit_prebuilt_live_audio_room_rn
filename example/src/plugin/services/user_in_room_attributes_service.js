import ZegoPluginUserInRoomAttributesCore from '../core/user_in_room_attributes_core';
export default class ZegoPluginUserInRoomAttributesService {
  static shared;
  constructor() {
    if (!ZegoPluginUserInRoomAttributesService.shared) {
      ZegoPluginUserInRoomAttributesService.shared = this;
    }
    return ZegoPluginUserInRoomAttributesService.shared;
  }
  static getInstance() {
    if (!ZegoPluginUserInRoomAttributesService.shared) {
      ZegoPluginUserInRoomAttributesService.shared =
        new ZegoPluginUserInRoomAttributesService();
    }
    return ZegoPluginUserInRoomAttributesService.shared;
  }
  joinRoom(roomID) {
    return ZegoPluginUserInRoomAttributesCore.getInstance().joinRoom(roomID);
  }
  leaveRoom() {
    return ZegoPluginUserInRoomAttributesCore.getInstance().leaveRoom();
  }
  setUsersInRoomAttributes(key, value, userIDs) {
    const attributes = { [key]: value };
    return ZegoPluginUserInRoomAttributesCore.getInstance().setUsersInRoomAttributes(
      attributes,
      userIDs
    );
  }
  queryUsersInRoomAttributes(nextFlag, count) {
    const config = { nextFlag, count };
    return ZegoPluginUserInRoomAttributesCore.getInstance().queryUsersInRoomAttributes(
      config
    );
  }
  onUsersInRoomAttributesUpdated(callbackID, callback) {
    ZegoPluginUserInRoomAttributesCore.getInstance().onUsersInRoomAttributesUpdated(
      callbackID,
      callback
    );
  }
}

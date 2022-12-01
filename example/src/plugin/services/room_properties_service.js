import ZegoPluginRoomPropertiesCore from '../core/room_properties_core';

export default class ZegoPluginRoomPropertiesService {
  static shared;
  constructor() {
    if (!ZegoPluginRoomPropertiesService.shared) {
      ZegoPluginRoomPropertiesService.shared = this;
    }
    return ZegoPluginRoomPropertiesService.shared;
  }
  static getInstance() {
    if (!ZegoPluginRoomPropertiesService.shared) {
      ZegoPluginRoomPropertiesService.shared =
        new ZegoPluginRoomPropertiesService();
    }
    return ZegoPluginRoomPropertiesService.shared;
  }
  updateRoomProperty(
    key,
    value,
    isDeleteAfterOwnerLeft,
    isForce = false,
    isUpdateOwner = false
  ) {
    const attributes = { [key]: value };
    const config = {
      isForce,
      isDeleteAfterOwnerLeft,
      isUpdateOwner,
    };
    return ZegoPluginRoomPropertiesCore.getInstance().updateRoomProperty(
      attributes,
      config
    );
  }
  deleteRoomProperties(keys = [], isForce) {
    const config = {
      isForce,
    };
    return ZegoPluginRoomPropertiesCore.getInstance().deleteRoomProperties(
      keys,
      config
    );
  }
  beginRoomPropertiesBatchOperation(
    isDeleteAfterOwnerLeft = false,
    isForce = false,
    isUpdateOwner = false
  ) {
    const config = {
      isDeleteAfterOwnerLeft,
      isForce,
      isUpdateOwner,
    };
    return ZegoPluginRoomPropertiesCore.getInstance().beginRoomPropertiesBatchOperation(
      config
    );
  }
  endRoomPropertiesBatchOperation() {
    return ZegoPluginRoomPropertiesCore.getInstance().endRoomPropertiesBatchOperation();
  }
  queryRoomProperties() {
    return ZegoPluginRoomPropertiesCore.getInstance().queryRoomProperties();
  }
  onRoomPropertiesUpdated(callbackID, callback) {
    ZegoPluginRoomPropertiesCore.getInstance().onRoomPropertiesUpdated(
      callbackID,
      callback
    );
  }
}

import ZegoPluginInvitationService from './services';
import { ZegoUIKitPluginType } from './defines';
import ZegoPluginRoomPropertiesService from './services/room_properties_service';
import ZegoPluginUserInRoomAttributesService from './services/user_in_room_attributes_service';

export default class ZegoUIKitSignalingPlugin {
  static shared;
  _signaling = ZegoUIKitPluginType.signaling;
  constructor() {
    if (!ZegoUIKitSignalingPlugin.shared) {
      ZegoUIKitSignalingPlugin.shared = this;
    }
    return ZegoUIKitSignalingPlugin.shared;
  }
  static getInstance() {
    if (!ZegoUIKitSignalingPlugin.shared) {
      ZegoUIKitSignalingPlugin.shared = new ZegoUIKitSignalingPlugin();
    }
    return ZegoUIKitSignalingPlugin.shared;
  }
  static getVersion() {
    return ZegoPluginInvitationService.getInstance()
      .getVersion()
      .then((zimVersion) => {
        return `signaling_plugin:1.0.0;zim:${zimVersion}`;
      });
  }
  getZIMInstance() {
    return ZegoPluginInvitationService.getInstance().getZIMInstance();
  }
  getPluginType() {
    return this._signaling;
  }
  invoke(method, params) {
    switch (method) {
      case 'init':
        return ZegoPluginInvitationService.getInstance().init(
          params.appID,
          params.appSign
        );
      case 'uninit':
        return ZegoPluginInvitationService.getInstance().uninit();
      case 'login':
        return ZegoPluginInvitationService.getInstance().login(
          params.userID,
          params.userName
        );
      case 'logout':
        return ZegoPluginInvitationService.getInstance().logout();
      case 'sendInvitation':
        return ZegoPluginInvitationService.getInstance().sendInvitation(
          params.inviterName,
          params.invitees,
          params.timeout,
          params.type,
          params.data
        );
      case 'cancelInvitation':
        return ZegoPluginInvitationService.getInstance().cancelInvitation(
          params.invitees,
          params.data
        );
      case 'refuseInvitation':
        return ZegoPluginInvitationService.getInstance().refuseInvitation(
          params.inviterID,
          params.data
        );
      case 'acceptInvitation':
        return ZegoPluginInvitationService.getInstance().acceptInvitation(
          params.inviterID,
          params.data
        );
      // UserInRoomAttributes
      case 'joinRoom':
        return ZegoPluginUserInRoomAttributesService.getInstance().joinRoom(
          params.roomID
        );
      case 'leaveRoom':
        return ZegoPluginUserInRoomAttributesService.getInstance().leaveRoom();
      case 'setUsersInRoomAttributes':
        return ZegoPluginUserInRoomAttributesService.getInstance().setUsersInRoomAttributes(
          params.key,
          params.value,
          params.userIDs
        );
      case 'queryUsersInRoomAttributes':
        return ZegoPluginUserInRoomAttributesService.getInstance().queryUsersInRoomAttributes(
          params.nextFlag,
          params.count
        );
      // RoomProperties
      case 'updateRoomProperty':
        return ZegoPluginRoomPropertiesService.getInstance().updateRoomProperty(
          params.key,
          params.value,
          params.isDeleteAfterOwnerLeft,
          params.isForce,
          params.isUpdateOwner
        );
      case 'deleteRoomProperties':
        return ZegoPluginRoomPropertiesService.getInstance().deleteRoomProperties(
          params.keys,
          params.isForce
        );
      case 'beginRoomPropertiesBatchOperation':
        return ZegoPluginRoomPropertiesService.getInstance().beginRoomPropertiesBatchOperation(
          params.isDeleteAfterOwnerLeft,
          params.isForce,
          params.isUpdateOwner
        );
      case 'endRoomPropertiesBatchOperation':
        return ZegoPluginRoomPropertiesService.getInstance().endRoomPropertiesBatchOperation();
      case 'queryRoomProperties':
        return ZegoPluginRoomPropertiesService.getInstance().queryRoomProperties();
      default:
        break;
    }
  }
  registerPluginEventHandler(event, callbackID, callback) {
    switch (event) {
      case 'connectionStateChanged':
        ZegoPluginInvitationService.getInstance().onConnectionStateChanged(
          callbackID,
          callback
        );
        break;
      case 'invitationReceived':
        ZegoPluginInvitationService.getInstance().onCallInvitationReceived(
          callbackID,
          callback
        );
        break;
      case 'invitationTimeout':
        ZegoPluginInvitationService.getInstance().onCallInvitationTimeout(
          callbackID,
          callback
        );
        break;
      case 'invitationResponseTimeout':
        ZegoPluginInvitationService.getInstance().onCallInviteesAnsweredTimeout(
          callbackID,
          callback
        );
        break;
      case 'invitationAccepted':
        ZegoPluginInvitationService.getInstance().onCallInvitationAccepted(
          callbackID,
          callback
        );
        break;
      case 'invitationRefused':
        ZegoPluginInvitationService.getInstance().onCallInvitationRejected(
          callbackID,
          callback
        );
        break;
      case 'invitationCanceled':
        ZegoPluginInvitationService.getInstance().onCallInvitationCancelled(
          callbackID,
          callback
        );
        break;
      // UserInRoomAttributes
      case 'usersInRoomAttributesUpdated':
        ZegoPluginUserInRoomAttributesService.getInstance().onUsersInRoomAttributesUpdated(
          callbackID,
          callback
        );
        break;
      // RoomProperties
      case 'roomPropertiesUpdated':
        ZegoPluginRoomPropertiesService.getInstance().onRoomPropertiesUpdated(
          callbackID,
          callback
        );
        break;
      default:
        break;
    }
  }
}

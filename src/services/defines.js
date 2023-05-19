import ZegoMenuBarButtonName from '../components/ZegoMenuBarButtonName';

class ZegoDialogInfo {
  title = '';
  message = '';
  cancelButtonName = 'Cancel';
  confirmButtonName = 'OK';
  constructor({ title, message, cancelButtonName, confirmButtonName }) {
    this.title = title;
    this.message = message;
    this.cancelButtonName = cancelButtonName;
    this.confirmButtonName = confirmButtonName;
  }
};

const ZegoLiveAudioRoomRole = {
  host: 0,
  speaker: 1,
  audience: 2,
};
const ZegoLiveAudioRoomLayoutAlignment = {
  spaceAround: 0,
  start: 1,
  end: 2,
  center: 3,
  spaceBetween: 4,
  spaceEvenly: 5,
};
const ZegoLiveAudioRoomLayoutRowConfig = {
  count: 4,
  seatSpacing: 16,
  alignment: ZegoLiveAudioRoomLayoutAlignment.spaceAround,
};
const ZegoLiveStatus = {
  default: 0,
  start: 1,
};
const ZegoInvitationType = {
  requestCoHost: 2,
  inviteToCoHost: 3,
};
const ZegoCoHostConnectState = {
  idle: 0,
  connecting: 1,
  connected: 2,
};
const ZegoToastType = {
  default: 0,
  info: 1,
  success: 2,
  warning: 3,
  error: 4,
};
const ZegoSeatsState = {
  lock: '1',
  unlock: '0',
};
const ZegoInnerText = {
  removeSpeakerMenuDialogButton: 'Remove %0 from seat',
  takeSeatMenuDialogButton: 'Take the seat',
  leaveSeatMenuDialogButton: 'Leave the seat',
  cancelMenuDialogButton: 'Cancel',
  memberListTitle: 'Audience',
  removeSpeakerFailedToast: 'Failed to remove %0 from seat',
  applyToTakeSeatButton: "Apply to take seat",
  cancelTheTakeSeatApplicationButton: "Cancel",
  memberListAgreeButton: "Agree",
  memberListDisagreeButton: "Disagree",
  inviteToTakeSeatMenuDialogButton: "Invite %0 to take seat",
  muteCoHostButton: 'Mute %0',
  microphonePermissionSettingDialogInfo: new ZegoDialogInfo({
    title: 'Can not use Microphone!',
    message: 'Please enable microphone access in the system settings!',
    cancelButtonName: 'Cancel',
    confirmButtonName: 'Settings',
  }),
  leaveSeatDialogInfo: new ZegoDialogInfo({
    title: 'Leave the seat',
    message: 'Are you sure to leave the seat?',
    cancelButtonName: 'Cancel',
    confirmButtonName: 'OK',
  }),
  removeSpeakerFromSeatDialogInfo: new ZegoDialogInfo({
    title: 'Remove the speaker',
    message: 'Are you sure to remove %0 from the seat?',
    cancelButtonName: 'Cancel',
    confirmButtonName: 'OK',
  }),
  hostInviteTakeSeatDialog: new ZegoDialogInfo({
    title: "Invitation",
    message: "The host is inviting you to take seat",
    cancelButtonName: "Disagree",
    confirmButtonName: "Agree",
  }),
};

const HOST_DEFAULT_CONFIG = {
  role: ZegoLiveAudioRoomRole.host,
  takeSeatIndexWhenJoining: 0,
  turnOnMicrophoneWhenJoining: true,
  confirmDialogInfo: {
    title: 'Leave the room',
    message: 'Are you sure to leave the room?',
    cancelButtonName: 'Cancel',
    confirmButtonName: 'OK',
  },
  topMenuBarConfig: {
    buttons: [ZegoMenuBarButtonName.leaveButton],
  },
};

const AUDIENCE_DEFAULT_CONFIG = {
  role: ZegoLiveAudioRoomRole.audience,
  topMenuBarConfig: {
    buttons: [ZegoMenuBarButtonName.leaveButton],
  },
};

export {
  HOST_DEFAULT_CONFIG,
  AUDIENCE_DEFAULT_CONFIG,
  ZegoLiveAudioRoomRole,
  ZegoLiveAudioRoomLayoutAlignment,
  ZegoLiveAudioRoomLayoutRowConfig,
  ZegoInnerText,
  ZegoMenuBarButtonName,
  ZegoLiveStatus,
  ZegoInvitationType,
  ZegoCoHostConnectState,
  ZegoToastType,
  ZegoSeatsState,
};

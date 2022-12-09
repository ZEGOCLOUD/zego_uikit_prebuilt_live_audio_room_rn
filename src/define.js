import ZegoMenuBarButtonName from './ZegoMenuBarButtonName';
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

// const ZegoLiveAudioRoomLayoutConfig = {
//   rowConfigs: [
//     ZegoLiveAudioRoomLayoutRowConfig,
//     ZegoLiveAudioRoomLayoutRowConfig,
//   ],
//   rowSpacing: 0,
// };
// const ZegoBottomMenuBarConfig = {
//   showInRoomMessageButton: true,
//   hostButtons: [
//     ZegoMenuBarButtonName.toggleMicrophoneButton,
//     ZegoMenuBarButtonName.showMemberListButton,
//   ],
//   speakerButtons: [
//     ZegoMenuBarButtonName.toggleMicrophoneButton,
//     ZegoMenuBarButtonName.showMemberListButton,
//   ],
//   audienceButtons: [ZegoMenuBarButtonName.showMemberListButton],
//   hostExtendButtons: [],
//   speakerExtendButtons: [],
//   audienceExtendButtons: [],
//   maxCount: 5,
// };

// const ZegoDialogInfo = {
//   title: '',
//   message: '',
//   cancelButtonName: '',
//   confirmButtonName: '',
// };

// const ZegoTranslationText = {
//   removeSpeakerMenuDialogButton: 'Remove %0 from seat',
//   takeSeatMenuDialogButton: 'Take the seat',
//   leaveSeatMenuDialogButton: 'Leave the seat',
//   cancelMenuDialogButton: 'Cancel',
//   memberListTitle: 'Attendance',
//   removeSpeakerFailedToast: 'Failed to remove %0 from seat', // 红色
//   microphonePermissionSettingDialogInfo: {
//     title: 'Can not use Microphone!',
//     message: 'Please enable microphone access in the system settings!',
//     cancelButtonName: 'Cancel',
//     confirmButtonName: 'Settings',
//   },
//   leaveSeatDialogInfo: {
//     title: 'Leave the seat',
//     message: 'Are you sure to leave the seat?',
//     cancelButtonName: 'Cancel',
//     confirmButtonName: 'OK',
//   },
//   removeSpeakerFromSeatDialogInfo: {
//     title: 'Remove the speaker',
//     message: 'Are you sure to remove %0 from the seat?',
//     cancelButtonName: 'Cancel',
//     confirmButtonName: 'OK',
//   },
// };

export {
  ZegoLiveAudioRoomRole,
  ZegoLiveAudioRoomLayoutAlignment,
  // ZegoLiveAudioRoomLayoutConfig,
  ZegoLiveAudioRoomLayoutRowConfig,
  // ZegoBottomMenuBarConfig,
  // ZegoDialogInfo,
  // ZegoTranslationText,
  ZegoMenuBarButtonName,
};

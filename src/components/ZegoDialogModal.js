import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';

export default function ZegoDialogModal(props) {
  const {
    dialogInfo,
    dialogVisible,
    onDialogConfirmPress,
    onDialogCancelPress,
  } = props;
  return (
    <Modal animationType="fade" transparent={true} visible={dialogVisible}>
      <View style={styles.modalMask}>
        <View style={styles.modalView}>
          <View style={styles.messageBox}>
            <Text style={styles.title}>{dialogInfo.title}</Text>
            <Text style={styles.message}>{dialogInfo.message}</Text>
          </View>
          <View style={styles.buttonBox}>
            <TouchableWithoutFeedback
              onPress={() => {
                if (typeof onDialogCancelPress === 'function') {
                  onDialogCancelPress();
                }
              }}
            >
              <View>
                <Text
                  style={[
                    styles.buttonText,
                    { borderRightColor: '#d3d7d4', borderRightWidth: 1 },
                  ]}
                >
                  {dialogInfo.cancelButtonName}
                </Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback
              onPress={() => {
                if (typeof onDialogConfirmPress === 'function') {
                  onDialogConfirmPress();
                }
              }}
            >
              <View>
                <Text style={styles.buttonText}>
                  {dialogInfo.confirmButtonName}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalMask: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  message: {
    paddingBottom: 10,
    fontSize: 13,
    color: '#000',
    flexWrap: 'wrap',
    width: 260,
    textAlign: 'center',
  },
  buttonBox: {
    borderTopWidth: 1,
    borderTopColor: '#d3d7d4',
    flexDirection: 'row',
  },
  buttonText: {
    width: 150,
    lineHeight: 42,
    textAlign: 'center',
    color: '#1f75fd',
  },
});

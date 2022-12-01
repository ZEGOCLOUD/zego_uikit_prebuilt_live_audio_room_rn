export default class ZegoPluginResult {
  code = '';
  message = '';
  constructor(code = '', message = '') {
    this.code = code;
    this.message = message;
  }
}

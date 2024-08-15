export const getLocalDateFormat = () => {
    function addLeadingZero(value, totalDigits = 2) {
        const stringValue = value.toString();
        const padding = '0'.repeat(totalDigits - stringValue.length);
        return padding + stringValue;
      }
    
      const now = new Date();
      const month = addLeadingZero(now.getMonth() + 1);
      const day = addLeadingZero(now.getDate());
      const hours = addLeadingZero(now.getHours());
      const minutes = addLeadingZero(now.getMinutes());
      const seconds = addLeadingZero(now.getSeconds());
      const milliseconds = addLeadingZero(now.getMilliseconds(), 4);
      const formattedDateTime = `${month}${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;

      return formattedDateTime
}

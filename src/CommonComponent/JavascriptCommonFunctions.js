import pako from 'pako';
import moment from 'moment';
import { APPLICATION_STATUS_URL, COMPRESS_LIMIT_SIZE, DATE_FORMAT_CAP_FOUR_DIGITS } from "../Constants";
import i18n from '../i18n';
/**
 * This function is used for padding a particular character till specified length
 * @param {*} string This is the string on which padding has to be done
 * @param {*} padStr This is the string that should be padded
 * @param {*} len This is the length till which the string should be padded
 * @returns Returns the string with padded character till specified length
 */
export function paddingZero(string, padStr, len) {
  var str = string.toString();
  while (str.length < len)
    str = padStr + str;
  return str;
}
/**
 * This function is used to generate the random alpha numeric code of specified length
 * @param {*} length This is the length of characters for alpha numeric code
 * @returns 
 */
export function generateRandomAplhaNumericCode(length) {
  var string = Math.random().toString(36).substr(2, length);
  string = string.toUpperCase();
  return string;
}
function rgbToYIQ({ r, g, b }) {
  return ((r * 299) + (g * 587) + (b * 114)) / 1000;
}
/**
 * This function is used to convert hex colour code to rgb colour code
 * @param {*} hex This is the hex code that needs to be converted
 * @returns This function returns the rgb code for the specified hex code
 */
function hexToRgb(hex) {
  if (!hex || hex === undefined || hex === '') {
    return undefined;
  }
  const result =
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : undefined;
}
/**
 * This function is used to suggest the text colour based on the background colour
 * @param {*} colorHex This is the hex code of background colour
 * @returns This function returns black or white colour based on the background colour
 */
export function contrast(colorHex, threshold = 128) {
  if (colorHex === undefined) {
    return '#000';
  }
  const rgb = hexToRgb(colorHex);
  if (rgb === undefined) {
    return '#000';
  }
  return rgbToYIQ(rgb) >= threshold ? '#000' : '#fff';
}
/**
 * This function is used to check if the api side of the application is online or not
 * @returns This function returns true if api side is online otherwise it returns offline
 */
export function isSiteOnline() {
  let loginOnline = localStorage.getItem("loginOnline");
  if (loginOnline == undefined || loginOnline.toString() == "true") {
    let url = APPLICATION_STATUS_URL;
    let request = new XMLHttpRequest;
    request.open('GET', url, false);
    try {
      request.send('');
      if (request.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}
/**
 * This function is used to decompress the jsons
 * @param {*} str This is the compressed json that needs to be decompressed
 * @returns This function returns the decompressed json
 */
export function decompressJson(str) {
  let value = typeof str !== "string" ? JSON.stringify(str) : str;
  try {
    JSON.parse(value);
  } catch (e) {
    const compressedData = atob(str);
    const byteArray = new Uint8Array(compressedData.length);
    for (let i = 0; i < compressedData.length; i++) {
      byteArray[i] = compressedData.charCodeAt(i);
    }
    const decompressedData = pako.inflate(byteArray, { to: 'string' });
    var json = JSON.parse(decompressedData);
    return json;
  }
  return str;
}
/**
 * This function is used to compress the jsons
 * @param {*} str This is the json string that needs to be compressed
 * @returns This function returns the compressed json
 */
export function compressJson(str) {
  const jsonStr = JSON.stringify(str);
  const input = new TextEncoder().encode(jsonStr);
  const compressedData = pako.gzip(input);
  let base64String = '';
  const len = compressedData.length;
  for (let i = 0; i < len; i++) {
    base64String += String.fromCharCode(compressedData[i]);
  }
  base64String = btoa(base64String);
  return base64String;
}
/**
 * This function is used to check size of the json
 * @param {*} str This is the json string
 * @returns This function returns the size of json
 */
export function sizeOfJson(str) {
  const size = new TextEncoder().encode(JSON.stringify(str)).length
  const kiloBytes = size / 1000;
  const megaBytes = kiloBytes / 1000;
  return megaBytes;
}
/**
 * This function is used to validate if the json should compressed or not
 * @param {*} str This is the json string
 * @returns True if json needs to be compressed otherwise returns false
 */
export function isCompress(str) {
  if (sizeOfJson(str) > COMPRESS_LIMIT_SIZE)
    return compressJson(str);
  return str
}
/**
 * Hides the message in div1 after 30 seconds.
 */
export function hideFirstComponent() {
  document.getElementById('div1').style.display = 'block';
  setTimeout(function () {
    document.getElementById('div1').style.display = 'none';
  }, 30000);
}
/**
 * Hides the message in div2 after 30 seconds.
 */
export function hideSecondComponent() {
  document.getElementById('div2').style.display = 'block';
  setTimeout(function () {
    document.getElementById('div2').style.display = 'none';
  }, 30000);
}
/**
 * Capitalizes the first letter of the role name.
 * @param {string} str - The role name.
 * @returns {string} - Capitalized role name.
 */
export function Capitalize(str) {
  if (str != null && str != "") {
    return str.charAt(0).toUpperCase() + str.slice(1);
  } else {
    return "";
  }
}
/**
 * Adds double quotes to each element in the array.
 * @param {array} arr - The array to which double quotes need to be added.
 * @returns {array} - The modified array with double quotes added to each element.
 */
export function addDoubleQuoteToRowContent(arr) {
  return arr.map(ele => '"' + ele + '"')
}
/**
 * Formats the selected month and year into text.
 * @param {object} m - The selected month and year object.
 * @returns {string} - The formatted text representing the selected month and year.
 */
export function makeText(m) {
  const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
  }
  if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
  return '?'
}
/**
 * Rounds the AMC (Average Monthly Consumption) value to a specific decimal place based on its magnitude.
 * @param {number} amc - The AMC value to be rounded.
 * @returns {number|null} - The rounded AMC value or null if the input is null.
 */
export function roundAMC(amc) {
  if (amc != null) {
    if (Number(amc).toFixed(0) >= 100) {
      return Number(amc).toFixed(0);
    } else if (Number(amc).toFixed(1) >= 10) {
      return Number(amc).toFixed(1);
    } else if (Number(amc).toFixed(2) >= 1) {
      return Number(amc).toFixed(2);
    } else {
      return Number(amc).toFixed(3);
    }
  } else {
    return null;
  }
}
/**
 * Rounds a number to 1 decimal place.
 * @param {number} num - The number to be rounded.
 * @returns {string} - The rounded number with 1 decimal place as a string.
 */
export function roundN(num) {
  if (num == null) {
    return "";
  } else {
    return parseFloat(
      Math.round(num * Math.pow(10, 1)) / Math.pow(10, 1)
    ).toFixed(1);
  }
}
/**
 * Rounds a number to 2 decimal place.
 * @param {number} num - The number to be rounded.
 * @returns {string} - The rounded number with 2 decimal place as a string.
 */
export function roundN2(num) {
  if (num != '') {
    return Number(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
  } else {
    return ''
  }
}
/**
 * Rounds a number.
 * @param {number} num - The number to be rounded.
 * @returns {string} - The rounded number with 1 decimal place as a string.
 */
export function round(num) {
  return Number(Math.round(num * Math.pow(10, 0)) / Math.pow(10, 0));
};
/**
 * Formats a date value into the format 'MMM YY' (e.g., 'Jan 22').
 * @param {Date|string} value - The date value to be formatted. It can be a Date object or a string representing a date.
 * @returns {string} - The formatted date string in the 'MMM YY' format.
 */
export function dateFormatter(value) {
  return moment(value).format('MMM YY')
}
/**
 * Formats a date value into a localized month and year format (e.g., 'Jan 22').
 * @param {Date|string} value - The date value to be formatted. It can be a Date object or a string representing a date.
 * @returns {string} - The formatted date string with the month name in the user's preferred language and the year in two digits.
 */
export function dateFormatterLanguage(value) {
  if (moment(value).format('MM') === '01') {
    return (i18n.t('static.month.jan') + ' ' + moment(value).format('YY'))
  } else if (moment(value).format('MM') === '02') {
    return (i18n.t('static.month.feb') + ' ' + moment(value).format('YY'))
  } else if (moment(value).format('MM') === '03') {
    return (i18n.t('static.month.mar') + ' ' + moment(value).format('YY'))
  } else if (moment(value).format('MM') === '04') {
    return (i18n.t('static.month.apr') + ' ' + moment(value).format('YY'))
  } else if (moment(value).format('MM') === '05') {
    return (i18n.t('static.month.may') + ' ' + moment(value).format('YY'))
  } else if (moment(value).format('MM') === '06') {
    return (i18n.t('static.month.jun') + ' ' + moment(value).format('YY'))
  } else if (moment(value).format('MM') === '07') {
    return (i18n.t('static.month.jul') + ' ' + moment(value).format('YY'))
  } else if (moment(value).format('MM') === '08') {
    return (i18n.t('static.month.aug') + ' ' + moment(value).format('YY'))
  } else if (moment(value).format('MM') === '09') {
    return (i18n.t('static.month.sep') + ' ' + moment(value).format('YY'))
  } else if (moment(value).format('MM') === '10') {
    return (i18n.t('static.month.oct') + ' ' + moment(value).format('YY'))
  } else if (moment(value).format('MM') === '11') {
    return (i18n.t('static.month.nov') + ' ' + moment(value).format('YY'))
  } else {
    return (i18n.t('static.month.dec') + ' ' + moment(value).format('YY'))
  }
}
/**
 * Formats a numerical value into a string with thousands separators.
 * @param {number} value - The numerical value to be formatted.
 * @returns {string} - The formatted string with thousands separators.
 */
export function formatter(value, withRoundN) {
  if (value != null) {
    var cell1 = withRoundN ? roundN(value) : value;
    cell1 += '';
    var x = cell1.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }
  else {
    return ''
  }
}
/**
 * Formats a date value into the format 'DD-MMM-YYYY' (e.g., '20 Jan 2022').
 * @param {Date|string} value - The date value to be formatted. It can be a Date object or a string representing a date.
 * @returns {string} - The formatted date string in the 'DD-MMM-YYYY' format.
 */
export function dateFormatterCSV(value) {
  return moment(value).format(DATE_FORMAT_CAP_FOUR_DIGITS)
}
/**
 * Rounds a number to 2 decimal place and appends % sign.
 * @param {number} num - The number to be rounded.
 * @returns {string} - The rounded number with 2 decimal place as a string.
 */
export function PercentageFormatter(num) {
  if (num != '' && num != null) {
    return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2) + '%';
  } else {
    return ''
  }
}
/**
 * This is function is used to round supply plan values when displayed in ARU
 * @param {*} amc The value of supply plan parameter
 * @returns This function returns the rounded values in terms of ARU
 */
export function roundARU(value, multiplier) {
  if (multiplier != 1) {
    if (value != null && value !== "") {
      var aruValue = Number(value) / Number(multiplier);
      if (Number(aruValue).toFixed(0) >= 100) {
        return Number(aruValue).toFixed(0);
      } else if (Number(aruValue).toFixed(1) >= 10) {
        return Number(aruValue).toFixed(1);
      } else if (Number(aruValue).toFixed(2) >= 1) {
        return Number(aruValue).toFixed(2);
      } else {
        return Number(aruValue).toFixed(3);
      }
    } else {
      return "";
    }
  } else {
    return value;
  }
}
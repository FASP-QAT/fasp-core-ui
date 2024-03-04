import pako from 'pako';
import { APPLICATION_STATUS_URL, COMPRESS_LIMIT_SIZE } from "../Constants";
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
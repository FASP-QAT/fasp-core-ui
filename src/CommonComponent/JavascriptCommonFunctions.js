import { APPLICATION_STATUS_URL } from "../Constants";

export function paddingZero(string, padStr, len) {
  var str = string.toString();
  console.log("str.length", str.length)
  while (str.length < len)
    str = padStr + str;
  return str;
}

export function generateRandomAplhaNumericCode(length) {
  var string = Math.random().toString(36).substr(2, length);
  string = string.toUpperCase();
  console.log("String", string);
  return string;
}

export function invertHex(hex) {
  return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
}

function rgbToYIQ({ r, g, b }) {
  return ((r * 299) + (g * 587) + (b * 114)) / 1000;
}

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

export function isSiteOnline(callback) {
  let url = APPLICATION_STATUS_URL;
  let request = new XMLHttpRequest;
  request.open('GET', url, true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  request.setRequestHeader('Accept', '*/*');
  request.onprogress = function (event) {
    let status = event.target.status;
    let statusFirstNumber = (status).toString()[0];
    switch (statusFirstNumber) {
      case '2':
        request.abort();
        return callback(true);
      default:
        request.abort();
        return callback(false);
    };
  };
  request.onerror = function (event) {
    request.abort();
    return callback(false);
  }
  request.send('');
}
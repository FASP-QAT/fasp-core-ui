export function paddingZero(string, padStr, len) {
    var str = string.toString();
    console.log("str.length",str.length)
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
/* eslint-disable import/prefer-default-export */

export function type(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
}

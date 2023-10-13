import { sqrt, std } from 'mathjs';
export function calculateCI(data, confidence, methodName, props) {
    let population = new Array()
    for (let x = 0; x < data.length; x++) {
        if (data[x].actual) {
            population.push(data[x].actual)
            data[x].ci = null;
        } else {
            population.push(data[x].forecast)
            let zValue = getZValue(population.length, confidence)
            let stdDev = std(population)
            data[x].ci = zValue * stdDev / sqrt(population.length)
        }
    }
    props.updateState(methodName, data);
}
function getZValue(df, confidence) {
    const tTable = [
        { "df": 1, "zValue": [1.963, 3.078, 6.32, 3.747, 4.604, 7.173] },
        { "df": 5, "zValue": [1.156, 1.476, 2.015, 3.365, 4.032, 5.893] },
        { "df": 6, "zValue": [1.134, 1.44, 1.943, 3.143, 3.707, 5.208] },
        { "df": 7, "zValue": [1.119, 1.415, 1.895, 2.998, 3.499, 4.785] },
        { "df": 8, "zValue": [1.108, 1.397, 1.86, 2.896, 3.355, 4.501] },
        { "df": 9, "zValue": [1.1, 1.383, 1.833, 2.821, 3.25, 4.297] },
        { "df": 10, "zValue": [1.093, 1.372, 1.812, 2.764, 3.169, 4.144] },
        { "df": 11, "zValue": [1.088, 1.363, 1.796, 2.718, 3.106, 4.025] },
        { "df": 12, "zValue": [1.083, 1.356, 1.782, 2.681, 3.055, 3.93] },
        { "df": 13, "zValue": [1.079, 1.35, 1.771, 2.65, 3.012, 3.852] },
        { "df": 14, "zValue": [1.076, 1.345, 1.761, 2.624, 2.977, 3.787] },
        { "df": 15, "zValue": [1.074, 1.341, 1.753, 2.602, 2.947, 3.733] },
        { "df": 16, "zValue": [1.071, 1.337, 1.746, 2.583, 2.921, 3.686] },
        { "df": 17, "zValue": [1.069, 1.333, 1.74, 2.567, 2.898, 3.646] },
        { "df": 18, "zValue": [1.067, 1.33, 1.734, 2.552, 2.878, 3.61] },
        { "df": 19, "zValue": [1.066, 1.328, 1.729, 2.539, 2.861, 3.579] },
        { "df": 20, "zValue": [1.064, 1.325, 1.725, 2.528, 2.845, 3.552] },
        { "df": 21, "zValue": [1.063, 1.323, 1.721, 2.518, 2.831, 3.527] },
        { "df": 22, "zValue": [1.061, 1.321, 1.717, 2.508, 2.819, 3.505] },
        { "df": 23, "zValue": [1.06, 1.319, 1.714, 2.5, 2.807, 3.485] },
        { "df": 24, "zValue": [1.059, 1.318, 1.711, 2.492, 2.797, 3.467] },
        { "df": 25, "zValue": [1.058, 1.316, 1.708, 2.485, 2.787, 3.45] },
        { "df": 26, "zValue": [1.058, 1.315, 1.706, 2.479, 2.779, 3.435] },
        { "df": 27, "zValue": [1.057, 1.314, 1.703, 2.473, 2.771, 3.421] },
        { "df": 28, "zValue": [1.056, 1.313, 1.701, 2.467, 2.763, 3.408] },
        { "df": 29, "zValue": [1.055, 1.311, 1.699, 2.462, 2.756, 3.396] },
        { "df": 30, "zValue": [1.055, 1.31, 1.697, 2.457, 2.75, 3.385] },
        { "df": 40, "zValue": [1.05, 1.303, 1.684, 2.423, 2.704, 3.307] },
        { "df": 60, "zValue": [1.045, 1.296, 1.671, 2.39, 2.66, 3.232] },
        { "df": 80, "zValue": [1.043, 1.292, 1.664, 2.374, 2.639, 3.195] },
        { "df": 100, "zValue": [1.042, 1.29, 1.66, 2.364, 2.626, 3.174] },
        { "df": 1000, "zValue": [1.037, 1.282, 1.646, 2.33, 2.581, 3.098] }
    ]
    let final_t_table = null;
    for (let x = 0; x < tTable.length; x++) {
        if (df < tTable[x].df) {
            break;
        }
        final_t_table = tTable[x]
    }
    switch (confidence) {
        case 0.85:
            return final_t_table.zValue[0];
        case 0.90:
            return final_t_table.zValue[1];
        case 0.95:
            return final_t_table.zValue[2];
        case 0.99:
            return final_t_table.zValue[3];
        case 0.995:
            return final_t_table.zValue[4];
        case 0.999:
            return final_t_table.zValue[5];
        default:
            return null;
    }
}
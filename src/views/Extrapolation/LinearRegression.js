import { calculateError } from '../Extrapolation/ErrorCalculations.js';
export function calculateLinearRegression(inputData, confidence, noOfProjectionMonths, props, isTreeExtrapolation, page, regionId, planningUnitId) {
    const tTable = [
        { "df": 1, "zValue": [4.16529977009041, 6.31375151467504, 12.7062047361747, 63.6567411628715, 127.321336468872, 636.619248768789] },
        { "df": 2, "zValue": [2.28193058772768, 2.91998558035373, 4.30265272974946, 9.92484320091829, 14.0890472755553, 31.5990545764454] },
        { "df": 3, "zValue": [1.92431965672756, 2.35336343480182, 3.18244630528371, 5.84090930973336, 7.45331850515062, 12.923978636688] },
        { "df": 4, "zValue": [1.77819216437576, 2.13184678632665, 2.77644510519779, 4.60409487134999, 5.59756836707546, 8.61030158137952] },
        { "df": 5, "zValue": [1.69936256594557, 2.01504837333303, 2.57058183563631, 4.03214298355523, 4.77334060485552, 6.86882662588127] },
        { "df": 6, "zValue": [1.6501731537643, 1.9431802805153, 2.44691185114497, 3.70742802132478, 4.31682710363337, 5.95881617881888] },
        { "df": 7, "zValue": [1.61659173735532, 1.89457860509001, 2.36462425159279, 3.49948329735049, 4.02933717764249, 5.40788252086183] },
        { "df": 8, "zValue": [1.5922214398805, 1.8595480375309, 2.30600413520417, 3.35538733133339, 3.83251868534434, 5.04130543337346] },
        { "df": 9, "zValue": [1.57373578502687, 1.83311293265624, 2.2621571627982, 3.24983554159213, 3.68966239230423, 4.78091258593122] },
        { "df": 10, "zValue": [1.5592359332427, 1.81246112281168, 2.22813885198627, 3.16927267261695, 3.58140620209066, 4.58689385870271] },
        { "df": 11, "zValue": [1.54755976627494, 1.79588481870405, 2.20098516009164, 3.10580651553928, 3.49661417325367, 4.43697933823452] },
        { "df": 12, "zValue": [1.53795649453013, 1.78228755564932, 2.17881282966723, 3.0545395893929, 3.42844424229225, 4.31779128360625] },
        { "df": 13, "zValue": [1.52991960624555, 1.77093339598687, 2.16036865646279, 3.01227583871658, 3.37246794101098, 4.22083172770718] },
        { "df": 14, "zValue": [1.52309506092579, 1.76131013577489, 2.1447866879178, 2.97684273437083, 3.32569581783802, 4.14045411273826] },
        { "df": 15, "zValue": [1.51722796852275, 1.75305035569257, 2.13144954555977, 2.94671288347524, 3.28603857094622, 4.07276519590385] },
        { "df": 16, "zValue": [1.51213017042942, 1.74588367627625, 2.11990529922125, 2.9207816224251, 3.25199287438288, 4.01499632718411] },
        { "df": 17, "zValue": [1.50765975366471, 1.73960672607507, 2.10981557783332, 2.89823051967742, 3.22244991135746, 3.96512627211908] },
        { "df": 18, "zValue": [1.50370767195693, 1.73406360661754, 2.10092204024104, 2.87844047273861, 3.19657422225522, 3.92164582508521] },
        { "df": 19, "zValue": [1.50018875559948, 1.72913281152137, 2.09302405440831, 2.86093460646498, 3.17372453079232, 3.88340585259213] },
        { "df": 20, "zValue": [1.49703551810495, 1.72471824292079, 2.08596344726586, 2.84533970978611, 3.15340053290645, 3.84951627493087] },
        { "df": 21, "zValue": [1.4941937949331, 1.72074290281188, 2.07961384472768, 2.83135955802305, 3.13520624540627, 3.81927716427451] },
        { "df": 22, "zValue": [1.49161961191004, 1.71714437438025, 2.07387306790403, 2.81875606060014, 3.11882420686073, 3.79213067169844] },
        { "df": 23, "zValue": [1.48927689709799, 1.71387152774705, 2.06865761041905, 2.80733568377, 3.10399696314088, 3.76762680431182] },
        { "df": 24, "zValue": [1.48713578253468, 1.71088207990943, 2.06389856162802, 2.79693950477446, 3.09051354871699, 3.7453986192901] },
        { "df": 25, "zValue": [1.48517132578276, 1.7081407612519, 2.0595385527533, 2.78743581367697, 3.07819946054352, 3.72514394972869] },
        { "df": 26, "zValue": [1.48336253503346, 1.70561791975927, 2.05552943864287, 2.77871453332968, 3.06690911643056, 3.70661174348095] },
        { "df": 27, "zValue": [1.48169161689478, 1.70328844572213, 2.05183051648028, 2.77068295712221, 3.05652010885651, 3.68959171345928] },
        { "df": 28, "zValue": [1.48014338970886, 1.70113093426593, 2.04840714179525, 2.76326245546144, 3.04692877505303, 3.67390640070132] },
        { "df": 29, "zValue": [1.47870482141311, 1.6991270265335, 2.0452296421327, 2.7563859036706, 3.03804674484917, 3.65940501946637] },
        { "df": 30, "zValue": [1.47736466215919, 1.69726088659396, 2.04227245630124, 2.74999565356723, 3.02979822364824, 3.64595863504206] },
        { "df": 40, "zValue": [1.46772039920378, 1.68385101333565, 2.02107539030627, 2.70445926743316, 2.97117129490607, 3.55096576086335] },
        { "df": 60, "zValue": [1.4582012557061, 1.67064886490464, 2.00029782201426, 2.66028302885504, 2.9145525754195, 3.46020046919639] },
        { "df": 80, "zValue": [1.45348806591882, 1.66412457858967, 1.99006342125445, 2.63869059634418, 2.8869720507572, 3.41633745847698] },
        { "df": 100, "zValue": [1.45067487130889, 1.66023432608534, 1.98397151852356, 2.62589052143802, 2.87065152383654, 3.39049131116426] },
        { "df": 1000, "zValue": [1.44063798599448, 1.64637881728548, 1.96233908082641, 2.58075469806595, 2.81327786048555, 3.30028264842394] }
    ]
    function getCriticalTValue(df, confidence) {
        if (df > 2) {
            df = df - 2;
        }
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
    var data = [];
    for (var i = 0; i < inputData.length; i++) {
        data.push([inputData[i].month, inputData[i].actual])
    }
    const count = noOfProjectionMonths;
    const confidenceLevel = confidence;
    let sumOfXMinusXBarSqr = 0;
    let sumOfXMinusXBar = 0;
    let sumOfYMinusYBarSqr = 0;
    let sumOfXMinusXBarIntoYMinusYBar = 0;
    let SSE = 0;
    let xBar = 0;
    let sumX = 0;
    let yBar = 0;
    let sumY = 0;
    for (let x = 0; x < data.length; x++) {
        sumX += data[x][0];
        sumY += data[x][1];
    }
    xBar = sumX / data.length;
    yBar = sumY / data.length;
    for (let x = 0; x < data.length; x++) {
        let xMinusXBar = (data[x][0] - xBar);
        let yMinusYBar = (data[x][1] - yBar);
        sumOfXMinusXBarSqr += Math.pow(xMinusXBar, 2);
        sumOfXMinusXBar += xMinusXBar;
        sumOfXMinusXBarIntoYMinusYBar += xMinusXBar * yMinusYBar;
        sumOfYMinusYBarSqr += Math.pow(yMinusYBar, 2);
    }
    let gradient = sumOfXMinusXBarIntoYMinusYBar / sumOfXMinusXBarSqr;
    let yIntercept = yBar - (xBar * gradient);
    for (let x = 0; x < data.length; x++) {
        let y = (gradient * (x + 1)) + yIntercept;
        SSE += Math.pow(y - data[x][1], 2)
    }
    let varX = sumOfXMinusXBarSqr / data.length;
    let sqrtOfRegression = Math.pow(SSE / (data.length - 2), 0.5);
    let criticalTValue = getCriticalTValue(data.length, Number(confidenceLevel));
    let a = sqrtOfRegression / Math.pow(data.length, 0.5);
    var output = [];
    for (let x = 0; x < data.length + count; x++) {
        let y = (gradient * (x + 1)) + yIntercept;
        let ciString = "";
        if (x >= data.length) {
            let b1 = Math.pow(x + 1 - xBar, 2);
            let b2 = Math.pow((1 + (b1 / varX)), 0.5);
            let cLevel = (a * b2) * criticalTValue;
            let ciL = y - cLevel;
            let ciU = y + cLevel;
            ciString = " : " + ciL + " : " + ciU;
            output.push({ month: (x + 1), actual: null, forecast: y == 'NA' ? null : y > 0 ? y : 0, ci: cLevel })
        } else {
            output.push({ month: (x + 1), actual: inputData[x].actual, forecast: y == 'NA' ? null : y > 0 ? y : 0, ci: null })
        }
    }
    if (page == "DataEntry") {
        var linearRegressionData = { "data": output, "PlanningUnitId": props.state.selectedConsumptionUnitId, "regionId": regionId }
        props.updateLinearRegressionData(linearRegressionData);
    } else if (page == "importFromQATSP" || page == "bulkExtrapolation") {
        var linearRegressionData = { "data": output, "PlanningUnitId": planningUnitId, "regionId": regionId }
        props.updateLinearRegressionData(linearRegressionData);
    } else {
        props.updateState("linearRegressionData", output);
        calculateError(output, "linearRegressionError", props);
    }
}
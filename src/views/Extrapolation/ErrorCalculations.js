import { std, sqrt, mean, abs } from 'mathjs';
export function calculateError(data, errorName, props) {
    let coef = getCoefficient(data);
    var errorJson = { "rmse": sqrt(coef.e2Bar), "mape": coef.absEPerABar, "mse": coef.e2Bar, "wape": coef.wape, "rSqd": rSquared(data, coef) }
    props.updateState(errorName, errorJson);
}
function getCoefficient(data) {
    let cnt = 0
    let xBar = 0
    let yBar = 0
    let xyBar = 0
    let xxBar = 0
    let eBar = 0
    let absEBar = 0
    let absEPerABar = 0
    let e2Bar = 0
    let ePerABar = 0
    for (let x = 0; x < data.length; x++) {
        if(data[x].actual!=null && data[x].forecast!=null){
            absEBar += abs(data[x].forecast - data[x].actual)
        }
        if (data[x].actual!=null && data[x].forecast!=null) {
            xBar += data[x].actual
            yBar += data[x].forecast
            xyBar += data[x].actual * data[x].forecast
            xxBar += data[x].actual * data[x].actual
            eBar += data[x].forecast - data[x].actual
            absEPerABar += abs(data[x].forecast - data[x].actual) / data[x].actual
            e2Bar += (data[x].forecast - data[x].actual) * (data[x].forecast - data[x].actual)
            ePerABar += (data[x].forecast - data[x].actual) / data[x].actual
            cnt++
        }
    }
    let wape = absEBar / xBar
    xBar = xBar / cnt
    yBar = yBar / cnt
    xxBar = xxBar / cnt
    xyBar = xyBar / cnt
    eBar = eBar / cnt
    absEBar = absEBar / cnt
    absEPerABar = absEPerABar / cnt
    e2Bar = e2Bar / cnt
    ePerABar = ePerABar / cnt
    let m = (xyBar - xBar * yBar) / (xxBar - (xBar * xBar))
    let c = yBar - m * xBar
    return { "m": m, "c": c, "yBar": yBar, "eBar": eBar, "absEBar": absEBar, "absEPerABar": absEPerABar, "e2Bar": e2Bar, "ePerABar": ePerABar, "wape": wape }
}
function yPrediction(x, m, c) {
    return c + m * x
}
function rSquared(data, coef) {
    let regressionSquaredError = 0
    let totalSquaredError = 0
    for (let x = 0; x < data.length; x++) {
        if (data[x].actual!=null && data[x].forecast!=null) {
            regressionSquaredError += Math.pow(data[x].forecast - yPrediction(data[x].actual, coef.m, coef.c), 2)
            totalSquaredError += Math.pow(data[x].forecast - coef.yBar, 2)
        }
    }
    return 1 - (regressionSquaredError / totalSquaredError)
}
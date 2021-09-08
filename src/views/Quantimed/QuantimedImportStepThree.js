import React, { Component } from 'react';
import {
    Button,
    CardBody,
    // CardFooter,
    FormGroup, Label, Form, CardFooter, Input, FormFeedback
} from 'reactstrap';
import i18n from '../../i18n'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import "jspdf-autotable";
import 'chartjs-plugin-annotation';
import { Formik } from 'formik';
import * as Yup from 'yup';
import moment from "moment";
import getLabelText from '../../CommonComponent/getLabelText';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { DATE_FORMAT_CAP_WITHOUT_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, QUANTIMED_DATA_SOURCE_ID, SECRET_KEY } from '../../Constants';
import CryptoJS from 'crypto-js'
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';

// const pickerLang = {
//     months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
//     from: 'From', to: 'To',
// }


let initialValuesThree = {
    regionId: '',
    regionConversionFactor: ''
}


const validationSchemaThree = function (values) {
    return Yup.object().shape({
        regionId: Yup.string()
            .required(i18n.t('static.common.regiontext')),
        regionConversionFactor: Yup.string()
            // .moreThan(0, i18n.t('static.quantimed.regionPercentagevalidation')) .typeError(i18n.t('static.quantimed.regionPercentagevalidation'))
            // .lessThan(101, i18n.t('static.quantimed.regionPercentagevalidation')) .typeError(i18n.t('static.quantimed.regionPercentagevalidation'))
            .matches(/^((\d?[1-9]|[1-9]0)|(\d?[1-9]|[1-9]0)\.(\d?[0-9])|100)$/m, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            // .min(0, i18n.t("static.procurementUnit.validValueText"))
            // .max(100, "Maximum 100%")
            .required(i18n.t('static.currency.conversionrateMin'))
        ,
        // .max(100, i18n.t('static.program.validvaluetext'))
    })
}

const validateThree = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationErrorThree(error)
        }
    }
}

const getErrorsFromValidationErrorThree = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}


class QuantimedImportStepThree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // rangeValue: { from: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear() + 1, month: new Date().getMonth() + 1 } },
            // minDate: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            // maxDate: { year: new Date().getFullYear() + 3, month: new Date().getMonth() + 1 },
            loading: false,
            regionList: [],
            region: {
                regionId: '',
                regionConversionFactor: ''
            }
        }
        // this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        // this.handleRangeChange = this.handleRangeChange.bind(this);
        // this.handleRangeDissmis = this.handleRangeDissmis.bind(this);

        // this.toggledata = this.toggledata.bind(this);
        // this.pickRange = React.createRef();

        this.laodRegionList = this.loadRegionList.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {

        let { region } = this.state;
        if (event.target.name == "regionId") {
            region.regionId = event.target.value;
            this.props.items.program.regionId = event.target.value;
        }
        if (event.target.name == "regionConversionFactor") {
            region.regionConversionFactor = event.target.value;
            this.props.items.program.regionConversionFactor = event.target.value;
        }
        this.setState({
            region
        }, () => { });
    }

    loadRegionList() {

        this.setState({
            loading: true
        })

        var programId = this.props.items.program.programId;

        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
            this.props.updateState("color", "red");
            this.props.hideFirstComponent();
        }.bind(this);
        openRequest.onsuccess = function (e) {

            db1 = e.target.result;
            var transaction;
            var programTransaction;

            transaction = db1.transaction(['programData'], 'readwrite');
            programTransaction = transaction.objectStore('programData');

            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                this.props.updateState("color", "red");
                this.props.hideFirstComponent();
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData.generalData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);

                var regList = programJson.regionList;

                regList.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                this.setState({
                    regionList: regList,
                    loading: false
                }, () => { })
            }.bind(this);
        }.bind(this);

    }

    touchAll(setTouched, errors) {
        setTouched({
            regionId: true,
            regionConversionFactor: true
        }
        )
        this.validateFormThree(errors)
    }
    validateFormThree(errors) {
        this.findFirstErrorThree('healthAreaForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstErrorThree(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    // toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    componentDidMount() {

        this.state.region.regionConversionFactor = '100'
        initialValuesThree = {
            regionConversionFactor: '100'
        }
        // this.loadRegionList();

    }

    show() {
        /* if (!this.state.showed) {
        setTimeout(() => {this.state.closeable = true}, 250)
        this.setState({ showed: true })
        }*/
    }

    // handleRangeChange(value, text, listIndex) {

    // }
    // handleRangeDissmis(value) {
    //     this.setState({ rangeValue: value }, () => {
    //         // this.filterData();
    //     })

    // }

    // _handleClickRangeBox(e) {

    //     this.pickRange.current.show()
    // }

    render() {

        // const pickerLang = {
        //     months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
        //     from: 'From', to: 'To',
        // }
        // const { rangeValue } = this.state

        // const makeText = m => {
        //     if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        //     return '?'
        // }

        const { regionList } = this.state;

        let regions = regionList.length > 0 && regionList.map((item, i) => {
            return (
                <option key={i} value={item.regionId}>
                    {item.label.label_en}
                </option>
            )
        }, this);

        return (
            <>
                <Formik
                    enableReinitialize={true}
                    initialValues={initialValuesThree}
                    validate={validateThree(validationSchemaThree)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {

                        // let startDate = moment(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01').format("YYYY-MM-DD");
                        // let endDate = moment(this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate()).format("YYYY-MM-DD");
                        // alert(startDate)
                        // alert(endDate)                        
                        // this.props.items.program.rangeValue = this.state.rangeValue;
                        var percentage = this.state.region.regionConversionFactor / 100;
                        this.props.items.program.regionConversionFactor = percentage;
                        this.props.finishedStepThree && this.props.finishedStepThree();
                        this.props.triggerStepFour();

                    }}
                    render={
                        ({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            isValid,
                            setTouched
                        }) => (
                                <div className="animated fadeIn">
                                    <div style={{ display: this.state.loading ? "none" : "block" }}>
                                        <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='healthAreaForm'>
                                            <CardBody className="pb-lg-2 pt-lg-2">
                                                {/* <div className="pl-0"> */}
                                                {/* <div className="row"> */}
                                                {/* <FormGroup className="col-md-4">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.quantimed.quantimedImportCosumptionPeriod')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                                    <div className="controls edit">

                                                        <Picker
                                                            ref={this.pickRange}
                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                            value={rangeValue}
                                                            lang={pickerLang}
                                                            //theme="light"
                                                            onChange={this.handleRangeChange}
                                                            onDismiss={this.handleRangeDissmis}
                                                        >
                                                            <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                        </Picker>
                                                    </div>
                                                </FormGroup> */}

                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.region.region')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        valid={!errors.regionId}
                                                        invalid={touched.regionId && !!errors.regionId}
                                                        bsSize="sm"
                                                        className="col-md-4"
                                                        onBlur={handleBlur}
                                                        type="select" name="regionId" id="regionId"
                                                        value={this.state.region.regionId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {regions}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.regionId}</FormFeedback>
                                                    {/* <Button color="info" size="md" className="float-right mr-1" type="button" name="planningPrevious" id="planningPrevious" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}>Next <i className="fa fa-angle-double-right"></i></Button> */}

                                                </FormGroup>

                                                <FormGroup>
                                                    <Label for="regionConversionFactor">{i18n.t('static.quantimed.regionPercentage')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="number"
                                                        min="1" max="100"
                                                        name="regionConversionFactor"
                                                        id="regionConversionFactor"
                                                        bsSize="sm"
                                                        className="col-md-4"
                                                        valid={!errors.regionConversionFactor && this.state.region.regionConversionFactor != ''}
                                                        invalid={touched.regionConversionFactor && !!errors.regionConversionFactor}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.region.regionConversionFactor}
                                                        placeholder="1-100"
                                                        required />
                                                    <FormFeedback className="red">{errors.regionConversionFactor}</FormFeedback>
                                                </FormGroup>



                                                {/* </div> */}
                                                {/* </div> */}
                                                {/* </CardBody>
                                    <CardFooter className="pb-0 pr-0"> */}
                                                <br></br>
                                                <FormGroup>

                                                    <Button color="success" size="md" className="float-right mr-1" type="submit" name="healthAreaSub" id="healthAreaSub" disabled={!isValid} onClick={() => this.touchAll(setTouched, errors)}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                                    &nbsp;
                                        <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepTwo} ><i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                                    &nbsp;
                                        </FormGroup>
                                                &nbsp;
                                    {/* </CardFooter> */}
                                            </CardBody>
                                        </Form>
                                    </div>
                                    <div style={{ display: this.state.loading ? "block" : "none" }}>
                                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                            <div class="align-items-center">
                                                <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                                <div class="spinner-border blue ml-4" role="status">

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )} />

            </>

        );
    }

}

export default QuantimedImportStepThree;
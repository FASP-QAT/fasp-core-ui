import 'chartjs-plugin-annotation';
import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import "jspdf-autotable";
import React, { Component } from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {
    Button,
    CardBody,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label
} from 'reactstrap';
import * as Yup from 'yup';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import getLabelText from '../../CommonComponent/getLabelText';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants';
import i18n from '../../i18n';
// Initial values for form fields
let initialValuesThree = {
    regionId: '',
    regionConversionFactor: ''
}
/**
 * Defines the validation schema for quantimed import step one.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchemaThree = function (values) {
    return Yup.object().shape({
        regionId: Yup.string()
            .required(i18n.t('static.common.regiontext')),
        regionConversionFactor: Yup.string()
            .matches(/^((\d?[1-9]|[1-9]0)|(\d?[1-9]|[1-9]0)\.(\d?[0-9])|100)$/m, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .required(i18n.t('static.currency.conversionrateMin'))
        ,
    })
}
/**
 * Generates a validation function compatible with Formik based on a dynamically obtained validation schema.
 * @param {Function} getValidationSchema - A function that returns a Yup validation schema based on the form values.
 * @returns {Function} - A validation function compatible with Formik.
 */
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
/**
 * Extracts errors from a Yup validation error object and returns them in a format compatible with Formik.
 * @param {Yup.ValidationError} validationError - A Yup validation error object.
 * @returns {Object} - An object containing validation errors mapped by field name.
 */
const getErrorsFromValidationErrorThree = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}
/**
 * Component for Qunatimed Import step three for taking the region details for the import
 */
class QuantimedImportStepThree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            regionList: [],
            region: {
                regionId: '',
                regionConversionFactor: ''
            }
        }
        this.laodRegionList = this.loadRegionList.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
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
    /**
     * Retrieves list of regions
     */
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
            this.props.updateState("color", "#BA0C2F");
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
                this.props.updateState("color", "#BA0C2F");
                this.props.hideFirstComponent();
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData.generalData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var regList = programJson.regionList;
                regList.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    regionList: regList,
                    loading: false
                }, () => { })
            }.bind(this);
        }.bind(this);
    }
    /**
     * Sets the initial values for the region conversion factor on component mount
     */
    componentDidMount() {
        this.state.region.regionConversionFactor = '100'
        initialValuesThree = {
            regionConversionFactor: '100'
        }
    }
    /**
     * Renders the quantimed import step three screen.
     * @returns {JSX.Element} - Quantimed import step three screen.
     */
    render() {
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
                                                    required
                                                >
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {regions}
                                                </Input>
                                                <FormFeedback className="red">{errors.regionId}</FormFeedback>
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
                                            <br></br>
                                            <FormGroup>
                                                <Button color="success" size="md" className="float-right mr-1" type="submit" name="healthAreaSub" id="healthAreaSub" >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepTwo} ><i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                                &nbsp;
                                            </FormGroup>
                                            &nbsp;
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
import 'chartjs-plugin-annotation';
import { Formik } from 'formik';
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Picker from 'react-month-picker';
import {
    Button,
    CardBody,
    Form,
    FormGroup, Label
} from 'reactstrap';
import * as Yup from 'yup';
import MonthBox from '../../CommonComponent/MonthBox.js';
import i18n from '../../i18n';
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
const initialValuesFour = {
}
const validationSchemaFour = function (values) {
    return Yup.object().shape({
    })
}
const validateFour = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationErrorFour(error)
        }
    }
}
const getErrorsFromValidationErrorFour = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}
class QuantimedImportStepFour extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rangeValue: { from: { year: this.props.items.dtmStartYear, month: this.props.items.dtmStartMonth }, to: { year: this.props.items.dtmEndYear, month: this.props.items.dtmEndMonth } },
            minDate: { year: this.props.items.dtmStartYear, month: this.props.items.dtmStartMonth },
            maxDate: { year: this.props.items.dtmEndYear, month: this.props.items.dtmEndMonth },
            loading: false,
            regionList: [],
        }
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.setMinMaxDate = this.setMinMaxDate.bind(this);
        this.toggledata = this.toggledata.bind(this);
        this.pickRange = React.createRef();
        this.dataChange = this.dataChange.bind(this);
    }
    dataChange(event) {
    }
    touchAll(setTouched, errors) {
        setTouched({
        }
        )
        this.validateForm(errors)
    }
    validateFormFour(errors) {
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
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
    componentDidMount() {
    }
    setMinMaxDate() {
    }
    show() {
    }
    handleRangeChange(value, text, listIndex) {
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
        })
    }
    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
    render() {
        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        return (
            <>
                <Formik
                    initialValues={initialValuesFour}
                    validate={validateFour(validationSchemaFour)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.setState({
                            loading: true
                        })
                        let startDate = moment(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01').format("YYYY-MM-DD");
                        let endDate = moment(this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate()).format("YYYY-MM-DD");
                        this.props.items.program.rangeValue = this.state.rangeValue;
                        this.props.finishedStepFour && this.props.finishedStepFour();
                        this.props.triggerStepFive();
                        this.setState({
                            loading: false
                        })
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
                                            <div className="pl-0">
                                                <div className="row">
                                                    <FormGroup className="col-md-4">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.quantimed.quantimedImportCosumptionPeriod')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                                        <div className="controls edit">
                                                            <Picker
                                                                ref={this.pickRange}
                                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                                value={rangeValue}
                                                                lang={pickerLang}
                                                                onChange={this.handleRangeChange}
                                                                onDismiss={this.handleRangeDissmis}
                                                            >
                                                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                            </Picker>
                                                        </div>
                                                    </FormGroup>
                                                </div>
                                            </div>
                                            <br></br>
                                            <FormGroup>
                                                <Button color="success" size="md" className="float-right mr-1" type="submit" name="healthAreaSub" id="healthAreaSub">{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                                &nbsp;
                                                <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepThree} ><i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
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
export default QuantimedImportStepFour;
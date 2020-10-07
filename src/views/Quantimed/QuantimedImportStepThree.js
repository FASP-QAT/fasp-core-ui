import React, { Component } from 'react';
import {
    Button,
    CardBody,
    // CardFooter,
    FormGroup, Label, Form, CardFooter
} from 'reactstrap';
import i18n from '../../i18n'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import "jspdf-autotable";
import 'chartjs-plugin-annotation';
import { Formik } from 'formik';
import * as Yup from 'yup'

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}


const initialValuesThree = {

}


const validationSchemaThree = function (values) {
    return Yup.object().shape({

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
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 2 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 3, month: new Date().getMonth() + 2 },
            maxDate: { year: new Date().getFullYear() + 3, month: new Date().getMonth() },
        }
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);

        this.toggledata = this.toggledata.bind(this);
        this.pickRange = React.createRef();
    }

    touchAllThree(setTouched, errors) {
        setTouched({

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

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    componentDidMount() {

    }

    show() {
        /* if (!this.state.showed) {
        setTimeout(() => {this.state.closeable = true}, 250)
        this.setState({ showed: true })
        }*/
    }

    handleRangeChange(value, text, listIndex) {
        console.log("value=======================",value);
        console.log("text=======================",text);
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            // this.filterData();
        })

    }

    _handleClickRangeBox(e) {
        console.log("Thuis.refs", this);
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
                    initialValues={initialValuesThree}
                    validate={validateThree(validationSchemaThree)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {

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
                                <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='healthAreaForm'>
                                    <CardBody className="pb-lg-2 pt-lg-0">
                                        <div className="pl-0">
                                            <div className="row">
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
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
                                                </FormGroup>
                                            </div>
                                        </div>
                                    </CardBody>
                                    <CardFooter className="pb-0 pr-0">
                                        <FormGroup>

                                            <Button color="info" size="md" className="float-right mr-1" type="submit" name="healthAreaSub" id="healthAreaSub" onClick={this.props.finishedStepThree}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepTwo} ><i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>                                        
                                        &nbsp;
                                        </FormGroup>
                                        &nbsp;
                                    </CardFooter>
                                </Form>
                            )} />

            </>

        );
    }

}

export default QuantimedImportStepThree;
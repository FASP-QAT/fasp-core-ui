import 'chartjs-plugin-annotation';
import "jspdf-autotable";
import React, { Component } from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Picker from 'react-month-picker';
import {
    Button,
    CardBody,
    Form,
    FormGroup, Label
} from 'reactstrap';
import MonthBox from '../../CommonComponent/MonthBox.js';
import i18n from '../../i18n';
/**
 * Component for Qunatimed Import step four for taking the date range for the import
 */
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
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.pickRange = React.createRef();
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
        })
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    _handleClickRangeBox(e) {
        this.pickRange.current.show()
    }
    /**
     * Renders the quantimed import step four screen.
     * @returns {JSX.Element} - Quantimed import step four screen.
     */
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
                <div className="animated fadeIn">
                    <div style={{ display: this.state.loading ? "none" : "block" }}>
                        <Form className="needs-validation" noValidate name='healthAreaForm'>
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
            </>
        );
    }
}
export default QuantimedImportStepFour;
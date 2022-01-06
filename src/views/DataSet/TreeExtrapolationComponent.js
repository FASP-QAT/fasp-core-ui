import React from "react";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import i18n from '../../i18n';
import { Row, Col, Card, CardFooter, Button, CardBody, Form, Modal, ModalBody, PopoverBody, Popover, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, Collapse, InputGroupText, InputGroup } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionOnlyHideRow, checkValidtion, inValid, positiveValidation, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { SECRET_KEY, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, JEXCEL_DATE_FORMAT_WITHOUT_DATE, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, JEXCEL_PAGINATION_OPTION, ACTUAL_CONSUMPTION_MONTHS_IN_PAST, FORECASTED_CONSUMPTION_MONTHS_IN_PAST, JEXCEL_PRO_KEY, JEXCEL_MONTH_PICKER_FORMAT, ACTUAL_CONSUMPTION_MODIFIED, FORECASTED_CONSUMPTION_MODIFIED } from "../../Constants";
import moment from "moment";
import CryptoJS from 'crypto-js'
export default class TreeExtrapolationComponent extends React.Component {
    render() {
        return (
            <div className="animated fadeIn">
                <CardBody className="pb-lg-5 pt-lg-0">
                    <Form name='simpleForm'>
                        <div className=" pl-0">
                            <div className="row">
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">Forecast Period<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                    <div className="controls edit">

                                        {/* <Picker
                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                            ref={this.pickRange}
                                            value={rangeValue}
                                            lang={pickerLang}
                                            // theme="light"
                                            // onChange={this.handleRangeChange}
                                            // onDismiss={this.handleRangeDissmis}
                                            className="greyColor"
                                        >
                                            <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} />
                                        </Picker> */}
                                    </div>
                                </FormGroup>
                            </div>
                        </div>
                    </Form>
                </CardBody>
            </div>
        )
    }
}
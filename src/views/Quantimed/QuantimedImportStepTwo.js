import React, { Component } from 'react';
import i18n from '../../i18n';
import * as Yup from 'yup'
import {
    Button, FormFeedback, CardBody,
    Form, FormGroup, Label, Input, CardFooter, Col, Card
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import jexcel from 'jexcel';
import "../ProductCategory/style.css"
import "../../../node_modules/jexcel/dist/jexcel.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import AuthenticationService from '../Common/AuthenticationService';
import LabelsService from '../../api/LabelService.js';
import ProgramService from '../../api/ProgramService';
import QuantimedImportService from '../../api/QuantimedImportService';

const initialValuesTwo = {

}

const validationSchemaTwo = function (values) {
    return Yup.object().shape({
        // realmCountryId: Yup.string()
        //     .required(i18n.t('static.program.validcountrytext')),
    })
}

const validateTwo = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationErrorTwo(error)
        }
    }
}

const getErrorsFromValidationErrorTwo = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}


export default class QunatimedImportStepTwo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            programPlanningUnits: [],
            loading: false,
            quantimedEl: "",
            programId: ''
        }

        this.loadTableData = this.loadTableData.bind(this);
        this.programPlanningUnitChanged = this.programPlanningUnitChanged.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicateCountry = this.checkDuplicateCountry.bind(this);
        this.loaded = this.loaded.bind(this);
    }

    touchAllTwo(setTouched, errors) {
        setTouched({
            // realmCountryId: true
        }
        )
        this.validateFormTwo(errors)
    }
    validateFormTwo(errors) {
        this.findFirstErrorTwo('realmCountryForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstErrorTwo(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }


    componentDidMount() {


    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        tr.children[3].classList.add('AsteriskTheadtrTd');
    }

    programPlanningUnitChanged = function (instance, cell, x, y, value) {

        var tableJson = this.el.getJson();
        var hasDuplicate = false;

        if (x == 2) {
            var col_C_1 = ("C").concat(parseInt(y) + 1);
            var value_C_1 = this.el.getValueFromCoords(2, y);
            for (var z = 0; z < tableJson.length; z++) {
                var col_C_2 = ("C").concat(parseInt(z) + 1);
                var value_C_2 = this.el.getValueFromCoords(2, z);
                if (col_C_1 !== col_C_2 && value_C_1 === value_C_2) {
                    hasDuplicate = true;
                }
            }

            var col = ("C").concat(parseInt(y) + 1);

            if (value == "") {
                // this.el.setStyle(col, "background-color", "transparent");
                // this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else if (value == "-1") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "pink");
                this.el.setComments(col, "");
            }
            else if (hasDuplicate) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, 'Duplicate Program Planning Unit');
            }
            else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col_D = ("D").concat(parseInt(y) + 1);
            var value_D = this.el.getValueFromCoords(3, y);
            console.log(col_D, "==================================", value_D)
            if (value_D !== "" && value_D !== "-1") {
                for (var z = 0; z < tableJson.length; z++) {
                    var col_D_2 = ("D").concat(parseInt(z) + 1);
                    var col_C_3 = ("C").concat(parseInt(z) + 1);
                    var value_D_2 = this.el.getValueFromCoords(3, z);
                    console.log(col_D_2, "==================", value_D_2)
                    if (col_D !== col_D_2 && value_D_2 !== "-1" && value_D === value_D_2) {
                        console.log("col_D_2 ==================================", col_D_2)
                        this.el.setStyle(col_C_3, "background-color", "transparent");
                        this.el.setComments(col_C_3, "");
                        console.log("==========================close")
                        break;
                    }
                }
            }

            this.el.setValue(col_D, value);

        }
    }

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson();

        for (var y = 0; y < json.length; y++) {
            // var value = this.el.getValueFromCoords(2, y);            
            // if (parseInt(value) == 1) {

            //Currency
            var col = ("C").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(2, y);
            if (value == "") {
                // this.el.setStyle(col, "background-color", "transparent");
                // this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                // this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            // }
        }
        return valid;
    }

    checkDuplicateCountry = function () {
        var tableJson = this.el.getJson();
        let count = 0;
        let tempArray = tableJson;
        var hasDuplicate = false;
        tempArray.map(v => v[Object.keys(v)[2]]).sort().sort((a, b) => {
            console.log(a, "===========", count++, "==========", b);
            if (a !== "" && b !== "")
                if (a !== '-1' && b !== '-1')
                    if (a === b)
                        hasDuplicate = true
        })

        if (hasDuplicate) {
            alert('Duplicate Program Planning Unit Found');
            this.setState({
                message: 'Duplicate Program Planning Unit Found',
                changedFlag: 0,

            },
                () => {
                    // this.hideSecondComponent();
                })
            return false;
        } else {
            return true;
        }
    }

    formSubmit = function () {
        // var duplicateValidation = this.checkDuplicateCountry();
        // var validation = this.checkValidation();
        if (this.checkDuplicateCountry() && this.checkValidation()) {
            var tableJson = this.el.getJson();

            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                this.props.items.importData.products[i].programPlanningUnitId = map1.get("2");
            }

            for(var i = 0; i < this.props.items.importData.records.length; i++) {
                for(var j = 0; j < this.props.items.importData.products.length; j++) {                    
                    if(this.props.items.importData.records[i].productId === this.props.items.importData.products[j].productId) {
                        this.props.items.importData.records[i].product = this.props.items.importData.products[j];                        
                    }
                }
            }


            AuthenticationService.setupAxiosInterceptors();
            QuantimedImportService.addImportedForecastData(this.props.items.importData).then(response => {

                if (response.status == 200) {
                    this.props.finishedStepTwo();
                }
                else {

                    this.setState({
                        message: response.data.messageCode
                    },
                        () => {

                        })
                }

            })
        }
    }

    loadTableData() {

        if (this.state.programId !== this.props.items.program.programId) {
            AuthenticationService.setupAxiosInterceptors();
            ProgramService.getProgramPlaningUnitListByProgramId(this.props.items.program.programId).then(response => {

                if (response.status == 200) {

                    this.setState({
                        programPlanningUnits: response.data
                    })

                    const { programPlanningUnits } = this.state;

                    let programPlanningUnitsArr = [];
                    var myVar = "";

                    if (programPlanningUnits.length > 0) {
                        var paJson = {
                            name: 'Do not import',
                            id: -1,
                            active: true
                        }
                        programPlanningUnitsArr[0] = paJson
                        for (var i = 0; i < programPlanningUnits.length; i++) {
                            var paJson = {
                                name: getLabelText(programPlanningUnits[i].planningUnit.label, this.props.items.lang),
                                id: parseInt(programPlanningUnits[i].planningUnit.id),
                                active: programPlanningUnits[i].active
                            }
                            programPlanningUnitsArr[i + 1] = paJson
                        }
                    }

                    this.el = jexcel(document.getElementById("paputableDiv"), '');
                    this.el.destroy();

                    var json = this.props.items.importData.products;
                    var data = [];
                    var products = [];
                    for (var i = 0; i < json.length; i++) {
                        data = [];
                        data[0] = json[i].productId;// A
                        data[1] = json[i].productName;// B
                        data[2] = "";// C    
                        data[3] = "";// D                    
                        products[i] = data;
                    }
                    var options = {
                        data: products,
                        contextMenu: function () { return false; },
                        colHeaders: [
                            'Product ID',
                            'Qunatimed Planning Unit',
                            'Porgram Planning Unit',
                            'Previous Program Planning Unit',
                        ],
                        colWidths: [80, 80, 80, 80],
                        columns: [
                            { type: 'hidden' },
                            { type: 'text', readOnly: true },
                            { type: 'dropdown', source: programPlanningUnitsArr },
                            { type: 'hidden' }
                        ],
                        text: {
                            // showingPage: 'Showing {0} to {1} of {1}',
                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                            show: '',
                            entries: '',
                        },
                        pagination: 0,
                        search: false,
                        columnSorting: false,
                        tableOverflow: true,
                        wordWrap: true,
                        paginationOptions: [],
                        allowInsertColumn: false,
                        allowManualInsertColumn: false,
                        onchange: this.programPlanningUnitChanged,
                        // oneditionstart: this.editStart,
                        allowDeleteRow: false,
                        tableOverflow: false,
                        onload: this.loaded,
                        // tableHeight: '500px',
                    };
                    myVar = jexcel(document.getElementById("paputableDiv"), options);
                    this.el = myVar;
                    this.setState({
                        programId: this.props.items.program.programId
                    })

                }
                else {

                    this.setState({
                        message: response.data.messageCode
                    },
                        () => {

                        })
                }


            })

        }


    }




    render() {


        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                {/* <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5> */}
                {/* <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5> */}
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    {/* <Card> */}
                    <CardBody className="table-responsive pt-md-1 pb-md-1">

                        <Col xs="12" sm="12">

                            <div id="paputableDiv" >
                            </div>

                        </Col>
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button color="info" size="md" className="float-right mr-1" type="submit" name="healthAreaSub" id="healthAreaSub" onClick={this.props.finishedStepTwo}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                            <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>Proceed</Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepOne} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                &nbsp;
                        </FormGroup>
                    </CardFooter>
                    {/* </Card> */}
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }




}
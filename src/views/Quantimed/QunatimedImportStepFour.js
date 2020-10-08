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


export default class QunatimedImportStepFour extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
        this.loaded_four = this.loaded_four.bind(this);
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

    componentDidMount() {

    }

    loaded_four = function (instance, cell, x, y, value) {
        
        jExcelLoadedFunctionOnlyHideRow(instance);
        
    }

    showFinalData() {

        console.log("Hello========",this.props.items.importData.records);
        this.el = jexcel(document.getElementById("recordsDiv"), '');
        this.el.destroy();
        var myVar = "";
        var json = this.props.items.importData.records;
        var data_1 = [];
        var records = [];
        console.log("length====================",json.length)
        for (var i = 0; i < json.length; i++) {         
            console.log("products=======================================================================",json[i].product.programPlanningUnitId);   
            if(json[i].product.programPlanningUnitId !== "-1") {                
                data_1 = [];
                data_1[0] = json[i].product.productName;// A
                data_1[1] = json[i].dtmPeriod;// B  
                data_1[2] = json[i].ingConsumption;// C                              
                records[i] = data_1;
            }
        }
        console.log("length====================",records.length)
        console.log("products=======================================================================",records);
        var options = {
            data: records,
            contextMenu: function () { return false; },
            colHeaders: [
                'Quantimed Planning Unit',
                'DTM Period',
                'Consumption'
            ],
            colWidths: [80, 80, 80],
            columns: [                
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true }
            ],
            text: {
                // showingPage: 'Showing {0} to {1} of {1}',
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                show: '',
                entries: '',
            },
            pagination: false,
            search: true,
            columnSorting: false,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: [],
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            // onchange: this.changed,
            // oneditionstart: this.editStart,
            allowDeleteRow: false,
            tableOverflow: false,
            onload: this.loaded_four,
            // tableHeight: '500px',
        };
       

        myVar = jexcel(document.getElementById("recordsDiv"), options);
        this.el = myVar;
        this.setState({
            programId: this.props.items.program.programId
        })

    }

    render() {


        return (

            <div className="animated fadeIn">

                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>

                    <CardBody className="table-responsive pt-md-1 pb-md-1">

                        <Col xs="12" sm="12">

                            <div id="recordsDiv" >
                            </div>

                        </Col>
                    </CardBody>
                    <CardFooter className="pb-0 pr-0">
                        <FormGroup>
                        <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>Proceed</Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepThree} ><i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                            &nbsp;
                        </FormGroup>                    
                        &nbsp;
                </CardFooter>
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
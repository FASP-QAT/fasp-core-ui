import React, { Component } from 'react';

import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from "../../api/ProgramService";
import { Formik } from 'formik';
import * as Yup from 'yup'
import {
    Button, FormFeedback, CardBody,
    Form, FormGroup, Label, Input,
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';



export default class StepFive extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regionList: [],
            regionId: ''
        }
    }
    componentDidMount() {

    }

    getRegionList() {

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getRegionList(document.getElementById('realmCountryId').value)
            .then(response => {
                if (response.status == 200) {
                    var json = response.data;
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    this.setState({
                        regionId: '',
                        regionList: regList
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })

    }
    render() {
        return (
            <>
                <FormGroup>
                    <Label htmlFor="select">{i18n.t('static.program.region')}<span class="red Reqasterisk">*</span><span class="red Reqasterisk">*</span></Label>
                    <Select
                        onChange={(e) => { this.props.updateFieldData(e) }}
                        className="col-md-4"
                        bsSize="sm"
                        name="regionId"
                        id="regionId"
                        multi
                        options={this.state.regionList}
                        value={this.state.regionId}
                    />
                    </FormGroup>
                    <br></br>
                    <FormGroup>
                    <Button color="info" size="md" className="float-left mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.props.previousToStepFour} > <i className="fa fa-angle-double-left"></i> Back</Button>
                    &nbsp;
                    <Button color="info" size="md" className="float-left mr-1" type="button" name="regionSub" id="regionSub" onClick={this.props.finishedStepFive}>Next <i className="fa fa-angle-double-right"></i></Button>
                    &nbsp;
                    </FormGroup>
                

            </>
        );
    }
}
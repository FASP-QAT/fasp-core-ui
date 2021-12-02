import React from "react";
import ReactDOM from 'react-dom';
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalFooter, ModalBody, Row, Table, PopoverBody, Popover
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, SECRET_KEY } from "../../Constants";
import i18n from '../../i18n';
import CryptoJS from 'crypto-js'
import getLabelText from "../../CommonComponent/getLabelText";
import jexcel from 'jexcel-pro';
import { DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import csvicon from '../../assets/img/csv.png';
import { Bar, Line, Pie } from 'react-chartjs-2';
import moment from "moment"
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import DatasetService from "../../api/DatasetService";


export default class CommitTreeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            programId: -1,
            programList: [],
            showValidation: false,
            versionTypeId: -1,
            programDataLocal:'',
            programDataServer:''
        }

    }
    componentDidMount = function () {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['datasetData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('datasetData');
            var programRequest = programDataOs.getAll();
            programRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programList = [];
                var myResult = programRequest.result;
                for (var i = 0; i < myResult.length; i++) {
                    var datasetDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                    var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                    var datasetJson = JSON.parse(datasetData);
                    var programJson = {
                        name: datasetJson.programCode,
                        id: myResult[i].id,
                        version:datasetJson.currentVersion.versionId,
                        datasetJson:datasetJson
                    }
                    programList.push(programJson)
                }
                this.setState({
                    programList: programList
                })
            }.bind(this)
        }.bind(this)
    }

    setProgramId(e) {
        var programId = e.target.value;
        var myResult = [];
        myResult = this.state.programList;
        console.log("myResult----", myResult);
        this.setState({
            programId: programId
        })
             let programData = myResult.filter(c => (c.id == programId));
             console.log("programId----", programData[0].datasetJson);
            this.setState({
                programDataLocal: programData[0].datasetJson
            })
           
            var programVersionJson = [];
            var json = {
                programId: programData[0].datasetJson.programId,
                versionId: '-1'
            }
            programVersionJson = programVersionJson.concat([json]);
            DatasetService.getAllDatasetData(programVersionJson)
                    .then(response => {
                        console.log("response>>>", response.data);
                        this.setState({
                            programDataServer: response.data[0]
                        })
                    })
        }

    toggleShowValidation() {
        this.setState({
            showValidation: !this.state.showValidation
        })
    }

    setVersionTypeId(e) {
        var versionTypeId = e.target.value;
        this.setState({
            versionTypeId: versionTypeId
        })
    }

    render() {
        const { programList } = this.state;
        let programs = programList.length > 0 && programList.map((item, i) => {
            return (
                <option key={i} value={item.id}>
                    {item.name}-v{item.version}
                </option>
            )
        }, this);

        return (
            <div className="animated fadeIn">
                <Card>
                    <CardBody className="pb-lg-5 pt-lg-0">
                        <Form name='simpleForm'>
                            <div className=" pl-0">
                                <div className="row">
                                    <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">Program</Label>
                                        <div className="controls ">
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                value={this.state.programId}
                                                onChange={(e) => { this.setProgramId(e); }}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                {programs}
                                            </Input>
                                        </div>
                                    </FormGroup>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.reset}><i className="fa fa-refresh"></i> Cancel</Button>
                                <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-check"></i>Next</Button>
                            </div>
                        </Form>

                        <div className="row">
                        <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">Version Type</Label>
                                        <div className="controls ">
                                            <Input
                                                type="select"
                                                name="versionTypeId"
                                                id="versionTypeId"
                                                bsSize="sm"
                                                value={this.state.versionTypeId}
                                                onChange={(e) => { this.setVersionTypeId(e); }}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                <option value="1">Draft Version</option>
                                                <option value="2">Final Version</option>
                                            </Input>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="col-md-4 ">
                                                        <Label htmlFor="appendedInputButton">Notes</Label>
                                                        <Input
                                                            className="controls"
                                                            type="textarea"
                                                            id="notesId"
                                                            name="notesId"
                                                        />
                                                    </FormGroup>

                                                    <div className="col-md-12">
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.reset}><i className="fa fa-refresh"></i>Cancel</Button>
                                <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>Commit</Button>
                            </div>
                                                    </div>
                    </CardBody>
                </Card>
                <Modal isOpen={this.state.showValidation}
                    className={'modal-lg ' + this.props.className} >
                    <ModalHeader toggle={() => this.toggleShowValidation()} className="modalHeaderSupplyPlan">
                        <strong>Forecast Validation</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <p>
                                Tanzania ARV v1 (local)
                                Forecast Period: MM-YYYY to MM-YYYY

                                No forecast selected: (Compare & Select, Forecast Summary)

                                Planning Unit C – Region B

                                Planning Unit F – Region B

                                Consumption Forecast: (Data Entry & Adjustment, Extrapolation)

                                Months missing actual consumption values (gap)

                                Planning Unit A – Region B: Feb-21, April-21

                                Planning units that don’t have at least 12 months of actual consumption values:

                                Planning Unit A – Region B: 8 month(s)

                                Planning Unit B – Region B: 2 month(s)

                                Planning Unit A – Region B: 0 month(s)

                                Planning Unit B – Region B: 1 month(s)
                                
                                Tree Forecast(s)

                            Planning unit that doesn't appear on any Tree

                            Planning Unit C – Region B

                            Planning Unit F – Region B

                            Branches Missing Planning Unit (Manage Tree)

Tree 1:

Country Population greater than Female Population

Country Population greater than Male Population greater than Sexually active men greater than Men who use condoms greater than Strawberry Condom

Tree 2:

Clinic Patients greater than Patients seeking contraceptive services greater than Condom users greater than No logo condom

Clinic Patients greater than Patients seeking contraceptive services greater than Long-acting reversible contraceptives (LARCs)

Nodes with children that don’t add up to 100%

                            Tree 1 / Scenario A:

                            

                            Country Population greater than Male Population

                            Country Population greater than Male Population greater than Sexually active men greater than Men who use condoms

                            Country Population greater than Sexually Active Men

                            22-Jan

                            75.40%

                            100%

                            36.80%

                            22-Feb

                            75.40%

                            100%

                            36.80%

                            22-Mar

                            75.40%

                            100%

                            36.80%

                            22-Apr

                            75.40%

                            100%

                            36.80%

                            22-May

                            75.40%

                            100%

                            36.80%

                            22-Jun

                            75.40%

                            100%

                            36.80%

                            22-Jul

                            75.40%

                            100%

                            36.80%

                            22-Aug

                            75.40%

                            100%

                            36.80%

                            22-Sep

                            75.40%

                            100%

                            36.80%

                            22-Oct

                            75.40%

                            100%

                            36.80%

                            22-Nov

                            75.40%

                            100%

                            36.80%

                            22-Dec

                            75.40%

                            100%

                            36.80%

                            22-Jan

                            75.40%

                            100%

                            36.80%

                            22-Feb

                            75.40%

                            100%

                            36.80%

                            22-Mar

                            75.40%

                            100%

                            36.80%

                            22-Apr

                            75.40%

                            100%

                            36.80%

                            22-May

                            75.40%

                            101%

                            36.80%

                            22-Jun

                            75.40%

                            102%

                            36.80%

                            22-Jan

                            75.40%

                            103%

                            36.80%

                            Notes:

Consumption:

Planning Unit – Region

Notes

Planning Unit C – Region B

Male population not expected to scale over time. % Data from 2018 census

Tree Scenarios

                            Tree

                            Scenario

                            Notes

                            Demographic

                            Low

                            

                            Demographic

                            High

                            

                            Morbidity

                            Historical

                            Extrapolated based on previous service statistics

                            Morbidity

                            Aggressive (Target-Based)

                            Using donor-provided targets, derived from UNAIDS data to reach 95-95-95

                            

                            Tree Nodes

                            Tree

                            Node

                            Notes

                            Demographic

                            Country Population greater than Male Population

                            Main: Male population not expected to scale over time. % Data from 2018 census

                            Morbidity

                            1L ARV Patients

                            Main: #############

                            Modeling:  Jan-2021 to Dec-2021 | Linear (%)  | 0.09% |  An increase of 0.0875% every month which is equates to 1.5% increase every year.

                            Morbidity

                            1L ARV Patients greater than TLD

                            Main: #############

                            Modeling:  #############

                            Morbidity

                            1L ARV Patients greater than ABC + 3TC

                            Main: #############

                            Modeling:  #############
                            </p>
                        </ModalBody>
                    </div>
                </Modal>
            </div>
        )
    }

}
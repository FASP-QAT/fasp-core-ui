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
import CompareVersionTable from '../CompareVersion/CompareVersionTable.js';


export default class CommitTreeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            programId: -1,
            programName: '',
            programList: [],
            showValidation: false,
            versionTypeId: -1,
            programDataLocal: '',
            programDataServer: '',
            showCompare: false,
            forecastStartDate: '',
            forecastStopDate: '',
            notSelectedPlanningUnitList: [],
            lang: localStorage.getItem("lang"),
            treeList: [],
            treeScenarioList: []
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
                        version: datasetJson.currentVersion.versionId,
                        datasetJson: datasetJson
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
        this.setState({
            programId: programId
        })
        let programData = myResult.filter(c => (c.id == programId));
        this.setState({
            programDataLocal: programData[0].datasetJson,
            programName: programData[0].name + 'v' + programData[0].version + '(local)',
            forecastStartDate: programData[0].datasetJson.currentVersion.forecastStartDate,
            forecastStopDate: programData[0].datasetJson.currentVersion.forecastStopDate
        })

        console.log('Program Data ', programData[0].datasetJson);
        var PgmTreeList = programData[0].datasetJson.treeList;
        //Get planning Unit list :
        var treePlanningUnitList = [];
        for (var tl = 0; tl < PgmTreeList.length; tl++) {
            var treeList = PgmTreeList[tl];
            var flatList = treeList.tree.flatList;
            for (var fl = 0; fl < flatList.length; fl++) {
                var payload = flatList[fl].payload;
                if (payload.nodeType.id == 5) {
                    var nodeDataMap = payload.nodeDataMap;
                    var scenarioList = treeList.scenarioList;
                    for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                        var nodePlanningUnit = ((nodeDataMap[scenarioList[ndm].id])[0].puNode.planningUnit);
                        treePlanningUnitList.push(nodePlanningUnit);
                    }
                }
            }
        }
        var datasetPlanningUnit = programData[0].datasetJson.planningUnitList;
        var notSelectedPlanningUnitList = [];
        for (var dp = 0; dp < datasetPlanningUnit.length; dp++) {
            var puId = datasetPlanningUnit[dp].planningUnit.id;
            let planningUnitNotSelected = treePlanningUnitList.filter(c => (c.id == puId));
            if (planningUnitNotSelected.length == 0) {
                notSelectedPlanningUnitList.push(datasetPlanningUnit[dp].planningUnit);
            }
        }
        this.setState({
            notSelectedPlanningUnitList: notSelectedPlanningUnitList
        })
        //*** */

        //Nodes with children that don’t add up to 100% 
        var treeScenarioList = [];
        for (var tl = 0; tl < PgmTreeList.length; tl++) {
            var scenarioList = treeList.scenarioList;
            for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                treeScenarioList.push(
                    {
                        "treeId": PgmTreeList[tl].treeId,
                        "treeLable": PgmTreeList[tl].label,
                        "scenarioId": scenarioList[ndm].id,
                        "scenarioLabel": scenarioList[ndm].label
                    });
            }
        }
        this.setState({
            treeScenarioList: treeScenarioList,
            treeList: PgmTreeList
        }, () => {

            var startDate = moment(programData[0].datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
            var stopDate = moment(programData[0].datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
            var nodeDataModelingList = programData[0].datasetJson.nodeDataModelingList;
            var curDate = startDate;

            for (var i = 0; curDate < stopDate; i++) {
                curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                for (var tl = 0; tl < PgmTreeList.length; tl++) {
                    var treeList = PgmTreeList[tl];
                    var flatList = treeList.tree.flatList;
                    for (var fl = 0; fl < flatList.length; fl++) {
                        var payload = flatList[fl].payload;
                        var nodeDataMap = payload.nodeDataMap;
                        var scenarioList = treeList.scenarioList;
                        for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                            treeScenarioList.push(
                                {
                                    "treeId": PgmTreeList[tl].treeId,
                                    "treeLable": PgmTreeList[tl].label,
                                    "scenarioId": scenarioList[ndm].id,
                                    "scenarioLabel": scenarioList[ndm].label
                                });

                            var childrenWithoutHundred = [];
                            var nodeWithPercentageChildren = [];
                            var nodeModellingList = nodeDataModelingList.filter(c => c.month == curDate);
                            console.log('nodeModellingList', nodeModellingList);
                            var nodeChildrenList = flatList.filter(c => flatList[fl].id == c.parent && c.payload.nodeType.id == 3);
                            if (nodeChildrenList.length > 0) {
                                var totalPercentage = 0;
                                for (var ncl = 0; ncl < nodeChildrenList.length; ncl++) {
                                    var payloadChild = nodeChildrenList[ncl].payload;
                                    var nodeDataMapChild = payloadChild.nodeDataMap;
                                    var nodeDataMapForScenario = (nodeDataMapChild[scenarioList[ndm].id])[0];

                                    var nodeModellingListFiltered = nodeModellingList.filter(c => c.nodeDataId == nodeDataMapForScenario.nodeDataId)
                                    if (nodeModellingListFiltered.length > 0) {
                                        totalPercentage += nodeModellingListFiltered[0].endValue;
                                    }
                                }
                                childrenWithoutHundred.push(
                                    {
                                        "treeId": PgmTreeList[tl].treeId,
                                        "scenarioId": scenarioList[ndm].id,
                                        "month": curDate,
                                        "label": payload.label,
                                        "id": flatList[fl].id,
                                        "percentage": totalPercentage
                                    }
                                )
                                var index = nodeWithPercentageChildren.findIndex(c => c.id == flatList[fl].id);
                                if (index == -1) {
                                    nodeWithPercentageChildren.push(
                                        {
                                            "id": flatList[fl].id,
                                            "label": payload.label
                                        }
                                    )
                                }
                            }
                            console.log("childrenWithoutHundred", childrenWithoutHundred);
                            //build JXL
                            let childrenList = childrenWithoutHundred;
                            let childrenArray = [];
                            var data = [];
                            var curDate = startDate;
                            for (var i = 0; curDate < stopDate; i++) {
                                curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                                data = [];
                                data[0] = curDate;
                                for (var nwp = 0; nwp < nodeWithPercentageChildren.length; nwp++) {
                                    var child = childrenList.filter(c => c.id == nodeWithPercentageChildren[nwp].id && c.month == curDate);

                                    data[nwp + 1] = child.length > 0 ? child[0].percentage : '';
                                }

                                childrenArray.push(data);
                            }

                            this.el = jexcel(document.getElementById(PgmTreeList[tl].treeId + "~" + scenarioList[ndm].id), '');
                            // this.el.destroy();

                            var columnsArray = [];
                            columnsArray.push({
                                title: "Month",
                                type: 'text',
                                readOnly: true
                            });
                            for (var nwp = 0; nwp < nodeWithPercentageChildren.length; nwp++) {
                                columnsArray.push({
                                    title: nodeWithPercentageChildren[nwp].label,
                                    type: 'text',
                                    readOnly: true
                                });
                            }
                            var options = {
                                data: childrenArray,
                                columnDrag: true,
                                colWidths: [0, 150, 150, 150, 100, 100, 100],
                                colHeaderClasses: ["Reqasterisk"],
                                columns: columnsArray,
                                text: {
                                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                    show: '',
                                    entries: '',
                                },
                                onload: this.loaded,
                                pagination: localStorage.getItem("sesRecordCount"),
                                search: true,
                                columnSorting: true,
                                tableOverflow: true,
                                wordWrap: true,
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                onselection: this.selected,
                                oneditionend: this.onedit,
                                copyCompatibility: true,
                                allowExport: false,
                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                position: 'top',
                                filters: true,
                                license: JEXCEL_PRO_KEY,
                                contextMenu: function (obj, x, y, e) {
                                    return [];
                                }.bind(this),
                            };
                            var languageEl = jexcel(document.getElementById(PgmTreeList[tl].treeId + "~" + scenarioList[ndm].id), options);
                            this.el = languageEl;
                        }
                    }
                }

            }
        })

        var programVersionJson = [];
        var json = {
            programId: programData[0].datasetJson.programId,
            versionId: '-1'
        }
        programVersionJson = programVersionJson.concat([json]);
        DatasetService.getAllDatasetData(programVersionJson)
            .then(response => {
                this.setState({
                    programDataServer: response.data[0],
                    showCompare: true
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

        const { notSelectedPlanningUnitList } = this.state;
        let pu = notSelectedPlanningUnitList.length > 0 && notSelectedPlanningUnitList.map((item, i) => {
            return (
                <li key={i}>
                    <div>{getLabelText(item.label, this.state.lang)}</div>
                </li>
            )
        }, this);
        console.log("treelist", this.state.treeList);
        console.log("treeScenariolist", this.state.treeScenarioList);

        this.state.treeList.map(item => {
            this.state.treeScenarioList.filter(c => c.treeId == item.treeId).map(item1 => {
                console.log('item1', item1);
            })
        })

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
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {programs}
                                            </Input>
                                        </div>
                                    </FormGroup>
                                </div>
                            </div>
                            {(this.state.showCompare) &&
                                <>
                                    <CompareVersionTable datasetData={this.state.programDataLocal} datasetData1={this.state.programDataServer} versionLabel={"V" + this.state.programDataLocal.currentVersion.versionId + "(Local)"} versionLabel1={"V" + this.state.programDataServer.currentVersion.versionId + "(Server)"} />
                                    <div className="table-responsive">
                                        <div id="tableDiv" />
                                    </div>
                                </>
                            }
                            <div className="table-responsive">
                                {/* <div id={item1.treeId + "~" + item1.scenarioId} /> */}
                            </div>

                            {
                                this.state.treeList.map(item => {
                                    this.state.treeScenarioList.filter(c => c.treeId == item.treeId).map(item1 => {
                                        console.log('item1----', item1)
                                        return (<div className="table-responsive">
                                            <div id={"table" + item1.treeId + "~" + item1.scenarioId} />
                                        </div>)
                                    })
                                })
                            }
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
                        <h3><strong>Forecast Validation</strong></h3>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <span><b>{this.state.programName}</b></span><br />
                            <span><b>Forecast Period: </b> {moment(this.state.forecastStartDate).format('MMM-YYYY')} to {moment(this.state.forecastStopDate).format('MMM-YYYY')} </span><br /><br />

                            <span><b>1. No forecast selected: </b>(<a href="/report/compareAndSelectScenario" target="_blank">Compare & Select</a>, <a href="/report/compareAndSelectScenario" target="_blank">Forecast Summary</a>)</span><br />
                            <span>Planning Unit C – Region B </span><br /><br />

                            <span><b>2. Consumption Forecast: </b>(<a href="/report/compareAndSelectScenario" target="_blank">Data Entry & Adjustment</a>, <a href="/report/compareAndSelectScenario" target="_blank">Extrapolation</a>)</span><br />
                            <span>a. Months missing actual consumption values (gap)</span><br />
                            <span><b>Planning Unit A – Region B: Feb-21, April-21 </b></span><br />
                            <span>b. Planning units that don’t have at least 12 months of actual consumption values:</span><br />
                            <span><b>Planning Unit A – Region B: 8 month(s)  </b></span><br /><br />

                            <span><b>3. Tree Forecast(s) </b></span><br />
                            <span>a. Planning unit that doesn’t appear on any Tree </span><br />
                            <ul>{pu}</ul>

                            <span>b. Branches Missing Planning Unit (<a href="/report/compareAndSelectScenario" target="_blank">Manage Tree</a>)</span><br />
                            <span>Tree 1: </span>
                            <ul>
                                <li>Country Population greater than Female Population</li>
                                <li>Country Population greater than Male Population greater than Sexually active men greater than Men who use condoms greater than Strawberry Condom</li>
                            </ul>
                            <span>c. Nodes with children that don’t add up to 100%</span><br />
                            <span>Tree 1 / Scenario A:</span>
                            <p>

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
            </div >
        )
    }

}
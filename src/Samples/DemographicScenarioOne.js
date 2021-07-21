import React, { Component } from 'react';
// import jexcel from 'jexcel-pro';
// import "../../node_modules/jexcel-pro/dist/jexcel.css";
// import "../../node_modules/jsuites/dist/jsuites.css";
import {
    JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY,
    JEXCEL_DATE_FORMAT_SM

} from '../Constants.js';
// import { jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunctionOnlyHideRow, inValid, inValidWithColor, jExcelLoadedFunction, } from '../CommonComponent/JExcelCommonFunctions.js'
import { OrgDiagram } from 'basicprimitivesreact';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType, LevelAnnotationConfig, AnnotationType, LineType, Thickness } from 'basicprimitives';
import { DndProvider, DropTarget, DragSource } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faEdit, faDigitalTachograph } from '@fortawesome/free-solid-svg-icons'
import i18n from '../i18n'
import { Col, Row, Card, Button, FormGroup, Label, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import TreeData from './TreeData';
import CardBody from 'reactstrap/lib/CardBody';
import CardFooter from 'reactstrap/lib/CardFooter';
import Provider from '../Samples/Provider';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import 'react-tabs/style/react-tabs.css';
import jexcel from 'jexcel-pro';
import "../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../node_modules/jsuites/dist/jsuites.css";
import moment from 'moment';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationService from '../views/Common/AuthenticationService';
import AuthenticationServiceComponent from '../views/Common/AuthenticationServiceComponent';




export default class DemographicScenarioOne extends Component {
    constructor() {
        super();
        // this.onRemoveItem = this.onRemoveItem.bind(this);
        // this.canDropItem = this.canDropItem.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.createNewTree = this.createNewTree.bind(this);

        this.buildJexcel = this.buildJexcel.bind(this);
        // this.dataChange = this.dataChange.bind(this);
        this.buildJexcelForFrecastOutPut = this.buildJexcelForFrecastOutPut.bind(this);
        this.loadedFunctionForMergeProblemList = this.loadedFunctionForMergeProblemList.bind(this);
        this.state = {
            treeEl: '',
            treeObj: [{
                forecastDatasetName: 'AGO-CON-MOH',
                forecastMethod: 'Morbidity',
                treeName: 'Angola Morbiity Tree',
                scenarioName: 'High',
                status: 'Active',
                createdDate: '2021-07-21',
                createdBy: 'Anchal C',
                lastModifiedDate: '2021-07-21',
                lastModifiedBy: 'Anchal C'
            }, {
                forecastDatasetName: 'AGO-CON-MOH',
                forecastMethod: 'Morbidity',
                treeName: 'Angola Morbiity Tree',
                scenarioName: 'Medium',
                status: 'Active',
                createdDate: '2021-07-21',
                createdBy: 'Anchal C',
                lastModifiedDate: '2021-07-21',
                lastModifiedBy: 'Anchal C'
            },
            {
                forecastDatasetName: 'AGO-CON-MOH',
                forecastMethod: 'Morbidity',
                treeName: 'Angola Morbiity Tree',
                scenarioName: 'Low',
                status: 'Active',
                createdDate: '2021-07-21',
                createdBy: 'Anchal C',
                lastModifiedDate: '2021-07-21',
                lastModifiedBy: 'Anchal C'
            }],


            activeTab: new Array(3).fill('1'),
            openAddNodeModal: false,
            openEditNodeModal: false,
            title: '',
            cursorItem: 0,
            highlightItem: 0,
            nodeDetail: '',
            items: TreeData.demographic_scenario_one,
            currentItemConfig: {
                nodeType: -1,
                nodeValueType: -1,
                dosageSet: {
                    dosageSetId: '-1',
                    dosage: {
                        forecastingUnit: { id: '-1' },
                        fuPerApplication: '',
                        noOfTimesPerDay: '',
                        chronic: '',
                        noOfDaysPerMonth: ''
                    }
                }
            }
        }

    }
    componentDidMount() {
        this.buildJexcelForFrecastOutPut();
        this.buildJexcel();
    }
    createNewTree() {
        this.props.history.push(`/morbidity/scenarioOne`)
    }
    buildJexcelForFrecastOutPut() {
        var options = {
            data: [],
            columnDrag: true,
            colWidths: [50, 50, 50, 50, 50, 50, 50],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Tree Name',
                    type: 'text',
                },

                {
                    title: 'Scenarion',
                    type: 'text',
                },
                {
                    title: 'Forecasting Unit',
                    type: 'text',
                },
                {
                    title: 'Planning Unit',
                    type: 'text',
                },
                {
                    title: 'Supply Plan Dataset',
                    type: 'text',
                },
                {
                    title: 'Supply Plan Planning Unit',
                    type: 'text',
                },
                {
                    title: 'Value (%)',
                    type: 'text',
                },
            ],
            pagination: localStorage.getItem("sesRecordCount"),
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            editable: false,
            onload: this.loadedFunctionForMergeProblemList,
            filters: true,
            license: JEXCEL_PRO_KEY,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },



        }

        var forecastOutPutJexcel = jexcel(document.getElementById("forecastOutPutDiv"), options);
        this.el = forecastOutPutJexcel;
    }

    loadedFunctionForMergeProblemList = function (instance) {
        jExcelLoadedFunction(instance);
    }

    buildJexcel() {
        let treeList = this.state.treeObj;
        // console.log("dataSourceList---->", dataSourceList);
        let treeArray = [];
        let count = 0;

        for (var j = 0; j < treeList.length; j++) {
            data = [];
            data[0] = treeList[j].forecastDatasetName
            data[1] = treeList[j].forecastMethod
            data[2] = treeList[j].treeName
            data[3] = treeList[j].scenarioName
            data[4] = treeList[j].createdBy;
            data[5] = treeList[j].createdDate;
            data[6] = treeList[j].lastModifiedBy;
            data[7] = treeList[j].lastModifiedDate;
            // data[6] = (dataSourceList[j].lastModifiedDate ? moment(dataSourceList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[8] = treeList[j].status;
            treeArray[count] = data;
            count++;
        }
        // if (dataSourceList.length == 0) {
        //     data = [];
        //     dataSourceArray[0] = data;
        // }
        // console.log("dataSourceArray---->", dataSourceArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = treeArray;

        var options = {
            data: data,
            columnDrag: true,
            // colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Forecast Dataset',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Forecast Method',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Tree Name',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Scenario Name',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.createdBy'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.createdDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    readOnly: true
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    readOnly: true,
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },

            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            // tableOverflow: true,
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
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: 'Delete',
                            onclick: function () {

                            }.bind(this)
                        });
                    }
                }

                return items;
            }.bind(this),
        };
        var treeEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = treeEl;
        this.setState({
            treeEl: treeEl, loading: false
        })
    }

    loaded = function (instance) {
        jExcelLoadedFunction(instance);
    }

    toggle(tabPane, tab) {
        const newArray = this.state.activeTab.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab: newArray,
        });
    }

    resetTree() {
        // console.log("in reset>>>", TreeData.demographic_scenario_one);
        window.location.reload();
    }
    dataChange(event) {
        // alert("hi");
        let { currentItemConfig } = this.state;
        if (event.target.name === "nodeTitle") {
            currentItemConfig.title = event.target.value;
        }
        if (event.target.name === "nodeValueType") {
            currentItemConfig.nodeValueType = event.target.value;
        }
        if (event.target.name === "nodeType") {
            currentItemConfig.nodeType = event.target.value;
        }
        if (event.target.name === "percentage") {
            currentItemConfig.nodePercentage = event.target.value;
        }
        // if (event.target.name === "dosage") {
        //     currentItemConfig.dosage = event.target.value;
        // }
        if (event.target.name === "dosageSet") {
            currentItemConfig.dosageSet.dosageSetId = event.target.value;
        }
        if (event.target.name === "scaling") {
            currentItemConfig.scaling = event.target.value;
        }
        if (event.target.name === "forecastingUnit") {
            currentItemConfig.dosageSet.dosage.forecastingUnit.id = event.target.value;
        }
        if (event.target.name === "fuPerApplication") {
            currentItemConfig.dosageSet.dosage.fuPerApplication = event.target.value;
        }
        if (event.target.name === "noOfTimesPerDay") {
            currentItemConfig.dosageSet.dosage.noOfTimesPerDay = event.target.value;
        }
        if (event.target.name === "noOfDaysPerMonth") {
            currentItemConfig.dosageSet.dosage.noOfDaysPerMonth = event.target.value;
        }
        this.setState({ currentItemConfig: currentItemConfig });
    }
    onAddButtonClick(itemConfig) {
        this.setState({ openAddNodeModal: true, openEditNodeModal: false, clickedParnetNodeId: itemConfig.id, clickedParnetNodeValue: itemConfig.nodeValue });

    }
    addNode() {
        const { items } = this.state;
        var calculateValue = parseInt(this.state.clickedParnetNodeValue) * this.state.currentItemConfig.nodePercentage / 100;
        // console.log(">>>", parseInt(this.state.clickedParnetNodeValue));
        // console.log(">>>", this.state.currentItemConfig.nodePercentage / 100);
        var newItem = {
            id: parseInt(items.length + 1),
            parent: this.state.clickedParnetNodeId,
            title: this.state.currentItemConfig.title,
            nodePercentage: this.state.currentItemConfig.nodePercentage,
            nodeValue: calculateValue,
            nodeType: this.state.currentItemConfig.nodeType,
            description: "",
            itemTitleColor: Colors.White,
            titleTextColor: Colors.Black,
            // dosage: this.state.currentItemConfig.dosage,

            nodeValueColor: this.state.currentItemConfig.nodeType == 2 ? Colors.White : Colors.Black,
            nodeBackgroundColor: this.state.currentItemConfig.nodeType == 2 ? Colors.Black : Colors.White,
            borderColor: this.state.currentItemConfig.nodeType == 2 ? Colors.White : Colors.Black,

            dosageSet: {
                dosageSetId: this.state.currentItemConfig.dosageSet.dosageSetId,
                label: {
                    id: '123',
                    label_en: 'Condoms'
                },
                dosage: {
                    forecastingUnit: {
                        id: this.state.currentItemConfig.dosageSet.dosage.forecastingUnit.id,
                        label: {
                            id: '456',
                            label_en: 'Male Condom (Latex) Lubricated, No Logo, 49 mm Male Condom'
                        }
                    },
                    fuPerApplication: this.state.currentItemConfig.dosageSet.dosage.fuPerApplication,
                    noOfTimesPerDay: this.state.currentItemConfig.dosageSet.dosage.noOfTimesPerDay,
                    chronic: false,
                    noOfDaysPerMonth: this.state.currentItemConfig.dosageSet.dosage.noOfDaysPerMonth,
                    totalQuantity: parseInt(this.state.currentItemConfig.dosageSet.dosage.noOfDaysPerMonth) * parseInt(this.state.clickedParnetNodeValue)

                }
            },

        }

    }

    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }


    tabPane() {


        return (
            <>
                <TabPane tabId="1">
                    <Row>
                        hi 1
                    </Row>
                </TabPane>
                <TabPane tabId="2">
                    <div>
                        {/* <Row> */}
                        <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                            <Card className="mb-lg-0">
                                <div className="Card-header-addicon">
                                    {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                                    <div className="card-header-actions">
                                        <div className="card-header-action">
                                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_DATA_SOURCE') && <a href="javascript:void();" title={'Create new tree'} onClick={this.createNewTree}><i className="fa fa-plus-square"></i></a>}
                                        </div>
                                    </div>

                                </div>
                                <CardBody>
                                    <div>
                                        <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DATA_SOURCE') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                                        </div>
                                    </div>
                                </CardBody>
                                <CardFooter>

                                </CardFooter>
                            </Card></Col>
                        {/* </Row> */}

                    </div>
                </TabPane>
                <TabPane tabId="3">
                    <Row>
                        <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                            <Col md="12 pl-0" id="realmDiv">
                                <div className="table-responsive RemoveStriped">
                                    <div id="forecastOutPutDiv" />
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </TabPane>

            </>
        );
    }

    render() {
        return <div className="animated fadeIn">
            <Row>
                <Col xs="12" md="12" className="mb-4">
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                active={this.state.activeTab[0] === '1'}
                                onClick={() => { this.toggle(0, '1'); }}
                            >
                                Data Set
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                active={this.state.activeTab[0] === '2'}
                                onClick={() => { this.toggle(0, '2'); }}
                            >
                                Tree
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                active={this.state.activeTab[0] === '3'}
                                onClick={() => { this.toggle(0, '3'); }}
                            >
                                Forecast Output
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab[0]}>
                        {this.tabPane()}
                    </TabContent>
                </Col>
            </Row>
        </div>
    
    }
}

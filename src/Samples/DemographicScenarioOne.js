import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType, LevelAnnotationConfig, AnnotationType, LineType, Thickness } from 'basicprimitives';
import { DndProvider, DropTarget, DragSource } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'
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
import 'react-tabs/style/react-tabs.css';
import jexcel from 'jexcel-pro';
import "../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../node_modules/jsuites/dist/jsuites.css";
import moment from 'moment';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../CommonComponent/JExcelCommonFunctions.js'
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from '../Constants';
import AuthenticationService from '../views/Common/AuthenticationService';
import AuthenticationServiceComponent from '../views/Common/AuthenticationServiceComponent';




export default class DemographicScenarioOne extends Component {
    constructor() {
        super();
        // this.onRemoveItem = this.onRemoveItem.bind(this);
        // this.canDropItem = this.canDropItem.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
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
            },
            {
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
            }]
        }

    }
    componentDidMount() {
        this.buildJexcel();
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

    render() {

        return (
         <div className="animated">
            <AuthenticationServiceComponent history={this.props.history} />
            <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message)}</h5>
            <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
            <Card>
                <div className="Card-header-addicon">
                    {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                    <div className="card-header-actions">
                        <div className="card-header-action">
                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_DATA_SOURCE') && <a href="javascript:void();" title={'Create new tree'} onClick={this.addNewDataSource}><i className="fa fa-plus-square"></i></a>}
                        </div>
                    </div>

                </div>

                <CardBody className="pb-lg-0 pt-lg-0">
                    <Row>
                    <Col md="12 pl-0">
                        <div className="d-md-flex">
                            <Tabs defaultIndex={1} onSelect={index => console.log(index)}>
                                <TabList>
                                    <Tab>Dataset Data</Tab>
                                    <Tab>Trees</Tab>
                                    <Tab>Forecast Output</Tab>
                                </TabList>
                                <TabPanel>hi 1</TabPanel>
                                <TabPanel>
                                    <div>
                                        <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DATA_SOURCE') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel>hi 2</TabPanel>
                            </Tabs>
                        </div>
                    </Col>
                    </Row>
                </CardBody>
            </Card>
        </div>
        );
    }
}

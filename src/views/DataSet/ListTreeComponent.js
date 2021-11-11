import React, { Component } from 'react';
import DatasetService from '../../api/DatasetService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Card, CardHeader, CardBody, Button, Col, FormGroup, Label, InputGroup, Input } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import i18n from '../../i18n';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js'
import CryptoJS from 'crypto-js'
const entityname = i18n.t('static.common.listtree');
export default class ListTreeComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            treeTemplateList: [],
            treeData: [],
            datasetList: [],
            message: '',
            loading: true
        }
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.buildTree = this.buildTree.bind(this);
        this.onTemplateChange = this.onTemplateChange.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.getTreeList = this.getTreeList.bind(this);
        this.getTreeTemplateList = this.getTreeTemplateList.bind(this);
    }
    getTreeTemplateList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['treeTemplate'], 'readwrite');
            var program = transaction.objectStore('treeTemplate');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                this.setState({
                    treeTemplateList: myResult
                    // .filter(x => x.active == "true")
                });
                // for (var i = 0; i < myResult.length; i++) {
                //     console.log("treeTemplateList--->", myResult[i])

                // }

            }.bind(this);
        }.bind(this);
    }

    getTreeList(datasetId) {
        var proList = [];
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                console.log("1---", userId);
                console.log("2---", myResult);
                for (var i = 0; i < myResult.length; i++) {
                    console.log("3---", myResult[i]);
                    if (myResult[i].userId == userId) {
                        console.log("4---");
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                        console.log("5--->", programData);
                        // var f = 0
                        var treeList = programData.treeList;
                        for (var k = 0; k < treeList.length; k++) {
                            if (datasetId == 0) {
                                console.log('inside else')
                                proList.push(treeList[k])
                            } else if (programData.programId == datasetId) {
                                console.log('inside if')
                                proList.push(treeList[k])
                            }
                        }
                    }
                }
                console.log("pro list---", proList);
                this.setState({
                    treeData: proList
                }, () => {
                    this.buildJexcel();
                });

            }.bind(this);
        }.bind(this);
    }
    getDatasetList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                this.setState({
                    datasetList: myResult
                });
                // for (var i = 0; i < myResult.length; i++) {
                //     console.log("datasetList--->", myResult[i])

                // }

            }.bind(this);
        }.bind(this);
    }

    onTemplateChange(event) {
        if (event.target.value == 0 || event.target.value == "") {
            this.buildTree();
        } else {
            this.props.history.push({
                pathname: `/dataSet/buildTree/template/${event.target.value}`,
                // state: { role }
            });
        }

    }

    buildTree() {

        this.props.history.push({
            pathname: `/dataSet/buildTree/`,
            // state: { role }
        });

    }
    buildJexcel() {
        let treeList = this.state.treeData;
        let treeArray = [];
        let count = 0;

        for (var j = 0; j < treeList.length; j++) {
            console.log("treeList[j]---", treeList[j]);
            // var trees = treeList[j].treeList;
            // for (var k = 0; k < trees.length; k++) {
            // console.log("trees[k]---", trees[k]);
            data = [];

            data[0] = treeList[j].treeId
            var dataset = document.getElementById("datasetId");
            data[1] = dataset.options[dataset.selectedIndex].text
            data[2] = getLabelText(treeList[j].label, this.state.lang)
            data[3] = treeList[j].regionList.map(x => getLabelText(x.label, this.state.lang)).join(", ")
            data[4] = getLabelText(treeList[j].forecastMethod.label, this.state.lang)
            data[5] = treeList[j].scenarioList.map(x => getLabelText(x.label, this.state.lang)).join(", ")
            treeArray[count] = data;
            count++;
            // }
        }
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
                    title: 'Tree Id',
                    type: 'hidden'
                },
                {
                    title: 'Program',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.treeName'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.region'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.forecastMethod.forecastMethod'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.common.scenarioName'),
                    type: 'text',
                    readOnly: true
                }

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
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: 'Delete',
                            onclick: function () {

                            }.bind(this)
                        });

                        items.push({
                            title: i18n.t('static.common.copyRow'),
                            onclick: function () {
                                var rowData = obj.getRowData(y);
                                console.log("rowData===>", rowData);
                                rowData[0] = "";
                                rowData[1] = "";
                                var data = rowData;
                                this.el.insertRow(
                                    data, 0, 1
                                );
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
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    componentDidMount() {
        this.hideFirstComponent();
        this.getDatasetList();
        this.getTreeTemplateList();
        this.getTreeList(0);
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    selected = function (instance, cell, x, y, value) {
        if (x == 0 && value != 0) {
            // console.log("HEADER SELECTION--------------------------");
        } else {

            var treeId = this.el.getValueFromCoords(0, x);
            // if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DIMENSION')) {
            this.props.history.push({
                pathname: `/dataSet/buildTree/tree/${treeId}`,
                // state: { role }
            });
            // }

        }
    }.bind(this);

    // addNewDimension() {
    //     if (isSiteOnline()) {
    //         this.props.history.push(`/diamension/addDiamension`)
    //     } else {
    //         alert("You must be Online.")
    //     }

    // }

    render() {
        const { datasetList } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.programCode}
                    </option>
                )
            }, this);

        const { treeTemplateList } = this.state;
        let treeTemplates = treeTemplateList.length > 0
            && treeTemplateList.map((item, i) => {
                return (
                    <option key={i} value={item.treeTemplateId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);


        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <Col md="12 pl-0">
                                    <div className="d-md-flex">
                                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_LIST_REALM_COUNTRY') &&
                                            // <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.createTreeFromTemplate')}</Button>
                                            // <Col md="3" className="pl-0">
                                            <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                                {/* <Label htmlFor="appendedInputButton">{i18n.t('static.forecastProgram.forecastProgram')}</Label> */}
                                                <div className="controls SelectGo">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="templateId"
                                                            id="templateId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.onTemplateChange(e) }}
                                                        >
                                                            <option value="">{'+ Add Tree'}</option>
                                                            <option value="0">{'(blank)'}</option>
                                                            {treeTemplates}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            // </Col>
                                        }
                                        {/* {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_LIST_REALM_COUNTRY') &&
                                            <FormGroup className="tab-ml-1 mt-md-1 mb-md-0 ">
                                                <Button type="submit" size="md" color="info" onClick={this.buildTree} className="float-right pt-1 pb-1" ><i className="fa fa-plus"></i>  {i18n.t('static.common.addtree')}</Button>
                                            </FormGroup>
                                        } */}
                                    </div>
                                </Col>
                            </div>
                        </div>

                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <Col md="3" className="pl-0">
                            <FormGroup className="Selectdiv">
                                <Label htmlFor="appendedInputButton">{'Program'}</Label>
                                <div className="controls SelectGo">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="datasetId"
                                            id="datasetId"
                                            bsSize="sm"
                                            onChange={(e) => { this.getTreeList(e.target.value) }}
                                        >
                                            <option value="0">{i18n.t('static.common.all')}</option>
                                            {datasets}
                                        </Input>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        {/* <div id="loader" className="center"></div> */}
                        <div className="listtreetable">
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DIMENSION') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                            </div>
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
                    </CardBody>
                </Card>

            </div>
        );
    }
}
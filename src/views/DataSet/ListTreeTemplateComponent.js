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
const entityname = i18n.t('static.common.listtree');
export default class ListTreeTemplate extends Component {

    constructor(props) {
        super(props);
        this.state = {
            treeList: [{
                forecastDatasetName: 'AGO-CON-MOH',
                forecastMethod: 'Demographic',
                treeName: 'Condoms Demographic Tree',
                region: 'Region A',
                scenarioName: 'High,Medium',
                status: 'Active'
            }, {
                forecastDatasetName: 'AGO-CON-MOH',
                forecastMethod: 'Consumption',
                treeName: 'Condoms Consumption Tree',
                region: 'Region B',
                scenarioName: 'Medium',
                status: 'Active'
            },
            {
                forecastDatasetName: 'AGO-CON-MOH',
                forecastMethod: 'Morbidity',
                treeName: 'Condoms Morbidity Tree',
                region: 'Region C',
                scenarioName: 'High,Medium,Low',
                status: 'Active'
            }

            ],
            message: '',
            loading: true
        }
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.buildTree = this.buildTree.bind(this);
        this.onTemplateChange = this.onTemplateChange.bind(this);
    }


    onTemplateChange(event) {

        this.props.history.push({
            pathname: `/dataSet/buildTree/${event.target.value}`,
            // state: { role }
        });

    }

    buildTree() {

        this.props.history.push({
            pathname: `/dataSet/buildTree/`,
            // state: { role }
        });

    }
    buildJexcel() {
        let treeList = this.state.treeList;
        // console.log("dataSourceList---->", dataSourceList);
        let treeArray = [];
        let count = 0;

        for (var j = 0; j < treeList.length; j++) {
            data = [];
            data[0] = treeList[j].treeName
            data[1] = treeList[j].region
            data[2] = treeList[j].forecastMethod
            data[3] = treeList[j].scenarioName
            data[4] = treeList[j].status;
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
        this.buildJexcel();
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
                pathname: `/dataSet/buildTree/${treeId}`,
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
                                                            <option value="0">{'Select Template'}</option>
                                                            <option value="1">Demographic TreeTemplate</option>
                                                            {/* {realmList} */}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            // </Col>
                                        }
                                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_LIST_REALM_COUNTRY') &&
                                            <FormGroup className="tab-ml-1 mt-md-1 mb-md-0 ">
                                                <Button type="submit" size="md" color="success" onClick={this.buildTree} className="float-right pt-1 pb-1" ><i className="fa fa-check"></i>{i18n.t('static.common.createManualTree')}</Button>
                                            </FormGroup>
                                        }
                                    </div>
                                </Col>
                            </div>
                        </div>

                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <Col md="3" className="pl-0">
                            <FormGroup className="Selectdiv">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.forecastProgram.forecastProgram')}</Label>
                                <div className="controls SelectGo">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="realmId"
                                            id="realmId"
                                            bsSize="sm"
                                            onChange={this.filterData}
                                        >
                                            <option value="0">{i18n.t('static.common.all')}</option>
                                            {/* {realmList} */}
                                        </Input>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        {/* <div id="loader" className="center"></div> */}
                        <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DIMENSION') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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

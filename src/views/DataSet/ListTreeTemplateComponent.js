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
            treeTemplateList: [],
            message: '',
            loading: true
        }
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.buildTree = this.buildTree.bind(this);
        this.addTreeTemplate = this.addTreeTemplate.bind(this);
    }


    addTreeTemplate(event) {

        this.props.history.push({
            pathname: `/dataSet/createTreeTemplate/-1`,
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
        let treeTemplateList = this.state.treeTemplateList;
        console.log("treeTemplateList---->", treeTemplateList);
        let treeTemplateArray = [];
        let count = 0;

        for (var j = 0; j < treeTemplateList.length; j++) {
            data = [];
            data[0] = treeTemplateList[j].treeTemplateId;
            data[1] = getLabelText(treeTemplateList[j].label, this.state.lang)
            data[2] = getLabelText(treeTemplateList[j].forecastMethod.label, this.state.lang)
            data[3] = treeTemplateList[j].monthsInPast;
            data[4] = treeTemplateList[j].monthsInFuture;
            data[5] = treeTemplateList[j].active;
            treeTemplateArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = treeTemplateArray;

        var options = {
            data: data,
            columnDrag: true,
            // colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Template Id',
                    type: 'hidden',
                },
                {
                    title: 'Template Name',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Forecast Method',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.monthsInPast'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.monthsInFuture'),
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
        DatasetService.getTreeTemplateList().then(response => {
            console.log("tree template list---",response.data)
            this.setState({
                treeTemplateList: response.data,
                loading: false
            }, () => { this.buildJexcel() })
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );

    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    selected = function (instance, cell, x, y, value) {
        if (x == 0 && value != 0) {
            // console.log("HEADER SELECTION--------------------------");
        } else {

            var treeTemplateId = this.el.getValueFromCoords(0, x);
            // if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DIMENSION')) {
            this.props.history.push({
                pathname: `/dataset/createTreeTemplate/${treeTemplateId}`,
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
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_LIST_REALM_COUNTRY') &&
                                    <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addTreeTemplate}><i className="fa fa-plus-square"></i></a>
                                }

                            </div>
                        </div>

                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        {/* <div id="loader" className="center"></div> */}
                        <div className="TreeTemplateTable">
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

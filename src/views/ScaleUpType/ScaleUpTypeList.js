// import React, { Component } from 'react';
// // import IntegrationService from '../../api/IntegrationService.js';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import { NavLink } from 'react-router-dom'
// import {
//     Card, CardHeader, CardBody, FormGroup,
//     CardFooter, Button
// } from 'reactstrap';
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import getLabelText from '../../CommonComponent/getLabelText'
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// import jexcel from 'jexcel-pro';
// import "../../../node_modules/jexcel-pro/dist/jexcel.css";
// import "../../../node_modules/jsuites/dist/jsuites.css";
// import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
// import i18n from '../../i18n';
// import moment from 'moment';
// import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
// import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';
// const entityname = i18n.t('static.scaleUpType.scaleUpType');
// export default class scaleUpTypeListComponent extends Component {

//     constructor(props) {
//         super(props);

//         this.state = {
//             scaleUpTypeList: [],
//             message: '',
//             selSource: [],
//             loading: true
//         }
//         this.addNewScaleUpType = this.addNewScaleUpType.bind(this);
//         this.editScaleUpType = this.editScaleUpType.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//         this.buildJexcel = this.buildJexcel.bind(this);
//         this.formSubmit = this.formSubmit.bind(this);
//         this.cancelClicked = this.cancelClicked.bind(this);
//     }

//     formSubmit() {

//     }

//     buildJexcel() {
//         let scaleUpTypeList = this.state.selSource;
//         // console.log("scaleUpTypeList---->", scaleUpTypeList);
//         let scaleUpTypeArray = [];
//         let count = 0;

//         for (var j = 0; j < scaleUpTypeList.length; j++) {
//             data = [];
//             data[0] = scaleUpTypeList[j].scaleUpTypeId
//             data[1] = getLabelText(scaleUpTypeList[j].label, this.state.lang)
//             data[2] = scaleUpTypeList[j].lastModifiedBy.username;
//             data[3] = (scaleUpTypeList[j].lastModifiedDate ? moment(scaleUpTypeList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
//             scaleUpTypeArray[count] = data;
//             count++;
//         }

//         this.el = jexcel(document.getElementById("tableDiv"), '');
//         this.el.destroy();
//         var json = [];
//         var data = scaleUpTypeArray;

//         var options = {
//             data: data,
//             columnDrag: true,
//             colWidths: [50, 100, 100],
//             colHeaderClasses: ["Reqasterisk"],
//             columns: [
//                 {
//                     title: 'scaleUpTypeId',
//                     type: 'hidden',
//                     readOnly: true
//                 },
//                 {
//                     title: i18n.t('static.scaleUpType.scaleUpType'),
//                     type: 'text',
//                     // readOnly: true
//                     textEditor: true,
//                 },
//                 {
//                     title: i18n.t('static.common.lastModifiedBy'),
//                     type: 'text',
//                     readOnly: true
//                 },
//                 {
//                     title: i18n.t('static.common.lastModifiedDate'),
//                     type: 'calendar',
//                     options: { format: JEXCEL_DATE_FORMAT_SM },
//                     readOnly: true
//                 },
//             ],
//             text: {
//                 // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
//                 showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
//                 show: '',
//                 entries: '',
//             },
//             onload: this.loaded,
//             pagination: localStorage.getItem("sesRecordCount"),
//             search: true,
//             columnSorting: true,
//             tableOverflow: true,
//             wordWrap: true,
//             allowInsertColumn: false,
//             allowManualInsertColumn: false,
//             allowDeleteRow: false,
//             // onselection: this.selected,
//             oneditionend: this.onedit,
//             copyCompatibility: true,
//             allowExport: false,
//             paginationOptions: JEXCEL_PAGINATION_OPTION,
//             position: 'top',
//             filters: true,
//             license: JEXCEL_PRO_KEY,
//             contextMenu: function (obj, x, y, e) {
//                 return [];
//             }.bind(this),
//         };
//         var scaleUpTypeListEl = jexcel(document.getElementById("tableDiv"), options);
//         this.el = scaleUpTypeListEl;
//         this.setState({
//             scaleUpTypeListEl: scaleUpTypeListEl, loading: false
//         })
//     }
//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }
//     hideFirstComponent() {
//         this.timeout = setTimeout(function () {
//             document.getElementById('div1').style.display = 'none';
//         }, 8000);
//     }
//     componentWillUnmount() {
//         clearTimeout(this.timeout);
//     }
//     componentDidMount() {
//         this.hideFirstComponent();
//         // AuthenticationService.setupAxiosInterceptors();
//         // IntegrationService.getIntegrationListAll().then(response => {
//         //     if (response.status == 200) {
//         //         console.log("response.data---->", response.data)

//         //         this.setState({
//         //             integrationList: response.data,
//         //             selSource: response.data
//         //         },
//         //             () => {
//         //                 this.buildJexcel()
//         //             })

//         //     }
//         //     else {
//         //         this.setState({
//         //             message: response.data.messageCode, loading: false
//         //         },
//         //             () => {
//         //                 this.hideSecondComponent();
//         //             })
//         //     }

//         // })
//         //     .catch(
//         //         error => {
//         //             if (error.message === "Network Error") {
//         //                 this.setState({
//         //                     message: 'static.unkownError',
//         //                     loading: false
//         //                 });
//         //             } else {
//         //                 switch (error.response ? error.response.status : "") {

//         //                     case 401:
//         //                         this.props.history.push(`/login/static.message.sessionExpired`)
//         //                         break;
//         //                     case 403:
//         //                         this.props.history.push(`/accessDenied`)
//         //                         break;
//         //                     case 500:
//         //                     case 404:
//         //                     case 406:
//         //                         this.setState({
//         //                             message: error.response.data.messageCode,
//         //                             loading: false
//         //                         });
//         //                         break;
//         //                     case 412:
//         //                         this.setState({
//         //                             message: error.response.data.messageCode,
//         //                             loading: false
//         //                         });
//         //                         break;
//         //                     default:
//         //                         this.setState({
//         //                             message: 'static.unkownError',
//         //                             loading: false
//         //                         });
//         //                         break;
//         //                 }
//         //             }
//         //         }
//         //     );

//         let templist = [
//             {
//                 "createdBy": {
//                     "userId": 1,
//                     "username": "Anchal C"
//                 },
//                 "createdDate": "2020-02-25 12:00:00",
//                 "lastModifiedBy": {
//                     "userId": 1,
//                     "username": "Anchal C"
//                 },
//                 "lastModifiedDate": "2020-02-25 12:00:00",
//                 "active": true,
//                 "scaleUpTypeId": 1,
//                 "label": {
//                     "createdBy": null,
//                     "createdDate": null,
//                     "lastModifiedBy": null,
//                     "lastModifiedDate": null,
//                     "active": true,
//                     "labelId": 126,
//                     "label_en": "Constant (m c)",
//                     "label_sp": "",
//                     "label_fr": "",
//                     "label_pr": ""
//                 }
//             },
//             {
//                 "createdBy": {
//                     "userId": 1,
//                     "username": "Anchal C"
//                 },
//                 "createdDate": "2020-02-25 12:00:00",
//                 "lastModifiedBy": {
//                     "userId": 1,
//                     "username": "Anchal C"
//                 },
//                 "lastModifiedDate": "2020-02-25 12:00:00",
//                 "active": true,
//                 "scaleUpTypeId": 1,
//                 "label": {
//                     "createdBy": null,
//                     "createdDate": null,
//                     "lastModifiedBy": null,
//                     "lastModifiedDate": null,
//                     "active": true,
//                     "labelId": 126,
//                     "label_en": "Incremental (m c)",
//                     "label_sp": "",
//                     "label_fr": "",
//                     "label_pr": ""
//                 }
//             },
//             {
//                 "createdBy": {
//                     "userId": 1,
//                     "username": "Anchal C"
//                 },
//                 "createdDate": "2020-02-25 12:00:00",
//                 "lastModifiedBy": {
//                     "userId": 1,
//                     "username": "Anchal C"
//                 },
//                 "lastModifiedDate": "2020-02-25 12:00:00",
//                 "active": true,
//                 "scaleUpTypeId": 1,
//                 "label": {
//                     "createdBy": null,
//                     "createdDate": null,
//                     "lastModifiedBy": null,
//                     "lastModifiedDate": null,
//                     "active": true,
//                     "labelId": 126,
//                     "label_en": "Linear growth (m c)",
//                     "label_sp": "",
//                     "label_fr": "",
//                     "label_pr": ""
//                 }
//             }
//         ];
//         this.setState({
//             scaleUpTypeList: templist,
//             selSource: templist
//         },
//             () => {
//                 this.buildJexcel()
//             })
//     }

//     loaded = function (instance, cell, x, y, value) {
//         jExcelLoadedFunction(instance);
//     }
//     editScaleUpType(scaleUpType) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_INTEGRATION')) {
//             this.props.history.push({
//                 pathname: `/scaleUpType/editScaleUpType/${scaleUpType.scaleUpTypeId}`,
//             });
//         }
//     }

//     selected = function (instance, cell, x, y, value) {
//         if (x == 0 && value != 0) {
//             // console.log("HEADER SELECTION--------------------------");
//         } else {
//             if (this.state.selSource.length != 0) {
//                 if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_INTEGRATION')) {
//                     this.props.history.push({
//                         pathname: `/scaleUpType/editScaleUpType/${this.el.getValueFromCoords(0, x)}`,
//                         // state: { role }
//                     });
//                 }
//             }
//         }
//     }.bind(this);

//     addNewScaleUpType() {
//         if (isSiteOnline()) {
//             this.props.history.push(`/scaleUpType/addScaleUpType`)
//         } else {
//             alert("You must be Online.")
//         }

//     }

//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }
//     render() {
//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} loading={(loading) => {
//                     this.setState({ loading: loading })
//                 }} />
//                 <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card>
//                     <div className="Card-header-addicon">
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
//                         <div className="card-header-actions">
//                             <div className="card-header-action">
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_INTEGRATION') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewScaleUpType}><i className="fa fa-plus-square"></i></a>}
//                             </div>
//                         </div>

//                     </div>
//                     <CardBody className="table-responsive pt-md-1 pb-md-1">
//                         {/* <div id="loader" className="center"></div> */}
//                         <div id="tableDiv" style={{ display: this.state.loading ? "none" : "block" }}>
//                         </div>
//                         <div style={{ display: this.state.loading ? "block" : "none" }}>
//                             <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
//                                 <div class="align-items-center">
//                                     <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

//                                     <div class="spinner-border blue ml-4" role="status">

//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                     </CardBody>
//                     <CardFooter>
//                         <FormGroup>
//                             <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
//                             <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
//                             {/* <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button> */}
//                             &nbsp;
//                         </FormGroup>
//                     </CardFooter>
//                 </Card>

//             </div>
//         );
//     }
//     cancelClicked() {
//         this.props.history.push(`/realmCountry/listRealmCountry/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
//     }
// }

// 2nd option

import React, { Component } from "react";
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form

} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import RegionService from "../../api/RegionService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature';
import moment from 'moment';
import { JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from "../../Constants";

const entityname = i18n.t('static.scaleUpType.scaleUpType')


class ScaleUpType extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scaleUpTypeList: [],
            message: '',
            selSource: [],
            loading: true
        }
        // this.setTextAndValue = this.setTextAndValue.bind(this);
        // this.disableRow = this.disableRow.bind(this);
        // this.submitForm = this.submitForm.bind(this);
        // this.enableRow = this.enableRow.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        // this.Capitalize = this.Capitalize.bind(this);
        // this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this)
        // this.CapitalizeFull = this.CapitalizeFull.bind(this);
        // this.updateRow = this.updateRow.bind(this);
        this.changed = this.changed.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {

                data = [];
                data[0] = papuList[j].scaleUpTypeId
                data[1] = getLabelText(papuList[j].label, this.state.lang)
                data[2] = papuList[j].lastModifiedBy.username;
                data[3] = (papuList[j].lastModifiedDate ? moment(papuList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
                data[4] = 0;
                papuDataArr[count] = data;
                count++;
            }
        }

        if (papuDataArr.length == 0) {
            data = [];
            data[0] = 0;
            data[1] = "";
            data[2] = "";
            data[3] = "";
            data[4] = 1;
            papuDataArr[0] = data;
        }

        this.el = jexcel(document.getElementById("paputableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = papuDataArr;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100],
            columns: [

                {
                    title: 'scaleUpTypeId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.scaleUpType.scaleUpType'),
                    type: 'text',
                    // readOnly: true
                    textEditor: true,
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
                    title: 'isChange',
                    type: 'hidden'
                }

            ],
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            onpaste: this.onPaste,
            oneditionend: this.oneditionend,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {
                    // Insert a new column
                    if (obj.options.allowInsertColumn == true) {
                        items.push({
                            title: obj.options.text.insertANewColumnBefore,
                            onclick: function () {
                                obj.insertColumn(1, parseInt(x), 1);
                            }
                        });
                    }

                    if (obj.options.allowInsertColumn == true) {
                        items.push({
                            title: obj.options.text.insertANewColumnAfter,
                            onclick: function () {
                                obj.insertColumn(1, parseInt(x), 0);
                            }
                        });
                    }

                    // Delete a column
                    // if (obj.options.allowDeleteColumn == true) {
                    //     items.push({
                    //         title: obj.options.text.deleteSelectedColumns,
                    //         onclick: function () {
                    //             obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                    //         }
                    //     });
                    // }

                    // Rename column
                    // if (obj.options.allowRenameColumn == true) {
                    //     items.push({
                    //         title: obj.options.text.renameThisColumn,
                    //         onclick: function () {
                    //             obj.setHeader(x);
                    //         }
                    //     });
                    // }

                    // Sorting
                    if (obj.options.columnSorting == true) {
                        // Line
                        items.push({ type: 'line' });

                        items.push({
                            title: obj.options.text.orderAscending,
                            onclick: function () {
                                obj.orderBy(x, 0);
                            }
                        });
                        items.push({
                            title: obj.options.text.orderDescending,
                            onclick: function () {
                                obj.orderBy(x, 1);
                            }
                        });
                    }
                } else {
                    // Insert new row before
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.insertNewRowBefore'),
                            onclick: function () {
                                var data = [];
                                data[0] = 0;
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = 1;
                                obj.insertRow(data, parseInt(y), 1);
                            }.bind(this)
                        });
                    }
                    // after
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.insertNewRowAfter'),
                            onclick: function () {
                                var data = [];
                                data[0] = 0;
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = 1;
                                obj.insertRow(data, parseInt(y));
                            }.bind(this)
                        });
                    }
                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        if (obj.getRowData(y)[6] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
                        }
                    }

                    if (x) {
                        // if (obj.options.allowComments == true) {
                        //     items.push({ type: 'line' });

                        //     var title = obj.records[y][x].getAttribute('title') || '';

                        //     items.push({
                        //         title: title ? obj.options.text.editComments : obj.options.text.addComments,
                        //         onclick: function () {
                        //             obj.setComments([x, y], prompt(obj.options.text.comments, title));
                        //         }
                        //     });

                        //     if (title) {
                        //         items.push({
                        //             title: obj.options.text.clearComments,
                        //             onclick: function () {
                        //                 obj.setComments([x, y], '');
                        //             }
                        //         });
                        //     }
                        // }
                    }
                }

                // Line
                items.push({ type: 'line' });

                // // Save
                // if (obj.options.allowExport) {
                //     items.push({
                //         title: i18n.t('static.supplyPlan.exportAsCsv'),
                //         shortcut: 'Ctrl + S',
                //         onclick: function () {
                //             obj.download(true);
                //         }
                //     });
                // }

                return items;
            }.bind(this)
        };

        this.el = jexcel(document.getElementById("paputableDiv"), options);
        this.setState({
            loading: false
        })
    }

    componentDidMount() {
        // this.hideFirstComponent();
        // AuthenticationService.setupAxiosInterceptors();
        // IntegrationService.getIntegrationListAll().then(response => {
        //     if (response.status == 200) {
        //         console.log("response.data---->", response.data)

        //         this.setState({
        //             integrationList: response.data,
        //             selSource: response.data
        //         },
        //             () => {
        //                 this.buildJexcel()
        //             })

        //     }
        //     else {
        //         this.setState({
        //             message: response.data.messageCode, loading: false
        //         },
        //             () => {
        //                 this.hideSecondComponent();
        //             })
        //     }

        // })
        //     .catch(
        //         error => {
        //             if (error.message === "Network Error") {
        //                 this.setState({
        //                     message: 'static.unkownError',
        //                     loading: false
        //                 });
        //             } else {
        //                 switch (error.response ? error.response.status : "") {

        //                     case 401:
        //                         this.props.history.push(`/login/static.message.sessionExpired`)
        //                         break;
        //                     case 403:
        //                         this.props.history.push(`/accessDenied`)
        //                         break;
        //                     case 500:
        //                     case 404:
        //                     case 406:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             loading: false
        //                         });
        //                         break;
        //                     case 412:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             loading: false
        //                         });
        //                         break;
        //                     default:
        //                         this.setState({
        //                             message: 'static.unkownError',
        //                             loading: false
        //                         });
        //                         break;
        //                 }
        //             }
        //         }
        //     );

        let templist = [
            {
                "createdBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "createdDate": "2020-02-25 12:00:00",
                "lastModifiedBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "lastModifiedDate": "2020-02-25 12:00:00",
                "active": true,
                "scaleUpTypeId": 1,
                "label": {
                    "createdBy": null,
                    "createdDate": null,
                    "lastModifiedBy": null,
                    "lastModifiedDate": null,
                    "active": true,
                    "labelId": 126,
                    "label_en": "Constant (m c)",
                    "label_sp": "",
                    "label_fr": "",
                    "label_pr": ""
                }
            },
            {
                "createdBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "createdDate": "2020-02-25 12:00:00",
                "lastModifiedBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "lastModifiedDate": "2020-02-25 12:00:00",
                "active": true,
                "scaleUpTypeId": 1,
                "label": {
                    "createdBy": null,
                    "createdDate": null,
                    "lastModifiedBy": null,
                    "lastModifiedDate": null,
                    "active": true,
                    "labelId": 126,
                    "label_en": "Incremental (m c)",
                    "label_sp": "",
                    "label_fr": "",
                    "label_pr": ""
                }
            },
            {
                "createdBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "createdDate": "2020-02-25 12:00:00",
                "lastModifiedBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "lastModifiedDate": "2020-02-25 12:00:00",
                "active": true,
                "scaleUpTypeId": 1,
                "label": {
                    "createdBy": null,
                    "createdDate": null,
                    "lastModifiedBy": null,
                    "lastModifiedDate": null,
                    "active": true,
                    "labelId": 126,
                    "label_en": "Linear growth (m c)",
                    "label_sp": "",
                    "label_fr": "",
                    "label_pr": ""
                }
            }
        ];
        this.setState({
            scaleUpTypeList: templist,
            selSource: templist
        },
            () => {
                this.buildJexcel()
            })
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

        // if (x == 2 && !isNaN(rowData[2]) && rowData[2].toString().indexOf('.') != -1) {
        //     // console.log("RESP---------", parseFloat(rowData[2]));
        //     elInstance.setValueFromCoords(2, y, parseFloat(rowData[2]), true);
        // }
        this.el.setValueFromCoords(4, y, 1, true);

    }
    addRow = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = 1;

        this.el.insertRow(
            data, 0, 1
        );
    };

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`G${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    (instance.jexcel).setValueFromCoords(0, data[i].y, this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en, true);
                    (instance.jexcel).setValueFromCoords(5, data[i].y, this.props.match.params.realmCountryId, true);
                    (instance.jexcel).setValueFromCoords(6, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(7, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }

    formSubmit = function () {

        var validation = this.checkValidation();
        // if (validation == true && duplicateValidation == true) {
        //     var tableJson = this.el.getJson(null, false);
        //     console.log("tableJson---", tableJson);
        //     let changedpapuList = [];
        //     for (var i = 0; i < tableJson.length; i++) {
        //         var map1 = new Map(Object.entries(tableJson[i]));
        //         console.log("7 map---" + map1.get("7"))
        //         if (parseInt(map1.get("7")) === 1) {
        //             let json = {
        //                 label: {
        //                     label_en: map1.get("1"),
        //                 },
        //                 // capacityCbm: map1.get("2").replace(",", ""),
        //                 // capacityCbm: map1.get("2").replace(/,/g, ""),
        //                 // capacityCbm: this.el.getValueFromCoords(2, i).replace(/,/g, ""),
        //                 capacityCbm: this.el.getValue(`C${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
        //                 gln: (map1.get("3") === '' ? null : map1.get("3")),
        //                 active: map1.get("4"),
        //                 realmCountry: {
        //                     realmCountryId: parseInt(map1.get("5"))
        //                 },
        //                 regionId: parseInt(map1.get("6"))
        //             }
        //             changedpapuList.push(json);
        //         }
        //     }
        //     console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
        //     RegionService.editRegionsForcountry(changedpapuList)
        //         .then(response => {
        //             console.log(response.data);
        //             if (response.status == "200") {
        //                 console.log(response);
        //                 this.props.history.push(`/realmCountry/listRealmCountry/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
        //             } else {
        //                 this.setState({
        //                     message: response.data.messageCode
        //                 },
        //                     () => {
        //                         this.hideSecondComponent();
        //                     })
        //             }

        //         })
        //         .catch(
        //             error => {
        //                 if (error.message === "Network Error") {
        //                     this.setState({
        //                         message: 'static.unkownError',
        //                         loading: false
        //                     });
        //                 } else {
        //                     switch (error.response ? error.response.status : "") {

        //                         case 401:
        //                             this.props.history.push(`/login/static.message.sessionExpired`)
        //                             break;
        //                         case 403:
        //                             this.props.history.push(`/accessDenied`)
        //                             break;
        //                         case 500:
        //                         case 404:
        //                         case 406:
        //                             this.setState({
        //                                 // message: error.response.data.messageCode,
        //                                 message: i18n.t('static.region.duplicateGLN'),
        //                                 loading: false
        //                             },
        //                                 () => {
        //                                     this.hideSecondComponent();
        //                                 })
        //                             break;
        //                         case 412:
        //                             this.setState({
        //                                 message: error.response.data.messageCode,
        //                                 loading: false
        //                             },
        //                                 () => {
        //                                     this.hideSecondComponent();
        //                                 })
        //                             break;
        //                         default:
        //                             this.setState({
        //                                 message: 'static.unkownError',
        //                                 loading: false
        //                             });
        //                             break;
        //                     }
        //                 }
        //             }
        //         );
        // } else {
        //     console.log("Something went wrong");
        // }
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        // tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        // tr.children[3].classList.add('AsteriskTheadtrTd');
    }
    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {

        //Forecast Method
        if (x == 1) {
            var budgetRegx = /^\S+(?: \S+)*$/;
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(budgetRegx.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.spacetext'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }



    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        console.log("------------onedit called")
        this.el.setValueFromCoords(4, y, 1, true);
    }.bind(this);

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(7, y);
            if (parseInt(value) == 1) {
                //Region
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(budgetRegx.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.spacetext'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }


            }
        }
        return valid;
    }


    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Card>
                        <CardBody className="p-0">

                            <Col xs="12" sm="12">

                                <div id="paputableDiv" style={{ display: this.state.loading ? "none" : "block" }}>
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

                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>
                                &nbsp;
</FormGroup>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        )
    }
    cancelClicked() {
        this.props.history.push(`/realmCountry/listRealmCountry/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}

export default ScaleUpType


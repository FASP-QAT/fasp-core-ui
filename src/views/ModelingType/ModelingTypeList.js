import React, { Component } from "react";
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form

} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
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
import ModelingTypeService from "../../api/ModelingTypeService";
import { Prompt } from 'react-router';
import { JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM, API_URL } from "../../Constants";

const entityname = i18n.t('static.modelingType.modelingType')


class ScaleUpType extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scaleUpTypeList: [],
            message: '',
            selSource: [],
            loading: true,
            isChanged: false
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
        this.getModelingTypeData = this.getModelingTypeData.bind(this);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];

        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {

                data = [];
                data[0] = papuList[j].modelingTypeId
                data[1] = getLabelText(papuList[j].label, this.state.lang)
                data[2] = papuList[j].active
                data[3] = papuList[j].lastModifiedBy.username;
                data[4] = (papuList[j].lastModifiedDate ? moment(papuList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
                data[5] = 0;
                data[6] = 0;
                papuDataArr[count] = data;
                count++;
            }
        }

        if (papuDataArr.length == 0) {
            data = [];
            data[0] = 0;
            data[1] = "";
            data[2] = true
            data[3] = "";
            data[4] = "";
            data[5] = 1;
            data[6] = 1;
            papuDataArr[0] = data;
        }

        this.el = jexcel(document.getElementById("paputableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("paputableDiv"), true);

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
                    // title: 'A',
                    // type: 'text',
                    // visible: false,
                    readOnly: true
                },
                {
                    title: i18n.t('static.modelingType.modelingType'),
                    type: 'text',
                    // readOnly: true
                    textEditor: true,
                },
                {
                    title: i18n.t('static.checkbox.active'),
                    type: 'checkbox',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_MODELING_TYPE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE')) ? false : true)
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
                    // title: 'A',
                    // type: 'text',
                    // visible: false
                },
                {
                    title: 'addNewRow',
                    type: 'hidden'
                    // title: 'A',
                    // type: 'text',
                    // visible: false
                }


            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    //left align
                    elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');

                    var rowData = elInstance.getRowData(y);
                    var addRowId = rowData[6];
                    // console.log("addRowId------>", addRowId);
                    if (addRowId == 1) {//active grade out
                        var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`C${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    }


                }
            },
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            // tableOverflow: true,
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
            // onpaste: this.onPaste,
            oneditionend: this.oneditionend,
            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            onload: this.loaded,
            editable: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_MODELING_TYPE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE')) ? true : false),
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                //Add consumption batch info


                if (y == null) {

                } else {

                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        if (obj.getRowData(y)[0] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
                            // Line
                            // items.push({ type: 'line' });
                        }
                    }
                }

                return items;
            }.bind(this)
        };

        this.el = jexcel(document.getElementById("paputableDiv"), options);
        this.setState({
            loading: false
        })
    }

    getModelingTypeData() {
        this.hideSecondComponent();
        ModelingTypeService.getModelingTypeList().then(response => {
            if (response.status == 200) {
                // console.log("response.data---->", response.data)

                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                this.setState({
                    scaleUpTypeList: listArray,
                    selSource: listArray,
                },
                    () => {
                        this.buildJexcel()
                    })

            }
            else {
                this.setState({
                    message: response.data.messageCode, loading: false, color: "#BA0C2F",
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }

        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false,
                            color: "#BA0C2F",
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
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                        }
                    }
                }
            );

        // let templist = [
        //     {
        //         "createdBy": {
        //             "userId": 1,
        //             "username": "Anchal C"
        //         },
        //         "createdDate": "2020-02-25 12:00:00",
        //         "lastModifiedBy": {
        //             "userId": 1,
        //             "username": "Anchal C"
        //         },
        //         "lastModifiedDate": "2020-02-25 12:00:00",
        //         "active": true,
        //         "scaleUpTypeId": 1,
        //         "label": {
        //             "createdBy": null,
        //             "createdDate": null,
        //             "lastModifiedBy": null,
        //             "lastModifiedDate": null,
        //             "active": true,
        //             "labelId": 126,
        //             "label_en": "Target(#)",
        //             "label_sp": "",
        //             "label_fr": "",
        //             "label_pr": ""
        //         }
        //     },
        //     {
        //         "createdBy": {
        //             "userId": 1,
        //             "username": "Anchal C"
        //         },
        //         "createdDate": "2020-02-25 12:00:00",
        //         "lastModifiedBy": {
        //             "userId": 1,
        //             "username": "Anchal C"
        //         },
        //         "lastModifiedDate": "2020-02-25 12:00:00",
        //         "active": true,
        //         "scaleUpTypeId": 1,
        //         "label": {
        //             "createdBy": null,
        //             "createdDate": null,
        //             "lastModifiedBy": null,
        //             "lastModifiedDate": null,
        //             "active": true,
        //             "labelId": 126,
        //             "label_en": "Linear (#)",
        //             "label_sp": "",
        //             "label_fr": "",
        //             "label_pr": ""
        //         }
        //     },
        //     {
        //         "createdBy": {
        //             "userId": 1,
        //             "username": "Anchal C"
        //         },
        //         "createdDate": "2020-02-25 12:00:00",
        //         "lastModifiedBy": {
        //             "userId": 1,
        //             "username": "Anchal C"
        //         },
        //         "lastModifiedDate": "2020-02-25 12:00:00",
        //         "active": true,
        //         "scaleUpTypeId": 1,
        //         "label": {
        //             "createdBy": null,
        //             "createdDate": null,
        //             "lastModifiedBy": null,
        //             "lastModifiedDate": null,
        //             "active": true,
        //             "labelId": 126,
        //             "label_en": "Linear (%)",
        //             "label_sp": "",
        //             "label_fr": "",
        //             "label_pr": ""
        //         },
        //     },
        //     {
        //         "createdBy": {
        //             "userId": 1,
        //             "username": "Anchal C"
        //         },
        //         "createdDate": "2020-02-25 12:00:00",
        //         "lastModifiedBy": {
        //             "userId": 1,
        //             "username": "Anchal C"
        //         },
        //         "lastModifiedDate": "2020-02-25 12:00:00",
        //         "active": true,
        //         "scaleUpTypeId": 1,
        //         "label": {
        //             "createdBy": null,
        //             "createdDate": null,
        //             "lastModifiedBy": null,
        //             "lastModifiedDate": null,
        //             "active": true,
        //             "labelId": 126,
        //             "label_en": "Exponential (%)",
        //             "label_sp": "",
        //             "label_fr": "",
        //             "label_pr": ""
        //         },
        //     }
        // ];
        // this.setState({
        //     scaleUpTypeList: templist,
        //     selSource: templist
        // },
        //     () => {
        //         this.buildJexcel()
        //     })
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.isChanged == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

    componentDidMount() {
        this.getModelingTypeData();
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);

        // if (x == 2 && !isNaN(rowData[2]) && rowData[2].toString().indexOf('.') != -1) {
        // console.log("RESP---------", parseFloat(rowData[2]));
        //     elInstance.setValueFromCoords(2, y, parseFloat(rowData[2]), true);
        // }
        this.el.setValueFromCoords(5, y, 1, true);

    }
    addRow = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = true
        data[3] = "";
        data[4] = "";
        data[5] = 1;
        data[6] = 1;

        this.el.insertRow(
            data, 0, 1
        );
    };

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`G${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(0, data[i].y, 0, true);
                    (instance).setValueFromCoords(2, data[i].y, true, true);
                    (instance).setValueFromCoords(5, data[i].y, 1, true);
                    (instance).setValueFromCoords(6, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }

    formSubmit = function () {

        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({ loading: true })
            var tableJson = this.el.getJson(null, false);
            // console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                // console.log("5 map---" + map1.get("5"))
                if (parseInt(map1.get("5")) === 1) {
                    let json = {
                        modelingTypeId: parseInt(map1.get("0")),
                        label: {
                            label_en: map1.get("1"),
                        },
                        active: map1.get("2"),
                        // capacityCbm: map1.get("2").replace(",", ""),
                        // capacityCbm: map1.get("2").replace(/,/g, ""),
                        // capacityCbm: this.el.getValueFromCoords(2, i).replace(/,/g, ""),
                        // capacityCbm: this.el.getValue(`C${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        // gln: (map1.get("3") === '' ? null : map1.get("3")),
                        // active: map1.get("4"),
                        // realmCountry: {
                        //     realmCountryId: parseInt(map1.get("5"))
                        // },
                        // regionId: parseInt(map1.get("6"))
                    }
                    changedpapuList.push(json);
                }
            }
            // console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            ModelingTypeService.addUpdateModelingType(changedpapuList)
                .then(response => {
                    // console.log(response.data);
                    if (response.status == "200") {
                        // console.log(response);
                        // this.props.history.push(`/realmCountry/listRealmCountry/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                        this.setState({
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), color: 'green', isChanged: false
                        },
                            () => {
                                this.hideSecondComponent();
                                this.getModelingTypeData();
                            })
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            color: "#BA0C2F", loading: false
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }

                })
                .catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                color: "#BA0C2F", loading: false
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
                                        // message: error.response.data.messageCode,
                                        message: i18n.t('static.region.duplicateGLN'),
                                        color: "#BA0C2F", loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        color: "#BA0C2F", loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        color: "#BA0C2F", loading: false
                                    });
                                    break;
                            }
                        }
                    }
                );
        } else {
            // console.log("Something went wrong");
        }
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        // var asterisk = document.getElementsByClassName("resizable")[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;

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

        this.setState({
            isChanged: true,
        });

        //Active
        if (x != 5) {
            this.el.setValueFromCoords(5, y, 1, true);
        }



    }.bind(this);
    // -----end of changed function

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        // console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(5, y);
            if (parseInt(value) == 1) {
                //Region
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                // console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                    this.setState({
                        message: i18n.t('static.supplyPlan.validationFailed'),
                        color: 'red'
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                } else {
                    if (!(budgetRegx.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.spacetext'));
                        valid = false;
                        this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
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
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.isChanged == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
                <AuthenticationServiceComponent history={this.props.history} />
                {/* <h5 style={{ color: "red" }}>{i18n.t('static.common.customWarningMessage')}</h5> */}
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                {/* <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5> */}
                <h5 style={{ color: this.state.color }} id="div2">{this.state.message}</h5>
                <Card>
                    <CardBody className="p-0">

                        <Col xs="12" sm="12">
                            {/* <h5 className="red">{i18n.t('static.common.customWarningMessage')}</h5> */}
                            {/* <h5>{i18n.t("static.placeholder.modelingType")}</h5> */}
                            <div id="paputableDiv" style={{ display: this.state.loading ? "none" : "block", marginTop: '-13px' }} className={(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_MODELING_TYPE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE')) ? "RowClickable" : "jexcelremoveReadonlybackground"}>
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
                        {(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_MODELING_TYPE')) &&
                            <FormGroup>
                                {/* <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button> */}
                                {this.state.isChanged &&
                                    <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                }
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE') &&
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> {i18n.t('static.common.addRow')}</Button>
                                }
                                &nbsp;
                            </FormGroup>
                        }
                    </CardFooter>
                </Card>

            </div>
        )
    }
    cancelClicked() {
        this.props.history.push(`/realmCountry/listRealmCountry/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}

export default ScaleUpType


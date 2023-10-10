import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from "react";
import { Prompt } from 'react-router';
import {
    Button,
    Card, CardBody,
    CardFooter,
    Col,
    FormGroup
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
import ModelingTypeService from "../../api/ModelingTypeService";
import i18n from '../../i18n';
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
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
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
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
                    readOnly: true
                },
                {
                    title: i18n.t('static.modelingType.modelingType'),
                    type: 'text',
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
                },
                {
                    title: 'addNewRow',
                    type: 'hidden'
                }
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
                    var rowData = elInstance.getRowData(y);
                    var addRowId = rowData[6];
                    if (addRowId == 1) {
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
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            oneditionend: this.oneditionend,
            onload: this.loaded,
            editable: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_MODELING_TYPE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE')) ? true : false),
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y == null) {
                } else {
                    if (obj.options.allowDeleteRow == true) {
                        if (obj.getRowData(y)[0] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
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
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
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
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("5")) === 1) {
                    let json = {
                        modelingTypeId: parseInt(map1.get("0")),
                        label: {
                            label_en: map1.get("1"),
                        },
                        active: map1.get("2"),
                    }
                    changedpapuList.push(json);
                }
            }
            ModelingTypeService.addUpdateModelingType(changedpapuList)
                .then(response => {
                    if (response.status == "200") {
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
        }
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
    }
    changed = function (instance, cell, x, y, value) {
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
        if (x != 5) {
            this.el.setValueFromCoords(5, y, 1, true);
        }
    }.bind(this);
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(5, y);
            if (parseInt(value) == 1) {
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
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
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: this.state.color }} id="div2">{this.state.message}</h5>
                <Card>
                    <CardBody className="p-0">
                        <Col xs="12" sm="12">
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
                                {this.state.isChanged &&
                                    <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                }
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_MODELING_TYPE') &&
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>
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

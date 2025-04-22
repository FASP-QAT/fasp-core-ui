import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
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
import { checkValidation, changed, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
import ForecastMethodService from "../../api/ForecastMethodService";
import RealmService from "../../api/RealmService";
import i18n from '../../i18n';
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.forecastMethod.forecastMethod')
/**
 * Component for forecast method.
 */
class forecastMethod extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forecastMethodList: [],
            message: '',
            selSource: [],
            realms: [],
            loading: true,
            forecastMethodTypeList: [],
            isChanged: false,
            lang: localStorage.getItem('lang')
        }
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.getForecastMethodData = this.getForecastMethodData.bind(this);
        this.getForecastMethodTypeList = this.getForecastMethodTypeList.bind(this);
    }
    /**
     * This function is triggered when this component is about to unmount
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }
    /**
     * This function is trigged when this component is updated and is being used to display the warning for leaving unsaved changes
     */
    componentDidUpdate = () => {
        if (this.state.isChanged == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
   * Builds the jexcel component to display forecast method list.
   */
    buildJexcel() {
        const { realms } = this.state;
        let realmList = [];
        if (realms.length > 0) {
            for (var i = 0; i < realms.length; i++) {
                var paJson = {
                    name: getLabelText(realms[i].label, this.state.lang),
                    id: parseInt(realms[i].realmId),
                    active: realms[i].active
                }
                realmList[i] = paJson
            }
        }
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                data = [];
                data[0] = papuList[j].forecastMethodId
                data[1] = papuList[j].forecastMethodTypeId
                data[2] = getLabelText(papuList[j].label, this.state.lang)
                data[3] = papuList[j].active
                data[4] = papuList[j].lastModifiedBy.username;
                data[5] = (papuList[j].lastModifiedDate ? moment(papuList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
                data[6] = papuList[j].forecastMethodTypeId
                data[7] = 0
                data[8] = 0
                papuDataArr[count] = data;
                count++;
            }
        }
        if (papuDataArr.length == 0) {
            data = [];
            data[0] = 0;
            data[1] = "";
            data[2] = "";
            data[3] = true;
            data[4] = "";
            data[5] = "";
            data[6] = 0;
            data[7] = 1;
            data[8] = 1;
            papuDataArr[0] = data;
        }
        this.el = jexcel(document.getElementById("paputableDiv"), '');
        jexcel.destroy(document.getElementById("paputableDiv"), true);
        var data = papuDataArr;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 100, 100, 100, 100],
            columns: [
                {
                    title: 'forecastMethodId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.forecastMethod.methodology'),
                    type: 'dropdown',
                    source: this.state.forecastMethodTypeList,
                    required: true
                    // source: [
                    //     { id: 1, name: i18n.t('static.forecastMethod.historicalData') },
                    //     { id: 2, name: i18n.t('static.forecastMethod.tree') }
                    // ]
                },
                {
                    title: i18n.t('static.forecastMethod.forecastMethod'),
                    type: 'text',
                    textEditor: true,
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t('static.validSpace.string')
                    }
                },
                {
                    title: i18n.t('static.checkbox.active'),
                    type: 'checkbox',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FORECAST_METHOD') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_FORECAST_METHOD')) ? false : true)
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
                    title: 'forecastMethodTypeId',
                    type: 'hidden'
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
                    var forecastMethodId = rowData[6];
                    if (forecastMethodId == 0) {
                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.remove('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    }
                    var addRowId = rowData[8];
                    if (addRowId == 1) {
                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
                        cell1.classList.add('readonly');
                    } else {
                        var cell1 = elInstance.getCell(`D${parseInt(y) + 1}`)
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
            license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false,
            editable: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FORECAST_METHOD') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_FORECAST_METHOD')) ? true : false),
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
    /**
     * Reterives forecast method type list from server
     */
    getForecastMethodTypeList() {
        ForecastMethodService.getForecastMethodTypeList().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].label, this.state.lang),
                            id: parseInt(listArray[i].id),
                            active: listArray[i].active,
                        }
                        tempList[i] = paJson
                    }
                }
                this.setState({
                    forecastMethodTypeList: tempList,
                },
                    () => {
                        this.getForecastMethodData();
                    })
            }
            else {
                this.setState({
                    message: response.data.messageCode, loading: false, color: "#BA0C2F",
                },
                    () => {
                        hideSecondComponent();
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
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
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
    /**
     * Reterives Realm and Forecast method list from server
     */
    getForecastMethodData() {
        RealmService.getRealmListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    realms: listArray
                }, () => {
                    this.buildJexcel();
                });
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
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
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
        hideSecondComponent();
        ForecastMethodService.getForecastMethodList().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    forecastMethodList: listArray,
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
                        hideSecondComponent();
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
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
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
    /**
     * Calls getForecastMethodTypeList function on component mount
     */
    componentDidMount() {
        this.getForecastMethodTypeList();
    }
    /**
     * Callback function called when editing of a cell in the jexcel table ends.
     * @param {object} instance - The jexcel instance.
     * @param {object} cell - The cell object.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @param {any} value - The new value of the cell.
     */
    oneditionend = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(7, y, 1, true);
    }
    /**
     * Function to add a new row to the jexcel table.
     */
    addRow = function () {
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = true;
        data[4] = "";
        data[5] = "";
        data[6] = 0;
        data[7] = 1;
        data[8] = 1;
        this.el.insertRow(
            data, 0, 1
        );
    };
    /**
     * Function to handle form submission and save the data on server.
     */
    formSubmit = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({ loading: true })
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("7")) === 1) {
                    let json = {
                        forecastMethodId: parseInt(map1.get("0")),
                        label: {
                            label_en: map1.get("2"),
                        },
                        forecastMethodTypeId: parseInt(map1.get("1")),
                        active: map1.get("3"),
                    }
                    changedpapuList.push(json);
                }
            }
            ForecastMethodService.addUpdateForecastMethod(changedpapuList)
                .then(response => {
                    if (response.status == "200") {
                        this.setState({
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), color: 'green', isChanged: false
                        },
                            () => {
                                hideSecondComponent();
                                this.getForecastMethodData();
                            })
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            color: "#BA0C2F", loading: false
                        },
                            () => {
                                hideSecondComponent();
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
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
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
                                            hideSecondComponent();
                                        })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        color: "#BA0C2F", loading: false
                                    },
                                        () => {
                                            hideSecondComponent();
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
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
    }
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed = function (instance, cell, x, y, value) {

        changed(instance, cell, x, y, value)

        //Active
        if (x != 7) {
            this.el.setValueFromCoords(7, y, 1, true);
        }
        this.setState({
            isChanged: true,
        });
    }.bind(this);
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(7, y);
            if (parseInt(value) == 1) {
                valid = checkValidation(this.el);
                if(!valid){
                    this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                        () => {
                            hideSecondComponent();
                        })
                }
            }
        }
        return valid;
    }
    /**
     * Renders the forecast method list.
     * @returns {JSX.Element} - Forecast method list.
     */
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
                            <h5>{i18n.t("static.placeholder.forecastMethod")}</h5>
                            <div className="consumptionDataEntryTable">
                                <div id="paputableDiv" style={{ display: this.state.loading ? "none" : "block", marginTop: '-13px' }} className={(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FORECAST_METHOD') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_FORECAST_METHOD')) ? "RowClickable" : "jexcelremoveReadonlybackground"}>
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
                        </Col>
                    </CardBody>
                    <CardFooter>
                        {(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_FORECAST_METHOD') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FORECAST_METHOD')) &&
                            <FormGroup>
                                {this.state.isChanged &&
                                    <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                }
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_FORECAST_METHOD') &&
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
}
export default forecastMethod

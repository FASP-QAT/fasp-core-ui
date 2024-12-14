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
import { checkValidation, changed, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
import UsagePeriodService from "../../api/UsagePeriodService";
import i18n from '../../i18n';
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const entityname = i18n.t('static.usagePeriod.usagePeriod')
/**
 * This component is used to display usage period list 
 */
class UsagePeriod extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usagePeriodList: [],
            message: '',
            selSource: [],
            loading: true,
            isChanged: false,
            lang: localStorage.getItem('lang')
        }
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.getUsagePeriodData = this.getUsagePeriodData.bind(this);
    }
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to build the jexcel table for usage period
     */
    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                data = [];
                data[0] = papuList[j].usagePeriodId
                data[1] = getLabelText(papuList[j].label, this.state.lang)
                data[2] = papuList[j].convertToMonth
                data[3] = papuList[j].active
                data[4] = papuList[j].lastModifiedBy.username;
                data[5] = (papuList[j].lastModifiedDate ? moment(papuList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
                data[6] = 0
                data[7] = 0
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
            data[6] = 1;
            data[7] = 1;
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
                    title: 'usagePeriodId',
                    type: 'hidden',
                    // title: 'A',
                    // type: 'text',
                    // visible: false,
                    readOnly: true
                },
                {
                    title: i18n.t('static.usagePeriod.usagePeriod'),
                    type: 'text',
                    textEditor: true,
                    required: true,
                    regex: {
                        ex: /^\S+(?: \S+)*$/,
                        text: i18n.t('static.message.spacetext')
                    }
                },
                {
                    title: i18n.t('static.usagePeriod.conversionFactor'),
                    // type: 'text',
                    type: 'numeric', mask: '#,##.00000000', decimal: '.',
                    // readOnly: true
                    // textEditor: true,
                    required: true,
                    number:true, //i18n.t('static.program.validvaluetext')
                    regex: {
                        ex: /^\d{1,5}(\.\d{1,8})?$/,
                        text: i18n.t('static.usagePeriod.conversionFactorTestString')
                    }
                },
                {
                    title: i18n.t('static.checkbox.active'),
                    type: 'checkbox',
                    readOnly: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_PERIOD') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_USAGE_PERIOD')) ? false : true)
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
                },
            ],
            updateTable: function (el, cell, x, y, source, value, id) {
                if (y != null) {
                    var elInstance = el;
                    elInstance.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');
                    var rowData = elInstance.getRowData(y);
                    var addRowId = rowData[7];
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
            tableOverflow: true,
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
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
            editable: ((AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_PERIOD') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_USAGE_PERIOD')) ? true : false),
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
     * This component is used to get the usage period data
     */
    getUsagePeriodData() {
        this.hideSecondComponent();
        UsagePeriodService.getUsagePeriodList().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    usagePeriodList: listArray,
                    selSource: listArray
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
     * This function is used to call the usage period data function on component load
     */
    componentDidMount() {
        this.getUsagePeriodData();
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
     * This function is used when the editing for a particular cell is completed to format the cell or to update the value
     * @param {*} instance This is the sheet where the data is being updated
     * @param {*} cell This is the value of the cell whose value is being updated
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);
        if (x == 2 && !isNaN(rowData[2]) && rowData[2].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(2, y, parseFloat(rowData[2]), true);
        }
        this.el.setValueFromCoords(6, y, 1, true);
    }
    /**
     * This function is called when user clicks on add row button add the usage period row in table
     */
    addRow = function () {
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = true;
        data[4] = "";
        data[5] = "";
        data[6] = 1;
        data[7] = 1;
        this.el.insertRow(
            data, 0, 1
        );
    };
    /**
     * This function is called when submit button of the usage period is clicked and is used to save usage periods if all the data is successfully validated.
     */
    formSubmit = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({ loading: true })
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("6")) === 1) {
                    let json = {
                        usagePeriodId: parseInt(map1.get("0")),
                        label: {
                            label_en: map1.get("1"),
                        },
                        convertToMonth: this.el.getValue(`C${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        active: map1.get("3"),
                    }
                    changedpapuList.push(json);
                }
            }
            UsagePeriodService.addUpdateUsagePeriod(changedpapuList)
                .then(response => {
                    if (response.status == "200") {
                        this.setState({
                            message: i18n.t('static.usagePeriod.addUpdateMessage'), color: 'green', isChanged: false
                        },
                            () => {
                                this.hideSecondComponent();
                                this.getUsagePeriodData();
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
                                        color: "#BA0C2F",
                                        loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: "#BA0C2F",
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
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
        } else {
        }
    }
    /**
     * This function is used to format the usage period table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
    }
    /**
     * This function is called when something in the usage period table is changed to add the validations or fill some auto values for the cells
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    changed = function (instance, cell, x, y, value) {

        changed(instance, cell, x, y, value)

        this.setState({
            isChanged: true,
        });
        if (x != 6) {
            this.el.setValueFromCoords(6, y, 1, true);
        }
    }.bind(this);
    /**
     * This function is called before saving the usage period to check validations for all the rows that are available in the table
     * @returns This functions return true or false. It returns true if all the data is sucessfully validated. It returns false if some validation fails.
     */
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(6, y);
            if (parseInt(value) == 1) {
                valid = checkValidation(this.el);
                if(!valid){
                    this.setState({
                            message: i18n.t('static.supplyPlan.validationFailed'),
                            color: 'red'
                        },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            }
        }
        return valid;
    }
    /**
     * This is used to display the content
     * @returns This returns usage period table
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
                                                        <h5>{i18n.t("static.placeholder.usagePeriod")}</h5>
                            <div className="consumptionDataEntryTable">
                                <div id="paputableDiv" style={{ display: this.state.loading ? "none" : "block" }} className={(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_PERIOD') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_USAGE_PERIOD')) ? "RowClickable" : "jexcelremoveReadonlybackground"}>
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
                        {(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_USAGE_PERIOD') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_USAGE_PERIOD')) &&
                            <FormGroup>
                                                                {this.state.isChanged &&
                                    <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                }
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_USAGE_PERIOD') &&
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}>{i18n.t('static.common.addRow')}</Button>
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
export default UsagePeriod

import jexcel from 'jspreadsheet';
import React, { Component } from "react";
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
import { API_URL, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
import RealmCountryService from "../../api/RealmCountryService";
import RegionService from "../../api/RegionService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
let initialValues = {
    region: '',
    capacityCBM: '',
    label: '',
    gln: '',
}
const entityname = i18n.t('static.dashboad.regioncountry')
class RealmCountryRegion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            units: [],
            lang: localStorage.getItem('lang'),
            regionCountry: {},
            regions: [],
            regionId: '',
            realmCountry: {
                realmCountryId: '',
                country: {
                    countryId: '',
                    label: {
                        label_en: ''
                    }
                },
                realm: {
                    realmId: '',
                    label: {
                        label_en: ''
                    }
                }
            },
            label: {
                label_en: ''
            },
            capacityCbm: '',
            gln: '',
            rows: [], isNew: true,
            updateRowStatus: 0,
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicateRegion = this.checkDuplicateRegion.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    componentDidMount() {
        RegionService.getRegionForCountryId(this.props.match.params.realmCountryId).then(response => {
            if (response.status == 200) {
                let myResponse = response.data;
                if (myResponse.length > 0) {
                    this.setState({ rows: myResponse });
                }
                RealmCountryService.getRealmCountryById(this.props.match.params.realmCountryId).then(response => {
                    if (response.status == 200) {
                        this.setState({
                            realmCountry: response.data
                        })
                        var papuList = this.state.rows;
                        var data = [];
                        var papuDataArr = [];
                        var count = 0;
                        if (papuList.length != 0) {
                            for (var j = 0; j < papuList.length; j++) {
                                data = [];
                                data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                                data[1] = papuList[j].label.label_en;
                                data[2] = (papuList[j].capacityCbm);
                                data[3] = papuList[j].gln;
                                data[4] = papuList[j].active;
                                data[5] = this.props.match.params.realmCountryId;
                                data[6] = papuList[j].regionId;
                                data[7] = 0;
                                papuDataArr[count] = data;
                                count++;
                            }
                        }
                        if (papuDataArr.length == 0) {
                            data = [];
                            data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                            data[1] = "";
                            data[2] = "";
                            data[3] = "";
                            data[4] = true;
                            data[5] = this.props.match.params.realmCountryId;
                            data[6] = 0;
                            data[7] = 1;
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
                                    title: i18n.t('static.dashboard.realmcountry'),
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.program.region'),
                                    type: 'text',
                                },
                                {
                                    title: i18n.t('static.region.capacitycbm'),
                                    type: 'numeric',
                                    textEditor: true,
                                    decimal: '.',
                                    mask: '#,##.00',
                                    disabledMaskOnEdition: true
                                },
                                {
                                    title: i18n.t('static.region.gln'),
                                    type: 'number',
                                    textEditor: true,
                                },
                                {
                                    title: i18n.t('static.checkbox.active'),
                                    type: 'checkbox'
                                },
                                {
                                    title: 'realmCountryId',
                                    type: 'hidden'
                                },
                                {
                                    title: 'regionId',
                                    type: 'hidden'
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
                            onpaste: this.onPaste,
                            oneditionend: this.oneditionend,
                            onload: this.loaded,
                            license: JEXCEL_PRO_KEY,
                            contextMenu: function (obj, x, y, e) {
                                var items = [];
                                if (y == null) {
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
                                    if (obj.options.columnSorting == true) {
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
                                    if (obj.options.allowInsertRow == true) {
                                        items.push({
                                            title: i18n.t('static.common.insertNewRowBefore'),
                                            onclick: function () {
                                                var data = [];
                                                data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                                                data[1] = "";
                                                data[2] = "";
                                                data[3] = "";
                                                data[4] = true;
                                                data[5] = this.props.match.params.realmCountryId;
                                                data[6] = 0;
                                                data[7] = 1;
                                                obj.insertRow(data, parseInt(y), 1);
                                            }.bind(this)
                                        });
                                    }
                                    if (obj.options.allowInsertRow == true) {
                                        items.push({
                                            title: i18n.t('static.common.insertNewRowAfter'),
                                            onclick: function () {
                                                var data = [];
                                                data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                                                data[1] = "";
                                                data[2] = "";
                                                data[3] = "";
                                                data[4] = true;
                                                data[5] = this.props.match.params.realmCountryId;
                                                data[6] = 0;
                                                data[7] = 1;
                                                obj.insertRow(data, parseInt(y));
                                            }.bind(this)
                                        });
                                    }
                                    if (obj.options.allowDeleteRow == true) {
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
                                    }
                                }
                                items.push({ type: 'line' });
                                return items;
                            }.bind(this)
                        };
                        this.el = jexcel(document.getElementById("paputableDiv"), options);
                        this.setState({
                            loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode
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
            } else {
                this.setState({
                    message: response.data.messageCode
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
    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);
        if (x == 2 && !isNaN(rowData[2]) && rowData[2].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(2, y, parseFloat(rowData[2]), true);
        }
        this.el.setValueFromCoords(7, y, 1, true);
    }
    addRow = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = true;
        data[5] = this.props.match.params.realmCountryId;
        data[6] = 0;
        data[7] = 1;
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
                    (instance).setValueFromCoords(0, data[i].y, this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en, true);
                    (instance).setValueFromCoords(5, data[i].y, this.props.match.params.realmCountryId, true);
                    (instance).setValueFromCoords(6, data[i].y, 0, true);
                    (instance).setValueFromCoords(7, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }
    formSubmit = function () {
        var duplicateValidation = this.checkDuplicateRegion();
        var validation = this.checkValidation();
        if (validation == true && duplicateValidation == true) {
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("7")) === 1) {
                    let json = {
                        label: {
                            label_en: map1.get("1"),
                        },
                        capacityCbm: this.el.getValue(`C${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        gln: (map1.get("3") === '' ? null : map1.get("3")),
                        active: map1.get("4"),
                        realmCountry: {
                            realmCountryId: parseInt(map1.get("5"))
                        },
                        regionId: parseInt(map1.get("6"))
                    }
                    changedpapuList.push(json);
                }
            }
            RegionService.editRegionsForcountry(changedpapuList)
                .then(response => {
                    if (response.status == "200") {
                        this.props.history.push(`/realmCountry/listRealmCountry/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                    } else {
                        this.setState({
                            message: response.data.messageCode
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
                                        message: i18n.t('static.region.duplicateGLN'),
                                        loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
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
        } else {
        }
    }
    checkDuplicateRegion = function () {
        var tableJson = this.el.getJson(null, false);
        let count = 0;
        let tempArray = tableJson;
        var hasDuplicate = false;
        tempArray.map(v => v[Object.keys(v)[1]]).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        if (hasDuplicate) {
            this.setState({
                message: i18n.t('static.region.duplicateRegion'),
                changedFlag: 0,
            },
                () => {
                    this.hideSecondComponent();
                })
            return false;
        } else {
            return true;
        }
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
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
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            value = value.replace(/,/g, "");
            if (this.el.getValueFromCoords(x, y) != "") {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
        }
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            if (this.el.getValueFromCoords(x, y) != "") {
                if (value.length > 0 && (isNaN(parseInt(value)) || !(reg.test(value)) || value.length != 13)) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    if (value.length != 13) {
                        this.el.setComments(col, i18n.t('static.region.glnvalue'));
                    } else {
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    }
                }
                else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x != 7) {
            this.el.setValueFromCoords(7, y, 1, true);
        }
    }.bind(this);
    onedit = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(7, y, 1, true);
    }.bind(this);
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(7, y);
            if (parseInt(value) == 1) {
                var budgetRegx = /^\S+(?: \S+)*$/;
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
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
                var col = ("C").concat(parseInt(y) + 1);
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                var value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                value = value.replace(/,/g, "");
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                var reg = /^[0-9\b]+$/;
                if (value != "") {
                    if (value.length > 0 && (isNaN(parseInt(value)) || !(reg.test(value)) || value.length != 13)) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        valid = false;
                        if (value.length != 13) {
                            this.el.setComments(col, i18n.t('static.region.glnvalue'));
                        } else {
                            this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        }
                    }
                    else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
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
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Card>
                        <CardBody className="p-0">
                            <Col xs="12" sm="12">
                                <div id="paputableDiv" className="consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
export default RealmCountryRegion

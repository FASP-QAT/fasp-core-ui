import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form

} from 'reactstrap';
import { Date } from 'core-js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText';
import CountryService from "../../api/CountryService";
import AuthenticationService from "../Common/AuthenticationService";
import RealmService from "../../api/RealmService";
import RealmCountryService from "../../api/RealmCountryService";
import CurrencyService from "../../api/CurrencyService";
import UnitService from "../../api/UnitService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
let initialValues = {
    defaultCurrency: {
        currencyId: '',
        label: {
            label_en: ''
        }
    },
    country: {
        countryId: '',
        label: {
            label_en: ''
        }
    }, countryName: ''
}
const entityname = i18n.t('static.dashboard.realmcountry')

class RealmCountry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            countries: [],
            currencies: [],
            units: [],
            palletUnit: {
                unitId: '',
                label: {
                    label_en: ''
                }
            },
            defaultCurrency: {
                currencyId: '',
                label: {
                    label_en: ''
                }
            },
            country: {
                countryId: '',
                label: {
                    label_en: ''
                }
            }, countryName: '',
            airFreightPercentage: '0.0',
            seaFreightPercentage: '0.0',
            shippedToArrivedByAirLeadTime: '0',
            shippedToArrivedBySeaLeadTime: '0',
            arrivedToDeliveredLeadTime: '0',
            rows: [],
            realm: {
                label: {
                    label_en: ''
                }
            }, isNew: true,
            updateRowStatus: 0,
            loading: true
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicateCountry = this.checkDuplicateCountry.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);

    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmCountryService.getRealmCountryrealmIdById(this.props.match.params.realmId).then(response => {
            if (response.status == 200) {
                console.log("getRealmCountryrealmIdById---", response.data);
                let myResponse = response.data;
                if (myResponse.length > 0) {
                    this.setState({ rows: myResponse });
                }
                RealmService.getRealmById(this.props.match.params.realmId).then(response => {
                    if (response.status == 200) {
                        console.log(response.data);
                        this.setState({
                            realm: response.data,
                            //  rows:response.data
                        })
                        CountryService.getCountryListAll()
                            .then(response => {
                                if (response.status == 200) {
                                    console.log(response.data)
                                    this.setState({
                                        countries: response.data
                                    })
                                    CurrencyService.getCurrencyListActive().then(response => {
                                        if (response.status == 200) {
                                            this.setState({
                                                currencies: response.data
                                            })
                                            const { countries } = this.state;
                                            const { currencies } = this.state;

                                            let countryArr = [];
                                            let currencyArr = [];

                                            if (countries.length > 0) {
                                                for (var i = 0; i < countries.length; i++) {
                                                    var paJson = {
                                                        name: getLabelText(countries[i].label, this.state.lang),
                                                        id: parseInt(countries[i].countryId)
                                                    }
                                                    countryArr[i] = paJson
                                                }
                                            }
                                            if (currencies.length > 0) {
                                                for (var i = 0; i < currencies.length; i++) {
                                                    var paJson = {
                                                        name: getLabelText(currencies[i].label, this.state.lang),
                                                        id: parseInt(currencies[i].currencyId)
                                                    }
                                                    currencyArr[i] = paJson
                                                }
                                            }
                                            // Jexcel starts
                                            var papuList = this.state.rows;
                                            var data = [];
                                            var papuDataArr = [];

                                            var count = 0;
                                            if (papuList.length != 0) {
                                                for (var j = 0; j < papuList.length; j++) {

                                                    data = [];
                                                    data[0] = this.state.realm.label.label_en;
                                                    data[1] = parseInt(papuList[j].country.countryId);
                                                    data[2] = parseInt(papuList[j].defaultCurrency.currencyId);
                                                    data[3] = papuList[j].active;
                                                    data[4] = this.props.match.params.realmId;
                                                    data[5] = papuList[j].realmCountryId;
                                                    data[6] = 0;
                                                    papuDataArr[count] = data;
                                                    count++;
                                                }
                                            }
                                            if (papuDataArr.length == 0) {
                                                data = [];
                                                data[0] = this.state.realm.label.label_en;
                                                data[1] = "";
                                                data[2] = "";
                                                data[3] = true;
                                                data[4] = this.props.match.params.realmId;
                                                data[5] = 0;
                                                data[6] = 1;
                                                papuDataArr[0] = data;
                                            }
                                            this.el = jexcel(document.getElementById("paputableDiv"), '');
                                            this.el.destroy();
                                            var json = [];
                                            var data = papuDataArr;
                                            var options = {
                                                data: data,
                                                columnDrag: true,
                                                colWidths: [100, 100, 100, 100],
                                                columns: [

                                                    {
                                                        title: i18n.t('static.realm.realm'),
                                                        type: 'text',
                                                        readOnly: true
                                                    },
                                                    {
                                                        title: i18n.t('static.dashboard.country'),
                                                        type: 'autocomplete',
                                                        source: countryArr

                                                    },
                                                    {
                                                        title: i18n.t('static.dashboard.currency'),
                                                        type: 'autocomplete',
                                                        source: currencyArr
                                                    },

                                                    {
                                                        title: "Is Active",
                                                        type: 'checkbox'
                                                    },
                                                    {
                                                        title: 'realmId',
                                                        type: 'hidden'
                                                    },
                                                    {
                                                        title: 'realmCountryId',
                                                        type: 'hidden'
                                                    },
                                                    {
                                                        title: 'isChange',
                                                        type: 'hidden'
                                                    }

                                                ],
                                                pagination: 10,
                                                search: true,
                                                columnSorting: true,
                                                tableOverflow: true,
                                                wordWrap: true,
                                                paginationOptions: [10, 25, 50, 100],
                                                position: 'top',
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                onchange: this.changed,
                                                onblur: this.blur,
                                                onfocus: this.focus,
                                                oneditionend: this.onedit,
                                                copyCompatibility: true,
                                                text: {
                                                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                    show: '',
                                                    entries: '',
                                                },
                                                onload: this.loaded,

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
                                } else {
                                    this.setState({
                                        message: response.data.messageCode
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }

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
            } else {
                this.setState({
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }

        })
    }
    addRow = function () {
        var json = this.el.getJson();
        var data = [];
        data[0] = this.state.realm.label.label_en;
        data[1] = "";
        data[2] = "";
        data[3] = true;
        data[4] = this.props.match.params.realmId;
        data[5] = 0;
        data[6] = 1;

        this.el.insertRow(
            data, 0, 1
        );
    };
    formSubmit = function () {
        var duplicateValidation = this.checkDuplicateCountry();
        var validation = this.checkValidation();
        if (validation == true && duplicateValidation == true) {
            var tableJson = this.el.getJson();
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("6 map---" + map1.get("6"))
                if (parseInt(map1.get("6")) === 1) {
                    let json = {
                        country: {
                            countryId: parseInt(map1.get("1"))
                        },
                        defaultCurrency: {
                            currencyId: parseInt(map1.get("2"))
                        },
                        active: map1.get("3"),
                        realm: {
                            realmId: parseInt(map1.get("4"))
                        },
                        realmCountryId: parseInt(map1.get("5"))
                    }
                    changedpapuList.push(json);
                }
            }
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            RealmCountryService.addRealmCountry(changedpapuList)
                .then(response => {
                    console.log(response.data);
                    if (response.status == "200") {
                        console.log(response);
                        this.props.history.push(`/realm/realmlist/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                    } else {
                        this.setState({
                            message: response.data.messageCode
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }

                })
        } else {
            console.log("Something went wrong");
        }
    }
    checkDuplicateCountry = function () {
        var tableJson = this.el.getJson();
        let count = 0;

        let tempArray = tableJson;
        console.log('hasDuplicate------', tempArray);

        var hasDuplicate = false;
        tempArray.map(v => v[Object.keys(v)[1]]).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        console.log('hasDuplicate', hasDuplicate);
        if (hasDuplicate) {
            this.setState({
                message: 'Duplicate Country Found',
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
    }

    blur = function (instance) {
        console.log('on blur called');
    }

    focus = function (instance) {
        console.log('on focus called');
    }
    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {

        //Country
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        //Currency
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        //Active
        if (x == 3) {
            this.el.setValueFromCoords(6, y, 1, true);
        }



    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        console.log("------------onedit called")
        this.el.setValueFromCoords(6, y, 1, true);
    }.bind(this);

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson();
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(6, y);
            if (parseInt(value) == 1) {

                //Country
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                //Currency
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        return valid;
    }
    render() {
        return (
            <div className="animated fadeIn">
                {/* <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} /> */}
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Card>
                        <CardBody className="p-0">

                            <Col xs="12" sm="12">
                                <div className="table-responsive">
                                    <div id="paputableDiv" >
                                    </div>
                                </div>
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> Add Row</Button>
                                &nbsp;
</FormGroup>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )
    }
    cancelClicked() {
        this.props.history.push(`/realm/realmlist/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}

export default RealmCountry


import React, { Component } from "react";
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form

} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from "../Common/AuthenticationService";
import RegionService from "../../api/RegionService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
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
            loading: true

        }
        // this.setTextAndValue = this.setTextAndValue.bind(this);
        // this.disableRow = this.disableRow.bind(this);
        // this.submitForm = this.submitForm.bind(this);
        // this.enableRow = this.enableRow.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicateRegion = this.checkDuplicateRegion.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        // this.Capitalize = this.Capitalize.bind(this);
        // this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this)
        // this.CapitalizeFull = this.CapitalizeFull.bind(this);
        // this.updateRow = this.updateRow.bind(this);
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
        RegionService.getRegionForCountryId(this.props.match.params.realmCountryId).then(response => {
            if (response.status == 200) {
                console.log(response.data);
                let myResponse = response.data;
                if (myResponse.length > 0) {
                    this.setState({ rows: myResponse });
                }
                RealmCountryService.getRealmCountryById(this.props.match.params.realmCountryId).then(response => {
                    if (response.status == 200) {
                        console.log(JSON.stringify(response.data))
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
                                data[2] = papuList[j].capacityCbm;
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
                        this.el.destroy();
                        var json = [];
                        var data = papuDataArr;

                        var options = {
                            data: data,
                            columnDrag: true,
                            colWidths: [100, 100, 100, 100, 100],
                            columns: [

                                {
                                    title: "Realm Country",
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: "Region",
                                    type: 'text',

                                },
                                {
                                    title: "Capacity (CBM)",
                                    type: 'numeric',
                                },
                                {
                                    title: "GLN",
                                    type: 'number',
                                },
                                {
                                    title: "Is Active",
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

    }
    addRow = function () {
        var json = this.el.getJson();
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

    formSubmit = function () {
        var duplicateValidation = this.checkDuplicateRegion();
        var validation = this.checkValidation();
        if (validation == true && duplicateValidation == true) {
            var tableJson = this.el.getJson();
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("7 map---" + map1.get("7"))
                if (parseInt(map1.get("7")) === 1) {
                    let json = {
                        label: {
                            label_en: map1.get("1"),
                        },
                        capacityCbm: map1.get("2"),
                        gln: map1.get("3"),
                        active: map1.get("4"),
                        realmCountry: {
                            realmCountryId: parseInt(map1.get("5"))
                        },
                        regionId: parseInt(map1.get("6"))
                    }
                    changedpapuList.push(json);
                }
            }
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            RegionService.editRegionsForcountry(changedpapuList)
                .then(response => {
                    console.log(response.data);
                    if (response.status == "200") {
                        console.log(response);
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
        } else {
            console.log("Something went wrong");
        }
    }
    checkDuplicateRegion = function () {
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
                message: 'Duplicate Region Found',
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
    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {

        //Region
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

        //Capacity
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }
        //GLN
        if (x == 3) {
            console.log("value.length---" + value.length);
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
            }
        }
        //Active
        if (x == 4) {
            this.el.setValueFromCoords(7, y, 1, true);
        }



    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        console.log("------------onedit called")
        this.el.setValueFromCoords(7, y, 1, true);
    }.bind(this);

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson();
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(7, y);
            if (parseInt(value) == 1) {
                //Region
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

                //Capacity
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                if (value == "" || isNaN(Number.parseFloat(value)) || value < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //GLN
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                var reg = /^[0-9\b]+$/;
                // console.log("---------VAL----------", value);
                if (value != "" && (isNaN(Number.parseFloat(value)) || value < 0 || value.length != 13)) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    }
                    else if (value.length != 13) {
                        this.el.setComments(col, i18n.t('static.region.glnvalue'));
                    }
                }
                // else if (value.length != 13) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     this.el.setComments(col, "Should be 13 digit");
                // }
                else {
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
        this.props.history.push(`/realmCountry/listRealmCountry/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}

export default RealmCountryRegion


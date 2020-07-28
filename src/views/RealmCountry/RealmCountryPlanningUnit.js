import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form, InputGroupAddon, InputGroupText, InputGroup

} from 'reactstrap';
import { Date } from 'core-js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from "../Common/AuthenticationService";
import PlanningUnitService from "../../api/PlanningUnitService";
import UnitService from "../../api/UnitService";
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
let initialValues = {

    planningUnit: {
        id: '',
        label: {
            label_en: ''
        }
    }
    , label: { label_en: '' },
    skuCode: '',
    unit: {
        unitId: '',
        label: {
            label_en: ''
        }
    },
    multiplier: '',

    // gtin: '',
    active: true


}
const entityname = i18n.t('static.dashboad.planningunitcountry')

class PlanningUnitCountry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            units: [],
            lang: localStorage.getItem('lang'),
            planningUnitCountry: {},
            planningUnits: [],
            realmCountryPlanningUnitId: '',
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
            }, realmCountryName: '',
            label: {
                label_en: ''
            },
            skuCode: '',
            multiplier: '',
            rows: [],
            planningUnit: {
                planningUnitId: '',
                label: {
                    label_en: ''
                }
            },
            unit: {
                unitId: '',
                label: {
                    label_en: ''
                }
            }, isNew: true,
            updateRowStatus: 0,
            loading: true
            // gtin:''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicatePlanningUnit = this.checkDuplicatePlanningUnit.bind(this);
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
        RealmCountryService.getPlanningUnitCountryForId(this.props.match.params.realmCountryId).then(response => {
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
                        UnitService.getUnitListAll()
                            .then(response => {
                                if (response.status == 200) {
                                    this.setState({
                                        units: response.data
                                    })
                                    PlanningUnitService.getAllPlanningUnitList()
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.setState({
                                                    planningUnits: response.data
                                                })
                                            }
                                            const { planningUnits } = this.state;
                                            const { units } = this.state;

                                            let planningUnitArr = [];
                                            let unitArr = [];

                                            if (planningUnits.length > 0) {
                                                for (var i = 0; i < planningUnits.length; i++) {
                                                    var paJson = {
                                                        name: getLabelText(planningUnits[i].label, this.state.lang),
                                                        id: parseInt(planningUnits[i].planningUnitId)
                                                    }
                                                    planningUnitArr[i] = paJson
                                                }
                                            }
                                            if (units.length > 0) {
                                                for (var i = 0; i < units.length; i++) {
                                                    var paJson = {
                                                        name: getLabelText(units[i].label, this.state.lang),
                                                        id: parseInt(units[i].unitId)
                                                    }
                                                    unitArr[i] = paJson
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
                                                    data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                                                    data[1] = parseInt(papuList[j].planningUnit.id);
                                                    data[2] = papuList[j].label.label_en;
                                                    data[3] = papuList[j].skuCode;
                                                    data[4] = parseInt(papuList[j].unit.unitId);
                                                    data[5] = papuList[j].multiplier;
                                                    data[6] = papuList[j].active;
                                                    data[7] = this.props.match.params.realmCountryId;
                                                    data[8] = papuList[j].realmCountryPlanningUnitId;
                                                    data[9] = 0;
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
                                                data[4] = "";
                                                data[5] = "";
                                                data[6] = true;
                                                data[7] = this.props.match.params.realmCountryId;
                                                data[8] = 0;
                                                data[9] = 1;
                                                papuDataArr[0] = data;
                                            }


                                            this.el = jexcel(document.getElementById("paputableDiv"), '');
                                            this.el.destroy();
                                            var json = [];
                                            var data = papuDataArr;
                                            var options = {
                                                data: data,
                                                columnDrag: true,
                                                colWidths: [100, 100, 100, 100, 100, 100, 100],
                                                columns: [

                                                    {
                                                        title: i18n.t('static.dashboard.realmcountry'),
                                                        type: 'text',
                                                        readOnly: true
                                                    },
                                                    {
                                                        title: i18n.t('static.planningunit.planningunit'),
                                                        type: 'autocomplete',
                                                        source: planningUnitArr

                                                    },
                                                    {
                                                        title: i18n.t('static.planningunit.countrysku'),
                                                        type: 'text',
                                                    },
                                                    {
                                                        title: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
                                                        type: 'text',
                                                    },
                                                    {
                                                        title: i18n.t('static.unit.unit'),
                                                        type: 'autocomplete',
                                                        source: unitArr
                                                    },
                                                    {
                                                        title: i18n.t('static.unit.multiplier'),
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
                                                        title: 'realmCountryPlanningUnitId',
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
                                                // onload: this.loaded,

                                            };

                                            this.el = jexcel(document.getElementById("paputableDiv"), options);
                                            this.setState({
                                                loading: false
                                            })



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
            else {
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
        data[4] = "";
        data[5] = "";
        data[6] = true;
        data[7] = this.props.match.params.realmCountryId;
        data[8] = 0;
        data[9] = 1;

        this.el.insertRow(
            data, 0, 1
        );
    };

    formSubmit = function () {
        var duplicateValidation = this.checkDuplicatePlanningUnit();
        var validation = this.checkValidation();
        if (validation == true && duplicateValidation == true) {
            var tableJson = this.el.getJson();
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("9 map---" + map1.get("9"))
                if (parseInt(map1.get("9")) === 1) {
                    let json = {
                        planningUnit: {
                            id: parseInt(map1.get("1"))
                        },
                        label: {
                            label_en: map1.get("2"),
                        },
                        skuCode: map1.get("3"),
                        unit: {
                            unitId: parseInt(map1.get("4"))
                        },
                        multiplier: map1.get("5"),
                        active: map1.get("6"),
                        realmCountry: {
                            id: parseInt(map1.get("7"))
                        },
                        realmCountryPlanningUnitId: parseInt(map1.get("8"))
                    }
                    changedpapuList.push(json);
                }
            }
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            RealmCountryService.editPlanningUnitCountry(changedpapuList)
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
    checkDuplicatePlanningUnit = function () {
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
                message: 'Duplicate Planning Unit Found',
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

        //Planning Unit
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

        //Country sku code
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            // var value = this.el.getValueFromCoords(2, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }


        //Sku code
        if (x == 3) {
            console.log("-----------------3--------------------");
            var col = ("D").concat(parseInt(y) + 1);
            // var value = this.el.getValueFromCoords(3, y);
            var reg = /^[a-zA-Z0-9\b]+$/;
            if (value == "") {
                console.log("-----------------blank--------------------");
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            else {
                console.log("-----------------3--------------------");
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.skucodevalid'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        //Unit
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //Multiplier
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            if (value == "" || isNaN(parseInt(value)) || !(reg.test(value))) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.message.invalidnumber'));
            }
            else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        //Active
        if (x == 6) {
            this.el.setValueFromCoords(9, y, 1, true);
        }



    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        console.log("------------onedit called")
        this.el.setValueFromCoords(9, y, 1, true);
    }.bind(this);

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson();
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(9, y);
            if (parseInt(value) == 1) {

                //Planning Unit
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

                //Country Planning Unit
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

                //Sku Code
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                var reg = /^[a-zA-Z0-9\b]+$/;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.skucodevalid'));
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                // Unit
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(4, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //Multiplier
                var col = ("F").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(5, y);
                var reg = /^[0-9\b]+$/;
                // console.log("---------VAL----------", value);
                if (value == "" || isNaN(Number.parseInt(value)) || value < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    }
                    else {
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
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

export default PlanningUnitCountry

import React, { Component } from "react";
import { Card, CardBody, CardFooter, FormGroup, Input, InputGroup, Label, Col, Button } from 'reactstrap';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { JEXCEL_INTEGER_REGEX, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from "../../Constants";
import { MultiSelect } from 'react-multi-select-component';
import CryptoJS from 'crypto-js';
import moment from 'moment';

const entityname = i18n.t('static.versionSettings.versionSettings');
class VersionSettingsComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            noOfDays: [{ id: 0, name: 'Default' }, { id: 15, name: '15' },
            { id: 16, name: '16' },
            { id: 17, name: '17' },
            { id: 18, name: '18' },
            { id: 19, name: '19' },
            { id: 20, name: '20' },
            { id: 21, name: '21' },
            { id: 22, name: '22' },
            { id: 23, name: '23' },
            { id: 24, name: '24' },
            { id: 25, name: '25' },
            { id: 26, name: '26' },
            { id: 27, name: '27' },
            { id: 28, name: '28' },
            { id: 29, name: '29' },
            { id: 30, name: '30' },
            { id: 31, name: '31' }
            ],
            isChanged: false,
            uniquePrograms: [],
            programValues: [],
            programLabels: [],
            datasetList: [],
            message: '',
            lang: localStorage.getItem('lang'),
            loading: true,
            versionTypeList: [],
            versionSettingsList: []
        }
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.getVersionTypeList = this.getVersionTypeList.bind(this);
        this.getDatasetById = this.getDatasetById.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
    }
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(12, y);
            if (parseInt(value) == 1) {
                //Start date
                var col = ("H").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(7, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var startDate = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var stopDate = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                //End date
                var col = ("J").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(9, y);
                var diff = moment(stopDate).diff(moment(startDate), 'months');
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                }
                else if (diff <= 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, 'Please enter valid date');
                    valid = false;
                }
                else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                // No of days in month

                var col = ("N").concat(parseInt(y) + 1);
                var reg = JEXCEL_INTEGER_REGEX;
                var value = this.el.getValueFromCoords(13, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                }
                else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }



                var col = ("O").concat(parseInt(y) + 1);
                var value = this.el.getValue(`O${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }


                var col = ("P").concat(parseInt(y) + 1);
                var value = this.el.getValue(`P${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }


                var col = ("Q").concat(parseInt(y) + 1);
                var value = this.el.getValue(`Q${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                // Version notes

                var col = ("E").concat(parseInt(y) + 1);
                value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                if (value != "") {
                    if (value.length > 1000) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidStringLength'));
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

    changed = function (instance, cell, x, y, value) {

        //Start date
        if (x == 7) {
            var col = ("H").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }


        var startDate = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        var stopDate = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        //End date
        if (x == 9) {
            var col = ("J").concat(parseInt(y) + 1);
            var diff = moment(stopDate).diff(moment(startDate), 'months');
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            else if (diff <= 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, 'Please enter valid date');
            }
            else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //No of days
        // if (x == 12) {
        //     var col = ("M").concat(parseInt(y) + 1);
        //     var reg = JEXCEL_INTEGER_REGEX;
        //     if (value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, i18n.t('static.label.fieldRequired'));
        //     }
        //     else if (!(reg.test(value))) {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, i18n.t('static.message.invalidnumber'));
        //     }
        //     else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }
        // }


        if (x != 12) {
            this.el.setValueFromCoords(12, y, 1, true);
            this.setState({
                isChanged: true
            })
        }


        if (x == 8 && this.el.getValueFromCoords(17, y) == 0) {//forecastPeriodInMonth
            let startDate = this.el.getValueFromCoords(7, y);
            let month = this.el.getValueFromCoords(8, y);
            console.log("startDate--------->", startDate);
            if (startDate != null && month != null) {
                let newStartDate = new Date(startDate);
                newStartDate.setMonth(newStartDate.getMonth() + month);
                // console.log("startDate--------->1", new Date(newStartDate));
                this.el.setValueFromCoords(17, y, 1, true);
                this.el.setValueFromCoords(9, y, newStartDate.getFullYear() + '-' + (newStartDate.getMonth() + 1) + "-01 00:00:00", true);

            }
            this.el.setValueFromCoords(17, y, 0, true);
        }


        if (x == 9 && this.el.getValueFromCoords(17, y) == 0) {//endDate
            console.log("startDate--------->1111111");
            let startDate = this.el.getValueFromCoords(7, y);
            let endDate = this.el.getValueFromCoords(9, y);

            if (startDate != null & endDate != null) {
                let d1 = new Date(startDate);
                let d2 = new Date(endDate)
                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months += d2.getMonth() - d1.getMonth();
                this.el.setValueFromCoords(17, y, 1, true);
                this.el.setValueFromCoords(8, y, months, true);
            }
            this.el.setValueFromCoords(17, y, 0, true);
        }


        //unit per pallet euro1
        if (x == 14) {
            var col = ("O").concat(parseInt(y) + 1);
            value = this.el.getValue(`O${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        //unit per pallet euro1
        if (x == 15) {
            var col = ("P").concat(parseInt(y) + 1);
            value = this.el.getValue(`P${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        //unit per pallet euro1
        if (x == 16) {
            var col = ("Q").concat(parseInt(y) + 1);
            value = this.el.getValue(`Q${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        // Version notes
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value != "") {
                if (value.length > 1000) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidStringLength'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }



    }.bind(this);
    // -----end of changed function

    formSubmit() {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({
                loading: true
            })
            var tableJson = this.el.getJson(null, false);
            var programs = [];
            var count = 0;
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("12 map---" + map1.get("12"))
                if (parseInt(map1.get("12")) === 1) {
                    console.log("map1.get(11)---", map1.get("11"));
                    console.log("map1.get(13)---", map1.get("13"));
                    console.log("map1.get(7)---", map1.get("7"));
                    console.log("map1.get(9)---", map1.get("9"));
                    var notes = map1.get("4");
                    var startDate = map1.get("7");
                    var stopDate = map1.get("9");
                    var id = map1.get("11");
                    var noOfDaysInMonth = map1.get("13");
                    console.log("start date ---", startDate);
                    console.log("stop date ---", stopDate);
                    console.log("noOfDaysInMonth ---", noOfDaysInMonth);
                    var program = (this.state.datasetList.filter(x => x.id == id)[0]);
                    var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
                    var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                    programData.currentVersion.forecastStartDate = moment(startDate).startOf('month').format("YYYY-MM-DD");
                    programData.currentVersion.forecastStopDate = moment(stopDate).startOf('month').format("YYYY-MM-DD");
                    programData.currentVersion.daysInMonth = noOfDaysInMonth;
                    programData.currentVersion.notes = notes;


                    programData.currentVersion.freightPerc = this.el.getValue(`O${parseInt(i) + 1}`, true).toString().replaceAll("%", "");
                    programData.currentVersion.forecastThresholdHighPerc = this.el.getValue(`P${parseInt(i) + 1}`, true).toString().replaceAll("%", "");
                    programData.currentVersion.forecastThresholdLowPerc = this.el.getValue(`Q${parseInt(i) + 1}`, true).toString().replaceAll("%", "");

                    programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
                    program.programData = programData;
                    // var db1;
                    // getDatabase();
                    // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    // openRequest.onerror = function (event) {
                    //     this.setState({
                    //         message: i18n.t('static.program.errortext'),
                    //         color: 'red'
                    //     })
                    //     this.hideFirstComponent()
                    // }.bind(this);
                    // openRequest.onsuccess = function (e) {
                    //     db1 = e.target.result;
                    //     var transaction = db1.transaction(['datasetData'], 'readwrite');
                    //     var programTransaction = transaction.objectStore('datasetData');
                    //     var programRequest = programTransaction.put(program);
                    //     programRequest.onerror = function (e) {

                    //     }.bind(this);
                    //     programRequest.onsuccess = function (e) {

                    //     }.bind(this);
                    // }.bind(this);
                    programs.push(program);
                    count++;
                }
            }
            console.log("programs to update---", programs);
            if (count > 0) {
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                    this.hideFirstComponent()
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var transaction = db1.transaction(['datasetData'], 'readwrite');
                    var programTransaction = transaction.objectStore('datasetData');
                    programs.forEach(program => {
                        var programRequest = programTransaction.put(program);
                        console.log("---hurrey---");
                    })
                    transaction.oncomplete = function (event) {
                        this.setState({
                            loading: false,
                            message: i18n.t('static.mt.dataUpdateSuccess'),
                            color: "green",
                            isChanged: false
                        }, () => {
                            this.hideSecondComponent();
                            this.buildJExcel();
                        });
                        console.log("Data update success");
                    }.bind(this);
                    transaction.onerror = function (event) {
                        this.setState({
                            loading: false,
                            // message: 'Error occured.',
                            color: "red",
                        }, () => {
                            this.hideSecondComponent();
                        });
                        console.log("Data update errr");
                    }.bind(this);
                }.bind(this);
            }
        }
    }

    getDatasetById(datasetIds) {
        var versionSettingsList = [];
        this.state.uniquePrograms.map(dataset => {
            if (datasetIds.includes(dataset.programId)) {
                versionSettingsList.push(dataset);
            }
        })
        this.setState({ versionSettingsList }, () => { this.buildJExcel() });
    }
    getVersionTypeList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['versionType'], 'readwrite');
            var program = transaction.objectStore('versionType');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                console.log("myResult version type---", myResult)
                this.setState({
                    versionTypeList: myResult
                });
                for (var i = 0; i < myResult.length; i++) {
                    console.log("version type--->", myResult[i])

                }

            }.bind(this);
        }.bind(this);
    }

    getDatasetList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                var proList = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        // var obj = myResult[i];
                        // var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                        // obj.programData = programData;
                        proList.push(myResult[i])
                    }
                }
                console.log("proList---", proList);

                if (localStorage.getItem("sesForecastProgramIds") != '' && localStorage.getItem("sesForecastProgramIds") != undefined) {
                    // console.log("program---->>>", JSON.parse(localStorage.getItem("sesForecastProgramIds")));
                    this.setState({
                        datasetList: proList,
                        uniquePrograms: proList.filter((v, i, a) => a.findIndex(t => (t.programId === v.programId)) === i),
                        loading: false,
                        programValues: JSON.parse(localStorage.getItem("sesForecastProgramIds")),
                        // programValues: [{ label: "TZA-CON/ARV-MOH", value: 2551 }]


                    }, () => {
                        var programIds = this.state.programValues.map(x => x.value).join(", ");
                        programIds = Array.from(new Set(programIds.split(','))).toString();
                        this.getDatasetById(programIds);
                        // this.filterData()
                        //   this.filterTracerCategory(programIds);

                    })
                } else {
                    this.setState({
                        datasetList: proList,
                        uniquePrograms: proList.filter((v, i, a) => a.findIndex(t => (t.programId === v.programId)) === i),
                        loading: false

                    });
                }

            }.bind(this);
        }.bind(this);
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        elInstance.setValueFromCoords(12, y, 1, true);
    }

    buildJExcel() {
        let versionSettingsList = this.state.versionSettingsList;
        let versionSettingsArray = [];
        let count = 0;
        var versionTypeId = document.getElementById('versionTypeId').value;
        for (var j = 0; j < versionSettingsList.length; j++) {
            var bytes = CryptoJS.AES.decrypt(versionSettingsList[j].programData, SECRET_KEY);
            var pd = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            data = [];
            data[0] = versionSettingsList[j].programId
            data[1] = versionSettingsList[j].programCode
            data[2] = versionSettingsList[j].version + "(Local)"
            data[3] = ''
            data[4] = pd.currentVersion.notes
            data[5] = ''
            data[6] = ''
            if (pd.currentVersion.forecastStartDate != null && pd.currentVersion.forecastStartDate != "") {
                var parts1 = pd.currentVersion.forecastStartDate.split('-');
                data[7] = parts1[0] + "-" + parts1[1] + "-01 00:00:00"
            } else {
                data[7] = pd.currentVersion.forecastStartDate
            }


            if (pd.currentVersion.forecastStartDate != null && pd.currentVersion.forecastStopDate != null) {
                let d1 = new Date(pd.currentVersion.forecastStartDate);
                let d2 = new Date(pd.currentVersion.forecastStopDate)
                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months += d2.getMonth() - d1.getMonth();
                data[8] = months
            } else {
                data[8] = 0
            }



            if (pd.currentVersion.forecastStopDate != null && pd.currentVersion.forecastStopDate != "") {
                var parts2 = pd.currentVersion.forecastStopDate.split('-');
                data[9] = parts2[0] + "-" + parts2[1] + "-01 00:00:00"
            } else {
                data[9] = pd.currentVersion.forecastStopDate
            }
            // 1-Local 0-Live
            data[10] = 1
            data[11] = versionSettingsList[j].id
            data[12] = 0
            data[13] = pd.currentVersion.daysInMonth != null ? pd.currentVersion.daysInMonth : '0'


            data[14] = (pd.currentVersion.freightPerc == null ? '' : pd.currentVersion.freightPerc)
            data[15] = (pd.currentVersion.forecastThresholdHighPerc == null ? '' : pd.currentVersion.forecastThresholdHighPerc)
            data[16] = (pd.currentVersion.forecastThresholdLowPerc == null ? '' : pd.currentVersion.forecastThresholdLowPerc)
            data[17] = 0;
            if (versionTypeId == "") {
                versionSettingsArray[count] = data;
                count++;
            }

        }
        // console.log("versionSettingsArray------->", versionSettingsArray);

        for (var j = 0; j < versionSettingsList.length; j++) {
            var databytes = CryptoJS.AES.decrypt(versionSettingsList[j].programData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            var versionList = programData.versionList;
            for (var k = 0; k < versionList.length; k++) {

                data = [];
                data[0] = versionSettingsList[j].programId
                data[1] = versionSettingsList[j].programCode
                data[2] = versionList[k].versionId
                data[3] = getLabelText(versionList[k].versionType.label, this.state.lang);
                data[4] = versionList[k].notes
                data[5] = versionList[k].createdDate
                data[6] = versionList[k].createdBy.username
                data[7] = versionList[k].forecastStartDate
                data[8] = ''
                data[9] = versionList[k].forecastStopDate
                data[10] = 0
                data[11] = versionList[k].versionId
                data[12] = 0
                data[13] = versionList[k].daysInMonth


                data[14] = versionList[k].freightPerc
                data[15] = versionList[k].forecastThresholdHighPerc
                data[16] = versionList[k].forecastThresholdLowPerc
                data[17] = 0;

                if (versionTypeId != "") {
                    if (versionList[k].versionType.id == versionTypeId) {
                        versionSettingsArray[count] = data;
                        count++;
                    }
                } else {
                    versionSettingsArray[count] = data;
                    count++;
                }
            }
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = versionSettingsArray;


        // console.log("versionSettingsArray------->1", data);
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 120, 60, 80, 150, 100, 110, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'programId',
                    type: 'hidden',//0 A
                },
                {
                    title: i18n.t('static.dashboard.programheader'),
                    type: 'text',
                    readOnly: true// 1 B
                },
                {
                    title: i18n.t('static.report.version'),
                    type: 'text',
                    readOnly: true//2 C
                },
                {
                    title: i18n.t('static.report.versiontype'),
                    type: 'text',
                    readOnly: true//3 D
                },
                {
                    title: i18n.t('static.program.programDiscription'),
                    type: 'text',
                    maxlength: 1000//4 E
                },
                {
                    title: i18n.t('static.program.dateCommitted'),
                    readOnly: true,
                    type: 'calendar',
                    options: {
                        format: JEXCEL_DATE_FORMAT_SM
                    }// 5 F


                },
                {
                    title: i18n.t('static.program.commitedbyUser'),
                    type: 'text',
                    readOnly: true//6 G
                },
                {
                    title: i18n.t('static.program.forecastStart'),
                    type: 'calendar',
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                    } // 7 H
                },
                {
                    title: i18n.t('static.versionSettings.ForecastPeriodInMonth'),
                    type: 'text',
                    // readOnly: true//8 I
                },
                {
                    title: i18n.t('static.program.forecastEnd'),
                    type: 'calendar',
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                    }// 9 J
                },
                {
                    title: 'isLocal',
                    type: 'hidden',//10 K
                },
                {
                    title: 'versionId',
                    type: 'hidden',//11 L
                },
                {
                    title: 'isChanged',
                    type: 'hidden',//12 M
                },
                {
                    title: i18n.t('static.program.noOfDaysInMonth'),
                    type: 'dropdown',
                    source: this.state.noOfDays
                },//13 N


                {
                    title: i18n.t('static.versionSettings.freight%'),
                    type: 'numeric',
                    textEditor: true,
                    // readOnly: true
                },//14 O
                {
                    title: i18n.t('static.versionSettings.forecastThresholdHigh'),
                    type: 'numeric',
                    textEditor: true,
                    // readOnly: true
                },//15 P
                {
                    title: i18n.t('static.versionSettings.ForecastThresholdLow'),
                    type: 'numeric',
                    textEditor: true,
                    // readOnly: true
                },//16 Q
                {
                    title: 'localCalling',
                    type: 'hidden',//17 R
                },

            ],
            text: {
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
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el.jexcel;
                if (y != null) {
                    var rowData = elInstance.getRowData(y);
                    if (rowData[10] == 1) {
                        var cell = elInstance.getCell(("E").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                        cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                        cell = elInstance.getCell(("J").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                        cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                        cell = elInstance.getCell(("O").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                        cell = elInstance.getCell(("P").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                        cell = elInstance.getCell(("Q").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                        cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                    else {
                        var cell = elInstance.getCell(("E").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        cell = elInstance.getCell(("J").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        cell = elInstance.getCell(("N").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        cell = elInstance.getCell(("O").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        cell = elInstance.getCell(("P").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        cell = elInstance.getCell(("Q").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }

                }
            }.bind(this),
            onchange: this.changed,
            oneditionend: this.oneditionend,
            oncreateeditor: this.oncreateeditor,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,


        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    selected = function (instance, cell, x, y, value) {
        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
        }
    }.bind(this);

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    oncreateeditor = function (el, cell, x, y) {
        if (x == 4) {
            var config = el.jexcel.options.columns[x].maxlength;
            cell.children[0].setAttribute('maxlength', config);
        }
    }

    componentDidMount() {
        this.getVersionTypeList();
        this.getDatasetList();
    }

    handleChangeProgram(programIds) {
        programIds = programIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label)
        }, () => {
            var programIds = this.state.programValues.map(x => x.value).join(", ");
            // console.log("program------------->>>", this.state.programValues);
            localStorage.setItem("sesForecastProgramIds", JSON.stringify(this.state.programValues));
            programIds = Array.from(new Set(programIds.split(','))).toString();
            this.getDatasetById(programIds);
            // this.filterData()
            //   this.filterTracerCategory(programIds);

        })

    }

    render() {

        const { uniquePrograms } = this.state;
        let programMultiList = uniquePrograms.length > 0
            && uniquePrograms.map((item, i) => {
                return ({ label: item.programCode, value: item.programId })

            }, this);

        programMultiList = Array.from(programMultiList);

        const { versionTypeList } = this.state;
        let versionTypes = versionTypeList.length > 0
            && versionTypeList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);



        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>

                    <CardBody className="pb-lg-5 pt-lg-2">
                        <Col md="9 pl-0">
                            <div className="d-md-flex">
                                <FormGroup className="mt-md-2 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.programheader')}</Label>
                                    <div className="controls SelectGoVesionSetting">
                                        {/* <InMultiputGroup> */}
                                        <MultiSelect
                                            name="datasetId"
                                            id="datasetId"
                                            bsSize="sm"
                                            value={this.state.programValues}
                                            onChange={(e) => { this.handleChangeProgram(e) }}
                                            options={programMultiList && programMultiList.length > 0 ? programMultiList : []}
                                            labelledBy={i18n.t('static.common.pleaseSelect')}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.versiontype')}</Label>
                                    <div className="controls SelectGoVesionSetting">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="versionTypeId"
                                                id="versionTypeId"
                                                bsSize="sm"
                                                onChange={(e) => { this.buildJExcel() }}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                {versionTypes}

                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        {/* <div id="loader" className="center"></div> */}

                        <div className="VersionSettingMarginTop">
                            <div id="tableDiv" className={"RemoveStriped"} style={{ display: this.state.loading ? "none" : "block" }}>
                            </div>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                    <div class="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>

                    </CardBody>
                    <CardFooter className="CardFooterVesionsettingMarginTop">
                        {/* {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT') && */}
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.isChanged && <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                            &nbsp;
                        </FormGroup>
                        {/* } */}
                    </CardFooter>
                </Card>

            </div>
        )
    }
}
export default VersionSettingsComponent;
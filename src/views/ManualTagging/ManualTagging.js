import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, Label, Button, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { STRING_TO_DATE_FORMAT, DATE_FORMAT_CAP, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import moment from 'moment';
import BudgetServcie from '../../api/BudgetService';
import FundingSourceService from '../../api/FundingSourceService';
import i18n from '../../i18n';
import ProgramService from '../../api/ProgramService.js';
import ProductService from '../../api/ProductService';
import ManualTaggingService from '../../api/ManualTaggingService.js';
import PlanningUnitService from '../../api/PlanningUnitService.js';
import RealmCountryService from '../../api/RealmCountryService';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';
import MultiSelect from 'react-multi-select-component';



const entityname = i18n.t('static.dashboard.manualTagging');
export default class ManualTagging extends Component {

    constructor(props) {
        super(props);
        this.state = {
            getPlanningUnitArray: [],
            countryWisePrograms: [],
            active4: false,
            active5: false,
            selectedRowPlanningUnit: '',
            programId1: '',
            fundingSourceId: '',
            budgetId: '',
            totalQuantity: '',
            filteredBudgetList: [],
            budgetList: [],
            planningUnits1: [],
            finalShipmentId: '',
            selectedShipment: [],
            productCategories: [],
            countryList: [],
            parentShipmentId: '',
            planningUnitIdUpdated: '',
            erpPlanningUnitId: '',
            conversionFactorEntered: false,
            searchedValue: '',
            result: '',
            message: '',
            instance: '',
            outputList: [],
            loading: true,
            loading1: false,
            programs: [],
            planningUnits: [],
            outputListAfterSearch: [],
            artmisList: [],
            shipmentId: '',
            reason: "1",
            haslinked: false,
            alreadyLinkedmessage: "",
            tracercategoryPlanningUnit: [],
            planningUnitId: '',
            planningUnitName: '',
            autocompleteData: [],
            orderNo: '',
            primeLineNo: '',
            procurementAgentId: '',
            displayButton: false,
            programId: '',
            active1: false,
            active2: false,
            active3: false,
            planningUnitValues: [],
            planningUnitIds: [],
            roNoOrderNo: '',
            notLinkedShipments: [],
            fundingSourceList: [],
            displaySubmitButton: false,
            countryId: '',
            hasSelectAll: true
        }
        
        this.filterData = this.filterData.bind(this);
        this.filterErpData = this.filterErpData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.formatPlanningUnitLabel = this.formatPlanningUnitLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);
        this.link = this.link.bind(this);
        this.getProgramList = this.getProgramList.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.buildJExcelERP = this.buildJExcelERP.bind(this);
        this.programChange = this.programChange.bind(this);
        this.countryChange = this.countryChange.bind(this);

        this.programChangeModal = this.programChangeModal.bind(this);
        this.fundingSourceModal = this.fundingSourceModal.bind(this);
        this.budgetChange = this.budgetChange.bind(this);

        this.dataChange = this.dataChange.bind(this);
        this.dataChange1 = this.dataChange1.bind(this);
        this.changed = this.changed.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this);
        this.getNotLinkedShipments = this.getNotLinkedShipments.bind(this);
        this.displayShipmentData = this.displayShipmentData.bind(this);
        this.getFundingSourceList = this.getFundingSourceList.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.displayButton = this.displayButton.bind(this);
        this.getPlanningUnitListByRealmCountryId = this.getPlanningUnitListByRealmCountryId.bind(this);
        this.filterProgramByCountry = this.filterProgramByCountry.bind(this);
        this.getPlanningUnitArray = this.getPlanningUnitArray.bind(this);

    }
    filterProgramByCountry() {
        let programList = this.state.programs;
        let countryId = this.state.countryId;
        if (countryId != -1) {
            console.log("programList---", programList);
            console.log("countryId---", countryId);
            const countryWisePrograms = programList.filter(c => c.realmCountry.realmCountryId == countryId)
            console.log("countryWisePrograms---", countryWisePrograms);
            this.setState({
                countryWisePrograms
            });
        } else {
            this.setState({
                countryWisePrograms: programList
            });
        }
    }
    getPlanningUnitListByRealmCountryId() {
        PlanningUnitService.getActivePlanningUnitByRealmCountryId(this.state.countryId)
            .then(response => {
                console.log("realm country-->3", response.data);
                this.setState({
                    planningUnits1: response.data
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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

    cancelClicked() {
        if (this.state.active1 || this.state.active2) {
            this.filterData(this.state.planningUnitIds);
        } else {
            this.filterErpData();
        }
        this.toggleLarge();
    }
    displayShipmentData() {
        let selectedShipmentId = parseInt(document.getElementById("notLinkedShipmentId").value);
        let selectedPlanningUnitId = parseInt(document.getElementById("planningUnitId1").value);
        let selectedShipment;
        console.log("selectedShipmentId---", selectedShipmentId);
        if (selectedShipmentId != null && selectedShipmentId != 0) {
            selectedShipment = this.state.notLinkedShipments.filter(c => (c.shipmentId == selectedShipmentId));
        } else {
            selectedShipment = this.state.notLinkedShipments.filter(c => (c.planningUnit.id == selectedPlanningUnitId));
        }
        this.setState({
            finalShipmentId: '',
            selectedShipment
        })
    }
    getNotLinkedShipments() {

        let programId1 = parseInt(this.state.programId1);
        let planningUnitId = this.state.planningUnitIdUpdated;
        ManualTaggingService.getNotLinkedShipmentListForManualTagging(programId1, 3)
            .then(response => {
                console.log("notLinkedShipments response===", response.data);
                this.setState({
                    notLinkedShipments: response.data
                });
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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
    getProductCategories() {
        // AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                console.log("product category list---", JSON.stringify(response.data))
                // response.data.splice(0, 1);
                this.setState({
                    productCategories: response.data.splice(1)
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(10, y);
            if (parseInt(value) == 1) {


                var col = ("H").concat(parseInt(y) + 1);
                if (this.el.getValueFromCoords(0, y)) {
                    var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                    var value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    value = value.replace(/,/g, "");
                    if (value == "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
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
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }
        return valid;
    }

    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {
        console.log("changed 1---", x)

        //conversion factor
        if (x == 7) {
            console.log("y-------", this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", ""));
            var col = ("H").concat(parseInt(y) + 1);
            console.log("col-----------", col);
            console.log("value---------", this.el.getValue(`H${parseInt(y) + 1}`));
            value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = DECIMAL_NO_REGEX;
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;

            if (value == "") {
                console.log("--------1--------");
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    console.log("--------2--------");
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    var qty = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                    console.log("qty-------------------" + qty);
                    this.state.instance.setValueFromCoords(8, y, this.addCommas(qty * (value != null && value != "" ? value : 1)), true);
                }

            }
        }
        // if (x == 0) {
        //     console.log("check box value----------------", value = this.el.getValue(`A${parseInt(y) + 1}`, true).toString().replaceAll(",", ""));
        // }

        // if (x == 9) {

        // }

        // //Active
        if (x != 10) {
            this.el.setValueFromCoords(10, y, 1, true);
        }
        this.displayButton();


    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        console.log("------------onedit called")
        console.log("changed 2---")
        this.el.setValueFromCoords(10, y, 1, true);
    }.bind(this);

    onPaste(instance, data) {
        // var z = -1;
        // for (var i = 0; i < data.length; i++) {
        //     if (z != data[i].y) {
        //         var index = (instance.jexcel).getValue(`G${parseInt(data[i].y) + 1}`, true);
        //         if (index == "" || index == null || index == undefined) {
        //             (instance.jexcel).setValueFromCoords(0, data[i].y, this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en, true);
        //             (instance.jexcel).setValueFromCoords(5, data[i].y, this.props.match.params.realmCountryId, true);
        //             (instance.jexcel).setValueFromCoords(6, data[i].y, 0, true);
        //             (instance.jexcel).setValueFromCoords(7, data[i].y, 1, true);
        //             z = data[i].y;
        //         }
        //     }
        // }
    }

    dataChange1(event) {
        console.log("radio button event---", event.target)

        if (event.target.id == 'active4') {
            this.setState({
                active4: true,
                active5: false
            });
        } else if (event.target.id == 'active5') {
            this.setState({
                // finalShipmentId:'',
                active4: false,
                active5: true
            });
        }
    }

    dataChange(event) {
        console.log("radio button event---", event.target)

        if (event.target.id == 'active1') {
            this.setState({
                programId: -1,
                planningUnitValues: [],
                planningUnitLabels: [],
                planningUnits: [],
                outputList: [],
                active1: true,
                active2: false,
                active3: false
            }, () => {
                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                    this.setState({
                        programId: localStorage.getItem("sesProgramIdReport")
                    }, () => {
                        this.getPlanningUnitList();
                    });
                }
            });
        } else if (event.target.id == 'active2') {
            this.setState({
                programId: -1,
                planningUnitValues: [],
                planningUnitLabels: [],
                planningUnits: [],
                outputList: [],
                active2: true,
                active1: false,
                active3: false
            }, () => {
                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                    this.setState({
                        programId: localStorage.getItem("sesProgramIdReport")
                    }, () => {
                        this.getPlanningUnitList();
                    });
                }
            });
        } else {

            this.setState({
                outputList: [],
                planningUnitValues: [],
                productCategoryValues: [],
                planningUnits1: [],
                countryId: -1,
                active3: true,
                active1: false,
                active2: false
            }, () => {
                // this.buildJExcel();
                let realmId = AuthenticationService.getRealmId();
                this.getProductCategories();
                this.getBudgetList();
                this.getFundingSourceList();
                RealmCountryService.getRealmCountryForProgram(realmId)
                    .then(response => {
                        console.log("RealmCountryService---->", response.data)
                        if (response.status == 200) {
                            var listArray = response.data.map(ele => ele.realmCountry);
                            // listArray.sort((a, b) => {
                            //     var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            //     var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            //     return itemLabelA > itemLabelB ? 1 : -1;
                            // });
                            this.setState({
                                countryList: response.data
                            })
                        } else {
                            this.setState({ message: response.data.messageCode })
                        }
                    }).catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: 'static.unkownError',
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


            });
        }
        this.state.languageEl.destroy();
        // this.buildJExcel();
    }

    getBudgetListByProgramId = (e) => {
        let programId1 = this.state.programId1;
        console.log("programId1--->>>>>>>>>>", programId1)
        const filteredBudgetList = this.state.budgetList.filter(c => c.program.id == programId1)
        console.log("filteredBudgetList---", filteredBudgetList);
        this.setState({
            filteredBudgetList
        });
    }

    getBudgetListByFundingSourceId = (e) => {
        let fundingSourceId = this.state.fundingSourceId;
        console.log("programId--->>>>>>>>>>", fundingSourceId)
        const filteredBudgetList = this.state.filteredBudgetList.filter(c => c.fundingSource.fundingSourceId == fundingSourceId)
        console.log("filteredBudgetList---", filteredBudgetList);
        this.setState({
            filteredBudgetList
        });
    }
    getFundingSourceList() {
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                console.log(response)
                if (response.status == 200) {
                    console.log("budget after status 200 new console --- ---->", response.data);
                    let fundingSourceList = response.data.filter(c => c.active == true)
                    console.log("fundingSourceList---", fundingSourceList);
                    this.setState({
                        fundingSourceList
                    }, () => {
                        // this.buildJExcel();
                        // this.filterData();
                    });
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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
    getBudgetList = () => {
        BudgetServcie.getBudgetList()
            .then(response => {
                console.log(response)
                if (response.status == 200) {
                    console.log("budget after status 200 new console --- ---->", response.data);
                    // let 
                    let budgetList = response.data.filter(c => c.active == true)
                    this.setState({
                        budgetList
                    }, () => {
                        // this.buildJExcel();
                        // this.filterData();
                    });
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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
    programChange(event) {
        this.setState({
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            programId: event.target.value,
            hasSelectAll: true
        }
            , () => {
                console.log("new program id----", this.state.programId)
                this.getPlanningUnitList();
            }
        )
    }

    getPlanningUnitArray() {
        let planningUnits = this.state.planningUnits;
        console.log("planningUnitArray1---", planningUnits);
        let planningUnitArray = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);

        this.setState({
            planningUnitArray
        }, () => {
            this.filterData(planningUnitArray);
        })

        console.log("planningUnitArray2---", planningUnitArray);
    }

    countryChange = (event) => {
        console.log("country change event ---", event.target.value);
        let planningUnits1 = this.state.planningUnits1;
        this.setState({
            planningUnits1: (this.state.productCategoryValues != null && this.state.productCategoryValues != "" ? planningUnits1 : []),
            countryId: event.target.value
        }, () => {
            this.getPlanningUnitListByRealmCountryId();
        })
    }


    programChangeModal(event) {
        this.setState({
            programId1: event.target.value
        }, () => {
            this.getNotLinkedShipments();
            this.getPlanningUnitList();
            this.getBudgetListByProgramId();
        })
    }

    fundingSourceModal(event) {
        this.setState({
            fundingSourceId: event.target.value
        })
    }

    budgetChange(event) {
        this.setState({
            budgetId: event.target.value
        })
    }


    displayButton() {
        var validation = this.checkValidation();
        console.log("check validation---", validation)
        if (validation == true) {
            var tableJson = this.state.instance.getJson(null, false);
            console.log("tableJson---", tableJson);
            let count = 0, qty = 0;
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (this.state.active2) {
                    count++;
                    if (map1.get("0")) {
                        qty = parseInt(qty) + parseInt(this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""));
                    }
                }
                else {
                    if (parseInt(map1.get("10")) === 1 && map1.get("0")) {
                        qty = parseInt(qty) + parseInt(this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""));
                        count++;
                    }
                }
            }
            this.setState({
                displaySubmitButton: (count > 0 ? true : false),
                totalQuantity: this.addCommas(qty),
                displayTotalQty: (count > 0 ? true : false)
            })
        } else {
            this.setState({
                displaySubmitButton: false
            })
        }
    }

    link() {
        let valid = false;
        var programId = (this.state.active3 ? this.state.programId1 : this.state.programId);
        if (this.state.active3) {
            if (this.state.active5) {
                if (this.state.finalShipmentId != "" && this.state.finalShipmentId != null) {
                    valid = true;
                } else {
                    alert("Please select shipment id");
                }

            } else if (this.state.active4) {
                if (programId == -1) {
                    alert("Please select program");
                } else if (this.state.fundingSourceId == -1) {
                    alert("Please select funding source");
                } else if (this.state.budgetId == -1) {
                    alert("Please select budget");
                }
                else {
                    var cf = window.confirm("You are about to create a new shipment. Are you sure you want to continue?");
                    if (cf == true) {
                        valid = true;
                    } else { }
                }
            }
        } else {
            valid = true;
        }
        if (valid) {
            this.setState({ loading1: true })
            var validation = this.checkValidation();
            if (validation == true) {
                var tableJson = this.state.instance.getJson(null, false);
                console.log("tableJson---", tableJson);
                let changedmtList = [];
                for (var i = 0; i < tableJson.length; i++) {
                    var map1 = new Map(Object.entries(tableJson[i]));
                    console.log("7 map---" + map1.get("10"))
                    console.log("7 map order no--- ", map1.get("11"));
                    if (parseInt(map1.get("10")) === 1) {
                        let json = {
                            parentShipmentId: (this.state.active2 ? this.state.parentShipmentId : 0),
                            programId: programId,
                            fundingSourceId: (this.state.active3 ? this.state.fundingSourceId : 0),
                            budgetId: (this.state.active3 ? this.state.budgetId : 0),
                            shipmentId: (this.state.active3 ? this.state.finalShipmentId : this.state.shipmentId),
                            conversionFactor: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                            notes: (map1.get("9") === '' ? null : map1.get("9")),
                            active: map1.get("0"),
                            orderNo: map1.get("11"),
                            primeLineNo: parseInt(map1.get("12")),
                            planningUnitId: (this.state.active3 ? this.el.getValue(`N${parseInt(i) + 1}`, true).toString().replaceAll(",", "") : 0),
                            quantity: this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", "")
                        }
                        changedmtList.push(json);
                    }
                }
                console.log("FINAL SUBMIT changedmtList---", changedmtList);
                if (this.state.active4 && changedmtList.length > 1) {
                    alert("Please select only 1 order at a time.");
                } else {
                    ManualTaggingService.linkShipmentWithARTMIS(changedmtList)
                        .then(response => {
                            console.log("response m tagging---", response)
                            this.setState({
                                message: (this.state.active2 ? "Shipment linking updated successfully" : i18n.t('static.shipment.linkingsuccess')),
                                color: 'green',
                                haslinked: true,
                                loading: false,
                                loading1: false,
                                alreadyLinkedmessage: i18n.t('static.message.alreadyTagged'),
                            },
                                () => {
                                    console.log("changedmtList length---", changedmtList.length);
                                    console.log("data length---", response.data.length);

                                    console.log(this.state.message, "success 1")
                                    this.hideSecondComponent();
                                    document.getElementById('div2').style.display = 'block';
                                    console.log("Going to call toggle large 1");
                                    this.toggleLarge();

                                    (this.state.active3 ? this.filterErpData() : this.filterData(this.state.planningUnitIds));

                                })

                        }).catch(
                            error => {
                                if (error.message === "Network Error") {
                                    this.setState({
                                        message: 'static.unkownError',
                                        color: 'red',
                                        loading: false,
                                        loading1: false
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
                                                loading1: false,
                                                color: 'red',
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: error.response.data.messageCode,
                                                loading: false,
                                                loading1: false,
                                                color: 'red',
                                            });
                                            break;
                                        default:
                                            this.setState({
                                                message: 'static.unkownError',
                                                loading: false,
                                                loading1: false,
                                                color: 'red',
                                            });
                                            break;
                                    }
                                }
                            }
                        );
                }
            }
        }
    }
    getConvertedQATShipmentQty = () => {
        var conversionFactor = document.getElementById("conversionFactor").value;
        // conversionFactor = conversionFactor.slice(0,13)
        conversionFactor = conversionFactor.replace("-", "")
        // var regex = "/^\d{0,6}(\.\d{1,2})?$/";
        // var regResult = regex.test(conversionFactor);

        // Reg start
        var beforeDecimal = 10;
        var afterDecimal = 4;
        conversionFactor = conversionFactor.replace(/[^\d.]/g, '')
            .replace(new RegExp("(^[\\d]{" + beforeDecimal + "})[\\d]", "g"), '$1')
            .replace(/(\..*)\./g, '$1')
            .replace(new RegExp("(\\.[\\d]{" + afterDecimal + "}).", "g"), '$1');
        // Reg end

        console.log("reg result---", conversionFactor);

        console.log("changedConversionFactor---", conversionFactor);
        console.log("conversionFactor---", conversionFactor);
        var erpShipmentQty = document.getElementById("erpShipmentQty").value;
        if (conversionFactor != null && conversionFactor != "" && conversionFactor != 0) {
            var result = erpShipmentQty * conversionFactor;
            document.getElementById("convertedQATShipmentQty").value = result.toFixed(2);
            this.setState({
                conversionFactorEntered: true
            })
        } else {
            this.setState({ conversionFactorEntered: false })
        }
        document.getElementById("conversionFactor").value = conversionFactor;
    }


    getOrderDetails = () => {

        console.log("combo box value-------------------------------", this.state.searchedValue);

        var roNoOrderNo = (this.state.searchedValue != null && this.state.searchedValue != "" ? this.state.searchedValue : "0");
        console.log("roNoOrderNo--->>>", roNoOrderNo);
        var programId = (this.state.active3 ? 0 : document.getElementById("programId").value);
        var erpPlanningUnitId = (this.state.planningUnitIdUpdated != null && this.state.planningUnitIdUpdated != "" ? this.state.planningUnitIdUpdated : 0);
        console.log("de select erpPlanningUnitId---", erpPlanningUnitId)
        console.log("condition 1---", (roNoOrderNo != "" && roNoOrderNo != 0))
        console.log("condition 2---", (erpPlanningUnitId != null && erpPlanningUnitId != "" && erpPlanningUnitId == 0))
        if ((roNoOrderNo != "" && roNoOrderNo != 0) || (erpPlanningUnitId != 0)) {
            ManualTaggingService.getOrderDetailsByOrderNoAndPrimeLineNo(roNoOrderNo, programId, erpPlanningUnitId, (this.state.active1 ? 1 : (this.state.active2 ? 2 : 3)))
                .then(response => {
                    console.log("artmis response===", response.data);
                    // document.getElementById("erpShipmentQty").value = '';
                    // document.getElementById("convertedQATShipmentQty").value = '';
                    this.setState({
                        artmisList: response.data,
                        displayButton: false
                    }, () => {
                        this.buildJExcelERP();
                    })
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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
                                        loading: false,
                                        result: error.response.data.messageCode
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
            console.log("inside else hurrey")
            this.setState({
                artmisList: [],
                displayButton: false
            }, () => {
                this.buildJExcelERP();
            })
        }
        // else if (orderNo == "" && primeLineNo == "") {
        //     this.setState({
        //         artmisList: [],
        //         result: i18n.t('static.manualtagging.result'),
        //         alreadyLinkedmessage: ''
        //     })
        // }
        // else if (orderNo == "") {
        //     this.setState({
        //         artmisList: [],
        //         result: i18n.t('static.manualtagging.resultOrderNoBlank'),
        //         alreadyLinkedmessage: ''
        //     })
        // }
        // else if (primeLineNo == "") {
        //     this.setState({
        //         artmisList: [],
        //         result: i18n.t('static.manualtagging.resultPrimeLineNoBlank'),
        //         alreadyLinkedmessage: ''
        //     })
        // }
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

    handlePlanningUnitChange = (planningUnitIds) => {
        planningUnitIds = planningUnitIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })

        console.log("planningUnitIds.map(ele => ele)----", planningUnitIds.map(ele => ele))
        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {
            this.filterErpData()
        })
    }

    handleProductCategoryChange = (productCategoryIds) => {
        this.setState({
            productCategoryValues: productCategoryIds.map(ele => ele),
            productCategoryLabels: productCategoryIds.map(ele => ele.label),
            planningUnitValues: [],
            planningUnitLabels: [],
            planningUnits1: []
        }, () => {
            this.getPlanningUnitListByProductcategoryIds();
            this.filterErpData();
        })
    }

    getPlanningUnitListByProductcategoryIds = () => {
        PlanningUnitService.getActivePlanningUnitByProductCategoryIds(this.state.productCategoryValues.map(ele => (ele.value).toString()))
            .then(response => {
                console.log("RESP--->3", response.data);
                this.setState({
                    planningUnits1: response.data
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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

    filterErpData() {
        document.getElementById('div2').style.display = 'block';
        var countryId = this.state.countryId;

        // if (countryId != -1) {
        this.setState({
            loading: true,
            programId1: -1,
            fundingSourceId: -1,
            budgetId: -1
        })
        console.log("pl value---", this.state.planningUnitValues.map(ele => (ele.value).toString()));
        let productCategoryIdList = this.state.productCategoryValues.map(ele => (ele.value).toString())
        let planningUnitIdList = this.state.planningUnitValues.map(ele => (ele.value).toString());
        var json = {
            countryId: countryId,
            productCategoryIdList: productCategoryIdList,
            planningUnitIdList: planningUnitIdList,
            linkingType: (this.state.active1 ? 1 : (this.state.active2 ? 2 : 3))
        }
        if ((productCategoryIdList != null && productCategoryIdList != "") || (planningUnitIdList != null && planningUnitIdList != "")) {
            ManualTaggingService.getShipmentListForManualTagging(json)
                .then(response => {
                    console.log("manual tagging response===new----", response);
                    this.setState({
                        outputList: response.data
                    }, () => {
                        this.buildJExcel();
                    });
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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
                outputList: []
            }, () => {
                this.buildJExcel();
            });
        }


    }

    filterData = (planningUnitIds) => {

        console.log("planningUnitIds---", planningUnitIds);
        document.getElementById('div2').style.display = 'block';
        var programId = this.state.programId;

        planningUnitIds = planningUnitIds;
        // .sort(function (a, b) {
        //     return parseInt(a.value) - parseInt(b.value);
        // })
        this.setState({
            hasSelectAll: false,
            planningUnitValues: planningUnitIds.map(ele => ele),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {
            if (programId != -1 && planningUnitIds != null && planningUnitIds != "") {
                this.setState({
                    loading: true,
                    planningUnitIds
                })
                // if (this.state.haslinked) {
                //     this.setState({ haslinked: false })
                // } else {
                //     this.setState({ message: '' })
                // }
                var json = {
                    programId: parseInt(this.state.programId),
                    planningUnitIdList: this.state.planningUnitValues.map(ele => (ele.value).toString()),
                    linkingType: (this.state.active1 ? 1 : (this.state.active2 ? 2 : 3))
                }
                console.log("my json---------------------", json);
                ManualTaggingService.getShipmentListForManualTagging(json)
                    .then(response => {
                        console.log("manual tagging response===", response);
                        this.setState({
                            outputList: response.data,
                            // planningUnitIdUpdated: planningUnitId,
                            // planningUnitId: planningUnitId,
                            // planningUnitName: planningUnitName
                            // message: ''
                        }, () => {
                            if (!this.state.active3) {
                                localStorage.setItem("sesProgramIdReport", programId)
                            }
                            // this.getPlanningUnitListByTracerCategory(planningUnitId);
                            this.buildJExcel();
                        });
                    }).catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: 'static.unkownError',
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
                    outputList: []
                }, () => {
                    this.state.languageEl.destroy();
                })
            }
            // else if (programId == -1) {
            //     console.log("2-programId------>", programId);
            //     this.setState({
            //         outputList: [],
            //         message: i18n.t('static.program.validselectprogramtext'),
            //         color: 'red'
            //     }, () => {
            //         this.el = jexcel(document.getElementById("tableDiv"), '');
            //         this.el.destroy();
            //     });
            // } else if (planningUnitIds != null && planningUnitIds != "") {
            //     console.log("3-programId------>", programId);
            //     this.setState({
            //         outputList: [],
            //         message: i18n.t('static.procurementUnit.validPlanningUnitText'),
            //         color: 'red'
            //     }, () => {
            //         this.el = jexcel(document.getElementById("tableDiv"), '');
            //         this.el.destroy();
            //     });
            // }
        })




    }
    getPlanningUnitListByTracerCategory = (term) => {
        console.log("planning unit term---", term)
        this.setState({ planningUnitName: term });
        PlanningUnitService.getPlanningUnitByTracerCategory(this.state.planningUnitId, this.state.procurementAgentId, term.toUpperCase())
            .then(response => {
                console.log("tracercategoryPlanningUnit response===", response);
                var tracercategoryPlanningUnit = [];
                for (var i = 0; i < response.data.length; i++) {
                    var label = response.data[i].planningUnit.label.label_en + '(' + response.data[i].skuCode + ')';
                    tracercategoryPlanningUnit[i] = { value: response.data[i].planningUnit.id, label: label }
                }
                this.setState({
                    tracercategoryPlanningUnit
                });
                // this.setState({
                //     tracercategoryPlanningUnit: response.data
                // });
                // document.getElementById("erpPlanningUnitId").value = planningUnitId;
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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
    searchErpOrderData = (term) => {
        if (term != null && term != "") {
            var erpPlanningUnitId = this.state.planningUnitIdUpdated;
            var programId = this.state.programId;
            console.log("programId ---", programId);
            console.log("selected erpPlanningUnitId ---", erpPlanningUnitId);

            ManualTaggingService.searchErpOrderData(term.toUpperCase(), programId, (erpPlanningUnitId != null && erpPlanningUnitId != "" ? erpPlanningUnitId : 0), (this.state.active1 ? 1 : (this.state.active2 ? 2 : 3)))
                .then(response => {
                    console.log("searchErpOrderData response===", response);

                    var autocompleteData = [];
                    for (var i = 0; i < response.data.length; i++) {
                        autocompleteData[i] = { value: response.data[i].id, label: response.data[i].label }
                    }
                    this.setState({
                        autocompleteData
                    });
                    // document.getElementById("erpPlanningUnitId").value = planningUnitId;
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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
    }
   
    getProgramList() {
        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    console.log("program response data---", response.data)
                    if (response.data.length == 1) {
                        this.setState({
                            programs: response.data,
                            loading: false,
                            programId: response.data[0].programId
                        }, () => {
                            // this.getPlanningUnitList();
                        })
                    } else {
                        this.setState({
                            programs: listArray,
                            loading: false
                        })
                    }

                }
                else {

                    this.setState({
                        message: response.data.messageCode,
                        color: 'red',
                        loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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

    buildJExcelERP() {

        let erpDataList = this.state.artmisList;
        console.log("erpDataList---->", erpDataList);
        let erpDataArray = [];
        let count = 0;
        let qty = 0;
        let convertedQty = 0;

        for (var j = 0; j < erpDataList.length; j++) {
            data = [];

            // data[3] = this.formatDate(manualTaggingList[j].expectedDeliveryDate);
            // data[4] = getLabelText(manualTaggingList[j].shipmentStatus.label, this.state.lang)
            // data[5] = manualTaggingList[j].procurementAgent.code;
            // data[6] = manualTaggingList[j].orderNo
            // data[7] = this.addCommas(manualTaggingList[j].shipmentQty);
            if (this.state.active3) {
                data[0] = 0;
                data[1] = erpDataList[j].erpOrderId;
                data[2] = erpDataList[j].roNo + ' - ' + erpDataList[j].roPrimeLineNo + " | " + erpDataList[j].orderNo + ' - ' + erpDataList[j].primeLineNo;
                data[3] = getLabelText(erpDataList[j].erpPlanningUnit.label);
                data[4] = this.formatDate(erpDataList[j].expectedDeliveryDate);
                data[5] = erpDataList[j].erpStatus;
                data[6] = this.addCommas(erpDataList[j].shipmentQty);
                data[7] = '';
                // let convertedQty = this.addCommas(erpDataList[j].shipmentQty * 1);
                data[8] = this.addCommas(erpDataList[j].shipmentQty);
                data[9] = '';
                data[10] = 0;
                data[11] = erpDataList[j].orderNo;
                data[12] = erpDataList[j].primeLineNo;
                data[13] = erpDataList[j].erpPlanningUnit.id;

            } else {
                data[0] = erpDataList[j].active;
                data[1] = erpDataList[j].erpOrderId;
                data[2] = erpDataList[j].roNo + ' - ' + erpDataList[j].roPrimeLineNo + " | " + erpDataList[j].orderNo + ' - ' + erpDataList[j].primeLineNo;
                data[3] = getLabelText(erpDataList[j].planningUnitLabel);
                data[4] = this.formatDate(erpDataList[j].currentEstimatedDeliveryDate);
                data[5] = erpDataList[j].status;
                data[6] = this.addCommas(erpDataList[j].quantity);
                let conversionFactor = (erpDataList[j].conversionFactor != null && erpDataList[j].conversionFactor != "" ? this.addCommas(erpDataList[j].conversionFactor) : '');
                data[7] = conversionFactor;
                convertedQty = erpDataList[j].quantity * (erpDataList[j].conversionFactor != null && erpDataList[j].conversionFactor != "" ? erpDataList[j].conversionFactor : 1);
                data[8] = this.addCommas(convertedQty);
                data[9] = erpDataList[j].notes;
                data[10] = 0;
                data[11] = erpDataList[j].orderNo;
                data[12] = erpDataList[j].primeLineNo;
                data[13] = 0;
                if (erpDataList[j].active) {
                    qty = parseInt(qty) + convertedQty;
                }
            }
            erpDataArray[count] = data;
            count++;
        }
        this.setState({
            totalQuantity: this.addCommas(qty),
            displayTotalQty: (qty > 0 ? true : false)
        });

        this.el = jexcel(document.getElementById("tableDiv1"), '');
        this.el.destroy();
        var json = [];
        var data = erpDataArray;
        // var data = [];

        console.log("data-----------------", data)
        var options = {
            data: data,
            columnDrag: true,
            // colWidths: [20, 40, 50, 50, 25, 30, 30, 20, 30, 25],
            colHeaderClasses: ["Reqasterisk"],
            // minDimensions: [9],

            columns: [
                {
                    // title: i18n.t('static.manualTagging.linkColumn'),
                    title: "Link?",
                    type: 'checkbox',
                },
                {
                    title: "erpOrderId",
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.manualTagging.RONO'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.erpPlanningUnit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.erpStatus'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.erpShipmentQty'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.manualTagging.conversionFactor'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.manualTagging.convertedQATShipmentQty'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.notes'),
                    type: 'text',
                },
                {
                    title: 'isChange',
                    type: 'hidden'
                },
                {
                    title: 'orderNo',
                    type: 'hidden'
                },
                {
                    title: 'primeLineNo',
                    type: 'hidden'
                },
                {
                    title: 'erpPlanningUnitId',
                    type: 'hidden'
                }
            ],
            // footers: [['Total','1','1','1','1',0,0,0,0]],
            editable: true,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            // onload: this.loaded,
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
            allowDeleteRow: false,
            onchange: this.changed,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            onpaste: this.onPaste,
            // oneditionend: this.oneditionend,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loadedERP,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return [];
            }.bind(this),

        };
        var instance = jexcel(document.getElementById("tableDiv1"), options);
        this.el = instance;
        this.setState({
            instance, loading: false
        })
    }

    buildJExcel() {
        let manualTaggingList = this.state.outputList;
        console.log("manualTaggingList---->", manualTaggingList);
        let manualTaggingArray = [];
        let count = 0;

        for (var j = 0; j < manualTaggingList.length; j++) {
            data = [];
            if (this.state.active1) {
                data[0] = manualTaggingList[j].shipmentId;
                data[1] = manualTaggingList[j].shipmentTransId;
                data[2] = getLabelText(manualTaggingList[j].planningUnit.label, this.state.lang)
                data[3] = this.formatDate(manualTaggingList[j].expectedDeliveryDate);
                data[4] = getLabelText(manualTaggingList[j].shipmentStatus.label, this.state.lang)
                data[5] = manualTaggingList[j].procurementAgent.code;
                data[6] = manualTaggingList[j].orderNo
                data[7] = this.addCommas(manualTaggingList[j].shipmentQty);
                data[8] = manualTaggingList[j].notes
            } else if (this.state.active2) {
                let shipmentQty = (manualTaggingList[j].shipmentQty / (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? manualTaggingList[j].conversionFactor : 1));
                data[0] = manualTaggingList[j].parentShipmentId;
                data[1] = manualTaggingList[j].shipmentId;
                data[2] = manualTaggingList[j].shipmentTransId;
                data[3] = manualTaggingList[j].roNo + " - " + manualTaggingList[j].roPrimeLineNo + " | " + manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo;
                data[4] = getLabelText(manualTaggingList[j].erpPlanningUnit.label, this.state.lang)
                data[5] = getLabelText(manualTaggingList[j].planningUnit.label, this.state.lang)
                data[6] = this.formatDate(manualTaggingList[j].expectedDeliveryDate);
                data[7] = getLabelText(manualTaggingList[j].shipmentStatus.label, this.state.lang)
                data[8] = this.addCommas(Math.round(manualTaggingList[j].shipmentQty / (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? manualTaggingList[j].conversionFactor : 1)));
                data[9] = (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? this.addCommas(manualTaggingList[j].conversionFactor) : 1);
                data[10] = this.addCommas(shipmentQty * (manualTaggingList[j].conversionFactor != null && manualTaggingList[j].conversionFactor != "" ? manualTaggingList[j].conversionFactor : 1));
                data[11] = manualTaggingList[j].notes
            }
            else {
                data[0] = manualTaggingList[j].erpOrderId;
                data[1] = manualTaggingList[j].roNo + " - " + manualTaggingList[j].roPrimeLineNo + " | " + manualTaggingList[j].orderNo + " - " + manualTaggingList[j].primeLineNo;
                data[2] = getLabelText(manualTaggingList[j].erpPlanningUnit.label, this.state.lang)
                data[3] = this.formatDate(manualTaggingList[j].expectedDeliveryDate);
                data[4] = manualTaggingList[j].erpStatus
                data[5] = this.addCommas(manualTaggingList[j].shipmentQty);

            }
            manualTaggingArray[count] = data;
            count++;
        }

        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = manualTaggingArray;
        if (this.state.active1) {
            var options = {
                data: data,
                columnDrag: true,
                colWidths: [20, 40, 25, 20, 20, 40, 40, 25, 25],
                colHeaderClasses: ["Reqasterisk"],
                columns: [

                    {
                        title: i18n.t('static.commit.qatshipmentId'),
                        type: 'text',
                    },
                    {
                        title: "shipmentTransId",
                        type: 'hidden',
                    },
                    {
                        title: i18n.t('static.supplyPlan.qatProduct'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.supplyPlan.mtshipmentStatus'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.report.procurementAgentName'),
                        type: 'text',
                    }
                    ,
                    {
                        title: i18n.t('static.manualTagging.procOrderNo'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.supplyPlan.shipmentQty'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.common.notes'),
                        type: 'text',
                    },
                ],
                editable: false,
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


                oneditionend: this.onedit,
                copyCompatibility: true,
                allowExport: false,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                position: 'top',
                filters: true,
                license: JEXCEL_PRO_KEY,
                // contextMenu: function (obj, x, y, e) {
                //     var items = [];
                //     if (y != null) {
                //         if (obj.options.allowInsertRow == true) {
                //             items.push({
                //                 title: i18n.t('static.dashboard.linkShipment'),
                //                 onclick: function () {
                //                     // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                //                     var outputListAfterSearch = [];
                //                     let row = this.state.outputList.filter(c => (c.shipmentId == this.el.getValueFromCoords(0, y)))[0];
                //                     console.log("row---------***----", row);
                //                     outputListAfterSearch.push(row);

                //                     this.setState({
                //                         planningUnitId: outputListAfterSearch[0].planningUnit.id,
                //                         shipmentId: this.el.getValueFromCoords(0, y),
                //                         outputListAfterSearch,
                //                         procurementAgentId: outputListAfterSearch[0].procurementAgent.id,
                //                         planningUnitName: row.planningUnit.label.label_en + '(' + row.skuCode + ')'
                //                     })
                //                     console.log("Going to call toggle large 2");
                //                     this.toggleLarge();

                //                 }.bind(this)
                //             });
                //         }
                //     }

                //     return items;
                // }.bind(this)
            };
        }

        else if (this.state.active2) {
            var options = {
                data: data,
                columnDrag: true,
                colWidths: [20, 20, 40, 45, 45, 45, 30, 30, 35, 25, 35, 35],
                colHeaderClasses: ["Reqasterisk"],
                columns: [
                    {
                        title: "Parent Shipment Id",
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.commit.qatshipmentId'),
                        type: 'text',
                    },
                    {
                        title: "shipmentTransId",
                        type: 'hidden',
                    },
                    {
                        title: i18n.t('static.manualTagging.procOrderNo'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.manualTagging.erpPlanningUnit'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.supplyPlan.qatProduct'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.manualTagging.currentEstimetedDeliveryDate'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.manualTagging.erpStatus'),
                        type: 'text',
                    },

                    {
                        title: i18n.t('static.supplyPlan.shipmentQty'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.manualTagging.conversionFactor'),
                        type: 'text',
                    },

                    {
                        title: i18n.t('static.manualTagging.convertedQATShipmentQty'),
                        type: 'text',
                    },

                    {
                        title: i18n.t('static.common.notes'),
                        type: 'text',
                    },
                ],
                editable: false,
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


                oneditionend: this.onedit,
                copyCompatibility: true,
                allowExport: false,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                position: 'top',
                filters: true,
                license: JEXCEL_PRO_KEY,
                // contextMenu: function (obj, x, y, e) {
                //     var items = [];
                //     if (y != null) {
                //         if (obj.options.allowInsertRow == true) {
                //             items.push({
                //                 title: i18n.t('static.dashboard.linkShipment'),
                //                 onclick: function () {
                //                     // console.log("onclick------>", this.el.getValueFromCoords(0, y));
                //                     var outputListAfterSearch = [];
                //                     let row = this.state.outputList.filter(c => (c.shipmentId == this.el.getValueFromCoords(0, y)))[0];
                //                     console.log("row---------***----", row);
                //                     outputListAfterSearch.push(row);

                //                     this.setState({
                //                         planningUnitId: outputListAfterSearch[0].planningUnit.id,
                //                         shipmentId: this.el.getValueFromCoords(0, y),
                //                         outputListAfterSearch,
                //                         procurementAgentId: outputListAfterSearch[0].procurementAgent.id,
                //                         planningUnitName: row.planningUnit.label.label_en + '(' + row.skuCode + ')'
                //                     })
                //                     console.log("Going to call toggle large 2");
                //                     this.toggleLarge();

                //                 }.bind(this)
                //             });
                //         }
                //     }

                //     return items;
                // }.bind(this)
            };
        }
        else if (this.state.active3) {
            var options = {
                data: data,
                columnDrag: true,
                colWidths: [20, 20, 40, 45, 45, 45],
                colHeaderClasses: ["Reqasterisk"],
                columns: [

                    {
                        title: "erpOrderId",
                        type: 'hidden',
                    },
                    {
                        title: i18n.t('static.manualTagging.procOrderNo'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.manualTagging.erpPlanningUnit'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.manualTagging.currentEstimetedDeliveryDate'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.manualTagging.erpStatus'),
                        type: 'text',
                    },

                    {
                        title: i18n.t('static.supplyPlan.shipmentQty'),
                        type: 'text',
                    },
                ],
                editable: false,
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


                oneditionend: this.onedit,
                copyCompatibility: true,
                allowExport: false,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                position: 'top',
                filters: true,
                license: JEXCEL_PRO_KEY,
            };
        }
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 0);
    }
    loadedERP = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
    }

    selected = function (instance, cell, x, y, value) {

        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            var outputListAfterSearch = [];
            let row;
            console.log("instance---", instance);
            console.log("cell---", cell);
            console.log("this.state.outputList---", this.state.outputList);
            if (this.state.active1) {
                row = this.state.outputList.filter(c => (c.shipmentId == this.el.getValueFromCoords(0, x)))[0];
                console.log("row id----------------------->", this.el.getValueFromCoords(0, x));
                console.log("row----------------------->", row);
                outputListAfterSearch.push(row);
                let json = { id: '', label: '' };
                this.setState({
                    roNoOrderNo: json,
                    searchedValue: '',
                    selectedRowPlanningUnit: outputListAfterSearch[0].planningUnit.id
                    // planningUnitIdUpdated: outputListAfterSearch[0].planningUnit.id
                });
            } else if (this.state.active2) {
                console.log("my out put list---", this.state.outputList)
                console.log("my coordinates---", this.el.getValueFromCoords(1, x))
                row = this.state.outputList.filter(c => (c.shipmentId == this.el.getValueFromCoords(1, x)))[0];
                console.log()
                outputListAfterSearch.push(row);
                console.log("selected planning unit id--", outputListAfterSearch[0].erpPlanningUnit.id);
                let json = { id: outputListAfterSearch[0].roNo, label: outputListAfterSearch[0].roNo };
                this.setState({
                    parentShipmentId: outputListAfterSearch[0].parentShipmentId,
                    roNoOrderNo: json,
                    searchedValue: outputListAfterSearch[0].roNo,
                    selectedRowPlanningUnit: outputListAfterSearch[0].erpPlanningUnit.id
                    // planningUnitIdUpdated: outputListAfterSearch[0].erpPlanningUnit.id
                }, () => {

                    this.getOrderDetails();
                });
            } else {
                console.log("my out put list---", this.state.outputList)
                console.log("my coordinates---", this.el.getValueFromCoords(0, x))
                row = this.state.outputList.filter(c => (c.erpOrderId == this.el.getValueFromCoords(0, x)))[0];
                console.log()
                outputListAfterSearch.push(row);
                let json = { id: outputListAfterSearch[0].orderNo, label: outputListAfterSearch[0].orderNo };

                this.setState({
                    selectedShipment: [],
                    roNoOrderNo: json,
                    searchedValue: outputListAfterSearch[0].orderNo,
                    planningUnitIdUpdated: outputListAfterSearch[0].erpPlanningUnit.id
                }, () => {
                    this.filterProgramByCountry();
                    this.getOrderDetails();
                });
            }
            // outputListAfterSearch.push(row);
            // console.log("1------------------------------>>>>", outputListAfterSearch[0].planningUnit.id)
            this.setState({
                planningUnitId: (this.state.active2 || this.state.active3 ? outputListAfterSearch[0].erpPlanningUnit.id : outputListAfterSearch[0].planningUnit.id),
                shipmentId: (this.state.active1 ? this.el.getValueFromCoords(0, x) : (this.state.active2 ? this.el.getValueFromCoords(1, x) : 0)),
                outputListAfterSearch,
                procurementAgentId: (this.state.active3 ? 1 : outputListAfterSearch[0].procurementAgent.id),
                planningUnitName: (this.state.active2 || this.state.active3 ? row.erpPlanningUnit.label.label_en + "(" + row.skuCode + ")" : row.planningUnit.label.label_en + '(' + row.skuCode + ')')
            })
            console.log("Going to call toggle large 3");
            this.toggleLarge();
        }
    }.bind(this);


    componentDidMount() {
        this.hideFirstComponent();
        this.getProgramList();
    }

    getPlanningUnitList() {
        var programId = (this.state.active3 ? this.state.programId1 : this.state.programId);
        console.log("programid---" + this.state.programId);
        if (programId != -1 && programId != null && programId != "") {
            ProgramService.getProgramPlaningUnitListByProgramId(programId)
                .then(response => {
                    if (response.status == 200) {
                        console.log("response.data---" + response.data)
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            planningUnits: listArray
                        }, () => {
                            if (!this.state.active3) {
                                this.getPlanningUnitArray();
                            }
                        })
                    }
                    else {

                        this.setState({
                            message: response.data.messageCode,
                            color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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
                outputList: []
            }, () => {
                this.state.languageEl.destroy();
            })
        }
        // this.filterData();

    }

    formatLabel(cell, row) {
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        } else {
            return "";
        }
    }

    formatPlanningUnitLabel(cell, row) {
        console.log("cell------", cell);
        console.log("row------", row);
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang) + " (" + row.skuCode + ")";
        } else {
            return "";
        }
    }

    toggleLarge() {
        console.log("procurementAgentId---", this.state.procurementAgentId)
        console.log("planning unit in modal---", this.state.planningUnitId);
        // this.getPlanningUnitListByTracerCategory(this.state.planningUnitId, this.state.procurementAgentId);
        this.setState({
            displaySubmitButton: false,
            displayTotalQty: false,
            selectedRowPlanningUnit: this.state.planningUnitId,
            artmisList: [],
            reason: "1",
            totalQuantity: '',
            result: '',
            alreadyLinkedmessage: '',
            manualTag: !this.state.manualTag,
            active4: false,
            active5: false
        })
    }

    addCommas(cell, row) {
        cell += '';
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    formatDate(cell, row) {
        if (cell != null && cell != "") {
            var date = moment(cell).format(`${STRING_TO_DATE_FORMAT}`);
            var dateMonthAsWord = moment(date).format(`${DATE_FORMAT_CAP}`);
            return dateMonthAsWord;
        } else {
            return "";
        }
    }

    render() {
        const selectRow = {
            mode: 'radio',
            clickToSelect: true,
            selectionHeaderRenderer: () => 'Select shipment id',
            headerColumnStyle: {
                headerAlign: 'center'
                // align:  function callback(cell, row, rowIndex, colIndex) { 
                //     console.log("my row----------------------")
                //     return "center" }
            },
            onSelect: (row, isSelect, rowIndex, e) => {
                console.log("my row---", row);
                this.setState({
                    finalShipmentId: row.shipmentId
                });
            }
        };
        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);

        const { countryWisePrograms } = this.state;
        let filteredProgramList = countryWisePrograms.length > 0 && countryWisePrograms.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);


        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0 && planningUnits.map((item, i) => {
            return (
                <option key={i} value={item.planningUnit.id}>
                    {getLabelText(item.planningUnit.label, this.state.lang)}
                </option>
            )
        }, this);


        const { fundingSourceList } = this.state;
        let newFundingSourceList = fundingSourceList.length > 0 && fundingSourceList.map((item, i) => {
            return (
                <option key={i} value={item.fundingSourceId}>
                    {item.fundingSourceCode}
                </option>
            )
        }, this);


        const { filteredBudgetList } = this.state;
        let newBudgetList = filteredBudgetList.length > 0 && filteredBudgetList.map((item, i) => {
            return (
                <option key={i} value={item.budgetId}>
                    {item.budgetCode}
                </option>
            )
        }, this);


        const { notLinkedShipments } = this.state;
        let shipmentIdList = notLinkedShipments.length > 0 && notLinkedShipments.map((item, i) => {
            return (
                <option key={i} value={item.shipmentId}>
                    {item.shipmentId}
                </option>
            )
        }, this);

        const { productCategories } = this.state;
        let productCategoryMultList = productCategories.length > 0 && productCategories.map((item, i) => {
            return ({ label: getLabelText(item.payload.label, this.state.lang), value: item.payload.productCategoryId })
        }, this);

        let planningUnitMultiList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

            }, this);
        const { planningUnits1 } = this.state;
        let planningUnitMultiList1 = planningUnits1.length > 0
            && planningUnits1.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

            }, this);


        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.supplyPlan.qatProduct'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' },
                formatter: this.formatPlanningUnitLabel
            },
            {
                dataField: 'shipmentId',
                text: i18n.t('static.commit.qatshipmentId'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' }
            },
            {
                dataField: 'orderNo',
                text: i18n.t('static.manualTagging.procOrderNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' }
            },
            {
                dataField: 'shipmentTransId',
                hidden: true,
            },
            {
                dataField: 'expectedDeliveryDate',
                text: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate,
                style: { width: '20px' }
            },
            {
                dataField: 'shipmentStatus.label',
                text: i18n.t('static.supplyPlan.mtshipmentStatus'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '20px' },
                formatter: this.formatLabel
            }, {
                dataField: 'procurementAgent.code',
                text: i18n.t('static.report.procurementAgentName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '40px' }
                // formatter: this.formatLabel
            },
            //  {
            //     dataField: 'fundingSource.code',
            //     text: i18n.t('static.fundingSourceHead.fundingSource'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     style: { width: '40px' }
            // },
            // {
            //     dataField: 'budget.label.label_en',
            //     text: i18n.t('static.budgetHead.budget'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     style: { width: '40px' }
            //     // formatter: this.formatLabel
            // },
            {
                dataField: 'shipmentQty',
                text: i18n.t('static.supplyPlan.shipmentQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas,
                style: { width: '25px' }
            },
            {
                dataField: 'notes',
                text: i18n.t('static.common.notes'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '40px' }
                // formatter: this.formatLabel
            }

        ];

        const columns1 = [
            {
                dataField: 'erpOrderId',
                text: i18n.t('static.manualTagging.linkColumn'),
                align: 'center',
                hidden: true,
                headerAlign: 'center'
            },
            {
                dataField: 'roNo',
                text: i18n.t('static.manualTagging.RONO'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'roPrimeLineNo',
                text: i18n.t('static.manualTagging.ROPrimeline'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                // formatter: this.formatLabel
            },
            {
                dataField: 'orderNo',
                text: i18n.t('static.manualTagging.erpShipmentNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'primeLineNo',
                text: i18n.t('static.manualTagging.erpShipmentLineNo'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                // formatter: this.formatLabel
            },
            //  {
            //     dataField: 'orderType',
            //     text: i18n.t('static.manualTagging.OrderType'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     // formatter: this.formatLabel
            // },
            {
                dataField: 'currentEstimatedDeliveryDate',
                text: i18n.t('static.supplyPlan.mtexpectedDeliveryDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
            {
                dataField: 'status',
                text: i18n.t('static.manualTagging.erpStatus'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },

            // {
            //     dataField: 'planningUnitSkuCode',
            //     text: i18n.t('static.manualTagging.planningUnitSKUCode'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     // formatter: this.formatLabel
            // },
            // {
            //     dataField: 'planningUnitLabel',
            //     text: i18n.t('static.planningUnit.planningUnitName'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: this.formatLabel
            // },

            // {
            //     dataField: 'procurementUnitSkuCode',
            //     text: i18n.t('static.manualTagging.procurementUnitSKUCode'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center'
            // },


            // {
            //     dataField: 'supplierName',
            //     text: i18n.t('static.supplier.supplierName'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center'
            // },
            // {
            //     dataField: 'recipentCountry',
            //     text: i18n.t('static.manualTagging.receipentCountry'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center'
            // },
            {
                dataField: 'quantity',
                // text: i18n.t('static.shipment.qty'),
                text: i18n.t('static.manualTagging.erpShipmentQty'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            }
            // {
            //     dataField: 'price',
            //     text: i18n.t('static.manualTagging.price'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: this.addCommas
            // },
            // {
            //     dataField: 'shippingCost',
            //     text: i18n.t('static.manualTagging.shippingCost'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: this.addCommas
            // }
        ];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.outputList.length
            }]
        }

        const { countryList } = this.state;
        let countries = countryList.length > 0
            && countryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountry.id}>
                        {getLabelText(item.realmCountry.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                {/* <Card style={{ display: this.state.loading ? "none" : "block" }}> */}
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardBody className="pb-lg-5">
                        {/* <Col md="10 ml-0"> */}
                        <div className="col-md-12 pl-0">
                            <Row>
                                <FormGroup className="pl-3">
                                    {/* <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label> */}
                                    <FormGroup check inline style={{ 'marginLeft': '-52px' }}>
                                        <Input
                                            className="form-check-input"
                                            type="radio"
                                            id="active1"
                                            name="active"
                                            value={true}
                                            //checked={this.state.user.active === true}
                                            onChange={(e) => { this.dataChange(e) }}
                                        />
                                        <Label
                                            className="form-check-label"
                                            check htmlFor="inline-radio1">
                                            {i18n.t('static.mt.notLinkedQAT')}
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check inline>
                                        <Input
                                            className="form-check-input"
                                            type="radio"
                                            id="active2"
                                            name="active"
                                            value={false}
                                            //checked={this.state.user.active === false}
                                            onChange={(e) => { this.dataChange(e) }}
                                        />
                                        <Label
                                            className="form-check-label"
                                            check htmlFor="inline-radio2">
                                            {i18n.t('static.mt.linked')}
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check inline>
                                        <Input
                                            className="form-check-input"
                                            type="radio"
                                            id="active3"
                                            name="active"
                                            value={false}
                                            //checked={this.state.user.active === false}
                                            onChange={(e) => { this.dataChange(e) }}
                                        />
                                        <Label
                                            className="form-check-label"
                                            check htmlFor="inline-radio2">
                                            {i18n.t('static.mt.notLinkedERP')}
                                        </Label>
                                    </FormGroup>
                                </FormGroup>
                            </Row>
                        </div>
                        {/* </Col> */}


                        <div className="col-md-12 pl-0">
                            <Row>
                                {this.state.active3 &&
                                    <>
                                        <FormGroup className="col-md-3 ">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.region.country')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="countryId"
                                                        id="countryId"
                                                        bsSize="sm"
                                                        value={this.state.countryId}
                                                        onChange={(e) => { this.countryChange(e); }}
                                                    >
                                                        <option value="-1">{i18n.t('static.common.all')}</option>
                                                        {countries}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.productcategory')}</Label>
                                            <div className="controls ">
                                                {/* <InMultiputGroup> */}
                                                <MultiSelect
                                                    // type="select"
                                                    name="productCategoryId"
                                                    id="productCategoryId"
                                                    bsSize="sm"
                                                    value={this.state.productCategoryValues}
                                                    onChange={(e) => { this.handleProductCategoryChange(e) }}
                                                    options={productCategoryMultList && productCategoryMultList.length > 0 ? productCategoryMultList : []}
                                                />

                                            </div>
                                        </FormGroup>
                                    </>}
                                {(this.state.active1 || this.state.active2) &&
                                    <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
                                        <div className="controls ">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="programId"
                                                    id="programId"
                                                    bsSize="sm"
                                                    value={this.state.programId}
                                                    // onChange={this.getPlanningUnitList}
                                                    onChange={(e) => { this.programChange(e); }}
                                                >
                                                    <option value="-1">{i18n.t('static.common.select')}</option>
                                                    {programList}
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>}
                                {this.state.active3 &&
                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                        <div className="controls ">
                                            {/* <InMultiputGroup> */}
                                            <MultiSelect
                                                // type="select"
                                                name="planningUnitId2"
                                                id="planningUnitId2"
                                                bsSize="sm"
                                                value={this.state.planningUnitValues}
                                                onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                options={planningUnitMultiList1 && planningUnitMultiList1.length > 0 ? planningUnitMultiList1 : []}
                                            />
                                            {/* <option value="0">{i18n.t('static.common.select')}</option> */}
                                            {/* {planningUnitList} */}

                                            {/* </MultiSelect> */}

                                            {/* </InputMultiGroup> */}
                                        </div>
                                    </FormGroup>}


                                {(this.state.active1 || this.state.active2) &&
                                    <FormGroup className="col-md-3">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                        <div className="controls ">
                                            {/* <InMultiputGroup> */}
                                            <MultiSelect
                                                // type="select"
                                                name="planningUnitId"
                                                id="planningUnitId"
                                                bsSize="sm"
                                                value={this.state.hasSelectAll ? planningUnitMultiList : this.state.planningUnitValues}
                                                onChange={(e) => { this.filterData(e) }}
                                                options={planningUnitMultiList && planningUnitMultiList.length > 0 ? planningUnitMultiList : []}
                                                labelledBy={i18n.t('static.common.select')}
                                            />
                                            {/* <option value="0">{i18n.t('static.common.select')}</option> */}
                                            {/* {planningUnitList} */}

                                            {/* </MultiSelect> */}

                                            {/* </InputMultiGroup> */}
                                        </div>
                                    </FormGroup>}
                            </Row>

                            <div className="ReportSearchMarginTop">
                                <div id="tableDiv" className="jexcelremoveReadonlybackground">
                                </div>
                            </div>

                        </div>


                        {/* Consumption modal */}
                        <Modal isOpen={this.state.manualTag}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <div style={{ display: this.state.loading1 ? "none" : "block" }}>
                                <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan hideCross">
                                    <strong>{i18n.t('static.manualTagging.searchErpOrders')}</strong>
                                </ModalHeader>
                                <ModalBody>
                                    <div>
                                        <p><h5><b>{i18n.t('static.manualTagging.qatShipmentTitle')}</b></h5></p>
                                        {!this.state.active3 &&
                                            <ToolkitProvider
                                                keyField="optList"
                                                data={this.state.outputListAfterSearch}
                                                columns={columns}
                                                search={{ searchFormatted: true }}
                                                hover
                                                filter={filterFactory()}
                                            >
                                                {
                                                    props => (
                                                        <div className="TableCust FortablewidthMannualtaggingtable2 ">
                                                            {/* <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                                    <SearchBar {...props.searchProps} />
                                                    <ClearSearchButton {...props.searchProps} />
                                                </div> */}
                                                            <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                                // pagination={paginationFactory(options)}
                                                                rowEvents={{
                                                                }}
                                                                {...props.baseProps}
                                                            />
                                                        </div>
                                                    )
                                                }
                                            </ToolkitProvider>}
                                        {this.state.active3 &&
                                            <>
                                                <div className="col-md-12">
                                                    <Row>

                                                        <FormGroup className="pl-3">
                                                            {/* <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label> */}
                                                            <FormGroup check inline style={{ 'marginLeft': '-52px' }}>
                                                                <Input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    id="active4"
                                                                    name="active"
                                                                    value={true}
                                                                    //checked={this.state.user.active === true}
                                                                    onChange={(e) => { this.dataChange1(e) }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio1">
                                                                    {'Create New Shipment'}
                                                                </Label>
                                                            </FormGroup>
                                                            <FormGroup check inline>
                                                                <Input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    id="active5"
                                                                    name="active"
                                                                    value={false}
                                                                    //checked={this.state.user.active === false}
                                                                    onChange={(e) => { this.dataChange1(e) }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio2">
                                                                    {'Select Existing Shipment'}
                                                                </Label>
                                                            </FormGroup>
                                                        </FormGroup>

                                                    </Row>
                                                    <Row>
                                                        {(this.state.active4 || this.state.active5) &&
                                                            <FormGroup className="col-md-3 ">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
                                                                <div className="controls ">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="programId1"
                                                                            id="programId1"
                                                                            bsSize="sm"
                                                                            value={this.state.programId1}
                                                                            // onChange={this.getPlanningUnitList}
                                                                            onChange={(e) => { this.programChangeModal(e); }}
                                                                        >
                                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                                            {filteredProgramList}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>}
                                                        {this.state.active5 &&
                                                            <FormGroup className="col-md-3 pl-0">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.commit.qatshipmentId')}</Label>
                                                                <div className="controls ">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="notLinkedShipmentId"
                                                                            id="notLinkedShipmentId"
                                                                            bsSize="sm"
                                                                            onChange={this.displayShipmentData}
                                                                        >
                                                                            <option value="0">{i18n.t('static.common.all')}</option>
                                                                            {shipmentIdList}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>}
                                                        {(this.state.active4 || this.state.active5) &&
                                                            <FormGroup className="col-md-3 ">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                                                <div className="controls ">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="planningUnitId1"
                                                                            id="planningUnitId1"
                                                                            bsSize="sm"
                                                                            // value={this.state.programId}
                                                                            onChange={this.displayShipmentData}
                                                                        // onChange={(e) => { this.programChange(e); this.getPlanningUnitList(e) }}
                                                                        >
                                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                                            {planningUnitList}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>}
                                                        {this.state.active4 &&
                                                            <FormGroup className="col-md-3 ">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                                                                <div className="controls ">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="fundingSourceId"
                                                                            id="fundingSourceId"
                                                                            bsSize="sm"
                                                                            value={this.state.fundingSourceId}
                                                                            // onChange={this.getBudgetListByFundingSourceId}
                                                                            onChange={(e) => { this.fundingSourceModal(e); this.getBudgetListByFundingSourceId(e) }}
                                                                        >
                                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                                            {newFundingSourceList}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>}
                                                        {this.state.active4 &&
                                                            <FormGroup className="col-md-3 ">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.budget')}</Label>
                                                                <div className="controls ">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="budgetId"
                                                                            id="budgetId"
                                                                            bsSize="sm"
                                                                            value={this.state.budgetId}
                                                                            // onChange={this.getPlanningUnitList}
                                                                            onChange={(e) => { this.budgetChange(e) }}
                                                                        >
                                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                                            {newBudgetList}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>}
                                                    </Row>
                                                </div>
                                                {this.state.active5 &&
                                                    <ToolkitProvider
                                                        keyField="shipmentId"
                                                        data={this.state.selectedShipment}
                                                        columns={columns}
                                                        search={{ searchFormatted: true }}
                                                        hover
                                                        filter={filterFactory()}
                                                    >
                                                        {
                                                            props => (
                                                                <div className="TableCust FortablewidthMannualtaggingtable1 height-auto">

                                                                    <BootstrapTable
                                                                        // keyField='erpOrderId'
                                                                        ref={n => this.node = n}
                                                                        selectRow={selectRow}
                                                                        hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell

                                                                        rowEvents={{

                                                                        }}
                                                                        {...props.baseProps}
                                                                    />
                                                                </div>
                                                            )
                                                        }
                                                    </ToolkitProvider>}
                                            </>
                                        }
                                    </div><br />
                                    <div>
                                        <p><h5><b>{i18n.t('static.manualTagging.erpShipment')}</b></h5></p>
                                        <Col md="12 pl-0">
                                            <div className="d-md-flex">
                                                <FormGroup className="col-md-4">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.manualTagging.erpPlanningUnit')}</Label>
                                                    <div className="controls ">
                                                        <Autocomplete
                                                            id="combo-box-demo1"
                                                            // value={this.state.selectedPlanningUnit}
                                                            // defaultValue={{ id: this.state.planningUnitIdUpdated, label: this.state.planningUnitName }}
                                                            options={this.state.tracercategoryPlanningUnit}
                                                            getOptionLabel={(option) => option.label}
                                                            style={{ width: 300 }}
                                                            onChange={(event, value) => {
                                                                // this.getOrderDetails()
                                                                console.log("demo2 value---", value);
                                                                if (value != null) {
                                                                    console.log("Inside ");
                                                                    this.setState({
                                                                        erpPlanningUnitId: value.value,
                                                                        planningUnitIdUpdated: value.value,
                                                                        planningUnitName: value.label
                                                                    }, () => { this.getOrderDetails() });
                                                                } else {
                                                                    this.setState({
                                                                        erpPlanningUnitId: '',
                                                                        planningUnitIdUpdated: '',
                                                                        planningUnitName: ''
                                                                    }, () => { this.getOrderDetails() });
                                                                }

                                                            }} // prints the selected value
                                                            renderInput={(params) => <TextField
                                                                {...params}
                                                                // InputProps={{ style: { fontSize: 12.24992 } }}
                                                                variant="outlined"
                                                                onChange={(e) => this.getPlanningUnitListByTracerCategory(e.target.value)} />}
                                                        />

                                                    </div>
                                                </FormGroup>

                                                <FormGroup className="col-md-3 pl-0">
                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.manualTagging.search')}</Label>
                                                    <div className="controls "
                                                    >
                                                        <Autocomplete
                                                            id="combo-box-demo"
                                                            // value={this.state.roNoOrderNo}
                                                            defaultValue={this.state.roNoOrderNo}
                                                            options={this.state.autocompleteData}
                                                            getOptionLabel={(option) => option.label}
                                                            style={{ width: 300 }}
                                                            onChange={(event, value) => {
                                                                console.log("combo 2 ro combo box---", value)
                                                                if (value != null) {
                                                                    console.log("Inside if");
                                                                    this.setState({
                                                                        searchedValue: value.label
                                                                        ,
                                                                        roNoOrderNo: value.label
                                                                    }, () => { this.getOrderDetails() });
                                                                } else {
                                                                    console.log("combo 2 Inside else");
                                                                    this.setState({
                                                                        searchedValue: ''
                                                                        // , roNoOrderNo: '' 
                                                                    }, () => { this.getOrderDetails() });
                                                                }

                                                            }} // prints the selected value
                                                            renderInput={(params) => <TextField {...params} variant="outlined"
                                                                onChange={(e) => {
                                                                    console.log("combo 2 input change called ");
                                                                    this.searchErpOrderData(e.target.value)
                                                                }} />}
                                                        />

                                                    </div>
                                                </FormGroup>

                                            </div>
                                        </Col>
                                        <div id="tableDiv1" className="RemoveStriped">
                                        </div>

                                    </div><br />


                                    {/* <h5> {this.state.reason != "" && this.state.reason != 1 && <div style={{ color: 'red' }}>Note : {i18n.t(this.state.reason)}</div>}</h5> */}
                                    {/* <h5><div style={{ color: 'red' }} >
                                        {i18n.t(this.state.result)}</div></h5> */}
                                    {/* <h5 style={{ color: 'red' }}>{i18n.t(this.state.alreadyLinkedmessage)}</h5> */}
                                </ModalBody>
                                <ModalFooter>
                                    {this.state.displayTotalQty && <b><h3 className="float-right">Total Quantity : {this.state.totalQuantity}</h3></b>}

                                    {this.state.displaySubmitButton && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.link}> <i className="fa fa-check"></i>{(this.state.active2 ? "Update" : i18n.t('static.manualTagging.link'))}</Button>}

                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.cancelClicked()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </div>
                            <div style={{ display: this.state.loading1 ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                        <div class="spinner-border blue ml-4" role="status">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                        {/* Consumption modal */}
                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}
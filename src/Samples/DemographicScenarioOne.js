import React, { Component } from 'react';
import {
    JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY,
    JEXCEL_DATE_FORMAT_SM,
    API_URL

} from '../Constants.js';
import { OrgDiagram } from 'basicprimitivesreact';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType, LevelAnnotationConfig, AnnotationType, LineType, Thickness } from 'basicprimitives';
import { DndProvider, DropTarget, DragSource } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faEdit, faDigitalTachograph } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../i18n'
import {
    Col, Row, Card, Button, FormGroup, Label, Input, Modal, ModalBody, ModalFooter, ModalHeader, CardHeader,
    FormFeedback, Form
} from 'reactstrap';
import Select from 'react-select';
import { Formik } from 'formik';
import '../views/Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import ProgramService from "../api/ProgramService";
import HealthAreaService from "../api/HealthAreaService";
import getLabelText from '../CommonComponent/getLabelText';
import classNames from 'classnames';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import TreeData from './TreeData';
import CardBody from 'reactstrap/lib/CardBody';
import CardFooter from 'reactstrap/lib/CardFooter';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import 'react-tabs/style/react-tabs.css';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import * as Yup from 'yup';
import "../../node_modules/jsuites/dist/jsuites.css";
import moment from 'moment';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationService from '../views/Common/AuthenticationService';
import AuthenticationServiceComponent from '../views/Common/AuthenticationServiceComponent';

const entityname = i18n.t('static.forecastProgram.forecastProgram');
let initialValues = {
    realmId: '',
    realmCountryId: '',
    healthAreaId: [],
    organisationId: '',
    programName: '',
    programCode: '',
    programCode1: '',
    userId: '',
    customField1: '',
    customField2: '',
    customField3: '',
    programNotes: '',
}

const validationSchema = function (values) {
    return Yup.object().shape({

        // realmId: Yup.string()
        //     .required(i18n.t('static.common.realmtext')),
        // realmCountryId: Yup.string()
        //     .required(i18n.t('static.program.validcountrytext')),
        // healthAreaId: Yup.string()
        //     .required(i18n.t('static.program.validhealthareatext')),
        // organisationId: Yup.string()
        //     .required(i18n.t('static.program.validorganisationtext')),
        programName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.program.validprogramtext')),
        userId: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        customField1: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        customField2: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        customField3: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
    })
}

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

export default class DemographicScenarioOne extends Component {
    constructor() {
        super();
        // this.onRemoveItem = this.onRemoveItem.bind(this);
        // this.canDropItem = this.canDropItem.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.createNewTree = this.createNewTree.bind(this);

        this.buildJexcel = this.buildJexcel.bind(this);
        // this.dataChange = this.dataChange.bind(this);
        this.buildJexcelForFrecastOutPut = this.buildJexcelForFrecastOutPut.bind(this);
        this.loadedFunctionForMergeProblemList = this.loadedFunctionForMergeProblemList.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.generateCode = this.generateCode.bind(this);
        this.realmList = this.realmList.bind(this);
        this.getRealmCountryList = this.getRealmCountryList.bind(this);
        this.getProgramManagerList = this.getProgramManagerList.bind(this);
        this.getHealthAreaList = this.getHealthAreaList.bind(this);
        this.getOrganisationList = this.getOrganisationList.bind(this);
        this.state = {
            forecastOutPutEl: "",
            treeEl: '',
            treeObj: [{
                forecastDatasetName: 'AGO-CON-MOH',
                forecastMethod: 'Demographic',
                treeName: 'Angola Demographic Tree',
                scenarioName: 'High,Medium',
                status: 'Active',
                createdDate: '2021-07-21',
                createdBy: 'Anchal C',
                lastModifiedDate: '2021-07-21',
                lastModifiedBy: 'Anchal C'
            }, {
                forecastDatasetName: 'AGO-CON-MOH',
                forecastMethod: 'Consumption',
                treeName: 'Angola Consumption Tree',
                scenarioName: 'Medium',
                status: 'Active',
                createdDate: '2021-07-21',
                createdBy: 'Anchal C',
                lastModifiedDate: '2021-07-21',
                lastModifiedBy: 'Anchal C'
            },
            {
                forecastDatasetName: 'AGO-CON-MOH',
                forecastMethod: 'Morbidity',
                treeName: 'Angola Morbidity Tree',
                scenarioName: 'High,Medium,Low',
                status: 'Active',
                createdDate: '2021-07-21',
                createdBy: 'Anchal C',
                lastModifiedDate: '2021-07-21',
                lastModifiedBy: 'Anchal C'
            }],


            activeTab: new Array(3).fill('1'),
            openAddNodeModal: false,
            openEditNodeModal: false,
            title: '',
            cursorItem: 0,
            highlightItem: 0,
            nodeDetail: '',
            items: TreeData.demographic_scenario_one,
            currentItemConfig: {
                nodeType: -1,
                nodeValueType: -1,
                dosageSet: {
                    dosageSetId: '-1',
                    dosage: {
                        forecastingUnit: { id: '-1' },
                        fuPerApplication: '',
                        noOfTimesPerDay: '',
                        chronic: '',
                        noOfDaysPerMonth: ''
                    }
                }
            },

            uniqueCode: '',
            program: {
                programCode: '<%RC%>-<%TA%>-<%OR%>-',
                label: {
                    label_en: 'Benin PRH,Condoms Forecast Dataset',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realm: {
                    realmId: 1,
                },
                realmCountry: {
                    realmCountryId: 5,
                    country: {
                        label: {
                            label_en: "Benin",
                            label_sp: '',
                            label_pr: '',
                            label_fr: ''
                        }
                    },
                    realm: {
                        realmId: 1,
                        label: {
                            label_en: 'Global Health',
                            label_sp: '',
                            label_pr: '',
                            label_fr: ''
                        }
                    }
                },
                organisation: {
                    id: 1,
                    label: {
                        label_en: 'Ministry of Health',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }

                },
                programManager: {
                    userId: 2,
                    label: {
                        label_en: 'Alan George',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                programNotes: 'Benin PRH,Condoms Forecast Dataset',
                healthAreaArray: [],
                customField1: 'customField1',
                customField2: 'customField2',
                customField3: 'customField3',


            },
            lang: localStorage.getItem('lang'),
            realmList: [],
            realmCountryList: [],
            organisationList: [],
            healthAreaList: [
                { value: 1, label: "a" },
                { value: 2, label: "b" },
                { value: 3, label: "c" },
            ],
            programManagerList: [],
            message: '',
            loading: true,
            healthAreaCode: '',
            organisationCode: '',
            realmCountryCode: '',
            healthAreaId: '1,2',

        }

    }

    dataChange(event) {

    }

    generateCode() {
        this.realmList();
        this.getRealmCountryList(1);
        this.getProgramManagerList(1);
        this.getHealthAreaList(5);
        this.getOrganisationList(5);
    }

    getRealmCountryList(realmId) {
        // console.log("in get realmCOuntry list----->", realmId);
        ProgramService.getRealmCountryList(realmId)
            .then(response => {
                if (response.status == 200) {
                    // var realmCountries = response.data.filter(c => c.active == true );
                    var listArray = response.data.filter(c => c.active == true);
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmCountryList: listArray
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
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

    getProgramManagerList(realmId) {
        ProgramService.getProgramManagerList(realmId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.username.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.username.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        programManagerList: listArray
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
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

    getHealthAreaList(realmCountryId) {
        ProgramService.getHealthAreaListByRealmCountryId(realmCountryId)
            .then(response => {
                if (response.status == 200) {
                    // console.log("response------>0", response.data);
                    var json = (response.data).filter(c => c.active == true);
                    var regList = [{ value: "-1", label: i18n.t("static.common.all") }];
                    for (var i = 0; i < json.length; i++) {
                        regList[i + 1] = { value: json[i].healthAreaId, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    // console.log("response------>1", regList);
                    var listArray = regList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    // console.log("response------>2", listArray);
                    this.setState({
                        healthAreaList: listArray
                    }, (
                    ) => {
                        // console.log("healthAreaList>>>>>>>", this.state.healthAreaList);
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }).catch(
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

    getOrganisationList(realmCountryId) {
        ProgramService.getOrganisationListByRealmCountryId(realmCountryId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        organisationList: listArray
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
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


    realmList() {
        HealthAreaService.getRealmList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmList: listArray,
                        loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
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

    createNewTree() {
        this.props.history.push(`/morbidity/scenarioOne`)
    }
    componentDidMount() {
        this.buildJexcelForFrecastOutPut();
        this.buildJexcel();
        this.generateCode();
    }
    createNewTree() {
        this.props.history.push(`/morbidity/scenarioOne`)
    }
    buildJexcelForFrecastOutPut() {
        // this.forecastOutPutEl = jexcel(document.getElementById("forecastOutPutDiv"), '');
        // this.forecastOutPutEl.destroy();
        var options = {
            data: [{ 0: '1', 1: '1', 2: '1', 3: '1', 4: '1', 5: '1', 6: '20' }],
            columnDrag: true,
            colWidths: [50, 50, 50, 50, 50, 50, 50],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Tree Name',
                    type: 'dropdown',
                    source: [{ 'id': '0', 'name': 'Please select' }, { 'id': '1', 'name': 'Demographic tree for Ben PRH/Con' }, { 'id': '2', 'name': 'Morbidity tree for Ben Malaria' }]
                },

                {
                    title: 'Scenarion',
                    type: 'dropdown',
                    source: [{ 'id': '0', 'name': 'Please select' }, { 'id': '1', 'name': 'High' }, { 'id': '2', 'name': 'Medium' }, { 'id': '3', 'name': 'Low' }]
                },
                {
                    title: 'Forecasting Unit',
                    type: 'dropdown',
                    source: [{ 'id': '0', 'name': 'Please select' }, { 'id': '1', 'name': 'Artemeter 1x6' }, { 'id': '2', 'name': 'Primaquite 7.5mg' }, { 'id': '3', 'name': 'Paracetamol' }]
                },
                {
                    title: 'Planning Unit',
                    type: 'dropdown',
                    source: [{ 'id': '0', 'name': 'Please select' }, { 'id': '1', 'name': 'Microplate, PCR, 96-Well, Clear, Low Profile, Unskirted, Max 200 uL/Well, 10 Each' }, { 'id': '2', 'name': 'Ammonium Sulfate, ACS Reagent, 500 gm' }, { 'id': '3', 'name': 'Darunavir/Ritonavir 400/50mg Tablet, 60 Tablets' }]
                },
                {
                    title: 'Supply Plan Dataset',
                    type: 'dropdown',
                    source: [{ 'id': '0', 'name': 'Please select' }, { 'id': '1', 'name': 'AGO-CON-NACP' }, { 'id': '2', 'name': 'BEN-ARV-TBD' }, { 'id': '3', 'name': 'BWA-CON-TBD' }]
                },
                {
                    title: i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit'),
                    type: 'dropdown',
                    source: [{ 'id': '0', 'name': 'Please select' }, { 'id': '1', 'name': 'Microplate, PCR, 96-Well, Clear, Low Profile, Unskirted, Max 200 uL/Well, 10 Each' }, { 'id': '2', 'name': 'Ammonium Sulfate, ACS Reagent, 500 gm' }, { 'id': '3', 'name': 'Darunavir/Ritonavir 400/50mg Tablet, 60 Tablets' }]
                },
                {
                    title: 'Value (%)',
                    type: 'text',
                },
            ],
            pagination: localStorage.getItem("sesRecordCount"),
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            search: true,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            editable: true,
            onload: this.loadedFunctionForMergeProblemList,
            filters: true,
            license: JEXCEL_PRO_KEY,
            // text: {
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
        }

        var forecastOutPutJexcelVar = jexcel(document.getElementById("forecastOutPutDiv"), options);
        this.el = forecastOutPutJexcelVar;
        this.setState({ forecastOutPutEl: forecastOutPutJexcelVar });
    }
    loadedFunctionForMergeProblemList = function (instance) {
        jExcelLoadedFunction(instance);
    }
    addRowInJexcel() {
        var obj = this.state.forecastOutPutEl;
        // console.log("obj++++",obj);
        var data = [];
        data[0] = "0";
        data[1] = "0";
        data[2] = "0";
        data[3] = "0";
        data[4] = "0";
        data[5] = "0";
        data[6] = "0";
        // console.log("data+++",data);
        obj.insertRow(data);
    }


    buildJexcel() {
        let treeList = this.state.treeObj;
        // console.log("dataSourceList---->", dataSourceList);
        let treeArray = [];
        let count = 0;

        for (var j = 0; j < treeList.length; j++) {
            data = [];
            data[0] = treeList[j].forecastDatasetName
            data[1] = treeList[j].forecastMethod
            data[2] = treeList[j].treeName
            data[3] = treeList[j].scenarioName
            data[4] = treeList[j].createdBy;
            data[5] = treeList[j].createdDate;
            data[6] = treeList[j].lastModifiedBy;
            data[7] = treeList[j].lastModifiedDate;
            // data[6] = (dataSourceList[j].lastModifiedDate ? moment(dataSourceList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[8] = treeList[j].status;
            treeArray[count] = data;
            count++;
        }
        // if (dataSourceList.length == 0) {
        //     data = [];
        //     dataSourceArray[0] = data;
        // }
        // console.log("dataSourceArray---->", dataSourceArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var json = [];
        var data = treeArray;

        var options = {
            data: data,
            columnDrag: true,
            // colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Forecast Dataset',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Forecast Method',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Tree Name',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Scenario Name',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.createdBy'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.createdDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    readOnly: true
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
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    readOnly: true,
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },

            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
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
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: 'Delete',
                            onclick: function () {

                            }.bind(this)
                        });
                    }
                }

                return items;
            }.bind(this),
        };
        var treeEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = treeEl;
        this.setState({
            treeEl: treeEl, loading: false
        })
    }

    loaded = function (instance) {
        jExcelLoadedFunction(instance);
    }

    buildJexcel() {
        let treeList = this.state.treeObj;
        // console.log("dataSourceList---->", dataSourceList);
        let treeArray = [];
        let count = 0;

        for (var j = 0; j < treeList.length; j++) {
            data = [];
            data[0] = treeList[j].forecastDatasetName
            data[1] = treeList[j].forecastMethod
            data[2] = treeList[j].treeName
            data[3] = treeList[j].scenarioName
            data[4] = treeList[j].createdBy;
            data[5] = treeList[j].createdDate;
            data[6] = treeList[j].lastModifiedBy;
            data[7] = treeList[j].lastModifiedDate;
            // data[6] = (dataSourceList[j].lastModifiedDate ? moment(dataSourceList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[8] = treeList[j].status;
            treeArray[count] = data;
            count++;
        }
        // if (dataSourceList.length == 0) {
        //     data = [];
        //     dataSourceArray[0] = data;
        // }
        // console.log("dataSourceArray---->", dataSourceArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var json = [];
        var data = treeArray;

        var options = {
            data: data,
            columnDrag: true,
            // colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Forecast Dataset',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Forecast Method',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Tree Name',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Scenario Name',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.createdBy'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.createdDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    readOnly: true
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
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    readOnly: true,
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },

            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            // tableOverflow: true,
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
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: 'Delete',
                            onclick: function () {

                            }.bind(this)
                        });
                    }
                }

                return items;
            }.bind(this),
        };
        var treeEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = treeEl;
        this.setState({
            treeEl: treeEl, loading: false
        })
    }

    loaded = function (instance) {
        jExcelLoadedFunction(instance);
    }

    toggle(tabPane, tab) {
        const newArray = this.state.activeTab.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab: newArray,
        });
    }

    resetTree() {
        // console.log("in reset>>>", TreeData.demographic_scenario_one);
        window.location.reload();
    }
    dataChange(event) {
        // alert("hi");
        let { currentItemConfig } = this.state;
        if (event.target.name === "nodeTitle") {
            currentItemConfig.title = event.target.value;
        }
        if (event.target.name === "nodeValueType") {
            currentItemConfig.nodeValueType = event.target.value;
        }
        if (event.target.name === "nodeType") {
            currentItemConfig.nodeType = event.target.value;
        }
        if (event.target.name === "percentage") {
            currentItemConfig.nodePercentage = event.target.value;
        }
        // if (event.target.name === "dosage") {
        //     currentItemConfig.dosage = event.target.value;
        // }
        if (event.target.name === "dosageSet") {
            currentItemConfig.dosageSet.dosageSetId = event.target.value;
        }
        if (event.target.name === "scaling") {
            currentItemConfig.scaling = event.target.value;
        }
        if (event.target.name === "forecastingUnit") {
            currentItemConfig.dosageSet.dosage.forecastingUnit.id = event.target.value;
        }
        if (event.target.name === "fuPerApplication") {
            currentItemConfig.dosageSet.dosage.fuPerApplication = event.target.value;
        }
        if (event.target.name === "noOfTimesPerDay") {
            currentItemConfig.dosageSet.dosage.noOfTimesPerDay = event.target.value;
        }
        if (event.target.name === "noOfDaysPerMonth") {
            currentItemConfig.dosageSet.dosage.noOfDaysPerMonth = event.target.value;
        }
        this.setState({ currentItemConfig: currentItemConfig });
    }
    onAddButtonClick(itemConfig) {
        this.setState({ openAddNodeModal: true, openEditNodeModal: false, clickedParnetNodeId: itemConfig.id, clickedParnetNodeValue: itemConfig.nodeValue });

    }
    addNode() {
        const { items } = this.state;
        var calculateValue = parseInt(this.state.clickedParnetNodeValue) * this.state.currentItemConfig.nodePercentage / 100;
        // console.log(">>>", parseInt(this.state.clickedParnetNodeValue));
        // console.log(">>>", this.state.currentItemConfig.nodePercentage / 100);
        var newItem = {
            id: parseInt(items.length + 1),
            parent: this.state.clickedParnetNodeId,
            title: this.state.currentItemConfig.title,
            nodePercentage: this.state.currentItemConfig.nodePercentage,
            nodeValue: calculateValue,
            nodeType: this.state.currentItemConfig.nodeType,
            description: "",
            itemTitleColor: Colors.White,
            titleTextColor: Colors.Black,
            // dosage: this.state.currentItemConfig.dosage,

            nodeValueColor: this.state.currentItemConfig.nodeType == 2 ? Colors.White : Colors.Black,
            nodeBackgroundColor: this.state.currentItemConfig.nodeType == 2 ? Colors.Black : Colors.White,
            borderColor: this.state.currentItemConfig.nodeType == 2 ? Colors.White : Colors.Black,

            dosageSet: {
                dosageSetId: this.state.currentItemConfig.dosageSet.dosageSetId,
                label: {
                    id: '123',
                    label_en: 'Condoms'
                },
                dosage: {
                    forecastingUnit: {
                        id: this.state.currentItemConfig.dosageSet.dosage.forecastingUnit.id,
                        label: {
                            id: '456',
                            label_en: 'Male Condom (Latex) Lubricated, No Logo, 49 mm Male Condom'
                        }
                    },
                    fuPerApplication: this.state.currentItemConfig.dosageSet.dosage.fuPerApplication,
                    noOfTimesPerDay: this.state.currentItemConfig.dosageSet.dosage.noOfTimesPerDay,
                    chronic: false,
                    noOfDaysPerMonth: this.state.currentItemConfig.dosageSet.dosage.noOfDaysPerMonth,
                    totalQuantity: parseInt(this.state.currentItemConfig.dosageSet.dosage.noOfDaysPerMonth) * parseInt(this.state.clickedParnetNodeValue)

                }
            },

        }

    }

    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    touchAll(setTouched, errors) {
        setTouched({
            programName: true,
            realmId: true,
            realmCountryId: true,
            organisationId: true,
            userId: true,
            healthAreaId: true,
            customField1: true,
            customField2: true,
            customField3: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('programForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstError(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }


    tabPane() {

        const { realmList } = this.state;
        let realms = realmList.length > 0
            && realmList.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { realmCountryList } = this.state;
        let realmCountries = realmCountryList.length > 0
            && realmCountryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lang)}
                        {/* {item.country.countryCode} */}
                    </option>
                )
            }, this);

        const { programManagerList } = this.state;
        let programManagers = programManagerList.length > 0
            && programManagerList.map((item, i) => {
                return (
                    <option key={i} value={item.userId}>
                        {item.username}
                    </option>
                )
            }, this);

        const { organisationList } = this.state;
        let realmOrganisation = organisationList.length > 0
            && organisationList.map((item, i) => {
                return (
                    <option key={i} value={item.organisationId}>
                        {/* {item.organisationCode} */}
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        return (
            <>
                <TabPane tabId="1">
                    <div className="animated fadeIn">
                        <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} loading={this.changeLoading} />
                        <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                        <Row style={{ display: this.state.loading ? "none" : "block" }}>
                            <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                                <Card>
                                    <Formik
                                        enableReinitialize={true}
                                        initialValues={{
                                            realmId: this.state.program.realm.realmId,
                                            realmCountryId: this.state.program.realmCountry.realmCountryId,
                                            healthAreaId: this.state.healthAreaId,
                                            organisationId: this.state.program.organisation.id,
                                            programName: this.state.program.label.label_en,
                                            programCode: this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode,
                                            programCode1: this.state.uniqueCode,
                                            userId: this.state.program.programManager.userId,
                                            customField1: this.state.program.customField1,
                                            customField2: this.state.program.customField2,
                                            customField3: this.state.program.customField3,
                                            programNotes: this.state.program.programNotes,
                                        }}
                                        validate={validate(validationSchema)}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {
                                            // this.setState({
                                            //     loading: true
                                            // })

                                            // let pro = this.state.program;
                                            // pro.programCode = this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode + (this.state.uniqueCode.toString().length > 0 ? ("-" + this.state.uniqueCode) : "");
                                            // console.log("Pro=---------------->+++", pro)
                                            // ProgramService.editProgram(pro).then(response => {
                                            //     if (response.status == 200) {
                                            //         this.props.history.push(`/program/listProgram/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            //     } else {
                                            //         this.setState({
                                            //             message: response.data.messageCode, loading: false
                                            //         },
                                            //             () => {
                                            //                 this.hideSecondComponent();
                                            //             })
                                            //     }

                                            // }
                                            // ).catch(
                                            //     error => {
                                            //         if (error.message === "Network Error") {
                                            //             this.setState({
                                            //                 message: 'static.unkownError',
                                            //                 loading: false
                                            //             });
                                            //         } else {
                                            //             switch (error.response ? error.response.status : "") {

                                            //                 case 401:
                                            //                     this.props.history.push(`/login/static.message.sessionExpired`)
                                            //                     break;
                                            //                 case 403:
                                            //                     this.props.history.push(`/accessDenied`)
                                            //                     break;
                                            //                 case 500:
                                            //                 case 404:
                                            //                 case 406:
                                            //                     this.setState({
                                            //                         message: error.response.data.messageCode,
                                            //                         loading: false
                                            //                     });
                                            //                     break;
                                            //                 case 412:
                                            //                     this.setState({
                                            //                         message: error.response.data.messageCode,
                                            //                         loading: false
                                            //                     });
                                            //                     break;
                                            //                 default:
                                            //                     this.setState({
                                            //                         message: 'static.unkownError',
                                            //                         loading: false
                                            //                     });
                                            //                     break;
                                            //             }
                                            //         }
                                            //     }
                                            // );

                                        }}
                                        render={
                                            ({
                                                values,
                                                errors,
                                                touched,
                                                handleChange,
                                                handleBlur,
                                                handleSubmit,
                                                isSubmitting,
                                                isValid,
                                                setTouched,
                                                setFieldValue,
                                                setFieldTouched
                                            }) => (

                                                <Form onSubmit={handleSubmit} noValidate name='programForm' autocomplete="off">
                                                    {/* <CardHeader>
                                                    <strong>{i18n.t('static.common.editEntity', { entityname })}</strong>
                                                </CardHeader> */}
                                                    <CardBody>

                                                        <FormGroup>

                                                            <Label htmlFor="select">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label>

                                                            <Input
                                                                valid={!errors.realmId && this.state.program.realm.realmId != ''}
                                                                invalid={touched.realmId && !!errors.realmId}
                                                                bsSize="sm"
                                                                // className="col-md-4"
                                                                onBlur={handleBlur}
                                                                type="select" name="realmId" id="realmId"
                                                                value={this.state.program.realm.realmId}
                                                                disabled={true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {realms}
                                                            </Input>
                                                            <FormFeedback>{errors.realmId}</FormFeedback>

                                                        </FormGroup>
                                                        <FormGroup>
                                                            <Label htmlFor="select">{i18n.t('static.program.realmcountry')}<span class="red Reqasterisk">*</span></Label>

                                                            <Input
                                                                valid={!errors.realmCountryId && this.state.program.realmCountry.realmCountryId != ''}
                                                                invalid={touched.realmCountryId && !!errors.realmCountryId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                                bsSize="sm"
                                                                // className="col-md-4"
                                                                onBlur={handleBlur}
                                                                disabled={true}
                                                                value={this.state.program.realmCountry.realmCountryId}
                                                                type="select" name="realmCountryId" id="realmCountryId">
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {realmCountries}
                                                            </Input>
                                                            <FormFeedback>{errors.realmCountryId}</FormFeedback>

                                                        </FormGroup>
                                                        <FormGroup>
                                                            <Label htmlFor="select">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>
                                                            <Select
                                                                bsSize="sm"
                                                                className={classNames('form-control', 'd-block', 'w-100', 'bg-secondary',
                                                                    { 'is-valid': !errors.healthAreaId && this.state.healthAreaId.length != 0 },
                                                                    { 'is-invalid': (touched.healthAreaId && !!errors.healthAreaId) }
                                                                )}
                                                                name="healthAreaId"
                                                                id="healthAreaId"
                                                                onChange={(e) => {
                                                                    handleChange(e);
                                                                    setFieldValue("healthAreaId", e);
                                                                    // this.updateFieldData(e);

                                                                }}
                                                                onBlur={() => setFieldTouched("healthAreaId", true)}
                                                                multi
                                                                disabled={true}
                                                                options={this.state.healthAreaList}
                                                                value={this.state.healthAreaId}
                                                            />
                                                            <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup>
                                                            <Label htmlFor="select">{i18n.t('static.program.organisation')}<span class="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                valid={!errors.organisationId && this.state.program.organisation.id != ''}
                                                                invalid={touched.organisationId && !!errors.organisationId}
                                                                onBlur={handleBlur}
                                                                bsSize="sm"
                                                                type="select"
                                                                name="organisationId"
                                                                id="organisationId"
                                                                // disabled={!AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN") ? true : false}
                                                                disabled={true}
                                                                value={this.state.program.organisation.id}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {realmOrganisation}

                                                            </Input>

                                                            <FormFeedback className="red">{errors.organisationId}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup>

                                                            <Label htmlFor="company">{i18n.t('static.program.program')}<span class="red Reqasterisk">*</span></Label>

                                                            <Input
                                                                type="text" name="programName" valid={!errors.programName}
                                                                bsSize="sm"
                                                                // invalid={touched.programName && !!errors.programName || this.state.program.label.label_en == ''}
                                                                // invalid={touched.programName && !!errors.programName || !!errors.programName}
                                                                valid={!errors.programName && this.state.program.label.label_en != ''}
                                                                invalid={touched.programName && !!errors.programName}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                                onBlur={handleBlur}
                                                                value={this.state.program.label.label_en}
                                                                id="programName" />
                                                            <FormFeedback>{errors.programName}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup style={{ display: 'flex' }}>
                                                            <Col xs="6" className="pl-0">
                                                                <FormGroup >
                                                                    <Label htmlFor="company">{i18n.t('static.program.programCode')}</Label>
                                                                    <Input
                                                                        type="text" name="programCode"
                                                                        bsSize="sm"
                                                                        disabled
                                                                        // value={this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode}
                                                                        value="BEN-ARV-MOH"
                                                                        id="programCode" />
                                                                    <FormFeedback className="red">{errors.programCode}</FormFeedback>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col xs="1" className="" style={{ marginTop: '32px' }}>
                                                                <i class="fa fa-minus" aria-hidden="true"></i>
                                                            </Col>
                                                            <Col xs="5" className="pr-0">
                                                                <FormGroup className="pt-2">
                                                                    <Label htmlFor="company"></Label>
                                                                    <Input
                                                                        onBlur={handleBlur}
                                                                        // valid={!errors.airFreightPerc && this.props.items.program.airFreightPerc != ''}
                                                                        // invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                                                        bsSize="sm"
                                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        type="text"
                                                                        maxLength={6}
                                                                        value={this.state.uniqueCode}
                                                                        disabled={!AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN") ? true : false}
                                                                        name="programCode1" id="programCode1" />
                                                                    <FormFeedback className="red">{errors.programCode1}</FormFeedback>
                                                                </FormGroup>
                                                            </Col>
                                                        </FormGroup>
                                                        <FormGroup>
                                                            <Label htmlFor="select">{i18n.t('static.program.programmanager')}<span class="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                value={this.state.program.programManager.userId}
                                                                bsSize="sm"
                                                                valid={!errors.userId && this.state.program.programManager.userId != ''}
                                                                invalid={touched.userId && !!errors.userId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur} type="select" name="userId" id="userId">
                                                                {/* <option value="0">Please select</option> */}
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {programManagers}

                                                            </Input>
                                                            <FormFeedback>{errors.userId}</FormFeedback>

                                                        </FormGroup>
                                                        <FormGroup>
                                                            <Label htmlFor="customField1">{i18n.t('static.forecastProgram.customField1')}<span class="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                bsSize="sm"
                                                                type="text" name="customField1"
                                                                valid={!errors.customField1 && this.state.program.customField1 != ''}
                                                                invalid={touched.customField1 && !!errors.customField1}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                                onBlur={(e) => { handleBlur(e); this.getDisplayName() }}
                                                                value={this.state.program.customField1}
                                                                id="customField1" />
                                                            <FormFeedback className="red">{errors.customField1}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup>
                                                            <Label htmlFor="customField2">{i18n.t('static.forecastProgram.customField2')}<span class="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                bsSize="sm"
                                                                type="text" name="customField2"
                                                                valid={!errors.customField2 && this.state.program.customField2 != ''}
                                                                invalid={touched.customField2 && !!errors.customField2}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                                onBlur={(e) => { handleBlur(e); this.getDisplayName() }}
                                                                value={this.state.program.customField2}
                                                                id="customField2" />
                                                            <FormFeedback className="red">{errors.customField2}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup>
                                                            <Label htmlFor="customField3">{i18n.t('static.forecastProgram.customField3')}<span class="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                bsSize="sm"
                                                                type="text" name="customField3"
                                                                valid={!errors.customField3 && this.state.program.customField3 != ''}
                                                                invalid={touched.customField3 && !!errors.customField3}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                                onBlur={(e) => { handleBlur(e); this.getDisplayName() }}
                                                                value={this.state.program.customField3}
                                                                id="customField3" />
                                                            <FormFeedback className="red">{errors.customField3}</FormFeedback>
                                                        </FormGroup>

                                                        <FormGroup>

                                                            <Label htmlFor="select">{i18n.t('static.program.notes')}</Label>

                                                            <Input
                                                                value={this.state.program.programNotes}
                                                                bsSize="sm"
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                // maxLength={600}
                                                                type="textarea" name="programNotes" id="programNotes" />
                                                            <FormFeedback>{errors.programNotes}</FormFeedback>

                                                        </FormGroup>



                                                    </CardBody>
                                                    <CardFooter>
                                                        <FormGroup>
                                                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                            <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                            &nbsp;
                                                        </FormGroup>
                                                    </CardFooter>
                                                </Form>
                                            )} />
                                </Card>
                            </Col>
                        </Row>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                    <div class="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPane>
                <TabPane tabId="2" className="tabpadding" >
                    <div>
                        {/* <Row> */}
                        <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                            <div className="mb-lg-0 ">
                                <div className="Card-header-addicon" style={{ padding: '0px 0px 10px 24px' }}>
                                    {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                                    <div className="card-header-actions" style={{ display: 'flex' }}>
                                        <div className="card-header-action">
                                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_DATA_SOURCE') && <a href="javascript:void();" title={'Create Manual Tree'} onClick={this.createNewTree}><i className="fa fa-plus-square"></i></a>}
                                        </div>
                                        <div className="card-header-action">
                                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_DATA_SOURCE') && <a href="javascript:void();" title={'Create Tree from Template'} onClick={this.createNewTree}><i className="fa fa-list-alt"></i></a>}
                                        </div>
                                    </div>

                                </div>
                                <CardBody className="pl-lg-0 pr-lg-0">
                                    <div>
                                        <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DATA_SOURCE') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                                        </div>
                                    </div>
                                </CardBody>
                                {/* <CardFooter>

                                </CardFooter> */}
                            </div>
                        </Col>
                        {/* </Row> */}

                    </div>
                </TabPane>
                <TabPane tabId="3">
                    {/* <Row> */}
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardBody>
                                <div className="table-responsive RemoveStriped">
                                    <div id="forecastOutPutDiv" />
                                </div>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    <Button color="success" size="md" className="float-right mr-1" type="button" > Export</Button>
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRowInJexcel()}> {i18n.t('static.common.addRow')}</Button>
                                    &nbsp;
                                </FormGroup>
                            </CardFooter>
                        </Card>
                    </Col>
                    {/* </Row> */}
                </TabPane>

            </>
        );
    }

    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        return <div className="animated fadeIn">
            <Card className="mt-lg-2">
                <div className="pt-lg-2">
                    <Col xs="12" md="12" className="mb-4">
                        <Nav tabs>
                            <NavItem>
                                <NavLink
                                    active={this.state.activeTab[0] === '1'}
                                    onClick={() => { this.toggle(0, '1'); }}
                                >
                                    Data Set
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    active={this.state.activeTab[0] === '2'}
                                    onClick={() => { this.toggle(0, '2'); }}
                                >
                                    Tree
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    active={this.state.activeTab[0] === '3'}
                                    onClick={() => { this.toggle(0, '3'); }}
                                >
                                    Forecast Output
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab[0]}>
                            {this.tabPane()}
                        </TabContent>
                    </Col>
                </div>
            </Card>
        </div>

    }
}

import React, { Component } from 'react';
import DatasetService from '../../api/DatasetService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Card, CardHeader, CardBody, Button, Col, FormGroup, Label, InputGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader, CardFooter, FormFeedback, Form } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import i18n from '../../i18n';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY, API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import moment from 'moment';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css';
import classNames from 'classnames';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions.js';
import CryptoJS from 'crypto-js'
import { confirmAlert } from 'react-confirm-alert'; // Import
import { calculateModelingData } from '../../views/DataSet/ModelingDataCalculation2';

const entityname = 'Tree Template';
const validationSchema = function (values) {
    return Yup.object().shape({
        treeTemplateName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.tree.templateNameRequired')),
    })
}

const validationSchemaCreateTree = function (values) {
    return Yup.object().shape({
        datasetIdModal: Yup.string()
            .test('datasetIdModal', 'Please select program',
                function (value) {
                    if (document.getElementById("datasetIdModal").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        treeName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.validation.selectTreeName')),
        forecastMethodId: Yup.string()
            .test('forecastMethodId', i18n.t('static.validation.selectForecastMethod'),
                function (value) {
                    console.log("@@@ 4", document.getElementById("forecastMethodId").value);
                    if (document.getElementById("forecastMethodId").value == "") {
                        console.log("fm false");
                        return false;
                    } else {
                        console.log("fm true");
                        return true;
                    }
                }),
        regionId: Yup.string()
                    .required(i18n.t('static.common.regiontext'))
                    .typeError(i18n.t('static.common.regiontext')),
    })
}

const validateCreateTree = (getValidationSchema) => {
    return (values) => {
        const validationSchemaCreateTree = getValidationSchema(values)
        try {
            validationSchemaCreateTree.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationErrorCreateTree(error)
        }
    }
}

const getErrorsFromValidationErrorCreateTree = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

const initialValues = {
    treeTemplateName: "",
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
export default class ListTreeTemplate extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isSubmitClicked: false,
            color: '',
            treeTemplateId: '',
            treeTemplateList: [],
            message: '',
            loading: true,
            treeTemplateName: '',
            isModalOpen: false,
            lang: localStorage.getItem('lang'),
            isModalCreateTree:false,
            treeName:"",
            forecastMethod:{
                id:"",
                label:{
                    label_en:""
                }
            },
            datasetIdModal:"",
            regionId: '',
            regionList: [],
            regionValues: [],
            missingPUList:[],
            forecastMethodList:[],
            datasetList:[],
            programList:[],
            active: true,
            datasetListJexcel:{},
            treeTemplate:{}
        }
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.buildTree = this.buildTree.bind(this);
        this.addTreeTemplate = this.addTreeTemplate.bind(this);
        this.copyDeleteTree = this.copyDeleteTree.bind(this);
        this.modelOpenClose = this.modelOpenClose.bind(this);
        this.getTreeTemplateList = this.getTreeTemplateList.bind(this);
        this.modelOpenCloseCreateTree=this.modelOpenCloseCreateTree.bind(this)
    }

    modelOpenCloseCreateTree() {
        this.setState({
            isModalCreateTree: !this.state.isModalCreateTree,
            treeName:"",
            forecastMethod:{
                id:"",
                label:{
                    label_en:""
                }
            },
            datasetIdModal:"",
            regionId: '',
            regionList: [],
            regionValues: [],
            missingPUList:[],
            active: true,
            datasetListJexcel:{},
            treeTemplate:{}
        })
    }

    touchAllCreateTree(setTouched, errors) {
        setTouched({
            treeName: true,
            forecastMethodId: true,
            regionId: true,
            datasetIdModal: true
        }
        )
        this.validateFormCreateTree(errors)
    }

    validateFormCreateTree(errors) {
        this.findFirstErrorCreateTree('userForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstErrorCreateTree(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    getTreeTemplateList() {
        DatasetService.getTreeTemplateList().then(response => {
            console.log("tree template list---", response.data)
            var treeTemplateList = response.data.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var planningunitTransaction = db1.transaction(['forecastMethod'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('forecastMethod');
            var planningunitRequest = planningunitOs.getAll();
            planningunitRequest.onsuccess = function (e) {

                var programTransaction = db1.transaction(['datasetDetails'], 'readwrite');
            var programOs = programTransaction.objectStore('datasetDetails');
            var programRequest = programOs.getAll();
            programRequest.onsuccess = function (e) {

                var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
            var datasetOs = datasetTransaction.objectStore('datasetData');
            var datasetRequest = datasetOs.getAll();
            datasetRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                console.log("myResult===============2", myResult)
                this.setState({
                    forecastMethodList: myResult.filter(x => x.forecastMethodTypeId == 1),
                    programList:programRequest.result.filter(c=>c.userId==userId),
                    datasetList:datasetRequest.result.filter(c=>c.userId==userId)
                }, () => {
                    if(this.props.location.state != undefined && this.props.location.state.treeTemplateId!=undefined){
                        var treeTemplate=treeTemplateList.filter(c=>c.treeTemplateId==this.props.location.state.treeTemplateId)[0];
                        this.setState({
                            isModalCreateTree:!this.state.isModalCreateTree,
                            treeTemplate:treeTemplate,
                            treeName: treeTemplate.label.label_en,
                            active: treeTemplate.active,
                            forecastMethod: treeTemplate.forecastMethod,
                            regionId: '',
                            regionList: [],
                            regionValues: [],
                            notes: treeTemplate.notes,
                            missingPUList: [],
                            datasetIdModal:""
                        },()=>{
                            if(this.state.programList.length==1){
                                var event={
                                    target:{
                                        name:"datasetIdModal",
                                        value:this.state.programList[0].id,
                                    }
                                }
                                this.dataChange(event)
                            }
                        })                        
                    }
                })
            }.bind(this);
        }.bind(this);
        }.bind(this);
        }.bind(this)
            this.setState({
                treeTemplateList,
                loading: false
            }, () => { this.buildJexcel() })
        })
            .catch(
                error => {
                    console.log("Error Test@123",error)
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
    modelOpenClose() {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
        })
    }
    dataChange(event) {
        if (event.target.name == "treeTemplateName") {
            this.setState({
                treeTemplateName: event.target.value,
            });
        }

        if (event.target.name == "treeName") {
            this.setState({
                treeName: event.target.value,
            });
        }

        if (event.target.name == "datasetIdModal") {
            // var realmCountryId = "";
            if (event.target.value != "") {
                // var program = (this.state.datasetList.filter(x => x.id == event.target.value)[0]);
                // console.log("program for display---",program);
                // realmCountryId = program.programData.realmCountry.realmCountryId;
            }
            this.setState({
                // realmCountryId,
                datasetIdModal: event.target.value,
            }, () => {
                localStorage.setItem("sesDatasetId", event.target.value);
                this.getRegionList(event.target.value);
                // if (document.getElementById('templateId').value != "") {
                //     this.findMissingPUs();
                // }
            });
        }

        if (event.target.name == "forecastMethodId") {
            var forecastMethod = document.getElementById("forecastMethodId");
            var selectedText = forecastMethod.options[forecastMethod.selectedIndex].text;
            let label = {
                label_en: selectedText,
                label_fr: '',
                label_sp: '',
                label_pr: ''
            }
            this.setState({
                forecastMethod: {
                    id: event.target.value,
                    label: label
                },
            });
        }

        if (event.target.name == "notes") {
            this.setState({
                notes: event.target.value,
            });
        }
        if (event.target.name == "active") {
            this.setState({
                active: event.target.id === "active11" ? false : true
            });

        }
    };

    getRegionList(datasetId) {
        console.log("datasetId details---", datasetId);

        var regionList = [];
        var regionMultiList = [];
        if (datasetId != 0 && datasetId != "" && datasetId != null) {
            var program = this.state.datasetList.filter(c=>c.id==datasetId);
            if(program.length>0){
                var databytes = CryptoJS.AES.decrypt(program[0].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
            regionList = programData.regionList;
            regionList.map(c => {
                regionMultiList.push({ label: getLabelText(c.label, this.state.lang), value: c.regionId })
            })
        }
        this.setState({
            regionList,
            regionMultiList,
            missingPUList: [],
            datasetListJexcel:programData,
            regionValues:regionMultiList.length==1?regionMultiList:[]
        }, () => {
                this.findMissingPUs();
        });
    }
    }

    findMissingPUs() {
        var missingPUList = [];
        var json;
        var treeTemplate = this.state.treeTemplate;
        console.log("dataset Id template---", this.state.datasetIdModal);
        if (this.state.datasetIdModal != "" && this.state.datasetIdModal != null) {
            var dataset = this.state.datasetListJexcel;
            console.log("dataset---", dataset);
            console.log("treeTemplate---", treeTemplate);
            var puNodeList = treeTemplate.flatList.filter(x => x.payload.nodeType.id == 5);
            console.log("puNodeList---", puNodeList);
            console.log("planningUnitIdListTemplate---", puNodeList.map((x) => x.payload.nodeDataMap[0][0].puNode.planningUnit.id).join(', '));
            var planningUnitList = dataset.planningUnitList.filter(x => x.treeForecast == true && x.active == true);
            console.log("planningUnitList---", planningUnitList);
            console.log("planningUnitIdListPUSettings---", planningUnitList.map((x) => x.planningUnit.id).join(', '));
            for (let i = 0; i < puNodeList.length; i++) {
                console.log("pu Id---", puNodeList[i].payload.nodeDataMap[0][0].puNode.planningUnit.id);
                if (planningUnitList.filter(x => x.planningUnit.id == puNodeList[i].payload.nodeDataMap[0][0].puNode.planningUnit.id).length == 0) {
                    var parentNodeData = treeTemplate.flatList.filter(x => x.id == puNodeList[i].parent)[0];
                    console.log("parentNodeData---", parentNodeData);
                    json = {
                        productCategory: parentNodeData.payload.nodeDataMap[0][0].fuNode.forecastingUnit.productCategory,
                        planningUnit: puNodeList[i].payload.nodeDataMap[0][0].puNode.planningUnit
                    };
                    missingPUList.push(json);
                }
            }
        }
        console.log("missingPUList---", missingPUList);
        if (missingPUList.length > 0) {
            missingPUList = missingPUList.filter((v, i, a) => a.findIndex(v2 => (v2.planningUnit.id === v.planningUnit.id)) === i)
        }
        this.setState({
            missingPUList
        }, () => {
            this.buildMissingPUJexcel();
        });
    }

    buildMissingPUJexcel() {
        var missingPUList = this.state.missingPUList;
        console.log("missingPUList--->", missingPUList);
        var dataArray = [];
        let count = 0;
        if (missingPUList.length > 0) {
            for (var j = 0; j < missingPUList.length; j++) {
                data = [];
                // data[0] = missingPUList[j].month
                // data[1] = missingPUList[j].startValue
                data[0] = getLabelText(missingPUList[j].productCategory.label, this.state.lang)
                data[1] = getLabelText(missingPUList[j].planningUnit.label, this.state.lang) + " | " + missingPUList[j].planningUnit.id
                dataArray[count] = data;
                count++;
            }
        }
        this.el = jexcel(document.getElementById("missingPUJexcel"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("missingPUJexcel"), true);
        var data = dataArray;
        console.log("DataArray>>>", dataArray);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [20, 80],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    // 0
                    title: i18n.t('static.productCategory.productCategory'),
                    type: 'test',
                    // readOnly: true
                },
                {
                    // 1
                    title: i18n.t('static.product.product'),
                    type: 'text',
                    // readOnly: true

                }

            ],
            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            editable: false,
            onload: this.loadedMissingPU,
            pagination: localStorage.getItem("sesRecordCount"),
            search: false,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),

        };
        var missingPUJexcel = jexcel(document.getElementById("missingPUJexcel"), options);
        this.el = missingPUJexcel;
        this.setState({
            missingPUJexcel
        }
        );
    }

    loadedMissingPU = function (instance, cell, x, y, value) {
        console.log("loaded 2---", document.getElementsByClassName('jexcel'));
        jExcelLoadedFunctionOnlyHideRow(instance, 1);
    }

    handleRegionChange = (regionIds) => {
        console.log("regionIds---", regionIds);

        this.setState({
            regionValues: regionIds.map(ele => ele),
            // regionLabels: regionIds.map(ele => ele.label)
        }, () => {
            console.log("regionValues---", this.state.regionValues);
            // console.log("regionLabels---", this.state.regionLabels);
            // if ((this.state.regionValues).length > 0) {
            var regionList = [];
            var regions = this.state.regionValues;
            console.log("regions---", regions)
            for (let i = 0; i < regions.length; i++) {
                var json = {
                    id: regions[i].value,
                    label: {
                        label_en: regions[i].label
                    }
                }
                regionList.push(json);
            }
            console.log("final regionList---", regionList);
            this.setState({ regionList });
            // }
        })
    }

    touchAll(setTouched, errors) {
        setTouched({
            treeTemplateName: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('modalForm', (fieldName) => {
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

    copyDeleteTree(treeTemplateId) {

        console.log("treeTemplateId--------------->", treeTemplateId);
        var treeTemplate = this.state.treeTemplateList.filter(x => x.treeTemplateId == treeTemplateId)[0];
        treeTemplate.label.label_en = this.state.treeTemplateName;

        DatasetService.addTreeTemplate(treeTemplate)
            .then(response => {
                console.log("after adding tree---", response.data);
                if (response.status == 200) {
                    this.setState({
                        message: i18n.t('static.message.addTreeTemplate'),
                        color: 'green',
                        loading: false,
                        isSubmitClicked: false
                    }, () => {
                        this.getTreeTemplateList();
                        this.hideSecondComponent();
                    });
                    // this.props.history.push(`/dataset/listTreeTemplate/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                            // message: 'static.unkownError',
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false,
                            isSubmitClicked: false
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
                                    isSubmitClicked: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    isSubmitClicked: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    isSubmitClicked: false
                                });
                                break;
                        }
                    }
                }
            );

    }

    addTreeTemplate(event) {

        this.props.history.push({
            pathname: `/dataSet/createTreeTemplate/-1`,
            // state: { role }
        });

    }

    buildTree() {

        this.props.history.push({
            pathname: `/dataSet/buildTree/`,
            // state: { role }
        });

    }
    buildJexcel() {
        let treeTemplateList = this.state.treeTemplateList;
        console.log("treeTemplateList---->", treeTemplateList);
        let treeTemplateArray = [];
        let count = 0;
        var selStatus = document.getElementById("active").value;
        var tempSelStatus = selStatus != "" ? (selStatus == "true" ? true : false) : "";
        for (var j = 0; j < treeTemplateList.length; j++) {
            data = [];
            data[0] = treeTemplateList[j].treeTemplateId;
            data[1] = getLabelText(treeTemplateList[j].label, this.state.lang)
            data[2] = getLabelText(treeTemplateList[j].forecastMethod.label, this.state.lang)
            data[3] = treeTemplateList[j].monthsInPast;
            data[4] = treeTemplateList[j].monthsInFuture;
            data[5] = getLabelText(treeTemplateList[j].flatList[0].payload.nodeType.label,this.state.lang);
            data[6] = treeTemplateList[j].active;
            data[7] = treeTemplateList[j].lastModifiedBy.username;
            data[8] = (treeTemplateList[j].lastModifiedDate ? moment(treeTemplateList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            if (selStatus != "") {
                if (tempSelStatus == treeTemplateList[j].active) {
                    treeTemplateArray[count] = data;
                    count++;
                }
            } else {
                treeTemplateArray[count] = data;
                count++;
            }
            data[9] = treeTemplateList[j];

        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var json = [];
        var data = treeTemplateArray;

        var options = {
            data: data,
            columnDrag: true,
            // colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Template Id',
                    type: 'hidden',
                    // title: 'A',
                    // type: 'text',
                    // visible: false
                },
                {
                    title: i18n.t('static.listTreeTemp.templateName'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.forecastMethod.forecastMethod'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.program.monthsInPast'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.program.monthsInFuture'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.treeTemplate.startNode'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    // readOnly: true,
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    // readOnly: true
                },
                {
                    type:'hidden'
                }

            ],
            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            editable: false,
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
                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_TREE_TEMPLATE')) {
                            items.push({
                                title: i18n.t('static.common.duplicateTemplate'),
                                onclick: function () {
                                    this.setState({
                                        treeTemplateId: this.state.treeEl.getValueFromCoords(0, y),
                                        isModalOpen: !this.state.isModalOpen,
                                        treeTemplateName: this.state.treeEl.getValueFromCoords(1, y) + " (copy)"
                                    })
                                }.bind(this)
                            });
                        }
                        if(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE')){
                            items.push({
                                title: "Create tree from this template",
                                onclick: function () {
                                    this.setState({
                                        isModalCreateTree:!this.state.isModalCreateTree,
                                        treeTemplate:this.state.treeEl.getValueFromCoords(9, y),
                                        treeName: this.state.treeEl.getValueFromCoords(9, y).label.label_en,
                                        active: this.state.treeEl.getValueFromCoords(9, y).active,
                                        forecastMethod: this.state.treeEl.getValueFromCoords(9, y).forecastMethod,
                                        regionId: '',
                                        regionList: [],
                                        regionValues: [],
                                        notes: this.state.treeEl.getValueFromCoords(9, y).notes,
                                        missingPUList: [],
                                        datasetIdModal:""
                                    },()=>{
                                        if(this.state.programList.length==1){
                                            var event={
                                                target:{
                                                    name:"datasetIdModal",
                                                    value:this.state.programList[0].id,
                                                }
                                            }
                                            this.dataChange(event)
                                        }
                                    })
                                }.bind(this)
                            });
                        }
                    }
                }

                return items;
            }.bind(this),
            // contextMenu: function (obj, x, y, e) {
            //     var items = [];
            //     if (y != null) {
            //         if (obj.options.allowInsertRow == true) {
            //             items.push({
            //                 title: 'Delete',
            //                 onclick: function () {

            //                 }.bind(this)
            //             });

            //             items.push({
            //                 title: i18n.t('static.common.copyRow'),
            //                 onclick: function () {
            //                     var rowData = obj.getRowData(y);
            //                     console.log("rowData===>", rowData);
            //                     rowData[0] = "";
            //                     rowData[1] = "";
            //                     var data = rowData;
            //                     this.el.insertRow(
            //                         data, 0, 1
            //                     );
            //                 }.bind(this)
            //             });
            //         }
            //     }

            //     return items;
            // }.bind(this),
        };
        var treeEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = treeEl;
        this.setState({
            treeEl: treeEl, loading: false
        })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    componentDidMount() {
        this.hideFirstComponent();
        this.getTreeTemplateList();
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {

            if (x == 0 && value != 0) {
                // console.log("HEADER SELECTION--------------------------");
            } else {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_VIEW_TREE_TEMPLATES')) {
                    var treeTemplateId = this.state.treeEl.getValueFromCoords(0, x);
                    this.props.history.push({
                        pathname: `/dataset/createTreeTemplate/${treeTemplateId}`,
                        // state: { role }
                    });
                }

            }
        }
    }.bind(this);

    // addNewDimension() {
    //     if (isSiteOnline()) {
    //         this.props.history.push(`/diamension/addDiamension`)
    //     } else {
    //         alert("You must be Online.")
    //     }

    // }

    createTree(){
        // var program = this.state.treeFlag ? (this.state.datasetList.filter(x => x.programId == programId && x.version == versionId)[0]) : (this.state.datasetList.filter(x => x.id == programId)[0]);
        var program = this.state.datasetListJexcel;
        console.log("delete program---", program);
        let tempProgram = JSON.parse(JSON.stringify(program))
        let treeList = program.treeList;
        console.log("delete treeList---", treeList);
        var treeTemplateId = '';
        var treeId=""
        var maxTreeId = treeList.length > 0 ? Math.max(...treeList.map(o => o.treeId)) : 0;
            treeId = parseInt(maxTreeId) + 1;
            var nodeDataMap = {};
            var tempArray = [];
            var tempJson = {};
            var tempTree = {};
            // var curMonth = moment(new Date()).format('YYYY-MM-DD');
            // console
            var curMonth = moment(program.currentVersion.forecastStartDate).format('YYYY-MM-DD');
            // treeTemplateId = document.getElementById('templateId').value;
            // console.log("treeTemplateId===", treeTemplateId);
            // if (treeTemplateId != "" && treeTemplateId != 0) {
                var treeTemplate = this.state.treeTemplate;
                // console.log("treeTemplate 123----", treeTemplate);
                var flatList = JSON.parse(JSON.stringify(treeTemplate.flatList));
                for (let i = 0; i < flatList.length; i++) {
                    nodeDataMap = {};
                    tempArray = [];
                    if (flatList[i].payload.nodeDataMap[0][0].nodeDataModelingList.length > 0) {
                        for (let j = 0; j < flatList[i].payload.nodeDataMap[0][0].nodeDataModelingList.length; j++) {
                            var modeling = (flatList[i].payload.nodeDataMap[0][0].nodeDataModelingList)[j];
                            // var startMonthNoModeling = modeling.startDateNo < 0 ? modeling.startDateNo : parseInt(modeling.startDateNo - 1);
                            // var stopMonthNoModeling = modeling.stopDateNo < 0 ? modeling.stopDateNo : parseInt(modeling.stopDateNo - 1)
                            var startMonthNoModeling = modeling.startDateNo < 0 ? modeling.startDateNo : parseInt(modeling.startDateNo - 1);
                            console.log("startMonthNoModeling---", startMonthNoModeling);
                            modeling.startDate = moment(curMonth).startOf('month').add(startMonthNoModeling, 'months').format("YYYY-MM-DD");
                            var stopMonthNoModeling = modeling.stopDateNo < 0 ? modeling.stopDateNo : parseInt(modeling.stopDateNo - 1)
                            console.log("stopMonthNoModeling---", stopMonthNoModeling);
                            modeling.stopDate = moment(curMonth).startOf('month').add(stopMonthNoModeling, 'months').format("YYYY-MM-DD");


                            console.log("modeling---", modeling);
                            (flatList[i].payload.nodeDataMap[0][0].nodeDataModelingList)[j] = modeling;
                        }
                    }
                    // console.log("flatList[i]---", flatList[i]);
                    tempJson = flatList[i].payload.nodeDataMap[0][0];
                    if (flatList[i].payload.nodeType.id != 1) {
                        // console.log("month from tree template---", flatList[i].payload.nodeDataMap[0][0].monthNo + " cur month---", curMonth + " final result---", moment(curMonth).startOf('month').add(flatList[i].payload.nodeDataMap[0][0].monthNo, 'months').format("YYYY-MM-DD"))
                        var monthNo = flatList[i].payload.nodeDataMap[0][0].monthNo < 0 ? flatList[i].payload.nodeDataMap[0][0].monthNo : parseInt(flatList[i].payload.nodeDataMap[0][0].monthNo - 1)
                        tempJson.month = moment(curMonth).startOf('month').add(monthNo, 'months').format("YYYY-MM-DD");
                    }
                    tempArray.push(tempJson);
                    nodeDataMap[1] = tempArray;
                    flatList[i].payload.nodeDataMap = nodeDataMap;
                }
                // console.log("treeTemplate@@@@@@@@@@@@@@",treeTemplate)
                tempTree = {
                    treeId: treeId,
                    active: this.state.active,
                    forecastMethod: this.state.forecastMethod,
                    label: {
                        label_en: this.state.treeName,
                        label_fr: '',
                        label_sp: '',
                        label_pr: ''
                    },
                    notes: this.state.notes,
                    regionList: this.state.regionList,
                    levelList: treeTemplate.levelList,
                    scenarioList: [{
                        id: 1,
                        label: {
                            label_en: i18n.t('static.realm.default'),
                            label_fr: '',
                            label_sp: '',
                            label_pr: ''
                        },
                        active: true,
                        notes: ''
                    }],
                    tree: {
                        flatList: flatList
                    }
                }
                treeList.push(tempTree);
        // }
        console.log("TreeList@@@@@@@@@@@@@@", treeList)
        tempProgram.treeList = treeList;
        var programCopy = JSON.parse(JSON.stringify(tempProgram));
        // var programData = (CryptoJS.AES.encrypt(JSON.stringify(tempProgram), SECRET_KEY)).toString();
        // tempProgram = programData;
        // if (operationId == 3) {
            programCopy.programData = tempProgram;
            calculateModelingData(programCopy, this, this.state.datasetIdModal, 0, 1, 1, treeId, false, true,true);
    }

    updateState(parameterName, value) {
        console.log("parameterName---", parameterName + " value---", value);
        // console.log("value---", value);
        if (parameterName != "loading") {
            this.setState({
                [parameterName]: value
            }, () => {
                if (parameterName == 'programId' && value != "") {
                    console.log("tempTreeId---", this.state.tempTreeId)
                    var programId = this.state.programId;
                    var program = this.state.datasetListJexcel;
                    console.log("my program---", program);
                    let tempProgram = JSON.parse(JSON.stringify(program))
                    let treeList = tempProgram.treeList;
                    var tree = treeList.filter(x => x.treeId == this.state.tempTreeId)[0];
                    console.log("my tree---", tree);
                    var items = tree.tree.flatList;
                    console.log("my items---", items);
                    var nodeDataMomList = this.state.nodeDataMomList;
                    console.log("nodeDataMomList---", nodeDataMomList);
                    if (nodeDataMomList.length > 0) {
                        for (let i = 0; i < nodeDataMomList.length; i++) {
                            // console.log("nodeDataMomList[i]---", nodeDataMomList[i])
                            var nodeId = nodeDataMomList[i].nodeId;
                            var nodeDataMomListForNode = nodeDataMomList[i].nodeDataMomList;
                            // console.log("this.state.nodeDataMomList---", this.state.nodeDataMomList);
                            // console.log("my items---", items);
                            // console.log("my nodeId---", nodeId);
                            var node = items.filter(n => n.id == nodeId)[0];
                            // console.log("node---", node);
                            (node.payload.nodeDataMap[1])[0].nodeDataMomList = nodeDataMomListForNode;
                            var findNodeIndex = items.findIndex(n => n.id == nodeId);
                            // console.log("findNodeIndex---", findNodeIndex);
                            items[findNodeIndex] = node;
                        }
                    }
                    tree.flatList = items;
                    var findTreeIndex = treeList.findIndex(n => n.treeId == this.state.tempTreeId);
                    console.log("findTreeIndex---", findTreeIndex);
                    treeList[findTreeIndex] = tree;
                    tempProgram.treeList = treeList;
                    var programCopy = JSON.parse(JSON.stringify(tempProgram));
                    var programData = (CryptoJS.AES.encrypt(JSON.stringify(tempProgram.programData), SECRET_KEY)).toString();
                    tempProgram.programData = programData;
                    // var treeTemplateId = document.getElementById('templateId').value;
                    this.saveTreeData(3, tempProgram, this.state.treeTemplate.treeTemplateId, programId, this.state.tempTreeId, programCopy);
                }
                console.log("returmed list---", this.state.nodeDataMomList);

            })
        }
    }

    saveTreeData(operationId, tempProgram, treeTemplateId, programId, treeId, programCopy) {
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        var version = tempProgram.currentVersion.versionId;
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
            var programData = (CryptoJS.AES.encrypt(JSON.stringify(tempProgram), SECRET_KEY)).toString();
            var id = tempProgram.programId + "_v" + version + "_uId_" + userId;
            var json = {
                id: id,
                programCode: tempProgram.programCode,
                versionList: tempProgram.versionList,
                programData: programData,
                programId: tempProgram.programId,
                version: version,
                programName: (CryptoJS.AES.encrypt(JSON.stringify((tempProgram.label)), SECRET_KEY)).toString(),
                userId: userId
            }
            var programRequest = programTransaction.put(json);

            transaction.oncomplete = function (event) {
                console.log("in side datasetDetails")
                db1 = e.target.result;
                var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetIdModal);
                datasetDetailsRequest.onsuccess = function (e) {         
                  var datasetDetailsRequestJson = datasetDetailsRequest.result;
                  datasetDetailsRequestJson.changed = 1;
                  var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                  datasetDetailsRequest1.onsuccess = function (event) {
                       
                      }}
                this.setState({
                    loading: false,
                    message: i18n.t('static.mt.dataUpdateSuccess'),
                    color: "green",
                }, () => {

                    if (operationId == 3) {
                        // if (treeTemplateId != "" && treeTemplateId != null) {
                        //     console.log("programId 1---", programId);
                        //     calculateModelingData(programCopy, this, programId, 0, 1, 1, treeId, false);
                        // } else {
                        // confirmAlert({
                        //     message: i18n.t('static.listTree.manageTreePage'),
                        //     buttons: [
                        //         {
                        //             label: i18n.t('static.program.yes'),
                        //             onClick: () => {
                                        this.props.history.push({
                                            pathname: `/dataSet/buildTree/tree/${treeId}/${id}`,
                                            // state: { role }
                                        });

                        //             }
                        //         },
                        //         {
                        //             label: i18n.t('static.program.no'),
                        //             onClick: () => {
                        //                 // this.getDatasetList();
                        //                 if(this.props.location.state != undefined && this.props.location.state.treeTemplateId!=undefined){
                        //                     this.props.history.push({
                        //                         pathname: `/dataset/createTreeTemplate/${treeTemplateId}`,
                        //                         // state: { role }
                        //                     });
                        //                 }else{
                        //                 this.componentDidMount();
                        //                 }
                        //             }
                        //         }
                        //     ]
                        // });
                        // }
                    } else {
                        // this.getDatasetList();
                        this.getPrograms();
                    }

                });
                console.log("Data update success1");
                // alert("success");


            }.bind(this);
            transaction.onerror = function (event) {
                this.setState({
                    loading: false,
                    color: "red",
                }, () => {
                    this.hideSecondComponent();
                });
                console.log("Data update errr");
            }.bind(this);
        }.bind(this);

    }

    render() {

        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        const { programList } = this.state;    
            let downloadedDatasets = programList.length > 0
            && programList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.programCode+"~v"+item.version}
                    </option>
                )
            }, this);
        const { forecastMethodList } = this.state;
        let forecastMethods = forecastMethodList.length > 0
            && forecastMethodList.map((item, i) => {
                return (
                    <option key={i} value={item.forecastMethodId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_TREE_TEMPLATE') &&
                                    <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addTreeTemplate}><i className="fa fa-plus-square"></i></a>
                                }

                            </div>
                        </div>

                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        {/* <div id="loader" className="center"></div> */}
                        <Col md="3 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup className="tab-ml-0 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="active"
                                                id="active"
                                                bsSize="sm"
                                                onChange={this.buildJexcel}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                <option value="true" selected>{i18n.t('static.common.active')}</option>
                                                <option value="false">{i18n.t('static.common.disabled')}</option>

                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <div className="TreeTemplateTable consumptionDataEntryTable">
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
                    </CardBody>
                    <Modal isOpen={this.state.isModalOpen}
                        className={'modal-md ' + this.props.className}>
                        <ModalHeader>
                            <strong>{i18n.t('static.listTreeTemp.templateDetails')}</strong>
                        </ModalHeader>
                        <ModalBody className='pb-lg-0'>
                            {/* <h6 className="red" id="div3"></h6> */}
                            <Col sm={12} style={{ flexBasis: 'auto' }}>
                                {/* <Card> */}
                                <Formik
                                    initialValues={{
                                        treeTemplateName: this.state.treeTemplateName
                                    }}
                                    validate={validate(validationSchema)}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {
                                        if (!this.state.isSubmitClicked) {
                                            this.setState({ loading: true, isSubmitClicked: true }, () => {
                                                this.copyDeleteTree(this.state.treeTemplateId);
                                                this.setState({
                                                    isModalOpen: !this.state.isModalOpen,
                                                })
                                            });
                                        }
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
                                            handleReset
                                        }) => (
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='modalForm' autocomplete="off">
                                                {/* <CardBody> */}
                                                <div className="row">

                                                    <FormGroup className="col-md-12">
                                                        <Label for="number1">{i18n.t('static.listTreeTemp.templateName')}<span className="red Reqasterisk">*</span></Label>
                                                        <div className="controls">
                                                            <Input type="text"
                                                                bsSize="sm"
                                                                name="treeTemplateName"
                                                                id="treeTemplateName"
                                                                valid={!errors.treeTemplateName && this.state.treeTemplateName != ''}
                                                                invalid={touched.treeTemplateName && !!errors.treeTemplateName}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required
                                                                value={this.state.treeTemplateName}
                                                            />
                                                            <FormFeedback className="red">{errors.treeTemplateName}</FormFeedback>
                                                        </div>

                                                    </FormGroup>
                                                    <FormGroup className="col-md-12 float-right pt-lg-4">
                                                        <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.modelOpenClose}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;

                                                    </FormGroup>
                                                </div>
                                                {/* <CardFooter>
                                                        <FormGroup>
                                                            <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.modelOpenClose}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                            <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                            &nbsp;

                                                        </FormGroup>
                                                    </CardFooter> */}
                                            </Form>

                                        )} />

                                {/* </Card> */}
                            </Col>
                            <br />
                        </ModalBody>
                    </Modal>

                    <Modal isOpen={this.state.isModalCreateTree}
                        className={'modal-lg ' + this.props.className}>
                        <ModalHeader>
                            <strong>{i18n.t('static.listTree.treeDetails')}</strong>
                            <Button size="md" onClick={this.modelOpenCloseCreateTree} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                        </ModalHeader>
                        <ModalBody className='pb-lg-0'>
                            {/* <h6 className="red" id="div3"></h6> */}
                            <Col sm={12} style={{ flexBasis: 'auto' }}>
                                {/* <Card> */}
                                <Formik
                                    initialValues={{
                                        treeName: this.state.treeName,
                                        forecastMethodId: this.state.forecastMethod.id,
                                        datasetIdModal: this.state.datasetIdModal,
                                        regionId: this.state.regionValues
                                    }}
                                    enableReinitialize={true}
                                    validate={validate(validationSchemaCreateTree)}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {
                                            this.setState({ loading: true }, () => {
                                                this.createTree();
                                                this.setState({
                                                    isModalCreateTree: !this.state.isModalCreateTree,
                                                    // treeName:"",
                                                    // forecastMethod:{
                                                    //     id:"",
                                                    //     label:{
                                                    //         label_en:""
                                                    //     }
                                                    // },
                                                    // datasetIdModal:"",
                                                    // regionId: '',
                                                    // regionList: [], 
                                                    // regionValues: [],
                                                    // missingPUList:[],
                                                    // active: true,
                                                    // datasetListJexcel:{},
                                                    // treeTemplate:{}
                                                })
                                            })

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
                                            handleReset,
                                            setFieldValue,
                                            setFieldTouched
                                        }) => (
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='userForm' autocomplete="off">
                                                {/* <CardBody> */}
                                                <div className="col-md-12">
                                                    <div className="">
                                                        <div className='row'>
                                                            <FormGroup className="col-md-6">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}<span className="red Reqasterisk">*</span></Label>
                                                                <div className="controls">

                                                                    <Input
                                                                        type="select"
                                                                        name="datasetIdModal"
                                                                        id="datasetIdModal"
                                                                        bsSize="sm"
                                                                        valid={!errors.datasetIdModal && this.state.datasetIdModal != null ? this.state.datasetIdModal : '' != ''}
                                                                        invalid={touched.datasetIdModal && !!errors.datasetIdModal}
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        value={this.state.datasetIdModal}
                                                                    >
                                                                        <option value="">{i18n.t('static.mt.selectProgram')}</option>
                                                                        {downloadedDatasets}
                                                                    </Input>
                                                                    <FormFeedback>{errors.datasetIdModal}</FormFeedback>
                                                                </div>

                                                            </FormGroup>

                                                            <FormGroup className="col-md-6">
                                                                <Label htmlFor="currencyId">{i18n.t('static.forecastMethod.forecastMethod')}<span class="red Reqasterisk">*</span></Label>
                                                                <div className="controls">

                                                                    <Input
                                                                        type="select"
                                                                        name="forecastMethodId"
                                                                        id="forecastMethodId"
                                                                        bsSize="sm"
                                                                        valid={!errors.forecastMethodId && this.state.forecastMethod.id != null ? this.state.forecastMethod.id : '' != ''}
                                                                        invalid={touched.forecastMethodId && !!errors.forecastMethodId}
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        required
                                                                        value={this.state.forecastMethod.id}
                                                                    >
                                                                        <option value="">{i18n.t('static.common.forecastmethod')}</option>
                                                                        {forecastMethods}
                                                                    </Input>
                                                                    <FormFeedback>{errors.forecastMethodId}</FormFeedback>
                                                                </div>

                                                            </FormGroup>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <FormGroup className={"col-md-6"}>
                                                            <Label for="number1">{i18n.t('static.common.treeName')}<span className="red Reqasterisk">*</span></Label>
                                                            <div className="controls">
                                                                <Input type="text"
                                                                    bsSize="sm"
                                                                    name="treeName"
                                                                    id="treeName"
                                                                    valid={!errors.treeName && this.state.treeName != ''}
                                                                    invalid={touched.treeName && !!errors.treeName}
                                                                    onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                    onBlur={handleBlur}
                                                                    required
                                                                    value={this.state.treeName}
                                                                />
                                                                <FormFeedback className="red">{errors.treeName}</FormFeedback>
                                                            </div>

                                                        </FormGroup>
                                                        <FormGroup className="col-md-6" >
                                                            <Label htmlFor="currencyId">{i18n.t('static.region.region')}<span class="red Reqasterisk">*</span></Label>
                                                            <div className="controls">
                                                                <Select
                                                                    className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                                        { 'is-valid': !errors.regionId },
                                                                        { 'is-invalid': (touched.regionId && !!errors.regionId || this.state.regionValues.length == 0) }
                                                                    )}
                                                                    bsSize="sm"
                                                                    onChange={(e) => {
                                                                        handleChange(e);
                                                                        setFieldValue("regionId", e);
                                                                        this.handleRegionChange(e);
                                                                    }}
                                                                    onBlur={() => setFieldTouched("regionId", true)}
                                                                    multi
                                                                    options={this.state.regionMultiList}
                                                                    value={this.state.regionValues}
                                                                />
                                                                <FormFeedback>{errors.regionId}</FormFeedback>
                                                            </div>

                                                        </FormGroup>
                                                    </div>
                                                    <div >
                                                        <div className='row'>
                                                            <FormGroup className="col-md-6">
                                                                <Label htmlFor="currencyId">{i18n.t('static.common.note')}</Label>
                                                                <div className="controls">
                                                                    <Input type="textarea"
                                                                        id="notes"
                                                                        name="notes"
                                                                        onChange={(e) => { this.dataChange(e) }}
                                                                        value={this.state.notes}
                                                                    ></Input>
                                                                </div>

                                                            </FormGroup>
                                                            <FormGroup className="col-md-6 mt-lg-4">
                                                                <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label>
                                                                <FormGroup check inline>
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        id="active10"
                                                                        name="active"
                                                                        value={true}
                                                                        checked={this.state.active === true}
                                                                        onChange={(e) => { this.dataChange(e) }}
                                                                    />
                                                                    <Label
                                                                        className="form-check-label"
                                                                        check htmlFor="inline-radio1">
                                                                        {i18n.t('static.common.active')}
                                                                    </Label>
                                                                </FormGroup>
                                                                <FormGroup check inline>
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        id="active11"
                                                                        name="active"
                                                                        value={false}
                                                                        checked={this.state.active === false}
                                                                        onChange={(e) => { this.dataChange(e) }}
                                                                    />
                                                                    <Label
                                                                        className="form-check-label"
                                                                        check htmlFor="inline-radio2">
                                                                        {i18n.t('static.common.disabled')}
                                                                    </Label>
                                                                </FormGroup>
                                                            </FormGroup>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-12 pl-lg-0 pr-lg-0" style={{ display: 'inline-block' }}>
                                                        <div style={{ display: this.state.missingPUList.length > 0 ? 'block' : 'none' }}><div><b>{i18n.t('static.listTree.missingPlanningUnits')} : (<a href="/#/planningUnitSetting/listPlanningUnitSetting" className="supplyplanformulas">{i18n.t('static.Update.PlanningUnits')}</a>)</b></div><br />
                                                            <div id="missingPUJexcel" className="RowClickable">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <FormGroup className="col-md-12 float-right pt-lg-4 pr-lg-0">
                                                        <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.modelOpenCloseCreateTree}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAllCreateTree(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;

                                                    </FormGroup>
                                                </div>

                                                {/* <CardFooter>
                                                        <FormGroup>
                                                            <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.modelOpenClose}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                            <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                            &nbsp;

                                                        </FormGroup>
                                                    </CardFooter> */}
                                            </Form>

                                        )} />

                                {/* </Card> */}
                            </Col>
                            <br />
                        </ModalBody>
                    </Modal>
                </Card>

            </div>
        );
    }

}

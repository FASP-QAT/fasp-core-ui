import React, { Component } from 'react';
import DatasetService from '../../api/DatasetService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Card, CardHeader, CardBody, Button, Col, FormGroup, Label, InputGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader, CardFooter, FormFeedback, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Form } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutSearch } from '../../CommonComponent/JExcelCommonFunctions.js'
import i18n from '../../i18n';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY,PROGRAM_TYPE_DATASET,API_URL } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { Formik } from 'formik';
import * as Yup from 'yup'
import ProgramService from '../../api/ProgramService';
import { isSiteOnline, decompressJson, compressJson } from '../../CommonComponent/JavascriptCommonFunctions';
import '../Forms/ValidationForms/ValidationForms.css';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY,JEXCEL_INTEGER_REGEX, JEXCEL_DECIMAL_CATELOG_PRICE} from '../../Constants.js'
import CryptoJS from 'crypto-js'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import classNames from 'classnames';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import moment from 'moment';
import { calculateModelingData } from '../../views/DataSet/ModelingDataCalculation2';
import ListTreeEn from '../../../src/ShowGuidanceFiles/ManageTreeListTreeEn.html'
import ListTreeFr from '../../../src/ShowGuidanceFiles/ManageTreeListTreeFr.html'
import ListTreeSp from '../../../src/ShowGuidanceFiles/ManageTreeListTreeSp.html'
import ListTreePr from '../../../src/ShowGuidanceFiles/ManageTreeListTreePr.html'
import DropdownService from '../../api/DropdownService';
import PlanningUnitService from '../../api/PlanningUnitService';

const entityname = i18n.t('static.common.listtree');

const validationSchema = function (values) {
    return Yup.object().shape({
        datasetIdModal: Yup.string()
            .test('datasetIdModal', 'Please select program',
                function (value) {
                    // console.log("@@@ 1", document.getElementById("treeFlag").value);
                    // console.log("@@@ 2", document.getElementById("datasetIdModal").value);
                    if (document.getElementById("treeFlag").value == "false" && document.getElementById("datasetIdModal").value == "") {
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
                    // console.log("@@@ 3", document.getElementById("treeFlag").value);
                    // console.log("@@@ 4", document.getElementById("forecastMethodId").value);
                    if (document.getElementById("treeFlag").value == "false" && document.getElementById("forecastMethodId").value == "") {
                        // console.log("fm false");
                        return false;
                    } else {
                        // console.log("fm true");
                        return true;
                    }
                }),
        treeFlag: Yup.boolean(),
        regionId: Yup.string()
            .when("treeFlag", {
                is: val => {
                    return document.getElementById("treeFlag").value === "false";

                },
                then: Yup.string()
                    .required(i18n.t('static.common.regiontext'))
                    .typeError(i18n.t('static.common.regiontext')),
                otherwise: Yup.string().notRequired()
            }),
        // regionId: Yup.string()
        //     .test('regionId', i18n.t('static.validation.selectForecastMethod'),
        //         function (value) {
        //             // console.log("@@@",(parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2) && document.getElementById("nodeUnitId").value == "");
        //             if (document.getElementById("treeFlag").value == "false" && document.getElementById("regionId").value == "") {
        //                 return false;
        //             } else {
        //                 return true;
        //             }
        //         }),
    })
}

const initialValues = {
    treeName: "",
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
const months = [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')]

export default class ListTreeComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            treeEl: '',
            dropdownOpen: new Array(19).fill(false),
            isSubmitClicked: false,
            missingPUList: [],
            treeTemplate: '',
            active: true,
            forecastMethod: {
                id: "",
                label: {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: ''
                }
            },
            regionId: '',
            regionList: [],
            regionValues: [],
            notes: '',
            treeTemplateList: [],
            treeData: [],
            datasetList: [],
            downloadedProgramList: [],
            datasetListJexcel: [],
            message: '',
            loading: true,
            treeName: '',
            isModalOpen: false,
            programId: '',
            versionId: '',
            treeId: '',
            datasetId: '',
            treeFlag: true,
            forecastMethodList: [],
            // realmCountryId: '',
            datasetIdModal: '',
            tempTreeId: '',
            versions: [],
            allProgramList: [],
            programs: [],
            lang: localStorage.getItem('lang'),
            downloadedProgramListAcrossProgram: [],
            downloadAcrossProgram: 0,
            treeIdAcrossProgram: 0,
            forecastingUnitList:[],
            startDateDisplay: '',
            endDateDisplay: '',
            beforeEndDateDisplay: '',
            allProcurementAgentList: [],
            planningUnitObjList:[]
        }
        this.toggleDeropdownSetting = this.toggleDeropdownSetting.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.buildTree = this.buildTree.bind(this);
        this.onTemplateChange = this.onTemplateChange.bind(this);
        // this.getDatasetList = this.getDatasetList.bind(this);
        this.getTreeList = this.getTreeList.bind(this);
        this.getTreeTemplateList = this.getTreeTemplateList.bind(this);
        this.copyDeleteTree = this.copyDeleteTree.bind(this);
        this.modelOpenClose = this.modelOpenClose.bind(this);
        this.getForecastMethodList = this.getForecastMethodList.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.findMissingPUs = this.findMissingPUs.bind(this);
        this.buildMissingPUJexcel = this.buildMissingPUJexcel.bind(this);
        this.updateState = this.updateState.bind(this);
        this.saveTreeData = this.saveTreeData.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.saveMissingPUs = this.saveMissingPUs.bind(this);
        this.updateMissingPUs = this.updateMissingPUs.bind(this);
        this.procurementAgentList = this.procurementAgentList.bind(this);
        this.changed = this.changed.bind(this);  
        this.getPlanningUnitWithPricesByIds = this.getPlanningUnitWithPricesByIds.bind(this); 
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
                // console.log("in side datasetDetails")
                db1 = e.target.result;
                var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                var datasetDetailsRequest = datasetDetailsTransaction.get(id);
                datasetDetailsRequest.onsuccess = function (e) {
                    var datasetDetailsRequestJson = datasetDetailsRequest.result;
                    datasetDetailsRequestJson.changed = 1;
                    var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                    datasetDetailsRequest1.onsuccess = function (event) {

                    }
                }
                this.setState({
                    loading: false,
                    message: i18n.t('static.mt.dataUpdateSuccess'),
                    color: "green",
                    isSubmitClicked: false
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
                                        console.log("this.state.datasetIdModal Test@123",this.state.datasetIdModal)
                                        localStorage.setItem("sesDatasetId",this.state.datasetIdModal.split("~")[0]);
                                        localStorage.setItem("sesVersionIdReport", this.state.datasetIdModal.split("~v")[1]+" (Local)");
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
                        //                 this.getPrograms();
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
                // console.log("Data update success1");
                // alert("success");


            }.bind(this);
            transaction.onerror = function (event) {
                this.setState({
                    loading: false,
                    color: "red",
                }, () => {
                    this.hideSecondComponent();
                });
                // console.log("Data update errr");
            }.bind(this);
        }.bind(this);

    }
    updateState(parameterName, value) {
        // console.log("parameterName---", parameterName + " value---", value);
        // console.log("value---", value);
        if (parameterName != "loading") {
            this.setState({
                [parameterName]: value
            }, () => {
                if (parameterName == 'programId' && value != "") {
                    // console.log("tempTreeId---", this.state.tempTreeId)
                    var programId = this.state.programId;
                    var program = this.state.datasetListJexcel;
                    // console.log("my program---", program);
                    let tempProgram = JSON.parse(JSON.stringify(program))
                    let treeList = tempProgram.treeList;
                    var tree = treeList.filter(x => x.treeId == this.state.tempTreeId)[0];
                    // console.log("my tree---", tree);
                    var items = tree.tree.flatList;
                    // console.log("my items---", items);
                    var nodeDataMomList = this.state.nodeDataMomList;
                    // console.log("nodeDataMomList---", nodeDataMomList);
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
                    // console.log("findTreeIndex---", findTreeIndex);
                    treeList[findTreeIndex] = tree;
                    tempProgram.treeList = treeList;
                    var programCopy = JSON.parse(JSON.stringify(tempProgram));
                    var programData = (CryptoJS.AES.encrypt(JSON.stringify(tempProgram.programData), SECRET_KEY)).toString();
                    tempProgram.programData = programData;
                    var treeTemplateId = document.getElementById('templateId').value;
                    this.saveTreeData(3, tempProgram, treeTemplateId, programId, this.state.tempTreeId, programCopy);
                }
                // console.log("returmed list---", this.state.nodeDataMomList);

            })
        }
    }
    buildMissingPUJexcel() {
        if(isSiteOnline()){
            this.getPlanningUnitWithPricesByIds();
        }
        var missingPUList = this.state.missingPUList;
        console.log("missingPUList--->", missingPUList);
        var dataArray = [];
        let count = 0;
        if (missingPUList.length > 0) {
            for (var j = 0; j < missingPUList.length; j++) {
                console.log("missingPUList--->missingPUList[j].treeForecast", missingPUList[j].treeForecast);
                data = [];
                // data[0] = missingPUList[j].month
                // data[1] = missingPUList[j].startValue
                data[0] = getLabelText(missingPUList[j].productCategory.label, this.state.lang)
                data[1] = getLabelText(missingPUList[j].planningUnit.label, this.state.lang) + " | " + missingPUList[j].planningUnit.id
                data[2] = missingPUList[j].consuptionForecast;
                data[3] = missingPUList[j].treeForecast;
                data[4] = missingPUList[j].stock;
                data[5] = missingPUList[j].existingShipments;
                data[6] = missingPUList[j].monthsOfStock;
                data[7] = (missingPUList[j].price==="" || missingPUList[j].price==null || missingPUList[j].price==undefined)?"":(missingPUList[j].procurementAgent == null || missingPUList[j].procurementAgent == undefined ? -1 : missingPUList[j].procurementAgent.id);
                data[8] = missingPUList[j].price;
                data[9] = missingPUList[j].planningUnitNotes;
                data[10] = missingPUList[j].planningUnit.id;
                data[11] = missingPUList[j].programPlanningUnitId;
                data[12] = missingPUList[j].higherThenConsumptionThreshold;
                data[13] = missingPUList[j].lowerThenConsumptionThreshold;
                data[14] = missingPUList[j].selectedForecastMap;
                data[15] = missingPUList[j].otherUnit;
                data[16] = missingPUList[j].createdBy;
                data[17] = missingPUList[j].createdDate;
                data[18] = true;
                data[19] = missingPUList[j].exists;
                dataArray[count] = data;
                count++;
            }
        }
        this.el = jexcel(document.getElementById("missingPUJexcel"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("missingPUJexcel"), true);
        var data = dataArray;
        // console.log("DataArray>>>", dataArray);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [20, 80, 60, 60, 60, 60, 60, 60, 60, 60],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    // 0A
                    title: i18n.t('static.productCategory.productCategory'),
                    type: 'test',
                    editable: false,
                    readOnly: true
                },
                {
                    // 1B
                    title: i18n.t('static.product.product'),
                    type: 'text',
                    editable: false,
                    readOnly: true
                },
                {
                    //2C
                    title: i18n.t('static.commitTree.consumptionForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                    // editable: isSiteOnline() ? true : false,
                    // readOnly: isSiteOnline() ? false : true 
                },
                {
                    //3D
                    title: i18n.t('static.TreeForecast.TreeForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                    // editable: isSiteOnline() ? true : false,
                    // readOnly: isSiteOnline() ? false : true
                },
                {
                    //4E
                    title: i18n.t('static.planningUnitSetting.stockEndOf') + ' ' + this.state.beforeEndDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true,
                    editable: isSiteOnline() ? true : false,
                    readOnly: isSiteOnline() ? false : true
                },
                {
                    //5F
                    title: i18n.t('static.planningUnitSetting.existingShipments') + this.state.startDateDisplay + ' - ' + this.state.endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true,
                    editable: isSiteOnline() ? true : false,
                    readOnly: isSiteOnline() ? false : true
                },
                {
                    //6G
                    title: i18n.t('static.planningUnitSetting.desiredMonthsOfStock') + ' ' + this.state.endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    disabledMaskOnEdition: true,
                    width: '150',
                    editable: isSiteOnline() ? true : false,
                    readOnly: isSiteOnline() ? false : true
                },
                {
                    //7H
                    title: i18n.t('static.forecastReport.priceType'),
                    type: 'autocomplete',
                    source: this.state.allProcurementAgentList,
                    width: '120',
                    editable: isSiteOnline() ? true : false,
                    readOnly: isSiteOnline() ? false : true
                },
                {
                    //8I
                    title: i18n.t('static.forecastReport.unitPrice'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##.00',
                    width: '120',
                    disabledMaskOnEdition: true,
                    editable: isSiteOnline() ? true : false,
                    readOnly: isSiteOnline() ? false : true
                },
                {
                    //9J
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    editable: isSiteOnline() ? true : false,
                    readOnly: isSiteOnline() ? false : true
                },
                {
                    title: 'planningUnitId',
                    type: 'hidden',
                    readOnly: true //10K
                },
                {
                    title: 'programPlanningUnitId',
                    type: 'hidden',
                    readOnly: true //11L
                },
                {
                    title: 'higherThenConsumptionThreshold',
                    type: 'hidden',
                    readOnly: true //12M
                },
                {
                    title: 'lowerThenConsumptionThreshold',
                    type: 'hidden',
                    readOnly: true //13N
                },
                {
                    title: 'selectedForecastMap',
                    type: 'hidden',
                    readOnly: true //14O
                },
                {
                    title: 'otherUnit',
                    type: 'hidden',
                    readOnly: true //15P
                },
                {
                    title: 'createdBy',
                    type: 'hidden',
                    readOnly: true //16P
                },
                {
                    title: 'createdDate',
                    type: 'hidden',
                    readOnly: true //17P
                },
                {
                    title:i18n.t("static.common.select"),
                    type:'checkbox',
                    // readOnly: isSiteOnline() ? false : true
                },
                {
                    title:'exists',
                    type:'hidden',
                    readOnly:true
                }
            ],
            pagination: localStorage.getItem("sesRecordCount"),
            search: false,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            copyCompatibility: true,
            allowExport: false,
            onchange: this.changed,
            onload: this.loadedMissingPU,
            onchangepage: this.onchangepageMissingPU,
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

    onchangepageMissingPU(el, pageNo, oldPageNo) {
            if(!isSiteOnline()){
        var elInstance = el;
        var json = elInstance.getJson(null, false);
        var colArr=['C','D','E','F','G','H','I','J','S'];
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        for (var y = start; y < jsonLength; y++) {
            var colArr=['C','D','E','F','G','H','I','J','S'];
            if(json[y][19].toString()=="true"){
                for (var c = 0; c < colArr.length; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.remove('readonly');
                }
            }else{
                var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("D").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("S").concat(parseInt(y) + 1))
                cell.classList.add('readonly');
                elInstance.setStyle(("C").concat(parseInt(y) + 1), "pointer-events", "");
                elInstance.setStyle(("C").concat(parseInt(y) + 1), "pointer-events", "none");
                elInstance.setStyle(("D").concat(parseInt(y) + 1), "pointer-events", "");
                elInstance.setStyle(("D").concat(parseInt(y) + 1), "pointer-events", "none");
                elInstance.setStyle(("S").concat(parseInt(y) + 1), "pointer-events", "");
                elInstance.setStyle(("S").concat(parseInt(y) + 1), "pointer-events", "none");
            }
        }
        }
    }

    changed = function (instance, cell, x, y, value) {
        console.log("X Test@123",x)
        if(x==18){
            console.log("Value Test@123",value)
            var colArr=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R'];
            if(value.toString()=="false"){
                console.log("In changed Test@123")
                this.el.setValueFromCoords(2,y,this.state.missingPUList[y].consuptionForecast,true);
                this.el.setValueFromCoords(3,y,this.state.missingPUList[y].treeForecast,true);
                this.el.setValueFromCoords(4,y,this.state.missingPUList[y].stock,true);
                this.el.setValueFromCoords(5,y,this.state.missingPUList[y].existingShipments,true);
                this.el.setValueFromCoords(6,y,this.state.missingPUList[y].monthsOfStock,true);
                this.el.setValueFromCoords(7,y,(this.state.missingPUList[y].price==="" || this.state.missingPUList[y].price==null || this.state.missingPUList[y].price==undefined)?"":(this.state.missingPUList[y].procurementAgent == null || this.state.missingPUList[y].procurementAgent == undefined ? -1 : this.state.missingPUList[y].procurementAgent.id),true);
                this.el.setValueFromCoords(8,y,this.state.missingPUList[y].price,true);
                this.el.setValueFromCoords(9,y,this.state.missingPUList[y].planningUnitNotes,true);
                this.el.setValueFromCoords(10,y,this.state.missingPUList[y].planningUnit.id,true);
                this.el.setValueFromCoords(11,y,this.state.missingPUList[y].programPlanningUnitId,true);
                this.el.setValueFromCoords(12,y,this.state.missingPUList[y].higherThenConsumptionThreshold,true);
                this.el.setValueFromCoords(13,y,this.state.missingPUList[y].lowerThenConsumptionThreshold,true);
                this.el.setValueFromCoords(14,y,this.state.missingPUList[y].selectedForecastMap,true);
                this.el.setValueFromCoords(15,y,this.state.missingPUList[y].otherUnit,true);
                this.el.setValueFromCoords(16,y,this.state.missingPUList[y].createdBy,true);
                this.el.setValueFromCoords(17,y,this.state.missingPUList[y].createdDate,true);
                for (var c = 0; c < colArr.length; c++) {
                    var cell = this.el.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('readonly');
                }
            }else{
                for (var c = 0; c < colArr.length; c++) {
                    var cell = this.el.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.remove('readonly');
                }
            }
        }
        if (x == 7) {
            if (value != -1 && value !== null && value !== '') {
                console.log("Value--------------->IF");
                let planningUnitId = this.el.getValueFromCoords(10, y);
                
                let planningUnitObjList = this.state.planningUnitObjList;
                let tempPaList = planningUnitObjList.filter(c => c.planningUnitId == planningUnitId)[0];

                console.log("mylist--------->1112", planningUnitId);

                if (tempPaList != undefined) {
                    let obj = tempPaList.procurementAgentPriceList.filter(c => c.id == value)[0];
                    console.log("mylist--------->1113", obj);
                    if (typeof obj != 'undefined') {
                        this.el.setValueFromCoords(8, y, obj.price, true);
                    } else {
                        this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : this.el.setValueFromCoords(8, y, '', true);
                    }
                }

            } else {
                console.log("Value--------------->ELSE");
                this.el.setValueFromCoords(8, y, '', true);
            }

        }

        if (x == 0) {
            let q = '';
            q = (this.el.getValueFromCoords(1, y) != '' ? this.el.setValueFromCoords(1, y, '', true) : '');
            q = (this.el.getValueFromCoords(7, y) != '' ? this.el.setValueFromCoords(7, y, '', true) : '');
            q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');

            // this.el.setValueFromCoords(1, y, '', true);
            // this.el.setValueFromCoords(7, y, '', true);
            // this.el.setValueFromCoords(8, y, '', true);
        }
        if (x == 1) {
            let q = '';
            q = (this.el.getValueFromCoords(7, y) != '' ? this.el.setValueFromCoords(7, y, '', true) : '');
            q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');

            // this.el.setValueFromCoords(7, y, '', true);
            // this.el.setValueFromCoords(8, y, '', true);
        }

        //productCategory
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //planning unit
        if (x == 1) {
            var json = this.el.getJson(null, false);
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // console.log("json.length", json.length);
                var jsonLength = parseInt(json.length) - 1;
                // console.log("jsonLength", jsonLength);
                for (var i = jsonLength; i >= 0; i--) {
                    // console.log("i=---------->", i, "y----------->", y);
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    // console.log("Planning Unit value in change", map.get("1"));
                    // console.log("Value----->", value);
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        // this.el.setValueFromCoords(10, y, 1, true);
                        i = -1;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        // this.el.setValueFromCoords(10, y, 1, true);
                    }
                }
            }
        }

        //stock
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // console.log("Stock------------------->1", value);
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(4, y);
            }
            // var reg = /^[0-9\b]+$/;
            // console.log("Stock------------------->2", value);

            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (!Number.isInteger(Number(value))) {//decimal value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'))
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'))
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

            }

        }

        //existing shipments
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(5, y);
            }
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {

                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (!Number.isInteger(Number(value))) {//decimal value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'))
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'))
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //desired months of stock
        if (x == 6) {
            var col = ("G").concat(parseInt(y) + 1);
            value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(6, y);
            }
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (!Number.isInteger(Number(value))) {//decimal value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'))
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'))
                } else if (parseInt(value) > 99) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.max99MonthAllowed'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
               }
        }
        if(this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",","")>0 && this.el.getValue(`H${parseInt(y) + 1}`, true)==""){
            this.el.setValueFromCoords(7,y,-1,true);
        }


        //unit price
        if (x == 8) {
            var col = ("I").concat(parseInt(y) + 1);
            // this.el.setValueFromCoords(10, y, 1, true);
            value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(8, y);
            }
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            if (value == "") {
            } else {
                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (Number(value) < 0) {//negative value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.negativeValueNotAllowed'))
                } else if (!(reg.test(value))) {//regex check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.max10Digit4AfterDecimal'))
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        this.setState({
            isChanged1: true,
        });

        // if (x == 11) {
        //     this.el.setStyle(`A${parseInt(y) + 1}`, 'text-align', 'left');
        //     this.el.setStyle(`B${parseInt(y) + 1}`, 'text-align', 'left');

        //     if (value == 1 || value == "") {
        //         var cell = this.el.getCell(("B").concat(parseInt(y) + 1))
        //         cell.classList.remove('readonly');
        //         var cell = this.el.getCell(("A").concat(parseInt(y) + 1))
        //         cell.classList.remove('readonly');
        //     } else {
        //         var cell = this.el.getCell(("B").concat(parseInt(y) + 1))
        //         cell.classList.add('readonly');
        //         var cell = this.el.getCell(("A").concat(parseInt(y) + 1))
        //         cell.classList.add('readonly');
        //     }
        // }
    }
    loadedMissingPU = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance, 1);
        console.log("pp instance",instance)
        var asterisk = document.getElementsByClassName("jss")[1].firstChild.nextSibling;
        console.log("pp asterisk",asterisk)
        
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');

        tr.children[5].classList.add('InfoTr');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');
        tr.children[8].classList.add('InfoTr');

        tr.children[5].title = i18n.t('static.tooltip.Stock');
        tr.children[6].title = i18n.t('static.tooltip.ExistingShipments');
        tr.children[7].title = i18n.t('static.tooltip.DesiredMonthsofStock');
        tr.children[8].title = i18n.t('static.tooltip.PriceType');
        if(!isSiteOnline()){
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson(null, false);
        var jsonLength;

        if ((document.getElementsByClassName("jss_pagination_dropdown")[0] != undefined)) {
            jsonLength = 1 * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        }

        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var colArr=['C','D','E','F','G','H','I','J','S'];
        for (var j = 0; j < jsonLength; j++) {
            if(json[j][19].toString()=="true"){
            for (var c = 0; c < colArr.length; c++) {
                var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                cell.classList.remove('readonly');
            }
        }else{
            var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
            cell.classList.add('readonly');
            var cell = elInstance.getCell(("D").concat(parseInt(j) + 1))
            cell.classList.add('readonly');
            var cell = elInstance.getCell(("S").concat(parseInt(j) + 1))
            cell.classList.add('readonly');
            elInstance.setStyle(("C").concat(parseInt(j) + 1), "pointer-events", "");
            elInstance.setStyle(("C").concat(parseInt(j) + 1), "pointer-events", "none");
            elInstance.setStyle(("D").concat(parseInt(j) + 1), "pointer-events", "");
            elInstance.setStyle(("D").concat(parseInt(j) + 1), "pointer-events", "none");
            elInstance.setStyle(("S").concat(parseInt(j) + 1), "pointer-events", "");
            elInstance.setStyle(("S").concat(parseInt(j) + 1), "pointer-events", "none");
        }
        }
    }
    }

    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json);
        for (var y = 0; y < json.length; y++) {
            //tracer category
            var col = ("A").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(0, y);
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

            //planning unit
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getRowData(parseInt(y))[1];
            console.log("value-----", value);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                for (var i = (json.length - 1); i >= 0; i--) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    if (planningUnitValue == value && y != i && i > y && map.get("16").toString() == "true" && json[y][16].toString() == "true") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        i = -1;
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
//planningUnitSetting.stockEndOf
            var col = ("E").concat(parseInt(y) + 1);
            var value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(4, y);
            }
            var reg = JEXCEL_INTEGER_REGEX;
            console.log("value------------->E", value);
            if (value == "") {
            } else {
                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                    valid = false;
                } else if (!Number.isInteger(Number(value))) {//decimal value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'));
                    valid = false;
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
// planningUnitSetting.existingShipments
            var col = ("F").concat(parseInt(y) + 1);
            var value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(5, y);
            }
            var reg = JEXCEL_INTEGER_REGEX;
            if (value == "") {
            } else {
                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                    valid = false;
                } else if (!Number.isInteger(Number(value))) {//decimal value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'));
                    valid = false;
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }

            var col = ("G").concat(parseInt(y) + 1);
            var value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(6, y);
            }
            // var value = this.el.getValueFromCoords(6, y);
            var reg = JEXCEL_INTEGER_REGEX;
            if (value == "") {
            } else {
                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                    valid = false;
                } else if (!Number.isInteger(Number(value))) {//decimal value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.decimalNotAllowed'));
                    valid = false;
                } else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.10digitWholeNumber'));
                    valid = false;
                } else if (parseInt(value) > 99) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.max99MonthAllowed'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
            var col = ("I").concat(parseInt(y) + 1);
            var value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            if (value == "") {
                } else {
                if (isNaN(parseInt(value))) {//string value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                    valid = false;
                } else if (Number(value) < 0) {//negative value check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.negativeValueNotAllowed'));
                    valid = false;
                } else if (!(reg.test(value))) {//regex check
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.max10Digit4AfterDecimal'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        return valid;
    }

    saveMissingPUs(){
        var validation = this.checkValidation();
       console.log("validation",validation)
       var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
       var curUser = AuthenticationService.getLoggedInUserId();   
       console.log("validation curDate",curDate)
       
       console.log("validation curUser",curUser)
       
       let indexVar = 0;
       if (validation == true) {
        console.log("validation Inside if loop ");
       
        var tableJson = this.el.getJson(null, false);
        var planningUnitList = [];
        var programs = [];
        var missingPUList = this.state.missingPUList;
        var updatedMissingPUList=[];
        for (var i = 0; i < tableJson.length; i++) {
            if(tableJson[i][18].toString()=="true"){
            console.log("validation Inside for loop ");
       
            var map1 = new Map(Object.entries(tableJson[i]));
            console.log("validation map1 ",map1);
            let procurementAgentObj = "";
                if (parseInt(map1.get("7")) === -1 || (map1.get("7")) == "" ) {
                    procurementAgentObj = null
                } else {
                    procurementAgentObj = this.state.allProcurementAgentList.filter(c => c.id == parseInt(map1.get("7")))[0];
                }
                var planningUnitObj = this.state.planningUnitObjList.filter(c => c.planningUnitId == missingPUList[i].planningUnit.id)[0];         
            let tempJson = {
                "programPlanningUnitId": map1.get("11"),
                "planningUnit": {
                    "id": planningUnitObj.planningUnitId,
                    "label":planningUnitObj.label,
                    "unit": planningUnitObj.unit,
                    "multiplier": planningUnitObj.multiplier,
                    "forecastingUnit": {
                        "id": planningUnitObj.forecastingUnit.forecastingUnitId,
                        "label": planningUnitObj.forecastingUnit.label,
                        "unit": planningUnitObj.forecastingUnit.unit,
                        "productCategory": planningUnitObj.forecastingUnit.productCategory,
                        "tracerCategory": planningUnitObj.forecastingUnit.tracerCategory,
                        "idString": "" + planningUnitObj.forecastingUnit.forecastingUnitId
                    },
                    "idString": "" + planningUnitObj.planningUnitId
                },
                "consuptionForecast": map1.get("2"),
                "treeForecast": map1.get("3"),
                "stock": this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                "existingShipments": this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                "monthsOfStock": this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                "procurementAgent": (procurementAgentObj == null ? null : {
                    "id": parseInt(map1.get("7")),
                    "label": procurementAgentObj.label,
                    "code": procurementAgentObj.code,
                    "idString": "" + parseInt(map1.get("7"))
                }),
                "price": this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                "higherThenConsumptionThreshold": map1.get("12"),
                "lowerThenConsumptionThreshold": map1.get("13"),
                "planningUnitNotes": map1.get("9"),
                "consumptionDataType": 2,
                "otherUnit": map1.get("15")==""?null:map1.get("15"),
                "selectedForecastMap":map1.get("14"),
                "createdBy":
                {
                  "userId": map1.get("16")==""? curUser:map1.get("16"),
                }, 
                "createdDate": map1.get("17")==""? curDate:map1.get("17"),
                "active": true,
            }
            console.log("validation tempJson ",tempJson);
            planningUnitList.push(tempJson);
        }else{
            updatedMissingPUList.push(missingPUList[i])
        }
        }
        console.log("Updated Missing Pu List ",updatedMissingPUList)
        console.log("validation planningUnitList ",planningUnitList);
           
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
                myResult = getRequest.result;

                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                var filteredGetRequestList = myResult.filter(c => c.userId == userId);

                var program = filteredGetRequestList.filter(x => x.id == (this.state.datasetIdModal+"_uId_" + userId).replace("~","_"))[0];
                console.log("program------",program);
                var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
                var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                console.log("programData------",programData);
                var planningFullList=programData.planningUnitList;
                console.log("1Aug planningUnitList------",planningUnitList);
                console.log("1Aug programData------Before",programData.planningUnitList);
                
                planningUnitList.forEach(p => {
                    indexVar=programData.planningUnitList.findIndex(c=>c.planningUnit.id==p.planningUnit.id)

                    console.log("1Aug indexVar------",indexVar);
                    if(indexVar!=-1){
                        planningFullList[indexVar] = p;
                    }else{
                        planningFullList = planningFullList.concat(p);
                    }
                    console.log("1Aug planningFullList------1",planningFullList);
                })
                console.log("1Aug planningFullList------",planningFullList);
                
            programData.planningUnitList = planningFullList;
            var datasetListJexcel=programData;
            console.log("1Aug programData------after",programData.planningUnitList);
            let downloadedProgramData = this.state.downloadedProgramData;
            console.log("DPD Test@123",downloadedProgramData);
            var index=downloadedProgramData.findIndex(c=>c.programId==programData.programId && c.currentVersion.versionId==programData.currentVersion.versionId);
            console.log("Index Test@123",index)
            downloadedProgramData[index]=programData;
            programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
            program.programData = programData;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var programTransaction = transaction.objectStore('datasetData');
            // programs.forEach(program => {
                programTransaction.put(program);
            // })
            
            transaction.oncomplete = function (event) {
                db1 = e.target.result;
                var id = (this.state.datasetIdModal+"_uId_" + userId).replace("~","_");
                
                var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                var datasetDetailsRequest = datasetDetailsTransaction.get(id);
                
                datasetDetailsRequest.onsuccess = function (e) {
                    var datasetDetailsRequestJson = datasetDetailsRequest.result;
                    datasetDetailsRequestJson.changed = 1;
                    var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                    console.log("Testing Final-------------->downloadedProgramData", downloadedProgramData);
            
                    datasetDetailsRequest1.onsuccess = function (event) {
                        this.setState({
                            // message: i18n.t('static.mt.dataUpdateSuccess'),
                            color: "green",
                            missingPUList: updatedMissingPUList,
                            downloadedProgramData:downloadedProgramData,
                            datasetListJexcel:datasetListJexcel
                        },()=>{
                            if(this.state.missingPUList.length>0){
                                this.buildMissingPUJexcel();
                            }
                        });
                    }.bind(this)
                }.bind(this)
                }.bind(this);
                transaction.onerror = function (event) {
                }.bind(this);
            }.bind(this);
        }.bind(this);
    }
    }

    updateMissingPUs(){
        var validation = this.checkValidation();
       console.log("validation",validation)
       var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
       var curUser = AuthenticationService.getLoggedInUserId();   
       console.log("validation curDate",curDate)
       
       console.log("validation curUser",curUser)
       
       let indexVar = 0;
       if (validation == true) {
        console.log("validation Inside if loop ");
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
                myResult = getRequest.result;

                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                var filteredGetRequestList = myResult.filter(c => c.userId == userId);

                var program = filteredGetRequestList.filter(x => x.id == (this.state.datasetIdModal+"_uId_" + userId).replace("~","_"))[0];
                console.log("program------",program);
                var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
                var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                console.log("programData------",programData);
                var planningFullList=programData.planningUnitList;
                // console.log("1Aug planningUnitList------",planningUnitList);
                console.log("1Aug programData------Before",programData.planningUnitList);
                var tableJson = this.el.getJson(null, false);
                var updatedMissingPUList=[];
                tableJson.forEach((p,index) => {
                    if(p[19].toString()=="true" && p[18].toString()=="true"){
                    indexVar=programData.planningUnitList.findIndex(c=>c.planningUnit.id==this.state.missingPUList[index].planningUnit.id)

                    console.log("1Aug indexVar------",indexVar);
                    if(indexVar!=-1){
                        let procurementAgentObj = "";
                        if (parseInt(p[7]) === -1 || (p[7]) == "" ) {
                            procurementAgentObj = null
                        } else {
                            procurementAgentObj = this.state.allProcurementAgentList.filter(c => c.id == parseInt(p[7]))[0];
                        }
                        planningFullList[indexVar].consuptionForecast = p[2];
                        planningFullList[indexVar].treeForecast = p[3];
                        planningFullList[indexVar].stock = this.el.getValue(`E${parseInt(index) + 1}`, true).toString().replaceAll(",", "");
                        planningFullList[indexVar].existingShipments = this.el.getValue(`F${parseInt(index) + 1}`, true).toString().replaceAll(",", "");
                        planningFullList[indexVar].monthsOfStock = this.el.getValue(`G${parseInt(index) + 1}`, true).toString().replaceAll(",", "");
                        planningFullList[indexVar].procurementAgent=(procurementAgentObj == null ? null : {
                            "id": parseInt(p[7]),
                            "label": procurementAgentObj.label,
                            "code": procurementAgentObj.code,
                            "idString": "" + parseInt(p[7])
                        });
                        planningFullList[indexVar].price=this.el.getValue(`I${parseInt(index) + 1}`, true).toString().replaceAll(",", "");
                        planningFullList[indexVar].planningUnitNotes=p[9];


                    }
            }else{
                updatedMissingPUList.push(this.state.missingPUList[index])
            }
                    console.log("1Aug planningFullList------1",planningFullList);
                })
                console.log("1Aug planningFullList------",planningFullList);
                
            programData.planningUnitList = planningFullList;
            var datasetListJexcel=programData;
            console.log("1Aug programData------after",programData.planningUnitList);
            let downloadedProgramData = this.state.downloadedProgramData;
            console.log("DPD Test@123",downloadedProgramData);
            var index=downloadedProgramData.findIndex(c=>c.programId==programData.programId && c.currentVersion.versionId==programData.currentVersion.versionId);
            console.log("Index Test@123",index)
            downloadedProgramData[index]=programData;
            programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
            program.programData = programData;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var programTransaction = transaction.objectStore('datasetData');
            // programs.forEach(program => {
                programTransaction.put(program);
            // })
            
            transaction.oncomplete = function (event) {
                db1 = e.target.result;
                var id = (this.state.datasetIdModal+"_uId_" + userId).replace("~","_");
                
                var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                var datasetDetailsRequest = datasetDetailsTransaction.get(id);
                
                datasetDetailsRequest.onsuccess = function (e) {
                    var datasetDetailsRequestJson = datasetDetailsRequest.result;
                    datasetDetailsRequestJson.changed = 1;
                    var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                    console.log("Testing Final-------------->downloadedProgramData", downloadedProgramData);
            
                    datasetDetailsRequest1.onsuccess = function (event) {
                        this.setState({
                            // message: i18n.t('static.mt.dataUpdateSuccess'),
                            color: "green",
                            missingPUList: updatedMissingPUList,
                            downloadedProgramData:downloadedProgramData,
                            datasetListJexcel:datasetListJexcel
                        },()=>{
                            if(this.state.missingPUList.length>0){
                                this.buildMissingPUJexcel();
                            }
                        });
                    }.bind(this)
                }.bind(this)
                }.bind(this);
                transaction.onerror = function (event) {
                }.bind(this);
            }.bind(this);
        }.bind(this);
    }
    }

    getPlanningUnitWithPricesByIds(){
      console.log("semma----",this.state.missingPUList.map(ele => (ele.planningUnit.id).toString()));
      PlanningUnitService.getPlanningUnitWithPricesByIds(this.state.missingPUList.map(ele => (ele.planningUnit.id).toString()))
        .then(response => {
            console.log("Output---",response.data)
            var listArray = response.data;
            this.setState({
                planningUnitObjList:response.data
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

                        // case 401:
                        //     this.props.history.push(`/login/static.message.sessionExpired`)
                        //     break;
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

    procurementAgentList() {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
            var procurementAgentOs = procurementAgentTransaction.objectStore('procurementAgent');
            var procurementAgentRequest = procurementAgentOs.getAll();
            var planningList = []
            procurementAgentRequest.onerror = function (event) {
                // Handle errors!
                this.setState({
                    message: 'unknown error occured', loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            };
            procurementAgentRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = procurementAgentRequest.result;
                var listArray = myResult;
                listArray.sort((a, b) => {
                    var itemLabelA = (a.procurementAgentCode).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = (b.procurementAgentCode).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                let tempList = [];

                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: listArray[i].procurementAgentCode,
                            id: parseInt(listArray[i].procurementAgentId),
                            active: listArray[i].active,
                            code: listArray[i].procurementAgentCode,
                            label: listArray[i].label
                        }
                        tempList[i] = paJson
                    }
                }

                tempList.unshift({
                    name: 'CUSTOM',
                    id: -1,
                    active: true,
                    code: 'CUSTOM',
                    label: {}
                });
                this.setState({
                    allProcurementAgentList: tempList,
                    })
            }.bind(this);
        }.bind(this)
    }

    findMissingPUs() {
        var missingPUList = [];
        var json;
        if (this.state.downloadAcrossProgram == 1) {
            var treeAcrossProgram = this.state.downloadedProgramData.filter(c => c.programId == this.state.datasetId && c.currentVersion.versionId == this.state.versionId.toString().split(" ")[0])[0].treeList.filter(c => c.treeId == this.state.treeIdAcrossProgram)[0];
            var treeTemplate = treeAcrossProgram.tree;
            var scenarioList = treeAcrossProgram.scenarioList;
        } else {
            var treeTemplate = this.state.treeTemplate;
            var scenarioList = [{ id: 0 }];
        }
        console.log("dataset Id template---", this.state.datasetIdModal);
        if (this.state.datasetIdModal != "" && this.state.datasetIdModal != null) {
            var dataset = this.state.datasetListJexcel;
            // console.log("dataset---", dataset);
            // console.log("treeTemplate---", treeTemplate);
            var puNodeList = treeTemplate.flatList.filter(x => x.payload.nodeType.id == 5);
            console.log("puNodeList---", puNodeList);

            // var planningUnitList = dataset.planningUnitList.filter(x => x.treeForecast == true && x.active == true);
            var planningUnitList = dataset.planningUnitList;
            console.log("planningUnitList---", planningUnitList);
            for (let i = 0; i < puNodeList.length; i++) {
                for (let s = 0; s < scenarioList.length; s++) {
                    if (planningUnitList.filter(x => x.treeForecast == true && x.active == true && x.planningUnit.id == puNodeList[i].payload.nodeDataMap[scenarioList[s].id][0].puNode.planningUnit.id).length == 0) {
                        var parentNodeData = treeTemplate.flatList.filter(x => x.id == puNodeList[i].parent)[0];
                        console.log("parentNodeData---", parentNodeData);
                        var productCategory="";
                        productCategory=parentNodeData.payload.nodeDataMap[scenarioList[s].id][0].fuNode.forecastingUnit.productCategory;
                        if(productCategory==undefined){
                            var forecastingUnit=this.state.forecastingUnitList.filter(c=>c.forecastingUnitId==parentNodeData.payload.nodeDataMap[scenarioList[s].id][0].fuNode.forecastingUnit.id);
                            productCategory=forecastingUnit[0].productCategory;
                        }
                        let existingPU=planningUnitList.filter(x => x.planningUnit.id == puNodeList[i].payload.nodeDataMap[scenarioList[s].id][0].puNode.planningUnit.id);
                        console.log("existingPU",existingPU)
                        if(existingPU.length > 0 ){
                        json ={
                            productCategory: productCategory,    
                            planningUnit: puNodeList[i].payload.nodeDataMap[scenarioList[s].id][0].puNode.planningUnit,
                            consuptionForecast: existingPU[0].consuptionForecast,
                            treeForecast: true,
                            stock: existingPU[0].stock,
                            existingShipments: existingPU[0].existingShipments,
                            monthsOfStock: existingPU[0].monthsOfStock,
                            procurementAgent: existingPU[0].procurementAgent,
                            price: existingPU[0].price,
                            higherThenConsumptionThreshold: existingPU[0].higherThenConsumptionThreshold,
                            lowerThenConsumptionThreshold: existingPU[0].lowerThenConsumptionThreshold,
                            planningUnitNotes: existingPU[0].planningUnitNotes,
                            consumptionDataType: existingPU[0].consumptionDataType,
                            otherUnit: existingPU[0].otherUnit,
                            selectedForecastMap: existingPU[0].selectedForecastMap,
                            programPlanningUnitId: existingPU[0].programPlanningUnitId,
                            createdBy:existingPU[0].createdBy,
                            createdDate:existingPU[0].createdDate,
                            exists:true
                        }
                        missingPUList.push(json);    
                        }else{
                            json = {
                                productCategory: productCategory,
                                planningUnit: puNodeList[i].payload.nodeDataMap[scenarioList[s].id][0].puNode.planningUnit,
                                consuptionForecast: "",
                                treeForecast: true,
                                stock: "",
                                existingShipments: "",
                                monthsOfStock: "",
                                procurementAgent: "",
                                price: "",
                                higherThenConsumptionThreshold: "",
                                lowerThenConsumptionThreshold: "",
                                planningUnitNotes: "",
                                consumptionDataType: "",
                                otherUnit: "",
                                selectedForecastMap: {},
                                programPlanningUnitId: 0,        
                                createdBy: null,
                                createdDate: null,
                                exists:false
                            };
                            missingPUList.push(json);
                        }
                    }
                }
            }
        }
        console.log("missingPUList---", missingPUList);
        if (missingPUList.length > 0) {
            missingPUList = missingPUList.filter((v, i, a) => a.findIndex(v2 => (v2.planningUnit.id === v.planningUnit.id)) === i)
        }
        console.log("missingPUList---after", missingPUList);
        this.setState({
            missingPUList
        }, () => {
            this.buildMissingPUJexcel();
        });
    }
    handleRegionChange = (regionIds) => {
        // console.log("regionIds---", regionIds);

        this.setState({
            regionValues: regionIds.map(ele => ele),
            // regionLabels: regionIds.map(ele => ele.label)
        }, () => {
            // console.log("regionValues---", this.state.regionValues);
            // console.log("regionLabels---", this.state.regionLabels);
            // if ((this.state.regionValues).length > 0) {
            var regionList = [];
            var regions = this.state.regionValues;
            // console.log("regions---", regions)
            for (let i = 0; i < regions.length; i++) {
                var json = {
                    id: regions[i].value,
                    label: {
                        label_en: regions[i].label
                    }
                }
                regionList.push(json);
            }
            // console.log("final regionList---", regionList);
            this.setState({ regionList });
            // }
        })
    }


    getRegionList(datasetId) {
        // console.log("datasetId details---", datasetId);

        var regionList = [];
        var regionMultiList = [];
        if (datasetId != 0 && datasetId != "" && datasetId != null) {
            var program = this.state.datasetListJexcel;
            // console.log("program details---", program);
            regionList = program.regionList;
            // console.log("program for display---", program);
            // realmCountryId = program.programData.realmCountry.realmCountryId;

            regionList.map(c => {
                regionMultiList.push({ label: getLabelText(c.label, this.state.lang), value: c.regionId })
            })
            if(regionMultiList.length==1){
                regionList = [];
                var regions = regionMultiList;
                for (let i = 0; i < regions.length; i++) {
                    var json = {
                        id: regions[i].value,
                        label: {
                            label_en: regions[i].label
                        }
                    }
                    regionList.push(json);
                }
            }
        }
        this.setState({
            regionList,
            regionMultiList,
            missingPUList: [],
            regionValues:regionMultiList.length==1?regionMultiList:[]
        }, () => {
            if (this.state.treeTemplate != "" || this.state.downloadAcrossProgram == 1)
                this.findMissingPUs();
        });
    }
    getForecastMethodList() {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['forecastMethod'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('forecastMethod');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                // console.log("myResult===============2", myResult)
                this.setState({
                    forecastMethodList: myResult.filter(x => x.forecastMethodTypeId == 1)
                }, () => {

                })
            }.bind(this);
        }.bind(this)
    }

    touchAll(setTouched, errors) {
        setTouched({
            treeName: true,
            forecastMethodId: true,
            regionId: true,
            datasetIdModal: true
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

    copyDeleteTree(treeId, programId, versionId, operationId) {

        console.log("TreeId--------------->", treeId,"programId--------------->", programId,"versionId--------------->", versionId, "operationId--------------->",operationId);
        // var program = this.state.treeFlag ? (this.state.datasetList.filter(x => x.programId == programId && x.version == versionId)[0]) : (this.state.datasetList.filter(x => x.id == programId)[0]);
        var program = this.state.datasetListJexcel;
        console.log("seema program---", program);
        let tempProgram = JSON.parse(JSON.stringify(program))
        console.log("seema tempProgram------",tempProgram)
        let treeList = program.treeList;
        // console.log("delete treeList---", treeList);
        var treeTemplateId = '';
        if (operationId == 1) {//delete
            // console.log("delete treeId---", treeId);
            const index = treeList.findIndex(c => c.treeId == treeId);
            // console.log("delete index---", index);
            // if (index > 0) {
            const result = treeList.splice(index, 1);
            // }
        } else if (operationId == 2) {//copy
            let treeName = this.state.treeName;

            for (let i = 0; i < treeList.length; i++) {
                if (treeList[i].treeId == treeId) {
                    let treeObj = JSON.parse(JSON.stringify(treeList[i]));
                    let maxTreeId = treeList.length > 0 ? Math.max(...treeList.map(o => o.treeId)) : 0;
                    treeObj.treeId = maxTreeId + 1;
                    treeObj.label = {
                        "createdBy": null,
                        "createdDate": null,
                        "lastModifiedBy": null,
                        "lastModifiedDate": null,
                        "active": true,
                        "labelId": '',
                        "label_en": treeName,
                        "label_sp": null,
                        "label_fr": null,
                        "label_pr": null
                    }

                    treeList.push(treeObj);
                    break;
                }
            }

            // console.log("TreeId--------------->12", treeList);
        } else if (operationId == 3) {
            // program = (this.state.datasetList.filter(x => x.id == programId)[0]);
            var maxTreeId = treeList.length > 0 ? Math.max(...treeList.map(o => o.treeId)) : 0;
            treeId = parseInt(maxTreeId) + 1;
            var nodeDataMap = {};
            var tempArray = [];
            var tempJson = {};
            var tempTree = {};
            // var curMonth = moment(new Date()).format('YYYY-MM-DD');
            // console
            var curMonth = moment(program.currentVersion.forecastStartDate).format('YYYY-MM-DD');
            treeTemplateId = document.getElementById('templateId').value;
            // console.log("treeTemplateId===", treeTemplateId);
            if (treeTemplateId != "" && treeTemplateId != 0) {
                var treeTemplate = this.state.treeTemplateList.filter(x => x.treeTemplateId == treeTemplateId)[0];
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
                            // console.log("startMonthNoModeling---", startMonthNoModeling);
                            modeling.startDate = moment(curMonth).startOf('month').add(startMonthNoModeling, 'months').format("YYYY-MM-DD");
                            var stopMonthNoModeling = modeling.stopDateNo < 0 ? modeling.stopDateNo : parseInt(modeling.stopDateNo - 1)
                            // console.log("stopMonthNoModeling---", stopMonthNoModeling);
                            modeling.stopDate = moment(curMonth).startOf('month').add(stopMonthNoModeling, 'months').format("YYYY-MM-DD");


                            // console.log("modeling---", modeling);
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
            } else {
                tempJson = {
                    nodeDataId: 1,
                    notes: '',
                    month: moment(program.currentVersion.forecastStartDate).startOf('month').subtract(1, 'months').format("YYYY-MM-DD"),
                    dataValue: "0",
                    extrapolation: false,
                    calculatedDataValue: '0',
                    displayDataValue: '',
                    nodeDataModelingList: [],
                    nodeDataOverrideList: [],
                    nodeDataMomList: [],
                    fuNode: {
                        noOfForecastingUnitsPerPerson: '',
                        usageFrequency: '',
                        forecastingUnit: {
                            label: {
                                label_en: ''
                            },
                            tracerCategory: {

                            },
                            unit: {
                                id: ''
                            }
                        },
                        usageType: {
                            id: ''
                        },
                        usagePeriod: {
                            usagePeriodId: ''
                        },
                        repeatUsagePeriod: {
                            usagePeriodId: ''
                        },
                        noOfPersons: ''
                    },
                    puNode: {
                        planningUnit: {
                            unit: {

                            }
                        },
                        refillMonths: ''
                    }
                };
                tempArray.push(tempJson);
                nodeDataMap[1] = tempArray;
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
                    levelList: [{
                        levelId: null,
                        levelNo: 0,
                        label: {
                            label_en: "Level 0",
                            label_sp: "",
                            label_pr: "",
                            label_fr: ""
                        },
                        unit: {
                            id: "",
                            label: {}
                        }
                    }],
                    tree: {
                        flatList: [{
                            id: 1,
                            level: 0,
                            parent: null,
                            sortOrder: "00",
                            newTree: true,
                            payload: {
                                label: {
                                    label_en: ''
                                },
                                nodeType: {
                                    id: 2
                                },
                                nodeUnit: {
                                    id: ''
                                },
                                nodeDataMap: nodeDataMap
                            },
                            parentItem: {
                                payload: {
                                    nodeUnit: {

                                    }
                                }
                            }
                        }]
                    }
                }
            }

            // console.log("region values---", this.state.regionValues);
            // console.log("curTreeObj.regionList---", curTreeObj.regionList);


            treeList.push(tempTree);
        } else if (operationId == 4) {//copy
            let treeName = this.state.treeName;
            console.log("Testing this.state.datasetId---", this.state.datasetId);
            console.log("Testing this.state.versionId.toString().split()[0]---", this.state.versionId.toString().split(" ")[0]);
            console.log("Testing this.state.treeIdAcrossProgram---", this.state.treeIdAcrossProgram);
            console.log("Testing this.state.downloadedProgramData---", this.state.downloadedProgramData);
            console.log("Testing this.state.downloadedProgramData filter---", this.state.downloadedProgramData.filter(c => c.programId == this.state.datasetId));
            var originalTree = this.state.downloadedProgramData.filter(c => c.programId == this.state.datasetId && c.currentVersion.versionId == this.state.versionId.toString().split(" ")[0])[0].treeList.filter(c => c.treeId == this.state.treeIdAcrossProgram)[0];
            console.log("Testing originalTree---", originalTree);
            // for (let i = 0; i < treeList.length; i++) {
            // if (treeList[i].treeId == treeId) {
            let treeObj = JSON.parse(JSON.stringify(originalTree));
            console.log("Testing treeObj---", treeObj);
            
            let maxTreeId = treeList.length > 0 ? Math.max(...treeList.map(o => o.treeId)) : 0;
            treeId = parseInt(maxTreeId) + 1;
            treeObj.treeId = maxTreeId + 1;
            treeObj.forecastMethod = this.state.forecastMethod;
            treeObj.notes = this.state.notes;
            treeObj.regionList = this.state.regionList;
            treeObj.label = {
                "createdBy": null,
                "createdDate": null,
                "lastModifiedBy": null,
                "lastModifiedDate": null,
                "active": true,
                "labelId": '',
                "label_en": treeName,
                "label_sp": null,
                "label_fr": null,
                "label_pr": null
            }

            treeList.push(treeObj);
            // break;
            // }
            // }
        }
        // console.log("TreeList@@@@@@@@@@@@@@", treeList)
        tempProgram.treeList = treeList;
        var programCopy = JSON.parse(JSON.stringify(tempProgram));
        // var programData = (CryptoJS.AES.encrypt(JSON.stringify(tempProgram), SECRET_KEY)).toString();
        // tempProgram = programData;
        // if (operationId == 3) {
        if ((operationId == 3 && (treeTemplateId != "" && treeTemplateId != null)) || operationId == 4) {
            console.log("programId 1---", programId);
            programCopy.programData = tempProgram;
            calculateModelingData(programCopy, this, programId, 0, 1, 1, treeId, false, true, true);
        } else {
            this.saveTreeData(operationId, tempProgram, treeTemplateId, programId, treeId, programCopy);
        }

    }


    getTreeTemplateList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['treeTemplate'], 'readwrite');
            var program = transaction.objectStore('treeTemplate');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var treeTemplateList = myResult.filter(x => x.active == true && (x.flatList.filter(c => c.parent == null)[0].payload.nodeType.id == 2 || x.flatList.filter(c => c.parent == null)[0].payload.nodeType.id == 1));
                treeTemplateList.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    treeTemplateList
                });
                // for (var i = 0; i < myResult.length; i++) {
                //     console.log("treeTemplateList--->", myResult[i])

                // }

            }.bind(this);
        }.bind(this);
    }

    getTreeList() {
        var datasetId = document.getElementById("datasetId").value;
        localStorage.setItem("sesDatasetId", datasetId);
        var datasetList = this.state.datasetListJexcel;
        console.log("filter tree---", datasetList);
        var datasetIdModal = datasetList.programId + "~v" + datasetList.currentVersion.versionId;
        this.setState({
            datasetId,
            datasetIdModal: datasetIdModal,
            treeData: datasetList,
        }, () => {
            this.buildJexcel();
        });
    }

    getPrograms() {
        this.setState({ loading: true })
        if (isSiteOnline()) {
            // console.log("getDataSetListAll")
            let realmId = AuthenticationService.getRealmId();
            DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_DATASET)
            // ProgramService.getDataSetListAll()
            .then(response => {
                var proList = [];
                if (response.status == 200) {
                    for (var i = 0; i < response.data.length; i++) {
                        var programJson = {
                          programId: response.data[i].id,
                          label: response.data[i].label,
                          programCode: response.data[i].code
                        }
                        proList[i] = programJson
                    }
                    this.setState({
                        datasetList: proList,
                        loading: false,
                        allProgramList: proList
                    }, () => {
                        this.consolidatedProgramList();
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    }, () => {
                        this.hideSecondComponent();
                    })
                }
            }).catch(
                error => {
                    this.consolidatedProgramList();
                }
            );
        } else {
            // console.log('offline')
            this.setState({ loading: false })
            this.consolidatedProgramList()
        }
    }

    consolidatedProgramList = () => {
        this.setState({ loading: true })
        const lan = 'en';
        const { datasetList } = this.state
        var proList = datasetList;

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

                var pcTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
            var pcProgram = pcTransaction.objectStore('forecastingUnit');
            var pcGetRequest = pcProgram.getAll();
            pcGetRequest.onsuccess = function (event) {
                myResult = getRequest.result;
                var pcList=pcGetRequest.result;
                this.setState({
                    forecastingUnitList:pcList
                })
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                let downloadedProgramData = [];
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        programData.code=programData.programCode;
                        programData.id=programData.programId;
                        // console.log(programNameLabel)

                        var f = 0
                        for (var k = 0; k < this.state.datasetList.length; k++) {
                            if (this.state.datasetList[k].programId == programData.programId) {
                                f = 1;
                                // console.log('already exist')
                            }
                        }
                        if (f == 0) {
                            proList.push(programData)
                        }
                        downloadedProgramData.push(programData);
                    }

                }
                var lang = this.state.lang;

                if (proList.length == 1) {
                    this.setState({
                        datasetList: proList.sort(function (a, b) {
                            a = (a.programCode).toLowerCase();
                            b = (b.programCode).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        datasetId: proList[0].programId,
                        loading: false,
                        downloadedProgramData: downloadedProgramData,
                        downloadedProgramList: downloadedProgramData.sort(function (a, b) {
                            a = (a.programCode).toLowerCase();
                            b = (b.programCode).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })
                    }, () => {
                        console.log("downloadedProgramData------------------> inside If", downloadedProgramData);
                        // console.log("downloadedProgramList------------------>", downloadedProgramList);

                        this.filterVersion();
                    })
                } else {
                    // console.log("this.props.match.params.programId@@@", this.props.match.params.programId);
                    if (this.props.match.params.programId != "" && this.props.match.params.programId != undefined) {
                        this.setState({
                            datasetList: proList.sort(function (a, b) {
                                a = (a.programCode).toLowerCase();
                                b = (b.programCode).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            datasetId: this.props.match.params.programId,
                            downloadedProgramData: downloadedProgramData,
                            downloadedProgramList: downloadedProgramData.sort(function (a, b) {
                                a = (a.programCode).toLowerCase();
                                b = (b.programCode).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            loading: false
                        }, () => {
                            // console.log("programs------------------>", this.state.datasetList);
                            console.log("downloadedProgramData------------------>", downloadedProgramData);
                      
                            this.filterVersion();
                        })
                    }
                    else if (localStorage.getItem("sesDatasetId") != '' && localStorage.getItem("sesDatasetId") != undefined) {
                        console.log("Seema localStorage.getItem-sesDatasetId------------------>", localStorage.getItem("sesDatasetId"));
                        var datasetarr = localStorage.getItem("sesDatasetId").split('_');
                        var datasetId = datasetarr[0];
                        this.setState({
                            datasetList: proList.sort(function (a, b) {
                                a = (a.programCode).toLowerCase();
                                b = (b.programCode).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            datasetId: datasetId,
                            loading: false,
                            downloadedProgramData: downloadedProgramData,
                            downloadedProgramList: downloadedProgramData.sort(function (a, b) {
                                a = (a.programCode).toLowerCase();
                                b = (b.programCode).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })
                        }, () => {
                            // console.log("programs------------------>", this.state.datasetList);
                            console.log("downloadedProgramData------------------>", downloadedProgramData);
                      
                            this.filterVersion();
                        })
                    } else {
                        this.setState({
                            datasetList: proList.sort(function (a, b) {
                                a = (a.programCode).toLowerCase();
                                b = (b.programCode).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            loading: false,
                            downloadedProgramData: downloadedProgramData,
                            downloadedProgramList: downloadedProgramData.sort(function (a, b) {
                                a = (a.programCode).toLowerCase();
                                b = (b.programCode).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })
                        }, () => {
                            // console.log("programs------------------>1", this.state.datasetList);
                            console.log("downloadedProgramData------------------>", downloadedProgramData);
                      
                        })
                    }

                }



            }.bind(this);

        }.bind(this);
    }.bind(this);


    }

    filterVersion() {
        // let programId = document.getElementById("programId").value;
        this.setState({ loading: true })
        let programId = this.state.datasetId;
        if (programId != 0) {

            const program = this.state.datasetList.filter(c => c.programId == programId)
            // console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    // this.setState({
                    //     versions: [],
                    // }, () => {
                        DropdownService.getVersionListForProgram(PROGRAM_TYPE_DATASET, programId)
                            .then(response => {
                                this.setState({
                                    versions: []
                                }, () => {
                                    this.setState({
                                        versions: response.data
                                    }, () => { this.consolidatedVersionList(programId) });
                                });
                            }).catch(
                                error => {
                                    this.setState({
                                        programs: [], loading: false
                                    })
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
                                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                                    loading: false
                                                });
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
                        // let inactiveProgram = this.state.allProgramList.filter(c => c.active == false);
                        // inactiveProgram = inactiveProgram.filter(c => c.programId == programId);

                        // if (inactiveProgram.length > 0) {//Inactive
                        //     this.consolidatedVersionList(programId)
                        // } else {
                    //         this.setState({
                    //             versions: program[0].versionList.filter(function (x, i, a) {
                    //                 return a.indexOf(x) === i;
                    //             })
                    //         }, () => { this.consolidatedVersionList(programId) });
                    //     // }

                    // });


                } else {
                    this.setState({
                        versions: [],
                        loading: false
                    }, () => {
                        this.consolidatedVersionList(programId)
                    })
                }
            } else {

                this.setState({
                    versions: [],
                    loading: false
                }, () => { })

            }
        } else {
            this.setState({
                versions: [],
                treeData: [],
                datasetListJexcel: []
            }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                // this.el.destroy();
                jexcel.destroy(document.getElementById("tableDiv"), true);
            })
        }
    }

    consolidatedVersionList = (programId) => {
        this.setState({ loading: true })
        const lan = 'en';
        const { versions } = this.state
        var verList = versions;

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
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && myResult[i].programId == programId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion

                        version.versionId = `${version.versionId} (Local)`
                        version.isLocal = 1
                        verList.push(version)

                    }
                }

                // console.log(verList)
                let versionList = verList.filter(function (x, i, a) {
                    return a.indexOf(x) === i;
                })
                versionList.reverse();
                console.log("versionList----->", versionList);
                if (this.props.match.params.versionId != "" && this.props.match.params.versionId != undefined) {
                    // let versionVar = versionList.filter(c => c.versionId == this.props.match.params.versionId+" (Local)");
                    this.setState({
                        versions: versionList,
                        versionId: this.props.match.params.versionId + " (Local)",
                        loading: false
                    }, () => {
                        // this.setVersionId();
                        this.consolidatedDataSetList(programId, this.state.versionId)

                    })
                }
                else if (localStorage.getItem("sesVersionIdReport") != '' && localStorage.getItem("sesVersionIdReport") != undefined) {
                    let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesVersionIdReport"));
                    this.setState({
                        versions: versionList,
                        versionId: (versionVar != '' && versionVar != undefined ? localStorage.getItem("sesVersionIdReport") : versionList[0].versionId),
                        loading: false
                    }, () => {
                        // this.setVersionId();
                        this.consolidatedDataSetList(programId, this.state.versionId)

                    })
                } else {
                    this.setState({
                        versions: versionList,
                        versionId: (versionList.length > 0 ? versionList[0].versionId : ''),
                        loading: false
                    }, () => {
                        this.consolidatedDataSetList(programId, this.state.versionId)

                    })
                }
            }.bind(this);
        }.bind(this)
    }

    consolidatedDataSetList = (programId, versionId) => {
        // console.log("progverId", programId, "==", versionId)
        this.setState({
            versionId: ((versionId == null || versionId == '' || versionId == undefined) ? (this.state.versionId) : versionId),
            loading: true
        }, () => {
            if (versionId != 0 && !versionId.toString().includes("(Local)")) {
                DatasetService.getDatasetData(programId, versionId)
                    .then(response => {
                        if (response.status == 200) {
                            var responseData = response.data;
                            this.setState({
                                datasetListJexcel: responseData,
                                loading: false
                            }, () => {
                                this.getTreeList();
                            })
                        }
                    })
            } else {
                let selectedForecastProgram = this.state.downloadedProgramData.filter(c => c.programId == programId && c.currentVersion.versionId == versionId.toString().split(" ")[0])[0];
                // console.log("selectedForecastProgram===2", this.state.downloadedProgramData, "===", versionId)
                this.setState({
                    datasetListJexcel: selectedForecastProgram,
                    loading: false
                }, () => {
                    this.getTreeList();

                })
            }
        })
    }

    setVersionId(event) {
        var versionId = event.target.value
        localStorage.setItem("sesVersionIdReport", versionId);

        this.setState(
            {
                versionId: versionId
            }, () => {
                // this.getPlanningUnit();
                this.consolidatedDataSetList(this.state.datasetId, versionId);
            })
    }

    setProgramId(event) {
        var datasetId = event.target.value
        localStorage.setItem("sesDatasetId", datasetId);
        if (datasetId != 0 && datasetId != "") {
            this.setState(
                {
                    datasetId: datasetId,
                    versions: [],
                    message: ""
                }, () => {
                    this.filterVersion();
                    this.hideSecondComponent()
                })
        } else {
            this.setState(
                {
                    datasetId: datasetId,
                    message: i18n.t('static.mt.selectProgram'),
                    color: "red"
                }, () => {
                    this.filterVersion();
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                    this.hideSecondComponent()
                })
        }
    }

    onTemplateChange(event) {
        // console.log("event.target.value", event.target.value)
        if (event.target.value == 0 && event.target.value != "") {
            // console.log("inside if----")
            this.setState({
                treeTemplate: '',
                treeFlag: false,
                isModalOpen: !this.state.isModalOpen,
                downloadAcrossProgram: 0,
                treeIdAcrossProgram: 0,
                treeName: '',
                active: true,
                forecastMethod: {
                    id: "",
                    label: {
                        label_en: '',
                        label_fr: '',
                        label_sp: '',
                        label_pr: ''
                    }
                },
                regionId: '',
                regionList: [],
                regionValues: [],
                notes: ''
            }, () => {
                if (this.state.datasetIdModal != "") {
                    // console.log("this.state.datasetIdModal---", this.state.datasetIdModal)
                    this.getRegionList(this.state.datasetIdModal);
                }
            });
            // this.buildTree();
        } else if (event.target.value != 0 && event.target.value != "") {
            // console.log("inside else----")
            // console.log("id--->>>", this.state.datasetIdModal);
            var treeTemplate = this.state.treeTemplateList.filter(x => x.treeTemplateId == event.target.value)[0];
            // console.log("treeTemplate---", treeTemplate)
            this.setState({
                treeFlag: false,
                isModalOpen: !this.state.isModalOpen,
                downloadAcrossProgram: 0,
                treeIdAcrossProgram: 0,
                treeName: treeTemplate.label.label_en,
                active: treeTemplate.active,
                forecastMethod: treeTemplate.forecastMethod,
                regionId: '',
                regionList: [],
                regionValues: [],
                notes: treeTemplate.notes,
                treeTemplate,
                missingPUList: []
            }, () => {
                if (this.state.datasetIdModal != "" && this.state.datasetIdModal != 0) {
                    // console.log("this.state.datasetIdModal---", this.state.datasetIdModal)
                    this.getRegionList(this.state.datasetIdModal);
                }
            });
            // this.props.history.push({
            //     pathname: `/dataSet/buildTree/template/${event.target.value}`,
            //     // state: { role }
            // });
        }

    }

    buildTree() {

        this.props.history.push({
            pathname: `/dataSet/buildTree/`,
            // state: { role }
        });

    }
    buildJexcel() {
        if (this.state.datasetId != 0) {
            let programList = this.state.treeData;
            console.log(">>>", programList);
            let treeArray = [];
            let count = 0;
            var selStatus = document.getElementById("active").value;
            var tempSelStatus = selStatus != "" ? (selStatus == "true" ? true : false) : "";
            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            let forecastStartDate = programList.currentVersion.forecastStartDate;
            let forecastStopDate = programList.currentVersion.forecastStopDate;
            let beforeEndDateDisplay = new Date(forecastStartDate);
            beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);

            var treeList = programList.treeList;

            if (treeList != undefined && treeList.length > 0) {
                for (var k = 0; k < treeList.length; k++) {

                    data = [];
                    data[0] = treeList[k].treeId
                    data[1] = programList.programCode + "~v" + programList.currentVersion.versionId
                    // data[1] = programList[j].programCode
                    data[2] = getLabelText(treeList[k].label, this.state.lang)
                    data[3] = treeList[k].regionList.map(x => getLabelText(x.label, this.state.lang)).join(", ")
                    console.log("forecast method--->", treeList[k].forecastMethod.label)
                    data[4] = getLabelText(treeList[k].forecastMethod.label, this.state.lang)
                    data[5] = treeList[k].scenarioList.map(x => getLabelText(x.label, this.state.lang)).join(", ")
                    data[6] = treeList[k].notes
                    data[7] = programList.programId
                    data[8] = programList.programId + "_v" + programList.currentVersion.versionId + "_uId_" + userId
                    data[9] = programList.version
                    data[10] = treeList[k].active
                    data[11] = this.state.versionId.toString().includes("(Local)") ? 1 : 2
                    data[12] = JSON.stringify(treeList[k].forecastMethod);
                    console.log("selStatus---", this.state.versionId.toString().includes("(Local)"))
                    if (selStatus != "") {
                        if (tempSelStatus == treeList[k].active) {
                            // treeArray = treeArray.filter(x => x[10] == tempSelStatus);
                            treeArray[count] = data;
                            count++;
                        }
                    } else {
                        treeArray[count] = data;
                        count++;
                    }
                }
            }
            // }



            const sortArray = (sourceArray) => {
                const sortByName = (a, b) => a[2].localeCompare(b[2], 'en', { numeric: true });
                return sourceArray.sort(sortByName);
            };

            if (treeArray.length > 0) {
                // sortArray(treeArray);
                treeArray.sort(function (a, b) {
                    return a[1].localeCompare(b[1]) || a[2].localeCompare(b[2]);
                })
            }
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
                        title: 'Tree Id',
                        type: 'hidden'
                        // title: 'A',
                        // type: 'text',
                        // visible: false
                    },
                    {
                        title: i18n.t('static.dashboard.programheader'),
                        type: 'text',
                        // readOnly: true
                    },
                    {
                        title: i18n.t('static.common.treeName'),
                        type: 'text',
                        // readOnly: true
                    },
                    {
                        title: i18n.t('static.common.region'),
                        type: 'text',
                        // readOnly: true
                    },
                    {
                        title: i18n.t('static.forecastMethod.forecastMethod'),
                        type: 'text',
                        // readOnly: true
                    },

                    {
                        title: i18n.t('static.common.scenarioName'),
                        type: 'text',
                        // readOnly: true
                    },
                    {
                        title: i18n.t('static.program.notes'),
                        type: 'text',
                        // readOnly: true
                    },
                    {
                        title: 'ProgramId',
                        type: 'hidden',
                        // title: 'A',
                        // type: 'text',
                        // visible: false
                        // readOnly: true
                    },
                    {
                        title: 'id',
                        type: 'hidden',
                        // title: 'A',
                        // type: 'text',
                        // visible: false
                        // readOnly: true
                    },
                    {
                        title: 'versionId',
                        type: 'hidden',
                        // title: 'A',
                        // type: 'text',
                        // visible: false
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
                        type: 'hidden'
                    },
                    {
                        type: 'hidden'
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
                        if (obj.options.allowInsertRow == true && this.state.versionId.toString().includes("(Local)")) {
                        // if (obj.options.allowInsertRow == true) {
                            items.push({
                                title: i18n.t('static.common.deleteTree'),
                                onclick: function () {
                                    confirmAlert({
                                        message: i18n.t('static.listTree.deleteTree'),
                                        buttons: [
                                            {
                                                label: i18n.t('static.program.yes'),
                                                onClick: () => {
                                                    this.setState({ treeFlag: true }, () => {
                                                        this.copyDeleteTree(this.state.treeEl.getValueFromCoords(0, y), this.state.treeEl.getValueFromCoords(7, y), this.state.treeEl.getValueFromCoords(9, y), 1);
                                                    })

                                                }
                                            },
                                            {
                                                label: i18n.t('static.program.no')
                                            }
                                        ]
                                    });

                                }.bind(this)
                            });

                            // items.push({
                            //     title: i18n.t('static.common.duplicateTree'),
                            //     onclick: function () {
                            //         console.log("tree name---", this.el.getValueFromCoords(2, y))
                            //         this.setState({
                            //             programId: this.state.treeEl.getValueFromCoords(7, y),
                            //             versionId: this.state.treeEl.getValueFromCoords(9, y),
                            //             treeId: this.state.treeEl.getValueFromCoords(0, y),
                            //             isModalOpen: !this.state.isModalOpen,
                            //             downloadAcrossProgram: 0,
                            //             treeIdAcrossProgram: 0,
                            //             treeName: this.state.treeEl.getValueFromCoords(2, y) + " (copy)",
                            //             treeFlag: true,
                            //             treeTemplate: ''
                            //         })
                            //     }.bind(this)
                            // });

                            items.push({
                                title: i18n.t('static.common.duplicateTree'),
                                onclick: function () {
                                    var downloadedProgramListAcrossProgram = this.state.downloadedProgramList;
                                    this.setState({
                                        treeTemplate: '',
                                        treeFlag: false,
                                        isModalOpen: !this.state.isModalOpen,
                                        treeName: this.state.treeEl.getValueFromCoords(2, y) + " (copy)",
                                        active: true,
                                        forecastMethod: JSON.parse(this.state.treeEl.getValueFromCoords(12, y)),
                                        regionId: '',
                                        regionList: [],
                                        regionValues: [],
                                        notes: this.state.treeEl.getValueFromCoords(6, y),
                                        // datasetIdModal: downloadedProgramListAcrossProgram.length == 1 ? downloadedProgramListAcrossProgram[0].programId + "~v" + downloadedProgramListAcrossProgram[0].currentVersion.versionId : "",
                                        downloadedProgramListAcrossProgram: downloadedProgramListAcrossProgram,
                                        downloadAcrossProgram: 1,
                                        treeIdAcrossProgram: this.state.treeEl.getValueFromCoords(0, y)

                                    }, () => {
                                        if (this.state.datasetIdModal != "") {
                                            let selectedForecastProgram = this.state.downloadedProgramData.filter(c => c.programId == this.state.datasetIdModal.split("~v")[0] && c.currentVersion.versionId == this.state.datasetIdModal.split("~v")[1].toString().split(" ")[0])[0];
                                            this.setState({
                                                datasetListJexcel: selectedForecastProgram
                                            }, () => {
                                                // localStorage.setItem("sesDatasetId", this.state.datasetIdModal.split("~v")[0]);
                                                this.getRegionList(this.state.datasetIdModal);
                                            })
                                        }
                                    });
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
                treeEl: treeEl, 
                loading: false,
                beforeEndDateDisplay: (!isNaN(beforeEndDateDisplay.getTime()) == false ? '' : months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear()),
                startDateDisplay: (forecastStartDate == '' ? '' : months[Number(moment(forecastStartDate).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDate).startOf('month').format("YYYY"))),
                endDateDisplay: (forecastStopDate == '' ? '' : months[Number(moment(forecastStopDate).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDate).startOf('month').format("YYYY"))),  
            })
        } else {
            this.setState({
                treeEl: "",
                loading: false
            })
            this.el = jexcel(document.getElementById("tableDiv"), '');
            // this.el.destroy();
            jexcel.destroy(document.getElementById("tableDiv"), true);
        }
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
        // this.getDatasetList();
        this.getPrograms();
        this.getTreeTemplateList();
        this.getForecastMethodList();
        this.procurementAgentList();
    }
    modelOpenClose() {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
            treeFlag: true,
            downloadAcrossProgram: 0,
            treeIdAcrossProgram: 0,
        })
    }
    dataChange(event) {
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
                if (this.state.datasetIdModal != "") {
                    let selectedForecastProgram = this.state.downloadedProgramData.filter(c => c.programId == this.state.datasetIdModal.split("~v")[0] && c.currentVersion.versionId == this.state.datasetIdModal.split("~v")[1].toString().split(" ")[0])[0];
                    this.setState({
                        datasetListJexcel: selectedForecastProgram
                    }, () => {
                        // localStorage.setItem("sesDatasetId", event.target.value.split("~v")[0]);
                        this.getRegionList(event.target.value);
                    })
                }
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
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 0);
    }

    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if (x == 0 && value != 0) {
                // console.log("HEADER SELECTION--------------------------");
            } else {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_VIEW_TREE')) {
                    var treeId = this.state.treeEl.getValueFromCoords(0, x);
                    var programId = this.state.treeEl.getValueFromCoords(8, x);
                    var isLocal = this.state.treeEl.getValueFromCoords(11, x);
                    if (isLocal == 1) {
                        this.props.history.push({
                            pathname: `/dataSet/buildTree/tree/${treeId}/${programId}`,
                        });
                    } else {
                        confirmAlert({
                            message: i18n.t('static.treeList.confirmAlert'),
                            buttons: [
                                {
                                    label: i18n.t('static.report.ok'),
                                    onClick: () => {
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
                                            var programDataTransaction1 = db1.transaction(['datasetDataServer'], 'readwrite');
                                            var programDataOs1 = programDataTransaction1.objectStore('datasetDataServer');
                                            var ddatasetDataServerRequest = programDataOs1.clear();
                                            ddatasetDataServerRequest.onsuccess = function (event) {
                                                this.downloadClicked(treeId);
                                            }.bind(this)
                                        }.bind(this)
                                    }
                                },
                                {
                                    label: i18n.t('static.common.cancel'),
                                    onClick: () => {
                                        // jexcel.destroy(document.getElementById("tableDiv"), true);
                                    }
                                }
                            ]
                        });
                    }

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
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }
    toggleDeropdownSetting(i) {
        const newArray = this.state.dropdownOpen.map((element, index) => { return (index === i ? !element : false); });
        this.setState({
            dropdownOpen: newArray,
        });
    }

    downloadClicked(treeId) {
        this.setState({ loading: true })

        var programId = this.state.datasetId;
        var versionId = this.state.versionId;
        var checkboxesChecked = [];
        var programIds = [];

        var json = {
            programId: programId,
            versionId: versionId
        }
        checkboxesChecked = checkboxesChecked.concat([json]);
        DatasetService.getAllDatasetData(checkboxesChecked)
            .then(response => {
                // console.log("response>>>", response.data);
                response.data = decompressJson(response.data);
                var json = response.data;
                for (var r = 0; r < json.length; r++) {
                    json[r].actionList = [];
                    // json[r].openCount = 0;
                    // json[r].addressedCount = 0;
                    // json[r].programCode = json[r].programCode;
                    var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json[r]), SECRET_KEY);
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    var version = json[r].currentVersion.versionId;

                    if (version == -1) {
                        version = json[r].currentVersion.versionId
                    }
                    var item = {
                        id: json[r].programId + "_v" + version + "_uId_" + userId,
                        programId: json[r].programId,
                        version: version,
                        programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                        programData: encryptedText.toString(),
                        userId: userId,
                        programCode: json[r].programCode,
                        // openCount: 0,
                        // addressedCount: 0
                    };
                    programIds.push(json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId);

                    var db1;
                    getDatabase();
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({ loading: false })

                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var transaction = db1.transaction(['datasetDataServer'], 'readwrite');
                        var program = transaction.objectStore('datasetDataServer');
                        var putRequest = program.put(item);
                        transaction.oncomplete = function (event) {
                            // console.log("hellloooo===", programId, "===", versionId, "=====", treeId)
                            this.setState({
                                message: 'static.program.downloadsuccess',
                                color: 'green',
                                loading: false
                            }, () => {
                                // this.hideFirstComponent()
                                this.props.history.push({ pathname: `/masterDataSyncForTree`, state: { "programIds": programIds, "treeId": treeId } })

                            })
                        }.bind(this);
                        transaction.onerror = function (event) {
                            this.setState({
                                loading: false,
                                // message: 'Error occured.',
                                color: "red",
                            }, () => {
                                // this.hideSecondComponent();
                                // this.props.updateStepOneData("loading", false);
                            });
                            // console.log("Data update errr");
                        }.bind(this);
                    }.bind(this)
                }
            }).catch(error => {
                // console.log("eroror", error)
                this.setState({
                    loading: false,
                    message: i18n.t("static.program.errortext"),
                    color: "red"
                }, () => {
                    // this.hideFirstComponent()
                })
                // this.props.history.push(`/dashboard/`+'green/' + 'Dataset loaded successfully')
                // this.setState({ loading: false })

            })



    }



    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        const { datasetList } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.programCode}
                    </option>
                )
            }, this);

        const downloadedProgramList = this.state.downloadAcrossProgram == 1 ? this.state.downloadedProgramListAcrossProgram : this.state.downloadedProgramList;
        let downloadedDatasets = downloadedProgramList.length > 0
            && downloadedProgramList.map((item, i) => {
                return (
                    <option key={i} value={item.programId + "~v" + item.currentVersion.versionId}>
                        {item.programCode + "~v" + item.currentVersion.versionId}
                    </option>
                )
            }, this);

        const { treeTemplateList } = this.state;
        let treeTemplates = treeTemplateList.length > 0
            && treeTemplateList.map((item, i) => {
                return (
                    <option key={i} value={item.treeTemplateId}>
                        {getLabelText(item.label, this.state.lang)}
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

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId} ({(moment(item.createdDate).format(`MMM DD YYYY`))})
                        {/* {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))}) */}
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
                    <div className="card-header-actions">
                        <div className="Card-header-reporticon">
                            <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                            <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/planningUnitSetting/listPlanningUnitSetting" className="supplyplanformulas">{i18n.t('static.updatePlanningUnit.updatePlanningUnit')}</a></span>
                        </div>
                    </div>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                        <div className="card-header-actions">
                            <div className="" style={{ marginTop: '-19px' }}>
                                <a style={{ marginLeft: '106px' }}>
                                    <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                                </a>
                                <Col md="12 pl-0 pr-lg-0">
                                    <div className="d-md-flex">
                                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_TREE') && this.state.versionId.toString().includes("(Local)") &&
                                            // <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.createTreeFromTemplate')}</Button>
                                            // <Col md="3" className="pl-0">
                                            <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                                {/* <Label htmlFor="appendedInputButton">{i18n.t('static.forecastProgram.forecastProgram')}</Label> */}
                                                <div className="controls SelectGo">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="templateId"
                                                            id="templateId"
                                                            bsSize="sm"
                                                            className="addtreebg"
                                                            onChange={(e) => { this.onTemplateChange(e) }}
                                                        >
                                                            <option value="">{i18n.t('static.tree.createOrSelect')}</option>
                                                            {/* <option value="">{i18n.t('static.tree.+AddTree')}</option> */}
                                                            <option value="0">+ {i18n.t('static.tree.blank')}</option>
                                                            {treeTemplates}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            // </Col>
                                            //     <ButtonDropdown isOpen={this.state.dropdownOpen[0]} toggle={() => { this.toggleDeropdownSetting(0); }}>
                                            //     <DropdownToggle caret >
                                            //       Select
                                            //     </DropdownToggle>
                                            //     <DropdownMenu right>
                                            //       <DropdownItem  onclick={(e) => { this.onTemplateChange(e) }}>+ {i18n.t('static.tree.blank')}</DropdownItem>
                                            //     <DropdownItem  onclick={(e) => { this.onTemplateChange(e) }}> {treeTemplates}</DropdownItem>
                                            //     </DropdownMenu>
                                            //   </ButtonDropdown>
                                        }
                                        {/* {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_LIST_REALM_COUNTRY') &&
                                            <FormGroup className="tab-ml-1 mt-md-1 mb-md-0 ">
                                                <Button type="submit" size="md" color="info" onClick={this.buildTree} className="float-right pt-1 pb-1" ><i className="fa fa-plus"></i>  {i18n.t('static.common.addtree')}</Button>
                                            </FormGroup>
                                        } */}
                                    </div>
                                </Col>
                            </div>
                        </div>

                    </div>
                    <CardBody className="pb-lg-5 pt-lg-0">
                        <Col md="6 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup className="tab-ml-0 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="datasetId"
                                                id="datasetId"
                                                bsSize="sm"
                                                onChange={(e) => { this.setProgramId(e); }}
                                                value={this.state.datasetId}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {datasets}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="versionId"
                                                id="versionId"
                                                bsSize="sm"
                                                onChange={(e) => { this.setVersionId(e); }}
                                                value={this.state.versionId}
                                            >
                                                {/* <option value="0">{i18n.t('static.common.select')}</option> */}
                                                {versionList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="active"
                                                id="active"
                                                bsSize="sm"
                                                onChange={this.getTreeList}
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
                        <div className="listtreetable consumptionDataEntryTable">
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DIMENSION') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
                    <Modal isOpen={this.state.showGuidance}
                        className={'modal-lg ' + this.props.className} >
                        <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                            <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                        </ModalHeader>
                        <div>
                            <ModalBody className="ModalBodyPadding">

                                <div dangerouslySetInnerHTML={{
                                    __html: localStorage.getItem('lang') == 'en' ?
                                        ListTreeEn :
                                        localStorage.getItem('lang') == 'fr' ?
                                            ListTreeFr :
                                            localStorage.getItem('lang') == 'sp' ?
                                                ListTreeSp :
                                                ListTreePr
                                }} />
                                {/* <div>
                                    <h3 className='ShowGuidanceHeading'>{i18n.t('static.listTree.manageTreeTreeList')}</h3>
                                </div>
                                <p>
                                    <p style={{ fontSize: '14px' }}><span className="UnderLineText">{i18n.t('static.listTree.purpose')} :</span> {i18n.t('static.listTree.enableUsersTo')} :</p>
                                    <ol type="1">
                                        <li>{i18n.t('static.listTree.listExistingTree')}</li>
                                        <li> {i18n.t('static.listTree.editExistingTree')} </li>
                                        <li>{i18n.t('static.listTree.deleteDuplicateExistingTree')}</li>
                                        <li> {i18n.t('static.listTree.newTreeToLoadedProgram')}</li>
                                        <ul>
                                            <li>{i18n.t('static.listTree.manuallySelectAddTree')}</li>
                                            <li>{i18n.t('static.listTree.nameOfDesiredTemplate')}</li>
                                        </ul>
                                    </ol>
                                </p>
                                <p>{i18n.t('static.listTree.NoteTableOnListTree')} </p>
                                <p>
                                    <p style={{ fontSize: '14px' }}><span className="UnderLineText">{i18n.t('static.listTree.useThisScreen')} :</span></p>
                                    <p className='pl-lg-4'>
                                        <ul>
                                            <li>{i18n.t('static.listTree.loadedToBuildTree')}</li>
                                            <li>{i18n.t('static.listTree.addForecastPlanningUnit')} <a href='/#/planningUnitSetting/listPlanningUnitSetting'>{i18n.t('static.updatePlanningUnit.updatePlanningUnit')}</a> {i18n.t('static.listTree.screenBeforeBuilding')}</li>
                                            <li>{i18n.t('static.listTree.buildSimilarTree')} </li>
                                            <li>{i18n.t('static.listTree.submitHelpDeskTicket')} </li>
                                        </ul>
                                    </p>
                                </p> */}

                            </ModalBody>
                        </div>
                    </Modal>


                    <Modal isOpen={this.state.isModalOpen}
                        // className={'modal-lg ' + this.props.className}>
                        className={'modal-dialog modal-lg modalWidth'}>
                        <ModalHeader>
                            <strong>{i18n.t('static.listTree.treeDetails')}</strong>
                            <Button size="md" onClick={this.modelOpenClose} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
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
                                    validate={validate(validationSchema)}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {
                                        if (!this.state.isSubmitClicked) {
                                            this.setState({ loading: true, isSubmitClicked: true }, () => {
                                                this.copyDeleteTree(this.state.treeId, this.state.treeFlag ? this.state.programId : this.state.datasetIdModal, this.state.treeFlag ? this.state.versionId : 0, this.state.downloadAcrossProgram == 1 ? 4 : this.state.treeFlag ? 2 : 3);
                                                this.setState({
                                                    isModalOpen: !this.state.isModalOpen,
                                                    downloadAcrossProgram: 0,
                                                    treeIdAcrossProgram: 0,
                                                })
                                            })
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
                                            handleReset,
                                            setFieldValue,
                                            setFieldTouched
                                        }) => (
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='modalForm' autocomplete="off">
                                                {/* <CardBody> */}
                                                <div className="col-md-12">
                                                    <Input type="hidden"
                                                        name="treeFlag"
                                                        id="treeFlag"
                                                        value={this.state.treeFlag}
                                                    />
                                                    <div style={{ display: this.state.treeFlag ? "none" : "block" }} className="">
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
                                                        <FormGroup className={this.state.treeFlag ? "col-md-12" : "col-md-6"}>
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
                                                        <FormGroup className="col-md-6" style={{ display: this.state.treeFlag ? "none" : "block" }} >
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
                                                    <div style={{ display: this.state.treeFlag ? "none" : "block" }} >
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
                                                        <div style={{ display: this.state.missingPUList.length > 0 && !this.state.treeFlag ? 'block' : 'none' }}><div><b>{i18n.t('static.listTree.missingPlanningUnits')+" "} : <a href="/#/planningUnitSetting/listPlanningUnitSetting" className="supplyplanformulas">{i18n.t('static.Update.PlanningUnits')}</a>)</b></div><br />
                                                            <div id="missingPUJexcel" className="RowClickable">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(!isSiteOnline() && this.state.missingPUList.length > 0) && <strong>{i18n.t("static.tree.youMustBeOnlineToCreatePU")}</strong>}                                                      
                                                    <FormGroup className="col-md-12 float-right pt-lg-4 pr-lg-0">
                                                        <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.modelOpenClose}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        {this.state.missingPUList.length == 0 && <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t("static.tree.createTree")}</Button>}
                                                        {this.state.missingPUList.length > 0 &&<Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t("static.tree.createTreeWithoutPU")}</Button>}
                                                        {isSiteOnline() && this.state.missingPUList.length > 0 && <Button type="button" color="success" className="mr-1 float-right" size="md" onClick={() => this.saveMissingPUs()}><i className="fa fa-check"></i>{i18n.t("static.tree.addAbovePUs")}</Button>}
                                                        {!isSiteOnline() && this.state.missingPUList.length > 0 && <Button type="button" color="success" className="mr-1 float-right" size="md" onClick={() => this.updateMissingPUs()}><i className="fa fa-check"></i>{i18n.t("static.tree.updateSelectedPU")}</Button>}
                                                        {this.state.missingPUList.length == 0 && (this.state.treeTemplate != "" || this.state.downloadAcrossProgram == 1) && <strong>{i18n.t("static.tree.allTemplatePUAreInProgram")}</strong>}
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

            </div >
        );
    }
}
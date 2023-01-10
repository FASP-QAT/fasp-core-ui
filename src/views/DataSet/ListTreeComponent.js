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
import { JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { Formik } from 'formik';
import * as Yup from 'yup'
import ProgramService from '../../api/ProgramService';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import '../Forms/ValidationForms/ValidationForms.css';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js'
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
const entityname = i18n.t('static.common.listtree');

const validationSchema = function (values) {
    return Yup.object().shape({
        datasetIdModal: Yup.string()
            .test('datasetIdModal', 'Please select program',
                function (value) {
                    console.log("@@@ 1", document.getElementById("treeFlag").value);
                    console.log("@@@ 2", document.getElementById("datasetIdModal").value);
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
                    console.log("@@@ 3", document.getElementById("treeFlag").value);
                    console.log("@@@ 4", document.getElementById("forecastMethodId").value);
                    if (document.getElementById("treeFlag").value == "false" && document.getElementById("forecastMethodId").value == "") {
                        console.log("fm false");
                        return false;
                    } else {
                        console.log("fm true");
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
            lang: localStorage.getItem('lang')
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
                var datasetDetailsRequest = datasetDetailsTransaction.get(document.getElementById("datasetId").value);
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
                    isSubmitClicked: false
                }, () => {

                    if (operationId == 3) {
                        // if (treeTemplateId != "" && treeTemplateId != null) {
                        //     console.log("programId 1---", programId);
                        //     calculateModelingData(programCopy, this, programId, 0, 1, 1, treeId, false);
                        // } else {
                        confirmAlert({
                            message: i18n.t('static.listTree.manageTreePage'),
                            buttons: [
                                {
                                    label: i18n.t('static.program.yes'),
                                    onClick: () => {
                                        this.props.history.push({
                                            pathname: `/dataSet/buildTree/tree/${treeId}/${id}`,
                                            // state: { role }
                                        });

                                    }
                                },
                                {
                                    label: i18n.t('static.program.no'),
                                    onClick: () => {
                                        // this.getDatasetList();
                                        this.getPrograms();
                                    }
                                }
                            ]
                        });
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
                    var treeTemplateId = document.getElementById('templateId').value;
                    this.saveTreeData(3, tempProgram, treeTemplateId, programId, this.state.tempTreeId, programCopy);
                }
                console.log("returmed list---", this.state.nodeDataMomList);

            })
        }
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


    getRegionList(datasetId) {
        console.log("datasetId details---", datasetId);

        var regionList = [];
        var regionMultiList = [];
        if (datasetId != 0 && datasetId != "" && datasetId != null) {
            var program = this.state.datasetListJexcel;
            console.log("program details---", program);
            regionList = program.regionList;
            console.log("program for display---", program);
            // realmCountryId = program.programData.realmCountry.realmCountryId;

            regionList.map(c => {
                regionMultiList.push({ label: getLabelText(c.label, this.state.lang), value: c.regionId })
            })
        }
        this.setState({
            regionList,
            regionMultiList,
            missingPUList: []
        }, () => {
            if (this.state.treeTemplate != "")
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
                console.log("myResult===============2", myResult)
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

        console.log("TreeId--------------->", treeId, programId, versionId, operationId);
        // var program = this.state.treeFlag ? (this.state.datasetList.filter(x => x.programId == programId && x.version == versionId)[0]) : (this.state.datasetList.filter(x => x.id == programId)[0]);
        var program = this.state.datasetListJexcel;
        console.log("delete program---", program);
        let tempProgram = JSON.parse(JSON.stringify(program))
        let treeList = program.treeList;
        console.log("delete treeList---", treeList);
        var treeTemplateId = '';
        if (operationId == 1) {//delete
            console.log("delete treeId---", treeId);
            const index = treeList.findIndex(c => c.treeId == treeId);
            console.log("delete index---", index);
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

            console.log("TreeId--------------->12", treeList);
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
            console.log("treeTemplateId===", treeTemplateId);
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
                    forecastMethod: treeTemplate.forecastMethod,
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

            console.log("region values---", this.state.regionValues);
            // console.log("curTreeObj.regionList---", curTreeObj.regionList);


            treeList.push(tempTree);
        }
        console.log("TreeList@@@@@@@@@@@@@@", treeList)
        tempProgram.treeList = treeList;
        var programCopy = JSON.parse(JSON.stringify(tempProgram));
        // var programData = (CryptoJS.AES.encrypt(JSON.stringify(tempProgram), SECRET_KEY)).toString();
        // tempProgram = programData;
        // if (operationId == 3) {
        if (operationId == 3 && (treeTemplateId != "" && treeTemplateId != null)) {
            console.log("programId 1---", programId);
            programCopy.programData = tempProgram;
            calculateModelingData(programCopy, this, programId, 0, 1, 1, treeId, false, true,true);
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
                var treeTemplateList = myResult.filter(x => x.active == true && (x.flatList.filter(c=>c.parent ==null)[0].payload.nodeType.id==2 || x.flatList.filter(c=>c.parent ==null)[0].payload.nodeType.id==1));
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
        this.setState({
            datasetId,
            datasetIdModal: datasetId,
            treeData: datasetList,
        }, () => {
            this.buildJexcel();
        });
    }

    getPrograms() {
        if (isSiteOnline()) {
            ProgramService.getDataSetListAll().then(response => {
                if (response.status == 200) {
                    var responseData = response.data;
                    var datasetList = [];
                    datasetList = responseData.filter(c => c.active == true);
                    console.log("datasetList--->", responseData)

                    this.setState({
                        datasetList: datasetList,
                        loading: false,
                        allProgramList: responseData

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
            console.log('offline')
            this.setState({ loading: false })
            this.consolidatedProgramList()
        }
    }

    consolidatedProgramList = () => {
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
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                let downloadedProgramData = [];
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        console.log(programNameLabel)

                        var f = 0
                        for (var k = 0; k < this.state.datasetList.length; k++) {
                            if (this.state.datasetList[k].programId == programData.programId) {
                                f = 1;
                                console.log('already exist')
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
                    }, () => {
                        console.log("programs------------------>", this.state.datasetList);

                        this.filterVersion();
                    })
                } else {
                    console.log("this.props.match.params.programId@@@", this.props.match.params.programId);
                    if (this.props.match.params.programId != "" && this.props.match.params.programId != undefined) {
                        this.setState({
                            datasetList: proList.sort(function (a, b) {
                                a = (a.programCode).toLowerCase();
                                b = (b.programCode).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            datasetId: this.props.match.params.programId,
                            downloadedProgramData: downloadedProgramData,
                            loading: false
                        }, () => {
                            console.log("programs------------------>", this.state.datasetList);

                            this.filterVersion();
                        })
                    }
                    else if (localStorage.getItem("sesDatasetId") != '' && localStorage.getItem("sesDatasetId") != undefined) {
                        this.setState({
                            datasetList: proList.sort(function (a, b) {
                                a = (a.programCode).toLowerCase();
                                b = (b.programCode).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            datasetId: localStorage.getItem("sesDatasetId"),
                            loading: false,
                            downloadedProgramData: downloadedProgramData,
                        }, () => {
                            console.log("programs------------------>", this.state.datasetList);

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
                        }, () => {
                            console.log("programs------------------>1", this.state.datasetList);
                        })
                    }

                }



            }.bind(this);

        }.bind(this);


    }

    filterVersion() {
        // let programId = document.getElementById("programId").value;
        let programId = this.state.datasetId;
        if (programId != 0) {

            const program = this.state.datasetList.filter(c => c.programId == programId)
            // console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        versions: [],
                    }, () => {
                        let inactiveProgram = this.state.allProgramList.filter(c => c.active == false);
                        inactiveProgram = inactiveProgram.filter(c => c.programId == programId);

                        if (inactiveProgram.length > 0) {//Inactive
                            this.consolidatedVersionList(programId)
                        } else {
                            this.setState({
                                versions: program[0].versionList.filter(function (x, i, a) {
                                    return a.indexOf(x) === i;
                                })
                            }, () => { this.consolidatedVersionList(programId) });
                        }

                    });


                } else {
                    this.setState({
                        versions: [],

                    }, () => {
                        this.consolidatedVersionList(programId)
                    })
                }
            } else {

                this.setState({
                    versions: [],

                }, () => { })

            }
        } else {
            this.setState({
                versions: [],
                treeData:[],
                datasetListJexcel:[]
            }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("tableDiv"), true);
             })
        }
    }

    consolidatedVersionList = (programId) => {

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

                console.log(verList)
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
                    }, () => {
                        // this.setVersionId();
                        this.consolidatedDataSetList(programId, this.state.versionId)

                    })
                } else {
                    this.setState({
                        versions: versionList,
                        versionId: (versionList.length > 0 ? versionList[0].versionId : ''),
                    }, () => {
                        this.consolidatedDataSetList(programId, this.state.versionId)

                    })
                }
            }.bind(this);
        }.bind(this)
    }

    consolidatedDataSetList = (programId, versionId) => {
        console.log("progverId", programId, "==", versionId)
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
                                datasetListJexcel: responseData
                            }, () => {
                                this.getTreeList();
                            })
                        }
                    })
            } else {
                let selectedForecastProgram = this.state.downloadedProgramData.filter(c => c.programId == programId && c.currentVersion.versionId == versionId.toString().split(" ")[0])[0];
                console.log("selectedForecastProgram===2", this.state.downloadedProgramData, "===", versionId)
                this.setState({
                    datasetListJexcel: selectedForecastProgram
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
                    color:"red"
                }, () => {
                    this.filterVersion();
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                    this.hideSecondComponent()
                })
        }
    }

    onTemplateChange(event) {
        console.log("event.target.value", event.target.value)
        if (event.target.value == 0 && event.target.value != "") {
            console.log("inside if----")
            this.setState({
                treeTemplate: '',
                treeFlag: false,
                isModalOpen: !this.state.isModalOpen,
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
                    console.log("this.state.datasetIdModal---", this.state.datasetIdModal)
                    this.getRegionList(this.state.datasetIdModal);
                }
            });
            // this.buildTree();
        } else if (event.target.value != 0 && event.target.value != "") {
            console.log("inside else----")
            console.log("id--->>>", this.state.datasetIdModal);
            var treeTemplate = this.state.treeTemplateList.filter(x => x.treeTemplateId == event.target.value)[0];
            console.log("treeTemplate---", treeTemplate)
            this.setState({
                treeFlag: false,
                isModalOpen: !this.state.isModalOpen,
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
                    console.log("this.state.datasetIdModal---", this.state.datasetIdModal)
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
        if(this.state.datasetId!=0){
        let programList = this.state.treeData;
        console.log(">>>", programList);
        let treeArray = [];
        let count = 0;
        var selStatus = document.getElementById("active").value;
        var tempSelStatus = selStatus != "" ? (selStatus == "true" ? true : false) : "";
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);

        var treeList = programList.treeList;

        if (treeList!=undefined && treeList.length > 0) {
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
                                                    this.copyDeleteTree(this.el.getValueFromCoords(0, y), this.el.getValueFromCoords(7, y), this.el.getValueFromCoords(9, y), 1);
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

                        items.push({
                            title: i18n.t('static.common.duplicateTree'),
                            onclick: function () {
                                console.log("tree name---", this.el.getValueFromCoords(2, y))
                                this.setState({
                                    programId: this.state.treeEl.getValueFromCoords(7, y),
                                    versionId: this.state.treeEl.getValueFromCoords(9, y),
                                    treeId: this.state.treeEl.getValueFromCoords(0, y),
                                    isModalOpen: !this.state.isModalOpen,
                                    treeName: this.state.treeEl.getValueFromCoords(2, y) + " (copy)",
                                    treeFlag: true,
                                    treeTemplate: ''
                                })
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
    }else{
        this.setState({
            treeEl:"",
            loading:false
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
    }
    modelOpenClose() {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
            treeFlag: true
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
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 0);
    }

    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if (x == 0 && value != 0) {
                // console.log("HEADER SELECTION--------------------------");
            } else {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_VIEW_TREE')) {
                    var treeId = this.el.getValueFromCoords(0, x);
                    var programId = this.el.getValueFromCoords(8, x);
                    var isLocal = this.el.getValueFromCoords(11, x);
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
                console.log("response>>>", response.data);
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
                            console.log("hellloooo===", programId, "===", versionId, "=====", treeId)
                            this.setState({
                                message: 'static.program.downloadsuccess',
                                color: 'green',
                                loading: false
                            }, () => {
                                // this.hideFirstComponent()
                                this.props.history.push({ pathname: `/syncProgram`, state: { "programIds": programIds, "treeId": treeId } })

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
                            console.log("Data update errr");
                        }.bind(this);
                    }.bind(this)
                }
            }).catch(error => {
                console.log("eroror", error)
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
                                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_TREE') && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_VIEW_TREE') && this.state.versionId.toString().includes("(Local)") &&
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
                        className={'modal-lg ' + this.props.className}>
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
                                    validate={validate(validationSchema)}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {
                                        if (!this.state.isSubmitClicked) {
                                            this.setState({ loading: true, isSubmitClicked: true }, () => {
                                                this.copyDeleteTree(this.state.treeId, this.state.treeFlag ? this.state.programId : this.state.datasetIdModal, this.state.treeFlag ? this.state.versionId : 0, this.state.treeFlag ? 2 : 3);
                                                this.setState({
                                                    isModalOpen: !this.state.isModalOpen,
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
                                                                        {datasets}
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
                                                        <div style={{ display: this.state.missingPUList.length > 0 && !this.state.treeFlag ? 'block' : 'none' }}><div><b>{i18n.t('static.listTree.missingPlanningUnits')} : (<a href="/#/planningUnitSetting/listPlanningUnitSetting" className="supplyplanformulas">{i18n.t('static.Update.PlanningUnits')}</a>)</b></div><br />
                                                            <div id="missingPUJexcel" className="RowClickable">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <FormGroup className="col-md-12 float-right pt-lg-4 pr-lg-0">
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

                </Card>

            </div >
        );
    }
}
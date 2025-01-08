import classNames from 'classnames';
import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Button, Card, CardBody, Col, Form, FormFeedback, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import * as Yup from 'yup';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DATE_FORMAT_SM, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_INTEGER_REGEX, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, SECRET_KEY } from '../../Constants.js';
import DatasetService from '../../api/DatasetService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import i18n from '../../i18n';
import { calculateModelingData } from '../../views/DataSet/ModelingDataCalculation2';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = 'Tree Template';
/**
 * Defines the validation schema for tree template.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        treeTemplateName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.tree.templateNameRequired')),
    })
}
/**
 * Defines the validation schema for tree details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
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
                    if (document.getElementById("forecastMethodId").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        regionId: Yup.string()
            .required(i18n.t('static.common.regiontext'))
            .typeError(i18n.t('static.common.regiontext')),
    })
}
const months = [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')]
/**
 * Component for list tree template
 */
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
            isModalCreateTree: false,
            treeName: "",
            forecastMethod: {
                id: "",
                label: {
                    label_en: ""
                }
            },
            datasetIdModal: "",
            regionId: '',
            regionList: [],
            regionValues: [],
            missingPUList: [],
            forecastMethodList: [],
            datasetList: [],
            programList: [],
            active: true,
            datasetListJexcel: {},
            treeTemplate: {},
            allProcurementAgentList: [],
            planningUnitObjList: [],
            startDateDisplay: '',
            endDateDisplay: '',
            beforeEndDateDisplay: ''
        }
        this.buildJexcel = this.buildJexcel.bind(this);
        this.addTreeTemplate = this.addTreeTemplate.bind(this);
        this.copyDeleteTree = this.copyDeleteTree.bind(this);
        this.modelOpenClose = this.modelOpenClose.bind(this);
        this.getTreeTemplateList = this.getTreeTemplateList.bind(this);
        this.modelOpenCloseCreateTree = this.modelOpenCloseCreateTree.bind(this)
        this.changed = this.changed.bind(this);
        this.getPlanningUnitWithPricesByIds = this.getPlanningUnitWithPricesByIds.bind(this);
        this.saveMissingPUs = this.saveMissingPUs.bind(this);
        this.procurementAgentList = this.procurementAgentList.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
    }
    /**
     * Hides the message in div3 after 30 seconds.
     */
    hideThirdComponent() {
        document.getElementById('div3').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 30000);
    }
    /**
     * Toggle modal for create tree
     */
    modelOpenCloseCreateTree() {
        this.setState({
            isModalCreateTree: !this.state.isModalCreateTree,
            treeName: "",
            forecastMethod: {
                id: "",
                label: {
                    label_en: ""
                }
            },
            datasetIdModal: "",
            regionId: '',
            regionList: [],
            regionValues: [],
            missingPUList: [],
            active: true,
            datasetListJexcel: {},
            treeTemplate: {}
        })
    }
    /**
     * Reterives tree template list
     */
    getTreeTemplateList() {
        DatasetService.getTreeTemplateList().then(response => {
            var treeTemplateList = response.data.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            var db1;
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
                            this.setState({
                                forecastMethodList: myResult.filter(x => x.forecastMethodTypeId == 1),
                                programList: programRequest.result.filter(c => c.userId == userId),
                                datasetList: datasetRequest.result.filter(c => c.userId == userId)
                            }, () => {
                                if (this.props.location.state != undefined && this.props.location.state.treeTemplateId != undefined) {
                                    var treeTemplate = treeTemplateList.filter(c => c.treeTemplateId == this.props.location.state.treeTemplateId)[0];
                                    this.setState({
                                        isModalCreateTree: !this.state.isModalCreateTree,
                                        treeTemplate: treeTemplate,
                                        treeName: treeTemplate.label.label_en,
                                        active: treeTemplate.active,
                                        forecastMethod: treeTemplate.forecastMethod,
                                        regionId: '',
                                        regionList: [],
                                        regionValues: [],
                                        notes: treeTemplate.notes,
                                        missingPUList: [],
                                        datasetIdModal: ""
                                    }, () => {
                                        if (this.state.programList.length == 1) {
                                            var event = {
                                                target: {
                                                    name: "datasetIdModal",
                                                    value: this.state.programList[0].id,
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
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
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
    /**
     * Toggle model for tree template
     */
    modelOpenClose() {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
        })
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
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
            if (event.target.value != "") {
            }
            this.setState({
                datasetIdModal: event.target.value,
            }, () => {
                localStorage.setItem("sesDatasetId", event.target.value);
                this.getRegionList(event.target.value);
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
    /**
     * Retrives region list for forecast program Id
     * @param {String} datasetId Forecast program Id
     */
    getRegionList(datasetId) {
        var regionList = [];
        var regionMultiList = [];
        if (datasetId != 0 && datasetId != "" && datasetId != null) {
            var program = this.state.datasetList.filter(c => c.id == datasetId);
            if (program.length > 0) {
                var databytes = CryptoJS.AES.decrypt(program[0].programData, SECRET_KEY);
                var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                regionList = programData.regionList;
                regionList.map(c => {
                    regionMultiList.push({ label: getLabelText(c.label, this.state.lang), value: c.regionId })
                })
                if (regionMultiList.length == 1) {
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
                datasetListJexcel: programData,
                regionValues: regionMultiList.length == 1 ? regionMultiList : []
            }, () => {
                this.findMissingPUs();
            });
        }
    }
    /**
     * Function to find missing planning units while create tree from tree template
     */
    findMissingPUs() {
        var missingPUList = [];
        var json;
        var treeTemplate = this.state.treeTemplate;
        let forecastStartDate;
        let forecastStopDate;
        let beforeEndDateDisplay;
        if (this.state.datasetIdModal != "" && this.state.datasetIdModal != null) {
            var dataset = this.state.datasetListJexcel;
            forecastStartDate = dataset.currentVersion.forecastStartDate;
            forecastStopDate = dataset.currentVersion.forecastStopDate;
            beforeEndDateDisplay = new Date(forecastStartDate);
            beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);
            var puNodeList = treeTemplate.flatList.filter(x => x.payload.nodeType.id == 5);
            var planningUnitList = dataset.planningUnitList;
            for (let i = 0; i < puNodeList.length; i++) {
                if (planningUnitList.filter(x => x.treeForecast == true && x.active == true && x.planningUnit.id == puNodeList[i].payload.nodeDataMap[0][0].puNode.planningUnit.id).length == 0) {
                    var parentNodeData = treeTemplate.flatList.filter(x => x.id == puNodeList[i].parent)[0];
                    let existingPU = planningUnitList.filter(x => x.planningUnit.id == puNodeList[i].payload.nodeDataMap[0][0].puNode.planningUnit.id);
                    if (existingPU.length > 0) {
                        json = {
                            productCategory: parentNodeData.payload.nodeDataMap[0][0].fuNode.forecastingUnit.productCategory,
                            planningUnit: puNodeList[i].payload.nodeDataMap[0][0].puNode.planningUnit,
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
                            createdBy: existingPU[0].createdBy,
                            createdDate: existingPU[0].createdDate
                        }
                        missingPUList.push(json);
                    } else {
                        json = {
                            productCategory: parentNodeData.payload.nodeDataMap[0][0].fuNode.forecastingUnit.productCategory,
                            planningUnit: puNodeList[i].payload.nodeDataMap[0][0].puNode.planningUnit,
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
                            createdDate: null
                        };
                        missingPUList.push(json);
                    }
                }
            }
        }
        if (missingPUList.length > 0) {
            missingPUList = missingPUList.filter((v, i, a) => a.findIndex(v2 => (v2.planningUnit.id === v.planningUnit.id)) === i)
        }
        this.setState({
            missingPUList,
            beforeEndDateDisplay: (!isNaN(beforeEndDateDisplay.getTime()) == false ? '' : months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear()),
            startDateDisplay: (forecastStartDate == '' ? '' : months[Number(moment(forecastStartDate).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDate).startOf('month').format("YYYY"))),
            endDateDisplay: (forecastStopDate == '' ? '' : months[Number(moment(forecastStopDate).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDate).startOf('month').format("YYYY"))),
        }, () => {
            this.buildMissingPUJexcel();
        });
    }
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildMissingPUJexcel() {
        this.getPlanningUnitWithPricesByIds();
        var missingPUList = this.state.missingPUList;
        var dataArray = [];
        let count = 0;
        if (missingPUList.length > 0) {
            for (var j = 0; j < missingPUList.length; j++) {
                data = [];
                data[0] = getLabelText(missingPUList[j].productCategory.label, this.state.lang)
                data[1] = getLabelText(missingPUList[j].planningUnit.label, this.state.lang) + " | " + missingPUList[j].planningUnit.id
                data[2] = missingPUList[j].consuptionForecast;
                data[3] = missingPUList[j].treeForecast;
                data[4] = missingPUList[j].stock;
                data[5] = missingPUList[j].existingShipments;
                data[6] = missingPUList[j].monthsOfStock;
                data[7] = (missingPUList[j].price === "" || missingPUList[j].price == null || missingPUList[j].price == undefined) ? "" : (missingPUList[j].procurementAgent == null || missingPUList[j].procurementAgent == undefined ? -1 : missingPUList[j].procurementAgent.id);
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
                dataArray[count] = data;
                count++;
            }
        }
        this.el = jexcel(document.getElementById("missingPUJexcel"), '');
        jexcel.destroy(document.getElementById("missingPUJexcel"), true);
        var data = dataArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [20, 80, 60, 60, 60, 60, 60, 60, 60, 60],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.productCategory.productCategory'),
                    type: 'test',
                    editable: false,
                    readOnly: true
                },
                {
                    title: i18n.t('static.product.product'),
                    type: 'text',
                    editable: false,
                    readOnly: true
                },
                {
                    title: i18n.t('static.commitTree.consumptionForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                    editable: true,
                    readOnly: false
                },
                {
                    title: i18n.t('static.TreeForecast.TreeForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                    editable: true,
                    readOnly: false
                },
                {
                    title: i18n.t('static.planningUnitSetting.stockEndOf') + ' ' + this.state.beforeEndDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true,
                    editable: true,
                    readOnly: false
                },
                {
                    title: i18n.t('static.planningUnitSetting.existingShipments') + this.state.startDateDisplay + ' - ' + this.state.endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true,
                    editable: true,
                    readOnly: false
                },
                {
                    title: i18n.t('static.planningUnitSetting.desiredMonthsOfStock') + ' ' + this.state.endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    disabledMaskOnEdition: true,
                    width: '150',
                    editable: true,
                    readOnly: false
                },
                {
                    title: i18n.t('static.forecastReport.priceType'),
                    type: 'autocomplete',
                    source: this.state.allProcurementAgentList,
                    width: '120',
                    editable: true,
                    readOnly: false
                },
                {
                    title: i18n.t('static.forecastReport.unitPrice'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##.00',
                    width: '120',
                    disabledMaskOnEdition: true,
                    editable: true,
                    readOnly: false
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    editable: true,
                    readOnly: false
                },
                {
                    title: 'planningUnitId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'programPlanningUnitId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'higherThenConsumptionThreshold',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'lowerThenConsumptionThreshold',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'selectedForecastMap',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'otherUnit',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'createdBy',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: 'createdDate',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t("static.common.select"),
                    type: 'checkbox'
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
            onload: this.loadedMissingPU,
            onchange: this.changed,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
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
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed = function (instance, cell, x, y, value) {
        if (x == 18) {
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
            if (value.toString() == "false") {
                this.el.setValueFromCoords(2, y, this.state.missingPUList[y].consuptionForecast, true);
                this.el.setValueFromCoords(3, y, this.state.missingPUList[y].treeForecast, true);
                this.el.setValueFromCoords(4, y, this.state.missingPUList[y].stock, true);
                this.el.setValueFromCoords(5, y, this.state.missingPUList[y].existingShipments, true);
                this.el.setValueFromCoords(6, y, this.state.missingPUList[y].monthsOfStock, true);
                this.el.setValueFromCoords(7, y, (this.state.missingPUList[y].price === "" || this.state.missingPUList[y].price == null || this.state.missingPUList[y].price == undefined) ? "" : (this.state.missingPUList[y].procurementAgent == null || this.state.missingPUList[y].procurementAgent == undefined ? -1 : this.state.missingPUList[y].procurementAgent.id), true);
                this.el.setValueFromCoords(8, y, this.state.missingPUList[y].price, true);
                this.el.setValueFromCoords(9, y, this.state.missingPUList[y].planningUnitNotes, true);
                this.el.setValueFromCoords(10, y, this.state.missingPUList[y].planningUnit.id, true);
                this.el.setValueFromCoords(11, y, this.state.missingPUList[y].programPlanningUnitId, true);
                this.el.setValueFromCoords(12, y, this.state.missingPUList[y].higherThenConsumptionThreshold, true);
                this.el.setValueFromCoords(13, y, this.state.missingPUList[y].lowerThenConsumptionThreshold, true);
                this.el.setValueFromCoords(14, y, this.state.missingPUList[y].selectedForecastMap, true);
                this.el.setValueFromCoords(15, y, this.state.missingPUList[y].otherUnit, true);
                this.el.setValueFromCoords(16, y, this.state.missingPUList[y].createdBy, true);
                this.el.setValueFromCoords(17, y, this.state.missingPUList[y].createdDate, true);
                for (var c = 0; c < colArr.length; c++) {
                    var cell = this.el.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('readonly');
                }
            } else {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = this.el.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.remove('readonly');
                }
            }
        }
        if (x == 7) {
            if (value != -1 && value !== null && value !== '') {
                let planningUnitId = this.el.getValueFromCoords(10, y);
                let planningUnitObjList = this.state.planningUnitObjList;
                let tempPaList = planningUnitObjList.filter(c => c.planningUnitId == planningUnitId)[0];
                if (tempPaList != undefined) {
                    let obj = tempPaList.procurementAgentPriceList.filter(c => c.id == value)[0];
                    if (typeof obj != 'undefined') {
                        this.el.setValueFromCoords(8, y, obj.price, true);
                    } else {
                        let q = '';
                        this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : this.el.setValueFromCoords(8, y, '', true)
                    }
                }
            } else {
                this.el.setValueFromCoords(8, y, '', true);
            }
        }
        if (x == 0) {
            let q = '';
            q = (this.el.getValueFromCoords(1, y) != '' ? this.el.setValueFromCoords(1, y, '', true) : '');
            q = (this.el.getValueFromCoords(7, y) != '' ? this.el.setValueFromCoords(7, y, '', true) : '');
            q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');
        }
        if (x == 1) {
            let q = '';
            q = (this.el.getValueFromCoords(7, y) != '' ? this.el.setValueFromCoords(7, y, '', true) : '');
            q = (this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : '');
        }
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
        if (x == 1) {
            var json = this.el.getJson(null, false);
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var jsonLength = parseInt(json.length) - 1;
                for (var i = jsonLength; i >= 0; i--) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        i = -1;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
        }
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(4, y);
            }
            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (!Number.isInteger(Number(value))) {
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
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(5, y);
            }
            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (!Number.isInteger(Number(value))) {
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
        if (x == 6) {
            var col = ("G").concat(parseInt(y) + 1);
            value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(6, y);
            }
            var reg = JEXCEL_INTEGER_REGEX;
            if (value != "") {
                if (isNaN(parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (!Number.isInteger(Number(value))) {
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
        if (this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "") > 0 && this.el.getValue(`H${parseInt(y) + 1}`, true) == "") {
            this.el.setValueFromCoords(7, y, -1, true);
        }
        if (x == 8) {
            var col = ("I").concat(parseInt(y) + 1);
            value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(8, y);
            }
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            if (value == "") {
            } else {
                if (isNaN(parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'))
                } else if (Number(value) < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.negativeValueNotAllowed'))
                } else if (!(reg.test(value))) {
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
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedMissingPU = function (instance, cell) {
        jExcelLoadedFunctionOnlyHideRow(instance, 1);
        var asterisk = document.getElementsByClassName("jss")[1].firstChild.nextSibling;
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
    }
    /**
     * Reterives planning unit list with procurement agent price
     */
    getPlanningUnitWithPricesByIds() {
        PlanningUnitService.getPlanningUnitWithPricesByIds(this.state.missingPUList.map(ele => (ele.planningUnit.id).toString()))
            .then(response => {
                this.setState({
                    planningUnitObjList: response.data
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
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
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
    /**
     * Reterives procurement agent list
     */
    procurementAgentList() {
        const lan = 'en';
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
            var procurementAgentOs = procurementAgentTransaction.objectStore('procurementAgent');
            var procurementAgentRequest = procurementAgentOs.getAll();
            procurementAgentRequest.onerror = function (event) {
                this.setState({
                    message: 'unknown error occured', loading: false
                },
                    () => {
                        hideSecondComponent();
                    })
            };
            procurementAgentRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = procurementAgentRequest.result;
                var listArray = myResult;
                listArray.sort((a, b) => {
                    var itemLabelA = (a.procurementAgentCode).toUpperCase();
                    var itemLabelB = (b.procurementAgentCode).toUpperCase();
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
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var col = ("A").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(0, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getRowData(parseInt(y))[1];
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
            var col = ("E").concat(parseInt(y) + 1);
            var value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(4, y);
            }
            var reg = JEXCEL_INTEGER_REGEX;
            if (value == "") {
            } else {
                if (isNaN(parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                    valid = false;
                } else if (!Number.isInteger(Number(value))) {
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
            var col = ("F").concat(parseInt(y) + 1);
            var value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            if (value == '' || value == null) {
                value = this.el.getValueFromCoords(5, y);
            }
            var reg = JEXCEL_INTEGER_REGEX;
            if (value == "") {
            } else {
                if (isNaN(parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                    valid = false;
                } else if (!Number.isInteger(Number(value))) {
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
            var reg = JEXCEL_INTEGER_REGEX;
            if (value == "") {
            } else {
                if (isNaN(parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                    valid = false;
                } else if (!Number.isInteger(Number(value))) {
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
                if (isNaN(parseInt(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.stringNotAllowed'));
                    valid = false;
                } else if (Number(value) < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.planningUnitSetting.negativeValueNotAllowed'));
                    valid = false;
                } else if (!(reg.test(value))) {
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
    /**
     * Saves missing planning units on submission
     */
    saveMissingPUs() {
        var validation = this.checkValidation();
        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
        var curUser = AuthenticationService.getLoggedInUserId();
        let indexVar = 0;
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            var planningUnitList = [];
            var missingPUList = this.state.missingPUList;
            var updatedMissingPUList = [];
            for (var i = 0; i < tableJson.length; i++) {
                if (tableJson[i][18].toString() == "true") {
                    var map1 = new Map(Object.entries(tableJson[i]));
                    let procurementAgentObj = "";
                    if (parseInt(map1.get("7")) === -1 || (map1.get("7")) == "") {
                        procurementAgentObj = null
                    } else {
                        procurementAgentObj = this.state.allProcurementAgentList.filter(c => c.id == parseInt(map1.get("7")))[0];
                    }
                    var planningUnitObj = this.state.planningUnitObjList.filter(c => c.planningUnitId == missingPUList[i].planningUnit.id)[0]
                    let tempJson = {
                        "programPlanningUnitId": map1.get("11"),
                        "planningUnit": {
                            "id": planningUnitObj.planningUnitId,
                            "label": planningUnitObj.label,
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
                        "otherUnit": map1.get("15") == "" ? null : map1.get("15"),
                        "selectedForecastMap": map1.get("14"),
                        "createdBy": map1.get("16") == "" ? { "userId": curUser } : map1.get("16"),
                        "createdDate": map1.get("17") == "" ? curDate : map1.get("17"),
                        "active": true,
                    }
                    planningUnitList.push(tempJson);
                } else {
                    updatedMissingPUList.push(missingPUList[i])
                }
            }
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var program = transaction.objectStore('datasetData');
                var getRequest = program.getAll();
                getRequest.onerror = function (event) {
                };
                getRequest.onsuccess = function (event) {
                    var myResult = [];
                    myResult = getRequest.result;
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    var filteredGetRequestList = myResult.filter(c => c.userId == userId);
                    var programId = this.state.datasetIdModal.split("_")[0];
                    var versionId = (this.state.datasetIdModal.split("_")[1]).split("v")[1];
                    var program = (filteredGetRequestList.filter(x => x.programId == programId)).filter(v => v.version == versionId)[0];
                    var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
                    var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                    var planningFullList = programData.planningUnitList;
                    planningUnitList.forEach(p => {
                        indexVar = programData.planningUnitList.findIndex(c => c.planningUnit.id == p.planningUnit.id)
                        if (indexVar != -1) {
                            planningFullList[indexVar] = p;
                        } else {
                            planningFullList = planningFullList.concat(p);
                        }
                    })
                    programData.planningUnitList = planningFullList;
                    let downloadedProgramData = programData;
                    programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
                    program.programData = programData;
                    var transaction = db1.transaction(['datasetData'], 'readwrite');
                    var programTransaction = transaction.objectStore('datasetData');
                    programTransaction.put(program);
                    transaction.oncomplete = function (event) {
                        db1 = e.target.result;
                        var id = this.state.datasetIdModal;
                        var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                        var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                        var datasetDetailsRequest = datasetDetailsTransaction.get(id);
                        datasetDetailsRequest.onsuccess = function (e) {
                            var datasetDetailsRequestJson = datasetDetailsRequest.result;
                            datasetDetailsRequestJson.changed = 1;
                            var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                            datasetDetailsRequest1.onsuccess = function (event) {
                                this.setState({
                                    color: "green",
                                    missingPUList: updatedMissingPUList,
                                    downloadedProgramData: [downloadedProgramData],
                                    datasetListJexcel: downloadedProgramData
                                }, () => {
                                    this.hideThirdComponent();
                                    if (this.state.missingPUList.length > 0) {
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
    /**
     * Handle region change function.
     * This function updates the state with the selected region values and generates a list of regions.
     * @param {array} regionIds - An array containing the IDs and labels of the selected regions.
     */
    handleRegionChange = (regionIds) => {
        this.setState({
            regionValues: regionIds.map(ele => ele),
        }, () => {
            var regionList = [];
            var regions = this.state.regionValues;
            for (let i = 0; i < regions.length; i++) {
                var json = {
                    id: regions[i].value,
                    label: {
                        label_en: regions[i].label
                    }
                }
                regionList.push(json);
            }
            this.setState({ regionList });
        })
    }
    /**
     * Function to copy tree or to delete the tree
     * @param {*} treeTemplateId Tree template Id that should be copies
     */
    copyDeleteTree(treeTemplateId) {
        // Call API
        DatasetService.getTreeTemplateById(treeTemplateId).then(response => {
            var treeTemplate = response.data;
            treeTemplate.label.label_en = this.state.treeTemplateName;
            DatasetService.addTreeTemplate(treeTemplate)
                .then(response => {
                    if (response.status == 200) {
                        this.setState({
                            message: i18n.t('static.message.addTreeTemplate'),
                            color: 'green',
                            loading: false,
                            isSubmitClicked: false
                        }, () => {
                            this.getTreeTemplateList();
                            hideSecondComponent();
                        });
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
                        },
                            () => {
                                hideSecondComponent();
                            })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false,
                                isSubmitClicked: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
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
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
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
    /**
     * Redirects to the add tree template screen.
     */
    addTreeTemplate() {
        this.props.history.push({
            pathname: `/dataSet/createTreeTemplate/-1`,
        });
    }
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildJexcel() {
        let treeTemplateList = this.state.treeTemplateList;
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
            data[5] = getLabelText(treeTemplateList[j].rootNodeType.label, this.state.lang);
            data[6] = treeTemplateList[j].notes;
            data[7] = treeTemplateList[j].active;
            data[8] = treeTemplateList[j].lastModifiedBy.username;
            data[9] = (treeTemplateList[j].lastModifiedDate ? moment(treeTemplateList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            if (selStatus != "") {
                if (tempSelStatus == treeTemplateList[j].active) {
                    treeTemplateArray[count] = data;
                    count++;
                }
            } else {
                treeTemplateArray[count] = data;
                count++;
            }
            data[10] = treeTemplateList[j];
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = treeTemplateArray;
        var options = {
            data: data,
            columnDrag: false,
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
                    width: 200
                },
                {
                    title: i18n.t('static.forecastMethod.forecastMethod'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.program.monthsInPast'),
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.program.monthsInFuture'),
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.treeTemplate.startNode'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.ManageTree.Notes'),
                    type: 'text',
                    width: 400
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.dataentry.inactive') }
                    ]
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                },
                {
                    type: 'hidden'
                }
            ],
            editable: false,
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
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
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
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
                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE') && (this.state.treeEl.getValueFromCoords(10, y).rootNodeType.id == 1 || this.state.treeEl.getValueFromCoords(10, y).rootNodeType.id == 2)) {
                            items.push({
                                title: "Create tree from this template",
                                onclick: function () {
                                    var treeTemplateId = this.state.treeEl.getValueFromCoords(0, y);
                                    DatasetService.getTreeTemplateById(treeTemplateId).then(response => {
                                        this.setState({
                                            isModalCreateTree: !this.state.isModalCreateTree,
                                            treeTemplate: response.data,
                                            treeName: response.data.label.label_en,
                                            active: response.data.active,
                                            forecastMethod: response.data.forecastMethod,
                                            regionId: '',
                                            regionList: [],
                                            regionValues: [],
                                            notes: response.data.notes,
                                            missingPUList: [],
                                            datasetIdModal: ""
                                        }, () => {
                                            if (this.state.programList.length == 1) {
                                                var event = {
                                                    target: {
                                                        name: "datasetIdModal",
                                                        value: this.state.programList[0].id,
                                                    }
                                                }
                                                this.dataChange(event)
                                            }
                                        })
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
                                                        case 409:
                                                            this.setState({
                                                                message: i18n.t('static.common.accessDenied'),
                                                                loading: false,
                                                                color: "#BA0C2F",
                                                            });
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
                                }.bind(this)
                            });
                        }
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
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Calls get tree template list and get procurement agent list functions on component mount
     */
    componentDidMount() {
        hideFirstComponent();
        this.getTreeTemplateList();
        this.procurementAgentList();
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
    }
    /**
     * Redirects to the edit tree template screen on row click.
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if (x == 0 && value != 0) {
            } else {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_VIEW_TREE_TEMPLATES')) {
                    var treeTemplateId = this.state.treeEl.getValueFromCoords(0, x);
                    this.props.history.push({
                        pathname: `/dataset/createTreeTemplate/${treeTemplateId}`,
                    });
                }
            }
        }
    }.bind(this);
    /**
     * Function to create tree from tree template
     */
    createTree() {
        var program = this.state.datasetListJexcel;
        let tempProgram = JSON.parse(JSON.stringify(program))
        let treeList = program.treeList;
        var treeId = ""
        var maxTreeId = treeList.length > 0 ? Math.max(...treeList.map(o => o.treeId)) : 0;
        treeId = parseInt(maxTreeId) + 1;
        var nodeDataMap = {};
        var tempArray = [];
        var tempJson = {};
        var tempTree = {};
        var curMonth = moment(program.currentVersion.forecastStartDate).format('YYYY-MM-DD');
        var treeTemplate = this.state.treeTemplate;
        var flatList = JSON.parse(JSON.stringify(treeTemplate.flatList));
        for (let i = 0; i < flatList.length; i++) {
            nodeDataMap = {};
            tempArray = [];
            if (flatList[i].payload.nodeDataMap[0][0].nodeDataModelingList.length > 0) {
                for (let j = 0; j < flatList[i].payload.nodeDataMap[0][0].nodeDataModelingList.length; j++) {
                    var modeling = (flatList[i].payload.nodeDataMap[0][0].nodeDataModelingList)[j];
                    var startMonthNoModeling = modeling.startDateNo < 0 ? modeling.startDateNo : parseInt(modeling.startDateNo - 1);
                    modeling.startDate = moment(curMonth).startOf('month').add(startMonthNoModeling, 'months').format("YYYY-MM-DD");
                    var stopMonthNoModeling = modeling.stopDateNo < 0 ? modeling.stopDateNo : parseInt(modeling.stopDateNo - 1)
                    modeling.stopDate = moment(curMonth).startOf('month').add(stopMonthNoModeling, 'months').format("YYYY-MM-DD");
                    (flatList[i].payload.nodeDataMap[0][0].nodeDataModelingList)[j] = modeling;
                }
            }
            tempJson = flatList[i].payload.nodeDataMap[0][0];
            if (flatList[i].payload.nodeType.id != 1) {
                var monthNo = flatList[i].payload.nodeDataMap[0][0].monthNo < 0 ? flatList[i].payload.nodeDataMap[0][0].monthNo : parseInt(flatList[i].payload.nodeDataMap[0][0].monthNo - 1)
                tempJson.month = moment(curMonth).startOf('month').add(monthNo, 'months').format("YYYY-MM-DD");
            }
            tempArray.push(tempJson);
            nodeDataMap[1] = tempArray;
            flatList[i].payload.nodeDataMap = nodeDataMap;
        }
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
        tempProgram.treeList = treeList;
        var programCopy = JSON.parse(JSON.stringify(tempProgram));
        programCopy.programData = tempProgram;
        calculateModelingData(programCopy, this, this.state.datasetIdModal, 0, 1, 1, treeId, false, true, true);
    }
    /**
     * This function is used to update the state of this component from any other component
     * @param {*} parameterName This is the name of the key
     * @param {*} value This is the value for the key
     */
    updateState(parameterName, value) {
        if (parameterName != "loading") {
            this.setState({
                [parameterName]: value
            }, () => {
                if (parameterName == 'programId' && value != "") {
                    var programId = this.state.programId;
                    var program = this.state.datasetListJexcel;
                    let tempProgram = JSON.parse(JSON.stringify(program))
                    let treeList = tempProgram.treeList;
                    var tree = treeList.filter(x => x.treeId == this.state.tempTreeId)[0];
                    var items = tree.tree.flatList;
                    var nodeDataMomList = this.state.nodeDataMomList;
                    if (nodeDataMomList.length > 0) {
                        for (let i = 0; i < nodeDataMomList.length; i++) {
                            var nodeId = nodeDataMomList[i].nodeId;
                            var nodeDataMomListForNode = nodeDataMomList[i].nodeDataMomList;
                            var node = items.filter(n => n.id == nodeId)[0];
                            (node.payload.nodeDataMap[1])[0].nodeDataMomList = nodeDataMomListForNode;
                            var findNodeIndex = items.findIndex(n => n.id == nodeId);
                            items[findNodeIndex] = node;
                        }
                    }
                    tree.flatList = items;
                    tree.lastModifiedBy = {
                        userId: AuthenticationService.getLoggedInUserId(),
                        username: AuthenticationService.getLoggedInUsername()
                    };
                    tree.lastModifiedDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                    tree.createdBy = {
                        userId: AuthenticationService.getLoggedInUserId()
                    };
                    tree.createdDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                    var findTreeIndex = treeList.findIndex(n => n.treeId == this.state.tempTreeId);
                    treeList[findTreeIndex] = tree;
                    tempProgram.treeList = treeList;
                    var programCopy = JSON.parse(JSON.stringify(tempProgram));
                    var programData = (CryptoJS.AES.encrypt(JSON.stringify(tempProgram.programData), SECRET_KEY)).toString();
                    tempProgram.programData = programData;
                    this.saveTreeData(3, tempProgram, this.state.treeTemplate.treeTemplateId, programId, this.state.tempTreeId, programCopy);
                }
            })
        }
    }
    /**
     * Saves tree data to IndexedDB.
     * This function encrypts and saves the provided tree data along with associated metadata to IndexedDB.
     * @param {string} operationId - The operation ID indicating the type of operation (e.g., save, update).
     * @param {object} tempProgram - The temporary program object to be saved.
     * @param {string} treeTemplateId - The ID of the tree template.
     * @param {string} programId - The ID of the program.
     * @param {string} treeId - The ID of the tree.
     * @param {boolean} programCopy - Indicates whether the program is being copied.
     */
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
            hideFirstComponent()
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
                db1 = e.target.result;
                var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetIdModal);
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
                }, () => {
                    if (operationId == 3) {
                        this.props.history.push({
                            pathname: `/dataSet/buildTree/tree/${treeId}/${id}`,
                        });
                    } else {
                        this.getPrograms();
                    }
                });
            }.bind(this);
            transaction.onerror = function (event) {
                this.setState({
                    loading: false,
                    color: "red",
                }, () => {
                    hideSecondComponent();
                });
            }.bind(this);
        }.bind(this);
    }
    /**
     * Renders the tree template list.
     * @returns {JSX.Element} - Tree template list.
     */
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
                        {item.programCode + "~v" + item.version}
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
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_TREE_TEMPLATE') &&
                                    <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addTreeTemplate}><i className="fa fa-plus-square"></i></a>
                                }
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <div className="pl-0">
                            <div className="SelectdivTree d-flex">
                                <FormGroup className="col-md-3 pl-0">
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
                                                <option value="false">{i18n.t('static.dataentry.inactive')}</option>
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </div>
                        <div className="col-md-10 pl-0 DarkThColr" style={{ marginTop: '58px' }}>{i18n.t('static.treeTemplate.listTreeTemplateTooltip')}</div>
                        <div className="TreeTemplateTable consumptionDataEntryTable treeTemplateSearchMarginTop1">
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
                            <Col sm={12} style={{ flexBasis: 'auto' }}>
                                <Formik
                                    initialValues={{
                                        treeTemplateName: this.state.treeTemplateName
                                    }}
                                    validationSchema={validationSchema}
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
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </div>
                                            </Form>
                                        )} />
                            </Col>
                            <br />
                        </ModalBody>
                    </Modal>
                    <Modal isOpen={this.state.isModalCreateTree}
                        className={'modal-dialog modal-lg modalWidth'}>
                        <ModalHeader>
                            <strong>{i18n.t('static.listTree.treeDetails')}</strong>
                            <Button size="md" onClick={this.modelOpenCloseCreateTree} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                        </ModalHeader>
                        <ModalBody className='pb-lg-0'>
                            <Col sm={12} style={{ flexBasis: 'auto' }}>
                                <Formik
                                    initialValues={{
                                        treeName: this.state.treeName,
                                        forecastMethodId: this.state.forecastMethod.id,
                                        datasetIdModal: this.state.datasetIdModal,
                                        regionId: this.state.regionValues
                                    }}
                                    enableReinitialize={true}
                                    validationSchema={validationSchemaCreateTree}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {
                                        this.setState({ loading: true }, () => {
                                            this.createTree();
                                            this.setState({
                                                isModalCreateTree: !this.state.isModalCreateTree,
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
                                                                        {i18n.t('static.dataentry.inactive')}
                                                                    </Label>
                                                                </FormGroup>
                                                            </FormGroup>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 pl-lg-0 pr-lg-0" style={{ display: 'inline-block' }}>
                                                        <div style={{ display: this.state.missingPUList.length > 0 ? 'block' : 'none' }}><div><b>{i18n.t('static.listTree.missingPlanningUnits') + " "} : <a href="/#/planningUnitSetting/listPlanningUnitSetting" className="supplyplanformulas">{i18n.t('static.Update.PlanningUnits')}</a>)</b></div><br />
                                                            <div id="missingPUJexcel" className="RowClickable TableWidth100">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <h5 className="green" style={{ display: "none" }} id="div3">
                                                        {this.state.missingPUList.length > 0 && i18n.t("static.treeTemplate.addSuccessMessageSelected")}
                                                        {this.state.missingPUList.length == 0 && i18n.t("static.treeTemplate.addSuccessMessageAll")}
                                                    </h5>
                                                    <FormGroup className="col-md-12 float-right pt-lg-4 pr-lg-0">
                                                        <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.modelOpenCloseCreateTree}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        {this.state.missingPUList.length == 0 && <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t("static.tree.createTree")}</Button>}
                                                        {this.state.missingPUList.length > 0 && <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t("static.tree.createTreeWithoutPU")}</Button>}
                                                        {this.state.missingPUList.length > 0 && <Button type="button" color="success" className="mr-1 float-right" size="md" onClick={() => this.saveMissingPUs()}><i className="fa fa-check"></i>{i18n.t("static.tree.addAbovePUs")}</Button>}
                                                        {this.state.missingPUList.length == 0 && <strong>{i18n.t("static.tree.allTemplatePUAreInProgram")}</strong>}
                                                        &nbsp;
                                                    </FormGroup>
                                                </div>
                                            </Form>
                                        )} />
                            </Col>
                            <br />
                        </ModalBody>
                    </Modal>
                </Card>
            </div>
        );
    }
}

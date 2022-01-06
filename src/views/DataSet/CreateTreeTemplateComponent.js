import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType, LevelAnnotationConfig, AnnotationType, LineType, Thickness, TreeLevels } from 'basicprimitives';
import { DropTarget, DragSource } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faCopy } from '@fortawesome/free-solid-svg-icons'
import i18n from '../../i18n'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Formik } from 'formik';
import * as Yup from 'yup'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'

import '../../views/Forms/ValidationForms/ValidationForms.css'
import { Row, Col, Card, CardFooter, Button, CardBody, Form, Modal, Popover, PopoverHeader, PopoverBody, ModalBody, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, Fieldset, InputGroupAddon, InputGroupText, InputGroup } from 'reactstrap';
import Provider from '../../Samples/Provider'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import ForecastMethodService from '../../api/ForecastMethodService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import DatasetService from '../../api/DatasetService.js';
import UnitService from '../../api/UnitService.js';
import moment from 'moment';
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
import UsagePeriodService from '../../api/UsagePeriodService.js';
import TracerCategoryService from '../../api/TracerCategoryService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import PlanningUnitService from '../../api/PlanningUnitService';
import UsageTemplateService from '../../api/UsageTemplateService';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, TREE_DIMENSION_ID, JEXCEL_MONTH_PICKER_FORMAT, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_DECIMAL_NO_REGEX_LONG } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import cleanUp from '../../assets/img/calculator.png';
import { Bar } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { grey } from '@material-ui/core/colors';
// import Draggable from 'react-draggable';
import SupplyPlanFormulas from "../SupplyPlan/SupplyPlanFormulas";
import ModelingTypeService from "../../api/ModelingTypeService";
import docicon from '../../assets/img/doc.png'
import { saveAs } from "file-saver";
import { Document, ImageRun, Packer, Paragraph, ShadingType, TextRun } from "docx";


const entityname = 'Tree Template';
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

const ItemTypes = {
    NODE: 'node'
}

let initialValues = {
    forecastMethodId: "",
    treeName: "",
    monthsInPast: "",
    monthsInFuture: ""
}

let initialValuesNodeData = {
    nodeTypeId: "",
    nodeTitle: "",
    nodeUnitId: "",
    percentageOfParent: ""
    // nodeValue: ""
}

const validationSchemaNodeData = function (values) {
    return Yup.object().shape({
        nodeTypeId: Yup.string()
            .required('This is required'),
        nodeTitle: Yup.string()
            .required('This is required'),
        nodeUnitId: Yup.string()
            .test('nodeUnitId', 'This is required',
                function (value) {
                    if (parseInt(document.getElementById("nodeTypeId").value) == 3 && document.getElementById("nodeUnitId").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        percentageOfParent: Yup.string()
            .test('percentageOfParent', 'This is required',
                function (value) {
                    if (parseInt(document.getElementById("nodeTypeId").value) == 3 && document.getElementById("percentageOfParent").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        // nodeValue: Yup.string()
        //     .test('nodeValue', 'This is required',
        //         function (value) {
        //             if (parseInt(document.getElementById("nodeTypeId").value) == 3 && document.getElementById("nodeValue").value == "") {
        //                 return false;
        //             } else {
        //                 return true;
        //             }
        //         }),


    })
}

const validateNodeData = (getValidationSchema) => {
    return (values) => {
        const validationSchemaNodeData = getValidationSchema(values)
        try {
            validationSchemaNodeData.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationErrorNodeData(error)
        }
    }
}

const getErrorsFromValidationErrorNodeData = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

const validationSchema = function (values) {
    return Yup.object().shape({
        forecastMethodId: Yup.string()
            .required("Please select forecast method"),
        treeName: Yup.string()
            .required("Please enter tree name"),
        monthsInPast: Yup.number()
            .typeError('Please enter months in past')
            .integer("Please enter only values")
            .required("Please enter months in past"),
        monthsInFuture: Yup.number()
            .typeError('Please enter months in future')
            .integer("Please enter only values")
            .required("Please enter months in future")
            .positive("Please enter positive values")

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

function addCommas(cell1, row) {
    if (cell1 != null && cell1 != "") {
        cell1 += '';
        var x = cell1.replaceAll(",", "").split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1].slice(0, 2) : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
        // return cell1.toString().replaceAll(",", "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    } else {
        return "";
    }
}

export default class CreateTreeTemplate extends Component {
    constructor() {
        super();
        this.pickAMonth2 = React.createRef()
        this.pickAMonth1 = React.createRef()
        this.state = {
            orgCurrentItemConfig: {},
            tempItems: [],
            preItem: [],
            filteredModelingType: [],
            minMonth: '',
            maxMonth: '',
            scalingList: [],
            modelingTypeList: [],
            sameLevelNodeList: [],
            showMomDataPercent: false,
            showModelingJexcelNumber: false,
            showModelingJexcelPercent: false,
            showMomData: false,
            showCalculatorFields: false,
            momElPer: '',
            momEl: '',
            modelingEl: '',
            modelingPerEl: '',
            popoverOpen: false,
            unitList: [],
            autocompleteData: [],
            noOfFUPatient: '',
            nodeTypeFollowUpList: [],
            parentValue: '',
            calculatedDataValue: '',
            message: '',
            converionFactor: '',
            planningUnitList: [],
            noFURequired: '',
            usageTypeParent: '',
            usageTemplateList: [],
            usageTemplateId: '',
            usageText: '',
            noOfMonthsInUsagePeriod: '',
            tracerCategoryId: '',
            forecastingUnitList: [],
            usageTypeList: [],
            usagePeriodList: [],
            tracerCategoryList: [],
            addNodeFlag: false,
            level0: true,
            numberNode: false,
            scalingTotal: '',
            singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            treeTemplate: {
                treeTemplateId: 0,
                label: {
                    label_en: ""
                },
                forecastMethod: {
                    label: {
                        label_en: ""
                    }
                },
                active: true
                , flatList: []
            },
            forecastMethodList: [],
            nodeTypeList: [],
            nodeUnitList: [],
            modalOpen: false,
            title: '',
            cursorItem: 0,
            highlightItem: 0,
            items: [],
            currentItemConfig: {
                context: {
                    level: '',
                    payload: {
                        label: {

                        },
                        nodeType: {
                        },
                        nodeUnit: {

                        },
                        nodeDataMap: [
                            [
                                {
                                    dataValue: '',
                                    notes: '',
                                    fuNode: {
                                        forecastingUnit: {
                                            id: '',
                                            label: {
                                                label_en: ""
                                            }
                                        },
                                        repeatUsagePeriod: {
                                            usagePeriodId: ''
                                        }
                                    },
                                    puNode: {
                                        planningUnit: {

                                        },
                                        refillMonths: ''
                                    }
                                }
                            ]
                        ]
                    }
                },
                parentItem: {
                    payload: {
                        nodeType: {
                            id: ''
                        },
                        label: {

                        },
                        nodeDataMap: [
                            [
                                {
                                    puNode: {
                                        planningUnit: {
                                            id: ''
                                        },
                                        refillMonths: ''
                                    }
                                }
                            ]
                        ]
                    }
                },

            },
            manualChange: true,
            seasonality: true,
            activeTab1: new Array(2).fill('1'),
            momList: [
                { month: '2021-01-01', monthStartNoSeasonality: 2000000, calculatedChange: 21875, monthEndNoSeasonality: 2021875, seasonalityIndex: '-30%', manualChange: '', monthEnd: 1415313 },
                { month: '2021-02-01', monthStartNoSeasonality: 2021875, calculatedChange: 21875, monthEndNoSeasonality: 2043750, seasonalityIndex: '-30%', manualChange: '', monthEnd: 1430625 },
                { month: '2021-03-01', monthStartNoSeasonality: 2043750, calculatedChange: 21875, monthEndNoSeasonality: 2065625, seasonalityIndex: '-30%', manualChange: '', monthEnd: 1445938 },
                { month: '2021-04-01', monthStartNoSeasonality: 2065625, calculatedChange: 21875, monthEndNoSeasonality: 2087500, seasonalityIndex: '0%', manualChange: '', monthEnd: 2087500 },
                { month: '2021-05-01', monthStartNoSeasonality: 2087500, calculatedChange: 21875, monthEndNoSeasonality: 2109375, seasonalityIndex: '0%', manualChange: '', monthEnd: 2109375 },
                { month: '2021-06-01', monthStartNoSeasonality: 2109375, calculatedChange: 21875, monthEndNoSeasonality: 2131250, seasonalityIndex: '0%', manualChange: '', monthEnd: 2131250 },
                { month: '2021-07-01', monthStartNoSeasonality: 2131250, calculatedChange: 21875, monthEndNoSeasonality: 2153125, seasonalityIndex: '30%', manualChange: '', monthEnd: 2799063 },
                { month: '2021-08-01', monthStartNoSeasonality: 2153125, calculatedChange: 21875, monthEndNoSeasonality: 2175000, seasonalityIndex: '30%', manualChange: '', monthEnd: 2827500 },
                { month: '2021-09-01', monthStartNoSeasonality: 2175000, calculatedChange: 21875, monthEndNoSeasonality: 2196875, seasonalityIndex: '30%', manualChange: '', monthEnd: 2855938 },
                { month: '2021-10-01', monthStartNoSeasonality: 2218750, calculatedChange: 21875, monthEndNoSeasonality: 2240625, seasonalityIndex: '0%', manualChange: '', monthEnd: 2240625 },
                { month: '2021-11-01', monthStartNoSeasonality: 2240625, calculatedChange: 21875, monthEndNoSeasonality: 2262500, seasonalityIndex: '0%', manualChange: '', monthEnd: 2262500 },
                { month: '2021-12-01', monthStartNoSeasonality: 2262500, calculatedChange: 21875, monthEndNoSeasonality: 2284375, seasonalityIndex: '-30%', manualChange: '', monthEnd: 1599063 },

            ],

            momListPer: [
                { month: '2021-01-01', sexuallyActiveMenMonthStartPer: '50', calculatedChange: '1.00', manualChange: '', sexuallyActiveMenMonthEnd: 424594, sexuallyActiveMenMonthEndPer: '51', monthEnd: 216543 },
                { month: '2021-02-01', sexuallyActiveMenMonthStartPer: '51', calculatedChange: '1.00', manualChange: '', sexuallyActiveMenMonthEnd: 429188, sexuallyActiveMenMonthEndPer: '52', monthEnd: 223178 },
                { month: '2021-03-01', sexuallyActiveMenMonthStartPer: '52', calculatedChange: '1.00', manualChange: '', sexuallyActiveMenMonthEnd: 433781, sexuallyActiveMenMonthEndPer: '53', monthEnd: 229904 },
                { month: '2021-04-01', sexuallyActiveMenMonthStartPer: '53', calculatedChange: '1.00', manualChange: '', sexuallyActiveMenMonthEnd: 626250, sexuallyActiveMenMonthEndPer: '54', monthEnd: 338175 },
                { month: '2021-05-01', sexuallyActiveMenMonthStartPer: '54', calculatedChange: '1.00', manualChange: '', sexuallyActiveMenMonthEnd: 632813, sexuallyActiveMenMonthEndPer: '55', monthEnd: 348047 },
                { month: '2021-06-01', sexuallyActiveMenMonthStartPer: '55', calculatedChange: '1.00', manualChange: '4.00', sexuallyActiveMenMonthEnd: 639375, sexuallyActiveMenMonthEndPer: '60', monthEnd: 383625 },
                { month: '2021-07-01', sexuallyActiveMenMonthStartPer: '60', calculatedChange: '1.00', manualChange: '', sexuallyActiveMenMonthEnd: 839719, sexuallyActiveMenMonthEndPer: '61', monthEnd: 512228 },
                { month: '2021-08-01', sexuallyActiveMenMonthStartPer: '61', calculatedChange: '1.00', manualChange: '', sexuallyActiveMenMonthEnd: 848250, sexuallyActiveMenMonthEndPer: '62', monthEnd: 525915 },
                { month: '2021-09-01', sexuallyActiveMenMonthStartPer: '62', calculatedChange: '1.00', manualChange: '', sexuallyActiveMenMonthEnd: 856781, sexuallyActiveMenMonthEndPer: '63', monthEnd: 539772 },
                { month: '2021-10-01', sexuallyActiveMenMonthStartPer: '63', calculatedChange: '1.00', manualChange: '', sexuallyActiveMenMonthEnd: 665625, sexuallyActiveMenMonthEndPer: '64', monthEnd: 426000 },
                { month: '2021-11-01', sexuallyActiveMenMonthStartPer: '64', calculatedChange: '1.00', manualChange: '', sexuallyActiveMenMonthEnd: 672188, sexuallyActiveMenMonthEndPer: '65', monthEnd: 436922 },
                { month: '2021-12-01', sexuallyActiveMenMonthStartPer: '65', calculatedChange: '0.50', manualChange: '', sexuallyActiveMenMonthEnd: 678750, sexuallyActiveMenMonthEndPer: '66', monthEnd: 447975 },

            ],
            currentModelingType: '',
            currentCalculatorStartDate: '',
            currentCalculatorStopDate: '',
            currentCalculatorStartValue: '',
            currentEndValue: '',
            currentTargetChangePercentage: '',
            currentTargetChangeNumber: '',
            currentCalculatedMomChange: '',
            currentEndValueEdit: false,
            currentTargetChangePercentageEdit: false,
            currentTargetChangeNumberEdit: false,
            currentRowIndex: ''


        }
        this.onRemoveItem = this.onRemoveItem.bind(this);
        this.canDropItem = this.canDropItem.bind(this);
        this.onMoveItem = this.onMoveItem.bind(this);

        this.onAddButtonClick = this.onAddButtonClick.bind(this);
        this.onRemoveButtonClick = this.onRemoveButtonClick.bind(this);
        this.onHighlightChanged = this.onHighlightChanged.bind(this);
        this.onCursoChanged = this.onCursoChanged.bind(this);
        this.resetTree = this.resetTree.bind(this);

        this.dataChange = this.dataChange.bind(this);
        this.updateNodeInfoInJson = this.updateNodeInfoInJson.bind(this);
        this.nodeTypeChange = this.nodeTypeChange.bind(this);
        this.addScenario = this.addScenario.bind(this);
        this.getNodeValue = this.getNodeValue.bind(this);
        this.getNotes = this.getNotes.bind(this);
        this.calculateNodeValue = this.calculateNodeValue.bind(this);
        this.filterPlanningUnitNode = this.filterPlanningUnitNode.bind(this);
        this.filterPlanningUnitAndForecastingUnitNodes = this.filterPlanningUnitAndForecastingUnitNodes.bind(this);
        this.getForecastingUnitListByTracerCategoryId = this.getForecastingUnitListByTracerCategoryId.bind(this);
        this.getNoOfMonthsInUsagePeriod = this.getNoOfMonthsInUsagePeriod.bind(this);
        this.getNoFURequired = this.getNoFURequired.bind(this);
        this.getUsageText = this.getUsageText.bind(this);
        this.copyDataFromUsageTemplate = this.copyDataFromUsageTemplate.bind(this);
        this.getUsageTemplateList = this.getUsageTemplateList.bind(this);
        this.getNodeUnitOfPrent = this.getNodeUnitOfPrent.bind(this);
        this.getNoOfFUPatient = this.getNoOfFUPatient.bind(this);
        this.getForecastingUnitUnitByFUId = this.getForecastingUnitUnitByFUId.bind(this);
        this.getPlanningUnitListByFUId = this.getPlanningUnitListByFUId.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.calculateValuesForAggregateNode = this.calculateValuesForAggregateNode.bind(this);
        this.duplicateNode = this.duplicateNode.bind(this);
        this.getNodeTyeList = this.getNodeTyeList.bind(this);
        this.getNodeTypeFollowUpList = this.getNodeTypeFollowUpList.bind(this);
        this.getConversionFactor = this.getConversionFactor.bind(this);
        this.buildModelingJexcel = this.buildModelingJexcel.bind(this);
        this.loaded = this.loaded.bind(this);
        this.addRow = this.addRow.bind(this);
        this.loadedPer = this.loadedPer.bind(this);
        this.toggle = this.toggle.bind(this);
        this.showMomData = this.showMomData.bind(this);
        this.buildMomJexcel = this.buildMomJexcel.bind(this);
        this.buildModelingJexcelPercent = this.buildModelingJexcelPercent.bind(this);
        this.addRowJexcelPer = this.addRowJexcelPer.bind(this);
        this.buildMomJexcelPercent = this.buildMomJexcelPercent.bind(this);
        this.calculateMomByEndValue = this.calculateMomByEndValue.bind(this);
        this.calculateMomByChangeInPercent = this.calculateMomByChangeInPercent.bind(this);
        this.calculateMomByChangeInNumber = this.calculateMomByChangeInNumber.bind(this);
        this.getSameLevelNodeList = this.getSameLevelNodeList.bind(this);
        this.acceptValue = this.acceptValue.bind(this);
        this.calculateScalingTotal = this.calculateScalingTotal.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.momCheckbox = this.momCheckbox.bind(this);
        this.resetNodeData = this.resetNodeData.bind(this);
    }
    resetNodeData() {
        console.log("reset node data function called");
        const { orgCurrentItemConfig, currentItemConfig } = this.state;
        currentItemConfig.context = JSON.parse(JSON.stringify(orgCurrentItemConfig));
        console.log("============1============", orgCurrentItemConfig);
        this.setState({
            currentItemConfig
        }, () => {
            console.log("currentItemConfig after---", this.state.orgCurrentItemConfig)
        });
    }
    momCheckbox(e) {
        var checked = e.target.checked;
        if (e.target.name === "manualChange") {
            this.setState({
                manualChange: e.target.checked == true ? true : false
            }, () => {

                console.log('manual change---', this.state.manualChange);
            });
        } else if (e.target.name === "seasonality") {
            this.setState({
                seasonality: e.target.checked == true ? true : false
            }, () => {
                if (this.state.momEl != "") {
                    if (checked) {
                        this.state.momEl.showColumn(3);
                        this.state.momEl.showColumn(4);
                        this.state.momEl.showColumn(5);
                    } else {
                        this.state.momEl.hideColumn(3);
                        this.state.momEl.hideColumn(4);
                        this.state.momEl.hideColumn(5);
                    }
                }
                console.log('seasonality---', this.state.seasonality);
            });
        }
    }
    formSubmit() {
        var validation = this.checkValidation();
        if (validation == true) {
            // this.setState({
            //     loading: true
            // })
            var tableJson = this.el.getJson(null, false);
            var data = this.state.scalingList;
            var obj;
            var items = this.state.items;
            var item = items.filter(x => x.id == this.state.currentItemConfig.context.id)[0];
            const itemIndex1 = items.findIndex(o => o.id === this.state.currentItemConfig.context.id);
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("10 map---" + map1.get("10"))
                if (parseInt(map1.get("10")) === 1) {
                    if (map1.get("9") != "" && map1.get("9") != 0) {
                        obj = data.filter(x => x.nodeDataModelingId == map1.get("9"))[0];
                        obj.transferNodeDataId = map1.get("0");
                        obj.notes = map1.get("1");
                        obj.modelingType.id = map1.get("2");
                        obj.startDate = map1.get("3");
                        obj.stopDate = map1.get("4");
                        obj.dataValue = map1.get("2") == 2 ? map1.get("6") : map1.get("5");
                        obj.nodeDataModelingId = map1.get("9")
                        const itemIndex = data.findIndex(o => o.nodeDataModelingId === map1.get("9"));
                        data[itemIndex] = obj;
                    } else {
                        obj = {
                            transferNodeDataId: map1.get("0"),
                            notes: map1.get("1"),
                            modelingType: {
                                id: map1.get("2")
                            },
                            startDate: map1.get("3"),
                            stopDate: map1.get("4"),
                            dataValue: map1.get("2") == 2 ? map1.get("6") : map1.get("5"),
                            nodeDataModelingId: ''
                        }
                        data.push(obj);
                    }
                    console.log("obj---", obj);
                    console.log("data--->>>", data);
                    (item.payload.nodeDataMap[0])[0].nodeDataModelingList = data;
                    console.log("item---", item);
                    items[itemIndex1] = item;
                    console.log("items---", items);
                    // Call function by dolly
                    this.setState({
                        items,
                        scalingList: data,
                        openAddNodeModal: false,
                        activeTab1: new Array(2).fill('1')
                    });
                }
            }
        }
    }
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(10, y);
            if (parseInt(value) == 1) {

                //Modeling type
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

                // Start date
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var startDate = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var stopDate = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");

                // Stop date
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(4, y);
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

                var elInstance = this.state.modelingEl;
                var rowData = elInstance.getRowData(y);
                console.log("modelingTypeId-valid--", rowData[2])
                if (rowData[2] != "") {
                    var reg = JEXCEL_DECIMAL_NO_REGEX_LONG;

                    // Month change %
                    if (rowData[2] != 2) {
                        var col = ("F").concat(parseInt(y) + 1);
                        var value = this.el.getValueFromCoords(5, y);
                        if (value == "") {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        }
                        else if (!(reg.test(value))) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                            valid = false;
                        }
                        else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }

                    // Month change #
                    if (rowData[2] == 2) {
                        var col = ("G").concat(parseInt(y) + 1);
                        var value = this.el.getValueFromCoords(6, y);
                        if (value == "") {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        }
                        else if (!(reg.test(value))) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                            valid = false;
                        }
                        else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }

                }

            }
        }
        return valid;
    }
    calculateScalingTotal() {
        var scalingTotal = 0;
        var tableJson = this.state.modelingEl.getJson(null, false);
        for (var i = 0; i < tableJson.length; i++) {
            var map1 = new Map(Object.entries(tableJson[i]));
            if (map1.get("8") != "") {
                scalingTotal = scalingTotal + parseFloat(map1.get("8"));
                console.log("map1.get(8)---", map1.get("8"));
            }
        }
        console.log("scalingTotal---", scalingTotal);
        this.setState({
            scalingTotal
        });
    }
    acceptValue() {
        // console.log(">>>>", this.state.currentRowIndex);
        var elInstance = this.state.modelingEl;
        if (this.state.currentItemConfig.context.payload.nodeType.id == 3) {
            if (this.state.currentModelingType == 5) {
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(2), true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(2), true);
            }
        } else {
            if (this.state.currentModelingType == 2) {
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, this.state.currentTargetChangeNumber, true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, this.state.currentCalculatedMomChange, true);
            } else if (this.state.currentModelingType == 3) {
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, this.state.currentTargetChangePercentage, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, this.state.currentCalculatedMomChange, true);
            } else if (this.state.currentModelingType == 4) {
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, this.state.currentTargetChangePercentage, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, this.state.currentCalculatedMomChange, true);
            }
        }

    }
    calculateMomByEndValue(e) {
        this.setState({
            // currentEndValue: '',
            currentCalculatedMomChange: '',
            currentTargetChangeNumber: '',
            currentTargetChangePercentage: '',
        });
        var startDate = this.state.currentCalculatorStartDate;
        var endDate = this.state.currentCalculatorStopDate;
        // moment(c.expectedDeliveryDate).add(parseInt(typeProblemList[prob].data1), 'days').format('YYYY-MM-DD') < moment(myDateShipment).format('YYYY-MM-DD')
        var monthDifference = moment(endDate).startOf('month').diff(startDate, 'months', true);
        console.log("month diff>>>", monthDifference);
        var momValue = ''
        var getValue = e.target.value;
        // console.log("hi>>",this.state.currentItemConfig.context.payload.nodeType.id,",",this.state.currentModelingType);
        // if (this.state.currentItemConfig.context.payload.nodeType.id == 3) {
        //     // var getPervalue = parseFloat(this.state.currentCalculatorStartValue * e.target.value / 100);
        //     // getValue = getPervalue;
        //     var momValue = e.target.value - (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue;
        // } else {
        //     getValue = e.target.value
        // }
        if (this.state.currentModelingType == 2) {
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue)) / monthDifference).toFixed(2);
        }
        if (this.state.currentModelingType == 3) {
            if (this.state.currentItemConfig.context.payload.nodeType.id == 3) {
                var getChangeInPercent = (parseFloat(e.target.value - (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue) / monthDifference).toFixed(2);
                var momValue = ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue * getChangeInPercent / 100).toFixed(2);
                // console.log("getChangeInPercent>>>",getChangeInPercent);
                // console.log("momValue>>>",momValue)
            } else {
                // var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue)) / monthDifference / this.state.currentCalculatorStartValue * 100).toFixed(2);
                var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue)) / monthDifference).toFixed(2);
            }
        }
        if (this.state.currentModelingType == 4) {
            // var momValue = ((Math.pow(parseFloat(getValue / this.state.currentCalculatorStartValue), parseFloat(1 / monthDifference)) - 1) * 100).toFixed(2);
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue)) / monthDifference).toFixed(2);
        }

        if (this.state.currentModelingType == 5) {
            var momValue = (parseFloat(e.target.value - (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue) / monthDifference).toFixed(2);
        }
        // console.log("getmomValue>>>", momValue);
        var targetChangeNumber = '';
        var targetChangePer = '';
        if (this.state.currentItemConfig.context.payload.nodeType.id != 3) {
            targetChangeNumber = parseFloat(getValue - this.state.currentCalculatorStartValue).toFixed(2);
            targetChangePer = (parseFloat(targetChangeNumber / this.state.currentCalculatorStartValue) * 100).toFixed(2);
        }
        this.setState({
            currentTargetChangeNumber: e.target.value != '' ? targetChangeNumber : '',
            currentTargetChangePercentage: e.target.value != '' ? targetChangePer : '',
            currentCalculatedMomChange: e.target.value != '' ? momValue : ''
        });
    }
    calculateMomByChangeInPercent(e) {
        this.setState({
            currentEndValue: '',
            currentCalculatedMomChange: '',
            currentTargetChangeNumber: ''
        });
        var startDate = this.state.currentCalculatorStartDate;
        var endDate = this.state.currentCalculatorStopDate;
        var monthDifference = moment(endDate).diff(startDate, 'months', true);
        var getEndValueFromPercentage = (this.state.currentCalculatorStartValue * e.target.value) / 100;


        // if (this.state.currentItemConfig.context.payload.nodeType.id == 3) {
        //     var targetEndValue = (parseFloat(getEndValueFromPercentage) + parseFloat(this.state.currentCalculatorStartValue)) / this.state.currentCalculatorStartValue * 100;
        // } else {
        var targetEndValue = parseFloat(this.state.currentCalculatorStartValue + getEndValueFromPercentage).toFixed(2);
        // }

        var momValue = ''
        if (this.state.currentModelingType == 2) {
            // var momValue = ((parseFloat(targetEndValue - this.state.currentCalculatorStartValue)) / monthDifference).toFixed(2);
            var momValue = ((parseFloat((this.state.currentCalculatorStartValue * e.target.value) / 100))).toFixed(2);
        }
        if (this.state.currentModelingType == 3) {
            if (this.state.currentItemConfig.context.payload.nodeType.id == 3) {
                var getChangeInPercent = e.target.value;
                var momValue = ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue * getChangeInPercent / 100).toFixed(2);
            } else {
                // var momValue = ((parseFloat(targetEndValue - this.state.currentCalculatorStartValue)) / monthDifference / this.state.currentCalculatorStartValue * 100).toFixed(2);
                var momValue = ((parseFloat((this.state.currentCalculatorStartValue * e.target.value) / 100))).toFixed(2);
            }

        }
        if (this.state.currentModelingType == 4) {
            // var momValue = ((Math.pow(parseFloat(targetEndValue / this.state.currentCalculatorStartValue), parseFloat(1 / monthDifference)) - 1) * 100).toFixed(2);
            var momValue = ((parseFloat((this.state.currentCalculatorStartValue * e.target.value) / 100))).toFixed(2);

        }
        if (this.state.currentModelingType == 5) {
            var momValue = (parseFloat(e.target.value)).toFixed(2);
        }

        this.setState({
            currentEndValue: (e.target.value != '' && this.state.currentModelingType != 3 && this.state.currentModelingType != 5) ? targetEndValue : '',
            currentCalculatedMomChange: e.target.value != '' ? momValue : ''
        });
    }
    calculateMomByChangeInNumber(e) {
        this.setState({
            currentEndValue: '',
            currentCalculatedMomChange: '',
            currentTargetChangePercentage: '',
        });
        var startDate = this.state.currentCalculatorStartDate;
        var endDate = this.state.currentCalculatorStopDate;
        var monthDifference = moment(endDate).diff(startDate, 'months', true);
        // var getEndValueFromNumber = parseFloat(this.state.currentCalculatorStartValue) + parseFloat(e.target.value);
        var targetEndValue = parseFloat(this.state.currentCalculatorStartValue) + parseFloat(e.target.value);

        var momValue = ''
        if (this.state.currentModelingType == 2) {
            // momValue = ((parseFloat(targetEndValue - this.state.currentCalculatorStartValue)) / monthDifference).toFixed(2);
            momValue = e.target.value;
        }
        if (this.state.currentModelingType == 3) {
            // momValue = ((parseFloat(targetEndValue - this.state.currentCalculatorStartValue)) / monthDifference / this.state.currentCalculatorStartValue * 100).toFixed(2);
            momValue = e.target.value;
        }
        if (this.state.currentModelingType == 4) {
            // momValue = ((Math.pow(parseFloat(targetEndValue / this.state.currentCalculatorStartValue), parseFloat(1 / monthDifference)) - 1) * 100).toFixed(2);
            momValue = e.target.value;
        }
        this.setState({
            currentEndValue: e.target.value != '' ? targetEndValue.toFixed(2) : '',
            currentCalculatedMomChange: e.target.value != '' ? momValue : ''
        });
    }



    getPayloadData(itemConfig, type) {
        console.log("inside get payload");
        console.log("This.state in getpayload data+++", this.state.items);
        var data = [];
        data = itemConfig.payload.nodeDataMap;
        console.log("itemConfig---", data);
        var curMonth = moment().format("YYYY-MM");
        // console.log("cur date ---", itemConfig.payload.nodeDataMap[0]);
        // for (var i = 0; i < data.length; i++) {
        // var month = moment(data[i].month).format("YYYY-MM");
        // console.log("month---");
        // }
        console.log("data---", data);
        console.log("Type+++", type)
        if (data != null && data[0] != null && (data[0])[0] != null) {
            if (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2) {
                if (type == 1) {
                    return addCommas((itemConfig.payload.nodeDataMap[0])[0].dataValue);
                } else if (type == 3) {
                    var childList = this.state.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                    console.log("Child List+++", childList);
                    if (childList.length > 0) {
                        var sum = 0;
                        childList.map(c => {
                            sum += Number((c.payload.nodeDataMap[0])[0].dataValue)
                        })
                        return sum;
                    } else {
                        return "";
                    }
                } else {
                    return "";
                }
            } else {
                if (type == 1) {
                    return (itemConfig.payload.nodeDataMap[0])[0].dataValue + "% of parent";
                } else if (type == 3) {
                    var childList = this.state.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                    console.log("Child List+++", childList);
                    if (childList.length > 0) {
                        var sum = 0;
                        childList.map(c => {
                            sum += Number((c.payload.nodeDataMap[0])[0].dataValue)
                        })
                        return sum;
                    } else {
                        return "";
                    }
                } else {
                    return "= " + ((itemConfig.payload.nodeDataMap[0])[0].calculatedDataValue != null ? addCommas((itemConfig.payload.nodeDataMap[0])[0].calculatedDataValue) : "");
                }
            }
        } else {
            return "";
        }
    }

    getSameLevelNodeList(level, id) {
        console.log("level---", level);
        console.log("id---", id);
        var sameLevelNodeList = [];
        var arr = this.state.items.filter(x => x.level == level && x.id != id && x.id > id);
        console.log("arr---", arr);
        for (var i = 0; i < arr.length; i++) {
            sameLevelNodeList[i] = { id: arr[i].id, name: getLabelText(arr[i].payload.label, this.state.lang) }
        }
        this.setState({
            sameLevelNodeList
        });
    }

    toggle() {
        this.setState({
            popoverOpen: !this.state.popoverOpen,
        });
    }

    showMomData() {
        if (this.state.currentItemConfig.context.payload.nodeType.id == 3) {
            this.setState({ showMomDataPercent: true }, () => {
                this.buildMomJexcelPercent();
            });
        } else {
            this.setState({ showMomData: true }, () => {
                this.buildMomJexcel();
            });
        }
    }
    showMomDataPercent() {

    }
    buildMomJexcelPercent() {
        var momList = this.state.momListPer;
        var dataArray = [];
        let count = 0;
        for (var j = 0; j < momList.length; j++) {
            data = [];
            data[0] = momList[j].month
            if (j == 0) {
                data[1] = momList[j].sexuallyActiveMenMonthStartPer
            } else {
                data[1] = `=E${parseInt(j)}`
            }
            data[2] = momList[j].calculatedChange
            data[3] = momList[j].manualChange
            data[4] = `=B${parseInt(j) + 1}+C${parseInt(j) + 1}+D${parseInt(j) + 1}`
            data[5] = momList[j].sexuallyActiveMenMonthEnd
            data[6] = `=ROUND(((E${parseInt(j) + 1}*F${parseInt(j) + 1})/100),0)`
            dataArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("momJexcelPer"), '');
        this.el.destroy();
        var data = dataArray;
        console.log("DataArray>>>", dataArray);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 120, 60, 80, 150, 100, 110, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Month',
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                },
                {
                    title: "% of Sexually active men (Month Start)",
                    type: 'text',
                    readOnly: true

                },
                {
                    title: "Calculated Change (+/- %)",
                    type: 'text',
                    readOnly: true
                },
                {
                    title: "Manual Change (+/- %)",
                    type: 'text',

                },
                {
                    title: "% of Sexually active men (Month End)",
                    type: 'text',
                    readOnly: true
                },
                {
                    title: "Sexually active men (Month End)",
                    type: 'text',
                    readOnly: true

                },
                {
                    title: "Men who use condoms (Month End)",
                    type: 'text',
                    readOnly: true
                }

            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loadedMomPer,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            // oneditionend: this.onedit,
            // onselection: this.selected,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,

        };
        var momElPer = jexcel(document.getElementById("momJexcelPer"), options);
        this.el = momElPer;
        this.setState({
            momElPer: momElPer
        }
        );
    };

    loadedMomPer = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
    }

    buildMomJexcel() {
        var momList = this.state.momList;
        var dataArray = [];
        let count = 0;
        for (var j = 0; j < momList.length; j++) {
            data = [];
            data[0] = momList[j].month
            data[1] = momList[j].monthStartNoSeasonality
            data[2] = momList[j].calculatedChange
            data[3] = momList[j].monthEndNoSeasonality
            data[4] = momList[j].seasonalityIndex
            data[5] = momList[j].manualChange
            data[6] = momList[j].monthEnd
            dataArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("momJexcel"), '');
        this.el.destroy();
        var data = dataArray;
        console.log("DataArray>>>", dataArray);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [50, 80, 80, 80, 80, 80, 80, 80, 80],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Month',
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                },
                {
                    title: "Month Start (no seasonality)",
                    type: 'text',
                    readOnly: true

                },
                {
                    title: "Calculated change (+/-)",
                    type: 'text',
                    readOnly: true
                },
                {
                    title: "Monthly End (no seasonality)",
                    type: 'text',
                    readOnly: true
                },
                {
                    title: "Seasonality index",
                    type: this.state.seasonality == true ? 'text' : 'hidden',
                },
                {
                    title: "Manual Change (+/-)",
                    type: this.state.seasonality == true ? 'text' : 'hidden',

                },
                {
                    title: "Month End",
                    type: 'text',
                    readOnly: true
                }

            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loadedMom,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el.jexcel;
                if (y != null) {
                    var rowData = elInstance.getRowData(y);
                    // console.log("this.state.seasonality---", this.state.seasonality);
                    // if (this.state.seasonality) {
                    //     if (x == 5) {
                    //         // cell.classList.add('readonly');
                    //         // cell.style.readOnly = 'true';
                    //         cell.style.backgroundColor = '#fff';
                    //         // $(cell).addClass('readonly');
                    //     }
                    // }
                    // else {
                    //     if (x == 5) {
                    //         // cell.classList.add('readonly');
                    //         // cell.style.readOnly = 'true';
                    //         cell.style.backgroundColor = '#f46e42';
                    //         // $(cell).addClass('readonly');
                    //     }
                    // }
                }
            }.bind(this),
            // oneditionend: this.onedit,
            // onselection: this.selected,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,

        };
        var momEl = jexcel(document.getElementById("momJexcel"), options);
        this.el = momEl;
        this.setState({
            momEl: momEl
        }
        );
    };

    loadedMom = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
    }

    addRow = function () {
        var elInstance = this.state.modelingEl;
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = cleanUp;
        data[8] = "";
        data[9] = "";
        data[10] = 1;
        elInstance.insertRow(
            data, 0, 1
        );
    };
    addRowJexcelPer() {
        var elInstance = this.state.modelingPerEl;
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        elInstance.insertRow(
            data, 0, 1
        );
    }
    buildModelingJexcel() {
        var scalingList = this.state.scalingList;
        console.log("scalingList---", scalingList);
        console.log("scalingList length---", scalingList.length);
        var dataArray = [];
        let count = 0;

        if (scalingList.length == 0) {
            data = [];
            data[0] = ''
            data[1] = ''
            data[2] = ''
            data[3] = this.state.minMonth
            data[4] = this.state.maxMonth
            data[5] = ''
            data[6] = ''
            data[7] = cleanUp
            data[8] = ''
            data[9] = ''
            data[10] = ''
            dataArray[count] = data;
            count++;
        }
        var scalingTotal = 0;
        for (var j = 0; j < scalingList.length; j++) {
            data = [];
            data[0] = scalingList[j].transferNodeDataId
            data[1] = scalingList[j].notes
            console.log("modeling type---", scalingList[j].modelingType.id);
            data[2] = scalingList[j].modelingType.id
            data[3] = scalingList[j].startDate
            data[4] = scalingList[j].stopDate
            data[5] = scalingList[j].modelingType.id != 2 ? parseFloat(scalingList[j].dataValue).toFixed(2) : ''
            data[6] = scalingList[j].modelingType.id == 2 ? parseFloat(scalingList[j].dataValue).toFixed(2) : ''
            data[7] = cleanUp
            var nodeValue = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue;
            var calculatedChangeForMonth;
            if (scalingList[j].modelingType.id == 2 || scalingList[j].modelingType.id == 5) {
                calculatedChangeForMonth = scalingList[j].dataValue;
            } else if (scalingList[j].modelingType.id == 3 || scalingList[j].modelingType.id == 4) {
                calculatedChangeForMonth = (nodeValue * scalingList[j].dataValue) / 100;
            }
            data[8] = parseFloat(calculatedChangeForMonth).toFixed(2)
            data[9] = scalingList[j].nodeDataModelingId
            data[10] = 0
            scalingTotal = scalingTotal + calculatedChangeForMonth;
            dataArray[count] = data;
            count++;
        }
        this.setState({ scalingTotal });
        this.el = jexcel(document.getElementById("modelingJexcel"), '');
        this.el.destroy();
        var data = dataArray;
        console.log("DataArray>>>", dataArray);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [90, 150, 80, 80, 90, 90, 90, 90, 90],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Transfer to node',
                    type: 'dropdown',
                    source: this.state.sameLevelNodeList
                },
                {
                    title: "Note",
                    type: 'text',

                },
                {
                    title: 'Modeling type',
                    type: 'dropdown',
                    source: this.state.filteredModelingType
                },
                {
                    title: 'Start Date',
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [this.state.minMonth, this.state.maxMonth] }, width: 100
                },
                {
                    title: 'Stop Date',
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [this.state.minMonth, this.state.maxMonth] }, width: 100
                },
                {
                    title: "Monthly Change (%)",
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                },
                {
                    title: "Monthly Change (#)",
                    type: this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'numeric' : 'hidden',
                    mask: '#,##'
                },
                {
                    title: "Modeling Calculater",
                    type: 'image',
                },
                {
                    title: "Calculated change for month",
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: 'nodeDataModelingId',
                    type: 'hidden'
                },
                {
                    title: 'isChanged',
                    type: 'hidden'
                },

            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
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
            onchange: this.changed,
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el.jexcel;
                if (y != null) {
                    var rowData = elInstance.getRowData(y);
                    if (rowData[2] != "") {
                        if (rowData[2] == 2) {
                            var cell = elInstance.getCell(("G").concat(parseInt(y) + 1))
                            cell.classList.remove('readonly');
                            cell = elInstance.getCell(("F").concat(parseInt(y) + 1))
                            cell.classList.add('readonly');
                            // elInstance.hideIndex(6);
                        } else {
                            var cell = elInstance.getCell(("G").concat(parseInt(y) + 1))
                            cell.classList.add('readonly');
                            cell = elInstance.getCell(("F").concat(parseInt(y) + 1))
                            cell.classList.remove('readonly');
                            // elInstance.showIndex(6);
                        }
                    } else {
                        var cell = elInstance.getCell(("G").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        cell = elInstance.getCell(("F").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }
                    if (rowData[3] != "" && moment(this.state.minMonth).diff(moment(rowData[3]), 'months') == 0) {
                        var cell = elInstance.getCell(("D").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("D").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }

                }
            }.bind(this),
            oneditionend: this.onedit,
            onselection: this.selected,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,

        };
        var modelingEl = jexcel(document.getElementById("modelingJexcel"), options);
        this.el = modelingEl;
        this.setState({
            modelingEl: modelingEl
        }
        );
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    selected = function (instance, cell, x, y, value) {
        if (y == 7) {
            this.setState({
                currentRowIndex: '',
                showCalculatorFields: '',
                currentModelingType: '',
                currentCalculatorStartDate: '',
                currentCalculatorStopDate: '',
                currentCalculatorStartValue: '',
            }, () => {
                console.log("x row data===>", this.el.getRowData(x));
                var elInstance = this.state.modelingEl;
                var rowData = elInstance.getRowData(x);
                this.setState({
                    currentRowIndex: x,
                    showCalculatorFields: true,
                    currentModelingType: rowData[2],
                    currentCalculatorStartDate: rowData[3],
                    currentCalculatorStopDate: rowData[4],
                    currentCalculatorStartValue: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue,

                    currentCalculatedMomChange: '',
                    currentTargetChangeNumber: '',
                    currentTargetChangeNumberEdit: false,
                    currentTargetChangePercentage: '',
                    currentTargetChangePercentageEdit: false,
                    currentEndValue: '',
                    currentEndValueEdit: false
                });
            })

        }
    }.bind(this)
    changed = function (instance, cell, x, y, value) {
        //Modeling type
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
        // Start date
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);

            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
            this.state.modelingEl.setValueFromCoords(4, y, '', true);
        }
        var startDate = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        var stopDate = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        // Stop date
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
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
        var elInstance = this.state.modelingEl;
        var rowData = elInstance.getRowData(y);
        console.log("modelingTypeId-3--", rowData[2])
        if (rowData[2] != "") {
            var reg = JEXCEL_DECIMAL_NO_REGEX_LONG;
            var monthDifference = moment(stopDate).diff(startDate, 'months', true);
            var nodeValue = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue;
            var calculatedChangeForMonth;
            // Monthly change %
            if (x == 5 && rowData[2] != 2) {
                var col = ("F").concat(parseInt(y) + 1);

                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                }
                else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                }
                else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    if (rowData[2] != 5) {
                        calculatedChangeForMonth = parseFloat((nodeValue * value) / 100).toFixed(2);
                    } else {
                        calculatedChangeForMonth = parseFloat(value).toFixed();
                    }
                    this.state.modelingEl.setValueFromCoords(8, y, calculatedChangeForMonth, true);
                }
            }
            // Monthly change #
            if (x == 6 && rowData[2] == 2) {
                var col = ("G").concat(parseInt(y) + 1);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                }
                else if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                }
                else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.state.modelingEl.setValueFromCoords(8, y, parseFloat(value).toFixed(2), true);
                }
            }
        }
        if (x != 10) {
            this.el.setValueFromCoords(10, y, 1, true);
        }
        this.calculateScalingTotal();
    }.bind(this);
    buildModelingJexcelPercent() {
        var scalingList = this.state.scalingList;
        // [
        //     { transferToNode: 1, note: 'Growth', modelingType: 2, startDate: '2021-01-01', stopDate: '2021-12-01', percent: '12.0%', period: 1, calculatedChangeFormonth: '1.0%' },
        //     { transferToNode: 1, note: 'Lost to follow up', modelingType: 2, startDate: '2022-01-01', stopDate: '2022-06-01', percent: '3.0%', period: 2, calculatedChangeFormonth: '0.0%' },
        //     { transferToNode: 1, note: 'Lost to death', modelingType: 2, startDate: '2022-06-01', stopDate: '2022-12-01', percent: '0.3%', period: 4, calculatedChangeFormonth: '0.0%' },
        //     // { transferToNode: 1, note: 'Lost to 3L', modelingType: 2, startDate: '2021-01-01', stopDate: '2023-12-01', monthlyChangePer: -0.3, monthlyChangeNo: '', calculator: '', calculatedChangeFormonth: 4000 },
        //     // { transferToNode: 1, note: 'Transfer from 1L', modelingType: 2, startDate: '2021-01-01', stopDate: '2023-12-01', monthlyChangePer: '', monthlyChangeNo: 2000, calculator: '', calculatedChangeFormonth: 4995 },
        // ]
        var dataArray = [];
        let count = 0;
        for (var j = 0; j < scalingList.length; j++) {
            data = [];
            data[0] = scalingList[j].transferToNode
            data[1] = scalingList[j].note
            data[2] = scalingList[j].modelingType
            data[3] = scalingList[j].startDate
            data[4] = scalingList[j].stopDate
            data[5] = scalingList[j].percent
            data[6] = scalingList[j].period
            data[7] = scalingList[j].calculatedChangeFormonth
            dataArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("modelingJexcelPercent"), '');
        this.el.destroy();
        var data = dataArray;
        console.log("DataArray>>>", dataArray);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 120, 60, 80, 150, 100, 110, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Transfer to node',
                    type: 'dropdown',
                    source: this.state.sameLevelNodeList
                },
                {
                    title: "Note",
                    type: 'text',

                },
                {
                    title: 'Modeling type',
                    type: 'dropdown',
                    source: this.state.modelingTypeList
                },
                {
                    title: 'Start Date',
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                },
                {
                    title: 'Stop Date',
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                },
                {
                    title: "(%)",
                    type: 'text',
                },
                {
                    title: "Period",
                    type: 'dropdown',
                    source: [
                        { id: 1, name: "Every year" },
                        { id: 2, name: "Every 6 months" },
                        { id: 3, name: "Every quarter" },
                        { id: 4, name: "Every month" },
                    ]
                },
                {
                    title: "Calculated change for month",
                    type: 'text',
                    readOnly: true
                }

            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loadedPer,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            // oneditionend: this.onedit,
            // onselection: this.selected,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,

        };
        var modelingPerEl = jexcel(document.getElementById("modelingJexcelPercent"), options);
        this.el = modelingPerEl;
        this.setState({
            modelingPerEl: modelingPerEl
        }
        );
    }
    loadedPer = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    getConversionFactor(planningUnitId) {
        console.log("planningUnitId cf ---", planningUnitId);
        var pu = (this.state.planningUnitList.filter(c => c.planningUnitId == planningUnitId))[0];
        console.log("pu---", pu)
        // (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id = event.target.value;
        this.setState({
            conversionFactor: pu.multiplier
        });
    }

    getNodeTypeFollowUpList(nodeTypeId) {
        console.log("get node type follow up list---", nodeTypeId);
        var nodeType;
        var nodeTypeList = [];
        if (nodeTypeId != 0) {
            nodeType = this.state.nodeTypeList.filter(c => c.id == nodeTypeId)[0];
            console.log("node type obj--->", nodeType);
            for (let i = 0; i < nodeType.allowedChildList.length; i++) {
                console.log("allowed value---", nodeType.allowedChildList[i]);
                var obj = this.state.nodeTypeList.filter(c => c.id == nodeType.allowedChildList[i])[0];
                nodeTypeList.push(obj);
            }
            console.log("final nodeTypeList---", nodeTypeList);
        } else {
            nodeType = this.state.nodeTypeList.filter(c => c.id == 1)[0];
            nodeTypeList.push(nodeType);
            nodeType = this.state.nodeTypeList.filter(c => c.id == 2)[0];
            nodeTypeList.push(nodeType);
        }
        this.setState({
            nodeTypeFollowUpList: nodeTypeList
        }, () => {
            // if (nodeTypeList.length == 1) {
            //     const currentItemConfig = this.state.currentItemConfig;
            //     currentItemConfig.context.payload.nodeType.id = nodeTypeList[0].id;

            //     this.setState({
            //         currentItemConfig: currentItemConfig
            //     }, () => {
            //         this.nodeTypeChange(nodeTypeList[0].id);
            //     })
            // } else {
            //     const currentItemConfig = this.state.currentItemConfig;
            //     currentItemConfig.context.payload.nodeType.id = "";

            //     this.setState({
            //         currentItemConfig: currentItemConfig

            //     }, () => {

            //     })
            // }
        });
    }

    getNodeTyeList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['nodeType'], 'readwrite');
            var program = transaction.objectStore('nodeType');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                this.setState({
                    nodeTypeList: myResult
                });
                for (var i = 0; i < myResult.length; i++) {
                    console.log("node type--->", myResult[i])

                }

            }.bind(this);
        }.bind(this);
    }

    duplicateNode(itemConfig) {
        console.log("duplicate node called---", this.state.currentItemConfig);
        const { items } = this.state;
        var newItem = {
            id: parseInt(items.length + 1),
            level: itemConfig.level,
            parent: itemConfig.parent,
            payload: itemConfig.payload
        };
        console.log("add button clicked value after update---", newItem);
        this.setState({
            items: [...items, newItem],
            cursorItem: parseInt(items.length + 1)
        }, () => {
            console.log("on add items-------", this.state.items);
            this.calculateValuesForAggregateNode(this.state.items);
        });
    }
    cancelClicked() {
        this.props.history.push(`/dataset/listTreeTemplate/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }


    getPlanningUnitListByFUId(forecastingUnitId) {
        console.log("forecastingUnitId---", forecastingUnitId);
        PlanningUnitService.getActivePlanningUnitListByFUId(forecastingUnitId).then(response => {
            console.log("response---", response.data)
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });

            this.setState({
                planningUnitList: listArray
            }, () => {
                console.log(" get uasge template--------------", response.data);
                if (this.state.currentItemConfig.context.payload.nodeType.id == 5) {
                    var conversionFactor = this.state.planningUnitList.filter(x => x.planningUnitId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id)[0].multiplier;
                    this.setState({
                        conversionFactor
                    }, () => {
                        this.getUsageText();
                    });
                } else {
                    console.log("noOfMonthsInUsagePeriod---", this.state.noOfMonthsInUsagePeriod);
                }
                // const { currentItemConfig } = this.state;
                // (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id = (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id;
                // (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id = (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id;
                // this.setState({
                //     currentItemConfig
                // })
            })
        })
            .catch(
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

    getForecastingUnitUnitByFUId(forecastingUnitId) {
        console.log("forecastingUnitId---", forecastingUnitId);
        const { currentItemConfig } = this.state;
        var forecastingUnit = (this.state.forecastingUnitList.filter(c => c.forecastingUnitId == forecastingUnitId))[0];
        console.log("forecastingUnit---", forecastingUnit);
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id = forecastingUnit.unit.id;
        console.log("currentItemConfig---", currentItemConfig);
        this.setState({
            currentItemConfig
        });
    }

    getNoOfFUPatient() {
        console.log("no of fu------", (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson);
        console.log("no of person---", (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons);
        var noOfFUPatient;
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
            noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
        } else {
            console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode);
            noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
        }
        console.log("noOfFUPatient---", noOfFUPatient);
        this.setState({
            noOfFUPatient
        }, () => {
            console.log("state update fu--->", this.state.noOfFUPatient)
        })
    }
    getNodeUnitOfPrent() {
        var id;
        console.log("obj------->>>>", this.state.currentItemConfig);
        // if (this.state.addNodeFlag) {
        id = this.state.currentItemConfig.parentItem.payload.nodeUnit.id;
        // } else {
        //     id = this.state.currentItemConfig.context.payload.nodeUnit.id;

        // }
        this.setState({
            usageTypeParent: id
        }, () => {
            console.log("parent unit id===", this.state.usageTypeParent);
        });
    }
    getUsageTemplateList(tcId) {
        console.log(" get uasge template--------------", this.state.currentItemConfig);
        var tracerCategoryId = tcId;
        console.log("tracerCategoryId---", tracerCategoryId);
        // var forecastingUnitId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id;
        // console.log("forecastingUnitId---", forecastingUnitId);
        // var usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id;
        // console.log("usageTypeId---", usageTypeId);
        UsageTemplateService.getUsageTemplateListForTree((tracerCategoryId != "" ? tracerCategoryId : 0)).then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                usageTemplateList: listArray
            }, () => {
                console.log(" get uasge template--------------", response.data);
            })
        })
            .catch(
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

    copyDataFromUsageTemplate(event) {
        var usageTemplate = (this.state.usageTemplateList.filter(c => c.usageTemplateId == event.target.value))[0];
        console.log("usageTemplate---", usageTemplate);
        const { currentItemConfig } = this.state;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.lagInMonths = usageTemplate.lagInMonths;
        (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons = usageTemplate.noOfPatients;
        (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson = usageTemplate.noOfForecastingUnits;
        (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency = usageTemplate.usageFrequencyCount;
        (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId = usageTemplate.usageFrequencyUsagePeriod != null ? usageTemplate.usageFrequencyUsagePeriod.usagePeriodId : '';
        (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id = usageTemplate.unit.id;
        if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
            (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage = usageTemplate.oneTimeUsage;
            (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount = usageTemplate.repeatCount;
            (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId = usageTemplate.repeatUsagePeriod.usagePeriodId;
        }
        this.setState({ currentItemConfig }, () => {
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getNoOfFUPatient();
            this.getUsageText();
        });

    }
    getNoFURequired() {
        var usagePeriodId;
        var usageTypeId;
        var usageFrequency;
        var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
            console.log("usageFrequency---", usageFrequency);
        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
            console.log("usageFrequency---", usageFrequency);
        }
        console.log("usagePeriodId dis---", usagePeriodId);
        var noOfMonthsInUsagePeriod = 0;
        if (usagePeriodId != null && usagePeriodId != "") {
            var convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
            console.log("convertToMonth dis---", convertToMonth);
            console.log("repeat count---", (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount);
            console.log("no of month dis---", this.getNoOfMonthsInUsagePeriod());

            if (usageTypeId == 2) {
                var div = (convertToMonth * usageFrequency);
                console.log("duv---", div);
                if (div != 0) {
                    noOfMonthsInUsagePeriod = 1 / (convertToMonth * usageFrequency);
                    console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
                }
            } else {
                // var noOfFUPatient = this.state.noOfFUPatient;
                // var convertToMontRepeat = (this.state.usagePeriodList.filter(c => c.usagePeriodId == document.getElementById("repeatUsagePeriodId").value))[0].convertToMonth;
                var noOfFUPatient;
                if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                    noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
                } else {
                    console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode);
                    noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
                }
                console.log("no of fu patient---", noOfFUPatient);
                noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
                console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
            }
            // console.log("convertToMontRepeat>>>", convertToMontRepeat);
            // console.log(">>>", (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount);
            // console.log(">>>", noOfMonthsInUsagePeriod);
            var noFURequired = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount / (convertToMonth * noOfMonthsInUsagePeriod);
            console.log("noFURequired---", noFURequired);
            this.setState({
                noFURequired
            });
        }
    }

    getNoOfMonthsInUsagePeriod() {
        var usagePeriodId;
        var usageTypeId;
        var usageFrequency;
        var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
            console.log("usageFrequency---", usageFrequency);
        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
            console.log("usageFrequency---", usageFrequency);
        }
        var noOfMonthsInUsagePeriod = 0;
        if (usagePeriodId != null && usagePeriodId != "") {
            var convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
            console.log("convertToMonth---", convertToMonth);
            if (usageTypeId == 2) {
                var div = (convertToMonth * usageFrequency);
                console.log("duv---", div);
                if (div != 0) {
                    noOfMonthsInUsagePeriod = 1 / (convertToMonth * usageFrequency);
                    console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
                }
            } else {
                // var noOfFUPatient = this.state.noOfFUPatient;
                var noOfFUPatient;
                if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                    noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
                } else {
                    console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode);
                    noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
                }
                console.log("no of fu patient---", noOfFUPatient);
                noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
                console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
            }
        }
        this.setState({
            noOfMonthsInUsagePeriod
        }, () => {
            // if (this.state.currentItemConfig.context.payload.nodeType.id == 5) {
            //     this.getUsageText();
            // } else {
            //     console.log("noOfMonthsInUsagePeriod---", this.state.noOfMonthsInUsagePeriod);
            // }
        });
    }
    getUsageText() {
        var usageText = '';
        var noOfPersons;
        var noOfForecastingUnitsPerPerson;
        var usageFrequency;
        var selectedText;
        var selectedText1;
        var selectedText2;
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
            noOfPersons = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
            noOfForecastingUnitsPerPerson = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson;
            usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency;

            if (this.state.addNodeFlag) {
                var usageTypeParent = document.getElementById("usageTypeParent");
                selectedText = usageTypeParent.options[usageTypeParent.selectedIndex].text;
            } else {
                // take everything from object
                // console.log(">>>>", this.state.currentItemConfig);
                // console.log("node unit List>>>", this.state.nodeUnitList);
                selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.parentItem.payload.nodeUnit.id)[0].label.label_en;
            }

            if (this.state.addNodeFlag) {
                var forecastingUnitUnit = document.getElementById("forecastingUnitUnit");
                selectedText1 = forecastingUnitUnit.options[forecastingUnitUnit.selectedIndex].text;
            } else {
                // console.log("***ul>",this.state.unitList);
                // console.log("***uId>",(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id);
                selectedText1 = this.state.unitList.filter(c => c.unitId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id)[0].label.label_en;
            }




            if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 || (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true") {
                selectedText2 = this.state.usagePeriodList.filter(c => c.usagePeriodId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId)[0].label.label_en;
            }
        }
        // FU
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {

            if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
                if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true") {
                    var selectedText3 = this.state.usagePeriodList.filter(c => c.usagePeriodId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId)[0].label.label_en;
                    // if (this.state.addNodeFlag) {
                    //     var repeatUsagePeriodId = document.getElementById("repeatUsagePeriodId");
                    //     var selectedText3 = repeatUsagePeriodId.options[repeatUsagePeriodId.selectedIndex].text;
                    // } else {
                    //     var selectedText3 = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.;
                    // }

                    var repeatCount = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount : '';
                    usageText = "Every " + noOfPersons + " " + selectedText + "(s) requires " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s), " + usageFrequency + " times per " + selectedText2 + " for " + repeatCount + " " + selectedText3;
                } else {
                    usageText = "Every " + noOfPersons + " " + selectedText + "(s) requires " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s)";
                }
            } else {
                usageText = "Every " + noOfPersons + " " + selectedText + "(s) requires " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s) every " + usageFrequency + " " + selectedText2;
            }
        } else {
            //PU
            // console.log("pu>>>", this.state.currentItemConfig);
            // console.log("puList>>>", this.state.planningUnitList);
            var nodeUnitTxt = this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en;
            if (this.state.addNodeFlag) {
                var planningUnitId = document.getElementById("planningUnitId");
                var planningUnit = planningUnitId.options[planningUnitId.selectedIndex].text;
            } else {
                var planningUnit = this.state.planningUnitList.filter(c => c.planningUnitId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id)[0].label.label_en;
            }
            if ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
                var sharePu;
                if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit == "true") {
                    sharePu = (this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor);
                } else {
                    sharePu = Math.round((this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor));
                }
                usageText = "For each " + nodeUnitTxt + " we need " + sharePu + " " + planningUnit;
            } else {
                var puPerInterval = ((((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / 1) / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths);
                usageText = "For each " + nodeUnitTxt + " we need " + addCommas(puPerInterval) + " " + planningUnit + " every " + (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths + " months";
            }
        }


        this.setState({
            usageText
        }, () => {
            console.log("usage text---", this.state.usageText);
        });

    }
    getForecastingUnitListByTracerCategoryId(event) {
        var tracerCategoryId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id;
        console.log("tracerCategoryId---", tracerCategoryId)
        ForecastingUnitService.getForcastingUnitListByTracerCategoryId(tracerCategoryId).then(response => {
            console.log("fu list---", response.data)

            var autocompleteData = [];
            for (var i = 0; i < response.data.length; i++) {
                autocompleteData[i] = { value: response.data[i].forecastingUnitId, label: response.data[i].label.label_en + " [" + response.data[i].forecastingUnitId + "]" }
            }
            this.setState({
                autocompleteData,
                forecastingUnitList: response.data
            }, () => {
                if (response.data.length == 1) {
                    const currentItemConfig = this.state.currentItemConfig;
                    (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id = response.data[0].forecastingUnitId;
                    (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en = response.data[0].forecastingUnitId + " | " + response.data[0].label.label_en;
                    this.setState({
                        currentItemConfig: currentItemConfig
                    }, () => {
                        this.getForecastingUnitUnitByFUId(response.data[0].forecastingUnitId);
                    })
                } else {
                    const currentItemConfig = this.state.currentItemConfig;
                    (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id = "";
                    (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en = "";
                    this.setState({
                        currentItemConfig: currentItemConfig

                    }, () => {

                    })
                }
            })


        })
            .catch(
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


    filterPlanningUnitNode(e) {
        console.log(">>>", e.target.checked);
        var itemsList = this.state.items;
        var arr = [];
        for (let i = 0; i < itemsList.length; i++) {
            var item = itemsList[i];
            if (item.payload.nodeType.id == 5) {
                if (e.target.checked == true) {
                    item.isVisible = false;
                } else {
                    item.isVisible = true;
                }

            }
            arr.push(item);
        }
        this.setState({
            items: arr
        });
    }
    filterPlanningUnitAndForecastingUnitNodes(e) {
        console.log(">>>", e.target.checked);
        var itemsList = this.state.items;
        var arr = [];
        for (let i = 0; i < itemsList.length; i++) {
            var item = itemsList[i];
            if (item.payload.nodeType.id == 5 || item.payload.nodeType.id == 4) {
                if (e.target.checked == true) {
                    item.isVisible = false;
                } else {
                    item.isVisible = true;
                }
            }
            arr.push(item);
        }
        this.setState({
            items: arr
        });
    }

    touchAll(setTouched, errors) {
        setTouched({
            'forecastMethodId': true,
            'treeName': true,
            'monthsInPast': true,
            'monthsInFuture': true
        }
        )
        this.validateForm(errors)
    }

    validateForm(errors) {
        this.findFirstError('dataSourceForm', (fieldName) => {
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
    touchAllNodeData(setTouched, errors) {
        setTouched({
            nodeTypeId: true,
            nodeTitle: true,
            nodeUnitId: true,
            percentageOfParent: true
            // nodeValue: true
        }
        )
        this.validateFormNodeData(errors)
    }
    validateFormNodeData(errors) {
        this.findFirstErrorNodeData('nodeDataForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstErrorNodeData(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    getNodeValue(nodeTypeId) {
        console.log("get node value---------------------");
        if (nodeTypeId == 2 && this.state.currentItemConfig.context.payload.nodeDataMap != null && this.state.currentItemConfig.context.payload.nodeDataMap[0] != null && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0] != null) {
            return (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue;
        }
        // else {
        //     var nodeValue = ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue * (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].dataValue) / 100;
        //     return nodeValue;
        // }
    }

    getNotes() {
        return (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].notes;
    }
    calculateNodeValue() {

    }
    componentDidMount() {
        this.getNodeTyeList();
        this.getUsageTemplateList(0);
        ForecastMethodService.getActiveForecastMethodList().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                forecastMethodList: listArray
            })
        })
            .catch(
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

        UnitService.getUnitListByDimensionId(TREE_DIMENSION_ID).then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                nodeUnitList: listArray
            }, () => {
                console.log("nodeUnitList>>>", this.state.nodeUnitList);
            })
        })
            .catch(
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
        UnitService.getUnitListAll().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                unitList: listArray
            })
        })
            .catch(
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
        UsagePeriodService.getUsagePeriod().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                usagePeriodList: listArray
            })
        })
            .catch(
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

        DatasetService.getUsageTypeList().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                usageTypeList: listArray
            })
        })
            .catch(
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
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    tracerCategoryList: listArray
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
        ModelingTypeService.getModelingTypeListActive().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });

            this.setState({
                modelingTypeList: listArray
            })
        })
            .catch(
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
        // DatasetService.getNodeTypeList().then(response => {
        //     console.log("node type list---", response.data);
        //     var listArray = response.data;
        //     listArray.sort((a, b) => {
        //         var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
        //         var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
        //         return itemLabelA > itemLabelB ? 1 : -1;
        //     });
        //     this.setState({
        //         nodeTypeList: listArray,
        //         loading: false
        //     })
        // })
        //     .catch(
        //         error => {
        //             if (error.message === "Network Error") {
        //                 this.setState({
        //                     message: 'static.unkownError',
        //                     loading: false
        //                 });
        //             } else {
        //                 switch (error.response ? error.response.status : "") {

        //                     case 401:
        //                         this.props.history.push(`/login/static.message.sessionExpired`)
        //                         break;
        //                     case 403:
        //                         this.props.history.push(`/accessDenied`)
        //                         break;
        //                     case 500:
        //                     case 404:
        //                     case 406:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             loading: false
        //                         });
        //                         break;
        //                     case 412:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             loading: false
        //                         });
        //                         break;
        //                     default:
        //                         this.setState({
        //                             message: 'static.unkownError',
        //                             loading: false
        //                         });
        //                         break;
        //                 }
        //             }
        //         }
        //     );
        if (this.props.match.params.templateId != -1) {
            DatasetService.getTreeTemplateById(this.props.match.params.templateId).then(response => {
                console.log("my tree---", response.data);
                var items = response.data.flatList;
                var arr = [];
                for (let i = 0; i < items.length; i++) {

                    if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                        (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (items[i].payload.nodeDataMap[0])[0].dataValue;
                    } else {

                        var findNodeIndex = items.findIndex(n => n.id == items[i].parent);
                        var parentValue = (items[findNodeIndex].payload.nodeDataMap[0])[0].calculatedDataValue;
                        console.log("api parent value---", parentValue);

                        (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (parentValue * (items[i].payload.nodeDataMap[0])[0].dataValue) / 100;
                    }
                    console.log("load---", items[i])
                    // arr.push(items[i]);
                }
                this.setState({
                    treeTemplate: response.data,
                    items,
                    tempItems: items,
                    loading: false
                }, () => {
                    console.log(">>>", new Date('2021-01-01').getFullYear(), "+", ("0" + (new Date('2021-12-01').getMonth() + 1)).slice(-2));
                    console.log("Tree Template---", this.state.items);
                })
            })
                .catch(
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
                treeTemplate: {
                    treeTemplateId: 0,
                    active: true,
                    label: {
                        label_en: ""
                    },
                    forecastMethod: {
                        label: {
                            label_en: ""
                        }
                    },
                    flatList: [{
                        id: 1,
                        level: 0,
                        parent: null,
                        sortOrder: "00",
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
                            nodeDataMap: [
                                [{
                                    dataValue: '',
                                    fuNode: {
                                        forecastingUnit: {
                                            tracerCategory: {

                                            },
                                            unit: {

                                            }
                                        },
                                        usageType: {

                                        },
                                        usagePeriod: {

                                        }
                                    }
                                }]
                            ]
                        },
                        parentItem: {
                            payload: {
                                nodeUnit: {

                                }
                            }
                        }
                    }]
                },
                items: [{
                    id: 1,
                    level: 0,
                    parent: null,
                    sortOrder: "00",
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
                        nodeDataMap: [
                            [{
                                dataValue: '',
                                fuNode: {
                                    forecastingUnit: {
                                        tracerCategory: {

                                        },
                                        unit: {

                                        }
                                    },
                                    usageType: {

                                    },
                                    usagePeriod: {

                                    }
                                }
                            }]
                        ]
                    },
                    parentItem: {
                        payload: {
                            nodeUnit: {

                            }
                        }
                    }
                }]
            }, () => {
                console.log("Tree Template---", this.state.items);
            })
        }
    }
    addScenario() {
        const { tabList } = this.state;
        const { scenario } = this.state;
        var newTabObject = {
            scenarioId: parseInt(tabList.length) + 1,
            scenarioName: scenario.scenarioName,
            scenarioDesc: scenario.scenarioDesc,
            active: true
        };
        // console.log("tab data---", newTabObject);
        var tabList1 = [...tabList, newTabObject];
        // console.log("tabList---", tabList1)
        this.setState({
            tabList: [...tabList, newTabObject],
            activeTab: parseInt(tabList.length),
            openAddScenarioModal: false
        }, () => {
            console.log("final tab list---", this.state);
        });
    }
    nodeTypeChange(value) {
        var nodeTypeId = value;
        console.log("node type value---", nodeTypeId)
        if (nodeTypeId == 1) {
            this.setState({
                numberNode: false,
                aggregationNode: false
            });
        } else if (nodeTypeId == 2) {
            // Number node
            console.log("case 2")
            this.setState({
                numberNode: false,
                aggregationNode: true
            });
        }
        else if (nodeTypeId == 3) {
            // Percentage node
            this.setState({
                numberNode: true,
                aggregationNode: true

            });
        }
        else if (nodeTypeId == 4) {
            // Forecasting unit node
            this.setState({
                numberNode: true,
                aggregationNode: true
            }, () => {
                this.getNodeUnitOfPrent();
            });
        }
    }

    toggleModal(tabPane, tab) {
        const newArray = this.state.activeTab1.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab1: newArray,
        });
        if (tab == 2) {
            console.log("***>>>", this.state.currentItemConfig);
            if (this.state.currentItemConfig.context.payload.nodeType.id != 1) {
                var curDate = (moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD'));
                var month = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month;
                var minMonth = moment(month).subtract(this.state.treeTemplate.monthsInPast, 'months').startOf('month').format("YYYY-MM-DD");
                var maxMonth = moment(month).add(this.state.treeTemplate.monthsInFuture, 'months').endOf('month').format("YYYY-MM-DD");
                var modelingTypeList = this.state.modelingTypeList;
                var arr = [];
                if (this.state.currentItemConfig.context.payload.nodeType.id == 2) {
                    arr = modelingTypeList.filter(x => x.modelingTypeId != 1 && x.modelingTypeId != 5);
                } else {
                    arr = modelingTypeList.filter(x => x.modelingTypeId == 5);
                }
                console.log("arr---", arr);
                var modelingTypeListNew = [];
                for (var i = 0; i < arr.length; i++) {
                    console.log("arr[i]---", arr[i]);
                    modelingTypeListNew[i] = { id: arr[i].modelingTypeId, name: getLabelText(arr[i].label, this.state.lang) }
                }
                this.setState({
                    showModelingJexcelNumber: true,
                    minMonth, maxMonth, filteredModelingType: modelingTypeListNew
                }, () => {
                    this.buildModelingJexcel();
                })

            }
            //  else if (this.state.currentItemConfig.context.payload.nodeType.id == 3) {
            //     this.setState({ showModelingJexcelPercent: true }, () => {
            //         this.buildModelingJexcelPercent()
            //     })
            // }
        }
    }

    resetTree() {
        this.componentDidMount();
        // this.setState({ items: TreeData.demographic_scenario_two });
    }
    dataChange(event) {
        // alert("hi");
        console.log("event---", event);
        let { currentItemConfig } = this.state;
        let { treeTemplate } = this.state;

        if (event.target.name == "active") {
            treeTemplate.active = event.target.id === "active2" ? false : true;
        }

        if (event.target.name === "sharePlanningUnit") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit = event.target.value;
            this.getUsageText();
        }
        if (event.target.name === "refillMonths") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths = event.target.value;
        }
        if (event.target.name === "forecastMethodId") {
            treeTemplate.forecastMethod.id = event.target.value;
        }

        if (event.target.name === "treeName") {
            treeTemplate.label.label_en = event.target.value;
        }

        if (event.target.name === "monthsInPast") {
            treeTemplate.monthsInPast = event.target.value;
        }

        if (event.target.name === "monthsInFuture") {
            treeTemplate.monthsInFuture = event.target.value;
        }

        if (event.target.name === "usageTemplateId") {
            this.setState({
                usageTemplateId: event.target.value
            });
        }

        if (event.target.name === "nodeTitle") {
            currentItemConfig.context.payload.label.label_en = event.target.value;
        }
        if (event.target.name === "nodeTypeId") {
            currentItemConfig.context.payload.nodeType.id = event.target.value;
            if (event.target.value == 5) {
                this.getNoOfMonthsInUsagePeriod();
            }
        }
        if (event.target.name === "nodeUnitId") {
            currentItemConfig.context.payload.nodeUnit.id = event.target.value;
        }
        if (event.target.name === "percentageOfParent") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue = event.target.value;
            var calculatedDataValue;
            var parentValue;
            var parentValue1;
            if (this.state.addNodeFlag !== "true") {
                parentValue1 = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].calculatedDataValue;
            } else {
                parentValue1 = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue;
            }

            console.log("parentValue---", parentValue);
            parentValue = (parentValue1).toString().replaceAll(",", "");
            (currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue = parseInt(parentValue * event.target.value) / 100
            console.log("calculatedDataValue---", currentItemConfig);
            this.setState({
                parentValue
            })
        }
        if (event.target.name === "nodeValue") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue = event.target.value;
            (currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue = event.target.value;
        }
        if (event.target.name === "notes") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].notes = event.target.value;
            this.getNotes();
        }

        if (event.target.name === "tracerCategoryId") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id = event.target.value;
            this.getUsageTemplateList(event.target.value);
        }

        if (event.target.name === "noOfPersons") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons = event.target.value;
        }

        if (event.target.name === "lagInMonths") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.lagInMonths = event.target.value;
        }



        if (event.target.name === "forecastingUnitPerPersonsFC") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson = event.target.value;
            if (currentItemConfig.context.payload.nodeType.id == 4 && (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
                this.getNoOfFUPatient();
            }
        }

        if (event.target.name === "oneTimeUsage") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage = event.target.id === "oneTimeUsage2" ? "false" : "true";
            this.getUsageText();
        }

        if (event.target.name === "repeatUsagePeriodId") {
            var fuNode = (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode;
            var repeatUsagePeriod = {
                usagePeriodId: event.target.value
            }
            fuNode.repeatUsagePeriod = repeatUsagePeriod;
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode = fuNode;
            this.getNoFURequired();
            this.getUsageText();
        }

        if (event.target.name === "repeatCount") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount = event.target.value;
            this.getUsageText();
        }

        if (event.target.name === "usageFrequency") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency = event.target.value;
            this.getNoOfMonthsInUsagePeriod();
            this.getUsageText();
        }

        if (event.target.name === "usagePeriodId") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId = event.target.value;
            this.getNoOfMonthsInUsagePeriod();
            this.getUsageText();
        }
        if (event.target.name === "usageTypeIdFU") {
            console.log("usage type data change function ------------------");
            if (event.target.value == 2 && currentItemConfig.context.payload.nodeType.id == 4) {
                (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons = 1;
            }
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id = event.target.value;
        }

        if (event.target.name === "planningUnitId") {
            var pu = (this.state.planningUnitList.filter(c => c.planningUnitId == event.target.value))[0];
            (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id = pu.unit.id;
            (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id = event.target.value;
            this.setState({
                conversionFactor: pu.multiplier
            });
        }

        if (event.target.name === "currentEndValue") {

            this.setState({
                currentEndValue: event.target.value,
                currentEndValueEdit: false,
                currentTargetChangePercentageEdit: event.target.value != '' ? true : false,
                currentTargetChangeNumberEdit: event.target.value != '' ? true : false
            });
        }

        if (event.target.name === "currentTargetChangePercentage") {
            this.setState({
                currentTargetChangePercentage: event.target.value,
                currentEndValueEdit: event.target.value != '' ? true : false,
                currentTargetChangePercentageEdit: false,
                currentTargetChangeNumberEdit: event.target.value != '' ? true : false
            });
        }
        if (event.target.name === "currentTargetChangeNumber") {
            this.setState({
                currentTargetChangeNumber: event.target.value,
                currentEndValueEdit: event.target.value != '' ? true : false,
                currentTargetChangePercentageEdit: event.target.value != '' ? true : false,
                currentTargetChangeNumberEdit: false
            });
        }


        this.setState({ currentItemConfig }, () => {
            console.log("after state update---", this.state.currentItemConfig);
        });
    }
    onAddButtonClick(itemConfig) {
        console.log("add button clicked---", itemConfig);
        this.setState({ openAddNodeModal: false });
        const { items } = this.state;
        var newItem = itemConfig.context;
        newItem.parent = itemConfig.context.parent;
        newItem.id = parseInt(items.length + 1);
        newItem.level = parseInt(itemConfig.context.level + 1);
        var parentSortOrder = items.filter(c => c.id == itemConfig.context.parent)[0].sortOrder;
        var childList = items.filter(c => c.parent == itemConfig.context.parent);
        newItem.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(childList.length) + 1)).slice(-2));
        if (itemConfig.context.payload.nodeType.id == 4) {
            (newItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en = (itemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en;
        }
        console.log("add button clicked value after update---", newItem);
        this.setState({
            items: [...items, newItem],
            cursorItem: parseInt(items.length + 1)
        }, () => {
            console.log("on add items-------", this.state.items);
            this.calculateValuesForAggregateNode(this.state.items);
        });
    }

    calculateValuesForAggregateNode(items) {
        console.log("start>>>", Date.now());
        var getAllAggregationNode = items.filter(c => c.payload.nodeType.id == 1).sort(function (a, b) {
            a = a.id;
            b = b.id;
            return a > b ? -1 : a < b ? 1 : 0;
        }.bind(this));

        console.log(">>>", getAllAggregationNode);
        for (var i = 0; i < getAllAggregationNode.length; i++) {
            var getChildAggregationNode = items.filter(c => c.parent == getAllAggregationNode[i].id && (c.payload.nodeType.id == 1 || c.payload.nodeType.id == 2))
            console.log(">>>", getChildAggregationNode);
            if (getChildAggregationNode.length > 0) {
                var value = 0;
                for (var m = 0; m < getChildAggregationNode.length; m++) {
                    var value2 = getChildAggregationNode[m].payload.nodeDataMap[0][0].dataValue != "" ? parseInt(getChildAggregationNode[m].payload.nodeDataMap[0][0].dataValue) : 0;
                    value = value + parseInt(value2);
                }

                var findNodeIndex = items.findIndex(n => n.id == getAllAggregationNode[i].id);
                items[findNodeIndex].payload.nodeDataMap[0][0].dataValue = value;
                items[findNodeIndex].payload.nodeDataMap[0][0].calculatedDataValue = value;

                this.setState({
                    items: items,
                    openAddNodeModal: false,
                }, () => {
                    console.log("updated tree data>>>", this.state);
                });
            } else {
                var findNodeIndex = items.findIndex(n => n.id == getAllAggregationNode[i].id);
                items[findNodeIndex].payload.nodeDataMap[0][0].dataValue = "";
                items[findNodeIndex].payload.nodeDataMap[0][0].calculatedDataValue = "";

                this.setState({
                    items: items,
                    openAddNodeModal: false,
                }, () => {
                    console.log("updated tree data>>>", this.state);
                });
            }
        }
        console.log("end>>>", Date.now());
    }
    onRemoveButtonClick(itemConfig) {
        const { items } = this.state;

        this.setState(this.getDeletedItems(items, [itemConfig.id]), () => {
            this.calculateValuesForAggregateNode(this.state.items);
        });
    }
    onMoveItem(parentid, itemid) {
        console.log("on move item called");
        const { items } = this.state;
        console.log("move item items---", items);
        console.log("move item parentid---", parentid);
        console.log("move item itemid---", itemid);
        this.setState({
            cursorItem: itemid,
            items: (items.map(item => {
                if (item.id === itemid) {
                    return {
                        ...item,
                        parent: parentid
                    }
                }
                return item;
            }))
        })
    }
    canDropItem(parentid, itemid) {
        const { items } = this.state;
        const tree = this.getTree(items);
        let result = parentid !== itemid;
        tree.loopParents(this, parentid, function (id, node) {
            if (id === itemid) {
                result = false;
                return true;
            }
        });
        return result;
    }
    onRemoveItem(id) {
        const { items } = this.state;

        this.setState(this.getDeletedItems(items, [id]));
    }
    getDeletedItems(items = [], deletedItems = []) {
        const tree = this.getTree(items);
        const hash = deletedItems.reduce((agg, itemid) => {
            agg.add(itemid.toString());
            return agg;
        }, new Set());
        const cursorParent = this.getDeletedItemsParent(tree, deletedItems, hash);
        const result = [];
        tree.loopLevels(this, (nodeid, node) => {
            if (hash.has(nodeid.toString())) {
                return tree.SKIP;
            }
            result.push(node);
        });

        return {
            items: result,
            cursorItem: cursorParent
        };
    }
    getDeletedItemsParent(tree, deletedItems, deletedHash) {
        let result = null;
        const lca = LCA(tree);
        result = deletedItems.reduce((agg, itemid) => {
            if (agg == null) {
                agg = itemid;
            } else {
                agg = lca.getLowestCommonAncestor(agg, itemid);
            }
            return agg;
        }, null);

        if (deletedHash.has(result.toString())) {
            result = tree.parentid(result);
        }
        return result;
    }

    getTree(items = []) {
        const tree = Tree();

        for (let index = 0; index < items.length; index += 1) {
            const item = items[index];
            tree.add(item.parent, item.id, item);
        }

        return tree;
    }

    onHighlightChanged(event, data) {
        const { context: item } = data;
        const { config } = this.state;
        // console.log("data1---", item.title);
        // console.log("data2---", item.id);
        // item.id
        if (item != null) {

            this.setState({
                title: item.title,
                config: {
                    ...config,
                    // highlightItem: item.id,
                    // cursorItem: item.id
                },
                highlightItem: item.id,
                cursorItem: item.id
            }, () => {
                console.log("highlighted item---", this.state)
            })
        }
    };
    onCursoChanged(event, data) {
        console.log("cursor changed called---", data)
        const { context: item } = data;
        console.log("cursor changed item---", item);
        // const preItem = JSON.parse(JSON.stringify(data.context));
        if (item != null) {
            this.setState({
                showCalculatorFields: false,
                openAddNodeModal: true,
                addNodeFlag: false,
                // preItem: preItem,
                orgCurrentItemConfig: JSON.parse(JSON.stringify(data.context)),
                currentItemConfig: data,
                level0: (data.context.level == 0 ? false : true),
                numberNode: (data.context.payload.nodeType.id == 2 ? false : true),
                aggregationNode: (data.context.payload.nodeType.id == 1 ? false : true),
                scalingList: (data.context.payload.nodeDataMap[0])[0].nodeDataModelingList != null ? (data.context.payload.nodeDataMap[0])[0].nodeDataModelingList : [],
                //         title: item.title,
                //         config: {
                //             ...config,
                //             // highlightItem: item.id,
                //             // cursorItem: item.id
                //         },
                highlightItem: item.id,
                cursorItem: item.id,
                usageText: ''
            }, () => {
                console.log("highlighted item---", this.state.currentItemConfig.context)
                this.getNodeTypeFollowUpList(data.context.level == 0 ? 0 : data.parentItem.payload.nodeType.id);

                if (data.context.payload.nodeType.id == 4) {
                    this.getForecastingUnitListByTracerCategoryId((data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id);
                    // this.getNoOfMonthsInUsagePeriod();
                    this.getNodeUnitOfPrent();
                    this.getNoOfFUPatient();
                    console.log("on curso nofuchanged---", this.state.noOfFUPatient)
                    this.getNoOfMonthsInUsagePeriod();
                    this.getNoFURequired();
                    this.getUsageTemplateList((data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id);
                    // console.log("no -----------------");
                    this.getUsageText();
                    this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.currentItemConfig.parentItem.payload.nodeUnit.id;
                } else if (data.context.payload.nodeType.id == 5) {
                    // console.log("fu id edit---", (data.parentItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id);
                    // console.log("(puNode>>>", (data.context.payload.nodeDataMap[0])[0].puNode);
                    this.getPlanningUnitListByFUId((data.parentItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.idString);
                    (data.context.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id = (data.context.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id;
                    (data.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id = (data.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id;
                    // this.setState({
                    //     // conversionFactor: pu.multiplier
                    //     // conversionFactor: 1
                    // }, () => {
                    this.getNoOfMonthsInUsagePeriod();
                    // });

                    // this.getUsageText();
                    // this.getConversionFactor((data.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id);
                    this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id;
                } else if (data.context.payload.nodeType.id != 1) {
                    this.getSameLevelNodeList(data.context.level, data.context.id);
                }


            })
        }
    };

    updateNodeInfoInJson(currentItemConfig) {
        console.log("update tree node called------------", currentItemConfig);
        var nodes = this.state.items;
        var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.id);
        nodes[findNodeIndex] = currentItemConfig;
        // nodes[findNodeIndex].valueType = currentItemConfig.valueType;
        this.setState({
            items: nodes,
            openAddNodeModal: false,
        }, () => {
            console.log("updated tree data+++", this.state);
            this.calculateValuesForAggregateNode(this.state.items);
        });
    }

    tabPane1() {
        var chartOptions = {
            title: {
                display: false,
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: "",
                            fontColor: 'black'
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: 'black',
                            stepSize: 1000000
                        },
                        gridLines: {
                            drawBorder: true, lineWidth: 1
                        },
                        position: 'left',
                        // scaleSteps : 100000
                    }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItems, data) {
                        if (tooltipItems.datasetIndex == 0) {
                            var details = this.state.expiredStockArr[tooltipItems.index].details;
                            var infoToShow = [];
                            details.map(c => {
                                infoToShow.push(c.batchNo + " - " + c.expiredQty.toLocaleString());
                            });
                            return (infoToShow.join(' | '));
                        } else {
                            return (tooltipItems.yLabel.toLocaleString());
                        }
                    }.bind(this)
                },
                enabled: false,
                custom: CustomTooltips
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: false,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: 'black'
                }
            }
        }


        let bar = {}
        if (this.state.momList.length > 0) {
            var datasetsArr = [];
            datasetsArr.push(
                {
                    label: '',
                    type: 'line',
                    stack: 3,
                    yAxisID: 'A',
                    backgroundColor: 'transparent',
                    borderColor: '#002F6C',
                    borderStyle: 'dotted',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    lineTension: 0,
                    pointStyle: 'line',
                    pointRadius: 0,
                    showInLegend: false,
                    data: this.state.momList.map((item, index) => (item.monthEnd > 0 ? item.monthEnd : null))
                }
            )

            bar = {
                labels: [...new Set(this.state.momList.map(ele => (moment(ele.month).format(DATE_FORMAT_CAP_WITHOUT_DATE))))],
                datasets: datasetsArr

            };
        }

        var chartOptions1 = {
            title: {
                display: false,
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: "",
                            fontColor: 'black'
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: 'black',
                            stepSize: 100000
                        },
                        gridLines: {
                            drawBorder: true, lineWidth: 1
                        },
                        position: 'left',
                        // scaleSteps : 100000
                    },
                    {
                        id: 'B',
                        scaleLabel: {
                            display: true,
                            labelString: "",
                            fontColor: 'black'
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: 'black'
                        },
                        gridLines: {
                            drawBorder: true, lineWidth: 0
                        },
                        position: 'right',
                    }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItems, data) {
                        if (tooltipItems.datasetIndex == 0) {
                            var details = this.state.expiredStockArr[tooltipItems.index].details;
                            var infoToShow = [];
                            details.map(c => {
                                infoToShow.push(c.batchNo + " - " + c.expiredQty.toLocaleString());
                            });
                            return (infoToShow.join(' | '));
                        } else {
                            return (tooltipItems.yLabel.toLocaleString());
                        }
                    }.bind(this)
                },
                enabled: false,
                custom: CustomTooltips
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: 'black'
                }
            }
        }


        let bar1 = {}
        if (this.state.momListPer.length > 0 && this.state.momElPer != '') {
            var datasetsArr = [];
            datasetsArr.push({
                label: 'Men who use condoms (Month End)',
                stack: 1,
                yAxisID: 'A',
                backgroundColor: '#A7C6ED',
                borderColor: grey,
                pointBackgroundColor: grey,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: grey,
                data: (this.state.momElPer).getJson(null, false).map((item, index) => (item[5])),
            }
            )
            datasetsArr.push(
                {
                    label: '% of sexually active men (Month End)',
                    type: 'line',
                    stack: 3,
                    yAxisID: 'A',
                    backgroundColor: 'transparent',
                    borderColor: '#002F6C',
                    borderStyle: 'dotted',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    lineTension: 0,
                    pointStyle: 'line',
                    pointRadius: 0,
                    showInLegend: false,
                    yAxisID: 'B',
                    data: (this.state.momElPer).getJson(null, false).map((item, index) => (this.state.momElPer.getValue(`E${parseInt(index) + 1}`, true))),
                }
            )


            bar1 = {
                labels: [...new Set(this.state.momListPer.map(ele => (moment(ele.month).format(DATE_FORMAT_CAP_WITHOUT_DATE))))],
                datasets: datasetsArr

            };
        }


        return (
            <>
                <TabPane tabId="1">
                    <Formik
                        // enableReinitialize={true}
                        // initialValues={initialValuesNodeData}
                        initialValues={{
                            nodeTitle: this.state.currentItemConfig.context.payload.label.label_en,
                            nodeTypeId: this.state.currentItemConfig.context.payload.nodeType.id,
                            nodeUnitId: this.state.currentItemConfig.context.payload.nodeUnit.id,
                            percentageOfParent: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue
                        }}
                        validate={validateNodeData(validationSchemaNodeData)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            console.log("all ok>>>");
                            if (this.state.addNodeFlag) {
                                this.onAddButtonClick(this.state.currentItemConfig)
                            } else {
                                this.updateNodeInfoInJson(this.state.currentItemConfig)
                            }
                            this.setState({
                                cursorItem: 0,
                                highlightItem: 0
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
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='nodeDataForm' autocomplete="off">
                                    <div className="row">
                                        {this.state.level0 &&
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">Parent</Label>
                                                <Input type="text"
                                                    name="parent"
                                                    bsSize="sm"
                                                    readOnly={true}
                                                    value={this.state.currentItemConfig.context.level != 0
                                                        && this.state.addNodeFlag !== "true"
                                                        ? this.state.currentItemConfig.parentItem.payload.label.label_en
                                                        : this.state.currentItemConfig.parentItem.payload.label.label_en}
                                                ></Input>
                                            </FormGroup>}
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">Node Title<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="nodeTitle"
                                                name="nodeTitle"
                                                bsSize="sm"
                                                valid={!errors.nodeTitle && this.state.currentItemConfig.context.payload.label.label_en != ''}
                                                invalid={touched.nodeTitle && !!errors.nodeTitle}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                value={this.state.currentItemConfig.context.payload.label.label_en}>
                                            </Input>
                                            <FormFeedback className="red">{errors.nodeTitle}</FormFeedback>
                                        </FormGroup>
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpen} target="Popover1" trigger="hover" toggle={this.toggle}>
                                                <PopoverBody>Lag is the delay between the parent node date and the user consumption the product. This is often for phased treatement.</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">Node Type<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={this.toggle} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            <Input
                                                type="select"
                                                id="nodeTypeId"
                                                name="nodeTypeId"
                                                bsSize="sm"
                                                valid={!errors.nodeTypeId && this.state.currentItemConfig.context.payload.nodeType.id != ''}
                                                invalid={touched.nodeTypeId && !!errors.nodeTypeId}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.nodeTypeChange(e.target.value); this.dataChange(e) }}
                                                required
                                                value={this.state.currentItemConfig.context.payload.nodeType.id}
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {this.state.nodeTypeFollowUpList.length > 0
                                                    && this.state.nodeTypeFollowUpList.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.id}>
                                                                {getLabelText(item.label, this.state.lang)}
                                                            </option>
                                                        )
                                                    }, this)}
                                            </Input>
                                            <FormFeedback className="red">{errors.nodeTypeId}</FormFeedback>
                                        </FormGroup>

                                        {this.state.aggregationNode &&

                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">Node Unit<span class="red Reqasterisk">*</span></Label>
                                                <Input
                                                    type="select"
                                                    id="nodeUnitId"
                                                    name="nodeUnitId"
                                                    bsSize="sm"
                                                    valid={!errors.nodeUnitId && this.state.currentItemConfig.context.payload.nodeUnit.id != ''}
                                                    invalid={touched.nodeUnitId && !!errors.nodeUnitId}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                    required
                                                    disabled={this.state.currentItemConfig.context.payload.nodeType.id > 3 ? true : false}
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.parentItem.payload.nodeUnit.id : this.state.currentItemConfig.context.payload.nodeUnit.id}
                                                >
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {this.state.nodeUnitList.length > 0
                                                        && this.state.nodeUnitList.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.unitId}>
                                                                    {getLabelText(item.label, this.state.lang)}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                                <FormFeedback className="red">{errors.nodeUnitId}</FormFeedback>
                                            </FormGroup>}
                                        {this.state.currentItemConfig.context.payload.nodeType.id != 1 &&
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span></Label>
                                                <div className="controls edit">
                                                    <Picker
                                                        id="month"
                                                        name="month"
                                                        ref={this.pickAMonth1}
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                        value={{ year: new Date((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).getFullYear(), month: ("0" + (new Date((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).getMonth() + 1)).slice(-2) }}
                                                        lang={pickerLang.months}
                                                        // theme="dark"
                                                        onChange={this.handleAMonthChange1}
                                                        onDismiss={this.handleAMonthDissmis1}
                                                    >
                                                        <MonthBox value={this.makeText({ year: new Date((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).getFullYear(), month: ("0" + (new Date((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).getMonth() + 1)).slice(-2) })}
                                                            onClick={this.handleClickMonthBox1} />
                                                    </Picker>
                                                </div>
                                            </FormGroup>
                                        }

                                        {(this.state.numberNode && this.state.currentItemConfig.context.payload.nodeType.id != 1) &&
                                            <>
                                                <FormGroup className="col-md-6">
                                                    <Label htmlFor="currencyId">Percentage of Parent<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        id="percentageOfParent"
                                                        name="percentageOfParent"
                                                        bsSize="sm"
                                                        valid={!errors.percentageOfParent && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue != ''}
                                                        invalid={touched.percentageOfParent && !!errors.percentageOfParent}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        step={.01}
                                                        value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue}></Input>
                                                    <FormFeedback className="red">{errors.percentageOfParent}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="col-md-6">
                                                    <Label htmlFor="currencyId">Parent Value<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        id="parentValue"
                                                        name="parentValue"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        value={this.state.addNodeFlag != "true" ? addCommas(this.state.currentItemConfig.parentItem != null ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].calculatedDataValue : '') : addCommas(this.state.parentValue)}
                                                    ></Input>
                                                </FormGroup></>}
                                        {(this.state.aggregationNode && this.state.currentItemConfig.context.payload.nodeType.id != 1) &&
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">Node Value<span class="red Reqasterisk">*</span></Label>
                                                <Input type="text"
                                                    id="nodeValue"
                                                    name="nodeValue"
                                                    bsSize="sm"
                                                    // valid={!errors.nodeValue && (this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2) ? addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue) : addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue) != ''}
                                                    // invalid={touched.nodeValue && !!errors.nodeValue}
                                                    onBlur={handleBlur}
                                                    readOnly={this.state.numberNode ? true : false}
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    // step={.01}
                                                    // value={this.getNodeValue(this.state.currentItemConfig.context.payload.nodeType.id)}
                                                    value={(this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2) ? addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue) : addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue)}
                                                ></Input>
                                                {/* <FormFeedback className="red">{errors.nodeValue}</FormFeedback> */}
                                            </FormGroup>}

                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">Notes</Label>
                                            <Input type="textarea"
                                                id="notes"
                                                name="notes"
                                                onChange={(e) => { this.dataChange(e) }}
                                                // value={this.getNotes}
                                                value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].notes}
                                            ></Input>
                                        </FormGroup>
                                    </div>
                                    {/* Planning unit start */}
                                    {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                        <div>
                                            <div className="row">
                                                <FormGroup className="col-md-2">
                                                    <Label htmlFor="currencyId">{i18n.t('static.common.typeofuse')}<span class="red Reqasterisk">*</span></Label>

                                                </FormGroup>
                                                <FormGroup className="col-md-10">
                                                    <Input
                                                        type="select"
                                                        id="usageTypeIdPU"
                                                        name="usageTypeIdPU"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        required
                                                        disabled={true}
                                                        value={(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {this.state.usageTypeList.length > 0
                                                            && this.state.usageTypeList.map((item, i) => {
                                                                return (
                                                                    <option key={i} value={item.id}>
                                                                        {getLabelText(item.label, this.state.lang)}
                                                                    </option>
                                                                )
                                                            }, this)}
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup className="col-md-2">
                                                    <Label htmlFor="currencyId">Forecasting unit<span class="red Reqasterisk">*</span></Label>

                                                </FormGroup>
                                                <FormGroup className="col-md-10">
                                                    <Input type="text"
                                                        id="forecastingUnitPU"
                                                        name="forecastingUnitPU"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        value={(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en}>

                                                    </Input>
                                                </FormGroup>
                                                <FormGroup className="col-md-2">
                                                    <Label htmlFor="currencyId">{(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "# of FU / month / Clients" : "# of FU / usage / Patient"}<span class="red Reqasterisk">*</span></Label>

                                                </FormGroup>
                                                <FormGroup className="col-md-5">
                                                    <Input type="text"
                                                        id="forecastingUnitPU"
                                                        name="forecastingUnitPU"
                                                        bsSize="sm"
                                                        readOnly={true}

                                                        value={addCommas((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) : this.state.noOfMonthsInUsagePeriod)}>

                                                    </Input>
                                                </FormGroup>
                                                <FormGroup className="col-md-5">
                                                    <Input type="select"
                                                        id="forecastingUnitUnitPU"
                                                        name="forecastingUnitUnitPU"
                                                        bsSize="sm"
                                                        disabled="true"
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        value={(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id}>

                                                        <option value=""></option>
                                                        {this.state.nodeUnitList.length > 0
                                                            && this.state.unitList.map((item, i) => {
                                                                return (
                                                                    <option key={i} value={item.unitId}>
                                                                        {getLabelText(item.label, this.state.lang)}
                                                                    </option>
                                                                )
                                                            }, this)}
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup className="col-md-2">
                                                    <Label htmlFor="currencyId">Planning unit<span class="red Reqasterisk">*</span></Label>

                                                </FormGroup>
                                                <FormGroup className="col-md-10">
                                                    <Input type="select"
                                                        id="planningUnitId"
                                                        name="planningUnitId"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id}>

                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {this.state.planningUnitList.length > 0
                                                            && this.state.planningUnitList.map((item, i) => {
                                                                return (
                                                                    <option key={i} value={item.planningUnitId}>
                                                                        {getLabelText(item.label, this.state.lang)}
                                                                    </option>
                                                                )
                                                            }, this)}
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup className="col-md-2">
                                                    <Label htmlFor="currencyId">Conversion Factor (FU:PU)<span class="red Reqasterisk">*</span></Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-10">
                                                    <Input type="text"
                                                        id="conversionFactor"
                                                        name="conversionFactor"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        value={addCommas(this.state.conversionFactor)}>

                                                    </Input>
                                                </FormGroup>
                                                <FormGroup className="col-md-2">
                                                    <Label htmlFor="currencyId">{(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "# of PU / month /" : "# of PU / usage / "}<span class="red Reqasterisk">*</span></Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-5">
                                                    <Input type="text"
                                                        id="noOfPUUsage"
                                                        name="noOfPUUsage"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        value={addCommas((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? (((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / this.state.conversionFactor) : (this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor))}>

                                                    </Input>
                                                </FormGroup>
                                                <FormGroup className="col-md-5">
                                                    <Input type="select"
                                                        id="planningUnitUnitPU"
                                                        name="planningUnitUnitPU"
                                                        bsSize="sm"
                                                        disabled="true"
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id}>

                                                        <option value=""></option>
                                                        {this.state.unitList.length > 0
                                                            && this.state.unitList.map((item, i) => {
                                                                return (
                                                                    <option key={i} value={item.unitId}>
                                                                        {getLabelText(item.label, this.state.lang)}
                                                                    </option>
                                                                )
                                                            }, this)}
                                                    </Input>
                                                </FormGroup>
                                                {(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 &&
                                                    <>
                                                        <FormGroup className="col-md-2">
                                                            <Label htmlFor="currencyId">QAT estimate for interval (Every _ months)<span class="red Reqasterisk">*</span></Label>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-10">
                                                            <Input type="text"
                                                                id="interval"
                                                                name="interval"
                                                                bsSize="sm"
                                                                readOnly={true}
                                                                value={addCommas(this.state.conversionFactor / ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod))}>

                                                            </Input>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-2">
                                                            <Label htmlFor="currencyId">Consumption interval (Every X months)<span class="red Reqasterisk">*</span></Label>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-10">
                                                            <Input type="text"
                                                                id="refillMonths"
                                                                name="refillMonths"
                                                                onChange={(e) => { this.dataChange(e) }}
                                                                bsSize="sm"
                                                                value={addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths)}>

                                                            </Input>
                                                        </FormGroup></>}
                                                <FormGroup className="col-md-2">
                                                    <Label htmlFor="currencyId">Will Clients share one PU?<span class="red Reqasterisk">*</span></Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-10">
                                                    <Input type="select"
                                                        id="sharePlanningUnit"
                                                        name="sharePlanningUnit"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit}>

                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        <option value="true">Yes</option>
                                                        <option value="false">No</option>

                                                    </Input>
                                                </FormGroup>
                                                <FormGroup className="col-md-2">
                                                    <Label htmlFor="currencyId">{(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "How many PU per interval per " : "How many PU per usage per "}{this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}?<span class="red Reqasterisk">*</span></Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-10">
                                                    <Input type="text"
                                                        id="puInterval"
                                                        name="puInterval"
                                                        readOnly={true}
                                                        bsSize="sm"
                                                        value={addCommas((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? ((((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / this.state.conversionFactor) / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths) : ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit == "true" ? (this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor) : Math.round((this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor))))}>

                                                    </Input>
                                                </FormGroup>

                                            </div>
                                            <div className="col-md-12 pt-2 pl-2"><b>{this.state.usageText}</b></div>
                                        </div>}
                                    {/* Plannign unit end */}
                                    {(this.state.currentItemConfig.context.payload.nodeType.id == 4) && <div>
                                        <div className="row">

                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">Tracer Category<span class="red Reqasterisk">*</span></Label>
                                                <Input
                                                    type="select"
                                                    id="tracerCategoryId"
                                                    name="tracerCategoryId"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.dataChange(e); this.getForecastingUnitListByTracerCategoryId(e) }}
                                                    required
                                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id}
                                                >
                                                    <option value="">{i18n.t('static.common.selecttracercategory')}</option>
                                                    {this.state.tracerCategoryList.length > 0
                                                        && this.state.tracerCategoryList.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.tracerCategoryId}>
                                                                    {getLabelText(item.label, this.state.lang)}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                            </FormGroup>

                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">Copy from Template</Label>
                                                <Input
                                                    type="select"
                                                    name="usageTemplateId"
                                                    id="usageTemplateId"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.copyDataFromUsageTemplate(e); this.dataChange(e) }}
                                                    required
                                                    value={this.state.usageTemplateId}
                                                >
                                                    <option value="">{i18n.t('static.common.selecttemplate')}</option>
                                                    {this.state.usageTemplateList.length > 0
                                                        && this.state.usageTemplateList.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.usageTemplateId}>
                                                                    {getLabelText(item.label, this.state.lang)}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                            </FormGroup>
                                            <FormGroup className="col-md-12">
                                                <Label htmlFor="currencyId">Forecasting Unit<span class="red Reqasterisk">*</span></Label>
                                                <div className="controls fuNodeAutocomplete"
                                                >
                                                    <Autocomplete
                                                        id="forecastingUnitId"
                                                        name="forecastingUnitId"
                                                        // value={{ value: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id, label: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en }}
                                                        defaultValue={{ value: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id, label: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en }}
                                                        options={this.state.autocompleteData}
                                                        getOptionLabel={(option) => option.label}
                                                        // style={{ width: 730 }}
                                                        onChange={(event, value) => {
                                                            console.log("combo 2 ro combo box---", value);
                                                            // if(){
                                                            (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id = value.value;
                                                            if (value != null) {
                                                                (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en = value.label;
                                                            }
                                                            this.getForecastingUnitUnitByFUId(value.value);

                                                        }} // prints the selected value
                                                        renderInput={(params) => <TextField {...params} variant="outlined"
                                                            onChange={(e) => {
                                                                // this.searchErpOrderData(e.target.value)
                                                            }} />}
                                                    />

                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">{i18n.t('static.common.typeofuse')}<span class="red Reqasterisk">*</span></Label>
                                                <Input
                                                    type="select"
                                                    id="usageTypeIdFU"
                                                    name="usageTypeIdFU"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    required
                                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id}
                                                >
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {this.state.usageTypeList.length > 0
                                                        && this.state.usageTypeList.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.id}>
                                                                    {getLabelText(item.label, this.state.lang)}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                            </FormGroup>
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">Lag in months (0=immediate)<span class="red Reqasterisk">*</span></Label>
                                                <Input type="text"
                                                    id="lagInMonths"
                                                    name="lagInMonths"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    value={addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.lagInMonths)}
                                                ></Input>
                                            </FormGroup>
                                        </div>
                                        <div className="row">

                                            <FormGroup className="col-md-2">
                                                <Label htmlFor="currencyId">Every<span class="red Reqasterisk">*</span></Label>

                                            </FormGroup>
                                            <FormGroup className="col-md-5">
                                                <Input type="text"
                                                    id="noOfPersons"
                                                    name="noOfPersons"
                                                    bsSize="sm"
                                                    readOnly={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? true : false}
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    value={addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons)}>

                                                </Input>
                                            </FormGroup>
                                            <FormGroup className="col-md-5">
                                                <Input type="select"
                                                    id="usageTypeParent"
                                                    name="usageTypeParent"
                                                    bsSize="sm"
                                                    disabled={true}
                                                    value={this.state.usageTypeParent}>

                                                    <option value=""></option>
                                                    {this.state.nodeUnitList.length > 0
                                                        && this.state.nodeUnitList.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.unitId}>
                                                                    {getLabelText(item.label, this.state.lang)}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                            </FormGroup>
                                            <FormGroup className="col-md-2">
                                                <Label htmlFor="currencyId">requires<span class="red Reqasterisk">*</span></Label>
                                            </FormGroup>
                                            <FormGroup className="col-md-5">
                                                <Input type="text"
                                                    id="forecastingUnitPerPersonsFC"
                                                    name="forecastingUnitPerPersonsFC"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    value={addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson)}></Input>
                                            </FormGroup>
                                            <FormGroup className="col-md-5">
                                                <Input type="select"
                                                    id="forecastingUnitUnit"
                                                    name="forecastingUnitUnit"
                                                    bsSize="sm"
                                                    disabled="true"
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id}>

                                                    <option value=""></option>
                                                    {this.state.nodeUnitList.length > 0
                                                        && this.state.unitList.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.unitId}>
                                                                    {getLabelText(item.label, this.state.lang)}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                            </FormGroup>
                                            {(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1 &&
                                                <>
                                                    <FormGroup className="col-md-1">
                                                        <Label for="isSync">Single Use </Label>
                                                    </FormGroup>
                                                    <div className="col-md-10" style={{ marginLeft: '4%' }}>
                                                        <FormGroup className="ml-lg-3" check inline >
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="oneTimeUsage1"
                                                                name="oneTimeUsage"
                                                                value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage}
                                                                checked={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage === "true"}
                                                                onChange={(e) => { this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                {i18n.t('static.program.yes')}
                                                            </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="oneTimeUsage2"
                                                                name="oneTimeUsage"
                                                                value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage}
                                                                checked={this.state.addNodeFlag ? true : (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage === "false"}
                                                                onChange={(e) => { this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.program.no')}
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    {/* <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">Single Use<span class="red Reqasterisk">*</span></Label>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-10">
                                                        <Input type="select"
                                                            id="oneTimeUsage"
                                                            name="oneTimeUsage"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage}>

                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            <option value="true">Yes</option>
                                                            <option value="false">No</option>

                                                        </Input>
                                                    </FormGroup> */}
                                                    {/* <FormGroup className="col-md-5"></FormGroup> */}
                                                    {(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" &&
                                                        <>
                                                            <FormGroup className="col-md-2"></FormGroup>
                                                            <FormGroup className="col-md-4">
                                                                <Input type="text"
                                                                    name="usageFrequency"
                                                                    bsSize="sm"
                                                                    onChange={(e) => { this.dataChange(e) }}
                                                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency}></Input>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-2">
                                                                <Input type="text"
                                                                    name="timesPer"
                                                                    bsSize="sm"
                                                                    readOnly={true}
                                                                    value={'times per'}></Input>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-4">
                                                                <Input
                                                                    type="select"
                                                                    id="usagePeriodId"
                                                                    name="usagePeriodId"
                                                                    bsSize="sm"
                                                                    onChange={(e) => { this.dataChange(e) }}
                                                                    required
                                                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId}
                                                                >
                                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                                    {this.state.usagePeriodList.length > 0
                                                                        && this.state.usagePeriodList.map((item, i) => {
                                                                            return (
                                                                                <option key={i} value={item.usagePeriodId}>
                                                                                    {getLabelText(item.label, this.state.lang)}
                                                                                </option>
                                                                            )
                                                                        }, this)}
                                                                </Input>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-2">
                                                                <Label htmlFor="currencyId">for<span class="red Reqasterisk">*</span></Label>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-5">
                                                                <Input type="text"
                                                                    id="repeatCount"
                                                                    name="repeatCount"
                                                                    bsSize="sm"
                                                                    onChange={(e) => { this.dataChange(e) }}
                                                                    value={addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount)}></Input>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-5">
                                                                <Input type="select"
                                                                    id="repeatUsagePeriodId"
                                                                    name="repeatUsagePeriodId"
                                                                    bsSize="sm"
                                                                    onChange={(e) => { this.dataChange(e) }}
                                                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId : ''}>

                                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                                    {this.state.usagePeriodList.length > 0
                                                                        && this.state.usagePeriodList.map((item, i) => {
                                                                            return (
                                                                                <option key={i} value={item.usagePeriodId}>
                                                                                    {getLabelText(item.label, this.state.lang)}
                                                                                </option>
                                                                            )
                                                                        }, this)}
                                                                </Input>
                                                            </FormGroup></>}
                                                </>
                                            }
                                            {(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 &&
                                                <>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">every<span class="red Reqasterisk">*</span></Label>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5">
                                                        <Input type="text"
                                                            name="usageFrequency"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency}></Input>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5">
                                                        <Input
                                                            type="select"
                                                            id="usagePeriodId"
                                                            name="usagePeriodId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            required
                                                            value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {this.state.usagePeriodList.length > 0
                                                                && this.state.usagePeriodList.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.usagePeriodId}>
                                                                            {getLabelText(item.label, this.state.lang)}
                                                                        </option>
                                                                    )
                                                                }, this)}
                                                        </Input>
                                                    </FormGroup>
                                                </>}
                                            <div style={{ clear: 'both', width: '100%' }} className="pl-lg-3 pr-lg-3">
                                                {(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 &&
                                                    <table className="table table-bordered">
                                                        <tr>
                                                            <td># of FU required for period</td>
                                                            <td>{addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td># of months in period</td>
                                                            <td>{addCommas(this.state.noOfMonthsInUsagePeriod)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td># of FU / month / {this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en : ""}</td>
                                                            <td>{addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)}</td>
                                                        </tr>
                                                    </table>}
                                                {(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1 &&
                                                    <table className="table table-bordered">
                                                        <tr>
                                                            <td># of FU / {this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en : ""}</td>
                                                            <td>{addCommas(this.state.noOfFUPatient)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td># of FU / month / {this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en : ""}</td>
                                                            <td>{addCommas(this.state.noOfMonthsInUsagePeriod)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td># of FU required</td>
                                                            <td>{addCommas(this.state.noFURequired)}</td>
                                                        </tr>
                                                    </table>}
                                            </div>
                                            <div className="col-md-12 pt-2 pl-2 pb-lg-3"><b>{this.state.usageText}</b></div>
                                        </div>
                                    </div>}
                                    {/* disabled={!isValid} */}
                                    <FormGroup className="pb-lg-3">
                                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddNodeModal: false, cursorItem: 0, highlightItem: 0, activeTab1: new Array(2).fill('1') })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                        <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={() => this.resetNodeData()} ><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAllNodeData(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                    </FormGroup>
                                </Form>
                            )} />
                </TabPane>
                <TabPane tabId="2">
                    <div className="row pl-lg-5 pb-lg-3 pt-lg-0">
                        <div className="offset-md-10 col-md-6 pl-lg-4 ">
                            <SupplyPlanFormulas ref="formulaeChild" />
                            <a className="">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleShowTermLogic() }}><i className="" style={{ color: '#20a8d8' }}></i> <small className="supplyplanformulas">{'Show terms and logic'}</small></span>

                            </a>
                        </div>
                    </div>
                    <div className="row pl-lg-2 pr-lg-2">
                        {/* 
                        <FormGroup className="col-md-2 pt-lg-1">
                            <Label htmlFor="">Node Title<span class="red Reqasterisk">*</span></Label>
                        </FormGroup>
                        <FormGroup className="col-md-4 pl-lg-0">

                            <Input type="text"
                                id="nodeTitleModeling"
                                name="nodeTitleModeling"
                                bsSize="sm"
                                readOnly="true"
                                // valid={!errors.nodeTitle && this.state.currentItemConfig.context.payload.label.label_en != ''}
                                // invalid={touched.nodeTitle && !!errors.nodeTitle}
                                // onBlur={handleBlur}
                                onChange={(e) => { this.dataChange(e) }}
                                value={this.state.currentItemConfig.context.payload.label.label_en}>
                            </Input>
                        </FormGroup> */}
                        <FormGroup className="col-md-2 pt-lg-1">
                            <Label htmlFor="">Start Month<span class="red Reqasterisk">*</span></Label>
                        </FormGroup>
                        <FormGroup className="col-md-4 pl-lg-0 ">
                            <Picker
                                ref={this.pickAMonth2}
                                years={{ min: { year: 2016, month: 2 }, max: { year: 2016, month: 9 } }}
                                value={this.state.singleValue2}
                                lang={pickerLang.months}
                                onChange={this.handleAMonthChange2}
                                onDismiss={this.handleAMonthDissmis2}
                                className="ReadonlyPicker"

                            >
                                <MonthBox value={this.makeText(this.state.singleValue2)}
                                    onClick={this.handleClickMonthBox2} />
                            </Picker>
                        </FormGroup>

                        <div>
                            {this.state.showModelingJexcelNumber &&
                                <> <div className="calculatorimg">
                                    <div id="modelingJexcel" className={"RowClickable ScalingTable"}>
                                    </div>
                                </div>
                                    <div style={{ 'float': 'right', 'fontSize': '18px' }}><b>Total : {this.state.scalingTotal != "" && addCommas(parseFloat(this.state.scalingTotal).toFixed(2))}</b></div><br /><br />
                                    <div><Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.showMomData()}> <i className="fa fa-eye" style={{ color: '#fff' }}></i> View monthly data</Button>
                                        <Button color="success" size="md" className="float-right mr-1" type="button" onClick={() => this.formSubmit()}> <i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                        <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                    </div>
                                </>
                            }
                            {this.state.showModelingJexcelPercent &&
                                <><div className="calculatorimg">
                                    <div id="modelingJexcelPercent" className={"RowClickable ScalingTable"}>
                                    </div>
                                </div>
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.showMomDataPercent()}> <i className="fa fa-eye" style={{ color: '#fff' }}></i> View monthly data</Button>
                                    <Button color="success" size="md" className="float-right mr-1" type="button"> <i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRowJexcelPer()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                </>
                            }

                        </div>


                        {this.state.showCalculatorFields &&
                            <div className="col-md-12 pl-lg-0 pr-lg-0">
                                <fieldset className="scheduler-border">
                                    <legend className="scheduler-border">Modeling Calculater Tool:</legend>
                                    <div className="row">
                                        {/* <div className="row"> */}
                                        {/* <FormGroup className="col-md-12 pt-lg-1">
                                        <Label htmlFor=""><b>Modeling Calculater Tool</b></Label>
                                    </FormGroup> */}
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">Start Date<span class="red Reqasterisk">*</span></Label>
                                            <Picker
                                                ref={this.pickAMonth2}
                                                years={{ min: { year: 2010, month: 2 }, max: { year: 2050, month: 9 } }}
                                                // value={this.state.singleValue2}
                                                value={{ year: new Date(this.state.currentCalculatorStartDate).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStartDate).getMonth() + 1)).slice(-2) }}
                                                lang={pickerLang.months}
                                                onChange={this.handleAMonthChange2}
                                                onDismiss={this.handleAMonthDissmis2}
                                            >
                                                <MonthBox value={this.makeText({ year: new Date(this.state.currentCalculatorStartDate).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStartDate).getMonth() + 1)).slice(-2) })} onClick={this.handleClickMonthBox2} />
                                            </Picker>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">Start Value<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="startValue"
                                                name="startValue"
                                                bsSize="sm"
                                                readOnly={true}
                                                value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue}

                                            >
                                            </Input>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        {this.state.currentItemConfig.context.payload.nodeType.id == 3 && <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">Start Percentage<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="startPercentage"
                                                name="startPercentage"
                                                bsSize="sm"
                                                readOnly={true}
                                                value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue}

                                            >
                                            </Input>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        }
                                        {/* </div> */}
                                        {/* <div className="row"> */}
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">Target Date<span class="red Reqasterisk">*</span></Label>
                                            <Picker
                                                ref={this.pickAMonth2}
                                                years={{ min: { year: 2010, month: 2 }, max: { year: 2050, month: 9 } }}
                                                // value={this.state.singleValue2}
                                                value={{ year: new Date(this.state.currentCalculatorStopDate).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStopDate).getMonth() + 1)).slice(-2) }}
                                                lang={pickerLang.months}
                                                onChange={this.handleAMonthChange2}
                                                onDismiss={this.handleAMonthDissmis2}
                                            >
                                                <MonthBox value={this.makeText({ year: new Date(this.state.currentCalculatorStopDate).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStopDate).getMonth() + 1)).slice(-2) })} onClick={this.handleClickMonthBox2} />
                                            </Picker>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        <FormGroup className="col-md-5">
                                            <Label htmlFor="currencyId">Ending {this.state.currentItemConfig.context.payload.nodeType.id != 3 ? 'Value' : '%'}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="currentEndValue"
                                                name="currentEndValue"
                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e); this.calculateMomByEndValue(e) }}
                                                value={this.state.currentEndValue}
                                                readOnly={this.state.currentEndValueEdit}
                                            >
                                            </Input>

                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        <FormGroup className="col-md-1 mt-lg-4">
                                            <Label htmlFor="currencyId">or</Label>
                                        </FormGroup>
                                        <FormGroup className="col-md-5">
                                            <Label htmlFor="currencyId">Target change %<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="currentTargetChangePercentage"
                                                name="currentTargetChangePercentage"
                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e); this.calculateMomByChangeInPercent(e) }}
                                                value={this.state.currentTargetChangePercentage}
                                                readOnly={this.state.currentTargetChangePercentageEdit}

                                            >
                                            </Input>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        {this.state.currentModelingType != 3 && this.state.currentModelingType != 4 && <FormGroup className="col-md-1 mt-lg-4">
                                            <Label htmlFor="currencyId">or</Label>
                                        </FormGroup>
                                        }
                                        {/* {this.state.currentItemConfig.context.payload.nodeType.id != 3  */}
                                        {this.state.currentModelingType != 5 && this.state.currentModelingType != 3 && this.state.currentModelingType != 4 && <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">Change (#)<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="currentTargetChangeNumber"
                                                name="currentTargetChangeNumber"
                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e); this.calculateMomByChangeInNumber(e) }}
                                                value={this.state.currentTargetChangeNumber}
                                                readOnly={this.state.currentTargetChangeNumberEdit}
                                            >
                                            </Input>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        }
                                    </div>
                                    <div className="row col-md-12 pl-lg-0">
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">Calculated Month-on-Month change<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="calculatedMomChange"
                                                name="calculatedMomChange"
                                                bsSize="sm"
                                                readOnly={true}
                                                value={this.state.currentCalculatedMomChange}>
                                            </Input>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        <FormGroup className="col-md-6"></FormGroup>
                                        <FormGroup className="col-md-6" >
                                            <div className="check inline  pl-lg-1 pt-lg-2">
                                                {this.state.currentItemConfig.context.payload.nodeType.id != 3 && <div className="col-md-12 form-group">
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="radio"
                                                        id="active1"
                                                        name="modelingType"
                                                        checked={this.state.currentModelingType == 4 ? true : false}
                                                    // onClick={(e) => { this.filterPlanningUnitNode(e); }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        <b>{'Exponential (%)'}</b>
                                                    </Label>
                                                </div>}
                                                {this.state.currentItemConfig.context.payload.nodeType.id != 3 && <div className="col-md-12 form-group">
                                                    <Input
                                                        className="form-check-input Radioactive checkboxMargin"
                                                        type="radio"
                                                        id="active2"
                                                        name="modelingType"
                                                        checked={(this.state.currentItemConfig.context.payload.nodeType.id == 3 || this.state.currentModelingType == 3) ? true : false}
                                                    // onClick={(e) => { this.filterPlanningUnitAndForecastingUnitNodes(e) }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        <b>{'Linear (%)'}</b>
                                                    </Label>
                                                </div>}
                                                {this.state.currentItemConfig.context.payload.nodeType.id != 3 && <div className="col-md-12 form-group">
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="radio"
                                                        id="active3"
                                                        name="modelingType"
                                                        checked={this.state.currentModelingType == 2 ? true : false}
                                                    // onClick={(e) => { this.filterPlanningUnitAndForecastingUnitNodes(e) }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        <b>{'Linear (#)'}</b>
                                                    </Label>
                                                </div>}
                                                {this.state.currentItemConfig.context.payload.nodeType.id == 3 && <div className="col-md-12 form-group">
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="radio"
                                                        id="active4"
                                                        name="modelingType"
                                                        checked={this.state.currentModelingType == 5 ? true : false}
                                                    // onClick={(e) => { this.filterPlanningUnitAndForecastingUnitNodes(e) }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        <b>{'Linear (% point)'}</b>
                                                    </Label>
                                                </div>}
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                        </FormGroup>
                                    </div>
                                    <FormGroup className="col-md-12">
                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => {
                                            this.setState({
                                                showCalculatorFields: false
                                            });
                                        }}><i className="fa fa-times"></i> {'Close'}</Button>
                                        <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.acceptValue}><i className="fa fa-check"></i> {'Accept'}</Button>

                                    </FormGroup>

                                </fieldset>
                            </div>
                        }

                    </div>
                    {this.state.showMomData &&
                        <div className="row pl-lg-2 pr-lg-2">
                            <fieldset className="scheduler-border">
                                <legend className="scheduler-border">Modeling Calculater Tool:</legend>
                                {/* <div className="row pl-lg-2 pr-lg-2"> */}

                                <div className="col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
                                    <div className="col-md-6 pl-lg-0">
                                        <Button type="button" size="md" color="info" className="float-left mr-1" onClick={this.resetTree}>{'Show/hide data'}</Button>
                                    </div>
                                    <div className="col-md-6 float-right">
                                        <FormGroup className="float-right" >
                                            <div className="check inline  pl-lg-1 pt-lg-0">
                                                <div>
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="checkbox"
                                                        id="manualChange"
                                                        name="manualChange"
                                                        // checked={true}
                                                        checked={this.state.manualChange}
                                                        onClick={(e) => { this.momCheckbox(e); }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        <b>{'Manual Change affects future month'}</b>
                                                    </Label>
                                                </div>
                                                <div>
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="checkbox"
                                                        id="seasonality"
                                                        name="seasonality"
                                                        // checked={true}
                                                        checked={this.state.seasonality}
                                                        onClick={(e) => { this.momCheckbox(e) }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        <b>{'Show Seasonality & manual change'}</b>
                                                    </Label>
                                                </div>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </div>
                                <div id="momJexcel" className="ScalingTable">
                                </div>
                                <div className="col-md-12 pr-lg-0 float-right">
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => { this.setState({ showMomData: false }) }}><i className="fa fa-times"></i> {'Close'}</Button>
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.resetTree}><i className="fa fa-check"></i> {'Update'}</Button>

                                </div>

                                {/* </div> */}

                                <div className="row pl-lg-0 pt-lg-3">
                                    <div className="col-md-12 chart-wrapper chart-graph-report pl-0 ml-0">
                                        <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                        <div>

                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    }
                    {this.state.showMomDataPercent &&
                        <div className="row pl-lg-2 pr-lg-2">
                            <fieldset className="scheduler-border">
                                <legend className="scheduler-border">Modeling Calculater Tool:</legend>
                                {/* <div className="row pl-lg-2 pr-lg-2"> */}
                                <div className="col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
                                    <div className="col-md-6 pl-lg-0">
                                        <Button type="button" size="md" color="info" className="float-left mr-1" onClick={this.resetTree}>{'Show/hide data'}</Button>
                                    </div>
                                    <div className="col-md-6 float-right">
                                        <FormGroup className="float-right" >
                                            <div className="check inline  pl-lg-1 pt-lg-0">
                                                <div>
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="checkbox"
                                                        id="manualChange"
                                                        name="manualChange"
                                                        checked={true}
                                                    // checked={this.state.manualChange}
                                                    // onClick={(e) => { this.momCheckbox(e); }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        <b>{'Manual Change affects future month'}</b>
                                                    </Label>
                                                </div>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </div>
                                <div id="momJexcelPer" className={"RowClickable FiltermomjexcelPer"}>
                                </div>
                                <div className="col-md-12 pr-lg-0 float-right">
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.resetTree}><i className="fa fa-times"></i> {'Close'}</Button>
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.resetTree}><i className="fa fa-check"></i> {'Update'}</Button>

                                </div>
                                {/* </div> */}

                                <div className="row pl-lg-0 pt-lg-3">
                                    <div className="col-md-12 chart-wrapper chart-graph-report pl-0 ml-0">
                                        <Bar id="cool-canvas" data={bar1} options={chartOptions1} />
                                        <div>

                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                        </div>
                    }
                </TabPane>

            </>
        );
    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    handleClickMonthBox2 = (e) => {
        this.pickAMonth2.current.show()
    }
    handleClickMonthBox1 = (e) => {
        this.pickAMonth1.current.show()
    }

    handleAMonthChange2 = (year, month) => {
        // console.log("value>>>", year);
        // console.log("text>>>", month)
        var month = parseInt(month) < 10 ? "0" + month : month
        var date = year + "-" + month + "-" + "01"
        let { currentItemConfig } = this.state;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].month = date;
        this.setState({ currentItemConfig }, () => {
            console.log("after state update---", this.state.currentItemConfig);
        });
        //
        //
    }
    handleAMonthChange1 = (year, month) => {
        // console.log("value>>>", year);
        // console.log("text>>>", month)
        var month = parseInt(month) < 10 ? "0" + month : month
        var date = year + "-" + month + "-" + "01"
        let { currentItemConfig } = this.state;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].month = date;
        this.setState({ currentItemConfig }, () => {
            console.log("after state update---", this.state.currentItemConfig);
        });
        //
        //
    }

    handleAMonthDissmis2 = (value) => {
        // console.log("dismiss>>", value);
        this.setState({ singleValue2: value, }, () => {
            // this.fetchData();
        })

    }
    handleAMonthDissmis1 = (value) => {
        // console.log("dismiss>>", value);
        this.setState({ singleValue2: value, }, () => {
            // this.fetchData();
        })

    }

    exportDoc() {
        console.log("This.state.items +++", this.state.items);
        var item1 = this.state.items;
        var sortOrderArray = [...new Set(item1.map(ele => (ele.sortOrder)))];
        var sortedArray = sortOrderArray.sort();
        var items = [];
        for (var i = 0; i < sortedArray.length; i++) {
            items.push(item1.filter(c => c.sortOrder == sortedArray[i])[0]);
        }
        console.log("Items+++", items);
        var dataArray = [];
        for (var i = 0; i < items.length; i++) {
            var row = "";
            var row1 = "";
            var level = items[i].level;
            for (var j = 1; j <= level; j++) {
                row = row.concat("\t");
            }
            if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                row = row.concat(addCommas((items[i].payload.nodeDataMap[0])[0].dataValue))
                row1 = row1.concat(" ").concat(items[i].payload.label.label_en)
            } else {
                row = row.concat((items[i].payload.nodeDataMap[0])[0].dataValue).concat("% ")
                row1 = row1.concat(items[i].payload.label.label_en)
            }
            dataArray.push(new Paragraph({
                children: [new TextRun({ "text": row, bold: true }), new TextRun({ "text": row1 })],
                spacing: {
                    after: 150,
                },
            }));
            if (i != 0) {
                var filteredList = this.state.items.filter(c => c.sortOrder > items[i].sortOrder && c.parent == items[i].parent);
                if (filteredList.length == 0) {
                    var dataFilter = this.state.items.filter(c => c.level == items[i].level);
                    var total = 0;
                    dataFilter.filter(c => c.parent == items[i].parent).map(item => {
                        total += Number((item.payload.nodeDataMap[0])[0].dataValue)
                    })
                    var parentName = this.state.items.filter(c => c.id == items[i].parent)[0].payload.label.label_en;
                    var row = "";
                    var row1 = "";
                    var row3 = "";
                    var row4 = parentName;
                    for (var j = 1; j <= items[i].level; j++) {
                        row3 = row3.concat("\t");
                    }
                    if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                    } else {
                        row = row.concat(total).concat("% ")
                        row1 = row1.concat(" Subtotal")
                    }
                    dataArray.push(new Paragraph({
                        children: [new TextRun({ "text": row3 }), new TextRun({ "text": row, bold: true }), new TextRun({ "text": row4 }), new TextRun({ "text": row1 })],
                        spacing: {
                            after: 150,
                        },
                        shading: {
                            type: ShadingType.CLEAR,
                            fill: "cfcdc9"
                        },
                        style: total != 100 ? "aside" : "",
                    }))
                }
            }
        }
        const doc = new Document({
            sections: [
                {
                    children: dataArray
                }
            ],
            styles: {
                paragraphStyles: [
                    {
                        id: "aside",
                        name: "aside",
                        run: {
                            color: "BA0C2F",
                        },
                    },
                ]
            }
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "TreeValidation.docx");
        });
    }

    render() {
        const Node = ({ itemConfig, isDragging, connectDragSource, canDrop, isOver, connectDropTarget }) => {
            const opacity = isDragging ? 0.4 : 1
            let itemTitleColor = Colors.RoyalBlue;
            if (isOver) {
                if (canDrop) {
                    itemTitleColor = "green";
                } else {
                    itemTitleColor = "#BA0C2F";
                }
            }

            return connectDropTarget(connectDragSource(
                // <div className="ContactTemplate " style={{ opacity, backgroundColor: Colors.White, borderColor: Colors.Black }}>
                <div className="ContactTemplate boxContactTemplate">
                    <div className={itemConfig.payload.nodeType.id == 5 || itemConfig.payload.nodeType.id == 4 ? "ContactTitleBackground TemplateTitleBgblue" : "ContactTitleBackground TemplateTitleBg"}
                    >
                        <div className={itemConfig.payload.nodeType.id == 5 || itemConfig.payload.nodeType.id == 4 ? "ContactTitle TitleColorWhite" : "ContactTitle TitleColor"}><div title={itemConfig.payload.label.label_en} style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '158px', float: 'left', fontWeight: 'bold' }}>{itemConfig.payload.label.label_en}</div><b style={{ color: '#212721', float: 'right' }}>{itemConfig.payload.nodeType.id == 2 ? <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#002f6c' }}></i> : (itemConfig.payload.nodeType.id == 3 ? <i class="fa fa-percent " style={{ fontSize: '11px', color: '#002f6c' }} ></i> : (itemConfig.payload.nodeType.id == 4 ? <i class="fa fa-cube" style={{ fontSize: '11px', color: '#fff' }} ></i> : (itemConfig.payload.nodeType.id == 5 ? <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#fff' }} ></i> : (itemConfig.payload.nodeType.id == 1 ? <i class="fa fa-plus" style={{ fontSize: '11px', color: '#002f6c' }} ></i> : ""))))}</b></div>
                    </div>
                    <div className="ContactPhone ContactPhoneValue">
                        <span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 1)}</span>
                        <div style={{ overflow: 'inherit', fontStyle: 'italic' }}><p className="" style={{ textAlign: 'center' }}> {this.getPayloadData(itemConfig, 2)}</p></div>
                        <div className="treeValidation"><span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 3) != "" ? "Sum of children: " : ""}</span><span className={this.getPayloadData(itemConfig, 3) != 100 ? "treeValidationRed" : ""}>{this.getPayloadData(itemConfig, 3) != "" ? this.getPayloadData(itemConfig, 3) + "%" : ""}</span></div>
                    </div>
                </div>
            ))
        }

        const NodeDragSource = DragSource(
            ItemTypes.NODE,
            {
                beginDrag: ({ itemConfig }) => ({ id: itemConfig.id }),
                endDrag(props, monitor) {
                    const { onMoveItem } = props;
                    const item = monitor.getItem()
                    const dropResult = monitor.getDropResult()
                    if (dropResult) {
                        onMoveItem(dropResult.id, item.id);
                    }
                },
            },
            (connect, monitor) => ({
                connectDragSource: connect.dragSource(),
                isDragging: monitor.isDragging(),
            }),
        )(Node);
        const NodeDragDropSource = DropTarget(
            ItemTypes.NODE,
            {
                drop: ({ itemConfig }) => ({ id: itemConfig.id }),
                canDrop: ({ canDropItem, itemConfig }, monitor) => {
                    const { id } = monitor.getItem();
                    return canDropItem(itemConfig.id, id);
                },
            },
            (connect, monitor) => ({
                connectDropTarget: connect.dropTarget(),
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        )(NodeDragSource);

        const { forecastMethodList } = this.state;
        let forecastMethods = forecastMethodList.length > 0
            && forecastMethodList.map((item, i) => {
                return (
                    <option key={i} value={item.forecastMethodId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);


        let treeLevel = this.state.items.length;
        const treeLevelItems = []
        for (var i = 0; i <= treeLevel; i++) {
            if (i == 0) {
                treeLevelItems.push({
                    annotationType: AnnotationType.Level,
                    levels: [0],
                    title: "Level 0",
                    titleColor: "#002f6c",
                    fontWeight: "bold",
                    transForm: 'rotate(270deg)',
                    offset: new Thickness(0, 0, 0, -1),
                    lineWidth: new Thickness(0, 0, 0, 0),
                    opacity: 0,
                    borderColor: Colors.Gray,
                    // fillColor: "#f5f5f5",
                    lineType: LineType.Dotted
                });
            }
            else if (i % 2 == 0) {
                treeLevelItems.push(new LevelAnnotationConfig({
                    levels: [i],
                    title: "Level " + i,
                    titleColor: "#002f6c",
                    fontWeight: "bold",
                    transForm: 'rotate(270deg)',
                    offset: new Thickness(0, 0, 0, -1),
                    lineWidth: new Thickness(0, 0, 0, 0),
                    opacity: 0,
                    borderColor: Colors.Gray,
                    // fillColor: "#f5f5f5",
                    lineType: LineType.Dotted
                })
                );
            }
            else {
                treeLevelItems.push(new LevelAnnotationConfig({
                    levels: [i],
                    title: "Level " + i,
                    // titleColor: Colors.RoyalBlue,
                    titleColor: "#002f6c",
                    fontWeight: "bold",
                    transForm: 'rotate(270deg)',
                    offset: new Thickness(0, 0, 0, -1),
                    lineWidth: new Thickness(0, 0, 0, 0),
                    opacity: 0.08,
                    borderColor: Colors.Gray,
                    // fillColor: "#f5f5f5",
                    lineType: LineType.Dotted
                }));
            }
            console.log("level json***", treeLevelItems);
        }

        const config = {
            ...this.state,
            // pageFitMode: PageFitMode.Enabled,
            pageFitMode: PageFitMode.None,
            // highlightItem: 0,
            hasSelectorCheckbox: Enabled.False,
            hasButtons: Enabled.True,
            buttonsPanelSize: 40,
            orientationType: OrientationType.Top,
            defaultTemplateName: "contactTemplate",
            linesColor: Colors.Black,
            annotations: treeLevelItems,
            onButtonsRender: (({ context: itemConfig }) => {
                return <>
                    {parseInt(itemConfig.payload.nodeType.id) != 5 &&
                        <button key="1" type="button" className="StyledButton TreeIconStyle" style={{ background: 'none' }}
                            onClick={(event) => {
                                console.log("add button called---------");
                                event.stopPropagation();
                                console.log("add node----", itemConfig);
                                this.setState({
                                    usageText: "",
                                    level0: true,
                                    numberNode: (itemConfig.payload.nodeType.id == 2 ? false : true),
                                    aggregationNode: (itemConfig.payload.nodeType.id == 1 ? false : true),
                                    addNodeFlag: true,
                                    openAddNodeModal: true,
                                    currentItemConfig: {
                                        context: {
                                            isVisible: '',
                                            level: itemConfig.level,
                                            parent: itemConfig.id,
                                            payload: {
                                                label: {
                                                    label_en: ""
                                                },
                                                nodeType: {
                                                    id: ''
                                                },
                                                nodeUnit: {
                                                    id: ''
                                                },
                                                nodeDataMap: [
                                                    [
                                                        {
                                                            dataValue: '',
                                                            calculatedDataValue: '',
                                                            notes: '',
                                                            fuNode: {
                                                                forecastingUnit: {
                                                                    tracerCategory: {

                                                                    },
                                                                    unit: {

                                                                    },
                                                                    label: {
                                                                        label_en: ""
                                                                    }
                                                                },
                                                                usageType: {

                                                                },
                                                                usagePeriod: {

                                                                },
                                                                repeatUsagePeriod: {

                                                                }
                                                            },
                                                            puNode: {
                                                                planningUnit: {
                                                                    unit: {

                                                                    }
                                                                },
                                                                refillMonths: ''
                                                            }
                                                        }
                                                    ]
                                                ]
                                            }
                                        },
                                        parentItem: {
                                            parent: itemConfig.parent,
                                            payload: {
                                                nodeType: {
                                                    id: itemConfig.payload.nodeType.id
                                                },
                                                label: {
                                                    label_en: itemConfig.payload.label.label_en
                                                },
                                                nodeUnit: {
                                                    id: itemConfig.payload.nodeUnit.id
                                                },
                                                nodeDataMap: [
                                                    [
                                                        {
                                                            dataValue: (itemConfig.payload.nodeDataMap[0])[0].dataValue,
                                                            calculatedDataValue: (itemConfig.payload.nodeDataMap[0])[0].calculatedDataValue,
                                                            fuNode: {
                                                                noOfForecastingUnitsPerPerson: (itemConfig.payload.nodeType.id == 4 ? (itemConfig.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson : ''),
                                                                usageFrequency: (itemConfig.payload.nodeType.id == 4 ? (itemConfig.payload.nodeDataMap[0])[0].fuNode.usageFrequency : ''),
                                                                forecastingUnit: {
                                                                    label: {
                                                                        label_en: (itemConfig.payload.nodeType.id == 4 ? (itemConfig.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en : '')
                                                                    },
                                                                    tracerCategory: {

                                                                    },
                                                                    unit: {
                                                                        id: (itemConfig.payload.nodeType.id == 4 ? (itemConfig.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id : '')
                                                                    }
                                                                },
                                                                usageType: {
                                                                    id: (itemConfig.payload.nodeType.id == 4 ? (itemConfig.payload.nodeDataMap[0])[0].fuNode.usageType.id : '')
                                                                },
                                                                usagePeriod: {
                                                                    usagePeriodId: (itemConfig.payload.nodeType.id == 4 ? (itemConfig.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId : '')
                                                                },
                                                                repeatUsagePeriod: {

                                                                },
                                                                noOfPersons: (itemConfig.payload.nodeType.id == 4 ? (itemConfig.payload.nodeDataMap[0])[0].fuNode.noOfPersons : '')
                                                            },
                                                            puNode: {
                                                                planningUnit: {
                                                                    unit: {

                                                                    }
                                                                },
                                                                refillMonths: ''
                                                            }
                                                        }
                                                    ]
                                                ]
                                            }
                                        }

                                    }
                                }, () => {
                                    console.log("add click config---", this.state.currentItemConfig);
                                    console.log("add click nodeflag---", this.state.addNodeFlag);
                                    console.log("item config---", itemConfig);
                                    this.setState({
                                        orgCurrentItemConfig: JSON.parse(JSON.stringify(this.state.currentItemConfig.context)),
                                    });

                                    this.getNodeTypeFollowUpList(itemConfig.payload.nodeType.id);
                                    if (itemConfig.payload.nodeType.id == 4) {
                                        console.log("fu id---", (itemConfig.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id);
                                        this.getPlanningUnitListByFUId((itemConfig.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.idString);
                                        this.getNoOfFUPatient();
                                        this.getNoOfMonthsInUsagePeriod();
                                        this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == itemConfig.parent)[0].payload.nodeUnit.id;
                                    } else {


                                    }
                                    // this.buildJexcelScalingTransfer();
                                });
                                // this.onAddButtonClick(itemConfig);
                            }}>
                            {/* <FontAwesomeIcon icon={faPlus} /> */}
                            <i class="fa fa-plus-square-o" aria-hidden="true"></i>
                        </button>}
                    {/* <button key="2" className="StyledButton" style={{ width: '23px', height: '23px' }}
                        onClick={(event) => {
                            event.stopPropagation();
                        }}>
                        <FontAwesomeIcon icon={faEdit} />
                    </button> */}
                    {itemConfig.parent != null &&
                        <>
                            {/* <button key="2" type="button" className="StyledButton TreeIconStyle" style={{ background: 'none' }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.duplicateNode(itemConfig);
                                }}>
                                <i class="fa fa-clone" aria-hidden="true"></i>
                            </button> */}


                            <button key="3" type="button" className="StyledButton TreeIconStyle" style={{ background: 'none' }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    confirmAlert({
                                        message: "Are you sure you want to delete this node.",
                                        buttons: [
                                            {
                                                label: i18n.t('static.program.yes'),
                                                onClick: () => {
                                                    this.onRemoveButtonClick(itemConfig);
                                                }
                                            },
                                            {
                                                label: i18n.t('static.program.no')
                                            }
                                        ]
                                    });
                                }}>
                                {/* <FontAwesomeIcon icon={faTrash} /> */}
                                <i class="fa fa-trash-o" aria-hidden="true" style={{ fontSize: '16px' }}></i>
                            </button></>}

                </>
            }),
            // itemTitleFirstFontColor: Colors.White,
            templates: [{
                name: "contactTemplate",
                itemSize: { width: 200, height: 80 },
                minimizedItemSize: { width: 2, height: 2 },
                highlightPadding: { left: 1, top: 1, right: 1, bottom: 1 },
                highlightBorderWidth: 1,
                cursorBorderWidth: 2,
                onCursorRender: ({ context: itemConfig }) => {
                    return <div className="CursorFrame ">
                    </div>;
                },
                onHighlightRender: ({ context: itemConfig }) => {
                    return <div className="HighlightFrame " >

                    </div>;
                },
                onItemRender: ({ context: itemConfig }) => {
                    return <NodeDragDropSource
                        itemConfig={itemConfig}
                        onRemoveItem={this.onRemoveItem}
                        canDropItem={this.canDropItem}
                        onMoveItem={this.onMoveItem}
                    />;
                }
            }]
        }
        return <div className="animated fadeIn">
            <AuthenticationServiceComponent history={this.props.history} />
            <h5 className="red" id="div2">
                {i18n.t(this.state.message, { entityname })}</h5>
            <Row>
                <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                    <Card className="mb-lg-0">
                        <div className="Card-header-reporticon pb-lg-0">
                            <div className="card-header-actions">
                                {/* <div className="card-header-actions pr-4 pt-1"> */}
                                <a className="card-header-action">
                                    <span style={{ cursor: 'pointer' }} onClick={this.cancelClicked}><i className="fa fa-long-arrow-left" style={{ color: '#20a8d8' }}></i> <small className="supplyplanformulas">{'Return To List'}</small></span>
                                    {/* <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link> */}
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={docicon} title={i18n.t('static.report.exportWordDoc')} onClick={() => this.exportDoc()} />
                                {/* <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-arrow-left"></i> {'Return To List'}</Button> */}
                                {/* </div> */}
                            </div>
                        </div>
                        <CardBody className="pt-lg-0 pl-lg-0 pr-lg-0">
                            <div className="container-fluid">

                                <Formik
                                    enableReinitialize={true}
                                    initialValues={{
                                        forecastMethodId: this.state.treeTemplate.forecastMethod.id,
                                        treeName: this.state.treeTemplate.label.label_en,
                                        monthsInPast: this.state.treeTemplate.monthsInPast,
                                        monthsInFuture: this.state.treeTemplate.monthsInFuture
                                    }}
                                    validate={validate(validationSchema)}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {
                                        console.log("on submit called-----------------");
                                        var template = this.state.treeTemplate;
                                        console.log("template---", template);
                                        var items = this.state.items;
                                        console.log("items---", items);
                                        var flatList = [];
                                        for (var i = 0; i < items.length; i++) {
                                            console.log("i============", i);
                                            var item = items[i];
                                            console.log("item---", item);
                                            var json = {
                                                id: item.id,
                                                parent: item.parent,
                                                payload: {
                                                    nodeId: item.payload.nodeId,
                                                    nodeType: {
                                                        id: item.payload.nodeType.id
                                                    },
                                                    nodeUnit: {
                                                        id: item.payload.nodeUnit.id
                                                    },
                                                    label: {
                                                        label_en: item.payload.label.label_en
                                                    },
                                                    nodeDataMap:
                                                    {
                                                        0: [
                                                            {
                                                                // month: (item.payload.nodeDataMap[0])[0].month,
                                                                month: '2021-09-01',
                                                                nodeDataId: (item.payload.nodeDataMap[0])[0].nodeDataId,
                                                                dataValue: (item.payload.nodeDataMap[0])[0].dataValue,
                                                                fuNode: (item.payload.nodeDataMap[0])[0].fuNode,
                                                                puNode: (item.payload.nodeDataMap[0])[0].puNode,
                                                                notes: (item.payload.nodeDataMap[0])[0].notes,
                                                                manualChangesEffectFuture : true,
                                                                nodeDataModelingList: (item.payload.nodeDataMap[0])[0].nodeDataModelingList
                                                            }
                                                        ]
                                                    }
                                                },
                                                level: item.level
                                                // sortOrder: item.sortOrder
                                            }
                                            flatList.push(json);
                                        }
                                        console.log("flatList---", flatList);
                                        var templateObj = {
                                            treeTemplateId: template.treeTemplateId,
                                            active: template.active,
                                            monthsInPast: template.monthsInPast,
                                            monthsInFuture: template.monthsInFuture,
                                            label: {
                                                label_en: template.label.label_en
                                            },
                                            forecastMethod: {
                                                id: template.forecastMethod.id
                                            },
                                            flatList: flatList
                                        }
                                        console.log("template obj---", templateObj);
                                        this.setState({
                                            loading: true
                                        })
                                        if (template.treeTemplateId == 0) {
                                            DatasetService.addTreeTemplate(templateObj)
                                                .then(response => {
                                                    console.log("after adding tree---", response.data);
                                                    if (response.status == 200) {
                                                        var items = response.data.flatList;
                                                        var arr = [];
                                                        for (let i = 0; i < items.length; i++) {

                                                            if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                                                                (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (items[i].payload.nodeDataMap[0])[0].dataValue;
                                                            } else {

                                                                var findNodeIndex = items.findIndex(n => n.id == items[i].parent);
                                                                var parentValue = (items[findNodeIndex].payload.nodeDataMap[0])[0].calculatedDataValue;
                                                                console.log("api parent value---", parentValue);

                                                                (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (parentValue * (items[i].payload.nodeDataMap[0])[0].dataValue) / 100;
                                                            }
                                                            console.log("load---", items[i])
                                                            // arr.push(items[i]);
                                                        }
                                                        this.setState({
                                                            treeTemplate: response.data,
                                                            items,
                                                            message: i18n.t('static.message.addTreeTemplate'),
                                                            loading: false
                                                        }, () => {
                                                            console.log(">>>", new Date('2021-01-01').getFullYear(), "+", ("0" + (new Date('2021-12-01').getMonth() + 1)).slice(-2));
                                                            console.log("Tree Template---", this.state.items);
                                                        })
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
                                            console.log("templateObj for update>>>", templateObj);
                                            DatasetService.updateTreeTemplate(templateObj)
                                                .then(response => {
                                                    console.log("after updating tree---", response);
                                                    if (response.status == 200) {
                                                        console.log("message---",i18n.t(response.data.messageCode, { entityname }));
                                                        var items = response.data.flatList;
                                                        var arr = [];
                                                        for (let i = 0; i < items.length; i++) {

                                                            if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                                                                (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (items[i].payload.nodeDataMap[0])[0].dataValue;
                                                            } else {

                                                                var findNodeIndex = items.findIndex(n => n.id == items[i].parent);
                                                                var parentValue = (items[findNodeIndex].payload.nodeDataMap[0])[0].calculatedDataValue;
                                                                console.log("api parent value---", parentValue);

                                                                (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (parentValue * (items[i].payload.nodeDataMap[0])[0].dataValue) / 100;
                                                            }
                                                            console.log("load---", items[i])
                                                            // arr.push(items[i]);
                                                        }
                                                        console.log("message---",i18n.t(response.data.messageCode, { entityname }));
                                                        this.setState({
                                                            treeTemplate: response.data,
                                                            items,
                                                            message: i18n.t('static.message.editTreeTemplate'),
                                                            loading: false
                                                        }, () => {
                                                            console.log(">>>", new Date('2021-01-01').getFullYear(), "+", ("0" + (new Date('2021-12-01').getMonth() + 1)).slice(-2));
                                                            console.log("Tree Template---", this.state.items);
                                                        })
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
                                            <>
                                                <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='userForm' autocomplete="off">
                                                    <CardBody className="pt-0 pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                        <div className="col-md-12 pl-lg-0">
                                                            <Row>
                                                                <FormGroup className="col-md-3 pl-lg-0" style={{ marginBottom: '0px' }}>
                                                                    <Label htmlFor="languageId">{'Forecast Method'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="select"
                                                                        name="forecastMethodId"
                                                                        id="forecastMethodId"
                                                                        bsSize="sm"
                                                                        valid={!errors.forecastMethodId && this.state.treeTemplate.forecastMethod.id != ''}
                                                                        invalid={touched.forecastMethodId && !!errors.forecastMethodId}
                                                                        onBlur={handleBlur}
                                                                        required
                                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        value={this.state.treeTemplate.forecastMethod.id}
                                                                    >
                                                                        <option value="">{i18n.t('static.common.forecastmethod')}</option>
                                                                        {forecastMethods}
                                                                    </Input>
                                                                    <FormFeedback>{errors.forecastMethodId}</FormFeedback>
                                                                </FormGroup>

                                                                <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Template Name'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="treeName"
                                                                        id="treeName"
                                                                        bsSize="sm"
                                                                        valid={!errors.treeName && this.state.treeTemplate.label.label_en != ''}
                                                                        invalid={touched.treeName && !!errors.treeName}
                                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        onBlur={handleBlur}
                                                                        required
                                                                        value={this.state.treeTemplate.label.label_en}
                                                                    >
                                                                    </Input>
                                                                    <FormFeedback>{errors.treeName}</FormFeedback>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-3 pl-lg-0" style={{ marginTop: '28px' }}>
                                                                    <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label>
                                                                    <FormGroup check inline>
                                                                        <Input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            id="active1"
                                                                            name="active"
                                                                            value={true}
                                                                            checked={this.state.treeTemplate.active === true}
                                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
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
                                                                            id="active2"
                                                                            name="active"
                                                                            value={false}
                                                                            checked={this.state.treeTemplate.active === false}
                                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        />
                                                                        <Label
                                                                            className="form-check-label"
                                                                            check htmlFor="inline-radio2">
                                                                            {i18n.t('static.common.disabled')}
                                                                        </Label>
                                                                    </FormGroup>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-3" >
                                                                    <div className="check inline  pl-lg-1 pt-lg-3">
                                                                        <div>
                                                                            <Input
                                                                                className="form-check-input checkboxMargin"
                                                                                type="checkbox"
                                                                                id="active6"
                                                                                name="active6"
                                                                                // checked={false}
                                                                                onClick={(e) => { this.filterPlanningUnitNode(e); }}
                                                                            />
                                                                            <Label
                                                                                className="form-check-label"
                                                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                                                <b>{'Hide Planning Unit'}</b>
                                                                            </Label>
                                                                        </div>
                                                                        <div>
                                                                            <Input
                                                                                className="form-check-input checkboxMargin"
                                                                                type="checkbox"
                                                                                id="active7"
                                                                                name="active7"
                                                                                // checked={false}
                                                                                onClick={(e) => { this.filterPlanningUnitAndForecastingUnitNodes(e) }}
                                                                            />
                                                                            <Label
                                                                                className="form-check-label"
                                                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                                                <b>{'Hide Forecasting Unit & Planning Unit'}</b>
                                                                            </Label>
                                                                        </div>
                                                                    </div>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Months In Past'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="number"
                                                                        name="monthsInPast"
                                                                        id="monthsInPast"
                                                                        bsSize="sm"
                                                                        valid={!errors.monthsInPast && this.state.treeTemplate.monthsInPast != ''}
                                                                        invalid={touched.monthsInPast && !!errors.monthsInPast}
                                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        onBlur={handleBlur}
                                                                        required
                                                                        value={this.state.treeTemplate.monthsInPast}
                                                                    >
                                                                    </Input>
                                                                    <FormFeedback>{errors.monthsInPast}</FormFeedback>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Months In Future'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="number"
                                                                        name="monthsInFuture"
                                                                        id="monthsInFuture"
                                                                        bsSize="sm"
                                                                        min="0"
                                                                        valid={!errors.monthsInFuture && this.state.treeTemplate.monthsInFuture != ''}
                                                                        invalid={touched.monthsInFuture && !!errors.monthsInFuture}
                                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        onBlur={handleBlur}
                                                                        required
                                                                        value={this.state.treeTemplate.monthsInFuture}
                                                                    >
                                                                    </Input>
                                                                    <FormFeedback>{errors.monthsInFuture}</FormFeedback>
                                                                </FormGroup>
                                                            </Row>
                                                        </div>

                                                    </CardBody>
                                                    <div class="sample">
                                                        <Provider>
                                                            <div className="placeholder" style={{ clear: 'both', height: '100vh', border: '1px solid #a7c6ed' }} >
                                                                {/* <OrgDiagram centerOnCursor={true} config={config} onHighlightChanged={this.onHighlightChanged} /> */}
                                                                <OrgDiagram centerOnCursor={true} config={config} onCursorChanged={this.onCursoChanged} />
                                                            </div>
                                                        </Provider>
                                                    </div>
                                                    <CardFooter style={{ backgroundColor: 'transparent', borderTop: '0px solid #c8ced3' }}>
                                                        {/* <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button> */}
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.resetTree}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"> </i>{i18n.t('static.pipeline.save')}</Button>
                                                    </CardFooter>
                                                </Form>

                                            </>
                                        )} />
                            </div>
                        </CardBody>

                    </Card></Col></Row>
            {/* Modal start------------------- */}
            {/* <Draggable handle=".modal-title"> */}

            <Modal isOpen={this.state.openAddNodeModal}
                className={'modal-xl'} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>Add/Edit Node</strong>     {this.state.activeTab1[0] === '2' && <div className="HeaderNodeText"> {
                        this.state.currentItemConfig.context.payload.nodeType.id == 2 ? <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#20a8d8' }}></i> :
                            (this.state.currentItemConfig.context.payload.nodeType.id == 3 ? <i class="fa fa-percent " style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? <i class="fa fa-cube" style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                    (this.state.currentItemConfig.context.payload.nodeType.id == 5 ? <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                        (this.state.currentItemConfig.context.payload.nodeType.id == 1 ? <i class="fa fa-plus" style={{ fontSize: '11px', color: '#20a8d8' }} ></i> : "")
                                    )))}
                        <b className="supplyplanformulas ScalingheadTitle">{this.state.currentItemConfig.context.payload.label.label_en}</b></div>}
                    <Button size="md" onClick={() => this.setState({ openAddNodeModal: false, cursorItem: 0, highlightItem: 0, activeTab1: new Array(2).fill('1') })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col xs="12" md="12" className="mb-4">

                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        active={this.state.activeTab1[0] === '1'}
                                        onClick={() => { this.toggleModal(0, '1'); }}
                                    >
                                        Node Data
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        active={this.state.activeTab1[0] === '2'}
                                        onClick={() => { this.toggleModal(0, '2'); }}
                                    >
                                        Modeling/Transfer
                                    </NavLink>
                                </NavItem>

                            </Nav>
                            <TabContent activeTab={this.state.activeTab1[0]}>
                                {this.tabPane1()}
                            </TabContent>
                        </Col>
                    </Row>

                </ModalBody>
                <ModalFooter>
                    {/* <Button size="md" onClick={(e) => {
                        this.state.addNodeFlag ? this.onAddButtonClick(this.state.currentItemConfig) : this.updateNodeInfoInJson(this.state.currentItemConfig)
                    }} color="success" className="submitBtn float-right mr-1" type="button"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddNodeModal: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button> */}
                </ModalFooter>
            </Modal>
            {/* </Draggable> */}
            {/* Scenario Modal end------------------------ */}

        </div>
    }
}

import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
// import { PDFDocument } from 'pdfkit';
import jsPDF from "jspdf";
import "jspdf-autotable";
import cleanUp from '../../assets/img/calculator.png';
import { LOGO } from '../../CommonComponent/Logo.js';
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
import '../../views/Forms/ValidationForms/ValidationForms.css'
import { Row, Col, Card, CardFooter, Button, CardBody, Form, Modal, ModalBody, PopoverBody, Popover, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, Collapse, InputGroupText, InputGroup } from 'reactstrap';
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
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, TREE_DIMENSION_ID, SECRET_KEY, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DECIMAL_NO_REGEX_LONG, DATE_FORMAT_CAP_WITHOUT_DATE } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import pdfIcon from '../../assets/img/pdf.png';
import CryptoJS from 'crypto-js'
import { MultiSelect } from 'react-multi-select-component';
import Draggable from 'react-draggable';
import { Bar } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { grey } from '@material-ui/core/colors';
import docicon from '../../assets/img/doc.png'
import { saveAs } from "file-saver";
import { Document, ImageRun, Packer, Paragraph, ShadingType, TextRun } from "docx";
import { calculateModelingData } from '../../views/DataSet/ModelingDataCalculation2';
import AuthenticationService from '../Common/AuthenticationService';
import SupplyPlanFormulas from "../SupplyPlan/SupplyPlanFormulas";
import classNames from 'classnames';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

// const ref = React.createRef();
const entityname = 'Tree';
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

const ItemTypes = {
    NODE: i18n.t('static.tree.node')
}

let initialValues = {
    forecastMethodId: "",
    treeName: ""
}

let initialValuesNodeData = {
    nodeTypeId: "",
    nodeTitle: "",
    nodeUnitId: "",
    percentageOfParent: "",
    nodeValue: "",
    tracerCategoryId: "",
    usageTypeIdFU: "",
    lagInMonths: "",
    noOfPersons: "",
    forecastingUnitPerPersonsFC: ""
}

const validationSchemaNodeData = function (values) {
    return Yup.object().shape({
        nodeTypeId: Yup.string()
            .required(i18n.t('static.validation.fieldRequired')),
        nodeTitle: Yup.string()
            .required(i18n.t('static.validation.fieldRequired')),
        nodeUnitId: Yup.string()
            .test('nodeUnitId', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    // console.log("@@@",(parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2) && document.getElementById("nodeUnitId").value == "");
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2) && document.getElementById("nodeUnitId").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        percentageOfParent: Yup.string()
            .test('percentageOfParent', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    var testNumber = document.getElementById("percentageOfParent").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("percentageOfParent").value) : false;
                    // console.log(">>>>*", parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 4) && (document.getElementById("percentageOfParent").value == "" || testNumber == false);
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 4 || parseInt(document.getElementById("nodeTypeId").value) == 5) && (document.getElementById("percentageOfParent").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        nodeValue: Yup.string()
            .test('nodeValue', 'Please enter a valid number having less then 10 digits.',
                function (value) {
                    // console.log("*****", document.getElementById("nodeValue").value);
                    var testNumber = (/^(?!$)\d{0,10}(?:\.\d{1,2})?$/).test((document.getElementById("nodeValue").value).replaceAll(",", ""));
                    // console.log("*****", testNumber);
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2) && (document.getElementById("nodeValue").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        tracerCategoryId: Yup.string()
            .test('tracerCategoryId', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (parseInt(document.getElementById("nodeTypeId").value) == 4 && document.getElementById("tracerCategoryId").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        usageTypeIdFU: Yup.string()
            .test('usageTypeIdFU', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (parseInt(document.getElementById("nodeTypeId").value) == 4 && document.getElementById("usageTypeIdFU").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        lagInMonths:
            Yup.string().test('lagInMonths', 'Please enter a valid number having less then 3 digit befor decimal and 2 digits after decimal.',
                function (value) {
                    // console.log("*****", document.getElementById("nodeValue").value);
                    var testNumber = (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("lagInMonths").value);
                    // console.log("*****", testNumber);
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 4) && (document.getElementById("lagInMonths").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),

        noOfPersons:
            Yup.string().test('noOfPersons', 'Please enter a valid 10 digit number.',
                function (value) {
                    // console.log("*****", document.getElementById("nodeValue").value);
                    var testNumber = (/^\d{0,10}?$/).test((document.getElementById("noOfPersons").value).replaceAll(",", ""));
                    // console.log("*****", testNumber);
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 4) && (document.getElementById("noOfPersons").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),

        forecastingUnitPerPersonsFC:
            Yup.string().test('forecastingUnitPerPersonsFC', 'Please enter a valid number having max 12 digits before decimal and max 2 digit after decimal.',
                function (value) {
                    // console.log("*****", document.getElementById("nodeValue").value);
                    var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("forecastingUnitPerPersonsFC").value).replaceAll(",", ""));
                    // console.log("*****", testNumber);
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 4) && (document.getElementById("forecastingUnitPerPersonsFC").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        // usageFrequency: Yup.string()
        //     .test('usageFrequency', 'Please enter a valid number having max 12 digits before decimal and max 2 digit after decimal.',
        //         function (value) {
        //             // console.log("@@@>1", (parseInt(document.getElementById("nodeTypeId").value) == 4));
        //             // console.log("@@@>1", document.getElementById("usageTypeIdFU").value == 2);
        //             // console.log("@@@>2", document.getElementById("usageFrequency").value == "");
        //             var testNumber = (/^\d{0,12}(\.\d{1,2})?$/).test((document.getElementById("usageFrequency").value).replaceAll(",", ""))
        //             if (document.getElementById("usageTypeIdFU").value == 2 && (document.getElementById("usageFrequency").value == "" || testNumber == false)) {
        //                 return false;
        //             } else {
        //                 return true;
        //             }
        //         }),
        // usagePeriodId: Yup.string()
        //     .test('usagePeriodId', 'This field is required.',
        //         function (value) {
        //             // console.log("@@@>1", (parseInt(document.getElementById("nodeTypeId").value) == 4));
        //             // console.log("@@@>1", document.getElementById("usageTypeIdFU").value == 2);
        //             // console.log("@@@>2", document.getElementById("usageFrequency").value == "");
        //             if (document.getElementById("usageTypeIdFU").value == 2 && document.getElementById("usagePeriodId").value == "") {
        //                 return false;
        //             } else {
        //                 return true;
        //             }

        //         }),

        oneTimeUsage: Yup.string()
            .test('oneTimeUsage', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (document.getElementById("usageTypeIdFU").value == 1 && document.getElementById("oneTimeUsage").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        repeatCount: Yup.string().test('forecastingUnitPerPersonsFC', 'Please enter a valid number having max 12 digits before decimal and max 2 digit after decimal.',
            function (value) {
                var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("repeatCount").value).replaceAll(",", ""));
                if (document.getElementById("oneTimeUsage").value == 2 && (document.getElementById("repeatCount").value == "" || testNumber == false)) {
                    return false;
                } else {
                    return true;
                }
            }),
        planningUnitId: Yup.string()
            .test('planningUnitId', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (parseInt(document.getElementById("nodeTypeId").value) == 5 && document.getElementById("planningUnitId").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),

        refillMonths: Yup.string()
            .test('refillMonths', 'Please enter a valid number having less then 10 digits.',
                function (value) {
                    // console.log("*****", document.getElementById("nodeValue").value);
                    // var testNumber = (/^(?!$)\d{0,10}?$/).test((document.getElementById("refillMonths").value).replaceAll(",", ""));
                    // console.log("*****", testNumber);
                    if ((document.getElementById("nodeTypeId").value == 5 && document.getElementById("usageTypeIdPU").value == 2) && (document.getElementById("refillMonths").value == "")) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        sharePlanningUnit: Yup.string()
            .test('sharePlanningUnit', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (document.getElementById("nodeTypeId").value == 5 && document.getElementById("sharePlanningUnit").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),

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
            .required(i18n.t('static.validation.selectForecastMethod')),
        treeName: Yup.string()
            .required(i18n.t('static.validation.selectTreeName')),
        regionId: Yup.string()
            .required(i18n.t('static.common.regiontext')),

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

export default class BuildTree extends Component {
    constructor(props) {
        super(props);
        this.pickAMonth3 = React.createRef()
        this.pickAMonth2 = React.createRef()
        this.pickAMonth1 = React.createRef()
        this.pickAMonth4 = React.createRef()
        this.pickAMonth5 = React.createRef()
        this.state = {
            nodeId: '',
            nodeDataMomList: [],
            scenarioActionType: '',
            defYear1: { year: 2018, month: 4 },
            defYear2: { year: 2020, month: 9 },
            showDiv: false,
            showDiv1: false,
            orgCurrentItemConfig: {},
            treeTemplateObj: [],
            scalingMonth: new Date(),
            showModelingValidation: true,
            scenario: {
                id: '',
                label: {
                    label_en: ''
                },
                notes: ''
            },
            manualChange: true,
            seasonality: true,
            programId: this.props.match.params.programId,
            showMomDataPercent: false,
            currentTargetChangePercentage: '',
            currentTargetChangeNumber: '',
            currentTargetChangePercentageEdit: false,
            currentTargetChangeNumberEdit: false,
            currentRowIndex: '',
            currentEndValue: '',
            currentEndValueEdit: false,
            momListPer: [],
            modelingTypeList: [],
            showModelingJexcelNumber: false,
            filteredModelingType: [],
            minMonth: '',
            maxMonth: '',
            scalingList: [],
            modelingTypeList: [],
            sameLevelNodeList: [],
            scalingTotal: '',
            showMomData: false,
            showCalculatorFields: false,
            momElPer: '',
            momEl: '',
            modelingEl: '',
            currentScenario: {
                dataValue: '',
                fuNode: {
                    forecastingUnit: {
                        label: {
                            label_en: ''
                        }
                    },
                    repeatUsagePeriod: {
                        usagePeriodId: ''
                    }
                }
            },
            parentScenario: [],
            popoverOpen: false,
            regionValues: [],
            selectedScenario: '',
            selectedScenarioLabel: '',
            scenarioList: [],
            regionList: [],
            curTreeObj: {
                forecastMethod: { id: '' },
                label: { label_en: '' },
                notes: '',
                regionList: [],
                active: true
            },
            treeData: [],
            openAddScenarioModal: false,
            openTreeDataModal: false,
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
            usageTemplateListAll: [],
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
                            // [
                            //     {
                            //         dataValue: '',
                            //         notes: '',
                            //         fuNode: {
                            //             forecastingUnit: {
                            //                 id: '',
                            //                 label: {
                            //                     label_en: ""
                            //                 }
                            //             },
                            //             repeatUsagePeriod: {
                            //                 usagePeriodId: 0
                            //             }
                            //         },
                            //         puNode: {
                            //             planningUnit: {

                            //             },
                            //             refillMonths: ''
                            //         }
                            //     }
                            // ]
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
                }
            },
            momList: [],
            activeTab1: new Array(2).fill('1'),
            tracerCategoryList: [],
            tracerCategoryList: [],
            forecastMethodList: [],
            unitOfDimensionIdFour: [],
            unitList: [],
            usagePeriodList: [],
            usageTypeList: [],
            usageTemplateList: [],
            forecastingUnitByTracerCategory: [],
            planningUnitByTracerCategory: [],
            datasetList: [],
            forecastStartDate: '',
            forecastStopDate: '',
            momListPer: [],
            momListPerParent: [],
            parentNodeDataMap: [],
            modelinDataForScenario: [],
            dataSetObj: {
                programData: ''
            },
            loading: false
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
        this.scenarioChange = this.scenarioChange.bind(this);
        this.updateNodeInfoInJson = this.updateNodeInfoInJson.bind(this);
        this.nodeTypeChange = this.nodeTypeChange.bind(this);
        this.addScenario = this.addScenario.bind(this);
        this.getNodeValue = this.getNodeValue.bind(this);
        this.getNotes = this.getNotes.bind(this);
        this.calculateNodeValue = this.calculateNodeValue.bind(this);
        this.hideTreeValidation = this.hideTreeValidation.bind(this);
        this.filterPlanningUnitNode = this.filterPlanningUnitNode.bind(this);
        this.filterPlanningUnitAndForecastingUnitNodes = this.filterPlanningUnitAndForecastingUnitNodes.bind(this);
        this.getForecastingUnitListByTracerCategoryId = this.getForecastingUnitListByTracerCategoryId.bind(this);
        this.getNoOfMonthsInUsagePeriod = this.getNoOfMonthsInUsagePeriod.bind(this);
        this.getNoFURequired = this.getNoFURequired.bind(this);
        this.getUsageText = this.getUsageText.bind(this);
        this.copyDataFromUsageTemplate = this.copyDataFromUsageTemplate.bind(this);
        this.getUsageTemplateList = this.getUsageTemplateList.bind(this);
        this.filterUsageTemplateList = this.filterUsageTemplateList.bind(this);
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
        this.getTracerCategoryList = this.getTracerCategoryList.bind(this);
        this.getForecastMethodList = this.getForecastMethodList.bind(this);
        this.getUnitListForDimensionIdFour = this.getUnitListForDimensionIdFour.bind(this);
        this.getUnitList = this.getUnitList.bind(this);
        this.getUsagePeriodList = this.getUsagePeriodList.bind(this);
        this.getUsageTypeList = this.getUsageTypeList.bind(this);
        this.getForecastingUnitListByTracerCategory = this.getForecastingUnitListByTracerCategory.bind(this);
        this.getPlanningUnitListByForecastingUnitId = this.getPlanningUnitListByForecastingUnitId.bind(this);
        this.getScenarioList = this.getScenarioList.bind(this);
        this.getTreeList = this.getTreeList.bind(this);
        this.getTreeByTreeId = this.getTreeByTreeId.bind(this);
        this.getTreeTemplateById = this.getTreeTemplateById.bind(this);
        this.toggle = this.toggle.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.buildModelingJexcel = this.buildModelingJexcel.bind(this);
        this.setStartAndStopDateOfProgram = this.setStartAndStopDateOfProgram.bind(this);
        this.getModelingTypeList = this.getModelingTypeList.bind(this);
        this.getSameLevelNodeList = this.getSameLevelNodeList.bind(this);
        this.momCheckbox = this.momCheckbox.bind(this);
        this.calculateScalingTotal = this.calculateScalingTotal.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.acceptValue = this.acceptValue.bind(this);
        this.calculateMomByEndValue = this.calculateMomByEndValue.bind(this);
        this.calculateMomByChangeInPercent = this.calculateMomByChangeInPercent.bind(this);
        this.calculateMomByChangeInNumber = this.calculateMomByChangeInNumber.bind(this);
        this.addRow = this.addRow.bind(this);
        this.showMomData = this.showMomData.bind(this);
        this.buildMomJexcelPercent = this.buildMomJexcelPercent.bind(this);
        this.buildMomJexcel = this.buildMomJexcel.bind(this);
        this.openScenarioModal = this.openScenarioModal.bind(this);
        this.getStartValueForMonth = this.getStartValueForMonth.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.updateMomDataInDataSet = this.updateMomDataInDataSet.bind(this);
        // this.updateMomDataPerInDataSet = this.updateMomDataPerInDataSet.bind(this);
        this.updateTreeData = this.updateTreeData.bind(this);
        this.updateState = this.updateState.bind(this);
        this.saveTreeData = this.saveTreeData.bind(this);
        this.calculateAfterDragDrop = this.calculateAfterDragDrop.bind(this);
        // this.treeCalculations = this.treeCalculations.bind(this);
        this.callAfterScenarioChange = this.callAfterScenarioChange.bind(this);
        this.filterScalingDataByMonth = this.filterScalingDataByMonth.bind(this);
        this.createOrUpdateTree = this.createOrUpdateTree.bind(this);
        this.treeDataChange = this.treeDataChange.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
        this.resetNodeData = this.resetNodeData.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.fetchTracerCategoryList = this.fetchTracerCategoryList.bind(this);
        this.calculateMOMData = this.calculateMOMData.bind(this);
        this.changed1 = this.changed1.bind(this);
    }
    calculateMOMData(nodeId, type) {
        let { curTreeObj } = this.state;
        let { treeData } = this.state;
        let { dataSetObj } = this.state;
        var items = this.state.items;
        var programData = dataSetObj.programData;
        console.log("program data>>> 1", programData);
        programData.treeList = treeData;
        console.log("program data>>> 2", programData);

        curTreeObj.tree.flatList = items;
        curTreeObj.scenarioList = this.state.scenarioList;
        var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
        treeData[findTreeIndex] = curTreeObj;

        programData.treeList = treeData;
        dataSetObj.programData = programData;
        console.log("dataSetDecrypt>>>", dataSetObj);
        calculateModelingData(dataSetObj, this, '', (nodeId != 0 ? nodeId : this.state.currentItemConfig.context.id), this.state.selectedScenario, type);
    }
    fetchTracerCategoryList(programData) {
        console.log("programData---%%%%%%%", programData);
        var planningUnitList = programData.planningUnitList.filter(x => x.treeForecast == true);
        var updatedPlanningUnitList = [];
        var forecastingUnitList = [];
        var tracerCategoryList = [];
        planningUnitList.map(item => {
            forecastingUnitList.push({
                label: item.planningUnit.forecastingUnit.label, id: item.planningUnit.forecastingUnit.id,
                unit: item.planningUnit.forecastingUnit.unit
            })
        })

        planningUnitList.map(item => {
            updatedPlanningUnitList.push({
                label: item.planningUnit.label, id: item.planningUnit.id,
                unit: item.planningUnit.unit,
                forecastingUnit: item.planningUnit.forecastingUnit,
                multiplier: item.planningUnit.multiplier
            })
        })
        console.log("duplicate fu list--->", forecastingUnitList);
        planningUnitList.map(item => {
            tracerCategoryList.push({
                label: item.planningUnit.forecastingUnit.tracerCategory.label, tracerCategoryId: item.planningUnit.forecastingUnit.tracerCategory.id
            })
        })
        console.log("duplicate tc list--->", tracerCategoryList);
        forecastingUnitList = [...new Map(forecastingUnitList.map(v => [v.id, v])).values()];
        console.log("unique fu list--->", forecastingUnitList);
        tracerCategoryList = [...new Map(tracerCategoryList.map(v => [v.id, v])).values()];
        // console.log("unique tc list--->", tracerCategoryList);
        this.setState({
            tracerCategoryList,
            forecastingUnitList,
            planningUnitList: updatedPlanningUnitList
        });
    }

    alertfunction() {
        console.log(">>>hi");
        console.log(">>>", document.getElementById("usageFrequency").value)

    }

    resetNodeData() {
        console.log("reset node data function called");
        const { orgCurrentItemConfig, currentItemConfig } = this.state;
        currentItemConfig.context = JSON.parse(JSON.stringify(orgCurrentItemConfig));
        // currentScenario = JSON.parse(JSON.stringify((orgCurrentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0]));
        console.log("============1============", orgCurrentItemConfig);
        this.setState({
            currentItemConfig,
            currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0],
        }, () => {
            console.log("currentItemConfig after---", this.state.orgCurrentItemConfig)
        });
    }

    callAfterScenarioChange(scenarioId) {
        console.log("&&&&scenarioId---", scenarioId);
        let { curTreeObj } = this.state;
        let { currentItemConfig } = this.state;
        let { treeTemplate } = this.state;

        var items = curTreeObj.tree.flatList;
        var scenarioId = scenarioId;
        var arr = [];
        var currentScenario;
        for (let i = 0; i < items.length; i++) {
            console.log("&&&&item---", items[i]);
            console.log("current item --->", items[i].payload.nodeDataMap[scenarioId][0]);
            if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                (items[i].payload.nodeDataMap[scenarioId])[0].calculatedDataValue = (items[i].payload.nodeDataMap[scenarioId])[0].dataValue;
            } else {
                var findNodeIndex = items.findIndex(n => n.id == items[i].parent);
                var parentValue = (items[findNodeIndex].payload.nodeDataMap[scenarioId])[0].calculatedDataValue;
                console.log("api parent value---", parentValue);

                (items[i].payload.nodeDataMap[scenarioId])[0].calculatedDataValue = (parentValue * (items[i].payload.nodeDataMap[scenarioId])[0].dataValue) / 100;
            }
            console.log("load---", items[i])
            // arr.push(items[i]);
        }
        var scenario = document.getElementById("scenarioId");
        var selectedText = scenario.options[scenario.selectedIndex].text;
        console.log("scenarioId in separate function---", scenarioId);
        this.setState({
            items,
            selectedScenario: scenarioId,
            selectedScenarioLabel: selectedText,
            // currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0]

        }, () => {
            this.handleAMonthDissmis3(this.state.singleValue2);
            this.calculateValuesForAggregateNode(items);
            // console.log("currentScenario---", this.state.currentScenario);
        });
    }


    toggleCollapse() {
        this.setState({
            showDiv: !this.state.showDiv
        })
    }
    toggleDropdown() {
        this.setState({
            showDiv1: !this.state.showDiv1
        })
    }
    updateState(parameterName, value) {
        console.log("parameterName---", parameterName);
        console.log("value---", value);
        this.setState({
            [parameterName]: value
        }, () => {
            if (parameterName == 'nodeId' && (value != null && value != 0)) {
                var items = this.state.items;
                var node = items.filter(n => n.id == value)[0];
                (node.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataMomList = this.state.nodeDataMomList;
                var findNodeIndex = items.findIndex(n => n.id == value);
                console.log("findNodeIndex---", findNodeIndex);
                items[findNodeIndex] = node;
                // nodes[findNodeIndex].valueType = currentItemConfig.valueType;
                console.log("items---***", items);
                this.setState({ items })
            }
            if (parameterName == 'type' && value == 1) {
                if (this.state.currentItemConfig.context.payload.nodeType.id == 2) {
                    this.setState({ momList: this.state.nodeDataMomList }, () => {
                        console.log("going to build mom jexcel");
                        this.buildMomJexcel();
                    });
                } else {
                    this.setState({ momListPer: this.state.nodeDataMomList }, () => {
                        console.log("going to build mom jexcel percent");
                        this.buildMomJexcelPercent();
                    });
                }


            }
            console.log("returmed list---", this.state.nodeDataMomList);
            this.updateTreeData();
        })
    }

    calculateAfterDragDrop() {
        // var dataSetObj = this.state.datasetList.filter(c => c.programId == this.state.programId)[0];
        // var dataEnc = dataSetObj;
        // var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
        // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
        // console.log("dataSetObj.programData***>>>", programData);
        // this.setState({ dataSetObj: dataSetObj, forecastStartDate: programData.currentVersion.forecastStartDate, forecastStopDate: programData.currentVersion.forecastStopDate }, () => {
        //     calculateModelingData(dataEnc, this, "BuildTree");
        // });
        var items = this.state.curTreeObj.tree.flatList;
        console.log("items>>>", items);
        for (let i = 0; i < items.length; i++) {
            var nodeDataModelingMap = this.state.modelinDataForScenario.filter(c => c.nodeDataId == items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId);
            (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = nodeDataModelingMap[0].calculatedValue;
            (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = nodeDataModelingMap[0].endValue;
        }
        this.setState({
            items,
        })
    }
    saveTreeData() {
        console.log("saving tree data for calculation>>>");
        this.setState({ loading: true });
        let { curTreeObj } = this.state;
        let { treeData } = this.state;
        let { dataSetObj } = this.state;
        var items = this.state.items;

        // var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
        // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
        var programData = dataSetObj.programData;
        programData.treeList = treeData;
        console.log("program data>>>", programData);

        curTreeObj.tree.flatList = items;
        curTreeObj.scenarioList = this.state.scenarioList;
        var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
        treeData[findTreeIndex] = curTreeObj;

        // var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
        // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
        programData.treeList = treeData;
        console.log("dataSetDecrypt>>>", programData);


        programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
        dataSetObj.programData = programData;

        console.log("encpyDataSet>>>", dataSetObj)
        // store update object in indexdb
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: '#BA0C2F'
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var programTransaction = transaction.objectStore('datasetData');
            // programs.forEach(program => {
            var programRequest = programTransaction.put(dataSetObj);
            transaction.oncomplete = function (event) {
                db1 = e.target.result;
                var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                var datasetDetailsRequest = datasetDetailsTransaction.get(this.props.match.params.programId);
                datasetDetailsRequest.onsuccess = function (e) {
                    console.log("all good >>>>");
                    console.log("Data update success");
                    var datasetDetailsRequestJson = datasetDetailsRequest.result;
                    datasetDetailsRequestJson.changed = 1;
                    var programQPLDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                    // calculateModelingData(dataSetObj, this, '',,this.state.selectedScenario);
                }.bind(this);
                datasetDetailsRequest.onerror = function (event) {
                    this.setState({
                        loading: false,
                        // message: 'Error occured.',
                        color: "#BA0C2F",
                    }, () => {
                        this.hideSecondComponent();
                    });
                    console.log("Data update errr");
                }.bind(this)

                // this.setState({
                //     loading: false,
                //     message: i18n.t('static.mt.dataUpdateSuccess'),
                //     color: "green",
                //     isChanged: false
                // }, () => {
                //     this.hideSecondComponent();
                //     this.buildJExcel();
                // });

            }.bind(this);
            transaction.onerror = function (event) {
                this.setState({
                    loading: false,
                    // message: 'Error occured.',
                    color: "#BA0C2F",
                }, () => {
                    this.hideSecondComponent();
                });
                console.log("Data update errr");
            }.bind(this);
        }.bind(this);

    }


    createOrUpdateTree() {
        if (this.state.treeId != null) {
            console.log("inside if hurrey------------------");
            this.setState({
                showDiv: false
            })
        } else {

            const { treeData } = this.state;
            const { curTreeObj } = this.state;
            var maxTreeId = Math.max(...treeData.map(o => o.treeId));
            console.log("tree data----", curTreeObj)
            // curTreeObj.treeId = parseInt(maxTreeId) + 1;
            var nodeDataMap = {};
            var tempArray = [];
            var tempJson = {
                notes: '',
                month: '',
                dataValue: "",
                calculatedDataValue: '',
                displayDataValue: '',
                nodeDataModelingList: [],
                nodeDataOverrideList: [],
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
            var treeId = parseInt(maxTreeId) + 1;
            console.log("region values---", this.state.regionValues);

            var tempTree = {
                treeId: treeId,
                active: curTreeObj.active,
                forecastMethod: curTreeObj.forecastMethod,
                label: curTreeObj.label,
                notes: curTreeObj.notes,
                regionList: curTreeObj.regionList,
                scenarioList: [{
                    id: 1,
                    label: {
                        label_en: i18n.t('static.realm.default')
                    },
                    active: true,
                    notes: ''
                }],
                tree: {
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
            treeData.push(tempTree);
            console.log("create update tree object 1--->>>", tempTree);
            console.log("create update tree object 2--->>>", treeData);
            this.setState({
                treeId,
                treeData,
                showDiv: false
            }, () => {
                console.log("---------->>>>>>>>", this.state.regionValues);
                this.getTreeByTreeId(treeId);
                this.updateTreeData();
            })

        }
    }

    filterScalingDataByMonth(date) {
        // console.log("date--->>>>>>>", date);
        var json = this.state.modelingEl.getJson(null, false);
        // console.log("modelingElData>>>", json);
        var scalingTotal = 0;
        for (var i = 0; i < json.length; i++) {
            var calculatedChangeForMonth = 0;
            var map1 = new Map(Object.entries(json[i]));
            var startDate = map1.get("3");
            var stopDate = map1.get("4");
            var modelingTypeId = map1.get("2");
            var dataValue = modelingTypeId == 2 ? map1.get("6") : map1.get("5");
            const result = moment(date).isBetween(startDate, stopDate, null, '[)');
            console.log("modelingTypeId---", modelingTypeId);
            if (result) {
                var nodeValue = this.state.currentScenario.calculatedDataValue;

                if (modelingTypeId == 2 || modelingTypeId == 5) {
                    calculatedChangeForMonth = parseFloat(dataValue).toFixed(2);
                } else if (modelingTypeId == 3 || modelingTypeId == 4) {
                    calculatedChangeForMonth = parseFloat((nodeValue * dataValue) / 100).toFixed(2);
                }
            }
            this.state.modelingEl.setValueFromCoords(8, i, calculatedChangeForMonth, true);
            scalingTotal = parseFloat(scalingTotal) + parseFloat(calculatedChangeForMonth);
        }
        this.setState({ scalingTotal });

    }

    // updateMomDataPerInDataSet() {
    //     var json = this.state.momElPer.getJson(null, false);
    //     console.log("momData>>>", json);
    //     var overrideListArray = [];
    //     for (var i = 0; i < json.length; i++) {
    //         var map1 = new Map(Object.entries(json[i]));
    //         if (map1.get("3") != '') {
    //             var overrideData = {
    //                 month: map1.get("0"),
    //                 seasonalityPerc: 0,
    //                 manualChange: map1.get("3"),
    //                 nodeDataId: map1.get("7"),
    //                 active: true
    //             }
    //             console.log("overrideData>>>", overrideData);
    //             overrideListArray.push(overrideData);
    //         }
    //     }
    //     console.log("overRide data list>>>", overrideListArray);
    //     let { currentItemConfig } = this.state;
    //     let { curTreeObj } = this.state;
    //     let { treeData } = this.state;
    //     let { dataSetObj } = this.state;
    //     var items = this.state.items;
    //     (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataOverrideList = overrideListArray;
    //     this.setState({ currentItemConfig }, () => {
    //         // console.log("currentIemConfigInUpdetMom>>>", currentItemConfig);
    //         var findNodeIndex = items.findIndex(n => n.id == currentItemConfig.context.id);
    //         items[findNodeIndex] = currentItemConfig.context;
    //         // console.log("items>>>", items);
    //         curTreeObj.tree.flatList = items;

    //         var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
    //         treeData[findTreeIndex] = curTreeObj;

    //         // var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
    //         // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
    //         var programData = dataSetObj.programData;
    //         programData.treeList = treeData;
    //         console.log("dataSetDecrypt>>>", programData);


    //         programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
    //         dataSetObj.programData = programData;

    //         console.log("encpyDataSet>>>", dataSetObj)
    //         // store update object in indexdb
    //         var db1;
    //         getDatabase();
    //         var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    //         openRequest.onerror = function (event) {
    //             this.setState({
    //                 message: i18n.t('static.program.errortext'),
    //                 color: '#BA0C2F'
    //             })
    //             this.hideFirstComponent()
    //         }.bind(this);
    //         openRequest.onsuccess = function (e) {
    //             db1 = e.target.result;
    //             var transaction = db1.transaction(['datasetData'], 'readwrite');
    //             var programTransaction = transaction.objectStore('datasetData');
    //             // programs.forEach(program => {
    //             var programRequest = programTransaction.put(dataSetObj);
    //             console.log("---hurrey---");
    //             // })
    //             transaction.oncomplete = function (event) {
    //                 // calculateModelingData(dataSetObj,'');
    //                 console.log("all good >>>>");

    //                 // this.setState({
    //                 //     loading: false,
    //                 //     message: i18n.t('static.mt.dataUpdateSuccess'),
    //                 //     color: "green",
    //                 //     isChanged: false
    //                 // }, () => {
    //                 //     this.hideSecondComponent();
    //                 //     this.buildJExcel();
    //                 // });
    //                 console.log("Data update success");
    //             }.bind(this);
    //             transaction.onerror = function (event) {
    //                 this.setState({
    //                     loading: false,
    //                     // message: 'Error occured.',
    //                     color: "#BA0C2F",
    //                 }, () => {
    //                     this.hideSecondComponent();
    //                 });
    //                 console.log("Data update errr");
    //             }.bind(this);
    //         }.bind(this);
    //     });
    //     // nodeDataId,month,manualChangeValue,seconalityPer
    // }
    updateMomDataInDataSet() {
        let { dataSetObj } = this.state;
        var programData = dataSetObj.programData;
        console.log("dataSetDecrypt>>>", programData);

        programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
        dataSetObj.programData = programData;

        console.log("encpyDataSet>>>", dataSetObj)
        // store update object in indexdb
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: '#BA0C2F'
            })
            this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var programTransaction = transaction.objectStore('datasetData');
            // programs.forEach(program => {
            var programRequest = programTransaction.put(dataSetObj);
            console.log("---hurrey---");
            // })
            transaction.oncomplete = function (event) {
                // calculateModelingData(dataSetObj,'');
                console.log("all good >>>>");

                // this.setState({
                //     loading: false,
                //     message: i18n.t('static.mt.dataUpdateSuccess'),
                //     color: "green",
                //     isChanged: false
                // }, () => {
                //     this.hideSecondComponent();
                //     this.buildJExcel();
                // });
                console.log("Data update success");
            }.bind(this);
            transaction.onerror = function (event) {
                this.setState({
                    loading: false,
                    // message: 'Error occured.',
                    color: "#BA0C2F",
                }, () => {
                    this.hideSecondComponent();
                });
                console.log("Data update errr");
            }.bind(this);
        }.bind(this);
        // nodeDataId,month,manualChangeValue,seconalityPer
    }
    getStartValueForMonth(dateValue) {
        console.log("***", this.state.parentNodeDataMap);
    }
    openScenarioModal(type) {
        console.log("type---------", type);
        var scenarioId = this.state.selectedScenario;
        this.setState({
            scenarioActionType: type
        })
        if (type != 3) {
            if (type == 2) {
                console.log("edit scenario");
                if (scenarioId != "") {
                    console.log("my scenarioId---", scenarioId);
                    var scenario = this.state.scenarioList.filter(x => x.id == scenarioId)[0];
                    console.log("my scenario---", scenario);
                    this.setState({
                        scenario,
                        openAddScenarioModal: !this.state.openAddScenarioModal
                    })
                } else {
                    alert("Please select scenario first.")
                }
            } else {
                console.log("add scenario");
                var scenario = {
                    label: {
                        label_en: ''
                    },
                    notes: ''
                }
                this.setState({
                    scenario,
                    openAddScenarioModal: !this.state.openAddScenarioModal
                })
            }

        } else {
            if (this.state.selectedScenario != "") {
                confirmAlert({
                    message: "Are you sure you want to delete this scenario.",
                    buttons: [
                        {
                            label: i18n.t('static.program.yes'),
                            onClick: () => {
                                this.addScenario();
                            }
                        },
                        {
                            label: i18n.t('static.program.no')
                        }
                    ]
                });
            } else {
                alert("Please select scenario first.")
            }
        }
    }
    buildMomJexcelPercent() {
        this.getStartValueForMonth('');
        var parentStartValue = this.state.parentScenario.calculatedDataValue;
        console.log("parentStartValue---", parentStartValue)
        var momList = this.state.momListPer;
        var momListParent = this.state.momListPerParent;
        var dataArray = [];
        let count = 0;
        for (var j = 0; j < momList.length; j++) {
            data = [];
            data[0] = momList[j].month
            data[1] = parseFloat(momList[j].startValue).toFixed(2)
            data[2] = parseFloat(momList[j].difference).toFixed(2)
            data[3] = parseFloat(momList[j].manualChange).toFixed(2)
            data[4] = parseFloat(momList[j].endValue).toFixed(2)
            // `=B${parseInt(j) + 1}+C${parseInt(j) + 1}+D${parseInt(j) + 1}`
            data[5] = parseFloat(momListParent[j].calculatedValue).toFixed(2)
            data[6] = parseFloat(momList[j].calculatedValue).toFixed(2)
            // data[6] = this.state.manualChange ? momList[j].calculatedValue : ((momListParent[j].manualChange > 0) ? momListParent[j].endValueWithManualChangeWMC : momListParent[j].calculatedValueWMC *  momList[j].endValueWithManualChangeWMC) / 100
            data[7] = this.state.currentScenario.nodeDataId
            // `=ROUND(((E${parseInt(j) + 1}*F${parseInt(j) + 1})/100),0)`
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
                    title: i18n.t('static.common.month'),
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                },
                {
                    title: i18n.t('static.tree.%of') + getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) + i18n.t('static.tree.monthStart'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true

                },
                {
                    title: i18n.t('static.tree.calculatedChange'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.manualChange'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.'

                },
                {
                    title: i18n.t('static.tree.%of') + getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) + i18n.t('static.tree.MonthEnd'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) + i18n.t('static.tree.MonthEnd'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true

                },
                {
                    title: getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) + i18n.t('static.tree.MonthEnd'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: 'Node data id',
                    type: 'hidden',

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
            onchange: this.changed2,
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
        console.log("momList--->", momList);
        var dataArray = [];
        let count = 0;
        for (var j = 0; j < momList.length; j++) {
            data = [];


            // data[1] = this.state.manualChange ? parseFloat(momList[j].startValue).toFixed(2) : parseFloat(momList[j].startValueWMC).toFixed(2)
            // data[2] = parseFloat(momList[j].difference).toFixed(2)
            // data[3] = this.state.manualChange ? parseFloat(momList[j].endValueWithoutAddingManualChange).toFixed(2) : parseFloat(momList[j].endValueWithoutAddingManualChangeWMC).toFixed(2)
            // data[4] = parseFloat(momList[j].seasonalityPerc).toFixed(2)
            // data[5] = parseFloat(momList[j].manualChange).toFixed(2)
            // data[6] = this.state.manualChange ? parseFloat(momList[j].endValue).toFixed(2) : (momList[j].seasonalityPerc > 0 || momList[j].manualChange > 0) ? parseFloat(momList[j].endValueWithManualChangeWMC).toFixed(2) : parseFloat(momList[j].endValueWMC).toFixed(2)
            // data[7] = momList[j].nodeDataId
            data[0] = momList[j].month
            data[1] = parseFloat(momList[j].startValue).toFixed(2)
            data[2] = parseFloat(momList[j].difference).toFixed(2)
            data[3] = parseFloat(momList[j].endValueWMC).toFixed(2)
            data[4] = parseFloat(momList[j].seasonalityPerc).toFixed(2)
            data[5] = parseFloat(momList[j].manualChange).toFixed(2)
            data[6] = parseFloat(momList[j].endValue).toFixed(2)
            data[7] = this.state.currentScenario.nodeDataId
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
                    // 0
                    title: i18n.t('static.common.month'),
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                },
                {
                    // 1
                    title: i18n.t('static.tree.monthStartNoSeasonality'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true

                },
                {
                    // 2
                    title: i18n.t('static.tree.calculatedChange+-'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    // 3
                    title: i18n.t('static.tree.monthlyEndNoSeasonality'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    // 4
                    title: i18n.t('static.tree.seasonalityIndex'),
                    type: this.state.seasonality == true ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.',
                },
                {
                    // 5
                    title: i18n.t('static.tree.manualChange+-'),
                    type: this.state.seasonality == true ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.',

                },
                {
                    title: i18n.t('static.tree.MonthEnd'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: "Node data id",
                    type: 'hidden',
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
            onchange: this.changed1,
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

    showMomData() {
        console.log("show mom data---", this.state.currentScenario);
        var getMomDataForCurrentNode = this.state.currentScenario.nodeDataMomList;
        console.log("getMomDataForCurrentNode>>>", getMomDataForCurrentNode);
        if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
            var getMomDataForCurrentNodeParent = this.state.parentScenario.nodeDataMomList;
            console.log("in if>>>>", getMomDataForCurrentNodeParent);

            this.setState({ showMomDataPercent: true, showMomData: false, momListPer: getMomDataForCurrentNode, momListPerParent: getMomDataForCurrentNodeParent }, () => {
                this.buildMomJexcelPercent();
            });
        } else {
            console.log("in else>>>>");
            this.setState({ showMomDataPercent: false, showMomData: true, momList: getMomDataForCurrentNode }, () => {
                this.buildMomJexcel();
            });
        }
        // var db1;
        // getDatabase();
        // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        // openRequest.onsuccess = function (e) {
        //     var programId = this.state.programId;
        //     db1 = e.target.result;
        //     var transaction = db1.transaction(['datasetData'], 'readwrite');
        //     var program = transaction.objectStore('datasetData');
        //     var getRequest = program.get(programId.toString());
        //     getRequest.onerror = function (event) {
        //         this.setState({
        //             supplyPlanError: i18n.t('static.program.errortext')
        //         });
        //     };
        //     getRequest.onsuccess = function (event) {
        //         // console.log("hi",getRequest.result);
        //         var programDataBytes = CryptoJS.AES.decrypt(getRequest.result.programData, SECRET_KEY);
        //         var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
        //         var programJson = JSON.parse(programData);
        //         // console.log("hi bro", programJson.nodeDataModelingList)
        //         var getMomDataForCurrentNode = programJson.nodeDataModelingList.filter(c => c.id == this.state.currentItemConfig.context.id && c.nodeDataId == this.state.currentScenario.nodeDataId);
        //         console.log("getMomDataForCurrentNode>>>", getMomDataForCurrentNode);

        //         if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
        //             var getMomDataForCurrentNodeParent = programJson.nodeDataModelingList.filter(c => c.id == this.state.currentItemConfig.parentItem.id && c.nodeDataId == this.state.parentScenario.nodeDataId);
        //             console.log("in if>>>>", getMomDataForCurrentNodeParent);

        //             this.setState({ showMomDataPercent: true, showMomData: false, momListPer: getMomDataForCurrentNode, momListPerParent: getMomDataForCurrentNodeParent }, () => {
        //                 this.buildMomJexcelPercent();
        //             });
        //         } else {
        //             console.log("in else>>>>");
        //             this.setState({ showMomDataPercent: false, showMomData: true, momList: getMomDataForCurrentNode }, () => {
        //                 this.buildMomJexcel();
        //             });
        //         }
        //     }.bind(this)
        // }.bind(this)


    }
    setStartAndStopDateOfProgram(programId) {
        console.log("programId>>>", programId);
        var proList = [];
        if (programId != "") {
            var dataSetObj = this.state.datasetList.filter(c => c.id == programId)[0];
            console.log("dataSetObj>>>", dataSetObj);
            var datasetEnc = dataSetObj;
            var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            console.log("programData---?????????", programData);
            dataSetObj.programData = programData;
            var treeList = programData.treeList;
            for (var k = 0; k < treeList.length; k++) {
                proList.push(treeList[k])
            }
            if (this.state.treeTemplateObj != null && this.state.treeTemplateObj != "") {
                proList.push(this.state.treeTemplateObj);
                // this.setState
            }
            this.setState({
                dataSetObj,
                realmCountryId: programData.realmCountry.realmCountryId,
                treeData: proList,
                items: [],
                selectedScenario: '',
                programId,
                // singleValue2: {},
                // defYear1: { year: 2021, month: 1 },
                // defYear2: { year: 2021, month: 12 },
                forecastStartDate: programData.currentVersion.forecastStartDate,
                forecastStopDate: programData.currentVersion.forecastStopDate,
                minDate: { year: new Date(programData.currentVersion.forecastStartDate).getFullYear(), month: new Date(programData.currentVersion.forecastStartDate).getMonth() + 1 },
                maxDate: { year: new Date(programData.currentVersion.forecastStopDate).getFullYear(), month: new Date(programData.currentVersion.forecastStopDate).getMonth() + 1 },
            }, () => {
                console.log("program id after update--->", this.state.programId);
                console.log("program min date--->", this.state.minDate);
                console.log("program max date--->", this.state.maxDate);
                this.fetchTracerCategoryList(programData);
                // if (proList.length == 1) {
                //     var treeId = proList[0].treeId;
                //     this.setState({
                //         treeId: treeId
                //     }, () => {
                //         this.getTreeByTreeId(treeId);
                //     })
                // }

                // this.getTreeList();
            });
        } else {
            this.setState({
                dataSetObj: [],
                realmCountryId: '',
                items: [],
                selectedScenario: '',
                programId,
                treeData: proList
            })
        }
        this.getRegionList();
    }
    momCheckbox(e) {
        var checked = e.target.checked;
        const { currentItemConfig } = this.state;

        if (e.target.name === "manualChange") {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].manualChangesEffectFuture = (e.target.checked == true ? true : false)
            this.setState({
                currentItemConfig,
                currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0]
            }, () => {
                this.calculateMOMData(0, 1);
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
    // updateState(parameterName, value) {
    //     this.setState({
    //         [parameterName]: value
    //     })
    // }
    formSubmit() {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({
                // loading: true
            })
            var tableJson = this.el.getJson(null, false);
            var data = this.state.currentScenario.nodeDataModelingList;
            var maxModelingId = data.length > 0 ? Math.max(...data.map(o => o.nodeDataModelingId)) : 0;
            var obj;
            var items = this.state.items;
            var item = items.filter(x => x.id == this.state.currentItemConfig.context.id)[0];
            const itemIndex1 = items.findIndex(o => o.id === this.state.currentItemConfig.context.id);
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("9 map---" + map1.get("9"))
                if (parseInt(map1.get("10")) === 1) {
                    if (map1.get("9") != "" && map1.get("9") != 0) {
                        const itemIndex = data.findIndex(o => o.nodeDataModelingId === map1.get("9"));
                        console.log("data[itemIndex]---", data[itemIndex]);
                        obj = data.filter(x => x.nodeDataModelingId == map1.get("9"))[0];
                        console.log("obj--->>>>>", obj);
                        var transfer = map1[0] != "" ? map1.get("0") : '';
                        console.log("transfer---", transfer);
                        obj.transferNodeDataId = transfer;
                        obj.notes = map1.get("1");
                        obj.modelingType.id = map1.get("2");
                        obj.startDate = map1.get("3");
                        obj.stopDate = map1.get("4");
                        obj.dataValue = map1.get("2") == 2 ? map1.get("6") : map1.get("5");
                        obj.nodeDataModelingId = map1.get("9")

                        data[itemIndex] = obj;
                    } else {
                        console.log("maxModelingId---", maxModelingId);
                        obj = {
                            transferNodeDataId: map1[0] != "" ? map1.get("0") : '',
                            notes: map1.get("1"),
                            modelingType: {
                                id: map1.get("2")
                            },
                            startDate: map1.get("3"),
                            stopDate: map1.get("4"),
                            dataValue: map1.get("2") == 2 ? map1.get("6") : map1.get("5"),
                            nodeDataModelingId: parseInt(maxModelingId) + 1
                        }
                        maxModelingId++;
                        console.log("obj to push---", obj);
                        data.push(obj);
                    }
                    console.log("obj---", obj);
                    console.log("data--->>>", data);
                    (item.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataModelingList = data;
                    console.log("item---", item);
                    items[itemIndex1] = item;
                    console.log("items---", items);
                    // Call function by dolly

                }
            }

            let { curTreeObj } = this.state;
            let { treeData } = this.state;
            let { dataSetObj } = this.state;
            curTreeObj.tree.flatList = items;
            var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
            treeData[findTreeIndex] = curTreeObj;
            var programData = dataSetObj.programData;
            programData.treeList = treeData;
            console.log("dataSetDecrypt>>>", programData);
            dataSetObj.programData = programData;

            console.log("encpyDataSet>>>", dataSetObj)
            this.setState({
                dataSetObj,
                items,
                scalingList: data,
                // openAddNodeModal: false,
                // activeTab1: new Array(2).fill('1')
            }, () => {
                console.log("going to call MOM data");
                this.calculateMOMData(0, 0);
            });
            // store update object in indexdb
            // var db1;
            // getDatabase();
            // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            // openRequest.onerror = function (event) {
            //     this.setState({
            //         message: i18n.t('static.program.errortext'),
            //         color: '#BA0C2F'
            //     })
            //     this.hideFirstComponent()
            // }.bind(this);
            // openRequest.onsuccess = function (e) {
            //     db1 = e.target.result;
            //     var transaction = db1.transaction(['datasetData'], 'readwrite');
            //     var programTransaction = transaction.objectStore('datasetData');
            //     // programs.forEach(program => {
            //     var programRequest = programTransaction.put(dataSetObj);
            //     console.log("---hurrey---");
            //     // })
            //     transaction.oncomplete = function (event) {

            //         this.calculateMOMData(0,1);
            //         console.log("all good >>>>");
            //         this.setState({
            //             dataSetObj,
            //             items,
            //             scalingList: data,
            //             openAddNodeModal: false,
            //             activeTab1: new Array(2).fill('1')
            //         });
            //         console.log("Data update success");
            //     }.bind(this);
            //     transaction.onerror = function (event) {
            //         this.setState({
            //             loading: false,
            //             // message: 'Error occured.',
            //             color: "#BA0C2F",
            //         }, () => {
            //             this.hideSecondComponent();
            //         });
            //         console.log("Data update errr");
            //     }.bind(this);
            // }.bind(this);


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
                    this.el.setComments(col, i18n.t('static.validation.pleaseEnterValidDate'));
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
                        // else if (!(reg.test(value))) {
                        //     this.el.setStyle(col, "background-color", "transparent");
                        //     this.el.setStyle(col, "background-color", "yellow");
                        //     this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        //     valid = false;
                        // }
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
                        // else if (!(reg.test(value))) {
                        //     this.el.setStyle(col, "background-color", "transparent");
                        //     this.el.setStyle(col, "background-color", "yellow");
                        //     this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        //     valid = false;
                        // }
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
        if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
            if (this.state.currentModelingType == 5) {

                elInstance.setValueFromCoords(2, this.state.currentRowIndex, 5, true);
                elInstance.setValueFromCoords(3, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(2), true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(2), true);
            }
        } else {
            if (this.state.currentModelingType == 2) {
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentModelingType, true);
                elInstance.setValueFromCoords(3, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, this.state.currentTargetChangeNumber, true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(2), true);
            } else if (this.state.currentModelingType == 3) {
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentModelingType, true);
                elInstance.setValueFromCoords(3, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentTargetChangePercentage).toFixed(4), true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(2), true);
            } else if (this.state.currentModelingType == 4) {
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentModelingType, true);
                elInstance.setValueFromCoords(3, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentTargetChangePercentage).toFixed(4), true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(2), true);
            }
        }
        this.setState({ showCalculatorFields: false });

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
        var getValue = e.target.value.toString().replaceAll(",", "");
        // console.log("hi>>",this.state.currentItemConfig.context.payload.nodeType.id,",",this.state.currentModelingType);
        // if (this.state.currentItemConfig.context.payload.nodeType.id == 3) {
        //     // var getPervalue = parseFloat(this.state.currentCalculatorStartValue * e.target.value / 100);
        //     // getValue = getPervalue;
        //     var momValue = e.target.value - this.state.currentScenario.dataValue;
        // } else {
        //     getValue = e.target.value
        // }
        if (this.state.currentModelingType == 2) {
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(2);
        }
        if (this.state.currentModelingType == 3) {
            if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
                var getChangeInPercent = (parseFloat(getValue - this.state.currentScenario.dataValue) / monthDifference).toFixed(2);
                var momValue = (this.state.currentScenario.calculatedDataValue * getChangeInPercent / 100).toFixed(2);
                // console.log("getChangeInPercent>>>",getChangeInPercent);
                // console.log("momValue>>>",momValue)
            } else {
                // var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue)) / monthDifference / this.state.currentCalculatorStartValue * 100).toFixed(2);
                var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(2);
            }
        }
        if (this.state.currentModelingType == 4) {
            // var momValue = ((Math.pow(parseFloat(getValue / this.state.currentCalculatorStartValue), parseFloat(1 / monthDifference)) - 1) * 100).toFixed(2);
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue)) / monthDifference).toFixed(2);
        }

        if (this.state.currentModelingType == 5) {
            var momValue = (parseFloat(getValue - this.state.currentScenario.dataValue) / monthDifference).toFixed(2);
        }
        // console.log("getmomValue>>>", momValue);
        var targetChangeNumber = '';
        var targetChangePer = '';
        if (this.state.currentItemConfig.context.payload.nodeType.id < 3) {
            targetChangeNumber = (parseFloat(getValue - this.state.currentCalculatorStartValue) / monthDifference).toFixed(2);
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
            if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
                var getChangeInPercent = e.target.value;
                var momValue = (this.state.currentScenario.calculatedDataValue * getChangeInPercent / 100).toFixed(2);
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


    getSameLevelNodeList(level, id) {
        console.log("level---", level);
        console.log("id---", id);
        var sameLevelNodeList = [];
        var arr = this.state.items.filter(x => x.level == level && x.id != id && x.id > id);
        console.log("arr---", arr);
        for (var i = 0; i < arr.length; i++) {
            sameLevelNodeList[i] = { id: arr[i].id, name: getLabelText(arr[i].payload.label, this.state.lang) }
        }
        console.log("sameLevelNodeList---", sameLevelNodeList);
        this.setState({
            sameLevelNodeList
        });
    }
    getRegionList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['region'], 'readwrite');
            var program = transaction.objectStore('region');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var regionList = [];
                if (this.state.realmCountryId != null && this.state.realmCountryId != "") {
                    regionList = myResult.filter(x => x.realmCountry.realmCountryId == this.state.realmCountryId);
                    console.log("filter if regionList---", regionList);
                } else {
                    regionList = myResult;
                    this.setState({
                        regionValues: []
                    });
                    console.log("filter else regionList---", regionList);
                }
                var regionMultiList = []
                regionList.map(c => {
                    regionMultiList.push({ label: getLabelText(c.label, this.state.lang), value: c.regionId })
                })
                this.setState({
                    regionList,
                    regionMultiList
                });
                for (var i = 0; i < myResult.length; i++) {
                    console.log("myResult--->", myResult[i])

                }

            }.bind(this);
        }.bind(this);
    }

    getModelingTypeList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['modelingType'], 'readwrite');
            var program = transaction.objectStore('modelingType');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                this.setState({
                    modelingTypeList: myResult
                });
                // for (var i = 0; i < myResult.length; i++) {
                //     console.log("datasetList--->", myResult[i])

                // }

            }.bind(this);
        }.bind(this);
    }
    buildModelingJexcel() {
        var scalingList = this.state.currentScenario.nodeDataModelingList;
        console.log("scalingList---", scalingList);
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
            data[5] = scalingList[j].modelingType.id != 2 ? parseFloat(scalingList[j].dataValue).toFixed(4) : ''
            data[6] = scalingList[j].modelingType.id == 2 ? scalingList[j].dataValue : ''
            data[7] = cleanUp
            var nodeValue = this.state.currentScenario.calculatedDataValue;
            var calculatedChangeForMonth;
            if (scalingList[j].modelingType.id == 2 || scalingList[j].modelingType.id == 5) {
                calculatedChangeForMonth = scalingList[j].dataValue;
            } else if (scalingList[j].modelingType.id == 3 || scalingList[j].modelingType.id == 4) {
                calculatedChangeForMonth = (nodeValue * scalingList[j].dataValue) / 100;
            }
            data[8] = scalingList[j].modelingType.id == 2 ? calculatedChangeForMonth : calculatedChangeForMonth
            data[9] = scalingList[j].nodeDataModelingId
            data[10] = 0
            scalingTotal = parseFloat(scalingTotal) + parseFloat(calculatedChangeForMonth);
            dataArray[count] = data;
            count++;
        }
        this.setState({ scalingTotal }, () => {
            console.log("scalingTotal 1---", scalingTotal);
        });
        this.el = jexcel(document.getElementById("modelingJexcel"), '');
        this.el.destroy();
        var data = dataArray;
        console.log("DataArray>>>", dataArray);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [90, 160, 80, 80, 90, 90, 90, 90, 90],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.tree.transferToNode'),
                    type: 'dropdown',
                    source: this.state.sameLevelNodeList
                },
                {
                    title: i18n.t('static.tree.Note'),
                    type: 'text',

                },
                {
                    title: i18n.t('static.tree.modelingType'),
                    type: 'dropdown',
                    source: this.state.filteredModelingType
                },
                {
                    title: i18n.t('static.common.startdate'),
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [this.state.minMonth, this.state.maxMonth] }, width: 100
                },
                {
                    title: i18n.t('static.common.stopdate'),
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [this.state.minMonth, this.state.maxMonth] }, width: 100
                },
                {
                    title: i18n.t('static.tree.monthlyChange%'),
                    type: 'numeric',
                    mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.tree.MonthlyChange#'),
                    type: this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'numeric' : 'hidden',
                    mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.tree.modelingCalculater'),
                    type: 'image',
                },
                {
                    title: i18n.t('static.tree.calculatedChangeForMonth'),
                    type: 'numeric',
                    mask: '#,##.00',
                    decimal: '.',
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
            allowDeleteRow: true,
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
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y == null) {
                    // Sorting
                    if (obj.options.columnSorting == true) {
                        // Line
                        items.push({ type: 'line' });

                        items.push({
                            title: obj.options.text.orderAscending,
                            onclick: function () {
                                obj.orderBy(x, 0);
                            }
                        });
                        items.push({
                            title: obj.options.text.orderDescending,
                            onclick: function () {
                                obj.orderBy(x, 1);
                            }
                        });
                    }
                } else {
                    // at start
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: "Insert Row",
                            onclick: function () {
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
                                obj.insertRow(data, 0, 1);
                            }.bind(this)
                        });
                    }
                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        if (obj.getRowData(y)[9] == "" || obj.getRowData(y)[9] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    obj.deleteRow(parseInt(y));
                                }
                            });
                        }
                    }
                }

                // Line
                // items.push({ type: 'line' });



                return items;
            }.bind(this)

        };
        var modelingEl = jexcel(document.getElementById("modelingJexcel"), options);
        this.el = modelingEl;
        this.setState({
            modelingEl: modelingEl
        }, () => {

            console.log("curDate---", curDate)
            var curDate = new Date();
            this.filterScalingDataByMonth(curDate);
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
                    currentCalculatorStartValue: this.state.currentScenario.calculatedDataValue,

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

    changed1 = function (instance, cell, x, y, value) {
        // 4 & 5
        var json = this.state.momEl.getJson(null, false);
        console.log("momData>>>", json);
        var overrideListArray = [];
        for (var i = 0; i < json.length; i++) {
            var map1 = new Map(Object.entries(json[i]));
            if (map1.get("4") != '' || map1.get("5") != '') {
                var overrideData = {
                    month: map1.get("0"),
                    seasonalityPerc: map1.get("4"),
                    manualChange: map1.get("5"),
                    nodeDataId: map1.get("7"),
                    active: true
                }
                console.log("overrideData>>>", overrideData);
                overrideListArray.push(overrideData);
            }
        }
        console.log("overRide data list>>>", overrideListArray);
        let { currentItemConfig } = this.state;
        let { curTreeObj } = this.state;
        let { treeData } = this.state;
        let { dataSetObj } = this.state;
        var items = this.state.items;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataOverrideList = overrideListArray;
        this.setState({ currentItemConfig }, () => {
            // console.log("currentIemConfigInUpdetMom>>>", currentItemConfig);
            var findNodeIndex = items.findIndex(n => n.id == currentItemConfig.context.id);
            items[findNodeIndex] = currentItemConfig.context;
            // console.log("items>>>", items);
            curTreeObj.tree.flatList = items;

            var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
            treeData[findTreeIndex] = curTreeObj;

            // var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
            // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            var programData = dataSetObj.programData;
            programData.treeList = treeData;
            // dataSetObj.programData = programData;
            console.log("dataSetDecrypt>>>", programData);
            calculateModelingData(dataSetObj, this, '', currentItemConfig.context.id, this.state.selectedScenario, 1);
        });

    }.bind(this);
    changed2 = function (instance, cell, x, y, value) {
        var json = this.state.momElPer.getJson(null, false);
        console.log("momData>>>", json);
        var overrideListArray = [];
        for (var i = 0; i < json.length; i++) {
            var map1 = new Map(Object.entries(json[i]));
            if (map1.get("3") != '') {
                var overrideData = {
                    month: map1.get("0"),
                    seasonalityPerc: 0,
                    manualChange: map1.get("3"),
                    nodeDataId: map1.get("7"),
                    active: true
                }
                console.log("overrideData>>>", overrideData);
                overrideListArray.push(overrideData);
            }
        }
        console.log("overRide data list>>>", overrideListArray);
        let { currentItemConfig } = this.state;
        let { curTreeObj } = this.state;
        let { treeData } = this.state;
        let { dataSetObj } = this.state;
        var items = this.state.items;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataOverrideList = overrideListArray;
        this.setState({ currentItemConfig }, () => {
            // console.log("currentIemConfigInUpdetMom>>>", currentItemConfig);
            var findNodeIndex = items.findIndex(n => n.id == currentItemConfig.context.id);
            items[findNodeIndex] = currentItemConfig.context;
            // console.log("items>>>", items);
            curTreeObj.tree.flatList = items;

            var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
            treeData[findTreeIndex] = curTreeObj;
            console.log("treeData---", treeData);
            console.log("dataSetObj---", dataSetObj);
            var programData = dataSetObj.programData;
            console.log("dataSetDecrypt>>>1", programData);
            programData.treeList = treeData;
            console.log("dataSetDecrypt>>>2", programData);


            //  programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
            //  dataSetObj.programData = programData;

            console.log("encpyDataSet>>>", dataSetObj)
            calculateModelingData(dataSetObj, this, '', currentItemConfig.context.id, this.state.selectedScenario, 1);
        });
    }.bind(this);
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
            // var reg = JEXCEL_DECIMAL_NO_REGEX_LONG;
            var monthDifference = moment(stopDate).diff(startDate, 'months', true);
            var nodeValue = this.state.currentScenario.calculatedDataValue;
            var calculatedChangeForMonth;
            // Monthly change %
            if (x == 5 && rowData[2] != 2) {
                var col = ("F").concat(parseInt(y) + 1);

                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                }
                // else if (!(reg.test(value))) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                // }
                else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    if (rowData[2] != 5) {
                        calculatedChangeForMonth = parseFloat((nodeValue * value) / 100).toFixed(2);
                    } else {
                        calculatedChangeForMonth = parseFloat(value).toFixed(2);
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
                // else if (!(reg.test(value))) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                // }
                else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.state.modelingEl.setValueFromCoords(8, y, value, true);
                }
            }
        }
        if (x != 10) {
            this.el.setValueFromCoords(10, y, 1, true);
        }
        this.calculateScalingTotal();
    }.bind(this);
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

    getPayloadData(itemConfig, type) {
        console.log("inside get payload");
        var data = [];
        data = itemConfig.payload.nodeDataMap;
        console.log("itemConfig---", data);
        console.log("data---", data);
        var scenarioId = document.getElementById('scenarioId').value;
        // this.state.selectedScenario;
        if (data != null && data[scenarioId] != null && (data[scenarioId])[0] != null) {
            if (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2) {
                if (type == 1) {
                    console.log("get payload 1--->", (itemConfig.payload.nodeDataMap[scenarioId])[0]);
                    console.log("get payload 1--->>>", (itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue);
                    return addCommas((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue);
                } else if (type == 3) {
                    console.log("get payload 2");
                    var childList = this.state.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                    console.log("Child List+++", childList);
                    if (childList.length > 0) {
                        var sum = 0;
                        childList.map(c => {
                            sum += Number((c.payload.nodeDataMap[scenarioId])[0].displayDataValue)
                        })
                        return sum.toFixed(2);
                    } else {
                        console.log("get payload 3");
                        return "";
                    }
                } else {
                    console.log("get payload 4");
                    return "";
                }
            } else {
                if (type == 1) {
                    console.log("get payload 5", (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode);
                    if (itemConfig.payload.nodeType.id == 4) {
                        if ((itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id == 2) {
                            console.log("test---", (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId);
                            console.log("this.state.usagePeriodList---", this.state.usagePeriodList);
                            return addCommas((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue) + "% of parent, " + (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson + "/" + this.state.usagePeriodList.filter(x => x.usagePeriodId == (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId)[0].label.label_en;
                        } else {
                            return addCommas((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue) + "% of parent";
                        }

                    } else if (itemConfig.payload.nodeType.id == 5) {
                        console.log("payload get puNode---", (itemConfig.payload.nodeDataMap[scenarioId])[0]);
                        return addCommas((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue) + "% of parent, conversion = " + (itemConfig.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.multiplier;
                    } else {
                        return addCommas((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue) + "% of parent";
                    }

                } else if (type == 3) {
                    console.log("get payload 6");
                    var childList = this.state.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                    console.log("Child List+++", childList);
                    if (childList.length > 0) {
                        var sum = 0;
                        childList.map(c => {
                            sum += Number((c.payload.nodeDataMap[scenarioId])[0].displayDataValue)
                        })
                        return sum.toFixed(2);
                    } else {
                        console.log("get payload 7");
                        return "";
                    }
                } else {
                    console.log("get payload 8");
                    return "= " + ((itemConfig.payload.nodeDataMap[scenarioId])[0].displayCalculatedDataValue != null ? addCommas((itemConfig.payload.nodeDataMap[scenarioId])[0].displayCalculatedDataValue) : "");
                }
            }
        } else {
            console.log("get payload 1111");
            return "";
        }
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
                row = row.concat(addCommas((items[i].payload.nodeDataMap[this.state.selectedScenario])[0].dataValue))
                row1 = row1.concat(" ").concat(items[i].payload.label.label_en)
            } else {
                row = row.concat((items[i].payload.nodeDataMap[this.state.selectedScenario])[0].dataValue).concat("% ")
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
                        total += Number((item.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue)
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

    toggle() {
        this.setState({
            popoverOpen: !this.state.popoverOpen,
        });
    }

    getDatasetList() {
        this.setState({ loading: true });
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
                this.setState({
                    datasetList: myResult
                }, () => {
                    console.log("my datasetList --->", this.state.datasetList);
                    var dataSetObj = this.state.datasetList.filter(c => c.id == this.state.programId)[0];
                    console.log("dataSetObj---", dataSetObj);
                    if (dataSetObj != null) {
                        var dataEnc = dataSetObj;

                        var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
                        console.log("decryptedDataset---", databytes);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                        dataEnc.programData = programData;

                        console.log("dataSetObj.programData***>>>", dataEnc);
                        this.setState({ dataSetObj: dataEnc, forecastStartDate: programData.currentVersion.forecastStartDate, forecastStopDate: programData.currentVersion.forecastStopDate }, () => {
                            this.fetchTracerCategoryList(programData);
                            this.setState({ loading: false })
                            // calculateModelingData(decryptedDataset, this,'',"BuildTree");
                        });
                    } else {
                        this.setState({ loading: false })
                    }






                });
                // for (var i = 0; i < myResult.length; i++) {
                //     console.log("datasetList--->", myResult[i])

                // }

            }.bind(this);
        }.bind(this);
    }

    exportPDF = () => {
        console.log("download pdf");
        const addFooters = doc => {

            const pageCount = doc.internal.getNumberOfPages()

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(6)
            for (var i = 1; i <= pageCount; i++) {
                doc.setPage(i)

                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })


            }
        }
        const addHeaders = doc => {

            const pageCount = doc.internal.getNumberOfPages()
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')

                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                // doc.text(i18n.t('static.dashboard.stockstatusacrossplanningunit'), doc.internal.pageSize.width / 2, 60, {
                //     align: 'center'
                // })
                // if (i == 1) {
                //     doc.setFontSize(8)
                //     doc.setFont('helvetica', 'normal')
                //     doc.text(i18n.t('static.common.month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
                //         align: 'left'
                //     })
                //     doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                //         align: 'left'
                //     })
                //     doc.text(i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                //         align: 'left'
                //     })
                //     doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                //         align: 'left'
                //     })
                //     var planningText = doc.splitTextToSize((i18n.t('static.tracercategory.tracercategory') + ' : ' + this.state.tracerCategoryLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                //     doc.text(doc.internal.pageSize.width / 8, 170, planningText)

                // }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        const headers = '';
        const data = this.state.items;

        let content = {
            margin: { top: 80, bottom: 50 },
            startY: 200,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 75 },
            columnStyles: {
                1: { cellWidth: 161.89 },
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.stockstatusacrossplanningunit') + ".pdf")

    }
    handleRegionChange = (regionIds) => {
        console.log("regionIds---", regionIds);
        const { curTreeObj } = this.state;

        this.setState({
            regionValues: regionIds.map(ele => ele),
            regionLabels: regionIds.map(ele => ele.label)
        }, () => {
            console.log("regionValues---", this.state.regionValues);
            console.log("regionLabels---", this.state.regionLabels);
            // if ((this.state.regionValues).length > 0) {
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
            curTreeObj.regionList = regionList;
            this.setState({ curTreeObj });
            // }
        })
    }
    getTreeTemplateById(treeTemplateId) {
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
                console.log("tree template myresult---", myResult)
                const { treeData } = this.state;
                var treeTemplate = myResult.filter(x => x.treeTemplateId == treeTemplateId)[0];
                console.log("matched tree template---", treeTemplate);
                // var tempArray = [];
                // var tempJson = treeTemplate.payload.nodeDataMap[0][0];
                // tempArray.push(tempJson);
                // nodeDataMap[1] = tempArray;
                var flatList = treeTemplate.flatList;
                for (let i = 0; i < flatList.length; i++) {
                    var nodeDataMap = {};
                    var tempArray = [];
                    // var nodeDataMap[1] = flatList.payload.nodeDataMap[0][0];
                    console.log("flatList[i]---", flatList[i]);
                    var tempJson = flatList[i].payload.nodeDataMap[0][0];
                    tempArray.push(tempJson);
                    nodeDataMap[1] = tempArray;
                    flatList[i].payload.nodeDataMap = nodeDataMap;
                }
                console.log("flat list--->", flatList);
                var maxTreeId = Math.max(...treeData.map(o => o.treeId));
                var treeId = parseInt(maxTreeId) + 1;
                var tempTree = {
                    treeId: treeId,
                    active: treeTemplate.active,
                    forecastMethod: treeTemplate.forecastMethod,
                    label: treeTemplate.label,
                    notes: treeTemplate.notes,
                    regionList: [],
                    scenarioList: [{
                        id: 1,
                        label: {
                            label_en: "Default"
                        }
                    }],
                    tree: {
                        flatList: flatList
                    }
                }
                treeData.push(tempTree);
                this.setState({
                    treeData,
                    treeId,
                    treeTemplateObj: tempTree
                }, () => {
                    this.getTreeByTreeId(treeId);
                    console.log("tree template obj---", this.state.treeData)

                });
                // for (var i = 0; i < myResult.length; i++) {
                //     console.log("treeTemplateList--->", myResult[i])

                // }

            }.bind(this);
        }.bind(this);
    }

    getTreeByTreeId(treeId) {
        console.log("treeId---", treeId)
        if (treeId != "" && treeId != null && treeId != 0) {
            console.log("tree data---", this.state.treeData);
            var curTreeObj = this.state.treeData.filter(x => x.treeId == treeId)[0];
            console.log("curTreeObj---", curTreeObj)
            var regionValues = (curTreeObj.regionList).map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

            }, this);
            console.log("regionValues--->>>>", regionValues);
            this.setState({
                curTreeObj,
                scenarioList: curTreeObj.scenarioList.filter(x => x.active == true),
                regionValues
            }, () => {
                if (curTreeObj.scenarioList.length == 1) {
                    this.setState({ selectedScenario: curTreeObj.scenarioList[0].id })

                    var scenarioId = curTreeObj.scenarioList[0].id;
                    // var scenario = document.getElementById("scenarioId");
                    var selectedText = curTreeObj.scenarioList[0].label.label_en;

                    this.setState({
                        selectedScenario: scenarioId,
                        selectedScenarioLabel: selectedText,
                        currentScenario: []
                    }, () => {
                        console.log("@@@---", this.state.selectedScenario);
                        this.callAfterScenarioChange(scenarioId);
                    });
                }
                console.log("my items--->", this.state.items);
            });
        } else {
            this.setState({
                curTreeObj: [],
                scenarioList: [],
                // regionList: [],
                items: [],
                selectedScenario: ''
            });
        }
    }

    getScenarioList() {

    }

    getTreeList() {
        var proList = [];
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
                console.log("userId---", userId);
                console.log("myResult.length---", myResult.length);
                var realmCountryId = "";
                if (this.state.programId != null && this.state.programId != "") {
                    console.log("inside if condition-------------------->", this.state.programId);
                    var dataSetObj = myResult.filter(c => c.id == this.state.programId)[0];
                    console.log("dataSetObj tree>>>", dataSetObj);
                    var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
                    var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                    realmCountryId = programData.realmCountry.realmCountryId;
                    var treeList = programData.treeList;
                    for (var k = 0; k < treeList.length; k++) {
                        proList.push(treeList[k])
                    }
                } else {
                    console.log("inside else condition-------------------->");
                    for (var i = 0; i < myResult.length; i++) {
                        console.log("inside for---", myResult[i]);
                        if (myResult[i].userId == userId) {
                            console.log("inside if---");
                            var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                            console.log("programData--->>>>>>>>>>>>>>>>>>>>>>", programData);
                            var treeList = programData.treeList;
                            for (var k = 0; k < treeList.length; k++) {
                                proList.push(treeList[k])
                            }
                        }
                    }
                }
                console.log("pro list---", proList);
                if (proList.length > 0) {
                    proList.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                }
                this.setState({
                    realmCountryId,
                    treeData: proList
                }, () => {
                    console.log("tree data --->", this.state.treeData);
                    if (this.state.treeId != "" && this.state.treeId != 0) {
                        this.getTreeByTreeId(this.state.treeId);
                    }
                    this.getTreeTemplateById(this.props.match.params.templateId);
                });

            }.bind(this);
        }.bind(this);
    }
    getConversionFactor(planningUnitId) {
        console.log("planningUnitId cf ---", planningUnitId);
        var pu = (this.state.planningUnitList.filter(c => c.planningUnitId == planningUnitId))[0];
        console.log("pu---", pu)
        // (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.id = event.target.value;
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
            // if (nodeTypeList.length == 1) {
            //     this.state.currentItemConfig.context.payload.nodeType.id=nodeTypeList.
            // }
            console.log("final nodeTypeList if---", nodeTypeList);
        } else {
            nodeType = this.state.nodeTypeList.filter(c => c.id == 1)[0];
            nodeTypeList.push(nodeType);
            nodeType = this.state.nodeTypeList.filter(c => c.id == 2)[0];
            nodeTypeList.push(nodeType);
            console.log("final nodeTypeList else---", nodeTypeList);
        }
        this.setState({
            nodeTypeFollowUpList: nodeTypeList
        }, () => {
            if (nodeTypeList.length == 1) {
                const currentItemConfig = this.state.currentItemConfig;
                currentItemConfig.context.payload.nodeType.id = nodeTypeList[0].id;
                this.setState({
                    currentItemConfig: currentItemConfig
                }, () => {
                    this.nodeTypeChange(nodeTypeList[0].id);
                    if (nodeTypeList[0].id == 5) {
                        this.getNoOfMonthsInUsagePeriod();
                    }
                })
            } else {
                // const currentItemConfig = this.state.currentItemConfig;
                // currentItemConfig.context.payload.nodeType.id = "";

                // this.setState({
                //     currentItemConfig: currentItemConfig

                // }, () => {

                // })
            }
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
        console.log("duplicate node called 1---", this.state.currentItemConfig);
        console.log("duplicate node called 2---", itemConfig);
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
        this.props.history.push(`/dataset/listTree/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }


    getPlanningUnitListByFUId(forecastingUnitId) {
        console.log("forecastingUnitId---", forecastingUnitId);
        console.log("pl unit---", this.state.planningUnitList);
        var planningUnitList = this.state.planningUnitList.filter(x => x.forecastingUnit.id == forecastingUnitId);
        this.setState({
            planningUnitList
        }, () => {
            console.log("filtered planning unit list---", this.state.planningUnitList);
            if (this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario].puNode != null) {
                console.log("test---", this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id);
                var conversionFactor = this.state.planningUnitList.filter(x => x.id == this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id)[0].multiplier;
                this.setState({
                    conversionFactor
                }, () => {
                    this.getUsageText();
                });
            }
        });

    }

    getForecastingUnitUnitByFUId(forecastingUnitId) {
        console.log("forecastingUnitId---", forecastingUnitId);
        console.log("%%%this.state.forecastingUnitList---", this.state.forecastingUnitList);
        const { currentItemConfig } = this.state;
        var forecastingUnit = (this.state.forecastingUnitList.filter(c => c.id == forecastingUnitId))[0];
        console.log("forecastingUnit---", forecastingUnit);
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.unit.id = forecastingUnit.unit.id;
        console.log("currentItemConfig---", currentItemConfig);
        this.setState({
            currentItemConfig
        });
    }

    getNoOfFUPatient() {
        var scenarioId = this.state.selectedScenario;
        console.log("no of fu------", (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson);
        console.log("no of person---", (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons);
        var noOfFUPatient;
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
            noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
        } else {
            console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode);
            noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
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
    // getUsageTemplateList() {
    //     var tracerCategoryId = this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id;
    //     console.log("tracerCategoryId---", tracerCategoryId);
    //     UsageTemplateService.getUsageTemplateListForTree(tracerCategoryId).then(response => {
    //         var listArray = response.data;
    //         listArray.sort((a, b) => {
    //             var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
    //             var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
    //             return itemLabelA > itemLabelB ? 1 : -1;
    //         });
    //         this.setState({
    //             usageTemplateList: listArray
    //         }, () => {
    //             console.log(" get uasge template--------------", response.data);
    //         })
    //     })
    //         .catch(
    //             error => {
    //                 if (error.message === "Network Error") {
    //                     this.setState({
    //                         message: 'static.unkownError',
    //                         loading: false
    //                     });
    //                 } else {
    //                     switch (error.response ? error.response.status : "") {

    //                         case 401:
    //                             this.props.history.push(`/login/static.message.sessionExpired`)
    //                             break;
    //                         case 403:
    //                             this.props.history.push(`/accessDenied`)
    //                             break;
    //                         case 500:
    //                         case 404:
    //                         case 406:
    //                             this.setState({
    //                                 message: error.response.data.messageCode,
    //                                 loading: false
    //                             });
    //                             break;
    //                         case 412:
    //                             this.setState({
    //                                 message: error.response.data.messageCode,
    //                                 loading: false
    //                             });
    //                             break;
    //                         default:
    //                             this.setState({
    //                                 message: 'static.unkownError',
    //                                 loading: false
    //                             });
    //                             break;
    //                     }
    //                 }
    //             }
    //         );
    // }

    copyDataFromUsageTemplate(event) {
        var usageTemplate = (this.state.usageTemplateList.filter(c => c.usageTemplateId == event.target.value))[0];
        console.log("usageTemplate---", usageTemplate);
        const { currentItemConfig } = this.state;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.lagInMonths = usageTemplate.lagInMonths;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfPersons = usageTemplate.noOfPatients;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfForecastingUnitsPerPerson = usageTemplate.noOfForecastingUnits;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageFrequency = usageTemplate.usageFrequencyCount;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usagePeriod.usagePeriodId = usageTemplate.usageFrequencyUsagePeriod != null ? usageTemplate.usageFrequencyUsagePeriod.usagePeriodId : '';
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.unit.id = usageTemplate.unit.id;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.id = usageTemplate.forecastingUnit.id;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label.label_en = usageTemplate.forecastingUnit.label.label_en;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id = usageTemplate.usageType.id;
        // for (var i = 0; i < newResult.length; i++) {
        var autocompleteData = [{ value: usageTemplate.forecastingUnit.id, label: getLabelText(usageTemplate.forecastingUnit.label, this.state.lang) + " [" + usageTemplate.forecastingUnit.id + "]" }]
        // }


        if ((currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 1) {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage = usageTemplate.oneTimeUsage;
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.repeatCount = usageTemplate.repeatCount;
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.repeatUsagePeriod.usagePeriodId = usageTemplate.repeatUsagePeriod != null ? usageTemplate.repeatUsagePeriod.usagePeriodId : '';
        }
        this.setState({
            currentItemConfig,
            currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0],
            autocompleteData
        }, () => {
            console.log("copy from template---", this.state.currentScenario);
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
        var scenarioId = this.state.selectedScenario;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency;
            console.log("usageFrequency---", usageFrequency);
        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency;
            console.log("usageFrequency---", usageFrequency);
        }
        console.log("usagePeriodId dis---", usagePeriodId);
        var noOfMonthsInUsagePeriod = 0;
        if (usagePeriodId != null && usagePeriodId != "") {
            var convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
            console.log("convertToMonth dis---", convertToMonth);
            console.log("repeat count---", (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount);
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
                var noOfFUPatient;
                if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                    noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
                } else {
                    console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode);
                    noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
                }
                console.log("no of fu patient---", noOfFUPatient);
                noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
                console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
            }


            var noFURequired = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount / (convertToMonth * noOfMonthsInUsagePeriod);
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
        var scenarioId = this.state.selectedScenario;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency;
            console.log("usageFrequency---", usageFrequency);
        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency;
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
                    noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
                } else {
                    console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode);
                    noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
                }
                console.log("no of fu patient---", noOfFUPatient);
                noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
                console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
            }
        }
        this.setState({
            noOfMonthsInUsagePeriod
        }, () => {
            console.log("noOfMonthsInUsagePeriod---", this.state.noOfMonthsInUsagePeriod);
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
            noOfPersons = this.state.currentScenario.fuNode.noOfPersons;
            noOfForecastingUnitsPerPerson = this.state.currentScenario.fuNode.noOfForecastingUnitsPerPerson;
            usageFrequency = this.state.currentScenario.fuNode.usageFrequency;

            if (this.state.addNodeFlag) {
                var usageTypeParent = document.getElementById("usageTypeParent");
                selectedText = usageTypeParent.options[usageTypeParent.selectedIndex].text;
            } else {
                // take everything from object
                console.log(">>>>", this.state.currentItemConfig);
                selectedText = this.state.currentItemConfig.parentItem.payload.nodeUnit.label.label_en
            }

            if (this.state.addNodeFlag) {
                var forecastingUnitUnit = document.getElementById("forecastingUnitUnit");
                selectedText1 = forecastingUnitUnit.options[forecastingUnitUnit.selectedIndex].text;
            } else {
                // console.log("***ul>",this.state.unitList);
                // console.log("***uId>",this.state.currentScenario.fuNode.forecastingUnit.unit.id);
                selectedText1 = this.state.unitList.filter(c => c.unitId == this.state.currentScenario.fuNode.forecastingUnit.unit.id)[0].label.label_en;
            }




            if (this.state.currentScenario.fuNode.usageType.id == 2 || this.state.currentScenario.fuNode.oneTimeUsage != "true") {
                console.log("this.state.currentScenario.fuNode---", this.state.currentScenario.fuNode);
                // if (this.state.addNodeFlag) {
                selectedText2 = this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentScenario.fuNode.usagePeriod.usagePeriodId)[0].label.label_en;
                // }
            }
        }
        // FU
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {

            if (this.state.currentScenario.fuNode.usageType.id == 1) {
                if (this.state.currentScenario.fuNode.oneTimeUsage != "true") {
                    var selectedText3 = this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentScenario.fuNode.repeatUsagePeriod.usagePeriodId)[0].label.label_en;

                    usageText = i18n.t('static.usageTemplate.every') + " " + noOfPersons + " " + selectedText + i18n.t('static.usageTemplate.requires') + " " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s), " + " " + usageFrequency + " " + i18n.t('static.tree.timesPer') + " " + selectedText2 + " " + i18n.t('static.tree.for') + " " + (this.state.currentScenario.fuNode.repeatCount != null ? this.state.currentScenario.fuNode.repeatCount : '') + " " + selectedText3;
                } else {
                    usageText = i18n.t('static.usageTemplate.every') + " " + noOfPersons + " " + selectedText + i18n.t('static.usageTemplate.requires') + " " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s)";
                }
            } else {
                usageText = i18n.t('static.usageTemplate.every') + " " + noOfPersons + " " + selectedText + i18n.t('static.usageTemplate.requires') + " " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s) " + i18n.t('static.usageTemplate.every') + " " + usageFrequency + " " + selectedText2;
            }
        } else {
            //PU
            console.log("pu>>>", this.state.currentItemConfig);
            console.log("puList>>>", this.state.currentItemConfig.parentItem.parent);
            ;
            var nodeUnitTxt = this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en;
            if (this.state.addNodeFlag) {
                var planningUnitId = document.getElementById("planningUnitId");
                var planningUnit = planningUnitId.options[planningUnitId.selectedIndex].text;
            } else {
                var planningUnit = this.state.planningUnitList.filter(c => c.id == this.state.currentScenario.puNode.planningUnit.id)[0].label.label_en;
            }
            if ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 1) {
                var sharePu;
                if (this.state.currentScenario.puNode.sharePlanningUnit == "true") {
                    sharePu = (this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor);
                } else {
                    sharePu = Math.round((this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor));
                }
                usageText = i18n.t('static.tree.forEach') + nodeUnitTxt + i18n.t('static.tree.weNeed') + sharePu + " " + planningUnit;
            } else {
                // need grand parent here 
                // console.log("1>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfForecastingUnitsPerPerson);
                // console.log("2>>>", this.state.noOfMonthsInUsagePeriod);
                // console.log("3>>>", this.state.conversionFactor);
                // console.log("4>>>", this.state.currentScenario.puNode.refillMonths);
                var puPerInterval = ((((this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / 1) / this.state.currentScenario.puNode.refillMonths);
                usageText = i18n.t('static.tree.forEach') + nodeUnitTxt + i18n.t('static.tree.weNeed') + addCommas(puPerInterval) + " " + planningUnit + i18n.t('static.usageTemplate.every') + this.state.currentScenario.puNode.refillMonths + i18n.t('static.report.month');
            }
        }


        this.setState({
            usageText
        }, () => {
            console.log("usage text---", this.state.usageText);
        });

    }
    getForecastingUnitListByTracerCategoryId() {
        console.log("my tracer category---", this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id)
        var tracerCategoryId = this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id;
        var scenarioId = this.state.selectedScenario;
        console.log("%%%tracerCategoryId---", tracerCategoryId)
        var forecastingUnitList = this.state.forecastingUnitList;
        var autocompleteData = [];
        for (var i = 0; i < forecastingUnitList.length; i++) {
            autocompleteData[i] = { value: forecastingUnitList[i].id, label: forecastingUnitList[i].id + "|" + getLabelText(forecastingUnitList[i].label, this.state.lang) }
        }
        this.setState({
            autocompleteData
        }, () => {
            console.log("my autocomplete data---", autocompleteData);
            if (forecastingUnitList.length == 1) {
                console.log("fu list 1---");
                const currentItemConfig = this.state.currentItemConfig;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.id = forecastingUnitList[0].id;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.label.label_en = forecastingUnitList[0].id + "|" + getLabelText(forecastingUnitList[0].label, this.state.lang);
                this.setState({
                    currentItemConfig: currentItemConfig,
                    currentScenario: (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0]
                }, () => {
                    console.log("cur item config--- ", this.state.currentItemConfig);
                    this.getForecastingUnitUnitByFUId(forecastingUnitList[0].id);
                })
            } else {
                console.log("fu list 2---");
                const currentItemConfig = this.state.currentItemConfig;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.id = "";
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.label.label_en = "";
                this.setState({
                    currentItemConfig: currentItemConfig

                }, () => {

                })
            }
        });
        // var db1;
        // getDatabase();
        // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        // openRequest.onsuccess = function (e) {
        //     db1 = e.target.result;
        //     var transaction = db1.transaction(['forecastingUnit'], 'readwrite');
        //     var program = transaction.objectStore('forecastingUnit');
        //     var getRequest = program.getAll();

        //     getRequest.onerror = function (event) {
        //     };
        //     getRequest.onsuccess = function (event) {
        //         var myResult = [];
        //         myResult = getRequest.result;
        //         console.log("%myResult---", myResult);
        //         var newResult = myResult.filter(x => x.tracerCategory.id == this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id);
        //         console.log("%newResult---", newResult);
        //         console.log("");
        //         var autocompleteData = [];
        //         for (var i = 0; i < newResult.length; i++) {
        //             autocompleteData[i] = { value: newResult[i].forecastingUnitId, label: newResult[i].label.label_en + " [" + newResult[i].forecastingUnitId + "]" }
        //         }
        //         this.setState({
        //             autocompleteData,
        //             forecastingUnitList: myResult
        //         }, () => {
        //             console.log("%%%autocompleteData----", this.state.autocompleteData);
        //             console.log("%%%forecastingUnitList----", this.state.forecastingUnitList);
        //             if (newResult.length == 1) {
        //                 const currentItemConfig = this.state.currentItemConfig;
        //                 (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.id = newResult[0].forecastingUnitId;
        //                 (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.label.label_en = newResult[0].forecastingUnitId + " | " + newResult[0].label.label_en;
        //                 this.setState({
        //                     currentItemConfig: currentItemConfig
        //                 }, () => {
        //                     this.getForecastingUnitUnitByFUId(newResult[0].forecastingUnitId);
        //                 })
        //             } else {
        //                 const currentItemConfig = this.state.currentItemConfig;
        //                 (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.id = "";
        //                 (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.label.label_en = "";
        //                 this.setState({
        //                     currentItemConfig: currentItemConfig

        //                 }, () => {

        //                 })
        //             }
        //         });
        //         for (var i = 0; i < newResult.length; i++) {
        //             console.log("newResult--->", newResult[i])

        //         }

        //     }.bind(this);
        // }.bind(this);
    }
    hideTreeValidation(e) {
        this.setState({
            showModelingValidation: e.target.checked == true ? false : true
        })
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
            forecastMethodId: true,
            treeName: true,
            regionId: true
        }
        )
        this.validateForm(errors)
    }

    validateForm(errors) {
        this.findFirstError('userForm', (fieldName) => {
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
            percentageOfParent: true,
            nodeValue: true,
            tracerCategoryId: true,
            usageTypeIdFU: true,
            lagInMonths: true,
            noOfPersons: true,
            forecastingUnitPerPersonsFC: true,
            // usageFrequency: true,
            oneTimeUsage: true,
            repeatCount: true,
            planningUnitId: true,
            refillMonths: true,
            sharePlanningUnit: true
            // usagePeriodId:true
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
        if (nodeTypeId == 2 && this.state.currentItemConfig.context.payload.nodeDataMap != null && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario] != null && this.state.currentScenario != null) {
            return this.state.currentScenario.dataValue;
        }
        // else {
        //     var nodeValue = (this.state.currentScenario.dataValue * (this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue) / 100;
        //     return nodeValue;
        // }
    }

    getNotes() {
        return this.state.currentScenario.notes;
    }
    calculateNodeValue() {

    }

    getTracerCategoryList() {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['tracerCategory'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('tracerCategory');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                console.log("myResult===============", myResult)
                this.setState({
                    tracerCategoryList: myResult
                }, () => {

                })
            }.bind(this);
        }.bind(this)
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
                var proList = []
                console.log("myResult===============2", myResult)
                this.setState({
                    forecastMethodList: myResult
                }, () => {

                })
            }.bind(this);
        }.bind(this)
    }

    getUnitListForDimensionIdFour() {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['unit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('unit');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                console.log("myResult===============3", myResult)
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].dimension.id == 4) {
                        proList[i] = myResult[i]
                    }
                }
                this.setState({
                    unitOfDimensionIdFour: proList[0]
                }, () => {

                })
            }.bind(this);
        }.bind(this)
    }

    getUnitList() {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['unit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('unit');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                console.log("myResult===============4", myResult)

                this.setState({
                    unitList: myResult
                }, () => {

                })
            }.bind(this);
        }.bind(this)
    }

    getUsagePeriodList() {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['usagePeriod'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('usagePeriod');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                console.log("myResult===============5", myResult)

                this.setState({
                    usagePeriodList: myResult
                }, () => {

                })
            }.bind(this);
        }.bind(this)
    }

    getUsageTypeList() {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['usageType'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('usageType');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                console.log("myResult===============6", myResult)

                this.setState({
                    usageTypeList: myResult
                }, () => {

                })
            }.bind(this);
        }.bind(this)
    }

    filterUsageTemplateList(tracerCategoryId) {
        var usageTemplateList = [];
        if (tracerCategoryId != "") {
            usageTemplateList = this.state.usageTemplateListAll.filter(c => c.tracerCategory.id == tracerCategoryId);
        } else {
            usageTemplateList = this.state.usageTemplateListAll;
        }
        this.setState({
            usageTemplateList
        }, () => {
            console.log("usageTemplateList after filter---", this.state.usageTemplateListAll);
        });
    }

    getUsageTemplateList() {
        // console.log("tracerCategoryId---", tracerCategoryId);
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['usageTemplate'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('usageTemplate');
            var planningunitRequest = planningunitOs.getAll();
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var usageTemplateListAll = []
                console.log("usageTemplateListAll===============6", myResult)

                this.setState({
                    usageTemplateListAll: myResult
                }, () => {
                    console.log("usageTemplateList All===============>", this.state.usageTemplateListAll)
                })
            }.bind(this);
        }.bind(this)
    }

    getForecastingUnitListByTracerCategory(tracerCategoryId) {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('forecastingUnit');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                console.log("myResult===============123", myResult)
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].tracerCategory.id == tracerCategoryId) {
                        proList[i] = myResult[i]
                    }
                }
                console.log("myResult===============123", proList)

                this.setState({
                    forecastingUnitByTracerCategory: proList
                }, () => {

                })
            }.bind(this);
        }.bind(this)
    }

    getPlanningUnitListByForecastingUnitId(forecastingUnitId) {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['planningUnit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('planningUnit');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []

                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].forecastingUnit.id == forecastingUnitId) {
                        proList[i] = myResult[i]
                    }
                }
                console.log("myResult===============1234", proList)

                this.setState({
                    planningUnitByTracerCategory: proList
                }, () => {

                })
            }.bind(this);
        }.bind(this)
    }

    componentDidMount() {
        // console.log("this.props.match.params.programId---", this.props.match.params.programId);
        this.setState({
            treeId: this.props.match.params.treeId,
            templateId: this.props.match.params.templateId
        }, () => {
            // if (this.state.programId != "") {
            this.getTreeList();
            // }
            // this.getTracerCategoryList();
            this.getForecastMethodList();
            this.getUnitListForDimensionIdFour();
            this.getUnitList();
            this.getUsagePeriodList();
            this.getUsageTypeList();
            this.getUsageTemplateList();
            // this.getForecastingUnitListByTracerCategory("");
            // this.getForecastingUnitListByTracerCategoryId();
            this.getPlanningUnitListByForecastingUnitId(1);

            this.getNodeTyeList();
            this.getDatasetList();
            this.getModelingTypeList();
            this.getRegionList();

        })

        // ForecastMethodService.getActiveForecastMethodList().then(response => {
        //     var listArray = response.data;
        //     listArray.sort((a, b) => {
        //         var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
        //         var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
        //         return itemLabelA > itemLabelB ? 1 : -1;
        //     });
        //     this.setState({
        //         forecastMethodList: listArray
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

        UnitService.getUnitListByDimensionId(TREE_DIMENSION_ID).then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                nodeUnitList: listArray
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
            // DatasetService.getTreeTemplateById(this.props.match.params.templateId).then(response => {
            //     console.log("my tree---", response.data);
            //     var items = response.data.flatList;
            //     var arr = [];
            //     for (let i = 0; i < items.length; i++) {

            //         if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
            //             (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].dataValue;
            //         } else {

            //             var findNodeIndex = items.findIndex(n => n.id == items[i].parent);
            //             var parentValue = (items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
            //             console.log("api parent value---", parentValue);

            //             (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = (parentValue * (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].dataValue) / 100;
            //         }
            //         console.log("load---", items[i])
            //         // arr.push(items[i]);
            //     }
            //     this.setState({
            //         treeTemplate: response.data,
            //         items,
            //         loading: false
            //     }, () => {
            //         console.log(">>>", new Date('2021-01-01').getFullYear(), "+", ("0" + (new Date('2021-12-01').getMonth() + 1)).slice(-2));
            //         console.log("Tree Template---", this.state.items);
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
        } else {
            //     this.setState({
            //         treeTemplate: {
            //             treeTemplateId: 0,
            //             active: true,
            //             label: {
            //                 label_en: ""
            //             },
            //             forecastMethod: {
            //                 label: {
            //                     label_en: ""
            //                 }
            //             },
            //             flatList: [{
            //                 id: 1,
            //                 level: 0,
            //                 parent: null,
            //                 payload: {
            //                     label: {
            //                         label_en: ''
            //                     },
            //                     nodeType: {
            //                         id: 2
            //                     },
            //                     nodeUnit: {
            //                         id: ''
            //                     },
            //                     nodeDataMap: [
            //                         [{
            //                             dataValue: '',
            //                             fuNode: {
            //                                 forecastingUnit: {
            //                                     tracerCategory: {

            //                                     },
            //                                     unit: {

            //                                     }
            //                                 },
            //                                 usageType: {

            //                                 },
            //                                 usagePeriod: {

            //                                 }
            //                             }
            //                         }]
            //                     ]
            //                 },
            //                 parentItem: {
            //                     payload: {
            //                         nodeUnit: {

            //                         }
            //                     }
            //                 }
            //             }]
            //         },
            //         items: [{
            //             id: 1,
            //             level: 0,
            //             parent: null,
            //             payload: {
            //                 label: {
            //                     label_en: ''
            //                 },
            //                 nodeType: {
            //                     id: 2
            //                 },
            //                 nodeUnit: {
            //                     id: ''
            //                 },
            //                 nodeDataMap: [
            //                     [{
            //                         dataValue: '',
            //                         fuNode: {
            //                             forecastingUnit: {
            //                                 tracerCategory: {

            //                                 },
            //                                 unit: {

            //                                 }
            //                             },
            //                             usageType: {

            //                             },
            //                             usagePeriod: {

            //                             }
            //                         }
            //                     }]
            //                 ]
            //             },
            //             parentItem: {
            //                 payload: {
            //                     nodeUnit: {

            //                     }
            //                 }
            //             }
            //         }]
            //     }, () => {
            //         console.log("Tree Template---", this.state.items);
            //     })
        }
    }
    addScenario() {
        const { scenario, curTreeObj } = this.state;
        var scenarioList = this.state.scenarioList;
        var type = this.state.scenarioActionType;
        var items = curTreeObj.tree.flatList;
        var scenarioId;
        if (type == 1) {
            var maxScenarioId = Math.max(...scenarioList.map(o => o.id));
            var minScenarioId = Math.min(...scenarioList.map(o => o.id));
            scenarioId = parseInt(maxScenarioId) + 1;
            var newTabObject = {
                id: scenarioId,
                label: {
                    label_en: scenario.label.label_en
                },
                notes: scenario.notes,
                active: true
            };
            // console.log("tab data---", newTabObject);
            scenarioList = [...scenarioList, newTabObject];
            // console.log("tabList---", tabList1)
            if (this.state.treeId != "") {
                if (this.state.scenarioList.length > 1) {

                }

                console.log("***>minScenarioId---", items);
                for (var i = 0; i < items.length; i++) {
                    console.log("***>items[i]----", items[i]);
                    console.log("***>(items[i].payload.nodeDataMap[minScenarioId])[0]----", (items[i].payload.nodeDataMap[minScenarioId])[0]);
                    var tempArray = [];
                    var nodeDataMap = {};
                    // tempArray = items[i].payload.nodeDataMap;
                    tempArray.push((items[i].payload.nodeDataMap[minScenarioId])[0]);
                    nodeDataMap = items[i].payload.nodeDataMap;
                    nodeDataMap[scenarioId] = tempArray;
                    items[i].payload.nodeDataMap = nodeDataMap;
                }
                console.log("items-----------", items);
                this.updateTreeData();
            }
        } else if (type == 2 || type == 3) {
            scenarioId = this.state.selectedScenario;
            var scenario1 = scenarioList.filter(x => x.id == scenarioId)[0];
            var findNodeIndex = scenarioList.findIndex(n => n.id == scenarioId);
            if (type == 2) {
                console.log("this.state.scenario---", this.state.scenario);
                scenarioList[findNodeIndex] = this.state.scenario;
                console.log("my scenarioList---", scenarioList);
            } else if (type == 3) {
                items = [];
                scenarioId = '';
                scenario1.active = false;
                scenarioList[findNodeIndex] = scenario1;
            }


        }

        curTreeObj.scenarioList = scenarioList;
        this.setState({
            showDiv1: false,
            curTreeObj,
            items,
            selectedScenario: scenarioId,
            scenarioList: scenarioList.filter(x => x.active == true),
            openAddScenarioModal: false
        }, () => {
            console.log("final tab list---", this.state.items);
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
                var month = this.state.currentScenario.month;

                var minMonth = this.state.forecastStartDate;
                var maxMonth = this.state.forecastStopDate;
                console.log("minMonth---", minMonth);
                console.log("maxMonth---", maxMonth);
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
    scenarioChange(event) {
        console.log("event---", event);
        const { scenario } = this.state;
        if (event.target.name === "scenarioName") {
            scenario.label.label_en = event.target.value;
        }
        if (event.target.name === "scenarioDesc") {
            scenario.notes = event.target.value;
        }
        this.setState({
            scenario
        });
    }
    treeDataChange(event) {
        console.log("event---", event);
        let { curTreeObj } = this.state;
        if (event.target.name === "treeName") {
            var label = {
                label_en: event.target.value
            }
            curTreeObj.label = label;

        }
        if (event.target.name == "active") {
            curTreeObj.active = event.target.id === "active11" ? false : true;
        }

        if (event.target.name === "forecastMethodId") {
            // console.log("event.target.value----", this.state.forecastMethodList);
            // console.log("forecast method---", this.state.forecastMethodList.filter(x => x.forecastMethodId == event.target.value)[0].label.label_en)
            // var forecastMethodId = event.target.value;
            var forecastMethod = {
                id: event.target.value,
                label: {
                    label_en: event.target.value != "" ? this.state.forecastMethodList.filter(x => x.forecastMethodId == event.target.value)[0].label.label_en : ''
                }
            };
            curTreeObj.forecastMethod = forecastMethod;
            console.log("immidiate tree--->", curTreeObj);
        }

        if (event.target.name === "treeNotes") {
            curTreeObj.notes = event.target.value;
        }


        this.setState({ curTreeObj }, () => {
            console.log("curTreeObj---", curTreeObj);
        });

    }
    dataChange(event) {
        // alert("hi");
        console.log("event---", event);
        let { curTreeObj } = this.state;
        let { currentItemConfig } = this.state;
        let { treeTemplate } = this.state;
        var scenarioId = this.state.selectedScenario;
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


        if (event.target.name == "treeId") {
            var treeId = 0;
            console.log("data change---", event.target.value);
            if (event.target.value != null) {
                treeId = event.target.value;
                this.setState({
                    treeId
                });
            }
            this.getTreeByTreeId(treeId);

        }

        if (event.target.name == "scenarioId") {
            console.log("scenario id---", event.target.value)

            if (event.target.value != "") {
                console.log("scenario if----------")
                var scenarioId = event.target.value;
                var scenario = document.getElementById("scenarioId");
                var selectedText = scenario.options[scenario.selectedIndex].text;

                this.setState({
                    selectedScenario: scenarioId,
                    selectedScenarioLabel: selectedText,
                    currentScenario: []
                }, () => {
                    console.log("after state update scenario if---", this.state.selectedScenario);
                    this.callAfterScenarioChange(scenarioId);
                });
            } else {
                console.log("scenario else----------")
                this.setState({
                    items: [],
                    selectedScenario: '',
                    selectedScenarioLabel: '',
                    currentScenario: []
                }, () => {
                    console.log("after state update scenario else---", this.state.selectedScenario);
                });
            }
            // curTreeObj.treeId = event.target.value;
            // this.getTreeByTreeId(event.target.value);
        }


        if (event.target.name == "modelingType") {
            if (event.target.id === "active1") {
                this.state.currentModelingType = 4
            }
            else if (event.target.id === "active2") {
                this.state.currentModelingType = 3
            }
            else if (event.target.id === "active3") {
                this.state.currentModelingType = 2
            }
            else {
                this.state.currentModelingType = 5
            }

        }

        if (event.target.name === "sharePlanningUnit") {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.sharePlanningUnit = event.target.value;
            this.getUsageText();
        }
        if (event.target.name === "refillMonths") {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.refillMonths = event.target.value;
            this.getUsageText();
        }
        // if (event.target.name === "forecastMethodId") {
        //     treeTemplatee.forecastMethod.id = event.target.value;
        // }

        if (event.target.name === "usageTemplateId") {
            this.setState({
                usageTemplateId: event.target.value
            });
        }

        if (event.target.name === "nodeTitle") {
            console.log("before change node title---", currentItemConfig);
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

            console.log("event.target.value---", event.target.value);
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = event.target.value;
            this.state.currentScenario.dataValue = event.target.value;
            console.log("currentItemConfig.context.payload after$$$", currentItemConfig.context.payload);
            console.log("current scenario$$$", this.state.currentScenario);
            var calculatedDataValue;
            var parentValue;
            if (this.state.addNodeFlag !== "true") {
                parentValue = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue
            } else {
                // parentValue = this.state.currentScenario.calculatedDataValue
                parentValue = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue
            }
            console.log("parentValue wihout comma---", (event.target.value * parentValue.toString().replaceAll(",", "")) / 100);

            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = (event.target.value * parentValue.toString().replaceAll(",", "")) / 100
            console.log("calculatedDataValue---", currentItemConfig);
            this.setState({
                parentValue: parentValue
            })
        }
        if (event.target.name === "nodeValue") {
            console.log("$$$$", (currentItemConfig.context.payload.nodeDataMap));
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = event.target.value;
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = event.target.value;
        }
        if (event.target.name === "notes") {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].notes = event.target.value;
            this.getNotes();
        }
        // if (event.target.name === "forecastingUnitId") {
        //     (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.id = event.target.value;
        //     if (event.target.value != null && event.target.value != "") {
        //         var forecastingUnitId = document.getElementById("forecastingUnitId");
        //         var forecastingUnitLabel = forecastingUnitId.options[forecastingUnitId.selectedIndex].text;
        //         console.log("forecastingUnitLabel---", forecastingUnitLabel);
        //         (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label.label_en = forecastingUnitLabel;
        //     }
        //     this.getForecastingUnitUnitByFUId(event.target.value);
        // }

        if (event.target.name === "tracerCategoryId") {
            console.log("currentItemConfig---", currentItemConfig);
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.tracerCategory.id = event.target.value;
            this.filterUsageTemplateList(event.target.value);
        }

        if (event.target.name === "noOfPersons") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons = event.target.value;
        }

        if (event.target.name === "lagInMonths") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.lagInMonths = event.target.value;
        }



        if (event.target.name === "forecastingUnitPerPersonsFC") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson = event.target.value;
            if (currentItemConfig.context.payload.nodeType.id == 4 && (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id == 1) {
                this.getNoOfFUPatient();
            }
        }

        if (event.target.name === "oneTimeUsage") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage = event.target.value;
            this.getUsageText();
        }

        if (event.target.name === "repeatUsagePeriodId") {
            var fuNode = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode;
            var repeatUsagePeriod = {
                usagePeriodId: event.target.value
            }
            fuNode.repeatUsagePeriod = repeatUsagePeriod;
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode = fuNode;
            this.getNoFURequired();
            this.getUsageText();
        }

        if (event.target.name === "repeatCount") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount = event.target.value;
            this.getUsageText();
        }

        if (event.target.name === "usageFrequency") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency = event.target.value;
            this.getNoOfMonthsInUsagePeriod();
            this.getUsageText();
        }

        if (event.target.name === "usagePeriodId") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId = event.target.value;
            this.getNoOfMonthsInUsagePeriod();
            this.getUsageText();
        }
        if (event.target.name === "usageTypeIdFU") {
            console.log("usage type data change function ------------------", event.target.value);
            console.log("scenario ------------------", scenarioId);
            console.log("scenario data ------------------", (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0]);
            if (event.target.value == 2 && currentItemConfig.context.payload.nodeType.id == 4) {
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons = 1;
            }
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id = event.target.value;
        }

        if (event.target.name === "planningUnitId") {
            var pu = (this.state.planningUnitList.filter(c => c.id == event.target.value))[0];
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.unit.id = pu.unit.id;
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.id = event.target.value;
            this.setState({
                conversionFactor: pu.multiplier
            }, () => {

            });
        }

        console.log("anchal 1---", currentItemConfig)
        console.log("anchal 2---", this.state.selectedScenario)
        this.setState({
            currentItemConfig,
            currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0]
        }, () => {
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
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
        if (itemConfig.context.payload.nodeType.id == 4) {
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label.label_en = (itemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label.label_en;
        }
        console.log("add button clicked value after update---", newItem);
        this.setState({
            items: [...items, newItem],
            cursorItem: parseInt(items.length + 1)
        }, () => {
            console.log("on add items-------", this.state.items);
            // var getAllAggregationNode = this.state.items.filter(c => c.payload.nodeType.id == 1);
            // console.log(">>>", getAllAggregationNode);
            // calculateModelingData(this.state.dataSetObj, this, '', newItem.id, this.state.selectedScenario);
            this.calculateMOMData(newItem.id, 0);
            this.calculateValuesForAggregateNode(this.state.items);
        });
    }

    calculateValuesForAggregateNode(items) {
        console.log("start>>>", Date.now());
        console.log("start aggregation node>>>", items);
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
                    var value2 = getChildAggregationNode[m].payload.nodeDataMap[this.state.selectedScenario][0].dataValue != "" ? parseInt(getChildAggregationNode[m].payload.nodeDataMap[this.state.selectedScenario][0].dataValue) : 0;
                    value = value + parseInt(value2);
                }

                var findNodeIndex = items.findIndex(n => n.id == getAllAggregationNode[i].id);
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].dataValue = value;
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue = value;

                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].displayDataValue = value;
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].displayCalculatedDataValue = value;

                this.setState({
                    items: items,
                    openAddNodeModal: false,
                }, () => {
                    console.log("updated tree data>>>", this.state);
                });
            } else {
                var findNodeIndex = items.findIndex(n => n.id == getAllAggregationNode[i].id);
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].dataValue = "";
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue = "";

                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].displayDataValue = "";
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].displayCalculatedDataValue = "";

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
        const { context: item } = data;
        if (item != null) {
            this.setState({
                showCalculatorFields: false,
                showMomData: false,
                showMomDataPercent: false,
                addNodeFlag: false,
                openAddNodeModal: true,
                orgCurrentItemConfig: JSON.parse(JSON.stringify(data.context)),
                currentItemConfig: data,
                level0: (data.context.level == 0 ? false : true),
                numberNode: (data.context.payload.nodeType.id == 2 ? false : true),
                aggregationNode: (data.context.payload.nodeType.id == 1 ? false : true),
                currentScenario: (data.context.payload.nodeDataMap[this.state.selectedScenario])[0],
                highlightItem: item.id,
                cursorItem: item.id,
                parentScenario: data.context.level == 0 ? [] : (data.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0],

            }, () => {
                console.log("555>>>", this.state.currentItemConfig.context.payload.nodeType.id);
                var scenarioId = this.state.selectedScenario;
                console.log("cursor change current item config---", this.state.currentItemConfig);
                if (data.context.level != 0) {
                    this.setState({
                        parentValue: this.state.parentScenario.calculatedDataValue
                    });
                }
                this.getNodeTypeFollowUpList(data.context.level == 0 ? 0 : data.parentItem.payload.nodeType.id);
                if (data.context.payload.nodeType.id == 4) {
                    console.log("on curso tracer category---", (data.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.tracerCategory.id);
                    console.log("on curso tracer category list---", this.state.tracerCategoryList);
                    this.getForecastingUnitListByTracerCategoryId();
                    this.getNodeUnitOfPrent();
                    this.getNoOfFUPatient();
                    this.getNoOfMonthsInUsagePeriod();
                    this.getNoFURequired();
                    this.filterUsageTemplateList(this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id);
                    this.getUsageText();
                    this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.currentItemConfig.parentItem.payload.nodeUnit.id;
                } else if (data.context.payload.nodeType.id == 5) {
                    this.getPlanningUnitListByFUId((data.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.id);
                    this.getNoOfMonthsInUsagePeriod();
                    this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id;
                } else if (data.context.payload.nodeType.id != 1) {
                    this.getSameLevelNodeList(data.context.level, data.context.id);
                }
                // this.setState({

                // })
            })
        }
    };

    updateNodeInfoInJson(currentItemConfig) {
        this.setState({ loading: true })
        console.log("update tree node called------------", currentItemConfig);
        var nodes = this.state.items;
        var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.context.id);
        console.log("findNodeIndex---", findNodeIndex);
        nodes[findNodeIndex] = currentItemConfig.context;
        // nodes[findNodeIndex].valueType = currentItemConfig.valueType;
        console.log("nodes---", nodes);
        this.setState({
            items: nodes,
            openAddNodeModal: false,
        }, () => {
            console.log("updated tree data+++", this.state);
            this.calculateValuesForAggregateNode(this.state.items);
            this.calculateMOMData(0, 0);
            // calculateModelingData(this.state.dataSetObj, this, '', currentItemConfig.context.id, this.state.selectedScenario);
            // console.log("returmed list---", this.state.nodeDataMomList);
            // this.updateTreeData();
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
                            // stepSize: 1000000
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


        let bar = {}
        if (this.state.momList.length > 0) {
            var datasetsArr = [];
            datasetsArr.push(
                {
                    label: getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) + " (Month end forecast)",
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
                    data: this.state.momList.map((item, index) => (item.endValue > 0 ? item.endValue : null))
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
                            labelString: this.state.currentItemConfig.context.payload.nodeUnit.label != null ? this.state.currentItemConfig.context.payload.nodeType.id > 3 ? getLabelText(this.state.currentItemConfig.parentItem.payload.nodeUnit.label, this.state.lang) : getLabelText(this.state.currentItemConfig.context.payload.nodeUnit.label, this.state.lang) : '',
                            // labelString: "",
                            fontColor: 'black'
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: 'black',
                            stepSize: 100000,
                            callback: function (value) {
                                var cell1 = value
                                cell1 += '';
                                var x = cell1.split('.');
                                var x1 = x[0];
                                var x2 = x.length > 1 ? '.' + x[1] : '';
                                var rgx = /(\d+)(\d{3})/;
                                while (rgx.test(x1)) {
                                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                                }
                                return x1 + x2;

                            }
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
                            labelString: "% of " + (this.state.currentItemConfig.context.payload.nodeType.id > 2 ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : ""),
                            fontColor: 'black'
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: 'black',
                            callback: function (value) {
                                var cell1 = value + " %";
                                return cell1;

                            },
                            min: 0,
                            max: 100
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
                enabled: true,
                custom: CustomTooltips,
                callbacks: {
                    label: function (tooltipItem, data) {
                        // console.log("tooltipItem---", tooltipItem);
                        // console.log("tooltipItem data---", data);
                        if (tooltipItem.datasetIndex == 1) {
                            let label = data.labels[tooltipItem.index];
                            let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                            var cell1 = value
                            cell1 += '';
                            var x = cell1.split('.');
                            var x1 = x[0];
                            var x2 = x.length > 1 ? '.' + x[1] : '';
                            var rgx = /(\d+)(\d{3})/;
                            while (rgx.test(x1)) {
                                x1 = x1.replace(rgx, '$1' + ',' + '$2');
                            }
                            return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                        } else {
                            let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            return data.datasets[tooltipItem.datasetIndex].label + ' : ' + value + " %";
                        }
                    }
                }

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

            datasetsArr.push(
                {
                    label: '% ' + (this.state.currentItemConfig.parentItem != null ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : '') + ' (Month End)',
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
                    // data: (this.state.momElPer).getJson(null, false).map((item, index) => (item[4], true)),
                }
            )

            datasetsArr.push({
                label: getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang),
                stack: 1,
                yAxisID: 'A',
                backgroundColor: '#A7C6ED',
                borderColor: grey,
                pointBackgroundColor: grey,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: grey,
                data: (this.state.momElPer).getJson(null, false).map((item, index) => (item[6])),
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
                        enableReinitialize={true}
                        // initialValues={initialValuesNodeData}
                        // validateOnChange={true}
                        initialValues={{
                            nodeTitle: this.state.currentItemConfig.context.payload.label.label_en,
                            nodeTypeId: this.state.currentItemConfig.context.payload.nodeType.id,
                            nodeUnitId: this.state.currentItemConfig.context.payload.nodeUnit.id
                            // percentageOfParent: (this.state.currentItemConfig.context.payload.nodeDataMap[1])[0].dataValue
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
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.whatIf.scenario')}</Label>
                                            <Input type="text"
                                                name="scenarioTxt"
                                                bsSize="sm"
                                                readOnly={true}
                                                value={this.state.selectedScenarioLabel}
                                            ></Input>
                                        </FormGroup>
                                        {this.state.level0 &&
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.parent')}</Label>
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
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.nodeTitle')}<span class="red Reqasterisk">*</span></Label>
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
                                                <PopoverBody>{i18n.t('static.tree.lagMessage')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.nodeType')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={this.toggle} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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

                                        {/* {this.state.aggregationNode && */}

                                        <FormGroup className="col-md-6" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.nodeUnit')}<span class="red Reqasterisk">*</span></Label>
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
                                        </FormGroup>

                                        {/* } */}
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span></Label>
                                            <div className="controls edit">
                                                <Picker

                                                    id="month"
                                                    name="month"
                                                    ref={this.pickAMonth1}
                                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                    value={{
                                                        year: new Date(this.state.currentScenario.month).getFullYear(), month: ("0" + (new Date(this.state.currentScenario.month).getMonth() + 1)).slice(-2)
                                                    }}
                                                    lang={pickerLang.months}
                                                    // theme="dark"
                                                    onChange={this.handleAMonthChange1}
                                                    onDismiss={this.handleAMonthDissmis1}
                                                >
                                                    <MonthBox value={this.makeText({ year: new Date(this.state.currentScenario.month).getFullYear(), month: ("0" + (new Date(this.state.currentScenario.month).getMonth() + 1)).slice(-2) })}
                                                        onClick={this.handleClickMonthBox1} />
                                                </Picker>
                                            </div>
                                        </FormGroup>


                                        {/* {this.state.numberNode && */}
                                        <>
                                            <FormGroup className="col-md-6" style={{ display: this.state.numberNode ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.percentageOfParent')}<span class="red Reqasterisk">*</span></Label>
                                                <Input type="text"
                                                    id="percentageOfParent"
                                                    name="percentageOfParent"
                                                    bsSize="sm"
                                                    valid={!errors.percentageOfParent && this.state.currentScenario.dataValue != ''}
                                                    invalid={touched.percentageOfParent && !!errors.percentageOfParent}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    // step={.01}
                                                    value={this.state.currentScenario.dataValue}></Input>
                                                <FormFeedback className="red">{errors.percentageOfParent}</FormFeedback>
                                            </FormGroup>
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.parentValue')}<span class="red Reqasterisk">*</span></Label>
                                                <Input type="text"
                                                    id="parentValue"
                                                    name="parentValue"
                                                    bsSize="sm"
                                                    readOnly={true}
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    // value={this.state.addNodeFlag != "true" ? addCommas(this.state.parentScenario.calculatedDataValue) : addCommas(this.state.parentValue)}
                                                    value={addCommas(this.state.parentValue)}
                                                ></Input>
                                            </FormGroup></>

                                        {/* } */}
                                        {/* {this.state.aggregationNode && */}
                                        <FormGroup className="col-md-6" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.nodeValue')}{this.state.numberNode}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="nodeValue"
                                                name="nodeValue"
                                                bsSize="sm"
                                                valid={!errors.nodeValue && (this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2) ? addCommas(this.state.currentScenario.calculatedDataValue) : addCommas(this.state.currentScenario.dataValue) != ''}
                                                invalid={touched.nodeValue && !!errors.nodeValue}
                                                onBlur={handleBlur}
                                                readOnly={this.state.numberNode ? true : false}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    this.dataChange(e)
                                                }}
                                                // step={.01}
                                                // value={this.getNodeValue(this.state.currentItemConfig.context.payload.nodeType.id)}
                                                value={this.state.numberNode ? addCommas(this.state.currentScenario.calculatedDataValue) : addCommas(this.state.currentScenario.dataValue)}
                                            ></Input>
                                            <FormFeedback className="red">{errors.nodeValue}</FormFeedback>
                                        </FormGroup>
                                        {/* } */}

                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.common.note')}</Label>
                                            <Input type="textarea"
                                                id="notes"
                                                name="notes"
                                                onChange={(e) => { this.dataChange(e) }}
                                                // value={this.getNotes}
                                                value={this.state.currentScenario.notes}
                                            ></Input>
                                        </FormGroup>
                                    </div>
                                    {/* Planning unit start */}
                                    <div>
                                        <div className="row">
                                            {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                                <>
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
                                                            value={this.state.parentScenario.fuNode.usageType.id}
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
                                                        <Label htmlFor="currencyId">{i18n.t('static.product.unit1')}<span class="red Reqasterisk">*</span></Label>

                                                    </FormGroup>
                                                    <FormGroup className="col-md-10">
                                                        <Input type="text"
                                                            id="forecastingUnitPU"
                                                            name="forecastingUnitPU"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={this.state.parentScenario.fuNode.forecastingUnit.label.label_en}>

                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">{this.state.parentScenario.fuNode.usageType.id == 2 ? "# of FU / month / Clients" : "# of FU / usage / Patient"}<span class="red Reqasterisk">*</span></Label>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5">
                                                        <Input type="text"
                                                            id="forecastingUnitPU"
                                                            name="forecastingUnitPU"
                                                            bsSize="sm"
                                                            readOnly={true}

                                                            value={addCommas(this.state.parentScenario.fuNode.usageType.id == 2 ? (this.state.parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) : this.state.noOfMonthsInUsagePeriod)}>

                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5">
                                                        <Input type="select"
                                                            id="forecastingUnitUnitPU"
                                                            name="forecastingUnitUnitPU"
                                                            bsSize="sm"
                                                            disabled="true"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            value={this.state.parentScenario.fuNode.forecastingUnit.unit.id}>

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
                                                </>
                                            }

                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.product.product')}<span class="red Reqasterisk">*</span></Label>

                                            </FormGroup>
                                            <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                <Input type="select"
                                                    id="planningUnitId"
                                                    name="planningUnitId"
                                                    bsSize="sm"
                                                    valid={!errors.planningUnitId && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentScenario.puNode.planningUnit.id != '' : !errors.planningUnitId}
                                                    invalid={touched.planningUnitId && !!errors.planningUnitId}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentScenario.puNode.planningUnit.id : ""}>

                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {this.state.planningUnitList.length > 0
                                                        && this.state.planningUnitList.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.id}>
                                                                    {getLabelText(item.label, this.state.lang)}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                                <FormFeedback className="red">{errors.planningUnitId}</FormFeedback>
                                            </FormGroup>
                                            {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                                <>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">{i18n.t('static.conversion.ConversionFactorFUPU')}<span class="red Reqasterisk">*</span></Label>
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
                                                        <Label htmlFor="currencyId">{this.state.parentScenario.fuNode.usageType.id == 2 ? "# of PU / month /" : "# of PU / usage / "}<span class="red Reqasterisk">*</span></Label>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5">
                                                        <Input type="text"
                                                            id="noOfPUUsage"
                                                            name="noOfPUUsage"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={addCommas(this.state.parentScenario.fuNode.usageType.id == 2 ? ((this.state.parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / this.state.conversionFactor) : (this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor))}>

                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5">
                                                        <Input type="select"
                                                            id="planningUnitUnitPU"
                                                            name="planningUnitUnitPU"
                                                            bsSize="sm"
                                                            disabled="true"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            value={this.state.currentScenario.puNode.planningUnit.unit.id}>

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

                                                    {this.state.parentScenario.fuNode.usageType.id == 2 &&
                                                        <>
                                                            <FormGroup className="col-md-2">
                                                                <Label htmlFor="currencyId">{i18n.t('static.tree.QATEstimateForIntervalEvery_months')}<span class="red Reqasterisk">*</span></Label>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-10">
                                                                <Input type="text"
                                                                    id="interval"
                                                                    name="interval"
                                                                    bsSize="sm"
                                                                    readOnly={true}
                                                                    // value={addCommas(this.state.conversionFactor / ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod))}>
                                                                    value={addCommas(this.state.conversionFactor / (this.state.parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod))}>

                                                                </Input>
                                                            </FormGroup>

                                                        </>}
                                                </>}
                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.parentScenario.fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.consumptionIntervalEveryXMonths')}<span class="red Reqasterisk">*</span></Label>
                                            </FormGroup>
                                            <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.parentScenario.fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                <Input type="text"
                                                    id="refillMonths"
                                                    name="refillMonths"
                                                    valid={!errors.refillMonths && this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.parentScenario.fuNode.usageType.id == 2 ? this.state.currentScenario.puNode.refillMonths != '' : !errors.refillMonths}
                                                    invalid={touched.refillMonths && !!errors.refillMonths}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    bsSize="sm"
                                                    value={addCommas(this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.parentScenario.fuNode.usageType.id == 2 ? this.state.currentScenario.puNode.refillMonths : "")}>

                                                </Input>
                                                <FormFeedback className="red">{errors.refillMonths}</FormFeedback>
                                            </FormGroup>


                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.willClientsShareOnePU?')}<span class="red Reqasterisk">*</span></Label>
                                            </FormGroup>
                                            <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                <Input type="select"
                                                    id="sharePlanningUnit"
                                                    name="sharePlanningUnit"
                                                    bsSize="sm"
                                                    valid={!errors.sharePlanningUnit && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentScenario.puNode.sharePlanningUnit != '' : !errors.sharePlanningUnit}
                                                    invalid={touched.sharePlanningUnit && !!errors.sharePlanningUnit}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentScenario.puNode.sharePlanningUnit : ""}>

                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    <option value="true">{i18n.t('static.realm.yes')}</option>
                                                    <option value="false">{i18n.t('static.program.no')}</option>

                                                </Input>
                                                <FormFeedback className="red">{errors.sharePlanningUnit}</FormFeedback>
                                            </FormGroup>
                                            {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                                <>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">{this.state.parentScenario.fuNode.usageType.id == 2 ? "How many PU per interval per " : "How many PU per usage per "}{this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}?<span class="red Reqasterisk">*</span></Label>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-10">
                                                        <Input type="text"
                                                            id="puInterval"
                                                            name="puInterval"
                                                            readOnly={true}
                                                            bsSize="sm"
                                                            value={addCommas(this.state.parentScenario.fuNode.usageType.id == 2 ? (((this.state.parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / this.state.conversionFactor) / this.state.currentScenario.puNode.refillMonths) : (this.state.currentScenario.puNode.sharePlanningUnit == "true" ? (this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor) : Math.round((this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor))))}>

                                                        </Input>
                                                    </FormGroup>

                                                </>}
                                        </div>
                                    </div>
                                    {/* Plannign unit end */}
                                    {/* {(this.state.currentItemConfig.context.payload.nodeType.id == 4) && */}
                                    <div>
                                        <div className="row">
                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tracercategory.tracercategory')}<span class="red Reqasterisk">*</span></Label>
                                                <Input
                                                    type="select"
                                                    id="tracerCategoryId"
                                                    name="tracerCategoryId"
                                                    bsSize="sm"
                                                    valid={!errors.tracerCategoryId && this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id != '' : !errors.tracerCategoryId}
                                                    invalid={touched.tracerCategoryId && !!errors.tracerCategoryId}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e); this.getForecastingUnitListByTracerCategoryId(e)
                                                    }}
                                                    required
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id : ""}
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
                                                <FormFeedback className="red">{errors.tracerCategoryId}</FormFeedback>
                                            </FormGroup>

                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.copyFromTemplate')}</Label>
                                                <Input
                                                    type="select"
                                                    name="usageTemplateId"
                                                    id="usageTemplateId"
                                                    bsSize="sm"
                                                    valid={!errors.usageTemplateId && this.state.usageTemplateId != ''}
                                                    invalid={touched.usageTemplateId && !!errors.usageTemplateId}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.copyDataFromUsageTemplate(e); this.dataChange(e) }}
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
                                                {/* <FormFeedback className="red">{errors.usageTemplateId}</FormFeedback> */}
                                            </FormGroup>
                                            <FormGroup className="col-md-12" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.product.unit1')}<span class="red Reqasterisk">*</span></Label>
                                                <div className="controls fuNodeAutocomplete"
                                                >
                                                    <Autocomplete
                                                        id="forecastingUnitId"
                                                        name="forecastingUnitId"
                                                        // value={{ value: this.state.currentScenario.fuNode.forecastingUnit.id, label: this.state.currentScenario.fuNode.forecastingUnit.label.label_en }}
                                                        defaultValue={{ value: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.forecastingUnit.id : "", label: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.forecastingUnit.label.label_en : "" }}
                                                        options={this.state.autocompleteData}
                                                        getOptionLabel={(option) => option.label}
                                                        // style={{ width: 1000 }}
                                                        onChange={(event, value) => {
                                                            console.log("combo 2 ro combo box---", value);
                                                            // if(){
                                                            this.state.currentScenario.fuNode.forecastingUnit.id = value.value;
                                                            if (value != null) {
                                                                this.state.currentScenario.fuNode.forecastingUnit.label.label_en = value.label;
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

                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.common.typeofuse')}<span class="red Reqasterisk">*</span></Label>
                                                <Input
                                                    type="select"
                                                    id="usageTypeIdFU"
                                                    name="usageTypeIdFU"
                                                    bsSize="sm"
                                                    valid={!errors.usageTypeIdFU && this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.usageType.id != '' : !errors.usageTypeIdFU}
                                                    invalid={touched.usageTypeIdFU && !!errors.usageTypeIdFU}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    required
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.usageType.id : ""}
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
                                                <FormFeedback className="red">{errors.usageTypeIdFU}</FormFeedback>
                                            </FormGroup>

                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.lagInMonth0Immediate')}<span class="red Reqasterisk">*</span></Label>
                                                <Input type="text"
                                                    id="lagInMonths"
                                                    name="lagInMonths"
                                                    bsSize="sm"
                                                    valid={!errors.lagInMonths && this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.lagInMonths != '' : !errors.lagInMonths}
                                                    invalid={touched.lagInMonths && !!errors.lagInMonths}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.lagInMonths : ""}
                                                ></Input>
                                                <FormFeedback className="red">{errors.lagInMonths}</FormFeedback>
                                            </FormGroup>
                                        </div>
                                        <div className="row">

                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.usageTemplate.every')}<span class="red Reqasterisk">*</span></Label>

                                            </FormGroup>
                                            <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }} >
                                                <Input type="text"
                                                    id="noOfPersons"
                                                    name="noOfPersons"
                                                    bsSize="sm"
                                                    valid={!errors.noOfPersons && this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.noOfPersons != '' : !errors.noOfPersons}
                                                    invalid={touched.noOfPersons && !!errors.noOfPersons}
                                                    onBlur={handleBlur}
                                                    readOnly={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentScenario.fuNode.usageType.id == 2 ? true : false}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    value={addCommas(this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.noOfPersons : "")}>

                                                </Input>
                                                <FormFeedback className="red">{errors.noOfPersons}</FormFeedback>
                                            </FormGroup>
                                            <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
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
                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.requires')}<span class="red Reqasterisk">*</span></Label>
                                            </FormGroup>
                                            <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Input type="text"
                                                    id="forecastingUnitPerPersonsFC"
                                                    name="forecastingUnitPerPersonsFC"
                                                    bsSize="sm"
                                                    valid={!errors.forecastingUnitPerPersonsFC && this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.noOfForecastingUnitsPerPerson != '' : !errors.forecastingUnitPerPersonsFC}
                                                    invalid={touched.forecastingUnitPerPersonsFC && !!errors.forecastingUnitPerPersonsFC}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    value={addCommas(this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.noOfForecastingUnitsPerPerson : "")}>

                                                </Input>
                                                <FormFeedback className="red">{errors.forecastingUnitPerPersonsFC}</FormFeedback>
                                            </FormGroup>
                                            <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Input type="select"
                                                    id="forecastingUnitUnit"
                                                    name="forecastingUnitUnit"
                                                    bsSize="sm"
                                                    disabled="true"
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.forecastingUnit.unit.id : ""}>

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
                                            {/* {(this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1) && */}
                                            <>
                                                <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 ? 'block' : 'none' }}>
                                                    <Label htmlFor="currencyId">{i18n.t('static.tree.singleUse')}<span class="red Reqasterisk">*</span></Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 ? 'block' : 'none' }}>
                                                    <Input type="select"
                                                        id="oneTimeUsage"
                                                        name="oneTimeUsage"
                                                        bsSize="sm"
                                                        valid={!errors.oneTimeUsage && this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 ? this.state.currentScenario.fuNode.oneTimeUsage != '' : !errors.oneTimeUsage}
                                                        invalid={touched.oneTimeUsage && !!errors.oneTimeUsage}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            this.dataChange(e)
                                                        }}
                                                        value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 ? this.state.currentScenario.fuNode.oneTimeUsage : ""}>

                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        <option value="true">{i18n.t('static.realm.yes')}</option>
                                                        <option value="false">{i18n.t('static.program.no')}</option>

                                                    </Input>
                                                    <FormFeedback className="red">{errors.oneTimeUsage}</FormFeedback>
                                                </FormGroup>
                                                {/* <FormGroup className="col-md-5"></FormGroup> */}
                                                {/* {this.state.currentScenario.fuNode.oneTimeUsage != "true" && */}
                                                <>
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? 'block' : 'none' }}></FormGroup>
                                                    <FormGroup className="col-md-4" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? 'block' : 'none' }}>
                                                        <Input type="text"
                                                            name="usageFrequency"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? this.state.currentScenario.fuNode.usageFrequency : ""}></Input>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? 'block' : 'none' }}>
                                                        <Input type="text"
                                                            name="timesPer"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={i18n.t('static.tree.timesPer')}></Input>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-4" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? 'block' : 'none' }}>
                                                        <Input
                                                            type="select"
                                                            id="usagePeriodId"
                                                            name="usagePeriodId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            required
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? this.state.currentScenario.fuNode.usagePeriod.usagePeriodId : ""}
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
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? 'block' : 'none' }}>
                                                        <Label htmlFor="currencyId">for<span class="red Reqasterisk">*</span></Label>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? 'block' : 'none' }}>
                                                        <Input type="text"
                                                            id="repeatCount"
                                                            name="repeatCount"
                                                            bsSize="sm"
                                                            valid={!errors.repeatCount && this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? this.state.currentScenario.fuNode.repeatCount != '' : !errors.repeatCount}
                                                            invalid={touched.repeatCount && !!errors.repeatCount}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                this.dataChange(e)
                                                            }}
                                                            value={addCommas(this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? this.state.currentScenario.fuNode.repeatCount : "")}>
                                                        </Input>
                                                        <FormFeedback className="red">{errors.repeatCount}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? 'block' : 'none' }}>
                                                        <Input type="select"
                                                            id="repeatUsagePeriodId"
                                                            name="repeatUsagePeriodId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.repeatUsagePeriod != null ? this.state.currentScenario.fuNode.repeatUsagePeriod.usagePeriodId : ''}>

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
                                                    </FormGroup></>

                                                {/* // } */}
                                            </>
                                            {/* // } */}



                                            {/* {(this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2) && */}
                                            <>

                                                <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                    <Label htmlFor="currencyId">{i18n.t('static.usageTemplate.every')}<span class="red Reqasterisk">*</span></Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                    <Input type="text"
                                                        id="usageFrequency"
                                                        name="usageFrequency"
                                                        bsSize="sm"
                                                        // valid={!errors.usageFrequency && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.usageFrequency != "" : false)}
                                                        // invalid={touched.usageFrequency && !!errors.usageFrequency}
                                                        // onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            // handleChange(e); 
                                                            this.dataChange(e)
                                                        }}
                                                        value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? this.state.currentScenario.fuNode.usageFrequency : ""}></Input>
                                                    {/* <FormFeedback className="red">{errors.usageFrequency}</FormFeedback> */}
                                                </FormGroup>
                                                <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                    <Input
                                                        type="select"
                                                        id="usagePeriodId"
                                                        name="usagePeriodId"
                                                        bsSize="sm"
                                                        // valid={!errors.usagePeriodId && (this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? this.state.currentScenario.fuNode.usageFrequency != "" : false)}
                                                        // invalid={touched.usagePeriodId && !!errors.usagePeriodId}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            // handleChange(e); 
                                                            this.dataChange(e)
                                                        }}
                                                        required
                                                        value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? this.state.currentScenario.fuNode.usagePeriod.usagePeriodId : ""}
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
                                                    {/* <FormFeedback className="red">{errors.usagePeriodId}</FormFeedback> */}
                                                </FormGroup>
                                            </>

                                            {/* } */}

                                            <div className="pl-lg-3 pr-lg-3" style={{ clear: 'both', width: '100%' }}>
                                                {(this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2) &&
                                                    <table className="table table-bordered">
                                                        <tr>
                                                            <td>{i18n.t('static.tree.#OfFURequiredForPeriod')}</td>
                                                            <td>{addCommas(this.state.currentScenario.fuNode.noOfForecastingUnitsPerPerson)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{i18n.t('static.tree.#OfMonthsInPeriod')}</td>
                                                            <td>{addCommas(this.state.noOfMonthsInUsagePeriod)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{i18n.t('static.tree.#OfFU/month/')} {this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en}</td>
                                                            <td>{addCommas(this.state.currentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)}</td>
                                                        </tr>
                                                    </table>}
                                                {(this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1) &&
                                                    <table className="table table-bordered">
                                                        <tr>
                                                            <td>{i18n.t('static.tree.#OfFU/')} {this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en}</td>
                                                            <td>{addCommas(this.state.noOfFUPatient)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{i18n.t('static.tree.#OfFU/month/')} {this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en}</td>
                                                            <td>{addCommas(this.state.noOfMonthsInUsagePeriod)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{i18n.t('static.tree.#OfFURequiredForPeriod')}</td>
                                                            <td>{addCommas(this.state.noFURequired)}</td>
                                                        </tr>
                                                    </table>}
                                            </div>

                                        </div>
                                    </div>

                                    {/* } */}
                                    <div className="col-md-12 pt-2 pl-2 pb-lg-3"><b>{this.state.usageText}</b></div>
                                    {/* disabled={!isValid} */}
                                    <FormGroup className="pb-lg-3">
                                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddNodeModal: false, cursorItem: 0, highlightItem: 0 })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                        <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={() => this.resetNodeData()} ><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAllNodeData(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                    </FormGroup>
                                </Form>
                            )} />
                </TabPane>
                <TabPane tabId="2">

                    <div className="row pl-lg-5 pb-lg-3 pt-lg-0">
                        <div className="offset-md-10 col-md-6 pl-lg-4">
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
                            <Label htmlFor="">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span></Label>
                        </FormGroup>
                        <FormGroup className="col-md-4 pl-lg-0">
                            <Picker
                                ref={this.pickAMonth2}
                                // years={{ min: { year: 2010, month: 2 }, max: { year: 2050, month: 9 } }}
                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                // value={this.state.singleValue2}
                                value={{
                                    year:
                                        new Date(this.state.scalingMonth).getFullYear(), month: ("0" + (new Date(this.state.scalingMonth).getMonth() + 1)).slice(-2)
                                }}
                                lang={pickerLang.months}
                                onChange={this.handleAMonthChange2}
                                onDismiss={this.handleAMonthDissmis2}
                            // className="ReadonlyPicker"
                            >
                                <MonthBox value={this.makeText({ year: new Date(this.state.scalingMonth).getFullYear(), month: ("0" + (new Date(this.state.scalingMonth).getMonth() + 1)).slice(-2) })}
                                    onClick={this.handleClickMonthBox2} />
                            </Picker>
                        </FormGroup>

                        <div>
                            {this.state.showModelingJexcelNumber &&
                                <> <div className="calculatorimg">
                                    <div id="modelingJexcel" className={"RowClickable ScalingTable"}>
                                    </div>
                                </div>
                                    <div style={{ 'float': 'right', 'fontSize': '18px' }}><b>{i18n.t('static.supplyPlan.total')} : {this.state.scalingTotal != "" && addCommas(parseFloat(this.state.scalingTotal).toFixed(2))}</b></div><br /><br />
                                    <div><Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.showMomData()}> <i className="fa fa-eye" style={{ color: '#fff' }}></i> {i18n.t('static.tree.viewMonthlyData')}</Button>
                                        <Button color="success" size="md" className="float-right mr-1" type="button" onClick={() => this.formSubmit()}> <i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                        <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                    </div>
                                </>
                            }
                            {/* {this.state.showModelingJexcelPercent &&
                                <><div className="calculatorimg">
                                    <div id="modelingJexcelPercent" className={"RowClickable ScalingTable"}>
                                    </div>
                                </div>
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.showMomDataPercent()}> <i className="fa fa-eye" style={{ color: '#fff' }}></i> {i18n.t('static.tree.viewMonthlyData')}</Button>
                                    <Button color="success" size="md" className="float-right mr-1" type="button"> <i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRowJexcelPer()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                </>
                            } */}

                        </div>


                        {this.state.showCalculatorFields &&
                            <div className="col-md-12 pl-lg-0 pr-lg-0">
                                <fieldset className="scheduler-border">
                                    <legend className="scheduler-border">{i18n.t('static.tree.modelingCalculaterTool:')}</legend>
                                    <div className="row">
                                        {/* <div className="row"> */}
                                        {/* <FormGroup className="col-md-12 pt-lg-1">
                                        <Label htmlFor=""><b>Modeling Calculater Tool</b></Label>
                                    </FormGroup> */}
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.common.startdate')}<span class="red Reqasterisk">*</span></Label>
                                            <Picker
                                                ref={this.pickAMonth4}
                                                // years={{ min: { year: 2010, month: 2 }, max: { year: 2050, month: 9 } }}
                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                // value={this.state.singleValue2}
                                                value={{ year: new Date(this.state.currentCalculatorStartDate).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStartDate).getMonth() + 1)).slice(-2) }}
                                                lang={pickerLang.months}
                                                onChange={this.handleAMonthChange4}
                                                onDismiss={this.handleAMonthDissmis4}
                                            >
                                                <MonthBox value={this.makeText({ year: new Date(this.state.currentCalculatorStartDate).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStartDate).getMonth() + 1)).slice(-2) })} onClick={this.handleClickMonthBox4} />
                                            </Picker>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.targetDate')}<span class="red Reqasterisk">*</span></Label>
                                            <Picker
                                                ref={this.pickAMonth5}
                                                // years={{ min: { year: 2010, month: 2 }, max: { year: 2050, month: 9 } }}
                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                // value={this.state.singleValue2}
                                                value={{ year: new Date(this.state.currentCalculatorStopDate).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStopDate).getMonth() + 1)).slice(-2) }}
                                                lang={pickerLang.months}
                                                onChange={this.handleAMonthChange5}
                                                onDismiss={this.handleAMonthDissmis5}
                                            >
                                                <MonthBox value={this.makeText({ year: new Date(this.state.currentCalculatorStopDate).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStopDate).getMonth() + 1)).slice(-2) })} onClick={this.handleClickMonthBox5} />
                                            </Picker>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        {this.state.currentItemConfig.context.payload.nodeType.id <= 2 && <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.startValue')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="startValue"
                                                name="startValue"
                                                bsSize="sm"
                                                readOnly={true}
                                                value={addCommas(this.state.currentScenario.calculatedDataValue)}

                                            >
                                            </Input>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        }
                                        {this.state.currentItemConfig.context.payload.nodeType.id > 2 && <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.StartPercentage')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="startPercentage"
                                                name="startPercentage"
                                                bsSize="sm"
                                                readOnly={true}
                                                value={this.state.currentScenario.dataValue}

                                            >
                                            </Input>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        }
                                        {/* </div> */}
                                        {/* <div className="row"> */}

                                        <FormGroup className="col-md-5">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.targetEnding')} {this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'value' : '%'}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="currentEndValue"
                                                name="currentEndValue"
                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e); this.calculateMomByEndValue(e) }}
                                                value={addCommas(this.state.currentEndValue)}
                                                readOnly={this.state.currentEndValueEdit}
                                            >
                                            </Input>

                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        <FormGroup className="col-md-1 mt-lg-4">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.or')}</Label>
                                        </FormGroup>
                                        <FormGroup className="col-md-5">
                                            <Label htmlFor="currencyId">{this.state.currentItemConfig.context.payload.nodeType.id > 2 ? 'Change (% points)' : 'Target change (%)'}<span class="red Reqasterisk">*</span></Label>
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
                                        {this.state.currentModelingType != 3 && this.state.currentModelingType != 4 && this.state.currentModelingType != 5 && <FormGroup className="col-md-1 mt-lg-4">
                                            <Label htmlFor="currencyId">or</Label>
                                        </FormGroup>
                                        }
                                        {/* {this.state.currentItemConfig.context.payload.nodeType.id != 3  */}
                                        {this.state.currentModelingType != 3 && this.state.currentModelingType != 4 && this.state.currentModelingType != 5 && <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.Change(#)')}<span class="red Reqasterisk">*</span></Label>
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
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.CalculatedMonth-on-MonthChange')}<span class="red Reqasterisk">*</span></Label>
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
                                                {this.state.currentItemConfig.context.payload.nodeType.id == 2 && <div className="col-md-12 form-group">
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="radio"
                                                        id="active1"
                                                        name="modelingType"
                                                        checked={this.state.currentModelingType == 4 ? true : false}
                                                        onChange={(e) => { this.dataChange(e) }}
                                                    // onClick={(e) => { this.filterPlanningUnitNode(e); }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        <b>{'Exponential (%)'}</b>
                                                    </Label>
                                                </div>}
                                                {this.state.currentItemConfig.context.payload.nodeType.id == 2 && <div className="col-md-12 form-group">
                                                    <Input
                                                        className="form-check-input Radioactive checkboxMargin"
                                                        type="radio"
                                                        id="active2"
                                                        name="modelingType"
                                                        checked={(this.state.currentItemConfig.context.payload.nodeType.id > 2 || this.state.currentModelingType == 3) ? true : false}
                                                        onChange={(e) => { this.dataChange(e) }}
                                                    // onClick={(e) => { this.filterPlanningUnitAndForecastingUnitNodes(e) }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        <b>{'Linear (%)'}</b>
                                                    </Label>
                                                </div>
                                                }
                                                {this.state.currentItemConfig.context.payload.nodeType.id == 2 && <div className="col-md-12 form-group">
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="radio"
                                                        id="active3"
                                                        name="modelingType"
                                                        checked={this.state.currentModelingType == 2 ? true : false}
                                                        onChange={(e) => { this.dataChange(e) }}
                                                    // onClick={(e) => { this.filterPlanningUnitAndForecastingUnitNodes(e) }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                        <b>{'Linear (#)'}</b>
                                                    </Label>
                                                </div>}
                                                {this.state.currentItemConfig.context.payload.nodeType.id > 2 && <div className="col-md-12 form-group">
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="radio"
                                                        id="active4"
                                                        name="modelingType"
                                                        checked={this.state.currentModelingType == 5 ? true : false}
                                                        onChange={(e) => { this.dataChange(e) }}
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
                                    {/* </div> */}
                                </fieldset>
                            </div>
                        }

                    </div>
                    {this.state.showMomData &&
                        <div className="row pl-lg-2 pr-lg-2">
                            <fieldset className="scheduler-border">
                                <legend className="scheduler-border">{i18n.t('static.tree.monthlyData')}:</legend>
                                {/* <div className="row pl-lg-2 pr-lg-2"> */}
                                <div className="col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
                                    <div className="col-md-6">
                                        {/* <Button type="button" size="md" color="info" className="float-left mr-1" onClick={this.resetTree}>{'Show/hide data'}</Button> */}
                                    </div>
                                    <div className="row pl-lg-0 pt-lg-3">
                                        <div className="col-md-12 chart-wrapper chart-graph-report pl-0 ml-0">
                                            <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                            <div>

                                            </div>
                                        </div>
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
                                                        checked={this.state.currentScenario.manualChangesEffectFuture}
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
                                <div id="momJexcel">
                                </div>
                                <div className="col-md-12 pr-lg-0">
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => {
                                        this.setState({ showMomData: false })
                                    }}><i className="fa fa-times"></i> {'Close'}</Button>
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={(e) => this.updateMomDataInDataSet(e)}><i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>

                                </div>
                                {/* </div> */}


                            </fieldset>
                        </div>
                    }
                    {this.state.showMomDataPercent &&
                        <div className="row pl-lg-2 pr-lg-2">
                            <fieldset className="scheduler-border">
                                <legend className="scheduler-border">{i18n.t('static.tree.monthlyData')}:</legend>
                                {/* <div className="row pl-lg-2 pr-lg-2"> */}
                                <div className="col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
                                    <div className="col-md-6">
                                        {/* <Button type="button" size="md" color="info" className="float-left mr-1" onClick={this.resetTree}>{'Show/hide data'}</Button> */}
                                    </div>
                                    <div className="row pl-lg-0 pt-lg-3">
                                        <div className="col-md-12 chart-wrapper chart-graph-report pl-0 ml-0">
                                            <Bar id="cool-canvas" data={bar1} options={chartOptions1} />
                                            <div>

                                            </div>
                                        </div>
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
                                                        checked={this.state.currentScenario.manualChangesEffectFuture}
                                                        onClick={(e) => { this.momCheckbox(e); }}
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
                                <div className="pt-lg-2 pl-lg-0"><i>{i18n.t('static.tree.tableDisplays')} <b>{this.state.currentItemConfig.context.payload.nodeUnit.label != null ? getLabelText(this.state.currentItemConfig.context.payload.nodeUnit.label, this.state.lang) : ''}</b> {i18n.t('static.tree.forNode')} <b>{this.state.currentItemConfig.context.payload.label != null ? getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) : ''}</b> {i18n.t('static.tree.asA%OfParent')} <b>{this.state.currentItemConfig.parentItem.payload.label != null ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : ''}</b></i></div>
                                {/* <div className="pt-lg-2 pl-lg-0"><i>Table displays <b>{getLabelText(this.state.currentItemConfig.context.payload.nodeUnit.label, this.state.lang)}</b></div> */}
                                <div id="momJexcelPer" className={"RowClickable perNodeData FiltermomjexcelPer"}>
                                </div>
                                <div className="col-md-12 pr-lg-0">
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => {
                                        this.setState({
                                            showMomDataPercent: false
                                        });
                                    }}><i className="fa fa-times"></i> {'Close'}</Button>
                                    {/* <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.}><i className="fa fa-check"></i> {'Update'}</Button> */}
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={(e) => this.updateMomDataInDataSet(e)}><i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>

                                </div>
                                {/* </div> */}


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

    handleAMonthChange1 = (year, month) => {
        // console.log("value>>>", year);
        console.log("text>>>", (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0])
        var month = parseInt(month) < 10 ? "0" + month : month
        var date = year + "-" + month + "-" + "01"
        let { currentItemConfig } = this.state;
        var updatedMonth = date;
        var nodeDataMap = (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0];
        console.log("nodeDataMap---", nodeDataMap)
        nodeDataMap.month = updatedMonth;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0] = nodeDataMap;
        this.setState({ currentItemConfig, currentScenario: nodeDataMap }, () => {
            console.log("after state update---", this.state.currentItemConfig);
        });
        //
        //
    }

    handleAMonthDissmis1 = (value) => {
        console.log("dismiss>>", value);
        // this.setState({ singleValue2: value, }, () => {
        // this.fetchData();
        // })

    }

    handleClickMonthBox1 = (e) => {
        this.pickAMonth1.current.show()
    }

    handleClickMonthBox2 = (e) => {
        this.pickAMonth2.current.show()
    }
    handleAMonthChange2 = (year, month) => {
        console.log("value>>>", year);
        console.log("text>>>", month)
        var month = parseInt(month) < 10 ? "0" + month : month
        var date = year + "-" + month + "-" + "01"
        this.filterScalingDataByMonth(date);
        // let { currentItemConfig } = this.state;
        // (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].month = date;
        this.setState({ scalingMonth: date }, () => {
            console.log("after state update---", this.state.currentItemConfig);
        });
        //
        //
    }
    handleAMonthDissmis2 = (value) => {
        console.log("dismiss>>", value);
        // this.setState({ singleValue2: value, }, () => {
        // this.fetchData();
        // })

    }


    handleAMonthChange3 = (year, month) => {
        console.log("text>>>", year, " and ", month)
        // alert("hi");
    }

    handleAMonthDissmis3 = (value) => {
        console.log("dismiss>>", value);
        var date = value.year + "-" + value.month + "-" + "01"
        this.setState({ singleValue2: value, }, () => {
            // this.fetchData();
            // console.log("$$$", this.state.treeData);
            // console.log("$$$", this.state.curTreeObj);
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                var programId = this.state.programId;
                db1 = e.target.result;
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var program = transaction.objectStore('datasetData');
                var getRequest = program.get(programId.toString());
                getRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    });
                };
                getRequest.onsuccess = function (event) {
                    // console.log("hi",getRequest.result);
                    var programDataBytes = CryptoJS.AES.decrypt(getRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    // console.log("hi bro", programJson.nodeDataModelingList)
                    // var getMomDataForNodes = programJson.nodeDataModelingList.filter(c => c.treeId == this.state.treeId && c.scenarioId == this.state.selectedScenario && moment(c.month).format('YYYY-MM') == moment(date).format('YYYY-MM'));
                    // console.log("$$$>>>", getMomDataForNodes);
                    this.setState({
                        // modelinDataForScenario: getMomDataForNodes
                    }, () => {
                        // if (getMomDataForNodes.length > 0) { 
                        this.updateTreeData(date);
                        // } else { };
                    });
                    // getMomDataForCurrentNode.filter(c=>c.month <= '2022-12-01')

                }.bind(this)
            }.bind(this)

        })
    }

    handleClickMonthBox3 = (e) => {
        this.pickAMonth3.current.show()
    }

    handleClickMonthBox4 = (e) => {
        this.pickAMonth4.current.show()
    }
    handleAMonthChange4 = (year, month) => {
        // console.log("value>>>", year);
        // console.log("text>>>", month)
        this.setState({ currentCalculatorStartDate: year + "-" + month + "-01" }, () => {

        });

    }
    handleAMonthDissmis4 = (value) => {
        // console.log("dismiss>>", value);
        // this.setState({ singleValue2: value, }, () => {
        // this.fetchData();
        // })

    }


    handleClickMonthBox5 = (e) => {
        this.pickAMonth5.current.show()
    }
    handleAMonthChange5 = (year, month) => {
        // console.log("value>>>", year);
        // console.log("text>>>", month)
        this.setState({ currentCalculatorStopDate: year + "-" + month + "-01" }, () => {

        });

    }
    handleAMonthDissmis5 = (value) => {
        // console.log("dismiss>>", value);
        // this.setState({ singleValue2: value, }, () => {
        // this.fetchData();
        // })

    }

    updateTreeData(date) {
        var items = this.state.items;
        console.log("items>>>", items);
        console.log("get payload 111");
        for (let i = 0; i < items.length; i++) {
            console.log("get payload 12");
            // console.log("this.state.modelinDataForScenario---", this.state.modelinDataForScenario);
            console.log("items[i]---", items[i]);
            console.log("items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId---", items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId);
            console.log("items[i].payload.nodeDataMap[this.state.selectedScenario][0].modelling---", items[i].payload.nodeDataMap[this.state.selectedScenario][0]);
            if (items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList != null) {
                var nodeDataModelingMap = items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList.filter(x => moment(x.month).format('YYYY-MM') == moment(date).format('YYYY-MM'));
                console.log("nodeDataModelingMap>>>", nodeDataModelingMap);
                if (nodeDataModelingMap.length > 0) {
                    console.log("get payload 13");
                    if (nodeDataModelingMap[0].calculatedValue != null && nodeDataModelingMap[0].endValue != null) {
                        (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = nodeDataModelingMap[0].calculatedValue;
                        (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = nodeDataModelingMap[0].endValue;
                    } else {
                        console.log("get payload 14");
                        (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
                        (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].dataValue;
                    }
                } else {
                    (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
                    (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].dataValue;
                }
            } else {
                (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
                (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].dataValue;
            }
        }
        this.setState({
            items,
        })
    }
    render() {
        const { datasetList } = this.state;
        const { items } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.programCode + "~v" + item.version}
                    </option>
                )
            }, this);
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
                // <div className="ContactTemplate" style={{ opacity, backgroundColor: Colors.White, borderColor: Colors.Black }}>
                <div className="ContactTemplate boxContactTemplate">
                    <div className={itemConfig.payload.nodeType.id == 5 || itemConfig.payload.nodeType.id == 4 ? "ContactTitleBackground TemplateTitleBgblue" : "ContactTitleBackground TemplateTitleBg"}
                    >
                        <div className={itemConfig.payload.nodeType.id == 5 || itemConfig.payload.nodeType.id == 4 ? "ContactTitle TitleColorWhite" : "ContactTitle TitleColor"}><div title={itemConfig.payload.label.label_en} style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '158px', float: 'left', fontWeight: 'bold' }}>{itemConfig.payload.label.label_en}</div><b style={{ color: '#212721', float: 'right' }}>{itemConfig.payload.nodeType.id == 2 ? <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#002f6c' }}></i> : (itemConfig.payload.nodeType.id == 3 ? <i class="fa fa-percent " style={{ fontSize: '11px', color: '#002f6c' }} ></i> : (itemConfig.payload.nodeType.id == 4 ? <i class="fa fa-cube" style={{ fontSize: '11px', color: '#fff' }} ></i> : (itemConfig.payload.nodeType.id == 5 ? <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#fff' }} ></i> : (itemConfig.payload.nodeType.id == 1 ? <i class="fa fa-plus" style={{ fontSize: '11px', color: '#002f6c' }} ></i> : ""))))}</b></div>
                    </div>
                    <div className="ContactPhone ContactPhoneValue">
                        <span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 1)}</span>
                        <div style={{ overflow: 'inherit', fontStyle: 'italic' }}><p className="" style={{ textAlign: 'center' }}>{this.getPayloadData(itemConfig, 2)}</p></div>
                        {this.state.showModelingValidation && <div className="treeValidation"><span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 3) != "" ? "Sum of children: " : ""}</span><span className={this.getPayloadData(itemConfig, 3) != 100 ? "treeValidationRed" : ""}>{this.getPayloadData(itemConfig, 3) != "" ? this.getPayloadData(itemConfig, 3) + "%" : ""}</span></div>}
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
                        // treeCalculator(items);
                        // *****************
                        // console.log("anchal***************************************");
                        // this.createOrUpdateTree();
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

        const { singleValue2 } = this.state
        const { forecastMethodList } = this.state;
        let forecastMethods = forecastMethodList.length > 0
            && forecastMethodList.map((item, i) => {
                return (
                    <option key={i} value={item.forecastMethodId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { treeData } = this.state;
        console.log("treeData--->", treeData)
        let treeList = treeData.length > 0
            && treeData.map((item, i) => {
                return (
                    <option key={i} value={item.treeId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { scenarioList } = this.state;
        let scenarios = scenarioList.length > 0
            && scenarioList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { regionList } = this.state;
        let regionMultiList = regionList.length > 0
            && regionList.map((item, i) => {
                return ({ value: item.regionId, label: getLabelText(item.label, this.state.lang) })

            }, this);

        // regionMultiList = Array.from(regionMultiList);
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
                    lineType: LineType.Solid
                })
                );
            }
            else {
                treeLevelItems.push(new LevelAnnotationConfig({
                    levels: [i],
                    title: "Level " + i,
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
                                var nodeDataMap = {};
                                var tempArray = [];
                                var tempJson = {
                                    notes: '',
                                    month: new Date(),
                                    dataValue: "",
                                    calculatedDataValue: '',
                                    nodeDataModelingList: [],
                                    nodeDataOverrideList: [],
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
                                nodeDataMap[this.state.selectedScenario] = tempArray;
                                // tempArray.push(nodeDataMap);
                                this.setState({
                                    conversionFactor: '',
                                    parentScenario: itemConfig.level != 0 ? itemConfig.payload.nodeDataMap[this.state.selectedScenario][0] : {},
                                    usageText: '',
                                    currentScenario: {
                                        notes: '',
                                        dataValue: '',
                                        month: new Date(),
                                        fuNode: {
                                            noOfForecastingUnitsPerPerson: '',
                                            usageFrequency: '',
                                            nodeDataModelingList: [],
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
                                    },
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
                                                    label_en: ''
                                                },
                                                nodeType: {
                                                    id: ''
                                                },
                                                nodeUnit: {
                                                    id: ''
                                                },
                                                nodeDataMap: nodeDataMap
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
                                                nodeDataMap: itemConfig.payload.nodeDataMap
                                            }
                                        }

                                    }
                                }, () => {
                                    console.log("add click config---", this.state.currentItemConfig);
                                    console.log("add click nodeflag---", this.state.addNodeFlag);
                                    console.log("add click number node flag---", this.state.numberNode);
                                    this.setState({
                                        orgCurrentItemConfig: JSON.parse(JSON.stringify(this.state.currentItemConfig.context)),
                                    });

                                    this.getNodeTypeFollowUpList(itemConfig.payload.nodeType.id);
                                    if (itemConfig.payload.nodeType.id == 2 || itemConfig.payload.nodeType.id == 3) {
                                        var tracerCategoryId = "";
                                        this.filterUsageTemplateList(tracerCategoryId);
                                        this.getForecastingUnitListByTracerCategoryId();
                                    }
                                    else if (itemConfig.payload.nodeType.id == 4) {
                                        console.log("fu id---", itemConfig);
                                        this.getPlanningUnitListByFUId((itemConfig.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.id);
                                        this.getNoOfFUPatient();
                                        this.getNoOfMonthsInUsagePeriod();
                                        console.log("my data 1--->", itemConfig.parent);
                                        console.log("my data 2--->", this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload);
                                        console.log("my data 3--->", this.state.items);
                                        // this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en
                                        this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == itemConfig.parent)[0].payload.nodeUnit.id;
                                    } else {

                                    }
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
                    return <div className="CursorFrame">
                    </div>;
                },
                onHighlightRender: ({ context: itemConfig }) => {
                    return <div className="HighlightFrame" >

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
                        {/* <div className="pb-lg-0">
                            <div className="card-header-actions">
                                <div className="card-header-action pr-4 pt-lg-0">

                                    <Col md="12 pl-0">
                                        <div className="d-md-flex">
                                            <a className="pr-lg-0 pt-lg-1">
                                                <span style={{ cursor: 'pointer' }} onClick={this.cancelClicked}><i className="fa fa-long-arrow-left" style={{ color: '#20a8d8', fontSize: '13px' }}></i> <small className="supplyplanformulas">{'Return To List'}</small></span>
                                            </a>
                                            <FormGroup className="tab-ml-1 mt-md-0 mb-md-0 ">

                                                <a className="pr-lg-1" href="javascript:void();" title={i18n.t('static.common.addEntity')} onClick={() => {
                                                    this.setState({
                                                        openTreeDataModal: true
                                                    })
                                                }}><i className="fa fa-cog"></i></a>
                                                <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginTop: '-10px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')}
                                                    onClick={() => this.exportPDF()}
                                                />
                                                {this.state.selectedScenario > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginTop: '-10px' }} src={docicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportDoc()} />}
                                            </FormGroup>

                                        </div>
                                    </Col>
                                </div>
                            </div>
                        </div> */}
                        <CardBody className="pt-lg-1 pl-lg-0 pr-lg-0">
                            <div className="container-fluid pl-lg-3 pr-lg-3">
                                <>
                                    <Form>
                                        <CardBody className="pt-0 pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                            <div className="col-md-12 pl-lg-0">
                                                <Row>
                                                    <FormGroup className="col-md-3 pl-lg-0">
                                                        <Label htmlFor="currencyId">{i18n.t('static.consumption.program')}<span class="red Reqasterisk">*</span></Label>
                                                        <InputGroup>
                                                            <Input
                                                                type="select"
                                                                name="datasetId"
                                                                id="datasetId"
                                                                bsSize="sm"
                                                                value={this.state.programId}
                                                                onChange={(e) => { this.setStartAndStopDateOfProgram(e.target.value) }}
                                                            >
                                                                <option value="">{"Please select program"}</option>
                                                                {datasets}
                                                            </Input>

                                                        </InputGroup>

                                                    </FormGroup>
                                                    <FormGroup className="col-md-3 pl-lg-0" style={{ marginBottom: '0px' }}>
                                                        <Label htmlFor="languageId">{i18n.t('static.forecastMethod.tree')}</Label>
                                                        <InputGroup>
                                                            <Input
                                                                type="select"
                                                                name="treeId"
                                                                id="treeId"
                                                                bsSize="sm"
                                                                required
                                                                value={this.state.treeId}
                                                                onChange={(e) => { this.dataChange(e) }}

                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {treeList}
                                                            </Input>
                                                            <InputGroupAddon addonType="append">
                                                                <InputGroupText><i class="fa fa-cog icons" data-toggle="collapse" aria-expanded="false" onClick={this.toggleCollapse}></i></InputGroupText>
                                                            </InputGroupAddon>
                                                        </InputGroup>
                                                        {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3 pl-lg-0">

                                                        <Label htmlFor="languageId">{i18n.t('static.whatIf.scenario')}<span class="red Reqasterisk">*</span></Label>
                                                        <InputGroup>
                                                            {/* <InputGroupAddon addonType="append">
                                                                        <InputGroupText><i class="fa fa-plus icons" aria-hidden="true" data-toggle="tooltip" data-html="true" data-placement="bottom" onClick={this.showPopUp} title=""></i></InputGroupText>
                                                                    </InputGroupAddon> */}
                                                            <Input
                                                                type="select"
                                                                name="scenarioId"
                                                                id="scenarioId"
                                                                bsSize="sm"
                                                                // valid={!errors.languageId && this.state.user.language.languageId != ''}
                                                                // invalid={touched.languageId && !!errors.languageId}
                                                                onChange={(e) => { this.dataChange(e) }}
                                                                // onBlur={handleBlur}
                                                                required
                                                                value={this.state.selectedScenario}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {scenarios}
                                                            </Input>
                                                            <InputGroupAddon addonType="append">
                                                                {/* <InputGroupText><i class="fa fa-plus icons" aria-hidden="true" data-toggle="tooltip" data-html="true" data-placement="bottom" onClick={this.openScenarioModal} title=""></i></InputGroupText> */}
                                                                <InputGroupText><i class="fa fa-caret-down icons " onClick={this.toggleDropdown} title=""></i></InputGroupText>
                                                            </InputGroupAddon>
                                                        </InputGroup>
                                                        <div class="list-group DropdownScenario" style={{ display: this.state.showDiv1 ? 'block' : 'none' }}>
                                                            <p class="list-group-item list-group-item-action" onClick={() => { this.openScenarioModal(1) }}>Add Scenario</p>
                                                            <p class="list-group-item list-group-item-action" onClick={() => { this.openScenarioModal(2) }}>Edit Scenario</p>
                                                            <p class="list-group-item list-group-item-action" onClick={() => { this.openScenarioModal(3) }}>Delete Scenario</p>

                                                        </div>
                                                        {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3 pl-lg-0">
                                                        <Label htmlFor="languageId">{i18n.t('static.supplyPlan.date')}<span class="red Reqasterisk">*</span></Label>
                                                        <div className="controls edit">
                                                            <Picker
                                                                ref={this.pickAMonth3}
                                                                id="monthPicker"
                                                                name="monthPicker"
                                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                                value={singleValue2}
                                                                lang={pickerLang.months}
                                                                // theme="dark"
                                                                onChange={this.handleAMonthChange3}
                                                                onDismiss={this.handleAMonthDissmis3}
                                                            >
                                                                <MonthBox value={this.makeText(singleValue2)} onClick={(e) => { this.handleClickMonthBox3(e) }} />
                                                            </Picker>

                                                            {/* <Picker

                                                                            id="month"
                                                                            name="month"
                                                                            ref={this.pickAMonth1}
                                                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                                            value={{
                                                                                year:
                                                                                    new Date(this.state.currentScenario.month).getFullYear(), month: ("0" + (new Date(this.state.currentScenario.month).getMonth() + 1)).slice(-2)
                                                                            }}
                                                                            lang={pickerLang.months}
                                                                            // theme="dark"
                                                                            onChange={this.handleAMonthChange1}
                                                                            onDismiss={this.handleAMonthDissmis1}
                                                                        >
                                                                            <MonthBox value={this.makeText({ year: new Date(this.state.currentScenario.month).getFullYear(), month: ("0" + (new Date(this.state.currentScenario.month).getMonth() + 1)).slice(-2) })}
                                                                                onClick={this.handleClickMonthBox1} />
                                                                        </Picker> */}
                                                        </div>
                                                    </FormGroup>

                                                    <FormGroup className="col-md-2" >
                                                        <div className="check inline  pl-lg-1 pt-lg-0">
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
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3" style={{ marginLeft: '-2%' }}>
                                                        <div className="check inline  pl-lg-0 pt-lg-0">
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
                                                    <FormGroup className="col-md-6" >
                                                        <div className="check inline  pl-lg-0 pt-lg-0">
                                                            <div>
                                                                <Input
                                                                    className="form-check-input checkboxMargin"
                                                                    type="checkbox"
                                                                    id="active7"
                                                                    name="active7"
                                                                    // checked={false}
                                                                    onClick={(e) => { this.hideTreeValidation(e); }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                                    <b>{'Hide Tree Validation'}</b>
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    </FormGroup>

                                                </Row>
                                            </div>

                                        </CardBody>
                                        <div className="col-md-12 collapse-bg pl-lg-2 pr-lg-2 pt-lg-2 MarginBottomTree" style={{ display: this.state.showDiv ? 'block' : 'none' }} >
                                            <Formik
                                                enableReinitialize={true}
                                                initialValues={{
                                                    forecastMethodId: this.state.curTreeObj.forecastMethod.id,
                                                    treeName: this.state.curTreeObj.label.label_en,
                                                    regionArray: this.state.regionList,
                                                    regionId: this.state.regionValues,
                                                }}
                                                validate={validate(validationSchema)}
                                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                                    this.createOrUpdateTree();
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
                                                            <Row>
                                                                <FormGroup className="col-md-4">
                                                                    <Label htmlFor="currencyId">{i18n.t('static.forecastMethod.forecastMethod')}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="select"
                                                                        name="forecastMethodId"
                                                                        id="forecastMethodId"
                                                                        bsSize="sm"
                                                                        valid={!errors.forecastMethodId && this.state.curTreeObj.forecastMethod != null ? this.state.curTreeObj.forecastMethod.id : '' != ''}
                                                                        invalid={touched.forecastMethodId && !!errors.forecastMethodId}
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => { handleChange(e); this.treeDataChange(e) }}
                                                                        required
                                                                        value={this.state.curTreeObj.forecastMethod != null ? this.state.curTreeObj.forecastMethod.id : ''}
                                                                    >
                                                                        <option value="">{i18n.t('static.common.forecastmethod')}</option>
                                                                        {forecastMethods}
                                                                    </Input>
                                                                    <FormFeedback>{errors.forecastMethodId}</FormFeedback>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-4">
                                                                    <Label htmlFor="currencyId">{i18n.t('static.common.treeName')}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input type="text"
                                                                        id="treeName"
                                                                        name="treeName"
                                                                        bsSize="sm"
                                                                        valid={!errors.treeName && this.state.curTreeObj.label != null ? this.state.curTreeObj.label.label_en : '' != ''}
                                                                        invalid={touched.treeName && !!errors.treeName}
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => { handleChange(e); this.treeDataChange(e) }}
                                                                        value={this.state.curTreeObj.label != null ? this.state.curTreeObj.label.label_en : ''}
                                                                    ></Input>
                                                                    <FormFeedback>{errors.treeName}</FormFeedback>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-4">
                                                                    <Label htmlFor="currencyId">{i18n.t('static.region.region')}<span class="red Reqasterisk">*</span></Label>
                                                                    <div className="controls ">
                                                                        {/* <InMultiputGroup> */}
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
                                                                        {/* <MultiSelect
                                                                            // type="select"
                                                                            name="regionId"
                                                                            id="regionId"
                                                                            bsSize="sm"
                                                                            value={this.state.regionValues}
                                                                            onChange={(e) => { this.handleRegionChange(e) }}
                                                                            options={regionMultiList && regionMultiList.length > 0 ? regionMultiList : []}
                                                                            labelledBy={i18n.t('static.common.regiontext')}
                                                                        /> */}
                                                                    </div>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-5">
                                                                    <Label htmlFor="currencyId">{i18n.t('static.common.note')}</Label>
                                                                    <Input type="textarea"
                                                                        id="treeNotes"
                                                                        name="treeNotes"
                                                                        onChange={(e) => { this.treeDataChange(e) }}
                                                                        value={this.state.curTreeObj.notes != "" ? this.state.curTreeObj.notes : ''}
                                                                    ></Input>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-4 pt-lg-4">
                                                                    <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label>
                                                                    <FormGroup check inline>
                                                                        <Input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            id="active10"
                                                                            name="active"
                                                                            value={true}
                                                                            checked={this.state.curTreeObj.active === true}
                                                                            onChange={(e) => { this.treeDataChange(e) }}
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
                                                                            checked={this.state.curTreeObj.active === false}
                                                                            onChange={(e) => { this.treeDataChange(e) }}
                                                                        />
                                                                        <Label
                                                                            className="form-check-label"
                                                                            check htmlFor="inline-radio2">
                                                                            {i18n.t('static.common.disabled')}
                                                                        </Label>
                                                                    </FormGroup>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-3 pt-lg-4">
                                                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ showDiv: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                                    <Button type="submit" size="md" onClick={() => this.touchAll(setTouched, errors)} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                                </FormGroup>
                                                            </Row>
                                                        </Form>
                                                    )} />
                                        </div>

                                        <div className="pb-lg-0" style={{ marginTop: '-2%' }}>
                                            <div className="card-header-actions">
                                                <div className="card-header-action pr-4 pt-lg-0">

                                                    <Col md="12 pl-0">
                                                        <div className="d-md-flex">
                                                            <a className="pr-lg-0 pt-lg-1">
                                                                <span style={{ cursor: 'pointer' }} onClick={this.cancelClicked}><i className="fa fa-long-arrow-left" style={{ color: '#20a8d8', fontSize: '13px' }}></i> <small className="supplyplanformulas">{'Return To List'}</small></span>
                                                            </a>
                                                            <FormGroup className="tab-ml-1 mt-md-0 mb-md-0 ">

                                                                {/* <a className="pr-lg-1" href="javascript:void();" title={i18n.t('static.common.addEntity')} onClick={() => {
                                                                                this.setState({
                                                                                    openTreeDataModal: true
                                                                                })
                                                                            }}><i className="fa fa-cog"></i></a> */}
                                                                {this.state.selectedScenario > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginTop: '-10px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')}
                                                                    onClick={() => this.exportPDF()}
                                                                />}
                                                                {this.state.selectedScenario > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginTop: '-10px' }} src={docicon} title={i18n.t('static.report.exportWordDoc')} onClick={() => this.exportDoc()} />}
                                                            </FormGroup>

                                                        </div>
                                                    </Col>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: !this.state.loading ? "block" : "none" }} class="sample">
                                            {/* <h5 style={{ color: '#BA0C2F' }}>Please save and do a recalculate after drag and drop.</h5> */}
                                            <Provider>
                                                <div className="placeholder" style={{ clear: 'both', height: '100vh', border: '1px solid #a7c6ed' }} >
                                                    {/* <OrgDiagram centerOnCursor={true} config={config} onHighlightChanged={this.onHighlightChanged} /> */}
                                                    <OrgDiagram centerOnCursor={true} config={config} onCursorChanged={this.onCursoChanged} />
                                                </div>
                                            </Provider>
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
                                        <CardFooter style={{ backgroundColor: 'transparent', borderTop: '0px solid #c8ced3', display: this.state.selectedScenario != '' ? "block" : "none" }}>
                                            <div class="row">
                                                <div className="col-md-6 pl-lg-0"> <h5 style={{ color: '#BA0C2F' }}>{i18n.t('static.tree.pleaseSaveAndDoARecalculateAfterDragAndDrop.')}</h5></div>
                                                <div className="col-md-6 pr-lg-0"> <Button type="button" size="md" color="info" className="float-right mr-1" onClick={() => this.callAfterScenarioChange(this.state.selectedScenario)}><i className="fa fa-calculator"></i> {i18n.t('static.tree.calculated')}</Button>
                                                    {/* <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.resetTree}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button> */}
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.saveTreeData()}><i className="fa fa-check"> </i>{i18n.t('static.pipeline.save')}</Button>
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Form>

                                </>

                            </div>
                        </CardBody>

                    </Card></Col></Row>
            {/* tree fields Modal start------------------- */}
            <Draggable handle=".modal-title">
                <Modal isOpen={this.state.openTreeDataModal}
                    className={'modal-md '} >
                    <ModalHeader className="modalHeaderSupplyPlan hideCross">
                        <strong>{i18n.t('static.tree.Add/EditTreeData')}</strong>
                        <Button size="md" onClick={() => this.setState({ openTreeDataModal: false })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                    </ModalHeader>
                    <ModalBody>
                        {/* <FormGroup className="col-md-12">
                            <Label htmlFor="currencyId">Program<span class="red Reqasterisk">*</span></Label>
                            <InputGroup>
                                <Input
                                    type="select"
                                    name="datasetId"
                                    id="datasetId"
                                    bsSize="sm"
                                    value={this.state.programId}
                                    onChange={(e) => { this.setStartAndStopDateOfProgram(e.target.value) }}
                                >
                                    <option value="">{i18n.t('static.common.pleaseSelect')}</option>
                                    {datasets}
                                </Input>
                            </InputGroup>

                        </FormGroup> */}
                        <FormGroup className="col-md-12">
                            <Label htmlFor="currencyId">{i18n.t('static.forecastMethod.forecastMethod')}<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                name="forecastMethodId1"
                                id="forecastMethodId1"
                                bsSize="sm"
                                onChange={(e) => { this.treeDataChange(e) }}
                                required
                                value={this.state.curTreeObj.forecastMethod != null ? this.state.curTreeObj.forecastMethod.id : ''}
                            >
                                <option value="-1">{i18n.t('static.common.forecastmethod')}</option>
                                {forecastMethods}
                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-12">
                            <Label htmlFor="currencyId">{i18n.t('static.common.treeName')}<span class="red Reqasterisk">*</span></Label>
                            <Input type="text"
                                id="treeName"
                                name="treeName"
                                bsSize="sm"
                                onChange={(e) => { this.treeDataChange(e) }}
                                value={this.state.curTreeObj.label != null ? this.state.curTreeObj.label.label_en : ''}
                            ></Input>
                        </FormGroup>
                        <FormGroup className="col-md-12">
                            <Label htmlFor="currencyId">{i18n.t('static.region.region')}<span class="red Reqasterisk">*</span></Label>
                            <div className="controls ">
                                {/* <InMultiputGroup> */}
                                <MultiSelect
                                    // type="select"
                                    name="regionId2"
                                    id="regionId2"
                                    bsSize="sm"
                                    value={this.state.regionValues}
                                    onChange={(e) => { this.handleRegionChange(e) }}
                                    options={regionMultiList && regionMultiList.length > 0 ? regionMultiList : []}
                                    labelledBy={i18n.t('static.common.regiontext')}
                                />
                            </div>
                        </FormGroup>
                        <FormGroup className="col-md-12">
                            <Label htmlFor="currencyId">{i18n.t('static.common.note')}</Label>
                            <Input type="textarea"
                                id="treeNotes"
                                name="treeNotes"
                                onChange={(e) => { this.treeDataChange(e) }}
                                value={this.state.curTreeObj.notes != "" ? this.state.curTreeObj.notes : ''}
                            ></Input>
                        </FormGroup>
                        <FormGroup className="col-md-12">
                            <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label>
                            <FormGroup check inline>
                                <Input
                                    className="form-check-input"
                                    type="radio"
                                    id="active10"
                                    name="active"
                                    value={true}
                                    checked={this.state.curTreeObj.active === true}
                                    onChange={(e) => { this.treeDataChange(e) }}
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
                                    checked={this.state.curTreeObj.active === false}
                                    onChange={(e) => { this.treeDataChange(e) }}
                                />
                                <Label
                                    className="form-check-label"
                                    check htmlFor="inline-radio2">
                                    {i18n.t('static.common.disabled')}
                                </Label>
                            </FormGroup>
                        </FormGroup>

                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit" size="md" onClick={(e) => { this.createOrUpdateTree() }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openTreeDataModal: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
            </Draggable>
            {/* Scenario Modal start------------------- */}
            <Draggable handle=".modal-title">
                <Modal isOpen={this.state.openAddScenarioModal}
                    className={'modal-md '} >
                    <ModalHeader className="modalHeaderSupplyPlan hideCross">
                        <strong>{i18n.t('static.tree.Add/EditTreeData')}</strong>
                        <Button size="md" onClick={this.openScenarioModal} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                    </ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label htmlFor="currencyId">{i18n.t('static.tree.scenarioName')}<span class="red Reqasterisk">*</span></Label>
                            <Input type="text"
                                id="scenarioName"
                                name="scenarioName"
                                onChange={(e) => { this.scenarioChange(e) }}
                                value={this.state.scenario.label.label_en}
                            ></Input>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="currencyId">{i18n.t('static.common.note')}</Label>
                            <Input type="text"
                                id="scenarioDesc"
                                name="scenarioDesc"
                                onChange={(e) => { this.scenarioChange(e) }}
                                value={this.state.scenario.notes}
                            ></Input>
                        </FormGroup>

                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit" size="md" onClick={this.addScenario} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={this.openScenarioModal}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
            </Draggable>
            {/* Modal end------------------------ */}
            {/* Modal start------------------- */}
            {/* <Draggable handle=".modal-title"> */}
            <Modal isOpen={this.state.openAddNodeModal}
                className={'modal-xl '} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>{i18n.t('static.tree.Add/EditNode')}</strong>  {this.state.activeTab1[0] === '2' && <div className="HeaderNodeText"> {
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
                                        {i18n.t('static.tree.nodeData')}
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        active={this.state.activeTab1[0] === '2'}
                                        onClick={() => { this.toggleModal(0, '2'); }}
                                    >
                                        {i18n.t('static.tree.Modeling/Transfer')}
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
            {/* </Draggable > */}
            {/* Scenario Modal end------------------------ */}

        </div >
    }
}

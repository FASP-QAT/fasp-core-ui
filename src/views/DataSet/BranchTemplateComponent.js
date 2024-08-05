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
import pdfIcon from '../../assets/img/pdf.png';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
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
import { ROUNDING_NUMBER, POSITIVE_WHOLE_NUMBER, NUMBER_NODE_ID, PERCENTAGE_NODE_ID, FU_NODE_ID, PU_NODE_ID, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY, JEXCEL_PAGINATION_OPTION, JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE, JEXCEL_DECIMAL_MONTHLY_CHANGE, JEXCEL_PRO_KEY, TREE_DIMENSION_ID, JEXCEL_MONTH_PICKER_FORMAT, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_DECIMAL_NO_REGEX_LONG, DATE_FORMAT_CAP } from '../../Constants.js'
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
import docicon from '../../assets/img/doc.png';
import AggregationNode from '../../assets/img/Aggregation-icon.png';
import { saveAs } from "file-saver";
import { convertInchesToTwip, Document, ImageRun, Packer, Paragraph, ShadingType, TextRun } from "docx";
import { calculateModelingData } from './ModelingDataCalculationForTreeTemplate';
import PDFDocument from 'pdfkit-nodejs-webpack';
import blobStream from 'blob-stream';
import OrgDiagramPdfkit from '../TreePDF/OrgDiagramPdfkit';
import Size from 'basicprimitives/src/graphics/structs/Size';
import classNames from 'classnames';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Prompt } from 'react-router';
import AuthenticationService from '../Common/AuthenticationService';
import RotatedText from 'basicprimitivesreact/dist/umd/Templates/RotatedText';


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
            .required(i18n.t('static.validation.fieldRequired')),
        nodeTitle: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.validation.fieldRequired')),
        nodeUnitId: Yup.string()
            .test('nodeUnitId', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2 || parseInt(document.getElementById("nodeTypeId").value) == 4) && document.getElementById("nodeUnitId").value == "") {
                        // // console.log("Pass 1");
                        return false;
                    } else {
                        // // console.log("Fail 1");
                        return true;
                    }
                }),
        monthNo: Yup.string()
            .test('monthNo', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    // // console.log("@@@",(parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2) && document.getElementById("nodeUnitId").value == "");
                    if (parseInt(document.getElementById("nodeTypeId").value) != 1 && document.getElementById("monthNo").value == "") {
                        // // console.log("Pass 2");
                        return false;
                    } else {
                        // // console.log("Fail 2");
                        return true;
                    }
                }),
        percentageOfParent: Yup.string()
            .test('percentageOfParent', i18n.t('static.tree.decimalValidation10&2'),
                function (value) {
                    var testNumber = document.getElementById("percentageOfParent").value != "" ? (/^\d{0,3}(\.\d{1,4})?$/).test(document.getElementById("percentageOfParent").value) : false;
                    // // console.log(">>>>*", parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 4) && (document.getElementById("percentageOfParent").value == "" || testNumber == false);
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 4 || parseInt(document.getElementById("nodeTypeId").value) == 5) && (document.getElementById("percentageOfParent").value == "" || testNumber == false)) {
                        // // console.log("Pass 3");
                        return false;
                    } else {
                        // console.log("Fail 3");
                        return true;
                    }
                }),
        nodeValue: Yup.string()
            .test('nodeValue', 'Please enter a valid number having less then 10 digits.',
                function (value) {
                    // // console.log("*****", document.getElementById("nodeValue").value);
                    var testNumber = (/^(?!$)\d{0,10}(?:\.\d{1,4})?$/).test((document.getElementById("nodeValue").value).replaceAll(",", ""));
                    // // console.log("*****", testNumber);
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2) && (document.getElementById("nodeValue").value == "" || testNumber == false)) {
                        // console.log("Pass 4");
                        return false;
                    } else {
                        // console.log("Fail 4");
                        return true;
                    }
                }),
        needFUValidation: Yup.boolean(),
        forecastingUnitId: Yup.string()
            .when("needFUValidation", {
                is: val => {
                    return document.getElementById("needFUValidation").value === "true";

                },
                then: Yup.string()
                    .required('Please select forecasting unit')
                    .typeError('Please select forecasting unit'),
                otherwise: Yup.string().notRequired()
            }),
        planningUnitIdFUFlag: Yup.boolean(),
        planningUnitIdFU: Yup.string()
            .when("planningUnitIdFUFlag", {
                is: val => {
                    return parseInt(document.getElementById("nodeTypeId").value) == 4 && document.getElementById("planningUnitIdFUFlag").value === "true" && document.getElementById("planningUnitIdFU").value === "";

                },
                then: Yup.string()
                    .required('Please select planning unit')
                    .typeError('Please select planning unit'),
                otherwise: Yup.string().notRequired()
            }),
        usageTypeIdFU: Yup.string()
            .test('usageTypeIdFU', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (parseInt(document.getElementById("nodeTypeId").value) == 4 && document.getElementById("usageTypeIdFU").value == "") {
                        // console.log("Pass 5");
                        return false;
                    } else {
                        // console.log("Fail 5");
                        return true;
                    }
                }),
        lagInMonths:
            Yup.string().test('lagInMonths', 'Please enter a valid number having less then equal to 3 digit.',
                function (value) {
                    // // console.log("*****", document.getElementById("nodeValue").value);
                    var testNumber = (/^\d{0,3}?$/).test(document.getElementById("lagInMonths").value);
                    // // console.log("*****", testNumber);
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 4) && (document.getElementById("lagInMonths").value == "" || testNumber == false)) {
                        // console.log("Pass 6");
                        return false;
                    } else {
                        // console.log("Fail 6");
                        return true;
                    }
                }),

        noOfPersons:
            Yup.string().test('noOfPersons', 'Please enter a valid 10 digit number.',
                function (value) {
                    // // console.log("*****", document.getElementById("nodeValue").value);
                    var testNumber = (/^\d{0,10}?$/).test((document.getElementById("noOfPersons").value).replaceAll(",", ""));
                    // // console.log("*****", testNumber);
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 4) && (document.getElementById("noOfPersons").value == "" || testNumber == false)) {
                        // console.log("Pass 7");
                        return false;
                    } else {
                        // console.log("Fail 7");
                        return true;
                    }
                }),

        forecastingUnitPerPersonsFC:
            Yup.string().test('forecastingUnitPerPersonsFC', i18n.t('static.tree.decimalValidation12&2'),
                function (value) {
                    // // console.log("*****", document.getElementById("nodeValue").value);
                    var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("forecastingUnitPerPersonsFC").value).replaceAll(",", ""));
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 4) && (document.getElementById("forecastingUnitPerPersonsFC").value == "" || testNumber == false)) {
                        // console.log("Pass 8");
                        return false;
                    } else {
                        // console.log("Fail 8");
                        return true;
                    }
                }),
        usageFrequencyCon: Yup.string()
            .test('usageFrequencyCon', i18n.t('static.tree.decimalValidation12&2'),
                function (value) {
                    var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("usageFrequencyCon").value).replaceAll(",", ""))
                    if (document.getElementById("usageTypeIdFU").value == 2 && (document.getElementById("usageFrequencyCon").value == "" || testNumber == false)) {
                        // console.log("Pass 9");
                        return false;
                    } else {
                        // console.log("Fail 9");
                        return true;
                    }
                }),
        usageFrequencyDis: Yup.string()
            .test('usageFrequencyDis', i18n.t('static.tree.decimalValidation12&2'),
                function (value) {
                    var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("usageFrequencyDis").value).replaceAll(",", ""))
                    if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value == 'false' || document.getElementById("oneTimeUsage").value == false) && (document.getElementById("usageFrequencyDis").value == "" || testNumber == false)) {
                        // console.log("Pass 10");
                        return false;
                    } else {
                        // console.log("Fail 10");
                        return true;
                    }
                }),
        usagePeriodIdCon: Yup.string()
            .test('usagePeriodIdCon', 'This field is required.',
                function (value) {
                    if (document.getElementById("usageTypeIdFU").value == 2 && document.getElementById("usagePeriodIdCon").value == "") {
                        // console.log("Pass 11");
                        return false;
                    } else {
                        // console.log("Fail 11");
                        return true;
                    }

                }),
        usagePeriodIdDis: Yup.string()
            .test('usagePeriodIdDis', 'This field is required.',
                function (value) {
                    if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value == 'false' || document.getElementById("oneTimeUsage").value == false) && document.getElementById("usagePeriodIdDis").value == "") {
                        // console.log("usagePeriodIdDis false");
                        // console.log("Pass 12");
                        return false;
                    } else {
                        // console.log("usagePeriodIdDis true");
                        // console.log("Fail 12");
                        return true;
                    }

                }),
        oneTimeUsage: Yup.string()
            .test('oneTimeUsage', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (document.getElementById("usageTypeIdFU").value == 1 && document.getElementById("oneTimeUsage").value == "") {
                        // console.log("Pass 13");
                        return false;
                    } else {
                        // console.log("Fail 13");
                        return true;
                    }
                }),
        repeatCount: Yup.string().test('repeatCount', i18n.t('static.tree.decimalValidation12&2'),
            function (value) {
                var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("repeatCount").value).replaceAll(",", ""));
                if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value === "false" || document.getElementById("oneTimeUsage").value === false) && (document.getElementById("repeatCount").value == "" || testNumber == false)) {
                    // console.log("Pass 14");
                    return false;
                } else {
                    // console.log("Fail 14");
                    return true;
                }
            }),
        repeatUsagePeriodId: Yup.string().test('repeatUsagePeriodId', 'This field is required.',
            function (value) {
                if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value == "false" || document.getElementById("oneTimeUsage").value == false) && (document.getElementById("repeatUsagePeriodId").value == "")) {
                    // console.log("Pass 15");
                    return false;
                } else {
                    // console.log("Fail 15");
                    return true;
                }
            }),
        planningUnitId: Yup.string()
            .test('planningUnitId', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (parseInt(document.getElementById("nodeTypeId").value) == 5 && document.getElementById("planningUnitId").value == "") {
                        // console.log("Pass 16");
                        return false;
                    } else {
                        // console.log("Fail 16");
                        return true;
                    }
                }),

        refillMonths: Yup.string()
            .test('refillMonths', 'Please enter a valid number having less then 10 digits.',
                function (value) {
                    // // console.log("*****", document.getElementById("nodeValue").value);
                    var testNumber = (/^[1-9]\d*$/).test((document.getElementById("refillMonths").value).replaceAll(",", ""));
                    // // console.log("*****", testNumber);
                    if ((document.getElementById("nodeTypeId").value == 5 && document.getElementById("usageTypeIdPU").value == 2) && (document.getElementById("refillMonths").value == "" || testNumber == false)) {
                        // console.log("Pass 17");
                        return false;
                    } else {
                        // console.log("Fail 17");
                        return true;
                    }
                }),
        sharePlanningUnit: Yup.string()
            .test('sharePlanningUnit', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (document.getElementById("nodeTypeId").value == 5 && document.getElementById("usageTypeIdPU").value == 1 && document.getElementById("sharePlanningUnit").value == "") {
                        // console.log("Pass 18");
                        return false;
                    } else {
                        // console.log("Fail 18");
                        return true;
                    }
                }),
        puPerVisit: Yup.string()
            .test('puPerVisit', 'Please enter # of pu per visit.',
                function (value) {
                    var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("puPerVisit").value).replaceAll(",", ""));
                    if (document.getElementById("nodeTypeId").value == 5 && (document.getElementById("usageTypeIdPU").value == 2 || document.getElementById("sharePlanningUnit").value == false || document.getElementById("sharePlanningUnit").value == "false") && (document.getElementById("puPerVisit").value == "" || testNumber == false)) {
                        // console.log("Pass 19");
                        return false;
                    } else {
                        // console.log("Fail 19");
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
            .required("Please select forecast method"),
        treeName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.tree.templateNameRequired')),
        monthsInPast: Yup.string()
            .matches(/^\d{0,15}(,\d{3})*(\.\d{1,2})?$/, 'Enter valid positive numbers')
            .required("Please enter a number"),
        monthsInFuture: Yup.string()
            .matches(/^\d{0,15}(,\d{3})*(\.\d{1,2})?$/, 'Enter valid positive numbers')
            .required("Please enter a number")

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
        var x2 = x.length > 1 ? '.' + x[1].slice(0, 4) : '';
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


function addCommasTwoDecimal(cell1, row) {
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

function addCommasThreeDecimal(cell1, row) {
    if (cell1 != null && cell1 != "") {
        cell1 += '';
        var x = cell1.replaceAll(",", "").split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1].slice(0, 3) : '';
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

export default class BranchTemplate extends Component {
    constructor() {
        super();
        this.pickAMonth5 = React.createRef()
        this.pickAMonth4 = React.createRef()
        this.pickAMonth2 = React.createRef()
        this.pickAMonth1 = React.createRef()
        this.state = {
            isValidError: '',
            isTemplateChanged: false,
            percentForOneMonth: '',
            sameLevelNodeList1: [],
            nodeUnitListPlural: [],
            popoverOpenMonthInPast: false,
            popoverOpenMonthInFuture: false,
            monthId: 1,
            monthList: [],
            isChanged: false,
            isSubmitClicked: false,
            popoverOpenHowManyPUperIntervalPer: false,
            popoverOpenWillClientsShareOnePU: false,
            popoverOpenConsumptionIntervalEveryXMonths: false,
            popoverOpenQATEstimateForInterval: false,
            popoverOpenNoOfPUUsage: false,
            popoverOpenConversionFactorFUPU: false,
            popoverOpenPlanningUnitNode: false,
            popoverOpenHashOfUMonth: false,
            popoverOpenForecastingUnitPU: false,
            popoverOpenTypeOfUsePU: false,
            popoverOpenSingleUse: false,
            popoverOpenLagInMonth: false,
            popoverOpenTypeOfUse: false,
            popoverOpenCopyFromTemplate: false,
            popoverOpentracercategoryModelingType: false,
            popoverOpenParentValue: false,
            popoverOpenPercentageOfParent: false,
            popoverOpenParent: false,
            popoverOpenCalculatedMonthOnMonthChnage: false,
            popoverOpenTargetChangeHash: false,
            popoverOpenTargetChangePercent: false,
            popoverOpenTargetEndingValue: false,
            popoverOpenMonth: false,
            popoverOpenNodeValue: false,
            popoverOpenSenariotree: false,
            popoverOpenNodeType: false,
            popoverOpenNodeTitle: false,
            hideFUPUNode: false,
            hidePUNode: false,
            viewMonthlyData: true,
            showFUValidation: true,
            fuValues: [],
            fuLabels: [],
            showModelingValidation: true,
            hidePlanningUnit: false,
            maxNodeDataId: '',
            nodeDataMomList: [],
            modelingJexcelLoader: false,
            momJexcelLoader: false,
            momListPerParent: [],
            scalingMonth: new Date(),
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
            minDateValue: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            treeTemplate: {
                treeTemplateId: 0,
                monthsInPast: 1,
                monthsInFuture: 36,
                label: {
                    label_en: ""
                },
                forecastMethod: {
                    label: {
                        label_en: ""
                    }
                },
                active: true
                , flatList: [],
                levelList: []
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
                                    monthNo: "",
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
                                        refillMonths: '',
                                        puPerVisit: ''
                                    },
                                    nodeDataModelingList: []
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
                                    fuNode: {
                                        forecastingUnit: {
                                            tracerCategory: {

                                            },
                                            unit: {

                                            }
                                        },
                                        usageType: {
                                            id: ""
                                        },
                                        usagePeriod: {

                                        }
                                    }
                                }
                                ,
                                {
                                    puNode: {
                                        planningUnit: {
                                            id: ''
                                        },
                                        refillMonths: '',
                                        puPerVisit: ''
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
            momListPer: [],
            currentModelingType: '',
            currentTransferData: '',
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
            currentRowIndex: '',
            lastRowDeleted: false,
            modelingChanged: false,
            levelModal: false,
            nodeTransferDataList: []

        }
        this.getMomValueForDateRange = this.getMomValueForDateRange.bind(this);
        this.toggleMonthInPast = this.toggleMonthInPast.bind(this);
        this.toggleMonthInFuture = this.toggleMonthInFuture.bind(this);
        this.toggleHowManyPUperIntervalPer = this.toggleHowManyPUperIntervalPer.bind(this);
        this.toggleWillClientsShareOnePU = this.toggleWillClientsShareOnePU.bind(this);
        this.toggleConsumptionIntervalEveryXMonths = this.toggleConsumptionIntervalEveryXMonths.bind(this);
        this.toggleQATEstimateForInterval = this.toggleQATEstimateForInterval.bind(this);
        this.toggleNoOfPUUsage = this.toggleNoOfPUUsage.bind(this);
        this.toggleConversionFactorFUPU = this.toggleConversionFactorFUPU.bind(this);
        this.togglePlanningUnitNode = this.togglePlanningUnitNode.bind(this);
        this.toggleHashOfUMonth = this.toggleHashOfUMonth.bind(this);
        this.toggleForecastingUnitPU = this.toggleForecastingUnitPU.bind(this);
        this.toggleTypeOfUsePU = this.toggleTypeOfUsePU.bind(this);
        this.toggleSingleUse = this.toggleSingleUse.bind(this);
        this.toggleLagInMonth = this.toggleLagInMonth.bind(this);
        this.toggleTypeOfUse = this.toggleTypeOfUse.bind(this);
        this.toggleCopyFromTemplate = this.toggleCopyFromTemplate.bind(this);
        this.toggletracercategoryModelingType = this.toggletracercategoryModelingType.bind(this);
        this.toggleParentValue = this.toggleParentValue.bind(this);
        this.togglePercentageOfParent = this.togglePercentageOfParent.bind(this);
        this.toggleParent = this.toggleParent.bind(this);
        this.toggleCalculatedMonthOnMonthChnage = this.toggleCalculatedMonthOnMonthChnage.bind(this);
        this.toggleTargetChangeHash = this.toggleTargetChangeHash.bind(this);
        this.toggleTargetChangePercent = this.toggleTargetChangePercent.bind(this);
        this.toggleTargetEndingValue = this.toggleTargetEndingValue.bind(this);
        this.toggleMonth = this.toggleMonth.bind(this);
        this.toggleNodeValue = this.toggleNodeValue.bind(this);
        this.toggleNodeType = this.toggleNodeType.bind(this);
        this.toggleNodeTitle = this.toggleNodeTitle.bind(this);
        this.toggleSenariotree = this.toggleSenariotree.bind(this);

        this.updateMomDataInDataSet = this.updateMomDataInDataSet.bind(this);
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
        this.getNodeTransferList = this.getNodeTransferList.bind(this);
        this.acceptValue = this.acceptValue.bind(this);
        this.calculateScalingTotal = this.calculateScalingTotal.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.formSubmitLoader = this.formSubmitLoader.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.momCheckbox = this.momCheckbox.bind(this);
        this.resetNodeData = this.resetNodeData.bind(this);
        this.filterScalingDataByMonth = this.filterScalingDataByMonth.bind(this);
        this.calculateMOMData = this.calculateMOMData.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getMaxNodeDataId = this.getMaxNodeDataId.bind(this);
        this.exportPDF = this.exportPDF.bind(this);
        this.round = this.round.bind(this);
        this.calculatePUPerVisit = this.calculatePUPerVisit.bind(this);
        this.qatCalculatedPUPerVisit = this.qatCalculatedPUPerVisit.bind(this);
        this.calculateParentValueFromMOM = this.calculateParentValueFromMOM.bind(this);
        this.generateMonthList = this.generateMonthList.bind(this);
        this.updateTreeData = this.updateTreeData.bind(this);
        this.levelDeatilsSaved = this.levelDeatilsSaved.bind(this);
        this.filterUsageTemplateList = this.filterUsageTemplateList.bind(this);
    }
    filterUsageTemplateList(forecastingUnitId) {
        var usageTemplateList;
        if (forecastingUnitId > 0) {
            usageTemplateList = this.state.usageTemplateListAll.filter(x => x.forecastingUnit.id == forecastingUnitId);
        } else {
            usageTemplateList = this.state.usageTemplateListAll;
        }
        this.setState({ usageTemplateList });
    }
    levelClicked(data) {
        var name = "";
        var unit = "";
        var levelNo = "";
        // console.log("Data@@@@@@@@@@@@", data != "")
        if (data != "") {
            // console.log("Data@@@@###############", data.context.levels[0])
            var treeLevelList = this.state.treeTemplate.levelList != undefined ? this.state.treeTemplate.levelList : [];
            var levelListFiltered = treeLevelList.filter(c => c.levelNo == data.context.levels[0]);
            levelNo = data.context.levels[0]
            if (levelListFiltered.length > 0) {
                name = levelListFiltered[0].label.label_en;
                unit = levelListFiltered[0].unit != null ? levelListFiltered[0].unit.id : "";
            }
            // console.log("Name@@@@###########", name);
            // console.log("Unit@@@@###########", unit);
        }
        this.setState({
            levelModal: !this.state.levelModal,
            levelName: name,
            levelNo: levelNo,
            levelUnit: unit
        })

    }

    levelNameChanged(e) {
        this.setState({
            levelName: e.target.value
        })
    }

    levelUnitChange(e) {
        var nodeUnitId = e.target.value;
        this.setState({
            levelUnit: e.target.value
        })
    }

    levelDeatilsSaved() {
        const { treeTemplate } = this.state;
        var treeLevelList = treeTemplate.levelList != undefined ? treeTemplate.levelList : [];
        var levelListFiltered = treeLevelList.findIndex(c => c.levelNo == this.state.levelNo);
        var items = this.state.items;
        if (levelListFiltered != -1) {
            if (this.state.levelName != "") {
                treeLevelList[levelListFiltered].label = {
                    label_en: this.state.levelName,
                    label_sp: "",
                    label_pr: "",
                    label_fr: ""
                };
                var label = {}
                var levelUnit = null;
                if (this.state.levelUnit != "") {
                    label = this.state.nodeUnitList.filter(c => c.unitId == this.state.levelUnit)[0].label;
                    items.map((i, count) => {
                        if (i.level == this.state.levelNo && parseInt(i.payload.nodeType.id) <= 3) {
                            items[count].payload.nodeUnit = {
                                id: this.state.levelUnit,
                                label: label
                            }
                        }
                    })
                    levelUnit = {
                        id: parseInt(this.state.levelUnit),
                        label: label
                    }
                }
                treeLevelList[levelListFiltered].unit = levelUnit
            } else {
                treeLevelList.splice(levelListFiltered, 1);
            }
        } else {
            if (this.state.levelName != "") {
                var label = {}
                var levelUnit = null;
                if (this.state.levelUnit != "") {
                    label = this.state.nodeUnitList.filter(c => c.unitId == this.state.levelUnit)[0].label;
                    items.map((i, count) => {
                        if (i.level == this.state.levelNo && parseInt(i.payload.nodeType.id) <= 3) {
                            items[count].payload.nodeUnit = {
                                id: this.state.levelUnit,
                                label: label
                            }
                        }
                    })
                    levelUnit = {
                        id: parseInt(this.state.levelUnit),
                        label: label
                    }
                }
                treeLevelList.push({
                    levelId: null,
                    levelNo: this.state.levelNo,
                    label: {
                        label_en: this.state.levelName,
                        label_sp: "",
                        label_pr: "",
                        label_fr: ""
                    },
                    unit: levelUnit
                })
            }
        }
        treeTemplate.levelList = treeLevelList;
        // console.log("Cur Tree Obj@@@@@", treeTemplate)
        this.setState({
            levelModal: false,
            treeTemplate,
        }, () => {
            // this.saveTreeData(false)
            // // console.log("final tab list---", this.state.items);
            // if (type == 1) {
            //     var maxNodeDataId = temNodeDataMap.length > 0 ? Math.max(...temNodeDataMap.map(o => o.nodeDataId)) : 0;
            //     // console.log("scenarioId---", scenarioId);
            //     for (var i = 0; i < items.length; i++) {
            //         maxNodeDataId = parseInt(maxNodeDataId) + 1;
            //         (items[i].payload.nodeDataMap[scenarioId])[0].nodeDataId = maxNodeDataId;
            //         // console.log("my node data id--->", (items[i].payload.nodeDataMap[scenarioId])[0].nodeDataId);
            //     }
            //     this.callAfterScenarioChange(scenarioId);
            //     this.updateTreeData();
            // }
        });
    }

    getMomValueForDateRange(startDate) {
        // console.log("***MOM startDate---", startDate);
        var startValue = 0;
        var items = this.state.items;
        var item = items.filter(x => x.id == this.state.currentItemConfig.context.id);
        // console.log("***MOM item---", item);
        var momList = item[0].payload.nodeDataMap[0][0].nodeDataMomList;
        // console.log("***MOM momList---", momList);
        if (momList.length > 0) {
            // console.log("***MOM inside if---");
            var mom = momList.filter(x => x.month == startDate);
            // console.log("***MOM mom---", mom);
            if (mom.length > 0) {
                // console.log("***MOM mom inside if---");
                startValue = mom[0].startValue;
                // console.log("***MOM startValue---", startValue);
            }
        }
        // console.log("***MOM startValue---", startValue);
        return startValue;

    }
    updateTreeData(monthId) {
        var items = this.state.items;
        // console.log("monthId filter>>>", monthId);
        // console.log("items>>>", items);
        for (let i = 0; i < items.length; i++) {
            // console.log("items[i]---", items[i]);
            if (items[i].payload.nodeDataMap[0][0].nodeDataMomList != null) {
                // console.log("before filter mom---", items[i].payload.nodeDataMap[0][0].nodeDataMomList);
                // console.log("before filter date---", monthId);
                var nodeDataModelingMap = items[i].payload.nodeDataMap[0][0].nodeDataMomList.filter(x => x.month == monthId);
                // console.log("nodeDataModelingMap>>>", nodeDataModelingMap);
                if (nodeDataModelingMap.length > 0) {
                    // console.log("get payload 13");
                    if (nodeDataModelingMap[0].calculatedValue != null && nodeDataModelingMap[0].endValue != null) {
                        // console.log("nodeDataModelingMap[0]----", nodeDataModelingMap[0]);
                        if (items[i].payload.nodeType.id == 5) {
                            // console.log("my console---", nodeDataModelingMap[0]);
                            (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue = nodeDataModelingMap[0].calculatedMmdValue != null ? nodeDataModelingMap[0].calculatedMmdValue.toString() : '';
                        } else {
                            (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue = nodeDataModelingMap[0].calculatedValue.toString();
                        }
                        (items[i].payload.nodeDataMap[0])[0].displayDataValue = nodeDataModelingMap[0].endValue.toString();
                    } else {
                        // console.log("get payload 14");
                        (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue = "0";
                        (items[i].payload.nodeDataMap[0])[0].displayDataValue = "0";
                    }
                } else {
                    (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue = "0";
                    (items[i].payload.nodeDataMap[0])[0].displayDataValue = "0";
                }
            } else {
                (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue = "0";
                (items[i].payload.nodeDataMap[0])[0].displayDataValue = "0";
            }
            //
            if (items[i].payload.nodeType.id == 4) {
                var fuPerMonth, totalValue, usageFrequency, convertToMonth;
                var noOfForecastingUnitsPerPerson = (items[i].payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson;
                if ((items[i].payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 || ((items[i].payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (items[i].payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true)) {
                    usageFrequency = (items[i].payload.nodeDataMap[0])[0].fuNode.usageFrequency;
                    var usagePeriodConvertToMonth = convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == (items[i].payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId));
                    convertToMonth = usagePeriodConvertToMonth.length > 0 ? usagePeriodConvertToMonth[0].convertToMonth : '';
                    // convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usagePeriod.usagePeriodId))[0].convertToMonth;
                }
                if ((items[i].payload.nodeDataMap[0])[0].fuNode.usageType.id == 2) {
                    fuPerMonth = ((noOfForecastingUnitsPerPerson / usageFrequency) * convertToMonth);
                    totalValue = fuPerMonth * (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue;

                } else {
                    var noOfPersons = (items[i].payload.nodeDataMap[0])[0].fuNode.noOfPersons;
                    if ((items[i].payload.nodeDataMap[0])[0].fuNode.oneTimeUsage == "true" || (items[i].payload.nodeDataMap[0])[0].fuNode.oneTimeUsage == true) {
                        fuPerMonth = noOfForecastingUnitsPerPerson / noOfPersons;
                        totalValue = fuPerMonth * (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue;
                    } else {
                        fuPerMonth = ((noOfForecastingUnitsPerPerson / noOfPersons) * usageFrequency * convertToMonth);
                        totalValue = fuPerMonth * (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue;
                    }
                }
                // console.log("fuPerMonth without round---", fuPerMonth);
                // console.log("fuPerMonth with round---", Math.round(fuPerMonth));
                // (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = Math.round(totalValue);
                (items[i].payload.nodeDataMap[0])[0].fuPerMonth = fuPerMonth;
            }
            // else if (items[i].payload.nodeType.id == 5) {
            //     var item = items.filter(x => x.id == items[i].parent)[0];
            //     (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = Math.round(((item.payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue * (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].dataValue) / 100);
            // }
        }
        this.setState({
            items
        }, () => {
            // console.log("final updated items---", this.state.items);
            // this.calculateValuesForAggregateNode(this.state.items);
        })
    }
    generateMonthList() {
        var monthList = [];
        var json;
        var monthId;
        var monthsInPast = 1;
        var monthsInFuture = 36;
        var treeTemplate = this.state.treeTemplate;
        // console.log("treeTemplate mom---", treeTemplate);
        if (treeTemplate.hasOwnProperty('monthsInPast')) {
            monthsInPast = treeTemplate.monthsInPast;
            monthsInFuture = treeTemplate.monthsInFuture;


            // console.log("monthsInPast---", monthsInPast);
            // console.log("monthsInFuture---", monthsInFuture);
            if (monthsInPast != undefined) {
                for (let i = -monthsInPast; i <= monthsInFuture; i++) {
                    // console.log("i value---", i);
                    if (i != 0) {
                        json = {
                            id: i,
                            name: "Month " + i
                        };
                        if (i == 1) {
                            monthId = i;
                        }
                        // count++;
                        monthList.push(json);
                    }

                }
                // console.log("monthList---", monthList);
                if (monthList.length > 0) {
                    var minDate = monthList[0];
                    var maxDate = JSON.parse(JSON.stringify(monthList)).sort((a, b) => b.id - a.id)[0].id;
                    this.setState({
                        minDate, maxDate
                    })
                }
                this.setState({ monthList, monthId });
            }
        }
    }
    calculateParentValueFromMOM(month) {
        var parentValue = 0;
        // console.log("***month----", month);
        var currentItemConfig = this.state.currentItemConfig;
        // console.log("***month cur item config----", currentItemConfig);
        if (currentItemConfig.context.payload.nodeType.id != 1 && currentItemConfig.context.payload.nodeType.id != 2) {
            var items = this.state.items;
            var parentItem = items.filter(x => x.id == currentItemConfig.context.parent);
            // console.log("***month parentItem----", parentItem);
            if (parentItem.length > 0) {
                // console.log("***month parentItem if----", parentItem);
                var nodeDataMomList = parentItem[0].payload.nodeDataMap[0][0].nodeDataMomList;
                // console.log("***month nodeDataMomList----", nodeDataMomList);
                if (nodeDataMomList.length) {
                    // console.log("***month nodeDataMomList if----", nodeDataMomList);
                    var momDataForNode = nodeDataMomList.filter(x => x.month == month);
                    // console.log("***month momDataForNode----", momDataForNode);
                    if (momDataForNode.length > 0) {
                        // console.log("***month momDataForNode if----", momDataForNode);
                        if (currentItemConfig.context.payload.nodeType.id == 5) {
                            parentValue = momDataForNode[0].calculatedMmdValue;
                            // console.log("***month parentValue 1----", parentValue);
                        } else {
                            parentValue = momDataForNode[0].calculatedValue;
                            // console.log("***month parentValue 2----", parentValue);
                        }
                    }
                }
            }
            var percentageOfParent = currentItemConfig.context.payload.nodeDataMap[0][0].dataValue;
            // console.log("***month percentageOfParent---", percentageOfParent);
            // console.log("***month calculated value---", ((percentageOfParent * parentValue) / 100));
            currentItemConfig.context.payload.nodeDataMap[0][0].calculatedDataValue = ((percentageOfParent * parentValue) / 100).toString();
            // currentItemConfig.context.payload.nodeDataMap[0][0].displayCalculatedDataValue = ((percentageOfParent * parentValue) / 100).toString();
        }
        // console.log("***month parentValue before---", parentValue);
        this.setState({ parentValue, currentItemConfig }, () => {
            // console.log("***month parentValue after---", this.state.parentValue);
        });
    }
    qatCalculatedPUPerVisit(type) {
        var currentItemConfig = this.state.currentItemConfig;
        var qatCalculatedPUPerVisit = "";
        // console.log("currentItemConfig qat cal---", currentItemConfig)
        if (currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id != "") {
            // console.log("5 1----------------->>>", currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id);

            var pu = this.state.planningUnitList.filter(x => x.planningUnitId == currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id)[0];
            // console.log("5 2----------------->>>", this.state.planningUnitList);
            // console.log("5 3----------------->>>", pu);
            // console.log("pu qat cal 1---", pu.multiplier)
            // console.log("pu qat cal 2---", currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson);
            // this.getNoOfMonthsInUsagePeriod();
            if (currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) {
                var refillMonths = currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths != "" && currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths != null ? currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths : this.round(parseFloat(pu.multiplier / (currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)).toFixed(4))
                // console.log("refillMonths qat cal---", refillMonths)
                // console.log("noOfmonths qat cal---", this.state.noOfMonthsInUsagePeriod);
                // qatCalculatedPUPerVisit = this.round(parseFloat(((currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / pu.multiplier).toFixed(4));
                qatCalculatedPUPerVisit = parseFloat(((currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / pu.multiplier).toFixed(4);
            } else {
                // if (currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == "true" || currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == true) {
                qatCalculatedPUPerVisit = addCommas(this.state.noOfMonthsInUsagePeriod / pu.multiplier);
                // } else {
                //     qatCalculatedPUPerVisit = this.round(this.state.noOfMonthsInUsagePeriod / pu.multiplier);
                // }
            }
            // console.log("inside qat cal val---", qatCalculatedPUPerVisit)
            if (type == 1) {
                if (currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) {
                    currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths = refillMonths;
                }
                currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit = qatCalculatedPUPerVisit;
            }
        }
        this.setState({ qatCalculatedPUPerVisit });
    }

    calculatePUPerVisit(isRefillMonth) {
        var currentScenario = this.state.currentItemConfig.context.payload.nodeDataMap[0][0];
        var parentScenario = this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0];
        var currentItemConfig = this.state.currentItemConfig;
        var conversionFactor = this.state.conversionFactor;
        // console.log("PUPERVISIT conversionFactor---", conversionFactor);
        var refillMonths = isRefillMonth && currentScenario.puNode.refillMonths != "" ? currentScenario.puNode.refillMonths : this.round(parseFloat(conversionFactor / (parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)).toFixed(4));
        // console.log("PUPERVISIT refillMonths---", refillMonths);
        // console.log("PUPERVISIT noOfForecastingUnitsPerPerson---", parentScenario.fuNode.noOfForecastingUnitsPerPerson);
        // console.log("PUPERVISIT noOfMonthsInUsagePeriod---", this.state.noOfMonthsInUsagePeriod);
        // var puPerVisit = this.round(parseFloat(((parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / conversionFactor).toFixed(4));
        var puPerVisit = parseFloat(((parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / conversionFactor).toFixed(4);
        // console.log("PUPERVISIT puPerVisit---", puPerVisit);

        currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit = puPerVisit;
        if (!isRefillMonth) {
            currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths = refillMonths;
        }
        this.setState({ currentItemConfig });
    }

    round(value) {
        // console.log("Round input value---", value);
        var result = (value - Math.floor(value)).toFixed(4);
        // console.log("Round result---", result);
        // console.log("Round condition---", `${ROUNDING_NUMBER}`);
        if (result > `${ROUNDING_NUMBER}`) {
            // console.log("Round ceiling---", Math.ceil(value));
            return Math.ceil(value);
        } else {
            // console.log("Round floor---", Math.floor(value));
            if (Math.floor(value) == 0) {
                return Math.ceil(value);
            } else {
                return Math.floor(value);
            }
        }
    }

    handleFUChange = (regionIds) => {
        // console.log("regionIds 1---", regionIds);
        // // console.log("regionIds 2---", regionIds.label.split("|"));
        // // console.log("regionIds 3---", regionIds.label.split("|")[0]);
        const { currentItemConfig } = this.state;
        // console.log("regionIds currentItemConfig---", currentItemConfig);
        this.setState({
            fuValues: regionIds != null ? regionIds : "",
            // fuLabels: regionIds != null ? regionIds.label : ""
        }, () => {
            if (regionIds != null) {
                currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.id = regionIds.value;
                if (currentItemConfig.context.level == 0) {
                    var label = {
                        label_en: regionIds.label.split("|")[0]
                    }
                    currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.label = label;
                } else {
                    currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.label.label_en = regionIds.label.split("|")[0];
                }
                if (currentItemConfig.context.payload.label.label_en == "" || currentItemConfig.context.payload.label.label_en == null) {
                    currentItemConfig.context.payload.label.label_en = (regionIds.label.split("|")[0]).trim();
                }
                this.setState({ showFUValidation: false }, () => {
                    this.getForecastingUnitUnitByFUId(regionIds.value);
                    this.getPlanningUnitListByFUId(regionIds.value);
                    this.filterUsageTemplateList(regionIds.value);
                });
            } else {
                currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.id = "";
                currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.label.label_en = "";
                currentItemConfig.context.payload.label.label_en = "";
                this.setState({ showFUValidation: true, planningUnitList: [] }, () => {
                    this.filterUsageTemplateList(0);
                });
            }
            // console.log("regionValues---", this.state.fuValues);
            // console.log("regionLabels---", this.state.fuLabels);
            this.setState({ currentItemConfig }, () => {

            });
        })
    }

    exportPDF = () => {
        let treeLevel = this.state.items.length;
        var treeLevelItems = [];
        var treeLevels = this.state.treeTemplate.levelList != undefined ? this.state.treeTemplate.levelList : [];
        for (var i = 0; i <= treeLevel; i++) {
            var treeLevelFiltered = treeLevels.filter(c => c.levelNo == i);
            if (i == 0) {
                treeLevelItems.push({
                    annotationType: AnnotationType.Level,
                    levels: [0],
                    title: treeLevelFiltered.length > 0 ? getLabelText(treeLevelFiltered[0].label, this.state.lang) : "Level 0",
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
                    title: treeLevelFiltered.length > 0 ? getLabelText(treeLevelFiltered[0].label, this.state.lang) : "Level " + i,
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
                    title: treeLevelFiltered.length > 0 ? getLabelText(treeLevelFiltered[0].label, this.state.lang) : "Level " + i,
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
            // console.log("level json***", treeLevelItems);
        }

        var templates = [
            {
                itemSize: new Size(200, 85)
            }
        ]
        var items1 = this.state.items;
        var newItems = [];
        for (var i = 0; i < items1.length; i++) {
            var e = items1[i];
            // console.log("items1[i]--------------", items1[i]);
            e.scenarioId = 0
            e.showModelingValidation = this.state.showModelingValidation
            // console.log("1------------------->>>>", this.getPayloadData(items1[i], 4))
            // console.log("2------------------->>>>", this.getPayloadData(items1[i], 3))
            e.result = this.getPayloadData(items1[i], 4)//Up
            e.result1 = this.getPayloadData(items1[i], 6)//Down
            e.result2 = this.getPayloadData(items1[i], 5)//Link
            var text = this.getPayloadData(items1[i], 3)
            e.text = text;
            newItems.push(e)
        }
        // console.log("newItems---", newItems);
        var sampleChart = new OrgDiagramPdfkit({
            ...this.state,
            pageFitMode: PageFitMode.Enabled,
            hasSelectorCheckbox: Enabled.False,
            hasButtons: Enabled.True,
            buttonsPanelSize: 40,
            orientationType: OrientationType.Top,
            defaultTemplateName: "ContactTemplate",
            linesColor: Colors.Black,
            annotations: treeLevelItems,
            items: newItems,
            templates: (templates || [])
        });
        var sample3size = sampleChart.getSize();
        var doc = new PDFDocument({ size: 'LEGAL' });
        var stream = doc.pipe(blobStream());

        var legalSize = { width: 612.00, height: 1008.00 }
        var scale = Math.min(legalSize.width / (sample3size.width + 300), legalSize.height / (sample3size.height + 300))
        doc.scale(scale);
        doc
            .fillColor('#002f6c')
            .fontSize(20)
            .font('Helvetica')
            .text('Branch Template PDF', doc.page.width / 2, 20);

        doc
            .fillColor('#002f6c')
            .fontSize(12)
            .font('Helvetica')
            .text(i18n.t('static.supplyPlan.runDate') + " " + moment(new Date()).format(`${DATE_FORMAT_CAP}`), 30, 40);

        doc
            .fillColor('#002f6c')
            .fontSize(12)
            .font('Helvetica')
            .text(i18n.t('static.supplyPlan.runTime') + " " + moment(new Date()).format('hh:mm A'), 30, 55);

        doc
            .fillColor('#002f6c')
            .fontSize(12)
            .font('Helvetica')
            .text(i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername(), 30, 70);

        doc
            .fillColor('#002f6c')
            .fontSize(12)
            .font('Helvetica')
            .text("Forecast Method" + ': ' + document.getElementById("forecastMethodId").selectedOptions[0].text, 30, 85);

        doc
            .fillColor('#002f6c')
            .fontSize(12)
            .font('Helvetica')
            .text("Template Name" + ': ' + this.state.treeTemplate.label.label_en, 30, 100);

        doc
            .fillColor('#002f6c')
            .fontSize(12)
            .font('Helvetica')
            .text("Months In Past" + ': ' + document.getElementById("monthsInPast").value, 30, 115);

        doc
            .fillColor('#002f6c')
            .fontSize(12)
            .font('Helvetica')
            .text("Months In Future" + ': ' + document.getElementById("monthsInFuture").value, 30, 130);


        sampleChart.draw(doc, 60, 165);

        doc.restore();

        doc.end();

        if (typeof stream !== 'undefined') {
            stream.on('finish', function () {
                var string = stream.toBlob('application/pdf');
                window.saveAs(string, i18n.t('static.dataset.BranchTreeTemplate') + '.pdf');
            });
        } else {
            alert('Error: Failed to create file stream.');
        }

    }

    getMaxNodeDataId() {
        var maxNodeDataId = 0;
        // if (this.state.maxNodeDataId != "" && this.state.maxNodeDataId != 0) {
        //     maxNodeDataId = parseInt(this.state.maxNodeDataId + 1);
        //     // console.log("maxNodeDataId 1---", maxNodeDataId)
        //     this.setState({
        //         maxNodeDataId
        //     })
        // } else {
        var items = this.state.items;
        var nodeDataMap = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].payload.nodeDataMap.hasOwnProperty(0)) {
                nodeDataMap.push(items[i].payload.nodeDataMap[0][0]);
            }
        }
        maxNodeDataId = nodeDataMap.length > 0 ? Math.max(...nodeDataMap.map(o => o.nodeDataId)) : 0;
        // console.log("nodeDataMap array---", nodeDataMap);
        // console.log("maxNodeDataId 2---", maxNodeDataId)
        this.setState({
            maxNodeDataId
        })
        // }
        return maxNodeDataId;
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    formSubmitLoader() {
        // alert("load 1")
        this.setState({
            modelingJexcelLoader: true
        }, () => {
            // alert("load 2")
            setTimeout(() => {
                // console.log("inside set timeout")
                this.formSubmit();
            }, 0);
        })
    }

    momCheckbox(e, type) {
        var checked = e.target.checked;
        const { currentItemConfig } = this.state;

        if (e.target.name === "manualChange") {
            if (type == 1) {
                this.state.momEl.setValueFromCoords(8, 0, checked, true);
            } else {
                this.state.momElPer.setValueFromCoords(10, 0, checked, true);
            }
            (currentItemConfig.context.payload.nodeDataMap[0])[0].manualChangesEffectFuture = (e.target.checked == true ? true : false)
            var nodes = this.state.items;
            var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.context.id);
            nodes[findNodeIndex] = currentItemConfig.context;
            this.setState({
                currentItemConfig,
                items: nodes
            }, () => {
                // console.log("currentItemConfig---", currentItemConfig);
                // this.calculateMOMData(0, 1);
                // console.log('manual change---', this.state.manualChange);
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
                // console.log('seasonality---', this.state.seasonality);
            });
        }
    }

    calculateMOMData(nodeId, type) {
        let { treeTemplate } = this.state;
        // console.log("before---*", treeTemplate)
        var items = this.state.items;

        treeTemplate.flatList = items;
        // console.log("after---*", treeTemplate)
        calculateModelingData(treeTemplate, this, '', (nodeId != 0 ? nodeId : this.state.currentItemConfig.context.id), 0, type, -1, true);
    }

    updateState(parameterName, value) {
        // console.log("parameterName---", parameterName);
        // console.log("value---", value);
        this.setState({
            [parameterName]: value
        }, () => {
            if (parameterName == 'nodeId' && (value != null && value != 0)) {
                var items = this.state.items;
                var nodeDataMomList = this.state.nodeDataMomList;
                // console.log("nodeDataMomList---", nodeDataMomList);
                if (nodeDataMomList.length > 0) {
                    for (let i = 0; i < nodeDataMomList.length; i++) {
                        // console.log("nodeDataMomList[i]---", nodeDataMomList[i])
                        var nodeId = nodeDataMomList[i].nodeId;
                        var nodeDataMomListForNode = nodeDataMomList[i].nodeDataMomList;
                        // console.log("this.state.nodeDataMomList---", this.state.nodeDataMomList);
                        var node = items.filter(n => n.id == nodeId)[0];
                        // console.log("node---", node);
                        (node.payload.nodeDataMap[0])[0].nodeDataMomList = nodeDataMomListForNode;
                        var findNodeIndex = items.findIndex(n => n.id == nodeId);
                        // console.log("findNodeIndex---", findNodeIndex);
                        items[findNodeIndex] = node;
                    }
                }
                // var node = items.filter(n => n.id == value)[0];
                // (node.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataMomList = this.state.nodeDataMomList.length == 1 ? this.state.nodeDataMomList : [];
                // var findNodeIndex = items.findIndex(n => n.id == value);
                // // console.log("findNodeIndex---", findNodeIndex);
                // items[findNodeIndex] = node;
                // console.log("items---***", items);
                this.setState({ items })
            }
            if (parameterName == 'type' && (value == 1 || value == 0)) {
                if (this.state.currentItemConfig.context.payload.nodeType.id == 1 || this.state.currentItemConfig.context.payload.nodeType.id == 2) {
                    // console.log("mom list ret---", this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id));
                    var nodeDataMomList = this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id);
                    if (nodeDataMomList.length > 0) {
                        this.setState({ momList: nodeDataMomList[0].nodeDataMomList }, () => {
                            // console.log("going to build mom jexcel");
                            if (this.state.modelingEl != null && this.state.modelingEl != undefined && this.state.modelingEl != "") {
                                this.filterScalingDataByMonth(this.state.scalingMonth, nodeDataMomList[0].nodeDataMomList);
                            }
                            if (value == 1 || (value == 0 && this.state.showMomData)) {
                                this.buildMomJexcel();
                            }
                        });
                    }
                } else if (this.state.currentItemConfig.context.payload.nodeType.id == 3 || this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5) {
                    // console.log("id to filter---", this.state.currentItemConfig.context.id)
                    // console.log("id to filter list---", this.state.nodeDataMomList)
                    // // console.log("id to filter filter list---", this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList)
                    var momList = this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id);
                    this.setState({ momListPer: momList.length > 0 ? momList[0].nodeDataMomList : [] }, () => {
                        // console.log("going to build mom jexcel percent");
                        if (this.state.modelingEl != null && this.state.modelingEl != undefined && this.state.modelingEl != "") {
                            this.filterScalingDataByMonth(this.state.scalingMonth, this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList);
                        }
                        if (value == 1 || (value == 0 && this.state.showMomDataPercent)) {
                            this.buildMomJexcelPercent();
                        }
                    });
                }


            }
            this.updateTreeData(this.state.monthId);
            if (parameterName == 'type' && value == 0) {
                this.calculateValuesForAggregateNode(this.state.items);
            }
            // console.log("returmed list---", this.state.nodeDataMomList);
        })
    }

    updateMomDataInDataSet() {
        this.setState({
            momJexcelLoader: true
        }, () => {
            setTimeout(() => {
                var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
                var json = nodeTypeId == 2 ? this.state.momEl.getJson(null, false) : this.state.momElPer.getJson(null, false);
                // console.log("momData>>>", json);
                var overrideListArray = [];
                for (var i = 0; i < json.length; i++) {
                    var map1 = new Map(Object.entries(json[i]));
                    if (nodeTypeId == 2) {
                        if ((map1.get("4") != '' && map1.get("4") != 0.00) || (map1.get("5") != '' && map1.get("5") != 0.00)) {
                            var overrideData = {
                                monthNo: map1.get("0"),
                                seasonalityPerc: map1.get("4").toString().replaceAll(",", "").split("%")[0],
                                manualChange: (map1.get("5") != '' && map1.get("5") != 0.00) ? map1.get("5").toString().replaceAll(",", "") : map1.get("5"),
                                nodeDataId: map1.get("7"),
                                active: true
                            }
                            // console.log("overrideData>>>", overrideData);
                            overrideListArray.push(overrideData);
                        }
                    } else if (nodeTypeId == 3 || nodeTypeId == 4 || nodeTypeId == 5) {
                        if (map1.get("3") != '' && map1.get("3") != 0.00) {
                            var overrideData = {
                                monthNo: map1.get("0"),
                                seasonalityPerc: 0,
                                manualChange: map1.get("3").toString().replaceAll(",", "").split("%")[0],
                                nodeDataId: map1.get("7"),
                                active: true
                            }
                            // console.log("overrideData>>>", overrideData);
                            overrideListArray.push(overrideData);
                        }
                    }
                }
                // console.log("overRide data list>>>", overrideListArray);
                let { currentItemConfig } = this.state;
                let { treeTemplate } = this.state;
                var items = this.state.items;
                (currentItemConfig.context.payload.nodeDataMap[0])[0].nodeDataOverrideList = overrideListArray;
                this.setState({ currentItemConfig }, () => {
                    var findNodeIndex = items.findIndex(n => n.id == currentItemConfig.context.id);
                    items[findNodeIndex] = currentItemConfig.context;
                    treeTemplate.flatList = items;
                    this.setState({
                        treeTemplate
                    }, () => {
                        // console.log("treeTemplate mom---", treeTemplate);
                        calculateModelingData(treeTemplate, this, '', currentItemConfig.context.id, 0, 1, -1, true);
                    });
                });

            }, 0);

        });

    }

    filterScalingDataByMonth(date, nodeDataMomListParam) {
        // console.log("date--->>>>>>>", date);
        var json = this.state.modelingEl.getJson(null, false);
        // // console.log("modelingElData>>>", json);
        var scalingTotal = 0;
        var nodeDataMomList = nodeDataMomListParam != undefined ? nodeDataMomListParam : (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].nodeDataMomList;
        for (var i = 0; i < json.length; i++) {
            var calculatedChangeForMonth = 0;
            var map1 = new Map(Object.entries(json[i]));
            var startDate = map1.get("1");
            var stopDate = map1.get("2");
            var modelingTypeId = map1.get("4");
            var dataValue = modelingTypeId == 2 ? map1.get("7").toString().replaceAll(",", "").replaceAll("%", "") : map1.get("6").toString().replaceAll(",", "").replaceAll("%", "");
            if (map1.get("5") == -1) {
                dataValue = 0 - dataValue
            }
            // console.log("startDate---", startDate);
            // console.log("stopDate---", stopDate);
            const result = date >= startDate && date <= stopDate ? true : false;
            // console.log("result---", result);
            // console.log("modelingTypeId---", modelingTypeId);
            if (result) {
                var nodeValue = 0;
                let scalingDate = date;
                // console.log("@@@@@###########Scaling date", scalingDate);
                // console.log("@@@@@###########Start date", startDate);
                // console.log("@@@@@###########Start date", stopDate);
                if (modelingTypeId == 3) {
                    var nodeDataMomListFilter = [];
                    if (map1.get("12") == 1) {
                        var nodeDataMomListOfTransferNode = (this.state.items.filter(c => c.id == map1.get("3"))[0].payload.nodeDataMap[0])[0].nodeDataMomList;
                        nodeDataMomListFilter = nodeDataMomListOfTransferNode.filter(c => c.month == startDate)
                    } else {
                        nodeDataMomListFilter = nodeDataMomList.filter(c => c.month == startDate)
                    }
                    // console.log("@@@@@###########nodeDataMomListFilter", nodeDataMomListFilter);
                    if (nodeDataMomListFilter.length > 0) {
                        nodeValue = nodeDataMomListFilter[0].startValue;
                    }
                }
                if (modelingTypeId == 4) {
                    var nodeDataMomListFilter = [];
                    if (map1.get("12") == 1) {
                        var nodeDataMomListOfTransferNode = (this.state.items.filter(c => c.id == map1.get("3"))[0].payload.nodeDataMap[0])[0].nodeDataMomList;
                        nodeDataMomListFilter = nodeDataMomListOfTransferNode.filter(c => c.month == scalingDate)
                    } else {
                        nodeDataMomListFilter = nodeDataMomList.filter(c => c.month == scalingDate)
                    }
                    if (nodeDataMomListFilter.length > 0) {
                        nodeValue = nodeDataMomListFilter[0].startValue;
                    }
                }

                if (modelingTypeId == 2 || modelingTypeId == 5) {
                    calculatedChangeForMonth = parseFloat(dataValue).toFixed(4);
                } else if (modelingTypeId == 3 || modelingTypeId == 4) {
                    calculatedChangeForMonth = parseFloat((Number(nodeValue) * Number(dataValue)) / 100).toFixed(4);
                }
            }
            this.state.modelingEl.setValueFromCoords(9, i, calculatedChangeForMonth, true);
            // scalingTotal = parseFloat(scalingTotal) + parseFloat(calculatedChangeForMonth);
        }
        var scalingDifference = nodeDataMomList.filter(c => c.month == date);
        if (scalingDifference.length > 0) {
            scalingTotal += scalingDifference[0].difference;
        }
        this.setState({ scalingTotal, scalingMonth: date });

    }
    resetNodeData() {
        // // console.log("reset node data function called");
        const { orgCurrentItemConfig, currentItemConfig } = this.state;
        var nodeTypeId;
        var fuValues = [];
        if (currentItemConfig.context.level != 0 && currentItemConfig.parentItem.payload.nodeType.id == 4) {
            nodeTypeId = PU_NODE_ID;
            // // console.log("reset node data function called 0.1---", currentItemConfig);
        } else {
            nodeTypeId = currentItemConfig.context.payload.nodeType.id;
        }
        currentItemConfig.context = JSON.parse(JSON.stringify(orgCurrentItemConfig));
        // // console.log("============1============", orgCurrentItemConfig);
        // // console.log("this.state.addNodeFlag reset 1---", this.state.addNodeFlag);
        // // console.log("this.state.addNodeFlag reset 2---", this.state.addNodeFlag ? [] : { value: orgCurrentItemConfig.payload.nodeDataMap[0][0].fuNode.forecastingUnit.id, label: getLabelText(orgCurrentItemConfig.payload.nodeDataMap[0][0].fuNode.forecastingUnit.label, this.state.lang) + " | " + orgCurrentItemConfig.payload.nodeDataMap[0][0].fuNode.forecastingUnit.id });
        if (nodeTypeId == 5) {
            // // console.log("reset node data function called 2---", orgCurrentItemConfig);
            currentItemConfig.context.payload.nodeType.id = nodeTypeId;

            currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id;
            if (this.state.addNodeFlag) {
                var parentCalculatedDataValue = this.state.items.filter(x => x.id == currentItemConfig.context.parent)[0].payload.nodeDataMap[0][0].calculatedDataValue;
                // // console.log("parentCalculatedDataValue 1---", this.state.items.filter(x => x.id == currentItemConfig.context.parent)[0].payload.nodeDataMap[0][0]);
                // // console.log("parentCalculatedDataValue 2---", parentCalculatedDataValue);
                currentItemConfig.context.payload.nodeDataMap[0][0].dataValue = 100;
                currentItemConfig.context.payload.nodeDataMap[0][0].calculatedDataValue = ((100 * parentCalculatedDataValue) / 100).toString();
            }
            // // console.log("pu value for reset 1---",this.state.planningUnitList);
            // // console.log("pu value for reset 2---",currentItemConfig.context.payload.nodeDataMap[0][0]);
            var planningUnit = this.state.planningUnitList.filter(x => x.planningUnitId == currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id);
            // // console.log("planningUnit--->>>>>>>>",planningUnit);
            var conversionFactor = planningUnit.length > 0 ? planningUnit[0].multiplier : "";
            // console.log("conversionFactor---", conversionFactor);
            this.setState({
                conversionFactor
            }, () => {
                this.getUsageText();
            });
        } else if (nodeTypeId == 4 && !this.state.addNodeFlag) {
            fuValues = { value: orgCurrentItemConfig.payload.nodeDataMap[0][0].fuNode.forecastingUnit.id, label: getLabelText(orgCurrentItemConfig.payload.nodeDataMap[0][0].fuNode.forecastingUnit.label, this.state.lang) + " | " + orgCurrentItemConfig.payload.nodeDataMap[0][0].fuNode.forecastingUnit.id };
        }
        this.setState({
            currentItemConfig,
            usageTemplateId: "",
            usageText: "",
            fuValues: fuValues,
            // fuLabels: []
        }, () => {
            if (nodeTypeId == 4) {
                this.getForecastingUnitListByTracerCategoryId(0, 0);
            }
            // console.log("currentItemConfig after---", this.state.orgCurrentItemConfig)
        });
    }

    formSubmit() {
        if (this.state.modelingJexcelLoader === true) {
            var validation = this.state.lastRowDeleted == true ? true : this.checkValidation();
            // console.log("validation---", validation);
            if (this.state.lastRowDeleted == true || validation == true) {
                try {
                    var tableJson = this.state.modelingEl.getJson(null, false);
                    var data = this.state.scalingList;
                    var maxModelingId = data.length > 0 ? Math.max(...data.map(o => o.nodeDataModelingId)) : 0;
                    var obj;
                    var dataArr = [];
                    var items = this.state.items;
                    var item = items.filter(x => x.id == this.state.currentItemConfig.context.id)[0];
                    const itemIndex1 = items.findIndex(o => o.id === this.state.currentItemConfig.context.id);
                    // if (itemIndex1 != -1) {
                    for (var i = 0; i < tableJson.length; i++) {
                        var map1 = new Map(Object.entries(tableJson[i]));
                        // console.log("11 map---" + map1.get("11"))
                        if (parseInt(map1.get("11")) === 1 && parseInt(map1.get("12")) != 1) {
                            var startDate = map1.get("1");
                            var stopDate = map1.get("2");
                            if (map1.get("10") != "" && map1.get("10") != 0) {
                                const itemIndex = data.findIndex(o => o.nodeDataModelingId === map1.get("10"));
                                // console.log("data[itemIndex]---", data[itemIndex]);
                                obj = data.filter(x => x.nodeDataModelingId == map1.get("10"))[0];
                                // console.log("obj--->>>>>", obj);
                                var transfer = map1[3] != "" ? map1.get("3").split('_')[0] : '';
                                // console.log("transfer---", transfer);
                                obj.transferNodeDataId = transfer;
                                obj.notes = map1.get("0");
                                obj.modelingType.id = map1.get("4");
                                obj.startDateNo = startDate;
                                obj.stopDateNo = stopDate;
                                obj.increaseDecrease = map1.get("5");
                                obj.dataValue = map1.get("4") == 2 ? map1.get("7").toString().replaceAll(",", "") : map1.get("6").toString().replaceAll(",", "").split("%")[0];
                                obj.nodeDataModelingId = map1.get("10")

                                // data[itemIndex] = obj;
                            } else {
                                // console.log("maxModelingId---", maxModelingId);
                                obj = {
                                    transferNodeDataId: map1[3] != "" ? map1.get("3").split('_')[0] : '',
                                    notes: map1.get("0"),
                                    modelingType: {
                                        id: map1.get("4")
                                    },
                                    increaseDecrease: map1.get("5"),
                                    startDateNo: startDate,
                                    stopDateNo: stopDate,
                                    dataValue: map1.get("4") == 2 ? map1.get("7").toString().replaceAll(",", "") : map1.get("6").toString().replaceAll(",", "").split("%")[0],
                                    nodeDataModelingId: parseInt(maxModelingId) + 1
                                }
                                maxModelingId++;
                                // console.log("obj to push---", obj);
                                // data.push(obj);
                            }
                            dataArr.push(obj);
                        }
                    }
                    // console.log("obj---", obj);
                    // console.log("dataArr--->>>", dataArr);
                    if (itemIndex1 != -1) {
                        if (this.state.isValidError.toString() == "false") {
                            item.payload = this.state.currentItemConfig.context.payload;
                            if (dataArr.length > 0) {
                                (item.payload.nodeDataMap[0])[0].nodeDataModelingList = dataArr;
                            }
                            if (this.state.lastRowDeleted == true) {
                                (item.payload.nodeDataMap[0])[0].nodeDataModelingList = [];
                            }
                            // console.log("item---", item);
                            items[itemIndex1] = item;
                            // console.log("items---", items);
                            // Call function by dolly
                            this.setState({
                                items,
                                scalingList: dataArr,
                                lastRowDeleted: false,
                                modelingChanged: false,
                                // openAddNodeModal: false,
                                activeTab1: new Array(2).fill('2')
                            }, () => {
                                // console.log("going to call MOM data");
                                this.calculateMOMData(0, 0);
                            });
                        } else {
                            // console.log("inside else form submit");
                            this.setState({
                                modelingJexcelLoader: false
                            }, () => {
                                alert("Please fill all the required fields in Node Data Tab");
                            });
                        }
                    } else {

                        if (this.state.isValidError.toString() == "false") {
                            // console.log("inside if form submit");
                            this.onAddButtonClick(this.state.currentItemConfig, true, dataArr);
                        } else {
                            // console.log("inside else form submit");
                            this.setState({
                                modelingJexcelLoader: false
                            }, () => {
                                alert("Please fill all the required fields in Node Data Tab");
                            });

                        }
                    }
                } catch (err) {
                    // console.log("scaling err---", err);
                    localStorage.setItem("scalingErrorTemplate", err);
                }
            } else {
                this.setState({ modelingJexcelLoader: false })
            }
        }
    }
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(11, y);
            if (parseInt(value) == 1) {

                //Modeling type
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

                //+/-
                var col = ("F").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(5, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var elInstance = this.state.modelingEl;
                var rowData = elInstance.getRowData(y);
                // console.log("modelingTypeId-valid--", rowData[4]);
                // Start date
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var startDate = rowData[1];
                var stopDate = rowData[2];
                // console.log("startDate---", startDate);
                // console.log("stopDate---", stopDate);
                // Stop date
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                // var diff = moment(stopDate).diff(moment(startDate), 'months');
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                }
                else if (stopDate <= startDate) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.validation.pleaseEnterValidDate'));
                    valid = false;
                }
                else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }


                if (rowData[4] != "") {
                    var reg = JEXCEL_DECIMAL_NO_REGEX_LONG;

                    // Month change %
                    if (rowData[4] != 2) {
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

                    // Month change #
                    if (rowData[4] == 2) {
                        var col = ("H").concat(parseInt(y) + 1);
                        var value = this.el.getValueFromCoords(7, y);
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
                // console.log("map1.get(8)---", map1.get("8"));
            }
        }
        // console.log("scalingTotal---", scalingTotal);
        this.setState({
            scalingTotal
        }, () => {
            // this.filterScalingDataByMonth(this.state.scalingMonth);
        });
    }
    acceptValue() {
        // // console.log(">>>>", this.state.currentRowIndex);
        var elInstance = this.state.modelingEl;
        if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
            if (this.state.currentModelingType == 5) {

                elInstance.setValueFromCoords(4, this.state.currentRowIndex, 5, true);
                if (this.state.currentTransferData == "") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange) < 0 ? -1 : 1, true);
                }
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentCalculatedMomChange)) ? "" : parseFloat(this.state.currentCalculatedMomChange) < 0 ? parseFloat(this.state.currentCalculatedMomChange * -1).toFixed(4) : parseFloat(this.state.currentCalculatedMomChange), true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentCalculatedMomChange).toFixed(4)) ? "" : parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
            }
        } else {
            if (this.state.currentModelingType == 2) {
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentModelingType, true);
                if (this.state.currentTransferData == "") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentTargetChangeNumber) < 0 ? -1 : 1, true);
                }
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentTargetChangeNumber)) ? "" : parseFloat(this.state.currentTargetChangeNumber) < 0 ? parseFloat(this.state.currentTargetChangeNumber * -1) : parseFloat(this.state.currentTargetChangeNumber), true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentCalculatedMomChange).toFixed(4)) ? "" : parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
            } else if (this.state.currentModelingType == 3) { //Linear %
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentModelingType, true);
                if (this.state.currentTransferData == "") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.percentForOneMonth) < 0 ? -1 : 1, true);
                }
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, isNaN(parseFloat(this.state.percentForOneMonth)) ? "" : parseFloat(this.state.percentForOneMonth) < 0 ? parseFloat(this.state.percentForOneMonth * -1).toFixed(4) : parseFloat(this.state.percentForOneMonth).toFixed(4), true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentCalculatedMomChange).toFixed(4)) ? "" : parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
            } else if (this.state.currentModelingType == 4) { // Exponential %
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentModelingType, true);
                if (this.state.currentTransferData == "") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.percentForOneMonth) < 0 ? -1 : 1, true);
                }
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, isNaN(parseFloat(this.state.percentForOneMonth)) ? "" : parseFloat(this.state.percentForOneMonth) < 0 ? parseFloat(this.state.percentForOneMonth * -1).toFixed(4) : parseFloat(this.state.percentForOneMonth).toFixed(4), true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentCalculatedMomChange).toFixed(4)) ? "" : parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
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
            percentForOneMonth: ''
        });
        var startDate = this.state.currentCalculatorStartDate;
        var endDate = this.state.currentCalculatorStopDate;
        var monthArr = this.state.monthList.filter(x => x.id > startDate && x.id < endDate);
        // var monthDifference = moment(endDate).startOf('month').diff(startDate, 'months', true);
        var monthDifference = parseInt((monthArr.length > 0 ? parseInt(monthArr.length + 1) : 0) + 1);
        // console.log("month diff>>>", monthDifference);
        var momValue = '', percentForOneMonth = '';
        var currentEndValue = document.getElementById("currentEndValue").value;
        var getValue = currentEndValue.toString().replaceAll(",", "");
        if (this.state.currentModelingType == 2) {
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(4);
        }
        if (this.state.currentModelingType == 3) {
            if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
                var getChangeInPercent = (parseFloat(getValue - (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue) / monthDifference).toFixed(4);
                var momValue = ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue * getChangeInPercent / 100).toFixed(4);
                // // console.log("getChangeInPercent>>>",getChangeInPercent);
                // // console.log("momValue>>>",momValue)
            } else {
                // var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue)) / monthDifference / this.state.currentCalculatorStartValue * 100).toFixed(4);
                var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(4);
            }
        }
        if (this.state.currentModelingType == 4) {
            // var momValue = ((Math.pow(parseFloat(getValue / this.state.currentCalculatorStartValue), parseFloat(1 / monthDifference)) - 1) * 100).toFixed(4);
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(4);
        }

        if (this.state.currentModelingType == 5) {
            var momValue = parseFloat((getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) / monthDifference).toFixed(4);
        }
        // // console.log("getmomValue>>>", momValue);
        var targetChangeNumber = '';
        var targetChangePer = '';
        if (this.state.currentItemConfig.context.payload.nodeType.id < 3) {
            targetChangeNumber = (parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) / monthDifference).toFixed(4);
            targetChangePer = (parseFloat(targetChangeNumber / this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) * 100).toFixed(4);
            percentForOneMonth = targetChangePer;
        }
        // console.log("targetChangeNumber 1---", targetChangeNumber);
        this.setState({
            currentTargetChangeNumber: currentEndValue != '' ? targetChangeNumber : '',
            currentTargetChangePercentage: currentEndValue != '' ? targetChangePer : '',
            currentCalculatedMomChange: currentEndValue != '' ? momValue : '',
            percentForOneMonth
        });
    }
    calculateMomByChangeInPercent(e) {
        this.setState({
            currentEndValue: '',
            currentCalculatedMomChange: '',
            currentTargetChangeNumber: '',
            percentForOneMonth: ''
        });
        var startDate = this.state.currentCalculatorStartDate;
        var endDate = this.state.currentCalculatorStopDate;
        var monthArr = this.state.monthList.filter(x => x.id > startDate && x.id < endDate);
        var monthDifference = parseInt((monthArr.length > 0 ? parseInt(monthArr.length + 1) : 0) + 1);
        // var monthDifference = moment(endDate).diff(startDate, 'months', true);
        // var monthArr = this.state.monthList.filter(x => x.id > startDate && x.id < endDate);
        // var monthDifference = monthArr.length > 0 ? parseInt(monthArr.length + 1) : 0;
        var currentTargetChangePercentage = document.getElementById("currentTargetChangePercentage").value;
        currentTargetChangePercentage = currentTargetChangePercentage != "" ? parseFloat(currentTargetChangePercentage) : ''
        var getValue = currentTargetChangePercentage != "" ? currentTargetChangePercentage.toString().replaceAll(",", "").match(/^-?\d+(?:\.\d{0,4})?/)[0] : "";
        var getEndValueFromPercentage = (this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100;


        // if (this.state.currentItemConfig.context.payload.nodeType.id == 3) {
        //     var targetEndValue = (parseFloat(getEndValueFromPercentage) + parseFloat(this.state.currentCalculatorStartValue)) / this.state.currentCalculatorStartValue * 100;
        // } else {
        var targetEndValue = (parseFloat(this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) + parseFloat(getEndValueFromPercentage)).toFixed(4);
        // }

        var momValue = '', percentForOneMonth = '';
        if (this.state.currentModelingType == 2) {
            // var momValue = ((parseFloat(targetEndValue - this.state.currentCalculatorStartValue)) / monthDifference).toFixed(4);
            var momValue = ((parseFloat(((this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100) / monthDifference))).toFixed(4);
            percentForOneMonth = getValue / monthDifference;
        }
        if (this.state.currentModelingType == 3) {
            if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
                var getChangeInPercent = getValue;
                var momValue = (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].calculatedDataValue * getChangeInPercent / 100).toFixed(4);
            } else {
                // var momValue = ((parseFloat(targetEndValue - this.state.currentCalculatorStartValue)) / monthDifference / this.state.currentCalculatorStartValue * 100).toFixed(4);
                // console.log("1 mom------------------->", this.state.currentCalculatorStartValue.toString().replaceAll(",", ""));
                // console.log("2 mom------------------->", getValue);
                // console.log("3 mom------------------->", this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue);
                var momValue = ((parseFloat(((this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100) / monthDifference))).toFixed(4);
                percentForOneMonth = getValue / monthDifference;
                // console.log("4 mom------------------->", momValue);
            }

        }
        if (this.state.currentModelingType == 4) {
            // var momValue = ((Math.pow(parseFloat(targetEndValue / this.state.currentCalculatorStartValue), parseFloat(1 / monthDifference)) - 1) * 100).toFixed(4);
            var momValue = ((parseFloat(((this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100) / monthDifference))).toFixed(4);
            percentForOneMonth = getValue / monthDifference;

        }
        if (this.state.currentModelingType == 5) {
            var momValue = (parseFloat(getValue / monthDifference)).toFixed(4);
        }

        var targetChangeNumber = '';
        if (this.state.currentItemConfig.context.payload.nodeType.id < 3) {
            targetChangeNumber = parseFloat(getEndValueFromPercentage / monthDifference).toFixed(4);
        }
        // console.log("targetChangeNumber 2---", targetChangeNumber);

        this.setState({
            currentEndValue: (getValue != '' && this.state.currentModelingType != 3 && this.state.currentModelingType != 5) ? targetEndValue : '',
            currentCalculatedMomChange: getValue != '' ? momValue : '',
            currentTargetChangeNumber: getValue != '' ? targetChangeNumber : '',
            percentForOneMonth
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
        // var monthDifference = moment(endDate).diff(startDate, 'months', true);
        var currentTargetChangeNumber = document.getElementById("currentTargetChangeNumber").value;
        var getValue = currentTargetChangeNumber.toString().replaceAll(",", "");
        // var getEndValueFromNumber = parseFloat(this.state.currentCalculatorStartValue) + parseFloat(e.target.value);
        var targetEndValue = parseFloat(this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) + parseFloat(getValue);

        var momValue = ''
        if (this.state.currentModelingType == 2) {
            // momValue = ((parseFloat(targetEndValue - this.state.currentCalculatorStartValue)) / monthDifference).toFixed(4);
            momValue = getValue;
        }
        if (this.state.currentModelingType == 3) {
            // momValue = ((parseFloat(targetEndValue - this.state.currentCalculatorStartValue)) / monthDifference / this.state.currentCalculatorStartValue * 100).toFixed(4);
            momValue = getValue;
        }
        if (this.state.currentModelingType == 4) {
            // momValue = ((Math.pow(parseFloat(targetEndValue / this.state.currentCalculatorStartValue), parseFloat(1 / monthDifference)) - 1) * 100).toFixed(4);
            momValue = getValue;
        }
        this.setState({
            currentEndValue: getValue != '' ? targetEndValue.toFixed(4) : '',
            currentCalculatedMomChange: getValue != '' ? momValue : ''
        });
    }



    getPayloadData(itemConfig, type) {
        var data = [];
        var totalValue = "";
        data = itemConfig.payload.nodeDataMap;
        if (data != null && data[0] != null && (data[0])[0] != null) {
            if (type == 4 || type == 5 || type == 6) {
                var result = false;
                if (itemConfig.payload.nodeDataMap[0][0].nodeDataModelingList != null && itemConfig.payload.nodeDataMap[0][0].nodeDataModelingList.length > 0) {
                    var nodeDataModelingList = itemConfig.payload.nodeDataMap[0][0].nodeDataModelingList;
                    if (type == 4) {
                        if (nodeDataModelingList.filter(x => x.increaseDecrease == 1).length > 0) {
                            result = true;
                        } else {
                            var arr = [];
                            if (itemConfig.payload.nodeType.id == NUMBER_NODE_ID) {
                                arr = this.state.items.filter(x => x.level == itemConfig.level && x.id != itemConfig.id && x.payload.nodeType.id == itemConfig.payload.nodeType.id);
                            } else {
                                arr = this.state.items.filter(x => x.level == itemConfig.level && x.id != itemConfig.id && (x.payload.nodeType.id == PERCENTAGE_NODE_ID || x.payload.nodeType.id == FU_NODE_ID || x.payload.nodeType.id == PU_NODE_ID) && x.parent == itemConfig.parent);
                            }
                            if (arr.length > 0) {
                                for (var i = 0; i <= arr.length; i++) {
                                    if (arr[i] != null) {
                                        // console.log("arr[i]---", arr[i], " ", itemConfig.payload.label.label_en)
                                        var nodeDataModelingList = arr[i].payload.nodeDataMap[0][0].nodeDataModelingList;
                                        if (nodeDataModelingList.length > 0) {
                                            // console.log("current node data id---", itemConfig.payload.nodeDataMap[0][0].nodeDataId);
                                            var nodedata = nodeDataModelingList.filter(x => x.transferNodeDataId == itemConfig.payload.nodeDataMap[0][0].nodeDataId)[0];
                                            // console.log("nodedata---", nodedata);
                                            if (nodedata != null && nodedata != "") {
                                                // console.log("nodedata inside if---", itemConfig.payload.label.label_en);
                                                result = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (type == 6) {
                        // // console.log("nodeDataModelingList 6---", nodeDataModelingList, " name", itemConfig.payload.label.label_en);
                        if (nodeDataModelingList.filter(x => x.increaseDecrease == -1).length > 0) {
                            result = true;
                        }

                    }
                    else if (type == 5) {
                        var filteredData = nodeDataModelingList.filter(x => x.transferNodeDataId != null && x.transferNodeDataId != "" && x.transferNodeDataId > 0);
                        if (filteredData.length > 0) {
                            result = true;
                        } else {
                            var arr = [];
                            if (itemConfig.payload.nodeType.id == NUMBER_NODE_ID) {
                                arr = this.state.items.filter(x => x.level == itemConfig.level && x.id != itemConfig.id && x.payload.nodeType.id == itemConfig.payload.nodeType.id);
                            } else {
                                arr = this.state.items.filter(x => x.level == itemConfig.level && x.id != itemConfig.id && (x.payload.nodeType.id == PERCENTAGE_NODE_ID || x.payload.nodeType.id == FU_NODE_ID || x.payload.nodeType.id == PU_NODE_ID) && x.parent == itemConfig.parent);
                            }
                            if (arr.length > 0) {
                                for (var i = 0; i <= arr.length; i++) {
                                    if (arr[i] != null) {
                                        // console.log("arr[i]---", arr[i], " ", itemConfig.payload.label.label_en)
                                        var nodeDataModelingList = arr[i].payload.nodeDataMap[0][0].nodeDataModelingList;
                                        if (nodeDataModelingList.length > 0) {
                                            // console.log("current node data id---", itemConfig.payload.nodeDataMap[0][0].nodeDataId);
                                            var nodedata = nodeDataModelingList.filter(x => x.transferNodeDataId == itemConfig.payload.nodeDataMap[0][0].nodeDataId)[0];
                                            // console.log("nodedata---", nodedata);
                                            if (nodedata != null && nodedata != "") {
                                                // console.log("nodedata inside if---", itemConfig.payload.label.label_en);
                                                result = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (type == 4 || type == 5) {
                        var arr = [];
                        if (itemConfig.payload.nodeType.id == NUMBER_NODE_ID) {
                            arr = this.state.items.filter(x => x.level == itemConfig.level && x.id != itemConfig.id && x.payload.nodeType.id == itemConfig.payload.nodeType.id);
                        } else {
                            arr = this.state.items.filter(x => x.level == itemConfig.level && x.id != itemConfig.id && (x.payload.nodeType.id == PERCENTAGE_NODE_ID || x.payload.nodeType.id == FU_NODE_ID || x.payload.nodeType.id == PU_NODE_ID) && x.parent == itemConfig.parent);
                        }
                        if (arr.length > 0) {
                            for (var i = 0; i <= arr.length; i++) {
                                if (arr[i] != null) {
                                    var nodeDataModelingList = arr[i].payload.nodeDataMap[0][0].nodeDataModelingList;
                                    if (nodeDataModelingList.length > 0) {
                                        var nodedata = nodeDataModelingList.filter(x => x.transferNodeDataId == itemConfig.payload.nodeDataMap[0][0].nodeDataId)[0];
                                        if (nodedata != null && nodedata != "") {
                                            result = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return result;
            } else {
                if (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2) {
                    if (type == 1) {
                        return addCommasTwoDecimal((itemConfig.payload.nodeDataMap[0])[0].displayDataValue);
                    } else if (type == 3) {
                        var childList = this.state.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                        if (childList.length > 0) {
                            var sum = 0;
                            childList.map(c => {
                                sum += Number((c.payload.nodeDataMap[0])[0].displayDataValue)
                            })
                            // console.log("sum if---", sum);
                            return sum.toFixed(2);
                        } else {
                            // console.log("sum else---", itemConfig.payload.label.label_en);
                            return "";
                        }
                    } else {
                        return "";
                    }
                } else {
                    if (type == 1) {
                        if (itemConfig.payload.nodeType.id == 4) {
                            // var fuPerMonth;
                            // var usageFrequency;
                            // var convertToMonth;
                            // var noOfForecastingUnitsPerPerson = (itemConfig.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson;
                            // if ((itemConfig.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 || ((itemConfig.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (itemConfig.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true)) {
                            //     usageFrequency = (itemConfig.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
                            //     convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == (itemConfig.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId))[0].convertToMonth;
                            // }
                            // if ((itemConfig.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2) {
                            //     fuPerMonth = ((noOfForecastingUnitsPerPerson / usageFrequency) * convertToMonth);
                            //     totalValue = fuPerMonth * (itemConfig.payload.nodeDataMap[0])[0].calculatedDataValue;
                            // } else {
                            //     var noOfPersons = (itemConfig.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
                            //     if ((itemConfig.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage == "true" || (itemConfig.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage == true) {
                            //         fuPerMonth = noOfForecastingUnitsPerPerson / noOfPersons;
                            //         totalValue = fuPerMonth * (itemConfig.payload.nodeDataMap[0])[0].calculatedDataValue;
                            //     } else {
                            //         fuPerMonth = ((noOfForecastingUnitsPerPerson / noOfPersons) * usageFrequency * convertToMonth);
                            //         totalValue = fuPerMonth * (itemConfig.payload.nodeDataMap[0])[0].calculatedDataValue;
                            //     }
                            // }
                            // (itemConfig.payload.nodeDataMap[0])[0].totalValue = totalValue;
                            // (itemConfig.payload.nodeDataMap[0])[0].fuPerMonth = (fuPerMonth < 0.01 ? addCommasThreeDecimal(fuPerMonth) : addCommasTwoDecimal(fuPerMonth));

                            return addCommasTwoDecimal((itemConfig.payload.nodeDataMap[0])[0].displayDataValue) + "% of parent, " + ((itemConfig.payload.nodeDataMap[0])[0].fuPerMonth < 0.01 ? addCommasThreeDecimal((itemConfig.payload.nodeDataMap[0])[0].fuPerMonth) : addCommasTwoDecimal((itemConfig.payload.nodeDataMap[0])[0].fuPerMonth)) + "/" + 'Month';
                        } else if (itemConfig.payload.nodeType.id == 5) {
                            // return addCommasTwoDecimal((itemConfig.payload.nodeDataMap[0])[0].dataValue.toString()) + "% of parent, conversion = " + (itemConfig.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier;
                            return addCommasTwoDecimal((itemConfig.payload.nodeDataMap[0])[0].displayDataValue) + "% of parent, conversion = " + (itemConfig.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier;
                        } else {
                            // return addCommasTwoDecimal((itemConfig.payload.nodeDataMap[0])[0].dataValue.toString()) + "% of parent";
                            return addCommasTwoDecimal((itemConfig.payload.nodeDataMap[0])[0].displayDataValue) + "% of parent";
                        }
                    } else if (type == 3) {
                        var childList = this.state.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                        if (childList.length > 0) {
                            var sum = 0;
                            childList.map(c => {
                                sum += Number((c.payload.nodeDataMap[0])[0].displayDataValue)
                            })
                            // console.log("sum if---", sum);
                            return sum.toFixed(2);
                        } else {
                            // console.log("sum else---", itemConfig.payload.label.label_en);
                            return "";
                        }
                    } else {
                        return "= " + ((itemConfig.payload.nodeDataMap[0])[0].displayCalculatedDataValue != null ? addCommasTwoDecimal((itemConfig.payload.nodeDataMap[0])[0].displayCalculatedDataValue) : "");
                        // if (itemConfig.payload.nodeType.id == 4) {
                        //     (itemConfig.payload.nodeDataMap[0])[0].displayCalculatedDataValue = ((itemConfig.payload.nodeDataMap[0])[0].totalValue != null ? addCommasTwoDecimal(((itemConfig.payload.nodeDataMap[0])[0].totalValue).toString()) : "0");
                        //     return "= " + ((itemConfig.payload.nodeDataMap[0])[0].totalValue != null ? addCommasTwoDecimal(((itemConfig.payload.nodeDataMap[0])[0].totalValue).toString()) : "0");
                        // } else if (itemConfig.payload.nodeType.id == 5) {
                        //     totalValue = ((this.state.items.filter(x => x.id == itemConfig.parent)[0].payload.nodeDataMap[0][0].totalValue * (itemConfig.payload.nodeDataMap[0])[0].dataValue) / 100) / (itemConfig.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier;
                        //     // totalValue = (this.state.items.filter(x => x.id == itemConfig.parent)[0].payload.nodeDataMap[0][0].totalValue * (itemConfig.payload.nodeDataMap[0])[0].dataValue) / 100;
                        //     (itemConfig.payload.nodeDataMap[0])[0].displayCalculatedDataValue = (totalValue != null ? addCommasTwoDecimal((totalValue).toString()) : "0");
                        //     return "= " + (totalValue != null ? addCommasTwoDecimal((totalValue).toString()) : "0");
                        // }
                        // else {
                        //     return "= " + ((itemConfig.payload.nodeDataMap[0])[0].calculatedDataValue != null ? addCommasTwoDecimal((itemConfig.payload.nodeDataMap[0])[0].calculatedDataValue.toString()) : "0");
                        // }
                    }
                }
            }
        } else {
            return "";
        }
    }

    // getSameLevelNodeList = function (instance, cell, c, r, source) {
    //     var sameLevelNodeList = [];
    //     var id = this.state.currentItemConfig.context.id;
    //     var level = this.state.currentItemConfig.context.level;
    //     var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
    //     var parent = this.state.currentItemConfig.context.parent;
    //     var nodeDataId = this.state.currentItemConfig.context.payload.nodeDataMap[0][0].nodeDataId;
    //     var isTransferRow = (instance.jexcel.getJson(null, false)[r])[12];
    //     // console.log("isTransferRow---",isTransferRow);
    //     var arr = [];
    //     if (nodeTypeId == NUMBER_NODE_ID) {
    //         arr = this.state.items.filter(x => x.level == level && x.id != id && x.payload.nodeType.id == nodeTypeId);
    //     } else {
    //         arr = this.state.items.filter(x => x.level == level && x.id != id && (x.payload.nodeType.id == PERCENTAGE_NODE_ID || x.payload.nodeType.id == FU_NODE_ID || x.payload.nodeType.id == PU_NODE_ID) && x.parent == parent);
    //     }
    //     if (isTransferRow) {
    //         for (let i = 0; i < arr.length; i++) {
    //             var nodeDataModelingList = arr[i].payload.nodeDataMap[0][0].nodeDataModelingList;
    //             // console.log("nodeDataModelingList---", nodeDataModelingList);
    //             if (nodeDataModelingList != undefined && nodeDataModelingList != null) {
    //                 var transferList = nodeDataModelingList.filter(x => x.transferNodeDataId == nodeDataId);
    //                 // console.log("transferList---", transferList);
    //                 if (transferList.length > 0) {
    //                     sameLevelNodeList.push({ id: (arr[i].payload.nodeDataMap[0])[0].nodeDataId, name: getLabelText(arr[i].payload.label, this.state.lang) });
    //                 }
    //                 // console.log("sameLevelNodeList transfer---", sameLevelNodeList);
    //             }
    //         }
    //     } else {
    //         for (var i = 0; i < arr.length; i++) {
    //             sameLevelNodeList[i] = { id: (arr[i].payload.nodeDataMap[0])[0].nodeDataId, name: getLabelText(arr[i].payload.label, this.state.lang) }
    //         }
    //     }
    //     // console.log("sameLevelNodeList---", sameLevelNodeList);
    //     return sameLevelNodeList;
    // }.bind(this)

    getSameLevelNodeList(level, id, nodeTypeId, parent) {
        var sameLevelNodeList = [];
        var sameLevelNodeList1 = [];
        var arr = [];
        if (nodeTypeId == NUMBER_NODE_ID) {
            arr = this.state.items.filter(x => x.level == level && x.id != id && x.payload.nodeType.id == nodeTypeId);
        } else {
            arr = this.state.items.filter(x => x.level == level && x.id != id && (x.payload.nodeType.id == PERCENTAGE_NODE_ID || x.payload.nodeType.id == FU_NODE_ID || x.payload.nodeType.id == PU_NODE_ID) && x.parent == parent);
        }

        for (var i = 0; i < arr.length; i++) {
            sameLevelNodeList.push({ id: arr[i].payload.nodeDataMap[0][0].nodeDataId + "_T", name: "To " + getLabelText(arr[i].payload.label, this.state.lang) });
            sameLevelNodeList.push({ id: arr[i].payload.nodeDataMap[0][0].nodeDataId + "_F", name: "From " + getLabelText(arr[i].payload.label, this.state.lang) });
            sameLevelNodeList1[i] = { id: arr[i].payload.nodeDataMap[0][0].nodeDataId + "_T", name: "To " + getLabelText(arr[i].payload.label, this.state.lang) };
        }
        this.setState({
            sameLevelNodeList,
            sameLevelNodeList1
        });

    }
    getNodeTransferList(level, id, nodeTypeId, parent, nodeDataId) {
        // console.log("nodeDataId---", nodeDataId);
        var nodeTransferDataList = [];
        var arr = [];
        if (nodeTypeId == NUMBER_NODE_ID) {
            arr = this.state.items.filter(x => x.level == level && x.id != id && x.payload.nodeType.id == nodeTypeId);
        } else {
            arr = this.state.items.filter(x => x.level == level && x.id != id && (x.payload.nodeType.id == PERCENTAGE_NODE_ID || x.payload.nodeType.id == FU_NODE_ID || x.payload.nodeType.id == PU_NODE_ID) && x.parent == parent);
        }
        // console.log("arr---", arr);
        for (let i = 0; i < arr.length; i++) {
            var nodeDataModelingList = arr[i].payload.nodeDataMap[0][0].nodeDataModelingList;
            // console.log("nodeDataModelingList---", nodeDataModelingList);
            if (nodeDataModelingList != undefined && nodeDataModelingList != null) {
                var transferList = nodeDataModelingList.filter(x => x.transferNodeDataId == nodeDataId);
                // console.log("transferList---", transferList);
                if (transferList.length > 0) {
                    var tempTransferList = JSON.parse(JSON.stringify(transferList));
                    // console.log("transferList.length > 0---", transferList.length);
                    if (transferList.length == 1) {
                        // console.log("transferList.length == 1---", transferList.length);
                        tempTransferList[0].transferNodeDataId = arr[i].payload.nodeDataMap[0][0].nodeDataId;
                        nodeTransferDataList.push(tempTransferList[0]);
                    } else {
                        // console.log("transferList.length > 1---", transferList.length);
                        for (let j = 0; j < transferList.length; j++) {
                            tempTransferList[j].transferNodeDataId = arr[i].payload.nodeDataMap[0][0].nodeDataId;
                            nodeTransferDataList.push(tempTransferList[j]);
                        }
                    }

                }
                // console.log("nodeTransferDataList---", nodeTransferDataList);
            }
        }
        // console.log("nodeTransferDataList final---", nodeTransferDataList);
        this.setState({
            nodeTransferDataList
        });

    }
    toggleMonthInFuture() {
        this.setState({
            popoverOpenMonthInFuture: !this.state.popoverOpenMonthInFuture,
        });
    }
    toggleMonthInPast() {
        this.setState({
            popoverOpenMonthInPast: !this.state.popoverOpenMonthInPast,
        });
    }

    toggle() {
        this.setState({
            popoverOpen: !this.state.popoverOpen,
        });
    }

    toggleHowManyPUperIntervalPer() {
        this.setState({
            popoverOpenHowManyPUperIntervalPer: !this.state.popoverOpenHowManyPUperIntervalPer,
        });
    }
    toggleWillClientsShareOnePU() {
        this.setState({
            popoverOpenWillClientsShareOnePU: !this.state.popoverOpenWillClientsShareOnePU,
        });
    }
    toggleConsumptionIntervalEveryXMonths() {
        this.setState({
            popoverOpenConsumptionIntervalEveryXMonths: !this.state.popoverOpenConsumptionIntervalEveryXMonths,
        });
    }
    toggleQATEstimateForInterval() {
        this.setState({
            popoverOpenQATEstimateForInterval: !this.state.popoverOpenQATEstimateForInterval,
        });
    }
    toggleNoOfPUUsage() {
        this.setState({
            popoverOpenNoOfPUUsage: !this.state.popoverOpenNoOfPUUsage,
        });
    }
    toggleConversionFactorFUPU() {
        this.setState({
            popoverOpenConversionFactorFUPU: !this.state.popoverOpenConversionFactorFUPU,
        });
    }
    togglePlanningUnitNode() {
        this.setState({
            popoverOpenPlanningUnitNode: !this.state.popoverOpenPlanningUnitNode,
        });
    }
    toggleHashOfUMonth() {
        this.setState({
            popoverOpenHashOfUMonth: !this.state.popoverOpenHashOfUMonth,
        });
    }
    toggleForecastingUnitPU() {
        this.setState({
            popoverOpenForecastingUnitPU: !this.state.popoverOpenForecastingUnitPU,
        });
    }
    toggleTypeOfUsePU() {
        this.setState({
            popoverOpenTypeOfUsePU: !this.state.popoverOpenTypeOfUsePU,
        });
    }
    toggleSingleUse() {
        this.setState({
            popoverOpenSingleUse: !this.state.popoverOpenSingleUse,
        });
    }
    toggleLagInMonth() {
        this.setState({
            popoverOpenLagInMonth: !this.state.popoverOpenLagInMonth,
        });
    }
    toggleTypeOfUse() {
        this.setState({
            popoverOpenTypeOfUse: !this.state.popoverOpenTypeOfUse,
        });
    }
    toggleCopyFromTemplate() {
        this.setState({
            popoverOpenCopyFromTemplate: !this.state.popoverOpenCopyFromTemplate,
        });
    }
    toggletracercategoryModelingType() {
        this.setState({
            popoverOpentracercategoryModelingType: !this.state.popoverOpentracercategoryModelingType,
        });
    }
    toggleParentValue() {
        this.setState({
            popoverOpenParentValue: !this.state.popoverOpenParentValue,
        });
    }
    togglePercentageOfParent() {
        this.setState({
            popoverOpenPercentageOfParent: !this.state.popoverOpenPercentageOfParent,
        });
    }
    toggleParent() {
        this.setState({
            popoverOpenParent: !this.state.popoverOpenParent,
        });
    }
    toggleCalculatedMonthOnMonthChnage() {
        this.setState({
            popoverOpenCalculatedMonthOnMonthChnage: !this.state.popoverOpenCalculatedMonthOnMonthChnage,
        });
    }
    toggleTargetChangeHash() {
        this.setState({
            popoverOpenTargetChangeHash: !this.state.popoverOpenTargetChangeHash,
        });
    }
    toggleTargetChangePercent() {
        this.setState({
            popoverOpenTargetChangePercent: !this.state.popoverOpenTargetChangePercent,
        });
    }
    toggleTargetEndingValue() {
        this.setState({
            popoverOpenTargetEndingValue: !this.state.popoverOpenTargetEndingValue,
        });
    }

    toggleMonth() {
        this.setState({
            popoverOpenMonth: !this.state.popoverOpenMonth,
        });
    }
    toggleNodeValue() {
        this.setState({
            popoverOpenNodeValue: !this.state.popoverOpenNodeValue,
        });
    }
    toggleNodeType() {
        this.setState({
            popoverOpenNodeType: !this.state.popoverOpenNodeType,
        });
    }
    toggleNodeTitle() {
        this.setState({
            popoverOpenNodeTitle: !this.state.popoverOpenNodeTitle,
        });
    }
    toggleSenariotree() {
        this.setState({
            popoverOpenSenariotree: !this.state.popoverOpenSenariotree,
        });
    }


    showMomData() {
        // // console.log("show mom data---", this.state.currentItemConfig);
        var getMomDataForCurrentNode = this.state.items.filter(x => x.id == this.state.currentItemConfig.context.id).length > 0 ? this.state.items.filter(x => x.id == this.state.currentItemConfig.context.id)[0].payload.nodeDataMap[0][0].nodeDataMomList : [];
        // console.log("getMomDataForCurrentNode>>>", getMomDataForCurrentNode);
        if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
            var getMomDataForCurrentNodeParent = this.state.items.filter(x => x.id == this.state.currentItemConfig.context.parent).length > 0 ? this.state.items.filter(x => x.id == this.state.currentItemConfig.context.parent)[0].payload.nodeDataMap[0][0].nodeDataMomList : []
            // console.log("in if>>>>", getMomDataForCurrentNodeParent);

            this.setState({ showMomDataPercent: !this.state.showMomDataPercent, showMomData: false, momListPer: getMomDataForCurrentNode, momListPerParent: getMomDataForCurrentNodeParent }, () => {
                if (this.state.showMomDataPercent) {
                    // console.log("inside show mom data percent node");
                    this.setState({ viewMonthlyData: false }, () => {
                        this.buildMomJexcelPercent();
                    })
                } else {
                    this.setState({ viewMonthlyData: true });
                }
            });
        } else {
            // console.log("in else>>>>");
            this.setState({ showMomDataPercent: false, showMomData: !this.state.showMomData, momList: getMomDataForCurrentNode }, () => {
                if (this.state.showMomData) {
                    // console.log("inside show mom data number node");
                    this.setState({ viewMonthlyData: false }, () => {
                        this.buildMomJexcel();
                    })
                } else {
                    this.setState({ viewMonthlyData: true });
                }
            });
        }
    }
    showMomDataPercent() {

    }
    buildMomJexcelPercent() {
        var momList = this.state.momListPer;
        var momListParent = this.state.momListPerParent;
        // console.log("momListParent---", momListParent)
        var dataArray = [];
        let count = 0;
        var fuPerMonth, totalValue, usageFrequency, convertToMonth;
        var lagInMonths = 0;
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
            var noOfForecastingUnitsPerPerson = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson;
            if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 || ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true)) {
                usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
                convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId))[0].convertToMonth;
            }
            if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2) {
                fuPerMonth = ((noOfForecastingUnitsPerPerson / usageFrequency) * convertToMonth);
            } else {
                var noOfPersons = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
                if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage == "true" || (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage == true) {
                    fuPerMonth = noOfForecastingUnitsPerPerson / noOfPersons;
                } else {
                    fuPerMonth = ((noOfForecastingUnitsPerPerson / noOfPersons) * usageFrequency * convertToMonth);
                }
            }
            lagInMonths = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.lagInMonths;
        }
        var monthsPerVisit = 1;
        var patients = 0;
        var grandParentMomList = [];
        var noOfBottlesInOneVisit = 0;
        if (this.state.currentItemConfig.context.payload.nodeType.id == 5) {
            monthsPerVisit = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths;
            var parent = (this.state.currentItemConfig.context.parent);
            var parentFiltered = (this.state.items.filter(c => c.id == parent))[0];

            var parentNodeNodeData = (parentFiltered.payload.nodeDataMap[0])[0];
            lagInMonths = parentNodeNodeData.fuNode.lagInMonths;
            if (parentNodeNodeData.fuNode.usageType.id == 2) {
                var daysPerMonth = 365 / 12;

                var grandParent = parentFiltered.parent;
                var grandParentFiltered = (this.state.items.filter(c => c.id == grandParent))[0];
                var patients = 0;
                var grandParentNodeData = (grandParentFiltered.payload.nodeDataMap[0])[0];
                grandParentMomList = grandParentNodeData.nodeDataMomList;
                // console.log("grandParentNodeData$$$%%%", grandParentNodeData)
                if (grandParentNodeData != undefined) {
                    var minusNumber = (momList[0].month == 1 ? momList[0].month - 2 : momList[0].month - 1);
                    var grandParentPrevMonthMMDValue = grandParentNodeData.nodeDataMomList.filter(c => c.month == minusNumber);
                    if (grandParentPrevMonthMMDValue.length > 0) {
                        patients = grandParentPrevMonthMMDValue[0].calculatedValue;
                    } else {
                        var grandParentCurMonthMMDValue = grandParentNodeData.nodeDataMomList.filter(c => c.month == momList[0].month);
                        if (grandParentCurMonthMMDValue.length > 0) {
                            patients = grandParentCurMonthMMDValue[0].calculatedValue;
                        } else {
                            patients = 0;
                        }
                    }
                } else {
                    patients = 0;
                }
                var noOfBottlesInOneVisit = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.puPerVisit;

            }
        }
        // console.log("Lag in months@@@", lagInMonths)
        for (var j = 0; j < momList.length; j++) {
            data = [];
            data[0] = momList[j].month
            data[1] = j == 0 ? parseFloat(momList[j].startValue).toFixed(4) : `=ROUND(IF(K1==true,E${parseInt(j)},J${parseInt(j)}),4)`
            data[2] = parseFloat(momList[j].difference).toFixed(4)
            data[3] = parseFloat(momList[j].manualChange).toFixed(4)
            data[4] = `=ROUND(IF(B${parseInt(j) + 1}+C${parseInt(j) + 1}+D${parseInt(j) + 1}<0,0,B${parseInt(j) + 1}+C${parseInt(j) + 1}+D${parseInt(j) + 1}),4)`
            // `=B${parseInt(j) + 1}+C${parseInt(j) + 1}+D${parseInt(j) + 1}`
            var momListParentForMonth = momListParent.filter(c => c.month == momList[j].month);
            data[5] = momListParentForMonth.length > 0 ? parseFloat(momListParentForMonth[0].calculatedValue).toFixed(4) : 0;
            data[6] = this.state.currentItemConfig.context.payload.nodeType.id != 5 ? `=ROUND((E${parseInt(j) + 1}*${momListParentForMonth.length > 0 ? parseFloat(momListParentForMonth[0].calculatedValue) : 0}/100)*L${parseInt(j) + 1},4)` : `=ROUND((E${parseInt(j) + 1}*${momListParentForMonth.length > 0 ? parseFloat(momListParentForMonth[0].calculatedValue) : 0}/100)/${(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier},4)`;
            // data[6] = this.state.manualChange ? momList[j].calculatedValue : ((momListParent[j].manualChange > 0) ? momListParent[j].endValueWithManualChangeWMC : momListParent[j].calculatedValueWMC *  momList[j].endValueWithManualChangeWMC) / 100
            data[7] = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].nodeDataId
            data[8] = this.state.currentItemConfig.context.payload.nodeType.id == 4 || (this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2) ? j >= lagInMonths ? `=IF(P${parseInt(j) + 1 - lagInMonths}<0,0,P${parseInt(j) + 1 - lagInMonths})` : 0 : `=IF(P${parseInt(j) + 1}<0,0,P${parseInt(j) + 1})`;
            data[9] = `=ROUND(IF(B${parseInt(j) + 1}+C${parseInt(j) + 1}<0,0,B${parseInt(j) + 1}+C${parseInt(j) + 1}),4)`
            data[10] = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].manualChangesEffectFuture;
            data[11] = this.state.currentItemConfig.context.payload.nodeType.id == 4 ? fuPerMonth : 1;
            data[12] = `=FLOOR.MATH(${j}/${monthsPerVisit},1)`;
            if (this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2) {
                var dataValue = 0;
                var minusNumber = (momList[j].month == 1 ? momList[j].month - 2 : momList[j].month - 1);
                var calculatedValueFromCurMonth = grandParentMomList.filter(c => c.month == momList[j].month);
                var calculatedValueFromPrevMonth = grandParentMomList.filter(c => c.month == minusNumber);
                var calculatedValueForCurMonth = 0;
                var calculatedValueForPrevMonth = 0;
                if (calculatedValueFromCurMonth.length > 0) {
                    calculatedValueForCurMonth = calculatedValueFromCurMonth[0].calculatedValue;
                }
                if (calculatedValueFromPrevMonth.length > 0) {
                    calculatedValueForPrevMonth = calculatedValueFromPrevMonth[0].calculatedValue;
                }
                var dataValue = 0;
                if (Math.floor(j / monthsPerVisit) == 0) {
                    dataValue = (patients / monthsPerVisit) + (j == 0 ? calculatedValueForCurMonth - patients : calculatedValueForCurMonth - calculatedValueForPrevMonth)
                } else {
                    dataValue = dataArray[j - monthsPerVisit][14] + (j == 0 ? calculatedValueForCurMonth - patients : calculatedValueForCurMonth - calculatedValueForPrevMonth)
                }
                data[13] = j == 0 ? calculatedValueForCurMonth - patients : calculatedValueForCurMonth - calculatedValueForPrevMonth;
                data[14] = dataValue;
            } else {
                data[13] = 0;
                data[14] = 0;
            }
            var nodeDataMomListPercForFU = [];
            var fuPercentage = 0;
            if (this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2) {
                if (parentNodeNodeData.nodeDataMomList != undefined) {
                    nodeDataMomListPercForFU = parentNodeNodeData.nodeDataMomList.filter(c => c.month == momList[j].month);
                    if (nodeDataMomListPercForFU.length > 0) {
                        fuPercentage = nodeDataMomListPercForFU[0].endValue;
                    }
                }
            }
            data[15] = this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2 ? `=ROUND((O${parseInt(j) + 1}*${noOfBottlesInOneVisit}*(E${parseInt(j) + 1}/100)*${fuPercentage}/100),0)` : `=G${parseInt(j) + 1}`;
            // `=ROUND(((E${parseInt(j) + 1}*F${parseInt(j) + 1})/100),0)`
            dataArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("momJexcelPer"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("momJexcelPer"), true);
        var data = dataArray;
        // // console.log("DataArray>>>", (this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level != 0 ? "Branch test 123 if":"Branch test 123 else"));

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 120, 60, 80, 150, 100, 110, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.common.month'),
                    type: 'dropdown',
                    source: this.state.monthList,
                    readOnly: true
                    // type: 'calendar',
                    // options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                },
                {
                    title: i18n.t('static.tree.%of') + " " + (this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level != 0 ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : "") + " " + i18n.t('static.tree.monthStart'),
                    type: 'hidden',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true

                },
                {
                    title: i18n.t('static.tree.calculatedChange'),
                    type: 'numeric',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.manualChange'),
                    type: 'numeric',
                    disabledMaskOnEdition: true,
                    textEditor: true,
                    mask: '#,##0.0000%', decimal: '.',
                    readOnly: AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') ? false : true,

                },
                {
                    title: i18n.t('static.tree.%of') + " " + (this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level != 0 ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : ""),
                    type: this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level == 0 ? 'hidden' : 'numeric',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true
                },
                {
                    title: (this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level != 0 ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : ""),
                    type: this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level == 0 ? 'hidden' : 'numeric',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true

                },
                {
                    title: getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) + " " + i18n.t('static.consumption.forcast'),
                    type: this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'hidden' : 'numeric',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true
                },
                {
                    title: 'Node data id',
                    type: 'hidden',

                },
                {
                    title: this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5 ? getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) + " " + i18n.t('static.consumption.forcast') : '# of PUs',
                    type: this.state.currentItemConfig.context.payload.nodeType.id == 5 || this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'numeric' : 'hidden',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true
                },
                {
                    title: 'Perc without manual change',
                    type: 'hidden',

                },
                {
                    title: 'Manual change',
                    type: 'hidden',

                },
                {
                    title: 'FU per month',
                    type: 'hidden',

                },
                {
                    title: 'Cycle',
                    type: 'hidden',

                },
                {
                    title: 'Diff',
                    type: 'hidden',

                },
                {
                    title: 'No of patients',
                    type: 'hidden',

                },
                {
                    title: 'Without Lag',
                    type: 'hidden',

                },

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
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),

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
        if (instance.worksheets[0].getJson(null, false).length > 0) {
            var cell = instance.worksheets[0].getCell("D1");
            cell.classList.add('readonly');
        }
    }

    buildMomJexcel() {
        var momList = this.state.momList;
        var dataArray = [];
        let count = 0;
        for (var j = 0; j < momList.length; j++) {
            data = [];
            data[0] = momList[j].month
            data[1] = j == 0 ? parseFloat(momList[j].startValue).toFixed(4) : `=ROUND(IF(I1==true,G${parseInt(j)},D${parseInt(j)}),4)`
            data[2] = parseFloat(momList[j].difference).toFixed(4)
            data[3] = `=ROUND(IF(B${parseInt(j) + 1}+C${parseInt(j) + 1}<0,0,(B${parseInt(j) + 1}+C${parseInt(j) + 1})),4)`;
            data[4] = parseFloat(momList[j].seasonalityPerc).toFixed(4)
            data[5] = parseFloat(momList[j].manualChange).toFixed(4)
            data[6] = `=ROUND(D${parseInt(j) + 1}+(D${parseInt(j) + 1}*E${parseInt(j) + 1}/100)+F${parseInt(j) + 1},4)`
            data[7] = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].nodeDataId
            data[8] = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].manualChangesEffectFuture;
            dataArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("momJexcel"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("momJexcel"), true);

        var data = dataArray;
        // console.log("DataArray>>>", dataArray);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [50, 80, 80, 80, 80, 80, 80, 80, 80],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    // 0
                    title: i18n.t('static.common.month'),
                    type: 'dropdown',
                    source: this.state.monthList,
                    readOnly: true
                    // type: 'calendar',
                    // options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100
                },
                {
                    // 1
                    title: i18n.t('static.tree.monthStartNoSeasonality'),
                    type: 'hidden',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true

                },
                {
                    // 2
                    title: i18n.t('static.tree.calculatedChange+-'),
                    type: 'numeric',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true
                },
                {
                    // 3
                    title: getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) + " " + i18n.t('static.tree.monthlyEndNoSeasonality'),
                    type: 'numeric',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true
                },
                {
                    // 4
                    title: i18n.t('static.tree.seasonalityIndex'),
                    type: this.state.seasonality == true ? 'numeric' : 'hidden',
                    disabledMaskOnEdition: true,
                    textEditor: true,
                    mask: '#,##0.0000%', decimal: '.',
                },
                {
                    // 5
                    title: i18n.t('static.tree.manualChange+-'),
                    type: this.state.seasonality == true ? 'numeric' : 'hidden',
                    mask: '#,##0.0000', decimal: '.',

                },
                {
                    title: getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) + " " + i18n.t('static.consumption.forcast'),
                    type: 'numeric',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true
                },
                {
                    title: "Node data id",
                    type: 'hidden',
                },
                {
                    title: "Manual change Effect future month",
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
                var elInstance = el;
                if (y != null) {
                    // var rowData = elInstance.getRowData(y);
                    // // console.log("this.state.seasonality---", this.state.seasonality);
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
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),

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
        if (instance.worksheets[0].getJson(null, false).length > 0) {
            var cell = instance.worksheets[0].getCell("E1");
            cell.classList.add('readonly');
            var cell = instance.worksheets[0].getCell("F1");
            cell.classList.add('readonly');
        }
    }

    addRow = function () {
        if (this.state.modelingChanged == false) {
            this.setState({
                modelingChanged: true
            })
        }
        var elInstance = this.state.modelingEl;
        var data = [];
        data[0] = ''
        data[1] = parseInt(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo) + 1;
        data[2] = this.state.maxMonth
        data[3] = ''
        data[4] = this.state.currentItemConfig.context.payload.nodeType.id == PERCENTAGE_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == FU_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == PU_NODE_ID ? 5 : '';
        data[5] = '';
        data[6] = ''
        data[7] = ''
        data[8] = cleanUp
        data[9] = ''
        data[10] = ''
        data[11] = 1
        data[12] = 0
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
        var nodeTransferDataList = this.state.nodeTransferDataList;
        // console.log("scalingList---", scalingList);
        // console.log("scalingList length---", scalingList.length);
        // console.log("nodeTransferDataList---", nodeTransferDataList);
        // console.log("this.state.maxMonth---", this.state.maxMonth);
        var dataArray = [];
        let count = 0;

        if (scalingList.length == 0) {

            data = [];
            data[0] = ''
            data[1] = this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo == -1 ? parseInt(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo) + 2 : parseInt(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo) + 1
            data[2] = this.state.maxMonth
            data[3] = ''
            data[4] = this.state.currentItemConfig.context.payload.nodeType.id == PERCENTAGE_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == FU_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == PU_NODE_ID ? 5 : '';
            data[5] = ''
            data[6] = ''
            data[7] = ''
            data[8] = cleanUp
            data[9] = ''
            data[10] = ''
            data[11] = ''
            data[12] = 0
            dataArray[count] = data;
            count++;
        }
        var scalingTotal = 0;
        for (var j = 0; j < scalingList.length; j++) {
            data = [];
            data[0] = scalingList[j].notes
            data[1] = scalingList[j].startDateNo
            data[2] = scalingList[j].stopDateNo
            data[3] = scalingList[j].transferNodeDataId + "_T"
            // console.log("modeling type---", scalingList[j].modelingType.id);
            data[4] = scalingList[j].modelingType.id
            data[5] = scalingList[j].increaseDecrease
            data[6] = scalingList[j].modelingType.id != 2 ? parseFloat(scalingList[j].dataValue).toFixed(4) : ''
            data[7] = scalingList[j].modelingType.id == 2 ? scalingList[j].dataValue : ''
            data[8] = cleanUp
            var nodeValue = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue;
            var calculatedChangeForMonth;
            if (scalingList[j].modelingType.id == 2 || scalingList[j].modelingType.id == 5) {
                calculatedChangeForMonth = scalingList[j].dataValue;
            } else if (scalingList[j].modelingType.id == 3 || scalingList[j].modelingType.id == 4) {
                calculatedChangeForMonth = (nodeValue * scalingList[j].dataValue) / 100;
            }
            data[9] = calculatedChangeForMonth
            data[10] = scalingList[j].nodeDataModelingId
            data[11] = 0
            data[12] = 0
            scalingTotal = parseFloat(scalingTotal) + parseFloat(calculatedChangeForMonth);
            dataArray[count] = data;
            count++;
        }
        if (nodeTransferDataList.length > 0) {
            for (var j = 0; j < nodeTransferDataList.length; j++) {
                data = [];
                data[0] = nodeTransferDataList[j].notes
                data[1] = nodeTransferDataList[j].startDateNo
                data[2] = nodeTransferDataList[j].stopDateNo
                data[3] = nodeTransferDataList[j].transferNodeDataId + "_F"
                // // console.log("modeling type---", scalingList[j].modelingType.id);
                data[4] = nodeTransferDataList[j].modelingType.id
                data[5] = 1
                data[6] = nodeTransferDataList[j].modelingType.id != 2 ? parseFloat(nodeTransferDataList[j].dataValue).toFixed(4) : ''
                data[7] = nodeTransferDataList[j].modelingType.id == 2 ? (nodeTransferDataList[j].dataValue) : ''
                data[8] = ""
                var nodeValue = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue;
                var calculatedChangeForMonth;
                if (nodeTransferDataList[j].modelingType.id == 2 || nodeTransferDataList[j].modelingType.id == 5) {
                    calculatedChangeForMonth = nodeTransferDataList[j].dataValue;
                } else if (nodeTransferDataList[j].modelingType.id == 3 || nodeTransferDataList[j].modelingType.id == 4) {
                    calculatedChangeForMonth = (nodeValue * (nodeTransferDataList[j].dataValue)) / 100;
                }
                data[9] = calculatedChangeForMonth
                data[10] = nodeTransferDataList[j].nodeDataModelingId
                data[11] = 0
                data[12] = 1
                scalingTotal = parseFloat(scalingTotal) + parseFloat(calculatedChangeForMonth);
                dataArray[count] = data;
                count++;
            }
        }
        this.setState({ scalingTotal });
        this.el = jexcel(document.getElementById("modelingJexcel"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("modelingJexcel"), true);

        var data = dataArray;
        // console.log("DataArray>>>", dataArray);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [90, 150, 80, 80, 90, 90, 90, 90, 90, 90],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                //1 B
                {
                    title: i18n.t('static.common.description'),
                    type: 'text',

                },
                //3 D
                {
                    title: i18n.t('static.common.startdate'),
                    type: 'dropdown',
                    source: this.state.monthList
                    // source: this.state.filteredModelingType
                    // options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [moment(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].month).startOf('month').add(1, 'months').format("YYYY-MM-DD"), this.state.maxMonth] }, width: 100
                },
                //4 E
                {
                    title: i18n.t('static.common.stopdate'),
                    type: 'dropdown',
                    source: this.state.monthList
                    // source: this.state.filteredModelingType
                    // options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [moment(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].month).startOf('month').add(1, 'months').format("YYYY-MM-DD"), this.state.maxMonth] }, width: 100
                },
                //0 A
                {
                    title: i18n.t('static.tree.transferToNode'),
                    type: 'dropdown',
                    source: this.state.sameLevelNodeList,
                    filter: this.filterSameLeveleUnitList,
                    // filter: this.getSameLevelNodeList
                },

                //2 C
                {
                    title: i18n.t('static.tree.modelingType'),
                    type: 'dropdown',
                    source: this.state.filteredModelingType
                },
                {
                    title: '+/-',
                    type: 'dropdown',
                    source: [
                        { id: 1, name: "Increase" },
                        { id: -1, name: "Decrease" }
                    ]
                },
                //5 F
                {
                    title: i18n.t('static.tree.monthlyChange%'),
                    type: 'numeric',
                    mask: '#,##0.0000%', decimal: '.',
                },
                //6 G
                {
                    title: i18n.t('static.tree.MonthlyChange#'),
                    type: this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'numeric' : 'hidden',
                    mask: '#,##0.0000', decimal: '.',
                },
                //7 H
                {
                    title: i18n.t('static.tree.modelingCalculater'),
                    type: 'image',
                    readOnly: true
                },
                //8 I
                {
                    title: i18n.t('static.tree.calculatedChangeForMonth') + " " + this.state.scalingMonth,
                    type: 'numeric',
                    mask: '#,##0.0000',
                    decimal: '.',
                    readOnly: true
                },
                //9 J
                {
                    title: 'nodeDataModelingId',
                    type: 'hidden'
                },
                //10 K
                {
                    title: 'isChanged',
                    type: 'hidden'
                },
                {
                    title: 'isTransfer',
                    type: 'hidden'
                },

            ],
            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed,
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el;
                if (y != null) {
                    var rowData = elInstance.getRowData(y);
                    if (rowData[4] != "") {
                        if (rowData[4] == 2) {
                            var cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                            cell.classList.remove('readonly');
                            cell = elInstance.getCell(("G").concat(parseInt(y) + 1))
                            cell.classList.add('readonly');
                        } else {
                            var cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                            cell.classList.add('readonly');
                            cell = elInstance.getCell(("G").concat(parseInt(y) + 1))
                            cell.classList.remove('readonly');
                            // elInstance.showIndex(6);
                        }
                    } else {
                        var cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        cell = elInstance.getCell(("G").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }

                    if (rowData[12] != "") {
                        var cell = elInstance.getCell(("A").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("B").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("D").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("E").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("F").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("G").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }
                    // if (rowData[3] != "" || rowData[12] == 1) {
                    if ((rowData[3] != "" && rowData[3] != "_T" && rowData[3] != "null_T") || rowData[12] == 1) {
                        var cell = elInstance.getCell(("F").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("F").concat(parseInt(y) + 1))
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
                    // if (obj.options.columnSorting == true) {
                    //     // Line
                    //     items.push({ type: 'line' });

                    //     items.push({
                    //         title: obj.options.text.orderAscending,
                    //         onclick: function () {
                    //             obj.orderBy(x, 0);
                    //         }
                    //     });
                    //     items.push({
                    //         title: obj.options.text.orderDescending,
                    //         onclick: function () {
                    //             obj.orderBy(x, 1);
                    //         }
                    //     });
                    // }
                } else {
                    // at start
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: "Insert Row",
                            onclick: function () {
                                var data = [];
                                data[0] = 0;
                                data[1] = parseInt(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo) + 1;
                                data[2] = this.state.maxMonth
                                data[3] = ''
                                data[4] = this.state.currentItemConfig.context.payload.nodeType.id == PERCENTAGE_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == FU_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == PU_NODE_ID ? 5 : '';
                                data[5] = '';
                                data[6] = ''
                                data[7] = ''
                                data[8] = cleanUp
                                data[9] = ''
                                data[10] = ''
                                data[11] = 1
                                data[12] = 0
                                obj.insertRow(data, 0, 1);
                            }.bind(this)
                        });
                    }
                    // Delete a row
                    if (obj.options.allowDeleteRow == true) {
                        // region id
                        if (obj.getRowData(y)[12] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    if (obj.getJson(null, false).length == 1) {
                                        var data = [];
                                        data[0] = 0;
                                        data[1] = parseInt(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo) + 1;
                                        data[2] = this.state.maxMonth
                                        data[3] = ''
                                        data[4] = this.state.currentItemConfig.context.payload.nodeType.id == PERCENTAGE_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == FU_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == PU_NODE_ID ? 5 : '';
                                        data[5] = '';
                                        data[6] = ''
                                        data[7] = ''
                                        data[8] = cleanUp
                                        data[9] = ''
                                        data[10] = ''
                                        data[11] = 1
                                        data[12] = 0
                                        obj.insertRow(data, 0, 1);
                                        obj.deleteRow(parseInt(y) + 1);
                                        var col = ("C").concat(parseInt(0) + 1);
                                        obj.setStyle(col, "background-color", "transparent");
                                        obj.setComments(col, "");
                                        this.setState({
                                            lastRowDeleted: true
                                        })
                                    } else {
                                        obj.deleteRow(parseInt(y));
                                    }
                                }.bind(this)
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
            // var curDate = moment(Date.now()).utcOffset('-0500').startOf('month').format('YYYY-MM-DD');
            // // console.log("curDate---", curDate)
            this.filterScalingDataByMonth(this.state.monthId);
        }
        );
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);

        // var asterisk = document.getElementsByClassName("resizable")[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        // console.log("tr.children[9]---", tr.children[9]);
        tr.children[4].classList.add('InfoTr');
        tr.children[5].classList.add('InfoTr');
        tr.children[9].classList.add('InfoTr');
        tr.children[10].classList.add('InfoTr');

        tr.children[4].title = i18n.t('static.tooltip.Transfercloumn');
        tr.children[5].title = i18n.t('static.tooltip.ModelingType');
        tr.children[9].title = i18n.t('static.tooltip.ModelingCalculator');
        // tr.children[9] = 'Anchal';
        tr.children[10].title = i18n.t('static.tooltip.CalculatorChangeforMonth');

    }

    filterSameLeveleUnitList = function (instance, cell, c, r, source) {
        var sameLevelNodeList = this.state.sameLevelNodeList1;
        // console.log("mylist--------->32", sameLevelNodeList);
        return sameLevelNodeList;

    }.bind(this)

    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {

            if (y == 8 && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE')) {
                var elInstance = this.state.modelingEl;
                var rowData = elInstance.getRowData(x);
                if (rowData[4] != "" && rowData[4] != null && rowData[1] != "" && rowData[1] != null && rowData[2] != "" && rowData[2] != null) {
                    this.setState({
                        currentRowIndex: '',
                        currentTransferData: '',
                        currentModelingType: '',
                        currentCalculatorStartDate: '',
                        currentCalculatorStopDate: '',
                        currentCalculatorStartValue: '',
                    }, () => {
                        // // console.log("x row data===>", this.el.getRowData(x));
                        var startValue = this.getMomValueForDateRange(rowData[1]);
                        this.setState({
                            currentRowIndex: x,
                            showCalculatorFields: this.state.aggregationNode ? !this.state.showCalculatorFields : false,
                            currentModelingType: rowData[4],
                            currentTransferData: rowData[3],
                            currentCalculatorStartDate: rowData[1],
                            currentCalculatorStopDate: rowData[2],
                            currentCalculatorStartValue: startValue,
                            currentCalculatedMomChange: '',
                            currentTargetChangeNumber: '',
                            currentTargetChangeNumberEdit: false,
                            currentTargetChangePercentage: '',
                            currentTargetChangePercentageEdit: false,
                            currentEndValue: '',
                            currentEndValueEdit: false
                        });
                    })
                } else if (rowData[4] == "" || rowData[4] == null) {
                    alert("Please select modeling type before proceeding.");
                }
                else if (rowData[1] == "" || rowData[1] == null) {
                    alert("Please select start date before proceeding.");
                }
                else if (rowData[2] == "" || rowData[2] == null) {
                    alert("Please select end date before proceeding.");
                }
            }
        }
    }.bind(this)
    changed1 = function (instance, cell, x, y, value) {
        if (this.state.isChanged != true) {
            this.setState({ isChanged: true });
        }
        // // 4 & 5
        // this.setState({
        //     momJexcelLoader: true
        // }, () => {
        //     setTimeout(() => {
        //         // console.log("hi anchal")
        //         var json = this.state.momEl.getJson(null, false);
        //         // console.log("momData>>>", json);
        //         var overrideListArray = [];
        //         for (var i = 0; i < json.length; i++) {
        //             var map1 = new Map(Object.entries(json[i]));
        //             if ((map1.get("4") != '' && map1.get("4") != 0.00) || (map1.get("5") != '' && map1.get("5") != 0.00)) {
        //                 var overrideData = {
        //                     month: map1.get("0"),
        //                     seasonalityPerc: map1.get("4").toString().replaceAll(",", "").split("%")[0],
        //                     manualChange: (map1.get("5") != '' && map1.get("5") != 0.00) ? (map1.get("5")).replaceAll(",", "") : map1.get("5"),
        //                     nodeDataId: map1.get("7"),
        //                     active: true
        //                 }
        //                 // console.log("overrideData>>>", overrideData);
        //                 overrideListArray.push(overrideData);
        //             }
        //         }
        //         // console.log("overRide data list>>>", overrideListArray);
        //         let { currentItemConfig } = this.state;
        //         let { treeTemplate } = this.state;
        //         var items = this.state.items;
        //         (currentItemConfig.context.payload.nodeDataMap[0])[0].nodeDataOverrideList = overrideListArray;
        //         this.setState({ currentItemConfig }, () => {
        //             var findNodeIndex = items.findIndex(n => n.id == currentItemConfig.context.id);
        //             items[findNodeIndex] = currentItemConfig.context;
        //             treeTemplate.flatList = items;
        //             this.setState({
        //                 treeTemplate
        //             }, () => {
        //                 // console.log("treeTemplate>>>", treeTemplate);
        //                 calculateModelingData(treeTemplate, this, '', currentItemConfig.context.id, 0, 1, -1, true);
        //             });

        //         });
        //     }, 0);
        // });

    }.bind(this);
    changed2 = function (instance, cell, x, y, value) {
        if (this.state.isChanged != true) {
            this.setState({ isChanged: true });
        }
        // this.setState({
        //     momJexcelLoader: true
        // }, () => {
        //     setTimeout(() => {
        //         var json = this.state.momElPer.getJson(null, false);
        //         // console.log("momData>>>", json);
        //         var overrideListArray = [];
        //         for (var i = 0; i < json.length; i++) {
        //             var map1 = new Map(Object.entries(json[i]));
        //             if (map1.get("3") != '' && map1.get("3") != 0.00) {
        //                 var overrideData = {
        //                     month: map1.get("0"),
        //                     seasonalityPerc: 0,
        //                     manualChange: map1.get("3").toString().replaceAll(",", "").split("%")[0],
        //                     nodeDataId: map1.get("7"),
        //                     active: true
        //                 }
        //                 // console.log("overrideData>>>", overrideData);
        //                 overrideListArray.push(overrideData);
        //             }
        //         }
        //         // console.log("overRide data list>>>", overrideListArray);
        //         let { currentItemConfig } = this.state;
        //         let { treeTemplate } = this.state;
        //         var items = this.state.items;
        //         (currentItemConfig.context.payload.nodeDataMap[0])[0].nodeDataOverrideList = overrideListArray;
        //         this.setState({ currentItemConfig }, () => {
        //             // // console.log("currentIemConfigInUpdetMom>>>", currentItemConfig);
        //             var findNodeIndex = items.findIndex(n => n.id == currentItemConfig.context.id);
        //             items[findNodeIndex] = currentItemConfig.context;
        //             treeTemplate.flatList = items; this.setState({
        //                 treeTemplate
        //             }, () => {
        //                 // console.log("treeTemplate>>>", treeTemplate);
        //                 calculateModelingData(treeTemplate, this, '', currentItemConfig.context.id, 0, 1, -1, true);

        //             });
        //         });
        //     }, 0);
        // });
    }.bind(this);
    changed = function (instance, cell, x, y, value) {
        if (x != 9 && x != 11 && this.state.modelingChanged == false) {
            this.setState({
                modelingChanged: true
            })
        }
        if (this.state.lastRowDeleted != false) {
            this.setState({
                lastRowDeleted: false
            })
        }
        //Modeling type
        if (x == 4) {
            instance.setStyle(("G").concat(parseInt(y) + 1), "background-color", "transparent");
            instance.setComments(("G").concat(parseInt(y) + 1), "");
            instance.setStyle(("H").concat(parseInt(y) + 1), "background-color", "transparent");
            instance.setComments(("H").concat(parseInt(y) + 1), "");
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.label.fieldRequired'));
                this.state.modelingEl.setValueFromCoords(6, y, "", true);
                this.state.modelingEl.setValueFromCoords(7, y, "", true);
                // this.state.modelingEl.setValueFromCoords(8, y, '', true);
            } else {
                if (value == 2) {
                    this.state.modelingEl.setValueFromCoords(6, y, "", true);
                    // this.state.modelingEl.setValueFromCoords(8, y, '', true);
                }
                else if (value == 3 || value == 4 || value == 5) {
                    this.state.modelingEl.setValueFromCoords(7, y, "", true);
                    // this.state.modelingEl.setValueFromCoords(8, y, '', true);
                }
                instance.setStyle(col, "background-color", "transparent");
                instance.setComments(col, "");
            }
        }
        // Transfer to/from node
        if (x == 3) {
            if (value != "") {
                this.state.modelingEl.setValueFromCoords(5, y, -1, true);
            }
            else {
                this.state.modelingEl.setValueFromCoords(5, y, "", true);
            }
        }
        //+/-
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            // var value = this.el.getValueFromCoords(5, y);
            if (value == "") {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                instance.setStyle(col, "background-color", "transparent");
                instance.setComments(col, "");
            }
        }
        var startDate = instance.getValue(`B${parseInt(y) + 1}`, true);
        var stopDate = instance.getValue(`C${parseInt(y) + 1}`, true);
        // Start date
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            // var diff1 = moment(stopDate).diff(moment(startDate), 'months');
            if (value == "") {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                instance.setStyle(col, "background-color", "transparent");
                instance.setComments(col, "");
                var col1 = ("C").concat(parseInt(y) + 1)
                if (stopDate <= startDate) {
                    instance.setStyle(col1, "background-color", "transparent");
                    instance.setStyle(col1, "background-color", "yellow");
                    instance.setComments(col1, 'Please enter valid date');
                } else {
                    instance.setStyle(col1, "background-color", "transparent");
                    instance.setComments(col1, "");
                }
            }
            // this.state.modelingEl.setValueFromCoords(4, y, '', true);
        }

        // Stop date
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            // var diff = moment(stopDate).diff(moment(startDate), 'months');
            if (value == "") {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            else if (stopDate <= startDate) {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, 'Please enter valid date');
            }
            else {
                instance.setStyle(col, "background-color", "transparent");
                instance.setComments(col, "");
            }
        }
        var elInstance = this.state.modelingEl;
        var rowData = elInstance.getRowData(y);
        // console.log("modelingTypeId-3--", rowData[4])
        if (rowData[4] != "") {
            var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE;
            // var monthDifference = moment(stopDate).diff(startDate, 'months', true);
            var nodeValue = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue;
            var calculatedChangeForMonth;
            // Monthly change %
            if (x == 6 && rowData[4] != 2) {
                instance.setStyle(("H").concat(parseInt(y) + 1), "background-color", "transparent");
                instance.setComments(("H").concat(parseInt(y) + 1), "");
                var col = ("G").concat(parseInt(y) + 1);
                value = value.toString().replaceAll(",", "").split("%")[0];
                if (value == "") {
                    instance.setStyle(col, "background-color", "transparent");
                    instance.setStyle(col, "background-color", "yellow");
                    instance.setComments(col, i18n.t('static.label.fieldRequired'));
                }
                else if (!(reg.test(value))) {
                    instance.setStyle(col, "background-color", "transparent");
                    instance.setStyle(col, "background-color", "yellow");
                    instance.setComments(col, i18n.t('static.message.invalidnumber'));
                }
                else {
                    instance.setStyle(col, "background-color", "transparent");
                    instance.setComments(col, "");
                    if (rowData[4] != 5) {
                        calculatedChangeForMonth = parseFloat((nodeValue * value) / 100).toFixed(4);
                    } else {
                        calculatedChangeForMonth = parseFloat(value).toFixed();
                    }
                    // this.state.modelingEl.setValueFromCoords(8, y, calculatedChangeForMonth, true);
                }

            }
            if (x == 4 && rowData[4] != 2 && rowData[6] != "") {
                instance.setStyle(("H").concat(parseInt(y) + 1), "background-color", "transparent");
                instance.setComments(("H").concat(parseInt(y) + 1), "");
                instance.setStyle(col, "background-color", "transparent");
                instance.setComments(col, "");
                if (rowData[4] != 5) {
                    calculatedChangeForMonth = parseFloat((nodeValue * rowData[5]) / 100).toFixed(4);
                } else {
                    calculatedChangeForMonth = parseFloat(rowData[5]).toFixed();
                }
                // this.state.modelingEl.setValueFromCoords(8, y, calculatedChangeForMonth, true);
            }
            // Monthly change #
            if (x == 7 && rowData[4] == 2) {
                instance.setStyle(("G").concat(parseInt(y) + 1), "background-color", "transparent");
                instance.setComments(("G").concat(parseInt(y) + 1), "");
                var col = ("H").concat(parseInt(y) + 1);
                var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE;
                value = value.toString().replaceAll(",", "");
                if (value == "") {
                    instance.setStyle(col, "background-color", "transparent");
                    instance.setStyle(col, "background-color", "yellow");
                    instance.setComments(col, i18n.t('static.label.fieldRequired'));
                }
                else if (!(reg.test(value))) {
                    instance.setStyle(col, "background-color", "transparent");
                    instance.setStyle(col, "background-color", "yellow");
                    instance.setComments(col, i18n.t('static.message.invalidnumber'));
                }
                else {
                    instance.setStyle(col, "background-color", "transparent");
                    instance.setComments(col, "");
                    // this.state.modelingEl.setValueFromCoords(8, y, parseFloat(value).toFixed(4), true);
                }

            }
        }
        if (x != 11) {
            instance.setValueFromCoords(11, y, 1, true);
            this.setState({ isChanged: true });
        }
        // this.calculateScalingTotal();
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
        // this.el.destroy();
        jexcel.destroy(document.getElementById("modelingJexcelPercent"), true);

        var data = dataArray;
        // console.log("DataArray>>>", dataArray);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 120, 60, 80, 150, 100, 110, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'Transfer to/from',
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
            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            editable: true,
            onload: this.loadedPer,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            // tableOverflow: true,
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
        // console.log("planningUnitId cf ---", planningUnitId);
        var pu = (this.state.planningUnitList.filter(c => c.planningUnitId == planningUnitId))[0];
        // console.log("pu---", pu)
        // (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id = event.target.value;
        this.setState({
            conversionFactor: pu.multiplier
        });
    }

    getNodeTypeFollowUpList(nodeTypeId) {
        // console.log("get node type follow up list---", nodeTypeId);
        var nodeType;
        var nodeTypeList = [];
        if (nodeTypeId != 0) {
            nodeType = this.state.nodeTypeList.filter(c => c.id == nodeTypeId)[0];
            // console.log("node type obj--->", nodeType);
            for (let i = 0; i < nodeType.allowedChildList.length; i++) {
                // console.log("allowed value---", nodeType.allowedChildList[i]);
                var obj = this.state.nodeTypeList.filter(c => c.id == nodeType.allowedChildList[i])[0];
                nodeTypeList.push(obj);
            }
            // console.log("final nodeTypeList---", nodeTypeList);
        } else {
            nodeTypeList = this.state.nodeTypeList.filter(c => c.id != 5);
            // nodeTypeList.push(nodeType);
            // nodeType = this.state.nodeTypeList.filter(c => c.id == 2)[0];
            // nodeTypeList.push(nodeType);
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
                    // console.log("node type--->", myResult[i])

                }

            }.bind(this);
        }.bind(this);
    }

    duplicateNode(itemConfig) {
        // console.log("duplicate node called 1---", this.state.currentItemConfig);
        // console.log("duplicate node called 2---", itemConfig);
        var items1 = this.state.items;
        const { items } = this.state;
        var maxNodeDataId = this.getMaxNodeDataId();
        // console.log("initial maxNodeDataId---", maxNodeDataId);
        var childList = items1.filter(x => x.sortOrder.startsWith(itemConfig.sortOrder));
        var childListArr = [];
        var json;
        var sortOrder = itemConfig.sortOrder;
        // console.log("childList---", childList);
        // var scenarioList = this.state.scenarioList;
        for (let i = 0; i < childList.length; i++) {
            var child = JSON.parse(JSON.stringify(childList[i]));
            // console.log("child before---", child);
            var maxNodeId = items.length > 0 ? Math.max(...items.map(o => o.id)) : 0;
            // console.log("maxNodeId---", maxNodeId);
            var nodeId = parseInt(maxNodeId + 1);
            // console.log("nodeId---", nodeId);
            var maxSortOrder;
            if (sortOrder == child.sortOrder) {
                child.payload.nodeId = nodeId;
                child.id = nodeId;
                var parentSortOrder = items.filter(c => c.id == itemConfig.parent)[0].sortOrder;
                var childList1 = items.filter(c => c.parent == itemConfig.parent);
                maxSortOrder = childList1.length > 0 ? Math.max(...childList1.map(o => o.sortOrder.replace(parentSortOrder + '.', ''))) : 0;
                // console.log("max sort order2---", maxSortOrder);
                child.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(maxSortOrder) + 1)).slice(-2));
                json = {
                    oldId: itemConfig.id,
                    newId: nodeId,
                    oldSortOrder: itemConfig.sortOrder,
                    newSortOrder: child.sortOrder
                }
                childListArr.push(json);
            } else {
                // console.log("childListArr---", childListArr + " child.parent---", child.parent);
                var parentNode = childListArr.filter(x => x.oldId == child.parent)[0];
                // console.log("parentNode---", parentNode)
                child.payload.nodeId = nodeId;
                var oldId = child.id;
                var oldSortOrder = child.sortOrder;
                child.id = nodeId;
                child.parent = parentNode.newId;
                var parentSortOrder = parentNode.newSortOrder;
                var childList1 = items.filter(c => c.parent == parentNode.newId);
                maxSortOrder = childList1.length > 0 ? Math.max(...childList1.map(o => o.sortOrder.replace(parentSortOrder + '.', ''))) : 0;
                // console.log("max sort order2---", maxSortOrder);
                child.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(maxSortOrder) + 1)).slice(-2));
                json = {
                    oldId: oldId,
                    newId: nodeId,
                    oldSortOrder: oldSortOrder,
                    newSortOrder: child.sortOrder
                }
                childListArr.push(json);
            }
            // if (scenarioList.length > 0) {
            // for (let i = 0; i < scenarioList.length; i++) {
            maxNodeDataId++;
            (child.payload.nodeDataMap[0])[0].nodeDataId = maxNodeDataId;

            // }
            // }
            // console.log("child after---", child);
            items.push(child);
        }


        // console.log("duplicate button clicked value after update---", items);
        this.setState({
            // items: [...items, newItem],
            items,
            cursorItem: nodeId
        }, () => {
            // console.log("on add items-------", this.state.items);
            this.calculateMOMData(0, 2);
        });
    }
    cancelClicked() {
        this.props.history.push(`/dataset/listBranchTreeTemplate/`)
    }


    getPlanningUnitListByFUId(forecastingUnitId) {
        // console.log("getPlanningUnitListByFUId---", forecastingUnitId);
        PlanningUnitService.getActivePlanningUnitListByFUId(forecastingUnitId).then(response => {
            // console.log("response---", response.data)
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            // console.log("planing unit listArray---", listArray);
            this.setState({
                planningUnitList: response.data,
                tempPlanningUnitId: response.data.length == 1 ? response.data[0].planningUnitId : "",
            }, () => {
                // console.log("planing unit list from api---", this.state.planningUnitList);
                if (this.state.planningUnitList.length == 1) {
                    var { currentItemConfig } = this.state;
                    if (this.state.addNodeFlag && currentItemConfig.context.payload.nodeType.id == 5) {
                        currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id = this.state.planningUnitList[0].planningUnitId;
                        currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.label = this.state.planningUnitList[0].label;
                        currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.multiplier = this.state.planningUnitList[0].multiplier;
                        currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.unit.id = this.state.planningUnitList[0].unit.id;
                    }
                    if (this.state.addNodeFlag && currentItemConfig.context.payload.nodeType.id == 5) {
                        currentItemConfig.context.payload.label = JSON.parse(JSON.stringify(this.state.planningUnitList[0].label));
                    }
                    this.setState({
                        conversionFactor: this.state.planningUnitList[0].multiplier,
                        currentItemConfig
                    }, () => {
                        if (this.state.addNodeFlag && currentItemConfig.context.payload.nodeType.id == 5) {
                            this.qatCalculatedPUPerVisit(1);
                        }
                    });
                }
                if (this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id != "") {
                    var conversionFactor = this.state.planningUnitList.filter(x => x.planningUnitId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id)[0].multiplier;
                    // console.log("pu conversion factor---", conversionFactor);
                    this.setState({
                        conversionFactor
                    }, () => {
                        if (!this.state.addNodeFlag) {
                            this.qatCalculatedPUPerVisit(0);
                        }
                        this.getUsageText();
                    });
                } else {
                    // console.log("noOfMonthsInUsagePeriod---", this.state.noOfMonthsInUsagePeriod);
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
        // console.log("forecastingUnitId---", forecastingUnitId);
        const { currentItemConfig } = this.state;
        var forecastingUnit = (this.state.forecastingUnitList.filter(c => c.forecastingUnitId == forecastingUnitId));
        // console.log("forecastingUnit---", forecastingUnit);
        if (forecastingUnit.length > 0) {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id = forecastingUnit[0].unit.id;
        }
        // console.log("currentItemConfig fu unit---", currentItemConfig);
        this.setState({
            currentItemConfig
        });
    }

    getNoOfFUPatient() {
        // console.log("no of fu------", (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson);
        // console.log("no of person---", (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons);
        var noOfFUPatient;
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
            noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
        } else {
            // console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode);
            noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
        }
        // console.log("noOfFUPatient---", noOfFUPatient);
        this.setState({
            noOfFUPatient
        }, () => {
            // console.log("state update fu--->", this.state.noOfFUPatient)
        })
    }
    getNodeUnitOfPrent() {
        var id;
        // console.log("obj------->>>>", this.state.currentItemConfig);
        if (this.state.currentItemConfig.context.parent != null) {
            id = this.state.currentItemConfig.parentItem.payload.nodeUnit.id;
            // console.log("node unit for test---", id);
            // } else {
            //     id = this.state.currentItemConfig.context.payload.nodeUnit.id;
        } else {
            id = this.state.currentItemConfig.context.payload.nodeUnit.id;
            // console.log("node unit for test---", id);
        }
        // }
        this.setState({
            usageTypeParent: id
        }, () => {
            // console.log("parent unit id===", this.state.usageTypeParent);
        });

    }
    getUsageTemplateList(tcId) {
        // console.log(" get uasge template--------------", this.state.currentItemConfig);
        var tracerCategoryId = tcId;
        // console.log("tracerCategoryId---", tracerCategoryId);
        // var forecastingUnitId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id;
        // // console.log("forecastingUnitId---", forecastingUnitId);
        // var usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id;
        // // console.log("usageTypeId---", usageTypeId);
        UsageTemplateService.getUsageTemplateListForTree((tracerCategoryId != "" && tracerCategoryId != null ? tracerCategoryId : 0)).then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                usageTemplateListAll: listArray,
                usageTemplateList: listArray
            }, () => {
                // console.log(" get uasge template--------------", response.data);
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
        // console.log("usageTemplate---", usageTemplate);
        const { currentItemConfig } = this.state;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.lagInMonths = usageTemplate.lagInMonths;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons = usageTemplate.noOfPatients;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson = usageTemplate.noOfForecastingUnits;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency = usageTemplate.usageFrequencyCount;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId = usageTemplate.usageFrequencyUsagePeriod != null ? usageTemplate.usageFrequencyUsagePeriod.usagePeriodId : '';
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id = usageTemplate.forecastingUnit.unit.id;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id = usageTemplate.forecastingUnit.id;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en = usageTemplate.forecastingUnit.label.label_en;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id = usageTemplate.usageType.id;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id = usageTemplate.tracerCategory.id;
        currentItemConfig.context.payload.label = usageTemplate.forecastingUnit.label;
        // for (var i = 0; i < newResult.length; i++) {
        // var autocompleteData = [{ value: usageTemplate.forecastingUnit.id, label: usageTemplate.forecastingUnit.id + "|" + getLabelText(usageTemplate.forecastingUnit.label, this.state.lang) }]
        // }


        if ((currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage = usageTemplate.oneTimeUsage;
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount = usageTemplate.repeatCount;
            if (!usageTemplate.oneTimeUsage) {
                // console.log("repeat copy template---", currentItemConfig.context.payload.nodeDataMap[0][0].fuNode);
                var repeatUsagePeriod = {
                    usagePeriodId: usageTemplate.repeatUsagePeriod != null ? usageTemplate.repeatUsagePeriod.usagePeriodId : ''
                };
                (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod = repeatUsagePeriod;
            }
        }
        this.setState({
            currentItemConfig,
            fuValues: { value: usageTemplate.forecastingUnit.id, label: getLabelText(usageTemplate.forecastingUnit.label, this.state.lang) + " | " + usageTemplate.forecastingUnit.id },
        }, () => {
            // console.log("copy from template---", this.state.currentItemConfig);
            this.getForecastingUnitListByTracerCategoryId(0, usageTemplate.forecastingUnit.id);
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
        var repeatUsagePeriodId;
        var oneTimeUsage;
        var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            // console.log("usageTypeId---", usageTypeId);
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage;
            }
            if (usageTypeId == 2 || (usageTypeId == 1 && oneTimeUsage != null && oneTimeUsage != "true" && oneTimeUsage != true)) {
                usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId;
                // console.log("usagePeriodId---", usagePeriodId);
                usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
                // console.log("usageFrequency---", usageFrequency);
            }

        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            // console.log("usageTypeId---", usageTypeId);
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage;
            }
            if (usageTypeId == 2 || (usageTypeId == 1 && oneTimeUsage != null && oneTimeUsage != "true" && oneTimeUsage != true)) {
                usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId;
                // console.log("usagePeriodId---", usagePeriodId);
                usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
                // console.log("usageFrequency---", usageFrequency);
            }

        }
        // console.log("usagePeriodId dis---", usagePeriodId);
        var noOfMonthsInUsagePeriod = 0;
        if ((usagePeriodId != null && usagePeriodId != "") && (usageTypeId == 2 || (oneTimeUsage == "false" || oneTimeUsage == false))) {
            var convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
            // console.log("convertToMonth dis---", convertToMonth);
            // console.log("repeat count---", (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount);
            // console.log("no of month dis---", this.getNoOfMonthsInUsagePeriod());

            if (usageTypeId == 2) {
                var div = (convertToMonth * usageFrequency);
                // console.log("duv---", div);
                if (div != 0) {
                    noOfMonthsInUsagePeriod = usageFrequency / convertToMonth;
                    // console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
                }
            } else {
                // var noOfFUPatient = this.state.noOfFUPatient;
                // var convertToMontRepeat = (this.state.usagePeriodList.filter(c => c.usagePeriodId == document.getElementById("repeatUsagePeriodId").value))[0].convertToMonth;
                var noOfFUPatient;
                if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                    noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                } else {
                    // console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode);
                    noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                }
                // console.log("no of fu patient---", noOfFUPatient);
                noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
                // console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
            }
            if (oneTimeUsage != "true" && oneTimeUsage != true && usageTypeId == 1) {
                repeatUsagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId;
                if (repeatUsagePeriodId) {
                    convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == repeatUsagePeriodId))[0].convertToMonth;
                } else {
                    convertToMonth = 0;
                }
            }
            // var noFURequired = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount / (convertToMonth * noOfMonthsInUsagePeriod);
            var noFURequired = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true ? ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
            // console.log("noFURequired---", noFURequired);

        } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
            // console.log("inside else if no fu");
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                noFURequired = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "");
            } else {
                noFURequired = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "");
            }
            // noOfMonthsInUsagePeriod = noOfFUPatient;
        }
        this.setState({
            noFURequired: (noFURequired != "" && noFURequired != 0 ? noFURequired : 0)
        });
    }

    getNoOfMonthsInUsagePeriod() {
        var usagePeriodId;
        var usageTypeId;
        var usageFrequency;
        var oneTimeUsage;
        var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            // console.log("usageTypeId---", usageTypeId);
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage;
            }
            // console.log("oneTimeUsage---", oneTimeUsage);
            if (usageTypeId == 2 || (usageTypeId == 1 && oneTimeUsage != null && oneTimeUsage != "true" && oneTimeUsage != true)) {
                usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId != "" ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId : "";
                // console.log("usagePeriodId---", usagePeriodId);
                // console.log("usageFrequency before 5---", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageFrequency);
                usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageFrequency.toString().replaceAll(",", "");
                // console.log("usageFrequency---", usageFrequency);
            }

        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            // console.log("usageTypeId---", usageTypeId);
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage;
            }
            if (usageTypeId == 2 || (usageTypeId == 1 && oneTimeUsage != null && oneTimeUsage != "true" && oneTimeUsage != true)) {
                usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId != "" ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId : "";
                // console.log("usagePeriodId---", usagePeriodId);
                usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency != "" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
                // console.log("usageFrequency---", usageFrequency);
            }

        }
        var noOfMonthsInUsagePeriod = 0;
        if (usagePeriodId != null && usagePeriodId != "") {
            var convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
            // console.log("convertToMonth---", convertToMonth);
            if (usageTypeId == 2) {
                var div = (convertToMonth * usageFrequency);
                // console.log("duv---", div);
                if (div != 0) {
                    noOfMonthsInUsagePeriod = usageFrequency / convertToMonth;
                    // console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
                }
            } else {
                // var noOfFUPatient = this.state.noOfFUPatient;
                var noOfFUPatient;
                if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                    noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                } else {
                    // console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode);
                    noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                }
                // console.log("no of fu patient---", noOfFUPatient);
                noOfMonthsInUsagePeriod = oneTimeUsage != "true" && oneTimeUsage != true ? convertToMonth * usageFrequency * noOfFUPatient : noOfFUPatient;
                // console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
            }
        } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
            // console.log("inside else if")
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            } else {
                // console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode);
                noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            }
            // console.log("inside else if ---", noOfFUPatient)
            noOfMonthsInUsagePeriod = noOfFUPatient;
        }
        this.setState({
            noOfMonthsInUsagePeriod
        }, () => {
            // if (this.state.currentItemConfig.context.payload.nodeType.id == 5) {
            //     this.getUsageText();
            // } else {
            //     // console.log("noOfMonthsInUsagePeriod---", this.state.noOfMonthsInUsagePeriod);
            // }
        });
    }
    getUsageText() {
        // console.log("this.state.currentItemConfig.context.payload.nodeDataMap[0])[0]----", this.state.currentItemConfig.context.payload.nodeDataMap[0][0]);
        var usageText = '';
        var noOfPersons = '';
        var noOfForecastingUnitsPerPerson = '';
        var usageFrequency = '';
        var selectedText = '';
        var selectedText1 = '';
        var selectedText2 = '';
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
            noOfPersons = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            noOfForecastingUnitsPerPerson = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "");
            if (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage == false || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage == "false") {
                usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency != "" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
            }

            if (this.state.addNodeFlag) {
                // var usageTypeParent = document.getElementById("usageTypeParent");
                if (this.state.currentItemConfig.context.level != 0) {
                    selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.parentItem.payload.nodeUnit.id)[0].label.label_en;
                } else {
                    selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en;
                }

            } else {
                if (this.state.currentItemConfig.context.level != 0) {
                    selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.parentItem.payload.nodeUnit.id)[0].label.label_en;
                } else {
                    selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en;
                }
            }

            if (this.state.addNodeFlag) {
                var forecastingUnitUnit = document.getElementById("forecastingUnitUnit");
                selectedText1 = forecastingUnitUnit.options[forecastingUnitUnit.selectedIndex].text;
            } else {
                selectedText1 = this.state.unitList.filter(c => c.unitId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id)[0].label.label_en;
            }




            if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 || ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true)) {
                // console.log("usage period Id---", this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId);
                selectedText2 = this.state.usagePeriodList.filter(c => c.usagePeriodId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId)[0].label.label_en;
            }
        }
        // FU
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {

            if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
                if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true) {
                    var selectedText3 = this.state.usagePeriodList.filter(c => c.usagePeriodId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId)[0].label.label_en;
                    var repeatCount = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount.toString().replaceAll(",", "") : '';
                    usageText = "Every " + addCommas(noOfPersons) + " " + selectedText.trim() + "(s) requires " + addCommas(noOfForecastingUnitsPerPerson) + " " + selectedText1.trim() + "(s), " + addCommas(usageFrequency) + " times per " + selectedText2.trim() + " for " + addCommas(repeatCount) + " " + selectedText3.trim();
                } else {
                    usageText = "Every " + addCommas(noOfPersons) + " " + selectedText.trim() + "(s) requires " + addCommas(noOfForecastingUnitsPerPerson) + " " + selectedText1.trim() + "(s)";
                }
            } else {
                usageText = "Every " + addCommas(noOfPersons) + " " + selectedText.trim() + "(s) requires " + addCommas(noOfForecastingUnitsPerPerson) + " " + selectedText1.trim() + "(s) every " + addCommas(usageFrequency) + " " + selectedText2.trim() + " indefinitely";
            }
        } else {
            //PU
            // // console.log("pu>>>", this.state.currentItemConfig);
            // console.log("pu id>>>", (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id);
            // console.log("pu id>>>", this.state.planningUnitList);
            if (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id != "") {
                var nodeUnitTxt = this.state.currentItemConfig.parentItem.parent != null ? this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en : this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.context.parent)[0].payload.nodeUnit.id)[0].label.label_en;
                if (this.state.addNodeFlag) {
                    var planningUnitId = document.getElementById("planningUnitId");
                    var planningUnit = planningUnitId.options[planningUnitId.selectedIndex].text;
                } else {
                    var planningUnit = this.state.planningUnitList.filter(c => c.planningUnitId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id)[0].label.label_en;
                }
                if ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
                    var sharePu;
                    if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit.toString() != "true") {
                        sharePu = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.puPerVisit != "" ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.puPerVisit : "";
                    } else {
                        sharePu = (this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor);
                    }
                    // (this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor);
                    // } else {
                    //     sharePu = this.round((this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor));
                    // }
                    usageText = "For each " + nodeUnitTxt.trim() + "(s) we need " + addCommas(sharePu) + " " + planningUnit;
                } else {
                    var puPerInterval = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.puPerVisit != "" ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.puPerVisit : "";
                    // usageText = "For each " + nodeUnitTxt.trim() + "(s) we need " + addCommas(this.round(puPerInterval)) + " " + planningUnit + " every " + (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths + " months";
                    usageText = "For each " + nodeUnitTxt.trim() + "(s) we need " + addCommas(puPerInterval) + " " + planningUnit + " every " + (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths + " months";
                }
            } else {
                usageText = "";
            }
        }


        this.setState({
            usageText
        }, () => {
            // console.log("usage text---", this.state.usageText);
        });

    }
    getForecastingUnitListByTracerCategoryId(type, isUsageTemplate) {
        var tracerCategoryId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id;
        // console.log("tracerCategoryId new---", tracerCategoryId)
        if (tracerCategoryId != "" && tracerCategoryId != undefined && tracerCategoryId != 'undefined') {
            ForecastingUnitService.getForcastingUnitListByTracerCategoryId(tracerCategoryId).then(response => {
                // console.log("fu list---", response.data)


                let forecastingUnitMultiList = response.data.length > 0
                    && response.data.map((item, i) => {
                        return ({ value: item.forecastingUnitId, label: getLabelText(item.label, this.state.lang) + " | " + item.forecastingUnitId })

                    }, this);
                this.setState({
                    forecastingUnitMultiList,
                    forecastingUnitList: response.data,
                    fuValues: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id != undefined && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id != "" && response.data.filter(x => x.forecastingUnitId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id).length > 0 ? { value: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id, label: getLabelText((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label, this.state.lang) + " | " + (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id } : []
                }, () => {
                    if (response.data.length == 1) {
                        const currentItemConfig = this.state.currentItemConfig;
                        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id = response.data[0].forecastingUnitId;
                        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en = getLabelText(response.data[0].label, this.state.lang) + " | " + response.data[0].forecastingUnitId;
                        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id = response.data[0].tracerCategory.id;
                        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id = response.data[0].unit.id;

                        this.setState({
                            currentItemConfig: currentItemConfig,
                            currentScenario: (currentItemConfig.context.payload.nodeDataMap[0])[0]
                        }, () => {
                            if (type == 0) {
                                var fuValues = { value: response.data[0].forecastingUnitId, label: getLabelText(response.data[0].label, this.state.lang) + " | " + response.data[0].forecastingUnitId };
                                this.setState({
                                    fuValues,
                                    // planningUnitList: [],
                                    tempPlanningUnitId: ""
                                }, () => {

                                });
                            }
                            this.getForecastingUnitUnitByFUId(this.state.fuValues.value);
                            this.getPlanningUnitListByFUId(response.data[0].forecastingUnitId);
                        })
                    } else if (this.state.addNodeFlag) {
                        if (isUsageTemplate > 0) {
                            this.getPlanningUnitListByFUId(isUsageTemplate);
                        } else {
                            this.setState({ planningUnitList: [] });
                        }
                    }
                    // else {
                    //     const currentItemConfig = this.state.currentItemConfig;
                    //     (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id = "";
                    //     (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en = "";
                    //     this.setState({
                    //         currentItemConfig: currentItemConfig

                    //     }, () => {

                    //     })
                    // }
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
            // console.log("inside else of tracer category")
            this.setState({
                forecastingUnitMultiList: [],
                forecastingUnitList: [],
                fuValues: [], tempPlanningUnitId: '', planningUnitList: []
            })
        }

    }


    filterPlanningUnitNode(e) {
        // console.log(">>>", e.target.checked);
        var itemsList = this.state.items;
        var arr = [];
        for (let i = 0; i < itemsList.length; i++) {
            var item = itemsList[i];
            if (item.payload.nodeType.id == 5) {
                if (this.state.hideFUPUNode) {
                    item.isVisible = false;
                } else {
                    if (e.target.checked == true) {
                        item.isVisible = false;
                    } else {
                        item.isVisible = true;
                    }
                }

            }
            arr.push(item);
        }
        this.setState({
            items: arr,
            hidePUNode: e.target.checked
        });
    }
    filterPlanningUnitAndForecastingUnitNodes(e) {
        // console.log(">>>", e.target.checked);
        var itemsList = this.state.items;
        var arr = [];
        for (let i = 0; i < itemsList.length; i++) {
            var item = itemsList[i];
            if (item.payload.nodeType.id == 5 || item.payload.nodeType.id == 4) {
                if (e.target.checked == true) {
                    item.isVisible = false;
                } else {
                    item.isVisible = item.payload.nodeType.id == 4 ? true : (item.payload.nodeType.id == 5 && this.state.hidePUNode ? false : true);
                }
            }
            arr.push(item);
        }
        this.setState({
            items: arr,
            hideFUPUNode: e.target.checked
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
        // console.log("Form@@@#####", form)
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
            forecastingUnitId: true,
            puPerVisit: true,
            usageFrequencyCon: true,
            usageFrequencyDis: true,
            usagePeriodIdCon: true,
            usagePeriodIdDis: true,
            // nodeValue: true
        }
        )
        // console.log("errors---", errors);
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
        // console.log("get node value---------------------");
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

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.isChanged == true || this.state.isTemplateChanged == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

    componentDidMount() {
        // console.log("my business functions---", AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_TREE_TEMPLATE'));
        this.getNodeTyeList();
        this.getUsageTemplateList(0);
        ForecastMethodService.getActiveForecastMethodList().then(response => {
            var listArray = response.data.filter(x => x.forecastMethodTypeId == 1);
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
                // console.log("nodeUnitList>>>", this.state.nodeUnitList);
                var nodeUnitListPlural = [];
                // console.log("this.state.nodeUnitList---", this.state.nodeUnitList);
                for (let i = 0; i < this.state.nodeUnitList.length; i++) {
                    // console.log("inside for---")
                    var nodeUnit = JSON.parse(JSON.stringify(this.state.nodeUnitList[i]));
                    // console.log("nodeUnit---", nodeUnit)
                    nodeUnit.label.label_en = nodeUnit.label.label_en + "(s)";
                    nodeUnitListPlural.push(nodeUnit);
                }
                // console.log("nodeUnitListPlural---", nodeUnitListPlural)
                this.setState({ nodeUnitListPlural })
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
        //     // console.log("node type list---", response.data);
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
        setTimeout(() => {
            if (this.props.match.params.templateId != -1 || this.state.treeTemplate.treeTemplateId > 0) {
                var treeTemplateId = this.props.match.params.templateId != -1 ? this.props.match.params.templateId : this.state.treeTemplate.treeTemplateId;
                DatasetService.getTreeTemplateById(treeTemplateId).then(response => {
                    // console.log("my tree---", response.data);
                    var items = response.data.flatList;
                    var arr = [];
                    for (let i = 0; i < items.length; i++) {

                        if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                            (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (items[i].payload.nodeDataMap[0])[0].dataValue;
                            (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue = (items[i].payload.nodeDataMap[0])[0].dataValue.toString();
                            (items[i].payload.nodeDataMap[0])[0].displayDataValue = (items[i].payload.nodeDataMap[0])[0].dataValue.toString();
                        } else {
                            if (items[i].level == 0) {
                                (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = 0;
                                (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue = 0;
                            } else {
                                var findNodeIndex = items.findIndex(n => n.id == items[i].parent);
                                var parentValue = (items[findNodeIndex].payload.nodeDataMap[0])[0].calculatedDataValue;
                                // console.log("api parent value---", parentValue);

                                (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (parentValue * (items[i].payload.nodeDataMap[0])[0].dataValue) / 100;
                                (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue = ((parentValue * (items[i].payload.nodeDataMap[0])[0].dataValue) / 100).toString();
                            }
                            (items[i].payload.nodeDataMap[0])[0].displayDataValue = (items[i].payload.nodeDataMap[0])[0].dataValue.toString();
                            if (this.state.hideFUPUNode) {
                                if (items[i].payload.nodeType.id == 4 || items[i].payload.nodeType.id == 5) {
                                    items[i].isVisible = false;
                                }
                            } else if (this.state.hidePUNode && items[i].payload.nodeType.id == 5) {
                                items[i].isVisible = false;
                            } else {
                                items[i].isVisible = true;
                            }
                        }
                        // console.log("load---", items[i])
                        // arr.push(items[i]);
                    }
                    // this.generateMonthList

                    this.setState({
                        treeTemplate: response.data,
                        items,
                        tempItems: items,
                        loading: true,
                    }, () => {
                        // // console.log(">>>", new Date('2021-01-01').getFullYear(), "+", ("0" + (new Date('2021-12-01').getMonth() + 1)).slice(-2));
                        // console.log("Tree Template---", this.state.items);
                        setTimeout(() => {
                            this.generateMonthList();
                            var curDate = (moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD'));
                            var monthList = JSON.parse(JSON.stringify(this.state.monthList));
                            var minMonth = monthList[0].id;
                            var maxMonth = monthList.sort((a, b) => b.id - a.id)[0].id;
                            // console.log("maxMonth on load---", maxMonth);
                            this.setState({
                                minDate: minMonth,
                                maxDate: maxMonth
                            }, () => {
                                this.calculateMOMData(1, 0);
                            })
                        }, 0)
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
                            newTemplateFlag: 0,
                            payload: {
                                nodeId: 1,
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
                                        nodeDataId: 1,
                                        notes: '',
                                        monthNo: 1,
                                        dataValue: '0',
                                        calculatedDataValue: '0',
                                        fuNode: {
                                            oneTimeUsage: "false",
                                            lagInMonths: 0,
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
                                                usagePeriodId: 1
                                            },
                                            repeatCount: '',
                                            repeatUsagePeriod: {
                                                usagePeriodId: 1
                                            }
                                        },
                                        puNode: {
                                            planningUnit: {
                                                id: '',
                                                unit: {
                                                    id: ""
                                                },
                                                multiplier: ''
                                            },
                                            refillMonths: '',
                                            sharePlanningUnit: "false"
                                        },

                                        // fuNode: {
                                        //     forecastingUnit: {
                                        //         tracerCategory: {

                                        //         },
                                        //         unit: {

                                        //         }
                                        //     },
                                        //     usageType: {

                                        //     },
                                        //     usagePeriod: {

                                        //     }
                                        // },
                                        nodeDataModelingList: [],
                                        nodeDataOverrideList: [],
                                        nodeDataMomList: []
                                    }]
                                ]
                            },
                            parentItem: {
                                payload: {
                                    nodeUnit: {

                                    },
                                    nodeDataMap: [
                                        [{
                                            fuNode: {
                                                forecastingUnit: {
                                                    tracerCategory: {

                                                    },
                                                    unit: {

                                                    }
                                                },
                                                usageType: {
                                                    id: ""
                                                },
                                                usagePeriod: {

                                                }
                                            }
                                        }]
                                    ]
                                }
                            }
                        }],
                        monthsInPast: 1,
                        monthsInFuture: 36,
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
                    },
                    items: [{
                        id: 1,
                        level: 0,
                        parent: null,
                        sortOrder: "00",
                        newTemplateFlag: 0,
                        payload: {
                            nodeId: 1,
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
                                    nodeDataId: 1,
                                    notes: '',
                                    nodeDataModelingList: [],
                                    nodeDataOverrideList: [],
                                    nodeDataMomList: [],
                                    monthNo: 1,
                                    dataValue: '0',
                                    calculatedDataValue: '0',
                                    fuNode: {
                                        oneTimeUsage: "false",
                                        lagInMonths: 0,
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
                                            usagePeriodId: 1
                                        },
                                        repeatCount: '',
                                        repeatUsagePeriod: {
                                            usagePeriodId: 1
                                        }
                                    },
                                    puNode: {
                                        planningUnit: {
                                            id: '',
                                            unit: {
                                                id: ""
                                            },
                                            multiplier: ''
                                        },
                                        refillMonths: '',
                                        sharePlanningUnit: "false"
                                    }
                                }]
                            ]
                        },
                        parentItem: {
                            payload: {
                                nodeUnit: {

                                },
                                nodeDataMap: [
                                    [{
                                        fuNode: {
                                            forecastingUnit: {
                                                tracerCategory: {

                                                },
                                                unit: {

                                                }
                                            },
                                            usageType: {
                                                id: ""
                                            },
                                            usagePeriod: {

                                            }
                                        }
                                    }]
                                ]
                            }
                        }
                    }]
                }, () => {
                    // console.log("Tree Template---", this.state.items);
                    this.generateMonthList();
                })
            }

            // this.generateMonthList();
        }, 0)
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
        // // console.log("tab data---", newTabObject);
        var tabList1 = [...tabList, newTabObject];
        // // console.log("tabList---", tabList1)
        this.setState({
            tabList: [...tabList, newTabObject],
            activeTab: parseInt(tabList.length),
            openAddScenarioModal: false
        }, () => {
            // console.log("final tab list---", this.state);
        });
    }
    nodeTypeChange(value) {
        var nodeTypeId = value;
        // console.log("node type value---", nodeTypeId)
        if (nodeTypeId == 1) {
            this.setState({
                numberNode: false,
                aggregationNode: false
            });
        } else if (nodeTypeId == 2) {
            // Number node
            // console.log("case 2")
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
        var { currentItemConfig } = this.state;
        if ((nodeTypeId == 3 || nodeTypeId == 4 || nodeTypeId == 5) && this.state.addNodeFlag && currentItemConfig.context.payload.nodeDataMap[0][0].dataValue == "") {
            currentItemConfig.context.payload.nodeDataMap[0][0].dataValue = 100;
            // console.log("parent value template---", currentItemConfig.parentItem.payload.nodeDataMap[0][0].calculatedDataValue);
            // currentItemConfig.context.payload.nodeDataMap[0][0].calculatedDataValue = ((100 * currentItemConfig.parentItem.payload.nodeDataMap[0][0].calculatedDataValue) / 100).toString()
            this.setState({ currentItemConfig }, () => {
                this.calculateParentValueFromMOM(currentItemConfig.context.payload.nodeDataMap[0][0].monthNo);
            })
        }
        if (this.state.addNodeFlag) {
            this.getSameLevelNodeList(parseInt(currentItemConfig.context.level + 1), 0, nodeTypeId, currentItemConfig.context.parent);
            // this.getNodeTransferList(currentItemConfig.context.level, 0, currentItemConfig.context.payload.nodeType.id, currentItemConfig.context.parent, 0);
        }
    }

    toggleModal(tabPane, tab) {
        const newArray = this.state.activeTab1.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab1: newArray,
            showCalculatorFields: false
        }, () => {
            var isValid = document.getElementById('isValidError').value;
            // // console.log("isValid 1---", isValid);
            this.setState({ isValidError: isValid });

            if (this.state.currentItemConfig.context.payload.nodeType.id == 1) {
                this.showMomData();
            }
            if (tab == 2) {
                // console.log("***>>>", this.state.currentItemConfig);
                if (this.state.currentItemConfig.context.payload.nodeType.id != 1) {
                    var curDate = (moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD'));
                    var month = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].monthNo;
                    var monthList = JSON.parse(JSON.stringify(this.state.monthList));
                    var minMonth = monthList[0].id;
                    var maxMonth = monthList.sort((a, b) => b.id - a.id)[0].id;
                    var modelingTypeList = this.state.modelingTypeList;
                    var arr = [];
                    if (this.state.currentItemConfig.context.payload.nodeType.id == 2) {
                        arr = modelingTypeList.filter(x => x.modelingTypeId != 1 && x.modelingTypeId != 5);
                    } else {
                        arr = modelingTypeList.filter(x => x.modelingTypeId == 5);
                    }
                    // console.log("arr---", arr);
                    var modelingTypeListNew = [];
                    for (var i = 0; i < arr.length; i++) {
                        // console.log("arr[i]---", arr[i]);
                        modelingTypeListNew[i] = { id: arr[i].modelingTypeId, name: getLabelText(arr[i].label, this.state.lang) }
                    }
                    this.setState({
                        showModelingJexcelNumber: true,
                        minMonth, maxMonth, filteredModelingType: modelingTypeListNew
                    }, () => {
                        this.buildModelingJexcel();
                    })

                } else {
                    this.setState({
                        showModelingJexcelNumber: true
                    }, () => {
                        this.buildModelingJexcel();
                    })
                }
                this.setState({ scalingMonth: this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo });
                // if (this.state.modelingEl != "") {
                //     // console.log("this.state.modelingEl---", this.state.modelingEl)
                //     this.state.modelingEl.setHeader(9, i18n.t('static.tree.calculatedChangeForMonth') + " " + this.state.scalingMonth);
                // }
                //  else if (this.state.currentItemConfig.context.payload.nodeType.id == 3) {
                //     this.setState({ showModelingJexcelPercent: true }, () => {
                //         this.buildModelingJexcelPercent()
                //     })
                // }
            }
        });
    }

    resetTree() {
        this.componentDidMount();
        // this.setState({ items: TreeData.demographic_scenario_two });
    }
    dataChange(event) {
        var flag = false;
        // alert("hi");
        // console.log("event---", event);
        let { currentItemConfig } = this.state;
        let { treeTemplate } = this.state;



        if (event.target.name == "calculatorStartDate") {
            var currentCalculatorStartValue = this.getMomValueForDateRange(event.target.value);
            this.setState({ currentCalculatorStartDate: event.target.value, currentCalculatorStartValue }, () => {
                if (!this.state.currentEndValueEdit && !this.state.currentTargetChangePercentageEdit && !this.state.currentTargetChangeNumberEdit) {
                    // console.log("Inside if modeling calculator");
                } else {
                    // console.log("Inside else modeling calculator");
                    if (!this.state.currentEndValueEdit) {
                        this.calculateMomByEndValue();
                    } else if (!this.state.currentTargetChangePercentageEdit) {
                        this.calculateMomByChangeInPercent();
                    } else if (!this.state.currentTargetChangeNumberEdit) {
                        this.calculateMomByChangeInNumber();
                    }
                }
            });
        }

        if (event.target.name == "calculatorTargetDate") {
            this.setState({ currentCalculatorStopDate: event.target.value }, () => {
                if (!this.state.currentEndValueEdit && !this.state.currentTargetChangePercentageEdit && !this.state.currentTargetChangeNumberEdit) {
                    // console.log("Inside if modeling calculator");
                } else {
                    // console.log("Inside else modeling calculator");
                    if (!this.state.currentEndValueEdit) {
                        this.calculateMomByEndValue();
                    } else if (!this.state.currentTargetChangePercentageEdit) {
                        this.calculateMomByChangeInPercent();
                    } else if (!this.state.currentTargetChangeNumberEdit) {
                        this.calculateMomByChangeInNumber();
                    }
                }
            });
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
            // // console.log("this.state.currentTargetChangeNumberEdit---", this.state.currentTargetChangeNumberEdit);
            // // console.log("this.state.currentModelingType---", this.state.currentModelingType);
            if (!this.state.currentTargetChangeNumberEdit && this.state.currentModelingType != 2) {
                // console.log("inside if calculator radio button");
                this.setState({
                    currentTargetChangePercentageEdit: false,
                    currentEndValueEdit: false
                });
            }

            // if (!this.state.currentEndValueEdit && !this.state.currentTargetChangePercentageEdit && !this.state.currentTargetChangeNumberEdit) {
            //     // console.log("Inside if modeling calculator");
            // } else {
            //     // console.log("Inside else modeling calculator");
            //     if (!this.state.currentEndValueEdit) {
            //         this.calculateMomByEndValue();
            //     } else if (!this.state.currentTargetChangePercentageEdit) {
            //         this.calculateMomByChangeInPercent();
            //     } else if (!this.state.currentTargetChangeNumberEdit) {
            //         this.calculateMomByChangeInNumber();
            //     }
            // }

        }
        if (event.target.name == "monthId") {
            // console.log("month id on change value---", event.target.value);
            var monthId = event.target.value;
            this.setState({ monthId }, () => {
                this.updateTreeData(monthId);
            })

        }

        if (event.target.name == "active") {
            treeTemplate.active = event.target.id === "active2" ? false : true;
            this.setState({ isTemplateChanged: true })
        }

        if (event.target.name === "sharePlanningUnit") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit = event.target.value;
            this.qatCalculatedPUPerVisit(0);
            this.getUsageText();
        }
        if (event.target.name === "refillMonths") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths = event.target.value;
            flag = true;
            this.getUsageText();
        }

        if (event.target.name === "puPerVisit") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.puPerVisit = event.target.value;
            this.getUsageText();
        }

        if (event.target.name === "forecastMethodId") {
            treeTemplate.forecastMethod.id = event.target.value;
            this.setState({ isTemplateChanged: true })
        }

        if (event.target.name === "treeName") {
            treeTemplate.label.label_en = event.target.value;
            this.setState({ isTemplateChanged: true })
        }

        if (event.target.name === "monthsInPast") {
            treeTemplate.monthsInPast = event.target.value;
            this.setState({ isTemplateChanged: true }, () => {
                this.generateMonthList();
            })


        }

        if (event.target.name === "monthsInFuture") {
            treeTemplate.monthsInFuture = event.target.value;
            this.setState({ isTemplateChanged: true }, () => {
                this.generateMonthList();
            })
        }

        if (event.target.name === "usageTemplateId") {
            // console.log("usage temp value---", event.target.value);
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
            var nodeUnit = document.getElementById("nodeUnitId");
            var selectedText = nodeUnit.options[nodeUnit.selectedIndex].text;
            var label = {
                label_en: selectedText
            }
            if (currentItemConfig.context.payload.nodeType.id == 4 && currentItemConfig.context.parent == null) {
                this.setState({ usageTypeParent: event.target.value });
            }
            currentItemConfig.context.payload.nodeUnit.label = label;
        }
        if (event.target.name === "monthNoFilter") {
            // console.log("event.target.value", event.target.value)
            if (!this.state.modelingChanged) {
                this.filterScalingDataByMonth(event.target.value);
            }
            if (this.state.modelingEl != "") {
                // console.log("this.state.modelingEl---", event.target.value)
                this.state.modelingEl.setHeader(9, i18n.t('static.tree.calculatedChangeForMonth') + " " + event.target.value);
            }
            this.setState({ scalingMonth: event.target.value }, () => {

            });
        }
        if (event.target.name === "percentageOfParent") {
            var value = (event.target.value).replaceAll(",", "");
            (currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue = value;
            var calculatedDataValue;
            var parentValue;
            var parentValue1;
            // if (this.state.addNodeFlag !== "true") {
            //     parentValue1 = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].calculatedDataValue;
            // } else {
            //     parentValue1 = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue;
            // }

            // // console.log("parentValue---", parentValue);
            // parentValue = parentValue1;
            // (currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue = (parseInt(parentValue * value) / 100).toString();
            (currentItemConfig.context.payload.nodeDataMap[0])[0].displayDataValue = value.toString();
            this.calculateParentValueFromMOM((currentItemConfig.context.payload.nodeDataMap[0])[0].monthNo);
            // // console.log("calculatedDataValue---", currentItemConfig);
            // this.setState({
            //     parentValue
            // })
        }
        if (event.target.name === "nodeValue") {
            // console.log("inside node value-------");
            var value = (event.target.value).replaceAll(",", "");
            (currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue = value;
            (currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue = value;
            (currentItemConfig.context.payload.nodeDataMap[0])[0].displayDataValue = value.toString();
            (currentItemConfig.context.payload.nodeDataMap[0])[0].displayCalculatedDataValue = value.toString();
        }
        if (event.target.name === "notes") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].notes = event.target.value;
            this.getNotes();
        }
        if (event.target.name === "templateNotes") {
            treeTemplate.notes = event.target.value;
            this.setState({ isTemplateChanged: true });
        }

        if (event.target.name === "tracerCategoryId") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id = event.target.value;
            this.getUsageTemplateList(event.target.value);
        }

        if (event.target.name === "noOfPersons") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons = event.target.value;
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }

        if (event.target.name === "lagInMonths") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.lagInMonths = event.target.value;
        }



        if (event.target.name === "forecastingUnitPerPersonsFC") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson = event.target.value;
            if (currentItemConfig.context.payload.nodeType.id == 4 && (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
                this.getNoOfFUPatient();
            }
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }

        if (event.target.name === "oneTimeUsage") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage = event.target.value;
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }

        if (event.target.name === "repeatUsagePeriodId") {
            var fuNode = (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode;
            var repeatUsagePeriod = document.getElementById("repeatUsagePeriodId");
            var selectedText = repeatUsagePeriod.options[repeatUsagePeriod.selectedIndex].text;

            var repeatUsagePeriod = {
                usagePeriodId: event.target.value,
                label: {
                    label_en: selectedText
                }
            }
            fuNode.repeatUsagePeriod = repeatUsagePeriod;
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode = fuNode;
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }

        if (event.target.name === "repeatCount") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount = event.target.value;
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }

        if (event.target.name === "monthNo") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].monthNo = event.target.value;
            this.calculateParentValueFromMOM(event.target.value);
        }

        if (event.target.name === "usageFrequencyCon" || event.target.name === "usageFrequencyDis") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency = event.target.value;
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }

        if (event.target.name === "usagePeriodIdCon" || event.target.name === "usagePeriodIdDis") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId = event.target.value;
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "usageTypeIdFU") {
            // console.log("usage type data change function ------------------", currentItemConfig.context.payload.nodeDataMap[0][0]);
            if (event.target.value == 2 && currentItemConfig.context.payload.nodeType.id == 4) {
                (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons = 1;
            }
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id = event.target.value;
        }

        if (event.target.name === "planningUnitIdFU") {
            this.setState({ tempPlanningUnitId: event.target.value });
        }

        if (event.target.name === "planningUnitId") {
            if (event.target.value != "") {
                var pu = (this.state.planningUnitList.filter(c => c.planningUnitId == event.target.value))[0];
                (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id = pu.unit.id;
                (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id = event.target.value;
                (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier = pu.multiplier;
                currentItemConfig.context.payload.label = JSON.parse(JSON.stringify(pu.label));
            } else {
                (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id = '';
                (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id = '';
                (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier = '';
                var label = {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: ''
                }
                currentItemConfig.context.payload.label = JSON.parse(JSON.stringify(label));
            }
            this.setState({
                conversionFactor: event.target.value != "" && pu != "" ? pu.multiplier : ''
            }, () => {
                flag = true;
                this.qatCalculatedPUPerVisit(0);
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


        this.setState({ currentItemConfig, isChanged: true }, () => {
            // console.log("after state update---", this.state.currentItemConfig);
            if (flag) {
                if (event.target.name === "planningUnitId") {
                    this.calculatePUPerVisit(false);
                } else if (event.target.name === "refillMonths") {
                    this.calculatePUPerVisit(true);
                    this.qatCalculatedPUPerVisit(0);

                }
                this.getUsageText();
            }
        });
    }
    createPUNode(itemConfig, parent) {
        // console.log("create PU node---", itemConfig);
        const { items } = this.state;
        var maxNodeId = items.length > 0 ? Math.max(...items.map(o => o.id)) : 0;
        var nodeId = parseInt(maxNodeId + 1);
        var newItem = itemConfig.context;
        newItem.parent = parent;
        newItem.id = nodeId;
        const { treeTemplate } = this.state;
        var treeLevelList = treeTemplate.levelList != undefined ? treeTemplate.levelList : [];
        var levelListFiltered = treeLevelList.findIndex(c => c.levelNo == parseInt(itemConfig.context.level + 1));
        if (levelListFiltered == -1) {
            var label = {}
            var unitId = this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.parent != null ? this.state.currentItemConfig.parentItem.payload.nodeUnit.id : this.state.currentItemConfig.context.payload.nodeUnit.id;
            if (unitId != "") {
                label = this.state.nodeUnitList.filter(c => c.unitId == unitId)[0].label;
            }
            treeLevelList.push({
                levelId: null,
                levelNo: parseInt(itemConfig.context.level + 1),
                label: {
                    label_en: "Level" + " " + parseInt(itemConfig.context.level + 1),
                    label_sp: "",
                    label_pr: "",
                    label_fr: ""
                },
                unit: {
                    id: parseInt(unitId),
                    label: label
                }
            })
        }
        treeTemplate.levelList = treeLevelList;
        newItem.level = parseInt(itemConfig.context.level + 1);
        newItem.payload.nodeId = nodeId;
        // console.log("this.state.tempPlanningUnitId---", this.state.tempPlanningUnitId);
        // console.log("this.state.planningUnitList---", this.state.planningUnitList);
        var pu = this.state.planningUnitList.filter(x => x.planningUnitId == this.state.tempPlanningUnitId)[0];
        newItem.payload.label = pu.label;
        newItem.payload.nodeType.id = 5;
        // var parentSortOrder = items.filter(c => c.id == parent)[0].sortOrder;
        // var childList = items.filter(c => c.parent == parent);
        newItem.sortOrder = itemConfig.context.sortOrder.concat(".").concat(("01").slice(-2));
        // // console.log("pu node month---", (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].month);
        (newItem.payload.nodeDataMap[0])[0].nodeDataId = this.getMaxNodeDataId() + 1;
        (newItem.payload.nodeDataMap[0])[0].dataValue = 100;
        (newItem.payload.nodeDataMap[0])[0].displayDataValue = (newItem.payload.nodeDataMap[0])[0].dataValue;
        (newItem.payload.nodeDataMap[0])[0].displayCalculatedDataValue = (newItem.payload.nodeDataMap[0])[0].calculatedDataValue;
        // (newItem.payload.nodeDataMap[0])[0].month = moment((newItem.payload.nodeDataMap[0])[0].month).startOf('month').format("YYYY-MM-DD")
        // console.log("newItem.payload.nodeDataMap[0])[0]----", newItem.payload.nodeDataMap[0][0]);
        (newItem.payload.nodeDataMap[0])[0].puNode.planningUnit.id = this.state.tempPlanningUnitId;
        (newItem.payload.nodeDataMap[0])[0].puNode.planningUnit.label = pu.label;
        try {
            var puPerVisit = "";
            if (itemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) {
                var refillMonths = this.round(parseFloat(pu.multiplier / (itemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)).toFixed(4));
                (newItem.payload.nodeDataMap[0])[0].puNode.refillMonths = refillMonths;
                // console.log("AUTO refillMonths---", refillMonths);
                // // console.log("PUPERVISIT noOfForecastingUnitsPerPerson---", parentScenario.fuNode.noOfForecastingUnitsPerPerson);
                // console.log("AUTO 1 noOfMonthsInUsagePeriod---", this.state.noOfMonthsInUsagePeriod);
                // puPerVisit = this.round(parseFloat(((itemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / pu.multiplier).toFixed(4));
                puPerVisit = parseFloat(((itemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / pu.multiplier).toFixed(4);
            } else {
                // console.log("AUTO 2 noOfMonthsInUsagePeriod---", this.state.noOfMonthsInUsagePeriod);
                // puPerVisit = this.round(this.state.noOfMonthsInUsagePeriod / pu.multiplier);
                puPerVisit = this.state.noOfMonthsInUsagePeriod / pu.multiplier;
            }
            // console.log("AUTO puPerVisit---", puPerVisit);
            (newItem.payload.nodeDataMap[0])[0].puNode.puPerVisit = puPerVisit;
        } catch (err) {
            (newItem.payload.nodeDataMap[0])[0].puNode.refillMonths = 1;
            (newItem.payload.nodeDataMap[0])[0].puNode.puPerVisit = "";
        }


        (newItem.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit = false;
        (newItem.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier = pu.multiplier;
        (newItem.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id = pu.unit.id;

        // console.log("pu node add button clicked value after update---", newItem);
        // console.log("pu node add button clicked value after update---", newItem.payload.nodeDataMap.length);
        this.setState({
            items: [...items, newItem],
            cursorItem: nodeId,
            converionFactor: pu.multiplier,
            treeTemplate
        }, () => {

            // console.log("on add items-------", this.state.items);
            if (!itemConfig.context.payload.extrapolation) {
                this.calculateMOMData(newItem.id, 0);
            } else {
                this.setState({
                    loading: false
                })
            }
            // this.calculateValuesForAggregateNode(this.state.items);
        });
    }

    onAddButtonClick(itemConfig, addNode, data) {
        // console.log("add button clicked---", itemConfig);
        const { items } = this.state;
        var maxNodeId = items.length > 0 ? Math.max(...items.map(o => o.id)) : 0;
        var nodeId = parseInt(maxNodeId + 1);
        // setTimeout(() => {
        var newItem = itemConfig.context;
        newItem.parent = itemConfig.context.parent;
        newItem.id = nodeId;
        const { treeTemplate } = this.state;
        var treeLevelList = treeTemplate.levelList != undefined ? treeTemplate.levelList : [];
        var levelListFiltered = treeLevelList.findIndex(c => c.levelNo == parseInt(itemConfig.context.level + 1));
        if (levelListFiltered == -1) {
            var label = {}
            var unitId = this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.parentItem.payload.nodeUnit.id : this.state.currentItemConfig.context.payload.nodeUnit.id;
            if (unitId != "") {
                label = this.state.nodeUnitList.filter(c => c.unitId == unitId)[0].label;
            }
            treeLevelList.push({
                levelId: null,
                levelNo: parseInt(itemConfig.context.level + 1),
                label: {
                    label_en: "Level" + " " + parseInt(itemConfig.context.level + 1),
                    label_sp: "",
                    label_pr: "",
                    label_fr: ""
                },
                unit: {
                    id: parseInt(unitId),
                    label: label
                }
            })
        }
        treeTemplate.levelList = treeLevelList;
        newItem.level = parseInt(itemConfig.context.level + 1);
        newItem.payload.nodeId = nodeId;
        var parentSortOrder = items.filter(c => c.id == itemConfig.context.parent)[0].sortOrder;
        var childList = items.filter(c => c.parent == itemConfig.context.parent);
        var maxSortOrder = childList.length > 0 ? Math.max(...childList.map(o => o.sortOrder.replace(parentSortOrder + '.', ''))) : 0;
        // console.log("max sort order1---", maxSortOrder);
        newItem.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(maxSortOrder) + 1)).slice(-2));
        (newItem.payload.nodeDataMap[0])[0].nodeDataId = this.getMaxNodeDataId() + 1;
        if (addNode) {
            (newItem.payload.nodeDataMap[0])[0].nodeDataModelingList = data;
        }
        // (newItem.payload.nodeDataMap[0])[0].month = moment((newItem.payload.nodeDataMap[0])[0].month).startOf('month').format("YYYY-MM-DD")
        if (itemConfig.context.payload.nodeType.id == 4) {
            (newItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en = (itemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en;

        }
        if (this.state.hideFUPUNode) {
            if (itemConfig.context.payload.nodeType.id == 4 || itemConfig.context.payload.nodeType.id == 5) {
                newItem.isVisible = false;
            }
        } else if (this.state.hidePUNode && itemConfig.context.payload.nodeType.id == 5) {
            newItem.isVisible = false;
        } else {
            newItem.isVisible = true;
        }
        // console.log("add button clicked value after update---", newItem);
        this.setState({
            items: [...items, newItem],
            cursorItem: nodeId,
            isSubmitClicked: false,
            treeTemplate
        }, () => {
            if (itemConfig.context.payload.nodeType.id == 4) {
                this.createPUNode(JSON.parse(JSON.stringify(itemConfig)), nodeId);
            } else {
                // console.log("on add items-------", this.state.items);
                this.calculateMOMData(newItem.id, 0);
            }
        });
        // }, 0);
    }

    calculateValuesForAggregateNode(items) {
        // console.log("start>>>", Date.now());
        var getAllAggregationNode = items.filter(c => c.payload.nodeType.id == 1).sort(function (a, b) {
            a = a.id;
            b = b.id;
            return a > b ? -1 : a < b ? 1 : 0;
        }.bind(this));

        // console.log(">>>", getAllAggregationNode);
        for (var i = 0; i < getAllAggregationNode.length; i++) {
            var getChildAggregationNode = items.filter(c => c.parent == getAllAggregationNode[i].id && (c.payload.nodeType.id == 1 || c.payload.nodeType.id == 2))
            // console.log(">>>", getChildAggregationNode);
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
                    // openAddNodeModal: false,
                }, () => {
                    // console.log("updated tree data>>>", this.state);
                });
            } else {
                var findNodeIndex = items.findIndex(n => n.id == getAllAggregationNode[i].id);
                items[findNodeIndex].payload.nodeDataMap[0][0].dataValue = "";
                items[findNodeIndex].payload.nodeDataMap[0][0].calculatedDataValue = "";

                this.setState({
                    items: items,
                    // openAddNodeModal: false,
                }, () => {
                    // console.log("updated tree data>>>", this.state);
                });
            }
        }
        // console.log("end>>>", Date.now());
    }
    onRemoveButtonClick(itemConfig) {
        this.setState({ loading: true }, () => {
            var { items } = this.state;
            const ids = items.map(o => o.id)
            const filtered = items.filter(({ id }, index) => !ids.includes(id, index + 1))
            // console.log("delete unique items---", filtered)
            items = filtered;
            this.setState(this.getDeletedItems(items, [itemConfig.id]), () => {
                setTimeout(() => {
                    // console.log("delete result---", this.getDeletedItems(items, [itemConfig.id]))
                    this.calculateMOMData(0, 2);
                }, 0);
            });
        });
    }
    onMoveItem(parentid, itemid) {
        // console.log("on move item called");
        const { items } = this.state;
        // console.log("move item items---", items);
        // console.log("move item parentid---", parentid);
        // console.log("move item itemid---", itemid);
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
        // // console.log("data1---", item.title);
        // // console.log("data2---", item.id);
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
                // console.log("highlighted item---", this.state)
            })
        }
    };
    onCursoChanged(event, data) {
        // console.log("cursor changed called---", data)
        const { context: item } = data;
        // console.log("cursor changed item---", item);
        // const preItem = JSON.parse(JSON.stringify(data.context));
        if (item != null) {
            this.setState({
                viewMonthlyData: true,
                usageTemplateId: '',
                sameLevelNodeList: [],
                showCalculatorFields: false,
                openAddNodeModal: true,
                addNodeFlag: false,
                showMomDataPercent: false,
                showMomData: false,
                // preItem: preItem,
                orgCurrentItemConfig: JSON.parse(JSON.stringify(data.context)),
                currentItemConfig: JSON.parse(JSON.stringify(data)),
                level0: (data.context.level == 0 ? false : true),
                numberNode: (data.context.payload.nodeType.id == 1 || data.context.payload.nodeType.id == 2 ? false : true),
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
                // console.log("555>>>", this.state.items);
                const ids = this.state.items.map(o => o.id)
                const filtered = this.state.items.filter(({ id }, index) => !ids.includes(id, index + 1))
                // console.log("edit unique items---", filtered)
                // console.log("highlighted item---", this.state.currentItemConfig.context)
                this.getNodeTypeFollowUpList(data.context.level == 0 ? 0 : data.parentItem.payload.nodeType.id);
                if (data.context.level != 0) {
                    this.calculateParentValueFromMOM(data.context.payload.nodeDataMap[0][0].monthNo);
                    // this.setState({
                    //     parentValue: data.parentItem.payload.nodeDataMap[0][0].calculatedDataValue
                    // });
                }
                if (data.context.payload.nodeType.id == 4) {
                    this.getForecastingUnitListByTracerCategoryId(1, 0);
                    this.setState({
                        fuValues: { value: (data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id, label: getLabelText((data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label, this.state.lang) + " | " + (data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id }
                        // fuLabels: getLabelText(this.state.currentScenario.fuNode.forecastingUnit.label, this.state.lang) + " | " + this.state.currentScenario.fuNode.forecastingUnit.id
                    });
                    // this.getNoOfMonthsInUsagePeriod();
                    this.getNodeUnitOfPrent();
                    this.getNoOfFUPatient();
                    // console.log("on curso nofuchanged---", this.state.noOfFUPatient)
                    this.getNoOfMonthsInUsagePeriod();
                    this.getNoFURequired();
                    this.getUsageTemplateList((data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id);
                    // // console.log("no -----------------");
                    this.getUsageText();
                    this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.currentItemConfig.context.level == 0 ? this.state.currentItemConfig.context.payload.nodeUnit.id : this.state.currentItemConfig.parentItem.payload.nodeUnit.id;
                } else if (data.context.payload.nodeType.id == 5) {

                    // console.log("hey 1---")
                    setTimeout(() => {
                        this.getPlanningUnitListByFUId((data.parentItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id);

                        // console.log("hey 2---", this.state.planningUnitList);
                        this.getNoOfMonthsInUsagePeriod();
                        // (data.context.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id = (data.context.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id;
                        // // (data.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id = (data.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id;
                        // this.setState({
                        //     // conversionFactor: pu.multiplier
                        //     // conversionFactor: 1
                        // }, () => {


                        // console.log("hey 3")

                        // console.log("hey 4")
                    }, 0);
                    // // console.log("this.state.currentItemConfig.parentItem.parent 1----", this.state.currentItemConfig.parentItem.parent);
                    // // console.log("this.state.currentItemConfig.parentItem.parent 2----", this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent));
                    if (this.state.currentItemConfig.parentItem.parent == null) {
                        this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == this.state.currentItemConfig.context.parent)[0].payload.nodeUnit.id;
                    } else {
                        this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id;
                    }
                }
                if (data.context.payload.nodeType.id != 1) {
                    this.getSameLevelNodeList(data.context.level, data.context.id, data.context.payload.nodeType.id, data.context.parent);
                    this.getNodeTransferList(data.context.level, data.context.id, data.context.payload.nodeType.id, data.context.parent, data.context.payload.nodeDataMap[0][0].nodeDataId);
                }


            })
        }
    };

    updateNodeInfoInJson(currentItemConfig) {
        // console.log("update tree node called------------", currentItemConfig);
        let isNodeChanged = currentItemConfig.context.newTemplateFlag;
        var nodeTypeId = currentItemConfig.context.payload.nodeType.id;
        var nodes = this.state.items;
        var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.context.id);

        if (this.state.hideFUPUNode) {
            if (nodeTypeId == 4 || nodeTypeId == 5) {
                currentItemConfig.context.isVisible = false;
            }
        } else if (this.state.hidePUNode && nodeTypeId == 5) {
            currentItemConfig.context.isVisible = false;
        } else {
            currentItemConfig.context.isVisible = true;
        }
        currentItemConfig.context.newTemplateFlag = 1;
        nodes[findNodeIndex] = currentItemConfig.context;
        // nodes[findNodeIndex].valueType = currentItemConfig.valueType;

        const { treeTemplate } = this.state;

        var treeLevelList = treeTemplate.levelList;
        // console.log("currentItemConfig.context.level == 0 && treeLevelList != undefined@@@@@@@", currentItemConfig.context.level == 0 && treeLevelList != undefined)
        // console.log("currentItemConfig.context.level == 0 && treeLevelList != undefined@@@@@@@treeLevelList", treeLevelList)

        if (currentItemConfig.context.level == 0 && treeLevelList != undefined) {
            var levelListFiltered = treeLevelList.findIndex(c => c.levelNo == parseInt(currentItemConfig.context.level));
            // console.log("levelListFiltered@@@@@@@@@@", levelListFiltered);
            if (levelListFiltered != -1) {
                var unitId = currentItemConfig.context.payload.nodeType.id == 4 && currentItemConfig.context.parent != null ? currentItemConfig.parentItem.payload.nodeUnit.id : currentItemConfig.context.payload.nodeUnit.id;
                var label = {}
                if (unitId != "") {
                    label = this.state.nodeUnitList.filter(c => c.unitId == unitId)[0].label;
                }
                treeLevelList[levelListFiltered].unit = {
                    id: parseInt(unitId),
                    label: label
                }

            }
            treeTemplate.levelList = treeLevelList;
            // console.log("TreeTemplate@@@@@@@", treeTemplate)
        }
        this.setState({
            items: nodes,
            isSubmitClicked: false,
            treeTemplate
        }, () => {
            // console.log("updated tree data+++", this.state);
            if (currentItemConfig.context.payload.nodeType.id == 4 && (isNodeChanged == 0 || isNodeChanged == false)) {
                this.createPUNode(JSON.parse(JSON.stringify(currentItemConfig)), currentItemConfig.context.id);
            } else {
                this.calculateMOMData(0, 0);
            }
        });
    }

    tabPane1() {
        var chartOptions = {
            title: {
                display: true,
                text: this.state.showMomData ? getLabelText(this.state.treeTemplate.label, this.state.lang) + " - " + getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) : ""
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: this.state.currentItemConfig.context.payload.nodeUnit.label != null && this.state.currentItemConfig.context.payload.nodeType.id != 1 ? getLabelText(this.state.currentItemConfig.context.payload.nodeUnit.label, this.state.lang) : '',
                            fontColor: 'black'
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: 'black',
                            // stepSize: 1000000
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
                enabled: false,
                custom: CustomTooltips,
                callbacks: {
                    label: function (tooltipItem, data) {
                        // // console.log("tooltipItem---", tooltipItem);
                        // // console.log("tooltipItem data---", data);
                        // if (tooltipItem.datasetIndex == 1) {
                        let label = data.labels[tooltipItem.index];
                        let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                        var cell1 = value
                        cell1 += '';
                        var x = cell1.split('.');
                        var x1 = x[0];
                        var x2 = x.length > 1 ? '.' + x[1] : '';
                        var x3 = x.length > 1 ? parseFloat(x1 + x2).toFixed(2) : x1 + x2;
                        var rgx = /(\d+)(\d{3})/;
                        // while (rgx.test(x1)) {
                        //     x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        // }
                        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + addCommas(x3);
                        // } else {
                        // let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        // return data.datasets[tooltipItem.datasetIndex].label + ' : ' + value + " %";
                        // }
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

        let bar = {}
        var momList = this.state.momList == undefined ? [] : this.state.momList;
        if (momList.length > 0) {
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
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
                    showInLegend: false,
                    data: this.state.momList.map((item, index) => (item.endValue > 0 ? item.endValue : null))
                }
            )

            bar = {
                labels: [...new Set(this.state.momList.map(ele => ("Month " + ele.month)))],
                datasets: datasetsArr

            };
        }


        var chartOptions1 = {
            title: {
                display: true,
                text: this.state.showMomDataPercent ? getLabelText(this.state.treeTemplate.label, this.state.lang) + " - " + getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) : ""
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: this.state.currentItemConfig.context.payload.nodeType.id > 2 ?
                                // this.state.currentItemConfig.context.payload.nodeUnit.id != "" ?
                                this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.unit.id != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.unit.id != null ? getLabelText(this.state.unitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.unit.id)[0].label, this.state.lang) : ""
                                    : this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.unit.id != "" ? getLabelText(this.state.unitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.unit.id)[0].label, this.state.lang) : ""
                                        : this.state.currentItemConfig.context.payload.nodeUnit.id != "" ? getLabelText(this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label, this.state.lang)
                                            : ""
                                // : ""
                                : "",
                            // labelString: "",
                            fontColor: 'black'
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: 'black',
                            // stepSize: 100000,
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
                            labelString: "% of " + (this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level != 0 ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : ""),
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
                enabled: false,
                custom: CustomTooltips,
                callbacks: {
                    label: function (tooltipItem, data) {
                        // // console.log("tooltipItem---", tooltipItem);
                        // // console.log("tooltipItem data---", data);
                        if (tooltipItem.datasetIndex == 1) {
                            let label = data.labels[tooltipItem.index];
                            let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

                            var cell1 = value
                            cell1 += '';
                            var x = cell1.split('.');
                            var x1 = x[0];
                            var x2 = x.length > 1 ? '.' + x[1] : '';
                            var x3 = x.length > 1 ? parseFloat(x1 + x2).toFixed(2) : x1 + x2;
                            var rgx = /(\d+)(\d{3})/;
                            // while (rgx.test(x1)) {
                            //     x1 = x1.replace(rgx, '$1' + ',' + '$2');
                            // }
                            return data.datasets[tooltipItem.datasetIndex].label + ' : ' + addCommas(x3);
                        } else {
                            let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            return data.datasets[tooltipItem.datasetIndex].label + ' : ' + addCommas(parseFloat(value).toFixed(2)) + " %";
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
                    pointHoverBackgroundColor: 'transparent',
                    pointHoverBorderColor: 'transparent',
                    // pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 5,
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
                // pointHoverBackgroundColor: '#fff',
                pointHoverBackgroundColor: 'transparent',
                pointHoverBorderColor: 'transparent',
                // pointHoverBorderWidth: 2,
                // pointRadius: 1,
                pointHitRadius: 5,
                pointHoverBorderColor: grey,
                data: (this.state.momElPer).getJson(null, false).map((item, index) => (this.state.currentItemConfig.context.payload.nodeType.id > 3 ? this.state.momElPer.getValue(`I${parseInt(index) + 1}`, true).toString().replaceAll("\,", "") : this.state.momElPer.getValue(`G${parseInt(index) + 1}`, true).toString().replaceAll("\,", ""))),
            }
            )


            bar1 = {
                labels: [...new Set(this.state.momListPer.map(ele => ("Month " + ele.month)))],
                datasets: datasetsArr

            };
        }

        // console.log("Loader@@@@@@@@@@@", this.state.momJexcelLoader);

        return (
            <>
                <TabPane tabId="1">
                    <Formik
                        enableReinitialize={true}
                        // initialValues={initialValuesNodeData}
                        initialValues={{
                            nodeTitle: this.state.currentItemConfig.context.payload.label.label_en,
                            nodeTypeId: this.state.currentItemConfig.context.payload.nodeType.id,
                            nodeUnitId: this.state.currentItemConfig.context.payload.nodeUnit.id,
                            nodeValue: this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].calculatedDataValue : this.state.currentItemConfig.context.payload.nodeDataMap[0][0].dataValue,
                            percentageOfParent: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue,
                            forecastingUnitId: this.state.fuValues,
                            tempPlanningUnitId: this.state.tempPlanningUnitId
                        }}
                        validate={validateNodeData(validationSchemaNodeData)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            if (!this.state.isSubmitClicked) {
                                this.setState({ openAddNodeModal: false, isSubmitClicked: true }, () => {
                                    // console.log("all ok>>>");
                                    setTimeout(() => {
                                        // console.log("inside set timeout on submit")
                                        if (this.state.addNodeFlag) {
                                            this.onAddButtonClick(this.state.currentItemConfig)
                                        } else {
                                            this.updateNodeInfoInJson(this.state.currentItemConfig)
                                        }
                                        this.setState({
                                            cursorItem: 0,
                                            highlightItem: 0
                                        })
                                    }, 0);
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
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='nodeDataForm' autocomplete="off">
                                    <div className="row">

                                        {this.state.level0 &&
                                            <>
                                                <div>
                                                    <Popover placement="top" isOpen={this.state.popoverOpenParent} target="Popover2" trigger="hover" toggle={this.toggleParent}>
                                                        <PopoverBody>{i18n.t('static.tooltip.Parent')}</PopoverBody>
                                                    </Popover>
                                                </div>
                                                <FormGroup className="col-md-6">
                                                    <Label htmlFor="currencyId">Parent <i class="fa fa-info-circle icons pl-lg-2" id="Popover2" onClick={this.toggleParent} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                    {/* <Label htmlFor="currencyId">Parent</Label> */}
                                                    <Input type="text"
                                                        name="parent"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        value={this.state.currentItemConfig.context.level != 0
                                                            && this.state.addNodeFlag !== "true"
                                                            ? this.state.currentItemConfig.parentItem.payload.label.label_en
                                                            : this.state.currentItemConfig.parentItem.payload.label.label_en}
                                                    ></Input>
                                                </FormGroup>
                                            </>}
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenNodeTitle} target="Popover3" trigger="hover" toggle={this.toggleNodeTitle}>
                                                <PopoverBody>{i18n.t('static.tooltip.NodeTitle')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        {/* valid1---{!errors.nodeTitle && this.state.currentItemConfig.context.payload.label.label_en != ''}
                                        valid2---{!errors.nodeTitle}
                                        valid3---{this.state.currentItemConfig.context.payload.label.label_en != ''}
                                        invalid1---{touched.nodeTitle && !!errors.nodeTitle}
                                        invalid2---{touched.nodeTitle}
                                        invalid3---{!!errors.nodeTitle}
                                        feedback---{errors.nodeTitle} */}
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">Node Title<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover3" onClick={this.toggleNodeTitle} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                            <Popover placement="top" isOpen={this.state.popoverOpenNodeType} target="Popover4" trigger="hover" toggle={this.toggleNodeType}>
                                                <PopoverBody>{i18n.t('static.tooltip.NodeType')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <Input
                                            type="hidden"
                                            name="isValidError"
                                            id="isValidError"
                                            value={JSON.stringify(errors) != '{}'}
                                        />
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">Node Type<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover4" onClick={this.toggleNodeType} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                disabled={this.state.currentItemConfig.context.payload.nodeType.id > 3 && this.state.currentItemConfig.context.parent != null ? true : false}
                                                value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.parent != null ? this.state.currentItemConfig.parentItem.payload.nodeUnit.id : this.state.currentItemConfig.context.payload.nodeUnit.id}
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
                                        {/* {this.state.currentItemConfig.context.payload.nodeType.id != 1 && */}

                                        {/* <FormGroup className="col-md-6" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                            <Label htmlFor="currencyId">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span></Label>
                                            <div className="controls edit">
                                                <Picker
                                                    id="month"
                                                    name="month"
                                                    ref={this.pickAMonth1}
                                                    years={{ min: this.state.minDateValue, max: this.state.maxDate }}
                                                    value={{ year: new Date(((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).replace(/-/g, '\/')).getMonth() + 1)).slice(-2) }}
                                                    lang={pickerLang.months}
                                                    // theme="dark"
                                                    onChange={this.handleAMonthChange1}
                                                    onDismiss={this.handleAMonthDissmis1}
                                                >
                                                    <MonthBox value={this.makeText({ year: new Date(((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).replace(/-/g, '\/')).getMonth() + 1)).slice(-2) })}
                                                        onClick={this.handleClickMonthBox1} />
                                                </Picker>
                                            </div>
                                        </FormGroup> */}
                                        <FormGroup className="col-md-6" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                            <Label htmlFor="currencyId">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span></Label>
                                            <Input
                                                type="select"
                                                id="monthNo"
                                                name="monthNo"
                                                bsSize="sm"
                                                valid={!errors.monthNo && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo != ''}
                                                invalid={touched.monthNo && !!errors.monthNo}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                required
                                                value={this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo}
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {this.state.monthList.length > 0
                                                    && this.state.monthList.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.id}>
                                                                {item.name}
                                                            </option>
                                                        )
                                                    }, this)}
                                            </Input>
                                            <FormFeedback className="red">{errors.monthNo}</FormFeedback>
                                        </FormGroup>

                                        {/* // } */}

                                        {/* {(this.state.numberNode && this.state.currentItemConfig.context.payload.nodeType.id != 1) && */}
                                        {/* <> */}
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenPercentageOfParent} target="Popover5" trigger="hover" toggle={this.togglePercentageOfParent}>
                                                <PopoverBody>{i18n.t('static.tooltip.PercentageOfParent')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-6" style={{ display: this.state.numberNode ? 'block' : 'none' }}>
                                            <Label htmlFor="currencyId">Percentage of Parent<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover5" onClick={this.togglePercentageOfParent} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            <InputGroup>
                                                <Input type="number"
                                                    id="percentageOfParent"
                                                    name="percentageOfParent"
                                                    bsSize="sm"
                                                    valid={!errors.percentageOfParent && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue != ''}
                                                    invalid={touched.percentageOfParent && !!errors.percentageOfParent}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                    step={.01}
                                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue}></Input>
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText><i class="fa fa-percent icons" data-toggle="collapse" aria-expanded="false"></i></InputGroupText>
                                                </InputGroupAddon>
                                                <FormFeedback className="red">{errors.percentageOfParent}</FormFeedback>
                                            </InputGroup>
                                        </FormGroup>
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenParentValue} target="Popover6" trigger="hover" toggle={this.toggleParentValue}>
                                                <PopoverBody>{i18n.t('static.tooltip.ParentValue')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-6" style={{ display: this.state.numberNode ? 'block' : 'none' }}>
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.parentValue')} {this.state.currentItemConfig.context.level != 0 && i18n.t('static.common.for')}{" Month "} {this.state.currentItemConfig.context.level != 0 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo} <i class="fa fa-info-circle icons pl-lg-2" id="Popover6" onClick={this.toggleParentValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            <Input type="text"
                                                id="parentValue"
                                                name="parentValue"
                                                bsSize="sm"
                                                readOnly={true}
                                                onChange={(e) => { this.dataChange(e) }}
                                                value={addCommas(this.state.parentValue).toString()}
                                            ></Input>
                                        </FormGroup>
                                        {/* </> */}
                                        {/* } */}
                                        {/* {(this.state.aggregationNode && this.state.currentItemConfig.context.payload.nodeType.id != 1) && */}
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenNodeValue} target="Popover7" trigger="hover" toggle={this.toggleNodeValue}>
                                                <PopoverBody>{this.state.numberNode ? i18n.t('static.tooltip.NodeValue') : i18n.t('static.tooltip.NumberNodeValue')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-6" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                            <Label htmlFor="currencyId">Node Value<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover7" onClick={this.toggleNodeValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            <Input type="text"
                                                id="nodeValue"
                                                name="nodeValue"
                                                bsSize="sm"
                                                valid={!errors.nodeValue && (this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2) ? addCommas(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].calculatedDataValue) : addCommas(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].dataValue) != ''}
                                                invalid={touched.nodeValue && !!errors.nodeValue}
                                                onBlur={handleBlur}
                                                readOnly={this.state.numberNode ? true : false}
                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                // step={.01}
                                                // value={this.getNodeValue(this.state.currentItemConfig.context.payload.nodeType.id)}
                                                value={(this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2) ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue == 0 ? "0" : addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue) : addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue.toString())}
                                            ></Input>
                                            <FormFeedback className="red">{errors.nodeValue}</FormFeedback>
                                        </FormGroup>
                                        {/* // } */}

                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.common.note')}</Label>
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
                                    <div>
                                        <div className="row">
                                            {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                                <>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenTypeOfUsePU} target="Popover8" trigger="hover" toggle={this.toggleTypeOfUsePU}>
                                                            <PopoverBody>{i18n.t('static.tooltip.TypeOfUsePU')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">{i18n.t('static.common.typeofuse')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover8" onClick={this.toggleTypeOfUsePU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>

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
                                                        <Label htmlFor="currencyId">Forecasting unit</Label>

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
                                                        <Label htmlFor="currencyId">{(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "# of FU / month / " : "# of FU / usage / "}{this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en}</Label>

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
                                                    </FormGroup></>}
                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.product.product')}<span class="red Reqasterisk">*</span></Label>

                                            </FormGroup>
                                            <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                <Input type="select"
                                                    id="planningUnitId"
                                                    name="planningUnitId"
                                                    bsSize="sm"
                                                    valid={!errors.planningUnitId && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id != '' : !errors.planningUnitId}
                                                    invalid={touched.planningUnitId && !!errors.planningUnitId}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 5 ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id : ""}>

                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {this.state.planningUnitList.length > 0
                                                        && this.state.planningUnitList.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.planningUnitId}>
                                                                    {getLabelText(item.label, this.state.lang) + " | " + item.planningUnitId}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                                <FormFeedback className="red">{errors.planningUnitId}</FormFeedback>
                                            </FormGroup>
                                            {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                                <>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenConversionFactorFUPU} target="Popover9" trigger="hover" toggle={this.toggleConversionFactorFUPU}>
                                                            <PopoverBody>{i18n.t('static.tooltip.Conversionfactor')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">Conversion Factor (FU:PU) <i class="fa fa-info-circle icons pl-lg-2" id="Popover9" onClick={this.toggleConversionFactorFUPU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenNoOfPUUsage} target="Popover11" trigger="hover" toggle={this.toggleNoOfPUUsage}>
                                                            <PopoverBody>{i18n.t('static.tooltip.NoOfPUUsage')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">{(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "# of PU / month / " : "# of PU / usage / "}{this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en} <i class="fa fa-info-circle icons pl-lg-2" id="Popover11" onClick={this.toggleNoOfPUUsage} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5">
                                                        <Input type="text"
                                                            id="noOfPUUsage"
                                                            name="noOfPUUsage"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={addCommas((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? this.round(((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / this.state.conversionFactor) : this.round(this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor))}>

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
                                                            <div>
                                                                <Popover placement="top" isOpen={this.state.popoverOpenQATEstimateForInterval} target="Popover12" trigger="hover" toggle={this.toggleQATEstimateForInterval}>
                                                                    <PopoverBody>{i18n.t('static.tooltip.QATEstimateForInterval')}</PopoverBody>
                                                                </Popover>
                                                            </div>
                                                            <FormGroup className="col-md-2">
                                                                <Label htmlFor="currencyId">{i18n.t('static.tree.QATEstimateForIntervalEvery_months')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover12" onClick={this.toggleQATEstimateForInterval} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-10">
                                                                <Input type="text"
                                                                    id="interval"
                                                                    name="interval"
                                                                    bsSize="sm"
                                                                    readOnly={true}
                                                                    value={addCommas(this.round(this.state.conversionFactor / ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)))}>
                                                                    {/* value={addCommas(this.state.currentItemConfig.context.payload.nodeType.id == 5 && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths : "")}> */}

                                                                </Input>
                                                            </FormGroup></>}
                                                </>}
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenConsumptionIntervalEveryXMonths} target="Popover13" trigger="hover" toggle={this.toggleConsumptionIntervalEveryXMonths}>
                                                    <PopoverBody>{i18n.t('static.tooltip.ConsumptionIntervalEveryXMonths')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.consumptionIntervalEveryXMonths')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover13" onClick={this.toggleConsumptionIntervalEveryXMonths} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            </FormGroup>
                                            <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                <Input type="number"
                                                    id="refillMonths"
                                                    name="refillMonths"
                                                    valid={!errors.refillMonths && this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths != '' : !errors.refillMonths}
                                                    invalid={touched.refillMonths && !!errors.refillMonths}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    bsSize="sm"
                                                    value={addCommas(this.state.currentItemConfig.context.payload.nodeType.id == 5 && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths : "")}>

                                                </Input>
                                                <FormFeedback className="red">{errors.refillMonths}</FormFeedback>
                                            </FormGroup>
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenWillClientsShareOnePU} target="Popover14" trigger="hover" toggle={this.toggleWillClientsShareOnePU}>
                                                    <PopoverBody>{i18n.t('static.tooltip.willClientsShareOnePU')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.willClientsShareOnePU?')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover14" onClick={this.toggleWillClientsShareOnePU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            </FormGroup>
                                            <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1 ? 'block' : 'none' }}>
                                                <Input type="select"
                                                    id="sharePlanningUnit"
                                                    name="sharePlanningUnit"
                                                    bsSize="sm"
                                                    valid={!errors.sharePlanningUnit && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit != '' : !errors.sharePlanningUnit}
                                                    invalid={touched.sharePlanningUnit && !!errors.sharePlanningUnit}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 5 ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit : ""}>

                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>

                                                </Input>
                                                <FormFeedback className="red">{errors.sharePlanningUnit}</FormFeedback>
                                            </FormGroup>
                                            {/* {(this.state.currentItemConfig.context.payload.nodeType.id == 5) && */}
                                            {/* <> */}
                                            {this.state.currentItemConfig.context.payload.nodeType.id == 5 && <>
                                                <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                    <Label htmlFor="currencyId">{this.state.currentItemConfig.parentItem != null && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode != null && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "QAT Calculated PU per interval per " : "QAT Calculated PU per usage per "}{this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.parent != null && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id).length > 0 && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}?</Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                    <Input type="number"
                                                        id="puPerVisitQATCalculated"
                                                        name="puPerVisitQATCalculated"
                                                        readOnly={true}
                                                        bsSize="sm"
                                                        value={this.state.qatCalculatedPUPerVisit}>
                                                        {/* value={this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode != null ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == "false" || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == false) ? */}
                                                        {/* addCommas(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit) : */}
                                                        {/* addCommas(this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor) : ''}> */}
                                                    </Input>
                                                </FormGroup></>}

                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{this.state.currentItemConfig.parentItem != null && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode != null && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "How many PU per interval per " : "How many PU per usage per "}{this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.parent != null && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id).length > 0 && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}?</Label>
                                            </FormGroup>
                                            <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                <Input type="number"
                                                    id="puPerVisit"
                                                    name="puPerVisit"
                                                    readOnly={this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode != null && (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == "false" || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == false || this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) ? false : true}
                                                    bsSize="sm"
                                                    valid={!errors.puPerVisit && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit != '' : !errors.puPerVisit}
                                                    invalid={touched.puPerVisit && !!errors.puPerVisit}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    value={this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode != null ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == "false" || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == false) ?
                                                        addCommas(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit) :
                                                        addCommas(this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor) : ''}>

                                                </Input>
                                                <FormFeedback className="red">{errors.puPerVisit}</FormFeedback>
                                            </FormGroup>
                                            {/* </>} */}
                                        </div>
                                        {/* <div className="col-md-12 pt-2 pl-2"><b>{this.state.usageText}</b></div> */}
                                    </div>
                                    {/* Plannign unit end */}
                                    <div>
                                        <div className="row">
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpentracercategoryModelingType} target="Popover15" trigger="hover" toggle={this.toggletracercategoryModelingType}>
                                                    <PopoverBody>{i18n.t('static.tooltip.tracercategoryModelingType')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tracercategory.tracercategory')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover15" onClick={this.toggletracercategoryModelingType} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <Input
                                                    type="select"
                                                    id="tracerCategoryId"
                                                    name="tracerCategoryId"
                                                    bsSize="sm"
                                                    // valid={!errors.tracerCategoryId && this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.tracerCategory.id != '' : !errors.tracerCategoryId}
                                                    // invalid={touched.tracerCategoryId && !!errors.tracerCategoryId}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        this.dataChange(e); this.getForecastingUnitListByTracerCategoryId(0, 0)
                                                    }}
                                                    required
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.tracerCategory.id : ""}
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
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenCopyFromTemplate} target="Popover16" trigger="hover" toggle={this.toggleCopyFromTemplate}>
                                                    <PopoverBody>{i18n.t('static.tooltip.CopyFromTemplate')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.copyFromTemplate')}  <i class="fa fa-info-circle icons pl-lg-2" id="Popover16" onClick={this.toggleCopyFromTemplate} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <Input
                                                    type="select"
                                                    name="usageTemplateId"
                                                    id="usageTemplateId"
                                                    bsSize="sm"
                                                    // valid={!errors.usageTemplateId && this.state.usageTemplateId != ''}
                                                    // invalid={touched.usageTemplateId && !!errors.usageTemplateId}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { this.dataChange(e); this.copyDataFromUsageTemplate(e) }}
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
                                            <Input
                                                type="hidden"
                                                name="showFUValidation"
                                                id="showFUValidation"
                                                value={this.state.showFUValidation}
                                            />
                                            <Input
                                                type="hidden"
                                                name="needFUValidation"
                                                id="needFUValidation"
                                                value={(this.state.currentItemConfig.context.payload.nodeType.id != 4 ? false : true)}
                                            />
                                            <FormGroup className="col-md-12" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.product.unit1')}<span class="red Reqasterisk">*</span></Label>
                                                <div className="controls ">
                                                    {/* <InMultiputGroup> */}
                                                    <Select
                                                        // className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                        //     { 'is-valid': !errors.forecastingUnitId },
                                                        //     { 'is-invalid': (touched.forecastingUnitId && !!errors.forecastingUnitId) }
                                                        // )}
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.forecastingUnitId && this.state.fuValues != '' },
                                                            { 'is-invalid': (touched.forecastingUnitId && !!errors.forecastingUnitId && (this.state.currentItemConfig.context.payload.nodeType.id != 4 ? false : true) || !!errors.forecastingUnitId) }
                                                        )}
                                                        id="forecastingUnitId"
                                                        name="forecastingUnitId"
                                                        bsSize="sm"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("forecastingUnitId", e);
                                                            this.handleFUChange(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("forecastingUnitId", true)}
                                                        // multi
                                                        options={this.state.forecastingUnitMultiList}
                                                        value={this.state.fuValues}
                                                    />
                                                    <FormFeedback>{errors.forecastingUnitId}</FormFeedback>
                                                </div><br />
                                                {/* <div className="controls fuNodeAutocomplete"
                                                >
                                                    <Autocomplete
                                                        id="forecastingUnitId"
                                                        name="forecastingUnitId"
                                                        // value={[{ value: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.id : "", label: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.label.label_en : "" }]}
                                                        defaultValue={{ value: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.id : "", label: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.label.label_en : "" }}
                                                        options={this.state.autocompleteData}
                                                        getOptionLabel={(option) => option.label}
                                                        // style={{ width: 1000 }}
                                                        onChange={(event, value) => {
                                                            // console.log("combo 2 ro combo box---", value);
                                                            // // console.log("combo 2 ro combo box---", event.target.value);
                                                            // if(){
                                                            this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.id = value.value;
                                                            if (value != null) {
                                                                this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.label.label_en = value.label;
                                                            }
                                                            // console.log("autocomplete data---", this.state.currentItemConfig)
                                                            this.getForecastingUnitUnitByFUId(value.value);

                                                        }} // prints the selected value
                                                        renderInput={(params) => <TextField {...params} variant="outlined"
                                                            onChange={(e) => {
                                                                // this.searchErpOrderData(e.target.value)
                                                            }} />}
                                                    />

                                                </div> */}
                                            </FormGroup>
                                            <Input type="hidden"
                                                id="planningUnitIdFUFlag"
                                                name="planningUnitIdFUFlag"
                                                value={this.state.addNodeFlag}
                                            />
                                            {/* --2--{this.state.addNodeFlag} */}
                                            <FormGroup className="col-md-12" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && (this.state.addNodeFlag == true || this.state.currentItemConfig.context.newTemplateFlag == 0) ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.product.product')}<span class="red Reqasterisk">*</span></Label>
                                                <div className="controls ">
                                                    {/* <InMultiputGroup> */}
                                                    <Input type="select"
                                                        id="planningUnitIdFU"
                                                        name="planningUnitIdFU"
                                                        bsSize="sm"
                                                        valid={!errors.planningUnitIdFU}
                                                        invalid={touched.planningUnitIdFU && !!errors.planningUnitIdFU}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        value={this.state.tempPlanningUnitId}
                                                    >

                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {this.state.planningUnitList.length > 0
                                                            && this.state.planningUnitList.map((item, i) => {
                                                                return (
                                                                    <option key={i} value={item.planningUnitId}>
                                                                        {getLabelText(item.label, this.state.lang) + " | " + item.planningUnitId}
                                                                    </option>
                                                                )
                                                            }, this)}
                                                    </Input>
                                                    <FormFeedback>{errors.planningUnitIdFU}</FormFeedback>
                                                </div><br />
                                            </FormGroup>
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenTypeOfUse} target="Popover17" trigger="hover" toggle={this.toggleTypeOfUse}>
                                                    <PopoverBody>{i18n.t('static.tooltip.TypeOfUse')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.common.typeofuse')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover17" onClick={this.toggleTypeOfUse} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <Input
                                                    type="select"
                                                    id="usageTypeIdFU"
                                                    name="usageTypeIdFU"
                                                    bsSize="sm"
                                                    valid={!errors.usageTypeIdFU && this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id != '' : !errors.usageTypeIdFU}
                                                    invalid={touched.usageTypeIdFU && !!errors.usageTypeIdFU}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    required
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id : ""}
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
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenLagInMonth} target="Popover18" trigger="hover" toggle={this.toggleLagInMonth}>
                                                    <PopoverBody>{i18n.t('static.tooltip.LagInMonthFUNode')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.lagInMonth0Immediate')}<span class="red Reqasterisk">*</span>  <i class="fa fa-info-circle icons pl-lg-2" id="Popover18" onClick={this.toggleLagInMonth} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <Input type="number"
                                                    id="lagInMonths"
                                                    name="lagInMonths"
                                                    bsSize="sm"
                                                    valid={!errors.lagInMonths && this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.lagInMonths != '' : !errors.lagInMonths}
                                                    invalid={touched.lagInMonths && !!errors.lagInMonths}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.lagInMonths : ""}
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
                                                    valid={!errors.noOfPersons && this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfPersons != '' : !errors.noOfPersons}
                                                    invalid={touched.noOfPersons && !!errors.noOfPersons}
                                                    onBlur={handleBlur}
                                                    readOnly={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? true : false}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    value={addCommas(this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfPersons : "")}>

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
                                                    {this.state.nodeUnitListPlural.length > 0
                                                        && this.state.nodeUnitListPlural.map((item, i) => {
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
                                                    valid={!errors.forecastingUnitPerPersonsFC && this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson != '' : !errors.forecastingUnitPerPersonsFC}
                                                    invalid={touched.forecastingUnitPerPersonsFC && !!errors.forecastingUnitPerPersonsFC}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    value={addCommas(this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson : "")}>

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
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.unit.id : ""}>

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
                                            {/* {(this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1) && */}
                                            <>
                                                <div>
                                                    <Popover placement="top" isOpen={this.state.popoverOpenSingleUse} target="Popover19" trigger="hover" toggle={this.toggleSingleUse}>
                                                        <PopoverBody>{i18n.t('static.tooltip.SingleUse')}</PopoverBody>
                                                    </Popover>
                                                </div>
                                                <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 ? 'block' : 'none' }}>
                                                    <Label htmlFor="currencyId">{i18n.t('static.tree.singleUse')}<span class="red Reqasterisk">*</span>  <i class="fa fa-info-circle icons pl-lg-2" id="Popover19" onClick={this.toggleSingleUse} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 ? 'block' : 'none' }}>
                                                    <Input type="select"
                                                        id="oneTimeUsage"
                                                        name="oneTimeUsage"
                                                        bsSize="sm"
                                                        valid={!errors.oneTimeUsage && this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != '' : !errors.oneTimeUsage}
                                                        invalid={touched.oneTimeUsage && !!errors.oneTimeUsage}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            this.dataChange(e)
                                                        }}
                                                        value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage : ""}>

                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        <option value="true">{i18n.t('static.realm.yes')}</option>
                                                        <option value="false">{i18n.t('static.program.no')}</option>

                                                    </Input>
                                                    <FormFeedback className="red">{errors.oneTimeUsage}</FormFeedback>
                                                </FormGroup>
                                                {/* <FormGroup className="col-md-5"></FormGroup> */}
                                                {/* {this.state.currentScenario.fuNode.oneTimeUsage != "true" && */}
                                                <>
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != true ? 'block' : 'none' }}></FormGroup>
                                                    <FormGroup className="col-md-4" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input type="text"
                                                            id="usageFrequencyDis"
                                                            name="usageFrequencyDis"
                                                            bsSize="sm"
                                                            valid={!errors.usageFrequencyDis && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageFrequency != "" : false)}
                                                            invalid={touched.usageFrequencyDis && !!errors.usageFrequencyDis}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                this.dataChange(e)
                                                            }}
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" ? addCommas(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageFrequency) : ""}></Input>
                                                        <FormFeedback className="red">{errors.usageFrequencyDis}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input type="text"
                                                            name="timesPer"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={i18n.t('static.tree.timesPer')}></Input>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-4" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input
                                                            type="select"
                                                            id="usagePeriodIdDis"
                                                            name="usagePeriodIdDis"
                                                            bsSize="sm"
                                                            valid={!errors.usagePeriodIdDis && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId != "" : false)}
                                                            invalid={touched.usagePeriodIdDis && !!errors.usagePeriodIdDis}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                this.dataChange(e)
                                                            }}
                                                            required
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != true ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId : ""}
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
                                                        <FormFeedback className="red">{errors.usagePeriodIdDis}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Label htmlFor="currencyId">for<span class="red Reqasterisk">*</span></Label>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input type="text"
                                                            id="repeatCount"
                                                            name="repeatCount"
                                                            bsSize="sm"
                                                            valid={!errors.repeatCount && this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.repeatCount != '' : !errors.repeatCount}
                                                            invalid={touched.repeatCount && !!errors.repeatCount}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                this.dataChange(e)
                                                            }}
                                                            value={addCommas(this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.repeatCount : "")}>
                                                        </Input>
                                                        <FormFeedback className="red">{errors.repeatCount}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input type="select"
                                                            id="repeatUsagePeriodId"
                                                            name="repeatUsagePeriodId"
                                                            bsSize="sm"
                                                            valid={!errors.repeatUsagePeriodId && this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage == "false" || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage == false) ? (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.repeatUsagePeriod != '' && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.repeatUsagePeriod != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.repeatUsagePeriod.usagePeriodId != undefined && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.repeatUsagePeriod.usagePeriodId != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.repeatUsagePeriod.usagePeriodId != '') : !errors.repeatUsagePeriodId}
                                                            invalid={touched.repeatUsagePeriodId && !!errors.repeatUsagePeriodId}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                this.dataChange(e)
                                                            }}
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.repeatUsagePeriod != null ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.repeatUsagePeriod.usagePeriodId : ''}>

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
                                                        <FormFeedback className="red">{errors.repeatUsagePeriodId}</FormFeedback>
                                                    </FormGroup></>

                                                {/* // } */}
                                            </>
                                            {/* // } */}



                                            {/* {(this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2) && */}
                                            <>

                                                <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                    <Label htmlFor="currencyId">{i18n.t('static.usageTemplate.every')}<span class="red Reqasterisk">*</span></Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                    <Input type="text"
                                                        id="usageFrequencyCon"
                                                        name="usageFrequencyCon"
                                                        bsSize="sm"
                                                        valid={!errors.usageFrequencyCon && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageFrequency != "" : false)}
                                                        invalid={touched.usageFrequencyCon && !!errors.usageFrequencyCon}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            this.dataChange(e)
                                                        }}
                                                        value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageFrequency : ""}></Input>
                                                    <FormFeedback className="red">{errors.usageFrequencyCon}</FormFeedback>
                                                    {/* <FormFeedback className="red">{errors.usageFrequency}</FormFeedback> */}
                                                </FormGroup>
                                                <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                    <Input
                                                        type="select"
                                                        id="usagePeriodIdCon"
                                                        name="usagePeriodIdCon"
                                                        bsSize="sm"
                                                        valid={!errors.usagePeriodIdCon && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId != "" : false)}
                                                        invalid={touched.usagePeriodIdCon && !!errors.usagePeriodIdCon}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            this.dataChange(e)
                                                        }}
                                                        required
                                                        value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId : ""}
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
                                                    <FormFeedback className="red">{errors.usagePeriodIdCon}</FormFeedback>
                                                    {/* <FormFeedback className="red">{errors.usagePeriodId}</FormFeedback> */}
                                                </FormGroup>
                                            </>

                                            {/* } */}

                                            <div className="pl-lg-3 pr-lg-3" style={{ clear: 'both', width: '100%' }}>
                                                {(this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2) &&
                                                    <table className="table table-bordered">
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfFURequiredForPeriod')}</td>
                                                            <td style={{ width: '50%' }}>{addCommas(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfMonthsInPeriod')}</td>
                                                            <td style={{ width: '50%' }}>{addCommas(this.state.noOfMonthsInUsagePeriod)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfFU/month/')}
                                                                {this.state.currentItemConfig.context.parent != null && this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en}
                                                                {this.state.currentItemConfig.context.parent == null && this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id).length > 0 && this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en}
                                                            </td>
                                                            {this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.hasOwnProperty('usagePeriodId') &&
                                                                <td style={{ width: '50%' }}>{addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageFrequency) * (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.hasOwnProperty('usagePeriodId')
                                                                    && this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId))[0].convertToMonth)}</td>}
                                                            {this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId == "" &&
                                                                <td style={{ width: '50%' }}></td>}
                                                            {/* <td>{addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageFrequency) * (this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId))[0].convertToMonth)}</td> */}
                                                        </tr>
                                                    </table>}
                                                {(this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1) &&
                                                    <table className="table table-bordered">
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfFU/')} {this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en}{"/ Time"}</td>
                                                            <td style={{ width: '50%' }}>{addCommas(this.state.noOfFUPatient)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfFU/month/')} {this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en}</td>
                                                            <td style={{ width: '50%' }}>{addCommas(this.state.noOfMonthsInUsagePeriod)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfFURequiredForPeriod')}</td>
                                                            <td style={{ width: '50%' }}>{addCommas(this.state.noFURequired)}</td>
                                                        </tr>
                                                    </table>}
                                            </div>

                                        </div>
                                    </div>

                                    {/* } */}
                                    {(this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                        <div className="col-md-12 pt-2 pl-2 pb-lg-3"><b>{this.state.usageText}</b></div>
                                    }
                                    {/* disabled={!isValid} */}
                                    <FormGroup className="pb-lg-3">
                                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddNodeModal: false, cursorItem: 0, highlightItem: 0, isChanged: false, activeTab1: new Array(2).fill('1') })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') && <><Button type="button" size="md" color="warning" className="float-right mr-1" onClick={() => this.resetNodeData()} ><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAllNodeData(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button></>}
                                    </FormGroup>
                                </Form>
                            )} />
                </TabPane>
                <TabPane tabId="2">
                    {/* <div className="row pl-lg-5 pb-lg-3 pt-lg-0">
                        <div className="offset-md-10 col-md-6 pl-lg-4 ">
                            <SupplyPlanFormulas ref="formulaeChild" />
                            <a className="">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleShowTermLogic() }}><i className="" style={{ color: '#20a8d8' }}></i> <small className="supplyplanformulas">{'Show terms and logic'}</small></span>

                            </a>
                        </div>
                    </div> */}
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
                        <div style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 1 ? "none" : "block" }}>
                            <div className="row pl-lg-2 pr-lg-2">
                                <div>
                                    <Popover placement="top" isOpen={this.state.popoverOpenMonth} target="Popover21" trigger="hover" toggle={this.toggleMonth}>
                                        <PopoverBody>{i18n.t('static.tooltip.ModelingTransferMonth')}</PopoverBody>
                                    </Popover>
                                </div>
                                <FormGroup className="col-md-2 pt-lg-1">
                                    <Label htmlFor="">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover21" onClick={this.toggleMonth} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                </FormGroup>
                                <FormGroup className="col-md-8 pl-lg-0 ModTransferMonthPickerWidth">
                                    <Input
                                        type="select"
                                        id="monthNoFilter"
                                        name="monthNoFilter"
                                        bsSize="sm"
                                        onChange={(e) => { this.dataChange(e) }}
                                        required
                                        value={this.state.scalingMonth}
                                    >
                                        <option value="">{i18n.t('static.common.select')}</option>
                                        {this.state.monthList.length > 0
                                            && this.state.monthList.map((item, i) => {
                                                return (
                                                    <option key={i} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                )
                                            }, this)}
                                    </Input>
                                </FormGroup>
                            </div>
                        </div>
                        <div className="col-md-12">
                            {this.state.showModelingJexcelNumber &&
                                <div style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 1 ? "none" : "block" }}>
                                    <span>{i18n.t('static.modelingTable.note')}</span>
                                    <div className="calculatorimg calculatorTable">
                                        <div id="modelingJexcel" className={"RowClickable ScalingTable"} style={{ display: this.state.modelingJexcelLoader ? "none" : "block" }}>
                                        </div>
                                        <div style={{ display: this.state.modelingJexcelLoader ? "block" : "none" }}>
                                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                <div class="align-items-center">
                                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                                    <div class="spinner-border blue ml-4" role="status">

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ 'float': 'right', 'fontSize': '18px' }}><b>{i18n.t('static.supplyPlan.total')}: {this.state.scalingTotal !== "" && addCommas(parseFloat(this.state.scalingTotal).toFixed(4))}</b></div><br /><br />

                                </div>
                            }
                            <div>{this.state.currentItemConfig.context.payload.nodeType.id != 1 && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.showMomData()}> <i className={this.state.viewMonthlyData ? "fa fa-eye" : "fa fa-eye-slash"} style={{ color: '#fff' }}></i> {this.state.viewMonthlyData ? i18n.t('static.tree.viewMonthlyData') : i18n.t('static.tree.hideMonthlyData')}</Button>}
                                {this.state.aggregationNode && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') && <><Button color="success" size="md" className="float-right mr-1" type="button" onClick={(e) => this.formSubmitLoader(e)}> <i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button></>}
                            </div>
                        </div>


                        {this.state.showCalculatorFields &&
                            <div className="col-md-12 pl-lg-0 pr-lg-0">
                                <fieldset className="scheduler-border">
                                    <legend className="scheduler-border">{i18n.t('static.tree.modelingCalculaterTool')}</legend>
                                    <div className="row">
                                        {/* <div className="row"> */}
                                        {/* <FormGroup className="col-md-12 pt-lg-1">
                                    <Label htmlFor=""><b>Modeling Calculater Tool</b></Label>
                                </FormGroup> */}
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.common.startdate')}<span class="red Reqasterisk">*</span></Label>
                                            <Input
                                                type="select"
                                                id="calculatorStartDate"
                                                name="calculatorStartDate"
                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                required
                                                value={this.state.currentCalculatorStartDate}
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {this.state.monthList.length > 0
                                                    && this.state.monthList.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.id}>
                                                                {item.name}
                                                            </option>
                                                        )
                                                    }, this)}
                                            </Input>
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.targetDate')}<span class="red Reqasterisk">*</span></Label>
                                            <Input
                                                type="select"
                                                id="calculatorTargetDate"
                                                name="calculatorTargetDate"
                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e) }}
                                                required
                                                value={this.state.currentCalculatorStopDate}
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {this.state.monthList.length > 0
                                                    && this.state.monthList.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.id}>
                                                                {item.name}
                                                            </option>
                                                        )
                                                    }, this)}
                                            </Input>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        {this.state.currentItemConfig.context.payload.nodeType.id <= 2 && <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.startValue')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="startValue"
                                                name="startValue"
                                                bsSize="sm"
                                                readOnly={true}
                                                value={addCommas(this.state.currentCalculatorStartValue)}

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
                                                value={this.state.currentCalculatorStartValue}

                                            >
                                            </Input>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        }
                                        {/* </div> */}
                                        {/* <div className="row"> */}
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenTargetEndingValue} target="Popover22" trigger="hover" toggle={this.toggleTargetEndingValue}>
                                                <PopoverBody>{i18n.t('static.tooltip.TargetEndingValue')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-5">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.targetEnding')} {this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'value' : '%'}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover22" onClick={this.toggleTargetEndingValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenTargetChangePercent} target="Popover23" trigger="hover" toggle={this.toggleTargetChangePercent}>
                                                <PopoverBody>{i18n.t('static.tooltip.TargetChangePercent')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <input type="hidden" id="percentForOneMonth" name="percentForOneMonth" value={this.state.percentForOneMonth} />
                                        <FormGroup className="col-md-5">
                                            <Label htmlFor="currencyId">{this.state.currentItemConfig.context.payload.nodeType.id > 2 ? 'Change (% points)' : 'Target change (%)'}<span class="red Reqasterisk">*</span>  <i class="fa fa-info-circle icons pl-lg-2" id="Popover23" onClick={this.toggleTargetChangePercent} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            <Input type="number"
                                                id="currentTargetChangePercentage"
                                                name="currentTargetChangePercentage"
                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e); this.calculateMomByChangeInPercent(e) }}
                                                value={addCommas(this.state.currentTargetChangePercentage)}
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
                                        {/* <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenTargetChangeHash} target="Popover24" trigger="hover" toggle={this.toggleTargetChangeHash}>
                                                <PopoverBody>{i18n.t('static.tooltip.TargetChangeHash')}</PopoverBody>
                                            </Popover>
                                        </div> */}
                                        {this.state.currentModelingType != 3 && this.state.currentModelingType != 4 && this.state.currentModelingType != 5 && <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.Change(#)')}<span class="red Reqasterisk">*</span> </Label>
                                            {/* <Label htmlFor="currencyId">{i18n.t('static.tree.Change(#)')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover24" onClick={this.toggleTargetChangeHash} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label> */}
                                            <Input type="text"
                                                id="currentTargetChangeNumber"
                                                name="currentTargetChangeNumber"
                                                bsSize="sm"
                                                onChange={(e) => { this.dataChange(e); this.calculateMomByChangeInNumber(e) }}
                                                value={addCommas(this.state.currentTargetChangeNumber)}
                                                readOnly={this.state.currentTargetChangeNumberEdit}
                                            >
                                            </Input>
                                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                                        </FormGroup>
                                        }
                                    </div>
                                    <div className="row col-md-12 pl-lg-0">
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenCalculatedMonthOnMonthChnage} target="Popover25" trigger="hover" toggle={this.toggleCalculatedMonthOnMonthChnage}>
                                                <PopoverBody>{i18n.t('static.tooltip.CalculatedMonthOnMonthChnage')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.CalculatedMonth-on-MonthChange')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover25" onClick={this.toggleCalculatedMonthOnMonthChnage} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            <Input type="text"
                                                id="calculatedMomChange"
                                                name="calculatedMomChange"
                                                bsSize="sm"
                                                readOnly={true}
                                                value={addCommas(this.state.currentCalculatedMomChange)}>
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
                                                <div style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="checkbox"
                                                        id="manualChange"
                                                        name="manualChange"
                                                        // checked={true}
                                                        checked={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].manualChangesEffectFuture}
                                                        onClick={(e) => { this.momCheckbox(e, 1); }}
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
                                <div className="col-md-12 pl-lg-0 pr-lg-0 modelingTransferTable" style={{ display: 'inline-block' }}>
                                    <div id="momJexcel" className="RowClickable" style={{ display: this.state.momJexcelLoader ? "none" : "block" }}>
                                    </div>
                                </div>
                                <div style={{ display: this.state.momJexcelLoader ? "block" : "none" }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                        <div class="align-items-center">
                                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                            <div class="spinner-border blue ml-4" role="status">

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-12 pr-lg-0">
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => {
                                        this.setState({ showMomData: false })
                                    }}><i className="fa fa-times"></i> {'Close'}</Button>
                                    {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') && this.state.currentItemConfig.context.payload.nodeType.id != 1 && <Button type="button" size="md" color="success" className="float-right mr-1" onClick={(e) => this.updateMomDataInDataSet(e)}><i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>}

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
                                                        checked={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].manualChangesEffectFuture}
                                                        onClick={(e) => { this.momCheckbox(e, 2); }}
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
                                <div className="pt-lg-2 pl-lg-0"><i>{i18n.t('static.tree.tableDisplays')} <b>{
                                    this.state.currentItemConfig.context.payload.nodeType.id > 2 ?
                                        this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.unit.id != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.unit.id != "" ? getLabelText(this.state.unitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.unit.id)[0].label, this.state.lang) : ""
                                            : this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.unit.id != "" ? getLabelText(this.state.unitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.unit.id)[0].label, this.state.lang) : ""
                                                : this.state.currentItemConfig.context.payload.nodeUnit.id != "" ? getLabelText(this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label, this.state.lang)
                                                    : ""
                                        : ""}</b> {i18n.t('static.tree.forNode')} <b>{this.state.currentItemConfig.context.payload.label != null ? getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) : ''}</b> {i18n.t('static.tree.asA%OfParent')} <b>{this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level != 0 && this.state.currentItemConfig.parentItem.payload.label != null ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : ''
                                        }</b></i></div>
                                {/* <div className="pt-lg-2 pl-lg-0"><i>Table displays <b>{getLabelText(this.state.currentItemConfig.context.payload.nodeUnit.label, this.state.lang)}</b></div> */}
                                <div className="col-md-12 pl-lg-0 pr-lg-0" style={{ display: 'inline-block' }}>
                                    <div id="momJexcelPer" className={"RowClickable perNodeData FiltermomjexcelPer"} style={{ display: this.state.momJexcelLoader ? "none" : "block" }}>
                                    </div>
                                </div>
                                <div style={{ display: this.state.momJexcelLoader ? "block" : "none" }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                        <div class="align-items-center">
                                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                            <div class="spinner-border blue ml-4" role="status">

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12 pr-lg-0">
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => {
                                        this.setState({
                                            showMomDataPercent: false
                                        });
                                    }}><i className="fa fa-times"></i> {'Close'}</Button>
                                    {/* <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.}><i className="fa fa-check"></i> {'Update'}</Button> */}
                                    {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') && <Button type="button" size="md" color="success" className="float-right mr-1" onClick={(e) => this.updateMomDataInDataSet(e)}><i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>}

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

    handleClickMonthBox4 = (e) => {
        this.pickAMonth4.current.show()
    }
    handleAMonthChange4 = (year, month) => {
        // // console.log("value>>>", year);
        // // console.log("text>>>", month)
        this.setState({ currentCalculatorStartDate: year + "-" + month + "-01" }, () => {

        });

    }
    handleAMonthDissmis4 = (value) => {
        // // console.log("dismiss>>", value);
        // this.setState({ singleValue2: value, }, () => {
        // this.fetchData();
        // })

    }


    handleClickMonthBox5 = (e) => {
        this.pickAMonth5.current.show()
    }
    handleAMonthChange5 = (year, month) => {
        // // console.log("value>>>", year);
        // // console.log("text>>>", month)
        this.setState({ currentCalculatorStopDate: year + "-" + month + "-01" }, () => {

        });

    }
    handleAMonthDissmis5 = (value) => {
        // // console.log("dismiss>>", value);
        // this.setState({ singleValue2: value, }, () => {
        // this.fetchData();
        // })

    }


    // handleClickMonthBox2 = (e) => {
    //     this.pickAMonth2.current.show()
    // }
    handleClickMonthBox1 = (e) => {
        this.pickAMonth1.current.show()
    }

    // handleAMonthChange2 = (year, month) => {
    //     // console.log("value>>>", year);
    //     // console.log("text>>>", month)
    //     var month = parseInt(month) < 10 ? "0" + month : month
    //     var date = year + "-" + month + "-" + "01"
    //     this.filterScalingDataByMonth(date);
    //     // let { currentItemConfig } = this.state;
    //     // (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].month = date;
    //     this.setState({ scalingMonth: date }, () => {
    //         // console.log("after state update---", this.state.currentItemConfig);
    //     });
    // }
    handleAMonthChange1 = (year, month) => {
        // // console.log("value>>>", year);
        // // console.log("text>>>", month)
        var month = parseInt(month) < 10 ? "0" + month : month
        var date = year + "-" + month + "-" + "01"
        let { currentItemConfig } = this.state;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].month = date;
        this.setState({ currentItemConfig }, () => {
            // console.log("after state update---", this.state.currentItemConfig);
        });
        //
        //
    }

    // handleAMonthDissmis2 = (value) => {
    //     // console.log("dismiss>>", value);
    //     // this.setState({ singleValue2: value, }, () => {
    //     // this.fetchData();
    // }


    handleAMonthDissmis1 = (value) => {
        let month = value.year + '-' + value.month + '-01';
        // // console.log("dismiss>>", value);
        this.setState({ singleValue2: value, }, () => {
            // this.fetchData();
            this.calculateParentValueFromMOM(month);
        })

    }

    exportDoc() {
        // console.log("This.state.items +++", this.state.items);
        var item1 = this.state.items;
        var sortOrderArray = [...new Set(item1.map(ele => (ele.sortOrder)))];
        var sortedArray = sortOrderArray.sort();
        var items = [];
        for (var i = 0; i < sortedArray.length; i++) {
            items.push(item1.filter(c => c.sortOrder == sortedArray[i])[0]);
        }
        // console.log("Items+++", items);
        var dataArray = [];
        dataArray.push(new Paragraph({
            children: [new TextRun({ "text": "Tree Validation", bold: true, size: 30 })],
            spacing: {
                after: 150,
            },
        }));
        dataArray.push(new Paragraph({
        }));
        dataArray.push(new Paragraph({
            children: [new TextRun({ "text": i18n.t('static.supplyPlan.runDate') + " : ", bold: true }), new TextRun({ "text": moment(new Date()).format(`${DATE_FORMAT_CAP}`) })],
            spacing: {
                after: 150,
            },
        }));
        dataArray.push(new Paragraph({
            children: [new TextRun({ "text": i18n.t('static.supplyPlan.runTime') + " : ", bold: true }), new TextRun({ "text": moment(new Date()).format('hh:mm A') })],
            spacing: {
                after: 150,
            },
        }));
        dataArray.push(new Paragraph({
            children: [new TextRun({ "text": i18n.t('static.user.user') + " : ", bold: true }), new TextRun({ "text": AuthenticationService.getLoggedInUsername() })],
            spacing: {
                after: 150,
            },
        }));
        dataArray.push(new Paragraph({
            children: [new TextRun({ "text": i18n.t('static.forecastMethod.forecastMethod') + " : ", bold: true }), new TextRun({ "text": document.getElementById("forecastMethodId").selectedOptions[0].text })],
            spacing: {
                after: 150,
            },
        }));
        dataArray.push(new Paragraph({
            children: [new TextRun({ "text": "Template Name" + " : ", bold: true }), new TextRun({ "text": document.getElementById("treeName").value })],
            spacing: {
                after: 150,
            },
        }));
        dataArray.push(new Paragraph({
            children: [new TextRun({ "text": i18n.t('static.program.monthsInPast') + " : ", bold: true }), new TextRun({ "text": document.getElementById("monthsInPast").value })],
            spacing: {
                after: 150,
            },
        }));
        dataArray.push(new Paragraph({
            children: [new TextRun({ "text": i18n.t('static.program.monthsInFuture') + " : ", bold: true }), new TextRun({ "text": document.getElementById("monthsInFuture").value })],
            spacing: {
                after: 150,
            },
        }));
        dataArray.push(new Paragraph({
        }));
        for (var i = 0; i < items.length; i++) {
            var row = "";
            var row1 = "";
            var level = items[i].level;
            for (var j = 1; j <= level; j++) {
                // row = row.concat("\t");
            }
            if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                row = row.concat(addCommas(this.getPayloadData(items[i], 1)))
                row1 = row1.concat(" ").concat(items[i].payload.label.label_en)
            } else {
                row = row.concat(this.getPayloadData(items[i], 1))
                row1 = row1.concat(" ").concat(items[i].payload.label.label_en)
            }
            dataArray.push(new Paragraph({
                children: [new TextRun({ "text": row, bold: true }), new TextRun({ "text": row1 })],
                spacing: {
                    after: 150,
                },
                indent: { left: convertInchesToTwip(0.5 * level) },
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
                        // row3 = row3.concat("\t");
                    }
                    if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                        row = row.concat("NA ")
                        row1 = row1.concat(" Subtotal")
                    } else {
                        row = row.concat(total).concat("% ")
                        row1 = row1.concat(" Subtotal")
                    }
                    if (items[i].payload.nodeType.id != 1 && items[i].payload.nodeType.id != 2) {
                        dataArray.push(new Paragraph({
                            children: [new TextRun({ "text": row3 }), new TextRun({ "text": row, bold: true }), new TextRun({ "text": row4 }), new TextRun({ "text": row1 })],
                            spacing: {
                                after: 150,
                            },
                            shading: {
                                type: ShadingType.CLEAR,
                                fill: "cfcdc9"
                            },
                            style: row != "NA " ? total != 100 ? "aside" : "" : "",
                            indent: { left: convertInchesToTwip(0.5 * items[i].level) },
                        }))
                    }
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
            saveAs(blob, i18n.t('static.dataset.BranchTreeTemplate') + "-" + "TreeValidation" + ".docx");
        });
    }

    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

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
                <div className="ContactTemplate boxContactTemplate" title={itemConfig.payload.nodeDataMap[0][0].notes}>
                    <div className={itemConfig.payload.nodeType.id == 5 || itemConfig.payload.nodeType.id == 4 ? "ContactTitleBackground TemplateTitleBgblue" : "ContactTitleBackground TemplateTitleBg"}
                    >
                        <div className={itemConfig.payload.nodeType.id == 5 || itemConfig.payload.nodeType.id == 4 ? "ContactTitle TitleColorWhite" : "ContactTitle TitleColor"}>
                            <div title={itemConfig.payload.label.label_en} style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '137px', float: 'left', fontWeight: 'bold' }}>{itemConfig.payload.label.label_en}</div>
                            <div style={{ float: 'right' }}>
                                {this.getPayloadData(itemConfig, 4) == true && <i class="fa fa-long-arrow-up" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                {this.getPayloadData(itemConfig, 6) == true && <i class="fa fa-long-arrow-down" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                {this.getPayloadData(itemConfig, 5) == true && <i class="fa fa-link" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                <b style={{ color: '#212721', float: 'right' }}>{itemConfig.payload.nodeType.id == 2 ? <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#002f6c' }}></i> : (itemConfig.payload.nodeType.id == 3 ? <i class="fa fa-percent " style={{ fontSize: '11px', color: '#002f6c' }} ></i> : (itemConfig.payload.nodeType.id == 4 ? <i class="fa fa-cube" style={{ fontSize: '11px', color: '#fff' }} ></i> : (itemConfig.payload.nodeType.id == 5 ? <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#fff' }} ></i> : (itemConfig.payload.nodeType.id == 1 ? <i><img src={AggregationNode} className="AggregationNodeSize" /></i> : ""))))}</b>
                            </div>
                        </div>
                    </div>
                    <div className="ContactPhone ContactPhoneValue">
                        <span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 1)}</span>
                        <div style={{ overflow: 'inherit', fontStyle: 'italic' }}><p className="" style={{ textAlign: 'center' }}> {this.getPayloadData(itemConfig, 2)}</p></div>
                        <div className="treeValidation"><span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 3) != "" ? i18n.t('static.ManageTree.SumofChildren') + ": " : ""}</span><span className={this.getPayloadData(itemConfig, 3) != 100 ? "treeValidationRed" : ""}>{this.getPayloadData(itemConfig, 3) != "" ? this.getPayloadData(itemConfig, 3) + "%" : ""}</span></div>
                    </div>
                </div>
            ))
        }

        const NodeDragSource = DragSource(
            ItemTypes.NODE,
            {
                beginDrag: ({ itemConfig }) => ({ id: itemConfig.id }),
                endDrag(props, monitor) {
                    // const { onMoveItem } = props;
                    // const item = monitor.getItem()
                    // const dropResult = monitor.getDropResult()
                    // if (dropResult) {
                    //     onMoveItem(dropResult.id, item.id);
                    // }
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
                // drop: ({ itemConfig }) => ({ id: itemConfig.id }),
                // canDrop: ({ canDropItem, itemConfig }, monitor) => {
                //     const { id } = monitor.getItem();
                //     return canDropItem(itemConfig.id, id);
                // },
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
        var treeLevels = this.state.treeTemplate.levelList != undefined ? this.state.treeTemplate.levelList : [];
        for (var i = 0; i <= treeLevel; i++) {
            var treeLevelFiltered = treeLevels.filter(c => c.levelNo == i);
            if (i == 0) {
                treeLevelItems.push({
                    annotationType: AnnotationType.Level,
                    levels: [0],
                    title: treeLevelFiltered.length > 0 ? getLabelText(treeLevelFiltered[0].label, this.state.lang) : "Level 0",
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
                    title: treeLevelFiltered.length > 0 ? getLabelText(treeLevelFiltered[0].label, this.state.lang) : "Level " + i,
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
                    title: treeLevelFiltered.length > 0 ? getLabelText(treeLevelFiltered[0].label, this.state.lang) : "Level " + i,
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
            // console.log("level json***", treeLevelItems);
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
            onLevelTitleRender: ((data) => {
                var { context, width, height } = data;
                var { title, titleColor } = context;
                var style = {
                    position: "absolute",
                    fontSize: "12px",
                    fontFamily: "Trebuchet MS, Tahoma, Verdana, Arial, sans-serif",
                    WebkitTapHighlightColor: "rgba(0,0,0,0)",
                    WebkitUserSelect: "none",
                    WebkitTouchCallout: "none",
                    KhtmlUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    userSelect: "none",
                    boxSizing: "content-box",

                    MozBorderRadius: "4px",
                    WebkitBorderRadius: "4px",
                    KhtmlBorderRadius: "4px",
                    BorderRadius: "4px",

                    background: "royalblue",
                    borderWidth: 0,
                    color: "white",
                    padding: 0,
                    width: "100%",
                    height: "100%",
                    left: "-1px",
                    top: "-1px"
                }
                return <div style={{ ...style, background: titleColor }} onClick={(event) => {
                    event.stopPropagation();
                    //   // console.log("Data@@@1111----------->",data)
                    //   alert(`User clicked on level title ${title}`)
                    this.levelClicked(data)
                }}>
                    <RotatedText
                        width={width}
                        height={height}
                        orientation={'RotateRight'}
                        horizontalAlignment={'center'}
                        verticalAlignment={'middle'}
                    >{title}</RotatedText>
                </div>
            }),
            onButtonsRender: (({ context: itemConfig }) => {
                return <>
                    {itemConfig.parent != null &&
                        <>
                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') &&
                                <button key="2" type="button" className="StyledButton TreeIconStyle TreeIconStyleCopyPaddingTop" style={{ background: 'none' }}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        this.duplicateNode(JSON.parse(JSON.stringify(itemConfig)));
                                    }}>
                                    <i class="fa fa-clone" aria-hidden="true"></i>
                                </button>
                            }
                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') &&
                                <button key="3" type="button" className="StyledButton TreeIconStyle TreeIconStyleDeletePaddingTop" style={{ background: 'none' }}
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
                                </button>}
                        </>}
                    {parseInt(itemConfig.payload.nodeType.id) != 5 && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') &&
                        <button key="1" type="button" className="StyledButton TreeIconStyle TreeIconStylePlusPaddingTop" style={{ background: 'none' }}
                            onClick={(event) => {
                                // console.log("add button called---------");
                                event.stopPropagation();
                                // console.log("add node----", itemConfig);
                                var getLevelUnit = this.state.treeTemplate.levelList != undefined ? this.state.treeTemplate.levelList.filter(c => c.levelNo == itemConfig.level + 1) : [];
                                var levelUnitId = ""
                                if (getLevelUnit.length > 0) {
                                    levelUnitId = getLevelUnit[0].unit != null ? getLevelUnit[0].unit.id : "";
                                }
                                // console.log("level unit id on add button click---", levelUnitId);
                                this.setState({
                                    isValidError: true,
                                    tempPlanningUnitId: '',
                                    showMomDataPercent: false,
                                    showMomData: false,
                                    viewMonthlyData: true,
                                    fuValues: [],
                                    fuLabels: [],
                                    scalingList: [],
                                    usageTemplateId: '',
                                    usageText: "",
                                    level0: true,
                                    numberNode: (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2 ? false : true),
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
                                                    id: levelUnitId
                                                },
                                                nodeDataMap: [
                                                    [
                                                        {
                                                            nodeDataModelingList: [],
                                                            nodeDataOverrideList: [],
                                                            nodeDataMomList: [],
                                                            monthNo: 1,
                                                            dataValue: '',
                                                            calculatedDataValue: '',
                                                            notes: '',
                                                            fuNode: {
                                                                oneTimeUsage: "false",
                                                                lagInMonths: 0,
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
                                                                    usagePeriodId: 1
                                                                },
                                                                repeatCount: '',
                                                                repeatUsagePeriod: {
                                                                    usagePeriodId: 1
                                                                }
                                                            },
                                                            puNode: {
                                                                planningUnit: {
                                                                    id: '',
                                                                    unit: {
                                                                        id: ""
                                                                    },
                                                                    multiplier: ''
                                                                },
                                                                refillMonths: '',
                                                                sharePlanningUnit: "false"
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
                                                    id: itemConfig.payload.nodeUnit.id,
                                                    label: itemConfig.payload.nodeUnit.label
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
                                                                    usagePeriodId: (itemConfig.payload.nodeType.id == 4 && (itemConfig.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (itemConfig.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true ? (itemConfig.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId : '')
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
                                    // console.log("add click config---", this.state.currentItemConfig);
                                    // console.log("add click nodeflag---", this.state.addNodeFlag);
                                    // console.log("item config---", itemConfig);
                                    // console.log("parent value check---", itemConfig.payload.nodeDataMap[0][0].calculatedDataValue);
                                    this.setState({
                                        orgCurrentItemConfig: JSON.parse(JSON.stringify(this.state.currentItemConfig.context)),
                                        // parentValue: itemConfig.payload.nodeDataMap[0][0].calculatedDataValue != null ? itemConfig.payload.nodeDataMap[0][0].calculatedDataValue : 0
                                    }, () => {
                                        this.getNodeTypeFollowUpList(itemConfig.payload.nodeType.id);
                                        this.calculateParentValueFromMOM(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo);
                                    });

                                    if (itemConfig.payload.nodeType.id == 2 || itemConfig.payload.nodeType.id == 3) {
                                        this.getUsageTemplateList(0);
                                    }
                                    else if (itemConfig.payload.nodeType.id == 4) {
                                        // console.log("fu id---", (itemConfig.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id);
                                        this.getNoOfFUPatient();
                                        setTimeout(() => {
                                            this.getNoOfMonthsInUsagePeriod();
                                            this.getPlanningUnitListByFUId((itemConfig.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id);
                                        }, 0);
                                        if (itemConfig.parent == null) {
                                            this.state.currentItemConfig.context.payload.nodeUnit.id = itemConfig.payload.nodeUnit.id;
                                        } else {
                                            this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == itemConfig.parent)[0].payload.nodeUnit.id;
                                        }
                                    } else {


                                    }
                                    // this.buildJexcelScalingTransfer();
                                });
                                // this.onAddButtonClick(itemConfig);
                            }}>
                            {/* <FontAwesomeIcon icon={faPlus} /> */}
                            <i class="fa fa-plus-square-o" aria-hidden="true"></i>
                        </button>}
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
                    />;
                }
            }]
        }
        return <div className="animated fadeIn">
            <Prompt
                when={this.state.isChanged == true || this.state.isTemplateChanged == true}
                message={i18n.t("static.dataentry.confirmmsg")}
            />
            <AuthenticationServiceComponent history={this.props.history} />
            <h5 className={this.state.color} id="div2">
                {i18n.t(this.state.message, { entityname })}</h5>
            <Row>
                <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                    <Card className="mb-lg-0">
                        <div className="Card-header-reporticon pb-lg-0">
                            <div className="card-header-actions col-md-12 pl-lg-0 pr-lg-0 pt-lg-0">
                                {/* <div className="card-header-actions pr-4 pt-1"> */}
                                <a className="pr-lg-0 pt-lg-0 float-left">
                                    <span style={{ cursor: 'pointer' }} onClick={this.cancelClicked}><i className="cui-arrow-left icons" style={{ color: '#002F6C', fontSize: '13px' }}></i> <small className="supplyplanformulas">{'Return To List'}</small></span>
                                    {/* <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link> */}
                                </a>
                                <a className="pr-lg-0 pt-lg-0 float-right">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')}
                                        onClick={() => this.exportPDF()}
                                    />
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={docicon} title={i18n.t('static.report.exportWordDoc')} onClick={() => this.exportDoc()} />
                                </a>
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
                                        this.setState({
                                            loading: true
                                        })
                                        // console.log("on submit called-----------------");
                                        var template = this.state.treeTemplate;
                                        // console.log("template---", template);
                                        var items = this.state.items;
                                        // console.log("items---", items);
                                        var flatList = [];
                                        for (var i = 0; i < items.length; i++) {
                                            // console.log("i============", i);
                                            var item = items[i];
                                            // console.log("item---", item);
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
                                                                monthNo: (item.payload.nodeDataMap[0])[0].monthNo,
                                                                // monthNo: new Date((item.payload.nodeDataMap[0])[0].month).getMonth(),
                                                                // month: '2021-09-01',
                                                                nodeDataId: (item.payload.nodeDataMap[0])[0].nodeDataId,
                                                                dataValue: (item.payload.nodeDataMap[0])[0].dataValue,
                                                                fuNode: item.payload.nodeType.id < 4 || item.payload.nodeType.id == 5 ? null : (item.payload.nodeDataMap[0])[0].fuNode,
                                                                puNode: item.payload.nodeType.id < 4 || item.payload.nodeType.id == 4 ? null : (item.payload.nodeDataMap[0])[0].puNode,
                                                                notes: (item.payload.nodeDataMap[0])[0].notes,
                                                                manualChangesEffectFuture: (item.payload.nodeDataMap[0])[0].manualChangesEffectFuture,
                                                                nodeDataModelingList: (item.payload.nodeDataMap[0])[0].nodeDataModelingList,
                                                                nodeDataMomList: (item.payload.nodeDataMap[0])[0].nodeDataMomList,
                                                                nodeDataOverrideList: (item.payload.nodeDataMap[0])[0].nodeDataOverrideList
                                                            }
                                                        ]
                                                    }
                                                },
                                                level: item.level,
                                                sortOrder: item.sortOrder
                                            }
                                            flatList.push(json);
                                        }
                                        // console.log("flatList---", flatList);
                                        var templateObj = {
                                            treeTemplateId: template.treeTemplateId,
                                            branch: true,
                                            notes: template.notes,
                                            active: template.active,
                                            monthsInPast: template.monthsInPast,
                                            monthsInFuture: template.monthsInFuture,
                                            label: {
                                                label_en: template.label.label_en
                                            },
                                            forecastMethod: {
                                                id: template.forecastMethod.id
                                            },
                                            flatList: flatList,
                                            levelList: template.levelList
                                        }
                                        // console.log("template obj---", templateObj);

                                        if (template.treeTemplateId == 0) {
                                            if (template.flatList[0].newTemplateFlag == 0) {
                                                this.setState({
                                                    loading: false
                                                }, () => { alert(i18n.t('static.tree.rootNodeInfoMissing')); });

                                            } else {
                                                DatasetService.addTreeTemplate(templateObj)
                                                    .then(response => {
                                                        // console.log("after adding tree---", response.data);
                                                        if (response.status == 200) {
                                                            var items = response.data.flatList;
                                                            var arr = [];
                                                            for (let i = 0; i < items.length; i++) {

                                                                if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                                                                    (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (items[i].payload.nodeDataMap[0])[0].dataValue;
                                                                } else {
                                                                    if (items[i].level == 0) {
                                                                        (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = 0;
                                                                    } else {
                                                                        var findNodeIndex = items.findIndex(n => n.id == items[i].parent);
                                                                        var parentValue = (items[findNodeIndex].payload.nodeDataMap[0])[0].calculatedDataValue;
                                                                        // console.log("api parent value---", parentValue);
                                                                        (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (parentValue * (items[i].payload.nodeDataMap[0])[0].dataValue) / 100;
                                                                    }
                                                                    if (this.state.hideFUPUNode) {
                                                                        if (items[i].payload.nodeType.id == 4 || items[i].payload.nodeType.id == 5) {
                                                                            items[i].isVisible = false;
                                                                        }
                                                                    } else if (this.state.hidePUNode && items[i].payload.nodeType.id == 5) {
                                                                        items[i].isVisible = false;
                                                                    } else {
                                                                        items[i].isVisible = true;
                                                                    }
                                                                }
                                                                // console.log("load---", items[i])
                                                                // arr.push(items[i]);
                                                            }
                                                            this.setState({
                                                                treeTemplate: response.data,
                                                                items,
                                                                message: i18n.t('static.message.addBranchTemplate'),
                                                                color: 'green',
                                                                loading: true,
                                                                isChanged: false,
                                                                isTemplateChanged: false
                                                            }, () => {
                                                                this.hideSecondComponent();
                                                                this.calculateMOMData(1, 2);
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
                                        } else {
                                            // console.log("templateObj for update>>>", templateObj);
                                            DatasetService.updateTreeTemplate(templateObj)
                                                .then(response => {
                                                    // console.log("after updating tree---", response);
                                                    if (response.status == 200) {
                                                        // console.log("message---", i18n.t(response.data.messageCode, { entityname }));
                                                        var items = response.data.flatList;
                                                        var arr = [];
                                                        for (let i = 0; i < items.length; i++) {

                                                            if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                                                                (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (items[i].payload.nodeDataMap[0])[0].dataValue;
                                                            } else {
                                                                if (items[i].level == 0) {
                                                                    (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = 0;
                                                                } else {
                                                                    var findNodeIndex = items.findIndex(n => n.id == items[i].parent);
                                                                    var parentValue = (items[findNodeIndex].payload.nodeDataMap[0])[0].calculatedDataValue;
                                                                    // console.log("api parent value---", parentValue);

                                                                    (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (parentValue * (items[i].payload.nodeDataMap[0])[0].dataValue) / 100;
                                                                }
                                                            }
                                                            // console.log("load---", items[i])
                                                            // arr.push(items[i]);
                                                        }
                                                        // console.log("message---", i18n.t(response.data.messageCode, { entityname }));
                                                        this.setState({
                                                            treeTemplate: response.data,
                                                            items,
                                                            message: i18n.t('static.message.editBranchTemplate'),
                                                            loading: true,
                                                            color: 'green',
                                                            isChanged: false,
                                                            isTemplateChanged: false
                                                        }, () => {
                                                            this.hideSecondComponent();
                                                            this.calculateMOMData(1, 2);
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
                                                                                disabled={this.state.hidePlanningUnit}
                                                                                // checked={false}
                                                                                onClick={(e) => { this.filterPlanningUnitNode(e); }}
                                                                            />
                                                                            <Label
                                                                                className="form-check-label"
                                                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                                                <b>{i18n.t('static.tree.hidePlanningUnit')}</b>
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
                                                                                <b>{i18n.t('static.tree.hideFUAndPU')}</b>
                                                                            </Label>
                                                                        </div>
                                                                    </div>
                                                                </FormGroup>
                                                                <div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenMonthInPast} target="Popover26" trigger="hover" toggle={this.toggleMonthInPast}>
                                                                        <PopoverBody>Need to add info</PopoverBody>
                                                                    </Popover>
                                                                </div>
                                                                <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Months In Past'}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover26" onClick={this.toggleMonthInPast} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                    <Input
                                                                        type="number"
                                                                        name="monthsInPast"
                                                                        id="monthsInPast"
                                                                        bsSize="sm"
                                                                        min={0}
                                                                        step={1}
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
                                                                <div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenMonthInFuture} target="Popover27" trigger="hover" toggle={this.toggleMonthInFuture}>
                                                                        <PopoverBody>Need to add info</PopoverBody>
                                                                    </Popover>
                                                                </div>
                                                                <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Months In Future'}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover27" onClick={this.toggleMonthInFuture} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                    <Input
                                                                        type="number"
                                                                        name="monthsInFuture"
                                                                        id="monthsInFuture"
                                                                        bsSize="sm"
                                                                        min={0}
                                                                        step={1}
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

                                                                <FormGroup className="col-md-6 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Notes'}</Label>
                                                                    <Input
                                                                        type="textarea"
                                                                        name="templateNotes"
                                                                        id="templateNotes"
                                                                        bsSize="sm"
                                                                        onChange={(e) => { this.dataChange(e) }}
                                                                        value={this.state.treeTemplate.notes}
                                                                    >
                                                                    </Input>
                                                                </FormGroup>
                                                                {/* <FormGroup className="col-md-3 pl-lg-0 MarginTopMonthSelector">
                                                                    <Label htmlFor="languageId">{'Month Selector'}</Label>
                                                                    <Input
                                                                        type="select"
                                                                        name="monthId"
                                                                        id="monthId"
                                                                        bsSize="sm"
                                                                        onChange={(e) => { this.dataChange(e) }}
                                                                        value={this.state.monthId}
                                                                    >
                                                                        {this.state.monthList.length > 0
                                                                            && this.state.monthList.map((item, i) => {
                                                                                return (
                                                                                    <option key={i} value={item.id}>
                                                                                        {item.name}
                                                                                    </option>
                                                                                )
                                                                            }, this)}
                                                                    </Input>
                                                                </FormGroup> */}
                                                            </Row>
                                                            <FormGroup className="row col-md-3 pl-lg-0 MarginTopMonthSelector">
                                                                <Label htmlFor="languageId">{'Month Selector'}</Label>
                                                                <Input
                                                                    type="select"
                                                                    name="monthId"
                                                                    id="monthId"
                                                                    bsSize="sm"
                                                                    onChange={(e) => { this.dataChange(e) }}
                                                                    value={this.state.monthId}
                                                                >
                                                                    {this.state.monthList.length > 0
                                                                        && this.state.monthList.map((item, i) => {
                                                                            return (
                                                                                <option key={i} value={item.id}>
                                                                                    {item.name}
                                                                                </option>
                                                                            )
                                                                        }, this)}
                                                                </Input>
                                                            </FormGroup>
                                                        </div>

                                                        {(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_TREE_TEMPLATE')) &&
                                                            <CardFooter className="col-md-6 pt-lg-0 pr-lg-0 float-right MarginTopCreateTreeBtn" style={{ backgroundColor: 'transparent', borderTop: '0px solid #c8ced3' }}>
                                                                {/* ---hehehe */}
                                                                {/* <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button> */}
                                                                <Button type="button" size="md" color="warning" className="float-right mr-1 mb-lg-2" onClick={this.resetTree}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                                <Button type="submit" color="success" className="mr-1 mb-lg-2 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"> </i>{i18n.t('static.pipeline.save')}</Button>
                                                            </CardFooter>}

                                                    </CardBody>

                                                    <div style={{ display: !this.state.loading ? "block" : "none" }} class="sample">
                                                        <Provider>
                                                            <div className="placeholder TreeTemplateHeight" style={{ clear: 'both', marginTop: '25px', border: '1px solid #a7c6ed' }} >
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
                                                    {/* <CardFooter style={{ backgroundColor: 'transparent', borderTop: '0px solid #c8ced3' }}> */}
                                                    {/* <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button> */}
                                                    {/* <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.resetTree}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button> */}
                                                    {/* <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"> </i>{i18n.t('static.pipeline.save')}</Button> */}
                                                    {/* </CardFooter> */}
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
                                        (this.state.currentItemConfig.context.payload.nodeType.id == 1 ? <i><img src={AggregationNode} className="AggregationNodeSize" /></i> : "")
                                    )))}
                        <b className="supplyplanformulas ScalingheadTitle">{this.state.currentItemConfig.context.payload.label.label_en}</b></div>}
                    <Button size="md"
                        onClick={() => {
                            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
                            if (cf == true) {
                                this.setState({
                                    openAddNodeModal: false, isChanged: false,
                                    cursorItem: 0, highlightItem: 0, activeTab1: new Array(2).fill('1')
                                })
                            } else {

                            }

                        }
                        }
                        color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
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
            {/* Modal for level */}
            <Modal isOpen={this.state.levelModal}
                className={'modal-md'}>
                <ModalHeader toggle={() => this.levelClicked("")} className="modalHeader">
                    <strong>{i18n.t('static.tree.levelDetails')}</strong>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label htmlFor="currencyId">{i18n.t('static.tree.levelName')}<span class="red Reqasterisk">*</span></Label>
                        <Input type="text"
                            id="levelName"
                            name="levelName"
                            required
                            onChange={(e) => { this.levelNameChanged(e) }}
                            value={this.state.levelName}
                        ></Input>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="currencyId">{i18n.t('static.tree.nodeUnit')}</Label>
                        <Input
                            type="select"
                            id="levelUnit"
                            name="levelUnit"
                            bsSize="sm"
                            onChange={(e) => { this.levelUnitChange(e) }}
                            value={this.state.levelUnit}
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
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <div className="mr-0">
                        <Button type="submit" size="md" color="success" className="submitBtn float-right" onClick={this.levelDeatilsSaved}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
                    </div>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.levelClicked("")}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                </ModalFooter>
            </Modal>
        </div>
    }
}


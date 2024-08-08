import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType, LevelAnnotationConfig, AnnotationType, LineType, Thickness } from 'basicprimitives';
import { DropTarget, DragSource } from 'react-dnd';
import i18n from '../../i18n'
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Formik } from 'formik';
import * as Yup from 'yup'
import pdfIcon from '../../assets/img/pdf.png';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { Row, Col, Card, CardFooter, Button, CardBody, Form, Modal, Popover, PopoverBody, ModalBody, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, InputGroupText, InputGroup } from 'reactstrap';
import Provider from '../../Samples/Provider'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import ForecastMethodService from '../../api/ForecastMethodService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import DatasetService from '../../api/DatasetService.js';
import UnitService from '../../api/UnitService.js';
import moment from 'moment';
import UsagePeriodService from '../../api/UsagePeriodService.js';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import PlanningUnitService from '../../api/PlanningUnitService';
import UsageTemplateService from '../../api/UsageTemplateService';
import { ROUNDING_NUMBER, NUMBER_NODE_ID, PERCENTAGE_NODE_ID, FU_NODE_ID, PU_NODE_ID, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY, JEXCEL_PAGINATION_OPTION, JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE, JEXCEL_PRO_KEY, TREE_DIMENSION_ID, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_DECIMAL_NO_REGEX_LONG, DATE_FORMAT_CAP, API_URL, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_INTEGER_REGEX } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import cleanUp from '../../assets/img/calculator.png';
import { Bar } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { grey } from '@material-ui/core/colors';
import ModelingTypeService from "../../api/ModelingTypeService";
import docicon from '../../assets/img/doc.png';
import AggregationNode from '../../assets/img/Aggregation-icon.png';
import { saveAs } from "file-saver";
import { convertInchesToTwip, Document, Packer, Paragraph, ShadingType, TextRun } from "docx";
import { calculateModelingDataForTreeTemplate } from '../../views/DataSet/ModelingDataCalculationForTreeTemplate';
import PDFDocument from 'pdfkit-nodejs-webpack';
import blobStream from 'blob-stream';
import OrgDiagramPdfkit from '../TreePDF/OrgDiagramPdfkit';
import Size from '../../../node_modules/basicprimitives/src/graphics/structs/Size';
import classNames from 'classnames';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Prompt } from 'react-router';
import AuthenticationService from '../Common/AuthenticationService';
import RotatedText from 'basicprimitivesreact/dist/umd/Templates/RotatedText';
import CryptoJS from 'crypto-js'
import { calculateModelingData } from '../../views/DataSet/ModelingDataCalculation2';
import DropdownService from '../../api/DropdownService';
// Localized entity name
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
}
/**
 * Defines the validation schema for create tree.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchemaCreateTree = function (values) {
    return Yup.object().shape({
        datasetIdModalForCreateTree: Yup.string()
            .test('datasetIdModalForCreateTree', 'Please select program',
                function (value) {
                    if (document.getElementById("datasetIdModalForCreateTree").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        treeNameForCreateTree: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.validation.selectTreeName')),
        forecastMethodIdForCreateTree: Yup.string()
            .test('forecastMethodIdForCreateTree', i18n.t('static.validation.selectForecastMethod'),
                function (value) {
                    if (document.getElementById("forecastMethodIdForCreateTree").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        regionIdForCreateTree: Yup.string()
            .required(i18n.t('static.common.regiontext'))
            .typeError(i18n.t('static.common.regiontext')),
    })
}
/**
 * Defines the validation schema for node details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
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
                        return false;
                    } else {
                        return true;
                    }
                }),
        monthNo: Yup.string()
            .test('monthNo', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (parseInt(document.getElementById("nodeTypeId").value) != 1 && document.getElementById("monthNo").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        percentageOfParent: Yup.string()
            .test('percentageOfParent', i18n.t('static.tree.decimalValidation10&2'),
                function (value) {
                    var testNumber = document.getElementById("percentageOfParent").value != "" ? (/^\d{0,3}(\.\d{1,4})?$/).test(document.getElementById("percentageOfParent").value) : false;
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 4 || parseInt(document.getElementById("nodeTypeId").value) == 5) && (document.getElementById("percentageOfParent").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        nodeValue: Yup.string()
            .test('nodeValue', 'Please enter a valid number having less than or equal to 10 digits.',
                function (value) {
                    var testNumber = (/^(?!$)\d{0,10}(?:\.\d{1,8})?$/).test((document.getElementById("nodeValue").value).replaceAll(",", ""));
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2) && (document.getElementById("nodeValue").value == "" || testNumber == false)) {
                        return false;
                    } else {
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
                        return false;
                    } else {
                        return true;
                    }
                }),
        lagInMonths:
            Yup.string().test('lagInMonths', 'Please enter a valid number having less then equal to 3 digit.',
                function (value) {
                    var testNumber = (/^\d{0,3}?$/).test(document.getElementById("lagInMonths").value);
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 4) && (document.getElementById("lagInMonths").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        noOfPersons:
            Yup.string().test('noOfPersons', 'Please enter a valid 10 digit number.',
                function (value) {
                    var testNumber = (/^\d{0,10}?$/).test((document.getElementById("noOfPersons").value).replaceAll(",", ""));
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 4) && (document.getElementById("noOfPersons").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        forecastingUnitPerPersonsFC:
            Yup.string().test('forecastingUnitPerPersonsFC', i18n.t('static.tree.decimalValidation12&2'),
                function (value) {
                    var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("forecastingUnitPerPersonsFC").value).replaceAll(",", ""));
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 4) && (document.getElementById("forecastingUnitPerPersonsFC").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        usageFrequencyCon: Yup.string()
            .test('usageFrequencyCon', i18n.t('static.tree.decimalValidation12&2'),
                function (value) {
                    var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("usageFrequencyCon").value).replaceAll(",", ""))
                    if (document.getElementById("usageTypeIdFU").value == 2 && (document.getElementById("usageFrequencyCon").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        usageFrequencyDis: Yup.string()
            .test('usageFrequencyDis', i18n.t('static.tree.decimalValidation12&2'),
                function (value) {
                    var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("usageFrequencyDis").value).replaceAll(",", ""))
                    if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value == 'false' || document.getElementById("oneTimeUsage").value == false) && (document.getElementById("usageFrequencyDis").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        usagePeriodIdCon: Yup.string()
            .test('usagePeriodIdCon', 'This field is required.',
                function (value) {
                    if (document.getElementById("usageTypeIdFU").value == 2 && document.getElementById("usagePeriodIdCon").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        usagePeriodIdDis: Yup.string()
            .test('usagePeriodIdDis', 'This field is required.',
                function (value) {
                    if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value == 'false' || document.getElementById("oneTimeUsage").value == false) && document.getElementById("usagePeriodIdDis").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        oneTimeUsage: Yup.string()
            .test('oneTimeUsage', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (document.getElementById("usageTypeIdFU").value == 1 && document.getElementById("oneTimeUsage").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        repeatCount: Yup.string().test('repeatCount', i18n.t('static.tree.decimalValidation12&2'),
            function (value) {
                var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("repeatCount").value).replaceAll(",", ""));
                if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value === "false" || document.getElementById("oneTimeUsage").value === false) && (document.getElementById("repeatCount").value == "" || testNumber == false)) {
                    return false;
                } else {
                    return true;
                }
            }),
        repeatUsagePeriodId: Yup.string().test('repeatUsagePeriodId', 'This field is required.',
            function (value) {
                if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value == "false" || document.getElementById("oneTimeUsage").value == false) && (document.getElementById("repeatUsagePeriodId").value == "")) {
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
                    if ((document.getElementById("nodeTypeId").value == 5)) {
                        var testNumber = (/^[1-9]\d*$/).test((document.getElementById("refillMonths").value).replaceAll(",", ""));
                        if ((document.getElementById("nodeTypeId").value == 5 && document.getElementById("usageTypeIdPU").value == 2) && (document.getElementById("refillMonths").value == "" || testNumber == false)) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }),
        puPerVisit: Yup.string()
            .test('puPerVisit', 'Please enter # of pu per visit.',
                function (value) {
                    if ((document.getElementById("nodeTypeId").value == 5)) {
                        var testNumber = (/^\d{0,12}(\.\d{1,8})?$/).test((document.getElementById("puPerVisit").value).replaceAll(",", ""));
                        if (document.getElementById("nodeTypeId").value == 5 && document.getElementById("puPerVisit").type != "hidden" && (document.getElementById("puPerVisit").value == "" || testNumber == false)) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }),
    })
}
/**
 * Defines the validation schema for tree template details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
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
/**
 * Defines the validation schema for using branch template.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchemaBranch = function (values) {
    return Yup.object().shape({
        branchTemplateId: Yup.string()
            .required('Please enter template.'),
    })
}
/**
 * Defines the validation schema for level details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchemaLevel = function (values) {
    return Yup.object().shape({
        levelName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required('Please enter level name.'),
    })
}
/**
 * Formats a numerical value by adding commas as thousand separators.
 * @param {string|number} cell1 - The numerical value to be formatted.
 * @param {Object} row - The row object if applicable.
 * @returns {string} The formatted numerical value with commas as thousand separators.
 */
function addCommas(cell1, row) {
    if (cell1 != null && cell1 != "") {
        cell1 += '';
        var x = cell1.replaceAll(",", "").split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1].slice(0, 8) : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    } else {
        return "";
    }
}
/**
 * Formats a numerical value by adding commas as thousand separators.
 * This function is specifically designed for formatting parent values in a table.
 * @param {string|number} cell1 - The numerical value to be formatted.
 * @param {Object} row - The row object if applicable.
 * @returns {string} The formatted numerical value with commas as thousand separators.
 */
function addCommasParentValue(cell1, row) {
    if (cell1 != null && cell1 !== "") {
        cell1 += '';
        var x = cell1.replaceAll(",", "").split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1].slice(0, 4) : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    } else {
        return "";
    }
}
/**
 * Formats a numerical value by adding commas as thousand separators and truncating to 8 decimal places.
 * @param {string|number} cell1 - The numerical value to be formatted.
 * @param {Object} row - The row object if applicable.
 * @returns {string} The formatted numerical value with commas as thousand separators and truncated to 8 decimal places.
 */
function addCommasWith8Decimals(cell1, row) {
    if (cell1 != null && cell1 != "") {
        cell1 += '';
        var x = cell1.replaceAll(",", "").split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1].slice(0, 8) : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    } else {
        return "";
    }
}
/**
 * Formats a numerical value by adding commas as thousand separators and truncating to two decimal places.
 * @param {string|number} cell1 - The numerical value to be formatted.
 * @param {Object} row - The row object if applicable.
 * @returns {string} The formatted numerical value with commas as thousand separators and truncated to two decimal places.
 */
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
    } else {
        return "";
    }
}
/**
 * Formats a numerical value by adding commas as thousand separators and truncating to three decimal places.
 * @param {string|number} cell1 - The numerical value to be formatted.
 * @param {Object} row - The row object if applicable.
 * @returns {string} The formatted numerical value with commas as thousand separators and truncated to three decimal places.
 */
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
    } else {
        return "";
    }
}
const months = [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')]
/**
 * Component for create tree template
 */
export default class CreateTreeTemplate extends Component {
    constructor(props) {
        super(props);
        this.pickAMonth5 = React.createRef()
        this.pickAMonth4 = React.createRef()
        this.pickAMonth2 = React.createRef()
        this.pickAMonth1 = React.createRef()
        this.pickAMonth6 = React.createRef()
        this.state = {
            isBranchTemplateModalOpen: false,
            branchTemplateList: [],
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
            popoverOpenFirstMonthOfTarget: false,
            popoverOpenYearsOfTarget: false,
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
            nodeTransferDataList: [],
            toggleArray: [],
            programDataListForPuCheck: [],
            calculatedTotalForModelingCalculator: [],
            targetSelect: 0,
            firstMonthOfTarget: "",
            yearsOfTarget: "",
            actualOrTargetValueList: [],
            firstMonthOfTargetOriginal: "",
            yearsOfTargetOriginal: "",
            actualOrTargetValueListOriginal: [],
            modelingTypeOriginal: "",
            monthListForModelingCalculator: [],
            editable: AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') ? true : false,
            treeTemplateList: [],
            treeTemplateId: this.props.match.params.templateId != undefined && this.props.match.params.templateId != -1 ? this.props.match.params.templateId : "",
            isModalForCreateTree: false,
            treeNameForCreateTree: "",
            forecastMethodForCreateTree: {
                id: "",
                label: {
                    label_en: ""
                }
            },
            datasetIdModalForCreateTree: "",
            regionIdForCreateTree: '',
            regionListForCreateTree: [],
            regionValuesForCreateTree: [],
            missingPUListForCreateTree: [],
            forecastMethodListForCreateTree: [],
            datasetListForCreateTree: [],
            programListForCreateTree: [],
            activeForCreateTree: true,
            datasetListJexcelForCreateTree: {},
            treeTemplateForCreateTree: {},
            collapseState: false,
            isCalculateClicked: 0,
            allProcurementAgentList: [],
            planningUnitObjList: [],
            startDateDisplay: '',
            endDateDisplay: '',
            beforeEndDateDisplay: '',
            modelingChangedOrAdded: false,
            currentNodeTypeId: "",
            deleteChildNodes: false
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
        this.toggleFirstMonthOfTarget = this.toggleFirstMonthOfTarget.bind(this);
        this.toggleYearsOfTarget = this.toggleYearsOfTarget.bind(this);
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
        this.generateBranchFromTemplate = this.generateBranchFromTemplate.bind(this);
        this.cancelNodeDataClicked = this.cancelNodeDataClicked.bind(this);
        this.createTree = this.createTree.bind(this)
        this.modelOpenCloseForCreateTree = this.modelOpenCloseForCreateTree.bind(this);
        this.getPlanningUnitWithPricesByIds = this.getPlanningUnitWithPricesByIds.bind(this);
        this.saveMissingPUs = this.saveMissingPUs.bind(this);
        this.procurementAgentList = this.procurementAgentList.bind(this);
        this.checkValidationForMissingPUList = this.checkValidationForMissingPUList.bind(this);
        this.changedMissingPUForCreateTree = this.changedMissingPUForCreateTree.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this.buildModelingCalculatorJexcel = this.buildModelingCalculatorJexcel.bind(this);
        this.loadedModelingCalculatorJexcel = this.loadedModelingCalculatorJexcel.bind(this);
        this.changed3 = this.changed3.bind(this);
        this.resetModelingCalculatorData = this.resetModelingCalculatorData.bind(this);
        this.validFieldData = this.validFieldData.bind(this);
        this.changeModelingCalculatorJexcel = this.changeModelingCalculatorJexcel.bind(this);
        this.acceptValue1 = this.acceptValue1.bind(this);
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
     * Handles the cancellation of node data operation.
     * If changes have been made, prompts the user for confirmation before canceling.
     * Resets the state to its initial values if confirmed or if there are no changes.
     */
    cancelNodeDataClicked() {
        if (this.state.isChanged == true) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                this.setState({
                    openAddNodeModal: false, cursorItem: 0, highlightItem: 0, isChanged: false, activeTab1: new Array(2).fill('1')
                })
            } else {
            }
        } else {
            this.setState({
                openAddNodeModal: false, cursorItem: 0, highlightItem: 0, isChanged: false, activeTab1: new Array(2).fill('1')
            })
        }
    }
    /**
     * Toggle modal popup for create tree from tree template
     */
    modelOpenCloseForCreateTree() {
        this.setState({
            isModalForCreateTree: !this.state.isModalForCreateTree,
            treeNameForCreateTree: "",
            forecastMethodForCreateTree: {
                id: "",
                label: {
                    label_en: ""
                }
            },
            datasetIdModalForCreateTree: "",
            regionIdForCreateTree: '',
            regionListForCreateTree: [],
            regionValuesForCreateTree: [],
            missingPUListForCreateTree: [],
            activeForCreateTree: true,
            datasetListJexcelForCreateTree: {},
            treeTemplateForCreateTree: {}
        })
    }
    /**
     * Retrieves region information for creating a tree based on the dataset ID.
     * Updates the component state with the retrieved region lists and performs additional operations.
     * @param {number} datasetId - The ID of the dataset.
     */
    getRegionListForCreateTree(datasetId) {
        var regionListForCreateTree = [];
        var regionMultiListForCreateTree = [];
        if (datasetId != 0 && datasetId != "" && datasetId != null) {
            var programForCreateTree = this.state.datasetListForCreateTree.filter(c => c.id == datasetId);
            if (programForCreateTree.length > 0) {
                var databytes = CryptoJS.AES.decrypt(programForCreateTree[0].programData, SECRET_KEY);
                var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                regionListForCreateTree = programData.regionList;
                regionListForCreateTree.map(c => {
                    regionMultiListForCreateTree.push({ label: getLabelText(c.label, this.state.lang), value: c.regionId })
                })
                if (regionMultiListForCreateTree.length == 1) {
                    regionListForCreateTree = [];
                    var regions = regionMultiListForCreateTree;
                    for (let i = 0; i < regions.length; i++) {
                        var json = {
                            id: regions[i].value,
                            label: {
                                label_en: regions[i].label
                            }
                        }
                        regionListForCreateTree.push(json);
                    }
                }
            }
            this.setState({
                regionListForCreateTree,
                regionMultiListForCreateTree,
                missingPUListForCreateTree: [],
                datasetListJexcelForCreateTree: programData,
                regionValuesForCreateTree: regionMultiListForCreateTree.length == 1 ? regionMultiListForCreateTree : [],
            }, () => {
                this.findMissingPUsForCreateTree();
            });
        }
    }
    /**
     * Function to find missing planning units while create tree from tree template
     */
    findMissingPUsForCreateTree() {
        var missingPUListForCreateTree = [];
        var json;
        var treeTemplateForCreateTree = this.state.treeTemplateForCreateTree;
        let forecastStartDate;
        let forecastStopDate;
        let beforeEndDateDisplay;
        if (this.state.datasetIdModalForCreateTree != "" && this.state.datasetIdModalForCreateTree != null) {
            var dataset = this.state.datasetListJexcelForCreateTree;
            forecastStartDate = dataset.currentVersion.forecastStartDate;
            forecastStopDate = dataset.currentVersion.forecastStopDate;
            beforeEndDateDisplay = new Date(forecastStartDate);
            beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);
            var puNodeList = treeTemplateForCreateTree.flatList.filter(x => x.payload.nodeType.id == 5);
            var planningUnitList = dataset.planningUnitList;
            for (let i = 0; i < puNodeList.length; i++) {
                if (planningUnitList.filter(x => x.treeForecast == true && x.active == true && x.planningUnit.id == puNodeList[i].payload.nodeDataMap[0][0].puNode.planningUnit.id).length == 0) {
                    var parentNodeData = treeTemplateForCreateTree.flatList.filter(x => x.id == puNodeList[i].parent)[0];
                    var productCategory = parentNodeData.payload.nodeDataMap[0][0].fuNode.forecastingUnit.productCategory;
                    let existingPU = planningUnitList.filter(x => x.planningUnit.id == puNodeList[i].payload.nodeDataMap[0][0].puNode.planningUnit.id);
                    if (existingPU.length > 0) {
                        json = {
                            productCategory: productCategory != undefined ? productCategory : { id: "", label: { label_en: "" } },
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
                        missingPUListForCreateTree.push(json);
                    } else {
                        json = {
                            productCategory: productCategory != undefined ? productCategory : { id: "", label: { label_en: "" } },
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
                        missingPUListForCreateTree.push(json);
                    }
                }
            }
        }
        if (missingPUListForCreateTree.length > 0) {
            missingPUListForCreateTree = missingPUListForCreateTree.filter((v, i, a) => a.findIndex(v2 => (v2.planningUnit.id === v.planningUnit.id)) === i)
        }
        this.setState({
            missingPUListForCreateTree: missingPUListForCreateTree,
            beforeEndDateDisplay: (!isNaN(beforeEndDateDisplay.getTime()) == false ? '' : months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear()),
            startDateDisplay: (forecastStartDate == '' ? '' : months[Number(moment(forecastStartDate).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDate).startOf('month').format("YYYY"))),
            endDateDisplay: (forecastStopDate == '' ? '' : months[Number(moment(forecastStopDate).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDate).startOf('month').format("YYYY"))),
        }, () => {
            this.buildMissingPUJexcelForCreateTree();
        });
    }
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildMissingPUJexcelForCreateTree() {
        this.getPlanningUnitWithPricesByIds();
        var missingPUListForCreateTree = this.state.missingPUListForCreateTree;
        var dataArray = [];
        let count = 0;
        if (missingPUListForCreateTree.length > 0) {
            for (var j = 0; j < missingPUListForCreateTree.length; j++) {
                data = [];
                data[0] = getLabelText(missingPUListForCreateTree[j].productCategory.label, this.state.lang)
                data[1] = getLabelText(missingPUListForCreateTree[j].planningUnit.label, this.state.lang) + " | " + missingPUListForCreateTree[j].planningUnit.id
                data[2] = missingPUListForCreateTree[j].consuptionForecast;
                data[3] = missingPUListForCreateTree[j].treeForecast;
                data[4] = missingPUListForCreateTree[j].stock;
                data[5] = missingPUListForCreateTree[j].existingShipments;
                data[6] = missingPUListForCreateTree[j].monthsOfStock;
                data[7] = (missingPUListForCreateTree[j].price === "" || missingPUListForCreateTree[j].price == null || missingPUListForCreateTree[j].price == undefined) ? "" : (missingPUListForCreateTree[j].procurementAgent == null || missingPUListForCreateTree[j].procurementAgent == undefined ? -1 : missingPUListForCreateTree[j].procurementAgent.id);
                data[8] = missingPUListForCreateTree[j].price;
                data[9] = missingPUListForCreateTree[j].planningUnitNotes;
                data[10] = missingPUListForCreateTree[j].planningUnit.id;
                data[11] = missingPUListForCreateTree[j].programPlanningUnitId;
                data[12] = missingPUListForCreateTree[j].higherThenConsumptionThreshold;
                data[13] = missingPUListForCreateTree[j].lowerThenConsumptionThreshold;
                data[14] = missingPUListForCreateTree[j].selectedForecastMap;
                data[15] = missingPUListForCreateTree[j].otherUnit;
                data[16] = missingPUListForCreateTree[j].createdBy;
                data[17] = missingPUListForCreateTree[j].createdDate;
                data[18] = true;
                dataArray[count] = data;
                count++;
            }
        }
        this.el = jexcel(document.getElementById("missingPUJexcelForCreateTree"), '');
        jexcel.destroy(document.getElementById("missingPUJexcelForCreateTree"), true);
        var data = dataArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [20, 80],
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
            onload: this.loadedMissingPUForCreateTree,
            onchange: this.changedMissingPUForCreateTree,
            pagination: localStorage.getItem("sesRecordCount"),
            search: false,
            columnSorting: true,
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
        var missingPUJexcelForCreateTree = jexcel(document.getElementById("missingPUJexcelForCreateTree"), options);
        this.el = missingPUJexcelForCreateTree;
        this.setState({
            missingPUJexcelForCreateTree
        }
        );
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedMissingPUForCreateTree = function (instance, cell) {
        jExcelLoadedFunctionOnlyHideRow(instance, 1);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
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
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changedMissingPUForCreateTree = function (instance, cell, x, y, value) {
        if (x == 18) {
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
            if (value.toString() == "false") {
                this.el.setValueFromCoords(2, y, this.state.missingPUListForCreateTree[y].consuptionForecast, true);
                this.el.setValueFromCoords(3, y, this.state.missingPUListForCreateTree[y].treeForecast, true);
                this.el.setValueFromCoords(4, y, this.state.missingPUListForCreateTree[y].stock, true);
                this.el.setValueFromCoords(5, y, this.state.missingPUListForCreateTree[y].existingShipments, true);
                this.el.setValueFromCoords(6, y, this.state.missingPUListForCreateTree[y].monthsOfStock, true);
                this.el.setValueFromCoords(7, y, (this.state.missingPUListForCreateTree[y].price === "" || this.state.missingPUListForCreateTree[y].price == null || this.state.missingPUListForCreateTree[y].price == undefined) ? "" : (this.state.missingPUListForCreateTree[y].procurementAgent == null || this.state.missingPUListForCreateTree[y].procurementAgent == undefined ? -1 : this.state.missingPUListForCreateTree[y].procurementAgent.id), true);
                this.el.setValueFromCoords(8, y, this.state.missingPUListForCreateTree[y].price, true);
                this.el.setValueFromCoords(9, y, this.state.missingPUListForCreateTree[y].planningUnitNotes, true);
                this.el.setValueFromCoords(10, y, this.state.missingPUListForCreateTree[y].planningUnit.id, true);
                this.el.setValueFromCoords(11, y, this.state.missingPUListForCreateTree[y].programPlanningUnitId, true);
                this.el.setValueFromCoords(12, y, this.state.missingPUListForCreateTree[y].higherThenConsumptionThreshold, true);
                this.el.setValueFromCoords(13, y, this.state.missingPUListForCreateTree[y].lowerThenConsumptionThreshold, true);
                this.el.setValueFromCoords(14, y, this.state.missingPUListForCreateTree[y].selectedForecastMap, true);
                this.el.setValueFromCoords(15, y, this.state.missingPUListForCreateTree[y].otherUnit, true);
                this.el.setValueFromCoords(16, y, this.state.missingPUListForCreateTree[y].createdBy, true);
                this.el.setValueFromCoords(17, y, this.state.missingPUListForCreateTree[y].createdDate, true);
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
     * Reterives planning unit list with procurement agent price
     */
    getPlanningUnitWithPricesByIds() {
        PlanningUnitService.getPlanningUnitWithPricesByIds(this.state.missingPUListForCreateTree.map(ele => (ele.planningUnit.id).toString()))
            .then(response => {
                var listArray = response.data;
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
    checkValidationForMissingPUList() {
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
        var validation = this.checkValidationForMissingPUList();
        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
        var curUser = AuthenticationService.getLoggedInUserId();
        let indexVar = 0;
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            var planningUnitList = [];
            var programs = [];
            var missingPUListForCreateTree = this.state.missingPUListForCreateTree;
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
                    var planningUnitObj = this.state.planningUnitObjList.filter(c => c.planningUnitId == missingPUListForCreateTree[i].planningUnit.id)[0]
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
                        "active": true
                    }
                    planningUnitList.push(tempJson);
                } else {
                    updatedMissingPUList.push(missingPUListForCreateTree[i])
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
                    var programId = this.state.datasetIdModalForCreateTree.split("_")[0];
                    var versionId = (this.state.datasetIdModalForCreateTree.split("_")[1]).split("v")[1];
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
                        var id = this.state.datasetIdModalForCreateTree;
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
                                    missingPUListForCreateTree: updatedMissingPUList,
                                    datasetListJexcelForCreateTree: downloadedProgramData
                                }, () => {
                                    this.hideThirdComponent();
                                    if (this.state.missingPUListForCreateTree.length > 0) {
                                        this.buildMissingPUJexcelForCreateTree();
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
    handleRegionChangeForCreateTree = (regionIds) => {
        this.setState({
            regionValuesForCreateTree: regionIds.map(ele => ele),
        }, () => {
            var regionListForCreateTree = [];
            var regions = this.state.regionValuesForCreateTree;
            for (let i = 0; i < regions.length; i++) {
                var json = {
                    id: regions[i].value,
                    label: {
                        label_en: regions[i].label
                    }
                }
                regionListForCreateTree.push(json);
            }
            this.setState({ regionListForCreateTree });
        })
    }
    /**
     * Filters the usage template list based on the provided forecasting unit ID. If a valid ID is provided, the list will be filtered to include only the templates associated with that forecasting unit. If the ID is 0 or not provided, the entire usage template list will be returned.
     * @param {number} forecastingUnitId The ID of the forecasting unit to filter by.
     */
    filterUsageTemplateList(forecastingUnitId) {
        var usageTemplateList;
        if (forecastingUnitId > 0) {
            usageTemplateList = this.state.usageTemplateListAll.filter(x => x.forecastingUnit.id == forecastingUnitId);
        } else {
            usageTemplateList = this.state.usageTemplateListAll;
        }
        this.setState({ usageTemplateList });
    }
    /**
     * Handles the click event for a level. Extracts information about the clicked level from the provided data and updates the component state with the level's name, number, and unit. If the provided data is empty, no action is taken.
     * @param {Object} data The data object containing information about the clicked level.
     */
    levelClicked(data) {
        var name = "";
        var unit = "";
        var levelNo = "";
        if (data != "") {
            var treeLevelList = this.state.treeTemplate.levelList != undefined ? this.state.treeTemplate.levelList : [];
            var levelListFiltered = treeLevelList.filter(c => c.levelNo == data.context.levels[0]);
            levelNo = data.context.levels[0]
            if (levelListFiltered.length > 0) {
                name = levelListFiltered[0].label.label_en;
                unit = levelListFiltered[0].unit != null && levelListFiltered[0].unit.id != null ? levelListFiltered[0].unit.id : "";
            }
        }
        this.setState({
            levelModal: !this.state.levelModal,
            levelName: name,
            levelNo: levelNo,
            levelUnit: unit
        })
    }
    /**
     * Updates the component state with the new name for a level when the name input field is changed.
     * @param {Object} e The event object representing the input change event.
     */
    levelNameChanged(e) {
        this.setState({
            levelName: e.target.value
        })
    }
    /**
     * Updates the component state with the new unit ID for a level when the unit selection is changed.
     * @param {Object} e The event object representing the unit selection change event.
     */
    levelUnitChange(e) {
        var nodeUnitId = e.target.value;
        this.setState({
            levelUnit: e.target.value
        })
    }
    /**
     * Saves level details in state
     */
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
                if (this.state.levelUnit != "" && this.state.levelUnit != null) {
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
                        id: this.state.levelUnit != "" && this.state.levelUnit != null ? parseInt(this.state.levelUnit) : null,
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
                if (this.state.levelUnit != "" && this.state.levelUnit != null) {
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
                        id: this.state.levelUnit != "" && this.state.levelUnit != null ? parseInt(this.state.levelUnit) : null,
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
        this.setState({
            levelModal: false,
            treeTemplate,
            isTemplateChanged: true
        }, () => {
        });
    }
    /**
     * Retrieves the start value (momValue) for the specified start date from the item's mom list or the default data value if not found.
     * @param {string} startDate - The start date for the mom value.
     * @returns {number} - The mom start value for the given date.
     */
    getMomValueForDateRange(startDate) {
        var startValue = 0;
        var items = this.state.items;
        var item = items.filter(x => x.id == this.state.currentItemConfig.context.id);
        if (item.length > 0) {
            var momList = item[0].payload.nodeDataMap[0][0].nodeDataMomList;
            if (momList.length > 0) {
                var mom = momList.filter(x => x.month == startDate);
                if (mom.length > 0) {
                    startValue = mom[0].startValue;
                }
            }
        } else {
            startValue = this.state.currentItemConfig.context.payload.nodeDataMap[0][0].dataValue
        }
        return startValue;
    }
    /**
     * Updates the data of the tree items based on the given month ID. 
     * Calculates and displays values for each item, considering different node types.
     * @param {string} monthId - The ID of the month to update data for.
     */
    updateTreeData(monthId) {
        var items = this.state.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].payload.nodeDataMap[0][0].nodeDataMomList != null) {
                var nodeDataModelingMap = items[i].payload.nodeDataMap[0][0].nodeDataMomList.filter(x => x.month == monthId);
                if (nodeDataModelingMap.length > 0) {
                    if (nodeDataModelingMap[0].calculatedValue != null && nodeDataModelingMap[0].endValue != null) {
                        if (items[i].payload.nodeType.id == 5) {
                            (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue = nodeDataModelingMap[0].calculatedMmdValue != null ? nodeDataModelingMap[0].calculatedMmdValue.toString() : '';
                        } else {
                            (items[i].payload.nodeDataMap[0])[0].displayCalculatedDataValue = nodeDataModelingMap[0].calculatedValue.toString();
                        }
                        (items[i].payload.nodeDataMap[0])[0].displayDataValue = nodeDataModelingMap[0].endValue.toString();
                    } else {
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
            if (items[i].payload.nodeType.id == 4) {
                var fuPerMonth, totalValue, usageFrequency, convertToMonth;
                var noOfForecastingUnitsPerPerson = (items[i].payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson;
                if ((items[i].payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 || ((items[i].payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (items[i].payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true)) {
                    usageFrequency = (items[i].payload.nodeDataMap[0])[0].fuNode.usageFrequency;
                    var usagePeriodConvertToMonth = convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == (items[i].payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId));
                    convertToMonth = usagePeriodConvertToMonth.length > 0 ? usagePeriodConvertToMonth[0].convertToMonth : '';
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
                (items[i].payload.nodeDataMap[0])[0].fuPerMonth = fuPerMonth;
            }
            if (items[i].payload.nodeType.id == 5) {
                var findNodeIndexFU = items.findIndex(n => n.id == items[i].parent);
                var forecastingUnitId = (items[findNodeIndexFU].payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id;
                PlanningUnitService.getActivePlanningUnitListByFUId(forecastingUnitId).then(response => {
                    var listArray = response.data;
                    var planningUnitId = (items[i].payload.nodeDataMap[0])[0].puNode.planningUnit.id;
                    var planningUnitList = listArray;
                    var planningUnitListFilter = planningUnitList.filter(c => c.planningUnitId == planningUnitId);
                    if (planningUnitListFilter.length > 0) {
                        (items[i].payload.nodeDataMap[0])[0].isPUMappingCorrect = 1
                    } else {
                        (items[i].payload.nodeDataMap[0])[0].isPUMappingCorrect = 0
                    }
                    if ((items.length - 1) == i) {
                        this.setState({
                            items
                        }, () => {
                        })
                    }
                }).catch(error => {
                })
            }
        }
        this.setState({
            items
        }, () => {
        })
    }
    /**
     * Generate month list based on month in past and month in future
     */
    generateMonthList() {
        var monthList = [];
        var json;
        var monthId;
        var monthsInPast = 1;
        var monthsInFuture = 36;
        var treeTemplate = this.state.treeTemplate;
        if (treeTemplate.hasOwnProperty('monthsInPast')) {
            monthsInPast = treeTemplate.monthsInPast;
            monthsInFuture = treeTemplate.monthsInFuture;
            if (monthsInPast != undefined) {
                for (let i = -monthsInPast; i <= monthsInFuture; i++) {
                    if (i != 0) {
                        json = {
                            id: i,
                            name: "Month " + i
                        };
                        if (i == 1) {
                            monthId = i;
                        }
                        monthList.push(json);
                    }
                }
                if (monthList.length > 0) {
                    var minDate = monthList[0];
                    var maxDate = JSON.parse(JSON.stringify(monthList)).sort((a, b) => b.id - a.id)[0].id;
                    this.setState({
                        minDate, maxDate
                    })
                }
                this.setState({ monthList, monthId }, () => { if (this.state.showCalculatorFields) { this.buildModelingCalculatorJexcel() } });
            }
        }
    }
    /**
     * Calculates the parent value from the Month-on-Month (MOM) data for the given month.
     * Updates the current item's calculated data value based on the percentage of the parent value.
     * 
     * @param {string} month - The month for which to calculate the parent value from MOM data.
     */
    calculateParentValueFromMOM(month) {
        var parentValue = 0;
        var currentItemConfig = this.state.currentItemConfig;
        if (currentItemConfig.context.payload.nodeType.id != 1 && currentItemConfig.context.payload.nodeType.id != 2) {
            var items = this.state.items;
            var parentItem = items.filter(x => x.id == currentItemConfig.context.parent);
            if (parentItem.length > 0) {
                var nodeDataMomList = parentItem[0].payload.nodeDataMap[0][0].nodeDataMomList;
                if (nodeDataMomList.length) {
                    var momDataForNode = nodeDataMomList.filter(x => x.month == month);
                    if (momDataForNode.length > 0) {
                        if (currentItemConfig.context.payload.nodeType.id == 5) {
                            parentValue = momDataForNode[0].calculatedMmdValue;
                        } else {
                            parentValue = momDataForNode[0].calculatedValue;
                        }
                    }
                }
            }
            var percentageOfParent = currentItemConfig.context.payload.nodeDataMap[0][0].dataValue;
            currentItemConfig.context.payload.nodeDataMap[0][0].calculatedDataValue = ((percentageOfParent * parentValue) / 100).toString();
        }
        this.setState({ parentValue, currentItemConfig }, () => {
        });
    }
    /**
     * Calculates the planning unit usage per visit (PU per visit) based on the current item's configuration and usage type.
     * Updates the PU per visit value in the current item's node data map.
     * @param {number} type - The type of calculation to perform. 1 for refill months calculation, 2 for standard calculation.
     */
    qatCalculatedPUPerVisit(type) {
        var currentItemConfig = this.state.currentItemConfig;
        var qatCalculatedPUPerVisit = "";
        if (currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id != "") {
            var pu = this.state.planningUnitList.filter(x => x.planningUnitId == currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id)[0];
            if (currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) {
                var refillMonths = 1;
                qatCalculatedPUPerVisit = parseFloat(((currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / (pu != undefined ? pu.multiplier : 1)).toFixed(8);
            } else {
                qatCalculatedPUPerVisit = parseFloat(this.state.noFURequired / (pu != undefined ? pu.multiplier : 1)).toFixed(8);
            }
            if (type == 1) {
                if (currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) {
                    currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths = 1;
                }
                currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit = qatCalculatedPUPerVisit;
            }
            if (type == 2) {
                currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit = qatCalculatedPUPerVisit;
            }
        }
        this.setState({ qatCalculatedPUPerVisit });
    }
    /**
     * Calculates the planning unit usage per visit (PU per visit) based on the current scenario configuration and usage type.
     * Updates the PU per visit value in the current scenario's node data map.
     * @param {boolean} isRefillMonth - Indicates whether the calculation is for refill months. 
     * If true, the refill months value will be used; otherwise, the standard calculation will be performed.
     */
    calculatePUPerVisit(isRefillMonth) {
        var currentScenario = this.state.currentItemConfig.context.payload.nodeDataMap[0][0];
        var parentScenario = this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0];
        var currentItemConfig = this.state.currentItemConfig;
        var conversionFactor = this.state.conversionFactor;
        var puPerVisit = "";
        var refillMonths = isRefillMonth && currentScenario.puNode.refillMonths != "" ? currentScenario.puNode.refillMonths : this.round(parseFloat(conversionFactor / (parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)).toFixed(4));
        if (parentScenario.fuNode.usageType.id == 2) {
            var refillMonths = 1;
            puPerVisit = parseFloat(((parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / conversionFactor).toFixed(8);
        } else if (parentScenario.fuNode.usageType.id == 1) {
            puPerVisit = parseFloat(this.state.noFURequired / conversionFactor).toFixed(8);
        }
        currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit = puPerVisit;
        if (!isRefillMonth) {
            currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths = refillMonths;
        }
        this.setState({ currentItemConfig });
    }
    /**
     * Rounds a given numeric value to the nearest integer using custom rounding logic.
     * @param {number} value - The numeric value to round.
     * @returns {number} The rounded integer value.
     */
    round(value) {
        var result = (value - Math.floor(value)).toFixed(4);
        if (result > `${ROUNDING_NUMBER}`) {
            return Math.ceil(value);
        } else {
            if (Math.floor(value) == 0) {
                return Math.ceil(value);
            } else {
                return Math.floor(value);
            }
        }
    }
    /**
     * Handles the change event when a forecasting unit (FU) is selected.
     * Updates the state with the selected forecasting unit values and triggers related actions.
     * @param {object} regionIds - The selected forecasting unit region IDs.
     */
    handleFUChange = (regionIds) => {
        const { currentItemConfig } = this.state;
        this.setState({
            fuValues: regionIds != null ? regionIds : "",
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
            this.setState({ currentItemConfig }, () => {
            });
        })
    }
    /**
     * Exports data in PDF format
     */
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
                    lineType: LineType.Dotted
                }));
            }
        }
        var templates = [
            {
                itemSize: new Size(200, 110)
            }
        ]
        var items1 = this.state.items;
        var newItems = [];
        for (var i = 0; i < items1.length; i++) {
            var e = items1[i];
            e.scenarioId = 0
            e.showModelingValidation = this.state.showModelingValidation
            e.result = this.getPayloadData(items1[i], 4)
            e.result1 = this.getPayloadData(items1[i], 6)
            e.result2 = this.getPayloadData(items1[i], 5)
            var text = this.getPayloadData(items1[i], 3)
            e.text = text;
            delete e.templateName;
            newItems.push(e)
        }
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
        var doc = new PDFDocument({ size: 'B0' });
        var stream = doc.pipe(blobStream());
        var legalSize = { width: 2834.65, height: 4008.19 }
        var scale = Math.min(legalSize.width / (sample3size.width + 300), legalSize.height / (sample3size.height + 300))
        doc.scale(scale);
        doc
            .fillColor('#002f6c')
            .fontSize(20)
            .font('Helvetica')
            .text('Tree Template PDF', doc.page.width / 2, 20);
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
                window.saveAs(string, i18n.t('static.dataset.TreeTemplate') + '.pdf');
            });
        } else {
            alert('Error: Failed to create file stream.');
        }
        newItems = [];
        for (var i = 0; i < items1.length; i++) {
            var e = items1[i];
            e.scenarioId = 0
            e.showModelingValidation = this.state.showModelingValidation
            e.result = this.getPayloadData(items1[i], 4)
            e.result1 = this.getPayloadData(items1[i], 6)
            e.result2 = this.getPayloadData(items1[i], 5)
            var text = this.getPayloadData(items1[i], 3)
            e.text = text;
            if (items1[i].expanded)
                e.templateName = "contactTemplateMin";
            else
                e.templateName = "contactTemplate";
            newItems.push(e)
        }
    }
    /**
     * Finds max node data Id
     * @returns Max node data Id
     */
    getMaxNodeDataId() {
        var maxNodeDataId = 0;
        var items = this.state.items;
        var nodeDataMap = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].payload.nodeDataMap.hasOwnProperty(0)) {
                nodeDataMap.push(items[i].payload.nodeDataMap[0][0]);
            }
        }
        maxNodeDataId = nodeDataMap.length > 0 ? Math.max(...nodeDataMap.map(o => o.nodeDataId)) : 0;
        this.setState({
            maxNodeDataId
        })
        return maxNodeDataId;
    }
    /**
     * Hides the message in div2 after 30 seconds.
     */
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * Show loading screen on form submit and call formSubmit function
     */
    formSubmitLoader() {
        this.setState({
            modelingJexcelLoader: true,
            isTemplateChanged: true
        }, () => {
            setTimeout(() => {
                this.formSubmit();
            }, 0);
        })
    }
    /**
     * Handles data change for manual change and seasonality checkbox.
     * @param {Event} event - The change event.
     * @param {number} type - Type of node. 1 for number node otherwise for percentage node
     */
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
            });
        }
    }
    /**
     * Calls modeling data calculation function to calculate month on month data
     * @param {*} nodeId Node Id for which the month on month should be built
     * @param {*} type Type of the node
     */
    calculateMOMData(nodeId, type) {
        let { treeTemplate } = this.state;
        var items = this.state.items;
        treeTemplate.flatList = items;
        calculateModelingDataForTreeTemplate(treeTemplate, this, '', (nodeId != 0 ? nodeId : this.state.currentItemConfig.context.id), 0, type, -1, true);
    }
    /**
     * This function is used to update the state of this component from any other component
     * @param {*} parameterName This is the name of the key
     * @param {*} value This is the value for the key
     */
    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        }, () => {
            if (parameterName == 'nodeId' && (value != null && value != 0)) {
                var items = this.state.items;
                var nodeDataMomList = this.state.nodeDataMomList;
                if (nodeDataMomList.length > 0) {
                    for (let i = 0; i < nodeDataMomList.length; i++) {
                        var nodeId = nodeDataMomList[i].nodeId;
                        var nodeDataMomListForNode = nodeDataMomList[i].nodeDataMomList;
                        var node = items.filter(n => n.id == nodeId)[0];
                        (node.payload.nodeDataMap[0])[0].nodeDataMomList = nodeDataMomListForNode;
                        var findNodeIndex = items.findIndex(n => n.id == nodeId);
                        items[findNodeIndex] = node;
                    }
                }
                this.setState({ items })
            }
            if (parameterName == 'type' && (value == 1 || value == 0)) {
                if (this.state.currentItemConfig.context.payload.nodeType.id == 1 || this.state.currentItemConfig.context.payload.nodeType.id == 2) {
                    var nodeDataMomList = this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id);
                    if (nodeDataMomList.length > 0) {
                        this.setState({ momList: nodeDataMomList[0].nodeDataMomList }, () => {
                            if (this.state.modelingEl != null && this.state.modelingEl != undefined && this.state.modelingEl != "") {
                                this.filterScalingDataByMonth(this.state.scalingMonth, nodeDataMomList[0].nodeDataMomList);
                            }
                            if (value == 1 || (value == 0 && this.state.showMomData)) {
                                this.buildMomJexcel();
                            }
                        });
                    }
                } else if (this.state.currentItemConfig.context.payload.nodeType.id == 3 || this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5) {
                    var momList = this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id);
                    if (momList.length > 0) {
                        this.setState({ momListPer: momList.length > 0 ? momList[0].nodeDataMomList : [] }, () => {
                            if (this.state.modelingEl != null && this.state.modelingEl != undefined && this.state.modelingEl != "") {
                                this.filterScalingDataByMonth(this.state.scalingMonth, this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList);
                            }
                            if (value == 1 || (value == 0 && this.state.showMomDataPercent)) {
                                this.buildMomJexcelPercent();
                            }
                        });
                    }
                }
            }
            if (parameterName == 'programId' && value != "") {
                try {
                    var programId = this.state.programId;
                    var program = this.state.datasetListJexcelForCreateTree;
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
                        username:AuthenticationService.getLoggedInUsername()
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
                } catch (error) {
                }
            }
            this.updateTreeData(this.state.monthId);
            if (parameterName == 'type' && value == 0) {
                this.calculateValuesForAggregateNode(this.state.items);
            }
        })
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
                db1 = e.target.result;
                var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetIdModalForCreateTree);
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
                    }
                });
            }.bind(this);
            transaction.onerror = function (event) {
                this.setState({
                    loading: false,
                    color: "red",
                }, () => {
                    this.hideSecondComponent();
                });
            }.bind(this);
        }.bind(this);
    }
    /**
     * Updates months on months data after manual change and seasonality perc change
     */
    updateMomDataInDataSet() {
        this.setState({
            momJexcelLoader: true,
            isTemplateChanged: true
        }, () => {
            setTimeout(() => {
                var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
                var json = nodeTypeId == 2 ? this.state.momEl.getJson(null, false) : this.state.momElPer.getJson(null, false);
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
                            overrideListArray.push(overrideData);
                        }
                    }
                }
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
                        calculateModelingDataForTreeTemplate(treeTemplate, this, '', currentItemConfig.context.id, 0, 1, -1, true);
                    });
                });
            }, 0);
        });
    }
    /**
     * Filters scaling data by month and updates the modeling elements accordingly.
     * Calculates the scaling difference for the specified date and updates the state with the total difference and the scaling month.
     * @param {string} date - The date for which scaling data needs to be filtered.
     * @param {array} nodeDataMomListParam - (Optional) The node data mom list to use for filtering. If not provided, uses the node data mom list from the current item configuration.
     */
    filterScalingDataByMonth(date, nodeDataMomListParam) {
        var json = this.state.modelingEl.getJson(null, false);
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
            const result = date >= startDate && date <= stopDate ? true : false;
            if (result) {
                var nodeValue = 0;
                let scalingDate = date;
                if (modelingTypeId == 3) {
                    var nodeDataMomListFilter = [];
                    if (map1.get("12") == 1) {
                        var nodeDataMomListOfTransferNode = (this.state.items.filter(c => map1.get("3") != "" ? (c.payload.nodeDataMap[0])[0].nodeDataId == map1.get("3").split('_')[0] : (c.payload.nodeDataMap[0])[0].nodeDataId == map1.get("3"))[0].payload.nodeDataMap[0])[0].nodeDataMomList;
                        nodeDataMomListFilter = nodeDataMomListOfTransferNode.filter(c => c.month == startDate)
                    } else {
                        nodeDataMomListFilter = nodeDataMomList.filter(c => c.month == startDate)
                    }
                    if (nodeDataMomListFilter.length > 0) {
                        nodeValue = nodeDataMomListFilter[0].startValue;
                    }
                }
                if (modelingTypeId == 4) {
                    var nodeDataMomListFilter = [];
                    if (map1.get("12") == 1) {
                        var nodeDataMomListOfTransferNode = (this.state.items.filter(c => map1.get("3") != "" ? (c.payload.nodeDataMap[0])[0].nodeDataId == map1.get("3").split('_')[0] : (c.payload.nodeDataMap[0])[0].nodeDataId == map1.get("3"))[0].payload.nodeDataMap[0])[0].nodeDataMomList;
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
        }
        var scalingDifference = nodeDataMomList.filter(c => c.month == date);
        if (scalingDifference.length > 0) {
            scalingTotal += scalingDifference[0].difference;
        }
        this.setState({ scalingTotal, scalingMonth: date });
    }
    /**
     * Resets the node details on reset button clicked
     */
    resetNodeData() {
        const { orgCurrentItemConfig, currentItemConfig } = this.state;
        var nodeTypeId;
        var fuValues = [];
        if (currentItemConfig.context.level != 0 && currentItemConfig.parentItem.payload.nodeType.id == 4) {
            nodeTypeId = PU_NODE_ID;
        } else {
            nodeTypeId = currentItemConfig.context.payload.nodeType.id;
        }
        currentItemConfig.context = JSON.parse(JSON.stringify(orgCurrentItemConfig));
        if (nodeTypeId == 5) {
            currentItemConfig.context.payload.nodeType.id = nodeTypeId;
            currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id;
            if (this.state.addNodeFlag) {
                var parentCalculatedDataValue = this.state.items.filter(x => x.id == currentItemConfig.context.parent)[0].payload.nodeDataMap[0][0].calculatedDataValue;
                currentItemConfig.context.payload.nodeDataMap[0][0].dataValue = 100;
                currentItemConfig.context.payload.nodeDataMap[0][0].calculatedDataValue = ((100 * parentCalculatedDataValue) / 100).toString();
            }
            var planningUnit = this.state.planningUnitList.filter(x => x.planningUnitId == currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id);
            var conversionFactor = planningUnit.length > 0 ? planningUnit[0].multiplier : "";
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
        }, () => {
            if (nodeTypeId == 4) {
                this.getForecastingUnitListByTracerCategoryId(0, 0);
            }
        });
    }
    /**
     * Handles form submission of modeling data
     */
    formSubmit() {
        if (this.state.modelingJexcelLoader === true) {
            var validation = this.state.lastRowDeleted == true ? true : this.checkValidation();
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
                    for (var i = 0; i < tableJson.length; i++) {
                        var map1 = new Map(Object.entries(tableJson[i]));
                        if (parseInt(map1.get("12")) != 1) {
                            var startDate = map1.get("1");
                            var stopDate = map1.get("2");
                            if (map1.get("10") != "" && map1.get("10") != 0) {
                                const itemIndex = data.findIndex(o => o.nodeDataModelingId === map1.get("10"));
                                obj = data.filter(x => x.nodeDataModelingId == map1.get("10"))[0];
                                var transfer = map1[3] != "" ? map1.get("3").split('_')[0] : '';
                                obj.transferNodeDataId = transfer;
                                obj.notes = map1.get("0");
                                obj.modelingType.id = map1.get("4");
                                obj.startDateNo = startDate;
                                obj.stopDateNo = stopDate;
                                obj.increaseDecrease = map1.get("5");
                                obj.dataValue = map1.get("4") == 2 ? map1.get("7").toString().replaceAll(",", "") : map1.get("6").toString().replaceAll(",", "").split("%")[0];
                                obj.nodeDataModelingId = map1.get("10")
                                obj.modelingSource = map1.get("14") == "" ? 0 : map1.get("14")
                            } else {
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
                                    nodeDataModelingId: parseInt(maxModelingId) + 1,
                                    modelingSource: map1.get("14") == "" ? 0 : map1.get("14")
                                }
                                maxModelingId++;
                            }
                            dataArr.push(obj);
                        }
                    }
                    if (itemIndex1 != -1) {
                        if (this.state.isValidError.toString() == "false") {
                            item.payload = this.state.currentItemConfig.context.payload;
                            if (dataArr.length > 0) {
                                (item.payload.nodeDataMap[0])[0].nodeDataModelingList = dataArr;
                                (item.payload.nodeDataMap[0])[0].annualTargetCalculator = {
                                    firstMonthOfTarget: this.state.firstMonthOfTarget,
                                    yearsOfTarget: this.state.yearsOfTarget,
                                    actualOrTargetValueList: this.state.actualOrTargetValueList
                                };
                            }
                            if (this.state.lastRowDeleted == true) {
                                (item.payload.nodeDataMap[0])[0].nodeDataModelingList = [];
                            }
                            items[itemIndex1] = item;
                            this.setState({
                                items,
                                scalingList: dataArr,
                                lastRowDeleted: false,
                                modelingChanged: false,
                                activeTab1: new Array(2).fill('2'),
                                firstMonthOfTarget: "",
                                yearsOfTarget: "",
                                actualOrTargetValueList: []
                            }, () => {
                                this.calculateMOMData(0, 0);
                            });
                        } else {
                            this.setState({
                                modelingJexcelLoader: false
                            }, () => {
                                alert("Please fill all the required fields in Node Data Tab");
                            });
                        }
                    } else {
                        if (this.state.isValidError.toString() == "false") {
                            this.onAddButtonClick(this.state.currentItemConfig, true, dataArr);
                        } else {
                            this.setState({
                                modelingJexcelLoader: false
                            }, () => {
                                alert("Please fill all the required fields in Node Data Tab");
                            });
                        }
                    }
                } catch (err) {
                    localStorage.setItem("scalingErrorTemplate", err);
                }
            } else {
                this.setState({ modelingJexcelLoader: false })
            }
        }
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation() {
        var valid = true;
        var json = this.state.modelingEl.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.state.modelingEl.getValueFromCoords(11, y);
            if (parseInt(value) == 1) {
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.state.modelingEl.getValueFromCoords(4, y);
                if (value == "") {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setStyle(col, "background-color", "yellow");
                    this.state.modelingEl.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setComments(col, "");
                }
                var col = ("F").concat(parseInt(y) + 1);
                var value = this.state.modelingEl.getValueFromCoords(5, y);
                if (value == "") {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setStyle(col, "background-color", "yellow");
                    this.state.modelingEl.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setComments(col, "");
                }
                var elInstance = this.state.modelingEl;
                var rowData = elInstance.getRowData(y);
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.state.modelingEl.getValueFromCoords(1, y);
                if (value == "") {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setStyle(col, "background-color", "yellow");
                    this.state.modelingEl.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setComments(col, "");
                }
                var startDate = rowData[1];
                var stopDate = rowData[2];
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.state.modelingEl.getValueFromCoords(2, y);
                if (value == "") {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setStyle(col, "background-color", "yellow");
                    this.state.modelingEl.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                }
                else if (stopDate <= startDate) {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setStyle(col, "background-color", "yellow");
                    this.state.modelingEl.setComments(col, i18n.t('static.validation.pleaseEnterValidDate'));
                    valid = false;
                }
                else {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setComments(col, "");
                }
                if (rowData[4] != "") {
                    var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE;
                    if (rowData[4] != 2) {
                        var col = ("G").concat(parseInt(y) + 1);
                        var value = this.state.modelingEl.getValueFromCoords(6, y);
                        if (value === "") {
                            this.state.modelingEl.setStyle(col, "background-color", "transparent");
                            this.state.modelingEl.setStyle(col, "background-color", "yellow");
                            this.state.modelingEl.setComments(col, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        }
                        else {
                            if (isNaN(Number(value)) || !(reg.test(value)) || (1 == 1 && (1 == 1 ? value < 0 : value <= 0))) {
                                this.state.modelingEl.setStyle(col, "background-color", "transparent");
                                this.state.modelingEl.setStyle(col, "background-color", "yellow");
                                this.state.modelingEl.setComments(col, i18n.t('static.message.invalidnumber'));
                                valid = false;
                            } else {
                                this.state.modelingEl.setStyle(col, "background-color", "transparent");
                                this.state.modelingEl.setComments(col, "");
                            }
                        }
                    }
                    if (rowData[4] == 2) {
                        var col = ("H").concat(parseInt(y) + 1);
                        var value = this.state.modelingEl.getValueFromCoords(7, y);
                        if (value === "") {
                            this.state.modelingEl.setStyle(col, "background-color", "transparent");
                            this.state.modelingEl.setStyle(col, "background-color", "yellow");
                            this.state.modelingEl.setComments(col, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        }
                        else {
                            if (isNaN(Number(value)) || !(reg.test(value)) || (1 == 1 && (1 == 1 ? value < 0 : value <= 0))) {
                                this.state.modelingEl.setStyle(col, "background-color", "transparent");
                                this.state.modelingEl.setStyle(col, "background-color", "yellow");
                                this.state.modelingEl.setComments(col, i18n.t('static.message.invalidnumber'));
                                valid = false;
                            } else {
                                this.state.modelingEl.setStyle(col, "background-color", "transparent");
                                this.state.modelingEl.setComments(col, "");
                            }
                        }
                    }
                }
            }
        }
        return valid;
    }
    /**
     * Function to calculate scaling total
     */
    calculateScalingTotal() {
        var scalingTotal = 0;
        var tableJson = this.state.modelingEl.getJson(null, false);
        for (var i = 0; i < tableJson.length; i++) {
            var map1 = new Map(Object.entries(tableJson[i]));
            if (map1.get("8") != "") {
                scalingTotal = scalingTotal + parseFloat(map1.get("8"));
            }
        }
        this.setState({
            scalingTotal
        }, () => {
        });
    }
    /**
     * Accepts the calculated value from the modeling calculator and updates the modeling elements accordingly.
     * If the current modeling type is 'Incremental Change (%)', updates modeling element values based on the user input.
     * If the current modeling type is 'Target Change (%)', updates modeling element values based on the user input and calculated target.
     * Hides the calculator fields after accepting the value.
     */
    acceptValue1() {
        var elInstance = this.state.modelingEl;
        if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
            if (this.state.currentModelingType == 5) {
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, 5, true);
                if (this.state.currentTransferData == "" || this.state.currentTransferData=="_T" || this.state.currentTransferData=="_F") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange) < 0 ? -1 : 1, true);
                }
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentCalculatedMomChange)) ? "" : parseFloat(this.state.currentCalculatedMomChange) < 0 ? parseFloat(this.state.currentCalculatedMomChange * -1).toFixed(4) : parseFloat(this.state.currentCalculatedMomChange), true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentCalculatedMomChange).toFixed(4)) ? "" : parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
                elInstance.setValueFromCoords(14, this.state.currentRowIndex, 0, true);
            }
        } else {
            if (this.state.currentModelingType == 2) {
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentModelingType, true);
                if (this.state.currentTransferData == "" || this.state.currentTransferData=="_T" || this.state.currentTransferData=="_F") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentTargetChangeNumber) < 0 ? -1 : 1, true);
                }
                var startDate = this.state.currentCalculatorStartDate;
                var endDate = this.state.currentCalculatorStopDate;
                var monthArr = this.state.monthList.filter(x => x.id > startDate && x.id < endDate);
                var monthDifference = parseInt((monthArr.length > 0 ? parseInt(monthArr.length + 1) : 0) + 1);
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, isNaN(parseFloat((this.state.currentTargetChangeNumber).toString().replaceAll(",", ""))) ? "" : parseFloat((this.state.currentTargetChangeNumber).toString().replaceAll(",", "")) < 0 ? parseFloat(parseFloat((this.state.currentTargetChangeNumber).toString().replaceAll(",", "") / monthDifference).toFixed(4) * -1) : parseFloat(parseFloat((this.state.currentTargetChangeNumber).toString().replaceAll(",", "") / monthDifference).toFixed(4)), true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentCalculatedMomChange).toFixed(4)) ? "" : parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
                elInstance.setValueFromCoords(14, this.state.currentRowIndex, 0, true);
            } else if (this.state.currentModelingType == 3) {
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentModelingType, true);
                if (this.state.currentTransferData == "" || this.state.currentTransferData=="_T" || this.state.currentTransferData=="_F") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.percentForOneMonth) < 0 ? -1 : 1, true);
                }
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, !isFinite(this.state.percentForOneMonth) ? "" : parseFloat(this.state.percentForOneMonth) < 0 ? parseFloat(this.state.percentForOneMonth * -1).toFixed(4) : parseFloat(this.state.percentForOneMonth).toFixed(4), true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentCalculatedMomChange).toFixed(4)) ? "" : parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
                elInstance.setValueFromCoords(14, this.state.currentRowIndex, 0, true);
            } else if (this.state.currentModelingType == 4) {
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentModelingType, true);
                if (this.state.currentTransferData == "" || this.state.currentTransferData=="_T" || this.state.currentTransferData=="_F") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.percentForOneMonth) < 0 ? -1 : 1, true);
                }
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, !isFinite(this.state.percentForOneMonth) ? "" : parseFloat(this.state.percentForOneMonth) < 0 ? parseFloat(this.state.percentForOneMonth * -1).toFixed(4) : parseFloat(this.state.percentForOneMonth).toFixed(4), true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentCalculatedMomChange).toFixed(4)) ? "" : parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
                elInstance.setValueFromCoords(14, this.state.currentRowIndex, 0, true);
            }
        }
        this.setState({ showCalculatorFields: false });
    }
    /**
     * Accepts the value from the modeling calculator.
     * If the target selection is not disabled, calls the `callJexcelBuildFuntion` function to update the modeling elements.
     * If the target selection is disabled, prompts a confirmation and calls `callJexcelBuildFuntion` if confirmed.
     * Resets state variables related to the target selection if not confirmed.
     */
    acceptValue() {
        if (!this.state.targetSelectDisable) {
            this.callJexcelBuildFuntion();
        } else {
            var cf = window.confirm(i18n.t("static.modelingCalculator.confirmAlert"));
            if (cf == true) {
                this.callJexcelBuildFuntion();
            } else {
                this.setState({
                    firstMonthOfTarget: "",
                    yearsOfTarget: "",
                    actualOrTargetValueList: []
                })
            }
        }
    }
    /**
     * Calls the `callJexcelBuildFuntion` function to update the modeling elements based on the calculated value from the modeling calculator.
     * Updates the data value and calculated data value in the current item configuration.
     * Deletes rows from the modeling element, sets start and stop dates, and inserts new rows based on the updated values.
     * Resets state variables related to the modeling calculator and updates the state.
     */
    callJexcelBuildFuntion() {
        let { currentItemConfig } = this.state;
        var json = this.state.modelingCalculatorEl.getJson(null, false);
        var map1 = new Map(Object.entries(json[0]));
        (currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue = map1.get("9").toString().replaceAll(",", "");
        (currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue = map1.get("9").toString().replaceAll(",", "");
        var count = this.state.modelingEl.getData().length;
        for (var i = 0; i < count; i++) {
            this.state.modelingEl.deleteRow(i);
        }
        var startOptions = this.state.modelingEl.getProperty(1);
        startOptions.source = this.state.monthList;
        this.state.modelingEl.setProperty(1, startOptions);
        var stopOptions = this.state.modelingEl.getProperty(2);
        stopOptions.source = this.state.monthList;
        this.state.modelingEl.setProperty(2, stopOptions);
        const reversedList = [...json].reverse();
        for (var i = 0; i < reversedList.length - 1; i++) {
            var map = new Map(Object.entries(reversedList[i]));
            var map1 = new Map(Object.entries(reversedList[i + 1]));
            var data = []
            var stopDate = map.get("8");
            var data2 = (i == 0) ? (map.get("8") - 6) : stopDate;
            data[0] = "Monthly change for " + map.get("7") + " to " + data2 + ";\nConsiders: " + map.get("0") + " Entered Target = " + addCommas(map.get("1")) + "\nCalculated Target = " + addCommas(map.get("4"));
            data[1] = map.get("7");
            data[2] = data2;
            data[3] = '';
            data[4] = this.state.currentModelingType;
            data[5] = parseFloat(map.get("3")).toFixed(4) < 0 ? -1 : 1;;
            data[6] = this.state.currentModelingType != 2 ? Math.abs(parseFloat(map.get("3")).toFixed(4)) : "";
            data[7] = this.state.currentModelingType == 2 ? Math.abs(parseFloat(map.get("3") * map1.get("9") / 100).toFixed(4)) : "";
            data[8] = cleanUp
            data[9] = '';
            data[10] = ''
            data[11] = ''
            data[12] = 0
            data[13] = {
                firstMonthOfTarget: this.state.firstMonthOfTarget,
                yearsOfTarget: this.state.yearsOfTarget,
                actualOrTargetValueList: this.state.actualOrTargetValueList
            }
            data[14] = this.state.targetSelect;
            this.state.modelingEl.insertRow(
                data, 0, 1
            );
        }
        this.setState({
            currentItemConfig,
            currentScenario: (currentItemConfig.context.payload.nodeDataMap[0])[0],
            isChanged: true,
            showCalculatorFields: false,
        }, () => {
            document.getElementById("nodeValue").value = map1.get("9");
            this.calculateParentValueFromMOM(map1.get("8"))
        }
        );
    }
    /**
     * Calculates various metrics such as monthly change, target change number, target change percentage, etc., based on the provided end value and other parameters.
     * @param {Event} e - The event object
     */
    calculateMomByEndValue(e) {
        this.setState({
            currentCalculatedMomChange: '',
            currentTargetChangeNumber: '',
            currentTargetChangePercentage: '',
            percentForOneMonth: ''
        });
        var startDate = this.state.currentCalculatorStartDate;
        var endDate = this.state.currentCalculatorStopDate;
        var monthArr = this.state.monthList.filter(x => x.id > startDate && x.id < endDate);
        var monthDifference = parseInt((monthArr.length > 0 ? parseInt(monthArr.length + 1) : 0) + 1);
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
            } else {
                var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(4);
            }
        }
        if (this.state.currentModelingType == 4) {
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(4);
        }
        if (this.state.currentModelingType == 5) {
            var momValue = parseFloat((getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) / monthDifference).toFixed(4);
        }
        var targetChangeNumber = '';
        var targetChangePer = '';
        var targetChangeNumberForPer = '';
        var targetChangePerForPer = '';
        var targetChangePerForExpoPer = '';
        if (this.state.currentItemConfig.context.payload.nodeType.id < 3) {
            targetChangeNumber = (parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))).toFixed(4);
            targetChangePer = (parseFloat(targetChangeNumber / this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) * 100).toFixed(4);
            targetChangeNumberForPer = (parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) / monthDifference).toFixed(4);
            targetChangePerForPer = (parseFloat(targetChangeNumberForPer / this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) * 100).toFixed(4);
            targetChangePerForExpoPer = ((Math.pow(parseFloat(getValue / this.state.currentCalculatorStartValue), parseFloat(1 / monthDifference)) - 1) * 100).toFixed(4);
            percentForOneMonth = this.state.currentModelingType == 4 ? targetChangePerForExpoPer : targetChangePerForPer;
        }
        this.setState({
            currentTargetChangeNumber: currentEndValue != '' ? targetChangeNumber : '',
            currentTargetChangePercentage: currentEndValue != '' ? targetChangePer : '',
            currentCalculatedMomChange: currentEndValue != '' ? momValue : '',
            percentForOneMonth
        });
    }
    /**
     * Calculates various metrics such as monthly change, target end value, and target change number based on the provided change in percentage and other parameters.
     * @param {Event} e - The event object
     */
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
        var currentTargetChangePercentage = document.getElementById("currentTargetChangePercentage").value;
        currentTargetChangePercentage = currentTargetChangePercentage != "" ? parseFloat(currentTargetChangePercentage) : ''
        var getValue = currentTargetChangePercentage != "" ? currentTargetChangePercentage.toString().replaceAll(",", "").match(/^-?\d+(?:\.\d{0,4})?/)[0] : "";
        var getEndValueFromPercentage = (this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100;
        var targetEndValue = (parseFloat(this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) + parseFloat(getEndValueFromPercentage)).toFixed(4);
        var momValue = '', percentForOneMonth = '';
        if (this.state.currentModelingType == 2) {
            var momValue = ((parseFloat(((this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100) / monthDifference))).toFixed(4);
            percentForOneMonth = getValue / monthDifference;
        }
        if (this.state.currentModelingType == 3) {
            if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
                var getChangeInPercent = getValue;
                var momValue = (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].calculatedDataValue * getChangeInPercent / 100).toFixed(4);
            } else {
                var momValue = ((parseFloat(((this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100) / monthDifference))).toFixed(4);
                percentForOneMonth = getValue / monthDifference;
            }
        }
        if (this.state.currentModelingType == 4) {
            var momValue = ((parseFloat(((this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100) / monthDifference))).toFixed(4);
            percentForOneMonth = parseFloat(((Math.pow((1+(getValue/100)),(1/monthDifference)))-1)*100).toFixed(4);
        }
        if (this.state.currentModelingType == 5) {
            var momValue = (parseFloat(getValue / monthDifference)).toFixed(4);
        }
        var targetChangeNumber = '';
        if (this.state.currentItemConfig.context.payload.nodeType.id < 3) {
            if (this.state.currentModelingType != 2) {
                targetChangeNumber = parseFloat(getEndValueFromPercentage / monthDifference).toFixed(4);
            } else {
                targetChangeNumber = parseFloat(targetEndValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", "")).toFixed(4);
            }
        }
        this.setState({
            currentEndValue: (getValue != '' && this.state.currentModelingType != 3 && this.state.currentModelingType != 5) ? targetEndValue : '',
            currentCalculatedMomChange: getValue != '' ? momValue : '',
            currentTargetChangeNumber: getValue != '' ? targetChangeNumber : '',
            percentForOneMonth
        });
    }
    /**
     * Calculates various metrics such as target end value, monthly change, and target change percentage 
     * based on the provided change in number and other parameters.
     * @param {Event} e - The event object
     */
    calculateMomByChangeInNumber(e) {
        this.setState({
            currentEndValue: '',
            currentCalculatedMomChange: '',
            currentTargetChangePercentage: '',
        });
        var monthDifference = parseInt(this.state.yearsOfTarget * 12);
        var currentTargetChangeNumber = document.getElementById("currentTargetChangeNumber").value;
        var getValue = currentTargetChangeNumber.toString().replaceAll(",", "");
        var targetEndValue = parseFloat(this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) + parseFloat(getValue);
        var momValue = ''
        if (this.state.currentModelingType == 2) {
            momValue = parseFloat(getValue / monthDifference).toFixed(4);
        }
        if (this.state.currentModelingType == 3) {
            momValue = parseFloat(getValue / monthDifference).toFixed(4);
        }
        if (this.state.currentModelingType == 4) {
            momValue = parseFloat(getValue / monthDifference).toFixed(4);
        }
        var targetChangePer = '';
        if (this.state.currentItemConfig.context.payload.nodeType.id < 3) {
            targetChangePer = (parseFloat((targetEndValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) / this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) * 100).toFixed(4);
        }
        this.setState({
            currentEndValue: getValue != '' ? targetEndValue.toFixed(4) : '',
            currentCalculatedMomChange: getValue != '' ? momValue : '',
            currentTargetChangePercentage: getValue != '' ? targetChangePer : ''
        });
    }
    /**
     * Retrieves data from the payload based on the provided item configuration and type.
     * @param {Object} itemConfig - The configuration object of the item
     * @param {number} type - The type of data retrieval operation
     * @returns {any} - The retrieved data
     */
    getPayloadData(itemConfig, type) {
        if (this.state.toggleArray.includes(itemConfig.id) && itemConfig.parent != null) {
            itemConfig.expanded = true;
        } else {
            itemConfig.expanded = false;
        }
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
                    if (type == 6) {
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
                        return addCommasTwoDecimal(Number((itemConfig.payload.nodeDataMap[0])[0].displayDataValue).toFixed(2));
                    } else if (type == 3) {
                        var childList = this.state.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                        if (childList.length > 0) {
                            var sum = 0;
                            childList.map(c => {
                                sum += Number((c.payload.nodeDataMap[0])[0].displayDataValue)
                            })
                            return sum.toFixed(2);
                        } else {
                            return "";
                        }
                    } else {
                        return "";
                    }
                } else {
                    if (type == 1) {
                        if (itemConfig.payload.nodeType.id == 4) {
                            var usageType = (itemConfig.payload.nodeDataMap[0])[0].fuNode.usageType.id;
                            var val = (itemConfig.payload.nodeDataMap[0])[0].fuPerMonth;
                            var val1 = "/" + 'Month';
                            var val2 = ", ";
                            if (usageType == 1) {
                                var usagePeriodId;
                                var usageTypeId;
                                var usageFrequency;
                                var nodeTypeId = itemConfig.payload.nodeType.id;
                                var scenarioId = 0;
                                var repeatUsagePeriodId;
                                var oneTimeUsage;
                                if (nodeTypeId == 5) {
                                } else {
                                    usageTypeId = (itemConfig.payload.nodeDataMap[0])[0].fuNode.usageType.id;
                                    if (usageTypeId == 1) {
                                        oneTimeUsage = (itemConfig.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage;
                                    }
                                    if (usageTypeId == 2 || (oneTimeUsage != null && oneTimeUsage !== "" && oneTimeUsage.toString() == "false")) {
                                        usagePeriodId = (itemConfig.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId;
                                    }
                                    usageFrequency = (itemConfig.payload.nodeDataMap[0])[0].fuNode.usageFrequency != null ? (itemConfig.payload.nodeDataMap[0])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
                                }
                                var noOfMonthsInUsagePeriod = 0;
                                if ((usagePeriodId != null && usagePeriodId != "") && (usageTypeId == 2 || (oneTimeUsage == "false" || oneTimeUsage == false))) {
                                    var convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
                                    if (usageTypeId == 2) {
                                        var div = (convertToMonth * usageFrequency);
                                        if (div != 0) {
                                            noOfMonthsInUsagePeriod = usageFrequency / convertToMonth;
                                        }
                                    } else {
                                        var noOfFUPatient;
                                        if (itemConfig.payload.nodeType.id == 4) {
                                            noOfFUPatient = (itemConfig.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (itemConfig.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                                        } else {
                                            noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                                        }
                                        noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
                                    }
                                    if (oneTimeUsage != "true" && oneTimeUsage != true && usageTypeId == 1) {
                                        repeatUsagePeriodId = (itemConfig.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId;
                                        if (repeatUsagePeriodId != "") {
                                            convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == repeatUsagePeriodId))[0].convertToMonth;
                                        } else {
                                            convertToMonth = 0;
                                        }
                                    }
                                    var noFURequired = oneTimeUsage != "true" && oneTimeUsage != true ? (((itemConfig.payload.nodeDataMap[0])[0].fuNode.repeatCount != null ? ((itemConfig.payload.nodeDataMap[0])[0].fuNode.repeatCount).toString().replaceAll(",", "") : (itemConfig.payload.nodeDataMap[0])[0].fuNode.repeatCount) / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
                                    val = noFURequired;
                                    val1 = ""
                                    val2 = " * "
                                } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
                                    if (itemConfig.payload.nodeType.id == 4) {
                                        noFURequired = (itemConfig.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "");
                                        val = noFURequired;
                                        val1 = "";
                                        val2 = " * "
                                    } else {
                                        noFURequired = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "");
                                        val = noFURequired;
                                        val1 = "";
                                        val2 = " * "
                                    }
                                }
                            }
                            return addCommasTwoDecimal(Number((itemConfig.payload.nodeDataMap[0])[0].displayDataValue).toFixed(2)) + "% of parent" + val2 + (val < 0.01 ? addCommasThreeDecimal(Number(val).toFixed(3)) : addCommasTwoDecimal(Number(val).toFixed(2))) + val1;
                        } else if (itemConfig.payload.nodeType.id == 5) {
                            return addCommasTwoDecimal(Number((itemConfig.payload.nodeDataMap[0])[0].displayDataValue).toFixed(2)) + "% of parent, conversion = " + (itemConfig.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier;
                        } else {
                            return addCommasTwoDecimal(Number((itemConfig.payload.nodeDataMap[0])[0].displayDataValue).toFixed(2)) + "% of parent";
                        }
                    } else if (type == 3) {
                        var childList = this.state.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                        if (childList.length > 0) {
                            var sum = 0;
                            childList.map(c => {
                                sum += Number((c.payload.nodeDataMap[0])[0].displayDataValue)
                            })
                            return sum.toFixed(2);
                        } else {
                            return "";
                        }
                    } else {
                        return "= " + ((itemConfig.payload.nodeDataMap[0])[0].displayCalculatedDataValue != null ? addCommasTwoDecimal(Number((itemConfig.payload.nodeDataMap[0])[0].displayCalculatedDataValue).toFixed(2)) : "");
                    }
                }
            }
        } else {
            return "";
        }
    }
    /**
     * Retrieves a list of nodes at the same level based on the provided parameters.
     * @param {number} level - The level of the nodes
     * @param {string} id - The ID of the node
     * @param {number} nodeTypeId - The type ID of the node
     * @param {string} parent - The parent of the node
     */
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
    /**
     * Retrieves a list of node transfer data based on the provided parameters.
     * @param {number} level - The level of the nodes
     * @param {string} id - The ID of the node
     * @param {number} nodeTypeId - The type ID of the node
     * @param {string} parent - The parent of the node
     * @param {string} nodeDataId - The ID of the node data
     */
    getNodeTransferList(level, id, nodeTypeId, parent, nodeDataId) {
        var nodeTransferDataList = [];
        var arr = [];
        if (nodeTypeId == NUMBER_NODE_ID) {
            arr = this.state.items.filter(x => x.level == level && x.id != id && x.payload.nodeType.id == nodeTypeId);
        } else {
            arr = this.state.items.filter(x => x.level == level && x.id != id && (x.payload.nodeType.id == PERCENTAGE_NODE_ID || x.payload.nodeType.id == FU_NODE_ID || x.payload.nodeType.id == PU_NODE_ID) && x.parent == parent);
        }
        for (let i = 0; i < arr.length; i++) {
            var nodeDataModelingList = arr[i].payload.nodeDataMap[0][0].nodeDataModelingList;
            if (nodeDataModelingList != undefined && nodeDataModelingList != null) {
                var transferList = nodeDataModelingList.filter(x => x.transferNodeDataId == nodeDataId);
                if (transferList.length > 0) {
                    var tempTransferList = JSON.parse(JSON.stringify(transferList));
                    if (transferList.length == 1) {
                        tempTransferList[0].transferNodeDataId = arr[i].payload.nodeDataMap[0][0].nodeDataId;
                        nodeTransferDataList.push(tempTransferList[0]);
                    } else {
                        for (let j = 0; j < transferList.length; j++) {
                            tempTransferList[j].transferNodeDataId = arr[i].payload.nodeDataMap[0][0].nodeDataId;
                            nodeTransferDataList.push(tempTransferList[j]);
                        }
                    }
                }
            }
        }
        this.setState({
            nodeTransferDataList
        });
    }
    /**
     * Toggle info popup
     */
    toggleMonthInFuture() {
        this.setState({
            popoverOpenMonthInFuture: !this.state.popoverOpenMonthInFuture,
        });
    }
    /**
     * Toggle info popup
     */
    toggleMonthInPast() {
        this.setState({
            popoverOpenMonthInPast: !this.state.popoverOpenMonthInPast,
        });
    }
    /**
     * Toggle info popup
     */
    toggle() {
        this.setState({
            popoverOpen: !this.state.popoverOpen,
        });
    }
    /**
     * Toggle info popup
     */
    toggleHowManyPUperIntervalPer() {
        this.setState({
            popoverOpenHowManyPUperIntervalPer: !this.state.popoverOpenHowManyPUperIntervalPer,
        });
    }
    /**
     * Toggle info popup
     */
    toggleWillClientsShareOnePU() {
        this.setState({
            popoverOpenWillClientsShareOnePU: !this.state.popoverOpenWillClientsShareOnePU,
        });
    }
    /**
     * Toggle info popup
     */
    toggleConsumptionIntervalEveryXMonths() {
        this.setState({
            popoverOpenConsumptionIntervalEveryXMonths: !this.state.popoverOpenConsumptionIntervalEveryXMonths,
        });
    }
    /**
     * Toggle info popup
     */
    toggleQATEstimateForInterval() {
        this.setState({
            popoverOpenQATEstimateForInterval: !this.state.popoverOpenQATEstimateForInterval,
        });
    }
    /**
     * Toggle info popup
     */
    toggleNoOfPUUsage() {
        this.setState({
            popoverOpenNoOfPUUsage: !this.state.popoverOpenNoOfPUUsage,
        });
    }
    /**
     * Toggle info popup
     */
    toggleConversionFactorFUPU() {
        this.setState({
            popoverOpenConversionFactorFUPU: !this.state.popoverOpenConversionFactorFUPU,
        });
    }
    /**
     * Toggle info popup
     */
    togglePlanningUnitNode() {
        this.setState({
            popoverOpenPlanningUnitNode: !this.state.popoverOpenPlanningUnitNode,
        });
    }
    /**
     * Toggle info popup
     */
    toggleHashOfUMonth() {
        this.setState({
            popoverOpenHashOfUMonth: !this.state.popoverOpenHashOfUMonth,
        });
    }
    /**
     * Toggle info popup
     */
    toggleForecastingUnitPU() {
        this.setState({
            popoverOpenForecastingUnitPU: !this.state.popoverOpenForecastingUnitPU,
        });
    }
    /**
     * Toggle info popup
     */
    toggleTypeOfUsePU() {
        this.setState({
            popoverOpenTypeOfUsePU: !this.state.popoverOpenTypeOfUsePU,
        });
    }
    /**
     * Toggle info popup
     */
    toggleSingleUse() {
        this.setState({
            popoverOpenSingleUse: !this.state.popoverOpenSingleUse,
        });
    }
    /**
     * Toggle info popup
     */
    toggleLagInMonth() {
        this.setState({
            popoverOpenLagInMonth: !this.state.popoverOpenLagInMonth,
        });
    }
    /**
     * Toggle info popup
     */
    toggleTypeOfUse() {
        this.setState({
            popoverOpenTypeOfUse: !this.state.popoverOpenTypeOfUse,
        });
    }
    /**
     * Toggle info popup
     */
    toggleCopyFromTemplate() {
        this.setState({
            popoverOpenCopyFromTemplate: !this.state.popoverOpenCopyFromTemplate,
        });
    }
    /**
     * Toggle info popup
     */
    toggletracercategoryModelingType() {
        this.setState({
            popoverOpentracercategoryModelingType: !this.state.popoverOpentracercategoryModelingType,
        });
    }
    /**
     * Toggle info popup
     */
    toggleParentValue() {
        this.setState({
            popoverOpenParentValue: !this.state.popoverOpenParentValue,
        });
    }
    /**
     * Toggle info popup
     */
    togglePercentageOfParent() {
        this.setState({
            popoverOpenPercentageOfParent: !this.state.popoverOpenPercentageOfParent,
        });
    }
    /**
     * Toggle info popup
     */
    toggleParent() {
        this.setState({
            popoverOpenParent: !this.state.popoverOpenParent,
        });
    }
    /**
     * Toggle info popup
     */
    toggleCalculatedMonthOnMonthChnage() {
        this.setState({
            popoverOpenCalculatedMonthOnMonthChnage: !this.state.popoverOpenCalculatedMonthOnMonthChnage,
        });
    }
    /**
     * Toggle info popup
     */
    toggleTargetChangeHash() {
        this.setState({
            popoverOpenTargetChangeHash: !this.state.popoverOpenTargetChangeHash,
        });
    }
    /**
     * Toggle info popup
     */
    toggleTargetChangePercent() {
        this.setState({
            popoverOpenTargetChangePercent: !this.state.popoverOpenTargetChangePercent,
        });
    }
    /**
     * Toggle info popup
     */
    toggleTargetEndingValue() {
        this.setState({
            popoverOpenTargetEndingValue: !this.state.popoverOpenTargetEndingValue,
        });
    }
    /**
     * Toggle info popup
     */
    toggleMonth() {
        this.setState({
            popoverOpenMonth: !this.state.popoverOpenMonth,
        });
    }
    /**
     * Toggle info popup
     */
    toggleFirstMonthOfTarget() {
        this.setState({
            popoverOpenFirstMonthOfTarget: !this.state.popoverOpenFirstMonthOfTarget
        })
    }
    /**
     * Toggle info popup
     */
    toggleYearsOfTarget() {
        this.setState({
            popoverOpenYearsOfTarget: !this.state.popoverOpenYearsOfTarget
        })
    }
    /**
     * Toggle info popup
     */
    toggleNodeValue() {
        this.setState({
            popoverOpenNodeValue: !this.state.popoverOpenNodeValue,
        });
    }
    /**
     * Toggle info popup
     */
    toggleNodeType() {
        this.setState({
            popoverOpenNodeType: !this.state.popoverOpenNodeType,
        });
    }
    /**
     * Toggle info popup
     */
    toggleNodeTitle() {
        this.setState({
            popoverOpenNodeTitle: !this.state.popoverOpenNodeTitle,
        });
    }
    /**
     * Toggle info popup
     */
    toggleSenariotree() {
        this.setState({
            popoverOpenSenariotree: !this.state.popoverOpenSenariotree,
        });
    }
    /**
     * Displays the MOM data for the current node or its parent node.
     */
    showMomData() {
        var getMomDataForCurrentNode = this.state.items.filter(x => x.id == this.state.currentItemConfig.context.id).length > 0 ? this.state.items.filter(x => x.id == this.state.currentItemConfig.context.id)[0].payload.nodeDataMap[0][0].nodeDataMomList : [];
        if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
            var getMomDataForCurrentNodeParent = this.state.items.filter(x => x.id == this.state.currentItemConfig.context.parent).length > 0 ? this.state.items.filter(x => x.id == this.state.currentItemConfig.context.parent)[0].payload.nodeDataMap[0][0].nodeDataMomList : []
            this.setState({ showMomDataPercent: !this.state.showMomDataPercent, showMomData: false, momListPer: getMomDataForCurrentNode, momListPerParent: getMomDataForCurrentNodeParent }, () => {
                if (this.state.showMomDataPercent) {
                    this.setState({ viewMonthlyData: false }, () => {
                        this.buildMomJexcelPercent();
                    })
                } else {
                    this.setState({ viewMonthlyData: true });
                }
            });
        } else {
            this.setState({ showMomDataPercent: false, showMomData: !this.state.showMomData, momList: getMomDataForCurrentNode }, () => {
                if (this.state.showMomData) {
                    this.setState({ viewMonthlyData: false }, () => {
                        this.buildMomJexcel();
                    })
                } else {
                    this.setState({ viewMonthlyData: true });
                }
            });
        }
    }
    /**
     * Builds jexcel table for modeling in percentage node or forecasting unit node or planning unit node
     */
    buildMomJexcelPercent() {
        var momList = this.state.momListPer;
        var momListParent = this.state.momListPerParent;
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
        for (var j = 0; j < momList.length; j++) {
            data = [];
            data[0] = momList[j].month
            data[1] = j == 0 ? parseFloat(momList[j].startValue).toFixed(2) : `=ROUND(IF(OR(K1==true,K1==1),E${parseInt(j)},J${parseInt(j)}),2)`
            data[2] = parseFloat(momList[j].difference).toFixed(2)
            data[3] = momList[j].manualChange!=null?parseFloat(momList[j].manualChange).toFixed(2):0
            data[4] = `=ROUND(IF(B${parseInt(j) + 1}+C${parseInt(j) + 1}+D${parseInt(j) + 1}<0,0,B${parseInt(j) + 1}+C${parseInt(j) + 1}+D${parseInt(j) + 1}),2)`
            var momListParentForMonth = momListParent.filter(c => c.month == momList[j].month);
            data[5] = momListParentForMonth.length > 0 ? parseFloat(momListParentForMonth[0].calculatedValue).toFixed(2) : 0;
            data[6] = this.state.currentItemConfig.context.payload.nodeType.id != 5 ? `=ROUND((E${parseInt(j) + 1}*${momListParentForMonth.length > 0 ? parseFloat(momListParentForMonth[0].calculatedValue) : 0}/100)*L${parseInt(j) + 1},2)` : `=ROUND((E${parseInt(j) + 1}*${momListParentForMonth.length > 0 ? parseFloat(momListParentForMonth[0].calculatedValue) : 0}/100)/${(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier},2)`;
            data[7] = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].nodeDataId
            data[8] = this.state.currentItemConfig.context.payload.nodeType.id == 4 || (this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2) ? j >= lagInMonths ? `=IF(P${parseInt(j) + 1 - lagInMonths}<0,0,P${parseInt(j) + 1 - lagInMonths})` : 0 : `=IF(P${parseInt(j) + 1}<0,0,P${parseInt(j) + 1})`;
            data[9] = `=ROUND(IF(B${parseInt(j) + 1}+C${parseInt(j) + 1}<0,0,B${parseInt(j) + 1}+C${parseInt(j) + 1}),2)`
            data[10] = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].manualChangesEffectFuture;
            data[11] = this.state.currentItemConfig.context.payload.nodeType.id == 4 ? ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? Number(fuPerMonth).toFixed(4) : this.state.noFURequired) : 1;
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
            data[15] = this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2 ? `=(O${parseInt(j) + 1}*${noOfBottlesInOneVisit}*(E${parseInt(j) + 1}/100)*${fuPercentage}/100)` : this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 1 ? `=(G${parseInt(j) + 1}/(${this.state.noFURequired / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier}))*${(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.puPerVisit}` : `=G${parseInt(j) + 1}`;
            dataArray[count] = data;
            count++;
        }
        if (document.getElementById("momJexcelPer") != null) {
            this.el = jexcel(document.getElementById("momJexcelPer"), '');
        } else {
            this.el = "";
        }
        if (document.getElementById("momJexcelPer") != null) {
            jexcel.destroy(document.getElementById("momJexcelPer"), true);
        }
        var data = dataArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 120, 60, 80, 150, 100, 110, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.common.month'),
                    type: 'dropdown',
                    source: this.state.monthList,
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.%of') + " " + (this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level != 0 ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : "") + " " + i18n.t('static.tree.monthStart'),
                    type: 'hidden',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.calculatedChange'),
                    type: 'numeric',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.manualChange'),
                    type: 'numeric',
                    disabledMaskOnEdition: true,
                    textEditor: true,
                    mask: '#,##0.00%', decimal: '.',
                    readOnly: this.state.editable ? false : true,
                },
                {
                    title: i18n.t('static.tree.%of') + " " + (this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level != 0 ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : ""),
                    type: this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level == 0 ? 'hidden' : 'numeric',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: (this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level != 0 ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : ""),
                    type: this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.level == 0 ? 'hidden' : 'numeric',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) + " " + i18n.t('static.consumption.forcast'),
                    type: this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'hidden' : 'numeric',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: 'Node data id',
                    type: 'hidden',
                },
                {
                    title: this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5 ? getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) + " " + i18n.t('static.consumption.forcast') : '# of PUs',
                    type: this.state.currentItemConfig.context.payload.nodeType.id == 5 || this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'numeric' : 'hidden',
                    mask: '#,##0.00', decimal: '.',
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
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            editable: this.state.editable,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        if (document.getElementById("momJexcelPer") != null) {
            var momElPer = jexcel(document.getElementById("momJexcelPer"), options);
            this.el = momElPer;
        } else {
            var momElPer = "";
        }
        this.setState({
            momElPer: momElPer
        }
        );
    };
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedMomPer = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
        if (instance.worksheets[0].getJson(null, false).length > 0) {
            var cell = instance.worksheets[0].getCell("D1");
            cell.classList.add('readonly');
        }
    }
    /**
     * Builds jexcel table for modeling in number node or aggregation
     */
    buildMomJexcel() {
        var momList = this.state.momList;
        var dataArray = [];
        let count = 0;
        for (var j = 0; j < momList.length; j++) {
            data = [];
            data[0] = momList[j].month
            data[1] = j == 0 ? parseFloat(momList[j].startValue).toFixed(2) : `=(IF(OR(I1==true,I1==1),G${parseInt(j)},D${parseInt(j)}))`
            data[2] = parseFloat(momList[j].difference).toFixed(2)
            data[3] = `=(IF(B${parseInt(j) + 1}+C${parseInt(j) + 1}<0,0,(B${parseInt(j) + 1}+C${parseInt(j) + 1})))`;
            data[4] = parseFloat(momList[j].seasonalityPerc).toFixed(2)
            data[5] = momList[j].manualChange!=null?parseFloat(momList[j].manualChange).toFixed(2):0
            data[6] = `=(D${parseInt(j) + 1}+(D${parseInt(j) + 1}*E${parseInt(j) + 1}/100)+F${parseInt(j) + 1})`
            data[7] = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].nodeDataId
            data[8] = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].manualChangesEffectFuture;
            dataArray[count] = data;
            count++;
        }
        if (document.getElementById("momJexcel") != null) {
            this.el = jexcel(document.getElementById("momJexcel"), '');
        } else {
            this.el = "";
        }
        if (document.getElementById("momJexcel") != null) {
            jexcel.destroy(document.getElementById("momJexcel"), true);
        }
        var data = dataArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [50, 80, 80, 80, 80, 80, 80, 80, 80],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.common.month'),
                    type: 'dropdown',
                    source: this.state.monthList,
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.monthStartNoSeasonality'),
                    type: 'hidden',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.calculatedChange+-'),
                    type: 'numeric',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) + " " + i18n.t('static.tree.monthlyEndNoSeasonality'),
                    type: 'numeric',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.seasonalityIndex'),
                    type: this.state.seasonality == true ? 'numeric' : 'hidden',
                    disabledMaskOnEdition: true,
                    textEditor: true,
                    mask: '#,##0.00%', decimal: '.',
                },
                {
                    title: i18n.t('static.tree.manualChange+-'),
                    type: this.state.seasonality == true ? 'numeric' : 'hidden',
                    mask: '#,##0.00', decimal: '.',
                },
                {
                    title: getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) + " " + i18n.t('static.consumption.forcast'),
                    type: 'numeric',
                    mask: '#,##0.00', decimal: '.',
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
            editable: this.state.editable,
            onchange: this.changed1,
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el;
                if (y != null) {
                }
            }.bind(this),
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
        if (document.getElementById("momJexcel") != null) {
            var momEl = jexcel(document.getElementById("momJexcel"), options);
            this.el = momEl;
        } else {
            var momEl = "";
        }
        this.setState({
            momEl: momEl
        }
        );
    };
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedMom = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
        if (instance.worksheets[0].getJson(null, false).length > 0) {
            var cell = instance.worksheets[0].getCell("E1");
            cell.classList.add('readonly');
            var cell = instance.worksheets[0].getCell("F1");
            cell.classList.add('readonly');
        }
    }
    /**
     * Add new row in jexcel table for modeling
     */
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
        data[13] = {
            firstMonthOfTarget: "",
            yearsOfTarget: "",
            actualOrTargetValueList: []
        }
        data[14] = ""
        elInstance.insertRow(
            data, 0, 1
        );
    };
    /**
     * Builds Jexcel table for modeling data
     */
    buildModelingJexcel() {
        var scalingList = this.state.scalingList;
        var nodeTransferDataList = this.state.nodeTransferDataList;
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
            data[13] = {
                firstMonthOfTarget: "",
                yearsOfTarget: "",
                actualOrTargetValueList: []
            }
            data[14] = ""
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
            data[13] = {
                firstMonthOfTarget: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].annualTargetCalculator == null ? this.state.firstMonthOfTarget : (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].annualTargetCalculator.firstMonthOfTarget,
                yearsOfTarget: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].annualTargetCalculator == null ? this.state.yearsOfTarget : (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].annualTargetCalculator.yearsOfTarget,
                actualOrTargetValueList: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].annualTargetCalculator == null ? this.state.actualOrTargetValueList : (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].annualTargetCalculator.actualOrTargetValueList
            }
            data[14] = scalingList[j].modelingSource
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
                data[13] = ""
                data[14] = ""
                scalingTotal = parseFloat(scalingTotal) + parseFloat(calculatedChangeForMonth);
                dataArray[count] = data;
                count++;
            }
        }
        this.setState({ scalingTotal });
        jexcel.destroy(document.getElementById("modelingJexcel"), true);
        var data = dataArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [90, 150, 80, 80, 90, 90, 90, 90, 90, 90],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.common.description'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.common.startdate'),
                    type: 'dropdown',
                    source: this.state.monthList
                },
                {
                    title: i18n.t('static.common.stopdate'),
                    type: 'dropdown',
                    source: this.state.monthList
                },
                {
                    title: i18n.t('static.tree.transferToNode'),
                    type: 'dropdown',
                    source: this.state.sameLevelNodeList,
                    filter: this.filterSameLeveleUnitList,
                },
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
                {
                    title: i18n.t('static.tree.monthlyChange%'),
                    type: 'numeric',
                    mask: '#,##0.0000%', decimal: '.',
                },
                {
                    title: i18n.t('static.tree.MonthlyChange#'),
                    type: this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'numeric' : 'hidden',
                    mask: '#,##0.0000', decimal: '.',
                },
                {
                    title: i18n.t('static.tree.modelingCalculater'),
                    type: 'image',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.calculatedChangeForMonth') + " " + this.state.scalingMonth,
                    type: 'numeric',
                    mask: '#,##0.0000',
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
                {
                    title: 'isTransfer',
                    type: 'hidden'
                },
                {
                    title: 'modelingCalculator',
                    type: 'hidden'
                },
                {
                    title: 'modelingSource',
                    type: 'hidden'
                }
            ],
            onload: this.loaded,
            editable: this.state.editable,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
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
                    if ((rowData[3] != "" && rowData[3] != "_T" && rowData[3] != "null_T") || rowData[12] == 1) {
                        var cell = elInstance.getCell(("F").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("F").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                }
            }.bind(this),
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
                } else {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: "Insert Row",
                            onclick: function () {
                                var data = [];
                                data[0] = '';
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
                                data[13] = {
                                    firstMonthOfTarget: "",
                                    yearsOfTarget: "",
                                    actualOrTargetValueList: []
                                }
                                data[14] = ""
                                obj.insertRow(data, 0, 1);
                            }.bind(this)
                        });
                    }
                    if (obj.options.allowDeleteRow == true) {
                        if (obj.getRowData(y)[12] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    if (obj.getJson(null, false).length == 1) {
                                        var data = [];
                                        data[0] = '';
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
                                        data[13] = {
                                            firstMonthOfTarget: "",
                                            yearsOfTarget: "",
                                            actualOrTargetValueList: []
                                        }
                                        data[14] = ""
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
                return items;
            }.bind(this)
        };
        var modelingEl = jexcel(document.getElementById("modelingJexcel"), options);
        this.el = modelingEl;
        this.setState({
            modelingEl: modelingEl
        }, () => {
            this.filterScalingDataByMonth(this.state.monthId);
        }
        );
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[4].classList.add('InfoTr');
        tr.children[5].classList.add('InfoTr');
        tr.children[9].classList.add('InfoTr');
        tr.children[10].classList.add('InfoTr');
        tr.children[4].title = i18n.t('static.tooltip.Transfercloumn');
        tr.children[5].title = i18n.t('static.tooltip.ModelingType');
        tr.children[9].title = i18n.t('static.tooltip.ModelingCalculator');
        tr.children[10].title = i18n.t('static.tooltip.CalculatorChangeforMonth');
    }
    /**
     * Function to filter same level node list
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    filterSameLeveleUnitList = function (instance, cell, c, r, source) {
        var sameLevelNodeList = this.state.sameLevelNodeList1;
        return sameLevelNodeList;
    }.bind(this)
    /**
     * Handles the selection of a cell in the grid/table.
     * @param {object} instance - The instance object.
     * @param {object} cell - The cell object.
     * @param {number} x - The x-coordinate of the selected cell.
     * @param {number} y - The y-coordinate of the selected cell.
     * @param {any} value - The value of the selected cell.
     * @param {object} e - The event object.
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if (y == 8 && this.state.editable) {
                var elInstance = this.state.modelingEl;
                var treeTemplate = this.state.treeTemplate;
                var rowData = elInstance.getRowData(x);
                if (rowData[4] != "" && rowData[4] != null && rowData[1] != "" && rowData[1] != null && rowData[2] != "" && rowData[2] != null) {
                    this.setState({
                        currentRowIndex: '',
                        currentTransferData: '',
                        currentModelingType: '',
                        currentCalculatorStartDate: '',
                        currentCalculatorStopDate: '',
                        currentCalculatorStartValue: '',
                        firstMonthOfTarget: "",
                        yearsOfTarget: "",
                        actualOrTargetValueList: []
                    }, () => {
                        var startValue = this.getMomValueForDateRange(rowData[1]);
                        this.setState({
                            currentRowIndex: x,
                            showCalculatorFields: this.state.aggregationNode ? !this.state.showCalculatorFields : false,
                            currentModelingType: rowData[4],
                            modelingTypeOriginal: rowData[4],
                            currentTransferData: rowData[3],
                            currentCalculatorStartDate: (rowData[13].firstMonthOfTarget == "" || rowData[13].firstMonthOfTarget == "Invalid date") && (this.state.firstMonthOfTarget == "Invalid date" || this.state.firstMonthOfTarget == "") ? rowData[1] : (rowData[13].firstMonthOfTarget != "" ? rowData[13].firstMonthOfTarget : this.state.firstMonthOfTarget),
                            currentCalculatorStopDate: rowData[2],
                            currentCalculatorStartValue: startValue,
                            currentCalculatedMomChange: '',
                            currentTargetChangeNumber: '',
                            currentTargetChangeNumberEdit: false,
                            currentTargetChangePercentage: '',
                            currentTargetChangePercentageEdit: false,
                            currentEndValue: '',
                            currentEndValueEdit: false,
                            actualOrTargetValueList: rowData[13].actualOrTargetValueList.length != 0 && this.state.actualOrTargetValueList.length == 0 ? rowData[13].actualOrTargetValueList : this.state.actualOrTargetValueList,
                            yearsOfTarget: rowData[13].yearsOfTarget == "" && this.state.yearsOfTarget == "" ? (parseInt((rowData[2] - rowData[1]) / 12) + 1) : (rowData[13].yearsOfTarget != "" ? rowData[13].yearsOfTarget : this.state.yearsOfTarget),
                            firstMonthOfTarget: (rowData[13].firstMonthOfTarget == "" || rowData[13].firstMonthOfTarget == "Invalid date") && (this.state.firstMonthOfTarget == "Invalid date" || this.state.firstMonthOfTarget == "") ? rowData[1] : (rowData[13].firstMonthOfTarget != "" ? rowData[13].firstMonthOfTarget : this.state.firstMonthOfTarget),
                            actualOrTargetValueListOriginal: rowData[13].actualOrTargetValueList.length != 0 && this.state.actualOrTargetValueList.length == 0 ? rowData[13].actualOrTargetValueList : this.state.actualOrTargetValueList,
                            yearsOfTargetOriginal: rowData[13].yearsOfTarget == "" && this.state.yearsOfTarget == "" ? (parseInt((rowData[2] - rowData[1]) / 12) + 1) : (rowData[13].yearsOfTarget != "" ? rowData[13].yearsOfTarget : this.state.yearsOfTarget),
                            firstMonthOfTargetOriginal: rowData[13].firstMonthOfTarget == "" && this.state.firstMonthOfTarget == "" ? rowData[1] : (rowData[13].firstMonthOfTarget != "" ? rowData[13].firstMonthOfTarget : this.state.firstMonthOfTarget),
                            targetSelect: rowData[14],
                            targetSelectDisable: true,
                            isCalculateClicked: 0
                        }, () => {
                            if (this.state.showCalculatorFields) {
                                treeTemplate.monthsInPast = (13 - Number(this.state.currentCalculatorStartDate));
                                treeTemplate.monthsInFuture = (24 + Number(this.state.treeTemplate.monthsInFuture));
                                this.generateMonthList();
                            }
                        });
                    })
                } else if (rowData[4] == "" || rowData[4] == null) {
                    if (this.state.aggregationNode) {
                        this.setState({
                            currentRowIndex: '',
                            currentTransferData: '',
                            currentModelingType: '',
                            currentCalculatorStartDate: '',
                            currentCalculatorStopDate: '',
                            currentCalculatorStartValue: '',
                            firstMonthOfTarget: "",
                            yearsOfTarget: "",
                            actualOrTargetValueList: []
                        }, () => {
                            var startValue = this.getMomValueForDateRange(rowData[1]);
                            this.setState({
                                currentRowIndex: x,
                                showCalculatorFields: this.state.aggregationNode ? !this.state.showCalculatorFields : false,
                                currentModelingType: 2,
                                modelingTypeOriginal: 2,
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
                                currentEndValueEdit: false,
                                actualOrTargetValueList: this.state.actualOrTargetValueList,
                                yearsOfTarget: (1 + parseInt((rowData[2] - rowData[1]) / 12)),
                                firstMonthOfTarget: rowData[1],
                                actualOrTargetValueListOriginal: this.state.actualOrTargetValueList,
                                yearsOfTargetOriginal: (1 + parseInt((rowData[2] - rowData[1]) / 12)),
                                firstMonthOfTargetOriginal: rowData[1],
                                modelingSource: rowData[14],
                                targetSelectDisable: false,
                                isCalculateClicked: 0
                            }, () => {
                                if (this.state.showCalculatorFields) {
                                    treeTemplate.monthsInPast = (13 - Number(this.state.currentCalculatorStartDate));
                                    treeTemplate.monthsInFuture = (24 + Number(this.state.currentCalculatorStopDate));
                                    this.generateMonthList();
                                }
                            });
                        })
                    } else {
                        alert(i18n.t('static.tree.pleaseSelectNodeType'));
                    }
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
    /**
     * Resets modeling calculator data on reset button clicked
     */
    resetModelingCalculatorData = function (instance, cell, x, y, value) {
        this.setState({
            firstMonthOfTarget: this.state.firstMonthOfTargetOriginal,
            yearsOfTarget: this.state.yearsOfTargetOriginal,
            actualOrTargetValueList: this.state.actualOrTargetValueListOriginal,
            currentModelingType: this.state.modelingTypeOriginal,
            isCalculateClicked: 0
        }, () => {
            this.buildModelingCalculatorJexcel();
        })
    }.bind(this);
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed1 = function (instance, cell, x, y, value) {
        if (this.state.isChanged != true) {
            this.setState({ isChanged: true });
        }
    }.bind(this);
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed2 = function (instance, cell, x, y, value) {
        if (this.state.isChanged != true) {
            this.setState({ isChanged: true });
        }
    }.bind(this);
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed = function (instance, cell, x, y, value) {
        this.setState({
            modelingChangedOrAdded: true
        })
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
            } else {
                if (value == 2) {
                    this.state.modelingEl.setValueFromCoords(6, y, "", true);
                }
                else if (value == 3 || value == 4 || value == 5) {
                    this.state.modelingEl.setValueFromCoords(7, y, "", true);
                }
                instance.setStyle(col, "background-color", "transparent");
                instance.setComments(col, "");
            }
        }
        if (x == 3) {
            if (value != "") {
                this.state.modelingEl.setValueFromCoords(5, y, -1, true);
            }
            else {
                this.state.modelingEl.setValueFromCoords(5, y, "", true);
            }
        }
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
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
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
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
        }
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            else if (Number(stopDate) < Number(startDate)) {
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
        if (rowData[4] != "") {
            var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE;
            var nodeValue = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue;
            var calculatedChangeForMonth;
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
                else {
                    if (isNaN(Number(value)) || !(reg.test(value)) || (1 == 1 && (1 == 1 ? value < 0 : value <= 0))) {
                        instance.setStyle(col, "background-color", "transparent");
                        instance.setStyle(col, "background-color", "yellow");
                        instance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        instance.setStyle(col, "background-color", "transparent");
                        instance.setComments(col, "");
                        if (rowData[4] != 5) {
                            calculatedChangeForMonth = parseFloat((nodeValue * value) / 100).toFixed(4);
                        } else {
                            calculatedChangeForMonth = parseFloat(value).toFixed();
                        }
                    }
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
            }
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
                else {
                    if (isNaN(Number(value)) || !(reg.test(value)) || (1 == 1 && (1 == 1 ? value < 0 : value <= 0))) {
                        instance.setStyle(col, "background-color", "transparent");
                        instance.setStyle(col, "background-color", "yellow");
                        instance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        instance.setStyle(col, "background-color", "transparent");
                        instance.setComments(col, "");
                    }
                }
            }
        }
        if (x != 11 && x != 9) {
            instance.setValueFromCoords(11, y, 1, true);
            this.setState({ isChanged: true });
        }
    }.bind(this);
    /**
     * Builds modeling jexcel table for percentage, forecasting unit and planning unit node
     */
    buildModelingJexcelPercent() {
        var scalingList = this.state.scalingList;
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
        jexcel.destroy(document.getElementById("modelingJexcelPercent"), true);
        var data = dataArray;
        var options = {
            data: data,
            columnDrag: false,
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
            editable: this.state.editable,
            onload: this.loadedPer,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
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
        };
        var modelingPerEl = jexcel(document.getElementById("modelingJexcelPercent"), options);
        this.el = modelingPerEl;
        this.setState({
            modelingPerEl: modelingPerEl
        }
        );
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedPer = function (instance, cell) {
        jExcelLoadedFunction(instance);
    }
    /**
     * Retrives conversion factor for planning unit
     * @param {*} planningUnitId - Planning unit for which conversion factor should be reterived
     */
    getConversionFactor(planningUnitId) {
        var pu = (this.state.planningUnitList.filter(c => c.planningUnitId == planningUnitId))[0];
        this.setState({
            conversionFactor: pu.multiplier
        });
    }
    /**
     * Reterives next allowed node types list
     * @param {*} nodeTypeId Current node type Id
     */
    getNodeTypeFollowUpList(nodeTypeId) {
        var nodeType;
        var nodeTypeList = [];
        if (nodeTypeId != 0) {
            nodeType = this.state.nodeTypeList.filter(c => c.id == nodeTypeId)[0];
            for (let i = 0; i < nodeType.allowedChildList.length; i++) {
                var obj = this.state.nodeTypeList.filter(c => c.id == nodeType.allowedChildList[i])[0];
                nodeTypeList.push(obj);
            }
        } else {
            nodeTypeList = this.state.nodeTypeList.filter(c => c.id != 5);
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
                        this.getNoFURequired();
                    }
                })
            } else {
            }
        });
    }
    /**
     * Retervies node type list
     */
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
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                this.setState({
                    nodeTypeList: myResult
                });
                for (var i = 0; i < myResult.length; i++) {
                }
            }.bind(this);
        }.bind(this);
    }
    /**
     * Function to duplicate the node in the tree
     * @param {*} itemConfig Configuration and data of selected node
     */
    duplicateNode(itemConfig) {
        var items1 = this.state.items;
        const { items } = this.state;
        var maxNodeDataId = this.getMaxNodeDataId();
        var childList = items1.filter(x => x.sortOrder.startsWith(itemConfig.sortOrder));
        var childListArr = [];
        var json;
        var sortOrder = itemConfig.sortOrder;
        var childListBasedOnScenarion = [];
        for (let i = 0; i < childList.length; i++) {
            var child = JSON.parse(JSON.stringify(childList[i]));
            var maxNodeId = items.length > 0 ? Math.max(...items.map(o => o.id)) : 0;
            var nodeId = parseInt(maxNodeId + 1);
            var maxSortOrder;
            if (sortOrder == child.sortOrder) {
                child.payload.nodeId = nodeId;
                child.id = nodeId;
                var parentSortOrder = items.filter(c => c.id == itemConfig.parent)[0].sortOrder;
                var childList1 = items.filter(c => c.parent == itemConfig.parent);
                maxSortOrder = childList1.length > 0 ? Math.max(...childList1.map(o => o.sortOrder.replace(parentSortOrder + '.', ''))) : 0;
                child.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(maxSortOrder) + 1)).slice(-2));
                json = {
                    oldId: itemConfig.id,
                    newId: nodeId,
                    oldSortOrder: itemConfig.sortOrder,
                    newSortOrder: child.sortOrder
                }
                childListArr.push(json);
            } else {
                var parentNode = childListArr.filter(x => x.oldId == child.parent)[0];
                child.payload.nodeId = nodeId;
                var oldId = child.id;
                var oldSortOrder = child.sortOrder;
                child.id = nodeId;
                child.parent = parentNode.newId;
                child.payload.parentNodeId = child.parent;
                var parentSortOrder = parentNode.newSortOrder;
                var childList1 = items.filter(c => c.parent == parentNode.newId);
                maxSortOrder = childList1.length > 0 ? Math.max(...childList1.map(o => o.sortOrder.replace(parentSortOrder + '.', ''))) : 0;
                child.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(maxSortOrder) + 1)).slice(-2));
                json = {
                    oldId: oldId,
                    newId: nodeId,
                    oldSortOrder: oldSortOrder,
                    newSortOrder: child.sortOrder
                }
                childListArr.push(json);
            }
            maxNodeDataId++;
            childListBasedOnScenarion.push({
                oldId: (child.payload.nodeDataMap[0])[0].nodeDataId,
                newId: maxNodeDataId
            });
            (child.payload.nodeDataMap[0])[0].nodeDataId = maxNodeDataId;
            items.push(child);
        }
        childListArr.map(item => {
            var indexItems = items.findIndex(i => i.id == item.newId);
            if (indexItems != -1) {
                var nodeDataModelingList = (items[indexItems].payload.nodeDataMap[0])[0].nodeDataModelingList;
                if (nodeDataModelingList.length > 0) {
                    nodeDataModelingList.map((item1, c) => {
                        var newTransferId = childListBasedOnScenarion.filter(c => c.oldId == item1.transferNodeDataId);
                        item1.transferNodeDataId = newTransferId[0].newId;
                    })
                }
            }
        })
        this.setState({
            items,
            cursorItem: nodeId,
            isTemplateChanged: true
        }, () => {
            this.calculateMOMData(0, 2);
        });
    }
    /**
     * Redirects to list tree template screen on cancel button clicked
     */
    cancelClicked() {
        this.props.history.push(`/dataset/listTreeTemplate/`)
    }
    /**
     * Reterives lists for creating tree from tree template
     */
    createTree() {
        if (!this.state.isTemplateChanged) {
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
                            this.setState({
                                forecastMethodListForCreateTree: myResult.filter(x => x.forecastMethodTypeId == 1),
                                programListForCreateTree: programRequest.result.filter(c => c.userId == userId),
                                datasetListForCreateTree: datasetRequest.result.filter(c => c.userId == userId)
                            }, () => {
                                this.setState({
                                    isModalForCreateTree: !this.state.isModalForCreateTree,
                                    treeTemplateForCreateTree: this.state.treeTemplate,
                                    treeNameForCreateTree: this.state.treeTemplate.label.label_en,
                                    activeForCreateTree: this.state.treeTemplate.active,
                                    forecastMethodForCreateTree: this.state.treeTemplate.forecastMethod,
                                    regionIdForCreateTree: '',
                                    regionListForCreateTree: [],
                                    regionValuesForCreateTree: [],
                                    notesForCreateTree: this.state.treeTemplate.notes,
                                    missingPUListForCreateTree: [],
                                    datasetIdModalForCreateTree: ""
                                }, () => {
                                    if (this.state.programListForCreateTree.length == 1) {
                                        var event = {
                                            target: {
                                                name: "datasetIdModalForCreateTree",
                                                value: this.state.programListForCreateTree[0].id,
                                            }
                                        }
                                        this.dataChange(event)
                                    }
                                })
                            })
                        }.bind(this);
                    }.bind(this);
                }.bind(this);
            }.bind(this)
        } else {
            alert(i18n.t("static.supplyPlan.saveDataFirst"))
        }
    }
    /**
     * Function to create tree from tree template
     */
    createTreeForCreateTree() {
        var program = this.state.datasetListJexcelForCreateTree;
        let tempProgram = JSON.parse(JSON.stringify(program))
        let treeList = program.treeList;
        var treeTemplateId = '';
        var treeId = ""
        var maxTreeId = treeList.length > 0 ? Math.max(...treeList.map(o => o.treeId)) : 0;
        treeId = parseInt(maxTreeId) + 1;
        var nodeDataMap = {};
        var tempArray = [];
        var tempJson = {};
        var tempTree = {};
        var annualTargetCalculator = {};
        var curMonth = moment(program.currentVersion.forecastStartDate).format('YYYY-MM-DD');
        var treeTemplate = this.state.treeTemplateForCreateTree;
        var flatList = JSON.parse(JSON.stringify(treeTemplate.flatList));
        for (let i = 0; i < flatList.length; i++) {
            nodeDataMap = {};
            tempArray = [];
            annualTargetCalculator = {}
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
            if (flatList[i].payload.nodeDataMap[0][0].annualTargetCalculator != null && flatList[i].payload.nodeDataMap[0][0].annualTargetCalculator.actualOrTargetValueList.length != 0) {
                var firstMonthOfTarget = flatList[i].payload.nodeDataMap[0][0].annualTargetCalculator.firstMonthOfTarget;
                flatList[i].payload.nodeDataMap[0][0].annualTargetCalculator.firstMonthOfTarget = moment(curMonth).startOf('month').add(firstMonthOfTarget < 0 ? firstMonthOfTarget : parseInt(firstMonthOfTarget - 1), 'months').format("YYYY-MM-DD");
            }
            tempArray.push(tempJson);
            nodeDataMap[1] = tempArray;
            flatList[i].payload.nodeDataMap = nodeDataMap;
        }
        tempTree = {
            treeId: treeId,
            active: this.state.activeForCreateTree,
            forecastMethod: this.state.forecastMethodForCreateTree,
            label: {
                label_en: this.state.treeNameForCreateTree,
                label_fr: '',
                label_sp: '',
                label_pr: ''
            },
            notes: this.state.notesForCreateTree,
            regionList: this.state.regionListForCreateTree,
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
        calculateModelingData(programCopy, this, this.state.datasetIdModalForCreateTree, 0, 1, 1, treeId, false, true, true);
    }
    /**
     * Reterives planning unit list based on forecasting unit Id
     * @param {*} forecastingUnitId Forecasting unit Id for which planning units should be retrived
     */
    getPlanningUnitListByFUId(forecastingUnitId) {
        PlanningUnitService.getActivePlanningUnitListByFUId(forecastingUnitId).then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                planningUnitList: response.data,
                tempPlanningUnitId: response.data.length == 1 ? response.data[0].planningUnitId : "",
            }, () => {
                if (this.state.planningUnitList.length == 1) {
                    var { currentItemConfig } = this.state;
                    if (this.state.addNodeFlag && currentItemConfig.context.payload.nodeType.id == 5) {
                        currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id = this.state.planningUnitList[0].planningUnitId;
                        currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.label = this.state.planningUnitList[0].label;
                        currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.multiplier = this.state.planningUnitList[0].multiplier;
                        currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.unit.id = this.state.planningUnitList[0].unit.id;
                        currentItemConfig.context.payload.nodeDataMap[0][0].displayCalculatedDataValue = currentItemConfig.context.payload.nodeDataMap[0][0].calculatedDataValue;
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
                    var conversionFactor = this.state.planningUnitList.filter(x => x.planningUnitId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id);
                    this.setState({
                        conversionFactor: conversionFactor.length > 0 ? conversionFactor[0].multiplier : ""
                    }, () => {
                        if (!this.state.addNodeFlag) {
                            if (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) {
                                if (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths != undefined && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths != 1) {
                                    this.calculatePUPerVisit(false)
                                }
                            }
                            this.qatCalculatedPUPerVisit(0);
                        }
                        this.getUsageText();
                    });
                } else {
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
     * Retrives unit of forecasting unit
     * @param {*} forecastingUnitId Forecasting unit Id for which unit should be reterived
     */
    getForecastingUnitUnitByFUId(forecastingUnitId) {
        const { currentItemConfig } = this.state;
        var forecastingUnit = (this.state.forecastingUnitList.filter(c => c.forecastingUnitId == forecastingUnitId));
        if (forecastingUnit.length > 0) {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id = forecastingUnit[0].unit.id;
        }
        this.setState({
            currentItemConfig
        });
    }
    /**
     * Calculates no of forecasting unit patients
     */
    getNoOfFUPatient() {
        var noOfFUPatient;
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
            noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
        } else {
            noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
        }
        this.setState({
            noOfFUPatient
        }, () => {
        })
    }
    /**
     * Reterives the node unit of parent node
     */
    getNodeUnitOfPrent() {
        var id;
        if (this.state.currentItemConfig.context.parent != null) {
            id = this.state.currentItemConfig.parentItem.payload.nodeUnit.id;
        } else {
            id = this.state.currentItemConfig.context.payload.nodeUnit.id;
        }
        this.setState({
            usageTypeParent: id
        }, () => {
        });
    }
    /**
     * Reterives usage template list based on tracer category Id
     * @param {number} tcId Tracer category list for which list should be reterived
     */
    getUsageTemplateList(tcId) {
        var tracerCategoryId = tcId;
        UsageTemplateService.getUsageTemplateListForTree((tracerCategoryId != "" && tracerCategoryId != null ? tracerCategoryId : 0)).then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                usageTemplateListAll: listArray,
                usageTemplateList: listArray
            }, () => {
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
     * Function to copy data from usage template
     * @param {Event} event The change event
     */
    copyDataFromUsageTemplate(event) {
        var usageTemplate = (this.state.usageTemplateList.filter(c => c.usageTemplateId == event.target.value))[0];
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
        if ((currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage = usageTemplate.oneTimeUsage;
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount = usageTemplate.repeatCount;
            if (!usageTemplate.oneTimeUsage) {
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
            this.getForecastingUnitListByTracerCategoryId(0, usageTemplate.forecastingUnit.id);
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getNoOfFUPatient();
            this.getUsageText();
        });
    }
    /**
     * Function to calculate no of forecasting units required
     */
    getNoFURequired() {
        var usagePeriodId;
        var usageTypeId;
        var usageFrequency;
        var repeatUsagePeriodId;
        var oneTimeUsage;
        var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage;
            }
            if (usageTypeId == 2 || (usageTypeId == 1 && oneTimeUsage != null && oneTimeUsage != "true" && oneTimeUsage != true)) {
                usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usagePeriod != null ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId : "";
                usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
            }
        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage;
            }
            if (usageTypeId == 2 || (usageTypeId == 1 && oneTimeUsage != null && oneTimeUsage != "true" && oneTimeUsage != true)) {
                usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId : "";
                usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
            }
        }
        var noOfMonthsInUsagePeriod = 0;
        if ((usagePeriodId != null && usagePeriodId != "") && (usageTypeId == 2 || (oneTimeUsage == "false" || oneTimeUsage == false))) {
            var convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
            if (usageTypeId == 2) {
                var div = (convertToMonth * usageFrequency);
                if (div != 0) {
                    noOfMonthsInUsagePeriod = usageFrequency / convertToMonth;
                }
            } else {
                var noOfFUPatient;
                if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                    noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                } else {
                    noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                }
                noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
            }
            if (oneTimeUsage != "true" && oneTimeUsage != true && usageTypeId == 1) {
                if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                    repeatUsagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId : "";
                } else {
                    repeatUsagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod != null ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId : "";
                }
                if (repeatUsagePeriodId) {
                    convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == repeatUsagePeriodId))[0].convertToMonth;
                } else {
                    convertToMonth = 0;
                }
            }
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                var noFURequired = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true ? ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
            } else {
                var noFURequired = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true ? ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.repeatCount / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
            }
        } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                noFURequired = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            } else {
                noFURequired = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            }
        }
        this.setState({
            noFURequired: (noFURequired != "" && noFURequired != 0 ? noFURequired : 0)
        });
    }
    /**
     * Function to calculate no of months in usage period
     */
    getNoOfMonthsInUsagePeriod() {
        var usagePeriodId;
        var usageTypeId;
        var usageFrequency;
        var oneTimeUsage;
        var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage;
            }
            if (usageTypeId == 2 || (usageTypeId == 1 && oneTimeUsage != null && oneTimeUsage != "true" && oneTimeUsage != true)) {
                usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usagePeriod != null && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId != "" ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId : "";
                usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageFrequency != null ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
            }
        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id;
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage;
            }
            if (usageTypeId == 2 || (usageTypeId == 1 && oneTimeUsage != null && oneTimeUsage != "true" && oneTimeUsage != true)) {
                usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod != null && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId != "" ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId : "";
                usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency != "" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
            }
        }
        var noOfMonthsInUsagePeriod = 0;
        if (usagePeriodId != null && usagePeriodId != "") {
            var convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
            if (usageTypeId == 2) {
                var div = (convertToMonth * usageFrequency);
                if (div != 0) {
                    noOfMonthsInUsagePeriod = usageFrequency / convertToMonth;
                }
            } else {
                var noOfFUPatient;
                if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                    noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                } else {
                    noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                }
                noOfMonthsInUsagePeriod = oneTimeUsage != "true" && oneTimeUsage != true ? convertToMonth * usageFrequency * noOfFUPatient : noOfFUPatient;
            }
        } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            } else {
                noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            }
            noOfMonthsInUsagePeriod = noOfFUPatient;
        }
        this.setState({
            noOfMonthsInUsagePeriod
        }, () => {
        });
    }
    /**
     * Function to build usage text
     */
    getUsageText() {
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
                if (this.state.currentItemConfig.context.parent != null) {
                    if (this.state.currentItemConfig.parentItem.payload.nodeUnit.id != "") {
                        selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.parentItem.payload.nodeUnit.id)[0].label.label_en;
                    } else {
                        selectedText = "";
                    }
                } else {
                    if (this.state.currentItemConfig.context.payload.nodeUnit.id != "") {
                        selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en;
                    } else {
                        selectedText = "";
                    }
                }
            } else {
                if (this.state.currentItemConfig.context.parent != null) {
                    if (this.state.currentItemConfig.parentItem.payload.nodeUnit.id != "") {
                        selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.parentItem.payload.nodeUnit.id)[0].label.label_en;
                    } else {
                        selectedText = "";
                    }
                } else {
                    if (this.state.currentItemConfig.context.payload.nodeUnit.id != "") {
                        selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en;
                    } else {
                        selectedText = "";
                    }
                }
            }
            if (this.state.addNodeFlag) {
                var forecastingUnitUnit = document.getElementById("forecastingUnitUnit");
                selectedText1 = forecastingUnitUnit.options[forecastingUnitUnit.selectedIndex].text;
            } else {
                selectedText1 = this.state.unitList.filter(c => c.unitId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id)[0].label.label_en;
            }
            if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 || ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true)) {
                selectedText2 = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod != null ? this.state.usagePeriodList.filter(c => c.usagePeriodId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId)[0].label.label_en : "";
            }
        }
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
            if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
                if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != true) {
                    var selectedText3 = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod != null ? this.state.usagePeriodList.filter(c => c.usagePeriodId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId)[0].label.label_en : "";
                    var repeatCount = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount.toString().replaceAll(",", "") : '';
                    usageText = "Every " + addCommas(noOfPersons) + " " + selectedText.trim() + "(s) requires " + addCommas(noOfForecastingUnitsPerPerson) + " " + selectedText1.trim() + "(s), " + addCommas(usageFrequency) + " times per " + selectedText2.trim() + " for " + addCommas(repeatCount) + " " + selectedText3.trim();
                } else {
                    usageText = "Every " + addCommas(noOfPersons) + " " + selectedText.trim() + "(s) requires " + addCommas(noOfForecastingUnitsPerPerson) + " " + selectedText1.trim() + "(s)";
                }
            } else {
                usageText = "Every " + addCommas(noOfPersons) + " " + selectedText.trim() + "(s) requires " + addCommas(noOfForecastingUnitsPerPerson) + " " + selectedText1.trim() + "(s) every " + addCommas(usageFrequency) + " " + selectedText2.trim() + " indefinitely";
            }
        } else {
            if (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id != "") {
                var nodeUnitTxt = this.state.currentItemConfig.parentItem.parent != null ? this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en : this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.context.parent)[0].payload.nodeUnit.id)[0].label.label_en;
                if (this.state.addNodeFlag) {
                    var planningUnitId = document.getElementById("planningUnitId");
                    var planningUnit = planningUnitId.options[planningUnitId.selectedIndex].text;
                } else {
                    var planningUnitObj = this.state.planningUnitList.filter(c => c.planningUnitId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id);
                    if (planningUnitObj.length > 0) {
                        var planningUnit = planningUnitObj[0].label.label_en
                    } else {
                        var planningUnit = ""
                    }
                }
                if ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
                    var sharePu;
                    sharePu = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.puPerVisit != "" ? parseFloat((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.puPerVisit).toFixed(8) : "";
                    usageText = "For each " + nodeUnitTxt.trim() + "(s) we need " + addCommasWith8Decimals(sharePu) + " " + planningUnit;
                } else {
                    var puPerInterval = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.puPerVisit != "" ? parseFloat((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.puPerVisit).toFixed(8) : "";
                    usageText = "For each " + nodeUnitTxt.trim() + "(s) we need " + addCommasWith8Decimals(puPerInterval) + " " + planningUnit + " every " + (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths + " months";
                }
            } else {
                usageText = "";
            }
        }
        this.setState({
            usageText
        }, () => {
        });
    }
    /**
     * Retrieves the forecasting unit list based on the tracer category ID.
     * @param {number} type - Type 0 to set the forecasting unit value
     * @param {boolean} isUsageTemplate - Indicates whether it's a usage template.
     */
    getForecastingUnitListByTracerCategoryId(type, isUsageTemplate) {
        var tracerCategoryId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id;
        if (tracerCategoryId != "" && tracerCategoryId != undefined && tracerCategoryId != 'undefined') {
            ForecastingUnitService.getForcastingUnitListByTracerCategoryId(tracerCategoryId)
                .then(response => {
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
                                if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id != undefined && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id != "") {
                                    if (this.state.forecastingUnitMultiList.filter(c => c.value == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id).length != 0) {
                                        this.getPlanningUnitListByFUId((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id);
                                    } else {
                                        this.setState({ planningUnitList: [] });
                                    }
                                }
                            }
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
                forecastingUnitMultiList: [],
                forecastingUnitList: [],
                fuValues: [], tempPlanningUnitId: '', planningUnitList: []
            })
        }
    }
    /**
     * Filters planning unit nodes based on user input.
     * @param {object} e - The event object representing user input.
     */
    filterPlanningUnitNode(e) {
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
    /**
     * Filters planning unit and forecasting unit nodes based on user input.
     * @param {object} e - The event object representing user input.
     */
    filterPlanningUnitAndForecastingUnitNodes(e) {
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
    /**
     * Expand or collapse a node
     * @param {Event} e The click event
     */
    expandCollapse(e) {
        var updatedItems = this.state.items;
        var tempToggleArray = this.state.toggleArray;
        if (e.target.checked) {
            this.setState({ collapseState: true })
            updatedItems = updatedItems.map(item => {
                tempToggleArray.push(item.id);
                if (item.parent != null) {
                    return { ...item, templateName: "contactTemplateMin", expanded: true, payload: { ...item.payload, collapsed: true } };
                }
                return item;
            });
            this.setState({ toggleArray: tempToggleArray })
        } else {
            this.setState({ collapseState: false })
            updatedItems = updatedItems.map(item => {
                tempToggleArray = tempToggleArray.filter((e) => e != item.id)
                return { ...item, templateName: "contactTemplate", expanded: false, payload: { ...item.payload, collapsed: false } };
            });
            this.setState({ toggleArray: tempToggleArray })
        }
        this.setState({ items: updatedItems })
    }
    /**
     * Retrieves a list of branch templates based on the item configuration.
     * @param {object} itemConfig - The configuration of the item.
     */
    getBranchTemplateList(itemConfig) {
        var nodeTypeId = itemConfig.payload.nodeType.id;
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['treeTemplate'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('treeTemplate');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var nodeTypeList = [];
                var nodeType = this.state.nodeTypeList.filter(c => c.id == nodeTypeId)[0];
                var possibleNodeTypes = "";
                for (let i = 0; i < nodeType.allowedChildList.length; i++) {
                    var obj = this.state.nodeTypeList.filter(c => c.id == nodeType.allowedChildList[i])[0];
                    if (i != nodeType.allowedChildList.length - 1) {
                        possibleNodeTypes += (getLabelText(obj.label, this.state.lang) + " " + i18n.t('static.tree.node')) + " " + i18n.t('static.common.and') + " ";
                    } else {
                        possibleNodeTypes += (getLabelText(obj.label, this.state.lang) + " " + i18n.t('static.tree.node'));
                    }
                    nodeTypeList.push(nodeType.allowedChildList[i]);
                }
                var fullBranchTemplateList = myResult.filter(x => x.active == true);
                var branchTemplateList = [];
                for (let i = 0; i < fullBranchTemplateList.length; i++) {
                    var flatList = fullBranchTemplateList[i].flatList;
                    var node = flatList.filter(x => x.level == 0)[0];
                    var result = nodeTypeList.indexOf(node.payload.nodeType.id) != -1;
                    if (result) {
                        branchTemplateList.push(fullBranchTemplateList[i]);
                    }
                }
                this.setState({
                    fullBranchTemplateList,
                    branchTemplateList: branchTemplateList.sort(function (a, b) {
                        a = getLabelText(a.label, this.state.lang).toLowerCase();
                        b = getLabelText(b.label, this.state.lang).toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }.bind(this)),
                    isBranchTemplateModalOpen: true,
                    parentNodeIdForBranch: itemConfig.id,
                    nodeTypeParentNode: getLabelText(nodeType.label, this.state.lang),
                    possibleNodeTypes: possibleNodeTypes
                }, () => {
                })
            }.bind(this);
        }.bind(this)
    }
    /**
     * Generates a branch from a selected template.
     * @param {string} treeTemplateId - The ID of the selected tree template.
     */
    generateBranchFromTemplate(treeTemplateId) {
        var items = this.state.items;
        var parentItem = JSON.parse(JSON.stringify(this.state.items.filter(x => x.id == this.state.parentNodeIdForBranch)[0]));
        var curMonth = moment(this.state.forecastStartDate).format('YYYY-MM-DD');
        var branchTemplate = this.state.branchTemplateList.filter(x => x.treeTemplateId == treeTemplateId)[0];
        var flatList = JSON.parse(JSON.stringify(branchTemplate.flatList));
        var nodeDataMap = {};
        var tempArray = [];
        var tempJson = {};
        var tempTree = {};
        var maxNodeDataId = this.getMaxNodeDataId();
        var maxNodeId = items.length > 0 ? Math.max(...items.map(o => o.id)) : 0;
        var scenarioList = this.state.scenarioList;
        var nodeArr = [];
        var json;
        var parentLevel = parentItem.level;
        for (let i = 0; i < flatList.length; i++) {
            nodeDataMap = {};
            tempArray = [];
            if (flatList[i].level == 0) {
                flatList[i].parent = this.state.parentNodeIdForBranch;
                flatList[i].payload.parentNodeId = flatList[i].parent;
            }
            var nodeId = parseInt(maxNodeId + 1);
            maxNodeId++;
            var nodeData = nodeArr.length > 0 && flatList[i].level != 0 ? nodeArr.filter(x => x.oldId == flatList[i].parent)[0] : 0;
            json = {
                oldId: flatList[i].id,
                newId: nodeId
            }
            nodeArr.push(json);
            flatList[i].id = nodeId;
            flatList[i].payload.nodeId = nodeId;
            if (flatList[i].level != 0) {
                flatList[i].parent = nodeData.newId;
                flatList[i].payload.parentNodeId = flatList[i].parent;
            }
            var parentSortOrder = items.filter(c => c.id == flatList[i].parent)[0].sortOrder;
            var childList1 = items.filter(c => c.parent == flatList[i].parent);
            var maxSortOrder = childList1.length > 0 ? Math.max(...childList1.map(o => o.sortOrder.replace(parentSortOrder + '.', ''))) : 0;
            flatList[i].sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(maxSortOrder) + 1)).slice(-2));
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
            nodeDataMap[0] = tempArray;
            (nodeDataMap[0])[0].nodeDataId = maxNodeDataId;
            maxNodeDataId++;
            flatList[i].payload.nodeDataMap = nodeDataMap;
            items.push(JSON.parse(JSON.stringify(flatList[i])));
            var findNodeIndex = items.findIndex(n => n.id == flatList[i].id);
            items[findNodeIndex].level = parseInt(parentLevel + 1);
            parentLevel++;
        }
        this.setState({
            items,
            isBranchTemplateModalOpen: false
        }, () => {
            this.calculateMOMData(0, 2);
        });
    }
    /**
     * Gets the value of a node based on its type.
     * @param {number} nodeTypeId - The ID of the node type.
     * @returns {any} The value of the node.
     */
    getNodeValue(nodeTypeId) {
        if (nodeTypeId == 2 && this.state.currentItemConfig.context.payload.nodeDataMap != null && this.state.currentItemConfig.context.payload.nodeDataMap[0] != null && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0] != null) {
            return (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue;
        }
    }
    /**
     * Retrieves notes associated with the current item configuration.
     * @returns {string} The notes associated with the current item configuration.
     */
    getNotes() {
        return (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].notes;
    }
    /**
     * Calculate node value
     */
    calculateNodeValue() {
    }
    /**
     * This function is triggered when this component is about to unmount
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }
    /**
     * This function is trigged when this component is updated and is being used to display the warning for leaving unsaved changes
     */
    componentDidUpdate = () => {
        if (this.state.isChanged == true || this.state.isTemplateChanged == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
     * Reterives node type, usage template, procurement agent, forecast method, unit, usage period, usage type, tracer category, modeling type and tree template list on component mount
     */
    componentDidMount() {
        this.getNodeTyeList();
        this.getUsageTemplateList(0);
        this.procurementAgentList();
        ForecastMethodService.getActiveForecastMethodList().then(response => {
            var listArray = response.data.filter(x => x.forecastMethodTypeId == 1);
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
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
        UnitService.getUnitListByDimensionId(TREE_DIMENSION_ID).then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                nodeUnitList: listArray
            }, () => {
                var nodeUnitListPlural = [];
                for (let i = 0; i < this.state.nodeUnitList.length; i++) {
                    var nodeUnit = JSON.parse(JSON.stringify(this.state.nodeUnitList[i]));
                    nodeUnit.label.label_en = nodeUnit.label.label_en + "(s)";
                    nodeUnitListPlural.push(nodeUnit);
                }
                this.setState({ nodeUnitListPlural })
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
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
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
        UsagePeriodService.getUsagePeriod().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
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
        DatasetService.getUsageTypeList().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
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
        DropdownService.getTracerCategoryDropdownList()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    tracerCategoryList: listArray
                })
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
        ModelingTypeService.getModelingTypeListActive().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
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
        DropdownService.getTreeTemplateListForDropdown().then(response => {
            var treeTemplateList = response.data.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                treeTemplateList,
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
        setTimeout(() => {
            if (this.state.treeTemplateId != "" || this.state.treeTemplate.treeTemplateId > 0) {
                var treeTemplateId = this.state.treeTemplateId != "" ? this.state.treeTemplateId : this.state.treeTemplate.treeTemplateId;
                DatasetService.getTreeTemplateById(treeTemplateId).then(response => {
                    var items = response.data.flatList;
                    items = items.map(item => {
                        if (item.payload.collapsed)
                            return { ...item, templateName: "contactTemplateMin", expanded: true }
                        return { ...item, templateName: "contactTemplate", expanded: false }
                    })
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
                    }
                    var tempToggleObject = [];
                    tempToggleObject = items.filter(item =>
                        (item.payload.collapsed == true)
                    );
                    let tempToggleList = tempToggleObject.map(item => item.id);
                    if (Array.from(new Set(tempToggleList)).length + 1 >= items.length) {
                        var parentNode = items.filter(item =>
                            (item.parent == null)
                        );
                        tempToggleList.push(parentNode[0].id)
                        this.setState({ collapseState: true })
                    } else {
                        this.setState({ collapseState: false })
                    }
                    var treeTemplateList = this.state.treeTemplateList;
                    if (response.data.active == false) {
                        treeTemplateList.push({
                            treeTemplateId: response.data.treeTemplateId,
                            label: response.data.label
                        })
                    }
                    this.setState({
                        treeTemplate: response.data,
                        items,
                        tempItems: items,
                        toggleArray: tempToggleList,
                        loading: true,
                        treeTemplateList: treeTemplateList
                    }, () => {
                        setTimeout(() => {
                            this.generateMonthList();
                            var curDate = (moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD'));
                            var monthList = JSON.parse(JSON.stringify(this.state.monthList));
                            var minMonth = monthList[0].id;
                            var maxMonth = monthList.sort((a, b) => b.id - a.id)[0].id;
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
                                        monthNo: this.state.monthList.length > 0 ? this.state.monthList[0].id : -1,
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
                                            sharePlanningUnit: "true"
                                        },
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
                                    monthNo: this.state.monthList.length > 0 ? this.state.monthList[0].id : -1,
                                    dataValue: '0',
                                    displayDataValue: '',
                                    calculatedDataValue: '0',
                                    fuNode: {
                                        forecastingUnit: {
                                            oneTimeUsage: "false",
                                            lagInMonths: 0,
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
                                        sharePlanningUnit: "true"
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
                    setTimeout(() => {
                        this.generateMonthList();
                    }, 0);
                })
            }
        }, 0)
    }
    /**
     * Adds a new scenario to the tab list.
     */
    addScenario() {
        const { tabList } = this.state;
        const { scenario } = this.state;
        var newTabObject = {
            scenarioId: parseInt(tabList.length) + 1,
            scenarioName: scenario.scenarioName,
            scenarioDesc: scenario.scenarioDesc,
            active: true
        };
        var tabList1 = [...tabList, newTabObject];
        this.setState({
            tabList: [...tabList, newTabObject],
            activeTab: parseInt(tabList.length),
            openAddScenarioModal: false
        }, () => {
        });
    }
    /**
     * Handles changes in node type selection.
     * @param {number} value - The new value of the selected node type.
     */
    nodeTypeChange(value) {
        var nodeTypeId = value;
        var { currentItemConfig } = this.state;
        if (nodeTypeId == 1) {
            this.setState({
                numberNode: false,
                aggregationNode: false
            });
        } else if (nodeTypeId == 2) {
            this.setState({
                numberNode: false,
                aggregationNode: true
            });
        }
        else if (nodeTypeId == 3) {
            this.setState({
                numberNode: true,
                aggregationNode: true
            });
        }
        else if (nodeTypeId == 4) {
            if (currentItemConfig.context.payload.label.label_en == "" || currentItemConfig.context.payload.label.label_en == null) {
                if (currentItemConfig.context.payload.nodeDataMap[0][0].fuNode != null && currentItemConfig.context.payload.nodeDataMap[0][0].fuNode != "" && currentItemConfig.context.payload.nodeDataMap[0][0].fuNode != undefined && currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit != null && currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit != "" && currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit != undefined && (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id != "" && (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id != null && (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id != undefined) {
                    currentItemConfig.context.payload.label.label_en = getLabelText((currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label, this.state.lang).trim();
                }
            }
            if (currentItemConfig.context.payload.nodeDataMap[0][0].fuNode == null || currentItemConfig.context.payload.nodeDataMap[0][0].fuNode == "" || currentItemConfig.context.payload.nodeDataMap[0][0].fuNode == undefined) {
                currentItemConfig.context.payload.nodeDataMap[0][0].fuNode = {
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
                }
                currentItemConfig.context.payload.nodeDataMap[0][0].puNode = {
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
            this.setState({
                numberNode: true,
                aggregationNode: true
            }, () => {
                this.getNodeUnitOfPrent();
            });
        }
        if ((nodeTypeId == 3 || nodeTypeId == 4 || nodeTypeId == 5) && this.state.addNodeFlag && currentItemConfig.context.payload.nodeDataMap[0][0].dataValue == "") {
            currentItemConfig.context.payload.nodeDataMap[0][0].dataValue = 100;
            this.setState({ currentItemConfig }, () => {
                this.calculateParentValueFromMOM(currentItemConfig.context.payload.nodeDataMap[0][0].monthNo);
            })
        }
        if (this.state.addNodeFlag) {
            this.getSameLevelNodeList(parseInt(currentItemConfig.context.level + 1), 0, nodeTypeId, currentItemConfig.context.parent);
        }
    }
    /**
     * Toggles the active tab in the modal.
     * @param {number} tabPane - The index of the tab pane to toggle.
     * @param {number} tab - The new active tab index.
     */
    toggleModal(tabPane, tab) {
        const newArray = this.state.activeTab1.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab1: newArray,
            showCalculatorFields: false
        }, () => {
            var isValid = document.getElementById('isValidError').value;
            this.setState({ isValidError: isValid });
            if (this.state.currentItemConfig.context.payload.nodeType.id == 1) {
                if (tab == 2) {
                    this.showMomData();
                }
            }
            if (tab == 2) {
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
                    var modelingTypeListNew = [];
                    for (var i = 0; i < arr.length; i++) {
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
            }
        });
    }
    /**
     * Resets the tree component.
     */
    resetTree() {
        this.componentDidMount();
    }
    /**
     * Handles changes in data input fields.
     * @param {Event} event - The event object containing information about the data change.
     */
    dataChange(event) {
        var flag = false;
        let { currentItemConfig } = this.state;
        let { treeTemplate } = this.state;
        if (event.target.name == "treeNameForCreateTree") {
            this.setState({
                treeNameForCreateTree: event.target.value,
            });
        }
        if (event.target.name == "forecastMethodIdForCreateTree") {
            var forecastMethodForCreateTree = document.getElementById("forecastMethodIdForCreateTree");
            var selectedTextForCreateTree = forecastMethodForCreateTree.options[forecastMethodForCreateTree.selectedIndex].text;
            let label = {
                label_en: selectedTextForCreateTree,
                label_fr: '',
                label_sp: '',
                label_pr: ''
            }
            this.setState({
                forecastMethodForCreateTree: {
                    id: event.target.value,
                    label: label
                },
            });
        }
        if (event.target.name == "notesForCreateTree") {
            this.setState({
                notesForCreateTree: event.target.value,
            });
        }
        if (event.target.name == "activeForCreateTree") {
            this.setState({
                activeForCreateTree: event.target.id === "active11ForCreateTree" ? false : true
            });
        }
        if (event.target.name == "datasetIdModalForCreateTree") {
            if (event.target.value != "") {
            }
            this.setState({
                datasetIdModalForCreateTree: event.target.value,
            }, () => {
                localStorage.setItem("sesDatasetId", event.target.value);
                this.getRegionListForCreateTree(event.target.value);
            });
        }
        if (event.target.name === "branchTemplateId") {
            this.setState({ branchTemplateId: event.target.value }, () => {
            });
        }
        if (event.target.name === "treeTemplateId") {
            var cont = false;
            if (this.state.isChanged == true || this.state.isTemplateChanged == true) {
                var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
                if (cf == true) {
                    cont = true;
                } else {
                }
            } else {
                cont = true;
            }
            if (cont == true) {
                if (event.target.value != "") {
                    this.setState({
                        loading: true,
                        isTemplateChanged: false,
                        isChanged: false,
                        treeTemplateId: event.target.value
                    }, () => {
                        this.componentDidMount()
                    })
                }
            }
        }
        if (event.target.name == "firstMonthOfTarget") {
            var monthId = event.target.value;
            var currentCalculatorStartValue = this.getMomValueForDateRange(monthId);
            this.setState({ currentCalculatorStartDate: monthId, currentCalculatorStartValue, firstMonthOfTarget: monthId }, () => {
                if (!this.state.currentEndValueEdit && !this.state.currentTargetChangePercentageEdit && !this.state.currentTargetChangeNumberEdit) {
                } else {
                    if (!this.state.currentEndValueEdit) {
                        this.calculateMomByEndValue();
                    } else if (!this.state.currentTargetChangePercentageEdit) {
                        this.calculateMomByChangeInPercent();
                    } else if (!this.state.currentTargetChangeNumberEdit) {
                        this.calculateMomByChangeInNumber();
                    }
                }
                var monthsFutureCalculateBasedOnPositiveNegative = monthId < 0 ? (12 - Number(monthId)) : (12 + Number(monthId))
                var monthsPastCalculateBasedOnPositiveNegative = monthId > 13 || monthId < 0 ? (12 - Number(monthId)) : (13 - Number(monthId))
                treeTemplate.monthsInPast = monthsPastCalculateBasedOnPositiveNegative;
                treeTemplate.monthsInFuture = Number(Number(12 * Number(this.state.yearsOfTarget)) + monthsFutureCalculateBasedOnPositiveNegative);
                this.generateMonthList();
            });
        }
        if (event.target.name == "calculatorTargetDate") {
            this.setState({ currentCalculatorStopDate: event.target.value }, () => {
                if (!this.state.currentEndValueEdit && !this.state.currentTargetChangePercentageEdit && !this.state.currentTargetChangeNumberEdit) {
                } else {
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
            if (event.target.value == "active1") {
                this.setState({ currentModelingType: 4, targetSelectDisable: true })
            }
            else if (event.target.value == "active2") {
                this.setState({ currentModelingType: 3, targetSelectDisable: true })
            }
            else if (event.target.value == "active3") {
                this.setState({ currentModelingType: 2, targetSelectDisable: false })
            }
            else {
                this.setState({ currentModelingType: 5, targetSelectDisable: true })
            }
            if (!this.state.currentTargetChangeNumberEdit && this.state.currentModelingType != 2) {
                this.setState({
                    currentTargetChangePercentageEdit: false,
                    currentEndValueEdit: false
                });
            }
            this.setState({ isCalculateClicked: 1 })
        }
        if (event.target.name === "targetSelect") {
            this.setState({
                targetSelect: event.target.value == "target1" ? 1 : 0
            });
        }
        if (event.target.name === "targetYears") {
            this.setState({
                yearsOfTarget: event.target.value,
                isCalculateClicked: 1
            }, () => {
                if (this.state.yearsOfTarget != "") {
                    treeTemplate.monthsInFuture = ((Number(this.state.yearsOfTarget) + 2) * 12);
                    this.generateMonthList();
                }
            });
        }
        if (event.target.name == "monthId") {
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
            (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit = event.target.id === "sharePlanningUnitFalse" ? false : true;
            this.qatCalculatedPUPerVisit(2);
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
                this.getNoFURequired();
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
            if (!this.state.modelingChanged) {
                this.filterScalingDataByMonth(event.target.value);
            }
            if (this.state.modelingEl != "") {
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
            (currentItemConfig.context.payload.nodeDataMap[0])[0].displayDataValue = value.toString();
            this.calculateParentValueFromMOM((currentItemConfig.context.payload.nodeDataMap[0])[0].monthNo);
        }
        if (event.target.name === "nodeValue") {
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
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons = (event.target.value).replaceAll(",", "");
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "lagInMonths") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.lagInMonths = event.target.value;
        }
        if (event.target.name === "forecastingUnitPerPersonsFC") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson = (event.target.value).replaceAll(",", "");
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
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount = (event.target.value).replaceAll(",", "");
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "monthNo") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].monthNo = event.target.value;
            this.calculateParentValueFromMOM(event.target.value);
        }
        if (event.target.name === "usageFrequencyCon" || event.target.name === "usageFrequencyDis") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency = (event.target.value).replaceAll(",", "");
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "usagePeriodIdCon" || event.target.name === "usagePeriodIdDis") {
            var fuNode = (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode;
            var usagePeriod = event.target.name === "usagePeriodIdCon" ? document.getElementById("usagePeriodIdCon") : document.getElementById("usagePeriodIdDis");
            var selectedText = usagePeriod.options[usagePeriod.selectedIndex].text;
            var usagePeriod = {
                usagePeriodId: event.target.value,
                label: {
                    label_en: selectedText
                }
            };
            fuNode.usagePeriod = usagePeriod;
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode = fuNode;
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "usageTypeIdFU") {
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
                (currentItemConfig.context.payload.nodeDataMap[0])[0].isPUMappingCorrect = 1;
                currentItemConfig.context.payload.label = JSON.parse(JSON.stringify(pu.label));
            } else {
                (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id = '';
                (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id = '';
                (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier = '';
                (currentItemConfig.context.payload.nodeDataMap[0])[0].isPUMappingCorrect = 0;
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
        if (event.target.name != "treeNameForCreateTree" && event.target.name != "forecastMethodIdForCreateTree" && event.target.name != "notesForCreateTree" && event.target.name != "activeForCreateTree" && event.target.name != "datasetIdModalForCreateTree" && event.target.name != "treeTemplateId" && event.target.name != "monthId") {
            this.setState({ isChanged: true })
        }
        this.setState({ currentItemConfig }, () => {
            if (flag) {
                if (event.target.name === "planningUnitId") {
                    this.calculatePUPerVisit(false);
                } else if (event.target.name === "refillMonths") {
                    this.calculatePUPerVisit(true);
                    this.qatCalculatedPUPerVisit(0);
                } else { }
                this.getUsageText();
            }
        });
    }
    /**
     * Creates a new planning unit node and adds it to the tree.
     * This function generates a new planning unit node based on the provided item configuration and parent node.
     * It assigns a unique ID to the new node, updates its level and payload properties, and sets its sort order.
     * The function also updates the tree template with new level information and sets the state with the updated items and tree template.
     * @param {Object} itemConfig - The configuration object for the new planning unit node.
     * @param {Object} parent - The parent node of the new planning unit node.
     */
    createPUNode(itemConfig, parent) {
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
            if (unitId != "" && unitId != null) {
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
                    id: unitId != "" && unitId != null ? parseInt(unitId) : null,
                    label: label
                }
            })
        }
        treeTemplate.levelList = treeLevelList;
        newItem.level = parseInt(itemConfig.context.level + 1);
        newItem.payload.nodeId = nodeId;
        var pu = this.state.planningUnitList.filter(x => x.planningUnitId == this.state.tempPlanningUnitId)[0];
        newItem.payload.label = pu.label;
        newItem.payload.nodeType.id = 5;
        newItem.sortOrder = itemConfig.context.sortOrder.concat(".").concat(("01").slice(-2));
        (newItem.payload.nodeDataMap[0])[0].nodeDataId = this.getMaxNodeDataId() + 1;
        (newItem.payload.nodeDataMap[0])[0].dataValue = 100;
        (newItem.payload.nodeDataMap[0])[0].displayDataValue = (newItem.payload.nodeDataMap[0])[0].dataValue;
        (newItem.payload.nodeDataMap[0])[0].displayCalculatedDataValue = (newItem.payload.nodeDataMap[0])[0].calculatedDataValue;
        (newItem.payload.nodeDataMap[0])[0].puNode.planningUnit.id = this.state.tempPlanningUnitId;
        (newItem.payload.nodeDataMap[0])[0].puNode.planningUnit.label = pu.label;
        try {
            var puPerVisit = "";
            if (itemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) {
                var refillMonths = 1;
                (newItem.payload.nodeDataMap[0])[0].puNode.refillMonths = refillMonths;
                puPerVisit = parseFloat(((itemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / pu.multiplier).toFixed(8);
            } else {
                puPerVisit = parseFloat(this.state.noFURequired / pu.multiplier).toFixed(8);
            }
            (newItem.payload.nodeDataMap[0])[0].puNode.puPerVisit = puPerVisit;
        } catch (err) {
            (newItem.payload.nodeDataMap[0])[0].puNode.refillMonths = 1;
            (newItem.payload.nodeDataMap[0])[0].puNode.puPerVisit = "";
        }
        (newItem.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit = true;
        (newItem.payload.nodeDataMap[0])[0].puNode.planningUnit.multiplier = pu.multiplier;
        (newItem.payload.nodeDataMap[0])[0].puNode.planningUnit.unit.id = pu.unit.id;
        this.setState({
            items: [...items, newItem],
            cursorItem: nodeId,
            converionFactor: pu.multiplier,
            treeTemplate
        }, () => {
            if (!itemConfig.context.payload.extrapolation) {
                this.calculateMOMData(newItem.id, 0);
            } else {
                this.setState({
                    loading: false
                })
            }
        });
    }
    /**
     * Handles the click event when adding a new item to the tree.
     * This function creates a new item based on the provided item configuration and adds it to the tree.
     * It assigns a unique ID to the new item, updates its level, payload, sort order, and visibility properties.
     * The function also updates the tree template with new level information and sets the state with the updated items and tree template.
     * @param {Object} itemConfig - The configuration object for the new item.
     * @param {boolean} addNode - Indicates whether to add a node.
     * @param {Object} data - Data associated with the new item.
     * @returns {void}
     */
    onAddButtonClick(itemConfig, addNode, data) {
        const { items } = this.state;
        var maxNodeId = items.length > 0 ? Math.max(...items.map(o => o.id)) : 0;
        var nodeId = parseInt(maxNodeId + 1);
        var newItem = itemConfig.context;
        newItem.parent = itemConfig.context.parent;
        newItem.id = nodeId;
        const { treeTemplate } = this.state;
        var treeLevelList = treeTemplate.levelList != undefined ? treeTemplate.levelList : [];
        var levelListFiltered = treeLevelList.findIndex(c => c.levelNo == parseInt(itemConfig.context.level + 1));
        if (levelListFiltered == -1) {
            var label = {}
            var unitId = this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.parentItem.payload.nodeUnit.id : this.state.currentItemConfig.context.payload.nodeUnit.id;
            if (unitId != "" && unitId != null) {
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
                    id: unitId != "" && unitId != null ? parseInt(unitId) : null,
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
        newItem.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(maxSortOrder) + 1)).slice(-2));
        (newItem.payload.nodeDataMap[0])[0].nodeDataId = this.getMaxNodeDataId() + 1;
        if (addNode) {
            (newItem.payload.nodeDataMap[0])[0].nodeDataModelingList = data;
        }
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
        this.setState({
            items: [...items, newItem],
            cursorItem: nodeId,
            isSubmitClicked: false,
            treeTemplate
        }, () => {
            if (itemConfig.context.payload.nodeType.id == 4) {
                this.createPUNode(JSON.parse(JSON.stringify(itemConfig)), nodeId);
            } else {
                this.calculateMOMData(newItem.id, 0);
            }
        });
    }
    /**
     * Calculate values for aggregation node
     * @param {Array} items - The array of tree items.
     */
    calculateValuesForAggregateNode(items) {
        var getAllAggregationNode = items.filter(c => c.payload.nodeType.id == 1).sort(function (a, b) {
            a = a.id;
            b = b.id;
            return a > b ? -1 : a < b ? 1 : 0;
        }.bind(this));
        for (var i = 0; i < getAllAggregationNode.length; i++) {
            var getChildAggregationNode = items.filter(c => c.parent == getAllAggregationNode[i].id && (c.payload.nodeType.id == 1 || c.payload.nodeType.id == 2))
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
                }, () => {
                });
            } else {
                var findNodeIndex = items.findIndex(n => n.id == getAllAggregationNode[i].id);
                items[findNodeIndex].payload.nodeDataMap[0][0].dataValue = "";
                items[findNodeIndex].payload.nodeDataMap[0][0].calculatedDataValue = "";
                this.setState({
                    items: items,
                }, () => {
                });
            }
        }
    }
    /**
     * Remove the node from tree on delete node
     * @param {*} itemConfig The configuration object that needs to be deleted
     */
    onRemoveButtonClick(itemConfig) {
        this.setState({ loading: true, isTemplateChanged: true }, () => {
            var { items } = this.state;
            const ids = items.map(o => o.id)
            const filtered = items.filter(({ id }, index) => !ids.includes(id, index + 1))
            items = filtered;
            this.setState(this.getDeletedItems(items, [itemConfig.id]), () => {
                setTimeout(() => {
                    this.calculateMOMData(0, 2);
                }, 0);
            });
        });
    }
    /**
     * Updates tree on moving a node
     */
    onMoveItem(parentid, itemid) {
        const { items } = this.state;
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
    /**
     * Determines whether an item can be dropped into a specific parent node.
     * @param {number} parentid - ID of the parent node.
     * @param {number} itemid - ID of the item node.
     * @returns {boolean} - True if item can be dropped into parent, false otherwise.
     */
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
    /**
     * Removes an item from the tree by its ID.
     * @param {number} id - ID of the item to be removed.
     */ 
    onRemoveItem(id) {
        const { items } = this.state;
        this.setState(this.getDeletedItems(items, [id]));
    }
    /**
     * Retrieves updated item list with specified items removed and cursor parent item.
     * @param {Array} items - Array of tree items.
     * @param {Array} deletedItems - Array of IDs of items to be removed.
     * @returns {Object} - Updated items array and cursor parent item.
     */
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
    /**
     * Retrieves parent item of deleted items to set as cursor item.
     * @param {Tree} tree - Tree data structure representing items.
     * @param {Array} deletedItems - Array of IDs of items to be removed.
     * @param {Set} deletedHash - Set containing IDs of items to be removed.
     * @returns {number|null} - ID of cursor parent item, or null if not found.
     */
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
    /**
     * Constructs a tree data structure from array of tree items.
     * @param {Array} items - Array of tree items.
     * @returns {Tree} - Tree data structure.
     */
    getTree(items = []) {
        const tree = Tree();
        for (let index = 0; index < items.length; index += 1) {
            const item = items[index];
            tree.add(item.parent, item.id, item);
        }
        return tree;
    }
    /**
     * Handles the event when the highlight changes and updates the state accordingly.
     * @param {Event} event - The event triggering the highlight change.
     * @param {Object} data - Data containing the context of the item.
     */
    onHighlightChanged(event, data) {
        const { context: item } = data;
        const { config } = this.state;
        if (item != null) {
            this.setState({
                title: item.title,
                config: {
                    ...config,
                },
                highlightItem: item.id,
                cursorItem: item.id
            }, () => {
            })
        }
    };
    /**
     * Handles the event when the cursor changes and updates the state accordingly.
     * @param {Event} event - The event triggering the cursor change.
     * @param {Object} data - Data containing the context of the item.
     */
    onCursoChanged(event, data) {
        const { context: item } = data;
        if (item != null) {
            this.setState({
                viewMonthlyData: true,
                usageTemplateId: '',
                sameLevelNodeList: [],
                showCalculatorFields: false,
                openAddNodeModal: data.context.templateName ? data.context.templateName == "contactTemplateMin" ? false : true : true,
                modelingChangedOrAdded: false,
                addNodeFlag: false,
                showMomDataPercent: false,
                showMomData: false,
                orgCurrentItemConfig: JSON.parse(JSON.stringify(data.context)),
                currentItemConfig: JSON.parse(JSON.stringify(data)),
                level0: (data.context.level == 0 ? false : true),
                numberNode: (data.context.payload.nodeType.id == 1 || data.context.payload.nodeType.id == 2 ? false : true),
                aggregationNode: (data.context.payload.nodeType.id == 1 ? false : true),
                scalingList: (data.context.payload.nodeDataMap[0])[0].nodeDataModelingList != null ? (data.context.payload.nodeDataMap[0])[0].nodeDataModelingList : [],
                highlightItem: item.id,
                cursorItem: item.id,
                usageText: '',
                currentNodeTypeId: data.context.payload.nodeType.id
            }, () => {
                if (data.context.templateName ? data.context.templateName == "contactTemplateMin" ? true : false : false) {
                    var itemConfig = data.context;
                    var items = this.state.items;
                    var updatedItems = items;
                    if (this.state.toggleArray.includes(itemConfig.id)) {
                        var parentId = itemConfig.payload.parentNodeId != undefined ? itemConfig.payload.parentNodeId : itemConfig.parent;
                        var parentNode = items.filter(e => e.id == parentId);
                        var tempToggleArray = this.state.toggleArray.filter((e) => e != itemConfig.id)
                        if (parentNode[0].templateName ? parentNode[0].templateName == "contactTemplateMin" ? false : true : true) {
                            tempToggleArray = tempToggleArray.filter((e) => e != parentId)
                        }
                        updatedItems = updatedItems.map(item => {
                            if (item.sortOrder.toString().startsWith(itemConfig.sortOrder.toString())) {
                                tempToggleArray = tempToggleArray.filter((e) => e != item.id)
                                return { ...item, templateName: "contactTemplate", expanded: false, payload: { ...item.payload, collapsed: false } };
                            }
                            return item;
                        });
                        this.setState({ toggleArray: tempToggleArray })
                    } else {
                        var tempToggleArray = this.state.toggleArray;
                        tempToggleArray.push(itemConfig.id);
                        updatedItems = updatedItems.map(item => {
                            if (item.sortOrder.toString().startsWith(itemConfig.sortOrder.toString())) {
                                tempToggleArray.push(item.id);
                                return { ...item, templateName: "contactTemplateMin", expanded: true, payload: { ...item.payload, collapsed: true } };
                            }
                            return item;
                        });
                        this.setState({ toggleArray: tempToggleArray })
                    }
                    this.setState({ collapseState: false })
                    this.setState({ items: updatedItems })
                }
                const ids = this.state.items.map(o => o.id)
                const filtered = this.state.items.filter(({ id }, index) => !ids.includes(id, index + 1))
                this.getNodeTypeFollowUpList(data.context.level == 0 ? 0 : data.parentItem.payload.nodeType.id);
                if (data.context.level != 0) {
                    this.calculateParentValueFromMOM(data.context.payload.nodeDataMap[0][0].monthNo);
                }
                if (data.context.payload.nodeType.id == 4) {
                    this.getForecastingUnitListByTracerCategoryId(1, 0);
                    this.setState({
                        fuValues: { value: (data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id, label: getLabelText((data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label, this.state.lang) + " | " + (data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id }
                    });
                    this.getNodeUnitOfPrent();
                    this.getNoOfFUPatient();
                    this.getNoOfMonthsInUsagePeriod();
                    this.getNoFURequired();
                    this.getUsageTemplateList((data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id);
                    this.getUsageText();
                    this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.currentItemConfig.context.level == 0 ? this.state.currentItemConfig.context.payload.nodeUnit.id : this.state.currentItemConfig.parentItem.payload.nodeUnit.id;
                } else if (data.context.payload.nodeType.id == 5) {
                    setTimeout(() => {
                        this.getPlanningUnitListByFUId((data.parentItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id);
                        this.getNoOfMonthsInUsagePeriod();
                        this.getNoFURequired();
                    }, 0);
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
    /**
     * Function to update the node info in json
     * @param {*} currentItemConfig The item configuration object that needs to be updated
     */
    updateNodeInfoInJson(currentItemConfig) {
        let isNodeChanged = currentItemConfig.context.newTemplateFlag;
        var nodeTypeId = currentItemConfig.context.payload.nodeType.id;
        var nodes = this.state.items;
        if (this.state.deleteChildNodes) {
            var childNodes = nodes.filter(c => c.parent == currentItemConfig.context.id);
            childNodes.map(item => {
                nodes = nodes.filter(c => !c.sortOrder.startsWith(item.sortOrder))
            })
        }
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
        if (currentItemConfig.context.payload.nodeType.id == 4) {
            var puNodes = nodes.filter(c => c.parent == currentItemConfig.context.id);
            for (var puN = 0; puN < puNodes.length; puN++) {
                var refillMonths = "";
                var puPerVisit = "";
                if (puNodes[puN].payload.nodeDataMap[0][0].puNode != null) {
                    var pu = puNodes[puN].payload.nodeDataMap[0][0].puNode.planningUnit;
                    var findNodeIndexPu = nodes.findIndex(n => n.id == puNodes[puN].id);
                    var puNode = nodes[findNodeIndexPu].payload.nodeDataMap[0][0].puNode;
                    if (currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) {
                        var refillMonths = 1;
                        puPerVisit = parseFloat(((currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / pu.multiplier).toFixed(8);
                        puNode.refillMonths = refillMonths;
                        puNode.puPerVisit = puPerVisit;
                    } else {
                        puPerVisit = parseFloat(this.state.noFURequired / pu.multiplier).toFixed(8);
                        puNode.puPerVisit = puPerVisit;
                    }
                    nodes[findNodeIndexPu].payload.nodeDataMap[0][0].puNode = puNode;
                }
            }
        }
        const { treeTemplate } = this.state;
        var treeLevelList = treeTemplate.levelList;
        if (currentItemConfig.context.level == 0 && treeLevelList != undefined) {
            var levelListFiltered = treeLevelList.findIndex(c => c.levelNo == parseInt(currentItemConfig.context.level));
            if (levelListFiltered != -1) {
                var unitId = currentItemConfig.context.payload.nodeType.id == 4 && currentItemConfig.context.parent != null ? currentItemConfig.parentItem.payload.nodeUnit.id : currentItemConfig.context.payload.nodeUnit.id;
                var label = {}
                if (unitId != "" && unitId != null) {
                    label = this.state.nodeUnitList.filter(c => c.unitId == unitId)[0].label;
                }
                treeLevelList[levelListFiltered].unit = {
                    id: unitId != "" && unitId != null ? parseInt(unitId) : null,
                    label: label
                }
            }
            treeTemplate.levelList = treeLevelList;
        }
        this.setState({
            items: nodes,
            isSubmitClicked: false,
            treeTemplate
        }, () => {
            if (currentItemConfig.context.payload.nodeType.id == 4 && (isNodeChanged == 0 || isNodeChanged == false)) {
                this.createPUNode(JSON.parse(JSON.stringify(currentItemConfig)), currentItemConfig.context.id);
            } else {
                this.calculateMOMData(0, 0);
            }
        });
    }
    /**
     * Builds jexcel table for annual target calculator
     */
    buildModelingCalculatorJexcel() {
        jexcel.destroy(document.getElementById("modelingCalculatorJexcel"), true);
        var dataArray = [];
        var actualOrTargetValueList = this.state.actualOrTargetValueList;
        var monthListForModelingCalculator = this.state.monthList;
        let count = this.state.yearsOfTarget;
        for (var j = 0; j <= count; j++) {
            var startdate = monthListForModelingCalculator[j * 12].name;
            var stopDate = monthListForModelingCalculator[Number(j * 12 + 11)];
            var stopDate1 = monthListForModelingCalculator[Number(j * 12 + 22)].id;
            var modifyStartDate1 = monthListForModelingCalculator[Number(j * 12 + 5)].id;
            var modifyStopDate1 = monthListForModelingCalculator[Number(j * 12 + 16)].id;
            var data = [];
            data[0] = startdate + " to " + stopDate.name//year
            data[1] = actualOrTargetValueList.length > 0 ? actualOrTargetValueList[j] : ""//Actual / Target
            data[7] = j == 0 ? "" : modifyStartDate1//H
            data[8] = j == count ? stopDate1 : modifyStopDate1
            dataArray[j] = data;
        }
        var data = dataArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [90, 160, 80, 80, 90, 90, 80, 80, 90, 90],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.common.year'),
                    type: 'text',
                    width: '130',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.actualOrTarget'),
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##0',
                    tooltip: i18n.t('static.tooltip.actualOrTarget')
                },
                {
                    title: i18n.t('static.tree.annualChangePer'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##0.00%',
                    disabledMaskOnEdition: false,
                    readOnly: true
                },
                {
                    title: 'Monthly Change Percentage',
                    type: 'hidden',
                    decimal: '.',
                    mask: '#,##0.0000%',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.calculatedTotal'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##0',
                    disabledMaskOnEdition: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.differenceTargetVsCalculatedNumber'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##0',
                    disabledMaskOnEdition: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.differenceTargetVsCalculatedPer'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##0.00%',
                    disabledMaskOnEdition: true,
                    readOnly: true
                },
                {
                    title: "Updated Start Date",
                    type: 'hidden'
                },
                {
                    title: "Updated Stop Date",
                    type: 'hidden'
                },
                {
                    title: "Calculated numbers (for Altius to check against when coding)",
                    type: 'hidden'
                }
            ],
            editable: true,
            onload: this.loadedModelingCalculatorJexcel,
            pagination: localStorage.getItem("sesRecordCount"),
            onchange: this.changeModelingCalculatorJexcel,
            search: false,
            columnSorting: false,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };
        var modelingCalculatorEl = jexcel(document.getElementById("modelingCalculatorJexcel"), options);
        this.el = modelingCalculatorEl;
        this.setState({
            modelingCalculatorEl: modelingCalculatorEl,
        }, () => {
            this.filterScalingDataByMonth(this.state.scalingMonth);
            if (this.state.actualOrTargetValueList.length > 0) {
                this.changed3(this.state.isCalculateClicked);
            }
        });
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    validFieldData() {
        var json = this.state.modelingCalculatorEl.getJson(null, false);
        var valid = true;
        for (var j = 0; j < json.length; j++) {
            var col = ("B").concat(parseInt(j) + 1);
            var value = this.state.modelingCalculatorEl.getValueFromCoords(1, j);
            if (value === "") {
                this.state.modelingCalculatorEl.setStyle(col, "background-color", "transparent");
                this.state.modelingCalculatorEl.setStyle(col, "background-color", "yellow");
                this.state.modelingCalculatorEl.setComments(col, "Please provide data for all years. If actuals are unknown, please provide the best estimate or use year 1 target. If future targets are not known, please provide the best estimate or repeat the last target.");
                valid = false;
            } else if (value == 0) {
                this.state.modelingCalculatorEl.setStyle(col, "background-color", "transparent");
                this.state.modelingCalculatorEl.setStyle(col, "background-color", "yellow");
                this.state.modelingCalculatorEl.setComments(col, "Actual/Target value cannot be 0");
                valid = false;
            } else {
                this.state.modelingCalculatorEl.setStyle(col, "background-color", "transparent");
                this.state.modelingCalculatorEl.setComments(col, "");
            }
        }
        return valid;
    }
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed3(isCalculateClicked) {
        var elInstance = this.state.modelingCalculatorEl;
        var validation = this.validFieldData();
        if (validation) {
            this.setState({ isCalculateClicked: isCalculateClicked })
            var dataArr = elInstance.records;
            var dataArray = [];
            var dataArrayTotal = [];
            let modelingType = document.getElementById("modelingType").value;
            for (var j = 0; j < dataArr.length; j++) {
                var monthlyChange = "";
                var rowData = dataArr[j];
                if (j == 0) {
                    elInstance.setValueFromCoords(9, j, parseFloat(rowData[1].v / 12), true);
                }
                if (j > 0) {
                    var rowData1 = dataArr[j - 1];
                    elInstance.setValueFromCoords(2, j, rowData[1].v == "" ? '' : parseFloat(((rowData[1].v - rowData1[1].v) / rowData1[1].v) * 100), true);
                    if (modelingType == "active1") {
                        monthlyChange = parseFloat((Math.pow(rowData[1].v / rowData1[1].v, (1 / 12)) - 1) * 100);
                    } else {
                        monthlyChange = parseFloat(((rowData[1].v - rowData1[1].v) / rowData1[1].v) / 12 * 100);
                    }
                    elInstance.setValueFromCoords(3, j, monthlyChange, true);
                    var start = rowData[7].v
                    var stop = rowData[8].v
                    var count = 1;
                    var calculatedTotal = parseFloat(rowData1[9].v);
                    var calculatedTotal1 = parseFloat(rowData1[9].v);
                    var arr = [];
                    while (start <= stop) {
                        start = (start == 0 ? (start + 1) : start)
                        if (modelingType == "active1") {
                            calculatedTotal = parseFloat(calculatedTotal * (1 + monthlyChange / 100));
                        } else {
                            if (count <= 12) {
                                var a = parseFloat(1 + (monthlyChange / 100 * count));
                                calculatedTotal1 = parseFloat(calculatedTotal * a);
                            }
                        }
                        var programJson = {
                            date: start,
                            calculatedTotal: modelingType == "active1" ? calculatedTotal : calculatedTotal1,
                            startDate: start - 5,
                            stopDate: stop - 5,
                            yCord: j
                        }
                        dataArrayTotal.push(programJson);
                        arr.push(programJson)
                        count++;
                        start++;
                    }
                    elInstance.setValueFromCoords(9, j, modelingType == "active1" ? calculatedTotal : arr[arr.length - 1].calculatedTotal, true);
                }
                dataArray[j] = rowData[1].v;
            }
            if (dataArrayTotal.length > 0) {
                const arraySum = dataArrayTotal
                for (var i = 6; i < arraySum.length; i = (i + 12)) {
                    var abc = 0;
                    for (var j = i; j <= (i + 11); j++) {
                        if (arraySum[j] != undefined) {
                            abc = abc + Number(arraySum[j].calculatedTotal)
                        }
                    }
                    elInstance.setValueFromCoords(4, arraySum[i].yCord, Math.round(abc), true);
                    var value = elInstance.getValueFromCoords(1, arraySum[i].yCord);
                    elInstance.setValueFromCoords(5, arraySum[i].yCord, abc != 0 ? (abc - value) : 0, true);
                    elInstance.setValueFromCoords(6, arraySum[i].yCord, abc != 0 ? (abc - value) / value * 100 : 0, true);
                }
                this.setState({
                    actualOrTargetValueList: dataArray
                });
            }
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedModelingCalculatorJexcel = function (instance, cell) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var elInstance = instance.worksheets[0];
        elInstance.setValueFromCoords(2, 0, "", true)
        elInstance.setValueFromCoords(3, 0, "", true)
        elInstance.setValueFromCoords(4, 0, "", true)
        elInstance.setValueFromCoords(5, 0, "", true)
        elInstance.setValueFromCoords(6, 0, "", true)
        elInstance.setValueFromCoords(7, 0, "", true)
        var asterisk = document.getElementsByClassName("jss")[1].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[3].classList.add('InfoTr');
        tr.children[5].classList.add('InfoTr');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');
        tr.children[3].title = i18n.t('static.tooltip.annualChangePer');
        tr.children[5].title = i18n.t('static.tooltip.calculatedTotal');
        tr.children[6].title = i18n.t('static.tooltip.diffTargetVsCalculatedNo');
        tr.children[7].title = i18n.t('static.tooltip.diffTargetVsCalculatedPer');
        var cell = elInstance.getCell("C1");
        cell.classList.add('shipmentEntryDoNotInclude');
        var cell = elInstance.getCell("E1");
        cell.classList.add('shipmentEntryDoNotInclude');
        var cell = elInstance.getCell("F1");
        cell.classList.add('shipmentEntryDoNotInclude');
        var cell = elInstance.getCell("G1");
        cell.classList.add('shipmentEntryDoNotInclude');
    }
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changeModelingCalculatorJexcel = function (instance, cell, x, y, value) {
        if (x == 1) {
            if (this.state.isCalculateClicked != 1) {
                this.setState({ isCalculateClicked: 1 });
            }
        }
    }
    /**
     * Renders node details and modeling details tab
     * @returns {JSX.Element} - Node details and modeling data.
     */
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
                        let label = data.labels[tooltipItem.index];
                        let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        var cell1 = value
                        cell1 += '';
                        var x = cell1.split('.');
                        var x1 = x[0];
                        var x2 = x.length > 1 ? '.' + x[1] : '';
                        var x3 = x.length > 1 ? parseFloat(x1 + x2).toFixed(2) : x1 + x2;
                        var rgx = /(\d+)(\d{3})/;
                        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + addCommas(x3);
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
                                this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.unit.id != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.unit.id != null ? getLabelText(this.state.unitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.forecastingUnit.unit.id)[0].label, this.state.lang) : ""
                                    : this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.unit.id != "" ? getLabelText(this.state.unitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.unit.id)[0].label, this.state.lang) : ""
                                        : this.state.currentItemConfig.context.payload.nodeUnit.id != "" ? getLabelText(this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label, this.state.lang)
                                            : ""
                                : "",
                            fontColor: 'black'
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: 'black',
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
                    pointHitRadius: 5,
                    showInLegend: false,
                    yAxisID: 'B',
                    data: (this.state.momElPer).getJson(null, false).map((item, index) => (this.state.momElPer.getValue(`E${parseInt(index) + 1}`, true))),
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
                pointHoverBackgroundColor: 'transparent',
                pointHoverBorderColor: 'transparent',
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
        return (
            <>
                <TabPane tabId="1">
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            nodeTitle: this.state.currentItemConfig.context.payload.label.label_en,
                            nodeTypeId: this.state.currentItemConfig.context.payload.nodeType.id,
                            nodeUnitId: this.state.currentItemConfig.context.payload.nodeUnit.id != null ? this.state.currentItemConfig.context.payload.nodeUnit.id : "",
                            nodeValue: this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].calculatedDataValue : this.state.currentItemConfig.context.payload.nodeDataMap[0][0].dataValue,
                            percentageOfParent: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue,
                            forecastingUnitId: this.state.fuValues,
                            tempPlanningUnitId: this.state.tempPlanningUnitId,
                            usageTypeIdFU: "",
                            lagInMonths: "",
                            noOfPersons: "",
                            forecastingUnitPerPersonsFC: "",
                            repeatCount: "",
                            usageFrequencyCon: "",
                            usageFrequencyDis: "",
                            oneTimeUsage: "",
                            planningUnitId: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id : ""
                        }}
                        validationSchema={validationSchemaNodeData}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            var save = false;
                            if ((this.state.currentNodeTypeId == 3 && this.state.currentItemConfig.context.payload.nodeType.id == 4) || (this.state.currentNodeTypeId == 4 && this.state.currentItemConfig.context.payload.nodeType.id == 3)) {
                                var cf = window.confirm(i18n.t("static.tree.nodeTypeChanged"));
                                if (cf == true) {
                                    save = true;
                                    this.setState({
                                        deleteChildNodes: true
                                    })
                                } else {
                                }
                            } else {
                                save = true;
                                this.setState({
                                    deleteChildNodes: false
                                })
                            }
                            if (save) {
                                if (!this.state.isSubmitClicked) {
                                    this.setState({ loading: true, openAddNodeModal: false, isSubmitClicked: true, isTemplateChanged: true }, () => {
                                        setTimeout(() => {
                                            if (this.state.addNodeFlag) {
                                                this.onAddButtonClick(this.state.currentItemConfig)
                                            } else {
                                                this.updateNodeInfoInJson(this.state.currentItemConfig)
                                            }
                                            if (this.state.modelingChangedOrAdded) {
                                                this.formSubmitLoader();
                                            }
                                            this.setState({
                                                cursorItem: 0,
                                                highlightItem: 0
                                            })
                                        }, 0);
                                    })
                                }
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
                                    {(this.state.currentItemConfig.context.payload.nodeType.id != 5) &&
                                        <>
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
                                                        readOnly={!this.state.editable}
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
                                                        disabled={!this.state.editable}
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
                                                        disabled={!this.state.editable ? true : this.state.currentItemConfig.context.payload.nodeType.id > 3 && this.state.currentItemConfig.context.parent != null ? true : false}
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
                                                        disabled={!this.state.editable}
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
                                                            readOnly={!this.state.editable}
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
                                                        value={addCommasParentValue(this.state.parentValue).toString()}
                                                    ></Input>
                                                </FormGroup>
                                                <div>
                                                    <Popover placement="top" isOpen={this.state.popoverOpenNodeValue} target="Popover7" trigger="hover" toggle={this.toggleNodeValue}>
                                                        <PopoverBody>{this.state.numberNode ? i18n.t('static.tooltip.NodeValue') : i18n.t('static.tooltip.NumberNodeValue')}</PopoverBody>
                                                    </Popover>
                                                </div>
                                                <FormGroup className="col-md-6" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                                    {(this.state.currentItemConfig.context.payload.nodeType.id < 4) &&
                                                        <Label htmlFor="currencyId">{i18n.t('static.tree.nodeValue')}{this.state.numberNode}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover7" onClick={this.toggleNodeValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>}
                                                    {(this.state.currentItemConfig.context.payload.nodeType.id >= 4) &&
                                                        <Label htmlFor="currencyId"> {this.state.currentItemConfig.context.payload.nodeDataMap[0][0].dataValue} % of {i18n.t('static.tree.parentValue')} {i18n.t('static.common.for')} {i18n.t("static.ManageTree.Month")} {this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo} {this.state.numberNode}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover7" onClick={this.toggleNodeValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>}
                                                    <Input type="text"
                                                        id="nodeValue"
                                                        name="nodeValue"
                                                        bsSize="sm"
                                                        valid={!errors.nodeValue && (this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2) ? addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue) : addCommas(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].dataValue) != ''}
                                                        invalid={touched.nodeValue && !!errors.nodeValue}
                                                        onBlur={handleBlur}
                                                        readOnly={!this.state.editable ? true : this.state.numberNode ? true : false}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        value={(this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2) ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue == 0 ? "0" : addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue) : addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue.toString())}
                                                    ></Input>
                                                    <FormFeedback className="red">{errors.nodeValue}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="col-md-6">
                                                    <Label htmlFor="currencyId">{i18n.t('static.common.note')}</Label>
                                                    <Input type="textarea"
                                                        id="notes"
                                                        name="notes"
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        readOnly={!this.state.editable}
                                                        value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].notes}
                                                    ></Input>
                                                </FormGroup>
                                            </div>
                                        </>
                                    }
                                    <div>
                                        <div className="row">
                                            {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                                <>
                                                    {this.state.level0 &&
                                                        <>
                                                            <div>
                                                                <Popover placement="top" isOpen={this.state.popoverOpenParent} target="Popover2" trigger="hover" toggle={this.toggleParent}>
                                                                    <PopoverBody>{i18n.t('static.tooltip.Parent')}</PopoverBody>
                                                                </Popover>
                                                            </div>
                                                            <FormGroup className="col-md-4">
                                                                <Label htmlFor="currencyId">Parent <i class="fa fa-info-circle icons pl-lg-2" id="Popover2" onClick={this.toggleParent} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                    <FormGroup className="col-md-4">
                                                        <Label htmlFor="currencyId">Node Title<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover3" onClick={this.toggleNodeTitle} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <Input type="text"
                                                            id="nodeTitle"
                                                            name="nodeTitle"
                                                            bsSize="sm"
                                                            readOnly={!this.state.editable}
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
                                                    <FormGroup className="col-md-4">
                                                        <Label htmlFor="currencyId">Node Type<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover4" onClick={this.toggleNodeType} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <Input
                                                            type="select"
                                                            id="nodeTypeId"
                                                            name="nodeTypeId"
                                                            disabled={!this.state.editable}
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
                                                    <FormGroup className="col-md-4" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                                        <Label htmlFor="currencyId">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            id="monthNo"
                                                            name="monthNo"
                                                            bsSize="sm"
                                                            disabled={!this.state.editable}
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
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenParentValue} target="Popover6" trigger="hover" toggle={this.toggleParentValue}>
                                                            <PopoverBody>{i18n.t('static.tooltip.ParentValue')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-4" style={{ display: this.state.numberNode ? 'block' : 'none' }}>
                                                        <Label htmlFor="currencyId">{i18n.t('static.tree.parentValue')} {this.state.currentItemConfig.context.level != 0}{"in Month "} {this.state.currentItemConfig.context.level != 0 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo} <i class="fa fa-info-circle icons pl-lg-2" id="Popover6" onClick={this.toggleParentValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <Input type="text"
                                                            id="parentValue"
                                                            name="parentValue"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            value={addCommasParentValue(this.state.parentValue).toString() + " " + this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en}
                                                        ></Input>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-4">
                                                        <Label htmlFor="currencyId">{i18n.t('static.common.note')}</Label>
                                                        <Input type="textarea"
                                                            id="notes"
                                                            name="notes"
                                                            readOnly={!this.state.editable}
                                                            style={{ height: "100px" }}
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].notes}
                                                        ></Input>
                                                    </FormGroup>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenPercentageOfParent} target="Popover5" trigger="hover" toggle={this.togglePercentageOfParent}>
                                                            <PopoverBody>{i18n.t('static.tooltip.PercentageOfParent')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-4 PUNodemarginTop" style={{ display: this.state.numberNode ? 'block' : 'none' }}>
                                                        <Label htmlFor="currencyId">Percentage of Parent<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover5" onClick={this.togglePercentageOfParent} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <InputGroup>
                                                            <Input type="number"
                                                                id="percentageOfParent"
                                                                name="percentageOfParent"
                                                                bsSize="sm"
                                                                readOnly={!this.state.editable}
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
                                                        <Popover placement="top" isOpen={this.state.popoverOpenNodeValue} target="Popover7" trigger="hover" toggle={this.toggleNodeValue}>
                                                            <PopoverBody>{this.state.numberNode ? i18n.t('static.tooltip.NodeValue') : i18n.t('static.tooltip.NumberNodeValue')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-4 PUNodemarginTop" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                                        <Label htmlFor="currencyId">Node Value<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover7" onClick={this.toggleNodeValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <Input type="text"
                                                            id="nodeValue"
                                                            name="nodeValue"
                                                            bsSize="sm"
                                                            valid={!errors.nodeValue && (this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2) ? addCommas(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].displayCalculatedDataValue) : addCommas(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].dataValue) != ''}
                                                            invalid={touched.nodeValue && !!errors.nodeValue}
                                                            onBlur={handleBlur}
                                                            readOnly={!this.state.editable ? true : this.state.numberNode ? true : false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            value={((this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2) ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].displayCalculatedDataValue == 0 ? "0" : addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].displayCalculatedDataValue) : addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue.toString()))
                                                                + " " + this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en}
                                                        ></Input>
                                                        <FormFeedback className="red">{errors.nodeValue}</FormFeedback>
                                                    </FormGroup>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenTypeOfUsePU} target="Popover8" trigger="hover" toggle={this.toggleTypeOfUsePU}>
                                                            <PopoverBody>{i18n.t('static.tooltip.TypeOfUsePU')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-3">
                                                    </FormGroup>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">{i18n.t('static.common.typeofuse')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover8" onClick={this.toggleTypeOfUsePU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                    <FormGroup className="col-md-7">
                                                        <Label htmlFor="currencyId">Forecasting unit</Label>
                                                        <Input type="text"
                                                            id="forecastingUnitPU"
                                                            name="forecastingUnitPU"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en + " | " + (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id}>
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="currencyId">{(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "# of FU / month / " : "# of FU / usage / "}{this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en}</Label>
                                                        <div className='d-flex'>
                                                            <Input type="text"
                                                                id="forecastingUnitPU"
                                                                name="forecastingUnitPU"
                                                                bsSize="sm"
                                                                readOnly={true}
                                                                className="mr-2"
                                                                value={addCommas((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? Number((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod).toFixed(4) : this.state.noFURequired)}>
                                                            </Input>
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
                                                        </div>
                                                    </FormGroup></>
                                            }
                                            {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                                <>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenConversionFactorFUPU} target="Popover9" trigger="hover" toggle={this.toggleConversionFactorFUPU}>
                                                            <PopoverBody>{i18n.t('static.tooltip.Conversionfactor')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">Conversion (FU:PU) <i class="fa fa-info-circle icons pl-lg-2" id="Popover9" onClick={this.toggleConversionFactorFUPU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <Input type="text"
                                                            id="conversionFactor"
                                                            name="conversionFactor"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={addCommas(this.state.conversionFactor)}>
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-7">
                                                        <Label htmlFor="currencyId">{i18n.t('static.product.product')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="select"
                                                            id="planningUnitId"
                                                            name="planningUnitId"
                                                            bsSize="sm"
                                                            disabled={!this.state.editable}
                                                            className={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].isPUMappingCorrect == 0 ? "redPU" : ""}
                                                            valid={!errors.planningUnitId && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.planningUnit.id != '' : !errors.planningUnitId}
                                                            invalid={touched.planningUnitId && !!errors.planningUnitId}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 5 ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id : ""}>
                                                            <option value="" className="black">{i18n.t('static.common.select')}</option>
                                                            {this.state.planningUnitList.length > 0
                                                                && this.state.planningUnitList.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.planningUnitId} className="black">
                                                                            {getLabelText(item.label, this.state.lang) + " | " + item.planningUnitId}
                                                                        </option>
                                                                    )
                                                                }, this)}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.planningUnitId}</FormFeedback>
                                                    </FormGroup>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenNoOfPUUsage} target="Popover11" trigger="hover" toggle={this.toggleNoOfPUUsage}>
                                                            <PopoverBody>{i18n.t('static.tooltip.NoOfPUUsage')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="currencyId">{(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "# of PU / month / " : "# of PU / usage / "}{this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en} <i class="fa fa-info-circle icons pl-lg-2" id="Popover11" onClick={this.toggleNoOfPUUsage} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <div className='d-flex'>
                                                            <Input type="text"
                                                                id="noOfPUUsage"
                                                                name="noOfPUUsage"
                                                                bsSize="sm"
                                                                readOnly={true}
                                                                className="mr-2"
                                                                value={addCommasWith8Decimals((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? parseFloat(((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / this.state.conversionFactor).toFixed(8) : (this.state.noFURequired / this.state.conversionFactor))}>
                                                            </Input>
                                                            <Input type="select"
                                                                id="planningUnitUnitPU"
                                                                name="planningUnitUnitPU"
                                                                bsSize="sm"
                                                                disabled="true"
                                                                onChange={(e) => { this.dataChange(e) }}
                                                                value={this.state.planningUnitList.filter(c => c.planningUnitId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id).length > 0 ? this.state.planningUnitList.filter(c => c.planningUnitId == (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id)[0].unit.id : ""}>
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
                                                        </div>
                                                    </FormGroup>
                                                    {(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 &&
                                                        <>
                                                            <div style={{ display: "none" }}>
                                                                <div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenQATEstimateForInterval} target="Popover12" trigger="hover" toggle={this.toggleQATEstimateForInterval}>
                                                                        <PopoverBody>{i18n.t('static.tooltip.QATEstimateForInterval')}</PopoverBody>
                                                                    </Popover>
                                                                </div>
                                                                <FormGroup className="col-md-2">
                                                                    <Label htmlFor="currencyId">Consumption Interval (Reference)<i class="fa fa-info-circle icons pl-lg-2" id="Popover12" onClick={this.toggleQATEstimateForInterval} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-10">
                                                                    <Input type="text"
                                                                        id="interval"
                                                                        name="interval"
                                                                        bsSize="sm"
                                                                        readOnly={true}
                                                                        value={addCommas(this.round(this.state.conversionFactor / ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)))}>
                                                                    </Input>
                                                                </FormGroup>
                                                            </div>
                                                            <FormGroup className="col-md-2">
                                                                <Label htmlFor="currencyId"># PU / Interval / {this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.parent != null && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id).length > 0 && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}(s)</Label>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-10">
                                                                <Input type="text"
                                                                    id="puPerVisitQATCalculated"
                                                                    name="puPerVisitQATCalculated"
                                                                    readOnly={true}
                                                                    bsSize="sm"
                                                                    value={addCommasWith8Decimals(this.state.qatCalculatedPUPerVisit)}>
                                                                </Input>
                                                            </FormGroup>
                                                            <div style={{ display: "none" }}>
                                                                <div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenConsumptionIntervalEveryXMonths} target="Popover13" trigger="hover" toggle={this.toggleConsumptionIntervalEveryXMonths}>
                                                                        <PopoverBody>{i18n.t('static.tooltip.ConsumptionIntervalEveryXMonths')}</PopoverBody>
                                                                    </Popover>
                                                                </div>
                                                                <FormGroup className="col-md-2">
                                                                    <Label htmlFor="currencyId">{i18n.t('static.tree.consumptionIntervalEveryXMonths')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover13" onClick={this.toggleConsumptionIntervalEveryXMonths} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-10">
                                                                    <Input type="text"
                                                                        id="refillMonths"
                                                                        name="refillMonths"
                                                                        valid={!errors.refillMonths && this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.refillMonths != '' : !errors.refillMonths}
                                                                        invalid={touched.refillMonths && !!errors.refillMonths}
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => {
                                                                            handleChange(e);
                                                                            this.dataChange(e)
                                                                        }}
                                                                        readOnly={!this.state.editable}
                                                                        bsSize="sm"
                                                                        value={addCommas(this.state.currentItemConfig.context.payload.nodeType.id == 5 && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths : "")}>
                                                                    </Input>
                                                                    <FormFeedback className="red">{errors.refillMonths}</FormFeedback>
                                                                </FormGroup>
                                                            </div>
                                                            <FormGroup className="col-md-2">
                                                                <Label htmlFor="currencyId">{this.state.currentItemConfig.parentItem != null && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode != null && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "# PU / Interval / " : "# PU / "}{this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.parent != null && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id).length > 0 && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}?</Label>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-10">
                                                                <Input type="text"
                                                                    id="puPerVisit"
                                                                    name="puPerVisit"
                                                                    readOnly={!this.state.editable ? true : this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode != null && (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == "false" || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == false || this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) ? false : true}
                                                                    bsSize="sm"
                                                                    valid={!errors.puPerVisit && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit != '' : !errors.puPerVisit}
                                                                    invalid={touched.puPerVisit && !!errors.puPerVisit}
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => {
                                                                        handleChange(e);
                                                                        this.dataChange(e)
                                                                    }}
                                                                    value={this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode != null ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == "false" || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == false) ?
                                                                        addCommasWith8Decimals(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit) :
                                                                        addCommasWith8Decimals(this.state.noFURequired / this.state.conversionFactor) : ''}>
                                                                </Input>
                                                                <FormFeedback className="red">{errors.puPerVisit}</FormFeedback>
                                                            </FormGroup>
                                                        </>}
                                                    {(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1 &&
                                                        <>
                                                            <div>
                                                                <Popover placement="top" isOpen={this.state.popoverOpenWillClientsShareOnePU} target="Popover14" trigger="hover" toggle={this.toggleWillClientsShareOnePU}>
                                                                    <PopoverBody>{i18n.t('static.tooltip.willClientsShareOnePU')}</PopoverBody>
                                                                </Popover>
                                                            </div>
                                                            <Input type="hidden" id="refillMonths" />
                                                            <FormGroup className="col-md-6">
                                                                <Label htmlFor="currencyId">{i18n.t('static.tree.willClientsShareOnePU?')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover14" onClick={this.toggleWillClientsShareOnePU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                <FormGroup check inline>
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        id="sharePlanningUnitTrue"
                                                                        name="sharePlanningUnit"
                                                                        value={true}
                                                                        disabled={!this.state.editable}
                                                                        checked={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit == "true" || (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit == true}
                                                                        onChange={(e) => {
                                                                            this.dataChange(e)
                                                                        }}
                                                                    />
                                                                    <Label
                                                                        className="form-check-label"
                                                                        check htmlFor="inline-radio1">
                                                                        {i18n.t('static.realm.yes')}
                                                                    </Label>
                                                                </FormGroup>
                                                                <FormGroup check inline>
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        id="sharePlanningUnitFalse"
                                                                        name="sharePlanningUnit"
                                                                        disabled={!this.state.editable}
                                                                        value={false}
                                                                        checked={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit == false || (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit == false}
                                                                        onChange={(e) => {
                                                                            this.dataChange(e)
                                                                        }}
                                                                    />
                                                                    <Label
                                                                        className="form-check-label"
                                                                        check htmlFor="inline-radio2">
                                                                        {i18n.t('static.program.no')}
                                                                    </Label>
                                                                </FormGroup>
                                                                <FormFeedback className="red">{errors.sharePlanningUnit}</FormFeedback>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-6"></FormGroup>
                                                            <FormGroup className="col-md-6">
                                                                <Label htmlFor="currencyId"># PU / {this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.parent != null && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id).length > 0 && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}(s) (Calculated)</Label>
                                                                <Input type="text"
                                                                    id="puPerVisitQATCalculated"
                                                                    name="puPerVisitQATCalculated"
                                                                    readOnly={true}
                                                                    bsSize="sm"
                                                                    value={addCommasWith8Decimals(this.state.qatCalculatedPUPerVisit)}>
                                                                </Input>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-6"></FormGroup>
                                                            {this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode != null && (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == "false" || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == false || this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) &&
                                                                <FormGroup className="col-md-6">
                                                                    <Label htmlFor="currencyId">{this.state.currentItemConfig.parentItem != null && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode != null && (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "# PU / Interval / " : "# PU / "}{this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.parent != null && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id).length > 0 && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}(s)</Label>
                                                                    <Input type="text"
                                                                        id="puPerVisit"
                                                                        name="puPerVisit"
                                                                        readOnly={!this.state.editable ? true : this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode != null && (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == "false" || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == false || this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2) ? false : true}
                                                                        bsSize="sm"
                                                                        valid={!errors.puPerVisit && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit != '' : !errors.puPerVisit}
                                                                        invalid={touched.puPerVisit && !!errors.puPerVisit}
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => {
                                                                            handleChange(e);
                                                                            this.dataChange(e)
                                                                        }}
                                                                        value={this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode != null ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == "false" || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == false) ?
                                                                            addCommasWith8Decimals(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.puPerVisit) :
                                                                            addCommasWith8Decimals(this.state.noFURequired / this.state.conversionFactor) : ''}>
                                                                    </Input>
                                                                    <FormFeedback className="red">{errors.puPerVisit}</FormFeedback>
                                                                </FormGroup>
                                                            }
                                                            {!(this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode != null && (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == "false" || this.state.currentItemConfig.context.payload.nodeDataMap[0][0].puNode.sharePlanningUnit == false || this.state.currentItemConfig.parentItem.payload.nodeDataMap[0][0].fuNode.usageType.id == 2)) &&
                                                                <Input type="hidden" id="puPerVisit" />
                                                            }
                                                        </>}
                                                </>}
                                        </div>
                                    </div>
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
                                                    disabled={!this.state.editable}
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
                                                                <option key={i} value={item.id}>
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
                                                    disabled={!this.state.editable}
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
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.forecastingUnitId && this.state.fuValues != '' },
                                                            { 'is-invalid': (touched.forecastingUnitId && !!errors.forecastingUnitId && (this.state.currentItemConfig.context.payload.nodeType.id != 4 ? false : true) || !!errors.forecastingUnitId) }
                                                        )}
                                                        id="forecastingUnitId"
                                                        name="forecastingUnitId"
                                                        bsSize="sm"
                                                        disabled={!this.state.editable}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("forecastingUnitId", e);
                                                            this.handleFUChange(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("forecastingUnitId", true)}
                                                        options={this.state.forecastingUnitMultiList}
                                                        value={this.state.fuValues}
                                                    />
                                                    <FormFeedback>{errors.forecastingUnitId}</FormFeedback>
                                                </div><br />
                                            </FormGroup>
                                            <Input type="hidden"
                                                id="planningUnitIdFUFlag"
                                                name="planningUnitIdFUFlag"
                                                value={this.state.addNodeFlag}
                                            />
                                            <FormGroup className="col-md-12" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && (this.state.addNodeFlag == true || this.state.currentItemConfig.context.newTemplateFlag == 0) ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.product.product')}<span class="red Reqasterisk">*</span></Label>
                                                <div className="controls ">
                                                    <Input type="select"
                                                        id="planningUnitIdFU"
                                                        name="planningUnitIdFU"
                                                        bsSize="sm"
                                                        disabled={!this.state.editable}
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
                                                    disabled={!this.state.editable}
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
                                                    readOnly={!this.state.editable}
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
                                                    readOnly={!this.state.editable ? true : this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? true : false}
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
                                                    readOnly={!this.state.editable}
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
                                                        disabled={!this.state.editable}
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
                                                <>
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != true ? 'block' : 'none' }}></FormGroup>
                                                    <FormGroup className="col-md-4" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input type="text"
                                                            id="usageFrequencyDis"
                                                            name="usageFrequencyDis"
                                                            readOnly={!this.state.editable}
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
                                                            disabled={!this.state.editable}
                                                            valid={!errors.usagePeriodIdDis && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId != "" : false)}
                                                            invalid={touched.usagePeriodIdDis && !!errors.usagePeriodIdDis}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                this.dataChange(e)
                                                            }}
                                                            required
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1 && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != "true" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.oneTimeUsage != true ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod != null ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId : "" : ""}
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
                                                            readOnly={!this.state.editable}
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
                                                            disabled={!this.state.editable}
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
                                            </>
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
                                                        readOnly={!this.state.editable}
                                                        value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageFrequency : ""}></Input>
                                                    <FormFeedback className="red">{errors.usageFrequencyCon}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                    <Input
                                                        type="select"
                                                        id="usagePeriodIdCon"
                                                        name="usagePeriodIdCon"
                                                        bsSize="sm"
                                                        disabled={!this.state.editable}
                                                        valid={!errors.usagePeriodIdCon && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId != "" : false)}
                                                        invalid={touched.usagePeriodIdCon && !!errors.usagePeriodIdCon}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            this.dataChange(e)
                                                        }}
                                                        required
                                                        value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId : "" : ""}
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
                                                </FormGroup>
                                            </>
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
                                                            {this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.hasOwnProperty('usagePeriodId') &&
                                                                <td style={{ width: '50%' }}>{addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.noOfForecastingUnitsPerPerson / this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageFrequency) * (this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.hasOwnProperty('usagePeriodId')
                                                                    && this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId))[0].convertToMonth)}</td>}
                                                            {this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod != null && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usagePeriod.usagePeriodId == "" &&
                                                                <td style={{ width: '50%' }}></td>}
                                                        </tr>
                                                    </table>}
                                                {(this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentItemConfig.context.payload.nodeDataMap[0][0].fuNode.usageType.id == 1) &&
                                                    <table className="table table-bordered">
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfFU/')} {this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en}{"/ Time"}</td>
                                                            <td style={{ width: '50%' }}>{addCommas(this.state.noOfFUPatient)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfFURequiredForPeriodPerPatient') + " " + this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en}</td>
                                                            <td style={{ width: '50%' }}>{addCommas(this.state.noFURequired)}</td>
                                                        </tr>
                                                    </table>}
                                            </div>
                                        </div>
                                    </div>
                                    {(this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                        <div className="col-md-12 pt-2 pl-2 pb-lg-3"><b>{this.state.usageText}</b></div>
                                    }
                                    <FormGroup className="pb-lg-3">
                                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.cancelNodeDataClicked()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                        {this.state.editable && <><Button type="button" size="md" color="warning" className="float-right mr-1" onClick={() => { this.resetNodeData(); this.nodeTypeChange(this.state.currentItemConfig.context.payload.nodeType.id) }} ><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" color="success" className="mr-1 float-right" size="md"><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button></>}
                                    </FormGroup>
                                </Form>
                            )} />
                </TabPane>
                <TabPane tabId="2">
                    <div className="row pl-lg-2 pr-lg-2">
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
                                    <span className='DarkThColr'>{i18n.t('static.modelingTable.note')}</span>
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
                                {this.state.aggregationNode && this.state.editable && <><Button color="success" size="md" className="float-right mr-1" type="button" onClick={(e) => this.formSubmitLoader(e)}> <i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button></>}
                            </div>
                        </div>
                        {this.state.showCalculatorFields &&
                            <div className="col-md-12 pl-lg-0 pr-lg-0">
                                <fieldset style={{ width: '100%' }} className="scheduler-border">
                                    <legend className="scheduler-border">{i18n.t('static.tree.modelingCalculaterTool')}</legend>
                                    <div className="row">
                                        <FormGroup className="col-md-6" >
                                            <div className="check inline  pl-lg-1 pt-lg-2">
                                                {this.state.currentItemConfig.context.payload.nodeType.id == 2 && <div className="col-md-12 form-group">
                                                    <Label htmlFor="select">{i18n.t('static.modelingType.modelingType')}</Label>
                                                    <Input
                                                        onChange={(e) => { this.dataChange(e); }}
                                                        bsSize="sm"
                                                        className="col-md-6"
                                                        type="select" name="modelingType" id="modelingType">
                                                        {this.state.currentItemConfig.context.payload.nodeType.id == 2 && <option value="active1" selected={this.state.currentModelingType == 4 ? true : false}>{"Exponential (%)"}</option>}
                                                        {this.state.currentItemConfig.context.payload.nodeType.id == 2 && <option value="active2" selected={(this.state.currentItemConfig.context.payload.nodeType.id > 2 || this.state.currentModelingType == 3) ? true : false}>{'Linear (%)'}</option>}
                                                        {this.state.currentItemConfig.context.payload.nodeType.id == 2 && <option value="active3" selected={this.state.currentModelingType == 2 ? true : false}>{'Linear (#)'}</option>}
                                                        {this.state.currentItemConfig.context.payload.nodeType.id > 2 && <option value="active4" selected={this.state.currentModelingType == 5 ? true : false}>{'Linear (% point)'}</option>}
                                                    </Input>
                                                </div>}
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-6" >
                                            <div className="check inline  pl-lg-1 pt-lg-2">
                                                {this.state.currentItemConfig.context.payload.nodeType.id == 2 && <div className="col-md-12 form-group">
                                                    <Label htmlFor="select">Target</Label>
                                                    <Input
                                                        onChange={(e) => { this.dataChange(e); }}
                                                        bsSize="sm"
                                                        className="col-md-6"
                                                        disabled={(this.state.currentModelingType == 2 || this.state.currentModelingType == 3 || this.state.currentModelingType == 4) ? false : this.state.targetSelectDisable}
                                                        type="select" name="targetSelect" id="targetSelect">
                                                        <option value="target1" selected={this.state.targetSelect == 1 ? true : false}>{'Annual Target'}</option>
                                                        <option value="target2" selected={this.state.targetSelect == 0 ? true : false}>{'Ending Value Target / Change'}</option>
                                                    </Input>
                                                </div>}
                                            </div>
                                        </FormGroup>
                                    </div>
                                    <div style={{ display: this.state.targetSelect == 1 ? 'block' : 'none' }}>
                                        <div className="row">
                                            <FormGroup className="col-md-12">
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.annualTargetLabel')}</Label>
                                            </FormGroup>
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenFirstMonthOfTarget} target="Popover29" trigger="hover" toggle={this.toggleFirstMonthOfTarget}>
                                                    <PopoverBody>{i18n.t('static.tooltip.FirstMonthOfTarget')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.firstMonthOfTarget')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover29" onClick={this.toggleFirstMonthOfTarget} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <Input
                                                    type="select"
                                                    id="firstMonthOfTarget"
                                                    name="firstMonthOfTarget"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    required
                                                    value={this.state.firstMonthOfTarget}
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
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenYearsOfTarget} target="Popover28" trigger="hover" toggle={this.toggleYearsOfTarget}>
                                                    <PopoverBody>{i18n.t('static.tooltip.yearsOfTarget')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.targetYears')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover28" onClick={this.toggleYearsOfTarget} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <Input type="select"
                                                    id="targetYears"
                                                    name="targetYears"
                                                    bsSize="sm"
                                                    required
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    value={this.state.yearsOfTarget}>
                                                    <option key={3} value={3}>3</option>
                                                    <option key={4} value={4}>4</option>
                                                    <option key={5} value={5}>5</option>
                                                    <option key={6} value={6}>6</option>
                                                    <option key={7} value={7}>7</option>
                                                    <option key={8} value={8}>8</option>
                                                    <option key={9} value={9}>9</option>
                                                    <option key={10} value={10}>10</option>
                                                </Input>
                                            </FormGroup>
                                            <div className="col-md-12 pl-lg-0 pr-lg-0">
                                                <div id="modelingCalculatorJexcel" className={"consumptionDataEntryTable RowClickable"}>
                                                </div>
                                            </div>
                                            <FormGroup className="col-md-12">
                                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => {
                                                    this.setState({
                                                        showCalculatorFields: false
                                                    });
                                                }}><i className="fa fa-times"></i> {i18n.t('static.common.close')}</Button>
                                                {this.state.isCalculateClicked == 1 && <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={() => this.resetModelingCalculatorData()} ><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>}
                                                {this.state.isCalculateClicked == 2 && <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.acceptValue}><i className="fa fa-check"></i> {i18n.t('static.common.accept')}</Button>}
                                                {this.state.isCalculateClicked == 1 && <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => { this.changed3(2); }}><i className="fa fa-check"></i> {i18n.t('static.qpl.calculate')}</Button>}
                                            </FormGroup>
                                        </div>
                                    </div>
                                    <div className='col-md-12' style={{ display: this.state.targetSelect != 1 ? 'block' : 'none' }}>
                                        <div className="row">
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
                                            </FormGroup>
                                            }
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
                                                <Input type="text"
                                                    id="currentTargetChangePercentage"
                                                    name="currentTargetChangePercentage"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.dataChange(e); this.calculateMomByChangeInPercent(e) }}
                                                    value={addCommas(this.state.currentTargetChangePercentage)}
                                                    readOnly={this.state.currentTargetChangePercentageEdit}
                                                >
                                                </Input>
                                            </FormGroup>
                                            {this.state.currentModelingType != 3 && this.state.currentModelingType != 4 && this.state.currentModelingType != 5 && <FormGroup className="col-md-1 mt-lg-4">
                                                <Label htmlFor="currencyId">or</Label>
                                            </FormGroup>
                                            }
                                            {this.state.currentModelingType != 3 && this.state.currentModelingType != 4 && this.state.currentModelingType != 5 && <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.Change(#)')}<span class="red Reqasterisk">*</span> </Label>
                                                <Input type="text"
                                                    id="currentTargetChangeNumber"
                                                    name="currentTargetChangeNumber"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.dataChange(e); this.calculateMomByChangeInNumber(e) }}
                                                    value={addCommas(this.state.currentTargetChangeNumber)}
                                                    readOnly={this.state.currentTargetChangeNumberEdit}
                                                >
                                                </Input>
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
                                            </FormGroup>
                                        </div>
                                        <FormGroup className="col-md-12">
                                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => {
                                                this.setState({
                                                    showCalculatorFields: false
                                                });
                                            }}><i className="fa fa-times"></i> {'Close'}</Button>
                                            <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.acceptValue1}><i className="fa fa-check"></i> {'Accept'}</Button>
                                        </FormGroup>
                                    </div>
                                </fieldset>
                            </div>
                        }
                    </div >
                    {
                        this.state.showMomData &&
                        <div className="row pl-lg-2 pr-lg-2">
                            <fieldset style={{ width: '100%' }} className="scheduler-border">
                                <legend className="scheduler-border">{i18n.t('static.tree.monthlyData')}:</legend>
                                <div className="col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
                                    <div className="col-md-6">
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
                                                        readOnly={!this.state.editable}
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
                                        this.setState({ showMomData: false,viewMonthlyData:true,isChanged:false })
                                    }}><i className="fa fa-times"></i> {'Close'}</Button>
                                    {this.state.editable && this.state.currentItemConfig.context.payload.nodeType.id != 1 && <Button type="button" size="md" color="success" className="float-right mr-1" onClick={(e) => this.updateMomDataInDataSet(e)}><i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>}
                                </div>
                            </fieldset>
                        </div>
                    }
                    {
                        this.state.showMomDataPercent &&
                        <div className="row pl-lg-2 pr-lg-2">
                            <fieldset style={{ width: '100%' }} className="scheduler-border">
                                <legend className="scheduler-border">{i18n.t('static.tree.monthlyData')}:</legend>
                                <div className="col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
                                    <div className="col-md-6">
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
                                                        readOnly={!this.state.editable}
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
                                            showMomDataPercent: false,isChanged: false,viewMonthlyData: true
                                        });
                                    }}><i className="fa fa-times"></i> {'Close'}</Button>
                                    {this.state.editable && <Button type="button" size="md" color="success" className="float-right mr-1" onClick={(e) => this.updateMomDataInDataSet(e)}><i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>}
                                </div>
                            </fieldset>
                        </div>
                    }
                </TabPane >
            </>
        );
    }
    /**
     * Formats the selected month and year into text.
     * @param {object} m - The selected month and year object.
     * @returns {string} - The formatted text representing the selected month and year.
     */
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    handleClickMonthBox4 = (e) => {
        this.pickAMonth4.current.show()
    }
    /**
     * Handles the change of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthChange4 = (year, month) => {
        this.setState({ currentCalculatorStartDate: year + "-" + month + "-01" }, () => {
        });
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthDissmis4 = (value) => {
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    handleClickMonthBox5 = (e) => {
        this.pickAMonth5.current.show()
    }
    /**
     * Handles the change of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthChange5 = (year, month) => {
        this.setState({ currentCalculatorStopDate: year + "-" + month + "-01" }, () => {
        });
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthDissmis5 = (value) => {
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    handleClickMonthBox1 = (e) => {
        this.pickAMonth1.current.show()
    }
    /**
     * Handles the change of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthChange1 = (year, month) => {
        var month = parseInt(month) < 10 ? "0" + month : month
        var date = year + "-" + month + "-" + "01"
        let { currentItemConfig } = this.state;
        (currentItemConfig.context.payload.nodeDataMap[0])[0].month = date;
        this.setState({ currentItemConfig }, () => {
        });
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthDissmis1 = (value) => {
        let month = value.year + '-' + value.month + '-01';
        this.setState({ singleValue2: value, }, () => {
            this.calculateParentValueFromMOM(month);
        })
    }
    /**
     * Export tree in word file
     */
    exportDoc() {
        var item1 = this.state.items;
        var sortOrderArray = [...new Set(item1.map(ele => (ele.sortOrder)))];
        var sortedArray = sortOrderArray.sort();
        var items = [];
        for (var i = 0; i < sortedArray.length; i++) {
            items.push(item1.filter(c => c.sortOrder == sortedArray[i])[0]);
        }
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
            saveAs(blob, i18n.t('static.dataset.TreeTemplate') + "-" + "TreeValidation" + ".docx");
        });
    }
    /**
     * Renders the create tree template screen.
     * @returns {JSX.Element} - Create Tree template screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { programListForCreateTree } = this.state;
        let downloadedDatasetsForCreateTree = programListForCreateTree.length > 0
            && programListForCreateTree.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.programCode + "~v" + item.version}
                    </option>
                )
            }, this);
        const { forecastMethodListForCreateTree } = this.state;
        let forecastMethodsForCreateTree = forecastMethodListForCreateTree.length > 0
            && forecastMethodListForCreateTree.map((item, i) => {
                return (
                    <option key={i} value={item.forecastMethodId}>
                        {getLabelText(item.label, this.state.lang)}
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
                (itemConfig.expanded ?
                    <div style={{ background: itemConfig.payload.nodeType.id == 5 || itemConfig.payload.nodeType.id == 4 ? "#002F6C" : "#a7c6ed", width: "8px", height: "8px", borderRadius: "8px" }}>
                    </div>
                    :
                    <div className={itemConfig.payload.nodeDataMap[0] != undefined && itemConfig.payload.nodeDataMap[0][0].isPUMappingCorrect == 0 ? "ContactTemplate boxContactTemplate contactTemplateBorderRed" : "ContactTemplate boxContactTemplate"} title={itemConfig.payload.nodeDataMap[0][0].notes}>
                        <div className={itemConfig.payload.nodeType.id == 5
                            || itemConfig.payload.nodeType.id == 4 ? (itemConfig.payload.label.label_en.length <= 20 ? "ContactTitleBackground TemplateTitleBgblueSingle" : "ContactTitleBackground TemplateTitleBgblue") :
                            (itemConfig.payload.label.label_en.length <= 20 ? "ContactTitleBackground TemplateTitleBgSingle" : "ContactTitleBackground TemplateTitleBg")}
                        >
                            <div className={itemConfig.payload.nodeType.id == 5 || itemConfig.payload.nodeType.id == 4 ? "ContactTitle TitleColorWhite" : "ContactTitle TitleColor"}>
                                <div title={itemConfig.payload.label.label_en} className="NodeTitletext">{itemConfig.payload.label.label_en}</div>
                                <div style={{ float: 'right' }}>
                                    {itemConfig.payload.nodeType.id != 1 && this.getPayloadData(itemConfig, 4) == true && <i class="fa fa-long-arrow-up" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                    {itemConfig.payload.nodeType.id != 1 && this.getPayloadData(itemConfig, 6) == true && <i class="fa fa-long-arrow-down" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                    {itemConfig.payload.nodeType.id != 1 && this.getPayloadData(itemConfig, 5) == true && <i class="fa fa-link" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                    <b style={{ color: '#212721', float: 'right' }}>{itemConfig.payload.nodeType.id == 4 ? itemConfig.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? <b style={{ fontSize: '14px', color: '#fff' }}>c </b> : <b style={{ fontSize: '14px', color: '#fff' }}>d </b> : ""}{itemConfig.payload.nodeType.id == 2 ? <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#002f6c' }}></i> : (itemConfig.payload.nodeType.id == 3 ? <i class="fa fa-percent " style={{ fontSize: '11px', color: '#002f6c' }} ></i> : (itemConfig.payload.nodeType.id == 4 ? <i class="fa fa-cube" style={{ fontSize: '11px', color: '#fff' }} ></i> : (itemConfig.payload.nodeType.id == 5 ? <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#fff' }} ></i> : (itemConfig.payload.nodeType.id == 1 ? <i><img src={AggregationNode} className="AggregationNodeSize" /></i> : ""))))}</b>
                                </div>
                            </div>
                        </div>
                        <div className="ContactPhone ContactPhoneValue">
                            <span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 1)}</span>
                            <div style={{ overflow: 'inherit', fontStyle: 'italic' }}><p className="" style={{ textAlign: 'center' }}> {this.getPayloadData(itemConfig, 2)}</p></div>
                            <div className="treeValidation"><span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 3) != "" ? i18n.t('static.ManageTree.SumofChildren') + ": " : ""}</span><span className={this.getPayloadData(itemConfig, 3) != 100 ? "treeValidationRed" : ""}>{this.getPayloadData(itemConfig, 3) != "" ? this.getPayloadData(itemConfig, 3) + "%" : ""}</span></div>
                        </div>
                    </div>)
            ))
        }
        const HighlightNode = ({ itemConfig }) => {
            let itemTitleColor = Colors.RoyalBlue;
            return (
                <div className="ContactTemplate boxContactTemplate" title={itemConfig.payload.nodeDataMap[0][0].notes} style={{ height: "88px", width: "200px", zIndex: "1" }}>
                    <div className={itemConfig.payload.nodeType.id == 5
                        || itemConfig.payload.nodeType.id == 4 ? (itemConfig.payload.label.label_en.length <= 20 ? "ContactTitleBackground TemplateTitleBgblueSingle" : "ContactTitleBackground TemplateTitleBgblue") :
                        (itemConfig.payload.label.label_en.length <= 20 ? "ContactTitleBackground TemplateTitleBgSingle" : "ContactTitleBackground TemplateTitleBg")}
                    >
                        <div className={itemConfig.payload.nodeType.id == 5 || itemConfig.payload.nodeType.id == 4 ? "ContactTitle TitleColorWhite" : "ContactTitle TitleColor"}>
                            <div title={itemConfig.payload.label.label_en} className="NodeTitletext">{itemConfig.payload.label.label_en}</div>
                            <div style={{ float: 'right' }}>
                                {itemConfig.payload.nodeType.id != 1 && this.getPayloadData(itemConfig, 4) == true && <i class="fa fa-long-arrow-up" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                {itemConfig.payload.nodeType.id != 1 && this.getPayloadData(itemConfig, 6) == true && <i class="fa fa-long-arrow-down" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                {itemConfig.payload.nodeType.id != 1 && this.getPayloadData(itemConfig, 5) == true && <i class="fa fa-link" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                <b style={{ color: '#212721', float: 'right' }}>{itemConfig.payload.nodeType.id == 4 ? itemConfig.payload.nodeDataMap[0][0].fuNode.usageType.id == 2 ? <b style={{ fontSize: '14px', color: '#fff' }}>c </b> : <b style={{ fontSize: '14px', color: '#fff' }}>d </b> : ""}{itemConfig.payload.nodeType.id == 2 ? <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#002f6c' }}></i> : (itemConfig.payload.nodeType.id == 3 ? <i class="fa fa-percent " style={{ fontSize: '11px', color: '#002f6c' }} ></i> : (itemConfig.payload.nodeType.id == 4 ? <i class="fa fa-cube" style={{ fontSize: '11px', color: '#fff' }} ></i> : (itemConfig.payload.nodeType.id == 5 ? <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#fff' }} ></i> : (itemConfig.payload.nodeType.id == 1 ? <i><img src={AggregationNode} className="AggregationNodeSize" /></i> : ""))))}</b>
                            </div>
                        </div>
                    </div>
                    <div className="ContactPhone ContactPhoneValue">
                        <span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 1)}</span>
                        <div style={{ overflow: 'inherit', fontStyle: 'italic' }}><p className="" style={{ textAlign: 'center' }}> {this.getPayloadData(itemConfig, 2)}</p></div>
                        <div className="treeValidation"><span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 3) != "" ? i18n.t('static.ManageTree.SumofChildren') + ": " : ""}</span><span className={this.getPayloadData(itemConfig, 3) != 100 ? "treeValidationRed" : ""}>{this.getPayloadData(itemConfig, 3) != "" ? this.getPayloadData(itemConfig, 3) + "%" : ""}</span></div>
                    </div>
                </div>
            )
        }
        const NodeDragSource = DragSource(
            ItemTypes.NODE,
            {
                beginDrag: ({ itemConfig }) => ({ id: itemConfig.id }),
                endDrag(props, monitor) {
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
        const { treeTemplateList } = this.state;
        let treeTemplates = treeTemplateList.length > 0
            && treeTemplateList.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            }).map((item, i) => {
                return (
                    <option key={i} value={item.treeTemplateId}>
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
                    lineType: LineType.Dotted
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
                    lineType: LineType.Dotted
                }));
            }
        }
        const config = {
            ...this.state,
            pageFitMode: PageFitMode.None,
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
            templates: [{
                name: "contactTemplate",
                itemSize: { width: 200, height: 100 },
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
                },
                onButtonsRender: (({ context: itemConfig }) => {
                    return <>
                        {itemConfig.parent != null &&
                            <>
                                {this.state.editable &&
                                    <button key="2" type="button" className="StyledButton TreeIconStyle TreeIconStyleCopyPaddingTop" style={{ background: 'none' }}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            this.duplicateNode(JSON.parse(JSON.stringify(itemConfig)));
                                        }}>
                                        <i class="fa fa-clone" aria-hidden="true"></i>
                                    </button>
                                }
                                {this.state.editable &&
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
                                        <i class="fa fa-trash-o" aria-hidden="true" style={{ fontSize: '16px' }}></i>
                                    </button>}
                            </>}
                        {parseInt(itemConfig.payload.nodeType.id) != 5 && this.state.editable &&
                            <button key="4" type="button" className="StyledButton TreeIconStyle TreeIconStyleCopyPaddingTop" style={{ background: 'none' }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.getBranchTemplateList(itemConfig);
                                }}>
                                <i class="fa fa-sitemap" aria-hidden="true"></i>
                            </button>
                        }
                        {parseInt(itemConfig.payload.nodeType.id) != 5 && this.state.editable &&
                            <button key="1" type="button" className="StyledButton TreeIconStyle TreeIconStylePlusPaddingTop" style={{ background: 'none' }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    var getLevelUnit = this.state.treeTemplate.levelList != undefined ? this.state.treeTemplate.levelList.filter(c => c.levelNo == itemConfig.level + 1) : [];
                                    var levelUnitId = ""
                                    if (getLevelUnit.length > 0) {
                                        levelUnitId = getLevelUnit[0].unit != null && getLevelUnit[0].unit.id != null ? getLevelUnit[0].unit.id : "";
                                    }
                                    this.setState({
                                        currentNodeTypeId:"",
                                        isValidError: true,
                                        isTemplateChanged: true,
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
                                        modelingChangedOrAdded: false,
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
                                                                monthNo: this.state.monthList.length > 0 ? this.state.monthList[0].id : -1,
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
                                                                    sharePlanningUnit: "true"
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
                                                    nodeDataMap: itemConfig.payload.nodeDataMap
                                                }
                                            }
                                        }
                                    }, () => {
                                        this.setState({
                                            orgCurrentItemConfig: JSON.parse(JSON.stringify(this.state.currentItemConfig.context)),
                                        }, () => {
                                            this.getNodeTypeFollowUpList(itemConfig.payload.nodeType.id);
                                            this.calculateParentValueFromMOM(this.state.currentItemConfig.context.payload.nodeDataMap[0][0].monthNo);
                                        });
                                        if (itemConfig.payload.nodeType.id == 2 || itemConfig.payload.nodeType.id == 3) {
                                            this.getUsageTemplateList(0);
                                        }
                                        else if (itemConfig.payload.nodeType.id == 4) {
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
                                    });
                                }}>
                                <i class="fa fa-plus" aria-hidden="true"></i>
                            </button>}
                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') &&
                            <button key="5" type="button" className="StyledButton TreeIconStyle TreeIconStyleCopyPaddingTop" style={{ background: 'none' }}
                                onClick={(event) => {
                                    var items = this.state.items;
                                    event.stopPropagation();
                                    var updatedItems = items;
                                    if (this.state.toggleArray.includes(itemConfig.id)) {
                                        var tempToggleArray = this.state.toggleArray.filter((e) => e != itemConfig.id)
                                        updatedItems = updatedItems.map(item => {
                                            if (item.sortOrder.toString().startsWith(itemConfig.sortOrder.toString()) && item.sortOrder.toString() != itemConfig.sortOrder.toString()) {
                                                tempToggleArray = tempToggleArray.filter((e) => e != item.id)
                                                return { ...item, templateName: "contactTemplate", expanded: false, payload: { ...item.payload, collapsed: false } };
                                            }
                                            return item;
                                        });
                                        if (Array.from(new Set(tempToggleArray)).length >= items.length) {
                                            this.setState({ collapseState: true })
                                        } else {
                                            this.setState({ collapseState: false })
                                        }
                                        this.setState({ toggleArray: tempToggleArray })
                                    } else {
                                        var parentId = itemConfig.payload.parentNodeId;
                                        var parentNode = items.filter(e => e.id == parentId);
                                        var tempToggleArray = this.state.toggleArray;
                                        tempToggleArray.push(itemConfig.id);
                                        if (parentId) {
                                            if (parentNode[0].payload.parentNodeId == null) {
                                                tempToggleArray.push(itemConfig.payload.parentNodeId);
                                            }
                                        }
                                        updatedItems = updatedItems.map(item => {
                                            if (item.sortOrder.toString().startsWith(itemConfig.sortOrder.toString()) && item.parent != null) {
                                                tempToggleArray.push(item.id);
                                                return { ...item, templateName: "contactTemplateMin", expanded: true, payload: { ...item.payload, collapsed: true } };
                                            }
                                            return item;
                                        });
                                        if (Array.from(new Set(tempToggleArray)).length >= items.length) {
                                            this.setState({ collapseState: true })
                                        } else {
                                            this.setState({ collapseState: false })
                                        }
                                        this.setState({ toggleArray: tempToggleArray })
                                    }
                                    this.setState({ items: updatedItems, isTemplateChanged: true })
                                }}>
                                {this.state.toggleArray.includes(itemConfig.id) ? <i class="fa fa-caret-square-o-left" aria-hidden="true"></i> : <i class="fa fa-caret-square-o-down" aria-hidden="true"></i>}
                            </button>
                        }
                    </>
                }),
            },
            {
                name: "contactTemplateMin",
                itemSize: { width: 8, height: 8 },
                minimizedItemSize: { width: 2, height: 2 },
                onItemRender: ({ context: itemConfig }) => {
                    return <NodeDragDropSource
                        itemConfig={itemConfig}
                        onRemoveItem={this.onRemoveItem}
                    />;
                },
                onHighlightRender: ({ context: itemConfig }) => {
                    return <HighlightNode
                        itemConfig={itemConfig}
                        onRemoveItem={this.onRemoveItem}
                    />;
                },
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
                                <a className="pr-lg-0 pt-lg-0 float-left">
                                    <span style={{ cursor: 'pointer' }} onClick={this.cancelClicked}><i className="cui-arrow-left icons" style={{ color: '#002F6C', fontSize: '13px' }}></i> <small className="supplyplanformulas">{'Return To List'}</small></span>
                                </a>
                                <a className="pr-lg-0 pt-lg-0 float-right">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')}
                                        onClick={() => this.exportPDF()}
                                    />
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={docicon} title={i18n.t('static.report.exportWordDoc')} onClick={() => this.exportDoc()} />
                                    {this.state.treeTemplate.treeTemplateId > 0 && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE') && (this.state.treeTemplate.flatList[0].payload.nodeType.id == 1 || this.state.treeTemplate.flatList[0].payload.nodeType.id == 2) ? <span style={{ cursor: 'pointer' }} onClick={this.createTree}> <small className="supplyplanformulas">{i18n.t('static.treeTemplate.createTreeFromTemplate')}</small><i className="cui-arrow-right icons" style={{ color: '#002F6C', fontSize: '13px' }}></i></span> : <span className='WhiteText'><i>{"Create a tree first, then add this template to a node."}</i></span>}
                                </a>
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
                                    validationSchema={validationSchema}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {
                                        this.setState({
                                            loading: true
                                        })
                                        var template = this.state.treeTemplate;
                                        var items = this.state.items;
                                        var flatList = [];
                                        var curMonth = moment(this.state.forecastStartDate).format('YYYY-MM-DD');
                                        for (var i = 0; i < items.length; i++) {
                                            var item = items[i];
                                            var nodeDataModelingList = (item.payload.nodeDataMap[0])[0].nodeDataModelingList;
                                            var nodeDataModelingListUpdated = [];
                                            var annualTargetCalculator = [];
                                            for (var nml = 0; nml < nodeDataModelingList.length; nml++) {
                                                if (nodeDataModelingList[nml].dataValue !== "" && nodeDataModelingList[nml].dataValue !== "NaN" && nodeDataModelingList[nml].dataValue !== undefined && nodeDataModelingList[nml].increaseDecrease !== "") {
                                                    if (nodeDataModelingList[nml].transferNodeDataId == "null" || nodeDataModelingList[nml].transferNodeDataId === "") {
                                                        nodeDataModelingList[nml].transferNodeDataId = null;
                                                    }
                                                    nodeDataModelingListUpdated.push(nodeDataModelingList[nml]);
                                                }
                                                if (nodeDataModelingList[nml].modelingSource == 1) {
                                                    annualTargetCalculator.push(nodeDataModelingList[nml]);
                                                }
                                            }
                                            var json = {
                                                id: item.id,
                                                expanded: item.expanded,
                                                templateName: item.expanded ? "contactTemplateMin" : "contactTemplate",
                                                parent: item.parent,
                                                payload: {
                                                    collapsed: item.payload.collapsed,
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
                                                                nodeDataId: (item.payload.nodeDataMap[0])[0].nodeDataId,
                                                                dataValue: (item.payload.nodeDataMap[0])[0].dataValue,
                                                                fuNode: item.payload.nodeType.id < 4 || item.payload.nodeType.id == 5 ? null : (item.payload.nodeDataMap[0])[0].fuNode,
                                                                puNode: item.payload.nodeType.id < 4 || item.payload.nodeType.id == 4 ? null : (item.payload.nodeDataMap[0])[0].puNode,
                                                                notes: (item.payload.nodeDataMap[0])[0].notes,
                                                                manualChangesEffectFuture: (item.payload.nodeDataMap[0])[0].manualChangesEffectFuture,
                                                                nodeDataModelingList: nodeDataModelingListUpdated,
                                                                nodeDataMomList: (item.payload.nodeDataMap[0])[0].nodeDataMomList,
                                                                nodeDataOverrideList: (item.payload.nodeDataMap[0])[0].nodeDataOverrideList,
                                                                annualTargetCalculator: (annualTargetCalculator.length > 1 ?
                                                                    {
                                                                        firstMonthOfTarget: this.state.firstMonthOfTarget,
                                                                        yearsOfTarget: this.state.yearsOfTarget,
                                                                        actualOrTargetValueList: this.state.actualOrTargetValueList
                                                                    } : null)
                                                            }
                                                        ]
                                                    }
                                                },
                                                level: item.level,
                                                sortOrder: item.sortOrder
                                            }
                                            flatList.push(json);
                                        }
                                        var templateObj = {
                                            treeTemplateId: template.treeTemplateId,
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
                                        if (template.treeTemplateId == 0) {
                                            if (template.flatList[0].newTemplateFlag == 0) {
                                                this.setState({
                                                    loading: false
                                                }, () => { alert(i18n.t('static.tree.rootNodeInfoMissing')); });
                                            } else {
                                                DatasetService.addTreeTemplate(templateObj)
                                                    .then(response => {
                                                        if (response.status == 200) {
                                                            var items = response.data.flatList;
                                                            var arr = [];
                                                            items = items.map(item => {
                                                                if (item.payload.collapsed)
                                                                    return { ...item, templateName: "contactTemplateMin", expanded: true }
                                                                return { ...item, templateName: "contactTemplate", expanded: false }
                                                            })
                                                            for (let i = 0; i < items.length; i++) {
                                                                if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                                                                    (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (items[i].payload.nodeDataMap[0])[0].dataValue;
                                                                } else {
                                                                    if (items[i].level == 0) {
                                                                        (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = 0;
                                                                    } else {
                                                                        var findNodeIndex = items.findIndex(n => n.id == items[i].parent);
                                                                        var parentValue = (items[findNodeIndex].payload.nodeDataMap[0])[0].calculatedDataValue;
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
                                                            }
                                                            this.setState({
                                                                treeTemplate: response.data,
                                                                treeTemplateId: 0,
                                                                items,
                                                                message: i18n.t('static.message.addTreeTemplate'),
                                                                color: 'green',
                                                                loading: true,
                                                                isChanged: false,
                                                                isTemplateChanged: false
                                                            }, () => {
                                                                this.hideSecondComponent();
                                                                this.calculateMOMData(1, 2);
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
                                        } else {
                                            DatasetService.updateTreeTemplate(templateObj)
                                                .then(response => {
                                                    if (response.status == 200) {
                                                        var items = response.data.flatList;
                                                        items = items.map(item => {
                                                            if (item.payload.collapsed)
                                                                return { ...item, templateName: "contactTemplateMin", expanded: true }
                                                            return { ...item, templateName: "contactTemplate", expanded: false }
                                                        })
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
                                                                    (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (parentValue * (items[i].payload.nodeDataMap[0])[0].dataValue) / 100;
                                                                }
                                                            }
                                                        }
                                                        this.setState({
                                                            treeTemplate: response.data,
                                                            items,
                                                            message: i18n.t('static.message.editTreeTemplate'),
                                                            loading: true,
                                                            color: 'green',
                                                            isChanged: false,
                                                            isTemplateChanged: false
                                                        }, () => {
                                                            this.hideSecondComponent();
                                                            this.calculateMOMData(1, 2);
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
                                                                <FormGroup className="col-md-3 pl-lg-0">
                                                                    {treeTemplateList.length > 0 && <><Label htmlFor="languageId">{i18n.t('static.dataset.TreeTemplate')}<span class="red Reqasterisk">*</span></Label>
                                                                        <Input
                                                                            type="select"
                                                                            name="treeTemplateId"
                                                                            id="treeTemplateId"
                                                                            bsSize="sm"
                                                                            required
                                                                            onChange={(e) => { this.dataChange(e) }}
                                                                            value={this.state.treeTemplateId}
                                                                        >
                                                                            {this.state.treeTemplateId == 0 && <option value="">{i18n.t('static.common.select')}</option>}
                                                                            {treeTemplates}
                                                                        </Input>
                                                                        <FormFeedback>{errors.forecastMethodId}</FormFeedback></>}
                                                                </FormGroup>
                                                                <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Template Name'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="treeName"
                                                                        id="treeName"
                                                                        bsSize="sm"
                                                                        readOnly={!this.state.editable}
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
                                                                <FormGroup className="col-md-3 pl-lg-0" style={{ marginBottom: '0px' }}>
                                                                    <Label htmlFor="languageId">{'Forecast Method'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="select"
                                                                        name="forecastMethodId"
                                                                        id="forecastMethodId"
                                                                        bsSize="sm"
                                                                        disabled={!this.state.editable}
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
                                                                <FormGroup className="col-md-3" >
                                                                    <div className="check inline  pl-lg-1 pt-lg-3">
                                                                        <div>
                                                                            <Input
                                                                                className="form-check-input checkboxMargin"
                                                                                type="checkbox"
                                                                                id="active6"
                                                                                name="active6"
                                                                                disabled={this.state.hidePlanningUnit}
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
                                                                                onClick={(e) => { this.filterPlanningUnitAndForecastingUnitNodes(e) }}
                                                                            />
                                                                            <Label
                                                                                className="form-check-label"
                                                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                                                <b>{i18n.t('static.tree.hideFUAndPU')}</b>
                                                                            </Label>
                                                                        </div>
                                                                        <div>
                                                                            <Input
                                                                                className="form-check-input checkboxMargin"
                                                                                type="checkbox"
                                                                                id="active9"
                                                                                name="active9"
                                                                                checked={this.state.collapseState}
                                                                                onClick={(e) => { this.expandCollapse(e); }}
                                                                            />
                                                                            <Label
                                                                                className="form-check-label"
                                                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                                                <b>{i18n.t('static.tree.collapseTree')}</b>
                                                                            </Label>
                                                                        </div>
                                                                    </div>
                                                                </FormGroup>
                                                                <div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenMonthInPast} target="Popover26" trigger="hover" toggle={this.toggleMonthInPast}>
                                                                        <PopoverBody>{i18n.t("static.treeTemplate.monthsInPastTooltip")}</PopoverBody>
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
                                                                        readOnly={!this.state.editable}
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
                                                                        <PopoverBody>{i18n.t("static.treeTemplate.monthsInFutureTooltip")}</PopoverBody>
                                                                    </Popover>
                                                                </div>
                                                                <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Months In Future'}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover27" onClick={this.toggleMonthInFuture} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                    <Input
                                                                        type="number"
                                                                        name="monthsInFuture"
                                                                        id="monthsInFuture"
                                                                        bsSize="sm"
                                                                        readOnly={!this.state.editable}
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
                                                                        readOnly={!this.state.editable}
                                                                        onChange={(e) => { this.dataChange(e) }}
                                                                        value={this.state.treeTemplate.notes != null && this.state.treeTemplate.notes != undefined ? this.state.treeTemplate.notes : ""}
                                                                    >
                                                                    </Input>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-3 pl-lg-0 MarginTopMonthSelector">
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
                                                                <FormGroup className="col-md-3 pl-lg-0" style={{ marginTop: '12px', marginLeft: '30px' }}>
                                                                    <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label>
                                                                    <FormGroup check inline>
                                                                        <Input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            id="active1"
                                                                            name="active"
                                                                            disabled={!this.state.editable}
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
                                                                            disabled={!this.state.editable}
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
                                                            </Row>
                                                        </div>
                                                        {(AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE_TEMPLATE') || AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_TREE_TEMPLATE')) &&
                                                            <CardFooter className="col-md-6 pt-lg-0 pr-lg-0 float-right MarginTopCreateTreeBtn" style={{ backgroundColor: 'transparent', borderTop: '0px solid #c8ced3' }}>
                                                                <Button type="button" size="md" color="warning" className="float-right mr-1 mb-lg-2" onClick={this.resetTree}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                                {(this.state.isChanged || this.state.isTemplateChanged) && <Button type="submit" color="success" className="mr-1 mb-lg-2 float-right" size="md"><i className="fa fa-check"> </i>{i18n.t('static.pipeline.save')}</Button>}
                                                            </CardFooter>}
                                                    </CardBody>
                                                    <div style={{ display: !this.state.loading ? "block" : "none" }} class="sample">
                                                        <Provider>
                                                            <div className="placeholder TreeTemplateHeight" style={{ clear: 'both', marginTop: '25px', border: '1px solid #a7c6ed' }} >
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
                                                </Form>
                                            </>
                                        )} />
                            </div>
                        </CardBody>
                    </Card></Col></Row>
            <Modal isOpen={this.state.isBranchTemplateModalOpen}
                className={'modal-md ' + this.props.className}>
                <ModalHeader>
                    <strong>{i18n.t('static.dataset.BranchTreeTemplate')}</strong>
                    <Button size="md" onClick={() => { this.setState({ isBranchTemplateModalOpen: false }) }} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                </ModalHeader>
                <ModalBody className='pb-lg-0'>
                    <Col sm={12} style={{ flexBasis: 'auto' }}>
                        <Formik
                            initialValues={{
                                branchTemplateId: this.state.branchTemplateId
                            }}
                            validationSchema={validationSchemaBranch}
                            onSubmit={(values, { setSubmitting, setErrors }) => {
                                this.setState({
                                    isTemplateChanged: true
                                })
                                this.generateBranchFromTemplate(this.state.branchTemplateId);
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
                                        <div className="col-md-12">
                                            <div>
                                                <div className='row'>
                                                    <FormGroup className="col-md-12">
                                                        <p>{i18n.t('static.tree.branchTemplateNotes1') + " "}<b>{this.state.nodeTypeParentNode}</b>{" " + i18n.t('static.tree.branchTemplateNotes2')}{" "}<b>{this.state.possibleNodeTypes.toString()}</b>{" " + i18n.t('static.tree.branchTemplateNotes3')}<a href="/#/dataset/listTreeTemplate">{" " + i18n.t('static.dataset.TreeTemplate')}</a>{" " + i18n.t('static.tree.branchTemplateNotes4')}</p>
                                                        <div className="controls">
                                                            <Input
                                                                type="select"
                                                                name="branchTemplateId"
                                                                id="branchTemplateId"
                                                                bsSize="sm"
                                                                valid={!errors.branchTemplateId && this.state.branchTemplateId != null ? this.state.branchTemplateId : '' != ''}
                                                                invalid={touched.branchTemplateId && !!errors.branchTemplateId}
                                                                onBlur={handleBlur}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                value={this.state.branchTemplateId}
                                                            >
                                                                <option value="">{i18n.t('static.dataset.selectBranchTreeTemplate')}</option>
                                                                {this.state.branchTemplateList.length > 0
                                                                    && this.state.branchTemplateList.map((item, i) => {
                                                                        return (
                                                                            <option key={i} value={item.treeTemplateId}>
                                                                                {getLabelText(item.label, this.state.lang)}
                                                                            </option>
                                                                        )
                                                                    }, this)}
                                                            </Input>
                                                            <FormFeedback>{errors.branchTemplateId}</FormFeedback>
                                                        </div>
                                                    </FormGroup>
                                                </div>
                                            </div>
                                            <FormGroup className="col-md-12 float-right pt-lg-4 pr-lg-0">
                                                <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={() => { this.setState({ isBranchTemplateModalOpen: false }) }}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                <Button type="submit" color="success" className="mr-1 float-right" size="md"><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                &nbsp;
                                            </FormGroup>
                                        </div>
                                    </Form>
                                )} />
                    </Col>
                    <br />
                </ModalBody>
            </Modal>
            <Modal isOpen={this.state.openAddNodeModal}
                className={'modal-xl'} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>Add/Edit Node</strong>     {<div className="HeaderNodeText"> {
                        this.state.currentItemConfig.context.payload.nodeType.id == 2 ? <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#20a8d8' }}></i> :
                            (this.state.currentItemConfig.context.payload.nodeType.id == 3 ? <i class="fa fa-percent " style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? <i class="fa fa-cube" style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                    (this.state.currentItemConfig.context.payload.nodeType.id == 5 ? <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                        (this.state.currentItemConfig.context.payload.nodeType.id == 1 ? <i><img src={AggregationNode} className="AggregationNodeSize" /></i> : "")
                                    )))}
                        <b className="supplyplanformulas ScalingheadTitle">{this.state.currentItemConfig.context.payload.label.label_en}</b></div>}
                    <Button size="md"
                        onClick={() => {
                            if (this.state.isChanged == true) {
                                var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
                                if (cf == true) {
                                    this.setState({
                                        openAddNodeModal: false, isChanged: false,
                                        cursorItem: 0, highlightItem: 0, activeTab1: new Array(2).fill('1')
                                    })
                                } else {
                                }
                            } else {
                                this.setState({
                                    openAddNodeModal: false, isChanged: false,
                                    cursorItem: 0, highlightItem: 0, activeTab1: new Array(2).fill('1')
                                })
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
                </ModalFooter>
            </Modal>
            <Modal isOpen={this.state.levelModal}
                className={'modal-md'}>
                <Formik
                    enableReinitialize={true}
                    initialValues={{
                        levelName: this.state.levelName
                    }}
                    validationSchema={validationSchemaLevel}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.levelDeatilsSaved()
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
                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='levelForm' autocomplete="off">
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
                                            readOnly={!this.state.editable}
                                            valid={!errors.levelName && this.state.levelName != null ? this.state.levelName : '' != ''}
                                            invalid={touched.levelName && !!errors.levelName}
                                            onBlur={handleBlur}
                                            onChange={(e) => { this.levelNameChanged(e); handleChange(e); }}
                                            value={this.state.levelName}
                                        ></Input>
                                        <FormFeedback>{errors.levelName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="currencyId">{i18n.t('static.tree.nodeUnit')}</Label>
                                        <Input
                                            type="select"
                                            id="levelUnit"
                                            name="levelUnit"
                                            bsSize="sm"
                                            disabled={!this.state.editable}
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
                                        <Button type="submit" size="md" color="success" className="submitBtn float-right" > <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
                                    </div>
                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.levelClicked("")}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </Form>
                        )} />
            </Modal>
            <Modal isOpen={this.state.isModalForCreateTree}
                className={'modal-dialog modal-lg modalWidth'}>
                <ModalHeader>
                    <strong>{i18n.t('static.listTree.treeDetails')}</strong>
                    <Button size="md" onClick={this.modelOpenCloseForCreateTree} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                </ModalHeader>
                <ModalBody className='pb-lg-0'>
                    <Col sm={12} style={{ flexBasis: 'auto' }}>
                        <Formik
                            initialValues={{
                                treeNameForCreateTree: this.state.treeNameForCreateTree,
                                forecastMethodIdForCreateTree: this.state.forecastMethodForCreateTree.id,
                                datasetIdModalForCreateTree: this.state.datasetIdModalForCreateTree,
                                regionIdForCreateTree: this.state.regionValuesForCreateTree
                            }}
                            enableReinitialize={true}
                            validationSchema={validationSchemaCreateTree}
                            onSubmit={(values, { setSubmitting, setErrors }) => {
                                this.setState({ loading: true }, () => {
                                    this.createTreeForCreateTree();
                                    this.setState({
                                        isModalForCreateTree: !this.state.isModalForCreateTree,
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
                                                                name="datasetIdModalForCreateTree"
                                                                id="datasetIdModalForCreateTree"
                                                                bsSize="sm"
                                                                valid={!errors.datasetIdModalForCreateTree && this.state.datasetIdModalForCreateTree != null ? this.state.datasetIdModalForCreateTree : '' != ''}
                                                                invalid={touched.datasetIdModalForCreateTree && !!errors.datasetIdModalForCreateTree}
                                                                onBlur={handleBlur}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                value={this.state.datasetIdModalForCreateTree}
                                                            >
                                                                <option value="">{i18n.t('static.mt.selectProgram')}</option>
                                                                {downloadedDatasetsForCreateTree}
                                                            </Input>
                                                            <FormFeedback>{errors.datasetIdModalForCreateTree}</FormFeedback>
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-6">
                                                        <Label htmlFor="currencyId">{i18n.t('static.forecastMethod.forecastMethod')}<span class="red Reqasterisk">*</span></Label>
                                                        <div className="controls">
                                                            <Input
                                                                type="select"
                                                                name="forecastMethodIdForCreateTree"
                                                                id="forecastMethodIdForCreateTree"
                                                                bsSize="sm"
                                                                valid={!errors.forecastMethodIdForCreateTree && this.state.forecastMethodForCreateTree.id != null ? this.state.forecastMethodForCreateTree.id : '' != ''}
                                                                invalid={touched.forecastMethodIdForCreateTree && !!errors.forecastMethodIdForCreateTree}
                                                                onBlur={handleBlur}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                required
                                                                value={this.state.forecastMethodForCreateTree.id}
                                                            >
                                                                <option value="">{i18n.t('static.common.forecastmethod')}</option>
                                                                {forecastMethodsForCreateTree}
                                                            </Input>
                                                            <FormFeedback>{errors.forecastMethodIdForCreateTree}</FormFeedback>
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
                                                            name="treeNameForCreateTree"
                                                            id="treeNameForCreateTree"
                                                            valid={!errors.treeNameForCreateTree && this.state.treeNameForCreateTree != ''}
                                                            invalid={touched.treeNameForCreateTree && !!errors.treeNameForCreateTree}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.treeNameForCreateTree}
                                                        />
                                                        <FormFeedback className="red">{errors.treeNameForCreateTree}</FormFeedback>
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-6" >
                                                    <Label htmlFor="currencyId">{i18n.t('static.region.region')}<span class="red Reqasterisk">*</span></Label>
                                                    <div className="controls">
                                                        <Select
                                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                                { 'is-valid': !errors.regionIdForCreateTree },
                                                                { 'is-invalid': (touched.regionIdForCreateTree && !!errors.regionIdForCreateTree || this.state.regionValuesForCreateTree.length == 0) }
                                                            )}
                                                            bsSize="sm"
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setFieldValue("regionIdForCreateTree", e);
                                                                this.handleRegionChangeForCreateTree(e);
                                                            }}
                                                            onBlur={() => setFieldTouched("regionIdForCreateTree", true)}
                                                            multi
                                                            options={this.state.regionMultiListForCreateTree}
                                                            value={this.state.regionValuesForCreateTree}
                                                        />
                                                        <FormFeedback>{errors.regionIdForCreateTree}</FormFeedback>
                                                    </div>
                                                </FormGroup>
                                            </div>
                                            <div >
                                                <div className='row'>
                                                    <FormGroup className="col-md-6">
                                                        <Label htmlFor="currencyId">{i18n.t('static.common.note')}</Label>
                                                        <div className="controls">
                                                            <Input type="textarea"
                                                                id="notesForCreateTree"
                                                                name="notesForCreateTree"
                                                                onChange={(e) => { this.dataChange(e) }}
                                                                value={this.state.notesForCreateTree}
                                                            ></Input>
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-6 mt-lg-4">
                                                        <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active10ForCreateTree"
                                                                name="activeForCreateTree"
                                                                value={true}
                                                                checked={this.state.activeForCreateTree === true}
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
                                                                id="active11ForCreateTree"
                                                                name="activeForCreateTree"
                                                                value={false}
                                                                checked={this.state.activeForCreateTree === false}
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
                                                <div style={{ display: this.state.missingPUListForCreateTree.length > 0 ? 'block' : 'none' }}><div><b>{i18n.t('static.listTree.missingPlanningUnits') + " "} : <a href="/#/planningUnitSetting/listPlanningUnitSetting" className="supplyplanformulas">{i18n.t('static.Update.PlanningUnits')}</a>)</b></div><br />
                                                    <div id="missingPUJexcelForCreateTree" className="RowClickable TableWidth100">
                                                    </div>
                                                </div>
                                            </div>
                                            <h5 className="green" style={{ display: "none" }} id="div3">
                                                {this.state.missingPUListForCreateTree.length > 0 && i18n.t("static.treeTemplate.addSuccessMessageSelected")}
                                                {this.state.missingPUListForCreateTree.length == 0 && i18n.t("static.treeTemplate.addSuccessMessageAll")}
                                            </h5>
                                            <FormGroup className="col-md-12 float-right pt-lg-4 pr-lg-0">
                                                <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.modelOpenCloseForCreateTree}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                {this.state.missingPUListForCreateTree.length == 0 && <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t("static.tree.createTree")}</Button>}
                                                {this.state.missingPUListForCreateTree.length > 0 && <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t("static.tree.createTreeWithoutPU")}</Button>}
                                                {this.state.missingPUListForCreateTree.length > 0 && <Button type="button" color="success" className="mr-1 float-right" size="md" onClick={() => this.saveMissingPUs()}><i className="fa fa-check"></i>{i18n.t("static.tree.addAbovePUs")}</Button>}
                                                {this.state.missingPUListForCreateTree.length == 0 && <strong>{i18n.t("static.tree.allTemplatePUAreInProgram")}</strong>}
                                                &nbsp;
                                            </FormGroup>
                                        </div>
                                    </Form>
                                )} />
                    </Col>
                    <br />
                </ModalBody>
            </Modal>
        </div >
    }
}
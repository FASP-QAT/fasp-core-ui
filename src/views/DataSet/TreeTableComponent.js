import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
import "jspdf-autotable";
import cleanUp from '../../assets/img/calculator.png';
import AggregationNode from '../../assets/img/Aggregation-icon.png';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType, LevelAnnotationConfig, AnnotationType, LineType, Thickness } from 'basicprimitives';
import { DropTarget, DragSource } from 'react-dnd';
import i18n from '../../i18n.js'
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Formik } from 'formik';
import * as Yup from 'yup'
import { Row, Col, Card, Button, CardBody, Form, Modal, ModalBody, PopoverBody, Popover, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, InputGroupText, DropdownItem, DropdownMenu, DropdownToggle, ButtonDropdown, InputGroup } from 'reactstrap';
import Provider from '../../Samples/Provider.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent.js';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText.js';
import moment from 'moment';
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
import { NUMBER_NODE_ID, PERCENTAGE_NODE_ID, FU_NODE_ID, PU_NODE_ID, ROUNDING_NUMBER, INDEXED_DB_NAME, INDEXED_DB_VERSION, TREE_DIMENSION_ID, SECRET_KEY, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DECIMAL_NO_REGEX_LONG, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE, DATE_FORMAT_CAP, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_INTEGER_REGEX, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, JEXCEL_DATE_FORMAT_WITHOUT_DATE } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions.js";
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import pdfIcon from '../../assets/img/pdf.png';
import CryptoJS from 'crypto-js'
import { MultiSelect } from 'react-multi-select-component';
import Draggable from 'react-draggable';
import { Bar } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { grey } from '@material-ui/core/colors';
import docicon from '../../assets/img/doc.png'
import { saveAs } from "file-saver";
import { convertInchesToTwip, Document, Packer, Paragraph, ShadingType, TextRun } from "docx";
import { calculateModelingData } from './ModelingDataCalculation2.js';
import TreeExtrapolationComponent from './TreeExtrapolationComponent.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import classNames from 'classnames';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import PDFDocument from 'pdfkit-nodejs-webpack';
import blobStream from 'blob-stream';
import OrgDiagramPdfkit from '../TreePDF/OrgDiagramPdfkit.js';
import Size from 'basicprimitives/src/graphics/structs/Size.js';
import { Prompt } from 'react-router';
import RotatedText from 'basicprimitivesreact/dist/umd/Templates/RotatedText';
import showguidanceBuildTreeEn from '../../../src/ShowGuidanceFiles/ManageTreeBuildTreesEn.html'
import showguidanceBuildTreeFr from '../../../src/ShowGuidanceFiles/ManageTreeBuildTreesFr.html'
import showguidanceBuildTreeSp from '../../../src/ShowGuidanceFiles/ManageTreeBuildTreesSp.html'
import showguidanceBuildTreePr from '../../../src/ShowGuidanceFiles/ManageTreeBuildTreesPr.html'
import showguidanceAddEditNodeDataEn from '../../../src/ShowGuidanceFiles/AddEditNodeDataEn.html'
import showguidanceAddEditNodeDataFr from '../../../src/ShowGuidanceFiles/AddEditNodeDataFr.html'
import showguidanceAddEditNodeDataSp from '../../../src/ShowGuidanceFiles/AddEditNodeDataSp.html'
import showguidanceAddEditNodeDataPr from '../../../src/ShowGuidanceFiles/AddEditNodeDataPr.html'
import showguidanceModelingTransferEn from '../../../src/ShowGuidanceFiles/BuildTreeModelingTransferEn.html'
import showguidanceModelingTransferFr from '../../../src/ShowGuidanceFiles/BuildTreeModelingTransferFr.html'
import showguidanceModelingTransferSp from '../../../src/ShowGuidanceFiles/BuildTreeModelingTransferSp.html'
import showguidanceModelingTransferPr from '../../../src/ShowGuidanceFiles/BuildTreeModelingTransferPr.html'
import PlanningUnitService from '../../api/PlanningUnitService.js';
// Localized entity name
const entityname = 'Tree';
const months = [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')]
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
const ItemTypes = {
    NODE: i18n.t('static.tree.node')
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
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2) && document.getElementById("nodeUnitId").value == "") {
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
            .test('nodeValue', 'Please enter a valid number having less then 10 digits.',
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
                    return parseInt(document.getElementById("nodeTypeId").value) == 4 && document.getElementById("planningUnitIdFUFlag").value === "true" && document.getElementById("planningUnitIdFU").value == "";
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
 * Defines the validation schema for tree details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        forecastMethodId: Yup.string()
            .required(i18n.t('static.validation.selectForecastMethod')),
        treeName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.validation.selectTreeName')),
        regionId: Yup.string()
            .required(i18n.t('static.common.regiontext')),
    })
}
/**
 * Defines the validation schema for tree scenario details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchemaScenario = function (values) {
    return Yup.object().shape({
        scenarioName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required('Please enter scenario name.'),
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
 * @param {string|number} cell1 - The numerical value to be formatted.
 * @param {Object} row - The row object if applicable.
 * @returns {string} The formatted numerical value with commas as thousand separators.
 */
function addCommasNodeValue(cell1, row) {
    if (cell1 != null && cell1 !== "") {
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
/**
 * Component for create tree
 */
export default class TreeTable extends Component {
    constructor(props) {
        super(props);
        var curDate = moment(Date.now()).format("YYYY-MM-DD");
        this.pickAMonth3 = React.createRef()
        this.pickAMonth2 = React.createRef()
        this.pickAMonth1 = React.createRef()
        this.pickAMonth4 = React.createRef()
        this.pickAMonth5 = React.createRef()
        this.pickAMonth6 = React.createRef()
        this.state = {
            isBranchTemplateModalOpen: false,
            branchTemplateList: [],
            isValidError: '',
            isScenarioChanged: false,
            isTreeDataChanged: false,
            percentForOneMonth: '',
            popoverOpenStartValueModelingTool: false,
            showGuidanceModelingTransfer: false,
            showGuidanceModelingTransfer: false,
            showGuidanceNodeData: false,
            showGuidance: false,
            sameLevelNodeList1: [],
            nodeUnitListPlural: [],
            nodeTransferDataList: [],
            qatCalculatedPUPerVisit: "",
            isChanged: false,
            levelModal: false,
            dropdownOpen: new Array(19).fill(false),
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
            popoverOpenFirstMonthOfTarget: false,
            popoverOpenYearsOfTarget: false,
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
            forecastPeriod: '',
            maxNodeDataId: '',
            message1: '',
            updatedPlanningUnitList: [],
            fullPlanningUnitList: [],
            nodeId: '',
            nodeDataMomList: [],
            scenarioActionType: '',
            defYear1: { year: 2018, month: 4 },
            defYear2: { year: 2020, month: 9 },
            showDiv: false,
            showDiv1: false,
            orgCurrentItemConfig: {},
            treeTemplateObj: [],
            scalingMonth: { year: Number(moment(curDate).startOf('month').format("YYYY")), month: Number(moment(curDate).startOf('month').format("M")) },
            showModelingValidation: true,
            scenario: {
                id: '',
                label: {
                    label_en: ''
                },
                notes: ''
            },
            scenario1: {
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
            currentTransferData: '',
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
            modelingCalculatorEl: '',
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
                },
                nodeDataExtrapolationOptionList: []
            },
            parentScenario: [],
            popoverOpen: false,
            regionValues: [],
            selectedScenario: '',
            selectedScenarioLabel: '',
            scenarioList: [],
            regionList: [],
            curTreeObj: {
                forecastMethod: { id: "" },
                label: { label_en: '' },
                notes: '',
                regionList: [],
                active: true
            },
            treeData: [],
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
            minDateValue: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            stopMinDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },

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
            activeTab1: new Array(3).fill('1'),
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
            momListPerParent: [],
            parentNodeDataMap: [],
            modelinDataForScenario: [],
            dataSetObj: {
                programData: ''
            },
            loading: false,
            modelingJexcelLoader: false,
            momJexcelLoader: false,
            lastRowDeleted: false,
            showDate: false,
            modelingChanged: false,
            missingPUList: [],
            autoCalculate: localStorage.getItem('sesAutoCalculate') != "" && localStorage.getItem('sesAutoCalculate') != undefined ? (localStorage.getItem('sesAutoCalculate').toString() == "true" ? true : false) : true,
            hideActionButtons: false,
            toggleArray: [],
            programDataListForPuCheck: [],
            collapseState: false,
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
            programDataListForPuCheck: [],
            toggleArray: [],
            collapseState: false,
            isCalculateClicked: 0,
            programDataListForPuCheck: [],
            planningUnitObjList: [],
            allProcurementAgentList: [],
            modelingTabChanged: false,
            modelingTabError: false,
            modelingChangedOrAdded: false,
            addNodeError: false,
            currentNodeTypeId: "",
            deleteChildNodes: false,
            branchTemplateNotes: "",
            calculateAllScenario:false,
            treeTabl1El: '',
            treeTabl2El: ''
        }
        this.dataChange = this.dataChange.bind(this);
        this.scenarioChange = this.scenarioChange.bind(this);
        this.getNodeValue = this.getNodeValue.bind(this);
        this.getNotes = this.getNotes.bind(this);
        this.getNoOfMonthsInUsagePeriod = this.getNoOfMonthsInUsagePeriod.bind(this);
        this.getNoFURequired = this.getNoFURequired.bind(this);
        this.getUsageText = this.getUsageText.bind(this);
        this.filterUsageTemplateList = this.filterUsageTemplateList.bind(this);
        this.getNoOfFUPatient = this.getNoOfFUPatient.bind(this);
        this.getForecastingUnitUnitByFUId = this.getForecastingUnitUnitByFUId.bind(this);
        this.getPlanningUnitListByFUId = this.getPlanningUnitListByFUId.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getNodeTyeList = this.getNodeTyeList.bind(this);
        this.getForecastMethodList = this.getForecastMethodList.bind(this);
        this.getUnitListForDimensionIdFour = this.getUnitListForDimensionIdFour.bind(this);
        this.getUnitList = this.getUnitList.bind(this);
        this.getUsagePeriodList = this.getUsagePeriodList.bind(this);
        this.getUsageTypeList = this.getUsageTypeList.bind(this);
        this.getTreeList = this.getTreeList.bind(this);
        this.getTreeByTreeId = this.getTreeByTreeId.bind(this);
        this.getTreeTemplateById = this.getTreeTemplateById.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.getModelingTypeList = this.getModelingTypeList.bind(this);
        this.calculateMomByEndValue = this.calculateMomByEndValue.bind(this);
        this.calculateMomByChangeInPercent = this.calculateMomByChangeInPercent.bind(this);
        this.calculateMomByChangeInNumber = this.calculateMomByChangeInNumber.bind(this);
        this.getRegionList = this.getRegionList.bind(this);
        this.updateTreeData = this.updateTreeData.bind(this);
        this.callAfterScenarioChange = this.callAfterScenarioChange.bind(this);
        this.treeDataChange = this.treeDataChange.bind(this);
        this.fetchTracerCategoryList = this.fetchTracerCategoryList.bind(this);
        this.calculateMOMData = this.calculateMOMData.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this.getMaxNodeDataId = this.getMaxNodeDataId.bind(this);
        this.round = this.round.bind(this);
        this.calculatePUPerVisit = this.calculatePUPerVisit.bind(this);
        this.qatCalculatedPUPerVisit = this.qatCalculatedPUPerVisit.bind(this);
        this.calculateParentValueFromMOM = this.calculateParentValueFromMOM.bind(this);
        this.generateBranchFromTemplate = this.generateBranchFromTemplate.bind(this);
        this.procurementAgentList = this.procurementAgentList.bind(this);
        this.getUsageTemplateList = this.getUsageTemplateList.bind(this);
        this.buildTab1Jexcel = this.buildTab1Jexcel.bind(this);
        this.buildTab2Jexcel = this.buildTab2Jexcel.bind(this);
    }
    /**
     * Calculates the planning unit usage per visit (PU per visit) based on the current scenario configuration and usage type.
     * Updates the PU per visit value in the current scenario's node data map.
     * @param {boolean} isRefillMonth - Indicates whether the calculation is for refill months. 
     * If true, the refill months value will be used; otherwise, the standard calculation will be performed.
     */
    calculatePUPerVisit(isRefillMonth) {
        var currentScenario = this.state.currentScenario;
        var parentScenario = this.state.parentScenario;
        var currentItemConfig = this.state.currentItemConfig;
        var conversionFactor = this.state.conversionFactor;
        var puPerVisit = "";
        if (parentScenario.fuNode.usageType.id == 2) {
            var refillMonths = 1;
            puPerVisit = parseFloat(((parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / conversionFactor).toFixed(8);
        } else if (parentScenario.fuNode.usageType.id == 1) {
            puPerVisit = parseFloat(this.state.noFURequired / conversionFactor).toFixed(8);
        }
        var scenarioList = this.state.scenarioList;
        for (var i = 0; i < scenarioList.length; i++) {
            try {
                currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id][0].puNode.puPerVisit = puPerVisit;
                if (!isRefillMonth) {
                    currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id][0].puNode.refillMonths = refillMonths;
                }
                currentScenario = currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id][0];
            } catch (error) { }
        }
        this.setState({ currentItemConfig, currentScenario });
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
     * Finds max node data Id
     * @returns Max node data Id
     */
    getMaxNodeDataId() {
        var maxNodeDataId = 0;
        var items = this.state.items;
        var nodeDataMap = [];
        var nodeDataMapIdArr = [];
        for (let i = 0; i < items.length; i++) {
            var scenarioList = this.state.scenarioList;
            for (let j = 0; j < scenarioList.length; j++) {
                if (items[i].payload.nodeDataMap.hasOwnProperty(scenarioList[j].id)) {
                    nodeDataMap.push(items[i].payload.nodeDataMap[scenarioList[j].id][0]);
                    nodeDataMapIdArr.push(items[i].payload.nodeDataMap[scenarioList[j].id][0].nodeDataId);
                }
            }
        }
        maxNodeDataId = nodeDataMap.length > 0 ? Math.max(...nodeDataMap.map(o => o.nodeDataId)) : 0;
        maxNodeDataId = parseInt(maxNodeDataId + 1);
        return maxNodeDataId;
    }
    /**
     * Function to validate node data based on node type
     * @returns True if validation passes, false otherwise.
     */
    validation1 = function () {
        var validationFail = 0;
        var nodeTypeId = document.getElementById("nodeTypeId").value;
        var nodeTitle = document.getElementById("nodeTitle").value;
        var nodeValue = document.getElementById("nodeValue").value;
        var testNumber = (/^(?!$)\d{0,10}(?:\.\d{1,8})?$/).test(nodeValue.replaceAll(",", ""));
        var testTitle = (/^\S+(?: \S+)*$/).test(nodeTitle);
        if ((nodeTypeId == 3 || nodeTypeId == 2) && document.getElementById("nodeUnitId").value == "") {
            validationFail = 1;
            document.getElementById("nodeUnitId").className = "form-control is-invalid"
        }
        if (nodeTitle == "" || testTitle == false) {
            validationFail = 1;
            document.getElementById("nodeTitle").className = "form-control is-invalid"
        }
        if ((nodeTypeId == 3 || nodeTypeId == 2) && (nodeValue == "" || testNumber == false)) {
            validationFail = 1;
            document.getElementById("nodeValue").className = "form-control is-invalid"
        }
        return validationFail > 0 ? false : true;

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
     * Hides the message in div3 after 30 seconds.
     */
    hideThirdComponent() {
        document.getElementById('div3').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div3').style.display = 'none';
        }, 30000);
    }
    /**
     * Function to show alerts 
     */
    alertfunction() {
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
        var monthDifference = parseInt(moment(endDate).startOf('month').diff(startDate, 'months', true) + 1);
        var momValue = '', percentForOneMonth = '';
        var currentEndValue = document.getElementById("currentEndValue").value;
        var getValue = currentEndValue.toString().replaceAll(",", "");
        if (this.state.currentModelingType == 2) {
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(4);
        }
        if (this.state.currentModelingType == 3) {
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(4);
        }
        if (this.state.currentModelingType == 4) {
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(4);
        }
        if (this.state.currentModelingType == 5) {
            var momValue = (parseFloat((getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) / monthDifference)).toFixed(4);
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
            targetChangePerForExpoPer = ((Math.pow(parseFloat(getValue / this.state.currentCalculatorStartValue), parseFloat(1 / monthDifference)) - 1) * 100).toFixed(4)
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
        var monthDifference = parseInt(moment(endDate).diff(startDate, 'months', true) + 1);
        var currentTargetChangePercentage = document.getElementById("currentTargetChangePercentage").value;
        currentTargetChangePercentage = currentTargetChangePercentage != "" ? parseFloat(currentTargetChangePercentage) : ''
        var getValue = currentTargetChangePercentage != "" ? currentTargetChangePercentage.toString().replaceAll(",", "").match(/^-?\d+(?:\.\d{0,4})?/)[0] : "";
        var getEndValueFromPercentage = (this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100;
        var targetEndValue = (parseFloat(this.state.currentCalculatorStartValue.toString().replaceAll(",", "")) + parseFloat(getEndValueFromPercentage)).toFixed(4);
        var momValue = '', percentForOneMonth = '';
        if (this.state.currentModelingType == 2) {
            var momValue = ((parseFloat((this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100) / monthDifference)).toFixed(4);
        }
        if (this.state.currentModelingType == 3) {
            var momValue = ((parseFloat(((this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100) / monthDifference))).toFixed(4);
            percentForOneMonth = getValue / monthDifference;
        }
        if (this.state.currentModelingType == 4) {
            var momValue = (parseFloat(((this.state.currentCalculatorStartValue.toString().replaceAll(",", "") * getValue) / 100) / monthDifference)).toFixed(4);
            percentForOneMonth = parseFloat(((Math.pow((1 + (getValue / 100)), (1 / monthDifference))) - 1) * 100).toFixed(4);
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
            currentEndValue: (getValue != '' && this.state.currentModelingType != 5) ? targetEndValue : '',
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
     * Calls modeling data calculation function to calculate month on month data
     * @param {*} nodeId Node Id for which the month on month should be built
     * @param {*} type Type of the node
     */
    calculateMOMData(nodeId, type) {
        let { curTreeObj } = this.state;
        let { treeData } = this.state;
        let { dataSetObj } = this.state;
        var items = this.state.items;
        var programData = dataSetObj.programData;
        programData.treeList = treeData;
        if (this.state.selectedScenario !== "") {
            curTreeObj.tree.flatList = items;
        }
        curTreeObj.scenarioList = this.state.scenarioList;
        var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
        treeData[findTreeIndex] = curTreeObj;
        programData.treeList = treeData;
        dataSetObj.programData = programData;
        if (this.state.autoCalculate) {
            var scenarioId = this.state.selectedScenario;
            if (this.state.calculateAllScenario) {
                scenarioId = -1;
            }
            this.setState({
                calculateAllScenario: false
            })
            calculateModelingData(dataSetObj, this, '', (nodeId != 0 ? nodeId : this.state.currentItemConfig.context.id), scenarioId, type, this.state.treeId, false, false, this.state.autoCalculate);
        } else {
            this.setState({
                loading: false,
                modelingJexcelLoader: false,
                momJexcelLoader: false,
                message1: "Data updated successfully"
            }, () => {
            })
        }
    }
    /**
     * Fetches tracer category list from program data and updates state accordingly.
     * @param {Object} programData - The program data containing planning unit list.
     */
    fetchTracerCategoryList(programData) {
        var planningUnitList = programData.planningUnitList.filter(x => x.treeForecast == true && x.active == true);
        var updatedPlanningUnitList = [];
        var fullPlanningUnitList = [];
        var forecastingUnitList = [];
        var tracerCategoryList = [];
        planningUnitList.map(item => {
            forecastingUnitList.push({
                label: item.planningUnit.forecastingUnit.label, id: item.planningUnit.forecastingUnit.id,
                unit: item.planningUnit.forecastingUnit.unit,
                tracerCategory: item.planningUnit.forecastingUnit.tracerCategory
            })
        })
        programData.planningUnitList.map(item => {
            fullPlanningUnitList.push(item)
        })
        planningUnitList.map(item => {
            updatedPlanningUnitList.push({
                label: item.planningUnit.label, id: item.planningUnit.id,
                unit: item.planningUnit.unit,
                forecastingUnit: item.planningUnit.forecastingUnit,
                multiplier: item.planningUnit.multiplier
            })
        })
        planningUnitList.map(item => {
            tracerCategoryList.push({
                label: item.planningUnit.forecastingUnit.tracerCategory.label, tracerCategoryId: item.planningUnit.forecastingUnit.tracerCategory.id
            })
        })
        forecastingUnitList = [...new Map(forecastingUnitList.map(v => [v.id, v])).values()];
        tracerCategoryList = [...new Map(tracerCategoryList.map(v => [v.tracerCategoryId, v])).values()];
        var forecastingUnitListNew = JSON.parse(JSON.stringify(forecastingUnitList));
        let forecastingUnitMultiList = forecastingUnitListNew.length > 0
            && forecastingUnitListNew.map((item, i) => {
                return ({ value: item.id, label: getLabelText(item.label, this.state.lang) + " | " + item.id })
            }, this);
        this.setState({
            forecastingUnitMultiList,
            tracerCategoryList,
            forecastingUnitList,
            planningUnitList: updatedPlanningUnitList,
            updatedPlanningUnitList,
            fullPlanningUnitList: fullPlanningUnitList
        }, () => {
            if (forecastingUnitListNew.length > 0) {
                var fuIds = forecastingUnitListNew.map(x => x.id).join(", ");
                if (fuIds != "") {
                    var fuIdArray = fuIds.split(',').map(Number);
                    this.getUsageTemplateList(fuIdArray);
                }
            }
        });
    }
    /**
     * Updates calculated data values in the tree based on the selected scenario and updates state accordingly.
     * @param {number} scenarioId - The ID of the selected scenario.
     */
    callAfterScenarioChange(scenarioId) {
        let { curTreeObj } = this.state;
        var items = curTreeObj.tree.flatList;
        var scenarioId = scenarioId;
        for (let i = 0; i < items.length; i++) {
            if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) {
                (items[i].payload.nodeDataMap[scenarioId])[0].calculatedDataValue = (items[i].payload.nodeDataMap[scenarioId])[0].dataValue;
            } else {
                var findNodeIndex = items.findIndex(n => n.id == items[i].parent);
                if (findNodeIndex != -1) {
                    var parentValue = (items[findNodeIndex].payload.nodeDataMap[scenarioId])[0].calculatedDataValue;
                    (items[i].payload.nodeDataMap[scenarioId])[0].calculatedDataValue = (parentValue * (items[i].payload.nodeDataMap[scenarioId])[0].dataValue) / 100;
                } else {
                    items.splice(i, 1);
                }
            }
        }
        var scenario = document.getElementById("scenarioId");
        var selectedText = scenario.options[scenario.selectedIndex].text;
        this.setState({
            items,
            selectedScenario: scenarioId,
            selectedScenarioLabel: selectedText,
        }, () => {
            this.handleAMonthDissmis3(this.state.singleValue2, 0);
        });
    }
    /**
     * Reterives region list from indexed db
     */
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
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var regionList = [];
                if (this.state.realmCountryId != null && this.state.realmCountryId != "") {
                    regionList = myResult.filter(x => x.realmCountry.realmCountryId == this.state.realmCountryId);
                }
                else {
                    this.setState({
                        regionValues: []
                    });
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
                }
            }.bind(this);
        }.bind(this);
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
     * Reterives usage template list
     */
    getUsageTemplateList(fuIdArray) {
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
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                myResult.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                var usageTemplateListAll = myResult.filter(el => fuIdArray.indexOf(el.forecastingUnit.id) != -1 && el.active && (el.program == null || el.program.id == this.state.programId.split("_")[0]));
                this.setState({
                    usageTemplateListAll
                }, () => {
                })
            }.bind(this);
        }.bind(this)
    }
    /**
     * Reterives modeling type list
     */
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
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                this.setState({
                    modelingTypeList: myResult
                });
            }.bind(this);
        }.bind(this);
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedTab1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson(null, false);
        var jsonLength;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']
        for (var j = 0; j < jsonLength; j++) {
            var rowData = elInstance.getRowData(j);
            if(rowData[10] == 1) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("E").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("F").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("G").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            } else if(rowData[10] == 2) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("G").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            } else if(rowData[10] == 3) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            }
        }
    }
    buildTab1Jexcel() {
        var treeArray = [];
        var count = 0;
        var item1 = this.state.items;
        var sortOrderArray = [...new Set(item1.map(ele => (ele.sortOrder)))];
        var sortedArray = sortOrderArray.sort();
        var items = [];
        for (var i = 0; i < sortedArray.length; i++) {
            items.push(item1.filter(c => c.sortOrder == sortedArray[i])[0]);
        }
        for (var i = 0; i < items.length; i++) {
            data = [];
            var row = "";
            var row1 = "";
            var level = items[i].level;
            var numberNode = items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2 ? false : true;
            var currentScenario = items[i].payload.nodeDataMap[this.state.selectedScenario][0];
            
            data[1] = this.state.items.filter(c => c.id == items[i].parent).length > 0 ? this.state.items.filter(c => c.id == items[i].parent)[0].payload.label.label_en : "";
            data[2] = getLabelText(this.state.nodeTypeList.filter(c => c.id == items[i].payload.nodeType.id)[0].label, this.state.lang);
            data[3] = items[i].payload.label.label_en;
            data[4] = this.state.nodeUnitList.filter(c => c.id == items[i].payload.nodeUnit.unitId)[0].unitId;
            data[5] = moment(currentScenario.month).format("YYYY-MM-DD");
            data[6] = currentScenario.dataValue;
            data[7] = this.calculateParentValueFromMOMForJexcel(currentScenario.month, items[i]);
            data[8] = numberNode ? currentScenario.calculatedDataValue == 0 ? "0" : addCommasNodeValue(currentScenario.calculatedDataValue) : addCommasNodeValue(currentScenario.dataValue);
            data[9] = currentScenario.notes;
            data[10] = this.state.nodeTypeList.filter(c => c.id == items[i].payload.nodeType.id)[0].id;
            data[11] = items[i].id;

            treeArray[count] = data;
            count++;
        }
        
        if (0 == 0) {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            var data = treeArray;
            var options = {
                data: data,
                columnDrag: false,
                colHeaderClasses: ["Reqasterisk"],
                columns: [
                    {
                        title: 'Node Id',
                        type: 'hidden'
                    },
                    {
                        title: i18n.t('static.tree.parent'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.ManageTree.NodeType'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.tree.nodeTitle'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.tree.nodeUnit'),
                        source: this.state.nodeUnitListForDropdown,
                        type: 'dropdown',
                    },
                    {
                        title: i18n.t('static.supplyPlan.startMonth'),
                        options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' },
                        type: 'calendar'
                    },
                    {
                        title: i18n.t('static.tree.percentageOfParent'),
                        mask: '#,##0.00%', decimal: '.',
                        type: 'numeric',
                    },
                    {
                        title: i18n.t('static.tree.parentValue'),
                        mask: '#,##0.00', decimal: '.',
                        type: 'numeric',
                    },
                    {
                        title: i18n.t('static.tree.nodeValue'),
                        mask: '#,##0.00', decimal: '.',
                        type: 'numeric',
                    },
                    {
                        title: i18n.t('static.common.notes'),
                        type: 'text',
                    },
                    {
                        title: 'Node Type',
                        type: 'hidden',
                    },
                    {
                        title: 'Node Id',
                        type: 'hidden',
                    }
                ],
                editable: true,
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
                license: JEXCEL_PRO_KEY,
                onload: this.loadedTab1,
                // onchange:
                // onchangepage:
                contextMenu: function (obj, x, y, e) {
                    var items = [];
                    var rowData = obj.getRowData(y)
                    if (y != null) {
                        if (1 == 1) {
                            items.push({
                                title: "Go to Tree",
                                onclick: function () {
                                    localStorage.setItem("openNodeId", rowData[11]);
                                    window.open("/#/dataSet/buildTree/tree/" + this.state.treeId + "/" + this.state.programId + "/" + "-1", "_blank")
                                }.bind(this)
                            });
                        }
                    }
                    return items;
                }.bind(this),
            };
            var treeTabl1El = jexcel(document.getElementById("tableDiv"), options);
            this.el = treeTabl1El;
            this.setState({
                treeTabl1El: treeTabl1El,
                loading: false,
            })
        } else {
            this.setState({
                treeTabl1El: "",
                loading: false
            })
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
        }
    }
    buildTab2Jexcel() {
        var treeArray = [];
        var count = 0;
        if (0 == 0) {
            for (var k = 0; k < 10; k++) {
                data = [];
                data[0] = 1
                data[1] = 1
                data[2] = 1
                data[3] = 1
                data[4] = 1
                data[5] = 1
                data[6] = 1
                data[7] = ""
                data[8] = ""
                data[9] = ""
                data[10] = ""
                data[11] = ""
                data[12] = ""
                data[13] = ""
                data[14] = ""
                treeArray[count] = data;
                count++;
            }
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            var data = treeArray;
            var options = {
                data: data,
                columnDrag: false,
                colHeaderClasses: ["Reqasterisk"],
                columns: [
                    {
                        title: 'Tree Id',
                        type: 'hidden'
                    },
                    {
                        title: i18n.t('static.dashboard.programheader'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.common.treeName'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.common.region'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.forecastMethod.forecastMethod'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.common.scenarioName'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.program.notes'),
                        type: 'text',
                    },
                    {
                        title: 'ProgramId',
                        type: 'hidden',
                    },
                    {
                        title: 'id',
                        type: 'hidden',
                    },
                    {
                        title: 'versionId',
                        type: 'hidden',
                    },
                    {
                        title: i18n.t('static.common.lastModifiedBy'),
                        type: 'text',
                    },
                    {
                        title: i18n.t('static.common.lastModifiedDate'),
                        type: 'calendar',
                    },
                    {
                        type: 'checkbox',
                        title: i18n.t('static.common.active'),
                        width:60
                        // source: [
                        //     { id: true, name: i18n.t('static.common.active') },
                        //     { id: false, name: i18n.t('static.common.disabled') }
                        // ]
                    },
                    {
                        type: 'hidden'
                    },
                    {
                        type: 'hidden'
                    }
                ],
                editable: false,
                // onload: this.loaded,
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
                license: JEXCEL_PRO_KEY,
            };
            var treeTabl2El = jexcel(document.getElementById("tableDiv2"), options);
            this.el = treeTabl2El;
            this.setState({
                treeTabl2El: treeTabl2El,
                loading: false,
            })
        } else {
            this.setState({
                treeTabl2El: "",
                loading: false
            })
            this.el = jexcel(document.getElementById("tableDiv2"), '');
            jexcel.destroy(document.getElementById("tableDiv2"), true);
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
                var nodeDataMomList = parentItem[0].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList;
                if (nodeDataMomList.length) {
                    var momDataForNode = nodeDataMomList.filter(x => moment(x.month).format("YYYY-MM-DD") == moment(month).format("YYYY-MM-DD"));
                    if (momDataForNode.length > 0) {
                        if (currentItemConfig.context.payload.nodeType.id == 5) {
                            parentValue = momDataForNode[0].calculatedMmdValue;
                        } else {
                            parentValue = momDataForNode[0].calculatedValue;
                        }
                    }
                }
            }
            var percentageOfParent = currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].dataValue;
            currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue = ((percentageOfParent * parentValue) / 100).toString()
        }
        this.setState({ parentValue, currentItemConfig, currentScenario: currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0] }, () => {
        });
    }
    calculateParentValueFromMOMForJexcel(month, currentItemConfig) {
        var parentValue = 0;
        if (currentItemConfig.payload.nodeType.id != 1 && currentItemConfig.payload.nodeType.id != 2) {
            var items = this.state.items;
            var parentItem = items.filter(x => x.id == currentItemConfig.parent);
            if (parentItem.length > 0) {
                var nodeDataMomList = parentItem[0].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList;
                if (nodeDataMomList.length) {
                    var momDataForNode = nodeDataMomList.filter(x => moment(x.month).format("YYYY-MM-DD") == moment(month).format("YYYY-MM-DD"));
                    if (momDataForNode.length > 0) {
                        if (currentItemConfig.payload.nodeType.id == 5) {
                            parentValue = momDataForNode[0].calculatedMmdValue;
                        } else {
                            parentValue = momDataForNode[0].calculatedValue;
                        }
                    }
                }
            }
            var percentageOfParent = currentItemConfig.payload.nodeDataMap[this.state.selectedScenario][0].dataValue;
            currentItemConfig.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue = ((percentageOfParent * parentValue) / 100).toString()
        }
        return parentValue;
    }
    /**
     * Calculates the planning unit usage per visit (PU per visit) based on the current item's configuration and usage type.
     * Updates the PU per visit value in the current item's node data map.
     * @param {number} type - The type of calculation to perform. 1 for refill months calculation, 2 for standard calculation.
     */
    qatCalculatedPUPerVisit(type) {
        var currentItemConfig = this.state.currentItemConfig;
        var qatCalculatedPUPerVisit = "";
        var planningUnitList = this.state.planningUnitList;
        if (planningUnitList.length > 0 && currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id != "") {
            if (planningUnitList.filter(x => x.id == currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id).length > 0) {
                var pu = planningUnitList.filter(x => x.id == currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id)[0];
                if (currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.usageType.id == 2) {
                    var refillMonths = 1;
                    qatCalculatedPUPerVisit = parseFloat(((currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / pu.multiplier).toFixed(8);
                } else {
                    qatCalculatedPUPerVisit = parseFloat(this.state.noFURequired / pu.multiplier).toFixed(8);
                }
                if (type == 1) {
                    if (currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.usageType.id == 2) {
                        currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.refillMonths = 1;
                    }
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.puPerVisit = qatCalculatedPUPerVisit;
                }
                if (type == 2) {
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.puPerVisit = qatCalculatedPUPerVisit;
                }
            }
        }
        this.setState({ qatCalculatedPUPerVisit });
    }
    /**
     * Reterives forecast program list
     */
    getDatasetList() {
        this.setState({ loading: true });
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction, program;
            if (this.props.match.params.isLocal == 2) {
                transaction = db1.transaction(['datasetDataServer'], 'readwrite');
                program = transaction.objectStore('datasetDataServer');
            } else {
                transaction = db1.transaction(['datasetData'], 'readwrite');
                program = transaction.objectStore('datasetData');
            }
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                myResult = getRequest.result.filter(c => c.userId == userId);
                this.setState({
                    datasetList: myResult,
                    programId: this.state.programId != null ? this.state.programId : (myResult.length == 1 ? myResult[0].id : "")
                }, () => {
                    var dataSetObj = this.state.datasetList.filter(c => c.id == this.state.programId)[0];
                    if (dataSetObj != null) {
                        var dataEnc = JSON.parse(JSON.stringify(dataSetObj));
                        var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                        dataEnc.programData = programData;
                        var minDate = { year: Number(moment(programData.currentVersion.forecastStartDate).startOf('month').format("YYYY")), month: Number(moment(programData.currentVersion.forecastStartDate).startOf('month').format("M")) };
                        var stopMinDate = { year: Number(moment(programData.currentVersion.forecastStartDate).startOf('month').format("YYYY")), month: Number(moment(programData.currentVersion.forecastStartDate).startOf('month').format("M")) };
                        var maxDate = { year: Number(moment(programData.currentVersion.forecastStopDate).startOf('month').format("YYYY")), month: Number(moment(programData.currentVersion.forecastStopDate).startOf('month').format("M")) };
                        var forecastPeriod = moment(programData.currentVersion.forecastStartDate).format(`MMM-YYYY`) + " ~ " + moment(programData.currentVersion.forecastStopDate).format(`MMM-YYYY`);
                        this.setState({
                            dataSetObj: dataEnc, minDate, maxDate, stopMinDate,
                            forecastStartDate: programData.currentVersion.forecastStartDate,
                            forecastStopDate: programData.currentVersion.forecastStopDate, forecastPeriod,
                            singleValue2: { year: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getFullYear(), month: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getMonth() + 1 },
                            showDate: true
                        }, () => {
                            this.fetchTracerCategoryList(programData);
                            var tree = programData.treeList.filter(c => c.treeId == this.state.treeId)[0];
                            if (tree != null && tree.generateMom == 1) {
                                this.calculateMOMData(0, 2);
                            } else {
                                this.setState({ loading: false })
                            }
                        });
                    } else {
                        this.setState({ loading: false })
                    }
                });
            }.bind(this);
        }.bind(this);
    }
    /**
     * Handle region change function.
     * This function updates the state with the selected region values and generates a list of regions.
     * @param {array} regionIds - An array containing the IDs and labels of the selected regions.
     */
    handleRegionChange = (regionIds) => {
        const { curTreeObj } = this.state;
        this.setState({
            regionValues: regionIds.map(ele => ele),
            regionLabels: regionIds.map(ele => ele.label),
            isTreeDataChanged: true
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
            curTreeObj.regionList = regionList;
            this.setState({ curTreeObj });
        })
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
            isChanged: true,
            calculateAllScenario: true
        }, () => {
            if (regionIds != null) {
                var scenarioList = this.state.scenarioList;
                for (var i = 0; i < scenarioList.length; i++) {
                    try {
                        currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id][0].fuNode.forecastingUnit.id = regionIds.value;
                        currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id][0].fuNode.forecastingUnit.label.label_en = regionIds.label.split("|")[0];
                    } catch (error) { }
                }
                if (currentItemConfig.context.payload.label.label_en == "" || currentItemConfig.context.payload.label.label_en == null) {
                    currentItemConfig.context.payload.label.label_en = (regionIds.label.split("|")[0]).trim();
                }
                this.setState({ showFUValidation: false }, () => {
                    this.getForecastingUnitUnitByFUId(regionIds.value);
                    this.getPlanningUnitListByFUId(regionIds.value);
                    this.filterUsageTemplateList(0, regionIds.value);
                });
            } else {
                var scenarioList = this.state.scenarioList;
                for (var i = 0; i < scenarioList.length; i++) {
                    try {
                        currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id][0].fuNode.forecastingUnit.id = "";
                        currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id][0].fuNode.forecastingUnit.label.label_en = "";
                    } catch (error) { }
                }
                this.setState({ showFUValidation: true, planningUnitList: [] }, () => {
                    this.filterUsageTemplateList(0, 0);
                });
            }
            this.setState({ currentItemConfig });
        })
    }
    /**
     * Reterives tree template details by tree template Id
     * @param {*} treeTemplateId - Id for which tree template details must be fetched
     */
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
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                const { treeData } = this.state;
                var treeTemplate = myResult.filter(x => x.treeTemplateId == treeTemplateId)[0];
                var flatList = treeTemplate.flatList;
                for (let i = 0; i < flatList.length; i++) {
                    var nodeDataMap = {};
                    var tempArray = [];
                    var tempJson = flatList[i].payload.nodeDataMap[0][0];
                    tempArray.push(tempJson);
                    nodeDataMap[1] = tempArray;
                    flatList[i].payload.nodeDataMap = nodeDataMap;
                }
                var maxTreeId = treeData.length > 0 ? Math.max(...treeData.map(o => o.treeId)) : 0;
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
                            label_en: i18n.t('static.realm.default')
                        },
                        active: true,
                        notes: ''
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
                });
            }.bind(this);
        }.bind(this);
    }
    /**
     * Reterives tree details by tree Id
     * @param {*} treeTemplateId - Id for which tree details must be fetched
     */
    getTreeByTreeId(treeId) {
        if (treeId != "" && treeId != null && treeId != 0) {
            var curTreeObj = this.state.treeData.filter(x => x.treeId == treeId)[0];
            var regionValues = (curTreeObj.regionList) != null && (curTreeObj.regionList).map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
            }, this);
            var tempToggleObject = [];
            if (curTreeObj.tree.flatList.length > 0) {
                tempToggleObject = curTreeObj.tree.flatList.filter(item =>
                    (item.payload.collapsed == true)
                );
            }
            let tempToggleList = tempToggleObject.map(item => item.id);
            var curTreeObj1 = curTreeObj.tree.flatList.map(item => {
                if (tempToggleList.includes(item.id))
                    return { ...item, templateName: "contactTemplateMin", expanded: true }
                return { ...item, templateName: "contactTemplate", expanded: false }
            })
            if (Array.from(new Set(tempToggleList)).length + 1 >= curTreeObj.tree.flatList.length) {
                var parentNode = curTreeObj.tree.flatList.filter(item =>
                    (item.parent == null)
                );
                tempToggleList.push(parentNode[0].id)
                this.setState({ collapseState: true })
            } else {
                this.setState({ collapseState: false })
            }
            this.setState({ toggleArray: tempToggleList });
            curTreeObj.tree.flatList = curTreeObj1;
            this.setState({
                curTreeObj,
                scenarioList: curTreeObj.scenarioList.filter(x => x.active == true),
                regionValues
            }, () => {
                if (curTreeObj.scenarioList.length == 1) {
                    var scenarioId = curTreeObj.scenarioList[0].id;
                    var selectedText = curTreeObj.scenarioList[0].label.label_en;
                    this.setState({
                        selectedScenario: scenarioId,
                        selectedScenarioLabel: selectedText,
                        currentScenario: []
                    }, () => {
                        this.callAfterScenarioChange(scenarioId);
                    });
                } else if (this.props.match.params.scenarioId != null && this.props.match.params.scenarioId != "") {
                    var scenarioId = this.props.match.params.scenarioId;
                    var selectedText = curTreeObj.scenarioList.filter(x => x.id == scenarioId)[0].label.label_en;
                    this.setState({
                        selectedScenario: scenarioId,
                        selectedScenarioLabel: selectedText,
                        currentScenario: []
                    }, () => {
                        this.callAfterScenarioChange(scenarioId);
                    });
                }
            });
        } else {
            this.setState({
                curTreeObj: {
                    forecastMethod: { id: "" },
                    label: { label_en: '' },
                    notes: '',
                    regionList: [],
                    active: true
                },
                scenarioList: [],
                items: [],
                selectedScenario: ''
            });
        }
    }
    /**
     * Reterives tree list
     */
    getTreeList() {
        var proList = [];
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction, program;
            if (this.props.match.params.isLocal == 2) {
                transaction = db1.transaction(['datasetDataServer'], 'readwrite');
                program = transaction.objectStore('datasetDataServer');
            } else {
                transaction = db1.transaction(['datasetData'], 'readwrite');
                program = transaction.objectStore('datasetData');
            }
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                var realmCountryId = "";
                var programDataListForPuCheck = [];
                if (this.state.programId != null && this.state.programId != "") {
                    var dataSetObj = myResult.filter(c => c.id == this.state.programId)[0];
                    var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
                    var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                    programDataListForPuCheck.push({ "programData": programData, "id": dataSetObj.id });
                    realmCountryId = programData.realmCountry.realmCountryId;
                    var treeList = programData.treeList;
                    for (var k = 0; k < treeList.length; k++) {
                        proList.push(treeList[k])
                    }
                    this.setState({
                        singleValue2: { year: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getFullYear(), month: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getMonth() + 1 }
                    })
                } else {
                    for (var i = 0; i < myResult.length; i++) {
                        if (myResult[i].userId == userId) {
                            var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                            programDataListForPuCheck.push({ "programData": programData, "id": myResult[i].id });
                            var treeList = programData.treeList;
                            for (var k = 0; k < treeList.length; k++) {
                                proList.push(treeList[k])
                            }
                        }
                    }
                }
                var tempToggleObject = [];
                if (proList.length > 0) {
                    tempToggleObject = proList[0].tree.flatList.filter(item =>
                        (item.payload.collapsed == true)
                    );
                }
                let tempToggleList = tempToggleObject.map(item => item.id);
                if (proList.length > 0) {
                    proList.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                }
                let proList1 = [];
                if (proList.length > 0) {
                    proList1 = proList[0].tree.flatList.map(item => {
                        if (tempToggleList.includes(item.id))
                            return { ...item, templateName: "contactTemplateMin", expanded: true }
                        return { ...item, templateName: "contactTemplate" }
                    })
                    proList[0].tree.flatList = proList1;
                }
                this.setState({
                    realmCountryId,
                    treeData: proList,
                    toggleArray: tempToggleList,
                    programDataListForPuCheck: programDataListForPuCheck
                }, () => {
                    if (this.state.treeId != "" && this.state.treeId != 0) {
                        this.getTreeByTreeId(this.state.treeId);
                    }
                    this.getTreeTemplateById(this.props.match.params.templateId);
                });
            }.bind(this);
        }.bind(this);
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
     * Redirects to list tree template screen on cancel button clicked
     */
    cancelClicked() {
        this.props.history.push(`/dataset/listTree/`)
    }
    /**
     * Reterives planning unit list based on forecasting unit Id
     * @param {*} forecastingUnitId Forecasting unit Id for which planning units should be retrived
     */
    getPlanningUnitListByFUId(forecastingUnitId) {
        var planningUnitList = this.state.updatedPlanningUnitList.filter(x => x.forecastingUnit.id == forecastingUnitId);
        this.setState({
            planningUnitList,
            tempPlanningUnitId: planningUnitList.length == 1 ? planningUnitList[0].id : "",
        }, () => {
            if (this.state.planningUnitList.length == 1) {
                var { currentItemConfig } = this.state;
                if ((currentItemConfig.context.payload.nodeType.id == 4 && this.state.addNodeFlag) || (currentItemConfig.context.payload.nodeType.id == 5 && this.state.addNodeFlag)) {
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id = this.state.planningUnitList[0].id;
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.label = this.state.planningUnitList[0].label;
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.multiplier = this.state.planningUnitList[0].multiplier;
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.unit.id = this.state.planningUnitList[0].unit.id;
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].displayCalculatedDataValue = currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue;
                    if (this.state.addNodeFlag && currentItemConfig.context.payload.nodeType.id == 5) {
                        currentItemConfig.context.payload.label = JSON.parse(JSON.stringify(this.state.planningUnitList[0].label));
                    }
                    this.setState({
                        conversionFactor: this.state.planningUnitList[0].multiplier,
                        currentItemConfig,
                        currentScenario: currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0]
                    }, () => {
                        if (this.state.addNodeFlag && currentItemConfig.context.payload.nodeType.id == 5) {
                            this.qatCalculatedPUPerVisit(1);
                        }
                    });
                }
            }
            if (this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario].puNode != null) {
                var conversionFactor = this.state.updatedPlanningUnitList.filter(x => x.id == this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id)[0].multiplier;
                this.setState({
                    conversionFactor
                }, () => {
                    this.getUsageText();
                });
            }
        });
    }
    /**
     * Retrives unit of forecasting unit
     * @param {*} forecastingUnitId Forecasting unit Id for which unit should be reterived
     */
    getForecastingUnitUnitByFUId(forecastingUnitId) {
        const { currentItemConfig } = this.state;
        var forecastingUnit = (this.state.forecastingUnitList.filter(c => c.id == forecastingUnitId));
        if (forecastingUnit.length > 0) {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.unit.id = forecastingUnit[0].unit.id;
        }
        this.setState({
            currentItemConfig
        });
    }
    /**
     * Calculates no of forecasting unit patients
     */
    getNoOfFUPatient() {
        var scenarioId = this.state.selectedScenario;
        var noOfFUPatient;
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
            noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
        } else {
            noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
        }
        this.setState({
            noOfFUPatient
        }, () => {
        })
    }
    /**
     * Function to calculate no of forecasting units required
     */
    getNoFURequired() {
        var usagePeriodId;
        var usageTypeId;
        var usageFrequency;
        var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
        var scenarioId = this.state.selectedScenario;
        var repeatUsagePeriodId;
        var oneTimeUsage;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod != null ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId : "";
            usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency != null ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage;
            }
        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage;
            }
            if (usageTypeId == 2 || (oneTimeUsage != null && oneTimeUsage !== "" && oneTimeUsage.toString() == "false")) {
                usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
            }
            usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
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
                    noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                } else {
                    noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                }
                noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
            }
            if (oneTimeUsage != "true" && oneTimeUsage != true && usageTypeId == 1) {
                if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                    repeatUsagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatUsagePeriod.usagePeriodId;
                } else {
                    repeatUsagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.repeatUsagePeriod.usagePeriodId;
                }
                if (repeatUsagePeriodId != "") {
                    convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == repeatUsagePeriodId))[0].convertToMonth;
                } else {
                    convertToMonth = 0;
                }
            }
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                var noFURequired = oneTimeUsage != "true" && oneTimeUsage != true ? (((this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount != null ? ((this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount).toString().replaceAll(",", "") : (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount) / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
            } else {
                var noFURequired = oneTimeUsage != "true" && oneTimeUsage != true ? (((this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount != null ? ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount).toString().replaceAll(",", "") : (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount) / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
            }
        } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                noFURequired = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            } else {
                noFURequired = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            }
        }
        this.setState({
            noFURequired: (noFURequired != "" && noFURequired != 0 ? noFURequired : 0)
        }, () => {
        });
    }
    /**
     * Function to calculate no of months in usage period
     */
    getNoOfMonthsInUsagePeriod() {
        var usagePeriodId;
        var usageTypeId;
        var usageFrequency;
        var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
        var scenarioId = this.state.selectedScenario;
        var oneTimeUsage;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage;
            }
            if (usageTypeId == 2 || (usageTypeId == 1 && oneTimeUsage != null && oneTimeUsage != "true" && oneTimeUsage != true)) {
                usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
                usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency != null ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
            }
        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage;
            }
            if (usageTypeId == 2 || (usageTypeId == 1 && oneTimeUsage != null && oneTimeUsage != "true" && oneTimeUsage != true)) {
                usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
                usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency != null ? (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
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
                    noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                } else {
                    noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                }
                noOfMonthsInUsagePeriod = oneTimeUsage != "true" ? convertToMonth * usageFrequency * noOfFUPatient : noOfFUPatient;
            }
        } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            } else {
                noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            }
            noOfMonthsInUsagePeriod = noOfFUPatient;
        }
        this.setState({
            noOfMonthsInUsagePeriod: noOfMonthsInUsagePeriod
        }, () => {
        });
    }
    /**
     * Function to build usage text
     */
    getUsageText() {
        try {
            var usageText = '';
            var noOfPersons = '';
            var noOfForecastingUnitsPerPerson = '';
            var usageFrequency = '';
            var selectedText = "";
            var selectedText1 = "";
            var selectedText2 = "";
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                noOfPersons = this.state.currentScenario.fuNode.noOfPersons.toString().replaceAll(",", "");
                noOfForecastingUnitsPerPerson = this.state.currentScenario.fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "");
                usageFrequency = this.state.currentScenario.fuNode.usageFrequency != null ? this.state.currentScenario.fuNode.usageFrequency.toString().replaceAll(",", "") : "";
                if (this.state.addNodeFlag) {
                    selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.parentItem.payload.nodeUnit.id)[0].label.label_en
                } else {
                    selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.parentItem.payload.nodeUnit.id)[0].label.label_en;
                }
                if (this.state.addNodeFlag) {
                    var forecastingUnitUnit = document.getElementById("forecastingUnitUnit");
                    selectedText1 = forecastingUnitUnit.options[forecastingUnitUnit.selectedIndex].text;
                } else {
                    selectedText1 = this.state.unitList.filter(c => c.unitId == this.state.currentScenario.fuNode.forecastingUnit.unit.id)[0].label.label_en;
                }
                if (this.state.currentScenario.fuNode.usageType.id == 2 || (this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true)) {
                    selectedText2 = this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentScenario.fuNode.usagePeriod.usagePeriodId)[0].label.label_en;
                }
            }
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                if (this.state.currentScenario.fuNode.usageType.id == 1) {
                    if (this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true) {
                        var selectedText3 = this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentScenario.fuNode.repeatUsagePeriod.usagePeriodId)[0].label.label_en;
                        usageText = i18n.t('static.usageTemplate.every') + " " + addCommas(noOfPersons) + " " + selectedText.trim() + "" + i18n.t('static.usageTemplate.requires') + " " + addCommas(noOfForecastingUnitsPerPerson) + " " + selectedText1.trim() + "(s), " + " " + addCommas(usageFrequency) + " " + i18n.t('static.tree.timesPer') + " " + selectedText2.trim() + " " + i18n.t('static.tree.for') + " " + (this.state.currentScenario.fuNode.repeatCount != null ? this.state.currentScenario.fuNode.repeatCount : '') + " " + selectedText3.trim();
                    } else {
                        usageText = i18n.t('static.usageTemplate.every') + " " + addCommas(noOfPersons) + " " + selectedText.trim() + "" + i18n.t('static.usageTemplate.requires') + " " + addCommas(noOfForecastingUnitsPerPerson) + " " + selectedText1.trim() + "(s)";
                    }
                } else {
                    usageText = i18n.t('static.usageTemplate.every') + " " + addCommas(noOfPersons) + " " + selectedText.trim() + "" + i18n.t('static.usageTemplate.requires') + " " + addCommas(noOfForecastingUnitsPerPerson) + " " + selectedText1.trim() + "(s) " + i18n.t('static.usageTemplate.every') + " " + addCommas(usageFrequency) + " " + selectedText2.trim() + " indefinitely";
                }
            } else {
                if (this.state.currentScenario.puNode.planningUnit.id != null && this.state.currentScenario.puNode.planningUnit.id != "") {
                    var nodeUnitTxt = this.state.nodeUnitListPlural.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en;
                    if (this.state.addNodeFlag) {
                        var planningUnitId = document.getElementById("planningUnitId");
                        var planningUnit = planningUnitId.options[planningUnitId.selectedIndex].text;
                    } else {
                        var planningUnit = this.state.updatedPlanningUnitList.filter(c => c.id == this.state.currentScenario.puNode.planningUnit.id)[0].label.label_en;
                    }
                    if ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 1) {
                        var sharePu;
                        sharePu = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit;
                        usageText = i18n.t('static.tree.forEach') + " " + nodeUnitTxt.trim() + " " + i18n.t('static.tree.weNeed') + " " + addCommasWith8Decimals(sharePu) + " " + planningUnit;
                    } else {
                        var puPerInterval = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit;
                        usageText = i18n.t('static.tree.forEach') + " " + nodeUnitTxt.trim() + " " + i18n.t('static.tree.weNeed') + " " + addCommasWith8Decimals(puPerInterval) + " " + planningUnit + " " + i18n.t('static.usageTemplate.every') + " " + this.state.currentScenario.puNode.refillMonths + " " + i18n.t('static.report.month');
                    }
                } else {
                    usageText = "";
                }
            }
        } catch (err) {
        }
        finally {
            this.setState({
                usageText
            }, () => {
            });
        }
    }
    /**
     * Gets the value of a node based on its type.
     * @param {number} nodeTypeId - The ID of the node type.
     * @returns {any} The value of the node.
     */
    getNodeValue(nodeTypeId) {
        if (nodeTypeId == 2 && this.state.currentItemConfig.context.payload.nodeDataMap != null && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario] != null && this.state.currentScenario != null) {
            return this.state.currentScenario.dataValue;
        }
    }
    /**
     * Retrieves notes associated with the current item configuration.
     * @returns {string} The notes associated with the current item configuration.
     */
    getNotes() {
        return this.state.currentScenario.notes;
    }
    /**
     * Reterives forecast method list
     */
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
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                this.setState({
                    forecastMethodList: myResult.filter(x => x.forecastMethodTypeId == 1)
                }, () => {
                })
            }.bind(this);
        }.bind(this)
    }
    /**
     * Reterives unit list for dimension Id 4
     */
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
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
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
    /**
     * Reterives unit list
     */
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
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                this.setState({
                    unitList: myResult,
                    nodeUnitList: myResult.filter(x => x.dimension.id == TREE_DIMENSION_ID && x.active == true)
                }, () => {
                    var nodeUnitListPlural = [];
                    var nodeUnitListForDropdown = [];
                    for (let i = 0; i < this.state.nodeUnitList.length; i++) {
                        nodeUnitListForDropdown.push({ id: this.state.nodeUnitList[i].unitId, name: this.state.nodeUnitList[i].label.label_en })
                        var nodeUnit = JSON.parse(JSON.stringify(this.state.nodeUnitList[i]));
                        nodeUnit.label.label_en = nodeUnit.label.label_en + "(s)";
                        nodeUnitListPlural.push(nodeUnit);
                    }
                    this.setState({ nodeUnitListPlural, nodeUnitListForDropdown })
                })
            }.bind(this);
        }.bind(this)
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
            if (scenarioList.length > 0) {
                for (let i = 0; i < scenarioList.length; i++) {
                    nodeDataMap[scenarioList[i].id] = tempArray;
                    nodeDataMap[scenarioList[i].id][0].nodeDataId = maxNodeDataId;
                    maxNodeDataId++;
                }
            }
            flatList[i].payload.nodeDataMap = nodeDataMap;
            items.push(JSON.parse(JSON.stringify(flatList[i])));
            var findNodeIndex = items.findIndex(n => n.id == flatList[i].id);
            items[findNodeIndex].level = parseInt(parentLevel + 1);
            parentLevel++;
        }
        let { curTreeObj } = this.state;
        if (treeTemplateId != "") {
            var branchTemplateDesc = document.getElementById("branchTemplateId").selectedOptions[0].text;
            var branchTemplateNotes = document.getElementById("branchTemplateNotes").value;
            var notes = "Branch Note for " + branchTemplateDesc + ": " + branchTemplateNotes;
            curTreeObj.notes = curTreeObj.notes != "" ? curTreeObj.notes + " | " + notes : notes;
        }
        this.setState({
            curTreeObj,
            items,
            isBranchTemplateModalOpen: false,
            branchTemplateId: "",
            missingPUList: []
        }, () => {
            this.calculateMOMData(this.state.parentNodeIdForBranch, 2);
        });
    }
    /**
     * Reterives usage period list
     */
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
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                this.setState({
                    usagePeriodList: myResult
                }, () => {
                })
            }.bind(this);
        }.bind(this)
    }
    /**
     * Reterives usage type list
     */
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
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                this.setState({
                    usageTypeList: myResult
                }, () => {
                })
            }.bind(this);
        }.bind(this)
    }
    /**
     * Filters the usage template list based on tracer category ID and forecasting unit ID.
     * @param {number} tracerCategoryId - The ID of the tracer category.
     * @param {number} forecastingUnitId - The ID of the forecasting unit.
     */
    filterUsageTemplateList(tracerCategoryId, forecastingUnitId) {
        var usageTemplateList = [];
        if (forecastingUnitId > 0) {
            usageTemplateList = this.state.usageTemplateListAll.filter(c => c.forecastingUnit.id == forecastingUnitId);
        }
        else if (tracerCategoryId != "" && tracerCategoryId != null) {
            usageTemplateList = this.state.usageTemplateListAll.filter(c => c.tracerCategory.id == tracerCategoryId);
        } else {
            usageTemplateList = this.state.usageTemplateListAll;
        }
        this.setState({
            usageTemplateList
        }, () => {
        });
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
        if (this.state.isChanged == true || this.state.isTreeDataChanged == true || this.state.isScenarioChanged == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }
    /**
     * Calls multiple function on component mount
     */
    componentDidMount() {
        this.setState({
            treeId: this.props.match.params.treeId
        }, () => {
            this.getUsagePeriodList();
            this.getForecastMethodList();
            this.getUnitListForDimensionIdFour();
            this.getUnitList();
            this.getUsageTypeList();
            this.getNodeTyeList();
            this.getDatasetList();
            this.getModelingTypeList();
            this.getRegionList();
            this.procurementAgentList();
            this.getTreeList();
        })
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
            if (tab == 1) {
                if (this.state.treeTabl1El != "") {
                    jexcel.destroy(document.getElementById('tableDiv'), true);
                    if (this.state.treeTabl1El != "") {
                        if (document.getElementById('tableDiv') != null) {
                            jexcel.destroy(document.getElementById('tableDiv'), true);
                        }
                    }
                    else if (this.state.treeTabl2El != "") {
                        jexcel.destroy(document.getElementById('tableDiv2'), true);
                    }
                }
                this.buildTab1Jexcel();
            } else if (tab == 2) {
                if (this.state.treeTabl2El != "") {
                    jexcel.destroy(document.getElementById('tableDiv2'), true);
                    if (this.state.treeTabl2El != "") {
                        if (document.getElementById('tableDiv2') != null) {
                            jexcel.destroy(document.getElementById('tableDiv2'), true);
                        }
                    }
                    else if (this.state.treeTabl1El != "") {
                        jexcel.destroy(document.getElementById('tableDiv1'), true);
                    }
                }
                this.buildTab2Jexcel();
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
     * Handles changes in scenario name and description fields.
     * @param {Object} event - The event object triggered by the change in input fields.
     */
    scenarioChange(event) {
        const { scenario } = this.state;
        if (event.target.name === "scenarioName") {
            scenario.label.label_en = event.target.value;
        }
        if (event.target.name === "scenarioDesc") {
            scenario.notes = event.target.value;
        }
        this.setState({
            idScenarioChanged: true,
            scenario
        });
    }
    /**
     * Handles changes in tree data fields.
     * @param {Object} event - The event object triggered by the change in input fields.
     */
    treeDataChange(event) {
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
            var forecastMethod = {
                id: event.target.value,
                label: {
                    label_en: event.target.value != "" ? this.state.forecastMethodList.filter(x => x.forecastMethodId == event.target.value)[0].label.label_en : ''
                }
            };
            curTreeObj.forecastMethod = forecastMethod;
        }
        if (event.target.name === "treeNotes") {
            curTreeObj.notes = event.target.value;
        }
        this.setState({ curTreeObj, isTreeDataChanged: true }, () => {
        });
    }
    /**
     * Handles changes in data input fields.
     * @param {Event} event - The event object containing information about the data change.
     */
    dataChange(event) {
        var flag = false;
        let { curTreeObj } = this.state;
        let { currentItemConfig } = this.state;
        let { treeTemplate } = this.state;
        var scenarioId = this.state.selectedScenario;
        this.setState({ addNodeError: false })
        if (event.target.name === "branchTemplateId") {
            this.setState({ branchTemplateId: event.target.value }, () => {
                this.getMissingPuListBranchTemplate();
            });
        }
        if (event.target.name === "branchTemplateNotes") {
            this.setState({ branchTemplateNotes: event.target.value });
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
        if (event.target.name == "treeId") {
            var treeId = 0;
            if (event.target.value != null) {
                treeId = event.target.value;
                this.setState({
                    treeId,
                    items: [],
                    selectedScenario: '',
                    selectedScenarioLabel: '',
                    currentScenario: []
                });
            }
            this.getTreeByTreeId(treeId);
        }
        if (event.target.name == "scenarioId") {
            if (event.target.value != "") {
                var scenarioId = event.target.value;
                var scenario = document.getElementById("scenarioId");
                var selectedText = scenario.options[scenario.selectedIndex].text;
                this.setState({
                    selectedScenario: scenarioId,
                    selectedScenarioLabel: selectedText,
                    currentScenario: []
                }, () => {
                    this.callAfterScenarioChange(scenarioId);
                });
            } else {
                this.setState({
                    items: [],
                    selectedScenario: '',
                    selectedScenarioLabel: '',
                    currentScenario: []
                }, () => {
                });
            }
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
                this.buildModelingCalculatorJexcel();
            });
        }
        if (event.target.name === "sharePlanningUnit") {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.sharePlanningUnit = event.target.id === "sharePlanningUnitFalse" ? false : true;
            this.qatCalculatedPUPerVisit(2);
            this.getUsageText();
        }
        if (event.target.name === "refillMonths") {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.refillMonths = event.target.value;
            flag = true;
        }
        if (event.target.name === "puPerVisit") {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit = event.target.value;
            this.getUsageText();
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
                label_en: selectedText,
                label_fr: '',
                label_sp: '',
                label_pr: ''
            }
            currentItemConfig.context.payload.nodeUnit.label = label;
        }
        if (event.target.name === "percentageOfParent") {
            var value = (event.target.value).replaceAll(",", "");
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = value;
            this.state.currentScenario.dataValue = value;
            this.calculateParentValueFromMOM((currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].month);
        }
        if (event.target.name === "nodeValue") {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = (event.target.value).replaceAll(",", "");
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = (event.target.value).replaceAll(",", "");
        }
        if (event.target.name === "notes") {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].notes = event.target.value;
            this.getNotes();
        }
        if (event.target.name === "tracerCategoryId") {
            var fuNode = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode;
            currentItemConfig.context.payload.nodeDataMap[scenarioId][0].fuNode.forecastingUnit.tracerCategory.id = event.target.value;
            this.filterUsageTemplateList(event.target.value, 0);
        }
        if (event.target.name === "noOfPersons") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons = (event.target.value).replaceAll(",", "");
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "lagInMonths") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.lagInMonths = event.target.value;
        }
        if (event.target.name === "forecastingUnitPerPersonsFC") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson = (event.target.value).replaceAll(",", "");
            if (currentItemConfig.context.payload.nodeType.id == 4 && (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id == 1) {
                this.getNoOfFUPatient();
            }
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "oneTimeUsage") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage = event.target.value;
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "repeatUsagePeriodId") {
            var fuNode = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode;
            var repeatUsagePeriod = document.getElementById("repeatUsagePeriodId");
            var selectedText = repeatUsagePeriod.options[repeatUsagePeriod.selectedIndex].text;
            var repeatUsagePeriod = {
                usagePeriodId: event.target.value,
                label: {
                    label_en: selectedText
                }
            }
            fuNode.repeatUsagePeriod = repeatUsagePeriod;
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode = fuNode;
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "repeatCount") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount = (event.target.value).replaceAll(",", "");
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "usageFrequencyCon" || event.target.name === "usageFrequencyDis") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency = (event.target.value).replaceAll(",", "");
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "usagePeriodIdCon" || event.target.name === "usagePeriodIdDis") {
            var fuNode = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode;
            var usagePeriod = event.target.name === "usagePeriodIdCon" ? document.getElementById("usagePeriodIdCon") : document.getElementById("usagePeriodIdDis");
            var selectedText = usagePeriod.options[usagePeriod.selectedIndex].text;
            var usagePeriod = {
                usagePeriodId: event.target.value,
                label: {
                    label_en: selectedText
                }
            }
            fuNode.usagePeriod = usagePeriod;
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode = fuNode;
            this.getNoOfMonthsInUsagePeriod();
            this.getNoFURequired();
            this.getUsageText();
        }
        if (event.target.name === "usageTypeIdFU") {
            if (event.target.value == 2 && currentItemConfig.context.payload.nodeType.id == 4) {
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons = 1;
            }
            var fuNode = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode;
            var usageTypeIdFU = document.getElementById("usageTypeIdFU");
            var selectedText = usageTypeIdFU.options[usageTypeIdFU.selectedIndex].text;
            var usageType = {
                id: event.target.value,
                label: {
                    label_en: selectedText
                }
            }
            fuNode.usageType = usageType;
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode = fuNode;
        }
        if (event.target.name === "planningUnitIdFU") {
            this.setState({ tempPlanningUnitId: event.target.value });
        }
        if (event.target.name === "planningUnitId") {
            this.setState({
                calculateAllScenario: true
            })
            if (event.target.value != "") {
                var pu = (this.state.planningUnitList.filter(c => c.id == event.target.value))[0];
                var scenarioList = this.state.scenarioList;
                for (var i = 0; i < scenarioList.length; i++) {
                    try {
                        (currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id])[0].puNode.planningUnit.unit.id = pu.unit.id;
                        (currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id])[0].puNode.planningUnit.id = event.target.value;
                        (currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id])[0].puNode.planningUnit.multiplier = pu.multiplier;
                        (currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id])[0].isPUMappingCorrect = 1;
                    } catch (error) { }
                }
                currentItemConfig.context.payload.label = JSON.parse(JSON.stringify(pu.label));
            } else {
                var scenarioList = this.state.scenarioList;
                for (var i = 0; i < scenarioList.length; i++) {
                    try {
                        (currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id])[0].puNode.planningUnit.unit.id = '';
                        (currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id])[0].puNode.planningUnit.id = '';
                        (currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id])[0].puNode.planningUnit.multiplier = '';
                        (currentItemConfig.context.payload.nodeDataMap[scenarioList[i].id])[0].isPUMappingCorrect = 0;
                    } catch (error) { }
                }
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
        if (event.target.name != "treeId" && event.target.name != "datasetId" && event.target.name != "scenarioId" && event.target.name != "monthPicker") {
            this.setState({
                isChanged: true
            })
        }
        if (event.target.name != "treeId") {
            this.setState({
                currentItemConfig,
                currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0]
            }, () => {
                if (flag) {
                    if (event.target.name === "planningUnitId") {
                        this.calculatePUPerVisit(false);
                    } else if (event.target.name === "refillMonths") {
                        this.calculatePUPerVisit(true);
                        this.qatCalculatedPUPerVisit(0);
                        this.getUsageText();
                    } else { }
                }
            });
        }
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
            // cursorItem: cursorParent
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
     * Renders node details and modeling details tab
     * @returns {JSX.Element} - Node details and modeling data.
     */
    tabPane1() {
        return (
            <>
                <TabPane tabId="1">
                    <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DIMENSION') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                    </div>
                </TabPane>
                <TabPane tabId="2">
                    <div id="tableDiv2" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_DIMENSION') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                    </div>
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
     * Handles the change of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthChange1 = (year, month) => {
        var month = parseInt(month) < 10 ? "0" + month : month
        var date = year + "-" + month + "-" + "01"
        let { currentItemConfig } = this.state;
        var updatedMonth = date;
        var nodeDataMap = (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0];
        nodeDataMap.month = updatedMonth;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0] = nodeDataMap;
        this.setState({ currentItemConfig, currentScenario: nodeDataMap }, () => {
        });
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthDissmis1 = (value) => {
        let month = value.year + '-' + value.month + '-01';
        this.calculateParentValueFromMOM(month);
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
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    handleClickMonthBox2 = (e) => {
        this.pickAMonth2.current.show()
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
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    handleClickMonthBox6 = (e) => {
        this.pickAMonth6.current.show()
    }
    /**
     * Handles the change of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthChange2 = (year, month) => {
    }
    /**
     * Handles the change of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthChange3 = (year, month) => {
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthDissmis3 = (value, type) => {
        var date = value.year + "-" + value.month + "-" + "01"
        this.updateTreeData(date);
        if (moment(date).format("YYYY-MM") >= moment(this.state.forecastStartDate).format("YYYY-MM") && moment(date).format("YYYY-MM") <= moment(this.state.forecastStopDate).format("YYYY-MM")) {
            this.setState({ singleValue2: value, }, () => {
            })
        } else {
            if (type == 1) {
                alert("Please select date within forecast range");
            }
        }
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    handleClickMonthBox3 = (e) => {
        this.pickAMonth3.current.show()
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
        var date = year + "-" + month + "-01";
        var currentCalculatorStartValue = this.getMomValueForDateRange(date);
        this.setState({
            currentCalculatorStartDate: date, currentCalculatorStartValue,
            firstMonthOfTarget: date,
            actualOrTargetValueList: [],
            isCalculateClicked: 1
        }, () => {
            this.buildModelingCalculatorJexcel();
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
    /**
     * Handles the change of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthChange5 = (year, month) => {
        var date = year + "-" + month + "-01";
        var stopDate = this.state.currentCalculatorStopDate;
        var mStart = moment(date);
        var mEnd = moment(stopDate);
        stopDate = mStart.isSameOrBefore(mEnd) ? stopDate : "";
        var currentCalculatorStartValue = this.getMomValueForDateRange(date);
        var stopMinDate = { year: year, month: month }
        this.setState({
            stopMinDate: stopMinDate,
            currentCalculatorStartDate: date,
            currentCalculatorStopDate: stopDate,
            currentCalculatorStartValue
        }, () => {
            if (mStart.isSameOrBefore(mEnd)) {
                this.dateChangeCalculations();
            }
        });
    }

    /**
     * Based on Start and Target Date change calculation different calculations for Modeling Calculator
     */
    dateChangeCalculations() {
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
    }

    /**
     * Handles the change of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthChange6 = (year, month) => {
        var date = year + "-" + month + "-01";
        var startDate = this.state.currentCalculatorStartDate;
        var mStart = moment(startDate);
        var mEnd = moment(date);
        date = mStart.isSameOrBefore(mEnd) ? date : "";
        this.setState({
            currentCalculatorStopDate: date,
        }, () => {
            if (mStart.isSameOrBefore(mEnd)) {
                this.dateChangeCalculations();
            }
        });
    }

    /**
     * Updates the data values displayed in the tree based on the selected scenario and date.
     * @param {Date} date - The date for which the data values need to be updated.
     */
    updateTreeData(date) {
        var items = this.state.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList != null) {
                var nodeDataModelingMap = items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList.filter(x => moment(x.month).format('YYYY-MM') == moment(date).format('YYYY-MM'));
                if (nodeDataModelingMap.length > 0) {
                    if (nodeDataModelingMap[0].calculatedValue != null && nodeDataModelingMap[0].endValue != null) {
                        if (items[i].payload.nodeType.id == 5) {
                            (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = nodeDataModelingMap[0].calculatedMmdValue != null ? nodeDataModelingMap[0].calculatedMmdValue.toString() : '';
                        } else {
                            (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = nodeDataModelingMap[0].calculatedValue.toString();
                        }
                        (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = nodeDataModelingMap[0].endValue.toString();
                    } else {
                        (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = "0";
                        (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = "0";
                    }
                } else {
                    (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = "0";
                    (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = "0";
                }
            } else {
                (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = "0";
                (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = "0";
            }
            if (items[i].payload.nodeType.id == 4) {
                var fuPerMonth, totalValue, usageFrequency, convertToMonth;
                var noOfForecastingUnitsPerPerson = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfForecastingUnitsPerPerson;
                if ((items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 2 || ((items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage != "true" && (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage != true)) {
                    usageFrequency = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageFrequency;
                    var usagePeriodConvertToMonth = convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usagePeriod.usagePeriodId));
                    convertToMonth = usagePeriodConvertToMonth.length > 0 ? usagePeriodConvertToMonth[0].convertToMonth : '';
                }
                if ((items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 2) {
                    fuPerMonth = ((noOfForecastingUnitsPerPerson / usageFrequency) * convertToMonth);
                    totalValue = fuPerMonth * (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue;
                } else {
                    var noOfPersons = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfPersons;
                    if ((items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage == "true" || (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage == true) {
                        fuPerMonth = noOfForecastingUnitsPerPerson / noOfPersons;
                        totalValue = fuPerMonth * (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue;
                    } else {
                        fuPerMonth = ((noOfForecastingUnitsPerPerson / noOfPersons) * usageFrequency * convertToMonth);
                        totalValue = fuPerMonth * (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue;
                    }
                }
                (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuPerMonth = fuPerMonth;
            }
            if (items[i].payload.nodeType.id == 5) {
                var findNodeIndexFU = items.findIndex(n => n.id == items[i].parent);
                var forecastingUnitId = (items[findNodeIndexFU].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.id;
                var planningUnitId = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.id;
                var planningUnitList = [];
                if (this.state.programId != null && this.state.programId != "") {
                    planningUnitList = this.state.programDataListForPuCheck.filter(c => c.id == this.state.programId)[0].programData.planningUnitList;
                    var planningUnitListFilter = planningUnitList.filter(c => c.planningUnit.id == planningUnitId);
                    if (planningUnitListFilter.length > 0 && planningUnitListFilter[0].planningUnit.forecastingUnit.id == forecastingUnitId) {
                        (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].isPUMappingCorrect = 1
                    } else {
                        (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].isPUMappingCorrect = 0
                    }
                }
            }
        }
        this.setState({
            items
        }, () => {
            this.buildTab1Jexcel();
        })
    }
    /**
     * Renders the create tree screen.
     * @returns {JSX.Element} - Create Tree screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
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
        let treeLevel = this.state.items.length;
        const treeLevelItems = []
        var treeLevels = this.state.curTreeObj.forecastMethod.id != "" && this.state.curTreeObj.levelList != undefined ? this.state.curTreeObj.levelList : [];
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
        return <div className="">
            <Prompt
                when={this.state.isChanged == true || this.state.isTreeDataChanged == true || this.state.isScenarioChanged == true}
                message={i18n.t("static.dataentry.confirmmsg")}
            />
            <AuthenticationServiceComponent history={this.props.history} />
            <h5 className={this.state.color} id="div2">
                {i18n.t(this.state.message, { entityname })}</h5>
            <Row>
                <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                    <Card className="mb-lg-0">
                        <div className="pb-lg-0">
                            <div className="Card-header-reporticon pb-1">
                                <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                                <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                                <span className="compareAndSelect-larrowText" style={{ cursor: 'pointer' }} onClick={this.cancelClicked}> {i18n.t('static.common.backTo')} <small className="supplyplanformulas">{i18n.t('static.listTree.manageTreeTreeList')}</small></span>
                                <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')}  <a href="/#/validation/productValidation" className="supplyplanformulas">{i18n.t('static.dashboard.productValidation')}</a> {i18n.t('static.tree.or')} <a href="/#/validation/modelingValidation" className="supplyplanformulas">{i18n.t('static.dashboard.modelingValidation')}</a> </span>
                            </div>
                        </div>
                        <div className="row pt-lg-0 pr-lg-4">
                            <div className="col-md-12">
                                <a style={{ float: 'right' }}>
                                    <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                                </a>
                            </div>
                        </div>
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
                                                                <option value="">{i18n.t('static.mt.selectProgram')}</option>
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
                                                        </InputGroup>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3 pl-lg-0">
                                                        <Label htmlFor="languageId">{i18n.t('static.whatIf.scenario')}</Label>
                                                        <InputGroup>
                                                            <Input
                                                                type="select"
                                                                name="scenarioId"
                                                                id="scenarioId"
                                                                bsSize="sm"
                                                                onChange={(e) => { this.dataChange(e) }}
                                                                required
                                                                value={this.state.selectedScenario}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {scenarios}
                                                            </Input>
                                                        </InputGroup>
                                                    </FormGroup>
                                                    <Picker
                                                        ref={this.pickAMonth3}
                                                        id="monthPicker"
                                                        name="monthPicker"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                        value={this.state.singleValue2}
                                                        key={JSON.stringify(this.state.singleValue2)}
                                                        lang={pickerLang.months}
                                                    >
                                                        <MonthBox value={this.makeText(singleValue2)} onClick={(e) => { this.handleClickMonthBox3(e) }} />
                                                    </Picker>
                                                </Row>
                                            </div>
                                        </CardBody>
                                        <div style={{ display: !this.state.loading ? "block" : "none" }} class="sample">
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
                                            {/* <Provider>
                                                <div className="placeholder TreeTemplateHeight" style={{ clear: 'both', marginTop: '25px', border: '1px solid #a7c6ed' }} >
                                                    <OrgDiagram centerOnCursor={true} config={config} onCursorChanged={this.onCursoChanged} />
                                                </div>
                                            </Provider> */}
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
                            </div>
                        </CardBody>
                    </Card></Col></Row>
            <Modal isOpen={this.state.showGuidanceModelingTransfer}
                className={'modal-lg ' + this.props.className} >
                <ModalHeader toggle={() => this.toggleShowGuidanceModelingTransfer()} className="ModalHead modal-info-Headher">
                    <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                </ModalHeader>
                <div>
                    <ModalBody className="ModalBodyPadding">
                        <div dangerouslySetInnerHTML={{
                            __html: localStorage.getItem('lang') == 'en' ?
                                showguidanceModelingTransferEn :
                                localStorage.getItem('lang') == 'fr' ?
                                    showguidanceModelingTransferFr :
                                    localStorage.getItem('lang') == 'sp' ?
                                        showguidanceModelingTransferSp :
                                        showguidanceModelingTransferPr
                        }} />
                    </ModalBody>
                </div>
            </Modal>
            <Modal isOpen={this.state.showGuidanceNodeData}
                className={'modal-lg ' + this.props.className} >
                <ModalHeader toggle={() => this.toggleShowGuidanceNodeData()} className="ModalHead modal-info-Headher">
                    <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                </ModalHeader>
                <div>
                    <ModalBody className="ModalBodyPadding">
                        <div dangerouslySetInnerHTML={{
                            __html: localStorage.getItem('lang') == 'en' ?
                                showguidanceAddEditNodeDataEn :
                                localStorage.getItem('lang') == 'fr' ?
                                    showguidanceAddEditNodeDataFr :
                                    localStorage.getItem('lang') == 'sp' ?
                                        showguidanceAddEditNodeDataSp :
                                        showguidanceAddEditNodeDataPr
                        }} />
                    </ModalBody>
                </div>
            </Modal>
            <Modal isOpen={this.state.showGuidance}
                className={'modal-lg ' + this.props.className} >
                <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                    <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                </ModalHeader>
                <div>
                    <ModalBody className="ModalBodyPadding">
                        <div dangerouslySetInnerHTML={{
                            __html: localStorage.getItem('lang') == 'en' ?
                                showguidanceBuildTreeEn :
                                localStorage.getItem('lang') == 'fr' ?
                                    showguidanceBuildTreeFr :
                                    localStorage.getItem('lang') == 'sp' ?
                                        showguidanceBuildTreeSp :
                                        showguidanceBuildTreePr
                        }} />
                    </ModalBody>
                </div>
            </Modal>
            <Modal isOpen={this.state.openAddNodeModal}
                className={'modal-xl '} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>{i18n.t('static.tree.Add/EditNode')}</strong>
                    {<div className="HeaderNodeText"> {
                        <>
                            <Popover placement="top" isOpen={this.state.popoverOpenSenariotree} target="Popover1" trigger="hover" toggle={this.toggleSenariotree}>
                                <PopoverBody>{i18n.t('static.tooltip.scenario')}</PopoverBody>
                            </Popover>
                            <span htmlFor="currencyId">{i18n.t('static.whatIf.scenario')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={this.toggleSenariotree} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></span>
                            <b className="supplyplanformulas ScalingheadTitle">{this.state.selectedScenarioLabel}</b>
                        </>
                    }</div>}
                    {<div className="HeaderNodeText"> {
                        this.state.currentItemConfig.context.payload.nodeType.id == 2 ? <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#20a8d8' }}></i> :
                            (this.state.currentItemConfig.context.payload.nodeType.id == 3 ? <i class="fa fa-percent " style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? <i class="fa fa-cube" style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                    (this.state.currentItemConfig.context.payload.nodeType.id == 5 ? <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                        (this.state.currentItemConfig.context.payload.nodeType.id == 1 ? <i><img src={AggregationNode} className="AggregationNodeSize" /></i> : "")
                                    )))}
                        <b className="supplyplanformulas ScalingheadTitle">{this.state.currentItemConfig.context.payload.label.label_en}</b></div>}
                    <Button size="md" onClick={() => {
                        if (this.state.isChanged == true || this.state.isTreeDataChanged == true || this.state.isScenarioChanged == true) {
                            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
                            if (cf == true) {
                                this.setState({
                                    openAddNodeModal: false, cursorItem: 0, isChanged: false,
                                    highlightItem: 0, activeTab1: new Array(3).fill('1'),
                                    modelingTabChanged: false
                                })
                            } else {
                            }
                        } else {
                            this.setState({
                                openAddNodeModal: false, cursorItem: 0, isChanged: false,
                                highlightItem: 0, activeTab1: new Array(3).fill('1'),
                                modelingTabChanged: false
                            })
                        }
                    }
                    }
                        color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }}
                        className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
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
                                <NavItem style={{ display: !this.state.currentScenario.extrapolation || this.state.currentItemConfig.context.payload.nodeType.id != 2 ? 'block' : 'none' }}>
                                    <NavLink
                                        active={this.state.activeTab1[0] === '2'}
                                        onClick={() => { this.toggleModal(0, '2'); }}
                                    >
                                        {i18n.t('static.tree.Modeling/Transfer')}
                                    </NavLink>
                                </NavItem>
                                <NavItem style={{ display: this.state.currentScenario.extrapolation && this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'block' : 'none' }}>
                                    <NavLink
                                        active={this.state.activeTab1[0] === '3'}
                                        onClick={() => { this.toggleModal(0, '3'); }}
                                    >
                                        Extrapolation
                                    </NavLink>
                                </NavItem>
                                <div style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 2 ? "block" : "none" }}>
                                    <div style={{ marginLeft: '34px', marginTop: '8px' }}>
                                        <Input
                                            className="form-check-input checkboxMargin"
                                            type="checkbox"
                                            id="extrapolate"
                                            name="extrapolate"
                                            checked={this.state.currentScenario.extrapolation}
                                            onClick={(e) => { this.extrapolate(e); }}
                                        />
                                        <Label
                                            className="form-check-label"
                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                            <b>{i18n.t('static.tree.extrapolate')}</b>
                                        </Label>
                                    </div>
                                </div>
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
        </div >
    }
}
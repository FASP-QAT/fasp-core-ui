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
            calculateAllScenario: false,
            treeTabl1El: '',
            treeTabl2El: '',
            isTabDataChanged: false
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
        this.updateTab1Data = this.updateTab1Data.bind(this);
        this.updateTab2Data = this.updateTab2Data.bind(this);
        this.updateNodeInfoInJson = this.updateNodeInfoInJson.bind(this);
        this.updateState = this.updateState.bind(this);
        this.saveTreeData = this.saveTreeData.bind(this);
        this.onChangeTab1Data = this.onChangeTab1Data.bind(this);
        this.onChangeTab2Data = this.onChangeTab2Data.bind(this);
        this.resetTab1Data = this.resetTab1Data.bind(this);
        this.resetTab2Data = this.resetTab2Data.bind(this);
        this.onChangePageTab1 = this.onChangePageTab1.bind(this);
        this.onChangePageTab2 = this.onChangePageTab2.bind(this);
        this.checkValidationTab1 = this.checkValidationTab1.bind(this);
        this.checkValidationTab2 = this.checkValidationTab2.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
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
        var forecastingUnitListForDropdown = [];
        var planningUnitListForDropdown = [];
        var tracerCategoryList = [];
        var tracerCategoryListForDropdown = [];
        planningUnitList.map(item => {
            forecastingUnitList.push({
                label: item.planningUnit.forecastingUnit.label, id: item.planningUnit.forecastingUnit.id,
                unit: item.planningUnit.forecastingUnit.unit,
                tracerCategory: item.planningUnit.forecastingUnit.tracerCategory
            })
            forecastingUnitListForDropdown.push({
                id: item.planningUnit.forecastingUnit.id,
                name: getLabelText(item.planningUnit.forecastingUnit.label, this.state.lang)
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
            planningUnitListForDropdown.push({
                id: item.planningUnit.id,
                name: getLabelText(item.planningUnit.label, this.state.lang)
            })
        })
        planningUnitList.map(item => {
            tracerCategoryList.push({
                label: item.planningUnit.forecastingUnit.tracerCategory.label, tracerCategoryId: item.planningUnit.forecastingUnit.tracerCategory.id
            })
            tracerCategoryListForDropdown.push({
                id: item.planningUnit.forecastingUnit.tracerCategory.id,
                name: getLabelText(item.planningUnit.forecastingUnit.tracerCategory.label, this.state.lang)
            })
        })
        forecastingUnitList = [...new Map(forecastingUnitList.map(v => [v.id, v])).values()];
        tracerCategoryList = [...new Map(tracerCategoryList.map(v => [v.tracerCategoryId, v])).values()];
        forecastingUnitListForDropdown = [...new Map(forecastingUnitListForDropdown.map(v => [v.id, v])).values()];
        tracerCategoryListForDropdown = [...new Map(tracerCategoryListForDropdown.map(v => [v.id, v])).values()];
        var forecastingUnitListNew = JSON.parse(JSON.stringify(forecastingUnitList));
        let forecastingUnitMultiList = forecastingUnitListNew.length > 0
            && forecastingUnitListNew.map((item, i) => {
                return ({ value: item.id, label: getLabelText(item.label, this.state.lang) + " | " + item.id })
            }, this);
        this.setState({
            forecastingUnitMultiList,
            tracerCategoryList,
            forecastingUnitList,
            tracerCategoryListForDropdown,
            forecastingUnitListForDropdown,
            planningUnitListForDropdown,
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
     * Updates a specific parameter in the component state and triggers additional actions based on the updated parameter.
     * @param {string} parameterName - The name of the parameter to be updated.
     * @param {*} value - The new value of the parameter.
     */
    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        }, () => {
            var items = this.state.items;
            if (parameterName == 'currentItemConfig') {
                if (value.context.id == "" || value.context.id == null) {
                    this.onAddButtonClick(this.state.currentItemConfig, false, null);
                } else {
                    var findNodeIndex = items.findIndex(n => n.id == value.context.id);
                    items[findNodeIndex] = value.context;
                    this.setState({ items }, () => {
                        this.saveTreeData(true, false);
                    })
                }
            }
            if (parameterName == 'nodeId' && (value != null && value != 0)) {
                var nodeDataMomList = this.state.nodeDataMomList;
                if (nodeDataMomList.length > 0) {
                    for (let i = 0; i < nodeDataMomList.length; i++) {
                        var nodeId = nodeDataMomList[i].nodeId;
                        var nodeDataMomListForNode = nodeDataMomList[i].nodeDataMomList;
                        var node = items.filter(n => n.id == nodeId)[0];
                        (node.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataMomList = nodeDataMomListForNode;
                        var findNodeIndex = items.findIndex(n => n.id == nodeId);
                        items[findNodeIndex] = node;
                    }
                }
                this.setState({ items })
            }
            if (parameterName == 'type' && (value == 0 || value == 1) && (!this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].hasOwnProperty("extrapolation") || this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != undefined && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != "true")) {
                // if (this.state.currentItemConfig.context.payload.nodeType.id == 1 || this.state.currentItemConfig.context.payload.nodeType.id == 2) {
                //     this.setState({ momList: this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList }, () => {
                //         if (this.state.modelingEl != null && this.state.modelingEl != undefined && this.state.modelingEl != "") {
                //             this.filterScalingDataByMonth(this.state.scalingMonth.year + "-" + this.state.scalingMonth.month + "-01", this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList);
                //         }
                //         if (value == 1 || (value == 0 && this.state.showMomData)) {
                //             this.buildMomJexcel();
                //         }
                //     });
                // } else {
                //     this.setState({ momListPer: this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList }, () => {
                //         if (this.state.modelingEl != null && this.state.modelingEl != undefined && this.state.modelingEl != "") {
                //             this.filterScalingDataByMonth(this.state.scalingMonth.year + "-" + this.state.scalingMonth.month + "-01", this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList);
                //         }
                //         if (value == 1 || (value == 0 && this.state.showMomDataPercent)) {
                //             this.buildMomJexcelPercent();
                //         }
                //     });
                // }
            }
            if (parameterName == "nodeDataMomList") {
                this.saveTreeData(false, false);
            }
        })
    }
    /**
     * Function to update the node info in json
     * @param {*} currentItemConfig The item configuration object that needs to be updated
     */
    updateNodeInfoInJson(currentItemConfig) {
        return new Promise((resolve, reject) => {
            var nodes = this.state.items;
            if (currentItemConfig.context.level == 0 && currentItemConfig.context.newTree) {
                currentItemConfig.context.newTree = false;
            }
            if (currentItemConfig.context.payload.nodeType.id == 4) {
                var tracerCategoryId = currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.tracerCategory.id;
                if (tracerCategoryId == "" || tracerCategoryId == undefined || tracerCategoryId == null) {
                    var fu = this.state.forecastingUnitList.filter(x => x.id == currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.id);
                    if (fu.length > 0) {
                        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.tracerCategory.id = fu[0].tracerCategory.id;
                    }
                }
            }
            if (this.state.deleteChildNodes) {
                var childNodes = nodes.filter(c => c.parent == currentItemConfig.context.id);
                childNodes.map(item => {
                    nodes = nodes.filter(c => !c.sortOrder.startsWith(item.sortOrder))
                })
            }
            var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.context.id);
            nodes[findNodeIndex] = currentItemConfig.context;
            if (currentItemConfig.context.payload.nodeType.id == 4) {
                var puNodes = nodes.filter(c => c.parent == currentItemConfig.context.id);
                for (var puN = 0; puN < puNodes.length; puN++) {
                    var refillMonths = "";
                    var puPerVisit = "";
                    if (puNodes[puN].payload.nodeDataMap[this.state.selectedScenario][0].puNode != null) {
                        var pu = puNodes[puN].payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit;
                        var findNodeIndexPu = nodes.findIndex(n => n.id == puNodes[puN].id);
                        var puNode = nodes[findNodeIndexPu].payload.nodeDataMap[this.state.selectedScenario][0].puNode;
                        if (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.usageType.id == 2) {
                            var refillMonths = 1;
                            puPerVisit = parseFloat(((currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / pu.multiplier).toFixed(8);
                            puNode.refillMonths = refillMonths;
                            puNode.puPerVisit = puPerVisit;
                        } else {
                            puPerVisit = parseFloat(this.state.noFURequired / pu.multiplier).toFixed(8);
                            puNode.puPerVisit = puPerVisit;
                        }
                        nodes[findNodeIndexPu].payload.nodeDataMap[this.state.selectedScenario][0].puNode = puNode;
                    }
                }
            }
            const { curTreeObj } = this.state;
            var treeLevelList = curTreeObj.levelList;
            if (currentItemConfig.context.level == 0 && treeLevelList != undefined) {
                var levelListFiltered = treeLevelList.findIndex(c => c.levelNo == parseInt(currentItemConfig.context.level));
                if (levelListFiltered != -1) {
                    var unitId = currentItemConfig.context.payload.nodeType.id == 4 ? currentItemConfig.parentItem.payload.nodeUnit.id : currentItemConfig.context.payload.nodeUnit.id;
                    var label = {}
                    if (unitId != "" && unitId != null) {
                        label = this.state.nodeUnitList.filter(c => c.unitId == unitId)[0].label;
                    }
                    treeLevelList[levelListFiltered].unit = {
                        id: unitId != "" && unitId != null ? parseInt(unitId) : null,
                        label: label
                    }
                }
                curTreeObj.levelList = treeLevelList;
            }
            this.setState({
                items: nodes,
                isSubmitClicked: false,
                curTreeObj,
                isTabDataChanged: false
            }, () => {
                this.calculateMOMData(currentItemConfig.context.id, 0);
                resolve();
            });
        });
    }
    /**
     * Saves the updated tree data to the database.
     * @param {boolean} flag - Flag indicating whether to perform additional actions after saving the tree data.
     * @param {boolean} collapseFlag - Flag indicating whether to collapse the component while saving the tree data.
     */
    saveTreeData(flag, collapseFlag) {
        this.setState({ loading: collapseFlag ? false : true }, () => {
            var curTreeObj = this.state.curTreeObj;
            curTreeObj.generateMom = 0;
            let { treeData } = this.state;
            let { dataSetObj } = this.state;
            var items = this.state.items;
            for (let i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.payload.nodeType.id == 4 || item.payload.nodeType.id == 5) {
                    item.isVisible = true;
                }
            }
            let tempProgram = JSON.parse(JSON.stringify(dataSetObj))
            var programData = tempProgram.programData;
            programData.treeList = treeData;
            curTreeObj.scenarioList = this.state.scenarioList;
            if (items.length > 0) {
                curTreeObj.tree.flatList = items;
            }
            curTreeObj.lastModifiedDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
            if (curTreeObj.lastModifiedBy != undefined) {
                curTreeObj.lastModifiedBy.userId = AuthenticationService.getLoggedInUserId();
                curTreeObj.lastModifiedBy.username = AuthenticationService.getLoggedInUsername();
            } else {
                curTreeObj.lastModifiedBy = {
                    "userId": AuthenticationService.getLoggedInUserId(),
                    "username": AuthenticationService.getLoggedInUsername()
                }
            }
            var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
            treeData[findTreeIndex] = curTreeObj;
            programData.treeList = treeData;
            programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
            tempProgram.programData = programData;
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                this.hideSecondComponent()
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var programTransaction = transaction.objectStore('datasetData');
                var programRequest = programTransaction.put(tempProgram);
                transaction.oncomplete = function (event) {
                    db1 = e.target.result;
                    var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                    var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                    var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.programId);
                    datasetDetailsRequest.onsuccess = function (e) {
                        var datasetDetailsRequestJson = datasetDetailsRequest.result;
                        datasetDetailsRequestJson.changed = 1;
                        var programQPLDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                        programQPLDetailsRequest1.onsuccess = function (event) {
                            this.setState({
                                loading: false,
                                message: i18n.t("static.mt.dataUpdateSuccess"),
                                color: "green",
                                isChanged: false,
                                isTreeDataChanged: false,
                                isScenarioChanged: false
                            }, () => {
                                for (let i = 0; i < items.length; i++) {
                                    var item = items[i];
                                    if (this.state.hideFUPUNode) {
                                        if (item.payload.nodeType.id == 4 || item.payload.nodeType.id == 5) {
                                            item.isVisible = false;
                                        }
                                    } else if (this.state.hidePUNode && item.payload.nodeType.id == 5) {
                                        item.isVisible = false;
                                    }
                                }
                                this.handleAMonthDissmis3(this.state.singleValue2, 0);
                                this.hideSecondComponent();
                                if (flag) {
                                    this.calculateMOMData(0, 2);
                                }
                            });
                        }.bind(this)
                        programQPLDetailsRequest1.onerror = function (event) {
                            this.setState({
                                loading: false,
                                message: 'Error occured.',
                                color: "red",
                            });
                        }.bind(this)
                    }.bind(this);
                    datasetDetailsRequest.onerror = function (event) {
                        this.setState({
                            loading: false,
                            message: 'Error occured.',
                            color: "red",
                        }, () => {
                            this.hideSecondComponent();
                        });
                    }.bind(this)
                }.bind(this);
                transaction.onerror = function (event) {
                    this.setState({
                        loading: false,
                        message: 'Error occured.',
                        color: "red",
                    }, () => {
                        this.hideSecondComponent();
                    });
                }.bind(this);
            }.bind(this);
        });
    }
    /**
     * Retrieves data from the payload based on the provided item configuration and type.
     * @param {Object} itemConfig - The configuration object of the item
     * @param {number} type - The type of data retrieval operation
     * @returns {any} - The retrieved data
     */
    getPayloadData(itemConfig, type) {
        var data = [];
        data = itemConfig.payload.nodeDataMap;
        var scenarioId = document.getElementById('scenarioId').value;
        if (data != null && data[scenarioId] != null && (data[scenarioId])[0] != null) {
            if (type == 4 || type == 5 || type == 6) {
                var result = false;
                if (itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataModelingList.length > 0) {
                    var nodeDataModelingList = itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataModelingList;
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
                                        var nodeDataModelingList = arr[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataModelingList;
                                        if (nodeDataModelingList.length > 0) {
                                            var nodedata = nodeDataModelingList.filter(x => x.transferNodeDataId == itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId)[0];
                                            if (nodedata != null && nodedata != "") {
                                                result = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } if (type == 6) {
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
                                        var nodeDataModelingList = arr[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataModelingList;
                                        if (nodeDataModelingList.length > 0) {
                                            var nodedata = nodeDataModelingList.filter(x => x.transferNodeDataId == itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId)[0];
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
                                    var nodeDataModelingList = arr[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataModelingList;
                                    if (nodeDataModelingList.length > 0) {
                                        var nodedata = nodeDataModelingList.filter(x => x.transferNodeDataId == itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId)[0];
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
            }
            else {
                if (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2) {
                    if (type == 1) {
                        return addCommasTwoDecimal(Number((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue).toFixed(2));
                    } else if (type == 3) {
                        var childList = this.state.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                        if (childList.length > 0) {
                            var sum = 0;
                            childList.map(c => {
                                sum += Number((c.payload.nodeDataMap[scenarioId])[0].displayDataValue)
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
                            var usageType = (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
                            var val = (itemConfig.payload.nodeDataMap[scenarioId])[0].fuPerMonth;
                            var val1 = "/" + 'Month';
                            var val2 = ", ";
                            if (usageType == 1) {
                                var usagePeriodId;
                                var usageTypeId;
                                var usageFrequency;
                                var nodeTypeId = itemConfig.payload.nodeType.id;
                                var scenarioId = this.state.selectedScenario;
                                var repeatUsagePeriodId;
                                var oneTimeUsage;
                                if (nodeTypeId == 5) {
                                } else {
                                    usageTypeId = (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
                                    if (usageTypeId == 1) {
                                        oneTimeUsage = (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage;
                                    }
                                    if (usageTypeId == 2 || (oneTimeUsage != null && oneTimeUsage !== "" && oneTimeUsage.toString() == "false")) {
                                        usagePeriodId = (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
                                    }
                                    usageFrequency = (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency != null ? (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
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
                                            noOfFUPatient = (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                                        } else {
                                            noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                                        }
                                        noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
                                    }
                                    if (oneTimeUsage != "true" && oneTimeUsage != true && usageTypeId == 1) {
                                        repeatUsagePeriodId = (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.repeatUsagePeriod.usagePeriodId;
                                        if (repeatUsagePeriodId != "") {
                                            convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == repeatUsagePeriodId))[0].convertToMonth;
                                        } else {
                                            convertToMonth = 0;
                                        }
                                    }
                                    var noFURequired = oneTimeUsage != "true" && oneTimeUsage != true ? (((itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount != null ? ((itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount).toString().replaceAll(",", "") : (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount) / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
                                    val = noFURequired;
                                    val1 = ""
                                    val2 = " * "
                                } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
                                    if (itemConfig.payload.nodeType.id == 4) {
                                        noFURequired = (itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "");
                                        val = noFURequired;
                                        val1 = "";
                                        val2 = " * "
                                    } else {
                                        noFURequired = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "");
                                        val = noFURequired;
                                        val1 = "";
                                        val2 = " * "
                                    }
                                }
                            }
                            return addCommasTwoDecimal(Number((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue).toFixed(2)) + "% of parent" + val2 + (val < 0.01 ? addCommasThreeDecimal(Number(val).toFixed(3)) : addCommasTwoDecimal(Number(val).toFixed(2))) + val1;
                        } else if (itemConfig.payload.nodeType.id == 5) {
                            return addCommasTwoDecimal(Number((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue).toFixed(2)) + "% of parent, conversion = " + (itemConfig.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.multiplier;
                        } else {
                            return addCommasTwoDecimal(Number((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue).toFixed(2)) + "% of parent";
                        }
                    } else if (type == 3) {
                        var childList = this.state.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                        if (childList.length > 0) {
                            var sum = 0;
                            childList.map(c => {
                                sum += Number(c.payload.nodeDataMap.hasOwnProperty(scenarioId) ? (c.payload.nodeDataMap[scenarioId])[0].displayDataValue : 0)
                            })
                            return sum.toFixed(2);
                        } else {
                            return "";
                        }
                    } else {
                        return "= " + ((itemConfig.payload.nodeDataMap[scenarioId])[0].displayCalculatedDataValue != null ? addCommasTwoDecimal(Number((itemConfig.payload.nodeDataMap[scenarioId])[0].displayCalculatedDataValue).toFixed(2)) : "");
                    }
                }
            }
        } else {
            return "";
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedTab1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('InfoTr');
        tr.children[2].title = i18n.t('static.tooltip.Parent');
        tr.children[3].classList.add('InfoTr');
        tr.children[3].title = i18n.t('static.tooltip.NodeType');
        tr.children[4].classList.add('InfoTr');
        tr.children[4].title = i18n.t('static.tooltip.NodeTitle');
        tr.children[7].classList.add('InfoTr');
        tr.children[7].title = i18n.t('static.tooltip.PercentageOfParent');
        tr.children[8].classList.add('InfoTr');
        tr.children[8].title = i18n.t('static.tooltip.ParentValue');
        tr.children[9].classList.add('InfoTr');
        tr.children[9].title = i18n.t('static.tooltip.NodeValue');
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson(null, false);
        var jsonLength = (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']
        for (var j = 0; j < jsonLength; j++) {
            var rowData = elInstance.getRowData(j);
            if (rowData[10] == 1) {
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
            } else if (rowData[10] == 2) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("G").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            } else if (rowData[10] == 3) {
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
    onChangePageTab1(el, pageNo, oldPageNo) {
        var elInstance = el;
        var json = elInstance.getJson(null, false);
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        for (var j = start; j < jsonLength; j++) {
            var rowData = elInstance.getRowData(j);
            if (rowData[10] == 1) {
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
            } else if (rowData[10] == 2) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("G").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            } else if (rowData[10] == 3) {
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
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedTab2 = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('InfoTr');
        tr.children[2].title = i18n.t('static.tooltip.Parent');
        tr.children[3].classList.add('InfoTr');
        tr.children[3].title = i18n.t('static.tooltip.NodeType');
        tr.children[4].classList.add('InfoTr');
        tr.children[4].title = i18n.t('static.tooltip.NodeTitle');
        tr.children[6].classList.add('InfoTr');
        tr.children[6].title = i18n.t('static.tooltip.PercentageOfParent');
        tr.children[7].classList.add('InfoTr');
        tr.children[7].title = i18n.t('static.tooltip.ParentValue');
        tr.children[8].classList.add('InfoTr');
        tr.children[8].title = i18n.t('static.tooltip.NodeValue');
        tr.children[9].classList.add('InfoTr');
        tr.children[9].title = i18n.t('static.tooltip.tracercategoryModelingType');
        tr.children[10].classList.add('InfoTr');
        tr.children[10].title = i18n.t('static.tooltip.TypeOfUsePU');
        tr.children[11].classList.add('InfoTr');
        tr.children[11].title = i18n.t('static.tooltip.planningUnitNode');
        tr.children[12].classList.add('InfoTr');
        tr.children[12].title = i18n.t('static.tooltip.Conversionfactor');
        tr.children[15].classList.add('InfoTr');
        tr.children[15].title = i18n.t('static.tooltip.TypeOfUse');
        tr.children[16].classList.add('InfoTr');
        tr.children[16].title = i18n.t('static.tooltip.LagInMonthFUNode');
        tr.children[21].classList.add('InfoTr');
        tr.children[21].title = i18n.t('static.tooltip.SingleUse');
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson(null, false);
        var jsonLength = (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
        for (var j = 0; j < jsonLength; j++) {
            var rowData = elInstance.getRowData(j);
            if (rowData[35] == 4) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("G").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("K").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("L").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("M").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("N").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("R").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("T").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                if (rowData[14] == 2) {
                    var cell = elInstance.getCell(("U").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("X").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("Y").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                }
                if (rowData[20] == 1) {
                    var cell = elInstance.getCell(("V").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("W").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("X").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("Y").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                }
                var cell = elInstance.getCell(("Z").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AA").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AB").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AC").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AD").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AE").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AF").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            } else if (rowData[35] == 5) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("G").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("J").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("L").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("M").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("O").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("P").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("Q").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("R").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("S").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("T").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("V").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("U").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("W").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("X").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("Y").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("Z").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AA").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AB").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AC").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AD").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AE").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AF").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            }
        }
    }
    onChangePageTab2(el, pageNo, oldPageNo) {
        var elInstance = el;
        var json = elInstance.getJson(null, false);
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        for (var j = start; j < jsonLength; j++) {
            var rowData = elInstance.getRowData(j);
            if (rowData[35] == 4) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("G").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("K").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("L").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("M").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("N").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("R").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("T").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                if (rowData[14] == 2) {
                    var cell = elInstance.getCell(("W").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("X").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("Y").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                }
                if (rowData[20] == 1) {
                    var cell = elInstance.getCell(("V").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("W").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("X").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("Y").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                }
                var cell = elInstance.getCell(("Z").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AA").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AB").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AC").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AD").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AE").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AF").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            } else if (rowData[35] == 5) {
                var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("G").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("J").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("L").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("M").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("O").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("P").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("Q").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("R").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("S").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("T").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("V").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("W").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("U").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("X").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("Y").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("Z").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AA").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AB").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AC").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AD").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AE").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
                var cell = elInstance.getCell(("AF").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
            }
        }
    }
    onChangeTab1Data = function (instance, cell, x, y, value) {
        this.checkValidationTab1();
        this.el = this.state.treeTabl1El;
        this.el.setValueFromCoords(12, y, 1, true);
        if (x == 6) {
            this.el.setValueFromCoords(8, y, this.el.getValueFromCoords(6, y) * (this.el.getValueFromCoords(7, y) / 100), true);
        }
        this.setState({
            isTabDataChanged: true
        })
    }
    onChangeTab2Data = function (instance, cell, x, y, value) {
        this.checkValidationTab2();
        this.setState({
            isTabDataChanged: true
        })
        this.el = this.state.treeTabl2El;
        var json = this.el.getJson(null, false);
        this.el.setValueFromCoords(37, y, 1, true);
        let nodeId = this.el.getValueFromCoords(36, y);
        var currentItem = this.state.items.filter(ele => ele.id == nodeId)[0];
        var currentItemParent = this.state.items.filter(ele => ele.id == currentItem.parent).length > 0 ? this.state.items.filter(ele => ele.id == currentItem.parent)[0] : "";
        if (x == 4) {
            let tempMonth = new Date(value);
            this.el.setValueFromCoords(4, y, tempMonth.getFullYear()+"-"+(tempMonth.getMonth()+1)+"-01", true);
            this.el.setValueFromCoords(6, y, currentItemParent.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList.filter(x => moment(x.month).format("YYYY-MM-DD") == moment(this.el.getValueFromCoords(4, y)).format("YYYY-MM-DD")).length > 0 ? this.el.getValueFromCoords(35, y) == 4 ? currentItemParent.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList.filter(x => moment(x.month).format("YYYY-MM-DD") == moment(this.el.getValueFromCoords(4, y)).format("YYYY-MM-DD"))[0].calculatedValue : currentItemParent.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList.filter(x => moment(x.month).format("YYYY-MM-DD") == moment(this.el.getValueFromCoords(4, y)).format("YYYY-MM-DD"))[0].calculatedMmdValue : 0, true);
            this.el.setValueFromCoords(7, y, this.el.getValueFromCoords(6, y) * (this.el.getValueFromCoords(5, y) / 100), true);
        }
        if (x == 5) {
            this.el.setValueFromCoords(7, y, this.el.getValueFromCoords(6, y) * (value / 100), true);
        }
        if (x == 9) {
            var childNodes = this.state.items.filter(ele => ele.parent == nodeId);
            var jsonLength = parseInt(json.length);
            for (var i = 0; i < childNodes.length; i++) {
                for (var j = 0; j < jsonLength; j++) {
                    var map = new Map(Object.entries(json[j]));
                    var tempNodeId = map.get("0");
                    if (tempNodeId == childNodes[i].id) {
                        this.el.setValueFromCoords(9, j, value, true);
                        this.el.setValueFromCoords(10, j, "", true);
                        this.el.setValueFromCoords(11, j, "", true);
                    }
                }
            }
        }
        if (x == 10) {
            this.el.setValueFromCoords(11, y, this.state.planningUnitList.filter(x => x.id == value).length > 0 ? this.state.planningUnitList.filter(x => x.id == value)[0].multiplier : "", true);
        }
        if (x == 8) {
            var childNodes = this.state.items.filter(ele => ele.parent == nodeId);
            var jsonLength = parseInt(json.length);
            this.el.setValueFromCoords(9, y, "", true);
            for (var i = 0; i < childNodes.length; i++) {
                for (var j = 0; j < jsonLength; j++) {
                    var map = new Map(Object.entries(json[j]));
                    var tempNodeId = map.get("0");
                    if (tempNodeId == childNodes[i].id) {
                        this.el.setValueFromCoords(9, j, "", true);
                        this.el.setValueFromCoords(10, j, "", true);
                        this.el.setValueFromCoords(11, j, "", true);
                    }
                }
            }
        }
        if (x == 14) {
            if (value == 1) {
                var cell1 = this.el.getCell(`U${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
                var cell1 = this.el.getCell(`X${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
                var cell1 = this.el.getCell(`Y${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
                this.el.setValueFromCoords(20, y, 0, true);
            } else if (value == 2) {
                var cell1 = this.el.getCell(`U${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(`X${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(`Y${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                this.el.setValueFromCoords(20, y, "", true);
                this.el.setValueFromCoords(23, y, "", true);
                this.el.setValueFromCoords(24, y, "", true);
            }
        }
        if (x == 20) {
            let typeOfUse = this.el.getValueFromCoords(14, y);
            if (value == 1) {
                var cell1 = this.el.getCell(`V${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(`W${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(`X${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                var cell1 = this.el.getCell(`Y${parseInt(y) + 1}`)
                cell1.classList.add('readonly');
                this.el.setValueFromCoords(21, y, "", true);
                this.el.setValueFromCoords(22, y, "", true);
                this.el.setValueFromCoords(20, y, 1, true);
                this.el.setValueFromCoords(23, y, "", true);
                this.el.setValueFromCoords(24, y, "", true);
            } else if (value == 0) {
                var cell1 = this.el.getCell(`V${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
                var cell1 = this.el.getCell(`W${parseInt(y) + 1}`)
                cell1.classList.remove('readonly');
                if (typeOfUse == 1) {
                    var cell1 = this.el.getCell(`X${parseInt(y) + 1}`)
                    cell1.classList.remove('readonly');
                    var cell1 = this.el.getCell(`Y${parseInt(y) + 1}`)
                    cell1.classList.remove('readonly');
                    this.el.setValueFromCoords(20, y, 0, true);
                }
            }
        }
    }
    /**
     * Function to check validation of the jexcel table before performing updation.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidationTab1() {
        var valid = true;
        var elInstance = this.state.treeTabl1El;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var nodeType = this.el.getValueFromCoords(10, y);
            if (this.el.getValueFromCoords(3, y) == "") {
                var col = ('D').concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                var col = ('D').concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
            if (nodeType == 2) {
                if (this.el.getValueFromCoords(4, y) === "") {
                    var col = ('E').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('E').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                if (this.el.getValueFromCoords(5, y) === "") {
                    var col = ('F').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('F').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                if (this.el.getValueFromCoords(8, y) === "") {
                    var col = ('I').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('I').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if (nodeType == 3) {
                if (this.el.getValueFromCoords(4, y) === "") {
                    var col = ('E').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('E').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                if (this.el.getValueFromCoords(5, y) === "") {
                    var col = ('F').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('F').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                if (this.el.getValueFromCoords(6, y) === "") {
                    var col = ('G').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('G').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }
        return valid;
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
        items = items.filter(c => c.payload.nodeType.id == 1 || c.payload.nodeType.id == 2 || c.payload.nodeType.id == 3)
        for (var i = 0; i < items.length; i++) {
            data = [];
            var row = "";
            var row1 = "";
            var level = items[i].level;
            var numberNode = items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2 ? false : true;
            var currentScenario = items[i].payload.nodeDataMap[this.state.selectedScenario][0];

            data[1] = this.state.items.filter(c => c.id == items[i].parent).length > 0 ? this.state.items.filter(c => c.id == items[i].parent)[0].payload.label.label_en : "";
            data[2] = `<div>
                        ${(items[i].payload.nodeType.id != 1 && items[i].payload.nodeDataMap[this.state.selectedScenario] != undefined && items[i].payload.nodeType.id == 2 && items[i].payload.nodeDataMap[this.state.selectedScenario][0].extrapolation == true) ? "<i class='fa fa-line-chart'></i>" : ""}
                        ${(items[i].payload.nodeType.id != 1 && items[i].payload.nodeDataMap[this.state.selectedScenario] != undefined && items[i].payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(items[i], 4) == true ? "<i class='fa fa-long-arrow-up'></i>" : ""}
                        ${(items[i].payload.nodeType.id != 1 && items[i].payload.nodeDataMap[this.state.selectedScenario] != undefined && items[i].payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(items[i], 6) == true ? "<i class='fa fa-long-arrow-down'></i>" : ""}
                        ${(items[i].payload.nodeType.id != 1 && items[i].payload.nodeDataMap[this.state.selectedScenario] != undefined && items[i].payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(items[i], 5) == true ? "<i class='fa fa-link'></i>" : ""}
                        <b>
                            ${(items[i].payload.nodeDataMap[this.state.selectedScenario] != undefined && items[i].payload.nodeType.id == 4) ? items[i].payload.nodeDataMap[this.state.selectedScenario][0].fuNode.usageType.id == 2 ? '<b>c </b>' : '<b>d </b>' : ''}
                            ${items[i].payload.nodeType.id == 2 ? '<i class="fa fa-hashtag"></i>' : ""}
                            ${items[i].payload.nodeType.id == 3 ? '<i class="fa fa-percent"></i>' : ""}
                            ${items[i].payload.nodeType.id == 4 ? '<i class="fa fa-cube"></i>' : ""}
                            ${items[i].payload.nodeType.id == 5 ? '<i class="fa fa-cubes"></i>' : ""}
                            ${items[i].payload.nodeType.id == 1 ? '<i><img src="/Aggregation-icon.png" className="AggregationNodeSize" /></i>' : ""}
                        </b>
                    </div>`;
            data[3] = items[i].payload.label.label_en;
            data[4] = items[i].payload.nodeType.id == 1 ? "" : this.state.nodeUnitList.filter(c => c.id == items[i].payload.nodeUnit.unitId).length > 0 ? this.state.nodeUnitList.filter(c => c.id == items[i].payload.nodeUnit.unitId)[0].unitId : items[i].payload.nodeUnit.unitId;
            data[5] = moment(currentScenario.month).format("YYYY-MM-DD");
            data[6] = (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) ? "" : currentScenario.dataValue == "" ? 0 : currentScenario.dataValue;
            data[7] = (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 2) ? "" : this.calculateParentValueFromMOMForJexcel(currentScenario.month, items[i]) == "" ? 0 : this.calculateParentValueFromMOMForJexcel(currentScenario.month, items[i]);
            data[8] = numberNode ? currentScenario.calculatedDataValue == 0 ? "0" : addCommasNodeValue(currentScenario.calculatedDataValue) : addCommasNodeValue(currentScenario.dataValue);
            data[9] = currentScenario.notes;
            data[10] = this.state.nodeTypeList.filter(c => c.id == items[i].payload.nodeType.id)[0].id;
            data[11] = items[i].id;
            data[12] = "";

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
                    title: 'Node Id',
                    type: 'hidden'
                },
                {
                    title: i18n.t('static.tree.parent'),
                    type: 'text',
                    width: '120'
                },
                {
                    title: i18n.t('static.ManageTree.NodeType'),
                    type: 'html',
                    width: '100'
                },
                {
                    title: i18n.t('static.tree.nodeTitle'),
                    type: 'text',
                    width: '120'
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
                    mask: '#,##0.0000', decimal: '.',
                    type: 'numeric',
                },
                {
                    title: i18n.t('static.tree.nodeValue'),
                    mask: '#,##0.0000', decimal: '.',
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
                },
                {
                    title: 'Is Changed',
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
            onchange: this.onChangeTab1Data,
            onchangepage: this.onChangePageTab1,
            updateTable: function (el, cell, x, j, source, value, id) {
                var elInstance = el;
                var rowData = elInstance.getRowData(j);
                if (rowData[10] == 1) {
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
                } else if (rowData[10] == 2) {
                    var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("G").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                } else if (rowData[10] == 3) {
                    var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                }
            },
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
    }
    updateTab1Data() {
        this.setState({
            // momJexcelLoader: true
        }, () => {
            setTimeout(() => {
                if (this.checkValidationTab1()) {
                    var json = this.state.treeTabl1El.getJson(null, false);
                    var items = this.state.items;
                    for (var i = 0; i < json.length; i++) {
                        if (json[i][12] == 1) {
                            let curItem = {
                                context: ''
                            };
                            curItem.context = items.filter(c => c.id == json[i][11])[0];
                            curItem.context.payload.label.label_en = json[i][3];
                            curItem.context.payload.nodeUnit.id = json[i][4];
                            curItem.context.payload.nodeUnit.unitId = json[i][4];
                            curItem.context.payload.nodeUnit.label = this.state.nodeUnitList.filter(c => c.id == json[i][4])[0];
                            let tempMonth = new Date(json[i][5]);
                            (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].month = tempMonth.getFullYear()+"-"+(tempMonth.getMonth()+1)+"-01";
                            if (json[i][10] == 3) {
                                var value = json[i][6];
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = value;
                                this.state.currentScenario.dataValue = value;
                                this.calculateParentValueFromMOM((curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].month);
                            }
                            if (json[i][10] == 2) {
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = json[i][8];
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = json[i][8];
                            }
                            (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].notes = json[i][9];
                            this.getNotes();
                            this.setState({
                                currentItemConfig: curItem
                            }, () => {
                                this.updateNodeInfoInJson(curItem)
                            })
                        }
                    }
                }
            }, 0)
        })
    }
    resetTab1Data() {
        if (this.state.isTabDataChanged == true) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                this.setState({
                    isTabDataChanged: false
                }, () => {
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
                })
            } else {
            }
        } else {
            this.setState({
                isTabDataChanged: false
            }, () => {
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
            })
        }
    }
    filterPlanningUnit = function (instance, cell, c, r, source) {
        var selectedForecastingUnitId = (this.state.treeTabl2El.getJson(null, false)[r])[9];
        var mylist = this.state.planningUnitList.filter(c => c.forecastingUnit.id == selectedForecastingUnitId);
        var mylist1 = mylist.map(c => {
            return { id: c.id, name: getLabelText(c.label, this.state.lang) }
        })
        return mylist1.sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }.bind(this)
    updateTab2Data() {
        this.setState({
            // momJexcelLoader: true
        }, () => {
            setTimeout(() => {
                if (this.checkValidationTab2()) {
                    var json = this.state.treeTabl2El.getJson(null, false);
                    var items = this.state.items;
                    for (var i = 0; i < json.length; i++) {
                        if (json[i][37] == 1) {
                            let curItem = {
                                context: ''
                            };
                            curItem.context = items.filter(c => c.id == json[i][36])[0];
                            // curItem.context.payload.label.label_en = json[i][3];
                            // curItem.context.payload.nodeUnit.id = json[i][4];
                            curItem.context.payload.label.label_en = json[i][3];
                            let tempMonth = new Date(json[i][4]);
                            (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].month = tempMonth.getFullYear()+"-"+(tempMonth.getMonth()+1)+"-01";
                            (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = json[i][5];
                            (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = json[i][7];
                            if (json[i][35] == 4) {
                                var currentScenarioParent = this.state.items.filter(ele => ele.id == items[i].parent).length > 0 ? this.state.items.filter(ele => ele.id == items[i].parent)[0] : "";
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.id = json[i][9];
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit = this.state.forecastingUnitList.filter(c => c.id == json[i][9])[0];
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.tracerCategory.id = json[i][8];
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id = json[i][14];
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.lagInMonths = json[i][15];
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfPersons = json[i][16];
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfForecastingUnitsPerPerson = json[i][18];
                                if (json[i][14] == 2 || (json[i][14] == 1 && json[i][20] == 0)) {
                                    (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageFrequency = json[i][21];
                                    (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usagePeriod = {};
                                    (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usagePeriod.usagePeriodId = json[i][22];
                                }
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage = json[i][20] == 0 ? "false" : "true";
                                if (json[i][14] == 1 && json[i][20] == 0) {
                                    (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.repeatCount = json[i][23];
                                    (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.repeatUsagePeriod = {};
                                    (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.repeatUsagePeriod.usagePeriodId = json[i][24];
                                }
                                // (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = json[i][8];
                            }
                            if (json[i][35] == 5) {
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.id = json[i][10];
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.multiplier = this.state.planningUnitList.filter(ele => ele.id == json[i][10])[0].multiplier;
                                (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit = json[i][13];
                            }
                            (curItem.context.payload.nodeDataMap[this.state.selectedScenario])[0].notes = json[i][32];
                            this.getNotes();
                            this.setState({
                                currentItemConfig: curItem
                            }, () => {
                                this.updateNodeInfoInJson(curItem)
                            })
                        }
                    }
                }
            }, 0)
        })
    }
    resetTab2Data() {
        if (this.state.isTabDataChanged == true) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                this.setState({
                    isTabDataChanged: false
                }, () => {
                    if (this.state.treeTabl2El != "") {
                        jexcel.destroy(document.getElementById('tableDiv2'), true);
                        if (this.state.treeTabl2El != "") {
                            if (document.getElementById('tableDiv2') != null) {
                                jexcel.destroy(document.getElementById('tableDiv2'), true);
                            }
                        }
                        else if (this.state.treeTabl2El != "") {
                            jexcel.destroy(document.getElementById('tableDiv2'), true);
                        }
                    }
                    this.buildTab2Jexcel();
                })
            } else {
            }
        } else {
            this.setState({
                isTabDataChanged: false
            }, () => {
                if (this.state.treeTabl2El != "") {
                    jexcel.destroy(document.getElementById('tableDiv2'), true);
                    if (this.state.treeTabl2El != "") {
                        if (document.getElementById('tableDiv2') != null) {
                            jexcel.destroy(document.getElementById('tableDiv2'), true);
                        }
                    }
                    else if (this.state.treeTabl2El != "") {
                        jexcel.destroy(document.getElementById('tableDiv2'), true);
                    }
                }
                this.buildTab2Jexcel();
            })
        }
    }
    /**
     * Function to check validation of the jexcel table before performing updation.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidationTab2() {
        var valid = true;
        var elInstance = this.state.treeTabl2El;
        var json = this.el.getJson(null, false);
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
        var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE;
        for (var y = 0; y < json.length; y++) {
            var nodeType = this.el.getValueFromCoords(35, y);
            if (this.el.getValueFromCoords(3, y) === "") {
                var col = ('D').concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                var col = ('D').concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
            if (this.el.getValueFromCoords(4, y) === "") {
                var col = ('E').concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                var col = ('E').concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
            if (this.el.getValueFromCoords(5, y) === "") {
                var col = ('F').concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                var col = ('F').concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
            if (nodeType == 4) {
                if (this.el.getValueFromCoords(9, y) === "") {
                    var col = ('J').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('J').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                if (this.el.getValueFromCoords(8, y) === "") {
                    var col = ('I').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('I').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                if (this.el.getValueFromCoords(14, y) === "") {
                    var col = ('O').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('O').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                if (this.el.getValueFromCoords(16, y) === "") {
                    var col = ('Q').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('Q').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                if (this.el.getValueFromCoords(18, y) === "") {
                    var col = ('S').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('S').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                if (this.el.getValueFromCoords(20, y) == 0 && this.el.getValueFromCoords(14, y) == 1) {
                    if (this.el.getValueFromCoords(21, y) === "") {
                        var col = ('V').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        var col = ('V').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                    if (this.el.getValueFromCoords(22, y) === "") {
                        var col = ('W').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        var col = ('W').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                    if (this.el.getValueFromCoords(23, y) == "") {
                        var col = ('X').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        var col = ('X').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                    if (this.el.getValueFromCoords(24, y) === "") {
                        var col = ('Y').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        var col = ('Y').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                } else if (this.el.getValueFromCoords(14, y) == 2) {
                    if (this.el.getValueFromCoords(21, y) == "") {
                        var col = ('V').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        var col = ('V').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                    if (this.el.getValueFromCoords(22, y) === "") {
                        var col = ('W').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        var col = ('W').concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                    var col = ('X').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");

                    var col = ('Y').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                } else {
                    var col = ('V').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");

                    var col = ('W').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");

                    var col = ('X').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");

                    var col = ('Y').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if (nodeType == 5) {
                if (this.el.getValueFromCoords(10, y) === "") {
                    var col = ('K').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('K').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                if (this.el.getValueFromCoords(13, y) === "") {
                    var col = ('N').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ('N').concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }
        return valid;
    }
    buildTab2Jexcel() {
        var treeArray = [];
        var count = 0;
        var item1 = this.state.items;
        var sortOrderArray = [...new Set(item1.map(ele => (ele.sortOrder)))];
        var sortedArray = sortOrderArray.sort();
        var items = [];
        for (var i = 0; i < sortedArray.length; i++) {
            items.push(item1.filter(c => c.sortOrder == sortedArray[i])[0]);
        }
        items = items.filter(c => c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5)
        for (var i = 0; i < items.length; i++) {
            data = [];
            var row = "";
            var row1 = "";
            var level = items[i].level;
            var fuNode = items[i].payload.nodeType.id == 4;
            var currentScenario = items[i].payload.nodeDataMap[this.state.selectedScenario][0];
            var currentScenarioParent = this.state.items.filter(ele => ele.id == items[i].parent).length > 0 ? this.state.items.filter(ele => ele.id == items[i].parent)[0] : "";
            data[0] = items[i].id;
            data[1] = this.state.items.filter(c => c.id == items[i].parent).length > 0 ? this.state.items.filter(c => c.id == items[i].parent)[0].payload.label.label_en : "";
            data[2] = `<div>
                        ${(items[i].payload.nodeType.id != 1 && items[i].payload.nodeDataMap[this.state.selectedScenario] != undefined && items[i].payload.nodeType.id == 2 && items[i].payload.nodeDataMap[this.state.selectedScenario][0].extrapolation == true) ? "<i class='fa fa-line-chart'></i>" : ""}
                        ${(items[i].payload.nodeType.id != 1 && items[i].payload.nodeDataMap[this.state.selectedScenario] != undefined && items[i].payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(items[i], 4) == true ? "<i class='fa fa-long-arrow-up'></i>" : ""}
                        ${(items[i].payload.nodeType.id != 1 && items[i].payload.nodeDataMap[this.state.selectedScenario] != undefined && items[i].payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(items[i], 6) == true ? "<i class='fa fa-long-arrow-down'></i>" : ""}
                        ${(items[i].payload.nodeType.id != 1 && items[i].payload.nodeDataMap[this.state.selectedScenario] != undefined && items[i].payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(items[i], 5) == true ? "<i class='fa fa-link'></i>" : ""}
                        <b>
                            ${(items[i].payload.nodeDataMap[this.state.selectedScenario] != undefined && items[i].payload.nodeType.id == 4) ? items[i].payload.nodeDataMap[this.state.selectedScenario][0].fuNode.usageType.id == 2 ? '<b>c </b>' : '<b>d </b>' : ''}
                            ${items[i].payload.nodeType.id == 2 ? '<i class="fa fa-hashtag"></i>' : ""}
                            ${items[i].payload.nodeType.id == 3 ? '<i class="fa fa-percent"></i>' : ""}
                            ${items[i].payload.nodeType.id == 4 ? '<i class="fa fa-cube"></i>' : ""}
                            ${items[i].payload.nodeType.id == 5 ? '<i class="fa fa-cubes"></i>' : ""}
                            ${items[i].payload.nodeType.id == 1 ? '<i><img src="/Aggregation-icon.png" className="AggregationNodeSize" /></i>' : ""}
                        </b>
                    </div>`;
            data[3] = items[i].payload.label.label_en;
            data[4] = moment(currentScenario.month).format("YYYY-MM-DD");
            data[5] = currentScenario.dataValue; //Percentage of Parent
            data[6] = currentScenarioParent.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList.filter(x => moment(x.month).format("YYYY-MM-DD") == data[4]).length > 0 ? fuNode ? currentScenarioParent.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList.filter(x => moment(x.month).format("YYYY-MM-DD") == data[4])[0].calculatedValue : currentScenarioParent.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList.filter(x => moment(x.month).format("YYYY-MM-DD") == data[4])[0].calculatedMmdValue : 0; //Parent Value
            // data[7] = currentScenario.dataValue;//Node Value
            data[7] = currentScenario.calculatedDataValue;
            data[8] = fuNode ? currentScenario.fuNode.forecastingUnit.tracerCategory.id : ""; // Tracer Category
            data[9] = fuNode ? this.state.forecastingUnitList.filter(c => c.id == currentScenario.fuNode.forecastingUnit.id)[0].label.label_en : this.state.forecastingUnitList.filter(c => c.id == currentScenarioParent.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.id)[0].label.label_en; // Forecasting unit
            data[10] = fuNode ? "" : currentScenario.puNode.planningUnit.id; // Planning Unit
            data[11] = fuNode ? "" : currentScenario.puNode.planningUnit.multiplier; // Conversion Factor
            data[12] = !fuNode ? this.qatCalculatedPUPerVisitForJexcel(items[i]) : ""; // # PU / Interval / Patient (Reference)
            data[13] = fuNode ? "" : currentScenario.puNode.puPerVisit; // # PU / Interval / Patient
            data[14] = fuNode ? currentScenario.fuNode.usageType.id : ""; // Type of Use
            data[15] = fuNode ? currentScenario.fuNode.lagInMonths : ""; // Lag in months
            data[16] = fuNode ? currentScenario.fuNode.noOfPersons : ""; // Every
            data[17] = fuNode ? items[i].payload.nodeUnit.id : ""//items[i].parentItem.payload.nodeUnit.id : ""; // Unit nodeUnitListPlural
            data[18] = fuNode ? currentScenario.fuNode.noOfForecastingUnitsPerPerson : ""; // Requires
            data[19] = fuNode ? currentScenario.fuNode.forecastingUnit.unit.id : ""; // Forecasting Units Unit unitList
            data[20] = fuNode ? currentScenario.fuNode.usageType.id == 1 ? currentScenario.fuNode.oneTimeUsage.toString() == "false" ? 0 : 1 : "" : ""; // Single Use
            data[21] = fuNode ? currentScenario.fuNode.usageFrequency : ""; // Every
            data[22] = fuNode ? currentScenario.fuNode.usagePeriod == null ? "" : currentScenario.fuNode.usagePeriod.usagePeriodId : ""; // Usage Period usagePeriodList
            data[23] = fuNode ? currentScenario.fuNode.repeatUsagePeriod == null ? "" : currentScenario.fuNode.repeatCount : ""; // For
            data[24] = fuNode ? currentScenario.fuNode.repeatUsagePeriod == null ? "" : currentScenario.fuNode.repeatUsagePeriod.usagePeriodId : ""; // Period usagePeriodList
            data[25] = 0; // # of FU required for period
            data[26] = 0; // # Of Months In Period
            data[27] = 0; // # of FU / month / Patient
            data[28] = 0; // # of FU / Unit/ Time
            data[29] = 0; // # of FU required for period per Unit
            data[30] = 0; // # of FU / month / Unit
            data[31] = 0; // # of PU / month / Unit
            data[32] = currentScenario.notes;
            data[33] = this.calculateParentValueFromMOMForJexcel(currentScenario.month, items[i]);
            // data[35] = numberNode ? currentScenario.calculatedDataValue == 0 ? "0" : addCommasNodeValue(currentScenario.calculatedDataValue) : addCommasNodeValue(currentScenario.dataValue);
            data[34] = currentScenario.notes;
            data[35] = this.state.nodeTypeList.filter(c => c.id == items[i].payload.nodeType.id)[0].id;
            data[36] = items[i].id;
            data[37] = "";

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
                { // A
                    title: 'Node Id',
                    type: 'hidden',
                },
                { // b
                    title: i18n.t('static.tree.parent'),
                    type: 'text',
                    width: '120'
                },
                { //c
                    title: i18n.t('static.ManageTree.NodeType'),
                    type: 'html',
                    width: '100'
                },
                { //d
                    title: i18n.t('static.tree.nodeTitle'),
                    type: 'text',
                    width: '120'
                },
                {//e
                    title: i18n.t('static.supplyPlan.startMonth'),
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' },
                    type: 'calendar'
                },
                {//f
                    title: i18n.t('static.tree.percentageOfParent'),
                    mask: '#,##0.00%', decimal: '.',
                    type: 'numeric',
                },
                {//g
                    title: i18n.t('static.tree.parentValue'),
                    mask: '#,##0.0000', decimal: '.',
                    type: 'numeric',
                },
                {//h
                    title: i18n.t('static.tree.nodeValue'),
                    mask: '#,##0.0000', decimal: '.',
                    type: 'numeric',
                },
                {//n
                    title: 'Tracer Category',
                    source: this.state.tracerCategoryListForDropdown,
                    type: 'dropdown',
                },
                {//i
                    title: 'Forecasting Unit',
                    source: this.state.forecastingUnitListForDropdown,
                    type: 'dropdown',
                },
                {//j
                    title: 'Planning Unit',
                    source: this.state.planningUnitListForDropdown,
                    type: 'dropdown',
                    filter: this.filterPlanningUnit
                },
                {//k
                    title: 'Conversion Factor',
                    mask: '#,##0.00', decimal: '.',
                    type: 'numeric',
                },
                {//l
                    title: '# PU / Interval / Patient (Reference)',
                    decimal: '.',
                    type: 'numeric',
                },
                {//m
                    title: '# PU / Interval / Patient',
                    decimal: '.',
                    type: 'numeric',
                },
                {//o
                    title: 'Type Of Use',
                    source: this.state.usageTypeListForDropdown,
                    type: 'dropdown',
                },
                {//p
                    title: 'Lag in months',
                    mask: '#,##0.00', decimal: '.',
                    type: 'numeric',
                },
                {//q
                    title: 'Every',
                    mask: '#,##0.00', decimal: '.',
                    type: 'numeric',
                },
                {//r
                    title: 'Unit',
                    source: this.state.nodeUnitListForDropdown,
                    type: 'dropdown',
                },
                {//s
                    title: 'Requires',
                    mask: '#,##0.00', decimal: '.',
                    type: 'numeric',
                },
                {//t
                    title: 'Forecasting Units Unit',
                    source: this.state.unitListForDropdown,
                    type: 'dropdown',
                },
                 {//w
                    title: 'Single Use',
                    source: this.state.booleanForDropdown,
                    type: 'dropdown',
                },
                {//u
                    title: 'Every',
                    mask: '#,##0.00', decimal: '.',
                    type: 'numeric',
                },
                {//v
                    title: 'Usage Period',
                    source: this.state.usagePeriodListForDropdown,
                    type: 'dropdown',
                },
                {//x
                    title: 'For',
                    mask: '#,##0.00', decimal: '.',
                    type: 'numeric',
                },
                {//y
                    title: 'Period',
                    source: this.state.usagePeriodListForDropdown,
                    type: 'dropdown',
                },
                {//z
                    title: '# of FU required for period',
                    mask: '#,##0.00', decimal: '.',
                    type: 'hidden',
                },
                {//aa
                    title: '# Of Months In Period',
                    mask: '#,##0.00', decimal: '.',
                    type: 'hidden',
                },
                {//ab
                    title: '# of FU / month / Patient',
                    mask: '#,##0.00', decimal: '.',
                    type: 'hidden',
                },
                {//ac
                    title: '# of FU / Unit/ Time',
                    mask: '#,##0.00', decimal: '.',
                    type: 'hidden',
                },
                {//ad
                    title: '# of FU required for period per Unit',
                    mask: '#,##0.00', decimal: '.',
                    type: 'hidden',
                },
                {//ae
                    title: '# of FU / month / Unit',
                    mask: '#,##0.00', decimal: '.',
                    type: 'hidden',
                },
                {//af
                    title: '# of PU / month / Unit',
                    mask: '#,##0.00', decimal: '.',
                    type: 'hidden',
                },
                {//ag
                    title: i18n.t('static.common.notes'),
                    type: 'text',
                },
                {//ah
                    title: 'Node Type',
                    type: 'hidden',
                },
                {//ai
                    title: 'Node Id',
                    type: 'hidden',
                },
                {//aj
                    title: 'AA',
                    type: 'hidden',
                },
                {//ak
                    title: 'AB',
                    type: 'hidden',
                },
                {//al
                    title: 'Is Changed',
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
            onload: this.loadedTab2,
            onchange: this.onChangeTab2Data,
            onchangepage: this.onChangePageTab2,
            updateTable: function (el, cell, x, j, source, value, id) {
                var elInstance = el;
                var rowData = elInstance.getRowData(j);
                if (rowData[35] == 4) {
                    var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("G").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("K").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("L").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("M").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("N").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("R").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("T").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    if (rowData[14] == 2) {
                        var cell = elInstance.getCell(("U").concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("X").concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("Y").concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                    }
                    if (rowData[20] == 1) {
                        var cell = elInstance.getCell(("V").concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("W").concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("X").concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                        var cell = elInstance.getCell(("Y").concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                    }
                    var cell = elInstance.getCell(("Z").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AA").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AB").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AC").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AD").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AE").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AF").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                } else if (rowData[35] == 5) {
                    var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("G").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("J").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("L").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("M").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("O").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("P").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("Q").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("R").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("S").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("T").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("V").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("U").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("W").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("X").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("Y").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("Z").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AA").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AB").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AC").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AD").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AE").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(("AF").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                }
            },
            contextMenu: function (obj, x, y, e) {
                var items = [];
                var rowData = obj.getRowData(y)
                if (y != null) {
                    if (1 == 1) {
                        items.push({
                            title: "Go to Tree",
                            onclick: function () {
                                localStorage.setItem("openNodeId", rowData[36]);
                                window.open("/#/dataSet/buildTree/tree/" + this.state.treeId + "/" + this.state.programId + "/" + "-1", "_blank")
                            }.bind(this)
                        });
                    }
                }
                return items;
            }.bind(this),
        };
        var treeTabl2El = jexcel(document.getElementById("tableDiv2"), options);
        this.el = treeTabl2El;
        this.setState({
            treeTabl2El: treeTabl2El,
            loading: false,
        })
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
        if (currentItemConfig.context.payload.nodeDataMap.length > 0) {
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
     * Calculates the planning unit usage per visit (PU per visit) based on the current item's configuration and usage type.
     * Updates the PU per visit value in the current item's node data map.
     * @param {number} type - The type of calculation to perform. 1 for refill months calculation, 2 for standard calculation.
     */
    qatCalculatedPUPerVisitForJexcel(item) {
        var currentItemConfig = {
            context: '',
            parentItem: ''
        };
        var currentScenarioParent = this.state.items.filter(ele => ele.id == item.parent).length > 0 ? this.state.items.filter(ele => ele.id == item.parent)[0] : "";
        currentItemConfig.context = item;
        currentItemConfig.parentItem = currentScenarioParent;
        let { noFURequired, noOfMonthsInUsagePeriod } = this.getNoFURequiredForJexcel(currentItemConfig);
        var qatCalculatedPUPerVisit = "";
        var planningUnitList = this.state.planningUnitList;
        if (planningUnitList.length > 0 && currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id != "") {
            if (planningUnitList.filter(x => x.id == currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id).length > 0) {
                var pu = planningUnitList.filter(x => x.id == currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id)[0];
                if (currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.usageType.id == 2) {
                    var refillMonths = 1;
                    qatCalculatedPUPerVisit = parseFloat(((currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.noOfForecastingUnitsPerPerson / noOfMonthsInUsagePeriod) * refillMonths) / pu.multiplier).toFixed(8);
                } else {
                    qatCalculatedPUPerVisit = parseFloat(1 / pu.multiplier).toFixed(8);
                }
            }
        }
        return qatCalculatedPUPerVisit;
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
     * Function to calculate no of forecasting units required
     */
    getNoFURequiredForJexcel(currentItemConfig) {
        var usagePeriodId;
        var usageTypeId;
        var usageFrequency;
        var nodeTypeId = currentItemConfig.context.payload.nodeType.id;
        var scenarioId = this.state.selectedScenario;
        var repeatUsagePeriodId;
        var oneTimeUsage;
        if (nodeTypeId == 5) {
            usageTypeId = (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            usagePeriodId = (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod != null ? (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId : "";
            usageFrequency = (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency != null ? (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
            if (usageTypeId == 1) {
                oneTimeUsage = (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage;
            }
        } else {
            usageTypeId = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            if (usageTypeId == 1) {
                oneTimeUsage = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage;
            }
            if (usageTypeId == 2 || (oneTimeUsage != null && oneTimeUsage !== "" && oneTimeUsage.toString() == "false")) {
                usagePeriodId = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
            }
            usageFrequency = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency != null ? (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency.toString().replaceAll(",", "") : "";
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
                if (currentItemConfig.context.payload.nodeType.id == 4) {
                    noOfFUPatient = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                } else {
                    noOfFUPatient = (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
                }
                noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
            }
            if (oneTimeUsage != "true" && oneTimeUsage != true && usageTypeId == 1) {
                if (currentItemConfig.context.payload.nodeType.id == 4) {
                    repeatUsagePeriodId = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatUsagePeriod.usagePeriodId;
                } else {
                    repeatUsagePeriodId = (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.repeatUsagePeriod.usagePeriodId;
                }
                if (repeatUsagePeriodId != "") {
                    convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == repeatUsagePeriodId))[0].convertToMonth;
                } else {
                    convertToMonth = 0;
                }
            }
            if (currentItemConfig.context.payload.nodeType.id == 4) {
                var noFURequired = oneTimeUsage != "true" && oneTimeUsage != true ? (((currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount != null ? ((currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount).toString().replaceAll(",", "") : (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount) / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
            } else {
                var noFURequired = oneTimeUsage != "true" && oneTimeUsage != true ? (((currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount != null ? ((currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount).toString().replaceAll(",", "") : (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount) / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
            }
        } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
            if (currentItemConfig.context.payload.nodeType.id == 4) {
                noFURequired = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            } else {
                noFURequired = (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / (currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons.toString().replaceAll(",", "");
            }
        }
        return { noFURequired, noOfMonthsInUsagePeriod };
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
                var unitListForDropdown = [];
                myResult = planningunitRequest.result;
                var proList = []
                this.setState({
                    unitList: myResult,
                    nodeUnitList: myResult.filter(x => x.dimension.id == TREE_DIMENSION_ID && x.active == true)
                }, () => {
                    this.state.unitList.map((item, i) => {
                        unitListForDropdown.push({ id: item.unitId, name: getLabelText(item.label, this.state.lang) })
                    })
                    var nodeUnitListPlural = [];
                    var nodeUnitListForDropdown = [];
                    for (let i = 0; i < this.state.nodeUnitList.length; i++) {
                        nodeUnitListForDropdown.push({ id: this.state.nodeUnitList[i].unitId, name: this.state.nodeUnitList[i].label.label_en })
                        var nodeUnit = JSON.parse(JSON.stringify(this.state.nodeUnitList[i]));
                        nodeUnit.label.label_en = nodeUnit.label.label_en + "(s)";
                        nodeUnitListPlural.push(nodeUnit);
                    }
                    this.setState({ nodeUnitListPlural, nodeUnitListForDropdown, unitListForDropdown })
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
                var usagePeriodListForDropdown = [];
                var booleanForDropdown = [];
                myResult = planningunitRequest.result;
                var proList = []
                this.setState({
                    usagePeriodList: myResult
                }, () => {
                    this.state.usagePeriodList.map((item) => {
                        usagePeriodListForDropdown.push({ id: item.usagePeriodId, name: getLabelText(item.label, this.state.lang) })
                    })
                    booleanForDropdown.push({ id: 0, name: i18n.t("static.realm.no") })
                    booleanForDropdown.push({ id: 1, name: i18n.t("static.realm.yes") })
                    this.setState({ usagePeriodListForDropdown, booleanForDropdown })
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
                var usageTypeListForDropdown = [];
                myResult.map(m => usageTypeListForDropdown.push({
                    id: m.id,
                    name: getLabelText(m.label, this.state.lang)
                }))
                var proList = []
                this.setState({
                    usageTypeList: myResult,
                    usageTypeListForDropdown
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
        if (this.state.isTabDataChanged == true) {
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
     * Sets program Id
     * @param {*} e The event object triggered by the change in input fields.
     */
    setProgramId(e) {
        this.setState({
            programId: e,
            treeId: "",
            selectedScenario: '',
            selectedScenarioLabel: '',
            currentScenario: [],
            treeData: [],
            scenarioList: [],
            items: []
        }, () => {
            if (e != null && e != "") {
                this.getTreeList();
                this.getDatasetList();
                this.getRegionList();
            }
            if (this.state.treeTabl1El != "") {
                jexcel.destroy(document.getElementById('tableDiv'), true);
                if (this.state.treeTabl1El != "") {
                    if (document.getElementById('tableDiv') != null) {
                        jexcel.destroy(document.getElementById('tableDiv'), true);
                    }
                }
            }
            if (this.state.treeTabl2El != "") {
                jexcel.destroy(document.getElementById('tableDiv2'), true);
                if (this.state.treeTabl2El != "") {
                    if (document.getElementById('tableDiv2') != null) {
                        jexcel.destroy(document.getElementById('tableDiv2'), true);
                    }
                }
            }
        })
    }
    /**
     * Toggles the active tab in the modal.
     * @param {number} tabPane - The index of the tab pane to toggle.
     * @param {number} tab - The new active tab index.
     */
    toggleModal(tabPane, tab) {
        if (this.state.isTabDataChanged == true) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                this.setState({
                    isTabDataChanged: false
                }, () => {
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
                })
            } else {
            }
        } else {
            this.setState({
                isTabDataChanged: false
            }, () => {
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
            })
        }
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
            if (event.target.value != null && event.target.value != "") {
                treeId = event.target.value;
                this.setState({
                    treeId,
                    items: [],
                    selectedScenario: '',
                    selectedScenarioLabel: '',
                    currentScenario: [],
                    scenarioList: []
                }, () => {
                    this.handleAMonthDissmis3(this.state.singleValue2, 0);
                    this.toggleModal(0, this.state.activeTab1[0]);
                });
            } else {
                this.setState({
                    treeId: "",
                    selectedScenario: '',
                    selectedScenarioLabel: '',
                    currentScenario: [],
                    scenarioList: []
                });
                if (this.state.treeTabl1El != "") {
                    jexcel.destroy(document.getElementById('tableDiv'), true);
                    if (this.state.treeTabl1El != "") {
                        if (document.getElementById('tableDiv') != null) {
                            jexcel.destroy(document.getElementById('tableDiv'), true);
                        }
                    }
                }
                if (this.state.treeTabl2El != "") {
                    jexcel.destroy(document.getElementById('tableDiv2'), true);
                    if (this.state.treeTabl2El != "") {
                        if (document.getElementById('tableDiv2') != null) {
                            jexcel.destroy(document.getElementById('tableDiv2'), true);
                        }
                    }
                }
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
                if (this.state.treeTabl1El != "") {
                    jexcel.destroy(document.getElementById('tableDiv'), true);
                    if (this.state.treeTabl1El != "") {
                        if (document.getElementById('tableDiv') != null) {
                            jexcel.destroy(document.getElementById('tableDiv'), true);
                        }
                    }
                }
                if (this.state.treeTabl2El != "") {
                    jexcel.destroy(document.getElementById('tableDiv2'), true);
                    if (this.state.treeTabl2El != "") {
                        if (document.getElementById('tableDiv2') != null) {
                            jexcel.destroy(document.getElementById('tableDiv2'), true);
                        }
                    }
                }
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
                <TabPane tabId="1" style={{ paddingBottom: "50px" }}>
                    <i className="text-danger">{i18n.t('static.treeTable.tabNotes')}</i>
                    <div className="TreeTable">
                        <div id="tableDiv" style={{ display: this.state.loading ? "none" : "block" }}>
                        </div>
                    </div>
                    {this.state.isTabDataChanged && <div className="col-md-12 pr-lg-0">
                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 && this.state.currentItemConfig.context.payload.nodeType.id != 1 &&
                            <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={(e) => this.resetTab1Data(e)}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>}
                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 && this.state.currentItemConfig.context.payload.nodeType.id != 1 &&
                            <Button type="button" size="md" color="success" className="float-right mr-1" onClick={(e) => this.updateTab1Data(e)}><i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>}
                    </div>}
                </TabPane>
                <TabPane tabId="2" style={{ paddingBottom: "50px" }}>
                    <i className="text-danger">{i18n.t('static.treeTable.tabNotes')}</i>
                    <div className="TreeTable">
                        <div id="tableDiv2" style={{ display: this.state.loading ? "none" : "block" }}>
                        </div>
                    </div>
                    {this.state.isTabDataChanged && <div className="col-md-12 pr-lg-0">
                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 && this.state.currentItemConfig.context.payload.nodeType.id != 1 &&
                            <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={(e) => this.resetTab2Data(e)}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>}
                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 && this.state.currentItemConfig.context.payload.nodeType.id != 1 &&
                            <Button type="button" size="md" color="success" className="float-right mr-1" onClick={(e) => this.updateTab2Data(e)}><i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>}
                    </div>}
                </TabPane>
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
                when={this.state.isTabDataChanged == true }
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
                                <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')}  <a href="/#/validation/productValidation" className="supplyplanformulas">{i18n.t('static.dashboard.productValidation')}</a> {i18n.t('static.tree.or')} <a href="/#/validation/modelingValidation" className="supplyplanformulas">{i18n.t('static.dashboard.modelingValidation')}</a> {i18n.t('static.tree.or')} <a href={`/#/dataSet/buildTree/tree/${this.state.treeId}/${this.state.programId}`}  className="supplyplanformulas">{i18n.t('static.common.managetree')}</a> </span>
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
                                                                onChange={(e) => { this.setProgramId(e.target.value) }}
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
                                                                Aggregation/Number/Percentage Node
                                                            </NavLink>
                                                        </NavItem>
                                                        <NavItem>
                                                            <NavLink
                                                                active={this.state.activeTab1[0] === '2'}
                                                                onClick={() => { this.toggleModal(0, '2'); }}
                                                            >
                                                                FU/PU Node
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
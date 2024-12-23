import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
import "jspdf-autotable";
import cleanUp from '../../assets/img/calculator.png';
import AggregationNode from '../../assets/img/Aggregation-icon.png';
import AggregationDown from '../../assets/img/funnel.png';
import AggregationAllowed from '../../assets/img/aggregateAllowed.png';
import AggregationAllowedRed from '../../assets/img/aggregateAllowedRed.png';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType, LevelAnnotationConfig, ConnectorAnnotationConfig, AnnotationType, LineType, Thickness, ConnectorShapeType, ConnectorPlacementType, HighlightPathAnnotationConfig } from 'basicprimitives';
import { DropTarget, DragSource } from 'react-dnd';
import i18n from '../../i18n'
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Formik } from 'formik';
import * as Yup from 'yup'
import { Row, Col, Card, Button, CardBody, Form, Modal, ModalBody, PopoverBody, Popover, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, InputGroupText, DropdownItem, DropdownMenu, DropdownToggle, ButtonDropdown, InputGroup } from 'reactstrap';
import Provider from '../../Samples/Provider'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import moment from 'moment';
import Picker from 'react-month-picker';
import MonthBox from '../../CommonComponent/MonthBox.js';
import { NUMBER_NODE_ID, PERCENTAGE_NODE_ID, FU_NODE_ID, PU_NODE_ID, ROUNDING_NUMBER, INDEXED_DB_NAME, INDEXED_DB_VERSION, TREE_DIMENSION_ID, SECRET_KEY, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DECIMAL_NO_REGEX_LONG, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL_POSITIVE, DATE_FORMAT_CAP, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_INTEGER_REGEX, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js'
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
import { calculateModelingData } from '../../views/DataSet/ModelingDataCalculation2';
import TreeExtrapolationComponent from '../../views/DataSet/TreeExtrapolationComponent';
import AuthenticationService from '../Common/AuthenticationService';
import classNames from 'classnames';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import PDFDocument from 'pdfkit-nodejs-webpack';
import blobStream from 'blob-stream';
import OrgDiagramPdfkit from '../TreePDF/OrgDiagramPdfkit';
import Size from '../../../node_modules/basicprimitives/src/graphics/structs/Size';
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
import PlanningUnitService from '../../api/PlanningUnitService';
import { forEach } from 'mathjs';
import { filterOptions } from '../../CommonComponent/JavascriptCommonFunctions';
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
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2 || parseInt(document.getElementById("nodeTypeId").value) == 6) && document.getElementById("nodeUnitId").value == "") {
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
 * Defines the validation schema for copy/move node.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchemaCopyMove = function (values) {
    return Yup.object().shape({
        copyMove: Yup.number()
            .test('copyMove', 'Please select action',
                function (value) {
                    if (document.getElementById("copyMoveTrue").checked || document.getElementById("copyMoveFalse").checked) {
                        return true;
                    } else {
                        return false;
                    }
                }),
        treeDropdown: Yup.string()
            .test('treeDropdown', 'Please select tree',
                function (value) {
                    if (document.getElementById("treeDropdown").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        parentLevelDropdown: Yup.string()
            .test('parentLevelDropdown', 'Please select parent level',
                function (value) {
                    if (document.getElementById("parentLevelDropdown").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        parentNodeDropdown: Yup.string()
            .test('parentNodeDropdown', 'Please select parent node',
                function (value) {
                    if (document.getElementById("parentNodeDropdown").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
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
export default class BuildTree extends Component {
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
            isDarkMode: false,
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
            popoverOpenSenariotree2: false,
            popoverOpenNodeType: false,
            popoverOpenNodeTitle: false,
            popoverNodeUnit: false,
            popoverOneTimeDispensing: false,
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
            // allScenarioList: [],
            showOnlyActive: true,
            regionList: [],
            curTreeObj: {
                forecastMethod: { id: "" },
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
            usageText1: '',
            usageText2: '',
            usageText3: '',
            usageText4: '',
            usage2Convert: '',
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
            levelReorderJexcelLoader: false,
            levelReorderEl: "",
            showReorderJexcel: false,
            dropdownSources: {},
            childrenOfList: [],
            childrenOf: [],
            isLevelChanged: false,
            usage2ConvertCondition: true,
            copyModal: false,
            copyModalNode: "",
            copyModalData: "",
            copyModalTree: "",
            copyModalParentLevel: "",
            copyModalParentNode: "",
            copyModalTreeList: [],
            copyModalParentLevelList: [],
            copyModalParentNodeList: [],
            usage2ConvertCondition: true,
            copyModeling: true,
            copyLoader: false,
            invalidNodeError: false,
            invalidNodeType: "",
            invalidParentNodeType: "",
            downwardAggregationList: [],
            multiselectError: false,
            showConnections: true,
            sourceNodeUsageList: []
        }
        this.toggleStartValueModelingTool = this.toggleStartValueModelingTool.bind(this);
        this.getMomValueForDateRange = this.getMomValueForDateRange.bind(this);
        this.toggleDeropdownSetting = this.toggleDeropdownSetting.bind(this);
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
        this.toggleSenariotree2 = this.toggleSenariotree2.bind(this);
        this.toggleOneTimeDispensing = this.toggleOneTimeDispensing.bind(this);
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
        this.extrapolate = this.extrapolate.bind(this);
        this.calculateScalingTotal = this.calculateScalingTotal.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.formSubmitLoader = this.formSubmitLoader.bind(this);
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
        this.getRegionList = this.getRegionList.bind(this);
        this.updateMomDataInDataSet = this.updateMomDataInDataSet.bind(this);
        this.updateTreeData = this.updateTreeData.bind(this);
        this.updateState = this.updateState.bind(this);
        this.saveTreeData = this.saveTreeData.bind(this);
        this.calculateAfterDragDrop = this.calculateAfterDragDrop.bind(this);
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
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideThirdComponent = this.hideThirdComponent.bind(this);
        this.getMaxNodeDataId = this.getMaxNodeDataId.bind(this);
        this.exportPDF = this.exportPDF.bind(this);
        this.updateExtrapolationData = this.updateExtrapolationData.bind(this);
        this.round = this.round.bind(this);
        this.calculatePUPerVisit = this.calculatePUPerVisit.bind(this);
        this.createPUNode = this.createPUNode.bind(this);
        this.levelClicked = this.levelClicked.bind(this);
        this.levelDeatilsSaved = this.levelDeatilsSaved.bind(this);
        this.qatCalculatedPUPerVisit = this.qatCalculatedPUPerVisit.bind(this);
        this.calculateParentValueFromMOM = this.calculateParentValueFromMOM.bind(this);
        this.getNodeTransferList = this.getNodeTransferList.bind(this);
        this.generateBranchFromTemplate = this.generateBranchFromTemplate.bind(this);
        this.buildMissingPUJexcel = this.buildMissingPUJexcel.bind(this);
        this.autoCalculate = this.autoCalculate.bind(this);
        this.toggleTooltipAuto = this.toggleTooltipAuto.bind(this);
        this.getPlanningUnitWithPricesByIds = this.getPlanningUnitWithPricesByIds.bind(this);
        this.changedMissingPU = this.changedMissingPU.bind(this);
        this.procurementAgentList = this.procurementAgentList.bind(this);
        this.saveMissingPUs = this.saveMissingPUs.bind(this);
        this.updateMissingPUs = this.updateMissingPUs.bind(this);
        this.checkValidationForMissingPUs = this.checkValidationForMissingPUs.bind(this);
        this.buildModelingCalculatorJexcel = this.buildModelingCalculatorJexcel.bind(this);
        this.loadedModelingCalculatorJexcel = this.loadedModelingCalculatorJexcel.bind(this);
        this.changeModelingCalculatorJexcel = this.changeModelingCalculatorJexcel.bind(this);
        this.changed3 = this.changed3.bind(this);
        this.resetModelingCalculatorData = this.resetModelingCalculatorData.bind(this);
        this.validFieldData = this.validFieldData.bind(this);
        this.acceptValue1 = this.acceptValue1.bind(this);
        this.buildLevelReorderJexcel = this.buildLevelReorderJexcel.bind(this);
        this.shiftNode = this.shiftNode.bind(this);
        this.updateReorderTable = this.updateReorderTable.bind(this);
        this.resetLevelReorder = this.resetLevelReorder.bind(this);
        this.getChildrenOfList = this.getChildrenOfList.bind(this);
        this.childrenOfChanged = this.childrenOfChanged.bind(this);
        this.levelDropdownChange = this.levelDropdownChange.bind(this);
        this.copyModalTreeChange = this.copyModalTreeChange.bind(this);
        this.copyModalParentLevelChange = this.copyModalParentLevelChange.bind(this);
        this.copyModalParentNodeChange = this.copyModalParentNodeChange.bind(this);
        this.copyMoveNode = this.copyMoveNode.bind(this);
        this.resetCopyMoveModal = this.resetCopyMoveModal.bind(this);
        this.toggleTooltipNodeUnit = this.toggleTooltipNodeUnit.bind(this);
        this.setCopyModeling = this.setCopyModeling.bind(this);
        this.downwardAggregationListChange = this.downwardAggregationListChange.bind(this);
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidationForMissingPUs() {
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
        var validation = this.checkValidationForMissingPUs();
        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
        var curUser = AuthenticationService.getLoggedInUserId();
        let indexVar = 0;
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            var planningUnitList = [];
            var programs = [];
            var missingPUList = this.state.missingPUList;
            var updatedMissingPUList = [];
            var dataSetObj = this.state.dataSetObj;
            for (var i = 0; i < tableJson.length; i++) {
                if (tableJson[i][18].toString() == "true") {
                    var map1 = new Map(Object.entries(tableJson[i]));
                    let procurementAgentObj = "";
                    if (parseInt(map1.get("7")) === -1 || (map1.get("7")) == "") {
                        procurementAgentObj = null
                    } else {
                        procurementAgentObj = this.state.allProcurementAgentList.filter(c => c.id == parseInt(map1.get("7")))[0];
                    }
                    var planningUnitObj = this.state.planningUnitObjList.filter(c => c.planningUnitId == missingPUList[i].planningUnit.id)[0];
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
                    var program = filteredGetRequestList.filter(x => x.id == this.state.dataSetObj.id)[0];
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
                    var programDataListForPuCheck = this.state.programDataListForPuCheck;
                    var indexForPuCheck = programDataListForPuCheck.findIndex(c => c.id == dataSetObj.id);
                    programDataListForPuCheck[indexForPuCheck].programData = programData;
                    dataSetObj.programData = programData;
                    programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
                    program.programData = programData;
                    var transaction = db1.transaction(['datasetData'], 'readwrite');
                    var programTransaction = transaction.objectStore('datasetData');
                    programTransaction.put(program);
                    transaction.oncomplete = function (event) {
                        db1 = e.target.result;
                        var id = this.state.dataSetObj.id;
                        var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                        var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                        var datasetDetailsRequest = datasetDetailsTransaction.get(id);
                        datasetDetailsRequest.onsuccess = function (e) {
                            var datasetDetailsRequestJson = datasetDetailsRequest.result;
                            datasetDetailsRequestJson.changed = 1;
                            var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                            datasetDetailsRequest1.onsuccess = function (event) {
                                this.setState({
                                    missingPUList: updatedMissingPUList,
                                    dataSetObj: dataSetObj,
                                    fullPlanningUnitList: planningFullList,
                                    programDataListForPuCheck: programDataListForPuCheck
                                }, () => {
                                    this.hideThirdComponent()
                                    if (this.state.missingPUList.length > 0) {
                                        this.getMissingPuListBranchTemplate();
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
     * Saves planning units on submission
     */
    updateMissingPUs() {
        var validation = this.checkValidation();
        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
        var curUser = AuthenticationService.getLoggedInUserId();
        let indexVar = 0;
        if (validation == true) {
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
                    var dataSetObj = this.state.dataSetObj;
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    var filteredGetRequestList = myResult.filter(c => c.userId == userId);
                    var program = filteredGetRequestList.filter(x => x.id == this.state.dataSetObj.id)[0];
                    var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
                    var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                    var planningFullList = programData.planningUnitList;
                    var tableJson = this.el.getJson(null, false);
                    var updatedMissingPUList = [];
                    tableJson.forEach((p, index) => {
                        if (p[19].toString() == "true" && p[18].toString() == "true") {
                            indexVar = programData.planningUnitList.findIndex(c => c.planningUnit.id == this.state.missingPUList[index].planningUnit.id)
                            if (indexVar != -1) {
                                let procurementAgentObj = "";
                                if (parseInt(p[7]) === -1 || (p[7]) == "") {
                                    procurementAgentObj = null
                                } else {
                                    procurementAgentObj = this.state.allProcurementAgentList.filter(c => c.id == parseInt(p[7]))[0];
                                }
                                planningFullList[indexVar].consuptionForecast = p[2];
                                planningFullList[indexVar].treeForecast = p[3];
                                planningFullList[indexVar].stock = this.el.getValue(`E${parseInt(index) + 1}`, true).toString().replaceAll(",", "");
                                planningFullList[indexVar].existingShipments = this.el.getValue(`F${parseInt(index) + 1}`, true).toString().replaceAll(",", "");
                                planningFullList[indexVar].monthsOfStock = this.el.getValue(`G${parseInt(index) + 1}`, true).toString().replaceAll(",", "");
                                planningFullList[indexVar].procurementAgent = (procurementAgentObj == null ? null : {
                                    "id": parseInt(p[7]),
                                    "label": procurementAgentObj.label,
                                    "code": procurementAgentObj.code,
                                    "idString": "" + parseInt(p[7])
                                });
                                planningFullList[indexVar].price = this.el.getValue(`I${parseInt(index) + 1}`, true).toString().replaceAll(",", "");
                                planningFullList[indexVar].planningUnitNotes = p[9];
                            }
                        } else {
                            updatedMissingPUList.push(this.state.missingPUList[index])
                        }
                    })
                    programData.planningUnitList = planningFullList;
                    dataSetObj.programData = programData;
                    var programDataListForPuCheck = this.state.programDataListForPuCheck;
                    var indexForPuCheck = programDataListForPuCheck.findIndex(c => c.id == dataSetObj.id);
                    programDataListForPuCheck[indexForPuCheck].programData = programData;
                    var datasetListJexcel = programData;
                    programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
                    program.programData = programData;
                    var transaction = db1.transaction(['datasetData'], 'readwrite');
                    var programTransaction = transaction.objectStore('datasetData');
                    programTransaction.put(program);
                    transaction.oncomplete = function (event) {
                        db1 = e.target.result;
                        var id = (this.state.datasetIdModal + "_uId_" + userId).replace("~", "_");
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
                                    dataSetObj: dataSetObj,
                                    fullPlanningUnitList: planningFullList,
                                    programDataListForPuCheck: programDataListForPuCheck
                                }, () => {
                                    this.hideThirdComponent()
                                    if (this.state.missingPUList.length > 0) {
                                        this.getMissingPuListBranchTemplate();
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
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changedMissingPU = function (instance, cell, x, y, value) {
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
                        this.el.getValueFromCoords(8, y) != '' ? this.el.setValueFromCoords(8, y, '', true) : this.el.setValueFromCoords(8, y, '', true);
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
    }
    /**
     * This function is called when page is changed to make some cells readonly based on multiple condition
     * @param {*} el This is the DOM Element where sheet is created
     * @param {*} pageNo This the page number which is clicked
     * @param {*} oldPageNo This is the last page number that user had selected
     */
    onchangepageMissingPU(el, pageNo, oldPageNo) {
        if (!localStorage.getItem('sessionType') === 'Online') {
            var elInstance = el;
            var json = elInstance.getJson(null, false);
            var colArr = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'S'];
            var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
            if (jsonLength == undefined) {
                jsonLength = 15
            }
            if (json.length < jsonLength) {
                jsonLength = json.length;
            }
            var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
            for (var y = start; y < jsonLength; y++) {
                var colArr = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'S'];
                if (json[y][19].toString() == "true") {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                } else {
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
    /**
     * Reterives planning unit list with procurement agent price
     */
    getPlanningUnitWithPricesByIds() {
        PlanningUnitService.getPlanningUnitWithPricesByIds(this.state.missingPUList.map(ele => (ele.planningUnit.id).toString()))
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
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildMissingPUJexcel() {
        if (localStorage.getItem('sessionType') === 'Online') {
            this.getPlanningUnitWithPricesByIds();
        }
        var missingPUList = this.state.missingPUList;
        var dataArray = [];
        let count = 0;
        let forecastStartDate = this.state.dataSetObj.programData.currentVersion.forecastStartDate;
        let forecastStopDate = this.state.dataSetObj.programData.currentVersion.forecastStopDate;
        let beforeEndDateDisplay = new Date(forecastStartDate);
        beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);
        beforeEndDateDisplay = (!isNaN(beforeEndDateDisplay.getTime()) == false ? '' : months[new Date(beforeEndDateDisplay).getMonth()] + ' ' + new Date(beforeEndDateDisplay).getFullYear());
        var startDateDisplay = (forecastStartDate == '' ? '' : months[Number(moment(forecastStartDate).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDate).startOf('month').format("YYYY")));
        var endDateDisplay = (forecastStopDate == '' ? '' : months[Number(moment(forecastStopDate).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDate).startOf('month').format("YYYY")));
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
                data[19] = missingPUList[j].exists;
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
                },
                {
                    title: i18n.t('static.TreeForecast.TreeForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                },
                {
                    title: i18n.t('static.planningUnitSetting.stockEndOf') + ' ' + beforeEndDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true,
                    editable: localStorage.getItem('sessionType') === 'Online' ? true : false,
                    readOnly: localStorage.getItem('sessionType') === 'Online' ? false : true
                },
                {
                    title: i18n.t('static.planningUnitSetting.existingShipments') + startDateDisplay + ' - ' + endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true,
                    editable: localStorage.getItem('sessionType') === 'Online' ? true : false,
                    readOnly: localStorage.getItem('sessionType') === 'Online' ? false : true
                },
                {
                    title: i18n.t('static.planningUnitSetting.desiredMonthsOfStock') + ' ' + endDateDisplay + ')',
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##',
                    disabledMaskOnEdition: true,
                    width: '150',
                    editable: localStorage.getItem('sessionType') === 'Online' ? true : false,
                    readOnly: localStorage.getItem('sessionType') === 'Online' ? false : true
                },
                {
                    title: i18n.t('static.forecastReport.priceType'),
                    type: 'autocomplete',
                    source: this.state.allProcurementAgentList,
                    width: '120',
                    editable: localStorage.getItem('sessionType') === 'Online' ? true : false,
                    readOnly: localStorage.getItem('sessionType') === 'Online' ? false : true
                },
                {
                    title: i18n.t('static.forecastReport.unitPrice'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##.00',
                    width: '120',
                    disabledMaskOnEdition: true,
                    editable: localStorage.getItem('sessionType') === 'Online' ? true : false,
                    readOnly: localStorage.getItem('sessionType') === 'Online' ? false : true
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    editable: localStorage.getItem('sessionType') === 'Online' ? true : false,
                    readOnly: localStorage.getItem('sessionType') === 'Online' ? false : true
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
                    type: 'checkbox',
                },
                {
                    title: 'exists',
                    type: 'hidden',
                    readOnly: true
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
            onchange: this.changedMissingPU,
            onload: this.loadedMissingPU,
            onchangepage: this.onchangepageMissingPU,
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
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedMissingPU = function (instance, cell) {
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
        if (!localStorage.getItem('sessionType') === 'Online') {
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
            var colArr = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'S'];
            for (var j = 0; j < jsonLength; j++) {
                if (json[j][19].toString() == "true") {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                        cell.classList.remove('readonly');
                    }
                } else {
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
    /**
     * Get missing planning unit list for branch template
     */
    getMissingPuListBranchTemplate() {
        if (this.state.branchTemplateId != "") {
            var missingPUList = [];
            var json;
            var treeTemplate = this.state.branchTemplateList.filter(x => x.treeTemplateId == this.state.branchTemplateId)[0];
            var puNodeList = treeTemplate.flatList.filter(x => x.payload.nodeType.id == 5);
            var planningUnitList = this.state.fullPlanningUnitList;
            for (let i = 0; i < puNodeList.length; i++) {
                if (planningUnitList.filter(x => x.treeForecast == true && x.active == true && x.planningUnit.id == puNodeList[i].payload.nodeDataMap[0][0].puNode.planningUnit.id).length == 0) {
                    var parentNodeData = treeTemplate.flatList.filter(x => x.id == puNodeList[i].parent)[0];
                    var productCategory = "";
                    productCategory = parentNodeData.payload.nodeDataMap[0][0].fuNode.forecastingUnit.productCategory;
                    if (productCategory == undefined) {
                        var forecastingUnit = this.state.forecastingUnitList.filter(c => c.forecastingUnitId == parentNodeData.payload.nodeDataMap[0][0].fuNode.forecastingUnit.id);
                        productCategory = forecastingUnit[0].productCategory;
                    }
                    let existingPU = planningUnitList.filter(x => x.planningUnit.id == puNodeList[i].payload.nodeDataMap[0][0].puNode.planningUnit.id);
                    if (existingPU.length > 0) {
                        json = {
                            productCategory: productCategory,
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
                            createdDate: existingPU[0].createdDate,
                            exists: true
                        }
                        missingPUList.push(json);
                    } else {
                        json = {
                            productCategory: productCategory,
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
                            createdDate: null,
                            exists: false
                        };
                        missingPUList.push(json);
                    }
                }
            }
            if (missingPUList.length > 0) {
                missingPUList = missingPUList.filter((v, i, a) => a.findIndex(v2 => (v2.planningUnit.id === v.planningUnit.id)) === i)
            }
            this.setState({
                missingPUList,
                branchTemplateNotes: treeTemplate.notes
            }, () => {
                this.buildMissingPUJexcel();
            });
        } else {
            this.el = jexcel(document.getElementById("missingPUJexcel"), '');
            jexcel.destroy(document.getElementById("missingPUJexcel"), true);
            this.setState({
                missingPUList: []
            })
        }
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
            var momList = item[0].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList;
            if (momList.length > 0) {
                var mom = momList.filter(x => moment(x.month).format("YYYY-MM-DD") == moment(startDate).format("YYYY-MM-DD"));
                if (mom.length > 0) {
                    startValue = mom[0].startValue;
                }
            }
        } else {
            startValue = this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].dataValue
        }
        return startValue;
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
     * Handles the click event for a level. Extracts information about the clicked level from the provided data and updates the component state with the level's name, number, and unit. If the provided data is empty, no action is taken.
     * @param {Object} data The data object containing information about the clicked level.
     */
    levelClicked(data) {
        var name = "";
        var unit = "";
        var levelNo = "";
        var oldItems;
        var cf = true;
        if (data != "") {
            oldItems = JSON.parse(JSON.stringify(this.state.curTreeObj.tree.flatList));
            var treeLevelList = this.state.curTreeObj.levelList != undefined ? this.state.curTreeObj.levelList : [];
            var levelListFiltered = treeLevelList.filter(c => c.levelNo == data.context.levels[0]);
            levelNo = data.context.levels[0]
            if (levelListFiltered.length > 0) {
                name = levelListFiltered[0].label.label_en;
                unit = levelListFiltered[0].unit != null && levelListFiltered[0].unit.id != null ? levelListFiltered[0].unit.id : "";
            }
            this.setState({ oldItems })
        }
        if (data == "") {
            if (this.state.isLevelChanged == true) {
                cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
                if (cf == true) {
                    let { curTreeObj } = this.state;
                    var items = curTreeObj.tree.flatList;
                    items = JSON.parse(JSON.stringify(this.state.oldItems));
                    curTreeObj.tree.flatList = JSON.parse(JSON.stringify(this.state.oldItems));
                    this.setState({
                        isLevelChanged: false,
                        curTreeObj,
                        items
                    })
                } else {
                }
            } else {
                let { curTreeObj } = this.state;
                var items = curTreeObj.tree.flatList;
                items = JSON.parse(JSON.stringify(this.state.oldItems));
                curTreeObj.tree.flatList = JSON.parse(JSON.stringify(this.state.oldItems));
                this.setState({
                    isLevelChanged: false,
                    curTreeObj,
                    items
                })
            }
        }
        if (data == "" && cf == false) {
            this.setState({
                levelModal: true
            })
        } else {
            this.setState({
                levelModal: data == "" || data.width ? !this.state.levelModal : true,
                levelName: name,
                levelNo: levelNo,
                levelUnit: unit,
                showReorderJexcel: true,
                childrenOf: []
            }, () => {
                setTimeout(() => {
                    this.getChildrenOfList();
                    this.buildLevelReorderJexcel();
                }, 0)
            })
        }
    }
    /**
     * Updates the selected level
     * @param {*} e The event object representing the level selection change event.
     */
    levelDropdownChange(e) {
        var data = {
            context: {
                levels: []
            }
        };
        data.context.levels.push(e.target.value);
        var cf = true;
        if (this.state.isLevelChanged == true) {
            cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                let { curTreeObj } = this.state;
                var items = curTreeObj.tree.flatList;
                items = JSON.parse(JSON.stringify(this.state.oldItems));
                curTreeObj.tree.flatList = JSON.parse(JSON.stringify(this.state.oldItems));
                this.setState({
                    isLevelChanged: false,
                    curTreeObj,
                    items
                }, () => {
                    this.levelClicked(data);
                })
            } else {
            }
        } else {
            this.levelClicked(data);
        }
    }
    /**
     * Resets the reorder level
     */
    resetLevelReorder() {
        this.getChildrenOfList();
        let { curTreeObj } = this.state;
        var items = curTreeObj.tree.flatList;
        items = JSON.parse(JSON.stringify(this.state.oldItems));
        curTreeObj.tree.flatList = JSON.parse(JSON.stringify(this.state.oldItems));
        this.setState({
            levelName: curTreeObj.levelList.filter(m => m.levelNo == this.state.levelNo)[0].label.label_en,
            levelUnit: curTreeObj.levelList.filter(m => m.levelNo == this.state.levelNo)[0].unit.id,
            isLevelChanged: false,
            curTreeObj,
            items
        }, () => {
            this.buildLevelReorderJexcel();
        })
    }
    /**
     * Sets the state to copy modeling data.
     * @param {Event} e - The change event.
     * @returns {void}
     */
    setCopyModeling(e) {
        this.setState({
            copyModeling: e.target.checked
        }, () => {
        })
    }
    /**
     * Function to get the list of all parents
     */
    getChildrenOfList() {
        var levelNodes = this.state.curTreeObj.tree.flatList.filter(m => m.level == this.state.levelNo);
        var dataArray = [];
        let count = 0;
        var oldParent = 0;
        var newParent = 0;
        for (var j = 0; j < levelNodes.length; j++) {
            var data = {};
            newParent = levelNodes[j].parent;
            if (oldParent != newParent) {
                var parentNode = this.state.curTreeObj.tree.flatList.filter(m => m.id == levelNodes[j].parent);
                oldParent = newParent;
                data.label = parentNode.length > 0 ? parentNode[0].payload.label.label_en : "";
                data.value = oldParent;
                dataArray[count] = data;
                j--;
                count++;
            }
        }
        this.setState({
            childrenOfList: dataArray,
            childrenOf: dataArray
        })
    }
    /**
     * Updates the component state with the new parent ID for a level when the parent selection is changed.
     * @param {*} e The event object representing the parent selection change event.
     */
    childrenOfChanged(e) {
        var cf = true;
        if (this.state.isLevelChanged == true) {
            cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                let { curTreeObj } = this.state;
                var items = curTreeObj.tree.flatList;
                items = JSON.parse(JSON.stringify(this.state.oldItems));
                curTreeObj.tree.flatList = JSON.parse(JSON.stringify(this.state.oldItems));
                this.setState({
                    childrenOf: e,
                    isLevelChanged: false,
                    curTreeObj,
                    items
                }, () => {
                    this.buildLevelReorderJexcel();
                })
            } else {
            }
        } else {
            let { curTreeObj } = this.state;
            var items = curTreeObj.tree.flatList;
            items = JSON.parse(JSON.stringify(this.state.oldItems));
            curTreeObj.tree.flatList = JSON.parse(JSON.stringify(this.state.oldItems));
            this.setState({
                childrenOf: e,
                isLevelChanged: false,
                curTreeObj,
                items
            }, () => {
                this.buildLevelReorderJexcel();
            })
        }
    }
    /**
     * Builds jexcel table for node reordering on same level
     */
    buildLevelReorderJexcel(isShiftNode) {
        var levelNodes = [];
        if (this.state.childrenOf.length > 0) {
            levelNodes = this.state.curTreeObj.tree.flatList.filter(m => m.level == this.state.levelNo);
            levelNodes.sort((a, b) => a.parent - b.parent);
            var flatListUnsorted = levelNodes;
            var sortOrderArray = [...new Set(flatListUnsorted.map(ele => (ele.sortOrder)))];
            var sortedArray = sortOrderArray.sort();
            levelNodes = [];
            for (var i = 0; i < sortedArray.length; i++) {
                levelNodes.push(flatListUnsorted.filter(c => c.newSortOrder ? c.newSortOrder == sortedArray[i] : c.sortOrder == sortedArray[i])[0]);
            }
            let tempList = this.state.childrenOf.map(co => co.value);
            levelNodes = levelNodes.filter(m => tempList.includes(m.parent));
        }
        var flatList = this.state.curTreeObj.tree.flatList;
        var dataArray = [];
        let count = 0;
        var oldParent = 0;
        var newParent = 0;
        var levelCount = 1;
        var dropdownSources = this.state.dropdownSources;
        for (var j = 0; j < levelNodes.length; j++) {
            data = [];
            newParent = levelNodes[j].parent;
            if (oldParent != newParent) {
                dropdownSources[count] = [];
                dropdownSources[count].push({ id: 0, name: "Parent Node" });
                var parentNode = this.state.curTreeObj.tree.flatList.filter(m => m.id == levelNodes[j].parent);
                levelCount = 1;
                oldParent = newParent;
                data[0] = levelNodes[j].sortOrder;
                data[1] = "Parent Node";
                data[2] = parentNode.length > 0 ? parentNode[0].payload.label.label_en : "";
                data[3] = levelNodes[j].id;
                data[4] = newParent;
                dataArray[count] = data;
                j--;
            } else {
                dropdownSources[count] = [];
                dropdownSources[count].push({ id: levelCount, name: levelCount.toString() });
                data[0] = levelNodes[j].sortOrder;
                data[1] = "Position " + levelCount.toString();
                data[2] = levelNodes[j].payload.label.label_en;
                data[3] = levelNodes[j].id;
                data[4] = newParent;
                dataArray[count] = data;
                levelCount++;
            }
            count++;
        }
        this.setState({
            dropdownSources
        })
        if (document.getElementById("levelReorderJexcel") != null) {
            this.el = jexcel(document.getElementById("levelReorderJexcel"), '');
        } else {
            this.el = "";
        }
        if (document.getElementById("levelReorderJexcel") != null) {
            jexcel.destroy(document.getElementById("levelReorderJexcel"), true);
        }
        var data = dataArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [60, 80, 20, 20],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: "Node Id",
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.nodeltr'),
                    type: 'text',
                    readOnly: false,
                    width: 70
                },
                {
                    title: i18n.t('static.tree.nodeName'),
                    type: 'text',
                    readOnly: true,
                    width: 120
                },
                {
                    title: "Node Id",
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: "Parent Id",
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.shiftUp'),
                    type: 'text',
                    readOnly: true,
                    width: 40
                },
                {
                    title: i18n.t('static.tree.shiftDown'),
                    type: 'text',
                    readOnly: true,
                    width: 40
                },
            ],
            updateTable: this.updateReorderTable,
            editable: true,
            onload: this.loadedLevelReorder,
            pagination: false,
            search: false,
            columnSorting: false,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            // onchange: this.changed1,
            copyCompatibility: true,
            allowExport: false,
            // paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: false,
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        if (document.getElementById("levelReorderJexcel") != null) {
            var levelReorderEl = jexcel(document.getElementById("levelReorderJexcel"), options);
            this.el = levelReorderEl;
        } else {
            var levelReorderEl = "";
        }
        this.setState({
            levelReorderEl: levelReorderEl
        });
    };
    /**
     * This function is used to format the table and add readonly class to cell
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedLevelReorder = function (instance, cell) {
        jExcelLoadedFunctionWithoutPagination(instance, 0);
        var json = instance.worksheets[0].getJson(null, false);
        var colArr = ["A", "B", "C"]
        for (var j = 0; j < json.length; j++) {
            for (var i = 0; i < colArr.length; i++) {
                var cell = instance.worksheets[0].getCell(colArr[i] + (j + 1))
                cell.classList.add('readonly');
                if (json[j][1] == 'Parent Node') {
                    cell.classList.add('productValidationSubTotalClass');
                }
            }
        }
    }
    /**
     * Update the reorder jexcel to add button to shift node up or down
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     * @param {*} col The column object if applicable.
     * @param {*} row The row object if applicable.
     */
    updateReorderTable(instance, cell, col, row) {
        var rowData = instance.getRowData(row);
        var rowDataPrev = instance.getRowData(row - 1);
        var rowDataNext = instance.getRowData(row + 1);
        var showUpArrow = rowDataPrev[1] != 'Parent Node' && rowDataPrev[1] != undefined ? true : false;
        var showDownArrow = rowDataNext[1] != 'Parent Node' && rowDataNext[1] != undefined ? true : false;
        if (col === 5 && rowData[1] != 'Parent Node' && showUpArrow) {
            cell.innerHTML = '';
            const button = document.createElement('button');
            button.type = 'button';
            button.innerHTML = '\u2191';
            button.style.pointerEvents = 'auto';
            button.onclick = (event) => {
                event.stopPropagation();
                var flatList = this.state.curTreeObj.tree.flatList;
                var currNode = flatList.filter(f => f.id == rowData[3]);
                var prevNode = flatList.filter(f => f.id == rowDataPrev[3]);
                this.shiftNode(event, currNode, prevNode)
            };
            cell.appendChild(button);
        }
        if (col === 6 && rowData[1] != 'Parent Node' && showDownArrow) {
            cell.innerHTML = '';
            const button = document.createElement('button');
            button.type = 'button';
            button.innerHTML = '\u2193';
            button.style.pointerEvents = 'auto';
            button.onclick = (event) => {
                event.stopPropagation();
                var flatList = this.state.curTreeObj.tree.flatList;
                var currNode = flatList.filter(f => f.id == rowData[3]);
                var nextNode = flatList.filter(f => f.id == rowDataNext[3]);
                this.shiftNode(event, currNode, nextNode)
            };
            cell.appendChild(button);
        }
    }
    /**
     * Function to shift node up or down by clicking on button
     * @param {*} event The event object representing the button click event.
     * @param {*} currNode Object of Current Node
     * @param {*} prevNode Object of Previous Node
     */
    shiftNode(event, currNode, prevNode) {
        event.stopPropagation();
        let { curTreeObj } = this.state;
        var items = curTreeObj.tree.flatList;
        var currNodeIndex = items.findIndex(f => f.id == currNode[0].id);
        var prevNodeIndex = items.findIndex(f => f.id == prevNode[0].id);
        var temp = items[prevNodeIndex];
        items[prevNodeIndex] = items[currNodeIndex];
        items[currNodeIndex] = temp;
        let pId = items.filter(f => f.id == currNode[0].id)[0].parent;
        var pObj = items.filter(f => f.id == pId)[0];
        let newItems = items.filter(f => f.parent == pId);
        for (let i = 0; i < newItems.length; i++) {
            var ns = items.findIndex(f => f.id == newItems[i].id);
            items[ns].newSortOrder = pObj.sortOrder + "." + (i < 10 ? '0' + (i + 1) : i + 1);
        }
        this.setState({
            isLevelChanged: true,
            items
        }, () => {
            this.buildLevelReorderJexcel(true);
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
        const { curTreeObj } = this.state;
        var treeLevelList = this.state.curTreeObj.levelList != undefined ? this.state.curTreeObj.levelList : [];
        var levelListFiltered = treeLevelList.findIndex(c => c.levelNo == this.state.levelNo);
        var items = this.state.items;
        items.forEach(function (e) {
            e.oldSortOrder = e.sortOrder;
        });
        var shiftedNode = items.filter(e => e.newSortOrder);
        shiftedNode.forEach(val => {
            items.forEach(item => {
                if (item.oldSortOrder.includes(val.oldSortOrder)) {
                    var itemSplit = item.sortOrder.split(val.oldSortOrder);
                    if (itemSplit.length > 1)
                        item.sortOrder = val.newSortOrder + itemSplit[1];
                    else
                        item.sortOrder = val.newSortOrder;
                }
            });
        })
        items.forEach(item => {
            delete item.newSortOrder;
            delete item.oldSortOrder;
        })
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
        curTreeObj.levelList = treeLevelList;
        this.setState({
            curTreeObj,
            isLevelChanged: false
        }, () => {
            this.saveTreeData(false, false)
        });
    }
    copyMoveChange(event) {
        let val;
        let copyModalTree = this.state.treeId;
        let copyModalParentLevel;
        let copyModalParentNode;
        let copyModalTreeList = [];
        let copyModalParentLevelList = [];
        let tempCopyModalParentLevelList = [];
        let copyModalParentNodeList = [];
        let allowedNodeTypeList = [];
        allowedNodeTypeList = this.state.nodeTypeList.filter(x => x.allowedChildList.includes(this.state.copyModalNode.payload.nodeType.id)).map(x => x.id);
        if (event.target.name === "copyMove") {
            val = event.target.id === "copyMoveTrue" ? 1 : 2;
        }
        copyModalTreeList = this.state.treeData;
        copyModalParentLevelList = this.state.curTreeObj.levelList;
        tempCopyModalParentLevelList = [...new Set(copyModalTreeList.filter(x => x.treeId == copyModalTree)[0].tree.flatList.filter(x => x.level != null && x.level != "").map(x => x.level))];
        if (tempCopyModalParentLevelList.length > copyModalParentLevelList.length) {
            for (var i = 0; i < (tempCopyModalParentLevelList.length - copyModalParentLevelList.length); i++) {
                copyModalParentLevelList.pop()
            }
            // copyModalParentLevelList = [];
            // for (var i = 0; i < tempCopyModalParentLevelList.length; i++) {
            //     copyModalParentLevelList.push({
            //         label: { label_en: "Level " + i },
            //         levelNo: i
            //     })
            // }
        } else if (tempCopyModalParentLevelList.length < copyModalParentLevelList.length) {
            copyModalParentLevelList = copyModalParentLevelList.filter(x => tempCopyModalParentLevelList.includes(x.levelNo))
        }
        if (this.state.copyModalNode.payload.nodeType.id == 5) {
            let allowedNodeTypeList = this.state.nodeTypeList.filter(x => x.allowedChildList.includes(parseInt(this.state.copyModalNode.payload.nodeType.id))).map(x => parseInt(x.id));
            let invalidLevel = [];
            for (let i = 0; i < copyModalParentLevelList.length; i++) {
                let tempCopyModalParentNodeList = copyModalTreeList.filter(x => x.treeId == copyModalTree)[0].tree.flatList.filter(m => m.level == copyModalParentLevelList[i].levelNo).filter(x => allowedNodeTypeList.includes(parseInt(x.payload.nodeType.id)));
                if (tempCopyModalParentNodeList.length == 0) {
                    invalidLevel.push(copyModalParentLevelList[i])
                }
            }
            copyModalParentLevelList = copyModalParentLevelList.filter(x => !invalidLevel.includes(x))
        }
        if (val == 1) {
            if (this.state.copyModalNode.level != 0) {
                copyModalParentLevel = this.state.copyModalNode.level - 1;
                copyModalParentNodeList = this.state.curTreeObj.tree.flatList.filter(m => m.level == copyModalParentLevel);
                copyModalParentNode = this.state.copyModalNode.parent;
            } else {
                copyModalParentLevel = "";
                copyModalParentNodeList = [];
                copyModalParentNode = "";
            }
        } else if (val == 2) {
            if (copyModalParentLevelList.length == 1) {
                copyModalParentLevel = copyModalParentLevelList[0].levelNo;
                copyModalParentNodeList = this.state.curTreeObj.tree.flatList.filter(m => m.level == copyModalParentLevel);
                if (copyModalParentNodeList.length == 1) {
                    copyModalParentNode = copyModalParentNodeList[0].id;
                } else {
                    copyModalParentNode = "";
                }
            } else {
                copyModalParentLevel = "";
                copyModalParentNode = "";
                copyModalParentNodeList = [];
            }
        }
        this.setState({
            copyModalData: val,
            copyModalTree: copyModalTree,
            copyModalTreeList: copyModalTreeList,
            copyModalParentLevelList: copyModalParentLevelList,
            copyModalParentLevel: copyModalParentLevel,
            copyModalParentNodeList: copyModalParentNodeList,
            copyModalParentNode: copyModalParentNode
        }, () => {
            validationSchemaCopyMove();
        })
    }
    copyModalTreeChange(event) {
        let copyModalTree = event.target.value;
        let copyModalParentLevel;
        let copyModalParentNode;
        let copyModalTreeList = [];
        let copyModalParentLevelList = [];
        let tempCopyModalParentLevelList = [];
        let copyModalParentNodeList = [];
        let allowedNodeTypeList = [];
        let invalidNodeError = false;
        let invalidNodeType = "";
        let invalidParentNodeType = "";
        allowedNodeTypeList = this.state.nodeTypeList.filter(x => x.allowedChildList.includes(this.state.copyModalNode.payload.nodeType.id)).map(x => x.id);
        copyModalTreeList = this.state.treeData;
        copyModalParentLevelList = copyModalTreeList.filter(x => x.treeId == copyModalTree)[0].levelList;
        tempCopyModalParentLevelList = [...new Set(copyModalTreeList.filter(x => x.treeId == copyModalTree)[0].tree.flatList.filter(x => x.level != null).map(x => x.level))];
        if (tempCopyModalParentLevelList.length > copyModalParentLevelList.length) {
            copyModalParentLevelList = [];
            for (var i = 0; i < tempCopyModalParentLevelList.length; i++) {
                copyModalParentLevelList.push({
                    label: { label_en: "Level " + i },
                    levelNo: i
                })
            }
        } else if (tempCopyModalParentLevelList.length < copyModalParentLevelList.length) {
            copyModalParentLevelList = copyModalParentLevelList.filter(x => tempCopyModalParentLevelList.includes(x.levelNo))
        }
        if (this.state.copyModalNode.payload.nodeType.id == 5) {
            let allowedNodeTypeList = this.state.nodeTypeList.filter(x => x.allowedChildList.includes(parseInt(this.state.copyModalNode.payload.nodeType.id))).map(x => parseInt(x.id));
            let invalidLevel = [];
            for (let i = 0; i < copyModalParentLevelList.length; i++) {
                let tempCopyModalParentNodeList = this.state.copyModalTreeList.filter(x => x.treeId == this.state.copyModalTree)[0].tree.flatList.filter(m => m.level == copyModalParentLevelList[i].levelNo).filter(x => allowedNodeTypeList.includes(parseInt(x.payload.nodeType.id)));
                if (tempCopyModalParentNodeList.length == 0) {
                    invalidLevel.push(copyModalParentLevelList[i])
                }
            }
            copyModalParentLevelList = copyModalParentLevelList.filter(x => !invalidLevel.includes(x))
        }
        if (this.state.copyModalData == 1 && copyModalTree == this.state.treeId) {
            copyModalParentLevel = this.state.copyModalNode.level - 1;
            if (this.state.copyModalNode.payload.nodeType.id == 5) {
                copyModalParentNodeList = copyModalTreeList.filter(x => x.treeId == copyModalTree)[0].tree.flatList.filter(m => m.level == copyModalParentLevel).filter(x => allowedNodeTypeList.includes(x.payload.nodeType.id));
            } else {
                copyModalParentNodeList = copyModalTreeList.filter(x => x.treeId == copyModalTree)[0].tree.flatList.filter(m => m.level == copyModalParentLevel);
            }
            copyModalParentNode = this.state.copyModalNode.parent;
        } else if (this.state.copyModalData == 2 || copyModalTree != this.state.treeId) {
            if (copyModalParentLevelList.length == 1) {
                copyModalParentLevel = copyModalParentLevelList[0].levelNo;
                copyModalParentNodeList = copyModalTreeList.filter(x => x.treeId == copyModalTree)[0].tree.flatList.filter(m => m.level == copyModalParentLevel);
                if (copyModalParentNodeList.length == 1) {
                    copyModalParentNode = copyModalParentNodeList[0].id;
                    let allowedNodeTypeList = [];
                    allowedNodeTypeList = this.state.nodeTypeList.filter(x => x.allowedChildList.includes(parseInt(this.state.copyModalNode.payload.nodeType.id))).map(x => parseInt(x.id));
                    let tempParentNode = copyModalParentNodeList.filter(x => x.id == copyModalParentNode)[0].payload.nodeType.id;
                    if (allowedNodeTypeList.includes(parseInt(tempParentNode))) {
                        invalidNodeError = false;
                    } else {
                        invalidNodeError = true;
                        invalidNodeType = this.state.copyModalNode.payload.nodeType.id;
                        invalidParentNodeType = tempParentNode;
                    }
                } else {
                    copyModalParentNode = "";
                }
            } else {
                copyModalParentLevel = "";
                copyModalParentNode = "";
                copyModalParentNodeList = [];
            }
        }
        this.setState({
            copyModalTree: copyModalTree,
            copyModalTreeList: copyModalTreeList,
            copyModalParentLevelList: copyModalParentLevelList,
            copyModalParentLevel: copyModalParentLevel,
            copyModalParentNodeList: copyModalParentNodeList,
            copyModalParentNode: copyModalParentNode,
            invalidNodeError: invalidNodeError,
            invalidNodeType: invalidNodeType,
            invalidParentNodeType: invalidParentNodeType
        }, () => {
            validationSchemaCopyMove();
        })
    }
    copyModalParentLevelChange(e) {
        let allowedNodeTypeList = [];
        let invalidNodeError = false;
        let invalidNodeType = "";
        let invalidParentNodeType = "";
        allowedNodeTypeList = this.state.nodeTypeList.filter(x => x.allowedChildList.includes(parseInt(this.state.copyModalNode.payload.nodeType.id))).map(x => parseInt(x.id));
        let copyModalParentNodeList;
        if (this.state.copyModalNode.payload.nodeType.id == 5) {
            copyModalParentNodeList = this.state.copyModalTreeList.filter(x => x.treeId == this.state.copyModalTree)[0].tree.flatList.filter(m => m.level == e.target.value).filter(x => allowedNodeTypeList.includes(parseInt(x.payload.nodeType.id)));
        } else {
            copyModalParentNodeList = this.state.copyModalTreeList.filter(x => x.treeId == this.state.copyModalTree)[0].tree.flatList.filter(m => m.level == e.target.value);
        }
        if (this.state.copyModalData == 2) {
            if (this.state.copyModalTree == this.state.treeId) {
                copyModalParentNodeList = copyModalParentNodeList.filter(x => x.id != this.state.copyModalNode.parent)
                copyModalParentNodeList = copyModalParentNodeList.filter(x => !x.sortOrder.startsWith(this.state.copyModalNode.sortOrder))
            }
        }
        if (copyModalParentNodeList.length == 1) {
            let allowedNodeTypeList = [];
            allowedNodeTypeList = this.state.nodeTypeList.filter(x => x.allowedChildList.includes(parseInt(this.state.copyModalNode.payload.nodeType.id))).map(x => parseInt(x.id));
            let tempParentNode = copyModalParentNodeList.filter(x => x.id == copyModalParentNodeList[0].id)[0].payload.nodeType.id;
            if (allowedNodeTypeList.includes(parseInt(tempParentNode))) {
                invalidNodeError = false;
            } else {
                invalidNodeError = true;
                invalidNodeType = this.state.copyModalNode.payload.nodeType.id;
                invalidParentNodeType = tempParentNode;
            }
        }
        this.setState({
            copyModalParentLevel: e.target.value,
            copyModalParentNodeList: copyModalParentNodeList,
            copyModalParentNode: copyModalParentNodeList.length == 1 ? copyModalParentNodeList[0].id : "",
            invalidNodeError: invalidNodeError,
            invalidNodeType: invalidNodeType,
            invalidParentNodeType: invalidParentNodeType
        })
    }
    copyModalParentNodeChange(e) {
        let allowedNodeTypeList = [];
        let invalidNodeError = false;
        let invalidNodeType = "";
        let invalidParentNodeType = "";
        allowedNodeTypeList = this.state.nodeTypeList.filter(x => x.allowedChildList.includes(parseInt(this.state.copyModalNode.payload.nodeType.id))).map(x => parseInt(x.id));
        let tempParentNode = this.state.copyModalParentNodeList.filter(x => x.id == e.target.value)[0].payload.nodeType.id;
        if (allowedNodeTypeList.includes(parseInt(tempParentNode))) {
            invalidNodeError = false;
        } else {
            invalidNodeError = true;
            invalidNodeType = this.state.copyModalNode.payload.nodeType.id;
            invalidParentNodeType = tempParentNode;
        }
        this.setState({
            copyModalParentNode: e.target.value,
            invalidNodeError: invalidNodeError,
            invalidNodeType: invalidNodeType,
            invalidParentNodeType: invalidParentNodeType
        })
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
    getMaxNodeDataId(isCopy) {
        var maxNodeDataId = 0;
        var items = isCopy ? this.state.treeData.filter(x => x.treeId == this.state.copyModalTree)[0].tree.flatList : this.state.items;
        var nodeDataMap = [];
        var nodeDataMapIdArr = [];
        for (let i = 0; i < items.length; i++) {
            var scenarioList = isCopy ? this.state.treeData.filter(x => x.treeId == this.state.copyModalTree)[0].scenarioList : this.state.scenarioList;
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
     * Show loading screen on form submit and call formSubmit function
     */
    formSubmitLoader() {
        this.setState({
            modelingJexcelLoader: true
        }, () => {
            setTimeout(() => {
                this.formSubmit();
            }, 0);
        })
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
     * Calls modeling data calculation function to calculate month on month data
     * @param {*} nodeId Node Id for which the month on month should be built
     * @param {*} type Type of the node
     */
    calculateMOMData(nodeId, type, isCopy, treeList) {
        return new Promise((resolve, reject) => {
            let curTreeObj;
            var items;
            if (isCopy) {
                curTreeObj = this.state.treeData.filter(x => x.treeId == this.state.copyModalTree)[0];
                items = curTreeObj.tree.flatList;
            } else {
                curTreeObj = this.state.curTreeObj;
                items = this.state.items;
            }
            let { treeData } = this.state;
            let { dataSetObj } = this.state;
            var programData = dataSetObj.programData;
            programData.treeList = treeData;
            if (!isCopy) {
                if (this.state.selectedScenario !== "") {
                    curTreeObj.tree.flatList = items;
                }
                curTreeObj.scenarioList = this.state.scenarioList;
            }
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
                if (isCopy) {
                    calculateModelingData(dataSetObj, this, '', -1, -1, type, [this.state.treeId, this.state.copyModalTree].toString(), false, false, this.state.autoCalculate, true).then(() => {
                        resolve();
                    });
                } else {
                    calculateModelingData(dataSetObj, this, '', (nodeId != 0 ? nodeId : this.state.currentItemConfig.context.id), curTreeObj.scenarioList[0].id, type, (treeList != undefined ? treeList.toString() : curTreeObj.treeId), false, false, this.state.autoCalculate).then(() => {
                        resolve();
                    });
                }
            } else {
                this.saveTreeData(false, false);
                this.setState({
                    loading: false,
                    modelingJexcelLoader: false,
                    momJexcelLoader: false,
                    message1: "Data updated successfully"
                }, () => {
                    resolve();
                })
            }
            // resolve();
        });
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
     * Function to show alerts 
     */
    alertfunction() {
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
                var parentCalculatedDataValue = this.state.items.filter(x => x.id == currentItemConfig.context.parent)[0].payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue;
                currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].dataValue = 100;
                currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue = ((100 * parentCalculatedDataValue) / 100).toString();
            }
            var planningUnit = this.state.updatedPlanningUnitList.filter(x => x.id == currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id);
            var conversionFactor = planningUnit.length > 0 ? planningUnit[0].multiplier : "";
            this.setState({
                conversionFactor
            }, () => {
                this.getUsageText();
            });
        } else if (nodeTypeId == 4 && !this.state.addNodeFlag) {
            fuValues = { value: orgCurrentItemConfig.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.id, label: getLabelText(orgCurrentItemConfig.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.label, this.state.lang) + " | " + orgCurrentItemConfig.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.id };
        }
        this.setState({
            currentItemConfig,
            currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0],
            usageTemplateId: "",
            fuValues: fuValues,
            usageText: ""
        }, () => {
            if (nodeTypeId == 4) {
                this.getForecastingUnitListByTracerCategoryId(0, 0);
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
            if (items[i].payload.nodeType.id == 1 || items[i].payload.nodeType.id == 6 || items[i].payload.nodeType.id == 2) {
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
            try {
                if (localStorage.getItem("openNodeId")) {
                    let tempData = {
                        context: '',
                        parentItem: ''
                    };
                    tempData.context = this.state.items.filter(t => t.id == localStorage.getItem("openNodeId"))[0];
                    tempData.parentItem = this.state.items.filter(t => t.id == tempData.context.parent)[0];
                    localStorage.removeItem("openNodeId");
                    setTimeout(() => {
                        this.onCursoChanged("", tempData);
                    }, 2000)
                }
            } catch (e) {
                localStorage.removeItem("openNodeId");
            }
            this.handleAMonthDissmis3(this.state.singleValue2, 0);
        });
    }
    /**
     * Toggle info popup
     */
    toggleStartValueModelingTool() {
        this.setState({
            popoverOpenStartValueModelingTool: !this.state.popoverOpenStartValueModelingTool
        })
    }
    /**
     * Toggle show guidance popup
     */
    toggleShowGuidanceNodeData() {
        this.setState({
            showGuidanceNodeData: !this.state.showGuidanceNodeData
        })
    }
    /**
     * Toggle show guidance popup
     */
    toggleShowGuidanceModelingTransfer() {
        this.setState({
            showGuidanceModelingTransfer: !this.state.showGuidanceModelingTransfer
        })
    }
    /**
     * Toggle show guidance popup
     */
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }
    /**
     * Toggle dropdown settings
     */
    toggleDeropdownSetting(i) {
        const newArray = this.state.dropdownOpen.map((element, index) => { return (index === i ? !element : false); });
        this.setState({
            dropdownOpen: newArray,
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
     * Toggle info popup
     */
    toggleSenariotree2() {
        this.setState({
            popoverOpenSenariotree2: !this.state.popoverOpenSenariotree2,
        });
    }

    /**
     * Toggle info popup
     */
    toggleTooltipAuto() {
        this.setState({
            popoverTooltipAuto: !this.state.popoverTooltipAuto,
        });
    }
    /**
     * Toggle node unit
     */
    toggleTooltipNodeUnit() {
        this.setState({
            popoverNodeUnit: !this.state.popoverNodeUnit,
        });
    }
    /**
     * Toggles the visibility of a branch based on the state of `treeId`.
     */
    toggleCollapse() {
        var treeId = this.state.treeId;
        if (treeId != null && treeId != "") {
            this.setState({
                showDiv: !this.state.showDiv
            })
        } else {
            confirmAlert({
                message: "Please select a tree.",
                buttons: [
                    {
                        label: i18n.t('static.report.ok')
                    }
                ]
            });
        }
    }
    /**
     * Toggles the visibility of a dropdown menu.
     */
    toggleDropdown() {
        this.setState({
            showDiv1: !this.state.showDiv1
        })
    }
    /**
     * Toggle one time dispensing popup
     */
    toggleOneTimeDispensing() {
        this.setState({
            popoverOneTimeDispensing: !this.state.popoverOneTimeDispensing,
        });
    }
    /**
     * Updates a specific parameter in the component state.
     * @param {string} parameterName - The name of the parameter to be updated.
     * @param {*} value - The new value of the parameter.
     */
    updateExtrapolationData(parameterName, value) {
        this.setState({
            [parameterName]: value
        });
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
                        try {
                            var nodeId = nodeDataMomList[i].nodeId;
                            var nodeDataMomListForNode = nodeDataMomList[i].nodeDataMomList;
                            var node = items.filter(n => n.id == nodeId)[0];
                            (node.payload.nodeDataMap[nodeDataMomList[i].scenarioId])[0].nodeDataMomList = nodeDataMomListForNode;
                            var findNodeIndex = items.findIndex(n => n.id == nodeId);
                            items[findNodeIndex] = node;
                        } catch (e) {
                        }
                    }
                }
                this.setState({ items })
            }
            try {
                if (parameterName == 'type' && (value == 0 || value == 1) && (!this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].hasOwnProperty("extrapolation") || this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != undefined && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != "true")) {
                    if (this.state.currentItemConfig.context.payload.nodeType.id == 1 || this.state.currentItemConfig.context.payload.nodeType.id == 2 || this.state.currentItemConfig.context.payload.nodeType.id == 6) {
                        this.setState({ momList: this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList }, () => {
                            if (this.state.modelingEl != null && this.state.modelingEl != undefined && this.state.modelingEl != "") {
                                this.filterScalingDataByMonth(this.state.scalingMonth.year + "-" + this.state.scalingMonth.month + "-01", this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList);
                            }
                            if (value == 1 || (value == 0 && this.state.showMomData)) {
                                this.buildMomJexcel();
                            }
                        });
                    } else {
                        this.setState({ momListPer: this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList }, () => {
                            if (this.state.modelingEl != null && this.state.modelingEl != undefined && this.state.modelingEl != "") {
                                this.filterScalingDataByMonth(this.state.scalingMonth.year + "-" + this.state.scalingMonth.month + "-01", this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList);
                            }
                            if (value == 1 || (value == 0 && this.state.showMomDataPercent)) {
                                this.buildMomJexcelPercent();
                            }
                        });
                    }
                }
            } catch (e) { }
            if (parameterName == "nodeDataMomList") {
                this.saveTreeData(false, false);
            }
        })
    }
    /**
     * Calculates and updates display data values in the tree after drag and drop operation.
     */
    calculateAfterDragDrop() {
        var items = this.state.curTreeObj.tree.flatList;
        for (let i = 0; i < items.length; i++) {
            var nodeDataModelingMap = this.state.modelinDataForScenario.filter(c => c.nodeDataId == items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId);
            (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = nodeDataModelingMap[0].calculatedValue;
            (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = nodeDataModelingMap[0].endValue;
        }
        this.setState({
            items,
        })
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
                                levelModal: false,
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
                                    this.calculateMOMData(0, 2, false);
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
     * Creates or updates a tree based on the current state.
     * If treeId is not null, it updates the existing tree; otherwise, it creates a new tree.
    */
    createOrUpdateTree() {
        if (this.state.treeId != null) {
            this.setState({
                showDiv: false
            })
        } else {
            const { treeData } = this.state;
            const { curTreeObj } = this.state;
            var maxTreeId = treeData.length > 0 ? Math.max(...treeData.map(o => o.treeId)) : 0;
            var nodeDataMap = {};
            var tempArray = [];
            var tempJson = {
                nodeDataId: 1,
                notes: '',
                month: moment(this.state.forecastStartDate).startOf('month').format("YYYY-MM-DD"),
                dataValue: "",
                calculatedDataValue: '',
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
            var treeId = parseInt(maxTreeId) + 1;
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
                            extrapolation: false,
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
            this.setState({
                treeId,
                treeData,
                showDiv: false
            }, () => {
                this.getTreeByTreeId(treeId);
                this.updateTreeData();
            })
        }
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
        var nodeDataMomList = nodeDataMomListParam != undefined ? nodeDataMomListParam : this.state.currentScenario.nodeDataMomList;
        for (var i = 0; i < json.length; i++) {
            var calculatedChangeForMonth = 0;
            var map1 = new Map(Object.entries(json[i]));
            var startDate = map1.get("1");
            var stopDate = map1.get("2");
            var modelingTypeId = map1.get("4");
            var dataValue = modelingTypeId == 2 ? map1.get("7") : map1.get("6");
            if (map1.get("5") == -1) {
                dataValue = 0 - dataValue
            }
            const result = moment(date).isBetween(startDate, stopDate, null, '[]');
            if (result) {
                var nodeValue = 0;
                let scalingDate = date;
                if (modelingTypeId == 3 && moment(startDate).format("YYYY-MM") <= moment(scalingDate).format("YYYY-MM") && moment(stopDate).format("YYYY-MM") >= moment(scalingDate).format("YYYY-MM")) {
                    var nodeDataMomListFilter = [];
                    if (map1.get("12") == 1) {
                        var nodeDataMomListOfTransferNode = (this.state.items.filter(c => map1.get("3") != "" ? (c.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataId == map1.get("3").split('_')[0] : (c.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataId == map1.get("3"))[0].payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataMomList;
                        nodeDataMomListFilter = nodeDataMomListOfTransferNode.filter(c => moment(c.month).format("YYYY-MM") == moment(startDate).format("YYYY-MM"))
                    } else {
                        nodeDataMomListFilter = nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(startDate).format("YYYY-MM"))
                    }
                    if (nodeDataMomListFilter.length > 0) {
                        nodeValue = nodeDataMomListFilter[0].startValue;
                    }
                }
                if (modelingTypeId == 4 && moment(startDate).format("YYYY-MM") <= moment(scalingDate).format("YYYY-MM") && moment(stopDate).format("YYYY-MM") >= moment(scalingDate).format("YYYY-MM")) {
                    var nodeDataMomListFilter = [];
                    if (map1.get("12") == 1) {
                        var nodeDataMomListOfTransferNode = (this.state.items.filter(c => map1.get("3") != "" ? (c.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataId == map1.get("3").split('_')[0] : (c.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataId == map1.get("3"))[0].payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataMomList;
                        nodeDataMomListFilter = nodeDataMomListOfTransferNode.filter(c => moment(c.month).format("YYYY-MM") == moment(scalingDate).format("YYYY-MM"))
                    } else {
                        nodeDataMomListFilter = nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(scalingDate).format("YYYY-MM"))
                    }
                    if (nodeDataMomListFilter.length > 0) {
                        nodeValue = nodeDataMomListFilter[0].startValue;
                    }
                }
                if (modelingTypeId == 2 || modelingTypeId == 5) {
                    calculatedChangeForMonth = parseFloat(dataValue).toFixed(4);
                } else if (modelingTypeId == 3 || modelingTypeId == 4) {
                    calculatedChangeForMonth = parseFloat((nodeValue * dataValue) / 100).toFixed(4);
                }
            }
            this.state.modelingEl.setValueFromCoords(9, i, calculatedChangeForMonth, true);
        }
        var scalingDifference = nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(date).format("YYYY-MM"));
        if (scalingDifference.length > 0) {
            scalingTotal += scalingDifference[0].difference;
        }
        this.setState({ scalingTotal });
    }
    /**
     * Updates months on months data after manual change and seasonality perc change
     */
    updateMomDataInDataSet() {
        this.setState({
            momJexcelLoader: true
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
                                month: map1.get("0"),
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
                                month: map1.get("0"),
                                seasonalityPerc: map1.get("4").toString().replaceAll(",", "").split("%")[0],
                                manualChange: map1.get("5").toString().replaceAll(",", "").split("%")[0],
                                nodeDataId: map1.get("9"),
                                active: true
                            }
                            overrideListArray.push(overrideData);
                        }
                    }
                }
                let { currentItemConfig } = this.state;
                let { curTreeObj } = this.state;
                let { treeData } = this.state;
                let { dataSetObj } = this.state;
                var dataSetObjCopy = JSON.parse(JSON.stringify(dataSetObj));
                var items = this.state.items;
                (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataOverrideList = overrideListArray;
                this.setState({ currentItemConfig }, () => {
                    var findNodeIndex = items.findIndex(n => n.id == currentItemConfig.context.id);
                    items[findNodeIndex] = currentItemConfig.context;
                    curTreeObj.tree.flatList = items;
                    var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
                    treeData[findTreeIndex] = curTreeObj;
                    var programData = dataSetObjCopy.programData;
                    programData.treeList = treeData;
                    if (this.state.autoCalculate) {
                        calculateModelingData(dataSetObjCopy, this, '', currentItemConfig.context.id, this.state.selectedScenario, 1, this.state.treeId, false, false, this.state.autoCalculate);
                    } else {
                        this.setState({
                            loading: false,
                            modelingJexcelLoader: false,
                            momJexcelLoader: false,
                            message1: "Data updated successfully"
                        }, () => {
                        })
                    }
                });
            }, 0);
        });
    }
    /**
     * Opens a modal for scenario management based on the specified action type.
     * @param {number} type - The type of action to be performed:
     *                        - 1: Add new scenario
     *                        - 2: Edit existing scenario
     *                        - 3: Delete scenario
     *                        - 4: Show and Hide Active/Inactive scenario
     */
    openScenarioModal(type) {
        var scenarioId = this.state.selectedScenario;
        this.setState({
            scenarioActionType: type,
            showDiv1: false
        })
        if (type != 3) {
            if (type == 2) {
                if (scenarioId != "") {
                    var scenario = this.state.scenarioList.filter(x => x.id == scenarioId)[0];
                    this.setState({
                        scenario: JSON.parse(JSON.stringify(scenario)),
                        openAddScenarioModal: !this.state.openAddScenarioModal
                    })
                } else {
                    alert("Please select scenario first.")
                }
            } else if (type == 4) {
                if (scenarioId != "") {
                    var scenario11 = this.state.scenarioList.filter(x => x.id == scenarioId)[0];
                    if (!this.state.showOnlyActive && scenario11.active.toString() == "false") {
                        this.setState({
                            items: [],
                            selectedScenario: "",
                        })
                    }
                } else {
                    this.setState({
                        items: [],
                        selectedScenario: "",
                    })
                }
                this.setState({
                    showOnlyActive: !this.state.showOnlyActive
                })
            } else {
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
                var scenarioList = this.state.scenarioList;
                var minScenarioId = Math.min(...scenarioList.map(o => o.id));
                if (scenarioList.length > 1) {
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
                    confirmAlert({
                        message: "You must have at least one scenario.",
                        buttons: [
                            {
                                label: i18n.t('static.report.ok')
                            }
                        ]
                    });
                }
            } else {
                confirmAlert({
                    message: "Please select scenario first.",
                    buttons: [
                        {
                            label: i18n.t('static.report.ok')
                        }
                    ]
                });
            }
        }
    }
    /**
     * Builds jexcel table for modeling in percentage node or forecasting unit node or planning unit node
     */
    buildMomJexcelPercent() {
        var momList = this.state.momListPer == undefined ? [] : this.state.momListPer;
        var momListParent = this.state.momListPerParent == undefined ? [] : this.state.momListPerParent;
        var dataArray = [];
        let count = 0;
        var fuPerMonth, totalValue, usageFrequency, convertToMonth;
        var lagInMonths = 0;
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
            var noOfForecastingUnitsPerPerson = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfForecastingUnitsPerPerson;
            if ((this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 2 || ((this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage != "true" && (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage != true)) {
                usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageFrequency;
                convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usagePeriod.usagePeriodId))[0].convertToMonth;
            }
            if ((this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 2) {
                fuPerMonth = ((noOfForecastingUnitsPerPerson / usageFrequency) * convertToMonth);
            } else {
                var noOfPersons = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfPersons;
                if ((this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage == "true" || (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage == true) {
                    fuPerMonth = noOfForecastingUnitsPerPerson / noOfPersons;
                } else {
                    fuPerMonth = ((noOfForecastingUnitsPerPerson / noOfPersons) * usageFrequency * convertToMonth);
                }
            }
            lagInMonths = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.lagInMonths;
        }
        var monthsPerVisit = 1;
        var patients = 0;
        var grandParentMomList = [];
        var noOfBottlesInOneVisit = 0;
        if (this.state.currentItemConfig.context.payload.nodeType.id == 5) {
            monthsPerVisit = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.refillMonths;
            var parent = (this.state.currentItemConfig.context.parent);
            var parentFiltered = (this.state.items.filter(c => c.id == parent))[0];
            var parentNodeNodeData = (parentFiltered.payload.nodeDataMap[this.state.selectedScenario])[0];
            lagInMonths = parentNodeNodeData.fuNode.lagInMonths;
            if (parentNodeNodeData.fuNode.usageType.id == 2) {
                var daysPerMonth = 365 / 12;
                var grandParent = parentFiltered.parent;
                var grandParentFiltered = (this.state.items.filter(c => c.id == grandParent))[0];
                var patients = 0;
                var grandParentNodeData = (grandParentFiltered.payload.nodeDataMap[this.state.selectedScenario])[0];
                grandParentMomList = grandParentNodeData.nodeDataMomList;
                if (grandParentNodeData != undefined) {
                    var grandParentPrevMonthMMDValue = grandParentNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(momList[0].month).subtract(1, 'months').format("YYYY-MM"));
                    if (grandParentPrevMonthMMDValue.length > 0) {
                        patients = grandParentPrevMonthMMDValue[0].calculatedValue;
                    } else {
                        var grandParentCurMonthMMDValue = grandParentNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(momList[0].month).format("YYYY-MM"));
                        if (grandParentCurMonthMMDValue.length > 0) {
                            patients = grandParentCurMonthMMDValue[0].calculatedValue;
                        } else {
                            patients = 0;
                        }
                    }
                } else {
                    patients = 0;
                }
                var noOfBottlesInOneVisit = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit;
            }
        }
        for (var j = 0; j < momList.length; j++) {
            var tempFuNode = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode;
            data = [];
            data[0] = momList[j].month
            data[1] = j == 0 ? parseFloat(momList[j].startValue).toFixed(4) : `=ROUND(IF(OR(M1==true,M1==1),G${parseInt(j)},L${parseInt(j)}),4)`
            data[2] = parseFloat(momList[j].difference).toFixed(4)
            data[3] = `=ROUND(IF(B${parseInt(j) + 1}+C${parseInt(j) + 1}<0,0,B${parseInt(j) + 1}+C${parseInt(j) + 1}),4)`;
            data[4] = momList[j].seasonalityPerc != null ? parseFloat(momList[j].seasonalityPerc).toFixed(2) : 0;
            data[5] = momList[j].manualChange != null ? parseFloat(momList[j].manualChange).toFixed(2) : 0;
            // data[6] = `=ROUND(IF((((B${parseInt(j) + 1}+C${parseInt(j) + 1})*(IF(E${parseInt(j) + 1}==0,1,E${parseInt(j) + 1})))/(IF(E${parseInt(j) + 1}==0,1,100)))+F${parseInt(j) + 1}<0,0,(((B${parseInt(j) + 1}+C${parseInt(j) + 1})*(IF(E${parseInt(j) + 1}==0,1,E${parseInt(j) + 1})))/(IF(E${parseInt(j) + 1}==0,1,100)))+F${parseInt(j) + 1}),4)`;
            data[6] = `=ROUND((B${parseInt(j) + 1}+C${parseInt(j) + 1})*(1+(E${parseInt(j) + 1})/100)+F${parseInt(j) + 1},4)`;
            var momListParentForMonth = momListParent.filter(c => moment(c.month).format("YYYY-MM") == moment(momList[j].month).format("YYYY-MM"));
            var tempCalculatedValue = momListParentForMonth.length > 0 ? momListParentForMonth[0].calculatedValue : 0;
            var tempRepeatCountConvertToMonth = tempFuNode && tempFuNode.repeatUsagePeriod ? (this.state.usagePeriodList.filter(c => c.usagePeriodId == (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.repeatUsagePeriod.usagePeriodId))[0].convertToMonth : 1;
            var tempNConvertToMonth = tempFuNode && tempFuNode.usagePeriod ? (this.state.usagePeriodList.filter(c => c.usagePeriodId == (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usagePeriod.usagePeriodId))[0].convertToMonth : 1;
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4 && tempFuNode.oneTimeUsage.toString() == "false" && tempFuNode.oneTimeDispensing != undefined && tempFuNode.oneTimeDispensing != null && tempFuNode.oneTimeDispensing.toString() != "" && tempFuNode.oneTimeDispensing.toString() == "false") {
                var tempMonth = ((this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 2 ? Number(fuPerMonth).toFixed(4) : (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.repeatCount / tempRepeatCountConvertToMonth);
                var tempNoOfMonths = Number(tempMonth) - Math.floor(Number(tempMonth));
                tempCalculatedValue = 0;
                var f = momListParent.filter(c => c.month > moment(momList[j].month).subtract(Math.ceil(tempMonth), 'months').format("YYYY-MM-DD") && c.month <= moment(momList[j].month).format("YYYY-MM-DD"));
                f.map((item, index) => {
                    if (f.length > 1 && (index != f.length - 1)) {
                        tempCalculatedValue += item.calculatedValue;
                    } else if (f.length == 1 || tempNoOfMonths == 0) {
                        tempCalculatedValue += item.calculatedValue;
                    }
                })
                if (f.length >= 2) {
                    tempCalculatedValue += tempNoOfMonths * f[f.length - 1].calculatedValue;
                }
            }
            data[7] = momListParentForMonth.length > 0 ? parseFloat(momListParentForMonth[0].calculatedValue).toFixed(2) : 0;
            data[8] = this.state.currentItemConfig.context.payload.nodeType.id != 5 ? `=ROUND((G${parseInt(j) + 1}*${(momListParentForMonth.length > 0 ? parseFloat(tempCalculatedValue) : 0)}/100)*N${parseInt(j) + 1},2)` : `=ROUND((G${parseInt(j) + 1}*${momListParentForMonth.length > 0 ? parseFloat(momListParentForMonth[0].calculatedValue) : 0}/100)/${(this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.multiplier},4)`;
            data[9] = this.state.currentScenario.nodeDataId
            data[10] = this.state.currentItemConfig.context.payload.nodeType.id == 4 || (this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2) ? j >= lagInMonths ? `=IF(R${parseInt(j) + 1 - lagInMonths}<0,0,R${parseInt(j) + 1 - lagInMonths})` : 0 : `=IF(R${parseInt(j) + 1}<0,0,R${parseInt(j) + 1})`;
            data[11] = `=ROUND(IF(B${parseInt(j) + 1}+C${parseInt(j) + 1}<0,0,B${parseInt(j) + 1}+C${parseInt(j) + 1}),4)`
            data[12] = this.state.currentScenario.manualChangesEffectFuture;
            data[13] = this.state.currentItemConfig.context.payload.nodeType.id == 4 ? ((this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 2 ? Number(fuPerMonth).toFixed(4) : (tempFuNode.oneTimeUsage.toString() == "false" && tempFuNode.oneTimeDispensing != undefined && tempFuNode.oneTimeDispensing != null && tempFuNode.oneTimeDispensing.toString() != "" && tempFuNode.oneTimeDispensing.toString() == "false" ? tempNConvertToMonth * tempFuNode.usageFrequency * tempFuNode.noOfForecastingUnitsPerPerson : this.state.noFURequired)) : 1;
            data[14] = Math.floor(j / monthsPerVisit);
            if (this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2) {
                var dataValue = 0;
                var calculatedValueFromCurMonth = grandParentMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(momList[j].month).format("YYYY-MM"));
                var calculatedValueFromPrevMonth = grandParentMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(momList[j].month).subtract(1, 'months').format("YYYY-MM"));
                var calculatedValueForCurMonth = 0;
                var calculatedValueForPrevMonth = 0;
                if (calculatedValueFromCurMonth.length > 0) {
                    calculatedValueForCurMonth = calculatedValueFromCurMonth[0].calculatedValue;
                }
                if (calculatedValueFromPrevMonth.length > 0) {
                    calculatedValueForPrevMonth = calculatedValueFromPrevMonth[0].calculatedValue;
                }
                if (Math.floor(j / monthsPerVisit) == 0) {
                    dataValue = (patients / monthsPerVisit) + (j == 0 ? calculatedValueForCurMonth - patients : calculatedValueForCurMonth - calculatedValueForPrevMonth)
                } else {
                    dataValue = (dataArray[j - monthsPerVisit][14]) + (j == 0 ? parseFloat(calculatedValueForCurMonth) - parseFloat(patients) : parseFloat(calculatedValueForCurMonth) - parseFloat(calculatedValueForPrevMonth))
                }
                data[15] = j == 0 ? calculatedValueForCurMonth - patients : calculatedValueForCurMonth - calculatedValueForPrevMonth;
                data[16] = dataValue;
            } else {
                data[15] = 0;
                data[16] = 0;
            }
            var nodeDataMomListPercForFU = [];
            var fuPercentage = 0;
            if (this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2) {
                if (parentNodeNodeData.nodeDataMomList != undefined) {
                    nodeDataMomListPercForFU = parentNodeNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(momList[j].month).format("YYYY-MM"));
                    if (nodeDataMomListPercForFU.length > 0) {
                        fuPercentage = nodeDataMomListPercForFU[0].endValue;
                    }
                }
            }
            data[17] = this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2 ? `=(Q${parseInt(j) + 1}*${noOfBottlesInOneVisit}*(G${parseInt(j) + 1}/100)*${fuPercentage}/100)` : this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 1 ? `=(I${parseInt(j) + 1}/(${this.state.noFURequired / (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.multiplier}))*${(this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit}` : `=I${parseInt(j) + 1}`;
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
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100,
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.%of') + " " + getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) + " " + i18n.t('static.tree.monthStart'),
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
                    readOnly: false
                },
                {
                    title: i18n.t('static.tree.manualChange'),
                    type: this.state.seasonality == true ? 'numeric' : 'hidden',
                    disabledMaskOnEdition: true,
                    textEditor: true,
                    mask: '#,##0.00%', decimal: '.',
                    readOnly: AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') ? false : true,
                },
                {
                    title: i18n.t('static.tree.%of') + " " + getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang),
                    type: 'numeric',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang),
                    type: 'numeric',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) + " " + i18n.t('static.consumption.forcast'),
                    type: 'numeric',
                    visible: this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5 ? false : true,
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
            editable: true,
            onload: this.loadedMomPer,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
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
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
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
        var asterisk = document.getElementsByClassName("jss")[1].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[3].classList.add('InfoTr');
        tr.children[3].title = i18n.t('static.momper.tooltip1');
        tr.children[4].classList.add('InfoTr');
        tr.children[4].title = i18n.t('static.momper.tooltip2');
        tr.children[5].classList.add('InfoTr');
        tr.children[5].title = i18n.t('static.momper.tooltip3');
        tr.children[6].classList.add('InfoTr');
        tr.children[6].title = i18n.t('static.momper.tooltip4');
        tr.children[7].classList.add('InfoTr');
        tr.children[7].title = i18n.t('static.momper.tooltip5');
        tr.children[8].classList.add('InfoTr');
        tr.children[8].title = i18n.t('static.momper.tooltip6');
        tr.children[9].classList.add('InfoTr');
        tr.children[9].title = i18n.t('static.momper.tooltip7');
    }
    /**
     * Builds jexcel table for modeling in number node or aggregation
     */
    buildMomJexcel() {
        var momList = this.state.momList == undefined ? [] : this.state.momList;
        var dataArray = [];
        let count = 0;
        for (var j = 0; j < momList.length; j++) {
            data = [];
            data[0] = momList[j].month
            data[1] = j == 0 ? parseFloat(momList[j].startValue).toFixed(2) : `=(IF(OR(I1==true,I1==1),G${parseInt(j)},D${parseInt(j)}))`
            data[2] = parseFloat(momList[j].difference)
            data[3] = `=(IF(B${parseInt(j) + 1}+C${parseInt(j) + 1}<0,0,(B${parseInt(j) + 1}+C${parseInt(j) + 1})))`;
            data[4] = parseFloat(momList[j].seasonalityPerc).toFixed(2)
            data[5] = momList[j].manualChange != null ? parseFloat(momList[j].manualChange).toFixed(2) : 0
            data[6] = `=(D${parseInt(j) + 1}+(D${parseInt(j) + 1}*E${parseInt(j) + 1}/100)+F${parseInt(j) + 1})`
            data[7] = this.state.currentScenario.nodeDataId
            data[8] = this.state.currentScenario.manualChangesEffectFuture;
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
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100,
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
                    type: this.state.seasonality == true && this.state.currentItemConfig.context.payload.nodeType.id != 6 ? 'numeric' : 'hidden',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.seasonalityIndex'),
                    type: this.state.seasonality == true && this.state.currentItemConfig.context.payload.nodeType.id != 6 ? 'numeric' : 'hidden',
                    disabledMaskOnEdition: true,
                    textEditor: true,
                    mask: '#,##0.00%', decimal: '.',
                    readOnly: !this.state.aggregationNode ? true : false
                },
                {
                    title: i18n.t('static.tree.manualChange+-'),
                    type: this.state.seasonality == true && this.state.currentItemConfig.context.payload.nodeType.id != 6 ? 'numeric' : 'hidden',
                    mask: '#,##0.00', decimal: '.',
                    readOnly: !this.state.aggregationNode ? true : false
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
            editable: true,
            onload: this.loadedMom,
            pagination: localStorage.getItem("sesRecordCount"),
            search: this.state.currentItemConfig.context.payload.nodeType.id != 6 ? true : false,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onchange: this.changed1,
            updateTable: function (el, cell, x, y, source, value, id) {
            }.bind(this),
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
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
     * Displays the MOM data for the current node or its parent node.
     */
    showMomData() {
        var getMomDataForCurrentNode = this.state.items.filter(x => x.id == this.state.currentItemConfig.context.id).length > 0 ? this.state.items.filter(x => x.id == this.state.currentItemConfig.context.id)[0].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList : [];
        if (this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.payload.nodeType.id != 6) {
            var getMomDataForCurrentNodeParent = this.state.items.filter(x => x.id == this.state.currentItemConfig.context.parent).length > 0 ? this.state.items.filter(x => x.id == this.state.currentItemConfig.context.parent)[0].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList : []
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
     * Sets the start and stop date of the program and initializes necessary data based on the provided programId.
     * @param {string} programId - The unique identifier of the program.
     */
    setStartAndStopDateOfProgram(programId) {
        this.setState({
            scenarioList: []
        })
        var proList = [];
        var programDataListForPuCheck = [];
        localStorage.setItem("sesDatasetId", programId);
        if (programId != "") {
            var dataSetObj = JSON.parse(JSON.stringify(this.state.datasetList.filter(c => c.id == programId)[0]));;
            var datasetEnc = dataSetObj;
            var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            programDataListForPuCheck.push({ "programData": programData, "id": dataSetObj.id });
            dataSetObj.programData = programData;
            var treeList = programData.treeList;
            for (var k = 0; k < treeList.length; k++) {
                proList.push(treeList[k])
            }
            if (this.state.treeTemplateObj != null && this.state.treeTemplateObj != "") {
                proList.push(this.state.treeTemplateObj);
            }
            var forecastPeriod = moment(programData.currentVersion.forecastStartDate).format(`MMM-YYYY`) + " ~ " + moment(programData.currentVersion.forecastStopDate).format(`MMM-YYYY`);
            this.setState({
                forecastPeriod,
                dataSetObj,
                realmCountryId: programData.realmCountry.realmCountryId,
                treeData: proList,
                programDataListForPuCheck: programDataListForPuCheck,
                items: [],
                selectedScenario: '',
                programId,
                singleValue2: { year: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getFullYear(), month: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getMonth() + 1 },
                forecastStartDate: programData.currentVersion.forecastStartDate,
                forecastStopDate: programData.currentVersion.forecastStopDate,
                minDate: { year: Number(moment(programData.currentVersion.forecastStartDate).startOf('month').format("YYYY")), month: Number(moment(programData.currentVersion.forecastStartDate).startOf('month').format("M")) },
                stopMinDate: { year: Number(moment(programData.currentVersion.forecastStartDate).startOf('month').format("YYYY")), month: Number(moment(programData.currentVersion.forecastStartDate).startOf('month').format("M")) },
                maxDate: { year: Number(moment(programData.currentVersion.forecastStopDate).startOf('month').format("YYYY")), month: Number(moment(programData.currentVersion.forecastStopDate).startOf('month').format("M")) },
                showDate: true
            }, () => {
                this.getDatasetList();
                this.fetchTracerCategoryList(programData);
                if (this.state.treeData.length == 1) {
                    var event = {
                        target: {
                            value: this.state.treeData[0].treeId,
                            name: "treeId"
                        }
                    }
                    this.dataChange(event)
                } else if (this.state.treeId != "" && this.state.treeData.filter(c => c.treeId == this.state.treeId).length > 0) {
                    var event = {
                        target: {
                            value: this.state.treeId,
                            name: "treeId"
                        }
                    }
                    this.dataChange(event)
                } else {
                    this.setState({
                        treeId: "",
                        scenarioId: ""
                    })
                }
            });
        } else {
            this.setState({
                dataSetObj: [],
                realmCountryId: '',
                items: [],
                selectedScenario: '',
                programId,
                forecastPeriod: '',
                treeData: proList,
                programDataListForPuCheck: [],
                singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 }
            })
        }
        this.getRegionList();
    }
    /**
     * Handles the extrapolation checkbox event to toggle extrapolation for the current item configuration.
     * @param {Object} e - The event object triggered by the checkbox action.
     */
    extrapolate(e) {
        const { currentItemConfig } = this.state;
        var modelingFlag = false;
        var scalingList = this.state.currentScenario.nodeDataModelingList == undefined ? [] : this.state.currentScenario.nodeDataModelingList;
        if (scalingList.length > 0) {
            var scalingResult = scalingList.filter(x => x.transferNodeDataId != null && x.transferNodeDataId != "");
            if (scalingResult.length > 0) {
                modelingFlag = true;
            }
        }
        if (this.state.nodeTransferDataList.length == 0 && !modelingFlag) {
            currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation = e.target.checked == true ? true : false;
            if (e.target.checked) {
                if (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue == "" || currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue == null || currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue == "0") {
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue = "0";
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].dataValue = "0";
                }
            }
            this.setState({
                currentItemConfig,
                currentScenario: currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0],
                activeTab1: e.target.checked == true ? new Array(2).fill('3') : new Array(2).fill('2')
            }, () => {
                if (this.state.activeTab1[0] == '3') {
                    if (this.state.modelingEl != "") {
                        jexcel.destroy(document.getElementById('modelingJexcel'), true);
                        if (this.state.momEl != "") {
                            jexcel.destroy(document.getElementById('momJexcel'), true);
                        }
                        else if (this.state.momElPer != "") {
                            jexcel.destroy(document.getElementById('momJexcelPer'), true);
                        }
                    }
                    this.refs.extrapolationChild.getExtrapolationMethodList();
                } else {
                    if (this.state.currentItemConfig.context.payload.nodeType.id != 1) {
                        var minMonth = this.state.forecastStartDate;
                        var maxMonth = this.state.forecastStopDate;
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
                    }
                    else {
                        this.setState({
                            showModelingJexcelNumber: true
                        }, () => {
                            this.buildModelingJexcel();
                        })
                    }
                }
            });
        }
        else if (modelingFlag) {
            currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation = false;
            this.setState({
                currentItemConfig,
                currentScenario: currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0]
            }, () => {
                alert("Extrapolation not allowed on this node because this node is transfering data to some other node.To perform extrapolation please delete the transfer.");
            });
        } else if (this.state.nodeTransferDataList.length > 0) {
            currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation = false;
            this.setState({
                currentItemConfig,
                currentScenario: currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0]
            }, () => {
                alert("Extrapolation not allowed on this node because some other node is transfering data to this node.");
            });
        }
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
                this.state.momElPer.setValueFromCoords(12, 0, checked, true);
            }
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].manualChangesEffectFuture = (e.target.checked == true ? true : false)
            var nodes = this.state.items;
            var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.context.id);
            nodes[findNodeIndex] = currentItemConfig.context;
            this.setState({
                currentItemConfig,
                items: nodes,
                currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0]
            }, () => {
            });
        } else if (e.target.name === "seasonality") {
            this.setState({
                seasonality: e.target.checked == true ? true : false
            }, () => {
                if (this.state.momEl != "") {
                    this.buildMomJexcel();
                } else if (this.state.momElPer != "") {
                    this.buildMomJexcelPercent();
                }
            });
        }
    }
    downwardAggregationListChange(daList) {
        this.setState({
            isChanged: true
        })
        let { currentItemConfig } = this.state;
        let tempList = [];
        daList.map(x => tempList.push({
            treeId: x.value.split("~")[0],
            scenarioId: x.value.split("~")[1],
            nodeId: x.value.split("~")[2]
        }))
        currentItemConfig.context.payload.downwardAggregationList = tempList;
        if (tempList.length == 0) {
            this.setState({
                multiselectError: true
            })
        }
    }
    /**
     * Handles form submission of modeling data
     */
    formSubmit() {
        if (this.state.modelingJexcelLoader === true) {
            var validation = this.state.lastRowDeleted == true ? true : this.checkValidation();
            this.setState({ modelingTabError: !validation })
            if (this.state.lastRowDeleted == true || validation == true) {
                try {
                    var tableJson = this.state.modelingEl.getJson(null, false);
                    var data = this.state.currentScenario.nodeDataModelingList;
                    var maxModelingId = data.length > 0 ? Math.max(...data.map(o => o.nodeDataModelingId)) : 0;
                    var obj;
                    var dataArr = [];
                    var items = this.state.items;
                    var item = items.filter(x => x.id == this.state.currentItemConfig.context.id)[0];
                    const itemIndex1 = items.findIndex(o => o.id === this.state.currentItemConfig.context.id);
                    for (var i = 0; i < tableJson.length; i++) {
                        var map1 = new Map(Object.entries(tableJson[i]));
                        if (parseInt(map1.get("12")) != 1) {
                            var parts1 = map1.get("1").split('-');
                            var startDate = parts1[0] + "-" + parts1[1] + "-01"
                            var parts2 = map1.get("2").split('-');
                            var stopDate = parts2[0] + "-" + parts2[1] + "-01"
                            startDate = moment(map1.get("1")).startOf('month').format("YYYY-MM-DD");
                            stopDate = moment(map1.get("2")).startOf('month').format("YYYY-MM-DD");
                            if (map1.get("10") != "" && map1.get("10") != 0) {
                                const itemIndex = data.findIndex(o => o.nodeDataModelingId === map1.get("10"));
                                obj = data.filter(x => x.nodeDataModelingId == map1.get("10"))[0];
                                var transfer = map1[3] != "" ? map1.get("3").split('_')[0] : '';
                                obj.transferNodeDataId = transfer;
                                obj.notes = map1.get("0");
                                obj.modelingType.id = map1.get("4");
                                obj.startDate = startDate;
                                obj.stopDate = stopDate;
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
                                    startDate: startDate,
                                    stopDate: stopDate,
                                    increaseDecrease: map1.get("5"),
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
                        if (this.validation1() && this.state.isValidError.toString() == "false") {
                            item.payload = this.state.currentItemConfig.context.payload;
                            (item.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataModelingList = dataArr;
                            if (this.state.currentItemConfig.context.payload.nodeType.id == 2) {
                                (item.payload.nodeDataMap[this.state.selectedScenario])[0].annualTargetCalculator = {
                                    firstMonthOfTarget: moment(moment(this.state.firstMonthOfTarget, "YYYY-MM-DD")).format("YYYY-MM"),
                                    yearsOfTarget: this.state.yearsOfTarget,
                                    actualOrTargetValueList: this.state.actualOrTargetValueList
                                };
                            }
                            if (this.state.lastRowDeleted == true) {
                                (item.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataModelingList = [];
                            }
                            items[itemIndex1] = item;
                            let { curTreeObj } = this.state;
                            let { treeData } = this.state;
                            let { dataSetObj } = this.state;
                            curTreeObj.tree.flatList = items;
                            var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
                            treeData[findTreeIndex] = curTreeObj;
                            var programData = dataSetObj.programData;
                            programData.treeList = treeData;
                            dataSetObj.programData = programData;
                            this.setState({
                                dataSetObj,
                                items,
                                scalingList: dataArr,
                                lastRowDeleted: false,
                                modelingChanged: false,
                                activeTab1: new Array(2).fill('2'),
                                firstMonthOfTarget: "",
                                yearsOfTarget: "",
                                actualOrTargetValueList: [],
                                modelingChangedOrAdded: false
                            }, () => {
                                this.calculateMOMData(this.state.currentItemConfig.context.id, 0, false);
                            });
                        } else {
                            this.setState({
                                modelingJexcelLoader: false
                            }, () => {
                                alert("Please fill all the required fields in Node Data Tab");
                            });
                        }
                    } else {
                        if (this.validation1() && (this.state.isValidError.toString() == "false" || document.getElementById('isValidError').value.toString() == 'false') && !this.state.addNodeError) {
                            this.setState({
                                addNodeFlag: false,
                                modelingChangedOrAdded: false
                            }, () => {
                                this.onAddButtonClick(this.state.currentItemConfig, true, dataArr);
                            });
                        } else {
                            this.setState({
                                modelingJexcelLoader: false
                            }, () => {
                                alert("Please fill all the required fields in Node Data Tab");
                            });
                        }
                    }
                } catch (err) {
                    localStorage.setItem("scalingErrorTree", err);
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
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.state.modelingEl.getValueFromCoords(3, y);
                var transferFlag = false;
                if (value != "") {
                    var items = this.state.items;
                    var transfer = value != "" ? value.split('_')[0] : '';
                    if (transfer != '') {
                        for (let i = 0; i < items.length; i++) {
                            var nodeDataId = items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId;
                            if (nodeDataId == transfer && items[i].payload.nodeDataMap[this.state.selectedScenario][0].extrapolation) {
                                transferFlag = true;
                                break;
                            }
                        }
                    }
                    if (transferFlag) {
                        this.state.modelingEl.setStyle(col, "background-color", "transparent");
                        this.state.modelingEl.setStyle(col, "background-color", "yellow");
                        this.state.modelingEl.setComments(col, 'You can not transfer data to this node as it is an extrapolation node.');
                        valid = false;
                    } else {
                        this.state.modelingEl.setStyle(col, "background-color", "transparent");
                        this.state.modelingEl.setComments(col, "");
                    }
                } else {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setComments(col, "");
                }
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
                var startDate = this.state.modelingEl.getValue(`B${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var stopDate = this.state.modelingEl.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.state.modelingEl.getValueFromCoords(2, y);
                var diff = moment(stopDate).diff(moment(startDate), 'months');
                if (value == "") {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setStyle(col, "background-color", "yellow");
                    this.state.modelingEl.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                }
                else if (diff <= 0) {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setStyle(col, "background-color", "yellow");
                    this.state.modelingEl.setComments(col, i18n.t('static.validation.pleaseEnterValidDate'));
                    valid = false;
                }
                else {
                    this.state.modelingEl.setStyle(col, "background-color", "transparent");
                    this.state.modelingEl.setComments(col, "");
                }
                var elInstance = this.state.modelingEl;
                var rowData = elInstance.getRowData(y);
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
                if (this.state.currentTransferData == "" || this.state.currentTransferData == "_T" || this.state.currentTransferData == "_F") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange) < 0 ? -1 : 1, true);
                }
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, isNaN(parseFloat(this.state.currentCalculatedMomChange)) ? "" : parseFloat(this.state.currentCalculatedMomChange) < 0 ? parseFloat(this.state.currentCalculatedMomChange * -1).toFixed(4) : parseFloat(this.state.currentCalculatedMomChange), true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, "", true);
                elInstance.setValueFromCoords(14, this.state.currentRowIndex, 0, true);
            }
        } else {
            if (this.state.currentModelingType == 2) {
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentModelingType, true);
                if (this.state.currentTransferData == "" || this.state.currentTransferData == "_T" || this.state.currentTransferData == "_F") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentTargetChangeNumber) < 0 ? -1 : 1, true);
                }
                var startDate = this.state.currentCalculatorStartDate;
                var endDate = this.state.currentCalculatorStopDate;
                var monthDifference = parseInt(moment(endDate).startOf('month').diff(startDate, 'months', true) + 1);
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, isNaN(parseFloat((this.state.currentTargetChangeNumber).toString().replaceAll(",", ""))) ? "" : parseFloat((this.state.currentTargetChangeNumber).toString().replaceAll(",", "")) < 0 ? parseFloat(parseFloat((this.state.currentTargetChangeNumber).toString().replaceAll(",", "") / monthDifference).toFixed(4) * -1) : parseFloat(parseFloat((this.state.currentTargetChangeNumber).toString().replaceAll(",", "") / monthDifference).toFixed(4)), true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, "", true);
                elInstance.setValueFromCoords(14, this.state.currentRowIndex, 0, true);
            } else if (this.state.currentModelingType == 3) {
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentModelingType, true);
                if (this.state.currentTransferData == "" || this.state.currentTransferData == "_T" || this.state.currentTransferData == "_F") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.percentForOneMonth) < 0 ? -1 : 1, true);
                }
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, !isFinite(this.state.percentForOneMonth) ? "" : parseFloat(this.state.percentForOneMonth) < 0 ? parseFloat(this.state.percentForOneMonth * -1).toFixed(4) : parseFloat(this.state.percentForOneMonth).toFixed(4), true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, "", true);
                elInstance.setValueFromCoords(14, this.state.currentRowIndex, 0, true);
            } else if (this.state.currentModelingType == 4) {
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentModelingType, true);
                if (this.state.currentTransferData == "" || this.state.currentTransferData == "_T" || this.state.currentTransferData == "_F") {
                    elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.percentForOneMonth) < 0 ? -1 : 1, true);
                }
                elInstance.setValueFromCoords(1, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, !isFinite(this.state.percentForOneMonth) ? "" : parseFloat(this.state.percentForOneMonth) < 0 ? parseFloat(this.state.percentForOneMonth * -1).toFixed(4) : parseFloat(this.state.percentForOneMonth).toFixed(4), true);
                elInstance.setValueFromCoords(7, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(9, this.state.currentRowIndex, "", true);
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
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = map1.get("9").toString().replaceAll(",", "");
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = map1.get("9").toString().replaceAll(",", "");
        var count = this.state.modelingEl.getData().length;
        for (var i = 0; i < count; i++) {
            this.state.modelingEl.deleteRow(i);
        }
        var dataArr = []
        const reversedList = [...json].reverse();
        for (var i = 0; i < reversedList.length - 1; i++) {
            var map = new Map(Object.entries(reversedList[i]));
            var map1 = new Map(Object.entries(reversedList[i + 1]));
            var data = []
            var stopDate = moment("01 " + map.get("8"), "DD MMM YYYY").format("YYYY-MM-DD");
            var data2 = (i == 0) ? moment(stopDate, "YYYY-MM-DD").subtract(6, "months").format("YYYY-MM-DD") : stopDate;
            // data[0] = "Monthly change for " + map.get("7") + " - " + moment(data2).format("MMM YYYY") + ";\nConsiders: " + map.get("0") + " Entered Target = " + addCommas(map.get("1")) + "\nCalculated Target = " + addCommas(map.get("4"));
            var startDate = map.get("7");
            var stopDate = moment(data2).format("MMM YYYY");
            var dateRange = map.get("0");
            var enteredTarget = addCommas(map.get("1"));
            var calculatedTarget = addCommas(map.get("4"));
            data[0] = i18n.t('static.tree.discription', { startDate, stopDate, dateRange, enteredTarget, calculatedTarget });
            data[1] = moment("01 " + map.get("7"), "DD MMM YYYY").format("YYYY-MM-DD");
            data[2] = data2;
            data[3] = '';
            data[4] = this.state.currentModelingType;
            data[5] = parseFloat(map.get("3")).toFixed(4) < 0 ? -1 : 1;
            data[6] = this.state.currentModelingType != 2 ? Math.abs(parseFloat(map.get("3")).toFixed(4)) : "";
            data[7] = this.state.currentModelingType == 2 ? Math.abs(parseFloat(map.get("3") * map1.get("9") / 100).toFixed(4)) : "";
            data[8] = cleanUp
            data[9] = '';
            data[10] = ''
            data[11] = ''
            data[12] = 0
            data[13] = {
                firstMonthOfTarget: moment(this.state.firstMonthOfTarget, "YYYY-MM-DD").format("YYYY-MM"),
                yearsOfTarget: this.state.yearsOfTarget,
                actualOrTargetValueList: this.state.actualOrTargetValueList
            }
            data[14] = this.state.targetSelect;
            dataArr.push(map.get("1"))
            this.state.modelingEl.insertRow(
                data, 0, 1
            );
        }
        this.setState({
            currentItemConfig,
            currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0],
            isChanged: true,
            showCalculatorFields: false
        }, () => {
            var json = {
                "year": map1.get("8").split(" ")[1],
                "month": moment(map1.get("8").split(" ")[0], "MMM").format("M")
            }
            document.getElementById("nodeValue").value = map1.get("9");
            this.handleAMonthDissmis1(json)
            this.handleAMonthChange1(map1.get("8").split(" ")[1], moment(map1.get("8").split(" ")[0], "MMM").format("M"), 1)
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
            sameLevelNodeList.push({ id: arr[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId + "_T", name: "To " + getLabelText(arr[i].payload.label, this.state.lang) });
            sameLevelNodeList.push({ id: arr[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId + "_F", name: "From " + getLabelText(arr[i].payload.label, this.state.lang) });
            sameLevelNodeList1[i] = { id: arr[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId + "_T", name: "To " + getLabelText(arr[i].payload.label, this.state.lang) };
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
            var nodeDataModelingList = arr[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataModelingList;
            if (nodeDataModelingList != undefined && nodeDataModelingList != null) {
                var transferList = nodeDataModelingList.filter(x => x.transferNodeDataId == nodeDataId);
                if (transferList.length > 0) {
                    var tempTransferList = JSON.parse(JSON.stringify(transferList));
                    if (transferList.length == 1) {
                        tempTransferList[0].transferNodeDataId = arr[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId;
                        nodeTransferDataList.push(tempTransferList[0]);
                    } else {
                        for (let j = 0; j < transferList.length; j++) {
                            tempTransferList[j].transferNodeDataId = arr[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId;
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
     * Builds Jexcel table for modeling data
     */
    buildModelingJexcel() {
        var scalingList = this.state.currentScenario.nodeDataModelingList == undefined ? [] : this.state.currentScenario.nodeDataModelingList;
        var nodeTransferDataList = this.state.nodeTransferDataList;
        var dataArray = [];
        let count = 0;
        if (scalingList.length == 0) {
            data = [];
            data[0] = ''
            data[1] = moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY-MM-DD")
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
        if (scalingList.length > 0) {
            for (var j = 0; j < scalingList.length; j++) {
                data = [];
                data[0] = scalingList[j].notes
                data[1] = scalingList[j].startDate
                data[2] = scalingList[j].stopDate
                data[3] = scalingList[j].transferNodeDataId + "_T"
                data[4] = scalingList[j].modelingType.id
                data[5] = scalingList[j].increaseDecrease
                data[6] = scalingList[j].modelingType.id != 2 ? (scalingList[j].dataValue != '' ? parseFloat(scalingList[j].dataValue).toFixed(4) : '') : '';
                data[7] = scalingList[j].modelingType.id == 2 ? scalingList[j].dataValue : ''
                data[8] = cleanUp
                var nodeValue = this.state.currentScenario.calculatedDataValue;
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
                    firstMonthOfTarget: this.state.currentScenario.annualTargetCalculator == undefined ? this.state.firstMonthOfTarget : moment(moment(this.state.currentScenario.annualTargetCalculator.firstMonthOfTarget, "YYYY-MM")).format("YYYY-MM-DD"),
                    yearsOfTarget: this.state.currentScenario.annualTargetCalculator == undefined ? this.state.yearsOfTarget : this.state.currentScenario.annualTargetCalculator.yearsOfTarget,
                    actualOrTargetValueList: this.state.currentScenario.annualTargetCalculator == undefined ? this.state.actualOrTargetValueList : this.state.currentScenario.annualTargetCalculator.actualOrTargetValueList
                }
                data[14] = scalingList[j].modelingSource
                scalingTotal = parseFloat(scalingTotal) + parseFloat(calculatedChangeForMonth);
                dataArray[count] = data;
                count++;
            }
        }
        for (var j = 0; j < nodeTransferDataList.length; j++) {
            data = [];
            data[0] = nodeTransferDataList[j].notes
            data[1] = nodeTransferDataList[j].startDate
            data[2] = nodeTransferDataList[j].stopDate
            data[3] = nodeTransferDataList[j].transferNodeDataId + "_F"
            data[4] = nodeTransferDataList[j].modelingType.id
            data[5] = 1
            data[6] = nodeTransferDataList[j].modelingType.id != 2 ? parseFloat(nodeTransferDataList[j].dataValue).toFixed(4) : ''
            data[7] = nodeTransferDataList[j].modelingType.id == 2 ? (nodeTransferDataList[j].dataValue) : ''
            data[8] = ""
            var nodeValue = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
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
        this.setState({ scalingTotal }, () => {
        });
        if (this.state.modelingEl != "" && document.getElementById("modelingJexcel")!=null) {
            jexcel.destroy(document.getElementById("modelingJexcel"), true);
        }
        var data = dataArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [90, 160, 80, 80, 90, 90, 90, 90, 90],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.common.description'),
                    type: 'text',
                    width: '130'
                },
                {
                    title: i18n.t('static.common.startdate'),
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY-MM-DD"), this.state.maxMonth] }, width: 100
                },
                {
                    title: i18n.t('static.common.stopdate'),
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY-MM-DD"), this.state.maxMonth] }, width: 100
                },
                {
                    title: i18n.t('static.tree.transferToNode'),
                    type: 'dropdown',
                    width: '130',
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
                        { id: 1, name: i18n.t('static.tree.increase') },
                        { id: -1, name: i18n.t('static.tree.decrease') }
                    ]
                },
                {
                    title: i18n.t('static.tree.monthlyChange%'),
                    type: 'numeric',
                    decimal: '.',
                    mask: '#,##0.0000%'
                },
                {
                    title: i18n.t('static.tree.MonthlyChange#'),
                    type: this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'numeric' : 'hidden',
                    mask: '#,##0.0000', decimal: '.'
                },
                {
                    title: i18n.t('static.tree.modelingCalculater'),
                    type: 'image',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.calculatedChangeForMonthTree') + " " + moment(this.state.currentScenario.month.replace(/-/g, '\/')).add(1, 'months').format('MMM. YYYY'),
                    type: 'numeric',
                    mask: '#,##0.0000',
                    decimal: '.',
                    textEditor: true,
                    disabledMaskOnEdition: true,
                    width: '130',
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
            editable: true,
            onload: this.loaded,
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
                    }
                    else {
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
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y == null) {
                } else {
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: "Insert Row",
                            onclick: function () {
                                var data = [];
                                data[0] = ''
                                data[1] = moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY-MM-DD")
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
                                        data[0] = ''
                                        data[1] = moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY-MM-DD")
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
                                        obj.insertRow(data, 0, 1);
                                        obj.deleteRow(parseInt(y) + 1);
                                        var col = ("C").concat(parseInt(0) + 1);
                                        obj.setStyle(col, "background-color", "transparent");
                                        obj.setComments(col, "");
                                        var col = ("F").concat(parseInt(0) + 1);
                                        obj.setStyle(col, "background-color", "transparent");
                                        obj.setComments(col, "");
                                        this.setState({
                                            lastRowDeleted: true,
                                            scalingTotal: ""
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
            this.filterScalingDataByMonth(this.state.scalingMonth.year + "-" + this.state.scalingMonth.month + "-01");
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
            if (y == 8 && AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2) {
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
                        firstMonthOfTarget: "",
                        yearsOfTarget: "",
                        actualOrTargetValueList: []
                    }, () => {
                        var startValue = this.getMomValueForDateRange(rowData[1]);
                        var targetYears = ((moment(rowData[2]).diff(moment(rowData[1]), 'years') + 1) + 1) < 3 ? 3 : ((moment(rowData[2]).diff(moment(rowData[1]), 'years') + 1) + 1);
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
                            yearsOfTarget: rowData[13].yearsOfTarget == "" && this.state.yearsOfTarget == "" ? targetYears : (rowData[13].yearsOfTarget != "" ? rowData[13].yearsOfTarget : this.state.yearsOfTarget),
                            firstMonthOfTarget: (rowData[13].firstMonthOfTarget == "" || rowData[13].firstMonthOfTarget == "Invalid date") && (this.state.firstMonthOfTarget == "Invalid date" || this.state.firstMonthOfTarget == "") ? rowData[1] : (rowData[13].firstMonthOfTarget != "" ? rowData[13].firstMonthOfTarget : this.state.firstMonthOfTarget),
                            actualOrTargetValueListOriginal: rowData[13].actualOrTargetValueList.length != 0 && this.state.actualOrTargetValueList.length == 0 ? rowData[13].actualOrTargetValueList : this.state.actualOrTargetValueList,
                            yearsOfTargetOriginal: rowData[13].yearsOfTarget == "" && this.state.yearsOfTarget == "" ? targetYears : (rowData[13].yearsOfTarget != "" ? rowData[13].yearsOfTarget : this.state.yearsOfTarget),
                            firstMonthOfTargetOriginal: rowData[13].firstMonthOfTarget == "" && this.state.firstMonthOfTarget == "" ? rowData[1] : (rowData[13].firstMonthOfTarget != "" ? rowData[13].firstMonthOfTarget : this.state.firstMonthOfTarget),
                            targetSelect: rowData[14],
                            targetSelectDisable: true,
                            isCalculateClicked: 0
                        }, () => {
                            if (this.state.showCalculatorFields) {
                                this.buildModelingCalculatorJexcel();
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
                            var targetYears = (Number(moment(rowData[2]).diff(moment(rowData[1]), 'years') + 1) + 1) < 3 ? 3 : (Number(moment(rowData[2]).diff(moment(rowData[1]), 'years') + 1) + 1)
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
                                yearsOfTarget: targetYears,
                                firstMonthOfTarget: rowData[1],
                                actualOrTargetValueListOriginal: this.state.actualOrTargetValueList,
                                yearsOfTargetOriginal: targetYears,
                                firstMonthOfTargetOriginal: rowData[1],
                                modelingSource: rowData[14],
                                targetSelectDisable: false,
                                isCalculateClicked: 0
                            }, () => {
                                if (this.state.showCalculatorFields) {
                                    this.buildModelingCalculatorJexcel();
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
        if (x != 9 && x != 11 && this.state.modelingChangedOrAdded == false) {
            this.setState({
                modelingChangedOrAdded: true
            })
        }

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
            var col = ("D").concat(parseInt(y) + 1);
            var transferFlag = false;
            if (value != "") {
                this.state.modelingEl.setValueFromCoords(5, y, -1, true);
                var items = this.state.items;
                var transfer = value != "" ? value.split('_')[0] : '';
                if (transfer != '') {
                    for (let i = 0; i < items.length; i++) {
                        var nodeDataId = items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId;
                        if (nodeDataId == transfer && items[i].payload.nodeDataMap[this.state.selectedScenario][0].extrapolation) {
                            transferFlag = true;
                            break;
                        }
                    }
                }
                if (transferFlag) {
                    instance.setStyle(col, "background-color", "transparent");
                    instance.setStyle(col, "background-color", "yellow");
                    instance.setComments(col, 'You can not transfer data to this node as it is an extrapolation node.');
                } else {
                    instance.setStyle(col, "background-color", "transparent");
                    instance.setComments(col, "");
                }
            }
            else {
                this.state.modelingEl.setValueFromCoords(5, y, "", true);
                instance.setStyle(col, "background-color", "transparent");
                instance.setComments(col, "");
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
        var startDate = instance.getValue(`B${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        var stopDate = instance.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            var diff1 = moment(stopDate).diff(moment(startDate), 'months');
            if (value == "") {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                instance.setStyle(col, "background-color", "transparent");
                instance.setComments(col, "");
                var col1 = ("C").concat(parseInt(y) + 1)
                if (diff1 <= 0) {
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
            var diff = moment(stopDate).diff(moment(startDate), 'months');
            if (value == "") {
                instance.setStyle(col, "background-color", "transparent");
                instance.setStyle(col, "background-color", "yellow");
                instance.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            else if (diff <= 0) {
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
            var monthDifference = moment(stopDate).diff(startDate, 'months', true);
            var nodeValue = this.state.currentScenario.calculatedDataValue;
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
                            calculatedChangeForMonth = parseFloat(value).toFixed(4);
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
        if (!this.state.modelingTabChanged) {
            this.setState({
                modelingTabChanged: true
            })
        }

    }.bind(this);
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
        data[1] = moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY-MM-DD")
        data[2] = this.state.maxMonth
        data[3] = ''
        data[4] = this.state.currentItemConfig.context.payload.nodeType.id == PERCENTAGE_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == FU_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == PU_NODE_ID ? 5 : '';
        data[5] = ''
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
            children: [new TextRun({ "text": i18n.t('static.consumption.program') + " : ", bold: true }), new TextRun({ "text": document.getElementById("datasetId").selectedOptions[0].text })],
            spacing: {
                after: 150,
            },
        }));
        dataArray.push(new Paragraph({
            children: [new TextRun({ "text": i18n.t('static.forecastMethod.tree') + " : ", bold: true }), new TextRun({ "text": document.getElementById("treeId").selectedOptions[0].text })],
            spacing: {
                after: 150,
            },
        }));
        dataArray.push(new Paragraph({
            children: [new TextRun({ "text": i18n.t('static.whatIf.scenario') + " : ", bold: true }), new TextRun({ "text": document.getElementById("scenarioId").selectedOptions[0].text })],
            spacing: {
                after: 150,
            },
        }));
        dataArray.push(new Paragraph({
            children: [new TextRun({ "text": i18n.t('static.supplyPlan.date') + " : ", bold: true }), new TextRun({ "text": this.makeText(this.state.singleValue2) })],
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
            } else if (items[i].payload.nodeType.id == 6) {
                row = row.concat(this.getPayloadData(items[i], 2).split(" ")[1])
                row1 = row1.concat(" ").concat(items[i].payload.label.label_en)
            } else {
                row = row.concat(this.getPayloadData(items[i], 1)).concat(" ").concat(this.getPayloadData(items[i], 2))
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
                        total += Number((item.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue)
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
                    } else if (items[i].payload.nodeType.id != 6) {
                        row = row.concat(total).concat("% ")
                        row1 = row1.concat(" Subtotal")
                    }
                    if (items[i].payload.nodeType.id != 1 && items[i].payload.nodeType.id != 2 && items[i].payload.nodeType.id != 6) {
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
            saveAs(blob, this.state.dataSetObj.programData.programCode + "-" + i18n.t("static.supplyPlan.v") + this.state.dataSetObj.programData.currentVersion.versionId + "-" + i18n.t('static.common.managetree') + "-" + "TreeValidation" + "-" + document.getElementById("treeId").selectedOptions[0].text + "-" + document.getElementById("scenarioId").selectedOptions[0].text + ".docx");
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
                                this.calculateMOMData(0, 2, false);
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
     * Exports data in PDF format
     */
    exportPDF = () => {
        let treeLevel = this.state.items.length;
        var treeLevelItems = [];
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
        var templates = [
            {
                itemSize: new Size(200, 110)
            }
        ]
        var items1 = this.state.items;
        var newItems = [];
        for (var i = 0; i < items1.length; i++) {
            var e = items1[i];
            e.scenarioId = this.state.selectedScenario
            e.showModelingValidation = this.state.showModelingValidation
            e.result = this.getPayloadData(items1[i], 4)
            e.result1 = this.getPayloadData(items1[i], 6)
            e.result2 = this.getPayloadData(items1[i], 5)
            var text = this.getPayloadData(items1[i], 3)
            e.text = text;
            e.dataSetObj = this.state.dataSetObj;
            e.treeId = this.state.treeId;
            delete e.templateName;
            newItems.push(e)
        }
        for (var i = 0; i < newItems.length; i++) {
            if (newItems[i].payload.downwardAggregationList || newItems[i].payload.nodeType.id == 6) {
                if (!newItems[i].payload.downwardAggregationList || newItems[i].payload.downwardAggregationList.length == 0) {
                    treeLevelItems.push({
                        annotationType: AnnotationType.HighlightPath,
                        items: [parseInt(newItems[i].id), parseInt(newItems[i].parent)],
                        color: "#FFFFFF",
                        lineWidth: 10,
                        opacity: 1,
                        showArrows: false
                    })
                }
                for (var j = 0; j < newItems[i].payload.downwardAggregationList.length; j++) {
                    if (newItems[i].payload.downwardAggregationList[j].treeId == this.state.treeId && this.state.showConnections) {
                        treeLevelItems.push(new ConnectorAnnotationConfig({
                            annotationType: AnnotationType.Connector,
                            fromItem: parseInt(newItems[i].payload.downwardAggregationList[j].nodeId),
                            toItem: parseInt(newItems[i].id),
                            labelSize: { width: 80, height: 30 },
                            connectorShapeType: ConnectorShapeType.OneWay,
                            color: "#000000",
                            offset: 0,
                            lineWidth: 1,
                            lineType: LineType.Solid,
                            connectorPlacementType: ConnectorPlacementType.Straight, //Offbeat
                            selectItems: false
                        }));
                    }
                    treeLevelItems.push({
                        annotationType: AnnotationType.HighlightPath,
                        items: [parseInt(newItems[i].id), parseInt(newItems[i].parent)],
                        color: "#FFFFFF",
                        lineWidth: 10,
                        opacity: 1,
                        showArrows: false
                    })
                    var tempValidLines = newItems.filter(x => x.payload.nodeType.id != 6).filter(x => x.id != parseInt(newItems[i].id));
                    for (var k = 0; k < tempValidLines.length; k++) {
                        treeLevelItems.push({
                            annotationType: AnnotationType.HighlightPath,
                            items: [parseInt(tempValidLines[k].id), parseInt(newItems[i].parent)],
                            color: "#000000",
                            lineWidth: 1,
                            opacity: 1,
                            showArrows: false
                        })
                    }
                }
            }
        }
        var sampleChart = new OrgDiagramPdfkit({
            ...this.state,
            pageFitMode: PageFitMode.Enabled,
            hasSelectorCheckbox: Enabled.False,
            hasButtons: Enabled.True,
            buttonsPanelSize: 40,
            orientationType: OrientationType.Top,
            defaultTemplateName: "ContactTemplate",
            linesColor: Colors.White,
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
            .text('Tree PDF', doc.page.width / 2, 20);
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
            .text(getLabelText(this.state.dataSetObj.programData.label, this.state.lang), 30, 85, {
                width: 780,
            });
        doc
            .fillColor('#002f6c')
            .fontSize(12)
            .font('Helvetica')
            .text(i18n.t('static.consumption.program') + ': ' + document.getElementById("datasetId").selectedOptions[0].text, 30, 100);
        doc
            .fillColor('#002f6c')
            .fontSize(12)
            .font('Helvetica')
            .text(i18n.t('static.forecastMethod.tree') + ': ' + document.getElementById("treeId").selectedOptions[0].text, 30, 115);
        doc
            .fillColor('#002f6c')
            .fontSize(12)
            .font('Helvetica')
            .text(i18n.t('static.whatIf.scenario') + ': ' + document.getElementById("scenarioId").selectedOptions[0].text, 30, 130);
        doc
            .fillColor('#002f6c')
            .fontSize(12)
            .font('Helvetica')
            .text(i18n.t('static.tree.displayDate') + "(" + i18n.t('static.consumption.forcast') + ": " + this.state.forecastPeriod + ")" + ': ' + this.makeText(this.state.singleValue2), 30, 145);
        sampleChart.draw(doc, 60, 180);
        doc.restore();
        doc.end();
        if (typeof stream !== 'undefined') {
            stream.on('finish', function () {
                var string = stream.toBlob('application/pdf');
                window.saveAs(string, this.state.dataSetObj.programData.programCode + "-" + i18n.t("static.supplyPlan.v") + this.state.dataSetObj.programData.currentVersion.versionId + "-" + i18n.t('static.common.managetree') + "-" + document.getElementById("treeId").selectedOptions[0].text + "-" + document.getElementById("scenarioId").selectedOptions[0].text + ".pdf");
            }.bind(this));
        } else {
            alert('Error: Failed to create file stream.');
        }
        newItems = [];
        for (var i = 0; i < items1.length; i++) {
            var e = items1[i];
            e.scenarioId = this.state.selectedScenario
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
                scenarioList: curTreeObj.scenarioList,
                // allScenarioList: curTreeObj.scenarioList,
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
     * Reterives scenario list
     */
    getScenarioList() {
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
     * Retrives conversion factor for planning unit
     * @param {*} planningUnitId - Planning unit for which conversion factor should be reterived
     */
    getConversionFactor(planningUnitId) {
        var pu = (this.state.updatedPlanningUnitList.filter(c => c.planningUnitId == planningUnitId))[0];
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
        var tempDownwardAggregationList = [];
        var downwardAggregationList = [];
        // this.state.treeData.map(x => x.tree.flatList.filter(t => t.payload.downwardAggregationAllowed).map(t => (x.treeId != this.state.treeId ? (tempDownwardAggregationList.push({label: x.label.label_en+"~"+t.payload.label.label_en, value: x.treeId+"~"+t.payload.nodeId})) : (t.level == (this.state.addNodeFlag ? this.state.currentItemConfig.context.level : this.state.currentItemConfig.context.level - 1) ? tempDownwardAggregationList.push({label: x.label.label_en+"~"+t.payload.label.label_en, value: x.treeId+"~"+t.payload.nodeId}) : "" ))))
        this.state.treeData.map(x => x.tree.flatList.filter(t => t.payload.downwardAggregationAllowed).map(t => (tempDownwardAggregationList.push({ label: x.label.label_en + "~" + t.payload.label.label_en, value: x.treeId + "~" + t.id }))))
        for (var i = 0; i < this.state.treeData.length; i++) {
            for (var j = 0; j < this.state.treeData[i].scenarioList.length; j++) {
                if (this.state.treeData[i].scenarioList[j].active) {
                    tempDownwardAggregationList.filter(x => x.value.split("~")[0] == this.state.treeData[i].treeId).map(x => downwardAggregationList.push({
                        label: x.label.split("~")[0] + (this.state.treeData[i].scenarioList.filter(s => s.active).length > 1 ? (" > " + this.state.treeData[i].scenarioList[j].label.label_en) : "") + " > ... " + (this.state.treeData[i].tree.flatList.filter(f2 => f2.id == this.state.treeData[i].tree.flatList.filter(x1 => x1.id == x.value.split("~")[1])[0].parent).length > 0 ? this.state.treeData[i].tree.flatList.filter(f2 => f2.id == this.state.treeData[i].tree.flatList.filter(x1 => x1.id == x.value.split("~")[1])[0].parent)[0].payload.label.label_en : "") + " > " + x.label.split("~")[1],
                        value: x.value.split("~")[0] + "~" + this.state.treeData[i].scenarioList[j].id + "~" + x.value.split("~")[1]
                    }))
                }
            }
        }
        var funnelChildNodes = this.state.dataSetObj.programData.treeList.filter(t => t.treeId == this.state.treeId)[0].tree.flatList.filter(x => x.sortOrder.startsWith(this.state.currentItemConfig.context.sortOrder)).map(x => x.id.toString())
        downwardAggregationList = downwardAggregationList.filter(x => (x.value.split("~")[0] == this.state.treeId && !funnelChildNodes.includes(x.value.split("~")[2])) || x.value.split("~")[0] != this.state.treeId)
        downwardAggregationList = downwardAggregationList.sort(function (a, b) {
            a = a.label.toLowerCase();
            b = b.label.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        }.bind(this))

        if (nodeTypeId != 0) {
            nodeType = this.state.nodeTypeList.filter(c => c.id == nodeTypeId)[0];
            for (let i = 0; i < nodeType.allowedChildList.length; i++) {
                var obj = this.state.nodeTypeList.filter(c => c.id == nodeType.allowedChildList[i])[0];
                nodeTypeList.push(obj);
            }
        } else {
            nodeType = this.state.nodeTypeList.filter(c => c.id == 1)[0];
            nodeTypeList.push(nodeType);
            nodeType = this.state.nodeTypeList.filter(c => c.id == 2)[0];
            nodeTypeList.push(nodeType);
            nodeType = this.state.nodeTypeList.filter(c => c.id == 6)[0];
            nodeTypeList.push(nodeType);
        }
        this.setState({
            nodeTypeFollowUpList: nodeTypeList,
            downwardAggregationList: downwardAggregationList
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
        var maxNodeDataId = this.getMaxNodeDataId(true);
        var childList = items1.filter(x => x.sortOrder.startsWith(itemConfig.sortOrder));
        var childListArr = [];
        var json;
        var sortOrder = itemConfig.sortOrder;
        var scenarioList = this.state.scenarioList;
        var childListBasedOnScenarion = [];
        for (let i = 0; i < childList.length; i++) {
            var child = JSON.parse(JSON.stringify(childList[i]));
            var maxNodeId = items.length > 0 ? Math.max(...items.map(o => o.id)) : 0;
            var nodeId = parseInt(maxNodeId + 1);
            if (sortOrder == child.sortOrder) {
                child.payload.nodeId = nodeId;
                child.id = nodeId;
                var parentSortOrder = items.filter(c => c.id == itemConfig.parent)[0].sortOrder;
                var childList1 = items.filter(c => c.parent == itemConfig.parent);
                var maxSortOrder = childList1.length > 0 ? Math.max(...childList1.map(o => o.sortOrder.replace(parentSortOrder + '.', ''))) : 0;
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
                var maxSortOrder = childList1.length > 0 ? Math.max(...childList1.map(o => o.sortOrder.replace(parentSortOrder + '.', ''))) : 0;
                child.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(maxSortOrder) + 1)).slice(-2));
                json = {
                    oldId: oldId,
                    newId: nodeId,
                    oldSortOrder: oldSortOrder,
                    newSortOrder: child.sortOrder
                }
                childListArr.push(json);
            }
            if (scenarioList.length > 0) {
                for (let i = 0; i < scenarioList.length; i++) {
                    childListBasedOnScenarion.push({
                        oldId: (child.payload.nodeDataMap[scenarioList[i].id])[0].nodeDataId,
                        newId: maxNodeDataId
                    });
                    (child.payload.nodeDataMap[scenarioList[i].id])[0].nodeDataId = maxNodeDataId;
                    maxNodeDataId++;
                }
            }
            items.push(child);
        }
        childListArr.map(item => {
            var indexItems = items.findIndex(i => i.id == item.newId);
            if (indexItems != -1) {
                for (let i = 0; i < scenarioList.length; i++) {
                    var nodeDataModelingList = (items[indexItems].payload.nodeDataMap[scenarioList[i].id])[0].nodeDataModelingList;
                    if (nodeDataModelingList.length > 0) {
                        nodeDataModelingList.map((item1, c) => {
                            var newTransferId = childListBasedOnScenarion.filter(c => c.oldId == item1.transferNodeDataId);
                            item1.transferNodeDataId = newTransferId[0].newId;
                        })
                    }
                }
            }
        })
        this.setState({
            items,
            // cursorItem: nodeId
        }, () => {
            this.calculateMOMData(itemConfig.parent, 2, true);
        });
    }
    copyMoveNode() {
        // Selected Tree Id: this.state.copyModalTree
        // Tree List: this.state.copyModalTreeList this.state.treeData
        // Node selected: this.state.copyModalNode
        // Current tree nodes: this.state.items  
        this.setState({ copyLoader: true })
        var itemConfig = this.state.copyModalNode;
        var items1 = this.state.items;
        const { items } = this.state;
        var updatedFlatList = this.state.treeData.filter(x => x.treeId == this.state.copyModalTree)[0].tree.flatList;
        var maxNodeDataId = this.getMaxNodeDataId(true);
        var childList = items1.filter(x => x.sortOrder.startsWith(itemConfig.sortOrder));
        var childListArr = [];
        var json;
        var sortOrder = itemConfig.sortOrder;
        var scenarioList = this.state.scenarioList;
        var scenarioListNew = this.state.treeData.filter(x => x.treeId == this.state.copyModalTree)[0].scenarioList;
        var childListBasedOnScenarion = [];
        for (let i = 0; i < childList.length; i++) {
            var child = JSON.parse(JSON.stringify(childList[i]));
            var maxNodeId = updatedFlatList.length > 0 ? Math.max(...updatedFlatList.map(o => o.id)) : 0;
            var nodeId = parseInt(maxNodeId + 1);
            if (sortOrder == child.sortOrder) {
                child.payload.nodeId = nodeId;
                child.parent = this.state.copyModalParentNode;
                child.payload.parentNodeId = this.state.copyModalParentNode;
                child.id = nodeId;
                child.level = this.state.copyModalParentNodeList.filter(x => x.id == this.state.copyModalParentNode)[0].level + 1;
                if (child.payload.nodeType.id == 6 && this.state.copyModalTree != this.state.treeId) {
                    child.payload.downwardAggregationList = [];
                }
                if (child.payload.downwardAggregationAllowed) {
                    child.payload.downwardAggregationAllowed = false;
                }
                var parentSortOrder = this.state.copyModalParentNodeList.filter(x => x.id == this.state.copyModalParentNode)[0].sortOrder;
                var childList1 = this.state.copyModalTree != this.state.treeId ? updatedFlatList.filter(c => c.parent == this.state.copyModalParentNode) : items.filter(c => c.parent == this.state.copyModalParentNode);
                var maxSortOrder = childList1.length > 0 ? Math.max(...childList1.map(o => o.sortOrder.replace(parentSortOrder + '.', ''))) : 0;
                child.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(maxSortOrder) + 1)).slice(-2));
                json = {
                    oldId: itemConfig.id,
                    newId: nodeId,
                    oldSortOrder: itemConfig.sortOrder,
                    newSortOrder: child.sortOrder,
                    newLevel: child.level
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
                child.level = parentNode.newLevel + 1;
                if (child.payload.nodeType.id == 6) {
                    child.payload.downwardAggregationList = [];
                }
                if (child.payload.downwardAggregationAllowed) {
                    child.payload.downwardAggregationAllowed = false;
                }
                var parentSortOrder = parentNode.newSortOrder;
                var childList1 = this.state.copyModalTree != this.state.treeId ? updatedFlatList.filter(c => c.parent == parentNode.newId) : items.filter(c => c.parent == parentNode.newId);
                var maxSortOrder = childList1.length > 0 ? Math.max(...childList1.map(o => o.sortOrder.replace(parentSortOrder + '.', ''))) : 0;
                child.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(maxSortOrder) + 1)).slice(-2));
                json = {
                    oldId: oldId,
                    newId: nodeId,
                    oldSortOrder: oldSortOrder,
                    newSortOrder: child.sortOrder,
                    newLevel: child.level
                }
                childListArr.push(json);
            }
            if (scenarioList.length > 0) {
                for (let i = 0; i < scenarioList.length; i++) {
                    if (scenarioList[i].id == this.state.selectedScenario) {
                        childListBasedOnScenarion.push({
                            oldId: (child.payload.nodeDataMap[scenarioList[i].id])[0].nodeDataId,
                            newId: maxNodeDataId
                        });
                        (child.payload.nodeDataMap[scenarioList[i].id])[0].nodeDataId = maxNodeDataId;
                        maxNodeDataId++;
                        if (this.state.copyModalTree != this.state.treeId) {
                            var tempData = child.payload.nodeDataMap[scenarioList[i].id];
                            delete child.payload.nodeDataMap[scenarioList[i].id];
                            for (let j = 0; j < scenarioListNew.length; j++) {
                                child.payload.nodeDataMap[scenarioListNew[j].id] = tempData;
                            }
                        }
                    }
                }
            }
            updatedFlatList.push(child);
        }
        childListArr.map(item => {
            var indexItems = updatedFlatList.findIndex(i => i.id == item.newId);
            if (indexItems != -1) {
                for (let i = 0; i < scenarioListNew.length; i++) {
                    let invalidTransfer = [];
                    var nodeDataModelingList = (updatedFlatList[indexItems].payload.nodeDataMap[scenarioListNew[i].id])[0].nodeDataModelingList //.filter(x => (x.transferNodeDataId == "" || x.transferNodeDataId == null) && this.state.copyModeling);
                    if (!this.state.copyModeling) {
                        nodeDataModelingList = nodeDataModelingList.filter(x => (x.transferNodeDataId != "" && x.transferNodeDataId != null && x.transferNodeDataId != "null"));
                    }
                    if (nodeDataModelingList.length > 0) {
                        nodeDataModelingList.map((item1, c) => {
                            var newTransferId = childListBasedOnScenarion.filter(c => c.oldId == item1.transferNodeDataId);
                            if (newTransferId.length == 0 && item1.transferNodeDataId != null && item1.transferNodeDataId != "null" && item1.transferNodeDataId != "") {
                                invalidTransfer.push(item1.nodeDataModelingId);
                            }
                            try {
                                item1.transferNodeDataId = newTransferId[0].newId;
                            } catch {
                            }
                        })
                    }
                    (updatedFlatList[indexItems].payload.nodeDataMap[scenarioListNew[i].id])[0].nodeDataModelingList = nodeDataModelingList.filter(x => !invalidTransfer.includes(x.nodeDataModelingId));
                }
            }
        })
        let tempDatasetObj = this.state.dataSetObj;
        tempDatasetObj.programData.treeList.filter(t => t.treeId == this.state.copyModalTree)[0].tree.flatList = updatedFlatList
        tempDatasetObj.programData.treeList.filter(t => t.treeId == this.state.copyModalTree)[0].tree.autoCalculate = true
        this.setState({
            dataSetObj: tempDatasetObj,
            // items,
            cursorItem: nodeId
        }, () => {
            this.calculateMOMData(0, 2, true).then(() => {
                if (this.state.copyModalData == 2) {
                    this.onRemoveButtonClick(itemConfig).then(() => {
                        this.setState({
                            copyLoader: false,
                            copyModal: false,
                        }, () => {
                            if (this.state.copyModalTree != this.state.treeId) {
                                // this.props.history.push("/dataSet/buildTree/tree/" + this.state.copyModalTree + "/" + this.state.programId + "/" + "-1");
                                // window.location.reload(); 
                                this.setState({
                                    treeId: this.state.copyModalTree,
                                    items: [],
                                    selectedScenario: '',
                                    selectedScenarioLabel: '',
                                    currentScenario: []
                                }, () => {
                                    this.getTreeByTreeId(this.state.treeId);
                                })
                            }
                        })
                    });
                } else {
                    this.setState({
                        copyLoader: false,
                        copyModal: false,
                    }, () => {
                        if (this.state.copyModalTree != this.state.treeId) {
                            // this.props.history.push("/dataSet/buildTree/tree/" + this.state.copyModalTree + "/" + this.state.programId + "/" + "-1");
                            // window.location.reload(); 
                            this.setState({
                                treeId: this.state.copyModalTree,
                                items: [],
                                selectedScenario: '',
                                selectedScenarioLabel: '',
                                currentScenario: []
                            }, () => {
                                this.getTreeByTreeId(this.state.treeId);
                            })
                        }
                    })
                }
            })
        });
    }
    resetCopyMoveModal() {
        this.setState({
            copyModalData: "",
            copyModalTree: "",
            copyModalTreeList: [],
            copyModalParentLevelList: [],
            copyModalParentLevel: "",
            copyModalParentNodeList: [],
            copyModalParentNode: ""
        })
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
     * Reterives the node unit of parent node
     */
    getNodeUnitOfPrent() {
        var id;
        id = this.state.currentItemConfig.parentItem.payload.nodeUnit.id;
        this.setState({
            usageTypeParent: id
        }, () => {
        });
    }
    /**
     * Function to copy data from usage template
     * @param {Event} event The change event
     */
    copyDataFromUsageTemplate(event) {
        var usageTemplate = (this.state.usageTemplateList.filter(c => c.usageTemplateId == event.target.value))[0];
        const { currentItemConfig } = this.state;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.lagInMonths = usageTemplate.lagInMonths;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfPersons = usageTemplate.noOfPatients;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfForecastingUnitsPerPerson = usageTemplate.noOfForecastingUnits;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageFrequency = usageTemplate.usageFrequencyCount;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usagePeriod.usagePeriodId = usageTemplate.usageFrequencyUsagePeriod != null ? usageTemplate.usageFrequencyUsagePeriod.usagePeriodId : '';
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.unit.id = usageTemplate.forecastingUnit.unit.id;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.id = usageTemplate.forecastingUnit.id;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label.label_en = usageTemplate.forecastingUnit.label.label_en;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id = usageTemplate.usageType.id;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.tracerCategory.id = usageTemplate.tracerCategory.id;
        currentItemConfig.context.payload.label = usageTemplate.forecastingUnit.label;
        if ((currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 1) {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage = usageTemplate.oneTimeUsage;
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.repeatCount = usageTemplate.repeatCount;
            if (!usageTemplate.oneTimeUsage) {
                (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.repeatUsagePeriod.usagePeriodId = usageTemplate.repeatUsagePeriod != null ? usageTemplate.repeatUsagePeriod.usagePeriodId : '';
            }
        }
        this.setState({
            currentItemConfig,
            currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0],
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
        var t1 = usagePeriodId != null && usagePeriodId != "" ? (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth : "";
        var t2 = repeatUsagePeriodId != null && repeatUsagePeriodId != "" ? (this.state.usagePeriodList.filter(c => c.usagePeriodId == repeatUsagePeriodId))[0].convertToMonth : "";
        this.setState({
            noFURequired: (noFURequired != "" && noFURequired != 0 ? parseFloat(noFURequired).toFixed(8) : 0),
            usage2Convert: (t1 / t2).toFixed(8),
            usage2ConvertCondition: !(usagePeriodId == repeatUsagePeriodId)
        }, () => {
            this.getUsageText();
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
            var usageText1 = '';
            var usageText2 = '';
            var usageText3 = '';
            var usageText4 = '';
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
                        usageText = i18n.t('static.usageTemplate.every') + " " + addCommas(parseFloat(noOfPersons)) + " " + selectedText.trim().toLowerCase() + "" + i18n.t('static.usageTemplate.requires').toLowerCase() + " " + addCommas(parseFloat(noOfForecastingUnitsPerPerson)) + " " + selectedText1.trim().toLowerCase() + "(s), " + " " + addCommas(parseFloat(usageFrequency)) + " " + i18n.t('static.tree.timesPer').toLowerCase() + " " + selectedText2.trim().toLowerCase() + " " + i18n.t('static.tree.for').toLowerCase() + " " + (this.state.currentScenario.fuNode.repeatCount != null ? parseFloat(this.state.currentScenario.fuNode.repeatCount) : '') + " " + selectedText3.trim().toLowerCase();

                        usageText3 = i18n.t('static.usageTemplate.every') + " " + selectedText.trim().toLowerCase() + "" + i18n.t('static.usageTemplate.requires').toLowerCase() + " " + addCommas(parseFloat(noOfForecastingUnitsPerPerson / noOfPersons)) + " " + selectedText1.trim().toLowerCase() + "(s)" + " " + i18n.t('static.tree.eachTime').toLowerCase();
                        usageText4 = "= " + addCommas(parseFloat(noOfForecastingUnitsPerPerson)) + " " + selectedText1.trim() + "(s) / " + addCommas(parseFloat(noOfPersons)) + " " + selectedText.trim();
                        var uc2 = this.state.usage2ConvertCondition ? (" * " + parseFloat(this.state.usage2Convert) + " " + selectedText2.trim().toLowerCase() + " / " + selectedText3.trim().replace(/\(s\)/, '').toLowerCase()) : "";
                        usageText1 = i18n.t('static.tree.inTotal') + i18n.t('static.usageTemplate.every').toLowerCase() + " " + selectedText.trim().toLowerCase() + "" + i18n.t('static.usageTemplate.requires').toLowerCase() + " " + addCommas(parseFloat(this.state.noFURequired)) + " " + selectedText1.trim().toLowerCase() + "(s)";
                        usageText2 = "= " + addCommas(parseFloat(noOfForecastingUnitsPerPerson / noOfPersons)) + " " + selectedText1.trim().toLowerCase() + "(s) * " + addCommas(parseFloat(usageFrequency)) + " " + i18n.t('static.tree.times').toLowerCase() + " / " + selectedText2.trim().replace(/\(s\)/, '').toLowerCase() + " * " + (this.state.currentScenario.fuNode.repeatCount != null ? parseFloat(this.state.currentScenario.fuNode.repeatCount) : '') + " " + selectedText3.trim().toLowerCase() + uc2;

                    } else {
                        usageText = i18n.t('static.usageTemplate.every') + " " + addCommas(parseFloat(noOfPersons)) + " " + selectedText.trim().toLowerCase() + "" + i18n.t('static.usageTemplate.requires').toLowerCase() + " " + addCommas(parseFloat(noOfForecastingUnitsPerPerson)) + " " + selectedText1.trim().toLowerCase() + "(s)";
                        usageText1 = i18n.t('static.tree.inTotal') + i18n.t('static.usageTemplate.every').toLowerCase() + " " + selectedText.trim().toLowerCase() + "" + i18n.t('static.usageTemplate.requires').toLowerCase() + " " + addCommas(parseFloat(noOfForecastingUnitsPerPerson / noOfPersons)) + " " + selectedText1.trim().toLowerCase() + "(s)";
                        usageText2 = "= " + addCommas(parseFloat(noOfForecastingUnitsPerPerson)) + " " + selectedText1.trim().toLowerCase() + "(s) " + " / " + addCommas(parseFloat(noOfPersons)) + " " + selectedText.trim().toLowerCase() + "(s) ";
                    }
                } else {
                    usageText = i18n.t('static.usageTemplate.every') + " " + addCommas(parseFloat(noOfPersons)) + " " + selectedText.trim().toLowerCase() + "" + i18n.t('static.usageTemplate.requires').toLowerCase() + " " + addCommas(parseFloat(noOfForecastingUnitsPerPerson)) + " " + selectedText1.trim().toLowerCase() + "(s) " + i18n.t('static.usageTemplate.every').toLowerCase() + " " + addCommas(parseFloat(usageFrequency)) + " " + selectedText2.trim().toLowerCase() + " " + i18n.t('static.tree.indefinitely').toLowerCase();
                    usageText1 = i18n.t('static.usageTemplate.every') + " " + selectedText.trim().toLowerCase() + "" + i18n.t('static.usageTemplate.requires').toLowerCase() + " " + addCommas(parseFloat((this.state.currentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.currentScenario.fuNode.usageFrequency) * (this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentScenario.fuNode.usagePeriod.usagePeriodId))[0].convertToMonth)) + " " + selectedText1.trim().toLowerCase() + "(s) / " + i18n.t('static.common.month').toLowerCase() + " " + i18n.t('static.tree.indefinitely').toLowerCase();
                    usageText2 = "= " + parseFloat(this.state.currentScenario.fuNode.noOfForecastingUnitsPerPerson) + " " + selectedText1.trim().toLowerCase() + "(s) " + " / " + parseFloat(this.state.currentScenario.fuNode.usageFrequency) + " " + selectedText2.trim().toLowerCase() + " * " + parseFloat((this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentScenario.fuNode.usagePeriod.usagePeriodId))[0].convertToMonth) + " " + selectedText2.trim().toLowerCase() + "/" + i18n.t('static.common.month').toLowerCase();
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
                        // usageText = i18n.t('static.tree.forEach') + " " + nodeUnitTxt.trim() + " " + i18n.t('static.tree.weNeed') + " " + addCommasWith8Decimals(puPerInterval) + " " + planningUnit + " " + i18n.t('static.usageTemplate.every') + " " + this.state.currentScenario.puNode.refillMonths + " " + i18n.t('static.report.month');
                        usageText = i18n.t('static.tree.forEach') + " " + nodeUnitTxt.trim() + " " + i18n.t('static.tree.weNeed') + " " + addCommasWith8Decimals(puPerInterval) + " " + planningUnit + " " + i18n.t('static.usageTemplate.every').toString().toLowerCase() + " " + i18n.t('static.tree.month');
                    }
                } else {
                    usageText = "";
                }
            }
        } catch (err) {
        }
        finally {
            this.setState({
                usageText,
                usageText1,
                usageText2,
                usageText3,
                usageText4
            }, () => {
            });
        }
    }
    /**
     * Retrieves the forecasting unit list based on the tracer category ID.
     * @param {number} type - Type 0 to set the forecasting unit value
     * @param {boolean} isUsageTemplate - Indicates whether it's a usage template.
     */
    getForecastingUnitListByTracerCategoryId(type, isUsageTemplate) {
        var scenarioId = this.state.selectedScenario;
        var tracerCategoryId = this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id;
        var forecastingUnitList = this.state.forecastingUnitList;
        var filteredForecastingUnitList = tracerCategoryId != "" && tracerCategoryId != undefined ? this.state.forecastingUnitList.filter(x => x.tracerCategory.id == tracerCategoryId) : forecastingUnitList;
        let forecastingUnitMultiList = filteredForecastingUnitList.length > 0
            && filteredForecastingUnitList.map((item, i) => {
                return ({ value: item.id, label: getLabelText(item.label, this.state.lang) + " | " + item.id })
            }, this);
        var result = tracerCategoryId == "" || tracerCategoryId == undefined ? [] :
            (this.state.currentScenario.fuNode.forecastingUnit.id != undefined &&
                this.state.currentScenario.fuNode.forecastingUnit.id != "" &&
                filteredForecastingUnitList.filter(x => x.id == this.state.currentScenario.fuNode.forecastingUnit.id).length > 0 ?
                { value: this.state.currentScenario.fuNode.forecastingUnit.id, label: getLabelText(this.state.currentScenario.fuNode.forecastingUnit.label, this.state.lang) + " | " + this.state.currentScenario.fuNode.forecastingUnit.id }
                : []);
        this.setState({
            forecastingUnitMultiList,
            fuValues: tracerCategoryId == undefined ? [] : (this.state.currentScenario.fuNode.forecastingUnit.id != undefined && this.state.currentScenario.fuNode.forecastingUnit.id != "" && filteredForecastingUnitList.filter(x => x.id == this.state.currentScenario.fuNode.forecastingUnit.id).length > 0 ? { value: this.state.currentScenario.fuNode.forecastingUnit.id, label: getLabelText(this.state.currentScenario.fuNode.forecastingUnit.label, this.state.lang) + " | " + this.state.currentScenario.fuNode.forecastingUnit.id } : []),
            tempPlanningUnitId: tracerCategoryId == "" || tracerCategoryId == undefined ? '' : this.state.tempPlanningUnitId,
            planningUnitList: tracerCategoryId == "" || tracerCategoryId == undefined ? [] : this.state.planningUnitList
        }, () => {
            if (filteredForecastingUnitList.length == 1) {
                const currentItemConfig = this.state.currentItemConfig;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.id = filteredForecastingUnitList[0].id;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.label = filteredForecastingUnitList[0].label;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.tracerCategory.id = filteredForecastingUnitList[0].tracerCategory.id;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.unit.id = filteredForecastingUnitList[0].unit.id;
                this.setState({
                    currentItemConfig: currentItemConfig,
                    currentScenario: (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0]
                }, () => {
                    if (type == 0) {
                        var fuValues = { value: filteredForecastingUnitList[0].id, label: getLabelText(filteredForecastingUnitList[0].label, this.state.lang) + " | " + filteredForecastingUnitList[0].id };
                        this.setState({
                            fuValues
                        }, () => {
                        });
                    } else {
                    }
                    this.getForecastingUnitUnitByFUId(this.state.fuValues.value);
                    this.getPlanningUnitListByFUId(filteredForecastingUnitList[0].id);
                })
            } else if (this.state.addNodeFlag) {
                if (isUsageTemplate > 0) {
                    this.getPlanningUnitListByFUId(isUsageTemplate);
                } else {
                    if (this.state.currentScenario.fuNode.forecastingUnit.id != undefined && this.state.currentScenario.fuNode.forecastingUnit.id != "") {
                        if (this.state.forecastingUnitMultiList.filter(c => c.value == this.state.currentScenario.fuNode.forecastingUnit.id).length != 0) {
                            this.getPlanningUnitListByFUId(this.state.currentScenario.fuNode.forecastingUnit.id);
                        } else {
                            this.setState({ planningUnitList: [] });
                        }
                    }
                }
            }
        });
    }
    /**
     * Toggles the visibility of modeling validation messages.
     * @param {Object} e - The event object triggered by the checkbox action.
     */
    hideTreeValidation(e) {
        this.setState({
            showModelingValidation: e.target.checked == true ? false : true
        })
    }
    /**
     * Toggles the auto-calculation feature and triggers calculation if enabled.
     * @param {Object} e - The event object triggered by the checkbox action.
     */
    autoCalculate(e) {
        var val = (e.target.checked);
        var prevVal = this.state.autoCalculate;
        localStorage.setItem('sesAutoCalculate', val)
        this.setState({
            autoCalculate: val
        }, () => {
            if (val == true && prevVal == false) {
                this.setState({
                    loading: true
                })
                this.calculateMOMData(0, 2, false);
            }
        })
    }
    /**
     * Recalculates modeling data for a specific node.
     * @param {string} nodeId - The ID of the node to recalculate.
     * @param {string} type - The type of recalculation (if applicable).
     */
    recalculate(nodeId, type) {
        this.setState({
            loading: true
        })
        let { curTreeObj } = this.state;
        let { treeData } = this.state;
        let { dataSetObj } = this.state;
        var items = this.state.items;
        var programData = dataSetObj.programData;
        programData.treeList = treeData;
        curTreeObj.tree.flatList = items;
        curTreeObj.scenarioList = this.state.scenarioList;
        var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
        treeData[findTreeIndex] = curTreeObj;
        programData.treeList = treeData;
        dataSetObj.programData = programData;
        calculateModelingData(dataSetObj, this, '', 0, this.state.selectedScenario, type, this.state.treeId, false, false, true);
    }
    /**
     * Toggles the visibility of action buttons.
     * @param {Object} e - The event object triggered by the checkbox action.
     */
    hideActionButtons(e) {
        this.setState({
            hideActionButtons: e.target.checked
        })
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
        this.setState({ items: updatedItems }, () => { this.saveTreeData(false, true) })
    }
    changeShowConnections(e) {
        this.setState({ showConnections: !e.target.checked })
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
     * Calculate node value
     */
    calculateNodeValue() {
    }
    /**
     * Reterives tracer category list
     */
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
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                this.setState({
                    tracerCategoryList: myResult
                }, () => {
                })
            }.bind(this);
        }.bind(this)
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
                    for (let i = 0; i < this.state.nodeUnitList.length; i++) {
                        var nodeUnit = JSON.parse(JSON.stringify(this.state.nodeUnitList[i]));
                        nodeUnit.label.label_en = nodeUnit.label.label_en + "(s)";
                        nodeUnitListPlural.push(nodeUnit);
                    }
                    this.setState({ nodeUnitListPlural })
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
        var maxNodeDataId = this.getMaxNodeDataId(false);
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
            this.calculateMOMData(this.state.parentNodeIdForBranch, 2, false);
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
     * Reterives forecasting unit Id based on tracer category Id
     * @param {number} tracerCategoryId - The ID of the tracer category.
     */
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
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var proList = []
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].tracerCategory.id == tracerCategoryId) {
                        proList[i] = myResult[i]
                    }
                }
                this.setState({
                    forecastingUnitByTracerCategory: proList
                }, () => {
                })
            }.bind(this);
        }.bind(this)
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
        // Detect initial theme
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        this.setState({ isDarkMode });

        // Listening for theme changes
        const observer = new MutationObserver(() => {
            const updatedDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
            this.setState({ isDarkMode: updatedDarkMode });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        this.setState({
            treeId: this.props.match.params.treeId,
            templateId: this.props.match.params.templateId
        }, () => {
            this.getUsagePeriodList();
            this.getTreeList();
            this.getForecastMethodList();
            this.getUnitListForDimensionIdFour();
            this.getUnitList();
            this.getUsageTypeList();
            this.getNodeTyeList();
            this.getDatasetList();
            this.getModelingTypeList();
            this.getRegionList();
            this.procurementAgentList();
        })
    }
    /**
     * Adds a new scenario to the tab list.
     */
    addScenario() {
        const { scenario, curTreeObj } = this.state;
        var scenarioList = this.state.scenarioList;
        var type = this.state.scenarioActionType;
        var items = curTreeObj.tree.flatList;
        var scenarioId;
        var temNodeDataMap = [];
        var result = scenarioList.filter(x => x.label.label_en.trim() == scenario.label.label_en.trim());
        var activeScenarios = scenarioList.filter(x => x.active.toString() == "true");
        var activeScenarios1 = activeScenarios.length > 1 ? activeScenarios.filter(x => x.id == scenario.id) : [];
        var isActive = (type == 2 && scenario.active.toString() == "false" && activeScenarios1.length == 0) ? 1 : 0;

        if (isActive) {
            alert("You must have at least one active scenario.");
        } else if ((type == 1 && result.length == 0) || (type == 2 && ((result.length == 1 && scenario.id == result[0].id) || result.length == 0)) || type == 3 || type == 4) {
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
                scenarioList = [...scenarioList, newTabObject];
                if (this.state.treeId != "") {
                    if (this.state.scenarioList.length > 1) {
                    }
                    var tArr = [];
                    for (var i = 0; i < items.length; i++) {
                        for (let j = 0; j < scenarioList.length; j++) {
                            if (items[i].payload.nodeDataMap.hasOwnProperty(scenarioList[j].id)) {
                                temNodeDataMap.push(items[i].payload.nodeDataMap[scenarioList[j].id][0]);
                                tArr.push(items[i].payload.nodeDataMap[scenarioList[j].id][0].nodeDataId);
                            }
                        }
                        var tempArray = [];
                        var nodeDataMap = {};
                        tempArray.push(JSON.parse(JSON.stringify((items[i].payload.nodeDataMap[minScenarioId])[0])));
                        nodeDataMap = items[i].payload.nodeDataMap;
                        nodeDataMap[scenarioId] = tempArray;
                        nodeDataMap[scenarioId][0].nodeDataId = "";
                        items[i].payload.nodeDataMap = nodeDataMap;
                    }
                }
            } else if (type == 2 || type == 3) {
                scenarioId = this.state.selectedScenario;
                var scenario1 = scenarioList.filter(x => x.id == scenarioId)[0];
                var findNodeIndex = scenarioList.findIndex(n => n.id == scenarioId);
                if (type == 2) {
                    scenarioList[findNodeIndex] = this.state.scenario;
                    if (this.state.showOnlyActive && scenario.active.toString() == "false") {
                        items = [];
                        scenarioId = '';
                    }
                } else if (type == 3) {
                    items = [];
                    scenarioId = '';
                    scenario1.active = false;
                    scenarioList[findNodeIndex] = scenario1;
                    scenarioList=scenarioList.filter(x => x.id != this.state.selectedScenario);
                    var tree=curTreeObj.tree;
                    var flatList=tree.flatList;
                    for(var fl=0;fl<flatList.length;fl++){
                        var nodeDataMap=flatList[fl].payload.nodeDataMap;
                        delete nodeDataMap[this.state.selectedScenario];
                        flatList[fl].payload.nodeDataMap=flatList[fl].payload.nodeDataMap;
                        flatList[fl].payload.downwardAggregationList=flatList[fl].payload.downwardAggregationList.filter(c=>c.scenarioId!=this.state.selectedScenario);
                    }
                    tree.flatList=flatList;
                    curTreeObj.tree=tree;
                }
            }
            curTreeObj.scenarioList = scenarioList;
            this.setState({
                showDiv1: false,
                curTreeObj,
                items,
                selectedScenario: scenarioId,
                // allScenarioList: scenarioList,
                scenarioList: scenarioList,
                openAddScenarioModal: false,
                isScenarioChanged: true
            }, () => {
                if (type == 1) {
                    var maxNodeDataId = temNodeDataMap.length > 0 ? Math.max(...temNodeDataMap.map(o => o.nodeDataId)) : 0;
                    for (var i = 0; i < items.length; i++) {
                        maxNodeDataId = parseInt(maxNodeDataId) + 1;
                        (items[i].payload.nodeDataMap[scenarioId])[0].nodeDataId = maxNodeDataId;
                    }
                    this.callAfterScenarioChange(scenarioId);
                }
                this.saveTreeData(false, false);
            });
        } else {
            alert(i18n.t('static.tree.duplicateScenarioName'));
        }
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
        } else if (nodeTypeId == 6) {
            this.setState({
                numberNode: false,
                aggregationNode: false
            }, () => {
                (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = 0;
                (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode = null;
                (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode = null;
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
                if (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode != null && currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode != "" && currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode != undefined && currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit != null && currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit != "" && currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit != undefined && (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.id != "" && (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.id != null && (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.id != undefined) {
                    currentItemConfig.context.payload.label.label_en = getLabelText((currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label, this.state.lang).trim();
                }
            }
            if (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode == null || currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode == "" || currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode == undefined) {
                currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode = {
                    oneTimeUsage: "false",
                    oneTimeDispensing: "true",
                    lagInMonths: 0,
                    forecastingUnit: {
                        tracerCategory: {
                        },
                        unit: {
                            id: ""
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
                currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode = {
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
                aggregationNode: true,
                showFUValidation: true
            }, () => {
                this.getNodeUnitOfPrent();
            });
        }
        if ((nodeTypeId == 3 || nodeTypeId == 4 || nodeTypeId == 5) && this.state.addNodeFlag && currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].dataValue == "") {
            currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].dataValue = 100;
            this.setState({ currentItemConfig, currentScenario: currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0] }, () => {
                this.calculateParentValueFromMOM(currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].month);
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
            if (this.state.currentItemConfig.context.payload.nodeType.id == 1 || this.state.currentItemConfig.context.payload.nodeType.id == 6) {
                if (tab == 2) {
                    this.showMomData();
                }
            }
            if (tab == 3) {
                if (this.state.modelingEl != "") {
                    jexcel.destroy(document.getElementById('modelingJexcel'), true);
                    if (this.state.momEl != "") {
                        if (document.getElementById('momJexcel') != null) {
                            jexcel.destroy(document.getElementById('momJexcel'), true);
                        }
                    }
                    else if (this.state.momElPer != "") {
                        jexcel.destroy(document.getElementById('momJexcelPer'), true);
                    }
                }
                this.refs.extrapolationChild.getExtrapolationMethodList();
            }
            if (tab == 2) {
                if (this.state.currentItemConfig.context.payload.nodeType.id != 1) {
                    var curDate = (moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD'));
                    var month = this.state.currentScenario.month;
                    var minMonth = this.state.forecastStartDate;
                    var maxMonth = this.state.forecastStopDate;
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
                        minMonth, maxMonth, filteredModelingType: modelingTypeListNew,
                        scalingMonth: {
                            year: Number(moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY")), month: Number(moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("MM"))
                        },
                    }, () => {
                        if (!this.state.modelingTabChanged)
                            this.buildModelingJexcel();
                    })
                }
                else {
                    this.setState({
                        showModelingJexcelNumber: true,
                        scalingMonth: {
                            year: Number(moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY")), month: Number(moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("MM"))
                        },
                    }, () => {
                        if (!this.state.modelingTabChanged)
                            this.buildModelingJexcel();
                    })
                }
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
        if (event.target.name === "active") {
            scenario.active = event.target.id === "activeTrueScenario" ? true : false;
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
        if (event.target.name === "oneTimeDispensing") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeDispensing = (event.target.value).replaceAll(",", "");
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
            this.getUsageText();
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
        if (event.target.name == "downwardAggregationAllowed") {
            currentItemConfig.context.payload.downwardAggregationAllowed = event.target.checked;
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
        const { curTreeObj } = this.state;
        var treeLevelList = curTreeObj.levelList != undefined ? curTreeObj.levelList : [];
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
        curTreeObj.levelList = treeLevelList;
        newItem.level = parseInt(itemConfig.context.level + 1);
        newItem.payload.nodeId = nodeId;
        var pu = this.state.planningUnitList.filter(x => x.id == this.state.tempPlanningUnitId)[0];
        newItem.payload.label = pu.label;
        newItem.payload.nodeType.id = 5;
        newItem.sortOrder = itemConfig.context.sortOrder.concat(".").concat(("01").slice(-2));
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataId = this.getMaxNodeDataId(false);
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = 100;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.id = this.state.tempPlanningUnitId;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.label = pu.label;
        try {
            var puPerVisit = "";
            if (itemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.usageType.id == 2) {
                var refillMonths = 1;
                (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.refillMonths = refillMonths;
                puPerVisit = parseFloat(((itemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / pu.multiplier).toFixed(8);
            } else {
                puPerVisit = parseFloat(this.state.noFURequired / pu.multiplier).toFixed(8);
            }
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit = puPerVisit;
        } catch (err) {
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.refillMonths = 1;
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit = "";
        }
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.sharePlanningUnit = true;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.multiplier = pu.multiplier;
        var scenarioList = this.state.scenarioList.filter(x => x.id != this.state.selectedScenario);
        if (scenarioList.length > 0) {
            for (let i = 0; i < scenarioList.length; i++) {
                var tempArray = [];
                var nodeDataMap = {};
                tempArray.push(JSON.parse(JSON.stringify((newItem.payload.nodeDataMap[this.state.selectedScenario])[0])));
                nodeDataMap = newItem.payload.nodeDataMap;
                tempArray[0].nodeDataId = this.getMaxNodeDataId(false);
                nodeDataMap[scenarioList[i].id] = tempArray;
                newItem.payload.nodeDataMap = nodeDataMap;
            }
        }
        this.setState({
            items: [...items, newItem],
            cursorItem: nodeId,
            converionFactor: pu.multiplier,
            curTreeObj
        }, () => {
            if (!itemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation) {
                this.calculateMOMData(parent, 0, false);
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
        const { curTreeObj } = this.state;
        var treeLevelList = curTreeObj.levelList != undefined ? curTreeObj.levelList : [];
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
        curTreeObj.levelList = treeLevelList;
        newItem.level = parseInt(itemConfig.context.level + 1);
        newItem.payload.nodeId = nodeId;
        var parentSortOrder = items.filter(c => c.id == itemConfig.context.parent)[0].sortOrder;
        var childList = items.filter(c => c.parent == itemConfig.context.parent);
        var maxSortOrder = childList.length > 0 ? Math.max(...childList.map(o => o.sortOrder.replace(parentSortOrder + '.', ''))) : 0;
        newItem.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(maxSortOrder) + 1)).slice(-2));
        var maxNodeDataId = this.getMaxNodeDataId(false);
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataId = maxNodeDataId;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].month = moment((newItem.payload.nodeDataMap[this.state.selectedScenario])[0].month).startOf('month').format("YYYY-MM-DD")
        if (addNode) {
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataModelingList = data;
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].annualTargetCalculator = {
                firstMonthOfTarget: moment(moment(this.state.firstMonthOfTarget, "YYYY-MM-DD")).format("YYYY-MM"),
                yearsOfTarget: this.state.yearsOfTarget,
                actualOrTargetValueList: this.state.actualOrTargetValueList
            };
        }
        if (itemConfig.context.payload.nodeType.id == 4) {
            var tracerCategoryId = newItem.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.tracerCategory.id;
            if (tracerCategoryId == "" || tracerCategoryId == undefined || tracerCategoryId == null) {
                var fu = this.state.forecastingUnitList.filter(x => x.id == newItem.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.id);
                if (fu.length > 0) {
                    (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.tracerCategory.id = fu[0].tracerCategory.id;
                }
            }
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label.label_en = (itemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label.label_en;
        }
        var scenarioList = this.state.scenarioList.filter(x => x.id != this.state.selectedScenario);
        if (scenarioList.length > 0) {
            for (let i = 0; i < scenarioList.length; i++) {
                if (scenarioList[i].id != this.state.selectedScenario) {
                    var tempArray = [];
                    var nodeDataMap = {};
                    tempArray.push(JSON.parse(JSON.stringify((newItem.payload.nodeDataMap[this.state.selectedScenario])[0])));
                    nodeDataMap = newItem.payload.nodeDataMap;
                    tempArray[0].nodeDataId = parseInt(maxNodeDataId + 1);
                    nodeDataMap[scenarioList[i].id] = tempArray;
                    newItem.payload.nodeDataMap = nodeDataMap;
                }
            }
        }
        this.setState({
            items: [...items, newItem],
            cursorItem: nodeId,
            isSubmitClicked: false,
            curTreeObj
        }, () => {
            if (itemConfig.context.payload.nodeType.id == 4) {
                this.createPUNode(JSON.parse(JSON.stringify(itemConfig)), nodeId);
            } else {
                this.calculateMOMData(newItem.id, 0, false);
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
                }, () => {
                });
            } else {
                var findNodeIndex = items.findIndex(n => n.id == getAllAggregationNode[i].id);
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].dataValue = "";
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue = "";
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].displayDataValue = "";
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].displayCalculatedDataValue = "";
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
        return new Promise((resolve, reject) => {
            var { items } = this.state;
            var sourceNodes = items.filter(x => x.payload.downwardAggregationAllowed && x.sortOrder.startsWith(itemConfig.sortOrder));
            const ids = items.map(o => o.id)
            const filtered = items.filter(({ id }, index) => !ids.includes(id, index + 1))
            items = filtered;
            var treeList = [this.state.curTreeObj.treeId];
            if (sourceNodes.length > 0) {
                this.state.dataSetObj.programData.treeList.map(t => t.tree.flatList.filter(f => f.payload.nodeType.id == 6).map(n => n.payload.downwardAggregationList && n.payload.downwardAggregationList.length > 0 && n.payload.downwardAggregationList[0].nodeId && n.payload.downwardAggregationList.map(da => {
                    if (da.nodeId && sourceNodes.map(c => c.id.toString()).includes(da.nodeId.toString()) && da.treeId == this.state.curTreeObj.treeId) {
                        treeList = treeList.concat(t.treeId);
                    }
                })))
            }
            this.setState(this.getDeletedItems(items, [itemConfig.id]), () => {
                setTimeout(() => {
                    if (itemConfig.payload.nodeType.id == 2) {
                        this.calculateMOMData(itemConfig.parent, 2, false).then(() => {
                            resolve();
                        });
                    } else if (itemConfig.payload.downwardAggregationAllowed) {
                        this.calculateMOMData(itemConfig.id, 2, false, treeList).then(() => {
                            resolve();
                        });
                    } else {
                        this.calculateMOMData(itemConfig.id, 2, false).then(() => {
                            resolve();
                        });
                    }
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
            var sourceNodeUsageList = [];
            this.state.dataSetObj.programData.treeList.map(tl => tl.tree.flatList.map(f => f.payload.downwardAggregationList ? (f.payload.downwardAggregationList.map(da => (da.treeId == this.state.treeId && da.nodeId == data.context.payload.nodeId && data.context.payload.downwardAggregationAllowed) ? sourceNodeUsageList.push({ treeId: tl.treeId, scenarioId: da.scenarioId, nodeId: da.nodeId, treeName: tl.label.label_en, isScenarioVisible: this.state.dataSetObj.programData.treeList.filter(tl2 => tl2.treeId == da.treeId)[0].scenarioList.filter(s => s.active), scenarioName: this.state.dataSetObj.programData.treeList.filter(tl2 => tl2.treeId == da.treeId)[0].scenarioList.filter(sl => sl.id == da.scenarioId)[0].label.label_en, nodeName: f.payload.label.label_en, parentName: tl.tree.flatList.filter(f2 => f2.id == f.parent).length > 0 ? tl.tree.flatList.filter(f2 => f2.id == f.parent)[0].payload.label.label_en : "" }) : "")) : ""))
            this.setState({
                sourceNodeUsageList: sourceNodeUsageList,
                viewMonthlyData: true,
                usageTemplateId: '',
                sameLevelNodeList: [],
                showCalculatorFields: false,
                showMomData: false,
                showMomDataPercent: false,
                addNodeFlag: false,
                openAddNodeModal: data.context.templateName ? data.context.templateName == "contactTemplateMin" ? false : true : true,
                modelingChangedOrAdded: false,
                orgCurrentItemConfig: JSON.parse(JSON.stringify(data.context)),
                currentItemConfig: JSON.parse(JSON.stringify(data)),
                level0: (data.context.level == 0 ? false : true),
                numberNode: (data.context.payload.nodeType.id == 1 || data.context.payload.nodeType.id == 6 || data.context.payload.nodeType.id == 2 ? false : true),
                aggregationNode: (data.context.payload.nodeType.id == 1 || data.context.payload.nodeType.id == 6 ? false : true),
                currentScenario: (data.context.payload.nodeDataMap[this.state.selectedScenario])[0],
                highlightItem: item.id,
                cursorItem: item.id,
                parentScenario: data.context.level == 0 ? [] : (data.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0],
                modelingEl: "",
                modelingTabChanged: false,
                currentNodeTypeId: data.context.payload.nodeType.id
            }, () => {
                try {
                    jexcel.destroy(document.getElementById('modelingJexcel'), true);
                } catch (err) {
                }
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
                    this.setState({ items: updatedItems }, () => { this.saveTreeData(false, true) })
                }
                var scenarioId = this.state.selectedScenario;
                if (data.context.level != 0) {
                    this.calculateParentValueFromMOM(data.context.payload.nodeDataMap[this.state.selectedScenario][0].month);
                }
                this.getNodeTypeFollowUpList(data.context.level == 0 ? 0 : data.parentItem.payload.nodeType.id);
                if (data.context.payload.nodeType.id == 4) {
                    this.setState({
                        fuValues: { value: this.state.currentScenario.fuNode.forecastingUnit.id, label: getLabelText(this.state.currentScenario.fuNode.forecastingUnit.label, this.state.lang) + " | " + this.state.currentScenario.fuNode.forecastingUnit.id }
                    });
                    this.getForecastingUnitListByTracerCategoryId(1, 0);
                    this.getNodeUnitOfPrent();
                    this.getNoOfFUPatient();
                    this.getNoOfMonthsInUsagePeriod();
                    this.getNoFURequired();
                    this.filterUsageTemplateList(this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id, 0);
                    this.getUsageText();
                    this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.currentItemConfig.parentItem.payload.nodeUnit.id;
                } else if (data.context.payload.nodeType.id == 5) {
                    this.getPlanningUnitListByFUId((data.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.id);
                    this.getNoOfMonthsInUsagePeriod();
                    this.getNoFURequired();
                    this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id;
                    var planningUnit = this.state.updatedPlanningUnitList.filter(x => x.id == this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id);
                    var conversionFactor = planningUnit.length > 0 ? planningUnit[0].multiplier : "";
                    this.setState({
                        conversionFactor
                    }, () => {
                        if (this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.usageType.id == 2) {
                            if (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.refillMonths != "" && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.refillMonths != null && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.refillMonths != undefined && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.refillMonths != 1) {
                                this.calculatePUPerVisit(false)
                            }
                        }
                        this.qatCalculatedPUPerVisit(0);
                        this.getUsageText();
                    });
                }
                if (data.context.payload.nodeType.id != 1) {
                    this.getSameLevelNodeList(data.context.level, data.context.id, data.context.payload.nodeType.id, data.context.parent);
                    this.getNodeTransferList(data.context.level, data.context.id, data.context.payload.nodeType.id, data.context.parent, data.context.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId);
                }
            })
        }
    };
    /**
     * Function to update the node info in json
     * @param {*} currentItemConfig The item configuration object that needs to be updated
     */
    updateNodeInfoInJson(currentItemConfig) {
        var nodes = this.state.items;
        // if (currentItemConfig.context.payload.nodeType.id != 2 && currentItemConfig.context.payload.nodeType.id != 3) {
        //     delete currentItemConfig.context.payload.downwardAggregationAllowed;
        // }
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
            curTreeObj
        }, () => {
            this.calculateMOMData(currentItemConfig.context.id, 0, false);
        });
    }
    /**
     * Builds jexcel table for annual target calculator
     */
    buildModelingCalculatorJexcel() {
        jexcel.destroy(document.getElementById("modelingCalculatorJexcel"), true);
        var dataArray = [];
        var actualOrTargetValueList = this.state.actualOrTargetValueList;
        let count = this.state.yearsOfTarget;
        for (var j = 0; j <= count; j++) {
            let startdate = moment(moment(this.state.currentCalculatorStartDate, "YYYY-MM-DD").subtract(1, "years").add(j, "years")).format("MMM YYYY")
            let stopDate = moment(moment(startdate, "MMM YYYY").add(11, "months")).format("MMM YYYY");
            let modifyStartDate = moment(startdate, "MMM YYYY").subtract(7, "months").format("MMM YYYY");
            let modifyStartDate1 = moment(modifyStartDate, "MMM YYYY").add(1, "months").format("MMM YYYY");
            let modifyStopDate1 = moment(modifyStartDate1, "MMM YYYY").add(11, "months").format("MMM YYYY");
            var data = [];
            data[0] = startdate + " - " + stopDate
            data[1] = actualOrTargetValueList.length > 0 ? actualOrTargetValueList[j] : ""
            data[7] = j == 0 ? "" : modifyStartDate1
            data[8] = j == count ? stopDate : modifyStopDate1
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
                    decimal: '.',
                    mask: '#,##0.0000',
                    type: 'hidden'
                }
            ],
            editable: true,
            oneditionend: function (instance, cell, x, y, value) {
                var elInstance = instance;
                var rowData = elInstance.getRowData(y);
                if (x == 1) {
                    elInstance.setValueFromCoords(1, y, Math.round(rowData[1]), true);
                }
            },
            onpaste: function (instance, data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].x == 1) {
                        (instance).setValueFromCoords(1, data[i].y, Math.round(data[i].value), true);
                    }
                }
            },
            onload: this.loadedModelingCalculatorJexcel,
            onchange: this.changeModelingCalculatorJexcel,
            search: false,
            columnSorting: false,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            copyCompatibility: true,
            allowExport: false,
            position: 'top',
            filters: false,
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this)
        };
        var modelingCalculatorEl = jexcel(document.getElementById("modelingCalculatorJexcel"), options);
        this.el = modelingCalculatorEl;
        this.setState({
            modelingCalculatorEl: modelingCalculatorEl,
        }, () => {
            this.filterScalingDataByMonth(this.state.scalingMonth.year + "-" + this.state.scalingMonth.month + "-01");
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
        var dataArr = elInstance.records;
        var rowEndDate = moment(dataArr[dataArr.length - 1][8].v).format("YYYY-MM-DD");
        var forecastStopDate = moment(this.state.forecastStopDate).format("YYYY-MM-DD");
        var isAfter = moment(rowEndDate).isAfter(forecastStopDate);
        if (isCalculateClicked == 2 && isAfter) {
            var cf = window.confirm(i18n.t("static.modelingCalculator.targetBeyondForecast"));
            if (cf == true) {
                this.calculateChanged3(isCalculateClicked);
            }
        } else {
            this.calculateChanged3(isCalculateClicked);
        }
    }

    calculateChanged3(isCalculateClicked) {
        var elInstance = this.state.modelingCalculatorEl;
        var validation = this.validFieldData();
        if (validation) {
            this.setState({ isCalculateClicked: isCalculateClicked })
            var dataArray = [];
            var dataArrayTotal = [];
            let modelingType = document.getElementById("modelingType").value;
            var calculatedTotal = 0;
            var calculatedTotal1 = 0;
            var dataArr = elInstance.records;
            var startMonthYear = "";
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
                    var start = moment(moment(rowData[7].v, 'MMM YYYY'))
                    var stop = moment(moment(rowData[8].v, 'MMM YYYY'))
                    var count = 1;
                    var calculatedTotal = parseFloat(rowData1[9].v);
                    var calculatedTotal1 = parseFloat(rowData1[9].v);
                    var arr = [];
                    if (startMonthYear == "") {
                        startMonthYear = moment(moment(rowData[0].v.split("-")[0], 'MMM YYYY')).format("MMM YYYY");
                    }
                    while (start.isSameOrBefore(stop)) {
                        if (modelingType == "active1") {
                            calculatedTotal = parseFloat(calculatedTotal * (1 + monthlyChange / 100));
                        } else {
                            if (count <= 12) {
                                var a = parseFloat(1 + ((monthlyChange / 100) * count));
                                calculatedTotal1 = parseFloat(calculatedTotal * a);
                            }
                        }
                        var programJson = {
                            date: moment(start).format('MMM YYYY'),
                            calculatedTotal: modelingType == "active1" ? calculatedTotal : calculatedTotal1,
                        }
                        arr.push(programJson)
                        dataArrayTotal.push(programJson);
                        start.add(1, 'months');
                        count++;
                    }
                    elInstance.setValueFromCoords(9, j, modelingType == "active1" ? calculatedTotal : arr[arr.length - 1].calculatedTotal, true);
                }
                dataArray[j] = rowData[1].v;
            }
            if (dataArrayTotal.length > 0) {
                this.calculateRollingTotals(startMonthYear, dataArrayTotal);
                this.setState({
                    actualOrTargetValueList: dataArray
                });
            }
        }
    }

    calculateRollingTotals(startDateStr, data) {
        const startDate = moment(startDateStr, "MMM YYYY");
        let result = [];
        let index = 0;
        var elInstance = this.state.modelingCalculatorEl;
        while (index < this.state.yearsOfTarget) {
            let endDate = startDate.clone().add(11, "months");
            let total = 0;

            data.forEach(entry => {
                const entryDate = moment(entry.date, "MMM YYYY");
                if (entryDate.isBetween(startDate, endDate, undefined, "[]")) {
                    total += entry.calculatedTotal;
                }
            });

            result.push(`${startDate.format("MMM YY")}-${endDate.format("MMM YY")}: ${total.toFixed(1)}`);
            var abc = total.toFixed(1);
            elInstance.setValueFromCoords(4, index + 1, abc, true);
            var value = elInstance.getValueFromCoords(1, index + 1);
            elInstance.setValueFromCoords(5, index + 1, abc != 0 ? (abc - value) : 0, true);
            elInstance.setValueFromCoords(6, index + 1, abc != 0 ? (abc - value) / value * 100 : 0, true);

            startDate.add(1, "years");
            index++;
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
        // elInstance.setValueFromCoords(7, 0, "", true)
        var asterisk = document.getElementsByClassName("jss")[1].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[3].title = i18n.t('static.tooltip.annualChangePer');
        tr.children[5].title = i18n.t('static.tooltip.calculatedTotal');
        tr.children[6].title = i18n.t('static.tooltip.diffTargetVsCalculatedNo');
        tr.children[7].title = i18n.t('static.tooltip.diffTargetVsCalculatedPer');
        tr.children[2].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[3].classList.add('InfoTr');
        tr.children[5].classList.add('InfoTr');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');
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
        const darkModeColors = [
            '#d4bbff',

        ];

        const lightModeColors = [
            '#002F6C',  // Color 1

        ];

        const { isDarkMode } = this.state;
        const colors = isDarkMode ? darkModeColors : lightModeColors;
        const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
        const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';
        var chartOptions = {
            title: {
                display: true,
                text: this.state.showMomData ? this.state.dataSetObj.programData.programCode + "~" + i18n.t("static.supplyPlan.v") + this.state.dataSetObj.programData.currentVersion.versionId + " - " + document.getElementById("treeId").selectedOptions[0].text + " - " + document.getElementById("scenarioId").selectedOptions[0].text + " - " + getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) : "",
                fontColor: fontColor
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: this.state.currentItemConfig.context.payload.nodeUnit.label != null && this.state.currentItemConfig.context.payload.nodeType.id != 1 ? getLabelText(this.state.currentItemConfig.context.payload.nodeUnit.label, this.state.lang) : '',
                            fontColor: fontColor
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: fontColor,
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
                            drawBorder: true, lineWidth: 1,
                            color: gridLineColor,
                            zeroLineColor: gridLineColor
                        },
                        position: 'left',
                    }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: fontColor
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0,
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
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
                    fontColor: fontColor
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
                    borderColor: colors[0],
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
                labels: [...new Set(this.state.momList.map(ele => (moment(ele.month).format(DATE_FORMAT_CAP_WITHOUT_DATE))))],
                datasets: datasetsArr
            };
        }
        var chartOptions1 = {
            title: {
                display: true,
                text: this.state.showMomDataPercent ? this.state.dataSetObj.programData.programCode + "~" + i18n.t("static.supplyPlan.v") + this.state.dataSetObj.programData.currentVersion.versionId + " - " + document.getElementById("treeId").selectedOptions[0].text + " - " + document.getElementById("scenarioId").selectedOptions[0].text + " - " + getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) : "",
                fontColor: fontColor
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: this.state.currentItemConfig.context.payload.nodeType.id > 2 ?
                                this.state.currentItemConfig.context.payload.nodeUnit.id != "" ?
                                    this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode != null && this.state.currentScenario.fuNode.forecastingUnit != null && this.state.currentScenario.fuNode.forecastingUnit.unit.id != "" ? getLabelText(this.state.unitList.filter(c => c.unitId == this.state.currentScenario.fuNode.forecastingUnit.unit.id)[0].label, this.state.lang) : ""
                                        : this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentScenario.puNode != undefined && this.state.currentScenario.puNode.planningUnit.unit.id != "" ? getLabelText(this.state.unitList.filter(c => c.unitId == this.state.currentScenario.puNode.planningUnit.unit.id)[0].label, this.state.lang) : ""
                                            : getLabelText(this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label, this.state.lang)
                                    : ""
                                : "",
                            fontColor: fontColor
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: fontColor,
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
                            drawBorder: true, lineWidth: 1,
                            color: gridLineColor,
                        },
                        position: 'left',
                    },
                    {
                        id: 'B',
                        scaleLabel: {
                            display: true,
                            labelString: "% of " + ((this.state.currentItemConfig.context.payload.nodeType.id > 2 && this.state.currentItemConfig.context.payload.nodeType.id != 6) ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : ""),
                            fontColor: 'black'
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: fontColor,
                            callback: function (value) {
                                var cell1 = value + " %";
                                return cell1;
                            },
                            min: 0,
                        },
                        gridLines: {
                            drawBorder: true, lineWidth: 0,
                            color: gridLineColor,
                            zeroLineColor: gridLineColor
                        },
                        position: 'right',
                    }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: fontColor
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0,
                        color: gridLineColor,
                        zeroLineColor: gridLineColor
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
                    fontColor: fontColor
                }
            }
        }
        let bar1 = {}
        if (this.state.momListPer != null && this.state.momListPer.length > 0 && this.state.momElPer != '') {
            var datasetsArr = [];
            datasetsArr.push(
                {
                    label: '% ' + (this.state.currentItemConfig.parentItem != null ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : '') + ' (Month End)',
                    type: 'line',
                    stack: 3,
                    yAxisID: 'A',
                    backgroundColor: 'transparent',
                    borderColor: colors[0],
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
                    data: (this.state.momElPer).getJson(null, false).map((item, index) => (this.state.momElPer.getValue(`G${parseInt(index) + 1}`, true))),
                }
            )
            datasetsArr.push({
                label: getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang),
                stack: 1,
                yAxisID: 'A',
                backgroundColor: '#BA0C2F',
                borderColor: grey,
                pointBackgroundColor: grey,
                pointBorderColor: '#fff',
                pointHoverBorderColor: grey,
                pointHoverBackgroundColor: 'transparent',
                pointHoverBorderColor: 'transparent',
                pointHitRadius: 5,
                data: (this.state.momElPer).getJson(null, false).map((item, index) => (this.state.currentItemConfig.context.payload.nodeType.id > 3 ? this.state.momElPer.getValue(`K${parseInt(index) + 1}`, true).toString().replaceAll("\,", "") : this.state.currentItemConfig.context.payload.nodeType.id == 3 ? this.state.momElPer.getValue(`I${parseInt(index) + 1}`, true).toString().replaceAll("\,", "") : this.state.momElPer.getValue(`G${parseInt(index) + 1}`, true).toString().replaceAll("\,", ""))),
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
                        initialValues={{
                            nodeTitle: this.state.currentItemConfig.context.payload.label.label_en,
                            nodeTypeId: this.state.currentItemConfig.context.payload.nodeType.id,
                            nodeUnitId: this.state.currentItemConfig.context.payload.nodeUnit.id != null ? this.state.currentItemConfig.context.payload.nodeUnit.id : "",
                            forecastingUnitId: this.state.fuValues,
                            tempPlanningUnitId: this.state.tempPlanningUnitId,
                            nodeValue: this.state.numberNode ? this.state.currentScenario.calculatedDataValue == 0 ? "0" : addCommas(this.state.currentScenario.calculatedDataValue) : addCommas(this.state.currentScenario.dataValue),
                            percentageOfParent: this.state.currentScenario.dataValue,
                            usageTypeIdFU: "",
                            lagInMonths: "",
                            noOfPersons: "",
                            forecastingUnitPerPersonsFC: "",
                            repeatCount: "",
                            usageFrequencyCon: "",
                            usageFrequencyDis: "",
                            oneTimeUsage: "",
                            planningUnitId: this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario] != undefined ? (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.id : ""
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
                                this.formSubmitLoader();
                                if (this.state.lastRowDeleted == true ? true : this.state.modelingTabChanged ? this.checkValidation() : true) {
                                    if (!this.state.isSubmitClicked) {
                                        this.setState({ loading: true, openAddNodeModal: false, isSubmitClicked: true }, () => {
                                            setTimeout(() => {
                                                if (this.state.addNodeFlag) {
                                                    this.onAddButtonClick(this.state.currentItemConfig, false, null)
                                                } else {
                                                    this.updateNodeInfoInJson(this.state.currentItemConfig)
                                                }
                                                this.setState({
                                                    cursorItem: 0,
                                                    highlightItem: 0,
                                                    activeTab1: new Array(1).fill('1')
                                                })
                                            }, 0);
                                        })
                                        this.setState({ modelingTabChanged: false })
                                    }
                                } else {
                                    this.setState({ activeTab1: new Array(1).fill('2') })
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
                                    <div className="row pt-lg-0" style={{ float: 'right', marginTop: '-42px' }}>
                                        <div className="row pl-lg-0 pr-lg-3">
                                            <a className="">
                                                <span style={{ cursor: 'pointer', color: '20a8d8' }} onClick={() => { this.toggleShowGuidanceNodeData() }} ><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                                            </a>
                                        </div>
                                    </div>
                                    {(this.state.currentItemConfig.context.payload.nodeType.id != 5) &&
                                        <>
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenSenariotree2} target="pop" trigger="hover" toggle={this.toggleSenariotree2}>
                                                    <PopoverBody>{i18n.t('static.tooltip.scenario')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <div className="row">
                                                <FormGroup className="col-md-6">
                                                    <Label htmlFor="scenarioTxt">{i18n.t('static.whatIf.scenario')} <i class="fa fa-info-circle icons pl-lg-2" id="pop" onClick={this.toggleSenariotree2} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                    <Input type="text"
                                                        name="scenarioTxt"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        value={this.state.selectedScenarioLabel}
                                                    ></Input>
                                                </FormGroup>
                                                {this.state.level0 &&
                                                    <>
                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenParent} target="Popover2" trigger="hover" toggle={this.toggleParent}>
                                                                <PopoverBody>{i18n.t('static.tooltip.Parent')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="currencyId">{i18n.t('static.tree.parent')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover2" onClick={this.toggleParent} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                    <Label htmlFor="currencyId">{i18n.t('static.tree.nodeTitle')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover3" onClick={this.toggleNodeTitle} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                <FormGroup className={"col-md-6"}>
                                                    <Label htmlFor="currencyId">{i18n.t('static.tree.nodeType')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover4" onClick={this.toggleNodeType} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 6 || (this.state.aggregationNode && this.state.currentItemConfig.context.payload.nodeType.id < 4) ? 'block' : 'none' }}>
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
                                                        disabled={this.state.currentItemConfig.context.payload.nodeType.id > 3 && this.state.currentItemConfig.context.payload.nodeType.id != 6 ? true : false}
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
                                                <FormGroup className="col-md-6" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                                    <Label htmlFor="currencyId">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span></Label>
                                                    <div className="controls edit">
                                                        <Picker
                                                            id="month"
                                                            name="month"
                                                            ref={this.pickAMonth1}
                                                            years={{ min: this.state.minDateValue, max: this.state.maxDate }}
                                                            value={{
                                                                year: new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getMonth() + 1)).slice(-2)
                                                            }}
                                                            lang={pickerLang.months}
                                                            onChange={this.handleAMonthChange}
                                                            onDismiss={this.handleAMonthDissmis1}
                                                        >
                                                            <MonthBox value={this.makeText({ year: new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) })}
                                                                onClick={this.handleClickMonthBox1} />
                                                        </Picker>
                                                    </div>
                                                </FormGroup>
                                                <div>
                                                    <Popover placement="top" isOpen={this.state.popoverOpenPercentageOfParent} target="Popover5" trigger="hover" toggle={this.togglePercentageOfParent}>
                                                        <PopoverBody>{i18n.t('static.tooltip.PercentageOfParent')}</PopoverBody>
                                                    </Popover>
                                                </div>
                                                <FormGroup className="col-md-6" style={{ display: this.state.numberNode ? 'block' : 'none' }}>
                                                    <Label htmlFor="currencyId">{(this.state.currentItemConfig.context.payload.nodeType.id == 3 ? i18n.t('static.tree.percentageNodeValue') : i18n.t('static.tree.percentageOfParent'))}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover5" onClick={this.togglePercentageOfParent} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                    <InputGroup>
                                                        <Input type="number"
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
                                                            value={this.state.currentScenario.dataValue}></Input>
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
                                                    <Label htmlFor="currencyId">{i18n.t('static.tree.parentValue')} {i18n.t('static.common.for')} {moment(this.state.currentScenario.month).format(`MMM-YYYY`)} <i class="fa fa-info-circle icons pl-lg-2" id="Popover6" onClick={this.toggleParentValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                    <Input type="text"
                                                        id="parentValue"
                                                        name="parentValue"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        value={addCommas(this.state.parentValue.toString())}
                                                    ></Input>
                                                </FormGroup>
                                                <div>
                                                    <Popover placement="top" isOpen={this.state.popoverOpenNodeValue} target="Popover7" trigger="hover" toggle={this.toggleNodeValue}>
                                                        <PopoverBody>{this.state.numberNode ? i18n.t('static.tooltip.NodeValue') : i18n.t('static.tooltip.NumberNodeValue')}</PopoverBody>
                                                    </Popover>
                                                </div>
                                                <FormGroup className="col-md-6" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                                    {(this.state.currentItemConfig.context.payload.nodeType.id < 4) &&
                                                        <Label htmlFor="currencyId">{(this.state.currentItemConfig.context.payload.nodeType.id == 2 ? i18n.t('static.tree.numberNodeValue') : i18n.t('static.tree.nodeValue'))}{this.state.numberNode}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover7" onClick={this.toggleNodeValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>}
                                                    {(this.state.currentItemConfig.context.payload.nodeType.id >= 4) &&
                                                        <Label htmlFor="currencyId"> {this.state.currentScenario.dataValue} % of {i18n.t('static.tree.parentValue')} {i18n.t('static.common.for')} {moment(this.state.currentScenario.month).format(`MMM-YYYY`)} {this.state.numberNode}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover7" onClick={this.toggleNodeValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>}
                                                    <Input type="text"
                                                        id="nodeValue"
                                                        name="nodeValue"
                                                        bsSize="sm"
                                                        valid={!errors.nodeValue && (this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2) ? addCommas(this.state.currentScenario.calculatedDataValue) : addCommas(this.state.currentScenario.dataValue) != ''}
                                                        invalid={touched.nodeValue && !!errors.nodeValue}
                                                        onBlur={handleBlur}
                                                        readOnly={this.state.numberNode || this.state.currentScenario.extrapolation ? true : false}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            this.dataChange(e)
                                                        }}
                                                        value={this.state.numberNode ? this.state.currentScenario.calculatedDataValue == 0 ? "0" : addCommasNodeValue(this.state.currentScenario.calculatedDataValue) : addCommasNodeValue(this.state.currentScenario.dataValue)}
                                                    ></Input>
                                                    <FormFeedback className="red">{errors.nodeValue}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="col-md-6 pt-4" style={{ paddingLeft: "36px", display: (this.state.currentItemConfig.context.payload.nodeType.id == 2 || this.state.currentItemConfig.context.payload.nodeType.id == 3) ? 'block' : 'none' }}>
                                                    <Input
                                                        className="form-check-input checkboxMargin"
                                                        type="checkbox"
                                                        id="downwardAggregationAllowed"
                                                        name="downwardAggregationAllowed"
                                                        checked={this.state.currentItemConfig.context.payload.downwardAggregationAllowed}
                                                        onClick={(e) => { this.dataChange(e) }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="downwardAggregationAllowed" style={{ fontSize: '12px' }}>
                                                        <b>{i18n.t('static.tree.sourceNodeDesc')}</b>
                                                    </Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 6 ? 'block' : 'none' }}>
                                                    <Label htmlFor="currencyId"><b>{i18n.t('static.tree.source')}</b> ({i18n.t('static.common.treeName')} &gt; {i18n.t('static.tree.scenarioName')} &gt; … {i18n.t('static.tree.parentName')} &gt; {i18n.t('static.tree.nodeName')})</Label>
                                                    <MultiSelect
                                                        name="downwardAggregationList"
                                                        id="downwardAggregationList"
                                                        options={this.state.downwardAggregationList.length > 0 ? this.state.downwardAggregationList : []}
                                                        value={this.state.currentItemConfig.context.payload.downwardAggregationList ? this.state.currentItemConfig.context.payload.downwardAggregationList.map(x => ({ value: x.treeId + "~" + x.scenarioId + "~" + x.nodeId, label: this.state.downwardAggregationList.filter(t => t.value == (x.treeId + "~" + x.scenarioId + "~" + x.nodeId))[0].label })) : []}
                                                        onChange={(e) => { this.downwardAggregationListChange(e) }}
                                                        labelledBy={i18n.t('static.common.select')}
                                                    />
                                                </FormGroup>
                                                <FormGroup className="col-md-6">
                                                    <Label htmlFor="currencyId">{i18n.t('static.ManageTree.Notes')}</Label>
                                                    <Input type="textarea"
                                                        id="notes"
                                                        name="notes"
                                                        onChange={(e) => { this.dataChange(e) }}
                                                        value={this.state.currentScenario.notes}
                                                    ></Input>
                                                </FormGroup>
                                                {this.state.currentItemConfig.context.payload.downwardAggregationAllowed && <div className="col-md-6">
                                                    {this.state.sourceNodeUsageList.length > 0 && <><b>{i18n.t('static.tree.aggregatedBy')} </b> ({i18n.t('static.common.treeName')} &gt; {i18n.t('static.tree.scenarioName')} &gt; … {i18n.t('static.tree.parentName')} &gt; {i18n.t('static.tree.nodeName')})</>}
                                                    {this.state.sourceNodeUsageList.length == 0 && <b className='red'>{i18n.t('static.tree.notUsed')}</b>}<br></br>
                                                    {this.state.sourceNodeUsageList.map(sn => (<><u><a href={"/#/dataSet/buildTree/tree/" + sn.treeId + "/" + this.state.programId + "/" + "-1"} target="_blank">
                                                        {sn.treeName + (sn.isScenarioVisible.length > 1 ? (" > " + sn.scenarioName) : "") + " > ... " + sn.parentName + " > " + sn.nodeName}
                                                    </a></u><br></br></>))}
                                                </div>}
                                            </div>
                                        </>}
                                    <div>
                                        <div className="row">
                                            {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                                <>
                                                    <div className="row pl-lg-3 pr-lg-3">
                                                        {this.state.level0 &&
                                                            <>
                                                                <div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenParent} target="Popover2" trigger="hover" toggle={this.toggleParent}>
                                                                        <PopoverBody>{i18n.t('static.tooltip.Parent')}</PopoverBody>
                                                                    </Popover>
                                                                </div>
                                                                <FormGroup className="col-md-4">
                                                                    <Label htmlFor="currencyId">{i18n.t('static.tree.parent')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover2" onClick={this.toggleParent} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                            <Label htmlFor="currencyId">{i18n.t('static.tree.nodeTitle')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover3" onClick={this.toggleNodeTitle} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                        <FormGroup className={"col-md-4"}>
                                                            <Label htmlFor="currencyId">{i18n.t('static.tree.nodeType')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover4" onClick={this.toggleNodeType} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                        <FormGroup className="col-md-4" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                                            <Label htmlFor="currencyId">Month for data start <span class="red Reqasterisk">*</span></Label>
                                                            <div className="controls edit">
                                                                <Picker
                                                                    id="month"
                                                                    name="month"
                                                                    ref={this.pickAMonth1}
                                                                    years={{ min: this.state.minDateValue, max: this.state.maxDate }}
                                                                    value={{
                                                                        year: new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getMonth() + 1)).slice(-2)
                                                                    }}
                                                                    lang={pickerLang.months}
                                                                    onChange={this.handleAMonthChange}
                                                                    onDismiss={this.handleAMonthDissmis1}
                                                                >
                                                                    <MonthBox value={this.makeText({ year: new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) })}
                                                                        onClick={this.handleClickMonthBox1} />
                                                                </Picker>
                                                            </div>
                                                        </FormGroup>
                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenParentValue} target="Popover6" trigger="hover" toggle={this.toggleParentValue}>
                                                                <PopoverBody>{i18n.t('static.tooltip.ParentValue')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <FormGroup className="col-md-4" style={{ display: this.state.numberNode ? 'block' : 'none' }}>
                                                            <Label htmlFor="currencyId">{i18n.t('static.tree.parentValue')} in {moment(this.state.currentScenario.month).format(`MMM-YYYY`)} <i class="fa fa-info-circle icons pl-lg-2" id="Popover6" onClick={this.toggleParentValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                            <Input type="text"
                                                                id="parentValue"
                                                                name="parentValue"
                                                                bsSize="sm"
                                                                readOnly={true}
                                                                onChange={(e) => { this.dataChange(e) }}
                                                                value={addCommas(this.state.parentValue.toString()) + " " + this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en
                                                                }
                                                            ></Input>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-4">
                                                            <Label htmlFor="currencyId">{i18n.t('static.common.note')}</Label>
                                                            <Input type="textarea"
                                                                id="notes"
                                                                name="notes"
                                                                style={{ height: "100px" }}
                                                                onChange={(e) => { this.dataChange(e) }}
                                                                value={this.state.currentScenario.notes}
                                                            ></Input>
                                                        </FormGroup>
                                                        <div>
                                                            <Popover placement="top" isOpen={this.state.popoverOpenPercentageOfParent} target="Popover5" trigger="hover" toggle={this.togglePercentageOfParent}>
                                                                <PopoverBody>{i18n.t('static.tooltip.PercentageOfParent')}</PopoverBody>
                                                            </Popover>
                                                        </div>
                                                        <FormGroup className="col-md-4 PUNodemarginTop" style={{ display: this.state.numberNode ? 'block' : 'none' }}>
                                                            <Label htmlFor="currencyId">{i18n.t('static.tree.percentageOfParent')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover5" onClick={this.togglePercentageOfParent} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                            <InputGroup>
                                                                <Input type="number"
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
                                                                    value={this.state.currentScenario.dataValue}></Input>
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
                                                            <Label htmlFor="currencyId">{i18n.t('static.tree.nodeValue')}{this.state.numberNode}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover7" onClick={this.toggleNodeValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                            <Input type="text"
                                                                id="nodeValue"
                                                                name="nodeValue"
                                                                bsSize="sm"
                                                                valid={!errors.nodeValue && (this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 2) ? addCommas(this.state.currentScenario.displayCalculatedDataValue) : addCommas(this.state.currentScenario.dataValue) != ''}
                                                                invalid={touched.nodeValue && !!errors.nodeValue}
                                                                onBlur={handleBlur}
                                                                readOnly={this.state.numberNode || this.state.currentScenario.extrapolation ? true : false}
                                                                onChange={(e) => {
                                                                    handleChange(e);
                                                                    this.dataChange(e)
                                                                }}
                                                                value={(this.state.numberNode ? this.state.currentScenario.displayCalculatedDataValue == 0 ? "0" : addCommasNodeValue(this.state.currentScenario.displayCalculatedDataValue) : addCommasNodeValue(this.state.currentScenario.dataValue)) + " " + this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en}
                                                            ></Input>
                                                            <FormFeedback className="red">{errors.nodeValue}</FormFeedback>
                                                        </FormGroup>
                                                    </div>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenTypeOfUsePU} target="Popover8" trigger="hover" toggle={this.toggleTypeOfUsePU}>
                                                            <PopoverBody>{i18n.t('static.tooltip.TypeOfUsePU')}</PopoverBody>
                                                        </Popover>
                                                    </div>
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
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenForecastingUnitPU} target="Popover9" trigger="hover" toggle={this.toggleForecastingUnitPU}>
                                                            <PopoverBody>{i18n.t('static.tooltip.TypeOfUsePU')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-7">
                                                        <Label htmlFor="currencyId">{i18n.t('static.product.unit1')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover9" onClick={this.toggleForecastingUnitPU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <Input type="text"
                                                            id="forecastingUnitPU"
                                                            name="forecastingUnitPU"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={this.state.parentScenario.fuNode.forecastingUnit.label.label_en + " | " + this.state.parentScenario.fuNode.forecastingUnit.id}>
                                                        </Input>
                                                    </FormGroup>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenHashOfUMonth} target="Popover11" trigger="hover" toggle={this.toggleHashOfUMonth}>
                                                            <PopoverBody>{i18n.t('static.tooltip.TypeOfUsePU')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="currencyId">{this.state.parentScenario.fuNode.usageType.id == 2 ? "# of FU / month / " : "# of FU / "}{this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en} <i class="fa fa-info-circle icons pl-lg-2" id="Popover11" onClick={this.toggleHashOfUMonth} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <div className='d-flex'>
                                                            <Input type="text"
                                                                id="forecastingUnitPU"
                                                                name="forecastingUnitPU"
                                                                bsSize="sm"
                                                                readOnly={true}
                                                                className="mr-2"
                                                                value={addCommas(this.state.parentScenario.fuNode.usageType.id == 2 ? Number(this.state.parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod).toFixed(4) : this.state.noFURequired)}>
                                                            </Input>
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
                                                        </div>
                                                    </FormGroup>
                                                </>
                                            }
                                            {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                                <>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenConversionFactorFUPU} target="Popover13" trigger="hover" toggle={this.toggleConversionFactorFUPU}>
                                                            <PopoverBody>{i18n.t('static.tooltip.Conversionfactor')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">{i18n.t('static.tree.conversionFUPU')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover13" onClick={this.toggleConversionFactorFUPU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <Input type="text"
                                                            id="conversionFactor"
                                                            name="conversionFactor"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={addCommas(this.state.conversionFactor)}>
                                                        </Input>
                                                    </FormGroup>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenPlanningUnitNode} target="Popover12" trigger="hover" toggle={this.togglePlanningUnitNode}>
                                                            <PopoverBody>{i18n.t('static.tooltip.planningUnitNode')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-7" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                        <Label htmlFor="currencyId">{i18n.t('static.product.product')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover12" onClick={this.togglePlanningUnitNode} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <Input type="select"
                                                            id="planningUnitId"
                                                            name="planningUnitId"
                                                            bsSize="sm"
                                                            className={this.state.currentScenario.isPUMappingCorrect == 0 ? "redPU" : ""}
                                                            valid={!errors.planningUnitId && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentScenario.puNode.planningUnit.id != '' : !errors.planningUnitId}
                                                            invalid={touched.planningUnitId && !!errors.planningUnitId}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentScenario.puNode.planningUnit.id : ""}>
                                                            <option value="" className="black">{i18n.t('static.common.select')}</option>
                                                            {this.state.planningUnitList.length > 0
                                                                && this.state.planningUnitList.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.id} className="black">
                                                                            {getLabelText(item.label, this.state.lang) + " | " + item.id}
                                                                        </option>
                                                                    )
                                                                }, this)}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.planningUnitId}</FormFeedback>
                                                    </FormGroup>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenNoOfPUUsage} target="Popover14" trigger="hover" toggle={this.toggleNoOfPUUsage}>
                                                            <PopoverBody>{i18n.t('static.tooltip.NoOfPUUsage')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="currencyId">{this.state.parentScenario.fuNode.usageType.id == 2 ? "# of PU / month / " : "# of PU /  "}{this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en} <i class="fa fa-info-circle icons pl-lg-2" id="Popover14" onClick={this.toggleNoOfPUUsage} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <div className='d-flex'>
                                                            <Input type="text"
                                                                id="noOfPUUsage"
                                                                name="noOfPUUsage"
                                                                bsSize="sm"
                                                                className="mr-2"
                                                                readOnly={true}
                                                                value={addCommasWith8Decimals(this.state.parentScenario.fuNode.usageType.id == 2 ? parseFloat((this.state.parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / this.state.conversionFactor).toFixed(8) : (this.state.noFURequired / this.state.conversionFactor))}>
                                                            </Input>
                                                            <Input type="select"
                                                                id="planningUnitUnitPU"
                                                                name="planningUnitUnitPU"
                                                                bsSize="sm"
                                                                disabled="true"
                                                                onChange={(e) => { this.dataChange(e) }}
                                                                value={this.state.planningUnitList.filter(c => c.id == this.state.currentScenario.puNode.planningUnit.id).length > 0 ? this.state.planningUnitList.filter(c => c.id == this.state.currentScenario.puNode.planningUnit.id)[0].unit.id : ""}>
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
                                                    {this.state.parentScenario.fuNode.usageType.id == 2 &&
                                                        <>
                                                            <div style={{ display: "none" }}>
                                                                <div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenQATEstimateForInterval} target="Popover15" trigger="hover" toggle={this.toggleQATEstimateForInterval}>
                                                                        <PopoverBody>{i18n.t('static.tooltip.QATEstimateForInterval')}</PopoverBody>
                                                                    </Popover>
                                                                </div>
                                                                <FormGroup className="col-md-6">
                                                                    <Label htmlFor="currencyId">{i18n.t('static.tree.consumptionInterval')}<i class="fa fa-info-circle icons pl-lg-2" id="Popover15" onClick={this.toggleQATEstimateForInterval} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                    <Input type="text"
                                                                        id="interval"
                                                                        name="interval"
                                                                        bsSize="sm"
                                                                        readOnly={true}
                                                                        value={addCommas(this.round(this.state.conversionFactor / (this.state.parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)))}>
                                                                    </Input>
                                                                </FormGroup>
                                                            </div>
                                                            {/* <FormGroup className="col-md-6">
                                                                <Label htmlFor="currencyId"># PU / Interval / {this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.parent != null && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id).length > 0 && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en} (Reference)</Label>
                                                                <Input type="text"
                                                                    id="puPerVisitQATCalculated"
                                                                    name="puPerVisitQATCalculated"
                                                                    readOnly={true}
                                                                    bsSize="sm"
                                                                    value={addCommasWith8Decimals(this.state.qatCalculatedPUPerVisit)}
                                                                >
                                                                </Input>
                                                            </FormGroup> */}
                                                            <div style={{ display: "none" }}>
                                                                <div>
                                                                    <Popover placement="top" isOpen={this.state.popoverOpenConsumptionIntervalEveryXMonths} target="Popover16" trigger="hover" toggle={this.toggleConsumptionIntervalEveryXMonths}>
                                                                        <PopoverBody>{i18n.t('static.tooltip.ConsumptionIntervalEveryXMonths')}</PopoverBody>
                                                                    </Popover>
                                                                </div>
                                                                <FormGroup className="col-md-6">
                                                                    <Label htmlFor="currencyId">{i18n.t('static.tree.consumptionIntervalEveryXMonths')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover16" onClick={this.toggleConsumptionIntervalEveryXMonths} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                            </div>
                                                            {/* <FormGroup className="col-md-6">
                                                                <Label htmlFor="currencyId">{this.state.currentItemConfig.parentItem != null && this.state.parentScenario.fuNode != null && this.state.parentScenario.fuNode.usageType.id == 2 ? "# PU / Interval / " : "# PU / "}{this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.parent != null && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id).length > 0 && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}(s)</Label>
                                                                <Input type="text"
                                                                    id="puPerVisit"
                                                                    name="puPerVisit"
                                                                    readOnly={this.state.parentScenario.fuNode != null && (this.state.currentScenario.puNode.sharePlanningUnit == "false" || this.state.currentScenario.puNode.sharePlanningUnit == false || this.state.parentScenario.fuNode.usageType.id == 2) ? false : true}
                                                                    bsSize="sm"
                                                                    valid={!errors.puPerVisit && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentScenario.puNode.puPerVisit != '' : !errors.puPerVisit}
                                                                    invalid={touched.puPerVisit && !!errors.puPerVisit}
                                                                    onBlur={handleBlur}
                                                                    onChange={(e) => {
                                                                        handleChange(e);
                                                                        this.dataChange(e)
                                                                    }}
                                                                    value={this.state.currentItemConfig.parentItem != null
                                                                        && this.state.parentScenario.fuNode != null ?
                                                                        (this.state.currentScenario.puNode.sharePlanningUnit == "false" || this.state.currentScenario.puNode.sharePlanningUnit == false || this.state.parentScenario.fuNode.usageType.id == 2) ?
                                                                            addCommasWith8Decimals(this.state.currentScenario.puNode.puPerVisit) : addCommasWith8Decimals(this.state.noFURequired / this.state.conversionFactor) : ""}
                                                                >
                                                                </Input>
                                                                <FormFeedback className="red">{errors.puPerVisit}</FormFeedback>
                                                            </FormGroup> */}
                                                        </>}
                                                    {(this.state.parentScenario.fuNode.usageType.id == 1 || this.state.parentScenario.fuNode.usageType.id == 2) &&
                                                        <>
                                                            <div>
                                                                <Popover placement="top" isOpen={this.state.popoverOpenWillClientsShareOnePU} target="Popover17" trigger="hover" toggle={this.toggleWillClientsShareOnePU}>
                                                                    <PopoverBody>{i18n.t('static.tooltip.willClientsShareOnePU')}</PopoverBody>
                                                                </Popover>
                                                            </div>
                                                            <Input type="hidden" id="refillMonths" />
                                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 && (this.state.parentScenario.fuNode.usageType.id == 1 || this.state.parentScenario.fuNode.usageType.id == 2) ? 'block' : 'none' }}>
                                                                <Label htmlFor="currencyId">{i18n.t('static.tree.willClientsShareOnePU?')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover17" onClick={this.toggleWillClientsShareOnePU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                                <FormGroup check inline>
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        id="sharePlanningUnitTrue"
                                                                        name="sharePlanningUnit"
                                                                        value={true}
                                                                        checked={this.state.currentScenario.puNode.sharePlanningUnit == "" || this.state.currentScenario.puNode.sharePlanningUnit == true || this.state.currentScenario.puNode.sharePlanningUnit == "true"}
                                                                        onClick={(e) => {
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
                                                                        value={false}
                                                                        checked={this.state.currentScenario.puNode.sharePlanningUnit == false || this.state.currentScenario.puNode.sharePlanningUnit == "false"}
                                                                        onClick={(e) => {
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
                                                                <Label htmlFor="currencyId"># PU / {this.state.parentScenario.fuNode.usageType.id == 2 ? "Interval / " : ""}{this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.parent != null && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id).length > 0 && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}(s) (Calculated)</Label>
                                                                <Input type="text"
                                                                    id="puPerVisitQATCalculated"
                                                                    name="puPerVisitQATCalculated"
                                                                    readOnly={true}
                                                                    bsSize="sm"
                                                                    value={addCommasWith8Decimals(this.state.qatCalculatedPUPerVisit)}
                                                                >
                                                                </Input>
                                                            </FormGroup>
                                                            {/* <FormGroup className="col-md-6"></FormGroup> */}
                                                            {this.state.parentScenario.fuNode != null && (this.state.currentScenario.puNode.sharePlanningUnit == "false" || this.state.currentScenario.puNode.sharePlanningUnit == false) &&
                                                                <FormGroup className="col-md-6">
                                                                    <Label htmlFor="currencyId">{this.state.currentItemConfig.parentItem != null && this.state.parentScenario.fuNode != null && this.state.parentScenario.fuNode.usageType.id == 2 ? "# PU / Interval / " : "# PU / "}{this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.parent != null && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id).length > 0 && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}(s)</Label>
                                                                    <Input type="text"
                                                                        id="puPerVisit"
                                                                        name="puPerVisit"
                                                                        readOnly={this.state.parentScenario.fuNode != null && (this.state.currentScenario.puNode.sharePlanningUnit == "false" || this.state.currentScenario.puNode.sharePlanningUnit == false) ? false : true}
                                                                        bsSize="sm"
                                                                        valid={!errors.puPerVisit && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentScenario.puNode.puPerVisit != '' : !errors.puPerVisit}
                                                                        invalid={touched.puPerVisit && !!errors.puPerVisit}
                                                                        onBlur={handleBlur}
                                                                        onChange={(e) => {
                                                                            handleChange(e);
                                                                            this.dataChange(e)
                                                                        }}
                                                                        value={this.state.currentItemConfig.parentItem != null
                                                                            && this.state.parentScenario.fuNode != null ?
                                                                            (this.state.currentScenario.puNode.sharePlanningUnit == "false" || this.state.currentScenario.puNode.sharePlanningUnit == false) ?
                                                                                addCommasWith8Decimals(this.state.currentScenario.puNode.puPerVisit) : addCommasWith8Decimals(this.state.noFURequired / this.state.conversionFactor) : ""}
                                                                    >
                                                                    </Input>
                                                                    <FormFeedback className="red">{errors.puPerVisit}</FormFeedback>
                                                                </FormGroup>
                                                            }
                                                            {!(this.state.parentScenario.fuNode != null && (this.state.currentScenario.puNode.sharePlanningUnit == "false" || this.state.currentScenario.puNode.sharePlanningUnit == false)) &&
                                                                <Input type="hidden" id="puPerVisit" />
                                                            }
                                                        </>}
                                                </>}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="row">
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpentracercategoryModelingType} target="Popover18" trigger="hover" toggle={this.toggletracercategoryModelingType}>
                                                    <PopoverBody>{i18n.t('static.tooltip.tracercategoryModelingType')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tracercategory.tracercategory')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover18" onClick={this.toggletracercategoryModelingType} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <Input
                                                    type="select"
                                                    id="tracerCategoryId"
                                                    name="tracerCategoryId"
                                                    bsSize="sm"
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        this.dataChange(e); this.getForecastingUnitListByTracerCategoryId(0, 0)
                                                    }}
                                                    required
                                                    value={this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id : ""}
                                                >
                                                    <option value="">{i18n.t('static.common.all')}</option>
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
                                                <Popover placement="top" isOpen={this.state.popoverOpenCopyFromTemplate} target="Popover19" trigger="hover" toggle={this.toggleCopyFromTemplate}>
                                                    <PopoverBody>{i18n.t('static.tooltip.CopyFromTemplate')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.copyFromTemplate')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover19" onClick={this.toggleCopyFromTemplate} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <Input
                                                    type="select"
                                                    name="usageTemplateId"
                                                    id="usageTemplateId"
                                                    bsSize="sm"
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
                                            <FormGroup className="col-md-12" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.addNodeFlag == true ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.product.product')}<span class="red Reqasterisk">*</span></Label>
                                                <div className="controls ">
                                                    <Input type="select"
                                                        id="planningUnitIdFU"
                                                        name="planningUnitIdFU"
                                                        bsSize="sm"
                                                        valid={!errors.planningUnitIdFU && this.state.tempPlanningUnitId != ""}
                                                        invalid={touched.planningUnitIdFU && !!errors.planningUnitIdFU}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        value={this.state.tempPlanningUnitId}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {this.state.planningUnitList.length > 0
                                                            && this.state.planningUnitList.map((item, i) => {
                                                                return (
                                                                    <option key={i} value={item.id}>
                                                                        {getLabelText(item.label, this.state.lang) + " | " + item.id + " (" + i18n.t("static.tree.conversionFUToPU") + " = " + item.multiplier + ")"}
                                                                    </option>
                                                                )
                                                            }, this)}
                                                    </Input>
                                                    <FormFeedback>{errors.planningUnitIdFU}</FormFeedback>
                                                </div><br />
                                            </FormGroup>
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenTypeOfUse} target="Popover21" trigger="hover" toggle={this.toggleTypeOfUse}>
                                                    <PopoverBody>{i18n.t('static.tooltip.TypeOfUse')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.common.typeofuse')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover21" onClick={this.toggleTypeOfUse} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenLagInMonth} target="Popover22" trigger="hover" toggle={this.toggleLagInMonth}>
                                                    <PopoverBody>{i18n.t('static.tooltip.LagInMonthFUNode')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-6" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.lagInMonth0Immediate')}<span class="red Reqasterisk">*</span>  <i class="fa fa-info-circle icons pl-lg-2" id="Popover22" onClick={this.toggleLagInMonth} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <Input type="number"
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
                                            <>
                                                <div>
                                                    <Popover placement="top" isOpen={this.state.popoverOpenSingleUse} target="Popover23" trigger="hover" toggle={this.toggleSingleUse}>
                                                        <PopoverBody>{i18n.t('static.tooltip.SingleUse')}</PopoverBody>
                                                    </Popover>
                                                </div>
                                                <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 ? 'block' : 'none' }}>
                                                    <Label htmlFor="currencyId">{i18n.t('static.tree.singleUse')}<span class="red Reqasterisk">*</span>  <i class="fa fa-info-circle icons pl-lg-2" id="Popover23" onClick={this.toggleSingleUse} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                

                                                <>
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOneTimeDispensing} target="Popover20" trigger="hover" toggle={this.toggleOneTimeDispensing}>
                                                    <PopoverBody>{i18n.t('static.tooltip.oneTimeDispensing')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-12" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t("static.tree.oneTimeDispensing")}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover20" onClick={this.toggleOneTimeDispensing} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <FormGroup check inline>
                                                    <Input
                                                        className="form-check-input"
                                                        type="radio"
                                                        id="oneTimeDispensingTrue"
                                                        name="oneTimeDispensing"
                                                        value={"true"}
                                                        checked={(this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage.toString() != "true" ? (this.state.currentScenario.fuNode.oneTimeDispensing != undefined && this.state.currentScenario.fuNode.oneTimeDispensing != null && this.state.currentScenario.fuNode.oneTimeDispensing.toString() != "" ? this.state.currentScenario.fuNode.oneTimeDispensing.toString() : "true") : "") == "true" ? true : false}
                                                        onChange={(e) => {
                                                            this.dataChange(e)
                                                        }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio1">
                                                        {i18n.t('static.tree.allInFirstMonth')}
                                                    </Label>
                                                </FormGroup>
                                                <FormGroup check inline>
                                                    <Input
                                                        className="form-check-input"
                                                        type="radio"
                                                        id="oneTimeDispensingFalse"
                                                        name="oneTimeDispensing"
                                                        value={"false"}
                                                        checked={(this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage.toString() != "true" ? (this.state.currentScenario.fuNode.oneTimeDispensing != undefined && this.state.currentScenario.fuNode.oneTimeDispensing != null && this.state.currentScenario.fuNode.oneTimeDispensing.toString() != "" ? this.state.currentScenario.fuNode.oneTimeDispensing.toString() : "true") : "") == "true" ? false : true}
                                                        onChange={(e) => {
                                                            this.dataChange(e)
                                                        }}
                                                    />
                                                    <Label
                                                        className="form-check-label"
                                                        check htmlFor="inline-radio2">
                                                        {i18n.t('static.tree.monthByMonth')}
                                                    </Label>
                                                </FormGroup>
                                            </FormGroup>
                                        </>
                                        <>
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}></FormGroup>
                                                    <FormGroup className="col-md-4" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input type="text"
                                                            id="usageFrequencyDis"
                                                            name="usageFrequencyDis"
                                                            bsSize="sm"
                                                            valid={!errors.usageFrequencyDis && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.usageFrequency != "" : false)}
                                                            invalid={touched.usageFrequencyDis && !!errors.usageFrequencyDis}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                this.dataChange(e)
                                                            }}
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? addCommas(this.state.currentScenario.fuNode.usageFrequency) : ""}></Input>
                                                        <FormFeedback className="red">{errors.usageFrequencyDis}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input type="text"
                                                            name="timesPer"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={i18n.t('static.tree.timesPer')}></Input>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-4" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input
                                                            type="select"
                                                            id="usagePeriodIdDis"
                                                            name="usagePeriodIdDis"
                                                            bsSize="sm"
                                                            valid={!errors.usagePeriodIdDis && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.usagePeriod != null && this.state.currentScenario.fuNode.usagePeriod.usagePeriodId != "" : false)}
                                                            invalid={touched.usagePeriodIdDis && !!errors.usagePeriodIdDis}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                this.dataChange(e)
                                                            }}
                                                            required
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? this.state.currentScenario.fuNode.usagePeriod != null && this.state.currentScenario.fuNode.usagePeriod != null ? this.state.currentScenario.fuNode.usagePeriod.usagePeriodId : "" : ""}
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
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Label htmlFor="currencyId">for<span class="red Reqasterisk">*</span></Label>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
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
                                                    <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input type="select"
                                                            id="repeatUsagePeriodId"
                                                            name="repeatUsagePeriodId"
                                                            bsSize="sm"
                                                            valid={!errors.repeatUsagePeriodId && this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && (this.state.currentScenario.fuNode.oneTimeUsage == "false" || this.state.currentScenario.fuNode.oneTimeUsage == false) ? (this.state.currentScenario.fuNode.repeatUsagePeriod != '' && this.state.currentScenario.fuNode.repeatUsagePeriod != null && this.state.currentScenario.fuNode.repeatUsagePeriod.usagePeriodId != undefined && this.state.currentScenario.fuNode.repeatUsagePeriod.usagePeriodId != null && this.state.currentScenario.fuNode.repeatUsagePeriod.usagePeriodId != '') : !errors.repeatUsagePeriodId}
                                                            invalid={touched.repeatUsagePeriodId && !!errors.repeatUsagePeriodId}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                this.dataChange(e)
                                                            }}
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
                                                        <FormFeedback className="red">{errors.repeatUsagePeriodId}</FormFeedback>
                                                    </FormGroup>
                                                </>
                                            </>
                                            <>
                                                <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                    <Label htmlFor="currencyId">{i18n.t('static.usageTemplate.every')}<span class="red Reqasterisk">*</span></Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                    <Input type="text"
                                                        id="usageFrequencyCon"
                                                        name="usageFrequencyCon"
                                                        bsSize="sm"
                                                        valid={!errors.usageFrequencyCon && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.usageFrequency != "" : false)}
                                                        invalid={touched.usageFrequencyCon && !!errors.usageFrequencyCon}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            this.dataChange(e)
                                                        }}
                                                        value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? addCommas(this.state.currentScenario.fuNode.usageFrequency) : ""}></Input>
                                                    <FormFeedback className="red">{errors.usageFrequencyCon}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                    <Input
                                                        type="select"
                                                        id="usagePeriodIdCon"
                                                        name="usagePeriodIdCon"
                                                        bsSize="sm"
                                                        valid={!errors.usagePeriodIdCon && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.usagePeriod != null && this.state.currentScenario.fuNode.usagePeriod.usagePeriodId != "" : false)}
                                                        invalid={touched.usagePeriodIdCon && !!errors.usagePeriodIdCon}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            this.dataChange(e)
                                                        }}
                                                        required
                                                        value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? this.state.currentScenario.fuNode.usagePeriod != null ? this.state.currentScenario.fuNode.usagePeriod.usagePeriodId : "" : ""}>
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
                                        </div>
                                    </div>
                                    {(this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                        <div className="col-md-12 pt-2 pl-2 pb-lg-3 text-blackD"><b>{this.state.usageText}</b></div>
                                    }
                                    {(this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                        <div className="col-md-12 pl-2 pb-lg-3 text-blackD"><b>{this.state.usageText3}</b> {this.state.usageText4} </div>
                                    }
                                    {(this.state.currentItemConfig.context.payload.nodeType.id == 4 || this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                        <div className="col-md-12 pl-2 pb-lg-3 text-blackD"><b>{this.state.usageText1}</b> {this.state.usageText2} </div>
                                    }
                                    <FormGroup className="pb-lg-3">
                                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => {
                                            if (this.state.isChanged == true || this.state.isTreeDataChanged == true || this.state.isScenarioChanged == true) {
                                                var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
                                                if (cf == true) {
                                                    this.setState({
                                                        openAddNodeModal: false, cursorItem: 0, isChanged: false,
                                                        highlightItem: 0, activeTab1: new Array(3).fill('1')
                                                    })
                                                } else {
                                                }
                                            } else {
                                                this.setState({
                                                    openAddNodeModal: false, cursorItem: 0, isChanged: false,
                                                    highlightItem: 0, activeTab1: new Array(3).fill('1')
                                                })
                                            }
                                        }}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                        {(AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2) && (this.state.isChanged == true) && <><Button type="button" size="md" color="warning" className="float-right mr-1" onClick={() => { this.resetNodeData(); this.nodeTypeChange(this.state.currentItemConfig.context.payload.nodeType.id) }} ><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button></>}
                                    </FormGroup>
                                </Form>
                            )} />
                </TabPane>
                <TabPane tabId="2">
                    <div className="row pt-lg-0" style={{ float: 'right', marginTop: '-42px' }}>
                        <div className="row pl-lg-0 pr-lg-3" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 1 || this.state.currentItemConfig.context.payload.nodeType.id == 6 ? "none" : "block" }}>
                            <a className="">
                                <span style={{ cursor: 'pointer', color: '20a8d8' }} onClick={() => { this.toggleShowGuidanceModelingTransfer() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                        </div>
                    </div>
                    <div className="row pl-lg-2 pr-lg-2">
                        <div style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 1 || this.state.currentItemConfig.context.payload.nodeType.id == 6 ? "none" : "block" }}>
                            <div className="row pl-lg-2 pr-lg-2">
                                <div>
                                    <Popover placement="top" isOpen={this.state.popoverOpenMonth} target="Popover24" trigger="hover" toggle={this.toggleMonth}>
                                        <PopoverBody>{i18n.t('static.tooltip.ModelingTransferMonth')}</PopoverBody>
                                    </Popover>
                                </div>
                                <FormGroup className="col-md-2 pt-lg-1">
                                    <Label htmlFor="">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover24" onClick={this.toggleMonth} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                </FormGroup>
                                <FormGroup className="col-md-8 pl-lg-0 ModTransferMonthPickerWidth">
                                    <Picker
                                        ref={this.pickAMonth2}
                                        years={{ min: this.state.minDateValue, max: this.state.maxDate }}
                                        value={this.state.scalingMonth}
                                        key={JSON.stringify(this.state.scalingMonth)}
                                        lang={pickerLang.months}
                                        onChange={this.handleAMonthChange2}
                                        onDismiss={this.handleAMonthDissmis2}
                                    >
                                        <MonthBox value={this.makeText(this.state.scalingMonth)}
                                            onClick={this.handleClickMonthBox2} />
                                    </Picker>
                                </FormGroup>
                            </div>
                        </div>
                        <div className="col-md-12">
                            {this.state.showModelingJexcelNumber &&
                                <div style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 1 || this.state.currentItemConfig.context.payload.nodeType.id == 6 ? "none" : "block" }}>
                                    <span className='DarkThColr'>{i18n.t('static.modelingTable.note')}</span>
                                    <div className="calculatorimg calculatorTable consumptionDataEntryTable">
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
                            <div>{this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 6 && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.showMomData()}><i className={this.state.viewMonthlyData ? "fa fa-eye" : "fa fa-eye-slash"} style={{ color: '#fff' }}></i> {this.state.viewMonthlyData ? i18n.t('static.tree.viewMonthlyData') : i18n.t('static.tree.hideMonthlyData')}</Button>}
                                {this.state.aggregationNode && AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 && (this.state.isChanged == true) && <><Button color="success" size="md" className="float-right mr-1" type="button" onClick={(e) => this.formSubmitLoader(e)}> <i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button></>}
                                {this.state.aggregationNode && AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>}
                            </div>
                        </div>
                        {this.state.showCalculatorFields &&
                            <div className="col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
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
                                                    <Label htmlFor="select">{i18n.t('static.tree.target')}</Label>
                                                    <Input
                                                        onChange={(e) => { this.dataChange(e); }}
                                                        bsSize="sm"
                                                        className="col-md-6"
                                                        disabled={(this.state.currentModelingType == 2 || this.state.currentModelingType == 3 || this.state.currentModelingType == 4) ? false : this.state.targetSelectDisable}
                                                        type="select" name="targetSelect" id="targetSelect">
                                                        <option value="target1" selected={this.state.targetSelect == 1 ? true : false}>{i18n.t('static.tree.annualTarget')}</option>
                                                        <option value="target2" selected={this.state.targetSelect == 0 ? true : false}>{i18n.t('static.tree.endingValueTarget')}</option>
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
                                                <Picker
                                                    ref={this.pickAMonth4}
                                                    years={{ min: this.state.minDateValue, max: this.state.maxDate }}
                                                    value={{ year: new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) }}
                                                    lang={pickerLang.months}
                                                    onChange={this.handleAMonthChange4}
                                                    id="firstMonthOfTarget"
                                                    name="firstMonthOfTarget"
                                                >
                                                    <MonthBox value={this.makeText({ year: new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) })} onClick={this.handleClickMonthBox4} />
                                                </Picker>
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
                                            <FormGroup className="col-md-12 pl-lg-0 pr-lg-0">
                                                <div className="calculatorimg calculatorTable consumptionDataEntryTable">
                                                    <div id="modelingCalculatorJexcel" className={"RowClickable ScalingTable TableWidth100"} >
                                                    </div>
                                                </div>
                                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => {
                                                    this.setState({
                                                        showCalculatorFields: false
                                                    });
                                                }}><i className="fa fa-times"></i> {i18n.t('static.common.close')}</Button>
                                                {this.state.isCalculateClicked != 2 && <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={() => this.resetModelingCalculatorData()} ><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>}
                                                {this.state.isCalculateClicked == 2 && <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.acceptValue}><i className="fa fa-check"></i> {i18n.t('static.common.accept')}</Button>}
                                                {this.state.isCalculateClicked == 1 && <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => { this.changed3(2); }}><i className="fa fa-check"></i> {i18n.t('static.qpl.calculate')}</Button>}
                                            </FormGroup>
                                        </div>
                                    </div>
                                    <div className='col-md-12' style={{ display: this.state.targetSelect != 1 ? 'block' : 'none' }}>
                                        <div className="row">
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">{i18n.t('static.common.startdate')}<span class="red Reqasterisk">*</span></Label>
                                                <Picker
                                                    ref={this.pickAMonth6}
                                                    years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                    value={{ year: new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) }}
                                                    lang={pickerLang.months}
                                                    onChange={this.handleAMonthChange5}
                                                >
                                                    <MonthBox value={this.makeText({ year: new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) })} onClick={this.handleClickMonthBox6} />
                                                </Picker>
                                            </FormGroup>
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.targetDate')}<span class="red Reqasterisk">*</span></Label>
                                                <Picker
                                                    ref={this.pickAMonth5}
                                                    years={{ min: this.state.stopMinDate, max: this.state.maxDate }}
                                                    value={{ year: new Date(this.state.currentCalculatorStopDate.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStopDate.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) }}
                                                    lang={pickerLang.months}
                                                    key={JSON.stringify(this.state.currentCalculatorStopDate)}
                                                    onChange={this.handleAMonthChange6}
                                                >
                                                    <MonthBox value={this.makeText({ year: new Date(this.state.currentCalculatorStopDate.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStopDate.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) })} onClick={this.handleClickMonthBox5} />
                                                </Picker>
                                            </FormGroup>
                                            {this.state.currentItemConfig.context.payload.nodeType.id <= 2 &&
                                                <>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenStartValueModelingTool} target="Popover53" trigger="hover" toggle={this.toggleStartValueModelingTool}>
                                                            <PopoverBody>{i18n.t('static.tooltip.StartValueModelingTool')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-6">
                                                        <Label htmlFor="currencyId">{i18n.t('static.tree.startValue')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover53" onClick={this.toggleStartValueModelingTool} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                        <Input type="text"
                                                            id="startValue"
                                                            name="startValue"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={addCommas(this.state.currentCalculatorStartValue)}
                                                        >
                                                        </Input>
                                                    </FormGroup>
                                                </>
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
                                                <Popover placement="top" isOpen={this.state.popoverOpenTargetEndingValue} target="Popover25" trigger="hover" toggle={this.toggleTargetEndingValue}>
                                                    <PopoverBody>{i18n.t('static.tooltip.TargetEndingValue')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-5">
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.targetEnding')} {this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'value' : '%'}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover25" onClick={this.toggleTargetEndingValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                <Popover placement="top" isOpen={this.state.popoverOpenTargetChangePercent} target="Popover26" trigger="hover" toggle={this.toggleTargetChangePercent}>
                                                    <PopoverBody>{i18n.t('static.tooltip.TargetChangePercent')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <input type="hidden" id="percentForOneMonth" name="percentForOneMonth" value={this.state.percentForOneMonth} />
                                            <FormGroup className="col-md-5">
                                                <Label htmlFor="currencyId">
                                                    {this.state.currentItemConfig.context.payload.nodeType.id > 2 ? i18n.t('static.tree.changePerPoints') : i18n.t('static.tree.targetChangePer')}
                                                    <span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover26" onClick={this.toggleTargetChangePercent} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.Change(#)')}<span class="red Reqasterisk">*</span></Label>
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
                                                <Popover placement="top" isOpen={this.state.popoverOpenCalculatedMonthOnMonthChnage} target="Popover27" trigger="hover" toggle={this.toggleCalculatedMonthOnMonthChnage}>
                                                    <PopoverBody>{i18n.t('static.tooltip.CalculatedMonthOnMonthChnage')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.CalculatedMonth-on-MonthChange')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover27" onClick={this.toggleCalculatedMonthOnMonthChnage} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                            }}><i className="fa fa-times"></i> {i18n.t('static.common.close')}</Button>
                                            <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.acceptValue1}><i className="fa fa-check"></i> {i18n.t('static.common.accept')}</Button>
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
                                                    checked={this.state.currentScenario.manualChangesEffectFuture}
                                                    onClick={(e) => { this.momCheckbox(e, 1); }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                    <b>{'Manual Change affects future month'}</b>
                                                </Label>
                                            </div>
                                            {this.state.currentItemConfig.context.payload.nodeType.id != 6 && <div>
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
                                            </div>}
                                        </div>
                                    </FormGroup>
                                </div>
                                {this.state.currentItemConfig.context.payload.nodeType.id == 6 && <div className="pt-lg-2 pl-lg-0"><i>
                                    {i18n.t('static.tree.tableDisplays') + " " + i18n.t('static.tree.forNode')} <b>{this.state.currentItemConfig.context.payload.label != null ? getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) : ''}</b> as a sum of <b>{this.state.currentItemConfig.context.payload.downwardAggregationList!=undefined?this.state.currentItemConfig.context.payload.downwardAggregationList.length:0} nodes</b></i>
                                </div>}
                                <div className="col-md-12 pl-lg-0 pr-lg-0 modelingTransferTable" style={{ display: 'inline-block' }}>
                                    <div id="momJexcel" className="RowClickable consumptionDataEntryTable" style={{ display: this.state.momJexcelLoader ? "none" : "block" }}>
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
                                    {this.state.currentItemConfig.context.payload.nodeType.id != 6 && <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => {
                                        this.setState({ showMomData: false, isChanged: false, viewMonthlyData: true })
                                    }}><i className="fa fa-times"></i> {'Close'}</Button>}
                                    {AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 && this.state.currentItemConfig.context.payload.nodeType.id != 1 && this.state.currentItemConfig.context.payload.nodeType.id != 6 &&
                                        <Button type="button" size="md" color="success" className="float-right mr-1" onClick={(e) => this.updateMomDataInDataSet(e)}><i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>}
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
                                                        checked={this.state.currentScenario.manualChangesEffectFuture}
                                                        onClick={(e) => { this.momCheckbox(e, 2); }}
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
                                <div className="pt-lg-2 pl-lg-0"><i className='text-blackD'>{i18n.t('static.tree.tableDisplays')} <b>{
                                    this.state.currentItemConfig.context.payload.nodeType.id > 2 ?
                                        this.state.currentItemConfig.context.payload.nodeUnit.id != "" ?
                                            this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.forecastingUnit.unit.id != "" ? getLabelText(this.state.unitList.filter(c => c.unitId == this.state.currentScenario.fuNode.forecastingUnit.unit.id)[0].label, this.state.lang) : ""
                                                : this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentScenario.puNode.planningUnit.unit.id != "" ? getLabelText(this.state.unitList.filter(c => c.unitId == this.state.currentScenario.puNode.planningUnit.unit.id)[0].label, this.state.lang) : ""
                                                    : getLabelText(this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label, this.state.lang)
                                            : ""
                                        : ""}</b> {i18n.t('static.tree.forNode')} <b>{this.state.currentItemConfig.context.payload.label != null ? getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) : ''}</b> {i18n.t('static.tree.asA%OfParent')} <b>{this.state.currentItemConfig.parentItem.payload.label != null ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : ''}</b></i></div>
                                <div className="col-md-12 pl-lg-0 pr-lg-0 consumptionDataEntryTable" style={{ display: 'inline-block' }}>
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
                                        if (this.state.isChanged == true) {
                                            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
                                            if (cf == true) {
                                                this.setState({
                                                    isChanged: false,
                                                    viewMonthlyData: true,
                                                    showMomDataPercent: false
                                                })
                                            } else {
                                            }
                                        } else {
                                            this.setState({
                                                isChanged: false,
                                                viewMonthlyData: true,
                                                showMomDataPercent: false
                                            })
                                        }
                                    }}><i className="fa fa-times"></i> {'Close'}</Button>
                                    {AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 &&
                                        <Button type="button" size="md" color="success" className="float-right mr-1" onClick={(e) => this.updateMomDataInDataSet(e)}><i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>}
                                </div>
                            </fieldset>
                        </div>
                    }
                </TabPane >
                <TabPane tabId="3">
                    <TreeExtrapolationComponent ref="extrapolationChild" items={this.state} updateState={this.updateState} />
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
    handleAMonthChange = (year, month, flag) => {
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
     * Handles the change of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthChange1 = (year, month, flag) => {
        var month = parseInt(month) < 10 ? "0" + month : month
        var date = year + "-" + month + "-" + "01"
        let { currentItemConfig } = this.state;
        var updatedMonth = date;
        var nodeDataMap = (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0];
        nodeDataMap.month = updatedMonth;
        (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0] = nodeDataMap;
        this.setState({ currentItemConfig, currentScenario: nodeDataMap }, () => {
            if (flag == 0) {
                this.buildModelingJexcel();
            }
        });
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthDissmis1 = (value) => {
        this.setState({
            isChanged: true
        })
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
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthDissmis2 = (value) => {
        let startDate = value.year + '-' + value.month + '-01';
        if (!this.state.modelingChanged) {
            this.filterScalingDataByMonth(moment(startDate).format("YYYY-MM-DD"));
        }
        if (this.state.modelingEl != "") {
            this.state.modelingEl.setHeader(9, i18n.t('static.tree.calculatedChangeForMonthTree') + " " + moment(startDate).format('MMM.YYYY'));
        }
        this.setState({ scalingMonth: value }, () => {
        });
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
        const Node = ({ itemConfig, isDragging, connectDragSource, canDrop, isOver, connectDropTarget }) => {
            var illegalNode = false;
            var outerLink = false;
            var itemConfigParent = this.state.curTreeObj.tree.flatList.filter(x => x.id == itemConfig.parent);
            var allowedNodeTypeList = [];
            if (itemConfigParent.length > 0) {
                allowedNodeTypeList = this.state.nodeTypeList.filter(x => x.allowedChildList.includes(parseInt(itemConfig.payload.nodeType.id))).map(x => x.id);
                if (allowedNodeTypeList.includes(parseInt(itemConfigParent[0].payload.nodeType.id))) {
                    illegalNode = false;
                } else {
                    illegalNode = true;
                }
            }

            const opacity = isDragging ? 0.4 : 1
            let itemTitleColor = Colors.RoyalBlue;
            if (isOver) {
                if (canDrop) {
                    itemTitleColor = "green";
                } else {
                    itemTitleColor = "#BA0C2F";
                }
            }
            var sourceNodeUsageListCount = [];
            if (this.state.dataSetObj.programData.treeList)
                this.state.dataSetObj.programData.treeList.map(tl => tl.tree.flatList.map(f => f.payload.downwardAggregationList ? (f.payload.downwardAggregationList.map(da => (da.treeId == this.state.treeId && da.nodeId == itemConfig.payload.nodeId) ? sourceNodeUsageListCount.push({ treeId: tl.treeId, scenarioId: da.scenarioId, nodeId: da.nodeId, treeName: tl.label.label_en, scenarioName: this.state.dataSetObj.programData.treeList.filter(tl2 => tl2.treeId == da.treeId)[0].scenarioList.filter(sl => sl.id == da.scenarioId)[0].label.label_en, nodeName: f.payload.label.label_en, }) : "")) : ""));
            if (itemConfig.payload.downwardAggregationAllowed) {
                outerLink = sourceNodeUsageListCount.filter(x => x.treeId == this.state.treeId).length == sourceNodeUsageListCount.length ? false : true
            } else if (itemConfig.payload.downwardAggregationList && itemConfig.payload.nodeType.id == 6) {
                outerLink = itemConfig.payload.downwardAggregationList.filter(x => x.treeId == this.state.treeId).length == itemConfig.payload.downwardAggregationList.length ? false : true;
            }
            return connectDropTarget(connectDragSource(
                (itemConfig.expanded ?
                    <div style={{ background: itemConfig.payload.nodeType.id == 5 || itemConfig.payload.nodeType.id == 4 ? "#002F6C" : "#a7c6ed", width: "8px", height: "8px", borderRadius: "8px" }}>
                    </div>
                    :
                    <div className={(itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined && itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].isPUMappingCorrect == 0) || illegalNode ? "ContactTemplate boxContactTemplate contactTemplateBorderRed" : "ContactTemplate boxContactTemplate"} title={itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined ? itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].notes : ''}>
                        <div className={outerLink ? itemConfig.payload.label.label_en.length <= 20 ? "ContactTitleBackground TemplateTitleBgPurpleSingle" : "ContactTitleBackground TemplateTitleBgpurple" : itemConfig.payload.nodeType.id == 5
                            || itemConfig.payload.nodeType.id == 4 ? (itemConfig.payload.label.label_en.length <= 20 ? "ContactTitleBackground TemplateTitleBgblueSingle" : "ContactTitleBackground TemplateTitleBgblue") :
                            (itemConfig.payload.label.label_en.length <= 20 ? "ContactTitleBackground TemplateTitleBgSingle" : "ContactTitleBackground TemplateTitleBg")}
                        >
                            <div className={itemConfig.payload.nodeType.id == 5 ||
                                itemConfig.payload.nodeType.id == 4 ? "ContactTitle TitleColorWhite" :
                                "ContactTitle TitleColor"}>
                                <div title={itemConfig.payload.label.label_en} className="NodeTitletext">
                                    {itemConfig.payload.label.label_en}</div>
                                <div style={{ float: 'right' }}>
                                    {(itemConfig.payload.nodeType.id != 1 && itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined && itemConfig.payload.nodeType.id == 2 && itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation == true) && <i class="fa fa-line-chart" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                    {(itemConfig.payload.nodeType.id != 1 && itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined && itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(itemConfig, 4) == true && <i class="fa fa-long-arrow-up" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                    {(itemConfig.payload.nodeType.id != 1 && itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined && itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(itemConfig, 6) == true && <i class="fa fa-long-arrow-down" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                    {(itemConfig.payload.nodeType.id != 1 && itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined && itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(itemConfig, 5) == true && <i class="fa fa-link" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                    <b style={{ color: '#212721', float: 'right' }}>
                                        {(itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined && itemConfig.payload.nodeType.id == 4) ? itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.usageType.id == 2 ? <b style={{ fontSize: '14px', color: '#fff' }}>c </b> : <b style={{ fontSize: '14px', color: '#fff' }}>d </b> : ""}
                                        {itemConfig.payload.nodeType.id == 2 ?
                                            <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#002f6c' }}></i> :
                                            (itemConfig.payload.nodeType.id == 3 ?
                                                <i class="fa fa-percent " style={{ fontSize: '11px', color: '#002f6c' }} ></i> :
                                                (itemConfig.payload.nodeType.id == 4 ?
                                                    <i class="fa fa-cube" style={{ fontSize: '11px', color: '#fff' }} ></i> :
                                                    (itemConfig.payload.nodeType.id == 5 ?
                                                        <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#fff' }} ></i> :
                                                        (itemConfig.payload.nodeType.id == 1 ?
                                                            <i><img src={AggregationNode} className="AggregationNodeSize" /></i> :
                                                            (itemConfig.payload.nodeType.id == 6 ?
                                                                <><span style={{ color: '#002f6c' }} className={itemConfig.payload.downwardAggregationList ? itemConfig.payload.downwardAggregationList.length == 0 ? "red" : "" : "red"}>{itemConfig.payload.downwardAggregationList ? itemConfig.payload.downwardAggregationList.length : 0}</span><i><img src={AggregationDown} className="AggregationDownwardNodeSize" /></i></> : "")))))}</b>
                                    {(itemConfig.payload.nodeType.id == 2 || itemConfig.payload.nodeType.id == 3) && itemConfig.payload.downwardAggregationAllowed && sourceNodeUsageListCount.length > 0 ? <i><img src={AggregationAllowed} className="AggregationDownwardNodeSize" /></i> : ""}
                                    {(itemConfig.payload.nodeType.id == 2 || itemConfig.payload.nodeType.id == 3) && itemConfig.payload.downwardAggregationAllowed && sourceNodeUsageListCount.length == 0 ? <i><img src={AggregationAllowedRed} className="AggregationDownwardNodeSize" /></i> : ""}
                                </div>
                            </div>
                        </div>
                        <div className="ContactPhone ContactPhoneValue">
                            <span style={{ textAlign: 'center', fontWeight: '500' }}>{itemConfig.payload.nodeType.id == 6 ? this.getPayloadData(itemConfig, 2).split(" ")[1] : this.getPayloadData(itemConfig, 1)}</span>
                            {itemConfig.payload.nodeType.id != 6 && <div style={{ overflow: 'inherit', fontStyle: 'italic' }}><p className="" style={{ textAlign: 'center' }}>{this.getPayloadData(itemConfig, 2)}</p></div>}
                            {this.state.showModelingValidation && itemConfig.payload.nodeType.id != 6 && <div className="treeValidation"><span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 3) != "" ? i18n.t('static.ManageTree.SumofChildren') + ": " : ""}</span><span className={this.getPayloadData(itemConfig, 3) != 100 ? "treeValidationRed" : ""}>{this.getPayloadData(itemConfig, 3) != "" ? this.getPayloadData(itemConfig, 3) + "%" : ""}</span></div>}
                        </div>
                    </div>)
            ))
        }
        const HighlightNode = ({ itemConfig }) => {
            let itemTitleColor = Colors.RoyalBlue;
            var sourceNodeUsageListCount = [];
            var outerLink = false;
            if (this.state.dataSetObj.programData.treeList)
                this.state.dataSetObj.programData.treeList.map(tl => tl.tree.flatList.map(f => f.payload.downwardAggregationList ? (f.payload.downwardAggregationList.map(da => (da.treeId == this.state.treeId && da.nodeId == itemConfig.payload.nodeId) ? sourceNodeUsageListCount.push({ treeId: tl.treeId, scenarioId: da.scenarioId, nodeId: da.nodeId, treeName: tl.label.label_en, scenarioName: this.state.dataSetObj.programData.treeList.filter(tl2 => tl2.treeId == da.treeId)[0].scenarioList.filter(sl => sl.id == da.scenarioId)[0].label.label_en, nodeName: f.payload.label.label_en, }) : "")) : ""));
            if (itemConfig.payload.downwardAggregationAllowed) {
                outerLink = sourceNodeUsageListCount.filter(x => x.treeId == this.state.treeId).length == sourceNodeUsageListCount.length ? false : true
            }
            if (itemConfig.payload.downwardAggregationList) {
                outerLink = itemConfig.payload.downwardAggregationList.filter(x => x.treeId == this.state.treeId).length == itemConfig.payload.downwardAggregationList.length ? false : true;
            }
            return (
                <div className="ContactTemplate boxContactTemplate" title={itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined ? itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].notes : ''} style={{ height: "88px", width: "200px", zIndex: "1" }}>
                    <div className={outerLink ? "ContactTitleBackground TemplateTitleBgPurpleSingle" : itemConfig.payload.nodeType.id == 5
                        || itemConfig.payload.nodeType.id == 4 ? (itemConfig.payload.label.label_en.length <= 20 ? "ContactTitleBackground TemplateTitleBgblueSingle" : "ContactTitleBackground TemplateTitleBgblue") :
                        (itemConfig.payload.label.label_en.length <= 20 ? "ContactTitleBackground TemplateTitleBgSingle" : "ContactTitleBackground TemplateTitleBg")}
                    >
                        <div className={itemConfig.payload.nodeType.id == 5 ||
                            itemConfig.payload.nodeType.id == 4 ? "ContactTitle TitleColorWhite" :
                            "ContactTitle TitleColor"}>
                            <div title={itemConfig.payload.label.label_en} className="NodeTitletext">
                                {itemConfig.payload.label.label_en}</div>
                            <div style={{ float: 'right' }}>
                                {(itemConfig.payload.nodeType.id != 1 && itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined && itemConfig.payload.nodeType.id == 2 && itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation == true) && <i class="fa fa-line-chart" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                {(itemConfig.payload.nodeType.id != 1 && itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined && itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(itemConfig, 4) == true && <i class="fa fa-long-arrow-up" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                {(itemConfig.payload.nodeType.id != 1 && itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined && itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(itemConfig, 6) == true && <i class="fa fa-long-arrow-down" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                {(itemConfig.payload.nodeType.id != 1 && itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined && itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].extrapolation != true) && this.getPayloadData(itemConfig, 5) == true && <i class="fa fa-link" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                <b style={{ color: '#212721', float: 'right' }}>
                                    {(itemConfig.payload.nodeDataMap[this.state.selectedScenario] != undefined && itemConfig.payload.nodeType.id == 4) ? itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.usageType.id == 2 ? <b style={{ fontSize: '14px', color: '#fff' }}>c </b> : <b style={{ fontSize: '14px', color: '#fff' }}>d </b> : ""}
                                    {itemConfig.payload.nodeType.id == 2 ?
                                        <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#002f6c' }}></i> :
                                        (itemConfig.payload.nodeType.id == 3 ?
                                            <i class="fa fa-percent " style={{ fontSize: '11px', color: '#002f6c' }} ></i> :
                                            (itemConfig.payload.nodeType.id == 4 ?
                                                <i class="fa fa-cube" style={{ fontSize: '11px', color: '#fff' }} ></i> :
                                                (itemConfig.payload.nodeType.id == 5 ?
                                                    <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#fff' }} ></i> :
                                                    (itemConfig.payload.nodeType.id == 1 ?
                                                        <i><img src={AggregationNode} className="AggregationNodeSize" /></i> :
                                                        (itemConfig.payload.nodeType.id == 6 ?
                                                            <><span style={{ color: '#002f6c' }}>{itemConfig.payload.downwardAggregationList.length}</span><i><img src={AggregationDown} className="AggregationDownwardNodeSize" /></i></> : "")))))}</b>
                                {itemConfig.payload.downwardAggregationAllowed && sourceNodeUsageListCount.length > 0 ? <i><img src={AggregationAllowed} className="AggregationDownwardNodeSize" /></i> : ""}
                                {itemConfig.payload.downwardAggregationAllowed && sourceNodeUsageListCount.length == 0 ? <i><img src={AggregationAllowedRed} className="AggregationDownwardNodeSize" /></i> : ""}
                            </div>
                        </div>
                    </div>
                    <div className="ContactPhone ContactPhoneValue">
                        <span style={{ textAlign: 'center', fontWeight: '500' }}>{itemConfig.payload.nodeType.id == 6 ? this.getPayloadData(itemConfig, 2).split(" ")[1] : this.getPayloadData(itemConfig, 1)}</span>
                        {itemConfig.payload.nodeType.id != 6 && <div style={{ overflow: 'inherit', fontStyle: 'italic' }}><p className="" style={{ textAlign: 'center' }}>{this.getPayloadData(itemConfig, 2)}</p></div>}
                        {this.state.showModelingValidation && itemConfig.payload.nodeType.id != 6 && <div className="treeValidation"><span style={{ textAlign: 'center', fontWeight: '500' }}>{this.getPayloadData(itemConfig, 3) != "" ? i18n.t('static.ManageTree.SumofChildren') + ": " : ""}</span><span className={this.getPayloadData(itemConfig, 3) != 100 ? "treeValidationRed" : ""}>{this.getPayloadData(itemConfig, 3) != "" ? this.getPayloadData(itemConfig, 3) + "%" : ""}</span></div>}
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
        var { scenarioList } = this.state;
        scenarioList = this.state.showOnlyActive ? scenarioList.filter(x => x.active == true) : scenarioList
        let scenarios = scenarioList.length > 0
            && scenarioList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}{(item.active.toString() == "false" ? " (Inactive)" : "")}
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
        var newItems = this.state.items;
        var curTheme = localStorage.getItem("theme");
        for (var i = 0; i < newItems.length; i++) {
            if (newItems[i].payload.nodeType.id == 6) {
                if (!newItems[i].payload.downwardAggregationList || newItems[i].payload.downwardAggregationList.length == 0) {
                    treeLevelItems.push({
                        annotationType: AnnotationType.HighlightPath,
                        items: [parseInt(newItems[i].id), parseInt(newItems[i].parent)],
                        color: "#FFFFFF",
                        lineWidth: 10,
                        opacity: curTheme == "dark" ? 0 : 1,
                        showArrows: false
                    })
                } else {
                    for (var j = 0; j < newItems[i].payload.downwardAggregationList.length; j++) {
                        if (newItems[i].payload.downwardAggregationList[j].treeId == this.state.treeId && this.state.showConnections) {
                            treeLevelItems.push(new ConnectorAnnotationConfig({
                                annotationType: AnnotationType.Connector,
                                fromItem: parseInt(newItems[i].payload.downwardAggregationList[j].nodeId),
                                toItem: parseInt(newItems[i].id),
                                labelSize: { width: 80, height: 30 },
                                connectorShapeType: ConnectorShapeType.OneWay,
                                color: curTheme == "dark" ? "#FFFFFF" : "#000000",
                                offset: 0,
                                lineWidth: 1,
                                lineType: LineType.Solid,
                                connectorPlacementType: ConnectorPlacementType.Straight, //Offbeat
                                selectItems: false
                            }));
                        }
                        treeLevelItems.push({
                            annotationType: AnnotationType.HighlightPath,
                            items: [parseInt(newItems[i].id), parseInt(newItems[i].parent)],
                            color: curTheme == "dark" ? "#ff0000" : "#FFFFFF",
                            lineWidth: 10,
                            opacity: curTheme == "dark" ? 0 : 1,
                            showArrows: false
                        })
                        var tempValidLines = newItems.filter(x => x.parent == newItems[i].parent && x.payload.nodeType.id != 6).filter(x => x.id != parseInt(newItems[i].id));
                        for (var k = 0; k < tempValidLines.length; k++) {
                            treeLevelItems.push({
                                annotationType: AnnotationType.HighlightPath,
                                items: [parseInt(tempValidLines[k].id), parseInt(newItems[i].parent)],
                                color: curTheme == "dark" ? "#FFFFFF" : "#000000",
                                lineWidth: 1,
                                opacity: 1,
                                showArrows: false
                            })
                        }
                    }
                }
            }
        }
        const config = {
            ...this.state,
            items: newItems,
            pageFitMode: PageFitMode.None,
            hasSelectorCheckbox: Enabled.False,
            buttonsPanelSize: 40,
            orientationType: OrientationType.Top,
            defaultTemplateName: "contactTemplate",
            linesColor: Colors.Black,
            annotations: treeLevelItems,
            onLevelBackgroundRender: ((data) => {
                var { context, width, height } = data;
                var { title, fillColor, opacity } = context;
                return !opacity ? <div style={{
                    background: "#212631"
                }}>
                </div> : <div style={{
                    background: "#212631"
                }}>
                </div>
            }),
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
                hasButtons: Enabled.True,
                name: "contactTemplate",
                itemSize: { width: 200, height: 100 },
                minimizedItemSize: { width: 2, height: 2 },
                highlightPadding: { left: 1, top: 1, right: 1, bottom: 1 },
                highlightBorderWidth: 1,
                cursorBorderWidth: 2,
                onCursorRender: ({ context: itemConfig }) => {
                    return <div className="CursorFrame">
                    </div>;
                },
                onHighlightRender: ({ context: itemConfig }) => {
                    return
                },
                onItemRender: ({ context: itemConfig }) => {
                    return <NodeDragDropSource
                        itemConfig={itemConfig}
                        onRemoveItem={this.onRemoveItem}
                    />;
                },
                onButtonsRender: (({ context: itemConfig }) => {
                    return <>
                        {!this.state.hideActionButtons && AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 &&
                            <button key="2" type="button" className="StyledButton TreeIconStyle TreeIconStyleCopyPaddingTop" style={{ background: 'none' }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.setState({
                                        copyModal: true,
                                        copyModalData: "",
                                        copyModalTree: "",
                                        copyModalParentLevel: "",
                                        copyModalParentNode: "",
                                        copyModalTreeList: [],
                                        copyModalParentLevelList: [],
                                        copyModalParentNodeList: [],
                                        copyModalNode: JSON.parse(JSON.stringify(itemConfig))
                                    })
                                    // this.duplicateNode(JSON.parse(JSON.stringify(itemConfig)));
                                }}>
                                <i class="fa fa-paste" aria-hidden="true"></i>
                            </button>
                        }
                        {itemConfig.parent != null &&
                            <>
                                {!this.state.hideActionButtons && AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 &&
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
                        {!this.state.hideActionButtons && parseInt(itemConfig.payload.nodeType.id) != 5 && AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 &&
                            <button key="4" type="button" className="StyledButton TreeIconStyle TreeIconStyleCopyPaddingTop" style={{ background: 'none' }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.getBranchTemplateList(itemConfig);
                                }}>
                                <i class="fa fa-sitemap" aria-hidden="true"></i>
                            </button>
                        }
                        {!this.state.hideActionButtons && parseInt(itemConfig.payload.nodeType.id) != 5 && AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 &&
                            <button key="1" type="button" className="StyledButton TreeIconStyle TreeIconStylePlusPaddingTop" style={{ background: 'none' }}
                                onClick={(event) => {
                                    this.setState({
                                        modelingEl: "",
                                        modelingTabChanged: false,
                                        currentNodeTypeId: ""
                                    }, () => {
                                        try {
                                            jexcel.destroy(document.getElementById('modelingJexcel'), true);
                                        } catch (err) {
                                        }
                                    })
                                    event.stopPropagation();
                                    if (itemConfig.level == 0 && itemConfig.newTree) {
                                        alert("Please update the details of the current node.");
                                    } else {
                                        var nodeDataMap = {};
                                        var tempArray = [];
                                        var tempJson = {
                                            notes: '',
                                            month: moment(this.state.forecastStartDate).startOf('month').subtract(1, 'months').format("YYYY-MM-DD"),
                                            dataValue: "",
                                            calculatedDataValue: "",
                                            nodeDataModelingList: [],
                                            nodeDataOverrideList: [],
                                            nodeDataMomList: [],
                                            fuNode: {
                                                oneTimeUsage: "false",
                                                oneTimeDispensing: "true",
                                                lagInMonths: 0,
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
                                                    usagePeriodId: 1
                                                },
                                                repeatUsagePeriod: {
                                                    usagePeriodId: 1
                                                },
                                                noOfPersons: ''
                                            },
                                            puNode: {
                                                planningUnit: {
                                                    id: '',
                                                    unit: {
                                                        id: ''
                                                    },
                                                    multiplier: ''
                                                },
                                                refillMonths: '',
                                                sharePlanningUnit: "true"
                                            }
                                        };
                                        tempArray.push(tempJson);
                                        nodeDataMap[this.state.selectedScenario] = tempArray;
                                        var getLevelUnit = this.state.curTreeObj.levelList != undefined ? this.state.curTreeObj.levelList.filter(c => c.levelNo == itemConfig.level + 1) : [];
                                        var levelUnitId = ""
                                        if (getLevelUnit.length > 0) {
                                            levelUnitId = getLevelUnit[0].unit != null && getLevelUnit[0].unit.id != null ? getLevelUnit[0].unit.id : "";
                                        }
                                        this.setState({
                                            addNodeError: true,
                                            isValidError: "true",
                                            showMomDataPercent: false,
                                            showMomData: false,
                                            viewMonthlyData: true,
                                            tempPlanningUnitId: '',
                                            parentValue: "",
                                            fuValues: [],
                                            fuLabels: [],
                                            usageTemplateId: '',
                                            conversionFactor: '',
                                            parentScenario: itemConfig.level != 0 ? itemConfig.payload.nodeDataMap[this.state.selectedScenario][0] : {},
                                            usageText: '',
                                            currentScenario: {
                                                notes: '',
                                                extrapolation: false,
                                                dataValue: '',
                                                month: moment(this.state.forecastStartDate).startOf('month').format("YYYY-MM-DD"),
                                                fuNode: {
                                                    noOfForecastingUnitsPerPerson: '',
                                                    usageFrequency: '',
                                                    nodeDataModelingList: [],
                                                    nodeDataOverrideList: [],
                                                    nodeDataMomList: [],
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
                                                        id: '',
                                                        unit: {
                                                        },
                                                        multiplier: ''
                                                    },
                                                    refillMonths: ''
                                                },
                                                nodeDataExtrapolationOptionList: []
                                            },
                                            level0: true,
                                            numberNode: (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 6 || itemConfig.payload.nodeType.id == 2 ? false : true),
                                            aggregationNode: (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 6 ? false : true),
                                            addNodeFlag: true,
                                            openAddNodeModal: true,
                                            modelingChangedOrAdded: false,
                                            currentItemConfig: {
                                                context: {
                                                    isVisible: '',
                                                    level: itemConfig.level,
                                                    parent: itemConfig.id,
                                                    payload: {
                                                        nodeId: '',
                                                        label: {
                                                            label_en: ''
                                                        },
                                                        nodeType: {
                                                            id: ''
                                                        },
                                                        nodeUnit: {
                                                            id: levelUnitId
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
                                                            id: itemConfig.payload.nodeUnit.id,
                                                            label: itemConfig.payload.nodeUnit.label
                                                        },
                                                        nodeDataMap: itemConfig.payload.nodeDataMap
                                                    }
                                                }
                                            }
                                        }, () => {
                                            this.setState({
                                                orgCurrentItemConfig: JSON.parse(JSON.stringify(this.state.currentItemConfig.context))
                                            }, () => {
                                                this.getNodeTypeFollowUpList(itemConfig.payload.nodeType.id);
                                                this.calculateParentValueFromMOM(this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].month);
                                            });
                                            if (itemConfig.payload.nodeType.id == 2 || itemConfig.payload.nodeType.id == 3) {
                                                var tracerCategoryId = "";
                                                if (this.state.tracerCategoryList.length == 1) {
                                                    this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.tracerCategory.id = this.state.tracerCategoryList[0].tracerCategoryId;
                                                    this.state.currentScenario = this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0];
                                                    tracerCategoryId = this.state.tracerCategoryList[0].tracerCategoryId;
                                                }
                                                this.filterUsageTemplateList(tracerCategoryId);
                                                this.getForecastingUnitListByTracerCategoryId(0, 0);
                                            }
                                            else if (itemConfig.payload.nodeType.id == 4) {
                                                this.getNoOfFUPatient();
                                                setTimeout(() => {
                                                    this.getNoOfMonthsInUsagePeriod();
                                                    this.getPlanningUnitListByFUId((itemConfig.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.id);
                                                }, 0);
                                                this.state.currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == itemConfig.parent)[0].payload.nodeUnit.id;
                                            } else {
                                            }
                                        });
                                    }
                                }}>
                                <i class="fa fa-plus" aria-hidden="true"></i>
                            </button>}
                        {!this.state.hideActionButtons && AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') &&
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
                                    this.setState({ items: updatedItems }, () => { this.saveTreeData(false, true) })
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
                                                            <InputGroupAddon addonType="append" onClick={this.toggleCollapse}>
                                                                <InputGroupText><i class="fa fa-cog icons Iconinvert" data-toggle="collapse" aria-expanded="false" style={{ cursor: 'pointer' }}></i></InputGroupText>
                                                            </InputGroupAddon>
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
                                                            {AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 &&
                                                                <InputGroupAddon addonType="append" onClick={this.toggleDropdown}>
                                                                    <InputGroupText className='SettingIcon'>
                                                                        <ButtonDropdown isOpen={this.state.dropdownOpen[0]} toggle={() => { this.toggleDeropdownSetting(0); }}>
                                                                            <DropdownToggle>
                                                                                <i class="fa fa-cog icons" data-bind="label" id="searchLabel" title=""></i>
                                                                            </DropdownToggle>
                                                                            <DropdownMenu right className="MarginLeftDropdown">
                                                                                <DropdownItem onClick={() => { this.openScenarioModal(1) }}>{i18n.t('static.tree.addScenario')}</DropdownItem>
                                                                                <DropdownItem onClick={() => { this.openScenarioModal(2) }}>{i18n.t("static.tree.editScenario")}</DropdownItem>
                                                                                <DropdownItem onClick={() => { this.openScenarioModal(3) }}>{i18n.t("static.tree.deleteScenario")}</DropdownItem>
                                                                                <DropdownItem onClick={() => { this.openScenarioModal(4) }}>{!this.state.showOnlyActive ? i18n.t("static.tree.showOnlyActive") : i18n.t("static.tree.showInactive")}</DropdownItem>
                                                                            </DropdownMenu>
                                                                        </ButtonDropdown>
                                                                    </InputGroupText>
                                                                </InputGroupAddon>}
                                                        </InputGroup>
                                                    </FormGroup>
                                                    {this.state.showDate && <FormGroup className="col-md-3 pl-lg-0">
                                                        <Label htmlFor="languageId">
                                                            {i18n.t('static.tree.displayDate')} <i>({i18n.t('static.consumption.forcast')}: {this.state.forecastPeriod})</i></Label>
                                                        <div className="controls edit">
                                                            <Picker
                                                                ref={this.pickAMonth3}
                                                                id="monthPicker"
                                                                name="monthPicker"
                                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                                value={this.state.singleValue2}
                                                                key={JSON.stringify(this.state.singleValue2)}
                                                                lang={pickerLang.months}
                                                                onChange={this.handleAMonthChange3}
                                                                onDismiss={(e) => this.handleAMonthDissmis3(e, 1)}
                                                            >
                                                                <MonthBox value={this.makeText(singleValue2)} onClick={(e) => { this.handleClickMonthBox3(e) }} />
                                                            </Picker>
                                                        </div>
                                                    </FormGroup>}
                                                </Row>
                                            </div>
                                        </CardBody>
                                        <div className="col-md-12 collapse-bg pl-lg-2 pr-lg-2 pt-lg-2 MarginBottomTree" style={{ display: this.state.showDiv ? 'block' : 'none' }}>
                                            <Formik
                                                enableReinitialize={true}
                                                initialValues={{
                                                    forecastMethodId: this.state.curTreeObj.forecastMethod.id,
                                                    treeName: this.state.curTreeObj.label.label_en,
                                                    regionArray: this.state.regionList,
                                                    regionId: this.state.regionValues,
                                                }}
                                                validationSchema={validationSchema}
                                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                                    this.saveTreeData(false, false);
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
                                                            <Row style={{ display: 'inline-flex' }}>
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
                                                                            {i18n.t('static.dataentry.inactive')}
                                                                        </Label>
                                                                    </FormGroup>
                                                                </FormGroup>
                                                                <FormGroup className="col-md-3 pt-lg-4">
                                                                    {AuthenticationService.checkUserACL([this.state.programId.split("_")[0].toString()], 'ROLE_BF_EDIT_TREE') && this.props.match.params.isLocal != 2 && this.state.isTreeDataChanged && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>}
                                                                </FormGroup>
                                                            </Row>
                                                        </Form>
                                                    )} />
                                        </div>
                                        <div className="row ml-lg-1 pb-lg-2"><b className='text-blackD'>{i18n.t('static.tree.editIn')}&nbsp;{<a href={`/#/dataSet/treeTable/tree/${this.state.treeId}/${this.state.programId}`} target='_blank'>{i18n.t('static.common.treeTable')}</a>}</b>
                                            <FormGroup>
                                                <div className="check inline paddinCheckbox pt-lg-0">
                                                    <div>
                                                        <Input
                                                            className="form-check-input checkboxMargin"
                                                            type="checkbox"
                                                            id="active6"
                                                            name="active6"
                                                            onClick={(e) => { this.filterPlanningUnitNode(e); }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            <b>{i18n.t('static.tree.hidePlanningUnit')}</b>
                                                        </Label>
                                                    </div>
                                                </div>
                                            </FormGroup>
                                            <FormGroup>
                                                <div className="check inline paddinCheckbox pt-lg-0">
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
                                                </div>
                                            </FormGroup>
                                            <FormGroup>
                                                <div className="check inline paddinCheckbox pt-lg-0">
                                                    <div>
                                                        <Input
                                                            className="form-check-input checkboxMargin"
                                                            type="checkbox"
                                                            id="active7"
                                                            name="active7"
                                                            onClick={(e) => { this.hideTreeValidation(e); }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            <b>{i18n.t('static.tree.hideTreeValidation')}</b>
                                                        </Label>
                                                    </div>
                                                </div>
                                            </FormGroup>
                                            <FormGroup>
                                                <div className="check inline paddinCheckbox pt-lg-0">
                                                    <div>
                                                        <Input
                                                            className="form-check-input checkboxMargin"
                                                            type="checkbox"
                                                            id="active10"
                                                            name="active10"
                                                            checked={!this.state.showConnections}
                                                            onClick={(e) => { this.changeShowConnections(e); }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            <b>{i18n.t('static.tree.hideFunnel')}</b>
                                                        </Label>
                                                    </div>
                                                </div>
                                            </FormGroup>
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverTooltipAuto} target="PopoverAuto" trigger="hover" toggle={this.toggleTooltipAuto}>
                                                    <PopoverBody>{i18n.t('static.tooltip.autoCalculate')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup>
                                                <div className="check inline paddinCheckbox pt-lg-0">
                                                    <div>
                                                        <Input
                                                            className="form-check-input checkboxMargin"
                                                            type="checkbox"
                                                            id="active8"
                                                            name="active8"
                                                            checked={this.state.autoCalculate}
                                                            onClick={(e) => { this.autoCalculate(e); }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            <b>{i18n.t('static.tree.autoCalculate')}</b><i class="fa fa-info-circle icons pl-lg-1" id="PopoverAuto" onClick={this.toggleTooltipAuto} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                        </Label>
                                                    </div>
                                                </div>
                                            </FormGroup>
                                            <FormGroup>
                                                <div className="check inline paddinCheckbox pt-lg-0">
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
                                        </div>

                                        <div className="pb-lg-0" style={{ marginTop: '-2%' }}>
                                            <div className="card-header-actions">
                                                <div className="card-header-action pr-0 pt-lg-0">
                                                    <Col md="12 pl-0">
                                                        <div className="d-md-flex">
                                                            <FormGroup className="tab-ml-1 mt-md-0 mb-md-0 ">
                                                                {this.state.selectedScenario > 0 && <a style={{ marginRight: '7px' }} href="javascript:void();" title={i18n.t('static.qpl.recalculate')} onClick={() => this.recalculate(0, 2)}><i className="fa fa-refresh"></i></a>}
                                                                {this.state.selectedScenario > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginTop: '-10px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')}
                                                                    onClick={() => {
                                                                        var curTheme = localStorage.getItem("theme");
                                                                        if (curTheme == "dark") {
                                                                            this.setState({
                                                                                isDarkMode: false
                                                                            }, () => {
                                                                                setTimeout(() => {
                                                                                    this.exportPDF();
                                                                                    if (curTheme == "dark") {
                                                                                        this.setState({
                                                                                            isDarkMode: true
                                                                                        })
                                                                                    }
                                                                                }, 0)
                                                                            })
                                                                        } else {
                                                                            this.exportPDF();
                                                                        }
                                                                    }}

                                                                />}
                                                                {this.state.selectedScenario > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginTop: '-10px' }} src={docicon} title={i18n.t('static.report.exportWordDoc')} onClick={() => this.exportDoc()} />}
                                                            </FormGroup>
                                                        </div>
                                                    </Col>
                                                </div>
                                            </div>
                                        </div>
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
                            </div>
                        </CardBody>
                    </Card></Col></Row>
            <Modal isOpen={this.state.isBranchTemplateModalOpen}
                className={'modal-lg modalWidth ' + this.props.className}>
                <ModalHeader>
                    <strong>{i18n.t('static.dataset.BranchTreeTemplate')}</strong>
                    <Button size="md" onClick={() => { this.setState({ isBranchTemplateModalOpen: false, branchTemplateId: "", missingPUList: [] }) }} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                </ModalHeader>
                <ModalBody className='pb-lg-0'>
                    <Col sm={12} style={{ flexBasis: 'auto' }}>
                        <Formik
                            initialValues={{
                                branchTemplateId: this.state.branchTemplateId
                            }}
                            validationSchema={validationSchemaBranch}
                            onSubmit={(values, { setSubmitting, setErrors }) => {
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
                                                        <p className='DarkThColr'>{i18n.t('static.tree.branchTemplateNotes1') + " "}<b>{this.state.nodeTypeParentNode}</b>{" " + i18n.t('static.tree.branchTemplateNotes2')}{" "}<b>{this.state.possibleNodeTypes.toString()}</b>{" " + i18n.t('static.tree.branchTemplateNotes3')}<a href="/#/dataset/listTreeTemplate">{" " + i18n.t('static.dataset.TreeTemplate')}</a>{" " + i18n.t('static.tree.branchTemplateNotes4')}</p>
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
                                                    <div className="col-md-12 pl-lg-0 pr-lg-0" style={{ display: 'inline-block' }}>
                                                        <div style={{ display: this.state.missingPUList.length > 0 ? 'block' : 'none' }}><div><b>{i18n.t('static.listTree.missingPlanningUnits')} : (<a href="/#/planningUnitSetting/listPlanningUnitSetting" className="supplyplanformulas">{i18n.t('static.Update.PlanningUnits')}</a>)</b></div><br />
                                                            <FormGroup className="col-md-5">
                                                                <Label htmlFor="currencyId">{i18n.t('static.common.note')}</Label>
                                                                <Input type="textarea"
                                                                    id="branchTemplateNotes"
                                                                    name="branchTemplateNotes"
                                                                    onChange={(e) => { this.dataChange(e) }}
                                                                    value={this.state.branchTemplateNotes != "" ? this.state.branchTemplateNotes : ""}
                                                                ></Input>
                                                            </FormGroup>
                                                            <div id="missingPUJexcel" className="RowClickable">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(!localStorage.getItem('sessionType') === 'Online' && this.state.missingPUList.length > 0) && <strong>{i18n.t("static.tree.youMustBeOnlineToCreatePU")}</strong>}
                                                </div>
                                                <h5 className="green" style={{ display: "none" }} id="div3">
                                                    {localStorage.getItem('sessionType') === 'Online' && this.state.missingPUList.length > 0 && i18n.t("static.tree.addSuccessMessageSelected")}
                                                    {localStorage.getItem('sessionType') === 'Online' && this.state.missingPUList.length == 0 && i18n.t("static.tree.addSuccessMessageAll")}
                                                    {!localStorage.getItem('sessionType') === 'Online' && this.state.missingPUList.length > 0 && i18n.t("static.tree.updateSuccessMessageSelected")}
                                                    {!localStorage.getItem('sessionType') === 'Online' && this.state.missingPUList.length == 0 && i18n.t("static.tree.updateSuccessMessageAll")}
                                                </h5>
                                            </div>
                                            <FormGroup className="col-md-12 float-right pt-lg-4 pr-lg-0">
                                                <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={() => { this.setState({ isBranchTemplateModalOpen: false, branchTemplateId: "", missingPUList: [] }) }}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                {this.state.missingPUList.length == 0 && <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t("static.tree.addBranch")}</Button>}
                                                {this.state.missingPUList.length > 0 && <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t("static.tree.addBranchWithoutPU")}</Button>}
                                                {localStorage.getItem('sessionType') === 'Online' && this.state.missingPUList.length > 0 && <Button type="button" color="success" className="mr-1 float-right" size="md" onClick={() => this.saveMissingPUs()}><i className="fa fa-check"></i>{i18n.t("static.tree.addAbovePUs")}</Button>}
                                                {!localStorage.getItem('sessionType') === 'Online' && this.state.missingPUList.length > 0 && <Button type="button" color="success" className="mr-1 float-right" size="md" onClick={() => this.updateMissingPUs()}><i className="fa fa-check"></i>{i18n.t("static.tree.updateSelectedPU")}</Button>}
                                                {this.state.missingPUList.length == 0 && (this.state.branchTemplateId != "" && this.state.branchTemplateId != 0 && this.state.branchTemplateId != undefined) && <strong>{i18n.t("static.tree.allTemplatePUAreInProgram")}</strong>}
                                                &nbsp;
                                            </FormGroup>
                                        </div>
                                    </Form>
                                )} />
                    </Col>
                    <br />
                </ModalBody>
            </Modal>
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
                    <ModalBody className="ModalBodyPadding Darkmode">
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
            <Draggable handle=".modal-title">
                <Modal isOpen={this.state.openTreeDataModal}
                    className={'modal-md '} >
                    <ModalHeader className="modalHeaderSupplyPlan hideCross">
                        <strong>{i18n.t('static.tree.Add/EditTreeData')}</strong>
                        <Button size="md" onClick={() => this.setState({ openTreeDataModal: false })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                    </ModalHeader>
                    <ModalBody>
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
                                <MultiSelect
                                    name="regionId2"
                                    id="regionId2"
                                    bsSize="sm"
                                    value={this.state.regionValues}
                                    onChange={(e) => { this.handleRegionChange(e) }}
                                    options={regionMultiList && regionMultiList.length > 0 ? regionMultiList : []}
                                    labelledBy={i18n.t('static.common.regiontext')}
                                    filterOptions={filterOptions}
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
                                    {i18n.t('static.dataentry.inactive')}
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
            <Draggable handle=".modal-title">
                <Modal isOpen={this.state.openAddScenarioModal}
                    className={'modal-md '} >
                    <ModalHeader className="modalHeaderSupplyPlan hideCross">
                        {this.state.scenarioActionType == 1 && <strong>{i18n.t("static.tree.addScenario")}</strong>}
                        {this.state.scenarioActionType == 2 && <strong>{i18n.t("static.tree.editScenario")}</strong>}
                        <Button size="md" onClick={this.openScenarioModal} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                    </ModalHeader>
                    <ModalBody>
                        <Formik
                            enableReinitialize={true}
                            initialValues={{
                                scenarioName: this.state.scenario.label.label_en
                            }}
                            validationSchema={validationSchemaScenario}
                            onSubmit={(values, { setSubmitting, setErrors }) => {
                                this.addScenario();
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
                                        <FormGroup>
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.scenarioName')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="scenarioName"
                                                name="scenarioName"
                                                valid={!errors.scenarioName && this.state.scenario.label.label_en != null ? this.state.scenario.label.label_en : '' != ''}
                                                invalid={touched.scenarioName && !!errors.scenarioName}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.scenarioChange(e) }}
                                                value={this.state.scenario.label.label_en}
                                            ></Input>
                                            <FormFeedback>{errors.scenarioName}</FormFeedback>
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
                                        {this.state.scenarioActionType == 2 && <FormGroup>
                                            <Label className="P-absltRadio">{i18n.t('static.common.status')}</Label>
                                            <FormGroup check inline>
                                                <Input
                                                    className="form-check-input"
                                                    type="radio"
                                                    id="activeTrueScenario"
                                                    name="active"
                                                    value={true}
                                                    checked={this.state.scenario.active === true}
                                                    onChange={(e) => { this.scenarioChange(e) }}
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
                                                    id="activeFalseScenario"
                                                    name="active"
                                                    value={false}
                                                    checked={this.state.scenario.active === false}
                                                    onChange={(e) => { this.scenarioChange(e) }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2">
                                                    {i18n.t('static.dataentry.inactive')}
                                                </Label>
                                            </FormGroup>
                                        </FormGroup>
                                        }
                                        <FormGroup className="col-md-6 pt-lg-4 float-right">
                                            <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={this.openScenarioModal}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                            <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i> {this.state.scenarioActionType == 1 ? i18n.t('static.common.submit') : i18n.t('static.common.update')}</Button>
                                        </FormGroup>
                                    </Form>
                                )} />
                    </ModalBody>
                </Modal>
            </Draggable>
            <Modal isOpen={this.state.openAddNodeModal}
                className={'modal-xl '} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>{i18n.t('static.tree.Add/EditNode')}</strong>
                    {<div className="HeaderNodeText"> {
                        <>
                            <Popover placement="top" isOpen={this.state.popoverOpenSenariotree} target="Popover401" trigger="hover" toggle={this.toggleSenariotree}>
                                <PopoverBody>{i18n.t('static.tooltip.scenario')}</PopoverBody>
                            </Popover>
                            <span htmlFor="Popover401">{i18n.t('static.whatIf.scenario')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover401" onClick={this.toggleSenariotree} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></span>
                            <b className="supplyplanformulas ScalingheadTitle">{this.state.selectedScenarioLabel}</b>
                        </>
                    }</div>}
                    {<div className="HeaderNodeText"> {
                        this.state.currentItemConfig.context.payload.nodeType.id == 2 ? <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#20a8d8' }}></i> :
                            (this.state.currentItemConfig.context.payload.nodeType.id == 3 ? <i class="fa fa-percent " style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? <i class="fa fa-cube" style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                    (this.state.currentItemConfig.context.payload.nodeType.id == 5 ? <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                        (this.state.currentItemConfig.context.payload.nodeType.id == 1 ? <i><img src={AggregationNode} className="AggregationNodeSize" /></i> :
                                            (this.state.currentItemConfig.context.payload.nodeType.id == 6 ? <><i><img src={AggregationDown} className="AggregationDownwardNodeSize" /></i></> : "")
                                        ))))}
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
                                        {this.state.currentItemConfig.context.payload.nodeType.id == 6 ? i18n.t('static.tree.monthlyData') : i18n.t('static.tree.Modeling/Transfer')}
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
            <Modal isOpen={this.state.levelModal}
                className={'modal-md modalWidthExpiredStock'}>
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
                                    <Row className="align-items-center">
                                        <Col sm="3">
                                            <strong>{i18n.t('static.tree.levelDetails')}</strong>
                                        </Col>
                                        <Col>
                                            <Input
                                                type="select"
                                                id="levelDropdown"
                                                name="levelDropdown"
                                                bsSize="sm"
                                                onChange={(e) => { this.levelDropdownChange(e) }}
                                                value={this.state.levelNo}
                                            >
                                                {this.state.curTreeObj.levelList.length > 0
                                                    && this.state.curTreeObj.levelList.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.levelNo}>
                                                                {item.label.label_en}
                                                            </option>
                                                        )
                                                    }, this)
                                                }
                                            </Input>
                                        </Col>
                                    </Row>
                                </ModalHeader>
                                <ModalBody>
                                    <div style={{ display: this.state.loading ? "block" : "none" }}>
                                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                            <div class="align-items-center">
                                                <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                                <div class="spinner-border blue ml-4" role="status">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: this.state.loading ? "none" : "block" }}>
                                        <FormGroup>
                                            <Row className="align-items-center">
                                                <Col sm="3">
                                                    <Label style={{ marginBottom: "0" }} htmlFor="currencyId">{i18n.t('static.tree.editLevelName')}<span class="red Reqasterisk">*</span></Label>
                                                </Col>
                                                <Col>
                                                    <Input type="text"
                                                        id="levelName"
                                                        name="levelName"
                                                        required
                                                        bsSize="sm"
                                                        valid={!errors.levelName && this.state.levelName != null ? this.state.levelName : '' != ''}
                                                        invalid={touched.levelName && !!errors.levelName}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => { this.levelNameChanged(e); handleChange(e); }}
                                                        value={this.state.levelName}
                                                    ></Input>
                                                    <FormFeedback>{errors.levelName}</FormFeedback>
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup>
                                            <Row className="align-items-center">
                                                <Col sm="3">
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverNodeUnit} target="PopoverNodeUnit" trigger="hover" toggle={() => this.toggleTooltipNodeUnit()}>
                                                            <PopoverBody>{i18n.t('static.tooltip.levelReorderNodeUnit')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <Label style={{ marginBottom: "0" }} htmlFor="currencyId">{i18n.t('static.modelingValidation.levelUnit')}
                                                        <i class="fa fa-info-circle icons pl-lg-2" id="PopoverNodeUnit" onClick={() => this.toggleTooltipNodeUnit()} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i>
                                                    </Label>
                                                </Col>
                                                <Col>
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
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup>
                                            <Row className="align-items-center">
                                                <Col sm="3">
                                                    <Label style={{ marginBottom: "0" }} htmlFor="currencyId">{i18n.t('static.tree.seeChildrenOf')}</Label>
                                                </Col>
                                                <Col>
                                                    <MultiSelect
                                                        id="childrenOf"
                                                        name="childrenOf"
                                                        bsSize="sm"
                                                        options={this.state.childrenOfList}
                                                        onChange={(e) => { this.childrenOfChanged(e) }}
                                                        value={this.state.childrenOf}
                                                        filterOptions={filterOptions}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <p>{i18n.t('static.tree.levelChangeNote')}</p>
                                        <FormGroup>
                                            {this.state.showReorderJexcel &&
                                                <div className="col-md-12 pl-lg-0 pr-lg-0" style={{ display: 'inline-block' }}>
                                                    <div id="levelReorderJexcel" style={{ display: "block" }}>
                                                    </div>
                                                </div>
                                            }
                                        </FormGroup>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <div className="mr-0">
                                        <Button type="submit" size="md" color="success" className="submitBtn float-right" > <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
                                    </div>
                                    <Button size="md" color="warning" className="submitBtn float-right mr-1" onClick={() => this.resetLevelReorder()}> <i className="fa fa-times"></i> {i18n.t('static.common.reset')}</Button>
                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.levelClicked("")}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </Form>
                        )} />
            </Modal>
            <Modal isOpen={this.state.copyModal}
                className={'modal-md'}>
                <Formik
                    enableReinitialize={true}
                    initialValues={
                        {
                            treeDropdown: this.state.copyModalTree,
                            parentLevelDropdown: this.state.copyModalParentLevel,
                            parentNodeDropdown: this.state.copyModalParentNode
                        }
                    }
                    validationSchema={validationSchemaCopyMove}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.copyMoveNode();
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
                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='copyModalForm' autocomplete="off">
                                <ModalHeader toggle={() => this.setState({ copyModal: false })} className="modalHeader">
                                    <strong>{i18n.t('static.tree.moveCopy')}</strong>
                                </ModalHeader>
                                <ModalBody>
                                    <div style={{ display: this.state.copyLoader ? "none" : "block" }}>
                                        <FormGroup>
                                            <FormGroup check inline className="pl-0">
                                                <Input
                                                    className="form-check-input ml-0"
                                                    type="radio"
                                                    id="copyMoveTrue"
                                                    name="copyMove"
                                                    value={1}
                                                    checked={this.state.copyModalData == 1 ? true : false}
                                                    onChange={(e) => {
                                                        this.copyMoveChange(e)
                                                    }}
                                                />
                                                <Label
                                                    className="form-check-label login-text"
                                                    check htmlFor="copyMoveTrue">
                                                    {i18n.t('static.tree.copy')}
                                                </Label>
                                            </FormGroup>
                                            <FormGroup check inline>
                                                <Input
                                                    className="form-check-input"
                                                    type="radio"
                                                    id="copyMoveFalse"
                                                    name="copyMove"
                                                    value={2}
                                                    checked={this.state.copyModalData == 2 ? true : false}
                                                    onChange={(e) => {
                                                        this.copyMoveChange(e)
                                                    }}
                                                />
                                                <Label
                                                    className="form-check-label login-text"
                                                    check htmlFor="copyMoveFalse">
                                                    {i18n.t('static.tree.move')}
                                                </Label>
                                            </FormGroup>
                                            <div className="red">{errors.copyMove}</div>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label className="form-check-label">
                                                <b>Node name:</b> {this.state.copyModalNode.payload.label.label_en}
                                            </Label>
                                        </FormGroup>
                                        <div style={{ display: (this.state.copyModalData == 1 || this.state.copyModalData == 2) ? "block" : "none" }}>
                                            <FormGroup style={{ "marginLeft": '20px' }}>
                                                <Input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="copyModeling"
                                                    name="copyModeling"
                                                    checked={this.state.copyModeling}
                                                    onClick={(e) => { this.setCopyModeling(e); }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="copyModeling" style={{ fontSize: '12px', "marginTop": '3px' }}>
                                                    {i18n.t('static.tree.copyModeling')}
                                                </Label>
                                            </FormGroup>
                                            <p><b>{i18n.t('static.tree.destination')}:</b></p>
                                            <FormGroup>
                                                <Label htmlFor="currencyId">{i18n.t('static.common.treeName')}</Label>
                                                <Input
                                                    type="select"
                                                    id="treeDropdown"
                                                    name="treeDropdown"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.copyModalTreeChange(e) }}
                                                    value={this.state.copyModalTree}
                                                    valid={!errors.treeDropdown && this.state.copyModalTree != ''}
                                                    invalid={touched.treeDropdown && !!errors.treeDropdown}
                                                    onBlur={handleBlur}
                                                >
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {this.state.treeData.length > 0
                                                        && this.state.treeData.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.treeId}>
                                                                    {getLabelText(item.label, this.state.lang)}
                                                                </option>
                                                            )
                                                        }, this)
                                                    }
                                                </Input>
                                                <div className="red">{errors.treeDropdown}</div>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.parentLevel')}</Label>
                                                <Input
                                                    type="select"
                                                    id="parentLevelDropdown"
                                                    name="parentLevelDropdown"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.copyModalParentLevelChange(e) }}
                                                    value={this.state.copyModalParentLevel}
                                                    valid={!errors.parentLevelDropdown && (this.state.copyModalParentLevel != '' || parseInt(this.state.copyModalParentLevel) == 0)}
                                                    invalid={(this.state.copyModalParentLevel == '' && parseInt(this.state.copyModalParentLevel) != 0) || !!errors.parentLevelDropdown}
                                                    onBlur={handleBlur}
                                                >
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {this.state.copyModalParentLevelList.length > 0
                                                        && this.state.copyModalParentLevelList.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.levelNo}>
                                                                    {item.label.label_en}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                                <div className="red">{errors.parentLevelDropdown}</div>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.parentNode')}</Label>
                                                <Input
                                                    type="select"
                                                    id="parentNodeDropdown"
                                                    name="parentNodeDropdown"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.copyModalParentNodeChange(e) }}
                                                    value={this.state.copyModalParentNode}
                                                    valid={!errors.parentNodeDropdown && (this.state.copyModalParentNode != '' || parseInt(this.state.copyModalParentNode) == 0)}
                                                    invalid={(parseInt(this.state.copyModalParentNode) != 0 && this.state.copyModalParentNode == '') || !!errors.parentNodeDropdown}
                                                    onBlur={handleBlur}
                                                >
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {this.state.copyModalParentNodeList.length > 0
                                                        && this.state.copyModalParentNodeList.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.id}>
                                                                    {item.payload.label.label_en}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                                <div className="red">{errors.parentNodeDropdown}</div>
                                            </FormGroup>
                                            <p className="red" style={{ display: this.state.invalidNodeError ? "block" : "none" }}>{i18n.t('static.tree.invalidNodeError').replace("<nodeName>", this.state.copyModalNode.payload.label.label_en).replace("<nodeType>", this.state.invalidNodeType == 1 ? "Σ" : this.state.invalidNodeType == 2 ? "#" : this.state.invalidNodeType == 3 ? "%" : this.state.invalidNodeType == 4 ? "FU" : this.state.invalidNodeType == 5 ? "PU" : "Funnel node").replace("<parentNodeType>", this.state.invalidParentNodeType == 1 ? "Σ" : this.state.invalidParentNodeType == 2 ? "#" : this.state.invalidParentNodeType == 3 ? "%" : this.state.invalidParentNodeType == 4 ? "FU" : this.state.invalidParentNodeType == 5 ? "PU" : "Funnel node")}</p>
                                            <p>{i18n.t('static.tree.moveCopyNote')}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: this.state.copyLoader ? "block" : "none" }}>
                                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                            <div class="align-items-center">
                                                <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                                <div class="spinner-border blue ml-4" role="status">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <div className="mr-0">
                                        <Button type="submit" size="md" color="success" className="submitBtn float-right" > <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
                                    </div>
                                    <Button size="md" color="warning" className="submitBtn float-right mr-1" onClick={() => this.state.copyLoader ? {} : this.resetCopyMoveModal()}> <i className="fa fa-times"></i> {i18n.t('static.common.reset')}</Button>
                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.state.copyLoader ? {} : this.setState({ copyModal: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                </ModalFooter>
                            </Form>
                        )} />
            </Modal>
        </div >
    }
}
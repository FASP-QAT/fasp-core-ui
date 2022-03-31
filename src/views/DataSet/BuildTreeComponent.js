import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
// import { PDFDocument } from 'pdfkit';
import "jspdf-autotable";
import cleanUp from '../../assets/img/calculator.png';
import AggregationNode from '../../assets/img/Aggregation-icon.png';
import { LOGO } from '../../CommonComponent/Logo.js';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType, LevelAnnotationConfig, AnnotationType, LineType, Thickness, TreeLevels } from 'basicprimitives';
import { DropTarget, DragSource } from 'react-dnd';
import i18n from '../../i18n'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../../views/Forms/ValidationForms/ValidationForms.css'
import { Row, Col, Card, CardFooter, Button, CardBody, Form, Modal, ModalBody, PopoverBody, Popover, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, Collapse, InputGroupText, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, ButtonDropdown, InputGroup } from 'reactstrap';
import Provider from '../../Samples/Provider'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import moment from 'moment';
import Picker from 'react-month-picker';
import SelectSearch from 'react-select-search';
import MonthBox from '../../CommonComponent/MonthBox.js';
import { NUMBER_NODE_ID, PERCENTAGE_NODE_ID, FU_NODE_ID, PU_NODE_ID, ROUNDING_NUMBER, INDEXED_DB_NAME, INDEXED_DB_VERSION, TREE_DIMENSION_ID, SECRET_KEY, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DECIMAL_NO_REGEX_LONG, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL, JEXCEL_DECIMAL_MONTHLY_CHANGE, DATE_FORMAT_CAP, TITLE_FONT } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
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
import TreeExtrapolationComponent from '../../views/DataSet/TreeExtrapolationComponent';
import AuthenticationService from '../Common/AuthenticationService';
import SupplyPlanFormulas from "../SupplyPlan/SupplyPlanFormulas";
import classNames from 'classnames';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import PDFDocument from 'pdfkit-nodejs-webpack';
import blobStream from 'blob-stream';
import OrgDiagramPdfkit from '../TreePDF/OrgDiagramPdfkit';
import Size from '../../../node_modules/basicprimitives/src/graphics/structs/Size';
import { Prompt } from 'react-router';
import { i } from 'mathjs';
import RotatedText from 'basicprimitivesreact/dist/umd/Templates/RotatedText';

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
    forecastingUnitPerPersonsFC: "",
    forecastingUnitId: ""
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
                    // console.log("@@@",(parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2) && document.getElementById("nodeUnitId").value == "");
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
                    var testNumber = (/^(?!$)\d{0,10}(?:\.\d{1,4})?$/).test((document.getElementById("nodeValue").value).replaceAll(",", ""));
                    // console.log("*****", testNumber);
                    if ((parseInt(document.getElementById("nodeTypeId").value) == 3 || parseInt(document.getElementById("nodeTypeId").value) == 2) && (document.getElementById("nodeValue").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        // tracerCategoryId: Yup.string()
        //     .test('tracerCategoryId', i18n.t('static.validation.fieldRequired'),
        //         function (value) {
        //             if (parseInt(document.getElementById("nodeTypeId").value) == 4 && document.getElementById("tracerCategoryId").value == "") {
        //                 return false;
        //             } else {
        //                 return true;
        //             }
        //         }),
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
        // forecastingUnitId: Yup.string()
        //     .test('forecastingUnitId', 'Please select forecasting unit 1',
        //         function (value) {
        //             console.log("showFUValidation 1--->", document.getElementById("showFUValidation").value);
        //             console.log("showFUValidation 2--->", value);
        //             if ((parseInt(document.getElementById("nodeTypeId").value) == 4 && (document.getElementById("showFUValidation").value == true) && value == 'undefined')) {
        //                 console.log("inside if validation")
        //                 return false;
        //             } else {
        //                 console.log("inside else validation")
        //                 return true;
        //             }
        //         }).typeError('Please select forecasting unit'),
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
                    // console.log("*****", document.getElementById("nodeValue").value);
                    var testNumber = (/^\d{0,3}?$/).test(document.getElementById("lagInMonths").value);
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
            Yup.string().test('forecastingUnitPerPersonsFC', i18n.t('static.tree.decimalValidation12&2'),
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

        // .transform((currentValue, originalValue) => {
        //     return originalValue === '' ? null : currentValue;
        // })
        // .nullable()
        // .typeError('Must be a number'),
        usageFrequencyCon: Yup.string()
            .test('usageFrequencyCon', i18n.t('static.tree.decimalValidation12&2'),
                function (value) {
                    // console.log("@@@>1", (parseInt(document.getElementById("nodeTypeId").value) == 4));
                    // console.log("@@@>1", document.getElementById("usageTypeIdFU").value == 2);
                    // console.log("@@@>2", document.getElementById("usageFrequency").value == "");
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
                    // console.log("@@@>1", document.getElementById("usageTypeIdFU").value == 1);
                    // console.log("@@@>2", (document.getElementById("oneTimeUsage").value == 'false' || document.getElementById("oneTimeUsage").value == false));
                    // console.log("@@@>3", (document.getElementById("usageFrequencyDis").value == "" || testNumber == false));
                    var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("usageFrequencyDis").value).replaceAll(",", ""))
                    // console.log("usageFrequencyDis testNumber---", testNumber)
                    if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value == 'false' || document.getElementById("oneTimeUsage").value == false) && (document.getElementById("usageFrequencyDis").value == "" || testNumber == false)) {
                        // console.log("usageFrequencyDis false");
                        return false;
                    } else {
                        // console.log("usageFrequencyDis true");
                        return true;
                    }
                }),
        usagePeriodIdCon: Yup.string()
            .test('usagePeriodIdCon', 'This field is required.',
                function (value) {
                    // console.log("@@@>1", (parseInt(document.getElementById("nodeTypeId").value) == 4));
                    // console.log("@@@>1", document.getElementById("usageTypeIdFU").value == 2);
                    // console.log("@@@>2", document.getElementById("usageFrequency").value == "");
                    if (document.getElementById("usageTypeIdFU").value == 2 && document.getElementById("usagePeriodIdCon").value == "") {
                        return false;
                    } else {
                        return true;
                    }

                }),
        usagePeriodIdDis: Yup.string()
            .test('usagePeriodIdDis', 'This field is required.',
                function (value) {
                    // console.log("@@@>1", (parseInt(document.getElementById("nodeTypeId").value) == 4));
                    // console.log("@@@>1", document.getElementById("usageTypeIdFU").value == 2);
                    // console.log("@@@>2", document.getElementById("usageFrequency").value == "");
                    if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value == 'false' || document.getElementById("oneTimeUsage").value == false) && document.getElementById("usagePeriodIdDis").value == "") {
                        console.log("usagePeriodIdDis false");
                        return false;
                    } else {
                        console.log("usagePeriodIdDis true");
                        return true;
                    }

                }),

        oneTimeUsage: Yup.string()
            .test('oneTimeUsage', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (document.getElementById("usageTypeIdFU").value == 1 && document.getElementById("oneTimeUsage").value == "") {
                        console.log("oneTimeUsage false");
                        return false;
                    } else {
                        console.log("oneTimeUsage true");
                        return true;
                    }
                }),
        repeatCount: Yup.string().test('repeatCount', i18n.t('static.tree.decimalValidation12&2'),
            function (value) {
                console.log("one time usage--->>>", document.getElementById("oneTimeUsage").value);
                console.log("final result---", (document.getElementById("usageTypeIdFU").value == 1 && document.getElementById("oneTimeUsage").value === "false" && (document.getElementById("repeatCount").value == "")))
                var testNumber = (/^\d{0,12}(\.\d{1,4})?$/).test((document.getElementById("repeatCount").value).replaceAll(",", ""));
                if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value === "false" || document.getElementById("oneTimeUsage").value === false) && (document.getElementById("repeatCount").value == "" || testNumber == false)) {
                    // if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("repeatCount").value == "")) {
                    console.log("repeatCount false");
                    return false;
                } else {
                    console.log("repeatCount true");
                    return true;
                }
            }),
        repeatUsagePeriodId: Yup.string().test('repeatUsagePeriodId', 'This field is required.',
            function (value) {
                console.log("validate 1---", document.getElementById("repeatUsagePeriodId").value);
                console.log("validate 2---", document.getElementById("usageTypeIdFU").value);
                console.log("validate 3---", document.getElementById("oneTimeUsage").value);
                if (document.getElementById("usageTypeIdFU").value == 1 && (document.getElementById("oneTimeUsage").value == "false" || document.getElementById("oneTimeUsage").value == false) && (document.getElementById("repeatUsagePeriodId").value == "")) {
                    console.log("validate 4---");
                    return false;
                } else {
                    console.log("validate 5---");
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
                    // var testNumber = document.getElementById("refillMonths").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("refillMonths").value) : false;
                    var testNumber = (/^[1-9]\d*$/).test((document.getElementById("refillMonths").value).replaceAll(",", ""));
                    console.log("refill months*****", testNumber);
                    if ((document.getElementById("nodeTypeId").value == 5 && document.getElementById("usageTypeIdPU").value == 2) && (document.getElementById("refillMonths").value == "" || testNumber == false)) {
                        return false;
                    } else {
                        return true;
                    }
                }),
        sharePlanningUnit: Yup.string()
            .test('sharePlanningUnit', i18n.t('static.validation.fieldRequired'),
                function (value) {
                    if (document.getElementById("nodeTypeId").value == 5 && document.getElementById("usageTypeIdPU").value == 1 && document.getElementById("sharePlanningUnit").value == "") {
                        return false;
                    } else {
                        return true;
                    }
                }),
        puPerVisit: Yup.string()
            .test('puPerVisit', 'Please enter # of pu per visit.',
                function (value) {
                    // console.log("*****", document.getElementById("nodeValue").value);
                    // var testNumber = document.getElementById("puPerVisit").value != "" ? (/^\d{0,3}(\.\d{1,2})?$/).test(document.getElementById("puPerVisit").value) : false;
                    // var testNumber = (/^[1-9]\d*$/).test((document.getElementById("puPerVisit").value).replaceAll(",", ""));
                    // console.log("*****", testNumber);
                    var testNumber = (/^[1-9]\d*$/).test((document.getElementById("puPerVisit").value));
                    if (document.getElementById("nodeTypeId").value == 5 && (document.getElementById("puPerVisit").value == "" || testNumber == false)) {
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
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
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
        console.log("Comma---Inside if");
        cell1 += '';
        console.log("Comma---append blank");
        var x = cell1.replaceAll(",", "").split('.');
        console.log("Comma---x---", x);
        var x1 = x[0];
        console.log("Comma---x1---", x1);
        var x2 = x.length > 1 ? '.' + x[1].slice(0, 4) : '';
        console.log("Comma---x2---", x2);
        var rgx = /(\d+)(\d{3})/;
        console.log("Comma---reg");
        while (rgx.test(x1)) {
            console.log("Comma---indide while");
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
            console.log("Comma---x1 replace---", x1);
        }
        console.log("Comma---x1+x2---", x1 + x2);
        return x1 + x2;
        // return cell1.toString().replaceAll(",", "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    } else {
        console.log("Comma---");
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

export default class BuildTree extends Component {
    constructor(props) {
        super(props);

        this.pickAMonth3 = React.createRef()
        this.pickAMonth2 = React.createRef()
        this.pickAMonth1 = React.createRef()
        this.pickAMonth4 = React.createRef()
        this.pickAMonth5 = React.createRef()
        this.state = {
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
            minDateValue: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
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
                        extrapolation: false,
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
            lastRowDeleted: false
        }
        this.toggleDeropdownSetting = this.toggleDeropdownSetting.bind(this);
        // this.onClick1 = this.onClick1.bind(this);
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
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getMaxNodeDataId = this.getMaxNodeDataId.bind(this);
        this.exportPDF = this.exportPDF.bind(this);
        this.updateExtrapolationData = this.updateExtrapolationData.bind(this);
        this.round = this.round.bind(this);
        this.calculatePUPerVisit = this.calculatePUPerVisit.bind(this);
        this.createPUNode = this.createPUNode.bind(this);
        this.levelClicked = this.levelClicked.bind(this);
        this.levelDeatilsSaved = this.levelDeatilsSaved.bind(this)
    }

    levelClicked(data) {
        var name = "";
        var unit = "";
        var levelNo = "";
        if (data != "") {
            console.log("Data@@@@###############", data.context.levels[0])
            var treeLevelList = this.state.curTreeObj.levelList;
            var levelListFiltered = treeLevelList.filter(c => c.levelNo == data.context.levels[0]);
            levelNo = data.context.levels[0]
            if (levelListFiltered.length > 0) {
                name = levelListFiltered[0].label.label_en;
                unit = levelListFiltered[0].unit.id;
            }
            console.log("Name@@@@###########", name);
            console.log("Unit@@@@###########", unit);
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
        const { curTreeObj } = this.state;
        var treeLevelList = this.state.curTreeObj.levelList;
        var levelListFiltered = treeLevelList.findIndex(c => c.levelNo == this.state.levelNo);
        if (levelListFiltered != -1) {
            if (this.state.levelName != "") {
                treeLevelList[levelListFiltered].label = {
                    label_en: this.state.levelName,
                    label_sp: "",
                    label_pr: "",
                    label_fr: ""
                };
                var label = {}
                if (this.state.levelUnit != "") {
                    label = this.state.nodeUnitList.filter(c => c.unitId == this.state.levelUnit)[0].label;
                }
                treeLevelList[levelListFiltered].unit = {
                    id: this.state.levelUnit,
                    label: label
                }
            } else {
                treeLevelList.splice(levelListFiltered, 1);
            }
        } else {
            if (this.state.levelName != "") {
                var label = {}
                if (this.state.levelUnit != "") {
                    label = this.state.nodeUnitList.filter(c => c.unitId == this.state.levelUnit)[0].label;
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
                    unit: {
                        id: this.state.levelUnit,
                        label: label
                    }
                })
            }
        }
        curTreeObj.levelList = treeLevelList;
        console.log("Cur Tree Obj@@@@@", curTreeObj)
        this.setState({
            levelModal: false,
            curTreeObj,
        }, () => {
            this.saveTreeData()
            // console.log("final tab list---", this.state.items);
            // if (type == 1) {
            //     var maxNodeDataId = temNodeDataMap.length > 0 ? Math.max(...temNodeDataMap.map(o => o.nodeDataId)) : 0;
            //     console.log("scenarioId---", scenarioId);
            //     for (var i = 0; i < items.length; i++) {
            //         maxNodeDataId = parseInt(maxNodeDataId) + 1;
            //         (items[i].payload.nodeDataMap[scenarioId])[0].nodeDataId = maxNodeDataId;
            //         console.log("my node data id--->", (items[i].payload.nodeDataMap[scenarioId])[0].nodeDataId);
            //     }
            //     this.callAfterScenarioChange(scenarioId);
            //     this.updateTreeData();
            // }
        });
    }

    calculatePUPerVisit(isRefillMonth) {
        var currentScenario = this.state.currentScenario;
        var parentScenario = this.state.parentScenario;
        var currentItemConfig = this.state.currentItemConfig;
        var conversionFactor = this.state.conversionFactor;
        console.log("PUPERVISIT conversionFactor---", conversionFactor);
        var refillMonths = isRefillMonth && currentScenario.puNode.refillMonths != "" ? currentScenario.puNode.refillMonths : this.round(parseFloat(conversionFactor / (parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)).toFixed(4));
        console.log("PUPERVISIT refillMonths---", refillMonths);
        console.log("PUPERVISIT noOfForecastingUnitsPerPerson---", parentScenario.fuNode.noOfForecastingUnitsPerPerson);
        console.log("PUPERVISIT noOfMonthsInUsagePeriod---", this.state.noOfMonthsInUsagePeriod);
        var puPerVisit = this.round(parseFloat(((parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / conversionFactor).toFixed(4));
        console.log("PUPERVISIT puPerVisit---", puPerVisit);

        currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.puPerVisit = puPerVisit;
        if (!isRefillMonth) {
            currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.refillMonths = refillMonths;
        }
        currentScenario = currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0];
        this.setState({ currentItemConfig, currentScenario });
    }

    round(value) {
        console.log("Round input value---", value);
        var result = (value - Math.floor(value)).toFixed(4);
        console.log("Round result---", result);
        console.log("Round condition---", `${ROUNDING_NUMBER}`);
        if (result > `${ROUNDING_NUMBER}`) {
            console.log("Round ceiling---", Math.ceil(value));
            return Math.ceil(value);
        } else {
            console.log("Round floor---", Math.floor(value));
            if (Math.floor(value) == 0) {
                return Math.ceil(value);
            } else {
                return Math.floor(value);
            }
        }
    }
    getMaxNodeDataId() {
        var maxNodeDataId = 0;
        if (this.state.maxNodeDataId != "" && this.state.maxNodeDataId != 0) {
            maxNodeDataId = parseInt(this.state.maxNodeDataId + 1);
            console.log("maxNodeDataId 1---", maxNodeDataId)
            this.setState({
                maxNodeDataId
            })
        } else {
            var items = this.state.items;
            var nodeDataMap = [];
            var nodeDataMapIdArr = [];
            console.log("items.length---", items)
            for (let i = 0; i < items.length; i++) {
                var scenarioList = this.state.scenarioList;
                console.log("scenarioList length---", scenarioList.length);
                for (let j = 0; j < scenarioList.length; j++) {
                    console.log("array a---", i, "---", items[i]);
                    if (items[i].payload.nodeDataMap.hasOwnProperty(scenarioList[j].id)) {
                        nodeDataMap.push(items[i].payload.nodeDataMap[scenarioList[j].id][0]);
                        nodeDataMapIdArr.push(items[i].payload.nodeDataMap[scenarioList[j].id][0].nodeDataId);
                    }
                }
            }
            maxNodeDataId = nodeDataMap.length > 0 ? Math.max(...nodeDataMap.map(o => o.nodeDataId)) : 0;
            console.log("nodeDataMap array---", nodeDataMap);
            console.log("nodeDataMapIdArr---", nodeDataMapIdArr);
            console.log("maxNodeDataId 2---", maxNodeDataId)
            maxNodeDataId = parseInt(maxNodeDataId + 1);
            this.setState({
                maxNodeDataId
            })
        }
        return maxNodeDataId;
    }

    formSubmitLoader() {
        console.log("node id cur node---", this.state.currentItemConfig.context.payload);
        console.log("validate---", validateNodeData(validationSchemaNodeData));
        this.setState({
            modelingJexcelLoader: true
        }, () => {
            // alert("load 2")
            setTimeout(() => {
                console.log("inside set timeout")
                this.formSubmit();
            }, 0);
        })
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    calculateMOMData(nodeId, type) {
        let { curTreeObj } = this.state;
        let { treeData } = this.state;
        let { dataSetObj } = this.state;
        var items = this.state.items;
        var programData = dataSetObj.programData;
        console.log("program data>>> 1", programData);
        console.log("program data treeData>>> 1.1", treeData);
        programData.treeList = treeData;
        console.log("program data>>> 2", programData);
        // alert("27---")

        curTreeObj.tree.flatList = items;
        curTreeObj.scenarioList = this.state.scenarioList;
        var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
        treeData[findTreeIndex] = curTreeObj;
        programData.treeList = treeData;
        dataSetObj.programData = programData;
        console.log("dataSetDecrypt>>>", dataSetObj);
        calculateModelingData(dataSetObj, this, '', (nodeId != 0 ? nodeId : this.state.currentItemConfig.context.id), this.state.selectedScenario, type, this.state.treeId, false);
        // }
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
                unit: item.planningUnit.forecastingUnit.unit,
                tracerCategory: item.planningUnit.forecastingUnit.tracerCategory
            })
        })
        console.log("forecastingUnitListNew---", forecastingUnitList);
        planningUnitList.map(item => {
            updatedPlanningUnitList.push({
                label: item.planningUnit.label, id: item.planningUnit.id,
                unit: item.planningUnit.unit,
                forecastingUnit: item.planningUnit.forecastingUnit,
                multiplier: item.planningUnit.multiplier
            })
        })
        console.log("updatedPlanningUnitList", updatedPlanningUnitList);
        planningUnitList.map(item => {
            tracerCategoryList.push({
                label: item.planningUnit.forecastingUnit.tracerCategory.label, tracerCategoryId: item.planningUnit.forecastingUnit.tracerCategory.id
            })
        })
        console.log("duplicate tc list--->", tracerCategoryList);
        forecastingUnitList = [...new Map(forecastingUnitList.map(v => [v.id, v])).values()];
        console.log("unique fu list--->", forecastingUnitList);
        tracerCategoryList = [...new Map(tracerCategoryList.map(v => [v.tracerCategoryId, v])).values()];
        console.log("unique tc list--->", tracerCategoryList);
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
            updatedPlanningUnitList
        }, () => {
            if (forecastingUnitListNew.length > 0) {
                var fuIds = forecastingUnitListNew.map(x => x.id).join(", ");
                console.log("fuIds---", fuIds)
                if (fuIds != "") {
                    var fuIdArray = fuIds.split(',').map(Number);
                    console.log("fuIdArray---", fuIdArray);
                    this.getUsageTemplateList(fuIdArray);
                }
                // var result = array.filter(function(value) {
                //     return filterNumbers.indexOf(value) === -1;
                // });
            }
        });
    }

    alertfunction() {
        console.log(">>>hi");
        console.log(">>>", document.getElementById("usageFrequency").value)

    }

    resetNodeData() {
        console.log("reset node data function called");
        const { orgCurrentItemConfig, currentItemConfig } = this.state;
        var nodeTypeId;
        var fuValues = [];
        if (currentItemConfig.context.level != 0 && currentItemConfig.parentItem.payload.nodeType.id == 4) {
            nodeTypeId = PU_NODE_ID;
            console.log("reset node data function called 0.1---", currentItemConfig);
        } else {
            nodeTypeId = currentItemConfig.context.payload.nodeType.id;
        }
        // conso
        console.log("reset node data function called 1---", currentItemConfig);
        currentItemConfig.context = JSON.parse(JSON.stringify(orgCurrentItemConfig));
        // currentScenario = JSON.parse(JSON.stringify((orgCurrentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0]));
        console.log("============1============", orgCurrentItemConfig);
        if (nodeTypeId == 5) {
            console.log("reset node data function called 2---", orgCurrentItemConfig);
            currentItemConfig.context.payload.nodeType.id = nodeTypeId;

            currentItemConfig.context.payload.nodeUnit.id = this.state.items.filter(x => x.id == currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id;
            if (this.state.addNodeFlag) {
                var parentCalculatedDataValue = this.state.items.filter(x => x.id == currentItemConfig.context.parent)[0].payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue;
                console.log("parentCalculatedDataValue 1---", this.state.items.filter(x => x.id == currentItemConfig.context.parent)[0].payload.nodeDataMap[this.state.selectedScenario][0]);
                console.log("parentCalculatedDataValue 2---", parentCalculatedDataValue);
                currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].dataValue = 100;
                currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue = ((100 * parentCalculatedDataValue) / 100).toString();
            }
            var planningUnit = this.state.updatedPlanningUnitList.filter(x => x.id == currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id);
            var conversionFactor = planningUnit.length > 0 ? planningUnit[0].multiplier : "";
            console.log("conversionFactor---", conversionFactor);
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
            console.log("reset node data function called 3---", this.state.currentScenario);
            if (nodeTypeId == 4) {
                this.getForecastingUnitListByTracerCategoryId(0);
            }
            console.log("currentItemConfig after---", this.state.orgCurrentItemConfig)
        });
    }

    callAfterScenarioChange(scenarioId) {
        console.log("&&&&scenarioId---", scenarioId);
        let { curTreeObj } = this.state;
        console.log("&&&&curTreeObj---", curTreeObj);
        var items = curTreeObj.tree.flatList;
        var scenarioId = scenarioId;
        console.log("items***&---", items);
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
            console.log('month value --->', this.state.singleValue2)
            this.handleAMonthDissmis3(this.state.singleValue2, 0);
            // this.calculateValuesForAggregateNode(items);
        });
    }
    // onClick1 () {
    //     this.state({
    //         showDiv1:false,
    //     })
    //     alert('hiiiii')
    //     console.log(

    //         "ShowDiv1",this.state.showDiv1
    //     )

    //     };

    toggleDeropdownSetting(i) {
        const newArray = this.state.dropdownOpen.map((element, index) => { return (index === i ? !element : false); });
        this.setState({
            dropdownOpen: newArray,
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
    toggleDropdown() {
        this.setState({
            showDiv1: !this.state.showDiv1
        })
    }
    updateExtrapolationData(parameterName, value) {
        this.setState({
            [parameterName]: value
        });
    }
    updateState(parameterName, value) {
        console.log("parameterName---", parameterName);
        console.log("value---", value);
        this.setState({
            [parameterName]: value
        }, () => {
            if (parameterName == 'nodeId' && (value != null && value != 0)) {
                var items = this.state.items;
                var nodeDataMomList = this.state.nodeDataMomList;
                console.log("nodeDataMomList---", nodeDataMomList);
                if (nodeDataMomList.length > 0) {
                    for (let i = 0; i < nodeDataMomList.length; i++) {
                        console.log("nodeDataMomList[i]---", nodeDataMomList[i])
                        var nodeId = nodeDataMomList[i].nodeId;
                        var nodeDataMomListForNode = nodeDataMomList[i].nodeDataMomList;
                        console.log("this.state.nodeDataMomList---", this.state.nodeDataMomList);
                        var node = items.filter(n => n.id == nodeId)[0];
                        console.log("node---", node);
                        (node.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataMomList = nodeDataMomListForNode;
                        var findNodeIndex = items.findIndex(n => n.id == nodeId);
                        console.log("findNodeIndex---", findNodeIndex);
                        items[findNodeIndex] = node;
                    }
                }
                // var node = items.filter(n => n.id == value)[0];
                // (node.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataMomList = this.state.nodeDataMomList.length == 1 ? this.state.nodeDataMomList : [];
                // var findNodeIndex = items.findIndex(n => n.id == value);
                // console.log("findNodeIndex---", findNodeIndex);
                // items[findNodeIndex] = node;
                console.log("items---***", items);
                this.setState({ items })
            }
            if (parameterName == 'type' && (value == 1 || value == 0)) {
                if (this.state.currentItemConfig.context.payload.nodeType.id == 1 || this.state.currentItemConfig.context.payload.nodeType.id == 2) {
                    console.log("mom list ret---", this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id));
                    this.setState({ momList: this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList }, () => {
                        console.log("going to build mom jexcel");
                        if (value == 1 || (value == 0 && this.state.showMomData)) {
                            this.buildMomJexcel();
                        }
                    });
                } else {
                    this.setState({ momListPer: this.state.nodeDataMomList.filter(x => x.nodeId == this.state.currentItemConfig.context.id)[0].nodeDataMomList }, () => {
                        console.log("going to build mom jexcel percent");
                        if (value == 1 || (value == 0 && this.state.showMomDataPercent)) {
                            this.buildMomJexcelPercent();
                        }
                    });
                }
                this.saveTreeData();


            }
            // if (parameterName == 'type' && value == 0) {
            //     this.saveTreeData();
            //     this.updateTreeData();
            //     this.calculateValuesForAggregateNode(this.state.items);
            // }
            console.log("returmed list---", this.state.nodeDataMomList);

        })
    }

    calculateAfterDragDrop() {
        // var dataSetObj = this.state.datasetList.filter(c => c.programId == this.state.programId)[0];
        // var dataEnc = dataSetObj;
        // var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
        // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
        // console.log("dataSetObj.programData***>>>", programData);
        // this.setState({ dataSetObj: dataSetObj, forecastStartDate: programData.currentVersion.forecastStartDate, forecastStopDate: programData.currentVersion.forecastStopDate }, () => {

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
        this.setState({ loading: true }, () => {
            let { curTreeObj } = this.state;
            let { treeData } = this.state;
            let { dataSetObj } = this.state;
            var items = this.state.items;
            console.log("dataSetObj--->>>", dataSetObj)
            console.log("treeData--->>>", treeData)
            console.log("curTreeObj--->>>", curTreeObj)
            console.log("tree items 1---", items);
            for (let i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.payload.nodeType.id == 4 || item.payload.nodeType.id == 5) {
                    item.isVisible = true;
                }
                // arr.push(item);
            }
            console.log("tree items 2---", items);
            let tempProgram = JSON.parse(JSON.stringify(dataSetObj))
            console.log("save tree data items>>>", items);
            // var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
            // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            var programData = tempProgram.programData;
            programData.treeList = treeData;
            console.log("program data>>>", programData);

            curTreeObj.scenarioList = this.state.scenarioList;
            if (items.length > 0) {
                curTreeObj.tree.flatList = items;
            }
            var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
            treeData[findTreeIndex] = curTreeObj;

            // var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
            // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            programData.treeList = treeData;
            console.log("dataSetDecrypt>>>", programData);


            programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
            tempProgram.programData = programData;

            console.log("encpyDataSet>>>", tempProgram)
            // store update object in indexdb
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
                // programs.forEach(program => {
                var programRequest = programTransaction.put(tempProgram);
                transaction.oncomplete = function (event) {
                    db1 = e.target.result;
                    var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                    var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                    console.log("this.props.match.params.programId---", this.state.programId);
                    var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.programId);
                    datasetDetailsRequest.onsuccess = function (e) {
                        console.log("all good >>>>");
                        console.log("Data update success");
                        var datasetDetailsRequestJson = datasetDetailsRequest.result;
                        datasetDetailsRequestJson.changed = 1;
                        var programQPLDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                        programQPLDetailsRequest1.onsuccess = function (event) {
                            this.setState({
                                loading: false,
                                message: i18n.t("static.mt.dataUpdateSuccess"),
                                color: "green",
                                isChanged: false
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
                                    // arr.push(item);
                                }
                                console.log("hide fu pu---", this.state.hideFUPUNode);
                                console.log("hide pu---", this.state.hidePUNode);
                                this.handleAMonthDissmis3(this.state.singleValue2, 0);
                                this.hideSecondComponent();
                            });
                            console.log("Data update success");
                        }.bind(this)
                        programQPLDetailsRequest1.onerror = function (event) {
                            this.setState({
                                loading: false,
                                message: 'Error occured.',
                                color: "red",
                            });
                            console.log("Data update success");
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
                        console.log("Data update errr");
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
                    console.log("Data update errr");
                }.bind(this);
            }.bind(this);
        });

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
            var maxTreeId = treeData.length > 0 ? Math.max(...treeData.map(o => o.treeId)) : 0;
            console.log("tree data----", curTreeObj)
            // curTreeObj.treeId = parseInt(maxTreeId) + 1;
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
            console.log("region values---", this.state.regionValues);
            console.log("curTreeObj.regionList---", curTreeObj.regionList);
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
        console.log("date--->>>>>>>", date);
        var json = this.state.modelingEl.getJson(null, false);
        console.log("modelingElData>>>", json);
        var scalingTotal = 0;
        for (var i = 0; i < json.length; i++) {
            var calculatedChangeForMonth = 0;
            var map1 = new Map(Object.entries(json[i]));
            var startDate = map1.get("3");
            var stopDate = map1.get("4");
            var modelingTypeId = map1.get("2");
            var dataValue = modelingTypeId == 2 ? map1.get("6") : map1.get("5");
            console.log("startDate---", startDate);
            console.log("stopDate---", stopDate);
            const result = moment(date).isBetween(startDate, stopDate, null, '[]');
            console.log("result---", result);
            if (result) {
                var nodeValue = this.state.currentScenario.calculatedDataValue;

                if (modelingTypeId == 2 || modelingTypeId == 5) {
                    calculatedChangeForMonth = parseFloat(dataValue).toFixed(4);
                } else if (modelingTypeId == 3 || modelingTypeId == 4) {
                    calculatedChangeForMonth = parseFloat((nodeValue * dataValue) / 100).toFixed(4);
                }
                console.log("calculatedChangeForMonth---", calculatedChangeForMonth);
            }
            this.state.modelingEl.setValueFromCoords(8, i, calculatedChangeForMonth, true);
            // scalingTotal = parseFloat(scalingTotal) + parseFloat(calculatedChangeForMonth);
        }
        var scalingDifference = this.state.currentScenario.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(date).format("YYYY-MM"));
        if (scalingDifference.length > 0) {
            scalingTotal += scalingDifference[0].difference;
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
        this.setState({
            momJexcelLoader: true
        }, () => {
            setTimeout(() => {
                var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
                var json = nodeTypeId == 2 ? this.state.momEl.getJson(null, false) : this.state.momElPer.getJson(null, false);
                console.log("momData>>>", json);
                var overrideListArray = [];
                for (var i = 0; i < json.length; i++) {
                    var map1 = new Map(Object.entries(json[i]));
                    if (nodeTypeId == 2) {
                        if ((map1.get("4") != '' && map1.get("4") != 0.00) || (map1.get("5") != '' && map1.get("5") != 0.00)) {
                            var overrideData = {
                                month: map1.get("0"),
                                seasonalityPerc: map1.get("4").toString().replaceAll(",", "").split("%")[0],
                                manualChange: (map1.get("5") != '' && map1.get("5") != 0.00) ? (map1.get("5")).replaceAll(",", "") : map1.get("5"),
                                nodeDataId: map1.get("7"),
                                active: true
                            }
                            console.log("overrideData>>>", overrideData);
                            overrideListArray.push(overrideData);
                        }
                    } else if (nodeTypeId == 3 || nodeTypeId == 4 || nodeTypeId == 5) {
                        if (map1.get("3") != '' && map1.get("3") != 0.00) {
                            var overrideData = {
                                month: map1.get("0"),
                                seasonalityPerc: 0,
                                manualChange: map1.get("3").toString().replaceAll(",", "").split("%")[0],
                                nodeDataId: map1.get("7"),
                                active: true
                            }
                            console.log("overrideData>>>", overrideData);
                            overrideListArray.push(overrideData);
                        }
                    }
                }
                console.log("overRide data list>>>", overrideListArray);
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
                    console.log("items>>>", items);
                    curTreeObj.tree.flatList = items;

                    var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
                    treeData[findTreeIndex] = curTreeObj;

                    // var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
                    // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                    var programData = dataSetObjCopy.programData;
                    programData.treeList = treeData;
                    // programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
                    // dataSetObjCopy.programData = programData;
                    // dataSetObj.programData = programData;
                    console.log("dataSetDecrypt>>>", programData);
                    calculateModelingData(dataSetObjCopy, this, '', currentItemConfig.context.id, this.state.selectedScenario, 1, this.state.treeId, false);
                    // store update object in indexdb
                    //     var db1;
                    //     getDatabase();
                    //     var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    //     openRequest.onerror = function (event) {
                    //         this.setState({
                    //             message: i18n.t('static.program.errortext'),
                    //             color: 'red'
                    //         })
                    //         this.hideFirstComponent()
                    //     }.bind(this);
                    //     openRequest.onsuccess = function (e) {
                    //         db1 = e.target.result;
                    //         var transaction = db1.transaction(['datasetData'], 'readwrite');
                    //         var programTransaction = transaction.objectStore('datasetData');
                    //         // programs.forEach(program => {
                    //         var programRequest = programTransaction.put(dataSetObjCopy);
                    //         console.log("---hurrey---");
                    //         // })
                    //         transaction.oncomplete = function (event) {
                    //             console.log("all good >>>>");

                    //             this.setState({
                    //                 momJexcelLoader: false
                    //             });
                    //             console.log("Data update success");
                    //         }.bind(this);
                    //         transaction.onerror = function (event) {
                    //             this.setState({
                    //                 loading: false,
                    //                 message: 'Error occured.',
                    //                 color: "red",
                    //             }, () => {
                    //                 this.hideSecondComponent();
                    //             });
                    //             console.log("Data update errr");
                    //         }.bind(this);
                    //     }.bind(this);
                });

            }, 0);
        });

    }
    getStartValueForMonth(dateValue) {
        console.log("***", this.state.parentNodeDataMap);
    }
    openScenarioModal(type) {
        console.log("type---------", type);
        var scenarioId = this.state.selectedScenario;
        this.setState({
            scenarioActionType: type,
            showDiv1: false

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
                var scenarioList = this.state.scenarioList;
                var minScenarioId = Math.min(...scenarioList.map(o => o.id));
                if (minScenarioId != this.state.selectedScenario) {
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
                        message: "You can't delete the default scenario.",
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
    buildMomJexcelPercent() {
        // var parentStartValue = this.state.parentScenario.calculatedDataValue;
        // console.log("parentStartValue---", parentStartValue)
        var momList = this.state.momListPer == undefined ? [] : this.state.momListPer;
        console.log("momList percent node---", momList)
        var momListParent = this.state.momListPerParent == undefined ? [] : this.state.momListPerParent;
        console.log("momListParent---", momListParent)
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
                console.log("grandParentNodeData$$$%%%", grandParentNodeData)
                if (grandParentNodeData != undefined) {
                    patients = grandParentNodeData.calculatedDataValue != null ? grandParentNodeData.calculatedDataValue : grandParentNodeData.dataValue;
                } else {
                    patients = 0;
                }
                var noOfBottlesInOneVisit = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit;

            }
        }
        console.log("Lag in months@@@", lagInMonths)
        for (var j = 0; j < momList.length; j++) {
            data = [];
            data[0] = momList[j].month
            data[1] = j == 0 ? parseFloat(momList[j].startValue).toFixed(4) : `=ROUND(IF(K1==true,E${parseInt(j)},J${parseInt(j)}),4)`
            data[2] = parseFloat(momList[j].difference).toFixed(4)
            data[3] = parseFloat(momList[j].manualChange).toFixed(4)
            data[4] = `=ROUND(IF(B${parseInt(j) + 1}+C${parseInt(j) + 1}+D${parseInt(j) + 1}<0,0,B${parseInt(j) + 1}+C${parseInt(j) + 1}+D${parseInt(j) + 1}),4)`
            // `=B${parseInt(j) + 1}+C${parseInt(j) + 1}+D${parseInt(j) + 1}`
            var momListParentForMonth = momListParent.filter(c => moment(c.month).format("YYYY-MM") == moment(momList[j].month).format("YYYY-MM"));
            data[5] = momListParentForMonth.length > 0 ? parseFloat(momListParentForMonth[0].calculatedValue).toFixed(4) : 0;
            data[6] = this.state.currentItemConfig.context.payload.nodeType.id != 5 ? `=ROUND((E${parseInt(j) + 1}*${momListParentForMonth.length > 0 ? parseFloat(momListParentForMonth[0].calculatedValue) : 0}/100)*L${parseInt(j) + 1},4)` : `=ROUND((E${parseInt(j) + 1}*${momListParentForMonth.length > 0 ? parseFloat(momListParentForMonth[0].calculatedValue) : 0}/100)/${(this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.multiplier},4)`;
            // data[6] = this.state.manualChange ? momList[j].calculatedValue : ((momListParent[j].manualChange > 0) ? momListParent[j].endValueWithManualChangeWMC : momListParent[j].calculatedValueWMC *  momList[j].endValueWithManualChangeWMC) / 100
            data[7] = this.state.currentScenario.nodeDataId
            data[8] = this.state.currentItemConfig.context.payload.nodeType.id == 4 || (this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2 && (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.refillMonths > 1) ? j >= lagInMonths ? `=IF(P${parseInt(j) + 1 - lagInMonths}<0,0,P${parseInt(j) + 1 - lagInMonths})` : 0 : `=IF(P${parseInt(j) + 1}<0,0,P${parseInt(j) + 1})`;
            data[9] = `=ROUND(IF(B${parseInt(j) + 1}+C${parseInt(j) + 1}<0,0,B${parseInt(j) + 1}+C${parseInt(j) + 1}),4)`
            data[10] = this.state.currentScenario.manualChangesEffectFuture;
            data[11] = this.state.currentItemConfig.context.payload.nodeType.id == 4 ? fuPerMonth : 1;
            data[12] = `=FLOOR.MATH(${j}/${monthsPerVisit},1)`;
            if (this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2 && (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.refillMonths > 1) {
                var dataValue = 0;
                if (Math.floor(j / monthsPerVisit) == 0) {
                    dataValue = (patients / monthsPerVisit) + (j == 0 ? grandParentMomList[j].calculatedValue - patients : grandParentMomList[j].calculatedValue - grandParentMomList[j - 1].calculatedValue)
                } else {
                    dataValue = dataArray[j - monthsPerVisit][14] + (j == 0 ? grandParentMomList[j].calculatedValue - patients : grandParentMomList[j].calculatedValue - grandParentMomList[j - 1].calculatedValue)
                }
                data[13] = j == 0 ? grandParentMomList[j].calculatedValue - patients : grandParentMomList[j].calculatedValue - grandParentMomList[j - 1].calculatedValue;
                data[14] = dataValue;
            } else {
                data[13] = 0;
                data[14] = 0;
            }
            var nodeDataMomListPercForFU = [];
            var fuPercentage = 0;
            if (this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2 && (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.refillMonths > 1) {
                if (parentNodeNodeData.nodeDataMomList != undefined) {
                    nodeDataMomListPercForFU = parentNodeNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(momList[j].month).format("YYYY-MM"));
                    if (nodeDataMomListPercForFU.length > 0) {
                        fuPercentage = nodeDataMomListPercForFU[0].endValue;
                    }
                }
            }
            data[15] = this.state.currentItemConfig.context.payload.nodeType.id == 5 && parentNodeNodeData.fuNode.usageType.id == 2 && (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.refillMonths > 1 ? `=ROUND((O${parseInt(j) + 1}*${noOfBottlesInOneVisit}*(E${parseInt(j) + 1}/100)*${fuPercentage}/100),0)` : `=G${parseInt(j) + 1}`;
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
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100,
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.%of') + " " + getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) + " " + i18n.t('static.tree.monthStart'),
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
                    mask: '#,##0.0000%', decimal: '.'

                },
                {
                    title: i18n.t('static.tree.%of') + " " + getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang),
                    type: 'numeric',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: true
                },
                {
                    title: getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang),
                    type: 'numeric',
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
        if (instance.jexcel.getJson(null, false).length > 0) {
            var cell = instance.jexcel.getCell("D1");
            cell.classList.add('readonly');
        }
    }

    buildMomJexcel() {
        var momList = this.state.momList == undefined ? [] : this.state.momList;
        console.log("momList--->", momList);
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
            data[7] = this.state.currentScenario.nodeDataId
            data[8] = this.state.currentScenario.manualChangesEffectFuture;
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
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100,
                    readOnly: true
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
                    mask: '#,##0.0000%', decimal: '.',
                    readOnly: !this.state.aggregationNode ? true : false
                },
                {
                    // 5
                    title: i18n.t('static.tree.manualChange+-'),
                    type: this.state.seasonality == true ? 'numeric' : 'hidden',
                    mask: '#,##0.0000', decimal: '.',
                    readOnly: !this.state.aggregationNode ? true : false
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
                // var elInstance = el.jexcel;
                // if (y != null) {
                //     // var rowData = elInstance.getRowData(y);
                //     // console.log("this.state.seasonality---", this.state.seasonality);
                //     if (!this.state.aggregationNode) {
                //         cell.classList.add('readonly');
                //         // $(cell).addClass('readonly');
                //     }
                //     else {
                //         cell.classList.remove('readonly');
                //         // $(cell).addClass('readonly');
                //     }
                // }
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
        if (instance.jexcel.getJson(null, false).length > 0) {
            var cell = instance.jexcel.getCell("E1");
            cell.classList.add('readonly');
            var cell = instance.jexcel.getCell("F1");
            cell.classList.add('readonly');
        }
    }

    showMomData() {
        console.log("show mom data---", this.state.currentScenario);
        var getMomDataForCurrentNode = this.state.items.filter(x => x.id == this.state.currentItemConfig.context.id).length > 0 ? this.state.items.filter(x => x.id == this.state.currentItemConfig.context.id)[0].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList : [];
        console.log("getMomDataForCurrentNode>>>", getMomDataForCurrentNode);
        if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
            console.log("mom list parent---", this.state.parentScenario);
            var getMomDataForCurrentNodeParent = this.state.items.filter(x => x.id == this.state.currentItemConfig.context.parent).length > 0 ? this.state.items.filter(x => x.id == this.state.currentItemConfig.context.parent)[0].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList : []
            console.log("in if>>>>", getMomDataForCurrentNodeParent);

            this.setState({ showMomDataPercent: !this.state.showMomDataPercent, showMomData: false, momListPer: getMomDataForCurrentNode, momListPerParent: getMomDataForCurrentNodeParent }, () => {
                if (this.state.showMomDataPercent) {
                    console.log("inside show mom data percent node");
                    this.setState({ viewMonthlyData: false }, () => {
                        this.buildMomJexcelPercent();
                    })
                } else {
                    this.setState({ viewMonthlyData: true });
                }
            });
        } else {
            console.log("in else>>>>");
            this.setState({ showMomDataPercent: false, showMomData: !this.state.showMomData, momList: getMomDataForCurrentNode }, () => {
                if (this.state.showMomData) {
                    console.log("inside show mom data number node---", this.state.momList);
                    this.setState({ viewMonthlyData: false }, () => {
                        this.buildMomJexcel();
                    })
                } else {
                    this.setState({ viewMonthlyData: true });
                }
            });
        }

    }
    setStartAndStopDateOfProgram(programId) {
        console.log("programId>>>", this.state.datasetList);
        var proList = [];
        localStorage.setItem("sesDatasetId", programId);
        if (programId != "") {
            var dataSetObj = JSON.parse(JSON.stringify(this.state.datasetList.filter(c => c.id == programId)[0]));;
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
            //Display forecast period
            var forecastPeriod = moment(programData.currentVersion.forecastStartDate).format(`MMM-YYYY`) + " ~ " + moment(programData.currentVersion.forecastStopDate).format(`MMM-YYYY`);
            console.log("forecastPeriod---", forecastPeriod);
            this.setState({
                forecastPeriod,
                dataSetObj,
                realmCountryId: programData.realmCountry.realmCountryId,
                treeData: proList,
                items: [],
                selectedScenario: '',
                programId,
                // singleValue2: { year: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getFullYear(), month: new Date(Date.UTC(programData.currentVersion.forecastStartDate.replace(/-/g, '\/'))).getMonth() + 1 },
                singleValue2: { year: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getFullYear(), month: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getMonth() + 1 },
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
                forecastPeriod: '',
                treeData: proList,
                singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 }
            })
        }
        this.getRegionList();
    }
    extrapolate(e) {
        const { currentItemConfig } = this.state;
        // const newArray = this.state.activeTab1.slice()
        currentItemConfig.context.payload.extrapolation = e.target.checked == true ? true : false;
        console.log("this.state.activeTab1---", this.state.activeTab1);

        this.setState({
            currentItemConfig,
            activeTab1: e.target.checked == true ? new Array(2).fill('3') : new Array(2).fill('2')
        }, () => {
            if (this.state.activeTab1[0] == '3') {
                if (this.state.modelingEl != "") {
                    this.state.modelingEl.destroy();
                    if (this.state.momEl != "") {
                        this.state.momEl.destroy();
                    }
                    else if (this.state.momElPer != "") {
                        this.state.momElPer.destroy();
                    }
                }

                this.refs.extrapolationChild.getExtrapolationMethodList();
            } else {
                console.log("***>>>", this.state.currentItemConfig);
                if (this.state.currentItemConfig.context.payload.nodeType.id != 1) {
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
                else {
                    this.setState({
                        showModelingJexcelNumber: true
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

        });
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
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].manualChangesEffectFuture = (e.target.checked == true ? true : false)
            var nodes = this.state.items;
            var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.context.id);
            nodes[findNodeIndex] = currentItemConfig.context;
            this.setState({
                currentItemConfig,
                items: nodes,
                currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0]
            }, () => {
                //     this.calculateMOMData(0, 1);
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
        console.log("entry ---", new Date())
        if (this.state.modelingJexcelLoader === true) {
            var validation = this.state.lastRowDeleted == true ? true : this.checkValidation();
            console.log("validation---", validation);
            if (this.state.lastRowDeleted == true || validation == true) {
                try {
                    console.log("entered if ---", new Date());
                    var tableJson = this.state.modelingEl.getJson(null, false);
                    console.log("tableJson length---", tableJson.length);
                    var data = this.state.currentScenario.nodeDataModelingList;
                    var maxModelingId = data.length > 0 ? Math.max(...data.map(o => o.nodeDataModelingId)) : 0;
                    console.log("maxModelingId---", maxModelingId);
                    var obj;
                    var dataArr = [];
                    var items = this.state.items;
                    var item = items.filter(x => x.id == this.state.currentItemConfig.context.id)[0];
                    const itemIndex1 = items.findIndex(o => o.id === this.state.currentItemConfig.context.id);
                    console.log("itemIndex1--->>>", itemIndex1);
                    if (itemIndex1 != -1) {
                        for (var i = 0; i < tableJson.length; i++) {
                            var map1 = new Map(Object.entries(tableJson[i]));
                            console.log("10 map---" + map1.get("10"));
                            if (parseInt(map1.get("10")) === 1) {
                                console.log("10 map true---");

                                var parts1 = map1.get("3").split('-');
                                var startDate = parts1[0] + "-" + parts1[1] + "-01"
                                var parts2 = map1.get("4").split('-');
                                var stopDate = parts2[0] + "-" + parts2[1] + "-01"
                                startDate = moment(map1.get("3")).startOf('month').format("YYYY-MM-DD");
                                stopDate = moment(map1.get("4")).startOf('month').format("YYYY-MM-DD");
                                if (map1.get("9") != "" && map1.get("9") != 0) {
                                    console.log("inside 9 map true---");
                                    const itemIndex = data.findIndex(o => o.nodeDataModelingId === map1.get("9"));
                                    obj = data.filter(x => x.nodeDataModelingId == map1.get("9"))[0];
                                    console.log("obj--->>>>>", obj);
                                    var transfer = map1[0] != "" ? map1.get("0") : '';
                                    console.log("transfer---", transfer);
                                    obj.transferNodeDataId = transfer;
                                    obj.notes = map1.get("1");
                                    obj.modelingType.id = map1.get("2");
                                    obj.startDate = startDate;
                                    obj.stopDate = stopDate;
                                    obj.dataValue = map1.get("2") == 2 ? map1.get("6").toString().replaceAll(",", "") : map1.get("5").toString().replaceAll(",", "").split("%")[0];
                                    obj.nodeDataModelingId = map1.get("9")
                                    // data[itemIndex] = obj;
                                    // dataArr.push(obj);
                                } else {
                                    obj = {
                                        transferNodeDataId: map1[0] != "" ? map1.get("0") : '',
                                        notes: map1.get("1"),
                                        modelingType: {
                                            id: map1.get("2")
                                        },
                                        startDate: startDate,
                                        stopDate: stopDate,
                                        dataValue: map1.get("2") == 2 ? map1.get("6").toString().replaceAll(",", "") : map1.get("5").toString().replaceAll(",", "").split("%")[0],
                                        nodeDataModelingId: parseInt(maxModelingId) + 1
                                    }
                                    maxModelingId++;
                                }
                                dataArr.push(obj);

                            }
                        }

                        console.log("dataArr--->>>", dataArr);
                        item.payload = this.state.currentItemConfig.context.payload;
                        if (dataArr.length > 0) {
                            (item.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataModelingList = dataArr;
                        }
                        if (this.state.lastRowDeleted == true) {
                            (item.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataModelingList = [];
                        }
                        console.log("item---", item);
                        items[itemIndex1] = item;
                        console.log("items---", items);

                        let { curTreeObj } = this.state;
                        let { treeData } = this.state;
                        let { dataSetObj } = this.state;
                        console.log("save tree data items 1>>>", items);
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
                            scalingList: dataArr,
                            lastRowDeleted: false,
                            // openAddNodeModal: false,
                            activeTab1: new Array(2).fill('2')
                        }, () => {
                            console.log("save tree data items 2>>>", this.state.items);
                            this.calculateMOMData(0, 0);
                        });
                    } else {
                        this.setState({
                            modelingJexcelLoader: false
                        }, () => {
                            // setTimeout(() => {
                            alert("You are creating a new node.Please submit the node data first and then apply modeling/transfer.");
                            // confirmAlert({
                            //     message: "You are creating a new node.Please submit the node data first and then apply modeling/transfer.",
                            //     buttons: [
                            //         {
                            //             label: i18n.t('static.report.ok')
                            //         }
                            //     ]
                            // });
                            // }, 0);
                        });
                    }
                } catch (err) {
                    console.log("scaling err---", err);
                    localStorage.setItem("scalingErrorTree", err);
                }
            } else {
                this.setState({ modelingJexcelLoader: false })
            }
        }
        // })

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
        }, () => {
            // this.filterScalingDataByMonth(this.state.scalingMonth);
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
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
            }
        } else {
            if (this.state.currentModelingType == 2) {
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentModelingType, true);
                elInstance.setValueFromCoords(3, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, this.state.currentTargetChangeNumber, true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
            } else if (this.state.currentModelingType == 3) {
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentModelingType, true);
                elInstance.setValueFromCoords(3, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentTargetChangePercentage).toFixed(4), true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
            } else if (this.state.currentModelingType == 4) {
                elInstance.setValueFromCoords(2, this.state.currentRowIndex, this.state.currentModelingType, true);
                elInstance.setValueFromCoords(3, this.state.currentRowIndex, this.state.currentCalculatorStartDate, true);
                elInstance.setValueFromCoords(4, this.state.currentRowIndex, this.state.currentCalculatorStopDate, true);
                elInstance.setValueFromCoords(5, this.state.currentRowIndex, parseFloat(this.state.currentTargetChangePercentage).toFixed(4), true);
                elInstance.setValueFromCoords(6, this.state.currentRowIndex, '', true);
                elInstance.setValueFromCoords(8, this.state.currentRowIndex, parseFloat(this.state.currentCalculatedMomChange).toFixed(4), true);
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
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(4);
        }
        if (this.state.currentModelingType == 3) {
            if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
                var getChangeInPercent = (parseFloat(getValue - this.state.currentScenario.dataValue) / monthDifference).toFixed(4);
                var momValue = (this.state.currentScenario.calculatedDataValue * getChangeInPercent / 100).toFixed(4);
                // console.log("getChangeInPercent>>>",getChangeInPercent);
                // console.log("momValue>>>",momValue)
            } else {
                // var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue)) / monthDifference / this.state.currentCalculatorStartValue * 100).toFixed(4);
                var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue.toString().replaceAll(",", ""))) / monthDifference).toFixed(4);
            }
        }
        if (this.state.currentModelingType == 4) {
            // var momValue = ((Math.pow(parseFloat(getValue / this.state.currentCalculatorStartValue), parseFloat(1 / monthDifference)) - 1) * 100).toFixed(4);
            var momValue = ((parseFloat(getValue - this.state.currentCalculatorStartValue)) / monthDifference).toFixed(4);
        }

        if (this.state.currentModelingType == 5) {
            var momValue = (parseFloat(getValue - this.state.currentScenario.dataValue) / monthDifference).toFixed(4);
        }
        // console.log("getmomValue>>>", momValue);
        var targetChangeNumber = '';
        var targetChangePer = '';
        if (this.state.currentItemConfig.context.payload.nodeType.id < 3) {
            targetChangeNumber = (parseFloat(getValue - this.state.currentCalculatorStartValue) / monthDifference).toFixed(4);
            targetChangePer = (parseFloat(targetChangeNumber / this.state.currentCalculatorStartValue) * 100).toFixed(4);
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
        var getValue = e.target.value != "" ? e.target.value.toString().replaceAll(",", "").match(/^-?\d+(?:\.\d{0,2})?/)[0] : "";
        var getEndValueFromPercentage = (this.state.currentCalculatorStartValue * getValue) / 100;


        // if (this.state.currentItemConfig.context.payload.nodeType.id == 3) {
        //     var targetEndValue = (parseFloat(getEndValueFromPercentage) + parseFloat(this.state.currentCalculatorStartValue)) / this.state.currentCalculatorStartValue * 100;
        // } else {
        var targetEndValue = parseFloat(this.state.currentCalculatorStartValue + getEndValueFromPercentage).toFixed(4);
        // }

        var momValue = ''
        if (this.state.currentModelingType == 2) {
            // var momValue = ((parseFloat(targetEndValue - this.state.currentCalculatorStartValue)) / monthDifference).toFixed(4);
            var momValue = ((parseFloat((this.state.currentCalculatorStartValue * getValue) / 100))).toFixed(4);
        }
        if (this.state.currentModelingType == 3) {
            if (this.state.currentItemConfig.context.payload.nodeType.id > 2) {
                var getChangeInPercent = getValue;
                var momValue = (this.state.currentScenario.calculatedDataValue * getChangeInPercent / 100).toFixed(4);
            } else {
                // var momValue = ((parseFloat(targetEndValue - this.state.currentCalculatorStartValue)) / monthDifference / this.state.currentCalculatorStartValue * 100).toFixed(4);
                var momValue = ((parseFloat((this.state.currentCalculatorStartValue * getValue) / 100))).toFixed(4);
            }

        }
        if (this.state.currentModelingType == 4) {
            // var momValue = ((Math.pow(parseFloat(targetEndValue / this.state.currentCalculatorStartValue), parseFloat(1 / monthDifference)) - 1) * 100).toFixed(4);
            var momValue = ((parseFloat((this.state.currentCalculatorStartValue * getValue) / 100))).toFixed(4);

        }
        if (this.state.currentModelingType == 5) {
            var momValue = (parseFloat(getValue)).toFixed(4);
        }

        this.setState({
            currentEndValue: (getValue != '' && this.state.currentModelingType != 3 && this.state.currentModelingType != 5) ? targetEndValue : '',
            currentCalculatedMomChange: getValue != '' ? momValue : ''
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
        var getValue = e.target.value.toString().replaceAll(",", "");
        // var getEndValueFromNumber = parseFloat(this.state.currentCalculatorStartValue) + parseFloat(e.target.value);
        var targetEndValue = parseFloat(this.state.currentCalculatorStartValue) + parseFloat(getValue);

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


    getSameLevelNodeList(level, id, nodeTypeId) {
        console.log("level---", level);
        console.log("id---", id);
        var sameLevelNodeList = [];
        var arr = this.state.items.filter(x => x.level == level && x.id != id && x.payload.nodeType.id == nodeTypeId);
        console.log("arr---", arr);
        for (var i = 0; i < arr.length; i++) {
            sameLevelNodeList[i] = { id: arr[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataId, name: getLabelText(arr[i].payload.label, this.state.lang) }
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
        var scalingList = this.state.currentScenario.nodeDataModelingList == undefined ? [] : this.state.currentScenario.nodeDataModelingList;
        // console.log("scalingList---", scalingList);
        var dataArray = [];
        let count = 0;

        if (scalingList.length == 0) {
            data = [];
            data[0] = ''
            data[1] = ''
            data[2] = this.state.currentItemConfig.context.payload.nodeType.id == PERCENTAGE_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == FU_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == PU_NODE_ID ? 5 : '';
            data[3] = moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY-MM-DD")
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
        if (scalingList.length > 0) {
            for (var j = 0; j < scalingList.length; j++) {
                data = [];
                data[0] = scalingList[j].transferNodeDataId
                data[1] = scalingList[j].notes
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
        }
        this.setState({ scalingTotal }, () => {
        });
        this.el = jexcel(document.getElementById("modelingJexcel"), '');
        this.el.destroy();
        var data = dataArray;

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
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY-MM-DD"), this.state.maxMonth] }, width: 100
                },
                {
                    title: i18n.t('static.common.stopdate'),
                    type: 'calendar',
                    options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY-MM-DD"), this.state.maxMonth] }, width: 100
                },
                {
                    title: i18n.t('static.tree.monthlyChange%'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##0.0000%',
                    disabledMaskOnEdition: true
                },
                {
                    title: i18n.t('static.tree.MonthlyChange#'),
                    type: this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'numeric' : 'hidden',
                    mask: '#,##0.0000', decimal: '.',
                    textEditor: true,
                    disabledMaskOnEdition: true
                },
                {
                    title: i18n.t('static.tree.modelingCalculater'),
                    type: 'image',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tree.calculatedChangeForMonth'),
                    type: 'numeric',
                    mask: '#,##0.0000',
                    decimal: '.',
                    textEditor: true,
                    disabledMaskOnEdition: true,
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

                    // if (x == 5) {
                    //     var txt = numeral(val).format('0,0.0000%');
                    //     $(cell).html(' ' + txt);
                    // }
                    // if (rowData[3] != "" && moment(this.state.minMonth).diff(moment(rowData[3]), 'months') == 0) {
                    //     var cell = elInstance.getCell(("D").concat(parseInt(y) + 1))
                    //     cell.classList.add('readonly');
                    // } else {
                    //     var cell = elInstance.getCell(("D").concat(parseInt(y) + 1))
                    //     cell.classList.remove('readonly');
                    // }

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
                        // if (obj.getRowData(y)[9] == "" || obj.getRowData(y)[9] == 0) {
                        items.push({
                            title: i18n.t("static.common.deleterow"),
                            onclick: function () {
                                if (obj.getJson(null, false).length == 1) {
                                    var data = [];
                                    data[0] = 0;
                                    data[1] = "";
                                    data[2] = "";
                                    data[3] = moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY-MM-DD")
                                    data[4] = this.state.maxMonth
                                    data[5] = "";
                                    data[6] = "";
                                    data[7] = cleanUp;
                                    data[8] = "";
                                    data[9] = "";
                                    data[10] = 1;
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
                        // }
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
            var curDate = moment(Date.now()).utcOffset('-0500').startOf('month').format('YYYY-MM-DD');
            console.log("curDate---", curDate)
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
                // showCalculatorFields: '',
                currentModelingType: '',
                currentCalculatorStartDate: '',
                currentCalculatorStopDate: '',
                currentCalculatorStartValue: '',
            }, () => {
                // console.log("x row data===>", this.el.getRowData(x));
                var elInstance = this.state.modelingEl;
                var rowData = elInstance.getRowData(x);
                this.setState({
                    currentRowIndex: x,
                    showCalculatorFields: this.state.aggregationNode ? !this.state.showCalculatorFields : false,
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
        if (this.state.isChanged != true) {
            this.setState({ isChanged: true });
        }
        // 4 & 5
        // this.setState({
        //     momJexcelLoader: true
        // }, () => {
        //     setTimeout(() => {
        //         console.log("hi anchal")
        //         var json = this.state.momEl.getJson(null, false);
        //         console.log("momData>>>", json);
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
        //                 console.log("overrideData>>>", overrideData);
        //                 overrideListArray.push(overrideData);
        //             }
        //         }
        //         console.log("overRide data list>>>", overrideListArray);
        //         let { currentItemConfig } = this.state;
        //         let { curTreeObj } = this.state;
        //         let { treeData } = this.state;
        //         let { dataSetObj } = this.state;
        //         var items = this.state.items;
        //         (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataOverrideList = overrideListArray;
        //         this.setState({ currentItemConfig }, () => {
        //             // console.log("currentIemConfigInUpdetMom>>>", currentItemConfig);
        //             var findNodeIndex = items.findIndex(n => n.id == currentItemConfig.context.id);
        //             items[findNodeIndex] = currentItemConfig.context;
        //             // console.log("items>>>", items);
        //             curTreeObj.tree.flatList = items;

        //             var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
        //             treeData[findTreeIndex] = curTreeObj;

        //             // var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
        //             // var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
        //             var programData = dataSetObj.programData;
        //             programData.treeList = treeData;
        //             // dataSetObj.programData = programData;
        //             console.log("dataSetDecrypt>>>", programData);
        //             // calculateModelingData(dataSetObj, this, '', currentItemConfig.context.id, this.state.selectedScenario, 1, this.state.treeId, false);
        //         });
        //     }, 0);
        // })

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
        //         console.log("momData>>>", json);
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
        //                 console.log("overrideData>>>", overrideData);
        //                 overrideListArray.push(overrideData);
        //             }
        //         }
        //         console.log("overRide data list>>>", overrideListArray);
        //         let { currentItemConfig } = this.state;
        //         let { curTreeObj } = this.state;
        //         let { treeData } = this.state;
        //         let { dataSetObj } = this.state;
        //         var items = this.state.items;
        //         (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataOverrideList = overrideListArray;
        //         this.setState({ currentItemConfig }, () => {
        //             // console.log("currentIemConfigInUpdetMom>>>", currentItemConfig);
        //             var findNodeIndex = items.findIndex(n => n.id == currentItemConfig.context.id);
        //             items[findNodeIndex] = currentItemConfig.context;
        //             // console.log("items>>>", items);
        //             curTreeObj.tree.flatList = items;

        //             var findTreeIndex = treeData.findIndex(n => n.treeId == curTreeObj.treeId);
        //             treeData[findTreeIndex] = curTreeObj;
        //             console.log("treeData---", treeData);
        //             console.log("dataSetObj---", dataSetObj);
        //             var programData = dataSetObj.programData;
        //             console.log("dataSetDecrypt>>>1", programData);
        //             programData.treeList = treeData;
        //             console.log("dataSetDecrypt>>>2", programData);


        //             //  programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
        //             //  dataSetObj.programData = programData;

        //             console.log("encpyDataSet>>>", dataSetObj)
        //             calculateModelingData(dataSetObj, this, '', currentItemConfig.context.id, this.state.selectedScenario, 1, this.state.treeId, false);
        //         });
        //     }, 0);
        // })
    }.bind(this);
    changed = function (instance, cell, x, y, value) {
        //Modeling type
        // instance.jexcel
        if (this.state.lastRowDeleted != false) {
            this.setState({
                lastRowDeleted: false
            })
        }
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setStyle(col, "background-color", "yellow");
                instance.jexcel.setComments(col, i18n.t('static.label.fieldRequired'));
                this.state.modelingEl.setValueFromCoords(5, y, "", true);
                this.state.modelingEl.setValueFromCoords(6, y, "", true);
                this.state.modelingEl.setValueFromCoords(8, y, '', true);
            } else {
                if (value == 2) {
                    this.state.modelingEl.setValueFromCoords(5, y, "", true);
                    this.state.modelingEl.setValueFromCoords(8, y, '', true);
                }
                else if (value == 3 || value == 4 || value == 5) {
                    this.state.modelingEl.setValueFromCoords(6, y, "", true);
                    this.state.modelingEl.setValueFromCoords(8, y, '', true);
                }

                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setComments(col, "");
            }
        }

        var startDate = instance.jexcel.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
        var stopDate = instance.jexcel.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");

        // Start date
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            var diff1 = moment(stopDate).diff(moment(startDate), 'months');
            if (value == "") {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setStyle(col, "background-color", "yellow");
                instance.jexcel.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setComments(col, "");
                var col1 = ("E").concat(parseInt(y) + 1)
                if (diff1 <= 0) {
                    instance.jexcel.setStyle(col1, "background-color", "transparent");
                    instance.jexcel.setStyle(col1, "background-color", "yellow");
                    instance.jexcel.setComments(col1, 'Please enter valid date');
                } else {
                    instance.jexcel.setStyle(col1, "background-color", "transparent");
                    instance.jexcel.setComments(col1, "");
                }
            }
            // this.state.modelingEl.setValueFromCoords(4, y, '', true);
        }

        // Stop date
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            var diff = moment(stopDate).diff(moment(startDate), 'months');
            if (value == "") {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setStyle(col, "background-color", "yellow");
                instance.jexcel.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            else if (diff <= 0) {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setStyle(col, "background-color", "yellow");
                instance.jexcel.setComments(col, 'Please enter valid date');
            }
            else {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setComments(col, "");
            }
        }
        var elInstance = this.state.modelingEl;
        var rowData = elInstance.getRowData(y);
        console.log("modelingTypeId-3--", rowData[2])
        if (rowData[2] != "") {
            var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL;
            var monthDifference = moment(stopDate).diff(startDate, 'months', true);
            var nodeValue = this.state.currentScenario.calculatedDataValue;
            var calculatedChangeForMonth;
            // Monthly change %
            if (x == 5 && rowData[2] != 2) {
                var col = ("F").concat(parseInt(y) + 1);
                value = value.toString().replaceAll(",", "").split("%")[0];
                if (value == "") {
                    instance.jexcel.setStyle(col, "background-color", "transparent");
                    instance.jexcel.setStyle(col, "background-color", "yellow");
                    instance.jexcel.setComments(col, i18n.t('static.label.fieldRequired'));
                }
                else if (!(reg.test(value))) {
                    instance.jexcel.setStyle(col, "background-color", "transparent");
                    instance.jexcel.setStyle(col, "background-color", "yellow");
                    instance.jexcel.setComments(col, i18n.t('static.message.invalidnumber'));
                }
                else {
                    instance.jexcel.setStyle(col, "background-color", "transparent");
                    instance.jexcel.setComments(col, "");
                    if (rowData[2] != 5) {
                        calculatedChangeForMonth = parseFloat((nodeValue * value) / 100).toFixed(4);
                    } else {
                        calculatedChangeForMonth = parseFloat(value).toFixed(4);
                    }
                    this.state.modelingEl.setValueFromCoords(8, y, calculatedChangeForMonth, true);
                }
            }
            if (x == 2 && rowData[2] != 2 && rowData[5] != "") {
                instance.jexcel.setStyle(col, "background-color", "transparent");
                instance.jexcel.setComments(col, "");
                if (rowData[2] != 5) {
                    calculatedChangeForMonth = parseFloat((nodeValue * rowData[5]) / 100).toFixed(4);
                } else {
                    calculatedChangeForMonth = parseFloat(rowData[5]).toFixed();
                }
                this.state.modelingEl.setValueFromCoords(8, y, calculatedChangeForMonth, true);
            }
            // Monthly change #
            if (x == 6 && rowData[2] == 2) {
                var col = ("G").concat(parseInt(y) + 1);
                var reg = JEXCEL_DECIMAL_MONTHLY_CHANGE_4_DECIMAL;
                console.log("value monthly change #---", value);
                value = value.toString().replaceAll(",", "");
                if (value == "") {
                    instance.jexcel.setStyle(col, "background-color", "transparent");
                    instance.jexcel.setStyle(col, "background-color", "yellow");
                    instance.jexcel.setComments(col, i18n.t('static.label.fieldRequired'));
                }
                else if (!(reg.test(value))) {
                    instance.jexcel.setStyle(col, "background-color", "transparent");
                    instance.jexcel.setStyle(col, "background-color", "yellow");
                    instance.jexcel.setComments(col, i18n.t('static.message.invalidnumber'));
                }
                else {
                    instance.jexcel.setStyle(col, "background-color", "transparent");
                    instance.jexcel.setComments(col, "");
                    this.state.modelingEl.setValueFromCoords(8, y, value, true);
                }
            }
        }
        if (x != 10) {
            instance.jexcel.setValueFromCoords(10, y, 1, true);
            this.setState({ isChanged: true });
        }
        this.calculateScalingTotal();
    }.bind(this);
    loadedMom = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance, 1);
        if (instance.jexcel.getJson(null, false).length > 0) {
            var cell = instance.jexcel.getCell("E1");
            cell.classList.add('readonly');
            var cell = instance.jexcel.getCell("F1");
            cell.classList.add('readonly');
        }
    }

    addRow = function () {
        var elInstance = this.state.modelingEl;
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = this.state.currentItemConfig.context.payload.nodeType.id == PERCENTAGE_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == FU_NODE_ID || this.state.currentItemConfig.context.payload.nodeType.id == PU_NODE_ID ? 5 : '';
        data[3] = moment(this.state.currentScenario.month).startOf('month').add(1, 'months').format("YYYY-MM-DD");
        data[4] = this.state.maxMonth;
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
            if (type == 4) {
                var result = false;
                if (itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].nodeDataModelingList.length > 0) {
                    result = true;
                } else {
                    var arr = this.state.items.filter(x => x.level == itemConfig.level && x.id != itemConfig.id && x.id < itemConfig.id);
                    if (arr.length > 0) {
                        for (var i = 0; i <= arr.length; i++) {
                            if (arr[i] != null) {
                                console.log("arr[i]---", arr[i])
                                var nodeDataModelingList = arr[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataModelingList;
                                if (nodeDataModelingList.length > 0) {
                                    var nodedata = nodeDataModelingList.filter(x => x.transferNodeDataId == itemConfig.id)[0];
                                    if (nodedata != null && nodedata != "") {
                                        result = true;
                                        break;
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
                        console.log("get payload 1--->", (itemConfig.payload.nodeDataMap[scenarioId])[0]);
                        console.log("get payload 1--->>>", (itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue);
                        return addCommasTwoDecimal((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue);
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
                            return addCommasTwoDecimal((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue) + "% of parent, " + ((itemConfig.payload.nodeDataMap[scenarioId])[0].fuPerMonth < 0.01 ? addCommasThreeDecimal((itemConfig.payload.nodeDataMap[scenarioId])[0].fuPerMonth) : addCommasTwoDecimal((itemConfig.payload.nodeDataMap[scenarioId])[0].fuPerMonth)) + "/" + 'Month';

                        } else if (itemConfig.payload.nodeType.id == 5) {
                            console.log("payload get puNode---", (itemConfig.payload.nodeDataMap[scenarioId])[0]);
                            return addCommasTwoDecimal((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue) + "% of parent, conversion = " + (itemConfig.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.multiplier;
                        } else {
                            return addCommasTwoDecimal((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue) + "% of parent";
                        }

                    } else if (type == 3) {
                        console.log("get payload 6");
                        var childList = this.state.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                        console.log("Child List my+++", childList);
                        if (childList.length > 0) {
                            var sum = 0;
                            childList.map(c => {
                                console.log("childList 2---", childList);
                                // console.log("child scenarioId 2---",(c.payload.nodeDataMap[scenarioId])[0] != null);
                                console.log("child 2---", c.payload.label.label_en, "map---", c.payload);
                                sum += Number(c.payload.nodeDataMap.hasOwnProperty(scenarioId) ? (c.payload.nodeDataMap[scenarioId])[0].displayDataValue : 0)
                            })
                            return sum.toFixed(2);
                        } else {
                            console.log("get payload 7");
                            return "";
                        }
                    } else {
                        console.log("get payload 8");
                        return "= " + ((itemConfig.payload.nodeDataMap[scenarioId])[0].displayCalculatedDataValue != null ? addCommasTwoDecimal((itemConfig.payload.nodeDataMap[scenarioId])[0].displayCalculatedDataValue) : "");
                    }
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

    toggle() {
        this.setState({
            popoverOpen: !this.state.popoverOpen,
        });
    }

    getDatasetList() {
        console.log("get dataset list program id---", this.state.programId);
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
                // console.log("length---", this.state.programId != null ? "hi" : "hello");
                this.setState({
                    datasetList: myResult,
                    programId: this.state.programId != null ? this.state.programId : (myResult.length == 1 ? myResult[0].id : "")
                }, () => {
                    console.log("my datasetList --->", this.state.datasetList);
                    console.log("my datasetList program--->", this.state.programId);
                    var dataSetObj = this.state.datasetList.filter(c => c.id == this.state.programId)[0];
                    console.log("dataSetObj---", dataSetObj);
                    if (dataSetObj != null) {
                        var dataEnc = JSON.parse(JSON.stringify(dataSetObj));

                        var databytes = CryptoJS.AES.decrypt(dataSetObj.programData, SECRET_KEY);
                        console.log("decryptedDataset---", databytes);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                        dataEnc.programData = programData;
                        var minDate = { year: new Date(programData.currentVersion.forecastStartDate).getFullYear(), month: new Date(programData.currentVersion.forecastStartDate).getMonth() + 1 };
                        var maxDate = { year: new Date(programData.currentVersion.forecastStopDate).getFullYear(), month: new Date(programData.currentVersion.forecastStopDate).getMonth() + 1 };
                        var forecastPeriod = moment(programData.currentVersion.forecastStartDate).format(`MMM-YYYY`) + " ~ " + moment(programData.currentVersion.forecastStopDate).format(`MMM-YYYY`);
                        console.log("forecastPeriod 1---", forecastPeriod);
                        console.log("dataSetObj.programData***>>>", dataEnc);
                        this.setState({
                            dataSetObj: dataEnc, minDate, maxDate,
                            forecastStartDate: programData.currentVersion.forecastStartDate,
                            forecastStopDate: programData.currentVersion.forecastStopDate, forecastPeriod,
                            singleValue2: { year: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getFullYear(), month: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getMonth() + 1 },
                        }, () => {
                            this.fetchTracerCategoryList(programData);
                            this.setState({ loading: false })
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
        let treeLevel = this.state.items.length;
        var treeLevelItems = [];
        var treeLevels = this.state.curTreeObj.forecastMethod.id != "" ? this.state.curTreeObj.levelList : [];
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
            console.log("level json***", treeLevelItems);
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
            e.scenarioId = this.state.selectedScenario
            e.showModelingValidation = this.state.showModelingValidation
            console.log("1------------------->>>>", this.getPayloadData(items1[i], 4))
            console.log("2------------------->>>>", this.getPayloadData(items1[i], 3))
            e.result = this.getPayloadData(items1[i], 4)
            var text = this.getPayloadData(items1[i], 3)
            e.text = text;
            newItems.push(e)
        }
        console.log("newItems---", newItems);
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
            .text(getLabelText(this.state.dataSetObj.programData.label, this.state.lang), 30, 85);

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
            .text("Display Date(Forecast: " + this.state.forecastPeriod + ")" + ': ' + this.makeText(this.state.singleValue2), 30, 145);


        sampleChart.draw(doc, 60, 180);

        doc.restore();

        doc.end();

        if (typeof stream !== 'undefined') {
            // var nodeUnit = document.getElementById("nodeUnitId");
            // var selectedText = nodeUnit.options[nodeUnit.selectedIndex].text;
            stream.on('finish', function () {
                var string = stream.toBlob('application/pdf');
                window.saveAs(string, this.state.dataSetObj.programData.programCode + "-" + i18n.t("static.supplyPlan.v") + this.state.dataSetObj.programData.currentVersion.versionId + "-" + i18n.t('static.common.managetree') + "-" + document.getElementById("treeId").selectedOptions[0].text + "-" + document.getElementById("scenarioId").selectedOptions[0].text + ".pdf");
            }.bind(this));
        } else {
            alert('Error: Failed to create file stream.');
        }

    }
    handleRegionChange = (regionIds) => {
        console.log("regionIds---", regionIds);
        const { curTreeObj } = this.state;

        this.setState({
            regionValues: regionIds.map(ele => ele),
            regionLabels: regionIds.map(ele => ele.label),
            isChanged: true
        }, () => {
            console.log("regionValues---", this.state.regionValues);
            console.log("regionLabels---", this.state.regionLabels);
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
            curTreeObj.regionList = regionList;
            this.setState({ curTreeObj });
            // }
        })
    }

    handleFUChange = (regionIds) => {
        console.log("regionIds---", regionIds);
        const { currentItemConfig } = this.state;

        this.setState({
            fuValues: regionIds != null ? regionIds : "",
            isChanged: true
            // fuLabels: regionIds != null ? regionIds.label : ""
        }, () => {
            if (regionIds != null) {
                currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.id = regionIds.value;
                currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.label.label_en = regionIds.label.split("|")[0];
                if (currentItemConfig.context.payload.label.label_en == "" || currentItemConfig.context.payload.label.label_en == null) {
                    currentItemConfig.context.payload.label.label_en = (regionIds.label.split("|")[0]).trim();
                }
                // var filteredPlanningUnitList = this.state.planningUnitList.filter(x => x.forecastingUnit.id == regionIds.value);
                this.setState({ showFUValidation: false }, () => {
                    this.getForecastingUnitUnitByFUId(regionIds.value);
                    this.getPlanningUnitListByFUId(regionIds.value);
                });
            } else {
                currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.id = "";
                currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.label.label_en = "";
                // currentItemConfig.context.payload.label.label_en = "";
                this.setState({ showFUValidation: true, planningUnitList: [] });
            }
            // this.getPlanningUnitListByFUId(regionIds.value);
            console.log("regionValues---", this.state.fuValues);
            console.log("regionLabels---", this.state.fuLabels);
            // if ((this.state.regionValues).length > 0) {
            // var fuList = [];
            // var fus = this.state.fuValues;
            // console.log("fus---", fus)
            // for (let i = 0; i < fus.length; i++) {
            //     var json = {
            //         id: fus[i].value,
            //         label: {
            //             label_en: fus[i].label
            //         }
            //     }
            //     fuList.push(json);
            // }
            // console.log("final fuList---", fuList);
            // curTreeObj.regionList = regionList;
            this.setState({ currentItemConfig });
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
                console.log("tempTree template---", tempTree);
                this.setState({
                    treeData,
                    treeId,
                    treeTemplateObj: tempTree
                }, () => {
                    this.getTreeByTreeId(treeId);
                    // this.updateTreeData(moment(new Date()).format("YYYY-MM-DD"));
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
            var regionValues = (curTreeObj.regionList) != null && (curTreeObj.regionList).map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

            }, this);
            console.log("regionValues--->>>>", regionValues);
            this.setState({
                curTreeObj,
                scenarioList: curTreeObj.scenarioList.filter(x => x.active == true),
                regionValues
                // selectedScenario:0
            }, () => {
                if (curTreeObj.scenarioList.length == 1) {
                    // this.setState({ selectedScenario: curTreeObj.scenarioList[0].id })

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
                } else if (this.props.match.params.scenarioId != null && this.props.match.params.scenarioId != "") {
                    var scenarioId = this.props.match.params.scenarioId;
                    var selectedText = curTreeObj.scenarioList.filter(x => x.id == scenarioId)[0].label.label_en;
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
                curTreeObj: {
                    forecastMethod: { id: "" },
                    label: { label_en: '' },
                    notes: '',
                    regionList: [],
                    active: true
                },
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
                    this.setState({
                        singleValue2: { year: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getFullYear(), month: new Date(programData.currentVersion.forecastStartDate.replace(/-/g, '\/')).getMonth() + 1 }
                    })
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
        var pu = (this.state.updatedPlanningUnitList.filter(c => c.planningUnitId == planningUnitId))[0];
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
        var maxNodeId = items.length > 0 ? Math.max(...items.map(o => o.id)) : 0;
        var nodeId = parseInt(maxNodeId + 1);
        var newItem = {
            id: nodeId,
            level: itemConfig.level,
            parent: itemConfig.parent,
            payload: itemConfig.payload
        };
        newItem.payload.nodeId = nodeId;
        var parentSortOrder = items.filter(c => c.id == itemConfig.parent)[0].sortOrder;
        var childList = items.filter(c => c.parent == itemConfig.parent);
        newItem.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(childList.length) + 1)).slice(-2));
        // (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataId = this.getMaxNodeDataId();
        var scenarioList = this.state.scenarioList;
        if (scenarioList.length > 0) {
            for (let i = 0; i < scenarioList.length; i++) {
                (newItem.payload.nodeDataMap[scenarioList[i].id])[0].nodeDataId = this.getMaxNodeDataId();
                // var tempArray = [];
                // var nodeDataMap = {};
                // tempArray.push(JSON.parse(JSON.stringify((newItem.payload.nodeDataMap[this.state.selectedScenario])[0])));
                // console.log("tempArray---", tempArray);
                // nodeDataMap = newItem.payload.nodeDataMap;
                // tempArray[0].nodeDataId = this.getMaxNodeDataId();
                // nodeDataMap[scenarioList[i].id] = tempArray;
                // // nodeDataMap[scenarioList[i].id][0].nodeDataId = scenarioList[i].id;
                // newItem.payload.nodeDataMap = nodeDataMap;
                // (newItem.payload.nodeDataMap[scenarioList[i].id])[0] = (newItem.payload.nodeDataMap[this.state.selectedScenario]);
            }
        }
        console.log("duplicate button clicked value after update---", newItem);
        this.setState({
            items: [...items, newItem],
            cursorItem: nodeId
        }, () => {
            console.log("on add items-------", this.state.items);
            this.calculateMOMData(newItem.id, 0);
            // this.calculateValuesForAggregateNode(this.state.items);
        });
    }
    cancelClicked() {
        this.props.history.push(`/dataset/listTree/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }


    getPlanningUnitListByFUId(forecastingUnitId) {
        console.log("forecastingUnitId--->>>>>>>&&&>", forecastingUnitId);
        console.log("pl unit---", this.state.updatedPlanningUnitList);
        var planningUnitList = this.state.updatedPlanningUnitList.filter(x => x.forecastingUnit.id == forecastingUnitId);
        this.setState({
            planningUnitList,
            tempPlanningUnitId: planningUnitList.length == 1 ? planningUnitList[0].id : "",
        }, () => {
            console.log("filtered planning unit list---", this.state.planningUnitList);
            console.log("filtered planning unit list tempPlanningUnitId---", this.state.tempPlanningUnitId);
            if (this.state.planningUnitList.length == 1) {
                var { currentItemConfig } = this.state;
                console.log("pl 1---");
                if ((currentItemConfig.context.payload.nodeType.id == 4 && !this.state.addNodeFlag) || (currentItemConfig.context.payload.nodeType.id == 5 && this.state.addNodeFlag)) {
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id = this.state.planningUnitList[0].id;
                    console.log("pl 2---");
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.label = this.state.planningUnitList[0].label;
                    console.log("pl 3---");
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.multiplier = this.state.planningUnitList[0].multiplier;
                    console.log("pl 4---");
                    currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.unit.id = this.state.planningUnitList[0].unit.id;
                    console.log("pl 5---");
                    if (this.state.addNodeFlag && currentItemConfig.context.payload.nodeType.id == 5) {
                        console.log("pl 6---");
                        currentItemConfig.context.payload.label = this.state.planningUnitList[0].label;
                    }
                    console.log("pl 7---");
                    this.setState({
                        conversionFactor: this.state.planningUnitList[0].multiplier,
                        currentItemConfig,
                        currentScenario: currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0]
                    });
                }
            }
            if (this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario].puNode != null) {
                console.log("test---", this.state.currentItemConfig.context.payload);
                // (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.id
                var conversionFactor = this.state.updatedPlanningUnitList.filter(x => x.id == this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id)[0].multiplier;
                console.log("conversionFactor---", conversionFactor);
                this.setState({
                    conversionFactor
                }, () => {
                    this.getUsageText();
                });
            }
            // else if (type == 1) {
            //     if (this.state.planningUnitList.length == 1) {
            //         console.log("node data pu---", this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario]);
            //         var pu = (this.state.planningUnitList)[0];
            //         console.log("node data pu list---", pu);
            //         var puNode = {
            //             planningUnit: {
            //                 id: pu.id,
            //                 unit: {
            //                     id: pu.unit.id
            //                 },
            //                 multiplier: pu.multiplier,
            //                 refillMonths : ''
            //             }
            //         }
            //         this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario].puNode = puNode;
            //         console.log("final node data---",this.state.currentItemConfig.context.payload)
            //     }
            // }
        });

    }

    getForecastingUnitUnitByFUId(forecastingUnitId) {
        console.log("forecastingUnitId---", forecastingUnitId);
        console.log("%%%this.state.forecastingUnitList---", this.state.forecastingUnitList);
        const { currentItemConfig } = this.state;
        var forecastingUnit = (this.state.forecastingUnitList.filter(c => c.id == forecastingUnitId));
        if (forecastingUnit.length > 0) {
            console.log("forecastingUnit---", forecastingUnit);
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.unit.id = forecastingUnit[0].unit.id;
            console.log("currentItemConfig---", currentItemConfig);
            console.log("state items---", this.state.items);
        }
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
        id = this.state.currentItemConfig.parentItem.payload.nodeUnit.id;
        this.setState({
            usageTypeParent: id
        }, () => {
            console.log("parent unit id===", this.state.usageTypeParent);
        });
    }

    copyDataFromUsageTemplate(event) {
        var usageTemplate = (this.state.usageTemplateList.filter(c => c.usageTemplateId == event.target.value))[0];
        console.log("usageTemplate---", usageTemplate);
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
        // for (var i = 0; i < newResult.length; i++) {
        // var autocompleteData = [{ value: usageTemplate.forecastingUnit.id, label: usageTemplate.forecastingUnit.id + "|" + getLabelText(usageTemplate.forecastingUnit.label, this.state.lang) }]
        // }


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
            console.log("copy from template---", this.state.currentScenario);
            this.getForecastingUnitListByTracerCategoryId(0);
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
        var repeatUsagePeriodId;
        var oneTimeUsage;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency;
            console.log("usageFrequency---", usageFrequency);
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage;
            }
        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency;
            console.log("usageFrequency---", usageFrequency);
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage;
            }
        }
        console.log("usagePeriodId dis---", usagePeriodId);
        var noOfMonthsInUsagePeriod = 0;
        if ((usagePeriodId != null && usagePeriodId != "") && (usageTypeId == 2 || (oneTimeUsage == "false" || oneTimeUsage == false))) {
            console.log("inside if no fu");
            var convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
            console.log("convertToMonth dis---", convertToMonth);
            console.log("repeat count---", (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount);
            console.log("no of month dis---", this.getNoOfMonthsInUsagePeriod());

            if (usageTypeId == 2) {
                var div = (convertToMonth * usageFrequency);
                console.log("duv---", div);
                if (div != 0) {
                    noOfMonthsInUsagePeriod = usageFrequency / convertToMonth;
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

            console.log("repeat count a---", (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount);
            console.log("convert to month a---", convertToMonth);
            console.log("noOfMonthsInUsagePeriod a---", noOfMonthsInUsagePeriod);
            if (oneTimeUsage != "true" && oneTimeUsage != true && usageTypeId == 1) {
                console.log("(this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode---", (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode);
                repeatUsagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatUsagePeriod.usagePeriodId;
                console.log("repeatUsagePeriodId for calc---", repeatUsagePeriodId);
                if (repeatUsagePeriodId != "") {
                    convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == repeatUsagePeriodId))[0].convertToMonth;
                } else {
                    convertToMonth = 0;
                }
            }
            var noFURequired = oneTimeUsage != "true" && oneTimeUsage != true ? ((this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
            console.log("noFURequired---", noFURequired);

        } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
            console.log("inside else if no fu");
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                noFURequired = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson;
            } else {
                console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode);
                noFURequired = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson;
            }
            // noOfMonthsInUsagePeriod = noOfFUPatient;
        }
        this.setState({
            noFURequired: (noFURequired != "" && noFURequired != 0 ? Math.round(noFURequired) : 0)
        });
    }

    getNoOfMonthsInUsagePeriod() {
        var usagePeriodId;
        var usageTypeId;
        var usageFrequency;
        var nodeTypeId = this.state.currentItemConfig.context.payload.nodeType.id;
        var scenarioId = this.state.selectedScenario;
        var oneTimeUsage;
        if (nodeTypeId == 5) {
            usageTypeId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency;
            console.log("usageFrequency---", usageFrequency);
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage;
            }
        } else {
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id;
            console.log("usageTypeId---", usageTypeId);
            usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usagePeriod.usagePeriodId;
            console.log("usagePeriodId---", usagePeriodId);
            usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency;
            console.log("usageFrequency---", usageFrequency);
            if (usageTypeId == 1) {
                oneTimeUsage = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.oneTimeUsage;
            }
        }
        var noOfMonthsInUsagePeriod = 0;
        if (usagePeriodId != null && usagePeriodId != "") {
            var convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
            console.log("convertToMonth---", convertToMonth);
            if (usageTypeId == 2) {
                var div = (convertToMonth * usageFrequency);
                console.log("duv---", div);
                if (div != 0) {
                    // noOfMonthsInUsagePeriod = 1 / (convertToMonth * usageFrequency);
                    noOfMonthsInUsagePeriod = usageFrequency / convertToMonth;
                    console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
                }
            } else {
                // var noOfFUPatient = this.state.noOfFUPatient;
                var noOfFUPatient;
                if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                    console.log("no of persons---", (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons);
                    console.log("no of noOfForecastingUnitsPerPerson---", (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson);
                    noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
                    console.log("noOfFUPatient---", noOfFUPatient);
                } else {
                    console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode);
                    noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
                }
                console.log("no of fu patient---", noOfFUPatient);
                noOfMonthsInUsagePeriod = oneTimeUsage != "true" ? convertToMonth * usageFrequency * noOfFUPatient : noOfFUPatient;
                console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
            }
        } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {
                noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
            } else {
                console.log("--->>>>>>>>>>>>>>>>>>>>>>>>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode);
                noOfFUPatient = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons;
            }
            noOfMonthsInUsagePeriod = noOfFUPatient;
        }
        this.setState({
            noOfMonthsInUsagePeriod: noOfMonthsInUsagePeriod
        }, () => {
            console.log("noOfMonthsInUsagePeriod---", this.state.noOfMonthsInUsagePeriod);
        });
    }
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
                noOfPersons = this.state.currentScenario.fuNode.noOfPersons;
                noOfForecastingUnitsPerPerson = this.state.currentScenario.fuNode.noOfForecastingUnitsPerPerson;
                usageFrequency = this.state.currentScenario.fuNode.usageFrequency;

                if (this.state.addNodeFlag) {
                    var usageTypeParent = document.getElementById("usageTypeParent");
                    selectedText = usageTypeParent.options[usageTypeParent.selectedIndex].text;
                } else {
                    // take everything from object
                    console.log(">>>>", this.state.currentItemConfig);
                    // selectedText = this.state.currentItemConfig.parentItem.payload.nodeUnit.label.label_en;
                    selectedText = this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.parentItem.payload.nodeUnit.id)[0].label.label_en;
                }

                if (this.state.addNodeFlag) {
                    var forecastingUnitUnit = document.getElementById("forecastingUnitUnit");
                    selectedText1 = forecastingUnitUnit.options[forecastingUnitUnit.selectedIndex].text;
                } else {
                    selectedText1 = this.state.unitList.filter(c => c.unitId == this.state.currentScenario.fuNode.forecastingUnit.unit.id)[0].label.label_en;
                }




                if (this.state.currentScenario.fuNode.usageType.id == 2 || (this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true)) {
                    console.log("this.state.currentScenario.fuNode---", this.state.currentScenario.fuNode);
                    // if (this.state.addNodeFlag) {
                    selectedText2 = this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentScenario.fuNode.usagePeriod.usagePeriodId)[0].label.label_en;
                    // }
                }
            }
            // FU
            if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {

                if (this.state.currentScenario.fuNode.usageType.id == 1) {
                    console.log("selected text 3 1---", this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true);
                    if (this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true) {
                        console.log("selected text 3 2---", this.state.currentScenario.fuNode.repeatUsagePeriod.usagePeriodId);
                        var selectedText3 = this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentScenario.fuNode.repeatUsagePeriod.usagePeriodId)[0].label.label_en;

                        usageText = i18n.t('static.usageTemplate.every') + " " + noOfPersons + " " + selectedText + " " + i18n.t('static.usageTemplate.requires') + " " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s), " + " " + usageFrequency + " " + i18n.t('static.tree.timesPer') + " " + selectedText2 + " " + i18n.t('static.tree.for') + " " + (this.state.currentScenario.fuNode.repeatCount != null ? this.state.currentScenario.fuNode.repeatCount : '') + " " + selectedText3;
                    } else {
                        console.log("selected text 3 1---");
                        usageText = i18n.t('static.usageTemplate.every') + " " + noOfPersons + " " + selectedText + " " + i18n.t('static.usageTemplate.requires') + " " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s)";
                    }
                } else {
                    usageText = i18n.t('static.usageTemplate.every') + " " + noOfPersons + " " + selectedText + "" + i18n.t('static.usageTemplate.requires') + " " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s) " + i18n.t('static.usageTemplate.every') + " " + usageFrequency + " " + selectedText2 + " indefinitely";
                }
            } else {
                //PU
                console.log("pu>>>", this.state.currentItemConfig);
                console.log("puList>>>", this.state.currentItemConfig.parentItem.parent);
                if (this.state.currentScenario.puNode.planningUnit.id != null && this.state.currentScenario.puNode.planningUnit.id != "") {
                    var nodeUnitTxt = this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en;
                    if (this.state.addNodeFlag) {
                        var planningUnitId = document.getElementById("planningUnitId");
                        var planningUnit = planningUnitId.options[planningUnitId.selectedIndex].text;
                    } else {
                        var planningUnit = this.state.updatedPlanningUnitList.filter(c => c.id == this.state.currentScenario.puNode.planningUnit.id)[0].label.label_en;
                    }
                    if ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 1) {
                        var sharePu;
                        if (this.state.currentScenario.puNode.sharePlanningUnit == "true") {
                            sharePu = (this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor);
                        } else {
                            sharePu = Math.round((this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor));
                        }
                        usageText = i18n.t('static.tree.forEach') + " " + nodeUnitTxt + " " + i18n.t('static.tree.weNeed') + " " + sharePu + " " + planningUnit;
                    } else {
                        // need grand parent here 
                        // console.log("1>>>", (this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfForecastingUnitsPerPerson);
                        // console.log("2>>>", this.state.noOfMonthsInUsagePeriod);
                        // console.log("3>>>", this.state.conversionFactor);
                        // console.log("4>>>", this.state.currentScenario.puNode.refillMonths);
                        var puPerInterval = ((((this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / this.state.conversionFactor) * this.state.currentScenario.puNode.refillMonths);
                        usageText = i18n.t('static.tree.forEach') + " " + nodeUnitTxt + " " + i18n.t('static.tree.weNeed') + " " + addCommas(puPerInterval) + " " + planningUnit + " " + i18n.t('static.usageTemplate.every') + " " + this.state.currentScenario.puNode.refillMonths + " " + i18n.t('static.report.month');
                    }
                } else {
                    usageText = "";
                }
            }
        } catch (err) {
            console.log("Error occured while building usage text---", err);
        }
        finally {
            this.setState({
                usageText
            }, () => {
                console.log("usage text---", this.state.usageText);
            });
        }

    }
    getForecastingUnitListByTracerCategoryId(type) {
        var scenarioId = this.state.selectedScenario;
        console.log("my tracer category---", this.state.currentItemConfig.context.payload.nodeDataMap[scenarioId][0])
        console.log("this.state.currentScenario---", this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id);
        var tracerCategoryId = this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id;
        console.log("my tracerCategoryId for test1---", tracerCategoryId)
        var forecastingUnitList = this.state.forecastingUnitList;
        console.log("my tracerCategoryId for test2---", forecastingUnitList)
        var filteredForecastingUnitList = tracerCategoryId != "" ? this.state.forecastingUnitList.filter(x => x.tracerCategory.id == tracerCategoryId) : forecastingUnitList;
        console.log("my tracerCategoryId for test3---", filteredForecastingUnitList)
        // var autocompleteData = [];
        // for (var i = 0; i < forecastingUnitList.length; i++) {
        //     autocompleteData[i] = { value: forecastingUnitList[i].id, label: forecastingUnitList[i].id + "|" + getLabelText(forecastingUnitList[i].label, this.state.lang) }
        // }

        let forecastingUnitMultiList = filteredForecastingUnitList.length > 0
            && filteredForecastingUnitList.map((item, i) => {
                return ({ value: item.id, label: getLabelText(item.label, this.state.lang) + " | " + item.id })

            }, this);

        this.setState({
            forecastingUnitMultiList,
            fuValues: tracerCategoryId == "" || tracerCategoryId == undefined ? [] : (this.state.currentScenario.fuNode.forecastingUnit.id != undefined && this.state.currentScenario.fuNode.forecastingUnit.id != "" && filteredForecastingUnitList.filter(x => x.id == this.state.currentScenario.fuNode.forecastingUnit.id).length > 0 ? { value: this.state.currentScenario.fuNode.forecastingUnit.id, label: getLabelText(this.state.currentScenario.fuNode.forecastingUnit.label, this.state.lang) + " | " + this.state.currentScenario.fuNode.forecastingUnit.id } : []),
            tempPlanningUnitId: tracerCategoryId == "" || tracerCategoryId == undefined ? '' : this.state.tempPlanningUnitId,
            planningUnitList: tracerCategoryId == "" || tracerCategoryId == undefined ? [] : this.state.planningUnitList
        }, () => {
            console.log("my autocomplete data fuValues---", filteredForecastingUnitList);
            if (filteredForecastingUnitList.length == 1) {
                console.log("fu list 1---", forecastingUnitList[0]);
                const currentItemConfig = this.state.currentItemConfig;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.id = filteredForecastingUnitList[0].id;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.label = filteredForecastingUnitList[0].label;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.tracerCategory.id = filteredForecastingUnitList[0].tracerCategory.id;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.unit.id = filteredForecastingUnitList[0].unit.id;

                // var filteredPlanningUnitList = this.state.planningUnitList.filter(x => x.forecastingUnit.id == filteredForecastingUnitList[0].id);
                this.setState({
                    currentItemConfig: currentItemConfig,
                    currentScenario: (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0]
                }, () => {
                    if (type == 0) {
                        console.log("my take 1---", filteredForecastingUnitList[0]);
                        var fuValues = { value: filteredForecastingUnitList[0].id, label: getLabelText(filteredForecastingUnitList[0].label, this.state.lang) + " | " + filteredForecastingUnitList[0].id };
                        console.log("before cur item config fuValues--- ", this.state.fuValues);
                        console.log("before 2--- ", fuValues);
                        // (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.unit.id = forecastingUnit[0].unit.id;
                        this.setState({
                            fuValues
                        }, () => {
                            console.log("aftercur item config fuValues--- ", this.state.fuValues);
                        });
                    } else {
                        console.log("type 0 in else");
                    }

                    this.getForecastingUnitUnitByFUId(this.state.fuValues.value);
                    this.getPlanningUnitListByFUId(filteredForecastingUnitList[0].id);
                })
            } else if (this.state.addNodeFlag) {
                this.setState({ planningUnitList: [] });
            }

        });

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
            // if (this.state.hideFUPUNode) {
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
            // }
            arr.push(item);
        }
        this.setState({
            items: arr,
            hidePUNode: e.target.checked
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
            usageFrequencyCon: true,
            usageFrequencyDis: true,
            oneTimeUsage: true,
            // repeatCount: true,
            // repeatUsagePeriodId: true,
            planningUnitId: true,
            refillMonths: true,
            sharePlanningUnit: true,
            forecastingUnitId: true,
            usagePeriodIdCon: true,
            usagePeriodIdDis: true,
            puPerVisit: true,
            planningUnitIdFU: true
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
                console.log("myResult===============2", myResult)
                this.setState({
                    forecastMethodList: myResult.filter(x => x.forecastMethodTypeId == 1)
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
                    unitList: myResult,
                    nodeUnitList: myResult.filter(x => x.dimension.id == TREE_DIMENSION_ID)
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
        console.log("usage template tc---", tracerCategoryId)
        console.log("usage template list all---", this.state.usageTemplateListAll)

        if (tracerCategoryId != "" && tracerCategoryId != null) {
            console.log("usage template if")
            usageTemplateList = this.state.usageTemplateListAll.filter(c => c.tracerCategory.id == tracerCategoryId);
        } else {
            console.log("usage template else")
            usageTemplateList = this.state.usageTemplateListAll;
        }
        this.setState({
            usageTemplateList
        }, () => {
            console.log("usageTemplateList after filter---", this.state.usageTemplateList);
        });
    }

    getUsageTemplateList(fuIdArray) {
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
                console.log("myResult===============6", myResult);
                console.log("fuIdArray---", fuIdArray);
                var usageTemplateListAll = myResult.filter(el => fuIdArray.indexOf(el.forecastingUnit.id) != -1);
                console.log("before usageTemplateList All===============>", usageTemplateListAll)
                console.log("before1 usageTemplateList All===============>", myResult.filter(el => el.forecastingUnit.id == 2665))
                console.log("before2 usageTemplateList All===============>", myResult.filter(el => el.forecastingUnit.id == 915))
                this.setState({
                    usageTemplateListAll
                }, () => {
                    console.log("after usageTemplateList All===============>", this.state.usageTemplateListAll)
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

    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }

    componentDidUpdate = () => {
        if (this.state.isChanged == true) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

    componentDidMount() {
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
            // this.getUsageTemplateList();
            this.getNodeTyeList();
            this.getDatasetList();
            this.getModelingTypeList();
            this.getRegionList();
            // if (this.props.match.params.scenarioId != null && this.props.match.params.scenarioId != "") {
            //     this.callAfterScenarioChange(this.props.match.params.scenarioId);
            // }
        })
    }
    addScenario() {
        const { scenario, curTreeObj } = this.state;
        var scenarioList = this.state.scenarioList;
        var type = this.state.scenarioActionType;
        var items = curTreeObj.tree.flatList;
        var scenarioId;
        var temNodeDataMap = [];
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
                    // tempArray = items[i].payload.nodeDataMap;
                    tempArray.push(JSON.parse(JSON.stringify((items[i].payload.nodeDataMap[minScenarioId])[0])));
                    nodeDataMap = items[i].payload.nodeDataMap;
                    nodeDataMap[scenarioId] = tempArray;
                    // var nodeDataId = this.getMaxNodeDataId(items);
                    // console.log("nodeDataId---", nodeDataId);
                    nodeDataMap[scenarioId][0].nodeDataId = "";
                    items[i].payload.nodeDataMap = nodeDataMap;
                }
                console.log("items-----------%%%%%%", items);
                console.log("tArr---", tArr);

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
            openAddScenarioModal: false,
            isChanged: true
        }, () => {
            console.log("final tab list---", this.state.items);
            if (type == 1) {
                var maxNodeDataId = temNodeDataMap.length > 0 ? Math.max(...temNodeDataMap.map(o => o.nodeDataId)) : 0;
                console.log("scenarioId---", scenarioId);
                for (var i = 0; i < items.length; i++) {
                    maxNodeDataId = parseInt(maxNodeDataId) + 1;
                    (items[i].payload.nodeDataMap[scenarioId])[0].nodeDataId = maxNodeDataId;
                    console.log("my node data id--->", (items[i].payload.nodeDataMap[scenarioId])[0].nodeDataId);
                }
                this.callAfterScenarioChange(scenarioId);
                // this.updateTreeData();
            }
            this.saveTreeData();
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
                aggregationNode: true,
                showFUValidation: true
            }, () => {
                this.getNodeUnitOfPrent();
            });
        }
        var { currentItemConfig } = this.state;
        console.log("inside node type change---", (nodeTypeId == 3 || nodeTypeId == 4 || nodeTypeId == 5) && this.state.addNodeFlag && currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].dataValue == "");
        if ((nodeTypeId == 3 || nodeTypeId == 4 || nodeTypeId == 5) && this.state.addNodeFlag && currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].dataValue == "") {
            currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].dataValue = 100;
            currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue = ((100 * currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue) / 100).toString()
            this.setState({ currentItemConfig, currentScenario: currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0] })
        }
    }

    toggleModal(tabPane, tab) {
        const newArray = this.state.activeTab1.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab1: newArray,
            showCalculatorFields: false
        }, () => {
            if (tab == 3) {
                // this.refs.extrapolationChild.buildJexcel();
                if (this.state.modelingEl != "") {
                    this.state.modelingEl.destroy();
                    if (this.state.momEl != "") {
                        this.state.momEl.destroy();
                    }
                    else if (this.state.momElPer != "") {
                        this.state.momElPer.destroy();
                    }
                }


                this.refs.extrapolationChild.getExtrapolationMethodList();
            }
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
                else {
                    this.setState({
                        showModelingJexcelNumber: true
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
        });
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


        this.setState({ curTreeObj, isChanged: true }, () => {
            console.log("curTreeObj---", curTreeObj);
        });

    }
    dataChange(event) {
        // alert("hi");
        var flag = false;
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
            flag = true;
            this.getUsageText();
        }

        if (event.target.name === "puPerVisit") {
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit = event.target.value;
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

            console.log("event.target.value---", (event.target.value).replaceAll(",", ""));
            var value = (event.target.value).replaceAll(",", "");
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = value;
            this.state.currentScenario.dataValue = value;
            console.log("currentItemConfig.context.payload after$$$", currentItemConfig.context.payload);
            console.log("current scenario$$$", this.state.currentScenario);
            var parentValue;
            if (this.state.addNodeFlag !== "true") {
                parentValue = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
            } else {
                parentValue = (this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
            }
            // console.log("parentValue wihout comma---", (event.target.value * parentValue.toString().replaceAll(",", "")) / 100);

            // (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = (value * parentValue.toString().replaceAll(",", "")) / 100
            // (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = (value * parentValue) / 100
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = ((value * parentValue) / 100).toString()
            console.log("calculatedDataValue---", (value * parentValue) / 100);
            this.setState({
                parentValue: parentValue
            })
        }
        if (event.target.name === "nodeValue") {
            console.log("$$$$-----", (event.target.value).replaceAll(",", ""));
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = (event.target.value).replaceAll(",", "");
            (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue = (event.target.value).replaceAll(",", "");
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
            console.log("currentItemConfig before tc---", currentItemConfig);
            var fuNode = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode;
            // var forecastingUnit = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit;
            // var tracerCategory = {
            //     "id": parseInt(event.target.value),
            //     "label": {
            //         "active": true,
            //         "createdBy": "",
            //         "createdDate": "",
            //         "labelId": "",
            //         "label_en": "",
            //         "label_fr": "",
            //         "label_pr": "",
            //         "label_sp": "",
            //         "lastModifiedBy": "",
            //         "lastModifiedDate": ""
            //     },
            //     "idString": ''
            // }

            // var forecastingUnit = {
            //     "id": fuNode.forecastingUnit.id,
            //     "label": fuNode.forecastingUnit.label,
            //     "unit": fuNode.forecastingUnit.unit,
            //     "tracerCategory": {
            //         "id": parseInt(event.target.value),
            //         "label": {
            //             "active": true,
            //             "createdBy": "",
            //             "createdDate": "",
            //             "labelId": "",
            //             "label_en": "",
            //             "label_fr": "",
            //             "label_pr": "",
            //             "label_sp": "",
            //             "lastModifiedBy": "",
            //             "lastModifiedDate": ""
            //         },
            //         "idString": ''
            //     }
            // }
            // console.log("tracerCategory obj 1---", tracerCategory);
            // // forecastingUnit.tracerCategory = tracerCategory;
            // console.log("tracerCategory obj 2---", forecastingUnit);

            // var value = event.target.value;
            // var forecastingUnit = {
            //     id: fuNode.forecastingUnit.id,
            //     label: fuNode.forecastingUnit.label,
            //     unit: fuNode.forecastingUnit.unit,
            //     tracerCategory: {
            //         id: 6
            //     }
            // }


            // fuNode.forecastingUnit = JSON.parse(JSON.stringify(forecastingUnit));
            // fuNode.forecastingUnit = forecastingUnit;
            // console.log("tracerCategory obj 3---", fuNode);
            // console.log("scenarioId---", scenarioId);

            currentItemConfig.context.payload.nodeDataMap[scenarioId][0].fuNode.forecastingUnit.tracerCategory.id = event.target.value;
            console.log("tracer category on change---", event.target.value);
            console.log("tracer category on change- obj--", currentItemConfig);
            this.filterUsageTemplateList(event.target.value);
        }

        if (event.target.name === "noOfPersons") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons = event.target.value;
            this.getUsageText();
        }

        if (event.target.name === "lagInMonths") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.lagInMonths = event.target.value;
        }



        if (event.target.name === "forecastingUnitPerPersonsFC") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfForecastingUnitsPerPerson = event.target.value;
            if (currentItemConfig.context.payload.nodeType.id == 4 && (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id == 1) {
                this.getNoOfFUPatient();
            }
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
            this.getNoFURequired();
            this.getUsageText();
        }

        if (event.target.name === "repeatCount") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.repeatCount = event.target.value;
            this.getUsageText();
        }

        if (event.target.name === "usageFrequencyCon" || event.target.name === "usageFrequencyDis") {
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.usageFrequency = event.target.value;
            this.getNoOfMonthsInUsagePeriod();
            this.getUsageText();
        }

        if (event.target.name === "usagePeriodIdCon" || event.target.name === "usagePeriodIdDis") {
            var fuNode = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode;
            var usagePeriod = event.target.name === "usagePeriodIdCon" ? document.getElementById("usagePeriodIdCon") : document.getElementById("usagePeriodIdDis");
            var selectedText = usagePeriod.options[usagePeriod.selectedIndex].text;
            console.log("selectedText usage period---", selectedText);
            var usagePeriod = {
                usagePeriodId: event.target.value,
                label: {
                    label_en: selectedText
                }
            }
            fuNode.usagePeriod = usagePeriod;
            (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode = fuNode;
            this.getNoOfMonthsInUsagePeriod();
            this.getUsageText();
        }
        if (event.target.name === "usageTypeIdFU") {
            if (event.target.value == 2 && currentItemConfig.context.payload.nodeType.id == 4) {
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode.noOfPersons = 1;
            }
            var fuNode = (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].fuNode;
            var usageTypeIdFU = document.getElementById("usageTypeIdFU");
            var selectedText = usageTypeIdFU.options[usageTypeIdFU.selectedIndex].text;
            console.log("selectedText usage type---", selectedText);

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
            if (event.target.value != "") {
                var pu = (this.state.planningUnitList.filter(c => c.id == event.target.value))[0];
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.unit.id = pu.unit.id;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.id = event.target.value;
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.multiplier = pu.multiplier;
                currentItemConfig.context.payload.label = pu.label;
            } else {
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.unit.id = '';
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.id = '';
                (currentItemConfig.context.payload.nodeDataMap[scenarioId])[0].puNode.planningUnit.multiplier = '';
                var label = {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: ''
                }
                currentItemConfig.context.payload.label = label;
            }
            this.setState({
                conversionFactor: event.target.value != "" && pu != "" ? pu.multiplier : ''
            }, () => {
                flag = true;
            });
        }

        console.log("anchal 1---", currentItemConfig)
        console.log("anchal 2---", this.state.selectedScenario)
        this.setState({
            currentItemConfig,
            currentScenario: (currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0],
            isChanged: true
        }, () => {
            console.log("after state update---", this.state.currentItemConfig);
            console.log("after state update current scenario---", this.state.currentScenario);
            if (flag) {
                if (event.target.name === "planningUnitId") {
                    this.calculatePUPerVisit(false);
                } else if (event.target.name === "refillMonths") {
                    this.calculatePUPerVisit(true);
                } else { }
            }
        });
    }
    createPUNode(itemConfig, parent) {
        console.log("create PU node---", itemConfig);
        const { items } = this.state;
        var maxNodeId = items.length > 0 ? Math.max(...items.map(o => o.id)) : 0;
        var nodeId = parseInt(maxNodeId + 1);
        var newItem = itemConfig.context;
        newItem.parent = parent;
        newItem.id = nodeId;
        newItem.level = parseInt(itemConfig.context.level + 2);
        newItem.payload.nodeId = nodeId;
        var pu = this.state.planningUnitList.filter(x => x.id == this.state.tempPlanningUnitId)[0];
        newItem.payload.label = pu.label;
        newItem.payload.nodeType.id = 5;
        // newItem.isVisible = this.state.hideFUPUNode || this.state.hidePUNode ? false : true;
        // var parentSortOrder = items.filter(c => c.id == parent)[0].sortOrder;
        // var childList = items.filter(c => c.parent == parent);
        newItem.sortOrder = itemConfig.context.sortOrder.concat(".").concat(("00").slice(-2));
        console.log("pu node month---", (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].month);
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataId = this.getMaxNodeDataId();
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue = 100;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
        // (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].month = moment((newItem.payload.nodeDataMap[this.state.selectedScenario])[0].month).startOf('month').format("YYYY-MM-DD")
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.id = this.state.tempPlanningUnitId;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.label = pu.label;
        try {
            var refillMonths = this.round(parseFloat(pu.multiplier / (itemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)).toFixed(4));
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.refillMonths = refillMonths;
            console.log("AUTO refillMonths---", refillMonths);
            // console.log("PUPERVISIT noOfForecastingUnitsPerPerson---", parentScenario.fuNode.noOfForecastingUnitsPerPerson);
            console.log("AUTO noOfMonthsInUsagePeriod---", this.state.noOfMonthsInUsagePeriod);
            var puPerVisit = this.round(parseFloat(((itemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) * refillMonths) / pu.multiplier).toFixed(4));
            console.log("AUTO puPerVisit---", puPerVisit);
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit = puPerVisit;
        } catch (err) {
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.refillMonths = 1;
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.puPerVisit = "";
        }


        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.sharePlanningUnit = false;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].puNode.planningUnit.multiplier = pu.multiplier;
        // if (itemConfig.context.payload.nodeType.id == 4) {
        //     (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label.label_en = (itemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label.label_en;
        // }
        var scenarioList = this.state.scenarioList.filter(x => x.id != this.state.selectedScenario);
        if (scenarioList.length > 0) {
            for (let i = 0; i < scenarioList.length; i++) {
                var tempArray = [];
                var nodeDataMap = {};
                tempArray.push(JSON.parse(JSON.stringify((newItem.payload.nodeDataMap[this.state.selectedScenario])[0])));
                console.log("tempArray---", tempArray);
                nodeDataMap = newItem.payload.nodeDataMap;
                tempArray[0].nodeDataId = this.getMaxNodeDataId();
                nodeDataMap[scenarioList[i].id] = tempArray;
                // nodeDataMap[scenarioList[i].id][0].nodeDataId = scenarioList[i].id;
                newItem.payload.nodeDataMap = nodeDataMap;
                // (newItem.payload.nodeDataMap[scenarioList[i].id])[0] = (newItem.payload.nodeDataMap[this.state.selectedScenario]);
            }
        }
        console.log("pu node add button clicked value after update---", newItem);
        console.log("pu node add button clicked value after update---", newItem.payload.nodeDataMap.length);
        this.setState({
            items: [...items, newItem],
            cursorItem: nodeId,
            converionFactor: pu.multiplier
        }, () => {

            console.log("on add items-------", this.state.items);
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
    onAddButtonClick(itemConfig) {
        console.log("add button clicked---", itemConfig);
        const { items } = this.state;
        var maxNodeId = items.length > 0 ? Math.max(...items.map(o => o.id)) : 0;
        var nodeId = parseInt(maxNodeId + 1);
        // setTimeout(() => {
        var newItem = itemConfig.context;
        newItem.parent = itemConfig.context.parent;
        newItem.id = nodeId;
        newItem.level = parseInt(itemConfig.context.level + 1);
        newItem.payload.nodeId = nodeId;

        var parentSortOrder = items.filter(c => c.id == itemConfig.context.parent)[0].sortOrder;
        var childList = items.filter(c => c.parent == itemConfig.context.parent);
        newItem.sortOrder = parentSortOrder.concat(".").concat(("0" + (Number(childList.length) + 1)).slice(-2));
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].nodeDataId = this.getMaxNodeDataId();
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].dataValue;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].calculatedDataValue;
        (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].month = moment((newItem.payload.nodeDataMap[this.state.selectedScenario])[0].month).startOf('month').format("YYYY-MM-DD")
        if (itemConfig.context.payload.nodeType.id == 4) {
            (newItem.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label.label_en = (itemConfig.context.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.label.label_en;
        }
        var scenarioList = this.state.scenarioList.filter(x => x.id != this.state.selectedScenario);
        if (scenarioList.length > 0) {
            for (let i = 0; i < scenarioList.length; i++) {
                var tempArray = [];
                var nodeDataMap = {};
                tempArray.push(JSON.parse(JSON.stringify((newItem.payload.nodeDataMap[this.state.selectedScenario])[0])));
                console.log("tempArray---", tempArray);
                nodeDataMap = newItem.payload.nodeDataMap;
                tempArray[0].nodeDataId = this.getMaxNodeDataId();
                nodeDataMap[scenarioList[i].id] = tempArray;
                // nodeDataMap[scenarioList[i].id][0].nodeDataId = scenarioList[i].id;
                newItem.payload.nodeDataMap = nodeDataMap;
                // (newItem.payload.nodeDataMap[scenarioList[i].id])[0] = (newItem.payload.nodeDataMap[this.state.selectedScenario]);
            }
        }
        console.log("add button clicked value after update---", newItem);
        console.log("add button clicked value after update---", newItem.payload.nodeDataMap.length);
        this.setState({
            items: [...items, newItem],
            cursorItem: nodeId,
            isSubmitClicked: false
        }, () => {

            console.log("on add items-------", this.state.items);
            if (itemConfig.context.payload.nodeType.id == 4) {
                this.createPUNode(JSON.parse(JSON.stringify(itemConfig)), nodeId);
            } else {
                if (!itemConfig.context.payload.extrapolation) {
                    this.calculateMOMData(newItem.id, 0);
                } else {
                    this.setState({
                        loading: false
                    })
                }
            }
            // this.calculateValuesForAggregateNode(this.state.items);
        });
        // }, 0);

    }

    calculateValuesForAggregateNode(items) {
        console.log("start>>>", Date.now());
        console.log("start aggregation node>>>", items);
        var getAllAggregationNode = items.filter(c => c.payload.nodeType.id == 1).sort(function (a, b) {
            a = a.id;
            b = b.id;
            return a > b ? -1 : a < b ? 1 : 0;
        }.bind(this));

        console.log("getAllAggregationNode--->", getAllAggregationNode);
        for (var i = 0; i < getAllAggregationNode.length; i++) {
            console.log("getAllAggregationNode[i].id---", getAllAggregationNode[i].id);
            var getChildAggregationNode = items.filter(c => c.parent == getAllAggregationNode[i].id && (c.payload.nodeType.id == 1 || c.payload.nodeType.id == 2))
            console.log(">>>", getChildAggregationNode);
            if (getChildAggregationNode.length > 0) {
                var value = 0;
                for (var m = 0; m < getChildAggregationNode.length; m++) {
                    console.log("getChildAggregationNode[m]---", getChildAggregationNode[m].payload.nodeDataMap[this.state.selectedScenario][0]);
                    var value2 = getChildAggregationNode[m].payload.nodeDataMap[this.state.selectedScenario][0].dataValue != "" ? parseInt(getChildAggregationNode[m].payload.nodeDataMap[this.state.selectedScenario][0].dataValue) : 0;
                    console.log("value2---", value2);
                    value = value + parseInt(value2);
                    console.log("value---", value);
                }

                var findNodeIndex = items.findIndex(n => n.id == getAllAggregationNode[i].id);
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].dataValue = value;
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue = value;

                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].displayDataValue = value;
                items[findNodeIndex].payload.nodeDataMap[this.state.selectedScenario][0].displayCalculatedDataValue = value;

                this.setState({
                    items: items,
                    // openAddNodeModal: false,
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
                    // openAddNodeModal: false,
                }, () => {
                    console.log("updated tree data>>>", this.state);
                });
            }
        }
        console.log("end>>>", Date.now());
    }
    onRemoveButtonClick(itemConfig) {
        var { items } = this.state;
        console.log("delete items---", items)
        // let uniqueChars = [...new Set(items)];
        const ids = items.map(o => o.id)
        const filtered = items.filter(({ id }, index) => !ids.includes(id, index + 1))
        console.log("delete unique items---", filtered)
        items = filtered;
        console.log("delete id---", itemConfig.id)
        console.log("delete items count---", items.filter(x => x.id == itemConfig.id))
        this.setState(this.getDeletedItems(items, [itemConfig.id]), () => {
            setTimeout(() => {
                console.log("delete result---", this.getDeletedItems(items, [itemConfig.id]))
                this.calculateMOMData(0, 0);
            }, 0);
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
        console.log("delete tree deletedItems---", deletedItems)
        console.log("delete tree before---", items)
        console.log("delete tree before 1---", items.filter(x => x.id == 10))
        const tree = this.getTree(items);
        console.log("delete tree---", tree)
        const hash = deletedItems.reduce((agg, itemid) => {
            console.log("delete itemId---", itemid)
            agg.add(itemid.toString());
            return agg;
        }, new Set());
        console.log("delete hash---", hash)
        const cursorParent = this.getDeletedItemsParent(tree, deletedItems, hash);
        console.log("delete cursorParent---", cursorParent)
        const result = [];
        tree.loopLevels(this, (nodeid, node) => {
            console.log("delete nodeid---", nodeid)
            console.log("delete node---", node)
            if (hash.has(nodeid.toString())) {
                console.log("delete inside if")
                return tree.SKIP;
            }
            result.push(node);
        });
        console.log("delete result---", result)
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
        console.log("my notes---", item.title);
        // console.log("data2---", item.id);
        // item.id

        // <Popover placement="top" isOpen={this.state.popoverOpenMa} target="Popover1" trigger="hover" toggle={() => this.toggle('popoverOpenMa', !this.state.popoverOpenMa)}>
        //                                                             <PopoverBody>{i18n.t('static.tooltip.MovingAverages')}</PopoverBody>
        //                                                         </Popover>
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
        console.log("Data@@@", data)
        const { context: item } = data;
        if (item != null) {
            this.setState({
                viewMonthlyData: true,
                usageTemplateId: '',
                sameLevelNodeList: [],
                showCalculatorFields: false,
                showMomData: false,
                showMomDataPercent: false,
                addNodeFlag: false,
                openAddNodeModal: true,
                orgCurrentItemConfig: JSON.parse(JSON.stringify(data.context)),
                currentItemConfig: JSON.parse(JSON.stringify(data)),
                level0: (data.context.level == 0 ? false : true),
                numberNode: (data.context.payload.nodeType.id == 1 || data.context.payload.nodeType.id == 2 ? false : true),
                aggregationNode: (data.context.payload.nodeType.id == 1 ? false : true),
                currentScenario: (data.context.payload.nodeDataMap[this.state.selectedScenario])[0],
                highlightItem: item.id,
                cursorItem: item.id,
                parentScenario: data.context.level == 0 ? [] : (data.parentItem.payload.nodeDataMap[this.state.selectedScenario])[0],

            }, () => {
                console.log("555>>>", this.state.items);
                const ids = this.state.items.map(o => o.id)
                const filtered = this.state.items.filter(({ id }, index) => !ids.includes(id, index + 1))
                console.log("edit unique items---", filtered)
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
                    this.setState({
                        fuValues: { value: this.state.currentScenario.fuNode.forecastingUnit.id, label: getLabelText(this.state.currentScenario.fuNode.forecastingUnit.label, this.state.lang) + " | " + this.state.currentScenario.fuNode.forecastingUnit.id }
                    });
                    this.getForecastingUnitListByTracerCategoryId(1);
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
                    var planningUnit = this.state.updatedPlanningUnitList.filter(x => x.id == this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id);
                    var conversionFactor = planningUnit.length > 0 ? planningUnit[0].multiplier : "";
                    console.log("conversionFactor---", conversionFactor);
                    this.setState({
                        conversionFactor
                    }, () => {
                        this.getUsageText();
                    });
                }

                if (data.context.payload.nodeType.id != 1) {
                    this.getSameLevelNodeList(data.context.level, data.context.id, data.context.payload.nodeType.id);
                }
                // this.setState({

                // })
            })
        }
    };

    updateNodeInfoInJson(currentItemConfig) {
        console.log("update tree node called 1------------", currentItemConfig);
        console.log("update tree node called 2------------", this.state.currentItemConfig);
        var nodes = this.state.items;
        console.log("update tree node called 3------------", nodes);
        var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.context.id);
        console.log("findNodeIndex---", findNodeIndex);
        nodes[findNodeIndex] = currentItemConfig.context;
        console.log("nodes---", nodes);
        this.setState({
            items: nodes,
            isSubmitClicked: false
        }, () => {
            console.log("updated tree data+++", this.state);
            // this.calculateValuesForAggregateNode(this.state.items);
            if (!currentItemConfig.context.payload.extrapolation) {
                this.calculateMOMData(0, 0);
            } else {
                this.setState({
                    loading: false
                })
            }
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
                            labelString: this.state.currentItemConfig.context.payload.nodeUnit.label != null && this.state.currentItemConfig.context.payload.nodeType.id != 1 ? getLabelText(this.state.currentItemConfig.context.payload.nodeUnit.label, this.state.lang) : '',
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
                        // console.log("tooltipItem---", tooltipItem);
                        // console.log("tooltipItem data---", data);
                        // if (tooltipItem.datasetIndex == 1) {
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
                    showInLegend: false,
                    data: this.state.momList.map((item, index) => (item.endValue > 0 ? item.endValue : null))
                }
            )

            bar = {
                labels: [...new Set(this.state.momList.map(ele => (moment(ele.month).format(DATE_FORMAT_CAP_WITHOUT_DATE))))],
                datasets: datasetsArr

            };
        }
        console.log("this.state.currentItemConfig.context.payload.nodeUnit@@@@####", this.state.currentItemConfig.context.payload.nodeUnit);
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
                            // labelString: this.state.currentItemConfig.context.payload.nodeUnit.label != null ? this.state.currentItemConfig.context.payload.nodeType.id > 3 ? getLabelText(this.state.currentItemConfig.parentItem.payload.nodeUnit.label, this.state.lang) : getLabelText(this.state.currentItemConfig.context.payload.nodeUnit.label, this.state.lang) : '',
                            // labelString: this.state.currentItemConfig.context.payload.nodeUnit.label != null ? this.state.currentItemConfig.context.payload.nodeType.id > 3 ? getLabelText(this.state.currentItemConfig.parentItem.payload.nodeUnit.label, this.state.lang) : getLabelText(this.state.currentItemConfig.context.payload.nodeUnit.label, this.state.lang) : '',
                            labelString: this.state.currentItemConfig.context.payload.nodeType.id > 3 ? this.state.currentItemConfig.context.payload.nodeUnit.id != "" ? getLabelText(this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label, this.state.lang) : "" : this.state.currentItemConfig.context.payload.nodeUnit.label != null ? getLabelText(this.state.currentItemConfig.context.payload.nodeUnit.label, this.state.lang) : "",
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
                enabled: false,
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
        if (this.state.momListPer != null && this.state.momListPer.length > 0 && this.state.momElPer != '') {
            console.log("this.state.momElPer.getValue(`G${parseInt(index) + 1}`, true))", this.state.momElPer.getValue(`G${parseInt(2) + 1}`, true))
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
                backgroundColor: '#BA0C2F',
                borderColor: grey,
                pointBackgroundColor: grey,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: grey,
                data: (this.state.momElPer).getJson(null, false).map((item, index) => (this.state.currentItemConfig.context.payload.nodeType.id > 3 ? this.state.momElPer.getValue(`I${parseInt(index) + 1}`, true).toString().replaceAll("\,", "") : this.state.momElPer.getValue(`G${parseInt(index) + 1}`, true).toString().replaceAll("\,", ""))),
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
                            nodeUnitId: this.state.currentItemConfig.context.payload.nodeUnit.id,
                            forecastingUnitId: this.state.fuValues,
                            tempPlanningUnitId: this.state.tempPlanningUnitId
                            // showFUValidation : true
                            // percentageOfParent: (this.state.currentItemConfig.context.payload.nodeDataMap[1])[0].dataValue
                        }}
                        validate={validateNodeData(validationSchemaNodeData)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            console.log("all ok>>>", this.state.currentItemConfig);
                            if (!this.state.isSubmitClicked) {
                                this.setState({ loading: true, openAddNodeModal: false, isSubmitClicked: true }, () => {
                                    setTimeout(() => {
                                        console.log("inside set timeout on submit")
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
                                    <div className="row pt-lg-0" style={{ float: 'right', marginTop: '-42px' }}>
                                        <div className="row pl-lg-0 pr-lg-3">
                                            {/* <SupplyPlanFormulas ref="formulaeChild" /> */}
                                            <a className="">
                                                <span style={{ cursor: 'pointer', color: '20a8d8' }} ><small className="supplyplanformulas">{i18n.t('Show Guidance')}</small></span>

                                            </a>
                                        </div>
                                    </div>
                                    <div>
                                        <Popover placement="top" isOpen={this.state.popoverOpenSenariotree} target="Popover1" trigger="hover" toggle={this.toggleSenariotree}>
                                            <PopoverBody>{i18n.t('static.tooltip.scenario')}</PopoverBody>
                                        </Popover>
                                    </div>
                                    <div className="row">
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.whatIf.scenario')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={this.toggleSenariotree} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                    {/* <Label htmlFor="currencyId">{i18n.t('static.tree.parent')} </Label> */}
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
                                        {/* <FormGroup style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 2 ? "block" : "none" }}>
                                            <div style={{ marginLeft: '34px', marginTop: '8px' }}>
                                                <Input
                                                    className="form-check-input checkboxMargin"
                                                    type="checkbox"
                                                    id="extrapolate"
                                                    name="extrapolate"
                                                    // checked={true}
                                                    checked={this.state.currentItemConfig.context.payload.extrapolation}
                                                    onClick={(e) => { this.extrapolate(e); }}
                                                />
                                                <Label
                                                    className="form-check-label"
                                                    check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                    <b>{'Extrapolate'}</b>
                                                </Label>
                                            </div>
                                        </FormGroup> */}

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
                                        {/* {this.state.currentItemConfig.context.payload.nodeType.id != 1 && */}
                                        <FormGroup className="col-md-6" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                            <Label htmlFor="currencyId">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span></Label>
                                            <div className="controls edit">
                                                <Picker
                                                    id="month"
                                                    name="month"
                                                    ref={this.pickAMonth1}
                                                    years={{ min: this.state.minDateValue, max: this.state.maxDate }}
                                                    // year: new Date(this.state.currentScenario.month).getFullYear(), month: ("0" + (new Date(this.state.currentScenario.month).getMonth() + 1)).slice(-2)
                                                    value={{
                                                        year: new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getMonth() + 1)).slice(-2)
                                                    }}
                                                    lang={pickerLang.months}
                                                    // theme="dark"

                                                    onChange={this.handleAMonthChange1}
                                                    onDismiss={this.handleAMonthDissmis1}
                                                >
                                                    <MonthBox value={this.makeText({ year: new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentScenario.month.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) })}
                                                        onClick={this.handleClickMonthBox1} />
                                                </Picker>
                                            </div>
                                        </FormGroup>
                                        {/* } */}


                                        {/* {this.state.numberNode && */}
                                        {/* <> */}
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenPercentageOfParent} target="Popover5" trigger="hover" toggle={this.togglePercentageOfParent}>
                                                <PopoverBody>{i18n.t('static.tooltip.PercentageOfParent')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-6" style={{ display: this.state.numberNode ? 'block' : 'none' }}>
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
                                                    // step={.01}
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
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.parentValue')} {i18n.t('static.common.for')} {moment(this.state.parentScenario.month).format(`MMM-YYYY`)} <i class="fa fa-info-circle icons pl-lg-2" id="Popover6" onClick={this.toggleParentValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            <Input type="text"
                                                id="parentValue"
                                                name="parentValue"
                                                bsSize="sm"
                                                readOnly={true}
                                                onChange={(e) => { this.dataChange(e) }}
                                                // value={this.state.addNodeFlag != "true" ? addCommas(this.state.parentScenario.calculatedDataValue) : addCommas(this.state.parentValue)}
                                                value={addCommas(this.state.parentValue.toString())}
                                            ></Input>
                                        </FormGroup>
                                        {/* </> */}

                                        {/* } */}
                                        {/* {this.state.aggregationNode && */}
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenNodeValue} target="Popover7" trigger="hover" toggle={this.toggleNodeValue}>
                                                <PopoverBody>{this.state.numberNode ? i18n.t('static.tooltip.NodeValue') : i18n.t('static.tooltip.NumberNodeValue')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-6" style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.nodeValue')}{this.state.numberNode}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover7" onClick={this.toggleNodeValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                value={this.state.numberNode ? this.state.currentScenario.calculatedDataValue == 0 ? "0" : addCommas(this.state.currentScenario.calculatedDataValue) : addCommas(this.state.currentScenario.dataValue)}
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
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">{i18n.t('static.product.unit1')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover9" onClick={this.toggleForecastingUnitPU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>

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
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenHashOfUMonth} target="Popover11" trigger="hover" toggle={this.toggleHashOfUMonth}>
                                                            <PopoverBody>{i18n.t('static.tooltip.TypeOfUsePU')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">{this.state.parentScenario.fuNode.usageType.id == 2 ? "# of FU / month / " : "# of FU / usage / "}{this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en} <i class="fa fa-info-circle icons pl-lg-2" id="Popover11" onClick={this.toggleHashOfUMonth} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenPlanningUnitNode} target="Popover12" trigger="hover" toggle={this.togglePlanningUnitNode}>
                                                    <PopoverBody>{i18n.t('static.tooltip.planningUnitNode')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.product.product')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover12" onClick={this.togglePlanningUnitNode} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                {/* {this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].puNode.planningUnit.id} */}

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
                                                                    {getLabelText(item.label, this.state.lang) + " | " + item.id}
                                                                </option>
                                                            )
                                                        }, this)}
                                                </Input>
                                                <FormFeedback className="red">{errors.planningUnitId}</FormFeedback>
                                            </FormGroup>
                                            {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                                                <>
                                                    <div>
                                                        <Popover placement="top" isOpen={this.state.popoverOpenConversionFactorFUPU} target="Popover13" trigger="hover" toggle={this.toggleConversionFactorFUPU}>
                                                            <PopoverBody>{i18n.t('static.tooltip.Conversionfactor')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">{i18n.t('static.conversion.ConversionFactorFUPU')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover13" onClick={this.toggleConversionFactorFUPU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                                        <Popover placement="top" isOpen={this.state.popoverOpenNoOfPUUsage} target="Popover14" trigger="hover" toggle={this.toggleNoOfPUUsage}>
                                                            <PopoverBody>{i18n.t('static.tooltip.NoOfPUUsage')}</PopoverBody>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup className="col-md-2">
                                                        <Label htmlFor="currencyId">{this.state.parentScenario.fuNode.usageType.id == 2 ? "# of PU / month / " : "# of PU / usage / "}{this.state.nodeUnitList.filter(c => c.unitId == this.state.currentItemConfig.context.payload.nodeUnit.id)[0].label.label_en} <i class="fa fa-info-circle icons pl-lg-2" id="Popover14" onClick={this.toggleNoOfPUUsage} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5">
                                                        <Input type="text"
                                                            id="noOfPUUsage"
                                                            name="noOfPUUsage"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={addCommas(this.state.parentScenario.fuNode.usageType.id == 2 ? this.round((this.state.parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / this.state.conversionFactor) : this.round(this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor))}>

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
                                                            <div>
                                                                <Popover placement="top" isOpen={this.state.popoverOpenQATEstimateForInterval} target="Popover15" trigger="hover" toggle={this.toggleQATEstimateForInterval}>
                                                                    <PopoverBody>{i18n.t('static.tooltip.QATEstimateForInterval')}</PopoverBody>
                                                                </Popover>
                                                            </div>
                                                            <FormGroup className="col-md-2">
                                                                <Label htmlFor="currencyId">{i18n.t('static.tree.QATEstimateForIntervalEvery_months')} <i class="fa fa-info-circle icons pl-lg-2" id="Popover15" onClick={this.toggleQATEstimateForInterval} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-10">
                                                                <Input type="text"
                                                                    id="interval"
                                                                    name="interval"
                                                                    bsSize="sm"
                                                                    readOnly={true}
                                                                    // value={addCommas(this.state.conversionFactor / ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod))}>
                                                                    value={addCommas(this.round(this.state.conversionFactor / (this.state.parentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)))}>

                                                                </Input>
                                                            </FormGroup>

                                                        </>}
                                                </>}
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenConsumptionIntervalEveryXMonths} target="Popover16" trigger="hover" toggle={this.toggleConsumptionIntervalEveryXMonths}>
                                                    <PopoverBody>{i18n.t('static.tooltip.ConsumptionIntervalEveryXMonths')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.parentScenario.fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.consumptionIntervalEveryXMonths')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover16" onClick={this.toggleConsumptionIntervalEveryXMonths} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            </FormGroup>
                                            <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.parentScenario.fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                <Input type="number"
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

                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenWillClientsShareOnePU} target="Popover17" trigger="hover" toggle={this.toggleWillClientsShareOnePU}>
                                                    <PopoverBody>{i18n.t('static.tooltip.willClientsShareOnePU')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.parentScenario.fuNode.usageType.id == 1 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.tree.willClientsShareOnePU?')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover17" onClick={this.toggleWillClientsShareOnePU} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            </FormGroup>
                                            <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 && this.state.parentScenario.fuNode.usageType.id == 1 ? 'block' : 'none' }}>
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
                                            {/* {(this.state.currentItemConfig.context.payload.nodeType.id == 5) && */}
                                            {/* <> */}
                                            <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{this.state.currentItemConfig.parentItem != null && this.state.parentScenario.fuNode != null && this.state.parentScenario.fuNode.usageType.id == 2 ? "How many PU per interval per " : "How many PU per usage per "}{this.state.currentItemConfig.parentItem != null && this.state.currentItemConfig.parentItem.parent != null && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id).length > 0 && this.state.unitList.filter(c => c.unitId == this.state.items.filter(x => x.id == this.state.currentItemConfig.parentItem.parent)[0].payload.nodeUnit.id)[0].label.label_en}?</Label>
                                            </FormGroup>
                                            <FormGroup className="col-md-10" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 5 ? 'block' : 'none' }}>
                                                <Input type="number"
                                                    id="puPerVisit"
                                                    name="puPerVisit"
                                                    readOnly={this.state.parentScenario.fuNode != null && this.state.parentScenario.fuNode.usageType.id == 2 ? false : true}
                                                    bsSize="sm"
                                                    valid={!errors.puPerVisit && this.state.currentItemConfig.context.payload.nodeType.id == 5 ? this.state.currentScenario.puNode.puPerVisit != '' : !errors.puPerVisit}
                                                    invalid={touched.puPerVisit && !!errors.puPerVisit}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        this.dataChange(e)
                                                    }}
                                                    value={this.state.currentItemConfig.parentItem != null && this.state.parentScenario.fuNode != null ? this.state.parentScenario.fuNode.usageType.id == 2 ? addCommas(this.state.currentScenario.puNode.puPerVisit) : (this.state.currentScenario.puNode.sharePlanningUnit == "true" || this.state.currentScenario.puNode.sharePlanningUnit == true ? this.round(this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor) : this.round((this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor))) : ""}
                                                // value={addCommas(this.state.parentScenario.fuNode.usageType.id == 2 ? (((this.state.parentScenario.fuNode.noOfForecastingUnitsPerPerson /
                                                //     this.state.noOfMonthsInUsagePeriod) / this.state.conversionFactor) * this.state.currentScenario.puNode.refillMonths) : (this.state.currentScenario.puNode.sharePlanningUnit == "true" || this.state.currentScenario.puNode.sharePlanningUnit == true ? (this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor) : Math.round((this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor))))}
                                                >

                                                </Input>
                                                <FormFeedback className="red">{errors.puPerVisit}</FormFeedback>
                                            </FormGroup>

                                            {/* </>} */}
                                        </div>
                                    </div>
                                    {/* Plannign unit end */}
                                    {/* {(this.state.currentItemConfig.context.payload.nodeType.id == 4) && */}
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
                                                    // valid={!errors.tracerCategoryId && this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.forecastingUnit.tracerCategory.id != '' : !errors.tracerCategoryId}
                                                    // invalid={touched.tracerCategoryId && !!errors.tracerCategoryId}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => {
                                                        this.dataChange(e); this.getForecastingUnitListByTracerCategoryId(0)
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
                                            </FormGroup>
                                            <Input type="hidden"
                                                id="planningUnitIdFUFlag"
                                                name="planningUnitIdFUFlag"
                                                value={this.state.addNodeFlag}
                                            />
                                            <FormGroup className="col-md-12" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.addNodeFlag == true ? 'block' : 'none' }}>
                                                <Label htmlFor="currencyId">{i18n.t('static.product.product')}<span class="red Reqasterisk">*</span></Label>
                                                <div className="controls ">
                                                    {/* <InMultiputGroup> */}
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
                                                                        {getLabelText(item.label, this.state.lang) + " | " + item.id}
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
                                                    <PopoverBody>{i18n.t('static.tooltip.LagInMonth')}</PopoverBody>
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
                                                <Input type="number"
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
                                                <Input type="number"
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
                                            {/* {(this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1) && */}
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
                                                {/* <FormGroup className="col-md-5"></FormGroup> */}
                                                {/* {this.state.currentScenario.fuNode.oneTimeUsage != "true" && */}
                                                <>
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}></FormGroup>
                                                    <FormGroup className="col-md-4" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input type="number"
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
                                                            value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" ? this.state.currentScenario.fuNode.usageFrequency : ""}></Input>
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
                                                            valid={!errors.usagePeriodIdDis && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.usagePeriod.usagePeriodId != "" : false)}
                                                            invalid={touched.usagePeriodIdDis && !!errors.usagePeriodIdDis}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                this.dataChange(e)
                                                            }}
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
                                                        <FormFeedback className="red">{errors.usagePeriodIdDis}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-2" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Label htmlFor="currencyId">for<span class="red Reqasterisk">*</span></Label>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && this.state.currentScenario.fuNode.oneTimeUsage != "true" && this.state.currentScenario.fuNode.oneTimeUsage != true ? 'block' : 'none' }}>
                                                        <Input type="number"
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
                                                            valid={!errors.repeatUsagePeriodId && this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1 && (this.state.currentScenario.fuNode.oneTimeUsage == "false" || this.state.currentScenario.fuNode.oneTimeUsage == false) ? (this.state.currentScenario.fuNode.repeatUsagePeriod != '' && this.state.currentScenario.fuNode.repeatUsagePeriod.usagePeriodId != '') : !errors.repeatUsagePeriodId}
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
                                                    <Input type="number"
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
                                                        value={this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? this.state.currentScenario.fuNode.usageFrequency : ""}></Input>
                                                    <FormFeedback className="red">{errors.usageFrequencyCon}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="col-md-5" style={{ display: this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2 ? 'block' : 'none' }}>
                                                    <Input
                                                        type="select"
                                                        id="usagePeriodIdCon"
                                                        name="usagePeriodIdCon"
                                                        bsSize="sm"
                                                        valid={!errors.usagePeriodIdCon && (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? this.state.currentScenario.fuNode.usagePeriod.usagePeriodId != "" : false)}
                                                        invalid={touched.usagePeriodIdCon && !!errors.usagePeriodIdCon}
                                                        onBlur={handleBlur}
                                                        onChange={(e) => {
                                                            handleChange(e);
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
                                                    <FormFeedback className="red">{errors.usagePeriodIdCon}</FormFeedback>
                                                </FormGroup>
                                            </>

                                            {/* } */}

                                            <div className="pl-lg-3 pr-lg-3" style={{ clear: 'both', width: '100%' }}>
                                                {(this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 2) &&
                                                    <table className="table table-bordered">
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfFURequiredForPeriod')}</td>
                                                            <td style={{ width: '50%' }}>{addCommas(this.state.currentScenario.fuNode.noOfForecastingUnitsPerPerson)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfMonthsInPeriod')}</td>
                                                            <td style={{ width: '50%' }}>{addCommas(this.state.noOfMonthsInUsagePeriod)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfFU/month/')} {this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en}</td>
                                                            {this.state.currentScenario.fuNode.usagePeriod.usagePeriodId != "" &&
                                                                <td style={{ width: '50%' }}>{addCommas((this.state.currentScenario.fuNode.noOfForecastingUnitsPerPerson / this.state.currentScenario.fuNode.usageFrequency) * (this.state.usagePeriodList.filter(c => c.usagePeriodId == this.state.currentScenario.fuNode.usagePeriod.usagePeriodId))[0].convertToMonth)}</td>}
                                                            {this.state.currentScenario.fuNode.usagePeriod.usagePeriodId == "" &&
                                                                <td style={{ width: '50%' }}></td>
                                                            }
                                                        </tr>
                                                    </table>}
                                                {(this.state.currentItemConfig.context.payload.nodeType.id == 4 && this.state.currentItemConfig.context.payload.nodeDataMap != "" && this.state.currentScenario.fuNode.usageType.id == 1) &&
                                                    <table className="table table-bordered">
                                                        <tr>
                                                            <td style={{ width: '50%' }}>{i18n.t('static.tree.#OfFU/')} {this.state.nodeUnitList.filter(c => c.unitId == this.state.usageTypeParent)[0].label.label_en}</td>
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
                                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddNodeModal: false, cursorItem: 0, highlightItem: 0 })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                        <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={() => this.resetNodeData()} ><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAllNodeData(setTouched, errors)} disabled={isSubmitting}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                    </FormGroup>
                                </Form>
                            )} />
                </TabPane>
                <TabPane tabId="2">
                    {/* <Formik
                        enableReinitialize={true}
                        // initialValues={initialValuesNodeData}
                        // validateOnChange={true}
                        initialValues={{
                            nodeTitle: this.state.currentItemConfig.context.payload.label.label_en,
                            nodeTypeId: this.state.currentItemConfig.context.payload.nodeType.id,
                            nodeUnitId: this.state.currentItemConfig.context.payload.nodeUnit.id,
                            forecastingUnitId: this.state.fuValues,
                            // showFUValidation : true
                            // percentageOfParent: (this.state.currentItemConfig.context.payload.nodeDataMap[1])[0].dataValue
                        }}
                        validate={validateNodeData(validationSchemaNodeData)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            console.log("all ok>>>", this.state.currentItemConfig);
                            this.setState({ loading: true, openAddNodeModal: false }, () => {
                                setTimeout(() => {
                                    console.log("inside set timeout on submit")
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
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='nodeDataForm' autocomplete="off"> */}
                    <div className="row pt-lg-0" style={{ float: 'right', marginTop: '-42px' }}>
                        <div className="row pl-lg-0 pr-lg-3">
                            {/* <SupplyPlanFormulas ref="formulaeChild" /> */}
                            <a className="">
                                <span style={{ cursor: 'pointer', color: '20a8d8' }} ><small className="supplyplanformulas">{i18n.t('Show Guidance')}</small></span>

                            </a>
                        </div>
                    </div>
                    <div className="row pl-lg-2 pr-lg-2">
                        <div>
                            <Popover placement="top" isOpen={this.state.popoverOpenMonth} target="Popover24" trigger="hover" toggle={this.toggleMonth}>
                                <PopoverBody>{i18n.t('static.tooltip.ModelingTransferMonth')}</PopoverBody>
                            </Popover>
                        </div>
                        <FormGroup className="col-md-2 pt-lg-1">
                            <Label htmlFor="">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover24" onClick={this.toggleMonth} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                        </FormGroup>
                        <FormGroup className="col-md-4 pl-lg-0">
                            <Picker
                                ref={this.pickAMonth2}
                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                value={{
                                    year:
                                        new Date(this.state.scalingMonth).getFullYear(), month: ("0" + (new Date(this.state.scalingMonth).getMonth() + 1)).slice(-2)
                                }}
                                lang={pickerLang.months}
                                onChange={this.handleAMonthChange2}
                                onDismiss={this.handleAMonthDissmis2}
                            >
                                <MonthBox value={this.makeText({ year: new Date(this.state.scalingMonth).getFullYear(), month: ("0" + (new Date(this.state.scalingMonth).getMonth() + 1)).slice(-2) })}
                                    onClick={this.handleClickMonthBox2} />
                            </Picker>
                        </FormGroup>

                        <div className="col-md-12">
                            {this.state.showModelingJexcelNumber &&
                                <> <div className="calculatorimg calculatorTable">
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
                                    <div style={{ 'float': 'right', 'fontSize': '18px' }}><b>{i18n.t('static.supplyPlan.total')} : {this.state.scalingTotal != "" && addCommas(parseFloat(this.state.scalingTotal).toFixed(4))}</b></div><br /><br />

                                </>
                            }
                            <div><Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.showMomData()}><i className={this.state.viewMonthlyData ? "fa fa-eye" : "fa fa-eye-slash"} style={{ color: '#fff' }}></i> {this.state.viewMonthlyData ? i18n.t('static.tree.viewMonthlyData') : i18n.t('static.tree.hideMonthlyData')}</Button>
                                {this.state.aggregationNode && <><Button color="success" size="md" className="float-right mr-1" type="button" onClick={(e) => this.formSubmitLoader(e)}> <i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button></>}
                            </div>
                        </div>
                        {this.state.showCalculatorFields &&
                            <div className="col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
                                <fieldset className="scheduler-border">
                                    <legend className="scheduler-border">{i18n.t('static.tree.modelingCalculaterTool')}</legend>
                                    <div className="row">
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.common.startdate')}<span class="red Reqasterisk">*</span></Label>
                                            <Picker
                                                ref={this.pickAMonth4}
                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                value={{ year: new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) }}
                                                lang={pickerLang.months}
                                                onChange={this.handleAMonthChange4}
                                                onDismiss={this.handleAMonthDissmis4}
                                            >
                                                <MonthBox value={this.makeText({ year: new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStartDate.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) })} onClick={this.handleClickMonthBox4} />
                                            </Picker>
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.targetDate')}<span class="red Reqasterisk">*</span></Label>
                                            <Picker
                                                ref={this.pickAMonth5}
                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                value={{ year: new Date(this.state.currentCalculatorStopDate.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStopDate.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) }}
                                                lang={pickerLang.months}
                                                onChange={this.handleAMonthChange5}
                                                onDismiss={this.handleAMonthDissmis5}
                                            >
                                                <MonthBox value={this.makeText({ year: new Date(this.state.currentCalculatorStopDate.replace(/-/g, '\/')).getFullYear(), month: ("0" + (new Date(this.state.currentCalculatorStopDate.replace(/-/g, '\/')).getMonth() + 1)).slice(-2) })} onClick={this.handleClickMonthBox5} />
                                            </Picker>
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
                                        <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenTargetEndingValue} target="Popover25" trigger="hover" toggle={this.toggleTargetEndingValue}>
                                                <PopoverBody>{i18n.t('static.tooltip.TargetEndingValue')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-5">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.targetEnding')} {this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'value' : '%'}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover25" onClick={this.toggleTargetEndingValue} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                            <Input type="number"
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
                                            <Popover placement="top" isOpen={this.state.popoverOpenTargetChangePercent} target="Popover26" trigger="hover" toggle={this.toggleTargetChangePercent}>
                                                <PopoverBody>{i18n.t('static.tooltip.TargetChangePercent')}</PopoverBody>
                                            </Popover>
                                        </div>
                                        <FormGroup className="col-md-5">
                                            <Label htmlFor="currencyId">{this.state.currentItemConfig.context.payload.nodeType.id > 2 ? 'Change (% points)' : 'Target change (%)'}<span class="red Reqasterisk">*</span> <i class="fa fa-info-circle icons pl-lg-2" id="Popover26" onClick={this.toggleTargetChangePercent} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
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
                                        {this.state.currentModelingType != 3 && this.state.currentModelingType != 4 && this.state.currentModelingType != 5 && <FormGroup className="col-md-6">
                                            <Label htmlFor="currencyId">{i18n.t('static.tree.Change(#)')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="number"
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
                                </div>
                                <div className="col-md-6 float-right">
                                    {/* <div className="col-md-12"> */}
                                    <FormGroup className="float-right" >
                                        <div className="check inline  pl-lg-1 pt-lg-0">

                                            <div style={{ display: this.state.aggregationNode ? 'block' : 'none' }}>
                                                <Input
                                                    className="form-check-input checkboxMargin"
                                                    type="checkbox"
                                                    id="manualChange"
                                                    name="manualChange"
                                                    // checked={true}
                                                    checked={this.state.currentScenario.manualChangesEffectFuture}
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
                                    {/* </div> */}
                                </div>

                                {/* <div className='row'> */}
                                <div className="col-md-12 pl-lg-0 pr-lg-0 modelingTransferTable" style={{ display: 'inline-block' }}>
                                    <div id="momJexcel" className="RowClickable" style={{ display: this.state.momJexcelLoader ? "none" : "block" }}>
                                    </div>
                                </div>
                                {/* </div> */}
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
                                <div className="pt-lg-2 pl-lg-0"><i>{i18n.t('static.tree.tableDisplays')} <b>{this.state.currentItemConfig.context.payload.nodeUnit.label != null ? getLabelText(this.state.currentItemConfig.context.payload.nodeUnit.label, this.state.lang) : ''}</b> {i18n.t('static.tree.forNode')} <b>{this.state.currentItemConfig.context.payload.label != null ? getLabelText(this.state.currentItemConfig.context.payload.label, this.state.lang) : ''}</b> {i18n.t('static.tree.asA%OfParent')} <b>{this.state.currentItemConfig.parentItem.payload.label != null ? getLabelText(this.state.currentItemConfig.parentItem.payload.label, this.state.lang) : ''}</b></i></div>
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
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={(e) => this.updateMomDataInDataSet(e)}><i className="fa fa-check"></i> {i18n.t('static.common.update')}</Button>

                                </div>
                                {/* </div> */}


                            </fieldset>
                        </div>
                    }
                    {/* <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAllNodeData(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button> */}
                    {/* </Form> */}
                    {/* )} /> */}
                </TabPane>
                <TabPane tabId="3">
                    {/* <ConsumptionInSupplyPlanComponent ref="consumptionChild" items={this.state} toggleLarge={this.toggleLarge} updateState={this.updateState} formSubmit={this.formSubmit} hideSecondComponent={this.hideSecondComponent} hideFirstComponent={this.hideFirstComponent} hideThirdComponent={this.hideThirdComponent} consumptionPage="consumptionDataEntry" useLocalData={1} /> */}
                    {/* {this.state.currentItemConfig.context.payload.extrapolation && */}
                    <TreeExtrapolationComponent ref="extrapolationChild" items={this.state} updateState={this.updateState} />
                    {/* } */}
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

    handleAMonthDissmis3 = (value, type) => {
        console.log("value--->", value);
        console.log("type--->>>", type);
        var date = value.year + "-" + value.month + "-" + "01"
        console.log("dismiss>>", value);
        console.log("forecastStartDate>>", this.state.forecastStartDate);
        console.log("forecastStopDate>>", moment(date).isBetween(this.state.forecastStartDate, this.state.forecastStopDate));
        this.updateTreeData(date);
        if (moment(date).isBetween(this.state.forecastStartDate, this.state.forecastStopDate, undefined, '[)')) {
            this.setState({ singleValue2: value, }, () => {


            })
        } else {
            if (type == 1) {
                alert("Please select date within forecast range");
            }
        }
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
        for (let i = 0; i < items.length; i++) {
            console.log("items[i]---", items[i]);
            if (items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList != null) {
                console.log("before filter mom---", items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList);
                console.log("before filter date---", moment(date).format('YYYY-MM'));
                var nodeDataModelingMap = items[i].payload.nodeDataMap[this.state.selectedScenario][0].nodeDataMomList.filter(x => moment(x.month).format('YYYY-MM') == moment(date).format('YYYY-MM'));
                console.log("nodeDataModelingMap>>>", nodeDataModelingMap);
                if (nodeDataModelingMap.length > 0) {
                    console.log("get payload 13");
                    if (nodeDataModelingMap[0].calculatedValue != null && nodeDataModelingMap[0].endValue != null) {
                        console.log("nodeDataModelingMap[0]----", nodeDataModelingMap[0]);
                        if (items[i].payload.nodeType.id == 5) {
                            console.log("my console---", nodeDataModelingMap[0]);
                            (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = nodeDataModelingMap[0].calculatedMmdValue != null ? nodeDataModelingMap[0].calculatedMmdValue.toString() : '';
                        } else {
                            (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = nodeDataModelingMap[0].calculatedValue.toString();
                        }
                        (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayDataValue = nodeDataModelingMap[0].endValue.toString();
                    } else {
                        console.log("get payload 14");
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
            //
            if (items[i].payload.nodeType.id == 4) {
                var fuPerMonth, totalValue, usageFrequency, convertToMonth;
                var noOfForecastingUnitsPerPerson = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.noOfForecastingUnitsPerPerson;
                if ((items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageType.id == 2 || ((items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage != "true" && (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.oneTimeUsage != true)) {
                    usageFrequency = (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usageFrequency;
                    var usagePeriodConvertToMonth = convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usagePeriod.usagePeriodId));
                    convertToMonth = usagePeriodConvertToMonth.length > 0 ? usagePeriodConvertToMonth[0].convertToMonth : '';
                    // convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.usagePeriod.usagePeriodId))[0].convertToMonth;
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
                console.log("fuPerMonth without round---", fuPerMonth);
                console.log("fuPerMonth with round---", Math.round(fuPerMonth));
                // (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = Math.round(totalValue);
                (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].fuPerMonth = fuPerMonth;
            }
            // else if (items[i].payload.nodeType.id == 5) {
            //     var item = items.filter(x => x.id == items[i].parent)[0];
            //     (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue = Math.round(((item.payload.nodeDataMap[this.state.selectedScenario])[0].displayCalculatedDataValue * (items[i].payload.nodeDataMap[this.state.selectedScenario])[0].dataValue) / 100);
            // }
        }
        this.setState({
            items
        }, () => {
            console.log("final updated items---", this.state.items);
            // this.calculateValuesForAggregateNode(this.state.items);
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
                    <div className={itemConfig.payload.nodeType.id == 5
                        || itemConfig.payload.nodeType.id == 4 ? "ContactTitleBackground TemplateTitleBgblue" :
                        "ContactTitleBackground TemplateTitleBg"}
                    >
                        <div className={itemConfig.payload.nodeType.id == 5 ||
                            itemConfig.payload.nodeType.id == 4 ? "ContactTitle TitleColorWhite" :
                            "ContactTitle TitleColor"}>
                            <div title={itemConfig.payload.label.label_en} style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '140px', float: 'left', fontWeight: 'bold', }}>
                                {itemConfig.payload.label.label_en}</div>
                            <div style={{ float: 'right' }}>
                                {itemConfig.payload.extrapolation == true && <i class="fa fa-line-chart" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                {this.getPayloadData(itemConfig, 4) == true && <i class="fa fa-exchange fa-rotate-90" style={{ fontSize: '11px', color: (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5 ? '#fff' : '#002f6c') }}></i>}
                                <b style={{ color: '#212721', float: 'right' }}>
                                    {itemConfig.payload.nodeType.id == 2 ?
                                        <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#002f6c' }}></i> :
                                        (itemConfig.payload.nodeType.id == 3 ?
                                            <i class="fa fa-percent " style={{ fontSize: '11px', color: '#002f6c' }} ></i> :
                                            (itemConfig.payload.nodeType.id == 4 ?
                                                <i class="fa fa-cube" style={{ fontSize: '11px', color: '#fff' }} ></i> :
                                                (itemConfig.payload.nodeType.id == 5 ?
                                                    <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#fff' }} ></i> :
                                                    (itemConfig.payload.nodeType.id == 1 ?
                                                        // <i class="fa fa-plus" style={{ fontSize: '11px', color: '#002f6c' }} ></i> : ""))))}</b>
                                                        <i><img src={AggregationNode} className="AggregationNodeSize" /></i> : ""))))}</b>

                            </div>
                        </div>
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

        // const { forecastingUnitList } = this.state;
        // let forecastingUnitMultiList = forecastingUnitList.length > 0
        //     && forecastingUnitList.map((item, i) => {
        //         return ({ value: item.id, label: getLabelText(item.label, this.state.lang) })

        //     }, this);
        // console.log("forecastingUnitMultiList---", forecastingUnitMultiList);

        // regionMultiList = Array.from(regionMultiList);
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
                    //   console.log("Data@@@1111----------->",data)
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
                            <button key="2" type="button" className="StyledButton TreeIconStyle TreeIconStyleCopyPaddingTop" style={{ background: 'none' }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.duplicateNode(itemConfig);
                                }}>
                                <i class="fa fa-clone" aria-hidden="true"></i>
                            </button>


                            <button key="3" type="button" className="StyledButton TreeIconStyle TreeIconStyleDeletePaddingTop" style={{ background: 'none' }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    confirmAlert({
                                        message: "Are you sure you want to delete this node.",
                                        buttons: [
                                            {
                                                label: i18n.t('static.program.yes'),
                                                onClick: () => {
                                                    console.log("delete itemConfig---", itemConfig);
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
                    {parseInt(itemConfig.payload.nodeType.id) != 5 &&
                        <button key="1" type="button" className="StyledButton TreeIconStyle TreeIconStylePlusPaddingTop" style={{ background: 'none' }}
                            onClick={(event) => {
                                console.log("add button called---------");
                                event.stopPropagation();
                                console.log("add node----", itemConfig);
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
                                        sharePlanningUnit: "false"
                                    }
                                };
                                tempArray.push(tempJson);
                                nodeDataMap[this.state.selectedScenario] = tempArray;
                                // tempArray.push(nodeDataMap);
                                this.setState({
                                    showMomDataPercent: false,
                                    showMomData: false,
                                    viewMonthlyData: true,
                                    tempPlanningUnitId: '',
                                    parentValue: "",
                                    fuValues: [],
                                    fuLabels: [],
                                    // showFUValidation : true,
                                    usageTemplateId: '',
                                    conversionFactor: '',
                                    parentScenario: itemConfig.level != 0 ? itemConfig.payload.nodeDataMap[this.state.selectedScenario][0] : {},
                                    usageText: '',
                                    currentScenario: {
                                        notes: '',
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
                                                nodeId: '',
                                                label: {
                                                    label_en: ''
                                                },
                                                nodeType: {
                                                    id: ''
                                                },
                                                nodeUnit: {
                                                    id: ''
                                                },
                                                extrapolation: false,
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
                                    console.log("add click config---", this.state.currentItemConfig);
                                    console.log("add click nodeflag---", this.state.addNodeFlag);
                                    console.log("add click number node flag---", this.state.numberNode);
                                    this.setState({
                                        orgCurrentItemConfig: JSON.parse(JSON.stringify(this.state.currentItemConfig.context)),
                                        parentValue: itemConfig.payload.nodeDataMap[this.state.selectedScenario][0].calculatedDataValue
                                    });

                                    this.getNodeTypeFollowUpList(itemConfig.payload.nodeType.id);
                                    if (itemConfig.payload.nodeType.id == 2 || itemConfig.payload.nodeType.id == 3) {
                                        var tracerCategoryId = "";
                                        if (this.state.tracerCategoryList.length == 1) {
                                            this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0].fuNode.forecastingUnit.tracerCategory.id = this.state.tracerCategoryList[0].tracerCategoryId;
                                            this.state.currentScenario = this.state.currentItemConfig.context.payload.nodeDataMap[this.state.selectedScenario][0];
                                            tracerCategoryId = this.state.tracerCategoryList[0].tracerCategoryId;

                                        }
                                        this.filterUsageTemplateList(tracerCategoryId);
                                        this.getForecastingUnitListByTracerCategoryId(0);
                                    }
                                    else if (itemConfig.payload.nodeType.id == 4) {
                                        console.log("fu id---", itemConfig);
                                        this.getPlanningUnitListByFUId((itemConfig.payload.nodeDataMap[this.state.selectedScenario])[0].fuNode.forecastingUnit.id);
                                        // this.getPlanningUnitListByFUId((data.parentItem.payload.nodeDataMap[scenarioId])[0].fuNode.forecastingUnit.id);
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
                    return
                    //     <div className="HighlightFrame HighlightFrameTooltip">
                    //     <div className="HighlightBadgePlaceholder">
                    //       <div className="HighlightBadge HighlightBadgeBox">
                    //          <p className='HighlightBadgeText'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. </p>
                    //       </div>
                    //     </div>
                    //   </div>;
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
            <Prompt
                when={this.state.isChanged == true}
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
                                <span className="compareAndSelect-larrowText"> {i18n.t('static.common.continueTo')} <a href="/#/validation/modelingValidation" className="supplyplanformulas">{i18n.t('static.dashboard.modelingValidation')}</a> </span>
                                <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')}  <a href="/#/validation/productValidation" className="supplyplanformulas">{i18n.t('static.dashboard.productValidation')}</a> </span><br />
                            </div>
                            {/* <div className="card-header-actions">
                                <div className="card-header-action pr-4 pt-lg-0">

                                    <Col md="12 pl-0">
                                        <div className="d-md-flex">
                                            <a className="pr-lg-0 pt-lg-1 compareAndSelect-larrowText">
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
                            </div>  */}
                            <div className="row">
                                <div className="col-md-12 pl-lg-3">
                                    <div className='col-md-4 pt-lg-2'>
                                        <a className="pr-lg-0 pt-lg-1 float-left">
                                            <span style={{ cursor: 'pointer' }} onClick={this.cancelClicked}><i className="cui-arrow-left icons" style={{ color: '#002F6C', fontSize: '13px' }}></i> <small className="supplyplanformulas">{'Return To List'}</small></span>
                                        </a>
                                    </div>
                                    {/* <div className="col-md-6">
                                        <span className="pr-lg-0 pt-lg-0 float-right">
                                            <h5 style={{ color: '#BA0C2F' }}>{i18n.t('static.tree.pleaseSaveAndDoARecalculateAfterDragAndDrop.')}</h5>
                                        </span>
                                    </div> */}

                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12 pl-lg-3">
                                    <div className="col-md-12">
                                        <span className="pr-lg-0 pt-lg-0 float-left">
                                            <h5 style={{ color: '#BA0C2F' }}>{i18n.t('static.tree.pleaseSaveAndDoARecalculateAfterDragAndDrop.')}</h5>
                                        </span>
                                    </div>

                                </div>
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
                                                            <InputGroupAddon addonType="append" onClick={this.toggleCollapse}>
                                                                <InputGroupText><i class="fa fa-cog icons" data-toggle="collapse" aria-expanded="false" style={{ cursor: 'pointer' }}></i></InputGroupText>

                                                            </InputGroupAddon>
                                                        </InputGroup>
                                                        {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3 pl-lg-0">
                                                        <Label htmlFor="languageId">{i18n.t('static.whatIf.scenario')}</Label>

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
                                                                // onClick={() => { this.onClick1() }}
                                                                // onBlur={handleBlur}
                                                                required
                                                                value={this.state.selectedScenario}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {scenarios}
                                                            </Input>


                                                            <InputGroupAddon addonType="append" onClick={this.toggleDropdown}>
                                                                {/* <InputGroupText><i class="fa fa-plus icons" aria-hidden="true" data-toggle="tooltip" data-html="true" data-placement="bottom" onClick={this.openScenarioModal} title=""></i></InputGroupText> */}
                                                                <InputGroupText className='SettingIcon'>
                                                                    <ButtonDropdown isOpen={this.state.dropdownOpen[0]} toggle={() => { this.toggleDeropdownSetting(0); }}>
                                                                        <DropdownToggle>
                                                                            <i class="fa fa-cog icons" data-bind="label" id="searchLabel" title=""></i>
                                                                        </DropdownToggle>
                                                                        <DropdownMenu right className="MarginLeftDropdown">
                                                                            <DropdownItem onClick={() => { this.openScenarioModal(1) }}>Add Scenario</DropdownItem>
                                                                            <DropdownItem onClick={() => { this.openScenarioModal(2) }}>Edit Scenario</DropdownItem>
                                                                            <DropdownItem onClick={() => { this.openScenarioModal(3) }}>Delete Scenario</DropdownItem>
                                                                        </DropdownMenu>
                                                                    </ButtonDropdown>
                                                                </InputGroupText>

                                                            </InputGroupAddon>
                                                        </InputGroup>

                                                        {/* <div class="list-group DropdownScenario MarginLeftDropdown" style={{ display: this.state.showDiv1 ? 'block' : 'none' }}>
                                                            <p class="list-group-item list-group-item-action" onClick={() => { this.openScenarioModal(1) }}>Add Scenario</p>
                                                            <p class="list-group-item list-group-item-action" onClick={() => { this.openScenarioModal(2) }}>Edit Scenario</p>
                                                            <p class="list-group-item list-group-item-action" onClick={() => { this.openScenarioModal(3) }}>Delete Scenario</p>
                                                           

                                                        </div> */}

                                                        {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                    </FormGroup>

                                                    <FormGroup className="col-md-3 pl-lg-0">
                                                        <Label htmlFor="languageId">
                                                            {/* {i18n.t('static.supplyPlan.date')}  */}
                                                            Display Date <i>(Forecast: {this.state.forecastPeriod})</i></Label>
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
                                                                onDismiss={(e) => this.handleAMonthDissmis3(e, 1)}
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
                                                    {/* 
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
                                                    </FormGroup> */}

                                                </Row>
                                            </div>

                                        </CardBody>
                                        {/* <div className="col-md-12 collapse-bg pl-lg-2 pr-lg-2 pt-lg-2 MarginBottomTree" style={{ display: this.state.showDiv ? 'block' : 'none' }} > */}
                                        <div className="col-md-12 collapse-bg pl-lg-2 pr-lg-2 pt-lg-2 MarginBottomTree" style={{ display: this.state.showDiv ? 'block' : 'none' }}>
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
                                                    this.saveTreeData();
                                                    // this.createOrUpdateTree();
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
                                                            {/* <div className='col-md-12 pt-lg-2 pb-lg-0 pr-lg-0'>
                                                                <button className="mr-1 mb-0 float-right btn btn-info btn-md showdatabtn" onClick={this.toggleCollapse}>
                                                                {this.state.showDiv ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                                                </button>
                                                            </div> */}
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

                                                                    {/* <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ showDiv: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button> */}
                                                                    <Button type="submit" size="md" onClick={() => this.touchAll(setTouched, errors)} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                                </FormGroup>
                                                            </Row>
                                                        </Form>
                                                    )} />
                                        </div>


                                        <div className="row ml-lg-1 pb-lg-2">
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

                                        </div>

                                        <div className="pb-lg-0" style={{ marginTop: '-2%' }}>
                                            <div className="card-header-actions">
                                                <div className="card-header-action pr-0 pt-lg-0">

                                                    <Col md="12 pl-0">
                                                        <div className="d-md-flex">
                                                            {/* <a className="pr-lg-0 pt-lg-1">
                                                                <span style={{ cursor: 'pointer' }} onClick={this.cancelClicked}><i className="fa fa-long-arrow-left" style={{ color: '#20a8d8', fontSize: '13px' }}></i> <small className="supplyplanformulas">{'Return To List'}</small></span>
                                                            </a> */}
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
                                                <div className="placeholder TreeTemplateHeight" style={{ clear: 'both', marginTop: '25px', border: '1px solid #a7c6ed' }} >
                                                    {/* <OrgDiagram centerOnCursor={true} config={config} onHighlightChanged={this.onHighlightChanged} /> */}
                                                    {/* <OrgDiagram centerOnCursor={true} config={config} onCursorChanged={this.onCursoChanged} onHighlightChanged={this.onHighlightChanged}/> */}
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
                                                {/* <div className="col-md-6 pl-lg-0"> <h5 style={{ color: '#BA0C2F' }}>{i18n.t('static.tree.pleaseSaveAndDoARecalculateAfterDragAndDrop.')}</h5></div> */}
                                                <div className="col-md-6 pl-lg-0"> </div>
                                                <div className="col-md-6 pr-lg-0"> <Button type="button" size="md" color="info" className="float-right mr-1" onClick={() => this.callAfterScenarioChange(this.state.selectedScenario)}><i className="fa fa-calculator"></i> {i18n.t('static.tree.calculated')}</Button>
                                                    {/* <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.resetTree}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button> */}
                                                    {/* <Button type="button" color="success" className="mr-1 float-right" size="md" onClick={() => this.saveTreeData()}><i className="fa fa-check"> </i>{i18n.t('static.pipeline.save')}</Button> */}
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
                    <strong>{i18n.t('static.tree.Add/EditNode')}</strong>  {this.state.activeTab1[0] != '1' && <div className="HeaderNodeText"> {
                        this.state.currentItemConfig.context.payload.nodeType.id == 2 ? <i class="fa fa-hashtag" style={{ fontSize: '11px', color: '#20a8d8' }}></i> :
                            (this.state.currentItemConfig.context.payload.nodeType.id == 3 ? <i class="fa fa-percent " style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                (this.state.currentItemConfig.context.payload.nodeType.id == 4 ? <i class="fa fa-cube" style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                    (this.state.currentItemConfig.context.payload.nodeType.id == 5 ? <i class="fa fa-cubes" style={{ fontSize: '11px', color: '#20a8d8' }} ></i> :
                                        (this.state.currentItemConfig.context.payload.nodeType.id == 1 ? <i><img src={AggregationNode} className="AggregationNodeSize" /></i> : "")
                                    )))}
                        <b className="supplyplanformulas ScalingheadTitle">{this.state.currentItemConfig.context.payload.label.label_en}</b></div>}
                    <Button size="md" onClick={() => this.setState({ openAddNodeModal: false, cursorItem: 0, highlightItem: 0, activeTab1: new Array(3).fill('1') })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
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
                                <NavItem style={{ display: !this.state.currentItemConfig.context.payload.extrapolation || this.state.currentItemConfig.context.payload.nodeType.id != 2 ? 'block' : 'none' }}>
                                    {/* {this.state.currentItemConfig.context.payload.extrapolation == false || this.state.currentItemConfig.context.payload.nodeType.id != 2 && */}
                                    {/* <NavItem> */}
                                    <NavLink
                                        active={this.state.activeTab1[0] === '2'}
                                        onClick={() => { this.toggleModal(0, '2'); }}
                                    >
                                        {i18n.t('static.tree.Modeling/Transfer')}
                                    </NavLink>
                                </NavItem>
                                {/* } */}

                                <NavItem style={{ display: this.state.currentItemConfig.context.payload.extrapolation && this.state.currentItemConfig.context.payload.nodeType.id == 2 ? 'block' : 'none' }}>
                                    <NavLink
                                        active={this.state.activeTab1[0] === '3'}
                                        onClick={() => { this.toggleModal(0, '3'); }}
                                    >
                                        {/* {i18n.t('static.tree.extrapolation')} */}
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
                                            // checked={true}
                                            checked={this.state.currentItemConfig.context.payload.extrapolation}
                                            onClick={(e) => { this.extrapolate(e); }}
                                        />
                                        <Label
                                            className="form-check-label"
                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                            <b>{'Extrapolate'}</b>
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
                    {/* <Button size="md" onClick={(e) => {
                        this.state.addNodeFlag ? this.onAddButtonClick(this.state.currentItemConfig) : this.updateNodeInfoInJson(this.state.currentItemConfig)
                    }} color="success" className="submitBtn float-right mr-1" type="button"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddNodeModal: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button> */}
                </ModalFooter>
            </Modal>
            {/* </Draggable > */}
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

        </div >
    }
}

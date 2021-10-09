import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType, LevelAnnotationConfig, AnnotationType, LineType, Thickness, TreeLevels } from 'basicprimitives';
import { DndProvider, DropTarget, DragSource } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faEdit, faArrowsAlt, faCopy } from '@fortawesome/free-solid-svg-icons'
import i18n from '../../i18n'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import TreeData from '../../Samples/TreeData';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../../views/Forms/ValidationForms/ValidationForms.css'
import classnames from 'classnames';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, Modal, ModalBody, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, InputGroupText, InputGroup } from 'reactstrap';
import Provider from '../../Samples/Provider'
import AuthenticationService from '../Common/AuthenticationService.js';
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
import UsageTemplateService from '../../api/UsageTemplateService';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";



const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

const ItemTypes = {
    NODE: 'node'
}

let initialValues = {
    forecastMethodId: "",
    treeName: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        forecastMethodId: Yup.string()
            .required(i18n.t('static.user.validlanguage')),
        treeName: Yup.string()
            .required(i18n.t('static.user.validlanguage')),

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

const Node = ({ itemConfig, isDragging, connectDragSource, canDrop, isOver, connectDropTarget }) => {
    const opacity = isDragging ? 0.4 : 1
    let itemTitleColor = Colors.RoyalBlue;
    if (isOver) {
        if (canDrop) {
            itemTitleColor = "green";
        } else {
            itemTitleColor = "red";
        }
    }

    return connectDropTarget(connectDragSource(
        <div className="ContactTemplate" style={{ opacity, backgroundColor: Colors.White, borderColor: Colors.Black }}>
            <div className="ContactTitleBackground"
            >
                <div className="ContactTitle" style={{ color: Colors.Black }}><b>{itemConfig.payload.label.label_en}</b></div>
            </div>
            {/* <div className="ContactPhone">{itemConfig.payload.label.label_en}</div> */}
            <div className="ContactPhone">{getPayloadData(itemConfig)}</div>
            {/* <div className="ContactPhone">{itemConfig.nodeValue.value}</div> */}
        </div>
    ))
}
function getPayloadData(itemConfig) {
    console.log("inside get payload");
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
    if (data != null && data[0] != null && (data[0])[0] != null) {
        return (itemConfig.payload.nodeDataMap[0])[0].dataValue;
    } else {
        return "";
    }
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

export default class CreateTreeTemplate extends Component {
    constructor() {
        super();
        this.state = {
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
                }
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
                                            id: ''
                                        }
                                    }
                                }
                            ]
                        ]
                    }
                },
                parentItem: {
                    payload: {
                        label: {

                        }
                    }
                }
            },
            activeTab1: new Array(2).fill('1')
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
    }
    getForecastingUnitUnitByFUId(forecastingUnitId) {
        const { currentItemConfig } = this.state;
        var forecastingUnit = (this.state.forecastingUnitList.filter(c => c.forecastingUnitId == forecastingUnitId))[0];
        (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.unit.id = forecastingUnit.unit.id;
        this.setState({
            currentItemConfig
        });
    }

    getNoOfFUPatient() {
        console.log("no of fu------", (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson);
        console.log("no of person---", (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons);
        var noOfFUPatient = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
        this.setState({
            noOfFUPatient
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
    getUsageTemplateList() {
        console.log(" get uasge template--------------");
        var tracerCategoryId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id;
        console.log("tracerCategoryId---", tracerCategoryId);
        var forecastingUnitId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id;
        console.log("forecastingUnitId---", forecastingUnitId);
        var usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id;
        console.log("usageTypeId---", usageTypeId);
        UsageTemplateService.getUsageTemplateListForTree(tracerCategoryId, forecastingUnitId, usageTypeId).then(response => {
            this.setState({
                usageTemplateList: response.data
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
        (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId = usageTemplate.usageFrequencyUsagePeriod.usagePeriodId;
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
        var usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId;
        if (usagePeriodId != null && usagePeriodId != "") {
            var convertToMonth = (this.state.usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
            var noFURequired = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount / (convertToMonth * this.state.noOfMonthsInUsagePeriod);
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
            usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.usageTypeId;
            usagePeriodId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usagePeriod.usagePeriodId;
            usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
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
                noOfMonthsInUsagePeriod = convertToMonth * (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency * this.state.noOfFUPatient;
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
        var noOfPersons = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
        var noOfForecastingUnitsPerPerson = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson;
        var usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency;
        var usageTypeParent = document.getElementById("usageTypeParent");
        var selectedText = usageTypeParent.options[usageTypeParent.selectedIndex].text;

        var forecastingUnitUnit = document.getElementById("forecastingUnitUnit");
        var selectedText1 = forecastingUnitUnit.options[forecastingUnitUnit.selectedIndex].text;



        if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 || (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true") {
            var usagePeriodId = document.getElementById("usagePeriodId");
            var selectedText2 = usagePeriodId.options[usagePeriodId.selectedIndex].text;
        }

        if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
            if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true") {
                var repeatUsagePeriodId = document.getElementById("repeatUsagePeriodId");
                var selectedText3 = repeatUsagePeriodId.options[repeatUsagePeriodId.selectedIndex].text;
                usageText = "Every " + noOfPersons + " " + selectedText + " requires " + noOfForecastingUnitsPerPerson + " " + selectedText1 + ", " + usageFrequency + " times per " + selectedText2 + " for " + (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount + " " + selectedText3;
            } else {
                usageText = "Every " + noOfPersons + " " + selectedText + " requires " + noOfForecastingUnitsPerPerson + " " + selectedText1;
            }
        } else {
            usageText = "Every " + noOfPersons + " " + selectedText + " - requires " + noOfForecastingUnitsPerPerson + " " + selectedText1 + " every " + usageFrequency + " " + selectedText2;
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
            // console.log("fu list t---", response.data.filter(c => c.tracerCategory.id == tracerCategoryId && c.active == true))
            this.setState({
                forecastingUnitList: response.data
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
        if (e.target.checked == true) {
            var itemsList = this.state.items;
            var filteredItemList = itemsList.filter(c => c.payload.nodeType.id != 5);
            console.log(">>>", filteredItemList);
            this.setState({
                items: filteredItemList
            });
        } else {
            this.componentDidMount();
        }
    }
    filterPlanningUnitAndForecastingUnitNodes(e) {
        console.log(">>>", e.target.checked);
        if (e.target.checked == true) {
            var itemsList = this.state.items;
            var filteredItemList = itemsList.filter(c => c.payload.nodeType.id != 5 && c.payload.nodeType.id != 4);
            console.log(">>>", filteredItemList);
            this.setState({
                items: filteredItemList
            });
        } else {
            this.componentDidMount();
        }
    }

    touchAll(setTouched, errors) {
        setTouched({
            'forecastMethodId': true,
            'treeName': true
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
        ForecastMethodService.getActiveForecastMethodList().then(response => {
            this.setState({
                forecastMethodList: response.data
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
            this.setState({
                nodeUnitList: response.data.filter(c => (c.dimension.id == 3 && c.active == true))
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
            this.setState({
                usagePeriodList: response.data
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
            this.setState({
                usageTypeList: response.data
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
        DatasetService.getNodeTypeList().then(response => {
            console.log("node type list---", response.data);
            this.setState({
                nodeTypeList: response.data,
                loading: false
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
        if (this.props.match.params.templateId != -1) {
            DatasetService.getTreeTemplateById(this.props.match.params.templateId).then(response => {
                this.setState({
                    treeTemplate: response.data,
                    items: response.data.tree.flatList,
                    loading: false
                }, () => {
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
                items: [{
                    id: 1,
                    level: 0,
                    parent: null,
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
                                dataValue: ''
                            }]
                        ]
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
    nodeTypeChange(event) {
        var nodeTypeId = event.target.value;
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
    }

    resetTree() {
        this.setState({ items: TreeData.demographic_scenario_two });
    }
    dataChange(event) {
        // alert("hi");
        let { currentItemConfig } = this.state;
        let { treeTemplate } = this.state;
        if (event.target.name === "forecastMethodId") {
            treeTemplate.forecastMethod.id = event.target.value;
        }

        if (event.target.name === "treeName") {
            treeTemplate.label.label_en = event.target.value;
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
        }
        if (event.target.name === "nodeValue") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue = event.target.value;
        }
        if (event.target.name === "notes") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].notes = event.target.value;
            this.getNotes();
        }
        if (event.target.name === "forecastingUnitId") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id = event.target.value;
            if (event.target.value != null && event.target.value != "") {
                var forecastingUnitId = document.getElementById("forecastingUnitId");
                var forecastingUnitLabel = forecastingUnitId.options[forecastingUnitId.selectedIndex].text;
                (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en = forecastingUnitLabel;
            }
            this.getForecastingUnitUnitByFUId(event.target.value);
        }

        if (event.target.name === "tracerCategoryId") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id = event.target.value;
        }

        if (event.target.name === "noOfPersons") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons = event.target.value;
        }

        if (event.target.name === "forecastingUnitPerPersonsFC") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson = event.target.value;
            if (currentItemConfig.context.payload.nodeType.id == 4 && (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1) {
                this.getNoOfFUPatient();
            }
        }

        if (event.target.name === "oneTimeUsage") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage = event.target.value;
            this.getUsageText();
        }

        if (event.target.name === "repeatUsagePeriodId") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId = event.target.value;
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
                (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons = 1;
            }
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id = event.target.value;
            this.getUsageTemplateList();
        }

        this.setState({ currentItemConfig });
    }
    onAddButtonClick(itemConfig) {
        console.log("add button clicked---", itemConfig);
        this.setState({ openAddNodeModal: false });
        const { items } = this.state;
        var newItem = itemConfig.context;
        newItem.parent = itemConfig.context.parent;
        newItem.id = parseInt(items.length + 1);
        console.log("add button clicked value after update---", newItem);
        this.setState({
            items: [...items, newItem],
            cursorItem: parseInt(items.length + 1)
        }, () => {
            console.log("on add items-------", this.state.items);
        });
    }
    onRemoveButtonClick(itemConfig) {
        const { items } = this.state;

        this.setState(this.getDeletedItems(items, [itemConfig.id]));
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
        // this.setState({ openAddNodeModal: true });
        console.log("cursor changed called---", data)
        const { context: item } = data;
        console.log("cursor changed item---", item);
        // const { config } = this.state;
        if (item != null) {

            this.setState({
                openAddNodeModal: true,
                addNodeFlag: false,
                currentItemConfig: data,
                level0: (data.context.level == 0 ? false : true),
                numberNode: (data.context.payload.nodeType.id == 2 ? false : true),
                aggregationNode: (data.context.payload.nodeType.id == 1 ? false : true),
                //         title: item.title,
                //         config: {
                //             ...config,
                //             // highlightItem: item.id,
                //             // cursorItem: item.id
                //         },
                highlightItem: item.id,
                cursorItem: item.id
            }, () => {
                console.log("highlighted item---", this.state.currentItemConfig.context)
                if (data.context.payload.nodeType.id == 4) {
                    this.getForecastingUnitListByTracerCategoryId((data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id);
                    this.getNoOfMonthsInUsagePeriod();
                    this.getNodeUnitOfPrent();
                }
                if (data.context.payload.nodeType.id > 3) {
                    // console.log("ttt--------------->",this.state.currentItemConfig);
                    // document.getElementById('usageTypeParent').value = this.state.currentItemConfig.parentItem.payload.nodeUnit.id
                    // this.getUsageText();
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
        });
    }

    tabPane1() {
        return (
            <>
                <TabPane tabId="1">
                    <Form>
                        {this.state.level0 &&
                            <FormGroup>
                                <Label htmlFor="currencyId">Parent</Label>
                                <Input type="text"
                                    name="parent"
                                    bsSize="sm"
                                    readOnly={true}
                                    value={this.state.currentItemConfig.context.level != 0
                                        && this.state.addNodeFlag !== "true"
                                        ? this.state.currentItemConfig.parentItem.payload.label.label_en
                                        : this.state.currentItemConfig.context.payload.label.label_en}
                                ></Input>
                            </FormGroup>}
                        <FormGroup>
                            <Label htmlFor="currencyId">Node Title<span class="red Reqasterisk">*</span></Label>
                            <Input type="text"
                                id="nodeTitle"
                                name="nodeTitle"
                                bsSize="sm"
                                // valid={!errors.nodeTitle && this.state.currentItemConfig.context.payload.label.label_en != ''}
                                // invalid={touched.nodeTitle && !!errors.nodeTitle}
                                // onBlur={handleBlur}
                                onChange={(e) => { this.dataChange(e) }}
                                value={this.state.currentItemConfig.context.payload.label.label_en}>
                            </Input>
                            {/* <FormFeedback className="red">{errors.nodeTitle}</FormFeedback> */}
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="currencyId">Node Type<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                id="nodeTypeId"
                                name="nodeTypeId"
                                bsSize="sm"
                                // valid={!errors.nodeTypeId && this.state.currentItemConfig.context.payload.nodeType.id != ''}
                                // invalid={touched.nodeTypeId && !!errors.nodeTypeId}
                                // onBlur={handleBlur}
                                onChange={(e) => { this.nodeTypeChange(e); this.dataChange(e) }}
                                required
                                value={this.state.currentItemConfig.context.payload.nodeType.id}
                            >
                                <option value="">{i18n.t('static.common.select')}</option>
                                {this.state.nodeTypeList.length > 0
                                    && this.state.nodeTypeList.map((item, i) => {
                                        return (
                                            <option key={i} value={item.id}>
                                                {getLabelText(item.label, this.state.lang)}
                                            </option>
                                        )
                                    }, this)}
                            </Input>
                            {/* <FormFeedback className="red">{errors.nodeTypeId}</FormFeedback> */}
                        </FormGroup>
                        {this.state.aggregationNode &&
                            <>
                                <FormGroup>
                                    <Label htmlFor="currencyId">Node Unit<span class="red Reqasterisk">*</span></Label>
                                    <Input
                                        type="select"
                                        id="nodeUnitId"
                                        name="nodeUnitId"
                                        bsSize="sm"
                                        onChange={(e) => { this.dataChange(e) }}
                                        required
                                        value={this.state.currentItemConfig.context.payload.nodeUnit.id}
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
                                <FormGroup>
                                    <Label htmlFor="currencyId">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span></Label>
                                    <div className="controls edit">
                                        <Picker
                                            id="month"
                                            name="month"
                                            ref="pickAMonth2"
                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                            value={this.state.singleValue2}
                                            lang={pickerLang.months}
                                            theme="dark"
                                            onChange={this.handleAMonthChange2}
                                            onDismiss={this.handleAMonthDissmis2}
                                        >
                                            <MonthBox value={this.makeText(this.state.singleValue2)} onClick={this.handleClickMonthBox2} />
                                        </Picker>
                                    </div>
                                </FormGroup>
                            </>}
                        {this.state.numberNode &&
                            <>
                                <FormGroup>
                                    <Label htmlFor="currencyId">Percentage of Parent<span class="red Reqasterisk">*</span></Label>
                                    <Input type="text"
                                        id="percentageOfParent"
                                        name="percentageOfParent"
                                        onChange={(e) => { this.dataChange(e) }}
                                        value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue}></Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="currencyId">Parent Value<span class="red Reqasterisk">*</span></Label>
                                    <Input type="text"
                                        id="parentValue"
                                        name="parentValue"
                                        readOnly={true}
                                        onChange={(e) => { this.dataChange(e) }}
                                        value={this.state.currentItemConfig.context.level != 0 && this.state.addNodeFlag !== "true" ? (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].dataValue : (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue}
                                    ></Input>
                                </FormGroup></>}
                        {this.state.aggregationNode &&
                            <FormGroup>
                                <Label htmlFor="currencyId">Node Value<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    id="nodeValue"
                                    name="nodeValue"
                                    readOnly={this.state.numberNode ? true : false}
                                    onChange={(e) => { this.dataChange(e) }}
                                    value={this.getNodeValue(this.state.currentItemConfig.context.payload.nodeType.id)}></Input>
                            </FormGroup>}

                        <FormGroup>
                            <Label htmlFor="currencyId">Notes</Label>
                            <Input type="textarea"
                                id="notes"
                                name="notes"
                                onChange={(e) => { this.dataChange(e) }}
                                // value={this.getNotes}
                                value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].notes}
                            ></Input>
                        </FormGroup>
                    </Form>
                    {/* Planning unit start */}
                    {(this.state.currentItemConfig.context.payload.nodeType.id == 5) &&
                        <div>
                            <div className="row">
                                <FormGroup className="col-md-2">
                                    <Label htmlFor="currencyId">Type<span class="red Reqasterisk">*</span></Label>

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
                                    <Label htmlFor="currencyId"># of FU / month / Clients<span class="red Reqasterisk">*</span></Label>

                                </FormGroup>
                                <FormGroup className="col-md-5">
                                    <Input type="text"
                                        id="forecastingUnitPU"
                                        name="forecastingUnitPU"
                                        bsSize="sm"
                                        readOnly={true}
                                        value={(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod}>

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
                                            && this.state.nodeUnitList.map((item, i) => {
                                                return (
                                                    <option key={i} value={item.unitId}>
                                                        {getLabelText(item.label, this.state.lang)}
                                                    </option>
                                                )
                                            }, this)}
                                    </Input>
                                </FormGroup>
                            </div>
                        </div>}
                    {/* Plannign unit end */}
                    {(this.state.currentItemConfig.context.payload.nodeType.id == 4) && <div>
                        <div className="row">

                            <FormGroup className="col-md-4">
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
                                    <option value="">{i18n.t('static.common.select')}</option>
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
                            <FormGroup className="col-md-4">
                                <Label htmlFor="currencyId">Forecasting Unit<span class="red Reqasterisk">*</span></Label>
                                <Input
                                    type="select"
                                    id="forecastingUnitId"
                                    name="forecastingUnitId"
                                    bsSize="sm"
                                    onChange={(e) => { this.dataChange(e) }}
                                    required
                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id}
                                >
                                    <option value="">{i18n.t('static.common.select')}</option>
                                    {this.state.forecastingUnitList.length > 0
                                        && this.state.forecastingUnitList.map((item, i) => {
                                            return (
                                                <option key={i} value={item.forecastingUnitId}>
                                                    {getLabelText(item.label, this.state.lang)}
                                                </option>
                                            )
                                        }, this)}
                                </Input>
                            </FormGroup>
                            <FormGroup className="col-md-4">
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
                                    <option value="">{i18n.t('static.common.select')}</option>
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
                            <FormGroup className="col-md-6">
                                <Label htmlFor="currencyId">Type<span class="red Reqasterisk">*</span></Label>
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
                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.lagInMonths}
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
                                    // value={this.state.currentItemConfig.title}></Input>
                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons}>

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
                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson}></Input>
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
                                        && this.state.nodeUnitList.map((item, i) => {
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
                                    <FormGroup className="col-md-2">
                                        <Label htmlFor="currencyId">Single Use<span class="red Reqasterisk">*</span></Label>
                                    </FormGroup>
                                    <FormGroup className="col-md-5">
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
                                    </FormGroup>
                                    <FormGroup className="col-md-5"></FormGroup>
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
                                                    name="usageFrequency"
                                                    bsSize="sm"
                                                    readOnly={true}
                                                    onChange={(e) => { this.dataChange(e) }}
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
                                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatCount}></Input>
                                            </FormGroup>
                                            <FormGroup className="col-md-5">
                                                <Input type="select"
                                                    id="repeatUsagePeriodId"
                                                    name="repeatUsagePeriodId"
                                                    bsSize="sm"
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId}>

                                                    <option value=""></option>
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
                            <div style={{ clear: 'both' }}>
                                {(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 &&
                                    <table className="table table-bordered">
                                        <tr>
                                            <td># of FU required for period</td>
                                            <td>{(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson}</td>
                                        </tr>
                                        <tr>
                                            <td># of months in period</td>
                                            <td>{this.state.noOfMonthsInUsagePeriod}</td>
                                        </tr>
                                        <tr>
                                            <td># of FU / month / Patient</td>
                                            <td>{(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod}</td>
                                        </tr>
                                    </table>}
                                {(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1 &&
                                    <table className="table table-bordered">
                                        <tr>
                                            <td># of FU / patient</td>
                                            <td>{this.state.noOfFUPatient}</td>
                                        </tr>
                                        <tr>
                                            <td># of FU / month / patient</td>
                                            <td>{this.state.noOfMonthsInUsagePeriod}</td>
                                        </tr>
                                        <tr>
                                            <td># of FU required</td>
                                            <td>{this.state.noFURequired}</td>
                                        </tr>
                                    </table>}
                            </div>
                            <div className="pt-2 pl-2"><b>{this.state.usageText}</b></div>

                            {/* <div style={{ width: '100%' }}> */}
                            {/* <table className="table table-bordered">
                                <tr>
                                    <td>Every</td>
                                    <td>1</td>
                                    <td>
                                        <FormGroup className="col-md-6">
                                            <Input type="text"
                                                name="nodeTitle"
                                                onChange={(e) => { this.dataChange(e) }}
                                                // value={this.state.currentItemConfig.title}></Input>
                                                value={'Clients'}></Input>
                                        </FormGroup>
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>requires</td>
                                    <td>  <FormGroup className="col-md-6">
                                        <Input type="text"
                                            name="nodeTitle"
                                            onChange={(e) => { this.dataChange(e) }}
                                            // value={this.state.currentItemConfig.title}></Input>
                                            value={'130'}></Input>
                                    </FormGroup></td>
                                    <td>condom</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>every</td>
                                    <td>  <FormGroup className="col-md-6">
                                        <Input type="text"
                                            name="nodeTitle"
                                            onChange={(e) => { this.dataChange(e) }}
                                            // value={this.state.currentItemConfig.title}></Input>
                                            value={'1'}></Input>
                                    </FormGroup></td>
                                    <td> <FormGroup className="col-md-6">
                                        <Input
                                            type="select"
                                            name="nodeTypeId"
                                            bsSize="sm"
                                            onChange={(e) => { this.nodeTypeChange(e) }}
                                            required
                                            value={this.state.currentItemConfig.valueType}
                                        >
                                            <option value="-1">Nothing Selected</option>
                                            <option value="1">year(s)</option>
                                            <option value="2">Discrete</option>
                                        </Input>
                                    </FormGroup></td>
                                    <td>indefinitely</td>
                                </tr>

                            </table> */}
                            {/* <table className="table table-bordered">
                                <tr>
                                    <td>Every</td>
                                    <td>4</td>
                                    <td>Patient</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>requires</td>
                                    <td>1</td>
                                    <td>mask</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>Single use</td>
                                    <td>No</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td>1</td>
                                    <td>times per</td>
                                    <td>week(s)</td>
                                </tr>
                                <tr>
                                    <td>for</td>
                                    <td>2</td>
                                    <td>month(s)</td>
                                    <td></td>
                                </tr>
                            </table> */}
                            {/* </div><br /> */}
                            {/* <div style={{ clear: 'both' }}> */}
                            {/* <table className="table table-bordered">
                                <tr>
                                    <td># of FU / patient</td>
                                    <td>0.25</td>
                                </tr>
                                <tr>
                                    <td># of FU / month / patient</td>
                                    <td>1.08</td>
                                </tr>
                                <tr>
                                    <td># of FU required</td>
                                    <td>2.17</td>
                                </tr>
                            </table> */}
                            {/* <table className="table table-bordered">
                                <tr>
                                    <td># of FU required for period</td>
                                    <td>130</td>
                                </tr>
                                <tr>
                                    <td># of months in period</td>
                                    <td>12.00</td>
                                </tr>
                                <tr>
                                    <td># of FU / month / Patient</td>
                                    <td>10.83</td>
                                </tr>
                            </table> */}
                            {/* </div> */}
                            {/* <div className="pt-2"><b>Every 4 Patient requires 1 mask, 1 times per week(s) for 2 month(s)</b></div> */}
                            {/* <div className="pt-2 pl-2"><b>Every 1 Clients - requires 130 condom every 1 year(s) indefinitely</b></div> */}
                            {/* <div className="pt-2">
                            <table className="table table-bordered">
                                <tr>
                                    <td>Forecasting unit</td>
                                    <td>surgical mask, 1 mask</td>
                                </tr>
                                <tr>
                                    <td># of FU / usage / Patient</td>
                                    <td>2.17</td>
                                    <td>mask</td>
                                </tr>
                                <tr>
                                    <td>Planning Unit</td>
                                    <td>Surgical mask, pack of 5</td>
                                </tr>
                                <tr>
                                    <td>Conversion Factor (FU:PU)</td>
                                    <td>5</td>
                                </tr>
                                <tr>
                                    <td># of PU / usage / </td>
                                    <td>0.43</td>
                                    <td>packs</td>
                                </tr>
                                <tr>
                                    <td>Will Clients share one PU?</td>
                                    <td>No</td>
                                </tr>
                                <tr>
                                    <td>How many PU per usage per ?</td>
                                    <td>1.00</td>
                                </tr>
                            </table> */}
                            {/* <table  className="table table-bordered">
                                <tr>
                                    <td>Forecasting unit</td>
                                    <td>no logo condoms</td>
                                </tr>
                                <tr>
                                    <td># of FU / month / Clients</td>
                                    <td>10.83</td>
                                    <td>condom</td>
                                </tr>
                                <tr>
                                    <td>Planning Unit</td>
                                    <td>No logo condoms, Pack of 10 condoms</td>
                                </tr>
                                <tr>
                                    <td>Conversion Factor (FU:PU)</td>
                                    <td>10</td>
                                </tr>
                                <tr>
                                    <td># of PU / month / </td>
                                    <td>1.08</td>
                                    <td>packs</td>
                                </tr>
                                <tr>
                                    <td>QAT estimate for interval (Every _ months)</td>
                                    <td>0.92</td>
                                </tr>
                                <tr>
                                    <td>Consumption interval (Every X months)</td>
                                    <td>2.00</td>
                                </tr>
                                <tr>
                                    <td>How many PU per interval per ?</td>
                                    <td>2.17</td>
                                </tr>
                            </table> */}
                            {/* </div> */}
                            {/* <div className="pt-2"><b>For each  - we need 2.17 [No logo condoms, Pack of 10 condoms] every 2 months</b></div> */}
                            {/* <div className="pt-2"><b>For each  - we need 1.00 [Surgical mask, pack of 5]</b></div> */}
                        </div>
                    </div>}
                </TabPane>
                <TabPane tabId="2">

                </TabPane>

            </>
        );
    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    handleClickMonthBox2 = (e) => {
        this.refs.pickAMonth2.show()
    }
    handleAMonthChange2 = (value, text) => {
        //
        //
    }
    handleAMonthDissmis2 = (value) => {
        this.setState({ singleValue2: value, }, () => {
            // this.fetchData();
        })

    }

    render() {
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
                    titleColor: Colors.RoyalBlue,
                    offset: new Thickness(0, 0, 0, -1),
                    lineWidth: new Thickness(0, 0, 0, 0),
                    opacity: 0,
                    borderColor: Colors.Gray,
                    fillColor: Colors.Gray,
                    lineType: LineType.Dotted
                });
            }
            else if (i % 2 == 0) {
                treeLevelItems.push(new LevelAnnotationConfig({
                    levels: [i],
                    title: "Level " + i,
                    titleColor: Colors.RoyalBlue,
                    offset: new Thickness(0, 0, 0, -1),
                    lineWidth: new Thickness(0, 0, 0, 0),
                    opacity: 0,
                    borderColor: Colors.Gray,
                    fillColor: Colors.Gray,
                    lineType: LineType.Solid
                })
                );
            }
            else {
                treeLevelItems.push(new LevelAnnotationConfig({
                    levels: [i],
                    title: "Level " + i,
                    titleColor: Colors.RoyalBlue,
                    offset: new Thickness(0, 0, 0, -1),
                    lineWidth: new Thickness(0, 0, 0, 0),
                    opacity: 0.08,
                    borderColor: Colors.Gray,
                    fillColor: Colors.Gray,
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
                        <button key="1" className="StyledButton" style={{ width: '23px', height: '23px' }}
                            onClick={(event) => {
                                event.stopPropagation();
                                console.log("add node----", itemConfig);
                                this.setState({
                                    level0: (itemConfig.level == 0 ? false : true),
                                    numberNode: (itemConfig.payload.nodeType.id == 2 ? false : true),
                                    aggregationNode: (itemConfig.payload.nodeType.id == 1 ? false : true),
                                    addNodeFlag: true,
                                    openAddNodeModal: true,
                                    currentItemConfig: {
                                        context: {
                                            level: itemConfig.level,
                                            parent: itemConfig.id,
                                            payload: {
                                                label: {

                                                },
                                                nodeType: {
                                                    id: ''
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
                                                                    tracerCategory: {

                                                                    },
                                                                    unit: {

                                                                    }
                                                                },
                                                                usageType: {

                                                                },
                                                                usagePeriod: {

                                                                },
                                                                repeatUsagePeriod: {

                                                                }
                                                            }
                                                        }
                                                    ]
                                                ]
                                            }
                                        },
                                        parentItem: {
                                            payload: {
                                                label: {
                                                    label_en: (itemConfig.level != 0 ? itemConfig.payload.label.label_en : '')
                                                },
                                                nodeUnit: {
                                                    id: itemConfig.payload.nodeUnit.id
                                                },
                                                nodeDataMap: [
                                                    [
                                                        {
                                                            dataValue: (itemConfig.payload.nodeDataMap[0])[0].dataValue,
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

                                                                }
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
                                });
                                // this.onAddButtonClick(itemConfig);
                            }}>
                            <FontAwesomeIcon icon={faPlus} />
                        </button>}
                    {/* <button key="2" className="StyledButton" style={{ width: '23px', height: '23px' }}
                        onClick={(event) => {
                            event.stopPropagation();
                        }}>
                        <FontAwesomeIcon icon={faEdit} />
                    </button> */}
                    {itemConfig.parent != null &&
                        <>
                            <button key="2" className="StyledButton" style={{ width: '23px', height: '23px' }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                }}>
                                <FontAwesomeIcon icon={faCopy} />
                            </button>


                            <button key="3" className="StyledButton" style={{ width: '23px', height: '23px' }}
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
                                <FontAwesomeIcon icon={faTrash} />
                            </button></>}

                </>
            }),
            // itemTitleFirstFontColor: Colors.White,
            templates: [{
                name: "contactTemplate",
                itemSize: { width: 190, height: 75 },
                minimizedItemSize: { width: 2, height: 2 },
                highlightPadding: { left: 1, top: 1, right: 1, bottom: 1 },
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
            <Row>
                <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                    <Card className="mb-lg-0">
                        <div className="Card-header-reporticon pb-lg-0" style={{ display: 'contents' }}>
                            <div className="card-header-actions">
                                <div className="card-header-actions pr-4 pt-1">

                                </div>
                            </div>
                        </div>
                        <CardBody className="pt-lg-0 pl-lg-0 pr-lg-0">
                            <div className="container-fluid">

                                <Formik
                                    enableReinitialize={true}
                                    initialValues={initialValues}
                                    validate={validate(validationSchema)}
                                    onSubmit={(values, { setSubmitting, setErrors }) => {


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
                                                                        <option value="">{i18n.t('static.common.select')}</option>
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
                                                                <FormGroup className="col-md-3" >
                                                                    <div className="check inline  pl-lg-1 pt-lg-3">
                                                                        <div>
                                                                            <Input
                                                                                className="form-check-input"
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
                                                                                className="form-check-input"
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

                                                            </Row>
                                                        </div>

                                                    </CardBody>
                                                    <div class="sample">
                                                        <Provider>
                                                            <div className="placeholder" style={{ clear: 'both' }} >
                                                                {/* <OrgDiagram centerOnCursor={true} config={config} onHighlightChanged={this.onHighlightChanged} /> */}
                                                                <OrgDiagram centerOnCursor={true} config={config} onCursorChanged={this.onCursoChanged} />
                                                            </div>
                                                        </Provider>
                                                    </div>
                                                    <CardFooter>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        {/* <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button> */}
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.resetTree}><i className="fa fa-refresh"></i>{i18n.t('static.common.reset')}</Button>
                                                    </CardFooter>
                                                </Form>

                                            </>
                                        )} />
                            </div>
                        </CardBody>

                    </Card></Col></Row>
            {/* Modal start------------------- */}
            <Modal isOpen={this.state.openAddNodeModal}
                className={'modal-lg '} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>Add/Edit Node</strong>
                    <Button size="md" onClick={() => this.setState({ openAddNodeModal: false })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
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
                                        Scaling/Transfer
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
                    <Button size="md" onClick={(e) => {
                        this.state.addNodeFlag ? this.onAddButtonClick(this.state.currentItemConfig) : this.updateNodeInfoInJson(this.state.currentItemConfig)
                    }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddNodeModal: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                </ModalFooter>
            </Modal>
            {/* Scenario Modal end------------------------ */}

        </div>
    }
}

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
import '../../views/Forms/ValidationForms/ValidationForms.css'
import { Row, Col, Card, CardFooter, Button, CardBody, Form, Modal, ModalBody, ModalFooter, ModalHeader, FormGroup, Label, FormFeedback, Input, InputGroupAddon, InputGroupText, InputGroup } from 'reactstrap';
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
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, TREE_DIMENSION_ID, SECRET_KEY } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import pdfIcon from '../../assets/img/pdf.png';
import CryptoJS from 'crypto-js'


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
    treeName: ""
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
            itemTitleColor = "#BA0C2F";
        }
    }

    return connectDropTarget(connectDragSource(
        <div className="ContactTemplate" style={{ opacity, backgroundColor: Colors.White, borderColor: Colors.Black }}>
            <div className="ContactTitleBackground"
            >
                <div className="ContactTitle" style={{ color: Colors.Black }}><div title={itemConfig.payload.label.label_en} style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '158px', float: 'left', fontWeight: 'bold' }}>{itemConfig.payload.label.label_en}</div><b style={{ color: '#212721', float: 'right' }}>{itemConfig.payload.nodeType.id == 2 ? <i class="fa fa-hashtag" style={{ fontSize: '11px' }}></i> : (itemConfig.payload.nodeType.id == 3 ? <i class="fa fa-percent " style={{ fontSize: '11px' }} ></i> : (itemConfig.payload.nodeType.id == 4 ? <i class="fa fa-cube" style={{ fontSize: '11px' }} ></i> : (itemConfig.payload.nodeType.id == 5 ? <i class="fa fa-cubes" style={{ fontSize: '11px' }} ></i> : (itemConfig.payload.nodeType.id == 1 ? <i class="fa fa-plus" style={{ fontSize: '11px' }} ></i> : ""))))}</b></div>
            </div>
            <div className="ContactPhone" style={{ color: Colors.Black }}>
                <span style={{ textAlign: 'center', fontWeight: '600' }}>{getPayloadData(itemConfig, 1)}</span>
                <div style={{ marginTop: '10px', overflow: 'inherit', width: '132px' }}><p className="float-lg-right pl-lg-5" style={{ textAlign: 'right' }}>{getPayloadData(itemConfig, 2)}</p></div>
            </div>
            git        </div>
    ))
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

function getPayloadData(itemConfig, type) {
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
        if (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2) {
            if (type == 1) {
                return addCommas((itemConfig.payload.nodeDataMap[0])[0].dataValue);
            } else {
                return "";
            }
        } else {
            if (type == 1) {
                return (itemConfig.payload.nodeDataMap[0])[0].dataValue + "% of parent";
            } else {
                return ((itemConfig.payload.nodeDataMap[0])[0].calculatedDataValue != null ? addCommas((itemConfig.payload.nodeDataMap[0])[0].calculatedDataValue) : "");
            }
        }
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

export default class BuildTree extends Component {
    constructor() {
        super();
        this.state = {
            selectedScenario: '',
            scenarioList: [],
            regionList: [],
            curTreeObj: [],
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
                                            usagePeriodId: 0
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
                }
            },
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
        this.getTracerCategoryList = this.getTracerCategoryList.bind(this);
        this.getForecastMethodList = this.getForecastMethodList.bind(this);
        this.getUnitListForDimensionIdFour = this.getUnitListForDimensionIdFour.bind(this);
        this.getUnitList = this.getUnitList.bind(this);
        this.getUsagePeriodList = this.getUsagePeriodList.bind(this);
        this.getUsageTypeList = this.getUsageTypeList.bind(this);
        this.getUsageTemplateList = this.getUsageTemplateList.bind(this);
        this.getForecastingUnitListByTracerCategory = this.getForecastingUnitListByTracerCategory.bind(this);
        this.getPlanningUnitListByForecastingUnitId = this.getPlanningUnitListByForecastingUnitId.bind(this);
        this.getScenarioList = this.getScenarioList.bind(this);
        this.getTreeList = this.getTreeList.bind(this);
        this.getTreeByTreeId = this.getTreeByTreeId.bind(this);
    }

    getTreeByTreeId(treeId) {
        console.log("treeId---", treeId)
        var curTreeObj = this.state.treeData.filter(x => x.treeId == treeId)[0];
        console.log("curTreeObj---", curTreeObj)
        this.setState({
            curTreeObj,
            scenarioList: curTreeObj.scenarioList,
            regionList: curTreeObj.regionList
        }, () => {
            console.log("my items--->", this.state.items);
        });
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
                for (var i = 0; i < myResult.length; i++) {
                    console.log("inside for---", myResult[i]);
                    if (myResult[i].userId == userId) {
                        console.log("inside if---");
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                        console.log("programData---", programData);
                        var treeList = programData.treeList;
                        for (var k = 0; k < treeList.length; k++) {
                            proList.push(treeList[k])
                        }
                    }
                }
                console.log("pro list---", proList);
                this.setState({
                    treeData: proList
                }, () => {
                    // this.buildJexcel();
                });

            }.bind(this);
        }.bind(this);
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
    getUsageTemplateList() {
        console.log(" get uasge template--------------");
        var tracerCategoryId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id;
        console.log("tracerCategoryId---", tracerCategoryId);
        // var forecastingUnitId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id;
        // console.log("forecastingUnitId---", forecastingUnitId);
        // var usageTypeId = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id;
        // console.log("usageTypeId---", usageTypeId);
        UsageTemplateService.getUsageTemplateListForTree(tracerCategoryId).then(response => {
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
            noOfPersons = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfPersons;
            noOfForecastingUnitsPerPerson = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson;
            usageFrequency = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageFrequency;

            var usageTypeParent = document.getElementById("usageTypeParent");
            selectedText = usageTypeParent.options[usageTypeParent.selectedIndex].text;

            var forecastingUnitUnit = document.getElementById("forecastingUnitUnit");
            selectedText1 = forecastingUnitUnit.options[forecastingUnitUnit.selectedIndex].text;



            if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 || (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.oneTimeUsage != "true") {
                var usagePeriodId = document.getElementById("usagePeriodId");
                selectedText2 = usagePeriodId.options[usagePeriodId.selectedIndex].text;
            }
        }
        // FU
        if (this.state.currentItemConfig.context.payload.nodeType.id == 4) {

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
        } else {
            //PU
            var planningUnitId = document.getElementById("planningUnitId");
            var planningUnit = planningUnitId.options[planningUnitId.selectedIndex].text;
            if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.usageType.id == 1) {
                var sharePu;
                if ((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit == "true") {
                    sharePu = (this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor);
                } else {
                    sharePu = Math.round((this.state.noOfMonthsInUsagePeriod / this.state.conversionFactor));
                }
                usageText = "For each " + "we need " + sharePu + " " + planningUnit;
            } else {
                // need grand parent here 
                var puPerInterval = ((((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod) / this.state.conversionFactor) / (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths);
                usageText = "For each " + "we need " + puPerInterval + " " + planningUnit + " every " + (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.refillMonths + " months";
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
                autocompleteData[i] = { value: response.data[i].forecastingUnitId, label: response.data[i].forecastingUnitId + " | " + response.data[i].label.label_en }
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

    getUsageTemplateList() {
        // const lan = 'en';
        // var db1;
        // var storeOS;
        // getDatabase();
        // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        // openRequest.onsuccess = function (e) {
        //     db1 = e.target.result;
        //     var planningunitTransaction = db1.transaction(['usageTemplate'], 'readwrite');
        //     var planningunitOs = planningunitTransaction.objectStore('usageTemplate');
        //     var planningunitRequest = planningunitOs.getAll();
        //     var planningList = []
        //     planningunitRequest.onerror = function (event) {
        //         // Handle errors!
        //     };
        //     planningunitRequest.onsuccess = function (e) {
        //         var myResult = [];
        //         myResult = planningunitRequest.result;
        //         var proList = []
        //         console.log("myResult===============6", myResult)

        //         this.setState({
        //             usageTemplateList: myResult
        //         }, () => {

        //         })
        //     }.bind(this);
        // }.bind(this)
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
        this.setState({
            treeId: this.props.match.params.treeId,
            templateId: this.props.match.params.templateId
        }, () => {
            this.getTreeList();
            this.getTracerCategoryList();
            this.getForecastMethodList();
            this.getUnitListForDimensionIdFour();
            this.getUnitList();
            this.getUsagePeriodList();
            this.getUsageTypeList();
            this.getUsageTemplateList();
            this.getForecastingUnitListByTracerCategory(22);
            this.getPlanningUnitListByForecastingUnitId(1);

            this.getNodeTyeList();
        })

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
            //             (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (items[i].payload.nodeDataMap[0])[0].dataValue;
            //         } else {

            //             var findNodeIndex = items.findIndex(n => n.id == items[i].parent);
            //             var parentValue = (items[findNodeIndex].payload.nodeDataMap[0])[0].calculatedDataValue;
            //             console.log("api parent value---", parentValue);

            //             (items[i].payload.nodeDataMap[0])[0].calculatedDataValue = (parentValue * (items[i].payload.nodeDataMap[0])[0].dataValue) / 100;
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
    }

    resetTree() {
        this.componentDidMount();
        // this.setState({ items: TreeData.demographic_scenario_two });
    }
    dataChange(event) {
        // alert("hi");
        console.log("event---", event);
        let { curTreeObj } = this.state;
        let { currentItemConfig } = this.state;
        let { treeTemplate } = this.state;


        if (event.target.name == "treeId") {
            curTreeObj.treeId = event.target.value;
            this.getTreeByTreeId(event.target.value);
        }

        if (event.target.name == "scenarioId") {
            console.log("scenario id---", event.target.value)
            this.setState({
                items: (event.target.value != "" ? curTreeObj.tree.flatList : []),
                selectedScenario: event.target.value
            });
            // curTreeObj.treeId = event.target.value;
            // this.getTreeByTreeId(event.target.value);
        }

        if (event.target.name == "active") {
            treeTemplate.active = event.target.id === "active2" ? false : true;
        }

        if (event.target.name === "sharePlanningUnit") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].puNode.sharePlanningUnit = event.target.value;
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
            if (this.state.addNodeFlag !== "true") {
                parentValue = (this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].calculatedDataValue
            } else {
                parentValue = (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue
            }
            console.log("parentValue---", parentValue);
            (currentItemConfig.context.payload.nodeDataMap[0])[0].calculatedDataValue = (event.target.value * parentValue) / 100
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
        // if (event.target.name === "forecastingUnitId") {
        //     (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id = event.target.value;
        //     if (event.target.value != null && event.target.value != "") {
        //         var forecastingUnitId = document.getElementById("forecastingUnitId");
        //         var forecastingUnitLabel = forecastingUnitId.options[forecastingUnitId.selectedIndex].text;
        //         console.log("forecastingUnitLabel---", forecastingUnitLabel);
        //         (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en = forecastingUnitLabel;
        //     }
        //     this.getForecastingUnitUnitByFUId(event.target.value);
        // }

        if (event.target.name === "tracerCategoryId") {
            (currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id = event.target.value;
            this.getUsageTemplateList();
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
        if (itemConfig.context.payload.nodeType.id == 4) {
            (newItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en = (itemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en;
        }
        console.log("add button clicked value after update---", newItem);
        this.setState({
            items: [...items, newItem],
            cursorItem: parseInt(items.length + 1)
        }, () => {
            console.log("on add items-------", this.state.items);
            // var getAllAggregationNode = this.state.items.filter(c => c.payload.nodeType.id == 1);
            // console.log(">>>", getAllAggregationNode);
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
                this.getNodeTypeFollowUpList(data.context.level == 0 ? 0 : data.parentItem.payload.nodeType.id);
                if (data.context.payload.nodeType.id == 4) {
                    this.getForecastingUnitListByTracerCategoryId((data.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.tracerCategory.id);
                    // this.getNoOfMonthsInUsagePeriod();
                    this.getNodeUnitOfPrent();
                    this.getNoOfFUPatient();
                    console.log("on curso nofuchanged---", this.state.noOfFUPatient)
                    this.getNoOfMonthsInUsagePeriod();
                    this.getNoFURequired();
                    console.log("no -----------------");
                } else if (data.context.payload.nodeType.id == 5) {
                    console.log("fu id edit---", (data.parentItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id);
                    this.getPlanningUnitListByFUId((data.parentItem.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id);
                    // this.getUsageText();
                    // this.getConversionFactor((data.context.payload.nodeDataMap[0])[0].puNode.planningUnit.id);
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
                                                    : this.state.currentItemConfig.parentItem.payload.label.label_en}
                                            ></Input>
                                        </FormGroup>}
                                    <FormGroup>
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
                                    <FormGroup>
                                        <Label htmlFor="currencyId">Node Type<span class="red Reqasterisk">*</span></Label>
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

                                        <FormGroup>
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
                                            <FormFeedback className="red">{errors.nodeUnitId}</FormFeedback>
                                        </FormGroup>}
                                    <FormGroup>
                                        <Label htmlFor="currencyId">{i18n.t('static.common.month')}<span class="red Reqasterisk">*</span></Label>
                                        <div className="controls edit">
                                            <Picker
                                                id="month"
                                                name="month"
                                                ref="pickAMonth2"
                                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                value={{ year: new Date((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).getFullYear(), month: ("0" + (new Date((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).getMonth() + 1)).slice(-2) }}
                                                lang={pickerLang.months}
                                                theme="dark"
                                                onChange={this.handleAMonthChange2}
                                                onDismiss={this.handleAMonthDissmis2}
                                            >
                                                <MonthBox value={this.makeText({ year: new Date((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).getFullYear(), month: ("0" + (new Date((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].month).getMonth() + 1)).slice(-2) })}
                                                    onClick={this.handleClickMonthBox2} />
                                            </Picker>
                                        </div>
                                    </FormGroup>

                                    {this.state.numberNode &&
                                        <>
                                            <FormGroup>
                                                <Label htmlFor="currencyId">Percentage of Parent<span class="red Reqasterisk">*</span></Label>
                                                <Input type="text"
                                                    id="percentageOfParent"
                                                    name="percentageOfParent"
                                                    valid={!errors.percentageOfParent && (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue != ''}
                                                    invalid={touched.percentageOfParent && !!errors.percentageOfParent}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                    step={.01}
                                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].dataValue}></Input>
                                                <FormFeedback className="red">{errors.percentageOfParent}</FormFeedback>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="currencyId">Parent Value<span class="red Reqasterisk">*</span></Label>
                                                <Input type="text"
                                                    id="parentValue"
                                                    name="parentValue"
                                                    readOnly={true}
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    value={this.state.addNodeFlag != "true" ? addCommas((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].calculatedDataValue) : addCommas(this.state.parentValue)}
                                                ></Input>
                                            </FormGroup></>}
                                    {this.state.aggregationNode &&
                                        <FormGroup>
                                            <Label htmlFor="currencyId">Node Value<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                id="nodeValue"
                                                name="nodeValue"
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
                                                                value={addCommas(this.state.converionFactor / ((this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod))}>

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
                                                    <Label htmlFor="currencyId">{(this.state.currentItemConfig.parentItem.payload.nodeDataMap[0])[0].fuNode.usageType.id == 2 ? "How many PU per interval per ?" : "How many PU per usage per ?"}<span class="red Reqasterisk">*</span></Label>
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
                                                <div className="controls "
                                                >
                                                    <Autocomplete
                                                        id="forecastingUnitId"
                                                        name="forecastingUnitId"
                                                        value={{ value: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id, label: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en }}
                                                        defaultValue={{ value: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id, label: (this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.label.label_en }}
                                                        options={this.state.autocompleteData}
                                                        getOptionLabel={(option) => option.label}
                                                        style={{ width: 450 }}
                                                        onChange={(event, value) => {
                                                            console.log("combo 2 ro combo box---", value);
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
                                                    <FormGroup className="col-md-2">
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
                                                    </FormGroup>
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
                                                                    value={(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.repeatUsagePeriod.usagePeriodId}>

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
                                            <div style={{ clear: 'both', width: '100%' }}>
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
                                                            <td># of FU / month / {this.state.nodeUnitList.filter(c => c.unitId == document.getElementById('usageTypeParent').value)[0].label.label_en}</td>
                                                            <td>{addCommas((this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.noOfForecastingUnitsPerPerson / this.state.noOfMonthsInUsagePeriod)}</td>
                                                        </tr>
                                                    </table>}
                                                {(this.state.currentItemConfig.context.payload.nodeDataMap[0])[0].fuNode.usageType.id == 1 &&
                                                    <table className="table table-bordered">
                                                        <tr>
                                                            <td># of FU / {this.state.nodeUnitList.filter(c => c.unitId == document.getElementById('usageTypeParent').value)[0].label.label_en}</td>
                                                            <td>{addCommas(this.state.noOfFUPatient)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td># of FU / month / {this.state.nodeUnitList.filter(c => c.unitId == document.getElementById('usageTypeParent').value)[0].label.label_en}</td>
                                                            <td>{addCommas(this.state.noOfMonthsInUsagePeriod)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td># of FU required</td>
                                                            <td>{addCommas(this.state.noFURequired)}</td>
                                                        </tr>
                                                    </table>}
                                            </div>
                                            <div className="col-md-12 pt-2 pl-2"><b>{this.state.usageText}</b></div>
                                        </div>
                                    </div>}
                                    {/* disabled={!isValid} */}
                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAllNodeData(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                </Form>
                            )} />
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
        this.refs.pickAMonth2.eq(0).show();
    }
    handleAMonthChange2 = (year, month) => {
        console.log("value>>>", year);
        console.log("text>>>", month)
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
        console.log("dismiss>>", value);
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
                        <button key="1" type="button" className="StyledButton" style={{ width: '23px', height: '23px' }}
                            onClick={(event) => {
                                console.log("add button called---------");
                                event.stopPropagation();
                                console.log("add node----", itemConfig);
                                this.setState({
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

                                    this.getNodeTypeFollowUpList(itemConfig.payload.nodeType.id);
                                    if (itemConfig.payload.nodeType.id == 4) {
                                        console.log("fu id---", (itemConfig.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id);
                                        this.getPlanningUnitListByFUId((itemConfig.payload.nodeDataMap[0])[0].fuNode.forecastingUnit.id);
                                        this.getNoOfFUPatient();
                                        this.getNoOfMonthsInUsagePeriod();
                                    } else {


                                    }
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
                            <button key="2" type="button" className="StyledButton" style={{ width: '23px', height: '23px' }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.duplicateNode(itemConfig);
                                }}>
                                <FontAwesomeIcon icon={faCopy} />
                            </button>


                            <button key="3" type="button" className="StyledButton" style={{ width: '23px', height: '23px' }}
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
            <AuthenticationServiceComponent history={this.props.history} />
            <h5 style={{ color: "red" }} id="div2">
                {i18n.t(this.state.message, { entityname })}</h5>
            <Row>
                <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                    <Card className="mb-lg-0">
                        <div className="pb-lg-0">
                            <div className="card-header-actions">
                                <div className="card-header-action pr-4 pt-lg-0">
                                    <Col md="12 pl-0">
                                        <div className="d-md-flex">
                                            <FormGroup className="tab-ml-1 mt-md-0 mb-md-0 ">
                                                <a className="pr-lg-1" href="javascript:void();" title={i18n.t('static.common.addEntity')} onClick={() => {
                                                    this.setState({
                                                        openTreeDataModal: true
                                                    })
                                                }}><i className="fa fa-plus-square"></i></a>
                                                <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginTop: '-10px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')}
                                                // onClick={() => this.exportPDF(columns)} 
                                                />
                                            </FormGroup>

                                        </div>
                                    </Col>
                                </div>
                            </div>
                        </div>
                        <CardBody className="pt-lg-0 pl-lg-0 pr-lg-0">
                            <div className="container-fluid">

                                <Formik
                                    enableReinitialize={true}
                                    initialValues={{
                                        forecastMethodId: this.state.treeTemplate.forecastMethod.id,
                                        treeName: this.state.treeTemplate.label.label_en
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
                                                                notes: (item.payload.nodeDataMap[0])[0].notes
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
                                                            message: i18n.t(response.data.messageCode, { entityname }),
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
                                                    console.log("after updating tree---", response.data);
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
                                                            message: i18n.t(response.data.messageCode, { entityname }),
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
                                                                {/* <FormGroup className="col-md-3 pl-lg-0" style={{ marginBottom: '0px' }}>
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
                                                                </FormGroup> */}
                                                                <FormGroup className="col-md-3 pl-lg-0" style={{ marginBottom: '0px' }}>
                                                                    <Label htmlFor="languageId" style={{ visibility: 'hidden' }}>{'Forecast Method'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="select"
                                                                        name="treeId"
                                                                        id="treeId"
                                                                        bsSize="sm"
                                                                        required
                                                                        onChange={(e) => { this.dataChange(e) }}
                                                                    >
                                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                                        {treeList}
                                                                    </Input>
                                                                    {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                                </FormGroup>
                                                                <FormGroup className="col-md-3 pl-lg-0">

                                                                    <Label htmlFor="languageId">{'Scenario'}<span class="red Reqasterisk">*</span></Label>
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
                                                                        // value={this.state.user.language.languageId}
                                                                        >
                                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                                            {scenarios}
                                                                        </Input>
                                                                        <InputGroupAddon addonType="append">
                                                                            <InputGroupText><i class="fa fa-plus icons" aria-hidden="true" data-toggle="tooltip" data-html="true" data-placement="bottom" onClick={() => {
                                                                                this.setState({
                                                                                    openAddScenarioModal: true
                                                                                })
                                                                            }} title=""></i></InputGroupText>
                                                                        </InputGroupAddon>
                                                                    </InputGroup>
                                                                    {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                                </FormGroup>
                                                                <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Date'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="languageId"
                                                                        id="languageId"
                                                                        bsSize="sm"
                                                                        // valid={!errors.languageId && this.state.user.language.languageId != ''}
                                                                        // invalid={touched.languageId && !!errors.languageId}
                                                                        // onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        // onBlur={handleBlur}
                                                                        required
                                                                    // value={this.state.user.language.languageId}
                                                                    >
                                                                    </Input>
                                                                    {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
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
                                                            <div className="placeholder" style={{ clear: 'both', height: '100vh' }} >
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
            {/* tree fields Modal start------------------- */}
            <Modal isOpen={this.state.openTreeDataModal}
                className={'modal-md '} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>Add/Edit Tree Data</strong>
                    <Button size="md" onClick={() => this.setState({ openTreeDataModal: false })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                </ModalHeader>
                <ModalBody>
                    <FormGroup className="col-md-12">
                        <Label htmlFor="currencyId">Forecast Method<span class="red Reqasterisk">*</span></Label>
                        <Input
                            type="select"
                            name="nodeTypeId"
                            bsSize="sm"
                            onChange={(e) => { this.nodeTypeChange(e) }}
                            required
                            value={this.state.currentItemConfig.valueType}
                        >
                            <option value="-1">Nothing Selected</option>
                            <option value="1">Demographic Method</option>
                            <option value="2">surgical mask, 1 mask</option>
                        </Input>
                    </FormGroup>
                    <FormGroup className="col-md-12">
                        <Label htmlFor="currencyId">Tree Name<span class="red Reqasterisk">*</span></Label>
                        <Input type="text"
                            id="scenarioDesc"
                            name="scenarioDesc"
                            onChange={(e) => { this.scenarioChange(e) }}
                        // value={this.state.scenario.scenarioDesc}
                        ></Input>
                    </FormGroup>
                    <FormGroup className="col-md-12">
                        <Label htmlFor="currencyId">Region<span class="red Reqasterisk">*</span></Label>
                        <Input
                            type="select"
                            name="nodeTypeId"
                            bsSize="sm"
                            onChange={(e) => { this.nodeTypeChange(e) }}
                            required
                            value={this.state.currentItemConfig.valueType}
                        >
                            <option value="-1">Nothing Selected</option>
                            <option value="1">Region A</option>
                            <option value="2">surgical mask, 1 mask</option>
                        </Input>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button type="submit" size="md" onClick={(e) => { this.addScenario() }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openTreeFieldsModal: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                </ModalFooter>
            </Modal>
            {/* Scenario Modal start------------------- */}
            <Modal isOpen={this.state.openAddScenarioModal}
                className={'modal-md '} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>Add/Edit Scenario</strong>
                    <Button size="md" onClick={() => this.setState({ openAddScenarioModal: false })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label htmlFor="currencyId">Scenario Name<span class="red Reqasterisk">*</span></Label>
                        <Input type="text"
                            id="scenarioName"
                            name="scenarioName"
                            onChange={(e) => { this.scenarioChange(e) }}
                        // value={this.state.scenario.scenarioName}
                        ></Input>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="currencyId">Notes</Label>
                        <Input type="text"
                            id="scenarioDesc"
                            name="scenarioDesc"
                            onChange={(e) => { this.scenarioChange(e) }}
                        // value={this.state.scenario.scenarioDesc}
                        ></Input>
                    </FormGroup>

                </ModalBody>
                <ModalFooter>
                    <Button type="submit" size="md" onClick={(e) => { this.addScenario() }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddScenarioModal: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                </ModalFooter>
            </Modal>
            {/* Modal end------------------------ */}
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
                    {/* <Button size="md" onClick={(e) => {
                        this.state.addNodeFlag ? this.onAddButtonClick(this.state.currentItemConfig) : this.updateNodeInfoInJson(this.state.currentItemConfig)
                    }} color="success" className="submitBtn float-right mr-1" type="button"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddNodeModal: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button> */}
                </ModalFooter>
            </Modal>
            {/* Scenario Modal end------------------------ */}

        </div>
    }
}

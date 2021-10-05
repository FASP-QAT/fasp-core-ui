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
import csvicon from '../../assets/img/csv.png'
import pdfIcon from '../../assets/img/pdf.png';

const ItemTypes = {
    NODE: 'node'
}

let initialValues = {
    forecastMethod: "",
    treeName: "",
    regions: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        forecastMethod: Yup.string()
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
        // return connectDropTarget(connectDragSource(
        <div className="ContactTemplate" style={{ opacity, backgroundColor: itemConfig.nodeBackgroundColor, borderColor: itemConfig.nodeBorderColor }}>
            <div className="ContactTitleBackground"
            // style={{ backgroundColor: itemTitleColor }}
            >
                <div className="ContactTitle" style={{ color: itemConfig.titleTextColor }}><b>{itemConfig.title}</b></div>
            </div>
            {/* <div className="ContactPhotoFrame">
                <img className="ContactPhoto" src={itemConfig.image} alt={itemConfig.title} />
              </div> */}
            <div className="ContactPhone">{itemConfig.nodeValue}</div>
            {/* <div className="ContactEmail">{itemConfig.nodeValue}</div>
              <div className="ContactDescription">{itemConfig.nodeValue}</div> */}
        </div>
        // <div className="ContactTemplate" style={{ opacity, backgroundColor: itemConfig.nodeBackgroundColor, borderColor: itemConfig.nodeBorderColor }}>
        //     <div className="ContactTitleBackground" style={{ backgroundColor: itemConfig.itemTitleColor }}>
        //         <div className="ContactTitle" style={{ color: itemConfig.titleTextColor }}><b>{itemConfig.title}</b></div>
        //     </div>
        //     <div className="ContactPhone" style={{ color: itemConfig.nodeValueColor, left: '2px', top: '31px', width: '95%', height: '36px' }}>{itemConfig.nodeValue}</div>
        //     {/* <div className="ContactLabel" style={{right:'13px'}}>{itemConfig.label}</div> */}
        // </div>
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

export default class BuildTree extends Component {
    constructor() {
        super();
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
        this.addTreeData = this.addTreeData.bind(this);
        this.state = {
            openTreeDataModal: false,
            modalOpen: false,
            title: '',
            cursorItem: 0,
            openAddScenarioModal: false,
            highlightItem: 0,
            items: TreeData.demographic_scenario_one,
            currentItemConfig: {},
            activeTab1: new Array(2).fill('1')
        }
    }
    addTreeData() {
        this.setState({

        });
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

        } else if (nodeTypeId == 2) {
            console.log("case 2")
            this.setState({
                displayParentData: true
            });
        }
        else if (nodeTypeId == 3) {
            this.setState({
                displayUsage: true
            });
        }
        else if (nodeTypeId == 4) {
            this.setState({
                displayPlanningUnit: true
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
        if (event.target.name === "nodeTitle") {
            currentItemConfig.title = event.target.value;
        }
        if (event.target.name === "nodeValueType") {
            currentItemConfig.valueType = event.target.value;
        }
        this.setState({ currentItemConfig: currentItemConfig });
    }
    onAddButtonClick(itemConfig) {
        this.setState({ openAddNodeModal: true });
        // const { items } = this.state;
        // var newItem = {
        //     id: parseInt(items.length + 1),
        //     parent: itemConfig.id,
        //     title: "New Title",
        //     description: "New Description"
        //     // image: "/react/photos/z.png"
        // };

        // this.setState({
        //     items: [...items, newItem],
        //     cursorItem: newItem.id
        // });
    }
    onRemoveButtonClick(itemConfig) {
        const { items } = this.state;

        this.setState(this.getDeletedItems(items, [itemConfig.id]));
    }
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
        this.setState({ openAddNodeModal: true });
        // const { context: item } = data;
        // const { config } = this.state;
        // if (item != null) {

        //     this.setState({
        //         title: item.title,
        //         config: {
        //             ...config,
        //             // highlightItem: item.id,
        //             // cursorItem: item.id
        //         },
        //         highlightItem: item.id,
        //         cursorItem: item.id
        //     }, () => {
        //         console.log("highlighted item---", this.state)
        //     })
        // }
    };

    updateNodeInfoInJson(currentItemConfig) {
        var nodes = this.state.items;
        var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.id);
        nodes[findNodeIndex].title = currentItemConfig.title;
        nodes[findNodeIndex].valueType = currentItemConfig.valueType;
        this.setState({
            items: nodes,
            modalOpen: false,
        }, () => {
            console.log("updated tree data+++", this.state);
        });
    }

    tabPane1() {
        return (
            <>
                <TabPane tabId="1">
                    <Form>
                        <FormGroup>
                            <Label htmlFor="currencyId">Scenario</Label>
                            <Input type="text"
                                name="nodeTitle"
                                bsSize="sm"
                                readOnly={true}
                                // value={this.state.currentItemConfig.title}>
                                value={'Scenario 1'}>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="currencyId">Parent</Label>
                            <Input type="text"
                                name="nodeTitle"
                                bsSize="sm"
                                readOnly={true}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'Men who use Condoms'}
                            // value={''}
                            >
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="currencyId">Node Title<span class="red Reqasterisk">*</span></Label>
                            <Input type="text"
                                name="nodeTitle"
                                bsSize="sm"
                                onChange={(e) => { this.dataChange(e) }}
                                // value={this.state.currentItemConfig.title}></Input>
                                // value={'People with malaria'}></Input>
                                value={'No logo condoms	'}></Input>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="currencyId">Node Type<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                name="nodeTypeId"
                                bsSize="sm"
                                onChange={(e) => { this.nodeTypeChange(e) }}
                                required
                                value={this.state.currentItemConfig.valueType}
                            >
                                <option value="-1">Nothing Selected</option>
                                <option value="1">Number Node</option>
                                <option value="2">Percentage Node</option>
                                <option value="3">Aggregation Node</option>
                                <option value="4">Forecasting Unit Node</option>
                                <option value="5">Planning Unit Node</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="currencyId">Node Unit<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                name="nodeTypeId"
                                bsSize="sm"
                                onChange={(e) => { this.nodeTypeChange(e) }}
                                required
                                readOnly={true}
                                value={this.state.currentItemConfig.valueType}
                            >
                                <option value="-1">Nothing Selected</option>
                                <option value="1">Patients</option>
                                <option value="2">Clients</option>
                                <option value="3">Customers</option>
                                <option value="4">People</option>
                                <option value="5">Condom</option>
                                <option value="6">Packs</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="currencyId">Month<span class="red Reqasterisk">*</span></Label>
                            <Input type="text"
                                name="nodeTitle"
                                onChange={(e) => { this.dataChange(e) }}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'Jan-21'}></Input>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="currencyId">Percentage of Parent<span class="red Reqasterisk">*</span></Label>
                            <Input type="text"
                                name="nodeTitle"
                                readOnly={true}
                                onChange={(e) => { this.dataChange(e) }}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'36.8%'}></Input>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="currencyId">Parent Value For Jan-21<span class="red Reqasterisk">*</span></Label>
                            <Input type="text"
                                name="nodeTitle"
                                onChange={(e) => { this.dataChange(e) }}
                                readOnly={true}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'45,373,410'}></Input>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="currencyId">Node Value for Percentage of Parent<span class="red Reqasterisk">*</span></Label>
                            <Input type="text"
                                name="nodeTitle"
                                onChange={(e) => { this.dataChange(e) }}
                                readOnly={true}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'16,702,403'}></Input>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="currencyId">Notes</Label>
                            <Input type="textarea"
                                name="nodeTitle"
                                onChange={(e) => { this.dataChange(e) }}
                                value={this.state.currentItemConfig.title}></Input>
                        </FormGroup>
                        {/* {this.state.displayUsage &&
                        <FormGroup>
                            <Label htmlFor="currencyId">Usage<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                name="nodeValueType"
                                bsSize="sm"
                                onChange={(e) => { this.dataChange(e) }}
                                required
                                value={this.state.currentItemConfig.valueType}
                            >
                                <option value="-1">Nothing Selected</option>
                                <option value="1">Condoms</option>
                            </Input>
                        </FormGroup>
                    }
                    {this.state.displayPlanningUnit &&
                        <FormGroup>
                            <Label htmlFor="currencyId">Planning Unit<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                name="nodeValueType"
                                bsSize="sm"
                                onChange={(e) => { this.dataChange(e) }}
                                required
                                value={this.state.currentItemConfig.valueType}
                            >
                                <option value="-1">Nothing Selected</option>
                                <option value="1">No logo condoms pack of 500</option>
                            </Input>
                        </FormGroup>
                    }

                    {this.state.displayParentData &&
                        <>

                            <FormGroup>
                                <Label htmlFor="currencyId">Parent Value<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    name="nodeTitle"
                                    readOnly={true}
                                    onChange={(e) => { this.dataChange(e) }}
                                    value={this.state.currentItemConfig.title}></Input>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="currencyId">Percentage Of Parent<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    name="nodeTitle"
                                    onChange={(e) => { this.dataChange(e) }}
                                    value={this.state.currentItemConfig.title}></Input>
                            </FormGroup></>} */}
                    </Form>

                    <div className="row">

                        {/* <FormGroup className="col-md-4">
                            <Label htmlFor="currencyId">Tracer Category<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                name="nodeTypeId"
                                bsSize="sm"
                                onChange={(e) => { this.nodeTypeChange(e) }}
                                required
                                value={this.state.currentItemConfig.valueType}
                            >
                                <option value="-1">Nothing Selected</option>
                                <option value="1">Continuous</option>
                                <option value="2">Discrete</option>
                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-4">
                            <Label htmlFor="currencyId">Forecasting Unit<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                name="nodeTypeId"
                                bsSize="sm"
                                onChange={(e) => { this.nodeTypeChange(e) }}
                                required
                                value={this.state.currentItemConfig.valueType}
                            >
                                <option value="-1">Nothing Selected</option>
                                <option value="1">no logo condoms</option>
                                <option value="2">surgical mask, 1 mask</option>
                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-4">
                            <Label htmlFor="currencyId">Copy from Template<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                name="nodeTypeId"
                                bsSize="sm"
                                onChange={(e) => { this.nodeTypeChange(e) }}
                                required
                                value={this.state.currentItemConfig.valueType}
                            >
                                <option value="-1">Nothing Selected</option>
                                <option value="1">IUDs</option>
                                <option value="2">Discrete</option>
                            </Input>
                        </FormGroup> */}
                        <FormGroup className="col-md-12">
                            <Label htmlFor="currencyId">Type<span class="red Reqasterisk">*</span></Label>
                            <Input
                                type="select"
                                name="nodeTypeId"
                                bsSize="sm"
                                onChange={(e) => { this.nodeTypeChange(e) }}
                                required
                                value={this.state.currentItemConfig.valueType}
                            >
                                <option value="-1">Nothing Selected</option>
                                <option value="1">Continuous</option>
                                <option value="2">Discrete</option>
                            </Input>
                        </FormGroup>
                        {/* <FormGroup className="col-md-6">
                            <Label htmlFor="currencyId">Lag in months (0=immediate)<span class="red Reqasterisk">*</span></Label>
                            <Input type="text"
                                bsSize="sm"
                                name="nodeTitle"
                                onChange={(e) => { this.dataChange(e) }}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'0'}></Input>
                        </FormGroup> */}
                    </div>
                    <div className="row">

                        <FormGroup className="col-md-2">
                            <Label htmlFor="currencyId">Forecasting unit<span class="red Reqasterisk">*</span></Label>

                        </FormGroup>

                        <FormGroup className="col-md-10">
                            {/* <Label htmlFor="currencyId">Copy from Template<span class="red Reqasterisk">*</span></Label> */}
                            <Input type="text"
                                name="nodeTitle"
                                bsSize="sm"
                                readOnly={true}
                                onChange={(e) => { this.dataChange(e) }}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'surgical mask, 1 mask'}>

                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-2">
                            <Label htmlFor="currencyId"># of FU / usage / Patient<span class="red Reqasterisk">*</span></Label>

                        </FormGroup>
                        <FormGroup className="col-md-5">
                            <Input type="text"
                                name="nodeTitle"
                                bsSize="sm"
                                readOnly={true}
                                onChange={(e) => { this.dataChange(e) }}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'2.17'}></Input>
                        </FormGroup>
                        <FormGroup className="col-md-5">
                            <Input type="text"
                                name="nodeTitle"
                                bsSize="sm"
                                readOnly={true}
                                onChange={(e) => { this.dataChange(e) }}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'mask'}></Input>
                        </FormGroup>

                        <FormGroup className="col-md-2">
                            <Label htmlFor="currencyId">Planning Unit<span class="red Reqasterisk">*</span></Label>

                        </FormGroup>
                        <FormGroup className="col-md-10">
                            <Input
                                type="select"
                                name="nodeTypeId"
                                bsSize="sm"
                                onChange={(e) => { this.nodeTypeChange(e) }}
                                required
                                value={this.state.currentItemConfig.valueType}
                            >
                                <option value="-1">Surgical mask,pack of 5</option>
                                <option value="1">Yes</option>
                                <option value="2">No</option>
                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-2">
                            <Label htmlFor="currencyId">Conversion Factor (FU:PU)<span class="red Reqasterisk">*</span></Label>

                        </FormGroup>
                        <FormGroup className="col-md-10">
                            {/* <Label htmlFor="currencyId">Copy from Template<span class="red Reqasterisk">*</span></Label> */}
                            <Input
                                type="text"
                                name="nodeTypeId"
                                bsSize="sm"
                                readOnly={true}
                                onChange={(e) => { this.nodeTypeChange(e) }}
                                required
                                value={'5'}
                            >

                            </Input>
                        </FormGroup>

                        <FormGroup className="col-md-2">
                            <Label htmlFor="currencyId"># of PU / usage / <span class="red Reqasterisk">*</span></Label>

                        </FormGroup>
                        <FormGroup className="col-md-5">
                            <Input type="text"
                                name="nodeTitle"
                                bsSize="sm"
                                readOnly={true}
                                onChange={(e) => { this.dataChange(e) }}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'0.43'}></Input>
                        </FormGroup>
                        <FormGroup className="col-md-5">
                            {/* <Label htmlFor="currencyId">Copy from Template<span class="red Reqasterisk">*</span></Label> */}
                            <Input type="text"
                                name="nodeTitle1"
                                bsSize="sm"
                                readOnly={true}
                                onChange={(e) => { this.dataChange(e) }}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'packs'}>
                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-2">
                            <Label htmlFor="currencyId">Will Clients share one PU?<span class="red Reqasterisk">*</span></Label>

                        </FormGroup>
                        <FormGroup className="col-md-10">
                            {/* <Label htmlFor="currencyId">Copy from Template<span class="red Reqasterisk">*</span></Label> */}
                            <Input
                                type="select"
                                name="nodeTypeId"
                                bsSize="sm"
                                onChange={(e) => { this.nodeTypeChange(e) }}
                                required
                                value={''}
                            >
                                <option>No</option>
                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-2">
                            <Label htmlFor="currencyId">How many PU per usage per ?	<span class="red Reqasterisk">*</span></Label>

                        </FormGroup>
                        <FormGroup className="col-md-10">
                            {/* <Label htmlFor="currencyId">Copy from Template<span class="red Reqasterisk">*</span></Label> */}
                            <Input
                                type="text"
                                name="nodeTypeId"
                                bsSize="sm"
                                readOnly={true}
                                onChange={(e) => { this.nodeTypeChange(e) }}
                                required
                                value={'1.00'}
                            >

                            </Input>
                        </FormGroup>
                        
                    </div>
                    {/* <div className="row">

                        <FormGroup className="col-md-2">
                            <Label htmlFor="currencyId">Every<span class="red Reqasterisk">*</span></Label>

                        </FormGroup>
                        <FormGroup className="col-md-5">
                            <Input type="text"
                                name="nodeTitle"
                                bsSize="sm"
                                readOnly="readOnly"
                                onChange={(e) => { this.dataChange(e) }}
                                // value={this.state.currentItemConfig.title}></Input>
                                value={'1'}>

                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-5">
                             <Label htmlFor="currencyId">Copy from Template<span class="red Reqasterisk">*</span></Label> 
                    {/* <Input type="text" */}
                    {/* name="nodeTitle" */}
                    {/* bsSize="sm" */}
                    {/* onChange={(e) => { this.dataChange(e) }} */}
                    {/* // value={this.state.currentItemConfig.title}></Input> */}
                    {/* value={'Clients'}> */}

                    {/* </Input>
                </FormGroup>
                <FormGroup className="col-md-2"> */}
                    {/* <Label htmlFor="currencyId">requires<span class="red Reqasterisk">*</span></Label> */}

                    {/* </FormGroup>
                <FormGroup className="col-md-5">
                    <Input type="text"
                        name="nodeTitle"
                        bsSize="sm"
                        onChange={(e) => { this.dataChange(e) }}
                        // value={this.state.currentItemConfig.title}></Input>
                        value={'130'}></Input>
                </FormGroup> */}
                    {/* <FormGroup className="col-md-5">
                    {/* <Label htmlFor="currencyId">Copy from Template<span class="red Reqasterisk">*</span></Label> */}
                    {/* <Input type="text"
                        name="nodeTitle"
                        bsSize="sm"
                        readOnly="readOnly"
                        onChange={(e) => { this.dataChange(e) }}
                        // value={this.state.currentItemConfig.title}></Input>
                        value={'condom'}>

                    </Input>
                </FormGroup>
                <FormGroup className="col-md-2">
                    <Label htmlFor="currencyId">every<span class="red Reqasterisk">*</span></Label>

                </FormGroup>
                <FormGroup className="col-md-5">
                    <Input type="text"
                        name="nodeTitle"
                        bsSize="sm"
                        readOnly="readOnly"
                        onChange={(e) => { this.dataChange(e) }}
                        // value={this.state.currentItemConfig.title}></Input>
                        value={'1'}></Input>
                </FormGroup>
                <FormGroup className="col-md-5">
                   
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
                </FormGroup> 
            </div>  */}
                    < div className="col-md-12" >

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
        </table>  */}

                        {/* <div className="pt-2"><b>For each  - we need 2.17 [No logo condoms, Pack of 10 condoms] every 2 months</b></div> */}
                        <div className="pt-2"><b>For each  - we need 1.00 [Surgical mask, pack of 5]</b></div>
                    </div >

                </TabPane >
                <TabPane tabId="2">

                </TabPane>

            </>
        );
    }

    render() {
        console.log("this.state+++", this.state);
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
                    {/* <button key="1" className="StyledButton" style={{ width: '23px', height: '23px' }}
                    onClick={(event) => {
                        event.stopPropagation();
                        this.onAddButtonClick(itemConfig);
                    }}>
                    <FontAwesomeIcon icon={faPlus} />
                </button> */}
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
                        <div className="pb-lg-0">
                            <div className="card-header-actions">
                                <div className="card-header-action pr-4 pt-lg-0">
                                    {/* <a href="javascript:void();" title={i18n.t('static.common.addEntity')} onClick={this.buildTree}><i className="fa fa-plus-square"></i></a> */}
                                    <Col md="12 pl-0">
                                        <div className="d-md-flex">
                                            {/* <FormGroup className="tab-ml-1 mt-md-1 mb-md-0 "> */}
                                            {/* <a href="javascript:void();" title={i18n.t('static.common.addEntity')} onClick={this.buildTree}><i className="fa fa-plus-square"></i></a> */}
                                            {/* </FormGroup> */}
                                            <FormGroup className="tab-ml-1 mt-md-0 mb-md-0 ">
                                                <a className="pr-lg-1" href="javascript:void();" title={i18n.t('static.common.addEntity')} onClick={() => {
                                                    this.setState({
                                                        openTreeDataModal: true
                                                    })
                                                }}><i className="fa fa-plus-square"></i></a>
                                                <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginTop: '-10px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')}
                                                // onClick={() => this.exportPDF(columns)} 
                                                />
                                                <img style={{ height: '25px', width: '25px', cursor: 'pointer', marginTop: '-10px' }} src={csvicon} title={i18n.t('static.report.exportCsv')}
                                                // onClick={() => this.exportCSV(columns)} 
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
                                                                    <Label htmlFor="languageId" style={{ visibility: 'hidden' }}>{'Forecast Method'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="select"
                                                                        name="languageId"
                                                                        id="languageId"
                                                                        bsSize="sm"
                                                                        required
                                                                    >
                                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                                        <option value="">{'BEN-Con/PRH-MOH[Condoms - Demographic]'}</option>
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
                                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                                            <option value="">{'Scenario 1'}</option>
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
                                                                <FormGroup className="col-md-3" >
                                                                    <div className="check inline  pl-lg-1 pt-lg-3">
                                                                        <div>
                                                                            <Input
                                                                                className="form-check-input"
                                                                                type="checkbox"
                                                                                id="active6"
                                                                                name="active"
                                                                                checked={false}
                                                                            // onChange={(e) => { this.dataChangeCheckbox(e) }}
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
                                                                                id="active6"
                                                                                name="active"
                                                                                checked={false}
                                                                            // onChange={(e) => { this.dataChangeCheckbox(e) }}
                                                                            />
                                                                            <Label
                                                                                className="form-check-label"
                                                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                                                <b>{'Hide Forecasting Unit & Planning Unit'}</b>
                                                                            </Label>
                                                                        </div>
                                                                    </div>
                                                                </FormGroup>
                                                                {/* <FormGroup check inline>
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id="active6"
                                                                        name="active"
                                                                        checked={false}
                                                                    // onChange={(e) => { this.dataChangeCheckbox(e) }}
                                                                    />
                                                                    <Label
                                                                        className="form-check-label"
                                                                        check htmlFor="inline-radio2">
                                                                        <b>{'Hide Forecasting Unit & Planning Unit'}</b>
                                                                    </Label>
                                                                </FormGroup> */}
                                                            </Row>
                                                        </div>
                                                        {/* <div className="col-md-12 pl-lg-0 pt-lg-3"> */}
                                                        {/* <Row> */}
                                                        {/* <FormGroup className=""> */}
                                                        {/* <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Forecast Method'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="select"
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
                                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                                        <option value="">{'Demographic'}</option>
                                                                    </Input>
                                                                    {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                        {/* </FormGroup> */}
                                                        {/* </FormGroup> */}
                                                        {/* <FormGroup className="pl-3"> */}
                                                        {/* <FormGroup className="col-md-3">
                                                                    <Label htmlFor="languageId">{'Tree Name'}<span class="red Reqasterisk">*</span></Label>
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
                                                        {/* </FormGroup> */}
                                                        {/* <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Region'}<span class="red Reqasterisk">*</span></Label>
                                                                    <Input
                                                                        type="select"
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
                                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                                        <option value="">{'Region A'}</option>
                                                                    </Input>
                                                                    {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                        {/* </FormGroup> */}
                                                        {/* <FormGroup className="col-md-3 pl-lg-0">

                                                                    <Label htmlFor="languageId">{'Scenario'}<span class="red Reqasterisk">*</span></Label>
                                                                    <InputGroup>
                                                                        {/* <InputGroupAddon addonType="append">
                                                                        <InputGroupText><i class="fa fa-plus icons" aria-hidden="true" data-toggle="tooltip" data-html="true" data-placement="bottom" onClick={this.showPopUp} title=""></i></InputGroupText>
                                                                    </InputGroupAddon> */}
                                                        {/* <Input
                                                                            type="select"
                                                                            name="languageId"
                                                                            id="languageId"
                                                                            bsSize="sm"
                                                                            // valid={!errors.languageId && this.state.user.language.languageId != ''}
                                                                            // invalid={touched.languageId && !!errors.languageId}
                                                                            // onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                            // onBlur={handleBlur}
                                                                            // required
                                                                        // value={this.state.user.language.languageId}
                                                                        >
                                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                                            <option value="">{'Scenario 1'}</option>
                                                                        </Input>
                                                                        <InputGroupAddon addonType="append">
                                                                            <InputGroupText><i class="fa fa-plus icons" aria-hidden="true" data-toggle="tooltip" data-html="true" data-placement="bottom" onClick={this.showPopUp} title=""></i></InputGroupText>
                                                                        </InputGroupAddon>
                                                                    </InputGroup> */}
                                                        {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                        {/* </FormGroup> */}
                                                        {/* <FormGroup className="col-md-3 pl-lg-0">
                                                                    <Label htmlFor="languageId">{'Date'}</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="languageId"
                                                                        id="languageId"
                                                                        bsSize="sm"
                                                                        // valid={!errors.languageId && this.state.user.language.languageId != ''}
                                                                        // invalid={touched.languageId && !!errors.languageId}
                                                                        // onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                        // onBlur={handleBlur}
                                                                        // required
                                                                    // value={this.state.user.language.languageId}
                                                                    > */}
                                                        {/* </Input> */}
                                                        {/* <FormFeedback>{errors.languageId}</FormFeedback> */}
                                                        {/* </FormGroup> */}
                                                        {/* </Row> */}
                                                        {/* </div> */}
                                                    </CardBody>
                                                </Form>
                                                <div class="sample">
                                                    <Provider>
                                                        <div className="placeholder" style={{ clear: 'both' }} >
                                                            {/* <OrgDiagram centerOnCursor={true} config={config} onHighlightChanged={this.onHighlightChanged} /> */}
                                                            <OrgDiagram centerOnCursor={true} config={config} onCursorChanged={this.onCursoChanged} />
                                                        </div>
                                                    </Provider>
                                                </div>
                                            </>
                                        )} />
                            </div>
                        </CardBody>
                        <CardFooter>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => { console.log("tree json ---", this.state.items) }}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.resetTree}><i className="fa fa-refresh"></i>{i18n.t('static.common.reset')}</Button>
                        </CardFooter>
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
                    <Button type="submit" size="md" onClick={(e) => { this.updateNodeInfoInJson(this.state.currentItemConfig) }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddNodeModal: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                </ModalFooter>
            </Modal>
            {/* Scenario Modal end------------------------ */}

        </div>
    }
}

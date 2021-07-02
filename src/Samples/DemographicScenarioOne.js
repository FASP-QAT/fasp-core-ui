import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType, LevelAnnotationConfig, AnnotationType, LineType, Thickness } from 'basicprimitives';
import { DndProvider, DropTarget, DragSource } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faEdit, faDigitalTachograph } from '@fortawesome/free-solid-svg-icons'
import i18n from '../i18n'
import { Col, Row, Card, Button, FormGroup, Label, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import TreeData from './TreeData';
import CardBody from 'reactstrap/lib/CardBody';
import CardFooter from 'reactstrap/lib/CardFooter';
import Provider from '../Samples/Provider';

const ItemTypes = {
    NODE: 'node'
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
        <div className="ContactTemplate" style={{ opacity, backgroundColor: itemConfig.nodeBackgroundColor, borderColor: itemConfig.nodeBorderColor }}>
            <div className="ContactTitleBackground" style={{ backgroundColor: itemConfig.itemTitleColor }}>
                <div className="ContactTitle" style={{ color: itemConfig.titleTextColor }}><b>{itemConfig.title}</b></div>
            </div>
            {itemConfig.nodeType == 1 &&
                <div className="ContactPhone" style={{ color: itemConfig.nodeValueColor, left: '2px', top: '31px', width: '95%', height: '36px' }}>{(itemConfig.nodePercentage != '' ? itemConfig.nodePercentage + "% = " : '') + Math.round(itemConfig.nodeValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
            }
            {itemConfig.nodeType == 2 &&
                <div className="ContactPhone" style={{ color: itemConfig.nodeValueColor, left: '2px', top: '31px', width: '95%', height: '36px' }}>{itemConfig.dosageSet.dosage.forecastingUnit.label.label_en + " " + itemConfig.dosageSet.dosage.noOfTimesPerDay + "/day " + itemConfig.dosageSet.dosage.noOfDaysPerMonth + "/ month =" + itemConfig.dosageSet.dosage.totalQuantity}</div>
            }
            {/* <div className="ContactLabel" style={{right:'13px'}}>{itemConfig.label}</div> */}
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

export default class DemographicScenarioOne extends Component {
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
        this.onEditButtonClick = this.onEditButtonClick.bind(this);
        this.editNode = this.editNode.bind(this);
        this.state = {
            openAddNodeModal: false,
            openEditNodeModal: false,
            title: '',
            cursorItem: 0,
            highlightItem: 0,
            nodeDetail: '',
            items: TreeData.demographic_scenario_one,
            currentItemConfig: {
                nodeType: -1,
                nodeValueType: -1,
                dosageSet: {
                    dosageSetId: '-1',
                    dosage: {
                        forecastingUnit: { id: '-1' },
                        fuPerApplication: '',
                        noOfTimesPerDay: '',
                        chronic: '',
                        noOfDaysPerMonth: ''
                    }
                }
            }
        }
    }
    resetTree() {
        // console.log("in reset>>>", TreeData.demographic_scenario_one);
        window.location.reload();
    }
    dataChange(event) {
        // alert("hi");
        let { currentItemConfig } = this.state;
        if (event.target.name === "nodeTitle") {
            currentItemConfig.title = event.target.value;
        }
        if (event.target.name === "nodeValueType") {
            currentItemConfig.nodeValueType = event.target.value;
        }
        if (event.target.name === "nodeType") {
            currentItemConfig.nodeType = event.target.value;
        }
        if (event.target.name === "percentage") {
            currentItemConfig.nodePercentage = event.target.value;
        }
        // if (event.target.name === "dosage") {
        //     currentItemConfig.dosage = event.target.value;
        // }
        if (event.target.name === "dosageSet") {
            currentItemConfig.dosageSet.dosageSetId = event.target.value;
        }
        if (event.target.name === "scaling") {
            currentItemConfig.scaling = event.target.value;
        }
        if (event.target.name === "forecastingUnit") {
            currentItemConfig.dosageSet.dosage.forecastingUnit.id = event.target.value;
        }
        if (event.target.name === "fuPerApplication") {
            currentItemConfig.dosageSet.dosage.fuPerApplication = event.target.value;
        }
        if (event.target.name === "noOfTimesPerDay") {
            currentItemConfig.dosageSet.dosage.noOfTimesPerDay = event.target.value;
        }
        if (event.target.name === "noOfDaysPerMonth") {
            currentItemConfig.dosageSet.dosage.noOfDaysPerMonth = event.target.value;
        }
        this.setState({ currentItemConfig: currentItemConfig });
    }
    onAddButtonClick(itemConfig) {
        this.setState({ openAddNodeModal: true, openEditNodeModal: false, clickedParnetNodeId: itemConfig.id, clickedParnetNodeValue: itemConfig.nodeValue });

    }
    addNode() {
        const { items } = this.state;
        var calculateValue = parseInt(this.state.clickedParnetNodeValue) * this.state.currentItemConfig.nodePercentage / 100;
        // console.log(">>>", parseInt(this.state.clickedParnetNodeValue));
        // console.log(">>>", this.state.currentItemConfig.nodePercentage / 100);
        var newItem = {
            id: parseInt(items.length + 1),
            parent: this.state.clickedParnetNodeId,
            title: this.state.currentItemConfig.title,
            nodePercentage: this.state.currentItemConfig.nodePercentage,
            nodeValue: calculateValue,
            nodeType: this.state.currentItemConfig.nodeType,
            description: "",
            itemTitleColor: Colors.White,
            titleTextColor: Colors.Black,
            // dosage: this.state.currentItemConfig.dosage,

            nodeValueColor: this.state.currentItemConfig.nodeType == 2 ? Colors.White : Colors.Black,
            nodeBackgroundColor: this.state.currentItemConfig.nodeType == 2 ? Colors.Black : Colors.White,
            borderColor: this.state.currentItemConfig.nodeType == 2 ? Colors.White : Colors.Black,

            dosageSet: {
                dosageSetId: this.state.currentItemConfig.dosageSet.dosageSetId,
                label: {
                    id: '123',
                    label_en: 'Condoms'
                },
                dosage: {
                    forecastingUnit: {
                        id: this.state.currentItemConfig.dosageSet.dosage.forecastingUnit.id,
                        label: {
                            id: '456',
                            label_en: 'Male Condom (Latex) Lubricated, No Logo, 49 mm Male Condom'
                        }
                    },
                    fuPerApplication: this.state.currentItemConfig.dosageSet.dosage.fuPerApplication,
                    noOfTimesPerDay: this.state.currentItemConfig.dosageSet.dosage.noOfTimesPerDay,
                    chronic: false,
                    noOfDaysPerMonth: this.state.currentItemConfig.dosageSet.dosage.noOfDaysPerMonth,
                    totalQuantity: parseInt(this.state.currentItemConfig.dosageSet.dosage.noOfDaysPerMonth) * parseInt(this.state.clickedParnetNodeValue)

                }
            },
            scaling: this.state.currentItemConfig.scaling,

            nodeValueType: this.state.currentItemConfig.nodeValueType
        };

        this.setState({
            items: [...items, newItem],
            cursorItem: newItem.id,
            openAddNodeModal: false,
            currentItemConfig: { nodeType: -1, nodeValueType: -1 }
        });
    }

    onEditButtonClick(item) {
        // console.log("***", item);
        this.setState({
            openAddNodeModal: false,
            currentItemConfig: {
                id: item.id,
                parent: item.parent,
                title: item.title,
                nodePercentage: item.nodePercentage,
                nodeValue: item.nodeValue,
                nodeType: item.nodeType,
                nodeValueType: item.nodeValueType,
                description: "",
                // dosage: item.dosage,
                dosageSet: {
                    dosageSetId: item.dosageSet.dosageSetId,
                    dosage: {
                        forecastingUnit: {
                            id: item.dosageSet.dosage.forecastingUnit.id
                        },
                        fuPerApplication: item.dosageSet.dosage.fuPerApplication,
                        noOfTimesPerDay: item.dosageSet.dosage.noOfTimesPerDay,
                        chronic: item.dosageSet.dosage.chronic,
                        noOfDaysPerMonth: item.dosageSet.dosage.noOfDaysPerMonth
                    }
                },
                scaling: item.scaling,
            },
            openEditNodeModal: true,
        });
    }
    editNode(currentItemConfig) {
        var nodes = this.state.items;
        var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.id);
        nodes[findNodeIndex].nodePercentage = currentItemConfig.nodePercentage;
        nodes[findNodeIndex].dosage = currentItemConfig.dosage;

        if (currentItemConfig.parent != null) {
            var parent_Node = nodes.filter(c => c.id == currentItemConfig.parent);
            var parentNodeValue = parseInt(parent_Node[0].nodeValue);
            var calculateValue = parentNodeValue * currentItemConfig.nodePercentage / 100;
            nodes[findNodeIndex].nodeValue = calculateValue;
        }
        var getChildNodeList = nodes.filter(c => c.parent >= currentItemConfig.id);
        for (var p = 0; p < getChildNodeList.length; p++) {
            var parent_Node = nodes.filter(c => c.id == getChildNodeList[p].parent);
            var parentNodeValue = parseInt(parent_Node[0].nodeValue);
            var findNodeIndex = nodes.findIndex(n => n.id == getChildNodeList[p].id);
            var calculateValue = parentNodeValue * getChildNodeList[p].nodePercentage / 100;
            nodes[findNodeIndex].nodeValue = calculateValue;
        }

        this.setState({
            items: nodes,
            openEditNodeModal: false,
        }, () => {
            console.log("updated tree data+++", this.state);
        });
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
        const { config } = this.state;
        if (item != null) {
            this.setState({
                nodeDetail: item.nodeType == 2 ? item.dosageSet.dosage.forecastingUnit.label.label_en + " " + item.dosageSet.dosage.noOfTimesPerDay + "/day " + item.dosageSet.dosage.noOfDaysPerMonth + "/ month =" + item.dosageSet.dosage.totalQuantity : '',
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

    updateNodeInfoInJson(currentItemConfig) {
        var nodes = this.state.items;
        var findNodeIndex = nodes.findIndex(n => n.id == currentItemConfig.id);
        nodes[findNodeIndex].title = currentItemConfig.title;
        nodes[findNodeIndex].valueType = currentItemConfig.valueType;
        this.setState({
            items: nodes,
            modalOpen: false,
        }, () => {
            // console.log("updated tree data+++", this.state);
        });
    }


    render() {
        // console.log("this.state+++", this.state);
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
            onButtonsRender: (({ context: itemConfig }) => {
                return <>  <button key="1" className="StyledButton" style={{ width: '23px', height: '23px' }}
                    onClick={(event) => {
                        event.stopPropagation();
                        this.onAddButtonClick(itemConfig);
                    }}>
                    <FontAwesomeIcon icon={faPlus} />
                </button>
                    <button key="2" className="StyledButton" style={{ width: '23px', height: '23px' }}
                        onClick={(event) => {
                            event.stopPropagation();
                            this.onEditButtonClick(itemConfig);
                        }}>
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button key="4" className="StyledButton" style={{ width: '23px', height: '23px' }}>
                        <FontAwesomeIcon icon={faDigitalTachograph} />
                    </button>

                    {itemConfig.parent != null &&
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
                        </button>}

                </>
            }),
            orientationType: OrientationType.Top,
            defaultTemplateName: "contactTemplate",
            linesColor: Colors.Black,
            annotations: treeLevelItems,
            // itemTitleFirstFontColor: Colors.White,
            templates: [{
                name: "contactTemplate",
                itemSize: { width: 190, height: 100 },
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
                        <CardBody>
                            <div className="container">
                                <div class="sample">
                                    {/* <h3>DragNDrop Tree.</h3> */}
                                    {/* <DndProvider backend={HTML5Backend} > */}
                                    <Provider>
                                        <div className="placeholder" style={{ clear: 'both' }} >
                                            {/* <OrgDiagram centerOnCursor={true} config={config} onHighlightChanged={this.onHighlightChanged} /> */}
                                            <OrgDiagram centerOnCursor={true} config={config} onCursorChanged={this.onCursoChanged} />
                                        </div>
                                    </Provider>
                                    {/* </DndProvider> */}
                                </div>

                            </div>
                            <h6>{this.state.nodeDetail}</h6>
                        </CardBody>
                        <CardFooter>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => { console.log("tree json ---", this.state.items) }}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.resetTree}><i className="fa fa-refresh"></i>{i18n.t('static.common.reset')}</Button>
                        </CardFooter>
                    </Card></Col></Row>
            {/* Add Modal start------------------- */}
            <Modal isOpen={this.state.openAddNodeModal}
                className={'modal-md '} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>Add Node</strong>
                    <Button size="md" onClick={() => this.setState({ openAddNodeModal: false, currentItemConfig: { nodeType: -1, nodeValueType: -1 } })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label htmlFor="currencyId">Node Title<span class="red Reqasterisk">*</span></Label>
                        <Input type="text"
                            name="nodeTitle"
                            onChange={(e) => { this.dataChange(e) }}
                        ></Input>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="currencyId">Scaling</Label>
                        <Input
                            type="select"
                            name="scaling"
                            bsSize="sm"
                            onChange={(e) => { this.dataChange(e) }}
                            required
                        >
                            <option value="-1">Nothing Selected</option>
                            <option value="1">Linear growth of 1%</option>
                            <option value="2">Constant</option>
                            <option value="3">Linear growth of 1.5%</option>
                            <option value="4">Linear growth of 0.76%</option>

                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="currencyId">Node Type<span class="red Reqasterisk">*</span></Label>
                        <Input
                            type="select"
                            name="nodeType"
                            bsSize="sm"
                            onChange={(e) => { this.dataChange(e) }}
                            required
                        >
                            <option value="-1">Nothing Selected</option>
                            <option value="1">Regular node</option>
                            <option value="2">Dosage Set</option>
                            <option value="3">PU conversion</option>

                        </Input>
                    </FormGroup>
                    {this.state.currentItemConfig.nodeType == 2 && <FormGroup>
                        <Label htmlFor="currencyId">Dosage Set<span class="red Reqasterisk">*</span></Label>
                        <Input
                            type="select"
                            name="dosageSet"
                            bsSize="sm"
                            onChange={(e) => { this.dataChange(e) }}
                            required
                        >
                            <option value="-1">Nothing Selected</option>
                            <option value="1">Condoms</option>


                        </Input>
                    </FormGroup>}
                    {this.state.currentItemConfig.nodeType == 1 && <FormGroup>
                        <Label htmlFor="currencyId">Node Value Type</Label>
                        <Input
                            type="select"
                            name="nodeValueType"
                            bsSize="sm"
                            onChange={(e) => { this.dataChange(e) }}
                            required
                        >
                            <option value="-1">Nothing Selected</option>
                            <option value="1">Percentage</option>
                            <option value="2">Derived value</option>
                            {/*<option value="3">Use Expression (y=mx+c)</option>
                            <option value="4">Forecasting Unit</option> */}
                        </Input>
                    </FormGroup>}
                    {(this.state.currentItemConfig.nodeType == 1 && this.state.currentItemConfig.nodeValueType == 1) &&
                        <FormGroup>
                            <Label htmlFor="currencyId">Enter Percentage<span class="red Reqasterisk">*</span></Label>
                            <Input type="text"
                                name="percentage"
                                onChange={(e) => { this.dataChange(e) }}
                            ></Input>
                        </FormGroup>
                    }
                    {this.state.currentItemConfig.nodeType == 2 &&
                        <>
                            <FormGroup>
                                <Label htmlFor="currencyId">Forecasting Unit</Label>
                                <Input
                                    type="select"
                                    name="forecastingUnit"
                                    bsSize="sm"
                                    onChange={(e) => { this.dataChange(e) }}
                                    required
                                >
                                    <option value="-1">Nothing Selected</option>
                                    <option value="1">Male Condom (Latex) Lubricated, No Logo, 49 mm Male Condom</option>
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="currencyId">FU per application<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    name="fuPerApplication"
                                    onChange={(e) => { this.dataChange(e) }}
                                ></Input>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="currencyId">No of time per day<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    name="noOfTimesPerDay"
                                    onChange={(e) => { this.dataChange(e) }}
                                ></Input>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="currencyId">No of days per month<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    name="noOfDaysPerMonth"
                                    onChange={(e) => { this.dataChange(e) }}
                                ></Input>
                            </FormGroup>
                        </>
                    }
                </ModalBody>
                <ModalFooter>
                    <Button type="submit" size="md" onClick={(e) => { this.addNode() }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openAddNodeModal: false, currentItemConfig: { nodeType: -1, nodeValueType: -1 } })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                </ModalFooter>
            </Modal>
            {/* Add Modal end------------------------ */}

            {/* edit modal start---------------------- */}
            <Modal isOpen={this.state.openEditNodeModal}
                className={'modal-md '} >
                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                    <strong>Edit Node</strong>
                    <Button size="md" onClick={() => this.setState({ openEditNodeModal: false })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label htmlFor="currencyId">Node Title<span class="red Reqasterisk">*</span></Label>
                        <Input type="text"
                            name="nodeTitle"
                            onChange={(e) => { this.dataChange(e) }}
                            value={this.state.currentItemConfig.title}
                        ></Input>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="currencyId">Scaling</Label>
                        <Input
                            type="select"
                            name="scaling"
                            bsSize="sm"
                            onChange={(e) => { this.dataChange(e) }}
                            required
                            value={this.state.currentItemConfig.scaling}
                        >
                            <option value="-1">Nothing Selected</option>
                            <option value="1">Linear growth of 1%</option>
                            <option value="2">Constant</option>
                            <option value="3">Linear growth of 1.5%</option>
                            <option value="4">Linear growth of 0.76%</option>
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="currencyId">Node Type<span class="red Reqasterisk">*</span></Label>
                        <Input
                            type="select"
                            name="nodeType"
                            bsSize="sm"
                            onChange={(e) => { this.dataChange(e) }}
                            required
                            value={this.state.currentItemConfig.nodeType}
                        >
                            <option value="-1">Nothing Selected</option>
                            <option value="1">Regular node</option>
                            <option value="2">Dosage Set</option>
                            <option value="3">PU conversion</option>

                        </Input>
                    </FormGroup>
                    {this.state.currentItemConfig.nodeType == 2 && <FormGroup>
                        <Label htmlFor="currencyId">Dosage Set<span class="red Reqasterisk">*</span></Label>
                        <Input
                            type="select"
                            name="dosageSet"
                            bsSize="sm"
                            onChange={(e) => { this.dataChange(e) }}
                            required
                            value={this.state.currentItemConfig.dosageSet.dosageSetId}
                        >
                            <option value="-1">Nothing Selected</option>
                            <option value="1">Condoms</option>


                        </Input>
                    </FormGroup>}
                    {this.state.currentItemConfig.nodeType == 1 && <FormGroup>
                        <Label htmlFor="currencyId">Node Value Type</Label>
                        <Input
                            type="select"
                            name="nodeValueType"
                            bsSize="sm"
                            onChange={(e) => { this.dataChange(e) }}
                            required
                            value={this.state.currentItemConfig.nodeValueType}
                        >
                            <option value="-1">Nothing Selected</option>
                            <option value="1">Percentage</option>
                            <option value="2">Derived value</option>
                            {/*<option value="3">Use Expression (y=mx+c)</option>
                            <option value="4">Forecasting Unit</option> */}
                        </Input>
                    </FormGroup>}

                    {(this.state.currentItemConfig.nodeType == 1 && this.state.currentItemConfig.nodeValueType == 1) &&
                        <FormGroup>
                            <Label htmlFor="currencyId">Enter Percentage<span class="red Reqasterisk">*</span></Label>
                            <Input type="text"
                                name="percentage"
                                onChange={(e) => { this.dataChange(e) }}
                                value={this.state.currentItemConfig.nodePercentage}
                            ></Input>
                        </FormGroup>
                    }
                    {this.state.currentItemConfig.nodeType == 2 &&
                        <> <FormGroup>
                            <Label htmlFor="currencyId">Forecasting Unit</Label>
                            <Input
                                type="select"
                                name="nodeValueType"
                                bsSize="sm"
                                onChange={(e) => { this.dataChange(e) }}
                                required
                                value={this.state.currentItemConfig.dosageSet.dosage.forecastingUnit.id}

                            >
                                <option value="-1">Nothing Selected</option>
                                <option value="1">Male Condom (Latex) Lubricated, No Logo, 49 mm Male Condom</option>
                            </Input>
                        </FormGroup>
                            <FormGroup>
                                <Label htmlFor="currencyId">FU per application<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    name="fuPerApplication"
                                    // onChange={(e) => { this.dataChange(e) }}
                                    value={this.state.currentItemConfig.dosageSet.dosage.fuPerApplication}
                                ></Input>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="currencyId">No of time per day<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    name="noOfTimesPerDay"
                                    // onChange={(e) => { this.dataChange(e) }}
                                    value={this.state.currentItemConfig.dosageSet.dosage.noOfTimesPerDay}
                                ></Input>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="currencyId">No of days per month<span class="red Reqasterisk">*</span></Label>
                                <Input type="text"
                                    name="noOfDaysPerMonth"
                                    // onChange={(e) => { this.dataChange(e) }}
                                    value={this.state.currentItemConfig.dosageSet.dosage.noOfDaysPerMonth}
                                ></Input>
                            </FormGroup>
                        </>

                    }

                </ModalBody>
                <ModalFooter>
                    <Button type="submit" size="md" onClick={(e) => { this.editNode(this.state.currentItemConfig) }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>
                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ openEditNodeModal: false, currentItemConfig: { nodeType: -1, nodeValueType: -1 } })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                </ModalFooter>
            </Modal>
        </div>
    }
}

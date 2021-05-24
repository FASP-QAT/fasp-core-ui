import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType } from 'basicprimitives';
import { DndProvider, DropTarget, DragSource } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'
import i18n from '../i18n'
import { Col, Row, Card, Button, FormGroup, Label, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import TreeData from './TreeData';
import CardBody from 'reactstrap/lib/CardBody';
import CardFooter from 'reactstrap/lib/CardFooter';


export default class ContainerTwo extends Component {
    constructor() {
        super();
        this.onRemoveItem = this.onRemoveItem.bind(this);
        this.canDropItem = this.canDropItem.bind(this);
        this.onMoveItem = this.onMoveItem.bind(this);

        this.onAddButtonClick = this.onAddButtonClick.bind(this);
        this.onRemoveButtonClick = this.onRemoveButtonClick.bind(this);
        this.onHighlightChanged = this.onHighlightChanged.bind(this);

        this.dataChange = this.dataChange.bind(this);
        this.updateNodeInfoInJson = this.updateNodeInfoInJson.bind(this);
        this.state = {
            modalOpen: false,
            title: '',
            cursorItem: 0,
            highlightItem: 0,
            items: TreeData.node_data,
            currentItemConfig: {}
        }
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
        const { items } = this.state;
        var newItem = {
            id: parseInt(items.length + 1),
            parent: itemConfig.id,
            title: "New Title",
            description: "New Description"
            // image: "/react/photos/z.png"
        };

        this.setState({
            items: [...items, newItem],
            cursorItem: newItem.id
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


    render() {
        console.log("this.state+++", this.state);
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
                <div className="ContactTemplate" style={{ opacity }}>
                    <div className="ContactTitleBackground" style={{ backgroundColor: itemTitleColor }}>
                        <div className="ContactTitle">{itemConfig.title}</div>
                    </div>
                    {/* <div className="ContactPhotoFrame">
                  <img className="ContactPhoto" src={itemConfig.image} alt={itemConfig.title} />
                </div> */}
                    <div className="ContactPhone">{itemConfig.phone}</div>
                    <div className="ContactEmail">{itemConfig.email}</div>
                    <div className="ContactDescription">{itemConfig.description}</div>
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

        const config = {
            ...this.state,
            pageFitMode: PageFitMode.Enabled,
            // pageFitMode: PageFitMode.None,
            highlightItem: 0,
            hasSelectorCheckbox: Enabled.True,
            hasButtons: Enabled.True,
            buttonsPanelSize: 40,
            onButtonsRender: (({ context: itemConfig }) => {
                return <>
                    <button key="2" className="StyledButton"
                        onClick={(event) => {
                            event.stopPropagation();
                            this.setState({
                                modalOpen: true,
                                currentItemConfig: itemConfig,
                            })
                        }}>
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button key="1" className="StyledButton"
                        onClick={(event) => {
                            event.stopPropagation();
                            this.onAddButtonClick(itemConfig);
                        }}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                    {itemConfig.parent != null &&
                        <button key="3" className="StyledButton"
                            onClick={(event) => {
                                event.stopPropagation();
                                // var result = confirm("Are you sure you want to delete this node?");
                                // if (result) {
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
                                // }
                                // alert(`User clicked on delete button for node ${itemConfig.title}`)
                            }}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>}
                </>
            }),
            orientationType: OrientationType.Top,
            defaultTemplateName: "contactTemplate",
            templates: [{
                name: "contactTemplate",
                itemSize: { width: 220, height: 120 },
                minimizedItemSize: { width: 3, height: 3 },
                highlightPadding: { left: 2, top: 2, right: 2, bottom: 2 },
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
                                    <DndProvider backend={HTML5Backend}>
                                        <div className="placeholder" style={{ clear: 'both' }} >
                                            <OrgDiagram centerOnCursor={true} config={config} onHighlightChanged={this.onHighlightChanged} />
                                            
                                            {/* modal start---------------- */}
                                            <Modal isOpen={this.state.modalOpen}
                                                className={'modal-md '} >
                                                <ModalHeader className="modalHeaderSupplyPlan hideCross">
                                                    <strong>Edit Node</strong>
                                                    <Button size="md" onClick={() => this.setState({ modalOpen: false })} color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
                                                </ModalHeader>
                                                <ModalBody>
                                                    <FormGroup>
                                                        <Label htmlFor="currencyId">Node Title<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="nodeTitle"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            value={this.state.currentItemConfig.title}></Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="currencyId">Value Type<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="nodeValueType"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                            required
                                                            value={this.state.currentItemConfig.valueType}
                                                        >
                                                            <option value="-1">Nothing Selected</option>
                                                            <option value="1">Percentage</option>
                                                            <option value="2">Derived value</option>
                                                            <option value="3">Use Expression (y=mx+c)</option>
                                                            <option value="4">Forecasting Unit</option>
                                                        </Input>
                                                    </FormGroup>
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button type="submit" size="md" onClick={(e) => { this.updateNodeInfoInJson(this.state.currentItemConfig) }} color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>
                                                    <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.setState({ modalOpen: false })}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                </ModalFooter>
                                            </Modal>
                                            {/* ------------------modal end */}
                                        </div>
                                    </DndProvider>
                                </div>
                            </div>
                        </CardBody>
                        <CardFooter>
                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => { console.log("tree json ---", this.state.items) }}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                        </CardFooter>
                    </Card></Col></Row>
        </div>
    }
}

import React from "react";
import "./style.css";
import "../../../node_modules/jexcel/dist/jexcel.css";
import SortableTree, {
    getFlatDataFromTree,
    getTreeFromFlatData,
    getNodeAtPath, addNodeUnderParent, removeNodeAtPath
} from "react-sortable-tree";
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, FormText, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import 'react-sortable-tree/style.css'; // This only needs to be imported once in your app
import i18n from '../../i18n';


let initialData = [
    { id: 1, name: "All Product Category", parentId: null, active: true, expanded: true },
    { id: 2, name: "HIV Treatment Products", parentId: 1, active: true, expanded: true },
    { id: 3, name: "Malaria Treatment Products", parentId: 1, active: true, expanded: true },
    { id: 4, name: "Corona treatment Products", parentId: 1, active: false, expanded: true },
    { id: 5, name: "Corona P1", parentId: 4, active: false, expanded: true },
    { id: 6, name: "HIV P1", parentId: 2, active: true, expanded: true },
    { id: 7, name: "HIV P2", parentId: 2, active: true, expanded: true },
    { id: 8, name: "Malaria P1", parentId: 3, active: true, expanded: true },
    { id: 9, name: "Corona P2", parentId: 4, active: false, expanded: true }
];

export default class AddProductCategory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            treeData: getTreeFromFlatData({
                flatData: initialData.map(node => ({ ...node, title: node.name })),
                getKey: node => node.id, // resolve a node's key
                getParentKey: node => node.parentId, // resolve a node's parent's key
                rootKey: null // The value of the parent key when there is no parent (i.e., at root level)
            }),
            nodename: '',
            maxId: 10,//this will come from api the max id of table
            message: ''
        };
        this.submitTree = this.submitTree.bind(this);
        this.addNewNode = this.addNewNode.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.disableNode = this.disableNode.bind(this);
        this.enableNode = this.enableNode.bind(this);
        this.setTreeData = this.setTreeData.bind(this);
        console.log("initial data to be passed to this tree ---->",initialData);
    }



    componentDidMount = function () {
        const data = getFlatDataFromTree({
            treeData: this.state.treeData,
            getNodeKey: ({ node }) => node.id,
            ignoreCollapsed: false
        });
    };

    submitTree() {
        // console.log("in submit method");
        let dataAfterSubmit = getFlatDataFromTree({
            treeData: this.state.treeData,
            getNodeKey: ({ node }) => node.id,
            ignoreCollapsed: false
        });
        let finalValues = [];
        dataAfterSubmit.map(key => {
            var json = { id: key.node.id, name: key.node.name, parentId: key.parentNode == null ? '' : key.parentNode.id, active: key.node.active }
            finalValues.push(json);
        })
        console.log("final data of sorted tree to be send for api----->", finalValues);
    }
    dataChange(event) {
        this.setState({ nodename: event.target.value });
    }
    addNewNode() {
        initialData.push({ id: this.state.maxId, name: this.state.nodename, parentId: null, active: true });
        this.setState({ nodename: '' });//node name blank afer adding it to tree
        this.setState({
            treeData: getTreeFromFlatData({
                getKey: node => node.id, // resolve a node's key
                getParentKey: node => node.parentId, // resolve a node's parent's key
                flatData: initialData.map(node => ({ ...node, title: node.name })),
                rootKey: null // The value of the parent key when there is no parent (i.e., at root level)
            }),
            maxId: parseInt(this.state.maxId) + 1
        });
    }

    disableNode(rowInfo) {

        initialData.map(node => {
            if (node.id == rowInfo.node.id || node.parentId == rowInfo.node.id) {
                node.active = false;
            } else {

            }
        });

        this.setState({
            treeData: getTreeFromFlatData({
                getKey: node => node.id, // resolve a node's key
                getParentKey: node => node.parentId, // resolve a node's parent's key
                flatData: initialData.map(node => ({ ...node, title: node.name })),
                rootKey: null // The value of the parent key when there is no parent (i.e., at root level)
            }),
        });
    }
    enableNode(rowInfo) {

        initialData.map(node => {
            if (node.id == rowInfo.node.id && rowInfo.parentNode.active == true) {
                node.active = true;
            } else if (node.id == rowInfo.node.id && rowInfo.parentNode.active == false) {
                this.setState({ message: 'Sorry The Parent Is Disabled !' });
            }
        });

        this.setState({
            treeData: getTreeFromFlatData({
                getKey: node => node.id, // resolve a node's key
                getParentKey: node => node.parentId, // resolve a node's parent's key
                flatData: initialData.map(node => ({ ...node, title: node.name })),
                rootKey: null // The value of the parent key when there is no parent (i.e., at root level)
            }),
        });
    }

    setTreeData(treeData) {
        let treeDataChanged=treeData.treeData;
        // console.log("tree data----------->", treeData)
        let updatedTreeData = getFlatDataFromTree({
            treeData: treeDataChanged,
            getNodeKey: ({ node }) => node.id,
            ignoreCollapsed: false
        });

        // console.log("update------->",updatedTreeData);
        updatedTreeData.map(update => {
            initialData.map(node => {
                if (node.id == update.node.id && update.parentNode !=null && update.parentNode.active == true) {
                    node.parentId = update.parentNode.id;
                }
            });
        })
        this.setState({
            treeData: getTreeFromFlatData({
                getKey: node => node.id, // resolve a node's key
                getParentKey: node => node.parentId, // resolve a node's parent's key
                flatData: initialData.map(node => ({ ...node, title: node.name })),
                rootKey: null // The value of the parent key when there is no parent (i.e., at root level)
            }),
        });

    }
    render() {
        return (
            <div className="animated fadeIn">
                <h5>{this.state.message}</h5>
                <Row>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader> <i className="icon-note"></i><strong>Add Product Category</strong></CardHeader>
                            <CardBody>
                                <FormGroup>
                                    <Row>
                                        <Col md={8}>
                                            <Label for="product category">Product Category Name</Label>
                                            <Input type="text" value={this.state.nodename} onChange={this.dataChange} name="newNode" />
                                        </Col>
                                        <Col md={2} style={{ paddingTop: '29px' }}>
                                            <Button type="button" size="sm" color="info" onClick={this.addNewNode}><i className="fa fa-plus"></i>Add</Button>
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="product category">Product Category Tree</Label>
                                    <div style={{ height: 450 }}>
                                        <SortableTree
                                            getNodeKey={({ node }) => node.id}
                                            treeData={this.state.treeData}
                                            generateNodeProps={rowInfo => {
                                                if (rowInfo.node.active == true) {
                                                    let nodeprops = {
                                                        buttons: [
                                                            <div>
                                                                {/* <button label='Delete' onClick={(event) => this.disableNode(rowInfo)}>Disable</button> */}
                                                                <a style={{ color: 'red' }} href="javascript:void();" title="Disable Product Category" onClick={(event) => this.disableNode(rowInfo)} ><i className="fa fa-times"></i></a>
                                                            </div>,
                                                        ],
                                                        style: {
                                                            height: '35px'
                                                        }

                                                    }
                                                    return nodeprops;
                                                } else {
                                                    let nodeprops = {
                                                        buttons: [
                                                            <div>
                                                                {/* <button label='Delete' onClick={(event) => this.enableNode(rowInfo)}>Enable</button> */}
                                                                <a style={{ color: '#4dbd74' }} href="javascript:void();" title="Enable Product Category" onClick={(event) => this.enableNode(rowInfo)}><i className="fa fa-check"></i></a>
                                                            </div>,
                                                        ],
                                                        style: {
                                                            height: '35px', color: '#ced5de'
                                                        }

                                                    }
                                                    return nodeprops;
                                                }
                                            }
                                            }

                                            onChange={treeData => this.setTreeData({ treeData })}
                                        // treeData => this.setState({ treeData })
                                        />

                                    </div>
                                </FormGroup>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    {/* <input type="button" onClick={this.submitTree} value="submit" /> */}
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.submitTree}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                </ FormGroup>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}


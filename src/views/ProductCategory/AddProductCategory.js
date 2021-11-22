import React from "react";
import "./style.css";
import SortableTree, {
    getFlatDataFromTree,
    getTreeFromFlatData,
    getNodeAtPath, addNodeUnderParent, removeNodeAtPath, changeNodeAtPath
} from "react-sortable-tree";
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, FormText, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import 'react-sortable-tree/style.css'; // This only needs to be imported once in your app
import i18n from '../../i18n';


let initialData = [
    { "productCategoryId": 1, "level": 1, "sortOrder": "1", "label": { "label_en": "CC 1: HIV / AIDS Pharmaceuticals" }, "id": 1, "parent": null, "expanded": true },
    { "productCategoryId": 2, "level": 2, "sortOrder": "1.1", "label": { "label_en": "HIV/AIDS Pharmaceuticals" }, "id": 2, "parent": 1, "expanded": true },
    { "productCategoryId": 3, "level": 1, "sortOrder": "2", "label": { "label_en": "CC 2: Laboratory Commodities, VMMC" }, "id": 27, "parent": null, "expanded": true },
    { "productCategoryId": 4, "level": 2, "sortOrder": "2.1", "label": { "label_en": "HIV Rapid Test Kits (RTKs)" }, "id": 33, "parent": 27, "expanded": true },
    { "productCategoryId": 5, "level": 2, "sortOrder": "2.2", "label": { "label_en": "Laboratory Consumables" }, "id": 34, "parent": 27, "expanded": true },
    { "productCategoryId": 6, "level": 2, "sortOrder": "2.3", "label": { "label_en": "Laboratory Equipment" }, "id": 3, "parent": 27, "expanded": true },
    { "productCategoryId": 7, "level": 2, "sortOrder": "2.4", "label": { "label_en": "Laboratory Reagents" }, "id": 4, "parent": 27, "expanded": true },
    { "productCategoryId": 8, "level": 2, "sortOrder": "2.5", "label": { "label_en": "Voluntary Male Circumcision (VMMC) Kits" }, "id": 5, "parent": 27, "expanded": true },
    { "productCategoryId": 9, "level": 2, "sortOrder": "2.5", "label": { "label_en": "Voluntary Male Circumcision (VMMC) Supplies" }, "id": 28, "parent": 27, "expanded": true },
    { "productCategoryId": 10, "level": 1, "sortOrder": "3", "label": { "label_en": "CC 3: Malaria Pharmaceuticals" }, "id": 35, "parent": null, "expanded": true },
    { "productCategoryId": 11, "level": 2, "sortOrder": "3.1", "label": { "label_en": "Malaria Pharmaceuticals" }, "id": 6, "parent": 35, "expanded": true },
    { "productCategoryId": 12, "level": 1, "sortOrder": "4", "label": { "label_en": "CC 4: LLINs, RDTs" }, "id": 29, "parent": null, "expanded": true },
    { "productCategoryId": 13, "level": 2, "sortOrder": "4.1", "label": { "label_en": "Long Lasting Insecticide Treated Nets (LLINs)" }, "id": 7, "parent": 29, "expanded": true },
    { "productCategoryId": 14, "level": 2, "sortOrder": "4.2", "label": { "label_en": "Malaria Rapid Diagnostic Test (RDTs)" }, "id": 30, "parent": 29, "expanded": true },
    { "productCategoryId": 15, "level": 1, "sortOrder": "5", "label": { "label_en": "CC 5: Reproductive Health Pharmaceuticals, Devices" }, "id": 31, "parent": null, "expanded": true },
    { "productCategoryId": 16, "level": 2, "sortOrder": "5.1", "label": { "label_en": "Contraceptive Implants" }, "id": 8, "parent": 31, "expanded": true },
    { "productCategoryId": 17, "level": 2, "sortOrder": "5.2", "label": { "label_en": "Injectable Contraceptives" }, "id": 9, "parent": 31, "expanded": true },
    { "productCategoryId": 18, "level": 2, "sortOrder": "5.3", "label": { "label_en": "Intrauterine Devices" }, "id": 32, "parent": 31, "expanded": true },
    { "productCategoryId": 19, "level": 2, "sortOrder": "5.4", "label": { "label_en": "Oral Contraceptives" }, "id": 10, "parent": 31, "expanded": true },
    { "productCategoryId": 20, "level": 2, "sortOrder": "5.5", "label": { "label_en": "Standard Days Method" }, "id": 36, "parent": 31, "expanded": true },
    { "productCategoryId": 21, "level": 1, "sortOrder": "6", "label": { "label_en": "CC 6: Male & Female Condoms, Lubricants" }, "id": 37, "parent": null, "expanded": true },
    { "productCategoryId": 22, "level": 2, "sortOrder": "6.1", "label": { "label_en": "Female Condoms" }, "id": 11, "parent": 37, "expanded": true },
    { "productCategoryId": 23, "level": 2, "sortOrder": "6.2", "label": { "label_en": "Male Condoms" }, "id": 12, "parent": 37, "expanded": true },
    { "productCategoryId": 24, "level": 2, "sortOrder": "6.3", "label": { "label_en": "Personal Lubricants" }, "id": 13, "parent": 37, "expanded": true },
    { "productCategoryId": 25, "level": 1, "sortOrder": "7", "label": { "label_en": "CC 7: Essential Medicines" }, "id": 14, "parent": null, "expanded": true },
    { "productCategoryId": 26, "level": 2, "sortOrder": "7.1", "label": { "label_en": "Essential Medicines" }, "id": 15, "parent": 14, "expanded": true },
    { "productCategoryId": 27, "level": 2, "sortOrder": "7.2", "label": { "label_en": "Nutritional Supplements" }, "id": 16, "parent": 14, "expanded": true },
    { "productCategoryId": 28, "level": 1, "sortOrder": "8", "label": { "label_en": "CC 8: Other Global Health Commodities" }, "id": 17, "parent": null, "expanded": true },
    { "productCategoryId": 29, "level": 2, "sortOrder": "8.1", "label": { "label_en": "Medical Supplies" }, "id": 18, "parent": 17, "expanded": true },
    { "productCategoryId": 30, "level": 2, "sortOrder": "8.2", "label": { "label_en": "Other Global Health Commodities" }, "id": 19, "parent": 17, "expanded": true },
    { "productCategoryId": 31, "level": 1, "sortOrder": "9", "label": { "label_en": "CC 9: Infrastructure, Office Supplies, IT" }, "id": 20, "parent": null, "expanded": true },
    { "productCategoryId": 32, "level": 2, "sortOrder": "9.1", "label": { "label_en": "IT Equipment" }, "id": 21, "parent": 20, "expanded": true },
    { "productCategoryId": 33, "level": 2, "sortOrder": "9.2", "label": { "label_en": "Modular Warehouse/Laboratory/Clinic" }, "id": 22, "parent": 20, "expanded": true },
    { "productCategoryId": 34, "level": 2, "sortOrder": "9.3", "label": { "label_en": "Office Equipment" }, "id": 23, "parent": 20, "expanded": true },
    { "productCategoryId": 35, "level": 2, "sortOrder": "9.4", "label": { "label_en": "Others" }, "id": 24, "parent": 20, "expanded": true },
    { "productCategoryId": 36, "level": 2, "sortOrder": "9.5", "label": { "label_en": "Vehicles" }, "id": 25, "parent": 20, "expanded": true },
    { "productCategoryId": 37, "level": 2, "sortOrder": "9.6", "label": { "label_en": "Warehouse Equipment" }, "id": 26, "parent": 20, "expanded": true },
    { "productCategoryId": 38, "level": 3, "sortOrder": "9.3.1", "label": { "label_en": "Test 1" }, "id": 39, "parent": 23, "expanded": true }
]


export default class AddProductCategory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            treeData: getTreeFromFlatData({
                flatData: initialData.map(node => ({ ...node, title: node.label.label_en, name: node.label.label_en })),
                getKey: node => node.id, // resolve a node's key
                getParentKey: node => node.parent, // resolve a node's parent's key
                rootKey: null // The value of the parent key when there is no parent (i.e., at root level)
            }),
            nodename: '',
            message: '',
            maxId: 0,
            finalJson: []
        };
        this.addNewNode = this.addNewNode.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.disableNode = this.disableNode.bind(this);
        this.enableNode = this.enableNode.bind(this);
        this.getSortedFaltTreeData = this.getSortedFaltTreeData.bind(this);
    }



    componentDidMount = function () {

        initialData.map(item => {
            if (item.id > this.state.maxId) {
                this.setState({ maxId: item.id })
            }

        })


        const data = getFlatDataFromTree({
            treeData: this.state.treeData,
            getNodeKey: ({ node }) => node.id,
            ignoreCollapsed: false
        });

    }


    dataChange(event) {
        this.setState({ nodename: event.target.value });
    }


    addNewNode() {
        let currentMaxId = this.state.maxId + 1;
        const addNode = { id: currentMaxId, productCategoryId: '', name: this.state.nodename, parent: null, active: true, expanded: true };
        var newNode = addNodeUnderParent({
            treeData: this.state.treeData,
            parentKey: null,
            newNode: { ...addNode, title: addNode.name },
            getNodeKey: ({ node }) => node.id
        })
        this.setState({ treeData: newNode.treeData, maxId: currentMaxId, nodename: '' });
    }



    disableNode(rowInfo) {
        const changeNode = { id: rowInfo.node.id, name: rowInfo.node.name, active: false, expanded: rowInfo.node.expanded, children: rowInfo.node.children };
        var disabledNode = changeNodeAtPath({
            treeData: this.state.treeData,
            path: rowInfo.path,
            newNode: { ...changeNode, title: rowInfo.node.name },
            getNodeKey: ({ node }) => node.id
        });
        this.setState({ treeData: disabledNode });

        let disableChideNodes = getFlatDataFromTree({
            treeData: disabledNode,
            getNodeKey: ({ node }) => node.id,
            ignoreCollapsed: false
        });
        var disabledChildNode = disabledNode;
        var currentDisabledNodeId = '';
        disableChideNodes.map(disableNodeInfo => {
            if (disableNodeInfo.parentNode != null && disableNodeInfo.parentNode.id == rowInfo.node.id) {
                const changeNode = { id: disableNodeInfo.node.id, name: disableNodeInfo.node.name, active: false, expanded: disableNodeInfo.node.expanded, children: disableNodeInfo.node.children };
                disabledChildNode = changeNodeAtPath({
                    treeData: disabledChildNode,
                    path: disableNodeInfo.path,
                    newNode: { ...changeNode, title: disableNodeInfo.node.name },
                    getNodeKey: ({ node }) => node.id
                });
                this.setState({ treeData: disabledChildNode });
                currentDisabledNodeId = disableNodeInfo.node.id;

                disableChideNodes.map(disableNodeInfo => {
                    if (disableNodeInfo.parentNode != null && disableNodeInfo.parentNode.id == currentDisabledNodeId) {
                        const changeNode = { id: disableNodeInfo.node.id, name: disableNodeInfo.node.name, active: false, expanded: disableNodeInfo.node.expanded, children: disableNodeInfo.node.children };
                        disabledChildNode = changeNodeAtPath({
                            treeData: disabledChildNode,
                            path: disableNodeInfo.path,
                            newNode: { ...changeNode, title: disableNodeInfo.node.name },
                            getNodeKey: ({ node }) => node.id
                        });
                        this.setState({ treeData: disabledChildNode });
                        currentDisabledNodeId = disableNodeInfo.node.id;
                    }
                }
                )

            }

        }
        )
    }

    enableNode(rowInfo) {

        if (rowInfo.parentNode.active == true) {
            const changeNode = { id: rowInfo.node.id, name: rowInfo.node.name, active: true, expanded: rowInfo.node.expanded, children: rowInfo.node.children };
            var enabledNode = changeNodeAtPath({
                treeData: this.state.treeData,
                path: rowInfo.path,
                newNode: { ...changeNode, title: rowInfo.node.name },
                getNodeKey: ({ node }) => node.id
            });
            // console.log(enabledNode);
            this.setState({ treeData: enabledNode });
        } else {
            this.setState({ message: i18n.t('static.productCategory.parentIsDisabled') });
        }

    }


    getSortedFaltTreeData() {
        console.log("---------", this.state.treeData);
        let unsortedFlatTreeData = getFlatDataFromTree({
            treeData: this.state.treeData,
            getNodeKey: ({ node }) => node.id,
            ignoreCollapsed: false
        });


        unsortedFlatTreeData.map(node => {
            let count = 0;
            let nodeChildrens = node.node.children;
            if (nodeChildrens != undefined) {
                nodeChildrens.map(child => {
                    count++;
                    child.sortOrder = count;
                    unsortedFlatTreeData.map(unsorteData => {
                        if (child.id == unsorteData.node.id) {
                            unsorteData.node.sortOrder = count;
                        } if (unsorteData.parentNode == null) {
                            unsorteData.node.sortOrder = 0;

                        }
                    }
                    )
                }
                )

            } else {

            }
        })

        let nullParentNodeCount = 0;
        unsortedFlatTreeData.map(data => {
            // if(data.parentNode != null)
            //below if i write for the inner node to get sort as 1 instade of 0.1
            if (data.parentNode != null && data.parentNode.sortOrder != 0) {
                data.node.sortOrder = ("" + data.parentNode.sortOrder).concat(".").concat(data.node.sortOrder);
            } else {
                data.node.sortOrder = "" + nullParentNodeCount;
                nullParentNodeCount++;
            }
        })
        //        alert(unsortedFlatTreeData);
        //console.log("sorted flate tree data------->", unsortedFlatTreeData);
        this.setState({ finalJson: [] });
        unsortedFlatTreeData.map(finalItem => {
            var json = { "productCategoryId": finalItem.node.productCategoryId, "sortOrder": finalItem.node.sortOrder, "label": { "label_en": finalItem.node.name }, "id": finalItem.node.id, "parent": finalItem.parentNode == null ? null : finalItem.parentNode.id, "active": false }
            this.state.finalJson.push(json);

        });
        console.log("input for add product category api---->", this.state.finalJson);
    }
    render() {
        return (
            <div className="animated fadeIn">
                <h5>{this.state.message}</h5>
                <Row>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader> <i className="icon-note"></i><strong>Add Product Category</strong></CardHeader> */}
                            <CardBody>
                                <FormGroup>
                                    <Row>
                                        <Col md={8}>
                                            <Label for="product category">{i18n.t('static.productCategoryName.productCategoryName')}</Label>
                                            <Input type="text" value={this.state.nodename} onChange={this.dataChange} name="newNode" />
                                        </Col>
                                        <Col md={2} style={{ paddingTop: '29px' }}>
                                            <Button type="button" size="sm" color="success" onClick={this.addNewNode}><i className="fa fa-plus"></i> {i18n.t('static.common.add')}</Button>
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="product category">{i18n.t('static.productCategoryTree.productCategoryTree')}</Label>
                                    <div style={{ height: 450 }}>
                                        <SortableTree
                                            getNodeKey={({ node }) => node.id}
                                            treeData={this.state.treeData}
                                            generateNodeProps={rowInfo => {
                                                console.log(rowInfo);
                                                if (rowInfo.node.active == true) {
                                                    let nodeprops = {
                                                        buttons: [
                                                            <div>
                                                                {/* <button label='Delete' onClick={(event) => this.disableNode(rowInfo)}>Disable</button> */}
                                                                <a style={{ color: '#BA0C2F' }} href="javascript:void();" title="Disable Product Category" onClick={(event) => this.disableNode(rowInfo)} ><i className="fa fa-times"></i></a>
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

                                            // onChange={treeData => this.setTreeData({ treeData })}
                                            onChange={treeData => this.setState({ treeData })}
                                        />

                                    </div>
                                </FormGroup>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    {/* <input type="button" onClick={this.submitTree} value="submit" /> */}
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.getSortedFaltTreeData}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                </ FormGroup>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}


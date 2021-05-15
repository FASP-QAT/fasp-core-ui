import React, { Component } from 'react';
import { OrgDiagram } from 'basicprimitivesreact';
import { LCA, Tree, Colors, PageFitMode, Enabled, OrientationType } from 'basicprimitives';
import { DndProvider, DropTarget, DragSource } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'
import i18n from '../i18n'
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, FormFeedback, Input, InputGroupAddon, InputGroupText, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

class Container extends Component {
  render() {
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
    )(NodeDragSource)

    class Sample extends Component {
      constructor() {
        super();

        this.onRemoveItem = this.onRemoveItem.bind(this);
        this.canDropItem = this.canDropItem.bind(this);
        this.onMoveItem = this.onMoveItem.bind(this);

        this.onAddButtonClick = this.onAddButtonClick.bind(this);
        this.onRemoveButtonClick = this.onRemoveButtonClick.bind(this);
        this.onHighlightChanged = this.onHighlightChanged.bind(this);

        this.state = {
          modalOpen: false,
          title: '',
          cursorItem: 0,
          highlightItem: 0,
          items: [
            { id: 0, parent: null, description: "Chief Executive Officer (CEO)", email: "akil.m@altius.cc", phone: "352-206-7599", title: "Akil Mahimwala", label: "Akil Mahimwala" },
            { id: 1, parent: 0, description: "Co-Presidents, Platform Products & Services Division", email: "ravi.s@altius.cc", phone: "505-791-1689", title: "Ravi Sharma", label: "Jeanna White" },
            { id: 2, parent: 0, description: "Sr. VP, Server & Tools Division", email: "sameer.g@altiusbpo.com", phone: "262-215-7998", title: "Sameer Gharpurey", label: "James Holt" },
            { id: 3, parent: 2, description: "VP, Server & Tools Marketing and Solutions", email: "thomwill@name.com", phone: "904-547-5342", title: "Anchal", label: "Thomas Williams" },
            { id: 4, parent: 2, description: "VP, Software & Enterprise Management Division", email: "sarakemp@name.com", phone: "918-257-4218", title: "Dolly", label: "Sara Kemp" },
            { id: 5, parent: 2, description: "Sr. VP, Software Server System", email: "georduon@name.com", phone: "434-406-2189", title: "Palash", label: "George Duong" },
            { id: 6, parent: 2, description: "Sr. VP, Software Server System", email: "georduon@name.com", phone: "434-406-2189", title: "Shubham D", label: "George Duong" },
            { id: 7, parent: 1, description: "Sr. VP, Software Server System", email: "georduon@name.com", phone: "434-406-2189", title: "Harshana", label: "George Duong" },
            { id: 8, parent: 1, description: "Sr. VP, Software Server System", email: "georduon@name.com", phone: "434-406-2189", title: "Shubham Y", label: "George Duong" }
          ]
        }
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

      render() {
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
                    modalOpen: true
                  })
                  // alert(`User clicked on edit button for node ${itemConfig.title}`)
                }}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button key="1" className="StyledButton"
                onClick={(event) => {
                  event.stopPropagation();
                  this.onAddButtonClick(itemConfig);
                  // alert(`User clicked on add button for node ${itemConfig.title}`)
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
        return <>
          <div className="placeholder" style={{ clear: 'both' }} >
            <OrgDiagram centerOnCursor={true} config={config} onHighlightChanged={this.onHighlightChanged} />
            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => {
              console.log("tree json ---", this.state.items)
            }}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
            {/* Modal start */}
            <Modal isOpen={this.state.modalOpen}
              className={'modal-sm '} style={{ maxWidth: '49% !important' }}>
              <ModalHeader className="modalHeaderSupplyPlan hideCross">
                <strong>{i18n.t('static.manualTagging.searchErpOrders')}</strong>
                <Button size="md" color="danger" style={{ paddingTop: '0px', paddingBottom: '0px', paddingLeft: '3px', paddingRight: '3px' }} className="submitBtn float-right mr-1"> <i className="fa fa-times"></i></Button>
              </ModalHeader>
              <ModalBody>
                <div></div>
              </ModalBody>
              <ModalFooter>


                <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1"> <i className="fa fa-check"></i>Submit</Button>

                <Button size="md" color="danger" className="submitBtn float-right mr-1"> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
              </ModalFooter>
            </Modal>
            {/* Modal end */}
          </div>
        </>;
      }
    }

    return <DndProvider backend={HTML5Backend}>
      <Sample />
    </DndProvider>
  }
}


export default Container;

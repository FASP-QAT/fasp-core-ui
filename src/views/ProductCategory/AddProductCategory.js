import React from "react";
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
import "./style.css";
import "../../../node_modules/jexcel/dist/jexcel.css";

export default class AddProductCategory extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.options;
    }

    componentDidMount = function () {
        this.el = jexcel(ReactDOM.findDOMNode(this).children[0], this.options);
    };

    addRow = function () {
        this.el.insertRow();
    };
    getUpdatedData = function () {
        console.log(this.el.getData());
    };
    render() {
        return (
            <div>
                <div />
                <br />
                <input
                    type="button"
                    value="Add new row"
                    onClick={() => this.addRow()}
                />
                &nbsp;
                 <input
                    type="button"
                    value="Get Updated Data"
                    onClick={() => this.getUpdatedData()}
                />
                &nbsp;
                 <input
                    type="button"
                    value="Increase Indent"
                    onClick={() => this.increaseIndent()}
                />
                &nbsp;
                 <input
                    type="button"
                    value="Decrease Indent"
                    onClick={() => this.decreaseIndent()}
                />
                &nbsp;
                 <input
                    type="button"
                    value="Move Row Up"
                    onClick={() => this.moveRowUp()}
                />
            </div>
        );
    }
}

var options = {
    data: [
        [1, 'Cheese', 1, '0'],
        [2, 'Apples', 1, '0.1'],
        [3, 'Carrots', 1, '1']

    ],
    minDimensions: [3, 10],
    colHeaders: ['Product Category Id', 'Product Category Name', 'Indent/Level', 'Sort Level'],
    colWidths: [200, 300, 200, 200],
    colAlignments:['left','left','left','left'],
    style:[
        { A1: 'background-color: orange; ' },
        { B1: 'background-color: orange; ' },
        { C1: 'background-color: orange; ' },
        { D1: 'background-color: orange; ' },
    ],
    contextMenu: function (obj, x, y, e) {
        var items = [];


        // Move Row Up By one Index

        items.push({
            title: "Move Selected Row Up",
            onclick: function () {
                obj.moveRow(obj.getSelectedRows().rowIndex ? undefined : parseInt(y), obj.getSelectedRows().rowIndex ? undefined : parseInt(y) - 1);
            }
        });

        // Move Row Down By one Index
        items.push({
            title: "Move Selected Row Down",
            onclick: function () {
                obj.moveRow(obj.getSelectedRows().rowIndex ? undefined : parseInt(y), obj.getSelectedRows().rowIndex ? undefined : parseInt(y) + 1);
            }
        });

        //Add Indent To Selected Cell Data

        items.push({
            title: "Increse Indent",
            onclick: function () {
                console.log(obj);
                console.log(obj.getSelectedRows().innerText);
            }
        });
        // -------------------------------------

        if (y == null) {
            // Insert a new column
            if (obj.options.allowInsertColumn == true) {
                items.push({
                    title: obj.options.text.insertANewColumnBefore,
                    onclick: function () {
                        obj.insertColumn(1, parseInt(x), 1);
                    }
                });
            }

            if (obj.options.allowInsertColumn == true) {
                items.push({
                    title: obj.options.text.insertANewColumnAfter,
                    onclick: function () {
                        obj.insertColumn(1, parseInt(x), 0);
                    }
                });
            }

            // Delete a column
            if (obj.options.allowDeleteColumn == true) {
                items.push({
                    title: obj.options.text.deleteSelectedColumns,
                    onclick: function () {
                        obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                    }
                });
            }



            // Rename column
            if (obj.options.allowRenameColumn == true) {
                items.push({
                    title: obj.options.text.renameThisColumn,
                    onclick: function () {
                        obj.setHeader(x);
                    }
                });
            }

            // Sorting
            if (obj.options.columnSorting == true) {
                // Line
                items.push({ type: 'line' });

                items.push({
                    title: obj.options.text.orderAscending,
                    onclick: function () {
                        obj.orderBy(x, 0);
                    }
                });
                items.push({
                    title: obj.options.text.orderDescending,
                    onclick: function () {
                        obj.orderBy(x, 1);
                    }
                });
            }
        } else {
            // Insert new row
            if (obj.options.allowInsertRow == true) {
                items.push({
                    title: obj.options.text.insertANewRowBefore,
                    onclick: function () {
                        obj.insertRow(1, parseInt(y), 1);
                    }
                });

                items.push({
                    title: obj.options.text.insertANewRowAfter,
                    onclick: function () {
                        obj.insertRow(1, parseInt(y));
                    }
                });
            }

            if (obj.options.allowDeleteRow == true) {
                items.push({
                    title: obj.options.text.deleteSelectedRows,
                    onclick: function () {
                        obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
                    }
                });
            }

            if (x) {
                if (obj.options.allowComments == true) {
                    items.push({ type: 'line' });

                    var title = obj.records[y][x].getAttribute('title') || '';

                    items.push({
                        title: title ? obj.options.text.editComments : obj.options.text.addComments,
                        onclick: function () {
                            obj.setComments([x, y], prompt(obj.options.text.comments, title));
                        }
                    });

                    if (title) {
                        items.push({
                            title: obj.options.text.clearComments,
                            onclick: function () {
                                obj.setComments([x, y], '');
                            }
                        });
                    }
                }
            }
        }

        // Line
        items.push({ type: 'line' });

        // Save
        if (obj.options.allowExport) {
            items.push({
                title: obj.options.text.saveAs,
                shortcut: 'Ctrl + S',
                onclick: function () {
                    obj.download();
                }
            });
        }

        // About
        if (obj.options.about) {
            items.push({
                title: obj.options.text.about,
                onclick: function () {
                    alert(obj.options.about);
                }
            });
        }
        return items;
    }

};


// document.getElementById("root").jexcel({
//     data:options.data,
//     colHeaders: [ 'Product', 'Quantity', 'Price', 'Total' ],
//     colWidths: [ 300, 100, 100, 100 ],
//     columns: [
//         { type: 'autocomplete', source:[ 'Apples','Bananas','Carrots','Oranges','Cheese','Pears' ] },
//         { type: 'number' },
//         { type: 'number' },
//         { type: 'number' },
//     ]
// });

const rootElement = document.getElementById("root");
ReactDOM.render(<AddProductCategory options={options} />, rootElement);

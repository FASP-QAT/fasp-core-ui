import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import {
  Col, Row, Card, CardBody, CardHeader
} from 'reactstrap';

const oldDataJson = [
  [1, 'Data source 1', 'Country SKU 3', 'Notes 5'],
  [2, 'Data source 2', 'Country SKU 2', 'Notes 2'],
  [0, 'Data source 5', 'Country SKU 1', 'Notes 1'],
  [0, 'Data source 6', 'Country SKU 2', 'Notes 2']
]

const latestDataJson = [
  [1, 'Data source 3', 'Country SKU 1', 'Notes 1'],
  [2, 'Data source 1', 'Country SKU 2', 'Notes 2'],
  [3, 'Data source 3', 'Country SKU 3', 'Notes 3'],
  [4, 'Data source 4', 'Country SKU 4', 'Notes 4']
]
const mergeDataJson =
  [
    [1, 'Data source 1', 'Country SKU 3', 'Notes 5'],
    [2, 'Data source 2', 'Country SKU 2', 'Notes 2'],
    [3, 'Data source 3', 'Country SKU 3', 'Notes 3'],
    [4, 'Data source 4', 'Country SKU 4', 'Notes 4'],
    [0, 'Data source 5', 'Country SKU 1', 'Notes 1'],
    [0, 'Data source 6', 'Country SKU 2', 'Notes 2']
  ]

export default class syncPage extends Component {

  componentDidMount() {
    this.el = jexcel(document.getElementById("oldVersion"), '');
    this.el.destroy();
    var options = {
      data: oldDataJson,
      colHeaders: [
        "Consumption Id",
        "Data source",
        "Country SKU",
        "Notes"
      ],

      columnDrag: true,
      colWidths: [50, 115, 115, 100],
      columns: [
        {
          title: 'Consumption Id',
          type: 'text',
        },
        {
          title: 'Data source',
          type: 'text'
        },
        {
          title: 'Country SKU',
          type: 'text'
        },
        {
          title: 'Notes',
          type: 'text'
        },

      ],
      pagination: false,
      search: true,
      columnSorting: true,
      tableOverflow: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      editable: false,
      onload: this.loadedFunction
    };

    this.el = jexcel(document.getElementById("oldVersion"), options);

    this.el = jexcel(document.getElementById("latestVersion"), '');
    this.el.destroy();
    var options = {
      data: latestDataJson,
      colHeaders: [
        "Consumption Id",
        "Data source",
        "Country SKU",
        "Notes"
      ],

      columnDrag: true,
      colWidths: [50, 115, 115, 100],
      columns: [
        {
          title: 'Consumption Id',
          type: 'text'
        },
        {
          title: 'Data source',
          type: 'text'
        },
        {
          title: 'Country SKU',
          type: 'text'
        },
        {
          title: 'Notes',
          type: 'text'
        },

      ],
      pagination: false,
      search: true,
      columnSorting: true,
      tableOverflow: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      editable: false
    };

    this.el = jexcel(document.getElementById("latestVersion"), options);

    this.el = jexcel(document.getElementById("mergeVersion"), '');
    this.el.destroy();
    var options = {
      data: mergeDataJson,
      colHeaders: [
        "Consumption Id",
        "Data source",
        "Country SKU",
        "Notes"
      ],

      columnDrag: true,
      colWidths: [200, 200, 200, 300],
      columns: [
        {
          title: 'Consumption Id',
          type: 'text'
        },
        {
          title: 'Data source',
          type: 'text'
        },
        {
          title: 'Country SKU',
          type: 'text'
        },
        {
          title: 'Notes',
          type: 'text'
        },

      ],
      pagination: false,
      search: true,
      columnSorting: true,
      tableOverflow: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      editable: false,
      onload: this.loadedFunction
    };

    this.el = jexcel(document.getElementById("mergeVersion"), options);
  }

  loadedFunction = function (instance) {
    var colArr = ['A', 'B', 'C', 'D']
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    console.log("Json", jsonData);
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[0] != 0) {
        console.log("Y---------", y);
        console.log("latestDataJson", latestDataJson[y])
        var latestFilteredData = (latestDataJson[y])[0];
        console.log("Latest filtered data", latestFilteredData)
        var col = ("A").concat(parseInt(y) + 1);
        var value = elInstance.getValueFromCoords(0, y);
        if (value == latestFilteredData) {
          for (var j = 1; j < colArr.length; j++) {
            var col = (colArr[j]).concat(parseInt(y) + 1);
            var valueToCompare = elInstance.getValueFromCoords(j, y);
            var valueToCompareWith = (latestDataJson[y])[j];
            if (valueToCompare === valueToCompareWith) {
              elInstance.setStyle(col, "background-color", "transparent");
            } else {
              elInstance.setStyle(col, "background-color", "#FFCCCB");
            }
          }

          // // For Country SKU
          // var col = ("C").concat(parseInt(y) + 1);
          // var valueToCompare = elInstance.getValueFromCoords(2, y);
          // var valueToCompareWith = (latestDataJson[y])[2];
          // if (valueToCompare === valueToCompareWith) {
          //   elInstance.setStyle(col, "background-color", "transparent");
          //   elInstance.setComments(col, '');
          // } else {
          //   elInstance.setStyle(col, "background-color", "transparent");
          //   elInstance.setStyle(col, "background-color", "yellow");
          //   elInstance.setComments(col, 'Changed Value');
          // }

          // //For Notes
          // var col = ("D").concat(parseInt(y) + 1);
          // var valueToCompare = elInstance.getValueFromCoords(3, y);
          // var valueToCompareWith = (latestDataJson[y])[3];
          // if (valueToCompare === valueToCompareWith) {
          //   elInstance.setStyle(col, "background-color", "transparent");
          //   elInstance.setComments(col, '');
          // } else {
          //   elInstance.setStyle(col, "background-color", "transparent");
          //   elInstance.setStyle(col, "background-color", "yellow");
          //   elInstance.setComments(col, 'Changed Value');
          // }

        }
      } else {
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "#98FB98");
        }
        // // Can show colour for newly added row
        // var col = ("A").concat(parseInt(y) + 1);
        // elInstance.setStyle(col, "background-color", "#98FB98");
        // var col = ("B").concat(parseInt(y) + 1);
        // elInstance.setStyle(col, "background-color", "#98FB98");
        // var col = ("C").concat(parseInt(y) + 1);
        // elInstance.setStyle(col, "background-color", "#98FB98");
        // var col = ("D").concat(parseInt(y) + 1);
        // elInstance.setStyle(col, "background-color", "#98FB98");
      }
    }
  }

  render = () => {
    return (
      <div>
        <Row>
        <Col md="12">
          <Card>
              <CardBody>
                  <ul class="legend">
                     <li><span class="lightpinklegend"></span> Light pink colour for difference </li>
                     <li><span class="greenlegend"></span> New data from latest version</li>
                      <li><span class="redlegend"></span> Inactive Data</li>
                     <li><span class="notawesome"></span>  New data from current version</li>
                  </ul>
               </CardBody>
             </Card>

          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <strong>Current Version</strong>
              </CardHeader>
              <CardBody>
                <Col md="12 pl-0" id="realmDiv">
                  <div id="oldVersion" className="table-responsive" />
                </Col>
              </CardBody>
            </Card>
          </Col>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <strong>Latest Version</strong>
              </CardHeader>
              <CardBody>
                <Col md="12 pl-0" id="realmDiv">
                  <div id="latestVersion" className="table-responsive" />
                </Col>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <strong>Merged Version</strong>
              </CardHeader>
              <CardBody>
                <Col md="12 pl-0" id="realmDiv">
                  <div id="mergeVersion" className="table-responsive" />
                </Col>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
}
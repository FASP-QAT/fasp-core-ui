import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import {
  Col, Row, Card, CardBody, CardHeader, Form,
  FormGroup, Label, InputGroup, Input, InputGroupAddon, Button,
  Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import CryptoJS from 'crypto-js';
import { SECRET_KEY } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from '../../api/ProgramService';


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

  constructor(props) {
    super(props);
    this.state = {
      mergedDataJson: [],
      programList: [],
      activeTab: new Array(3).fill('1'),
      dataSourceList: [],
      regionList: []
    }
    this.buildMergeData = this.buildMergeData.bind(this);
    this.toggle = this.toggle.bind(this);
    this.getDataForCompare = this.getDataForCompare.bind(this);
  }

  toggle(tabPane, tab) {
    const newArray = this.state.activeTab.slice()
    newArray[tabPane] = tab
    this.setState({
      activeTab: newArray,
    });
  }

  tabPane() {
    return (
      <>
        <TabPane tabId="1">
          <Row>
            <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
              <Card>
                <CardHeader>
                  <strong>Current Version</strong>
                </CardHeader>
                <CardBody>
                  <Col md="12 pl-0" id="realmDiv">
                    <div id="oldVersionConsumption" className="table-responsive" />
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
                    <div id="latestVersionConsumption" className="table-responsive" />
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
                    <div id="mergedVersionConsumption" className="table-responsive" />
                  </Col>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
              <Card>
                <CardHeader>
                  <strong>Current Version</strong>
                </CardHeader>
                <CardBody>
                  <Col md="12 pl-0" id="realmDiv">
                    <div id="oldVersionInventory" className="table-responsive" />
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
                    <div id="latestVersionInventory" className="table-responsive" />
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
                    <div id="mergedVersionInventory" className="table-responsive" />
                  </Col>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </>
    );
  }

  buildMergeData() {

  }

  componentDidMount() {
    const lan = 'en';
    var db1;
    getDatabase();
    var openRequest = indexedDB.open('fasp', 1);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programData'], 'readwrite');
      var program = transaction.objectStore('programData');
      var getRequest = program.getAll();
      var proList = []
      getRequest.onerror = function (event) {
        // Handle errors!
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId) {
            var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
            var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
            var programJson = {
              name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
              id: myResult[i].id
            }
            proList[i] = programJson
          }
        }
        this.setState({
          programList: proList
        })

      }.bind(this);
    }.bind(this);
    document.getElementById("detailsDiv").style.display = "none";
  }

  getDataForCompare() {
    document.getElementById("detailsDiv").style.display = "block";
    var programId = document.getElementById('programId').value;
    this.setState({ programId: programId });
    var db1;
    getDatabase();
    var openRequest = indexedDB.open('fasp', 1);
    var dataSourceList = []
    var regionList = []
    var latestDataJsonConsumption = []
    var oldDataJsonConsumption = []
    var mergedDataConsumption = []
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programData'], 'readwrite');
      var programTransaction = transaction.objectStore('programData');
      var programRequest = programTransaction.get(programId);
      programRequest.onsuccess = function (event) {
        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
        var programJson = JSON.parse(programData);

        var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
        var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
        var dataSourceRequest = dataSourceOs.getAll();
        dataSourceRequest.onsuccess = function (event) {
          var dataSourceResult = [];
          dataSourceResult = dataSourceRequest.result;
          for (var k = 0; k < dataSourceResult.length; k++) {
            if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
              if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                var dataSourceJson = {
                  name: dataSourceResult[k].label.label_en,
                  id: dataSourceResult[k].dataSourceId
                }
                dataSourceList[k] = dataSourceJson
              }
            }
          }
          var regionTransaction = db1.transaction(['region'], 'readwrite');
          var regionOs = regionTransaction.objectStore('region');
          var regionRequest = regionOs.getAll();
          regionRequest.onsuccess = function (event) {
            var regionResult = [];
            regionResult = regionRequest.result;
            for (var k = 0; k < regionResult.length; k++) {
              if (regionResult[k].realmCountry.realmCountryId == programJson.realmCountry.realmCountryId) {
                var regionJson = {
                  name: regionResult[k].label.label_en,
                  id: regionResult[k].regionId
                }
                regionList[k] = regionJson
              }
            }
            var consumptionList = (programJson.consumptionList);
            this.setState({
              consumptionList: consumptionList
            });

            var data = [];
            var consumptionDataArr = []
            if (consumptionList.length == 0) {
              data = [];
              consumptionDataArr[0] = data;
            }
            for (var j = 0; j < consumptionList.length; j++) {
              data = [];
              data[0] = consumptionList[j].dataSource.id;
              data[1] = consumptionList[j].region.id;
              data[2] = consumptionList[j].consumptionQty;
              data[3] = consumptionList[j].dayOfStockOut;
              data[4] = consumptionList[j].startDate;
              data[5] = consumptionList[j].stopDate;
              data[7] = consumptionList[j].active;
              data[8] = consumptionList[j].actualFlag;
              consumptionDataArr[j] = data;
            }

            this.el = jexcel(document.getElementById("oldVersionConsumption"), '');
            this.el.destroy();
            oldDataJsonConsumption = consumptionDataArr;
            var options = {
              data: oldDataJsonConsumption,
              columnDrag: true,
              colWidths: [180, 180, 180, 180, 180, 180, 180, 180, 180],
              columns: [
                // { title: 'Month', type: 'text', readOnly: true },
                {
                  title: 'Data source',
                  type: 'dropdown',
                  source: dataSourceList
                },
                {
                  title: 'Region',
                  type: 'dropdown',
                  source: regionList
                },
                {
                  title: 'Consumption Quantity',
                  type: 'text'
                },
                {
                  title: 'Days of Stock out',
                  type: 'text'
                },
                {
                  title: 'StartDate',
                  type: 'calendar'
                },
                {
                  title: 'StopDate',
                  type: 'calendar'
                },
                {
                  title: 'Active',
                  type: 'checkbox'
                },
                {
                  title: 'Actual Flag',
                  type: 'dropdown',
                  source: [{ id: true, name: 'Actual' }, { id: false, name: 'Forecast' }]
                },


                // { title: 'Create date', type: 'text', readOnly: true },
                // { title: 'Created By', type: 'text', readOnly: true },
                // { title: 'Last Modified date', type: 'text', readOnly: true },
                // { title: 'Last Modified by', type: 'text', readOnly: true }
              ],
              pagination: 10,
              search: true,
              columnSorting: true,
              tableOverflow: true,
              wordWrap: true,
              allowInsertColumn: false,
              allowManualInsertColumn: false,
              allowDeleteRow: false,
              onchange: this.changed,
              editable: false
            };

            this.el = jexcel(document.getElementById("oldVersionConsumption"), options);
            
            AuthenticationService.setupAxiosInterceptors()
            var programRequestJson = { programId: (programId.split("_"))[0], versionId: -1 }
            ProgramService.getProgramData(programRequestJson)
              .then(response => {
                var programJson = response.data
                    var consumptionList = (programJson.consumptionList);
                    this.setState({
                      consumptionList: consumptionList
                    });

                    var data = [];
                    var consumptionDataArr = []
                    if (consumptionList.length == 0) {
                      data = [];
                      consumptionDataArr[0] = data;
                    }
                    for (var j = 0; j < consumptionList.length; j++) {
                      data = [];
                      data[0] = consumptionList[j].dataSource.id;
                      data[1] = consumptionList[j].region.id;
                      data[2] = consumptionList[j].consumptionQty;
                      data[3] = consumptionList[j].dayOfStockOut;
                      data[4] = consumptionList[j].startDate;
                      data[5] = consumptionList[j].stopDate;
                      data[7] = consumptionList[j].active;
                      data[8] = consumptionList[j].actualFlag;
                      consumptionDataArr[j] = data;
                    }

                    this.el = jexcel(document.getElementById("latestVersionConsumption"), '');
                    this.el.destroy();
                    latestDataJsonConsumption = consumptionDataArr;
                    var options = {
                      data: latestDataJsonConsumption,
                      columnDrag: true,
                      colWidths: [180, 180, 180, 180, 180, 180, 180, 180, 180],
                      columns: [
                        // { title: 'Month', type: 'text', readOnly: true },
                        {
                          title: 'Data source',
                          type: 'dropdown',
                          source: dataSourceList
                        },
                        {
                          title: 'Region',
                          type: 'dropdown',
                          source: regionList
                        },
                        {
                          title: 'Consumption Quantity',
                          type: 'text'
                        },
                        {
                          title: 'Days of Stock out',
                          type: 'text'
                        },
                        {
                          title: 'StartDate',
                          type: 'calendar'
                        },
                        {
                          title: 'StopDate',
                          type: 'calendar'
                        },
                        {
                          title: 'Active',
                          type: 'checkbox'
                        },
                        {
                          title: 'Actual Flag',
                          type: 'dropdown',
                          source: [{ id: true, name: 'Actual' }, { id: false, name: 'Forecast' }]
                        },


                        // { title: 'Create date', type: 'text', readOnly: true },
                        // { title: 'Created By', type: 'text', readOnly: true },
                        // { title: 'Last Modified date', type: 'text', readOnly: true },
                        // { title: 'Last Modified by', type: 'text', readOnly: true }
                      ],
                      pagination: 10,
                      search: true,
                      columnSorting: true,
                      tableOverflow: true,
                      wordWrap: true,
                      allowInsertColumn: false,
                      allowManualInsertColumn: false,
                      allowDeleteRow: false,
                      onchange: this.changed,
                      editable: false
                    };

                    this.el = jexcel(document.getElementById("latestVersionConsumption"), options);
                var mergedDataConsumption = [];
                for (var i = 0; i < latestDataJsonConsumption.length; i++) {
                  // if ((oldDataJson[i])[0] != 0) {
                  if (oldDataJsonConsumption.length > i) {
                    if ((latestDataJsonConsumption[i])[0] == (oldDataJsonConsumption[i])[0]) {
                      mergedDataConsumption.push(oldDataJsonConsumption[i])
                    } else {
                      mergedDataConsumption.push(latestDataJsonConsumption[i])
                    }
                  } else {
                    mergedDataConsumption.push(latestDataJsonConsumption[i]);
                  }
                  // }
                }

                for (var i = 0; i < oldDataJsonConsumption.length; i++) {
                  if ((oldDataJsonConsumption[i])[0] == 0) {
                    mergedDataConsumption.push(oldDataJsonConsumption[i])
                  }
                }
                console.log("Merged data", mergedDataConsumption)

                this.el = jexcel(document.getElementById("mergedVersionConsumption"), '');
                this.el.destroy();
                mergedDataConsumption = mergedDataConsumption;
                var options = {
                  data: mergedDataConsumption,
                  columnDrag: true,
                  colWidths: [180, 180, 180, 180, 180, 180, 180, 180, 180],
                  columns: [
                    // { title: 'Month', type: 'text', readOnly: true },
                    {
                      title: 'Data source',
                      type: 'dropdown',
                      source: dataSourceList
                    },
                    {
                      title: 'Region',
                      type: 'dropdown',
                      source: regionList
                    },
                    {
                      title: 'Consumption Quantity',
                      type: 'text'
                    },
                    {
                      title: 'Days of Stock out',
                      type: 'text'
                    },
                    {
                      title: 'StartDate',
                      type: 'calendar'
                    },
                    {
                      title: 'StopDate',
                      type: 'calendar'
                    },
                    {
                      title: 'Active',
                      type: 'checkbox'
                    },
                    {
                      title: 'Actual Flag',
                      type: 'dropdown',
                      source: [{ id: true, name: 'Actual' }, { id: false, name: 'Forecast' }]
                    },


                    // { title: 'Create date', type: 'text', readOnly: true },
                    // { title: 'Created By', type: 'text', readOnly: true },
                    // { title: 'Last Modified date', type: 'text', readOnly: true },
                    // { title: 'Last Modified by', type: 'text', readOnly: true }
                  ],
                  pagination: 10,
                  search: true,
                  columnSorting: true,
                  tableOverflow: true,
                  wordWrap: true,
                  allowInsertColumn: false,
                  allowManualInsertColumn: false,
                  allowDeleteRow: false,
                  onchange: this.changed,
                  editable: false
                };

                this.el = jexcel(document.getElementById("mergedVersionConsumption"), options);
              })
              .catch(
                error => {
                  console.log("error", error)
                  switch (error.message) {
                    case "Network Error":
                      this.setState({
                        message: error.message
                      })
                      this.props.history.push(`/program/syncPage/` + i18n.t('static.program.errortext'))
                      break
                    default:
                      this.setState({
                        message: error.response
                      })
                      this.props.history.push(`/program/syncPage/` + i18n.t('static.program.errortext'))
                      break
                  }
                }
              )
          }.bind(this)
        }.bind(this)
      }.bind(this)
    }.bind(this)




    // this.el = jexcel(document.getElementById("oldVersion"), '');
    // this.el.destroy();
    // var options = {
    //   data: oldDataJson,
    //   colHeaders: [
    //     "Consumption Id",
    //     "Data source",
    //     "Country SKU",
    //     "Notes"
    //   ],

    //   columnDrag: true,
    //   colWidths: [50, 115, 115, 100],
    //   columns: [
    //     {
    //       title: 'Consumption Id',
    //       type: 'text',
    //     },
    //     {
    //       title: 'Data source',
    //       type: 'text'
    //     },
    //     {
    //       title: 'Country SKU',
    //       type: 'text'
    //     },
    //     {
    //       title: 'Notes',
    //       type: 'text'
    //     },

    //   ],
    //   pagination: false,
    //   search: true,
    //   columnSorting: true,
    //   tableOverflow: true,
    //   wordWrap: true,
    //   allowInsertColumn: false,
    //   allowManualInsertColumn: false,
    //   allowDeleteRow: false,
    //   editable: false,
    //   onload: this.loadedFunction
    // };

    // this.el = jexcel(document.getElementById("oldVersion"), options);

    // this.el = jexcel(document.getElementById("latestVersion"), '');
    // this.el.destroy();
    // var options = {
    //   data: latestDataJson,
    //   colHeaders: [
    //     "Consumption Id",
    //     "Data source",
    //     "Country SKU",
    //     "Notes"
    //   ],

    //   columnDrag: true,
    //   colWidths: [50, 115, 115, 100],
    //   columns: [
    //     {
    //       title: 'Consumption Id',
    //       type: 'text'
    //     },
    //     {
    //       title: 'Data source',
    //       type: 'text'
    //     },
    //     {
    //       title: 'Country SKU',
    //       type: 'text'
    //     },
    //     {
    //       title: 'Notes',
    //       type: 'text'
    //     },

    //   ],
    //   pagination: false,
    //   search: true,
    //   columnSorting: true,
    //   tableOverflow: true,
    //   wordWrap: true,
    //   allowInsertColumn: false,
    //   allowManualInsertColumn: false,
    //   allowDeleteRow: false,
    //   editable: false
    // };

    // this.el = jexcel(document.getElementById("latestVersion"), options);

    // this.el = jexcel(document.getElementById("mergeVersion"), '');
    // this.el.destroy();
    // var options = {
    //   data: mergedData,
    //   colHeaders: [
    //     "Consumption Id",
    //     "Data source",
    //     "Country SKU",
    //     "Notes"
    //   ],

    //   columnDrag: true,
    //   colWidths: [200, 200, 200, 300],
    //   columns: [
    //     {
    //       title: 'Consumption Id',
    //       type: 'text'
    //     },
    //     {
    //       title: 'Data source',
    //       type: 'text'
    //     },
    //     {
    //       title: 'Country SKU',
    //       type: 'text'
    //     },
    //     {
    //       title: 'Notes',
    //       type: 'text'
    //     },

    //   ],
    //   pagination: false,
    //   search: true,
    //   columnSorting: true,
    //   tableOverflow: true,
    //   wordWrap: true,
    //   allowInsertColumn: false,
    //   allowManualInsertColumn: false,
    //   allowDeleteRow: false,
    //   editable: false,
    //   onload: this.loadedFunctionForMerge
    // };

    // this.el = jexcel(document.getElementById("mergeVersion"), options);
  }


  loadedFunction = function (instance) {
    var colArr = ['A', 'B', 'C', 'D']
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[0] != 0) {
        var latestFilteredData = (latestDataJson[y])[0];
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
        }
      } else {
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "#98FB98");
        }
      }
    }
  }

  loadedFunctionForMerge = function (instance) {
    var colArr = ['A', 'B', 'C', 'D']
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[0] != 0) {
        if (oldDataJson.length > y) {
          var oldFilteredData = (oldDataJson[y])[0];
          var col = ("A").concat(parseInt(y) + 1);
          var value = elInstance.getValueFromCoords(0, y);
          console.log("Value------->", value)
          console.log("Latest filtered data", oldFilteredData)
          if (value == oldFilteredData) {
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
          } else {
            for (var j = 0; j < colArr.length; j++) {
              var col = (colArr[j]).concat(parseInt(y) + 1);
              elInstance.setStyle(col, "background-color", "#e5edf5");
            }
          }
        } else {
          for (var j = 0; j < colArr.length; j++) {
            var col = (colArr[j]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "#e5edf5");
          }
        }
      } else {
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "#98FB98");
        }
      }
    }
  }

  render = () => {
    const { programList } = this.state;
    let programs = programList.length > 0
      && programList.map((item, i) => {
        return (
          <option key={i} value={item.id}>{item.name}</option>
        )
      }, this);

    return (
      <div>
        <Row>
          <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <strong>Synchronisation</strong>
              </CardHeader>
              <CardBody>
                <Form name='simpleForm'>
                  <Col md="9 pl-0">
                    <div className="d-md-flex">
                      <FormGroup className="tab-ml-1">
                        <Label htmlFor="appendedInputButton">Program</Label>
                        <div className="controls SelectGo">
                          <InputGroup>
                            <Input type="select"
                              bsSize="sm"
                              // value={this.state.programId}
                              name="programId" id="programId"
                            >
                              <option value="0">Please select</option>
                              {programs}
                            </Input>
                            <InputGroupAddon addonType="append">
                              <Button color="secondary Gobtn btn-sm" onClick={this.getDataForCompare}>{i18n.t('static.common.go')}</Button>
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                      </FormGroup>
                    </div>
                  </Col>
                </Form>
                <div id="detailsDiv">
                  <Row>
                    <Col md="12">
                      <Card>
                        <CardBody>
                          <ul className="legend">
                            <li><span className="lightpinklegend"></span> Difference </li>
                            <li><span className="greenlegend"></span> New data from current version</li>
                            <li><span className="redlegend"></span> Inactive Data</li>
                            <li><span className="notawesome"></span>  New data from latest version</li>
                          </ul>
                        </CardBody>
                      </Card>

                    </Col>
                  </Row>
                  <div className="animated fadeIn">
                    <Row>
                      <Col xs="12" md="12" className="mb-4">
                        <Nav tabs>
                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '1'}
                              onClick={() => { this.toggle(0, '1'); }}
                            >
                              Consumption
                </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '2'}
                              onClick={() => { this.toggle(0, '2'); }}
                            >
                              Inventory
                </NavLink>
                          </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab[0]}>
                          {this.tabPane()}
                        </TabContent>
                      </Col>
                    </Row>
                  </div>
                  {/* <Row>
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
                </Row> */}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };
}
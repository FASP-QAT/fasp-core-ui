import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import {
  Col, Row, Card, CardBody, CardHeader, Form,
  FormGroup, Label, InputGroup, Input, InputGroupAddon, Button,
  Nav, NavItem, NavLink, TabContent, TabPane,CardFooter
} from 'reactstrap';
import CryptoJS from 'crypto-js';
import { SECRET_KEY } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from '../../api/ProgramService';

export default class syncPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mergedDataJson: [],
      programList: [],
      activeTab: new Array(3).fill('1'),
      dataSourceList: [],
      regionList: [],
      oldDataJsonConsumption: [],
      latestDataJsonConsumption: [],
      mergedDataConsumption: [],
      oldDataJsonInventory: [],
      latestDataJsonInventory: [],
      mergedDataInventory: []
    }
    this.toggle = this.toggle.bind(this);
    this.getDataForCompare = this.getDataForCompare.bind(this);
    this.loadedFunctionForMerge = this.loadedFunctionForMerge.bind(this);
    this.loadedFunction = this.loadedFunction.bind(this)

    this.loadedFunctionForMergeInventory = this.loadedFunctionForMergeInventory.bind(this);
    this.loadedFunctionInventory = this.loadedFunctionInventory.bind(this)

    this.loadedFunctionLatestInventory = this.loadedFunctionLatestInventory.bind(this);
    this.loadedFunctionLatest = this.loadedFunctionLatest.bind(this);
    this.cancelClicked=this.cancelClicked.bind(this);
    this.synchronize=this.synchronize.bind(this);
  }

  toggle(tabPane, tab) {
    const newArray = this.state.activeTab.slice()
    newArray[tabPane] = tab
    this.setState({
      activeTab: newArray,
    });
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
    AuthenticationService.setupAxiosInterceptors()
    var programRequestJson = { programId: (programId.split("_"))[0], versionId: -1 }
    ProgramService.getProgramData(programRequestJson)
      .then(response => {
        var dataSourceList = []
        var regionList = []
        var planningUnitList = []
        var countrySkuList = []
        var latestDataJsonConsumption = []
        var oldDataJsonConsumption = []
        var mergedDataConsumption = []
        var latestDataJsonInventory = []
        var oldDataJsonInventory = []
        var mergedDataInventory = []
        var programJson = response.data
        var consumptionList = (programJson.consumptionList);
        var inventoryList = (programJson.inventoryList);
        this.setState({
          consumptionList: consumptionList,
          inventoryList: inventoryList
        });

        var data = [];
        var consumptionDataArr = []
        if (consumptionList.length == 0) {
          data = [];
          consumptionDataArr[0] = data;
        }
        for (var j = 0; j < consumptionList.length; j++) {
          data = [];
          data[0] = consumptionList[j].consumptionId;
          data[1] = consumptionList[j].planningUnit.id;
          data[2] = consumptionList[j].dataSource.id;
          data[3] = consumptionList[j].region.id;
          data[4] = consumptionList[j].consumptionQty;
          data[5] = consumptionList[j].dayOfStockOut;
          data[6] = consumptionList[j].startDate;
          data[7] = consumptionList[j].stopDate;
          data[8] = consumptionList[j].active;
          data[9] = consumptionList[j].actualFlag;
          consumptionDataArr[j] = data;
        }
        latestDataJsonConsumption = consumptionDataArr;
        this.setState({
          latestDataJsonConsumption: latestDataJsonConsumption
        })

        var data = [];
        var inventoryDataArr = []
        if (inventoryList.length == 0) {
          data = [];
          inventoryDataArr[0] = data;
        }
        for (var j = 0; j < inventoryList.length; j++) {
          data = [];
          data[0] = inventoryList[j].inventoryId;
          data[1] = inventoryList[j].realmCountryPlanningUnit.id;
          data[2] = inventoryList[j].dataSource.id;
          data[3] = inventoryList[j].region.id;
          data[4] = inventoryList[j].inventoryDate;
          data[5] = inventoryList[j].expectedBal;
          data[6] = inventoryList[j].adjustmentQty;
          data[7] = inventoryList[j].actualQty;
          data[8] = inventoryList[j].batchNo;
          data[9] = inventoryList[j].expiryDate;
          data[10] = inventoryList[j].active;
          inventoryDataArr[j] = data;
        }
        latestDataJsonInventory = inventoryDataArr;
        this.setState({
          latestDataJsonInventory: latestDataJsonInventory
        })
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
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

                var planningUnitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                var planningUnitOs = planningUnitTransaction.objectStore('programPlanningUnit');
                var planningUnitRequest = planningUnitOs.getAll();
                planningUnitRequest.onsuccess = function (event) {
                  var planningUnitResult = [];
                  planningUnitResult = planningUnitRequest.result;
                  for (var k = 0; k < planningUnitResult.length; k++) {
                    var planningUnitJson = {
                      name: planningUnitResult[k].planningUnit.label.label_en,
                      id: planningUnitResult[k].planningUnit.id
                    }
                    planningUnitList[k] = planningUnitJson
                  }

                  var countrySKUTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                  var countrySKUOs = countrySKUTransaction.objectStore('realmCountryPlanningUnit');
                  var countrySKURequest = countrySKUOs.getAll();
                  countrySKURequest.onsuccess = function (event) {
                    var countrySKUResult = [];
                    countrySKUResult = countrySKURequest.result;
                    for (var k = 0; k < countrySKUResult.length; k++) {
                      // if (countrySKUResult[k].realmCountry.realmCountryId == programJson.realmCountry.realmCountryId) {
                      var countrySKUJson = {
                        name: countrySKUResult[k].label.label_en,
                        id: countrySKUResult[k].realmCountryPlanningUnitId
                      }
                      countrySkuList[k] = countrySKUJson
                      // }
                    }
                    var consumptionList = (programJson.consumptionList);
                    this.setState({
                      consumptionList: consumptionList
                    });
                    var inventoryList = (programJson.inventoryList);
                    this.setState({
                      inventoryList: inventoryList
                    });
                    var data = [];
                    var consumptionDataArr = []
                    if (consumptionList.length == 0) {
                      data = [];
                      consumptionDataArr[0] = data;
                    }
                    for (var j = 0; j < consumptionList.length; j++) {
                      data = [];
                      data[0] = consumptionList[j].consumptionId;
                      data[1] = consumptionList[j].planningUnit.id;
                      data[2] = consumptionList[j].dataSource.id;
                      data[3] = consumptionList[j].region.id;
                      data[4] = consumptionList[j].consumptionQty;
                      data[5] = consumptionList[j].dayOfStockOut;
                      data[6] = consumptionList[j].startDate;
                      data[7] = consumptionList[j].stopDate;
                      data[8] = consumptionList[j].active;
                      data[9] = consumptionList[j].actualFlag;
                      consumptionDataArr[j] = data;
                    }

                    this.el = jexcel(document.getElementById("oldVersionConsumption"), '');
                    this.el.destroy();
                    oldDataJsonConsumption = consumptionDataArr;
                    this.setState({
                      oldDataJsonConsumption: oldDataJsonConsumption
                    })
                    var options = {
                      data: oldDataJsonConsumption,
                      columnDrag: true,
                      colWidths: [180, 180, 180, 180, 180, 180, 180, 180, 180],
                      columns: [
                        {
                          title: 'Consumption Id',
                          type: 'hidden'
                        },
                        {
                          title: 'Planning unit',
                          type: 'dropdown',
                          source: planningUnitList
                        },
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
                          type: 'hidden',
                        },
                        {
                          title: 'Actual Flag',
                          type: 'dropdown',
                          source: [{ id: true, name: 'Actual' }, { id: false, name: 'Forecast' }]
                        }
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
                      editable: false,
                      onload: this.loadedFunction
                    };

                    this.el = jexcel(document.getElementById("oldVersionConsumption"), options);


                    var data = [];
                    var inventoryDataArr = []
                    if (inventoryList.length == 0) {
                      data = [];
                      inventoryDataArr[0] = data;
                    }
                    for (var j = 0; j < inventoryList.length; j++) {

                      data = [];
                      data[0] = inventoryList[j].inventoryId;
                      data[1] = inventoryList[j].realmCountryPlanningUnit.id;
                      data[2] = inventoryList[j].dataSource.id;
                      data[3] = inventoryList[j].region.id;
                      data[4] = inventoryList[j].inventoryDate;
                      data[5] = inventoryList[j].expectedBal;
                      data[6] = inventoryList[j].adjustmentQty;
                      data[7] = inventoryList[j].actualQty;
                      data[8] = inventoryList[j].batchNo;
                      data[9] = inventoryList[j].expiryDate;
                      data[10] = inventoryList[j].active;
                      inventoryDataArr[j] = data;

                    }
                    this.el = jexcel(document.getElementById("oldVersionInventory"), '');
                    this.el.destroy();
                    oldDataJsonInventory = inventoryDataArr;
                    this.setState({
                      oldDataJsonInventory: oldDataJsonInventory
                    })
                    var options = {
                      data: oldDataJsonInventory,
                      columnDrag: true,
                      colWidths: [100, 100, 100, 130, 130, 130, 130, 130, 130],
                      columns: [
                        {
                          title: 'Inventory Id',
                          type: 'hidden'
                        },
                        {
                          title: 'Country SKU',
                          type: 'dropdown',
                          source: countrySkuList
                        },
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
                          title: 'Inventory Date',
                          type: 'calendar'

                        },
                        {
                          title: 'Expected Stock',
                          type: 'text',
                          readOnly: true
                        },
                        {
                          title: 'Manual Adjustment',
                          type: 'text'
                        },
                        {
                          title: 'Actual Stock',
                          type: 'text'
                        },
                        {
                          title: 'Batch Number',
                          type: 'text'
                        },
                        {
                          title: 'Expire Date',
                          type: 'calendar'

                        },
                        {
                          title: 'Active',
                          type: 'hidden'
                        }

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
                      oneditionend: this.onedit,
                      editable: false,
                      onload: this.loadedFunctionInventory
                    };

                    this.el = jexcel(document.getElementById("oldVersionInventory"), options);

                    this.el = jexcel(document.getElementById("latestVersionConsumption"), '');
                    this.el.destroy();
                    var options = {
                      data: latestDataJsonConsumption,
                      columnDrag: true,
                      colWidths: [180, 180, 180, 180, 180, 180, 180, 180, 180],
                      columns: [
                        {
                          title: 'Consumption Id',
                          type: 'hidden',
                        },
                        {
                          title: 'Planning unit',
                          type: 'dropdown',
                          source: planningUnitList
                        },
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
                          type: 'hidden'
                        },
                        {
                          title: 'Actual Flag',
                          type: 'dropdown',
                          source: [{ id: true, name: 'Actual' }, { id: false, name: 'Forecast' }]
                        }
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
                      editable: false,
                      onload: this.loadedFunctionLatest
                    };

                    this.el = jexcel(document.getElementById("latestVersionConsumption"), options);

                    this.el = jexcel(document.getElementById("latestVersionInventory"), '');
                    this.el.destroy();
                    var options = {
                      data: latestDataJsonInventory,
                      columnDrag: true,
                      colWidths: [100, 100, 100, 130, 130, 130, 130, 130, 130],
                      columns: [
                        {
                          title: 'Inventory Id',
                          type: 'hidden'
                        },
                        {
                          title: 'Country SKU',
                          type: 'dropdown',
                          source: countrySkuList
                        },
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
                          title: 'Inventory Date',
                          type: 'calendar'

                        },
                        {
                          title: 'Expected Stock',
                          type: 'text',
                          readOnly: true
                        },
                        {
                          title: 'Manual Adjustment',
                          type: 'text'
                        },
                        {
                          title: 'Actual Stock',
                          type: 'text'
                        },
                        {
                          title: 'Batch Number',
                          type: 'text'
                        },
                        {
                          title: 'Expire Date',
                          type: 'calendar'

                        },
                        {
                          title: 'Active',
                          type: 'hidden'
                        }

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
                      oneditionend: this.onedit,
                      editable: false,
                      onload: this.loadedFunctionLatestInventory
                    };

                    this.el = jexcel(document.getElementById("latestVersionInventory"), options);

                    var mergedDataConsumption = [];
                    for (var i = 0; i < latestDataJsonConsumption.length; i++) {
                      if (oldDataJsonConsumption.length > i) {
                        if ((latestDataJsonConsumption[i])[0] == (oldDataJsonConsumption[i])[0]) {
                          mergedDataConsumption.push(oldDataJsonConsumption[i])
                        } else {
                          mergedDataConsumption.push(latestDataJsonConsumption[i])
                        }
                      } else {
                        mergedDataConsumption.push(latestDataJsonConsumption[i]);
                      }
                    }

                    for (var i = 0; i < oldDataJsonConsumption.length; i++) {
                      if ((oldDataJsonConsumption[i])[0] == 0) {
                        mergedDataConsumption.push(oldDataJsonConsumption[i])
                      }
                    }

                    this.el = jexcel(document.getElementById("mergedVersionConsumption"), '');
                    this.el.destroy();
                    mergedDataConsumption = mergedDataConsumption;
                    this.setState({
                      mergedDataJsonConsumption: mergedDataConsumption
                    })
                    var options = {
                      data: mergedDataConsumption,
                      columnDrag: true,
                      colWidths: [180, 180, 180, 180, 180, 180, 180, 180, 180],
                      columns: [
                        {
                          title: 'Consumption Id',
                          type: 'hidden',
                        },
                        {
                          title: 'Planning unit',
                          type: 'dropdown',
                          source: planningUnitList
                        },
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
                          type: 'hidden'
                        },
                        {
                          title: 'Actual Flag',
                          type: 'dropdown',
                          source: [{ id: true, name: 'Actual' }, { id: false, name: 'Forecast' }]
                        }
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
                      editable: false,
                      onload: this.loadedFunctionForMerge
                    };

                    this.el = jexcel(document.getElementById("mergedVersionConsumption"), options);

                    var mergedDataInventory = [];
                    for (var i = 0; i < latestDataJsonInventory.length; i++) {
                      if (oldDataJsonInventory.length > i) {
                        if ((latestDataJsonInventory[i])[0] == (oldDataJsonInventory[i])[0]) {
                          mergedDataInventory.push(oldDataJsonInventory[i])
                        } else {
                          mergedDataInventory.push(latestDataJsonInventory[i])
                        }
                      } else {
                        mergedDataInventory.push(latestDataJsonInventory[i]);
                      }
                    }

                    for (var i = 0; i < oldDataJsonInventory.length; i++) {
                      if ((oldDataJsonInventory[i])[0] == 0) {
                        mergedDataInventory.push(oldDataJsonInventory[i])
                      }
                    }

                    this.el = jexcel(document.getElementById("mergedVersionInventory"), '');
                    this.el.destroy();
                    mergedDataInventory = mergedDataInventory;
                    this.setState({
                      mergedDataInventory: mergedDataInventory
                    })
                    var options = {
                      data: mergedDataInventory,
                      columnDrag: true,
                      colWidths: [100, 100, 100, 130, 130, 130, 130, 130, 130],
                      columns: [
                        {
                          title: 'Inventory Id',
                          type: 'hidden'
                        },
                        {
                          title: 'Country SKU',
                          type: 'dropdown',
                          source: countrySkuList
                        },
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
                          title: 'Inventory Date',
                          type: 'calendar'

                        },
                        {
                          title: 'Expected Stock',
                          type: 'text',
                          readOnly: true
                        },
                        {
                          title: 'Manual Adjustment',
                          type: 'text'
                        },
                        {
                          title: 'Actual Stock',
                          type: 'text'
                        },
                        {
                          title: 'Batch Number',
                          type: 'text'
                        },
                        {
                          title: 'Expire Date',
                          type: 'calendar'

                        },
                        {
                          title: 'Active',
                          type: 'hidden'
                        }

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
                      oneditionend: this.onedit,
                      editable: false,
                      onload: this.loadedFunctionForMergeInventory
                    };

                    this.el = jexcel(document.getElementById("mergedVersionInventory"), options);
                  }.bind(this)
                }.bind(this)
              }.bind(this)
            }.bind(this)
          }.bind(this)
        }.bind(this)
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
  }


  loadedFunction = function (instance) {
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    var elInstance = instance.jexcel;
    var latestDataJsonConsumption = this.state.latestDataJsonConsumption
    var jsonData = elInstance.getJson();
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[8] == true) {
        if ((jsonData[y])[0] != 0) {
          var latestFilteredData = (latestDataJsonConsumption[y])[0];
          var col = ("A").concat(parseInt(y) + 1);
          var value = elInstance.getValueFromCoords(0, y);
          if (value == latestFilteredData) {
            for (var j = 1; j < colArr.length; j++) {
              var col = (colArr[j]).concat(parseInt(y) + 1);
              var valueToCompare = elInstance.getValueFromCoords(j, y);
              var valueToCompareWith = (latestDataJsonConsumption[y])[j];
              if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
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
      } else {
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "#FF8686");
        }
      }
    }
  }

  loadedFunctionForMerge = function (instance) {
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    var oldDataJson = this.state.oldDataJsonConsumption
    var latestDataJson = this.state.latestDataJsonConsumption
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[8] == true) {
        if ((jsonData[y])[0] != 0) {
          if (oldDataJson.length > y) {
            var oldFilteredData = (oldDataJson[y])[0];
            var col = ("A").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(0, y);
            if (value == oldFilteredData) {
              for (var j = 1; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(y) + 1);
                var valueToCompare = elInstance.getValueFromCoords(j, y);
                var valueToCompareWith = (latestDataJson[y])[j];
                if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
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
      } else {
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "#FF8686");
        }
      }
    }
  }

  loadedFunctionInventory = function (instance) {
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
    var elInstance = instance.jexcel;
    var latestDataJsonInventory = this.state.latestDataJsonInventory
    var jsonData = elInstance.getJson();
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[10] == true) {
        if ((jsonData[y])[0] != 0) {
          var latestFilteredData = (latestDataJsonInventory[y])[0];
          var col = ("A").concat(parseInt(y) + 1);
          var value = elInstance.getValueFromCoords(0, y);
          if (value == latestFilteredData) {
            for (var j = 1; j < colArr.length; j++) {
              var col = (colArr[j]).concat(parseInt(y) + 1);
              var valueToCompare = elInstance.getValueFromCoords(j, y);
              var valueToCompareWith = (latestDataJsonInventory[y])[j];
              if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
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
      } else {
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "#FF8686");
        }
      }
    }
  }

  loadedFunctionForMergeInventory = function (instance) {
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    var oldDataJson = this.state.oldDataJsonInventory
    var latestDataJson = this.state.latestDataJsonInventory
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[10] == true) {
        if ((jsonData[y])[0] != 0) {
          if (oldDataJson.length > y) {
            var oldFilteredData = (oldDataJson[y])[0];
            var col = ("A").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(0, y);
            if (value == oldFilteredData) {
              for (var j = 1; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(y) + 1);
                var valueToCompare = elInstance.getValueFromCoords(j, y);
                var valueToCompareWith = (latestDataJson[y])[j];
                if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
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
      } else {
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "#FF8686");
        }
      }
    }
  }

  loadedFunctionLatest = function (instance) {
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[8] == true) {
      } else {
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "#FF8686");
        }
      }
    }
  }

  loadedFunctionLatestInventory = function (instance) {
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[10] == true) {
      } else {
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "#FF8686");
        }
      }
    }
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
                    <div className="table-responsive RemoveStriped">
                      <div id="oldVersionConsumption" />
                    </div>
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
                    <div className="table-responsive RemoveStriped">
                      <div id="latestVersionConsumption" />
                    </div>
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
                    <div className="table-responsive RemoveStriped">
                      <div id="mergedVersionConsumption" />
                    </div>
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
                    <div className="table-responsive RemoveStriped">
                      <div id="oldVersionInventory" />
                    </div>
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
                    <div className="table-responsive RemoveStriped" >
                      <div id="latestVersionInventory" />
                    </div>
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
                    <div className="table-responsive RemoveStriped">
                      <div id="mergedVersionInventory" />
                    </div>
                  </Col>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </>
    );
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
                              <Button color="secondary Gobtn btn-sm" onClick={this.getDataForCompare}>{i18n.t('static.common.compare')}</Button>
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
                            <li><span className="lightpinklegend"></span> Difference between versions</li>
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
                </div>
              </CardBody>
              <CardFooter>
                <FormGroup>
                  <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                  <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={this.synchronize} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')} </Button>
                  &nbsp;
                                        </FormGroup>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  synchronize() {
    document.getElementById("detailsDiv").style.display = "block";
    var programId = document.getElementById('programId').value;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open('fasp', 1);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programData'], 'readwrite');
      var programTransaction = transaction.objectStore('programData');
      var programRequest = programTransaction.get(programId);
      programRequest.onsuccess = function (event) {
        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
        var programJson = JSON.parse(programData);
        console.log("Program json",programJson);
      }
    }
  }

  cancelClicked() {
    this.props.history.push(`/dashboard/` + i18n.t('static.program.actioncancelled'))
  }
}
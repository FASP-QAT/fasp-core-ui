import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import {
  Col, Row, Card, CardBody, CardHeader, Form,
  FormGroup, Label, InputGroup, Input, InputGroupAddon, Button,
  Nav, NavItem, NavLink, TabContent, TabPane, CardFooter
} from 'reactstrap';
import CryptoJS from 'crypto-js';
import { SECRET_KEY, PENDING_APPROVAL_VERSION_STATUS, CANCELLED_SHIPMENT_STATUS } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from '../../api/ProgramService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import moment from "moment";

const entityname = i18n.t('static.dashboard.commitVersion')
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
      mergedConsumptionList: [],
      oldDataJsonInventory: [],
      latestDataJsonInventory: [],
      mergedDataInventory: [],
      mergedInventoryList: [],
      consumptionIdArray: [],
      inventoryIdArray: [],
      oldDataJsonShipment: [],
      latestDataJsonShipment: [],
      mergedDataShipment: [],
      mergedShipmentList: [],
      shipmentIdArray: [],
      versionTypeList: [],
      batchArray: [],
      lang: localStorage.getItem('lang'),
      negativeBatchNumbers: "",
      isErpMatching: true,
      isChanged: false
    }
    this.toggle = this.toggle.bind(this);
    this.getDataForCompare = this.getDataForCompare.bind(this);
    this.loadedFunctionForMerge = this.loadedFunctionForMerge.bind(this);
    // this.loadedFunction = this.loadedFunction.bind(this)

    this.loadedFunctionForMergeInventory = this.loadedFunctionForMergeInventory.bind(this);
    this.loadedFunctionForMergeShipment = this.loadedFunctionForMergeShipment.bind(this);
    this.cancelClicked = this.cancelClicked.bind(this);
    this.synchronize = this.synchronize.bind(this);
    this.checkValidationForNegativeStockInBatch = this.checkValidationForNegativeStockInBatch.bind(this);
  }

  toggle(tabPane, tab) {
    const newArray = this.state.activeTab.slice()
    newArray[tabPane] = tab
    this.setState({
      activeTab: newArray,
    });
  }

  componentDidMount() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open('fasp', 1);
    openRequest.onerror = function (event) {
      this.setState({
        commitVersionError: i18n.t('static.program.errortext')
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['programData'], 'readwrite');
      var program = transaction.objectStore('programData');
      var getRequest = program.getAll();
      var proList = [];

      getRequest.onerror = function (event) {
        this.setState({
          commitVersionError: i18n.t('static.program.errortext')
        })
      }.bind(this);
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
              name: getLabelText(JSON.parse(programNameLabel), this.state.lang) + "~v" + myResult[i].version,
              id: myResult[i].id
            }
            proList[i] = programJson
          }
        }
        this.setState({
          programList: proList
        })

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getVersionTypeList().then(response => {
          console.log('**' + JSON.stringify(response.data))
          this.setState({
            versionTypeList: response.data,
          })
        })
          .catch(
            error => {
              this.setState({
                statuses: [],
              })
              if (error.message === "Network Error") {
                this.setState({ message: error.message });
              } else {
                switch (error.response ? error.response.status : "") {
                  case 500:
                  case 401:
                  case 404:
                  case 406:
                  case 412:
                    this.setState({ message: error.response.data.messageCode });
                    break;
                  default:
                    this.setState({ message: 'static.unkownError' });
                    break;
                }
              }
            }
          );


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
        var procurementAgentList = []
        var procurementUnitList = []
        var supplierList = []
        var shipmentStatusList = []
        var latestDataJsonConsumption = []
        var oldDataJsonConsumption = []
        var latestDataJsonInventory = []
        var oldDataJsonInventory = []
        var oldInventoryList = [];
        var oldConsumptionList = [];
        var oldShipmentList = [];
        var latestInventoryList = [];
        var latestConsumptionList = [];
        var latestShipmentList = [];
        var latestDataJsonShipment = []
        var oldDataJsonShipment = []
        var procurementAgentListAll = [];
        var procurementUnitListAll = [];
        var shipmentStatusListAll = []
        var programJson = response.data
        var consumptionList = (programJson.consumptionList);
        var inventoryList = (programJson.inventoryList);
        var shipmentList = (programJson.shipmentList);
        var batchNumberArray = [];
        var realmCountryId = programJson.realmCountry.realmCountryId;
        var batchNumberList = programJson.batchInfoList;
        for (var i = 0; i < batchNumberList.length; i++) {
          if (!batchNumberArray.includes(batchNumberList[i].batchNo)) {
            batchNumberArray.push(batchNumberList[i].batchNo);
          }
        }
        this.setState({
          consumptionList: consumptionList,
          inventoryList: inventoryList,
          shipmentList: shipmentList,
          realmCountryId: realmCountryId
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
          data[6] = consumptionList[j].consumptionDate;
          data[7] = consumptionList[j].notes;
          data[8] = consumptionList[j].active;
          data[9] = consumptionList[j].actualFlag;
          consumptionDataArr[j] = data;
        }
        latestDataJsonConsumption = consumptionDataArr;
        latestConsumptionList = consumptionList
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
          data[8] = inventoryList[j].notes;
          data[9] = inventoryList[j].active;
          inventoryDataArr[j] = data;
        }
        latestDataJsonInventory = inventoryDataArr;
        latestInventoryList = inventoryList;
        this.setState({
          latestDataJsonInventory: latestDataJsonInventory,
          latestInventoryList: inventoryList
        })


        var data = [];
        var shipmentDataArr = []
        if (shipmentList.length == 0) {
          data = [];
          shipmentDataArr[0] = data;
        }
        for (var j = 0; j < shipmentList.length; j++) {
          data = [];
          data[0] = shipmentList[j].shipmentId;
          data[1] = shipmentList[j].expectedDeliveryDate; // A
          data[2] = shipmentList[j].shipmentStatus.id; //B
          data[3] = shipmentList[j].orderNo; //C
          data[4] = shipmentList[j].primeLineNo; //D
          data[5] = shipmentList[j].dataSource.id; // E
          data[6] = shipmentList[j].procurementAgent.id; //F
          data[7] = shipmentList[j].planningUnit.id; //G
          data[8] = shipmentList[j].suggestedQty; //H
          data[9] = shipmentList[j].shipmentQty;
          data[10] = shipmentList[j].rate;//Manual price
          data[11] = shipmentList[j].procurementUnit.id;
          data[12] = shipmentList[j].supplier.id;
          data[13] = shipmentList[j].productCost;
          data[14] = shipmentList[j].shipmentMode;//Shipment method
          data[15] = shipmentList[j].freightCost;// Freight Cost
          data[16] = `=N${j + 1}+P${j + 1}`
          data[17] = shipmentList[j].notes;//Notes
          data[18] = shipmentList[j].active;
          shipmentDataArr[j] = data;
        }
        latestDataJsonShipment = shipmentDataArr;
        latestShipmentList = shipmentList;
        this.setState({
          latestDataJsonShipment: latestDataJsonShipment
        })
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
          this.setState({
            commitVersionError: i18n.t('static.program.errortext')
          })
        }.bind(this);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;
          var transaction = db1.transaction(['programData'], 'readwrite');
          var programTransaction = transaction.objectStore('programData');
          var programRequest = programTransaction.get(programId);
          programRequest.onerror = function (event) {
            this.setState({
              commitVersionError: i18n.t('static.program.errortext')
            })
          }.bind(this);
          programRequest.onsuccess = function (event) {
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);
            var batchNumberList = programJson.batchInfoList;
            for (var i = 0; i < batchNumberList.length; i++) {
              if (!batchNumberArray.includes(batchNumberList[i].batchNo)) {
                batchNumberArray.push(batchNumberList[i].batchNo);
              }
            }
            this.setState({ batchNumberArray: batchNumberArray });
            var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
            var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
            var dataSourceRequest = dataSourceOs.getAll();
            dataSourceRequest.onerror = function (event) {
              this.setState({
                commitVersionError: i18n.t('static.program.errortext')
              })
            }.bind(this);
            dataSourceRequest.onsuccess = function (event) {
              var dataSourceResult = [];
              dataSourceResult = dataSourceRequest.result;
              for (var k = 0; k < dataSourceResult.length; k++) {
                if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
                  if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                    var dataSourceJson = {
                      name: getLabelText(dataSourceResult[k].label, this.state.lang),
                      id: dataSourceResult[k].dataSourceId
                    }
                    dataSourceList[k] = dataSourceJson
                  }
                }
              }
              var regionTransaction = db1.transaction(['region'], 'readwrite');
              var regionOs = regionTransaction.objectStore('region');
              var regionRequest = regionOs.getAll();
              regionRequest.onerror = function (event) {
                this.setState({
                  commitVersionError: i18n.t('static.program.errortext')
                })
              }.bind(this);
              regionRequest.onsuccess = function (event) {
                var regionResult = [];
                regionResult = regionRequest.result;
                for (var k = 0; k < regionResult.length; k++) {
                  if (regionResult[k].realmCountry.realmCountryId == programJson.realmCountry.realmCountryId) {
                    var regionJson = {
                      name: getLabelText(regionResult[k].label, this.state.lang),
                      id: regionResult[k].regionId
                    }
                    regionList[k] = regionJson
                  }
                }

                var planningUnitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                var planningUnitOs = planningUnitTransaction.objectStore('programPlanningUnit');
                var planningUnitRequest = planningUnitOs.getAll();
                planningUnitRequest.onerror = function (event) {
                  this.setState({
                    commitVersionError: i18n.t('static.program.errortext')
                  })
                }.bind(this);
                planningUnitRequest.onsuccess = function (event) {
                  var planningUnitResult = [];
                  planningUnitResult = planningUnitRequest.result;
                  for (var k = 0; k < planningUnitResult.length; k++) {
                    var planningUnitJson = {
                      name: getLabelText(planningUnitResult[k].planningUnit.label, this.state.lang),
                      id: planningUnitResult[k].planningUnit.id
                    }
                    planningUnitList[k] = planningUnitJson
                  }

                  var countrySKUTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                  var countrySKUOs = countrySKUTransaction.objectStore('realmCountryPlanningUnit');
                  var countrySKURequest = countrySKUOs.getAll();
                  countrySKURequest.onerror = function (event) {
                    this.setState({
                      commitVersionError: i18n.t('static.program.errortext')
                    })
                  }.bind(this);
                  countrySKURequest.onsuccess = function (event) {
                    var countrySKUResult = [];
                    countrySKUResult = countrySKURequest.result;
                    for (var k = 0; k < countrySKUResult.length; k++) {
                      // if (countrySKUResult[k].realmCountry.realmCountryId == programJson.realmCountry.realmCountryId) {
                      var countrySKUJson = {
                        name: getLabelText(countrySKUResult[k].label, this.state.lang),
                        id: countrySKUResult[k].realmCountryPlanningUnitId
                      }
                      countrySkuList[k] = countrySKUJson
                      // }
                    }

                    var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                    var papuOs = papuTransaction.objectStore('procurementAgentPlanningUnit');
                    var papuRequest = papuOs.getAll();
                    papuRequest.onerror = function (event) {
                      this.setState({
                        commitVersionError: i18n.t('static.program.errortext')
                      })
                    }.bind(this);
                    papuRequest.onsuccess = function (event) {
                      var papuResult = [];
                      papuResult = papuRequest.result;
                      for (var k = 0; k < papuResult.length; k++) {
                        var papuJson = {
                          name: getLabelText(papuResult[k].procurementAgent.label, this.state.lang),
                          id: papuResult[k].procurementAgent.id
                        }
                        procurementAgentList.push(papuJson);
                        procurementAgentListAll.push(papuResult[k]);
                      }

                      var procurementUnitTransaction = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                      var procurementUnitOs = procurementUnitTransaction.objectStore('procurementAgentProcurementUnit');
                      var procurementUnitRequest = procurementUnitOs.getAll();
                      procurementUnitRequest.onerror = function (event) {
                        this.setState({
                          commitVersionError: i18n.t('static.program.errortext')
                        })
                      }.bind(this);
                      procurementUnitRequest.onsuccess = function (event) {
                        var procurementUnitResult = [];
                        procurementUnitResult = procurementUnitRequest.result;
                        for (var k = 0; k < procurementUnitResult.length; k++) {
                          var procurementUnitJson = {
                            name: getLabelText(procurementUnitResult[k].procurementUnit.label, this.state.lang),
                            id: procurementUnitResult[k].procurementUnit.id
                          }
                          procurementUnitList.push(procurementUnitJson);
                          procurementUnitListAll.push(procurementUnitResult[k]);
                        }
                        this.setState({
                          procurementUnitListAll: procurementUnitListAll,
                          procurementAgentListAll: procurementAgentListAll
                        });
                        var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                        var supplierOs = supplierTransaction.objectStore('supplier');
                        var supplierRequest = supplierOs.getAll();
                        supplierRequest.onerror = function (event) {
                          this.setState({
                            commitVersionError: i18n.t('static.program.errortext')
                          })
                        }.bind(this);
                        supplierRequest.onsuccess = function (event) {
                          var supplierResult = [];
                          supplierResult = supplierRequest.result;
                          for (var k = 0; k < supplierResult.length; k++) {
                            if (supplierResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                              var supplierJson = {
                                name: getLabelText(supplierResult[k].label, this.state.lang),
                                id: supplierResult[k].supplierId
                              }
                              supplierList.push(supplierJson);
                            }
                          }

                          var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                          var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                          var shipmentStatusRequest = shipmentStatusOs.getAll();
                          shipmentStatusRequest.onerror = function (event) {
                            this.setState({
                              commitVersionError: i18n.t('static.program.errortext')
                            })
                          }.bind(this);
                          shipmentStatusRequest.onsuccess = function (event) {
                            var shipmentStatusResult = [];
                            shipmentStatusResult = shipmentStatusRequest.result;
                            for (var k = 0; k < shipmentStatusResult.length; k++) {

                              var shipmentStatusJson = {
                                name: getLabelText(shipmentStatusResult[k].label, this.state.lang),
                                id: shipmentStatusResult[k].shipmentStatusId
                              }
                              shipmentStatusList[k] = shipmentStatusJson
                              shipmentStatusListAll.push(shipmentStatusResult[k])
                            }
                            this.setState({ shipmentStatusList: shipmentStatusListAll })
                            var consumptionList = (programJson.consumptionList);
                            this.setState({
                              consumptionList: consumptionList
                            });
                            var inventoryList = (programJson.inventoryList);
                            this.setState({
                              inventoryList: inventoryList
                            });

                            var shipmentList = (programJson.shipmentList);
                            this.setState({
                              shipmentList: shipmentList
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
                              data[6] = consumptionList[j].consumptionDate;
                              data[7] = consumptionList[j].notes;
                              data[8] = consumptionList[j].active;
                              data[9] = consumptionList[j].actualFlag;
                              consumptionDataArr[j] = data;
                            }

                            // this.el = jexcel(document.getElementById("oldVersionConsumption"), '');
                            // this.el.destroy();
                            oldDataJsonConsumption = consumptionDataArr;
                            oldConsumptionList = consumptionList;

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
                              data[8] = inventoryList[j].notes;
                              data[9] = inventoryList[j].active;
                              inventoryDataArr[j] = data;

                            }
                            oldDataJsonInventory = inventoryDataArr;
                            oldInventoryList = inventoryList;

                            var data = [];
                            var shipmentDataArr = []
                            if (shipmentList.length == 0) {
                              data = [];
                              shipmentDataArr[0] = data;
                            }
                            for (var j = 0; j < shipmentList.length; j++) {
                              data = [];
                              data[0] = shipmentList[j].shipmentId;
                              data[1] = shipmentList[j].expectedDeliveryDate; // A
                              data[2] = shipmentList[j].shipmentStatus.id; //B
                              data[3] = shipmentList[j].orderNo; //C
                              data[4] = shipmentList[j].primeLineNo; //D
                              data[5] = shipmentList[j].dataSource.id; // E
                              data[6] = shipmentList[j].procurementAgent.id; //F
                              data[7] = shipmentList[j].planningUnit.id; //G
                              data[8] = shipmentList[j].suggestedQty; //H
                              data[9] = shipmentList[j].shipmentQty;
                              data[10] = shipmentList[j].rate;//Manual price
                              data[11] = shipmentList[j].procurementUnit.id;
                              data[12] = shipmentList[j].supplier.id;
                              data[13] = shipmentList[j].productCost;
                              data[14] = shipmentList[j].shipmentMode;//Shipment method
                              data[15] = shipmentList[j].freightCost;// Freight Cost
                              data[16] = `=N${j + 1}+P${j + 1}`
                              data[17] = shipmentList[j].notes;//Notes
                              data[18] = shipmentList[j].active;
                              shipmentDataArr[j] = data;
                            }

                            oldDataJsonShipment = shipmentDataArr;
                            oldShipmentList = shipmentList;
                            
                            var mergedDataConsumption = [];
                            var mergedConsumptionList = [];
                            var consumptionIdArray = [];
                            for (var i = 0; i < oldDataJsonConsumption.length; i++) {
                              if ((oldDataJsonConsumption[i])[0] != 0) {
                                mergedDataConsumption.push(oldDataJsonConsumption[i]);
                                mergedConsumptionList.push(oldConsumptionList[i]);
                                consumptionIdArray.push((oldDataJsonConsumption[i])[0]);
                              }
                            }
                            for (var i = 0; i < oldDataJsonConsumption.length; i++) {
                              if ((oldDataJsonConsumption[i])[0] == 0) {
                                var checkIfExists = latestConsumptionList.filter(c =>
                                  moment(c.consumptionDate).format("YYYY-MM") == moment(oldConsumptionList[i].consumptionDate).format("YYYY-MM") &&
                                  c.region.id == oldConsumptionList[i].region.id &&
                                  c.planningUnit.id == oldConsumptionList[i].planningUnit.id &&
                                  c.actualFlag == oldConsumptionList[i].actualFlag
                                )
                                console.log("CheckIfExists", checkIfExists);
                                if (checkIfExists.length > 0) {
                                  (oldDataJsonConsumption[i])[0] = checkIfExists[0].consumptionId;
                                  mergedDataConsumption.push(oldDataJsonConsumption[i])
                                  mergedConsumptionList.push(oldConsumptionList[i]);
                                  consumptionIdArray.push(checkIfExists[0].consumptionId)
                                } else {
                                  mergedDataConsumption.push(oldDataJsonConsumption[i])
                                  mergedConsumptionList.push(oldConsumptionList[i])
                                }
                              }
                            }
                            for (var i = 0; i < latestDataJsonConsumption.length; i++) {
                              if (consumptionIdArray.includes((latestDataJsonConsumption[i])[0])) {
                              } else {
                                mergedDataConsumption.push(latestDataJsonConsumption[i]);
                                mergedConsumptionList.push(latestConsumptionList[i]);
                                // consumptionIdArray.push(latestDataJsonConsumption[i].consumptionId);
                              }
                            }
                            this.el = jexcel(document.getElementById("mergedVersionConsumption"), '');
                            this.el.destroy();
                            mergedDataConsumption = mergedDataConsumption;
                            this.setState({
                              mergedDataJsonConsumption: mergedDataConsumption,
                              consumptionIdArray: consumptionIdArray,
                              mergedConsumptionList: mergedConsumptionList
                            })
                            var options = {
                              data: mergedDataConsumption,
                              columnDrag: true,
                              colWidths: [10, 200, 150, 120, 80, 80, 100, 180, 10, 100],
                              columns: [
                                {
                                  title: i18n.t('static.commit.consumptionId'),
                                  type: 'hidden',
                                },
                                {
                                  title: i18n.t('static.planningunit.planningunit'),
                                  type: 'dropdown',
                                  source: planningUnitList
                                },
                                {
                                  title: i18n.t('static.datasource.datasource'),
                                  type: 'dropdown',
                                  source: dataSourceList
                                },
                                {
                                  title: i18n.t('static.region.region'),
                                  type: 'dropdown',
                                  source: regionList
                                },
                                {
                                  title: i18n.t('static.consumption.consumptionqty'),
                                  type: 'text'
                                },
                                {
                                  title: i18n.t('static.consumption.daysofstockout'),
                                  type: 'text'
                                },
                                {
                                  title: i18n.t('static.report.consumptionDate'),
                                  type: 'calendar',
                                  options: { format: 'MM-YYYY' }
                                },
                                {
                                  title: i18n.t('static.program.notes'),
                                  type: 'text'
                                },
                                {
                                  title: i18n.t('static.inventory.active'),
                                  type: 'hidden'
                                },
                                { type: 'checkbox', title: i18n.t('static.consumption.actualflag') },
                              ],
                              pagination: 10,
                              // paginationOptions: [10, 25, 50, 100],
                              search: true,
                              columnSorting: true,
                              tableOverflow: true,
                              wordWrap: true,
                              allowInsertColumn: false,
                              allowManualInsertColumn: false,
                              allowDeleteRow: false,
                              onchange: this.changed,
                              editable: false,
                              onload: this.loadedFunctionForMerge,
                              text: {
                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                show: '',
                                entries: '',
                              },
                            };

                            this.el = jexcel(document.getElementById("mergedVersionConsumption"), options);

                            var mergedDataInventory = [];
                            var mergedInventoryList = [];
                            var inventoryIdArray = [];
                            for (var i = 0; i < oldDataJsonInventory.length; i++) {
                              if ((oldDataJsonInventory[i])[0] != 0) {
                                mergedDataInventory.push(oldDataJsonInventory[i]);
                                mergedInventoryList.push(oldInventoryList[i]);
                                inventoryIdArray.push((oldDataJsonInventory[i])[0]);
                              }
                            }
                            for (var i = 0; i < oldDataJsonInventory.length; i++) {
                              if ((oldDataJsonInventory[i])[0] == 0) {
                                var checkIfExists = latestInventoryList.filter(c =>
                                  moment(c.inventoryDate).format("YYYY-MM") == moment(oldInventoryList[i].inventoryDate).format("YYYY-MM") &&
                                  c.region.id == oldInventoryList[i].region.id &&
                                  c.realmCountryPlanningUnit.id == oldInventoryList[i].realmCountryPlanningUnit.id
                                )
                                console.log("CheckIfExists", checkIfExists);
                                if (checkIfExists.length > 0) {
                                  (oldDataJsonInventory[i])[0] = checkIfExists[0].inventoryId;
                                  mergedDataInventory.push(oldDataJsonInventory[i])
                                  mergedInventoryList.push(oldInventoryList[i]);
                                  inventoryIdArray.push(checkIfExists[0].inventoryId)
                                } else {
                                  mergedDataInventory.push(oldDataJsonInventory[i])
                                  mergedInventoryList.push(oldInventoryList[i]);
                                }
                              }
                            }
                            for (var i = 0; i < latestDataJsonInventory.length; i++) {
                              if (inventoryIdArray.includes((latestDataJsonInventory[i])[0])) {
                              } else {
                                mergedDataInventory.push(latestDataJsonInventory[i]);
                                mergedInventoryList.push(latestInventoryList[i]);
                                // inventoryIdArray.push(latestDataJsonInventory[i].consumptionId);
                              }
                            }

                            this.el = jexcel(document.getElementById("mergedVersionInventory"), '');
                            this.el.destroy();
                            mergedDataInventory = mergedDataInventory;
                            this.setState({
                              mergedDataInventory: mergedDataInventory,
                              inventoryIdArray: inventoryIdArray,
                              mergedInventoryList: mergedInventoryList
                            })
                            var options = {
                              data: mergedDataInventory,
                              columnDrag: true,
                              colWidths: [10, 200, 100, 100, 100, 80, 80, 80, 200],
                              columns: [
                                {
                                  title: i18n.t('static.commit.inventoryId'),
                                  type: 'hidden'
                                },
                                {
                                  title: i18n.t('static.planningunit.countrysku'),
                                  type: 'dropdown',
                                  source: countrySkuList
                                },
                                {
                                  title: i18n.t('static.inventory.dataSource'),
                                  type: 'dropdown',
                                  source: dataSourceList
                                },
                                {
                                  title: i18n.t('static.inventory.region'),
                                  type: 'dropdown',
                                  source: regionList
                                },
                                {
                                  title: i18n.t('static.inventory.inventoryDate'),
                                  type: 'calendar',
                                  options: { format: 'MM-YYYY' }

                                },
                                {
                                  title: i18n.t('static.inventory.expectedStock'),
                                  type: 'hidden',
                                  readOnly: true
                                },
                                {
                                  title: i18n.t('static.inventory.manualAdjustment'),
                                  type: 'text'
                                },
                                {
                                  title: i18n.t('static.inventory.actualStock'),
                                  type: 'text'
                                },
                                {
                                  title: i18n.t('static.program.notes'),
                                  type: 'text'
                                },
                                {
                                  title: i18n.t('static.inventory.active'),
                                  type: 'hidden'
                                }

                              ],
                              pagination: 10,
                              // paginationOptions: [10, 25, 50, 100],
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
                              text: {
                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                show: '',
                                entries: '',
                              },
                              onload: this.loadedFunctionForMergeInventory
                            };

                            this.el = jexcel(document.getElementById("mergedVersionInventory"), options);



                            var mergedDataShipment = [];
                            var mergedShipmentList = [];
                            var shipmentIdArray = [];
                            for (var i = 0; i < oldDataJsonShipment.length; i++) {
                              if ((oldDataJsonShipment[i])[0] != 0) {
                                mergedDataShipment.push(oldDataJsonShipment[i]);
                                mergedShipmentList.push(oldShipmentList[i]);
                                shipmentIdArray.push((oldDataJsonShipment[i])[0]);
                              }
                            }
                            for (var i = 0; i < oldDataJsonShipment.length; i++) {
                              if ((oldDataJsonShipment[i])[0] == 0) {
                                var checkIfExists = latestShipmentList.filter(c =>
                                  moment(c.expectedDeliveryDate).format("YYYY-MM") == moment(oldShipmentList[i].expectedDeliveryDate).format("YYYY-MM") &&
                                  c.planningUnit.id == oldShipmentList[i].planningUnit.id &&
                                  c.procurementAgent.id == oldShipmentList[i].procurementAgent.id &&
                                  c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS
                                )
                                console.log("CheckIfExists", checkIfExists);
                                if (checkIfExists.length > 0) {
                                  (oldDataJsonShipment[i])[0] = checkIfExists[0].shipmentId;
                                  mergedDataShipment.push(oldDataJsonShipment[i])
                                  mergedShipmentList.push(oldShipmentList[i]);
                                  shipmentIdArray.push(checkIfExists[0].shipmentId)
                                } else {
                                  mergedDataShipment.push(oldDataJsonShipment[i])
                                  mergedShipmentList.push(oldShipmentList[i]);
                                }
                              }
                            }
                            for (var i = 0; i < latestDataJsonShipment.length; i++) {
                              if (shipmentIdArray.includes((latestDataJsonShipment[i])[0])) {
                              } else {
                                mergedDataShipment.push(latestDataJsonShipment[i]);
                                mergedShipmentList.push(latestShipmentList[i]);
                                // inventoryIdArray.push(latestDataJsonInventory[i].consumptionId);
                              }
                            }

                            this.el = jexcel(document.getElementById("mergedVersionShipment"), '');
                            this.el.destroy();
                            mergedDataShipment = mergedDataShipment;
                            this.setState({
                              mergedDataShipment: mergedDataShipment,
                              shipmentIdArray: shipmentIdArray,
                              mergedShipmentList: mergedShipmentList
                            })
                            var options = {
                              data: mergedDataShipment,
                              columnDrag: true,
                              colWidths: [100, 100, 100, 100, 120, 120, 200, 80, 80, 80, 80, 100, 100, 80, 80, 80, 80, 80, 250, 120, 80, 100, 80, 80, 80, 100],
                              columns: [
                                { type: 'hidden', title: i18n.t('static.commit.shipmentId') },
                                { type: 'calendar', options: { format: 'MM-DD-YYYY', validRange: [moment(Date.now()).format("YYYY-MM-DD"), ''] }, title: i18n.t('static.supplyPlan.expectedDeliveryDate') },
                                { type: 'dropdown', title: i18n.t('static.supplyPlan.shipmentStatus'), source: shipmentStatusList },
                                { type: 'text', title: i18n.t('static.supplyPlan.orderNo') },
                                { type: 'text', title: i18n.t('static.supplyPlan.primeLineNo') },
                                { type: 'dropdown', title: i18n.t('static.datasource.datasource'), source: dataSourceList },
                                { type: 'dropdown', title: i18n.t('static.procurementagent.procurementagent'), source: procurementAgentList },
                                { type: 'dropdown', readOnly: true, title: i18n.t('static.planningunit.planningunit'), source: planningUnitList },
                                { type: 'number', readOnly: true, title: i18n.t('static.supplyPlan.suggestedOrderQty') },
                                { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.adjustesOrderQty') },
                                { type: 'text', title: i18n.t("static.supplyPlan.userPrice") },
                                { type: 'dropdown', title: i18n.t('static.procurementUnit.procurementUnit'), source: procurementUnitList },
                                { type: 'dropdown', title: i18n.t('static.procurementUnit.supplier'), source: supplierList },
                                { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.amountInUSD') },
                                { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: ['Sea', 'Air'] },
                                { type: 'text', title: i18n.t('static.supplyPlan.userFreight') },
                                { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.totalAmount') },
                                { type: 'text', title: i18n.t('static.program.notes') },
                                { type: 'checkbox', title: i18n.t('static.common.active') },
                              ],
                              pagination: 10,
                              // paginationOptions: [10, 25, 50, 100],
                              search: true,
                              columnSorting: true,
                              tableOverflow: true,
                              wordWrap: true,
                              allowInsertColumn: false,
                              allowManualInsertColumn: false,
                              allowDeleteRow: false,
                              editable: false,
                              text: {
                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                show: '',
                                entries: '',
                              },
                              onload: this.loadedFunctionForMergeShipment
                            };

                            this.el = jexcel(document.getElementById("mergedVersionShipment"), options);
                          }.bind(this)
                        }.bind(this)
                      }.bind(this)
                    }.bind(this)
                  }.bind(this)
                }.bind(this)
              }.bind(this)
            }.bind(this)
          }.bind(this)
        }.bind(this)
      })
      .catch(
        error => {
          this.setState({
            statuses: [],
          })
          if (error.message === "Network Error") {
            this.setState({ message: error.message });
          } else {
            switch (error.response ? error.response.status : "") {
              case 500:
              case 401:
              case 404:
              case 406:
              case 412:
                this.setState({ message: error.response.data.messageCode });
                break;
              default:
                this.setState({ message: 'static.unkownError' });
                break;
            }
          }
        }
      );
  }

  loadedFunctionForMerge = function (instance) {
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    var latestDataJson = this.state.latestDataJsonConsumption
    var consumptionIdArray = this.state.consumptionIdArray;
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[8] == true) {
        if ((jsonData[y])[0] != 0) {
          if (consumptionIdArray.includes((jsonData[y])[0])) {
            for (var z = 0; z < latestDataJson.length; z++) {
              if ((jsonData[y])[0] == (latestDataJson[z])[0]) {
                for (var j = 1; j < colArr.length; j++) {
                  var col = (colArr[j]).concat(parseInt(y) + 1);
                  var valueToCompare = (jsonData[y])[j];
                  var valueToCompareWith = (latestDataJson[z])[j];
                  if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
                    elInstance.setStyle(col, "background-color", "transparent");
                  } else {
                    elInstance.setStyle(col, "background-color", "yellow");
                    this.setState({
                      isChanged: true
                    })
                  }
                }
                z = latestDataJson.length
              }
            }
          } else {
            // Else for new data in latest version
            for (var j = 0; j < colArr.length; j++) {
              var col = (colArr[j]).concat(parseInt(y) + 1);
              elInstance.setStyle(col, "background-color", "#e5edf5");
            }
          }
        } else {
          this.setState({
            isChanged: true
          })
          // Else part for new entries in current version
          for (var j = 0; j < colArr.length; j++) {
            var col = (colArr[j]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "#86cd99");
          }
        }
      } else {
        // Else part for inactive colour
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "red");
        }
      }
    }
  }

  loadedFunctionForMergeInventory = function (instance) {
    // jExcelLoadedFunction(instance);
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    var latestDataJson = this.state.latestDataJsonInventory
    var inventoryIdArray = this.state.inventoryIdArray;
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[9] == true) {
        if ((jsonData[y])[0] != 0) {
          if (inventoryIdArray.includes((jsonData[y])[0])) {
            for (var z = 0; z < latestDataJson.length; z++) {
              if ((jsonData[y])[0] == (latestDataJson[z])[0]) {
                for (var j = 1; j < colArr.length; j++) {
                  var col = (colArr[j]).concat(parseInt(y) + 1);
                  var valueToCompare = (jsonData[y])[j];
                  var valueToCompareWith = (latestDataJson[z])[j];
                  if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
                    elInstance.setStyle(col, "background-color", "transparent");
                  } else {
                    this.setState({
                      isChanged: true
                    })
                    elInstance.setStyle(col, "background-color", "yellow");
                  }
                }
                z = latestDataJson.length
              }
            }
          } else {
            // Else for new data in latest version
            for (var j = 0; j < colArr.length; j++) {
              var col = (colArr[j]).concat(parseInt(y) + 1);
              elInstance.setStyle(col, "background-color", "#e5edf5");
            }
          }
        } else {
          // Else part for new entries in current version
          this.setState({
            isChanged: true
          })
          for (var j = 0; j < colArr.length; j++) {
            var col = (colArr[j]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "#86cd99");
          }
        }
      } else {
        // Else part for inactive colour
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "red");
        }
      }
    }
  }

  loadedFunctionForMergeShipment = function (instance) {
    // jExcelLoadedFunction(instance);
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S']
    var elInstance = instance.jexcel;
    var jsonData = elInstance.getJson();
    var latestDataJson = this.state.latestDataJsonShipment
    var shipmentIdArray = this.state.shipmentIdArray;
    for (var y = 0; y < jsonData.length; y++) {
      if ((jsonData[y])[18] == true) {
        if ((jsonData[y])[0] != 0) {
          if (shipmentIdArray.includes((jsonData[y])[0])) {
            for (var z = 0; z < latestDataJson.length; z++) {
              if ((jsonData[y])[0] == (latestDataJson[z])[0]) {
                for (var j = 1; j < colArr.length; j++) {
                  var col = (colArr[j]).concat(parseInt(y) + 1);
                  var valueToCompare = (jsonData[y])[j];
                  var valueToCompareWith = (latestDataJson[z])[j];
                  if ((valueToCompare == valueToCompareWith) || (valueToCompare == "" && valueToCompareWith == null) || (valueToCompare == null && valueToCompareWith == "")) {
                    elInstance.setStyle(col, "background-color", "transparent");
                  } else {
                    elInstance.setStyle(col, "background-color", "yellow");
                    this.setState({
                      isChanged: true
                    })
                  }
                }

                // Logic for ERP Validation
                var valueToCompareOrderNumber = (jsonData[y])[3];
                var valueToCompareWithOrderNumber = (latestDataJson[z])[3];

                var valueToComparePrimeLineNumber = (jsonData[y])[4];
                var valueToCompareWithPrimeLineNumber = (latestDataJson[z])[4];

                console.log("Value To compare order number", valueToCompareOrderNumber);
                console.log("Value To compare with order number", valueToCompareWithOrderNumber);

                console.log("Value To compare line number", valueToComparePrimeLineNumber);
                console.log("Value To compare with line number", valueToCompareWithPrimeLineNumber);
                console.log("shipmentStatus---------->", (jsonData[y])[2]);
                if (valueToCompareOrderNumber != "" && valueToComparePrimeLineNumber != "") {
                  var countOrderNumberAndLineNumber = this.state.mergedShipmentList.filter(c => c.orderNo == valueToCompareOrderNumber && c.primeLineNo == valueToComparePrimeLineNumber);
                  console.log("length of order number", countOrderNumberAndLineNumber.length)
                  if (countOrderNumberAndLineNumber.length == 1) {
                    if (valueToCompareOrderNumber != valueToCompareWithOrderNumber || valueToComparePrimeLineNumber != valueToCompareWithPrimeLineNumber) {
                      console.log("On", valueToCompareOrderNumber, "LN",
                        valueToComparePrimeLineNumber,
                        "rci", this.state.realmCountryId, "PI",
                        (jsonData[y])[7])
                      AuthenticationService.setupAxiosInterceptors();
                      ProgramService.checkOrderNumberAndLineNumber(
                        valueToCompareOrderNumber,
                        valueToComparePrimeLineNumber,
                        this.state.realmCountryId,
                        (jsonData[y])[7]
                      ).then(response => {
                        console.log("Resposne.data", response.config.url.split("/")[7]);
                        console.log("Prime number", response.config.url.split("/")[9]);
                        if (response.data == 0) {
                          console.log("Did match")
                        } else {
                          console.log("y", y)
                          var index = this.state.mergedShipmentList.findIndex(c => c.orderNo == response.config.url.split("/")[7] && c.primeLineNo == response.config.url.split("/")[9])
                          console.log("Index", index);
                          for (var j = 0; j < colArr.length; j++) {
                            var col = (colArr[j]).concat(parseInt(index) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", "orange");
                          }
                        }
                        this.setState({
                          isErpMatching: false
                        })
                      })
                        .catch(
                          error => {
                            console.log("Didn't match");
                            this.setState({
                              statuses: [],
                            })
                            if (error.message === "Network Error") {
                              this.setState({ message: error.message });
                            } else {
                              switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                  this.setState({ message: error.response.data.messageCode });
                                  break;
                                default:
                                  this.setState({ message: 'static.unkownError' });
                                  break;
                              }
                            }
                          }
                        );

                    }
                  } else {
                    console.log("in else")
                    for (var j = 0; j < colArr.length; j++) {
                      var col = (colArr[j]).concat(parseInt(y) + 1);
                      elInstance.setStyle(col, "background-color", "transparent");
                      elInstance.setStyle(col, "background-color", "orangered");
                    }
                    this.setState({
                      isErpMatching: false
                    })
                  }
                }

                z = latestDataJson.length
              }
            }
          } else {
            // Else for new data in latest version
            for (var j = 0; j < colArr.length; j++) {
              var col = (colArr[j]).concat(parseInt(y) + 1);
              elInstance.setStyle(col, "background-color", "#e5edf5");
            }
          }
        } else {
          // Else part for new entries in current version
          for (var j = 0; j < colArr.length; j++) {
            var col = (colArr[j]).concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "#86cd99");
          }
          this.setState({
            isChanged: true
          })
          var valueToCompareOrderNumber = (jsonData[y])[3];
          var valueToComparePrimeLineNumber = (jsonData[y])[4];
          if (valueToCompareOrderNumber != "" && valueToComparePrimeLineNumber != "") {
            var countOrderNumberAndLineNumber = this.state.mergedShipmentList.filter(c => c.orderNo == valueToCompareOrderNumber && c.primeLineNo == valueToComparePrimeLineNumber);
            console.log("length of order number", countOrderNumberAndLineNumber.length)
            if (countOrderNumberAndLineNumber.length == 1) {
              // if (valueToCompareOrderNumber != valueToCompareWithOrderNumber || valueToComparePrimeLineNumber != valueToCompareWithPrimeLineNumber) {
              console.log("On", valueToCompareOrderNumber, "LN",
                valueToComparePrimeLineNumber,
                "rci", this.state.realmCountryId, "PI",
                (jsonData[y])[7])
              AuthenticationService.setupAxiosInterceptors();
              ProgramService.checkOrderNumberAndLineNumber(
                valueToCompareOrderNumber,
                valueToComparePrimeLineNumber,
                this.state.realmCountryId,
                (jsonData[y])[7]
              ).then(response => {
                console.log("Resposne.data", response.config.url.split("/")[7]);
                console.log("Prime number", response.config.url.split("/")[9]);
                if (response.data == 0) {
                  console.log("Did match")
                } else {
                  console.log("y", y)
                  var index = this.state.mergedShipmentList.findIndex(c => c.orderNo == response.config.url.split("/")[7] && c.primeLineNo == response.config.url.split("/")[9])
                  console.log("Index", index);
                  for (var j = 0; j < colArr.length; j++) {
                    var col = (colArr[j]).concat(parseInt(index) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "orange");
                  }
                }
                this.setState({
                  isErpMatching: false
                })
              })
                .catch(
                  error => {
                    console.log("Didn't match");
                    this.setState({
                      statuses: [],
                    })
                    if (error.message === "Network Error") {
                      this.setState({ message: error.message });
                    } else {
                      switch (error.response ? error.response.status : "") {
                        case 500:
                        case 401:
                        case 404:
                        case 406:
                        case 412:
                          this.setState({ message: error.response.data.messageCode });
                          break;
                        default:
                          this.setState({ message: 'static.unkownError' });
                          break;
                      }
                    }
                  }
                );

              // }
            } else {
              console.log("in else")
              for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "orangered");
              }
              this.setState({
                isErpMatching: false
              })
            }
          }

        }
      } else {
        // Else part for inactive colour
        for (var j = 0; j < colArr.length; j++) {
          var col = (colArr[j]).concat(parseInt(y) + 1);
          elInstance.setStyle(col, "background-color", "red");
        }
      }
    }
  }

  tabPane() {
    return (
      <>
        <TabPane tabId="1">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0" id="realmDiv">
                <div className="table-responsive RemoveStriped">
                  <div id="mergedVersionConsumption" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0" id="realmDiv">
                <div className="table-responsive RemoveStriped">
                  <div id="mergedVersionInventory" />
                </div>
              </Col>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="3">
          <Row>
            <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
              <Col md="12 pl-0" id="realmDiv">
                <div className="table-responsive RemoveStriped">
                  <div id="mergedVersionShipment" />
                </div>
              </Col>
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

    const { versionTypeList } = this.state;
    let versionTypes = versionTypeList.length > 0
      && versionTypeList.map((item, i) => {
        return (
          <option key={i} value={item.id}>{getLabelText(item.label, this.state.lang)}</option>
        )
      }, this);

    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} />
        <h5>{i18n.t(this.state.message, { entityname })}</h5>
        <h6 className="red">{(this.state.negativeBatchNumbers != "" && (this.state.negativeBatchNumbers).concat(i18n.t('static.commit.negativeStock'))) || this.state.commitVersionError}</h6>
        <Row>
          <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <strong>{i18n.t('static.dashboard.commitVersion')}</strong>
              </CardHeader>
              <CardBody>

                <Form name='simpleForm'>
                  <Col md="12 pl-0">

                    <div className="row">
                      <FormGroup className="col-md-4 ">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                        <div className="controls  ">
                          <InputGroup>
                            <Input type="select"
                              bsSize="sm"
                              // value={this.state.programId}
                              name="programId" id="programId"
                              onChange={this.getDataForCompare}
                            >
                              <option value="0">{i18n.t('static.common.select')}</option>
                              {programs}
                            </Input>
                          </InputGroup>
                        </div>

                      </FormGroup>
                      
                    </div>
                    <div className="col-md-12 pl-0 mt-0 mb-2">
                        <ul class="legendcommitversion">
                          <li><span class="lightpinklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commit.differenceBetweenVersions')}</span></li>
                          <li><span class=" greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commit.newDataCurrentVersion')} </span></li>
                          <li><span class="notawesome legendcolor"></span > <span className="legendcommitversionText">{i18n.t('static.commit.newDataLatestVersion')} </span></li>
                          <li><span class="redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commit.inactiveData')} </span></li>
                          <li><span class="orangelegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commit.erpDidNotMatch')} </span></li>
                          <li><span class="orangeredlegend legendcolor"></span><span className="legendcommitversionText"> {i18n.t('static.commit.duplicateErp')} </span></li>

                        </ul>
                      </div>
                  </Col>
                </Form>
                <div id="detailsDiv">
                  <div className="animated fadeIn">
                    <Row>
                      <FormGroup className="tab-ml-1">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.versiontype')}</Label>
                        <div className="controls SelectGo">
                          <InputGroup>
                            <Input type="select"
                              bsSize="sm"
                              name="versionType" id="versionType"
                            >
                              {versionTypes}
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                      <FormGroup className="tab-ml-1">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.notes')}</Label>
                        <div className="controls SelectGo">
                          <InputGroup>
                            <Input type="textarea"
                              bsSize="sm"
                              name="notes" id="notes"
                            >
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                    </Row>
                    <Row>
                      <Col xs="12" md="12" className="mb-4">
                        <Nav tabs>
                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '1'}
                              onClick={() => { this.toggle(0, '1'); }}
                            >
                              {i18n.t('static.dashboard.consumption')}
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '2'}
                              onClick={() => { this.toggle(0, '2'); }}
                            >
                              {i18n.t('static.inventory.inventory')}
                            </NavLink>
                          </NavItem>

                          <NavItem>
                            <NavLink
                              active={this.state.activeTab[0] === '3'}
                              onClick={() => { this.toggle(0, '3'); }}
                            >
                              {i18n.t('static.shipment.shipment')}
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
                  {this.state.isErpMatching && this.state.isChanged && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={this.synchronize} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')} </Button>}
                  &nbsp;
                                        </FormGroup>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  checkValidationForNegativeStockInBatch() {
    var negativeBatchNumbers = "";
    var expiredBatchNumbers = this.state.batchNumberArray;
    for (var ebn = 0; ebn < expiredBatchNumbers.length; ebn++) {
      var shipmentList = this.state.mergedShipmentList;
      var shipmentBatchArray = [];
      for (var ship = 0; ship < shipmentList.length; ship++) {
        var batchInfoList = shipmentList[ship].batchInfoList;
        for (var bi = 0; bi < batchInfoList.length; bi++) {
          shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
        }
      }
      var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn])[0];
      var totalStockForBatchNumber = stockForBatchNumber.qty;
      console.log("Total stock batch number", totalStockForBatchNumber, "Batch number", expiredBatchNumbers[ebn]);

      var consumptionList = this.state.mergedConsumptionList;
      var consumptionBatchArray = [];
      for (var con = 0; con < consumptionList.length; con++) {
        var batchInfoList = consumptionList[con].batchInfoList;
        for (var bi = 0; bi < batchInfoList.length; bi++) {
          console.log("batchInfoList[bi].consumptionQty", batchInfoList[bi].consumptionQty)
          consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
        }
      }
      var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn]);
      var consumptionQty = 0;
      for (var b = 0; b < consumptionForBatchNumber.length; b++) {
        consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
      }
      console.log("Total consumptions batch number", consumptionQty, "Batch number", expiredBatchNumbers[ebn]);
      var inventoryList = this.state.mergedInventoryList;
      var inventoryBatchArray = [];
      for (var inv = 0; inv < inventoryList.length; inv++) {
        var batchInfoList = inventoryList[inv].batchInfoList;
        for (var bi = 0; bi < batchInfoList.length; bi++) {
          inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
        }
      }
      var inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn]);
      var adjustmentQty = 0;
      for (var b = 0; b < inventoryForBatchNumber.length; b++) {
        adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
      }

      console.log("Total adjustments batch number", adjustmentQty, "Batch number", expiredBatchNumbers[ebn]);
      var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
      console.log("RemainingBtach Qty", remainingBatchQty, " For batch number", expiredBatchNumbers[ebn]);
      if (remainingBatchQty < 0) {
        negativeBatchNumbers = negativeBatchNumbers.concat(expiredBatchNumbers[ebn].toString()).concat(",");
        console.log("NegativebatchNumbers", negativeBatchNumbers);
      }

    }
    console.log("Negative baych mnumbers", negativeBatchNumbers);
    if (negativeBatchNumbers != "") {
      console.log("In if")
      negativeBatchNumbers = negativeBatchNumbers.substring(0, negativeBatchNumbers.length - 1);
      this.setState({
        negativeBatchNumbers: negativeBatchNumbers
      })
      return false;
    } else {
      return true;
    }
  }

  synchronize() {
    if (navigator.onLine) {
      var validate = this.checkValidationForNegativeStockInBatch();
      if (validate) {
        document.getElementById("detailsDiv").style.display = "block";
        var programId = document.getElementById('programId').value;
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
          this.setState({
            commitVersionError: i18n.t('static.program.errortext')
          })
        }.bind(this);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;
          var transaction = db1.transaction(['programData'], 'readwrite');
          var programTransaction = transaction.objectStore('programData');
          var programRequest = programTransaction.get(programId);
          programRequest.onerror = function (event) {
            this.setState({
              commitVersionError: i18n.t('static.program.errortext')
            })
          }.bind(this);
          programRequest.onsuccess = function (event) {
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);
            programJson.versionType = { id: document.getElementById("versionType").value };
            programJson.versionStatus = { id: PENDING_APPROVAL_VERSION_STATUS };
            programJson.notes = document.getElementById("notes").value;
            programJson.consumptionList = this.state.mergedConsumptionList;
            programJson.inventoryList = this.state.mergedInventoryList;
            programJson.shipmentList = this.state.mergedShipmentList;
            console.log("Program Json",programJson)
            ProgramService.saveProgramData(programJson).then(response => {
              if (response.status == 200) {
                this.props.history.push(`/ApplicationDashboard/` + 'green/' + i18n.t('static.message.commitSuccess', { entityname }))
              } else {
                this.setState({
                  message: response.data.messageCode
                })
              }
            }).catch(
              error => {
                this.setState({
                  statuses: [],
                })
                if (error.message === "Network Error") {
                  this.setState({ message: error.message });
                } else {
                  switch (error.response ? error.response.status : "") {
                    case 500:
                    case 401:
                    case 404:
                    case 406:
                    case 412:
                      this.setState({ message: error.response.data.messageCode });
                      break;
                    default:
                      this.setState({ message: 'static.unkownError' });
                      break;
                  }
                }
              }
            );
            console.log("Program json", programJson);
          }.bind(this)
        }.bind(this)
      } else {
      }
    } else {
      this.setState({
        message: 'static.common.onlinealerttext'
      })
    }
  }

  cancelClicked() {
    console.log("inside cancel")
    this.props.history.push(`/ApplicationDashboard/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
  }
}
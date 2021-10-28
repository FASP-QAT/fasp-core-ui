import React, { Component } from "react";
import { NavLink } from 'react-router-dom';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import ProgramService from "../../api/ProgramService";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import CountryService from '../../api/CountryService.js';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import moment from 'moment';
import RealmCountryService from '../../api/RealmCountryService';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from "../../Constants";
import MultiSelect from 'react-multi-select-component';
import CryptoJS from 'crypto-js'

const entityname = i18n.t('static.program.programMaster');
export default class VersionSettingsComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            programValues: [],
            programLabels: [],
            datasetList: [],
            lang: 'en',
            message: '',
            selProgram: [],
            countryList: [],
            lang: localStorage.getItem('lang'),
            loading: true,
            versionTypeList: [],
            versionSettingsList: [
            ]
        }

        this.filterData = this.filterData.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.getDatasetList = this.getDatasetList.bind(this);
        this.getVersionTypeList = this.getVersionTypeList.bind(this);
        this.getDatasetById = this.getDatasetById.bind(this);

    }
    getDatasetById(datasetIds) {
        console.log("datasetIds---", datasetIds);
        var versionSettingsList = [];
        this.state.datasetList.map(dataset => {
            if (datasetIds.includes(dataset.programId)) {
                var databytes = CryptoJS.AES.decrypt(dataset.programData, SECRET_KEY);
                var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                dataset.programData = programData;
                versionSettingsList.push(dataset);
            }
        })

        console.log("versionSettingsList---", versionSettingsList);
        this.setState({ versionSettingsList }, () => { this.buildJExcel() });
    }
    getVersionTypeList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['versionType'], 'readwrite');
            var program = transaction.objectStore('versionType');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                console.log("myResult version type---", myResult)
                this.setState({
                    versionTypeList: myResult
                });
                for (var i = 0; i < myResult.length; i++) {
                    console.log("datasetList--->", myResult[i])

                }

            }.bind(this);
        }.bind(this);
    }

    getDatasetList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                var proList = [];
                myResult = getRequest.result;
                console.log("myResult---", myResult)
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                console.log("userId---", userId);
                for (var i = 0; i < myResult.length; i++) {
                    console.log("inside for---", myResult[i]);
                    if (myResult[i].userId == userId) {
                        proList.push(myResult[i])
                    }
                }
                this.setState({
                    datasetList: proList
                });
                for (var i = 0; i < myResult.length; i++) {
                    console.log("datasetList--->", myResult[i])

                }

            }.bind(this);
        }.bind(this);
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }


    filterData() {
        this.buildJExcel();
        // let countryId = document.getElementById("countryId").value;
        // var selStatus = document.getElementById("active").value;
        // console.log("countryId--------->", countryId);
        // console.log("selStatus--------->", selStatus);
        // if (countryId != 0 && selStatus != "") {
        //     console.log("1------------");
        //     let tempSelStatus = (selStatus == "true" ? true : false)
        //     // const selProgram = this.state.programList.filter(c => c.realmCountry.country.countryId == countryId)
        //     const selProgram = this.state.programList.filter(c => c.realmCountry.realmCountryId == countryId && c.active == tempSelStatus)
        //     this.setState({
        //         selProgram: selProgram
        //     }, () => {
        //         this.buildJExcel();
        //     });
        // } else if (countryId != 0) {
        //     console.log("2------------");
        //     // const selProgram = this.state.programList.filter(c => c.realmCountry.country.countryId == countryId)
        //     const selProgram = this.state.programList.filter(c => c.realmCountry.realmCountryId == countryId)
        //     this.setState({
        //         selProgram: selProgram
        //     }, () => {
        //         this.buildJExcel();
        //     });
        // } else if (selStatus != "") {
        //     console.log("3------------");
        //     let tempSelStatus = (selStatus == "true" ? true : false)
        //     const selProgram = this.state.programList.filter(c => c.active == tempSelStatus)
        //     this.setState({
        //         selProgram: selProgram
        //     }, () => {
        //         this.buildJExcel();
        //     });
        // } else {
        //     console.log("4------------");
        //     this.setState({
        //         selProgram: this.state.programList
        //     }, () => {
        //         this.buildJExcel();
        //     });
        // }
    }

    editProgram(program) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROGRAM')) {
            this.props.history.push({
                pathname: `/program/editProgram/${program.programId}`,
                // state: { program }
            });
        }
    }

    buildJExcel() {
        let versionSettingsList = this.state.versionSettingsList;
        console.log("versionSettingsList---->", versionSettingsList.length);
        let versionSettingsArray = [];
        let count = 0;

        for (var j = 0; j < versionSettingsList.length; j++) {
            console.log("versionSettingsList[j]---", versionSettingsList[j]);
            var versionList = versionSettingsList[j].programData.versionList;
            console.log("versionList---", versionList);
            data = [];
            if (j == 0) {
                console.log("inside if-----------");
                data[0] = versionSettingsList[j].programId
                data[1] = versionSettingsList[j].programCode
                data[2] = versionSettingsList[j].programData.currentVersion.versionId+"(Local)"
                data[3] = '';
                data[4] = ''
                data[5] = ''
                data[6] = ''
                data[7] = versionSettingsList[j].programData.currentVersion.forecastStartDate
                data[8] = versionSettingsList[j].programData.currentVersion.forecastStopDate
                versionSettingsArray[count] = data;
                count++;
            }
            for (var k = 0; k < versionList.length; k++) {
                data = [];
                console.log("count----1>", count);
                data[0] = versionSettingsList[j].programId
                data[1] = versionSettingsList[j].programCode
                data[2] = versionList[j].versionId
                data[3] = getLabelText(versionList[j].versionType.label, this.state.lang);
                data[4] = versionList[j].notes
                data[5] = versionList[j].createdDate
                data[6] = versionList[j].createdBy.username
                data[7] = versionList[j].forecastStartDate
                data[8] = versionList[j].forecastStopDate
                versionSettingsArray[count] = data;
                count++;
                console.log("versionSettingsArray----2>", versionSettingsArray);
            }
        }
        // if (programList.length == 0) {
        //   data = [];
        //   programArray[0] = data;
        // }
        // console.log("versionSettingsArray---->", versionSettingsArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = versionSettingsArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 50, 50, 200, 100, 100, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'programId',
                    type: 'hidden',
                },
                {
                    title: 'Dataset',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Version',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Version Type',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Dataset Description',
                    type: 'text'
                },
                {
                    title: 'Date Committed',
                    readOnly: true,
                    type: 'calendar',
                    options: {
                        format: JEXCEL_DATE_FORMAT_SM
                    }


                },
                {
                    title: 'Commited by User',
                    type: 'text',
                    readOnly: true
                },
                {
                    title: 'Forecast Start',
                    type: 'calendar',
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker',
                        // validRange: [moment(expectedDeliveryDate).format("YYYY-MM-DD"), null]
                    }
                },
                {
                    title: 'Forecast End',
                    type: 'calendar',
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker',
                        // validRange: [moment(expectedDeliveryDate).format("YYYY-MM-DD"), 
                        // null]
                    }
                },

            ],
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            updateTable: function (el, cell, x, y, source, value, id) {
                var elInstance = el.jexcel;
                if (y != null) {
                    var rowData = elInstance.getRowData(y);
                    console.log("rowData--------", rowData);
                    console.log("x--------", x);
                    console.log("y--------", y);
                    if (rowData[0] && y == 0) {
                        var cell = elInstance.getCell(("E").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                        cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                        cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                    else {
                        var cell = elInstance.getCell(("E").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        cell = elInstance.getCell(("H").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                        cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }
                }
            }.bind(this),
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,


        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    selected = function (instance, cell, x, y, value) {

        // if (x == 0 && value != 0) {
        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
            if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROGRAM')) {
                // this.props.history.push({
                //     // pathname: `/forecastProgram/editForecastProgram/${this.el.getValueFromCoords(0, x)}`,
                //     // pathname: `/demographic/scenarioOne`,
                // });
            }
        }
    }.bind(this);

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }


    componentDidMount() {
        console.log("props--------------------", this.props);
        // AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();
        this.getDatasetList();
        this.getVersionTypeList();

        this.setState({
            // programList: [programJson1, programJson2, programJson3],
            // selProgram: [programJson1, programJson2, programJson3],
        },
            () => {
                this.filterData();
            })
    }

    handleChangeProgram(programIds) {
        programIds = programIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label)
        }, () => {
            var programIds = this.state.programValues.map(x => x.value).join(", ");
            console.log("program values ---", programIds);
            this.getDatasetById(programIds);
            // this.filterData()
            //   this.filterTracerCategory(programIds);

        })

    }

    render() {

        const { datasetList } = this.state;
        let programMultiList = datasetList.length > 0
            && datasetList.map((item, i) => {
                return ({ label: item.programCode, value: item.programId })

            }, this);

        programMultiList = Array.from(programMultiList);

        const { versionTypeList } = this.state;
        let versionTypes = versionTypeList.length > 0
            && versionTypeList.map((item, i) => {
                return (
                    <option key={i} value={item.versionTypeId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);



        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>

                    <CardBody className="pb-lg-0 mt-1">
                        {/* <Col md="3 pl-0" >
              <FormGroup className="Selectdiv mt-md-2 mb-md-0">
                <Label htmlFor="appendedInputButton">{i18n.t('static.region.country')}</Label>

                <div className="controls SelectGo">
                  <InputGroup>
                    <Input
                      type="select"
                      name="countryId"
                      id="countryId"
                      bsSize="sm"
                      onChange={this.filterData}
                    >
                      <option value="0">{i18n.t('static.common.all')}</option>
                      {countries}
                    </Input>
                  </InputGroup>
                </div>
              </FormGroup>
            </Col> */}

                        <Col md="6 pl-0">
                            <div className="d-md-flex Selectdiv2">
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{'Dataset'}</Label>
                                    <div className="controls ">
                                        {/* <InMultiputGroup> */}
                                        <MultiSelect
                                            // type="select"
                                            name="datasetId"
                                            id="datasetId"
                                            bsSize="sm"
                                            value={this.state.programValues}
                                            onChange={(e) => { this.handleChangeProgram(e) }}
                                            options={programMultiList && programMultiList.length > 0 ? programMultiList : []}
                                            labelledBy={i18n.t('static.common.regiontext')}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{'Version Type'}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="active"
                                                id="active"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                {versionTypes}

                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>

                        {/* <div id="loader" className="center"></div> */}<div id="tableDiv" className={"RemoveStriped"} style={{ display: this.state.loading ? "none" : "block" }}>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                    <div class="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>

                    </CardBody>
                </Card>

            </div>
        )
    }
}
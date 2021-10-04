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
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js';
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from "../../Constants";

const entityname = i18n.t('static.dataSet.dataSet');
export default class ProgramList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            programlist: [],
            lang: 'en',
            message: '',
            selProgram: [],
            countryList: [],
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.editProgram = this.editProgram.bind(this);
        this.addNewProgram = this.addNewProgram.bind(this);
        this.buttonFormatter = this.buttonFormatter.bind(this);
        this.addProductMapping = this.addProductMapping.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);

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
        let countryId = document.getElementById("countryId").value;
        var selStatus = document.getElementById("active").value;
        console.log("countryId--------->", countryId);
        console.log("selStatus--------->", selStatus);
        if (countryId != 0 && selStatus != "") {
            console.log("1------------");
            let tempSelStatus = (selStatus == "true" ? true : false)
            // const selProgram = this.state.programList.filter(c => c.realmCountry.country.countryId == countryId)
            const selProgram = this.state.programList.filter(c => c.realmCountry.realmCountryId == countryId && c.active == tempSelStatus)
            this.setState({
                selProgram: selProgram
            }, () => {
                this.buildJExcel();
            });
        } else if (countryId != 0) {
            console.log("2------------");
            // const selProgram = this.state.programList.filter(c => c.realmCountry.country.countryId == countryId)
            const selProgram = this.state.programList.filter(c => c.realmCountry.realmCountryId == countryId)
            this.setState({
                selProgram: selProgram
            }, () => {
                this.buildJExcel();
            });
        } else if (selStatus != "") {
            console.log("3------------");
            let tempSelStatus = (selStatus == "true" ? true : false)
            const selProgram = this.state.programList.filter(c => c.active == tempSelStatus)
            this.setState({
                selProgram: selProgram
            }, () => {
                this.buildJExcel();
            });
        } else {
            console.log("4------------");
            this.setState({
                selProgram: this.state.programList
            }, () => {
                this.buildJExcel();
            });
        }
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
        let programList = this.state.selProgram;
        // console.log("programList---->", programList);
        let programArray = [];
        let count = 0;

        for (var j = 0; j < programList.length; j++) {
            data = [];
            data[0] = programList[j].programId
            data[1] = getLabelText(programList[j].realmCountry.realm.label, this.state.lang)
            data[2] = getLabelText(programList[j].label, this.state.lang)
            data[3] = programList[j].programCode;
            data[4] = getLabelText(programList[j].realmCountry.country.label, this.state.lang)
            data[5] = programList[j].organisation.code
            data[6] = getLabelText(programList[j].healthArea.label, this.state.lang)
            data[7] = programList[j].useRegions
            data[8] = programList[j].lastModifiedBy.username;
            data[9] = (programList[j].lastModifiedDate ? moment(programList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)


            programArray[count] = data;
            count++;
        }
        // if (programList.length == 0) {
        //   data = [];
        //   programArray[0] = data;
        // }
        // console.log("programArray---->", programArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = programArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 200, 100, 100, 100, 100, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'programId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.program.realm'),
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.forecastProgram.forecastProgram'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.datasetDisplayName'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.realmcountry'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.organisation'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.healthareas'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.region'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                    readOnly: true
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


            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return [];
            }.bind(this),

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
            // if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROGRAM')) {
                this.props.history.push({
                    pathname: `/dataSet/editDataSet/${this.el.getValueFromCoords(0, x)}`,
                    // pathname: `/demographic/scenarioOne`,
                });
            // }
        }
    }.bind(this);

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }


    componentDidMount() {
        console.log("props--------------------", this.props);
        // AuthenticationService.setupAxiosInterceptors();
        this.hideFirstComponent();

        // ProgramService.getProgramListAll().then(response => {
        //   if (response.status == 200) {
        //     console.log("resp--------------------", response.data);
        //     this.setState({
        //       programList: response.data,
        //       selProgram: response.data,
        //       // loading: false
        //     },
        //       () => {
        //         // this.buildJExcel();
        //         this.filterData();
        //       })
        //   } else {
        //     this.setState({
        //       message: response.data.messageCode, loading: false
        //     },
        //       () => {
        //         this.hideSecondComponent();
        //       })
        //   }
        // }).catch(
        //   error => {
        //     if (error.message === "Network Error") {
        //       this.setState({
        //         message: 'static.unkownError',
        //         loading: false
        //       });
        //     } else {
        //       switch (error.response ? error.response.status : "") {

        //         case 401:
        //           this.props.history.push(`/login/static.message.sessionExpired`)
        //           break;
        //         case 403:
        //           this.props.history.push(`/accessDenied`)
        //           break;
        //         case 500:
        //         case 404:
        //         case 406:
        //           this.setState({
        //             message: error.response.data.messageCode,
        //             loading: false
        //           });
        //           break;
        //         case 412:
        //           this.setState({
        //             message: error.response.data.messageCode,
        //             loading: false
        //           });
        //           break;
        //         default:
        //           this.setState({
        //             message: 'static.unkownError',
        //             loading: false
        //           });
        //           break;
        //       }
        //     }
        //   }
        // );

        let programJson1 = {
            "createdBy": {
                "userId": 8,
                "username": "Shubham D"
            },
            "createdDate": "2021-02-20 11:00:00",
            "lastModifiedBy": {
                "userId": 8,
                "username": "Shubham D"
            },
            "lastModifiedDate": "2021-02-20 12:00:00",
            "active": true,
            "programId": 1,
            "programCode": "BEN-PRHCON-MOH",
            "realmCountry": {
                "realmCountryId": 5,
                "country": {
                    "countryId": 19,
                    "countryCode": "BEN",
                    "countryCode2": null,
                    "label": {
                        "labelId": 216,
                        "label_en": "Benin",
                    },
                },
                "realm": {
                    "realmId": 1,
                    "label": {
                        "labelId": 4,
                        "label_en": "Global Health",
                    },
                    "realmCode": "GHR",
                },
            },
            "organisation": {
                "id": 1,
                "label": {
                    "label_en": "Ministry of Health",
                },
                "code": "MOH"
            },
            "healthArea": {
                "id": 1,
                "label": {
                    "label_en": "Condoms,PRH/Condoms",
                },
                "code": "ARV"
            },
            "label": {
                "label_en": "Benin PRH,Condoms Forecast Dataset",
            },
            "programNotes": "",
            "airFreightPerc": 25,
            "seaFreightPerc": 8,
            "plannedToSubmittedLeadTime": 0.5,
            "submittedToApprovedLeadTime": 1.25,
            "approvedToShippedLeadTime": 0.75,
            "shippedToArrivedByAirLeadTime": 1,
            "shippedToArrivedBySeaLeadTime": 0.25,
            "arrivedToDeliveredLeadTime": 0.5,
            "useRegions": "National"
        }

        let programJson2 = {
            "createdBy": {
                "userId": 8,
                "username": "Shubham D"
            },
            "createdDate": "2021-02-20 11:00:00",
            "lastModifiedBy": {
                "userId": 8,
                "username": "Shubham D"
            },
            "lastModifiedDate": "2021-02-20 12:00:00",
            "active": true,
            "programId": 2,
            "programCode": "BEN-ARV/RTK-MOH",
            "realmCountry": {
                "realmCountryId": 5,
                "country": {
                    "countryId": 19,
                    "countryCode": "BEN",
                    "countryCode2": null,
                    "label": {
                        "labelId": 216,
                        "label_en": "Benin",
                    },
                },
                "realm": {
                    "realmId": 1,
                    "label": {
                        "labelId": 4,
                        "label_en": "Global Health",
                    },
                    "realmCode": "GHR",
                },
            },
            "organisation": {
                "id": 1,
                "label": {
                    "label_en": "Ministry of Health",
                },
                "code": "MOH"
            },
            "healthArea": {
                "id": 1,
                "label": {
                    "label_en": "Antiretrovirals,HIV rapid test kits",
                },
                "code": "ARV"
            },
            "label": {
                "label_en": "Benin ARV Forecast Dataset",
            },
            "programNotes": "",
            "airFreightPerc": 25,
            "seaFreightPerc": 8,
            "plannedToSubmittedLeadTime": 0.5,
            "submittedToApprovedLeadTime": 1.25,
            "approvedToShippedLeadTime": 0.75,
            "shippedToArrivedByAirLeadTime": 1,
            "shippedToArrivedBySeaLeadTime": 0.25,
            "arrivedToDeliveredLeadTime": 0.5,
            "useRegions": "National"
        }

        let programJson3 = {
            "createdBy": {
                "userId": 8,
                "username": "Shubham D"
            },
            "createdDate": "2021-02-20 11:00:00",
            "lastModifiedBy": {
                "userId": 8,
                "username": "Shubham D"
            },
            "lastModifiedDate": "2021-02-20 12:00:00",
            "active": true,
            "programId": 3,
            "programCode": "BEN-MAL-MOH",
            "realmCountry": {
                "realmCountryId": 5,
                "country": {
                    "countryId": 19,
                    "countryCode": "BEN",
                    "countryCode2": null,
                    "label": {
                        "labelId": 216,
                        "label_en": "Benin",
                    },
                },
                "realm": {
                    "realmId": 1,
                    "label": {
                        "labelId": 4,
                        "label_en": "Global Health",
                    },
                    "realmCode": "GHR",
                },
            },
            "organisation": {
                "id": 1,
                "label": {
                    "label_en": "Ministry of Health",
                },
                "code": "MOH"
            },
            "healthArea": {
                "id": 1,
                "label": {
                    "label_en": "Malaria",
                },
                "code": "ARV"
            },
            "label": {
                "label_en": "Benin Malaria Forecast Dataset",
            },
            "programNotes": "",
            "airFreightPerc": 25,
            "seaFreightPerc": 8,
            "plannedToSubmittedLeadTime": 0.5,
            "submittedToApprovedLeadTime": 1.25,
            "approvedToShippedLeadTime": 0.75,
            "shippedToArrivedByAirLeadTime": 1,
            "shippedToArrivedBySeaLeadTime": 0.25,
            "arrivedToDeliveredLeadTime": 0.5,
            "useRegions": "North,South"
        }

        this.setState({
            programList: [programJson1, programJson2, programJson3],
            selProgram: [programJson1, programJson2, programJson3],
        },
            () => {
                this.filterData();
            })


        let realmId = AuthenticationService.getRealmId();
        RealmCountryService.getRealmCountryrealmIdById(realmId)
            .then(response => {
                console.log("RealmCountryService---->", response.data)
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        countryList: listArray, loading: false
                    })
                } else {
                    this.setState({ message: response.data.messageCode, loading: false })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
    }

    addNewProgram() {
        this.props.history.push({
            pathname: "/dataSet/addDataSet"
        });
    }
    buttonFormatter(cell, row) {
        // console.log("-----------", cell);
        return <Button type="button" size="sm" color="success" onClick={(event) => this.addProductMapping(event, cell)} ><i className="fa fa-check"></i> {i18n.t('static.common.add')}</Button>;
    }
    addProductMapping(event, cell) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROGRAM')) {
            event.stopPropagation();
            this.props.history.push({
                pathname: `/programProduct/addProgramProduct/${cell}`,
            });
        }
    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }
    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        // const { countryList } = this.state;
        // let countries = countryList.length > 0
        //   && countryList.map((item, i) => {
        //     return (
        //       <option key={i} value={item.countryId}>
        //         {getLabelText(item.label, this.state.lang)}
        //       </option>
        //     )
        //   }, this);

        const { countryList } = this.state;
        let countries = countryList.length > 0
            && countryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lang)}
                    </option>
                )
            }, this);

        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SET_UP_PROGRAM') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewProgram}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
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
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
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
                                                <option value="true" selected>{i18n.t('static.common.active')}</option>
                                                <option value="false">{i18n.t('static.common.disabled')}</option>

                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>

                        {/* <div id="loader" className="center"></div> */}<div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROGRAM') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
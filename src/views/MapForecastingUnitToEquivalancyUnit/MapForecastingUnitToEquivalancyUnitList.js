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

const entityname = i18n.t('static.mapForecastingUnitToEquivalancyUnit.mapForecastingUnitToEquivalancyUnit');
export default class MapForecastingUnitToEquivalancyUnitList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            mapForecastingUnitToEquivalancyUnitlist: [],
            lang: 'en',
            message: '',
            selMapForecastingUnitToEquivalancyUnit: [],
            countryList: [],
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.editMapForecastingUnitToEquivalancyUnit = this.editMapForecastingUnitToEquivalancyUnit.bind(this);
        this.addNewMapForecastingUnitToEquivalancyUnit = this.addNewMapForecastingUnitToEquivalancyUnit.bind(this);
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


    editMapForecastingUnitToEquivalancyUnit(mapForecastingUnitToEquivalancyUnit) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROGRAM')) {
            this.props.history.push({
                pathname: `/mapForecastingUnitToEquivalancyUnit/editMapForecastingUnitToEquivalancyUnit/${mapForecastingUnitToEquivalancyUnit.mapForecastingUnitToEquivalancyUnitId}`,
                // state: { mapForecastingUnitToEquivalancyUnit }
            });
        }
    }

    buildJExcel() {
        let mapForecastingUnitToEquivalancyUnitList = this.state.selMapForecastingUnitToEquivalancyUnit;
        // console.log("MapForecastingUnitToEquivalancyUnitList---->", mapForecastingUnitToEquivalancyUnitList);
        let mapForecastingUnitToEquivalancyUnitArray = [];
        let count = 0;

        for (var j = 0; j < mapForecastingUnitToEquivalancyUnitList.length; j++) {
            data = [];
            data[0] = mapForecastingUnitToEquivalancyUnitList[j].mapForecastingUnitToEquivalancyUnitId
            data[1] = getLabelText(mapForecastingUnitToEquivalancyUnitList[j].forecastingUnit.label, this.state.lang)
            data[2] = getLabelText(mapForecastingUnitToEquivalancyUnitList[j].equivalancyUnit.label, this.state.lang)
            data[3] = getLabelText(mapForecastingUnitToEquivalancyUnitList[j].graphUnit.label, this.state.lang)
            data[4] = mapForecastingUnitToEquivalancyUnitList[j].conversionToFu;
            data[5] = getLabelText(mapForecastingUnitToEquivalancyUnitList[j].dataSet.label, this.state.lang)
            data[6] = mapForecastingUnitToEquivalancyUnitList[j].lastModifiedBy.username;
            data[7] = (mapForecastingUnitToEquivalancyUnitList[j].lastModifiedDate ? moment(mapForecastingUnitToEquivalancyUnitList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)


            mapForecastingUnitToEquivalancyUnitArray[count] = data;
            count++;
        }
        // if (mapForecastingUnitToEquivalancyUnitList.length == 0) {
        //   data = [];
        //   mapForecastingUnitToEquivalancyUnitArray[0] = data;
        // }
        // console.log("mapForecastingUnitToEquivalancyUnitArray---->", mapForecastingUnitToEquivalancyUnitArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = mapForecastingUnitToEquivalancyUnitArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 200, 100, 100, 100, 100, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'mapForecastingUnitToEquivalancyUnitId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.product.unit1'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.equivalancyUnit.equivalancyUnit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.graphUnit.graphUnit'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.mapForecastingUnitToEquivalancyUnit.conversionToFu'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.forecastProgram.forecastProgram'),
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
            if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROGRAM')) {
                this.props.history.push({
                    // pathname: `/mapForecastingUnitToEquivalancyUnit/editmapForecastingUnitToEquivalancyUnit/${this.el.getValueFromCoords(0, x)}`,
                    pathname: `/mapForecastingUnitToEquivalancyUnit/editMapForecastingUnitToEquivalancyUnit/1`,
                });
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

        let mapForecastingUnitToEquivalancyUnitJson1 = {
            "forecastingUnit": {
                "id": 1,
                "label": {
                    "label_en": "Efavirenz/Lamivudine/Tenofovir DF 600/300/300 mg Tablet",
                },
            },
            "equivalancyUnit": {
                "id": 1,
                "label": {
                    "label_en": "Patient Month of ARV",
                },
            },
            "graphUnit": {
                "id": 1,
                "label": {
                    "label_en": "Patient Month",
                },
            },
            "dataSet": {
                "id": 1,
                "label": {
                    "label_en": "Zambia ARV",
                },
            },
            "conversionToFu": 0.03333333333,
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
        }

        let mapForecastingUnitToEquivalancyUnitJson2 = {
            "forecastingUnit": {
                "id": 1,
                "label": {
                    "label_en": "Efavirenz/Lamivudine/Tenofovir DF 400/300/300 mg Tablet",
                },
            },
            "equivalancyUnit": {
                "id": 1,
                "label": {
                    "label_en": "Patient Month of ARV",
                },
            },
            "graphUnit": {
                "id": 1,
                "label": {
                    "label_en": "Patient Month",
                },
            },
            "dataSet": {
                "id": 1,
                "label": {
                    "label_en": "Zambia ARV",
                },
            },
            "conversionToFu": 0.03333333333,
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
        }

        let mapForecastingUnitToEquivalancyUnitJson3 = {
            "forecastingUnit": {
                "id": 1,
                "label": {
                    "label_en": "Male Condom (Latex) Lubricated, Dume Classic, 53 mm",
                },
            },
            "equivalancyUnit": {
                "id": 1,
                "label": {
                    "label_en": "Male Condom (Latex) Lubricated, 53 mm",
                },
            },
            "graphUnit": {
                "id": 1,
                "label": {
                    "label_en": "# Condoms",
                },
            },
            "dataSet": {
                "id": 1,
                "label": {
                    "label_en": "Zambia ARV",
                },
            },
            "conversionToFu": 1,
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
        }

        this.setState({
            mapForecastingUnitToEquivalancyUnitList: [mapForecastingUnitToEquivalancyUnitJson1, mapForecastingUnitToEquivalancyUnitJson2, mapForecastingUnitToEquivalancyUnitJson3],
            selMapForecastingUnitToEquivalancyUnit: [mapForecastingUnitToEquivalancyUnitJson1, mapForecastingUnitToEquivalancyUnitJson2, mapForecastingUnitToEquivalancyUnitJson3],
        },
            () => {
                this.buildJExcel();
            })

    }

    addNewMapForecastingUnitToEquivalancyUnit() {
        this.props.history.push({
            pathname: "/mapForecastingUnitToEquivalancyUnit/addMapForecastingUnitToEquivalancyUnit"
        });
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
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SET_UP_PROGRAM') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewMapForecastingUnitToEquivalancyUnit}><i className="fa fa-plus-square"></i></a>}
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
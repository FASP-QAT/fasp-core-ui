import React, { Component } from 'react';
// import IntegrationService from '../../api/IntegrationService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import {
    Card, CardHeader, CardBody, FormGroup,
    CardFooter, Button
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import i18n from '../../i18n';
import moment from 'moment';
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';
const entityname = i18n.t('static.forecastMethod.forecastMethod');
export default class ForecastMethodListComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            forecastMethodList: [],
            message: '',
            selSource: [],
            loading: true
        }
        this.addNewForecastMethod = this.addNewForecastMethod.bind(this);
        this.editForecastMethod = this.editForecastMethod.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    formSubmit() {

    }

    buildJexcel() {
        let forecastMethodList = this.state.selSource;
        // console.log("forecastMethodList---->", forecastMethodList);
        let forecastMethodArray = [];
        let count = 0;

        for (var j = 0; j < forecastMethodList.length; j++) {
            data = [];
            data[0] = forecastMethodList[j].forecastMethodId
            data[1] = getLabelText(forecastMethodList[j].label, this.state.lang)
            data[2] = forecastMethodList[j].lastModifiedBy.username;
            data[3] = (forecastMethodList[j].lastModifiedDate ? moment(forecastMethodList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            forecastMethodArray[count] = data;
            count++;
        }

        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = forecastMethodArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [50, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'forecastMethodId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.forecastMethod.forecastMethod'),
                    type: 'text',
                    // readOnly: true
                    textEditor: true,
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
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
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
            // onselection: this.selected,
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
        var forecastMethodListEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = forecastMethodListEl;
        this.setState({
            forecastMethodListEl: forecastMethodListEl, loading: false
        })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    componentDidMount() {
        this.hideFirstComponent();
        // AuthenticationService.setupAxiosInterceptors();
        // IntegrationService.getIntegrationListAll().then(response => {
        //     if (response.status == 200) {
        //         console.log("response.data---->", response.data)

        //         this.setState({
        //             integrationList: response.data,
        //             selSource: response.data
        //         },
        //             () => {
        //                 this.buildJexcel()
        //             })

        //     }
        //     else {
        //         this.setState({
        //             message: response.data.messageCode, loading: false
        //         },
        //             () => {
        //                 this.hideSecondComponent();
        //             })
        //     }

        // })
        //     .catch(
        //         error => {
        //             if (error.message === "Network Error") {
        //                 this.setState({
        //                     message: 'static.unkownError',
        //                     loading: false
        //                 });
        //             } else {
        //                 switch (error.response ? error.response.status : "") {

        //                     case 401:
        //                         this.props.history.push(`/login/static.message.sessionExpired`)
        //                         break;
        //                     case 403:
        //                         this.props.history.push(`/accessDenied`)
        //                         break;
        //                     case 500:
        //                     case 404:
        //                     case 406:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             loading: false
        //                         });
        //                         break;
        //                     case 412:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             loading: false
        //                         });
        //                         break;
        //                     default:
        //                         this.setState({
        //                             message: 'static.unkownError',
        //                             loading: false
        //                         });
        //                         break;
        //                 }
        //             }
        //         }
        //     );

        let templist = [
            {
                "createdBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "createdDate": "2020-02-25 12:00:00",
                "lastModifiedBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "lastModifiedDate": "2020-02-25 12:00:00",
                "active": true,
                "forecastMethodId": 1,
                "label": {
                    "createdBy": null,
                    "createdDate": null,
                    "lastModifiedBy": null,
                    "lastModifiedDate": null,
                    "active": true,
                    "labelId": 126,
                    "label_en": "Consumption",
                    "label_sp": "",
                    "label_fr": "Consommation reélle",
                    "label_pr": ""
                }
            },
            {
                "createdBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "createdDate": "2020-02-25 12:00:00",
                "lastModifiedBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "lastModifiedDate": "2020-02-25 12:00:00",
                "active": true,
                "forecastMethodId": 1,
                "label": {
                    "createdBy": null,
                    "createdDate": null,
                    "lastModifiedBy": null,
                    "lastModifiedDate": null,
                    "active": true,
                    "labelId": 126,
                    "label_en": "Morbidity",
                    "label_sp": "",
                    "label_fr": "Consommation reélle",
                    "label_pr": ""
                }
            },
            {
                "createdBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "createdDate": "2020-02-25 12:00:00",
                "lastModifiedBy": {
                    "userId": 1,
                    "username": "Anchal C"
                },
                "lastModifiedDate": "2020-02-25 12:00:00",
                "active": true,
                "forecastMethodId": 1,
                "label": {
                    "createdBy": null,
                    "createdDate": null,
                    "lastModifiedBy": null,
                    "lastModifiedDate": null,
                    "active": true,
                    "labelId": 126,
                    "label_en": "Services",
                    "label_sp": "",
                    "label_fr": "Consommation reélle",
                    "label_pr": ""
                }
            }
        ];
        this.setState({
            forecastMethodList: templist,
            selSource: templist
        },
            () => {
                this.buildJexcel()
            })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    editForecastMethod(forecastMethod) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_INTEGRATION')) {
            this.props.history.push({
                pathname: `/forecastMethod/editforecastMethod/${forecastMethod.forecastMethodId}`,
            });
        }
    }

    selected = function (instance, cell, x, y, value) {
        if (x == 0 && value != 0) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            if (this.state.selSource.length != 0) {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_INTEGRATION')) {
                    this.props.history.push({
                        pathname: `/forecastMethod/editForecastMethod/${this.el.getValueFromCoords(0, x)}`,
                        // state: { role }
                    });
                }
            }
        }
    }.bind(this);

    addNewForecastMethod() {
        if (isSiteOnline()) {
            this.props.history.push(`/forecastMethod/addForecastMethod`)
        } else {
            alert("You must be Online.")
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

        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_INTEGRATION') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewForecastMethod}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>

                    </div>
                    <CardBody className="table-responsive pt-md-1 pb-md-1">
                        {/* <div id="loader" className="center"></div> */}
                        <div id="tableDiv" style={{ display: this.state.loading ? "none" : "block" }}>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                    <div class="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>

                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            {/* <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button> */}
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>

            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/realmCountry/listRealmCountry/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}
import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.realm.realm');
/**
 * Component for list of realm details.
 */
export default class ReactListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realmList: [],
            message: '',
            selRealm: [],
            loading: true,
            lang: localStorage.getItem("lang"),
        }
        this.addNewRealm = this.addNewRealm.bind(this);
    }
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Fetches the realm list from the server and builds the jexcel component on component mount.
     */
    componentDidMount() {
        hideFirstComponent();
        RealmService.getRealmListAll().then(response => {
            if (response.status == 200) {
                this.setState({
                    realmList: response.data,
                    selRealm: response.data,
                },
                    () => {
                        let realmList = this.state.selRealm;
                        let realmArray = [];
                        let count = 0;
                        for (var j = 0; j < realmList.length; j++) {
                            data = [];
                            data[0] = realmList[j].realmId
                            data[1] = getLabelText(realmList[j].label, this.state.lang)
                            data[2] = realmList[j].realmCode;
                            data[3] = realmList[j].minMosMinGaurdrail;
                            data[4] = realmList[j].minMosMaxGaurdrail;
                            data[5] = realmList[j].maxMosMaxGaurdrail;
                            data[6] = realmList[j].minQplTolerance;
                            data[7] = realmList[j].minQplToleranceCutOff;
                            data[8] = realmList[j].maxQplTolerance;
                            data[9] = realmList[j].actualConsumptionMonthsInPast;
                            data[10] = realmList[j].forecastConsumptionMonthsInPast;
                            data[11] = realmList[j].inventoryMonthsInPast;
                            data[12] = realmList[j].minCountForMode;
                            data[13] = realmList[j].minPercForMode;
                            data[14] = realmList[j].noOfMonthsInFutureForTopDashboard;
                            data[15] = realmList[j].noOfMonthsInPastForBottomDashboard;
                            data[16] = realmList[j].lastModifiedBy.username;
                            data[17] = (realmList[j].lastModifiedDate ? moment(realmList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
                            data[18] = realmList[j].active;
                            realmArray[count] = data;
                            count++;
                        }
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                        var data = realmArray;
                        var options = {
                            data: data,
                            columnDrag: false,
                            colWidths: [0, 100, 90, 90, 90, 90, 100, 120, 90],
                            colHeaderClasses: ["Reqasterisk"],
                            columns: [
                                {
                                    title: 'realmId',
                                    type: 'hidden',
                                },
                                {
                                    title: i18n.t('static.realm.realmName'),
                                    type: 'text',
                                },
                                {
                                    title: i18n.t('static.realm.realmCode'),
                                    type: 'text',
                                },
                                {
                                    title: i18n.t('static.realm.minMosMinGaurdraillabel'),
                                    type: 'numeric', mask: '#,##',
                                },
                                {
                                    title: i18n.t('static.realm.minMosMaxGaurdraillabel'),
                                    type: 'numeric', mask: '#,##',
                                },
                                {
                                    title: i18n.t('static.realm.maxMosMaxGaurdraillabel'),
                                    type: 'numeric', mask: '#,##',
                                },
                                {
                                    title: i18n.t('static.realm.minQplTolerance'),
                                    type: 'numeric', mask: '#,##',
                                },
                                {
                                    title: i18n.t('static.realm.minQplToleranceCutOff'),
                                    type: 'numeric', mask: '#,##',
                                },
                                {
                                    title: i18n.t('static.realm.maxQplTolerance'),
                                    type: 'numeric', mask: '#,##',
                                },
                                {
                                    title: i18n.t('static.realm.restrictionActualConsumption'),
                                    type: 'numeric', mask: '#,##',
                                },
                                {
                                    title: i18n.t('static.realm.restrictionForecastConsumption'),
                                    type: 'numeric', mask: '#,##',
                                },
                                {
                                    title: i18n.t('static.realm.restrictionInventory'),
                                    type: 'numeric', mask: '#,##',
                                },
                                {
                                    title: i18n.t('static.realm.minCountForMode'),
                                    type: 'numeric'
                                },
                                {
                                    title: i18n.t('static.realm.minPercForMode'),
                                    type: 'numeric', mask: '#,##.00', decimal: '.'
                                },
                                {
                                    title: i18n.t('static.realm.noOfMonthsInFutureForTopDashboard'),
                                    type: 'numeric', mask: '#,##'
                                },
                                {
                                    title: i18n.t('static.realm.noOfMonthsInPastForBottomDashboard'),
                                    type: 'numeric', mask: '#,##'
                                },
                                {
                                    title: i18n.t('static.common.lastModifiedBy'),
                                    type: 'text',
                                },
                                {
                                    title: i18n.t('static.common.lastModifiedDate'),
                                    type: 'calendar',
                                    options: { format: JEXCEL_DATE_FORMAT_SM },
                                },
                                {
                                    type: 'dropdown',
                                    title: i18n.t('static.common.status'),
                                    source: [
                                        { id: true, name: i18n.t('static.common.active') },
                                        { id: false, name: i18n.t('static.dataentry.inactive') }
                                    ]
                                },
                            ],
                            editable: false,
                            onload: loadedForNonEditableTables,
                            pagination: localStorage.getItem("sesRecordCount"),
                            search: true,
                            columnSorting: true,
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
                                var items = [];
                                if (y != null) {
                                    if (obj.options.allowInsertRow == true) {
                                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_REALM_COUNTRY')) {
                                            items.push({
                                                title: i18n.t('static.realm.mapRealmCountry'),
                                                onclick: function () {
                                                    this.props.history.push({
                                                        pathname: `/realmCountry/RealmCountry/${this.el.getValueFromCoords(0, y)}`,
                                                    })
                                                }.bind(this)
                                            });
                                        }
                                    }
                                }
                                return items;
                            }.bind(this)
                        };
                        var languageEl = jexcel(document.getElementById("tableDiv"), options);
                        this.el = languageEl;
                        this.setState({
                            languageEl: languageEl, loading: false
                        })
                    })
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        hideSecondComponent();
                    })
            }
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
    /**
     * Redirects to the edit realm screen on row click.
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0)) {
            } else {
                if (this.state.selRealm.length != 0) {
                    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_REALM')) {
                        this.props.history.push({
                            pathname: `/realm/updateRealm/${this.el.getValueFromCoords(0, x)}`,
                        });
                    }
                }
            }
        }
    }.bind(this);
    /**
     * Redirects to the add realm screen.
     */
    addNewRealm() {
        if (localStorage.getItem("sessionType") === 'Online') {
            this.props.history.push(`/realm/addRealm`)
        } else {
            alert("You must be Online.")
        }
    }
    /**
     * Renders the realm list.
     * @returns {JSX.Element} - Realm list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
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
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_CREATE_REALM') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewRealm}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className=" pt-md-1 pb-md-1">
                        <div className='consumptionDataEntryTable'>
                            {/* <div id="loader" className="center"></div> */}<div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_REALM') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                            </div>
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
                </Card>
            </div>
        );
    }
}
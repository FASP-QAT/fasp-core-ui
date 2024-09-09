import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import CurrencyService from '../../api/CurrencyService.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.currency.currencyMaster');
/**
 * Component for list of currency details.
 */
export default class CurrencyListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currencyList: [],
            message: '',
            lang: localStorage.getItem('lang'),
            selCurrency: [],
            loading: true
        }
        this.addNewCurrency = this.addNewCurrency.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    /**
     * Hides the message in div2 after 30 seconds.
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * Hides the message in div1 after 30 seconds.
     */
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Fetches the currency list from the server and builds the jexcel component on component mount.
     */
    componentDidMount() {
        this.hideFirstComponent();
        CurrencyService.getCurrencyList().then(response => {
            if (response.status == 200) {
                this.setState({
                    currencyList: response.data,
                    selCurrency: response.data,
                    loading: false
                },
                    () => {
                        let currencyList = this.state.currencyList;
                        let currencyArray = [];
                        let count = 0;
                        for (var j = 0; j < currencyList.length; j++) {
                            data = [];
                            data[0] = currencyList[j].currencyId
                            data[1] = getLabelText(currencyList[j].label, this.state.lang)
                            data[2] = currencyList[j].currencyCode;
                            data[3] = currencyList[j].conversionRateToUsd;
                            data[4] = currencyList[j].lastModifiedBy.username;
                            data[5] = (currencyList[j].lastModifiedDate ? moment(currencyList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
                            currencyArray[count] = data;
                            count++;
                        }
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                        var data = currencyArray;
                        var options = {
                            data: data,
                            columnDrag: false,
                            colHeaderClasses: ["Reqasterisk"],
                            columns: [
                                {
                                    title: 'currencyId',
                                    type: 'hidden',
                                    readOnly: true
                                },
                                {
                                    title: i18n.t('static.currency.currency'),
                                    type: 'text',
                                },
                                {
                                    title: i18n.t('static.currency.currencycode'),
                                    type: 'text',
                                },
                                {
                                    title: i18n.t('static.currency.conversionrateusd'),
                                    type: 'numeric', mask: '#,##.0000', decimal: '.',
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
                            ],
                            editable: false,
                            onload: this.loaded,
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
                                return false;
                            }.bind(this),
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
                        this.hideSecondComponent();
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
     * Redirects to the edit currency screen on row click with currencyId for editing.
     * @param {*} instance - This is the DOM Element where sheet is created
     * @param {*} cell - This is the object of the DOM element
     * @param {*} x - Row Number
     * @param {*} y - Column Number
     * @param {*} value - Cell Value
     * @param {Event} e - The selected event.
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0)) {
            } else {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_CURRENCY')) {
                    this.props.history.push({
                        pathname: `/currency/editCurrency/${this.el.getValueFromCoords(0, x)}`,
                    });
                }
            }
        }
    }.bind(this);
    /**
     * Redirects to the add currency screen
     */
    addNewCurrency() {
        if (localStorage.getItem("sessionType") === 'Online') {
            this.props.history.push(`/currency/addCurrency`)
        } else {
            alert("You must be Online.")
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance - This is the DOM Element where sheet is created
     * @param {*} cell - This is the object of the DOM element
     * @param {*} x - Row Number
     * @param {*} y - Column Number
     * @param {*} value - Cell Value
     */
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    /**
     * Renders the currency list.
     * @returns {JSX.Element} - currency list.
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
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-addicon">
                                                <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_CURRENCY') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewCurrency}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className="table-responsive pt-md-1 pb-md-1">
                                                <div className='consumptionDataEntryTable'>
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_CURRENCY') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
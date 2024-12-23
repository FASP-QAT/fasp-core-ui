import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, Col, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import CountryService from '../../api/CountryService.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.country.countryMaster');
/**
 * Sorts the country list in ascending order
 * @param {Array} sourceArray 
 * @returns {Array} - Sorted Array of country.
 */
const sortArray = (sourceArray) => {
    const sortByName = (a, b) => a.label.label_en.localeCompare(b.label.label_en, 'en', { numeric: true });
    return sourceArray.sort(sortByName);
};
/**
 * Component for list of country details.
 */
export default class CountryListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countryList: [],
            message: '',
            selCountry: [],
            loading: true,
            lang: localStorage.getItem('lang'),
        }
        this.addNewCountry = this.addNewCountry.bind(this);
        this.filterData = this.filterData.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
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
     * Hides the message in div2 after 30 seconds.
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * Filters the country list according to the Status filters
     */
    filterData() {
        var selStatus = document.getElementById("active").value;
        if (selStatus != "") {
            if (selStatus == "true") {
                const selCountry = this.state.countryList.filter(c => c.active == true);
                this.setState({
                    selCountry: selCountry
                }, () => {
                    this.buildJExcel();
                });
            } else if (selStatus == "false") {
                const selCountry = this.state.countryList.filter(c => c.active == false);
                this.setState({
                    selCountry: selCountry
                }, () => {
                    this.buildJExcel();
                });
            }
        } else {
            this.setState({
                selCountry: this.state.countryList
            }, () => {
                this.buildJExcel();
            });
        }
    }
    /**
     * Redirects to the add country screen
     */
    addNewCountry() {
        if (localStorage.getItem("sessionType") === 'Online') {
            this.props.history.push(`/country/addCountry`)
        } else {
            alert("You must be Online.")
        }
    }
    /**
     * Builds the jexcel component to display country list.
     */
    buildJExcel() {
        let countryList = this.state.selCountry;
        let countryArray = [];
        let count = 0;
        for (var j = 0; j < countryList.length; j++) {
            data = [];
            data[0] = countryList[j].countryId
            data[1] = getLabelText(countryList[j].label, this.state.lang)
            data[2] = countryList[j].countryCode;
            data[3] = countryList[j].countryCode2;
            data[4] = countryList[j].lastModifiedBy.username;
            data[5] = (countryList[j].lastModifiedDate ? moment(countryList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
            data[6] = countryList[j].active;
            countryArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = countryArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [0, 120, 150, 100, 100, 100, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'countryId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.country.countryMaster'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.country.countrycode'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.country.countrycode2'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM }
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
            onload: this.loaded,
            editable: false,
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
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        var countryEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = countryEl;
        this.setState({
            countryEl: countryEl, loading: false
        })
    }
    /**
     * Fetches the country list from the server and builds the jexcel component on component mount.
     */
    componentDidMount() {
        this.hideFirstComponent();
        //Fetch all country list
        CountryService.getCountryListAll().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                if (listArray.length > 0) {
                    sortArray(listArray);
                }
                this.setState({
                    countryList: listArray,
                    selCountry: listArray
                },
                    () => {
                        this.buildJExcel();
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
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
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
     * Redirects to the edit country screen on row click with countryId for editing.
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
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_COUNTRY')) {
                    this.props.history.push({
                        pathname: `/country/editCountry/${this.el.getValueFromCoords(0, x)}`,
                    });
                }
            }
        }
    }.bind(this);
    /**
     * Renders the country list with filter.
     * @returns {JSX.Element} - country list.
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
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_COUNTRY') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewCountry}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <Col md="3 pl-0">
                            <FormGroup className="Selectdiv mt-md-2 mb-md-0">
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
                                            <option value="true">{i18n.t('static.common.active')}</option>
                                            <option value="false">{i18n.t('static.dataentry.inactive')}</option>
                                        </Input>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <div className='consumptionDataEntryTable'>
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_COUNTRY') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
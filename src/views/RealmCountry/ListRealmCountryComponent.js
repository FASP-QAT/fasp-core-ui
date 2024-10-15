import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, Col, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import RealmCountryService from "../../api/RealmCountryService";
import RealmService from "../../api/RealmService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.dashboard.realmcountry');
/**
 * Function to sort an array of objects by country name.
 * @param {Array} sourceArray - The array of objects to be sorted.
 * @returns {Array} - Returns the sorted array of objects.
 */
const sortArray = (sourceArray) => {
    const sortByName = (a, b) => a.country.label.label_en.localeCompare(b.country.label.label_en, 'en', { numeric: true });
    return sourceArray.sort(sortByName);
};
/**
 * Component for realm country list.
 */
class ListRealmCountryComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            realmCountryList: [],
            message: '',
            selRealmCountry: [],
            loading: true,
            lang: localStorage.getItem('lang')
        }
        this.filterData = this.filterData.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
    }
    /**
     * Clears the timeout when the component unmounts.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Function to filter data based on the selected realm.
     */
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selRealmCountry = this.state.realmCountryList.filter(c => c.realm.realmId == realmId)
            this.setState({
                selRealmCountry
            }, () => {
                this.buildJExcel();
            });
        } else {
            this.setState({
                selRealmCountry: this.state.realmCountryList
            }, () => {
                this.buildJExcel();
            });
        }
    }
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildJExcel() {
        let realmCountryList = this.state.selRealmCountry;
        let realmCountryArray = [];
        let count = 0;
        for (var j = 0; j < realmCountryList.length; j++) {
            data = [];
            data[0] = realmCountryList[j].realmCountryId
            data[1] = getLabelText(realmCountryList[j].realm.label, this.state.lang)
            data[2] = getLabelText(realmCountryList[j].country.label, this.state.lang)
            data[3] = getLabelText(realmCountryList[j].defaultCurrency.label, this.state.lang)
            data[4] = realmCountryList[j].lastModifiedBy.username;
            data[5] = (realmCountryList[j].lastModifiedDate ? moment(realmCountryList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
            data[6] = realmCountryList[j].active;
            realmCountryArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = realmCountryArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [0, 150, 150, 100, 100, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'realmCountryId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                },
                {
                    title: i18n.t('static.dashboard.country'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.dashboard.currency'),
                    type: 'text',
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
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_REGION')) {
                        items.push({
                            title: i18n.t('static.realmcountry.regionupdate'),
                            onclick: function () {
                                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_REGION')) {
                                    this.props.history.push({
                                        pathname: `/realmCountry/realmCountryRegion/${this.el.getValueFromCoords(0, y)}`,
                                    })
                                }
                            }.bind(this)
                        });
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
    }
    /**
     * Fetches realm and realm country list on component mount
     */
    componentDidMount() {
        hideFirstComponent();
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realms: listArray, loading: false
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
        RealmCountryService.getRealmCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    if (listArray.length > 0) {
                        sortArray(listArray);
                    }
                    this.setState({
                        realmCountryList: listArray,
                        selRealmCountry: listArray,
                        loading: false
                    }, () => {
                        this.buildJExcel();
                    });
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
     * Renders the realm country mapping list.
     * @returns {JSX.Element} - Realm country mapping list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
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
                    <CardBody className="pb-lg-0 mt-1">
                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') &&
                            <Col md="3 pl-0">
                                <FormGroup className="Selectdiv mt-md-1 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmId"
                                                id="realmId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {realmList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </Col>
                        }
                        <div id="tableDiv" className="jexcelremoveReadonlybackground consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
export default ListRealmCountryComponent;

import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, Col, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import RealmService from "../../api/RealmService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import FundingSourceService from '../../api/FundingSourceService.js';
// Localized entity name
const entityname = i18n.t('static.funderTypeHead.funderType')
/**
 * Component for list of procurement agent type details.
 */
class ListFunderTypeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            fundingSourceTypeList: [],
            message: '',
            selFundingSourceType: [],
            lang: localStorage.getItem('lang'),
            // loading: true
            loading: false
        }
        this.filterData = this.filterData.bind(this);
        this.addNewFunderType = this.addNewFunderType.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
    }
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Redirects to the add procurement agent type screen.
     */
    addNewFunderType() {
        this.props.history.push("/funderType/addFunderType");
    }
    /**
     * Function to filter procurement agent types based on realm Id
     */
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selFundingSourceType = this.state.fundingSourceTypeList.filter(c => c.realm.id == realmId)
            this.setState({
                selFundingSourceType
            }, () => {
                this.buildJExcel();
            });
        } else {
            this.setState({
                selFundingSourceType: this.state.fundingSourceTypeList
            }, () => {
                this.buildJExcel();
            });
        }
    }
    /**
     * Builds the jexcel component to display procurement agent type list.
     */
    buildJExcel() {
        let fundingSourceTypeList = this.state.selFundingSourceType;
        let fundingSourceTypeArray = [];
        let count = 0;
        for (var j = 0; j < fundingSourceTypeList.length; j++) {
            data = [];
            data[0] = fundingSourceTypeList[j].fundingSourceTypeId
            data[1] = getLabelText(fundingSourceTypeList[j].realm.label, this.state.lang)
            data[2] = getLabelText(fundingSourceTypeList[j].label, this.state.lang)
            data[3] = fundingSourceTypeList[j].fundingSourceTypeCode;
            data[4] = fundingSourceTypeList[j].lastModifiedBy.username;
            data[5] = (fundingSourceTypeList[j].lastModifiedDate ? moment(fundingSourceTypeList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[6] = fundingSourceTypeList[j].active;
            fundingSourceTypeArray[count] = data;
            count++;
        }

        //temp
        // data = [];
        // data[0] = 1
        // data[1] = 'realm'
        // data[2] = 'type name';
        // data[3] = 'display name';
        // data[4] = 'username';
        // data[5] = '12-Jul-23';
        // data[6] = true;
        // procurementAgentTypeArray[0] = data;

        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = fundingSourceTypeArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [0, 80, 100, 130, 80, 80, 80, 0, 80, 100, 80],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'fundingSourceTypeId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                },
                {
                    title: i18n.t('static.funderType.funderTypeName'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.funderType.funderTypeCode'),
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
                        { id: false, name: i18n.t('static.common.disabled') }
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
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
            contextMenu: function (obj, x, y, e) {
                var items = [];
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
     * Redirects to the edit procurement agent type screen on row click.
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0)) {
            } else {
                console.log('inside else in selected fun.');
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FUNDING_SOURCE')) {
                    // console.log('created path: '+`/funderType/editFunderType/${this.el.getValueFromCoords(0, x)}`);
                    this.props.history.push({
                        pathname: `/funderType/editFunderType/${this.el.getValueFromCoords(0, x)}`,
                    });
                }
            }
        }
    }.bind(this);
    /**
     * Reterives realm and procurement agent type list on component mount
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
                        realms: listArray
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
            FundingSourceService.getFundingSourceTypeListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        fundingSourceTypeList: response.data,
                        selFundingSourceType: response.data,
                    },
                        () => {
                            this.buildJExcel();
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

            // this.buildJExcel();
    }
    /**
     * Renders the procurement agent type list.
     * @returns {JSX.Element} - Procurement agent type list.
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
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.selFundingSourceType.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_FUNDING_SOURCE') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewFunderType}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') &&
                            <Col md="3 pl-0">
                                <FormGroup className="Selectdiv mt-md-2 mb-md-0">
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
                        {/* <div id="loader" className="center"></div> */}<div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FUNDING_SOURCE') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
export default ListFunderTypeComponent;

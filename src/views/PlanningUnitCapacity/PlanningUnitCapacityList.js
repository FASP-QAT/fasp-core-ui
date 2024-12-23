import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, Col, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import PlanningUnitCapacityService from '../../api/PlanningUnitCapacityService';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.dashboad.planningunitcapacity');
/**
 * Component for listing planning unit volume/capacity details.
 */
export default class PlanningUnitCapacityList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            planningUnits: [],
            planningUnitCapacityList: [],
            message: '',
            selSource: [],
            lang: localStorage.getItem('lang')
        }
        this.filterData = this.filterData.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    /**
     * Builds the jexcel component to display planning unit volume list.
     */
    buildJexcel() {
        let planningUnitCapacityList = this.state.selSource;
        let planningUnitCapacityArray = [];
        let count = 0;
        for (var j = 0; j < planningUnitCapacityList.length; j++) {
            data = [];
            data[0] = planningUnitCapacityList[j].planningUnitCapacityId
            data[1] = getLabelText(planningUnitCapacityList[j].planningUnit.label, this.state.lang)
            data[2] = getLabelText(planningUnitCapacityList[j].supplier.label, this.state.lang)
            data[3] = (planningUnitCapacityList[j].startDate ? moment(planningUnitCapacityList[j].startDate).format(`${DATE_FORMAT_CAP}`) : null)
            data[4] = (planningUnitCapacityList[j].stopDate ? moment(planningUnitCapacityList[j].stopDate).format(`${DATE_FORMAT_CAP}`) : null)
            data[5] = planningUnitCapacityList[j].capacity
            data[6] = planningUnitCapacityList[j].lastModifiedBy.username;
            data[7] = (planningUnitCapacityList[j].lastModifiedDate ? moment(planningUnitCapacityList[j].lastModifiedDate).format(`${DATE_FORMAT_CAP}`) : null)
            data[8] = planningUnitCapacityList[j].active;
            planningUnitCapacityArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = planningUnitCapacityArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'planningUnitCapacityId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.dashboard.planningunit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.dashboard.supplier'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.common.startdate'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.common.stopdate'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.planningunit.capacity'),
                    type: 'numeric',
                    mask: '#,##.00',
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'text',
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
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
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
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
        };
        var planningUnitCapacityEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = planningUnitCapacityEl;
        this.setState({
            planningUnitCapacityEl: planningUnitCapacityEl, loading: false
        })
    }
    /**
     * Filters the planning unit volume list according to the planningUnitId & builds the jexcel.
     */
    filterData() {
        let planningUnitId = document.getElementById("planningUnitId").value;
        if (planningUnitId != 0) {
            const planningUnitCapacityList = this.state.selSource.filter(c => c.planningUnit.id == planningUnitId)
            this.setState({
                planningUnitCapacityList
            },
                () => { this.buildJexcel() })
        } else {
            this.setState({
                planningUnitCapacityList: this.state.selSource
            },
                () => { this.buildJexcel() })
        }
    }
    /**
     * Fetches planning unit list for dropdown and planning unit capacity list from the server and builds the jexcel component on component mount.
     */
    componentDidMount() {
        //Fetch planning unit list for dropdown
        DropdownService.getPlanningUnitDropDownList().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                planningUnits: listArray
            })
        }).catch(
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
        //Fetch planning unit capacity list
        PlanningUnitCapacityService.getPlanningUnitCapacityList().then(response => {
            this.setState({
                planningUnitCapacityList: response.data,
                selSource: response.data
            },
                () => { this.buildJexcel() })
        }).catch(
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
     * Renders the Planning Unit Volume/Capacity list.
     * @returns {JSX.Element} - the Planning Unit Volume list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang) + ' | ' + item.id}
                    </option>
                )
            }, this);
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
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
                text: 'All', value: this.state.selSource.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        <div className="card-header-actions">
                        </div>
                    </div>
                    <CardBody className="pb-lg-2">
                        <Col md="3 pl-0">
                            <FormGroup className="Selectdiv mt-md-2 mb-md-0">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.planningunit')}</Label>
                                <div className="controls SelectGo">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="planningUnitId"
                                            id="planningUnitId"
                                            bsSize="sm"
                                            onChange={this.filterData}
                                        >
                                            <option value="0">{i18n.t('static.common.all')}</option>
                                            {planningUnitList}
                                        </Input>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <div className='consumptionDataEntryTable'>
                            <div id="tableDiv" className="jexcelremoveReadonlybackground" style={{ display: this.state.loading ? "none" : "block" }}>
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
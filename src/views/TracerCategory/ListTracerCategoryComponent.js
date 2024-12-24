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
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import RealmService from "../../api/RealmService";
import TracerCategoryService from "../../api/TracerCategoryService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const entityname = i18n.t('static.tracercategory.tracercategory');
/**
 * This component is used to display the tracer category in tabular format
 */
class ListTracerCategoryComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            tracerCategoryList: [],
            message: '',
            selTracerCategory: [],
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.filterData = this.filterData.bind(this);
        this.addNewTracerCategory = this.addNewTracerCategory.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    /**
     * This function is used to build the jexcel table for tracer category
     */
    buildJexcel() {
        let tracerCategoryList = this.state.selTracerCategory;
        let tracerCategory = [];
        let count = 0;
        for (var j = 0; j < tracerCategoryList.length; j++) {
            data = [];
            data[0] = tracerCategoryList[j].tracerCategoryId
            data[1] = getLabelText(tracerCategoryList[j].realm.label, this.state.lang)
            data[2] = getLabelText(tracerCategoryList[j].label, this.state.lang)
            data[3] = getLabelText(tracerCategoryList[j].healthArea.label, this.state.lang)
            data[4] = tracerCategoryList[j].lastModifiedBy.username;
            data[5] = (tracerCategoryList[j].lastModifiedDate ? moment(tracerCategoryList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[6] = tracerCategoryList[j].active;
            tracerCategory[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var json = [];
        var data = tracerCategory;
        var options = {
            data: data,
            columnDrag: false,
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'tracerCategoryId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.healtharea.healtharea'),
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
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        var tracerCategoryEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = tracerCategoryEl;
        this.setState({
            tracerCategoryEl: tracerCategoryEl, loading: false
        })
    }
    /**
     * This function is used to hide the messages that are there in div1 after 30 seconds
     */
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is triggered when this component is about to unmount
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is called when user clicks on add new tracer category button and is redirected to add tracer category screen
     */
    addNewTracerCategory() {
        this.props.history.push("/tracerCategory/addTracerCategory");
    }
    /**
     * This function is used to filter the unit list based on realm Id
     */
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selTracerCategory = this.state.tracerCategoryList.filter(c => c.realm.id == realmId)
            this.setState({
                selTracerCategory
            },
                () => { this.buildJexcel() });
        } else {
            this.setState({
                selTracerCategory: this.state.tracerCategoryList
            },
                () => { this.buildJexcel() });
        }
    }
    /**
     * This function is called when user click on the row to edit the tracer category and is redirected to edit tracer category screen
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0)) {
            } else {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TRACER_CATEGORY')) {
                    this.props.history.push({
                        pathname: `/tracerCategory/editTracerCategory/${this.el.getValueFromCoords(0, x)}`,
                    });
                }
            }
        }
    }.bind(this);
    /**
     * This function is used to get the realm and tracer category list
     */
    componentDidMount() {
        this.hideFirstComponent();
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
                            this.hideSecondComponent();
                        })
                }
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
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                this.setState({
                    tracerCategoryList: response.data,
                    selTracerCategory: response.data
                },
                    () => {
                        this.buildJexcel();
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
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
    }
    /**
     * This is used to display the content
     * @returns The tracer category data in tabular format with filters
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
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                                                <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_TRACER_CATEGORY') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewTracerCategory}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0">
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
                        <div className='consumptionDataEntryTable'>
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_TRACER_CATEGORY') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
export default ListTracerCategoryComponent;

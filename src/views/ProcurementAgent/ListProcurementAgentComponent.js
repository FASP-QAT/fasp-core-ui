import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardBody, Col, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import RealmService from "../../api/RealmService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const entityname = i18n.t('static.procurementagent.procurementagent')
class ListProcurementAgentComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            procurementAgentList: [],
            message: '',
            selProcurementAgent: [],
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.editProcurementAgent = this.editProcurementAgent.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addNewProcurementAgent = this.addNewProcurementAgent.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.buttonFormatter = this.buttonFormatter.bind(this);
        this.buttonFormatterForProcurementUnit = this.buttonFormatterForProcurementUnit.bind(this);
        this.addPlanningUnitMapping = this.addPlanningUnitMapping.bind(this);
        this.addProcurementUnitMapping = this.addProcurementUnitMapping.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    addPlanningUnitMapping(event, cell) {
        event.stopPropagation();
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_PLANNING_UNIT')) {
            this.props.history.push({
                pathname: `/procurementAgent/addProcurementAgentPlanningUnit/${cell}`,
            });
        }
    }
    addProcurementUnitMapping(event, cell) {
        event.stopPropagation();
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_PROCUREMENT_UNIT')) {
            this.props.history.push({
                pathname: `/procurementAgent/addProcurementAgentProcurementUnit/${cell}`,
            });
        }
    }
    addNewProcurementAgent() {
        this.props.history.push("/procurementAgent/addProcurementAgent");
    }
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selProcurementAgent = this.state.procurementAgentList.filter(c => c.realm.id == realmId)
            this.setState({
                selProcurementAgent
            }, () => {
                this.buildJExcel();
            });
        } else {
            this.setState({
                selProcurementAgent: this.state.procurementAgentList
            }, () => {
                this.buildJExcel();
            });
        }
    }
    editProcurementAgent(procurementAgent) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROCUREMENT_AGENT')) {
            this.props.history.push({
                pathname: `/procurementAgent/editProcurementAgent/${procurementAgent.procurementAgentId}`,
            });
        }
    }
    buttonFormatter(cell, row) {
        return <Button type="button" size="sm" color="success" onClick={(event) => this.addPlanningUnitMapping(event, cell)} ><i className="fa fa-check"></i> {i18n.t('static.common.add')}</Button>;
    }
    buttonFormatterForProcurementUnit(cell, row) {
        return <Button type="button" size="sm" color="success" onClick={(event) => this.addProcurementUnitMapping(event, cell)} ><i className="fa fa-check"></i> {i18n.t('static.common.add')}</Button>;
    }
    buildJExcel() {
        let procurementAgentList = this.state.selProcurementAgent;
        let procurementAgentArray = [];
        let count = 0;
        for (var j = 0; j < procurementAgentList.length; j++) {
            data = [];
            data[0] = procurementAgentList[j].procurementAgentId
            data[1] = getLabelText(procurementAgentList[j].realm.label, this.state.lang)
            data[2] = procurementAgentList[j].procurementAgentType.code;
            data[3] = getLabelText(procurementAgentList[j].label, this.state.lang)
            data[4] = procurementAgentList[j].procurementAgentCode;
            data[5] = procurementAgentList[j].colorHtmlCode;
            data[6] = procurementAgentList[j].submittedToApprovedLeadTime;
            data[7] = procurementAgentList[j].approvedToShippedLeadTime;
            data[8] = (procurementAgentList[j].localProcurementAgent ? i18n.t('static.program.yes') : i18n.t('static.program.no'))
            data[9] = procurementAgentList[j].lastModifiedBy.username;
            data[10] = (procurementAgentList[j].lastModifiedDate ? moment(procurementAgentList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[11] = procurementAgentList[j].active;
            procurementAgentArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = procurementAgentArray;
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [0, 80, 100, 130, 80, 80, 80, 0, 80, 100, 80],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'procurementAgentId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                },
                {
                    title: i18n.t('static.procurementagenttype.procurementagenttypecode'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.procurementagent.procurementagentname'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.procurementagent.procurementagentcode'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.procurementagent.procurementAgentColorCode'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.procurementagent.procurementagentsubmittoapprovetimeLabel'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.procurementagent.procurementagentapprovetoshippedtimeLabel'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                },
                {
                    title: i18n.t('static.procurementAgent.localProcurementAgent'),
                    type: 'hidden',
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
            contextMenu: function (obj, x, y) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true) {
                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_PLANNING_UNIT')) {
                            items.push({
                                title: i18n.t('static.program.mapPlanningUnit'),
                                onclick: function () {
                                    this.props.history.push({
                                        pathname: `/procurementAgent/addProcurementAgentPlanningUnit/${this.el.getValueFromCoords(0, y)}`,
                                    });
                                }.bind(this)
                            });
                        }
                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_PROCUREMENT_UNIT')) {
                            items.push({
                                title: i18n.t('static.procurementAgentProcurementUnit.mapProcurementUnit'),
                                onclick: function () {
                                    this.props.history.push({
                                        pathname: `/procurementAgent/addProcurementAgentProcurementUnit/${this.el.getValueFromCoords(0, y)}`,
                                    });
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
    }
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0)) {
            } else {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROCUREMENT_AGENT')) {
                    this.props.history.push({
                        pathname: `/procurementAgent/editProcurementAgent/${this.el.getValueFromCoords(0, x)}`,
                    });
                }
            }
        }
    }.bind(this);
    loaded = function (instance) {
        jExcelLoadedFunction(instance);
    }
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
        ProcurementAgentService.getProcurementAgentListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        procurementAgentList: response.data,
                        selProcurementAgent: response.data,
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
    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }
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
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_PROCUREMENT_AGENT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewProcurementAgent}><i className="fa fa-plus-square"></i></a>}
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
                        <div className='consumptionDataEntryTable'>
                            {/* <div id="loader" className="center"></div> */}<div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROCUREMENT_AGENT') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
export default ListProcurementAgentComponent;

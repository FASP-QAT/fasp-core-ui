import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, Col, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import OrganisationService from "../../api/OrganisationService.js";
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const entityname = i18n.t('static.organisation.organisation');
export default class OrganisationListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            organisations: [],
            message: "",
            selSource: [],
            loading: true,
            lang: localStorage.getItem('lang')
        }
        this.addOrganisation = this.addOrganisation.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
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
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selSource = this.state.organisations.filter(c => c.realm.id == realmId)
            this.setState({
                selSource
            },
                () => { this.buildJexcel() })
        } else {
            this.setState({
                selSource: this.state.organisations
            },
                () => { this.buildJexcel() })
        }
    }
    buildJexcel() {
        let organisations = this.state.selSource;
        let organisationsArray = [];
        let count = 0;
        for (var j = 0; j < organisations.length; j++) {
            data = [];
            data[0] = organisations[j].organisationId
            data[1] = getLabelText(organisations[j].realm.label, this.state.lang)
            data[2] = getLabelText(organisations[j].organisationType.label, this.state.lang)
            data[3] = getLabelText(organisations[j].label, this.state.lang)
            data[4] = organisations[j].organisationCode
            data[5] = organisations[j].lastModifiedBy.username;
            data[6] = (organisations[j].lastModifiedDate ? moment(organisations[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[7] = organisations[j].active;
            organisationsArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var json = [];
        var data = organisationsArray;
        var options = {
            data: data,
            columnDrag: true,
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'organisationsId',
                    type: 'hidden',
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                },
                {
                    title: i18n.t('static.organisationType.organisationType'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.organisation.organisationName'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.organisation.organisationcode'),
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
        var organisationsEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = organisationsEl;
        this.setState({
            organisationsEl: organisationsEl, loading: false
        })
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
                    }, () => { })
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
        OrganisationService.getOrganisationList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.organisationType.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.organisationType.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        organisations: listArray,
                        selSource: listArray
                    }, () => { this.buildJexcel() })
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
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
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
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_ORGANIZATION') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addOrganisation}><i className="fa fa-plus-square"></i></a>}
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
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_ORGANIZATION') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}></div>
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
        );
    }
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0)) {
            } else {
                if (this.state.selSource.length != 0) {
                    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_ORGANIZATION')) {
                        this.props.history.push({
                            pathname: `/organisation/editOrganisation/${this.el.getValueFromCoords(0, x)}`,
                        });
                    }
                }
            }
        }
    }.bind(this);
    addOrganisation() {
        if (isSiteOnline()) {
            this.props.history.push(`/organisation/addOrganisation`);
        } else {
            alert("You must be Online.")
        }
    }
}
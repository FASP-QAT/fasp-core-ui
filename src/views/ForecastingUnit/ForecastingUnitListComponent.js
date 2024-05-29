import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, Col, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import DropdownService from '../../api/DropdownService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import ProductService from '../../api/ProductService';
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.forecastingunit.forecastingunit');
/**
 * Component for list of forecasting unit details.
 */
export default class ForecastingUnitListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            productCategories: [],
            tracerCategories: [],
            forecastingUnitList: [],
            message: '',
            selSource: [],
            lang: localStorage.getItem('lang'),
            realmId: '',
            loading: true
        }
        this.addNewForecastingUnit = this.addNewForecastingUnit.bind(this);
        this.filterData = this.filterData.bind(this);
        this.filterDataForRealm = this.filterDataForRealm.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    /**
     * Builds the jexcel component to display forecasting unit list.
     */
    buildJexcel() {
        let forecastingUnitList = this.state.selSource;
        let forecastingUnitListArray = [];
        let count = 0;
        for (var j = 0; j < forecastingUnitList.length; j++) {
            data = [];
            data[0] = forecastingUnitList[j].forecastingUnitId
            data[1] = getLabelText(forecastingUnitList[j].realm.label, this.state.lang)
            data[2] = getLabelText(forecastingUnitList[j].productCategory.label, this.state.lang)
            data[3] = getLabelText(forecastingUnitList[j].tracerCategory.label, this.state.lang)
            data[4] = getLabelText(forecastingUnitList[j].unit.label, this.state.lang)
            data[5] = getLabelText(forecastingUnitList[j].genericLabel, this.state.lang)
            data[6] = getLabelText(forecastingUnitList[j].label, this.state.lang) + " | " + forecastingUnitList[j].forecastingUnitId
            data[7] = forecastingUnitList[j].lastModifiedBy.username;
            data[8] = (forecastingUnitList[j].lastModifiedDate ? moment(forecastingUnitList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[9] = forecastingUnitList[j].active;
            forecastingUnitListArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = forecastingUnitListArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [60, 150, 60, 100, 60, 60, 60, 100, 60],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.forecastingUnit.forecastingUnitId'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                },
                {
                    title: i18n.t('static.productcategory.productcategory'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.unit.unit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.product.productgenericname'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.forecastingunit.forecastingunit'),
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
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        var forecastingUnitListEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = forecastingUnitListEl;
        this.setState({
            forecastingUnitListEl: forecastingUnitListEl, loading: false
        })
    }
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Filters data based on realm Id
     */
    filterDataForRealm() {
        this.setState({ loading: true })
        let realmId = document.getElementById("realmId").value;
        this.getProductCategories();
        ForecastingUnitService.getForcastingUnitByRealmId(realmId).then(response => {
            if (response.status == 200) {
                this.setState({
                    forecastingUnitList: response.data,
                    selSource: response.data,
                    loading: false
                },
                    () => {
                        this.buildJexcel();
                    })
            }
            else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        hideSecondComponent();
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
    }
    /**
     * Filters data based on product category and tracer category
     */
    filterData() {
        let productCategoryId = document.getElementById("productCategoryId").value;
        let tracerCategoryId = document.getElementById("tracerCategoryId").value;
        if (productCategoryId != 0 && tracerCategoryId != 0) {
            var pc = this.state.productCategories.filter(c => c.payload.productCategoryId == productCategoryId)[0]
            var pcList = this.state.productCategories.filter(c => c.payload.productCategoryId == pc.payload.productCategoryId || c.parentId == pc.id);
            var pcIdArray = [];
            for (var pcu = 0; pcu < pcList.length; pcu++) {
                pcIdArray.push(pcList[pcu].payload.productCategoryId);
            }
            this.setState({ loading: true })
            const selSource = this.state.forecastingUnitList.filter(c => c.tracerCategory.id == tracerCategoryId && pcIdArray.includes(c.productCategory.id))
            this.setState({
                selSource,
                loading: false
            },
                () => {
                    this.buildJexcel();
                })
        }
        else if (productCategoryId != 0) {
            var pc = this.state.productCategories.filter(c => c.payload.productCategoryId == productCategoryId)[0]
            var pcList = this.state.productCategories.filter(c => c.payload.productCategoryId == pc.payload.productCategoryId || c.parentId == pc.id);
            var pcIdArray = [];
            for (var pcu = 0; pcu < pcList.length; pcu++) {
                pcIdArray.push(pcList[pcu].payload.productCategoryId);
            }
            const selSource = this.state.forecastingUnitList.filter(c => pcIdArray.includes(c.productCategory.id));
            this.setState({
                selSource
            },
                () => {
                    this.buildJexcel();
                })
        } else if (tracerCategoryId != 0) {
            const selSource = this.state.forecastingUnitList.filter(c => c.tracerCategory.id == tracerCategoryId)
            this.setState({
                selSource
            },
                () => {
                    this.buildJexcel();
                })
        } else {
            this.setState({
                selSource: this.state.forecastingUnitList
            },
                () => {
                    this.buildJexcel();
                })
        }
    }
    /**
     * Reterives product categories list from server
     */
    getProductCategories() {
        let realmId = document.getElementById("realmId").value;
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                this.setState({
                    productCategories: response.data
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
     * Reterives Product category, real, tracer category and forecasting unit list on component mount
     */
    componentDidMount() {
        hideFirstComponent();
        if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            let realmId = AuthenticationService.getRealmId();
            ProductService.getProductCategoryList(realmId)
                .then(response => {
                    var listArray = response.data.filter(c => c.payload.active);
                    // listArray.sort((a, b) => {
                    //     var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase();
                    //     var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase();
                    //     return itemLabelA > itemLabelB ? 1 : -1;
                    // });
                    this.setState({
                        productCategories: listArray
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
                        realms: listArray,
                        realmId: response.data[0].realmId,
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            hideSecondComponent();
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
        DropdownService.getTracerCategoryDropdownList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        tracerCategories: listArray,
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            hideSecondComponent();
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
        ForecastingUnitService.getForecastingUnitListAll().then(response => {
            if (response.status == 200) {
                this.setState({
                    forecastingUnitList: response.data,
                    selSource: response.data,
                    loading: false
                },
                    () => {
                        this.buildJexcel();
                    })
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        hideSecondComponent();
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
    }
    /**
     * Redirects to the edit forecasting unit screen on row click.
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0)) {
            } else {
                if (this.state.selSource.length != 0) {
                    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FORECASTING_UNIT')) {
                        this.props.history.push({
                            pathname: `/forecastingUnit/editForecastingUnit/${this.el.getValueFromCoords(0, x)}`,
                        });
                    }
                }
            }
        }
    }.bind(this);
    /**
     * Redirects to the add forecasting unit screen.
     */
    addNewForecastingUnit() {
        if (localStorage.getItem("sessionType") === 'Online') {
            this.props.history.push(`/forecastingUnit/addForecastingUnit`)
        } else {
            alert(i18n.t('static.common.online'))
        }
    }
    /**
     * Renders the forecasting unit list.
     * @returns {JSX.Element} - Forecasting unit list.
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
        const { tracerCategories } = this.state;
        let tracercategoryList = tracerCategories.length > 0
            && tracerCategories.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { productCategories } = this.state;
        let productCategoryList = productCategories.length > 0
            && productCategories.map((item, i) => {
                return (
                    <option key={i} value={item.payload.productCategoryId}>
                        {getLabelText(item.payload.label, this.state.lang)}
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
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.props.match.params.color} id="div1"><strong></strong>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_FORECASTING_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewForecastingUnit}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-5 pt-lg-2">
                        <Col md="9 pl-0">
                            <div className="d-md-flex  Selectdiv2">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') &&
                                    <FormGroup className="mt-md-2 mb-md-0 ">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                        <div className="controls SelectField">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="realmId"
                                                    id="realmId"
                                                    bsSize="sm"
                                                    onChange={this.filterDataForRealm}
                                                >
                                                    <option value="-1">{i18n.t('static.common.all')}</option>
                                                    {realmList}
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                }
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                    <div className="controls SelectField">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="productCategoryId"
                                                id="productCategoryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                {productCategoryList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                    <div className="controls SelectField ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="tracerCategoryId"
                                                id="tracerCategoryId"
                                                bsSize="sm"
                                                onChange={this.filterData}
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {tracercategoryList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <div className='consumptionDataEntryTable'>
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FORECASTING_UNIT') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
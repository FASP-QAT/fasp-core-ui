import React from "react";
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import i18n from '../../i18n'
import RealmService from '../../api/RealmService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ToolkitProvider, { Search,CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';

import ProductService from '../../api/ProductService';
const { ExportCSVButton } = CSVExport;
const entityname = i18n.t('static.dashboard.productCatalog');
export default class StockStatusMatrix extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            productCategories: [],
            planningUnits: [],
            data: [],
            view:1

        }
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.getProductCategories=this.getProductCategories.bind(this)
    }
    filterData() {
        let realmId = document.getElementById("realmId").value;
        let productCategoryId = document.getElementById("productCategoryId").value;
        let planningUnitId = document.getElementById("planningUnitId").value;
        let view = document.getElementById("view").value;
        AuthenticationService.setupAxiosInterceptors();
        ProductService.getStockStatusMatrixData(realmId, productCategoryId, planningUnitId,view)
            .then(response => {
                console.log(JSON.stringify(response.data))
                this.setState({
                    data: response.data,
                    view:view
                })
            }).catch(
                error => {
                    this.setState({
                        consumptions: []
                    })

                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }

    getProductCategories() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = document.getElementById("realmId").value;
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                this.setState({
                    productCategories: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        productCategories: []
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );
        PlanningUnitService.getPlanningUnitByRealmId(realmId).then(response => {
            this.setState({
                planningUnits: response.data,
            })
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

            this.filterData();

    }


    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {

                    this.setState({
                        realms: response.data
                    })
                    this.getProductCategories();

                } else {
                    this.setState({ message: response.data.messageCode })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
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
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnitId}>
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


        let columns = [
            {
                dataField: 'PLANNING_UNIT_LABEL_EN',
                text: i18n.t('static.procurementUnit.planningUnit'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }, {
                dataField: 'YEAR',
                text: i18n.t('static.common.year'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
                 {
                    dataField: 'Jan',
                    text: i18n.t('static.common.jan'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Feb',
                    text: i18n.t('static.common.feb'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Mar',
                    text: i18n.t('static.common.mar'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Apr',
                    text: i18n.t('static.common.apr'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'May',
                    text: i18n.t('static.common.may'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Jun',
                    text: i18n.t('static.common.jun'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Jul',
                    text: i18n.t('static.common.jul'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Aug',
                    text: i18n.t('static.common.aug'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Sep',
                    text: i18n.t('static.common.sep'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Oct',
                    text: i18n.t('static.common.oct'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Nov',
                    text: i18n.t('static.common.nov'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'Dec',
                    text: i18n.t('static.common.dec'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }

          
        ];
       
            let columns1 = [
                {
                    dataField: 'PLANNING_UNIT_LABEL_EN',
                    text: i18n.t('static.procurementUnit.planningUnit'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                }, {
                    dataField: 'YEAR',
                    text: i18n.t('static.common.year'),
                    sort: true,
                    align: 'center',
                    headerAlign: 'center'
                },
                     {
                        dataField: 'Q1',
                        text: i18n.t('static.common.quarter1'),
                        sort: true,
                        align: 'center',
                        headerAlign: 'center'
                    }, {
                        dataField: 'Q2',
                        text: i18n.t('static.common.quarter2'),
                        sort: true,
                        align: 'center',
                        headerAlign: 'center'
                    }, {
                        dataField: 'Q3',
                        text: i18n.t('static.common.quarter3'),
                        sort: true,
                        align: 'center',
                        headerAlign: 'center'
                    }, {
                        dataField: 'Q4',
                        text: i18n.t('static.common.quarter4'),
                        sort: true,
                        align: 'center',
                        headerAlign: 'center'
                    } ] 
        
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
                text: 'All', value: this.state.data.length
            }]
        }
        const MyExportCSV = (props) => {
            const handleClick = () => {
              props.onExport();
            };
            return (
              <div>
            
  <img style ={{height:'40px',width:'40px'}}src={require('../../assets/img/csv.png')} title="Export CSV" onClick={() => handleClick()} />
         

              </div>
            );
          };
          
        return (

            <div className="animated">
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.stockstatusmatrix')}</strong>{' '}
                        <div className="card-header-actions">

                        </div>
                    </CardHeader>
                    <CardBody className="pb-md-0">
                        <Col md="12 pl-0">
                            <div className="d-md-flex">
                                <FormGroup>
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmId"
                                                id="realmId"
                                                bsSize="sm"
                                                onChange={(e) => { this.getProductCategories(e) }}
                                            >
                                                {/* <option value="0">{i18n.t('static.common.all')}</option> */}

                                                {realmList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                &nbsp;
                                    <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="productCategoryId"
                                                id="productCategoryId"
                                                bsSize="sm"
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {productCategoryList}
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="view"
                                                id="view"
                                                bsSize="sm"
                                            >
                                                <option value="1">{i18n.t('static.common.monthly')}</option>
                                                <option value="2">{i18n.t('static.common.quarterly')}</option>
                                               
                                            </Input>

                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="tab-ml-1">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="planningUnitId"
                                                id="planningUnitId"
                                                bsSize="sm"
                                            >
                                                <option value="0">{i18n.t('static.common.all')}</option>
                                                {planningUnitList}
                                            </Input>
                                            <InputGroupAddon addonType="append">
                                                <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>

                        <ToolkitProvider
                            keyField="procurementUnitId"
                            data={this.state.data}
                            columns={this.state.view==1?columns:columns1}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                            exportCSV
                        >
                            {
                                props => (
                                    <div className="TableCust">
                                           
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                      
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} /></div>
                                            <div className="col-md-6 pr-0 offset-md-6 text-center mob-Left">
                                            <MyExportCSV { ...props.csvProps } /></div>
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}

                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>

                    </CardBody>
                </Card>


            </div>)
    }
}
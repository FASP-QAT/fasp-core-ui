import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BudgetServcie from '../../api/BudgetService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText'
import i18n from '../../i18n';
import { Bar, HorizontalBar } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import ProgramService from '../../api/ProgramService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import FundingSourceService from '../../api/FundingSourceService';
import moment from 'moment';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { DATE_FORMAT_CAP } from '../../Constants.js';
const ref = React.createRef();
const entityname = i18n.t('static.dashboard.budget');
const chartoptions = 
{
    scales: {

        yAxes: [{
            id: 'A',
            position: 'left',
            scaleLabel: {
                display: true,
                fontSize: "12",
                fontColor: 'blue'
            },
            ticks: {
                beginAtZero: true,
                fontColor: 'blue'
            },

        }],
        xAxes: [{
            ticks: {
                fontColor: 'black'
            }
        }]
    },

    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            usePointStyle: true,
            fontColor: 'black'
        }
    }
}


class Budgets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            budgetList: [],
            lang: localStorage.getItem('lang'),
            message: '',
            selBudget: [],
            programValues: [],
            programLabels: [],
            programs: [],
            show: false
            //loading: true
        }


        this.formatDate = this.formatDate.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.addCommas = this.addCommas.bind(this);
        this.rowClassNameFormat = this.rowClassNameFormat.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    hideFirstComponent() {
        setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }



    filterData() {
        let programIds = this.state.programValues
        console.log('programIds.length', programIds.length)
        if (programIds.length > 0) {
            let data = [

                {
                    BudgetallocatedToPlannedShipment: 1000000,
                    BudgetallocatedToOrderededShipment: 1500000,
                    BudgetRemaining: 3000000,
                    percentageForecasedBudgetRemaining: '0.60',
                    bt: { id: 2, label: { label_en: "Kenya - 2019 H1", label_sp: "", label_fr: "", label_pr: "" }, budgetCode: 'KEN_FRH', budgetAmount: '550000', startDate: '01-Jan-19', stopDate: '31-Dec-19', fundingSource: { id: 1, label: { label_en: "United States Agency for International Development", label_sp: "", label_fr: "", label_pr: "" } } },
                    program: { id: 3, label: { label_en: "HIV/AIDS - Malawi - National", label_sp: "", label_fr: "", label_pr: "" }, programCode: 'MWI-FRH-MOH' },

                    percentageActualBudgetRemaining: '0.80'
                },{
                    BudgetallocatedToPlannedShipment: 2000000,
                BudgetallocatedToOrderededShipment: 1000000,
                BudgetRemaining: 2000000,
                percentageForecasedBudgetRemaining: '0.40',
                    bt: { id:3, label: { label_en: "Kenya - 2020 H1", label_sp: "", label_fr: "", label_pr: "" }, budgetCode: 'KEN_FRH1', budgetAmount: '500000', startDate: '01-Jan-20', stopDate: '30-Jun-20', fundingSource: { id: 3, label: { label_en: "United States Agency for International Development", label_sp: "", label_fr: "", label_pr: "" } } },
                program: { id: 3, label: { label_en: "HIV/AIDS - Malawi - National", label_sp: "", label_fr: "", label_pr: "" }, programCode: 'MWI-FRH-MOH' },
                
                percentageActualBudgetRemaining: '0.80'
            }
            ]
            console.log('In if', data)
            this.setState({
                selBudget: data
            });
        } else {
            this.setState({
                selBudget: []
            });
        }
    }
    formatDate(cell, row) {
        if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
            return modifiedDate;
        } else {
            return "";
        }
    }
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    getPrograms = () => {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProgramService.getProgramByRealmId(realmId)
            .then(response => {
                console.log(JSON.stringify(response.data))
                this.setState({
                    programs: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        programs: []
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
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );
    }


    componentDidMount() {
        this.getPrograms()
    }
    // showSubFundingSourceLabel(cell, row) {
    //   return getLabelText(cell.label, this.state.lang);
    // }

    // showFundingSourceLabel(cell, row) {
    //   return getLabelText(cell.fundingSource.label, this.state.lang);
    // }

    // showStatus(cell, row) {
    //   if (cell) {
    //     return "Active";
    //   } else {
    //     return "Disabled";
    //   }
    // }
    rowClassNameFormat(row, rowIdx) {
        // row is whole row object
        // rowIdx is index of row
        // console.log('in rowClassNameFormat')
        // console.log(new Date(row.stopDate).getTime() < new Date().getTime())
        return new Date(row.stopDate) < new Date() || (row.budgetAmt - row.usedUsdAmt) <= 0 ? 'background-red' : '';
    }
    formatLabel(cell, row) {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        }
    }

    addCommas(cell, row) {
        console.log("row---------->", row);
      //  var currencyCode = row.currency.currencyCode;
        cell += '';
        var x = cell.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        // return "(" + currencyCode + ")" + "  " + x1 + x2;
       // return currencyCode + "    " + x1 + x2;
       return x1 + x2
    }
    handleChangeProgram = (programIds) => {

        this.setState({
            programValues: programIds.map(ele => ele.value),
            programLabels: programIds.map(ele => ele.label)
        }, () => {

            this.filterData()
        })

    }


    render() {

        const { programs } = this.state;
        let programList = [];
        programList = programs.length > 0
            && programs.map((item, i) => {
                return (

                    { label: getLabelText(item.label, this.state.lang), value: item.programId }

                )
            }, this);

        console.log('budget list', this.state.selBudget)
        var budgets = this.state.selBudget.map((item, index) => (item.bt))

        console.log('budgets', budgets)


        let data1 = []
        let data2 = []
        let data3 = []
        for (var i = 0; i < budgets.length; i++) {
            data1 = (this.state.selBudget.filter(c => c.bt.id = budgets[i].id).map(ele => (ele.BudgetallocatedToOrderededShipment)))
            data2 = (this.state.selBudget.filter(c => c.bt.id = budgets[i].id).map(ele => (ele.BudgetallocatedToPlannedShipment)))

            data3 = (this.state.selBudget.filter(c => c.bt.id = budgets[i].id).map(ele => (ele.BudgetRemaining)))
        }

        const bar = {

            labels: budgets.map(ele=>getLabelText(ele.label,this.state.lang)),
            datasets: [
                {
                    label: 'Budget Allocated To Shipment (Ordered)',
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#042e6a',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data1//consumptiondata.map(ele => ( ele.BudgetallocatedToOrderededShipment ))
                },
                {
                    label: 'Budget Allocated To Shipment (Planned)',
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#6a82a8',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data2//consumptiondata.map(ele => ( ele.BudgetallocatedToPlannedShipment ))
                },

                {
                    label: 'Budget Remaining',
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#8aa9e6',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data3//consumptiondata.map(ele => ( ele.BudgetRemaining ))
                }
            ],




        }

        console.log('datasets', bar)
        const { SearchBar, ClearSearchButton } = Search;
        const { fundingSourceList } = this.state;

        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );



        const columns = [
            {
                dataField: 'bt.label',
                text: i18n.t('static.budget.budget'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },
            {
                dataField: 'program.label',
                text: i18n.t('static.budget.program'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel
            },
            {
                dataField: 'program.programCode',
                text: i18n.t('static.program.programCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                    },
            {
                dataField: 'bt.budgetCode',
                text: i18n.t('static.budget.budgetCode'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
            },
            {
                dataField: 'bt.fundingSource.label',
                text: i18n.t('static.budget.fundingsource'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatLabel

            },
            {
                dataField: 'bt.budgetAmount',
                text: i18n.t('static.budget.budgetamount'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'BudgetallocatedToPlannedShipment',
                text: 'Budget allocated to Shipment(Planned)',// i18n.t('static.budget.budgetamount'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'BudgetallocatedToOrderededShipment',
                text: 'Budget allocated to Shipment(Ordered)',//i18n.t('static.budget.budgetamount'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
            {
                dataField: 'BudgetRemaining',
                text:'Budget Remaining',// i18n.t('static.budget.budgetamount'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.addCommas
            },
           
            ,
            {
                dataField: 'bt.startDate',
                text: i18n.t('static.common.startdate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
            {
                dataField: 'bt.stopDate',
                text: i18n.t('static.common.stopdate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
           /* {
                dataField: 'active',
                text: i18n.t('static.common.status'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cellContent, row) => {
                    return (
                        (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
                    );
                }
            }*/];
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
                text: 'All', value: this.state.selBudget.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}{' '}</strong> */}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-0 ">

                        <Col md="12 pl-0">
                            <div className="row">
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="programIds">{i18n.t('static.program.program')}<span className="red Reqasterisk">*</span></Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <InputGroup className="box">
                                        <ReactMultiSelectCheckboxes

                                            bsSize="sm"
                                            name="programIds"
                                            id="programIds"
                                            onChange={(e) => { this.handleChangeProgram(e) }}
                                            options={programList && programList.length > 0 ? programList : []}
                                        />
                                        {!!this.props.error &&
                                            this.props.touched && (
                                                <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                                            )}
                                    </InputGroup>
                                </FormGroup>
                            </div>
                        </Col>
                        <Col md="12 pl-0">
                            <div className="row">
                                {
                                    this.state.selBudget.length > 0
                                    &&
                                    <div className="col-md-12 p-0">
                                        <div className="col-md-12">
                                            <div className="chart-wrapper chart-graph-report">
                                                <HorizontalBar id="cool-canvas" data={bar} options={chartoptions} />

                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                                {this.state.show ? 'Hide Data' : 'Show Data'}
                                            </button>

                                        </div>
                                    </div>}


                            </div>



                            {this.state.show && this.state.selBudget.length > 0 &&
                                <ToolkitProvider
                                    keyField="budgetId"
                                    data={this.state.selBudget}
                                    columns={columns}
                                    search={{ searchFormatted: true }}
                                    hover
                                    filter={filterFactory()}
                                >
                                    {
                                        props => (
                                            <div className="TableCust listBudgetAlignThtd">
                                                <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                                    <SearchBar {...props.searchProps} />
                                                    <ClearSearchButton {...props.searchProps} />
                                                </div>
                                                <BootstrapTable hover rowClasses={this.rowClassNameFormat} striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                    pagination={paginationFactory(options)}
                                                    rowEvents={{
                                                        onClick: (e, row, rowIndex) => {
                                                        }
                                                    }}
                                                    {...props.baseProps}
                                                /><h5>*Rows in red indicate that Budget has either lapsed or has no money in it</h5>
                                            </div>
                                        )
                                    }
                                </ToolkitProvider>}
                        </Col>
                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


export default Budgets;

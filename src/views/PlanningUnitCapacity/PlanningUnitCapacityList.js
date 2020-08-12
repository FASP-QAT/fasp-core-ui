import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, InputGroup, InputGroupAddon, Label } from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'


const entityname = i18n.t('static.dashboad.planningunitcapacity');
export default class PlanningUnitCapacityList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            planningUnits: [],
            planningUnitCapacityList: [],
            message: '',
            selSource: []

        }
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
    }

    filterData() {
        let planningUnitId = document.getElementById("planningUnitId").value;
        console.log("planningUnitId---"+planningUnitId);
        AuthenticationService.setupAxiosInterceptors();
        if (planningUnitId == 0) {
            PlanningUnitService.getAllPlanningUnitList().then(response => {
                console.log("FORTUNER-------------", response.data)
                this.setState({
                    planningUnits: response.data,
                    selSource: response.data
                })
            })
        } else {
            PlanningUnitService.getPlanningUnitCapacityForId(planningUnitId).then(response => {
                console.log("resp---->", response.data);
                let tempPlanningUnitList = response.data;
                let planningUnitList = [];
                for (var j = 0; j < tempPlanningUnitList.length; j++) {
                    let json = {
                        label: tempPlanningUnitList[j].planningUnit.label,
                        active: tempPlanningUnitList[j].active
                    }
                    planningUnitList.push(json);
                }
                this.setState({
                    planningUnitCapacityList: planningUnitList,
                    selSource: planningUnitList
                })
            })
        }

    }


    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        PlanningUnitService.getAllPlanningUnitList().then(response => {
            console.log("FORTUNER-------------", response.data)
            this.setState({
                planningUnits: response.data,
                selSource: response.data
            })
        })
    }



    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }

    render() {
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnitId}>
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

        const columns = [{
            dataField: 'label',
            text: i18n.t('static.dashboard.planningunit'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
        },
        //  {
        //     dataField: 'supplier.label',
        //     text: i18n.t('static.dashboard.supplier'),
        //     sort: true,
        //     align: 'center',
        //     headerAlign: 'center',
        //     // formatter: this.formatLabel
        // }, {
        //     dataField: 'startDate',
        //     text: i18n.t('static.common.startdate'),
        //     sort: true,
        //     align: 'center',
        //     headerAlign: 'center'
        // }, {
        //     dataField: 'stopDate',
        //     text: i18n.t('static.common.stopdate'),
        //     sort: true,
        //     align: 'center',
        //     headerAlign: 'center',
        //     //formatter: this.formatLabel
        // }, {
        //     dataField: 'capacity',
        //     text: i18n.t('static.planningunit.capacity'),
        //     sort: true,
        //     align: 'center',
        //     headerAlign: 'center'
        // }, 
        {
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
        }];
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
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.capacitylist')}</strong> */}
                        <div className="card-header-actions">

                        </div>

                    </div>
                    <CardBody className="pb-lg-0">
                        <Col md="3 pl-0">
                            <FormGroup className="Selectdiv">
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
                                        {/* <InputGroupAddon addonType="append">
                                            <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon> */}
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <ToolkitProvider
                            keyField="planningUnitCapacityId"
                            data={this.state.selSource}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div className="TableCust">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            /* rowEvents={{
                                                 onClick: (e, row, rowIndex) => {
                                                     this.editPlanningUnitCapacity(row);
                                                 }
                                             }}*/
                                            {...props.baseProps}
                                        />
                                    </div>
                                )
                            }
                        </ToolkitProvider>

                    </CardBody>
                </Card>
            </div>
        );
    }

}
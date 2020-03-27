import React, { Component } from 'react';
import UnitTypeService from '../../api/UnitTypeService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'

import i18n from '../../i18n';
const entityname=i18n.t('static.dimension.dimension');
export default class UnitTypeListComponent extends Component {

    constructor(props) {
        super(props);
        /*this.table = data.rows;
        this.options = {
            sortIndicator: true,
            hideSizePerPage: true,
            paginationSize: 3,
            hidePageListOnlyOnePage: true,
            clearSearch: true,
            alwaysShowAllBtns: false,
            withFirstAndLast: false,
            onRowClick: function (row) {
                // console.log("row--------------", row);
                this.editUnitType(row);
            }.bind(this)

        }*/
        this.state = {
            unitTypeList: [],
            message: '',
            selSource: []
        }
        this.addNewUnitType = this.addNewUnitType.bind(this);
        this.editUnitType = this.editUnitType.bind(this);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        UnitTypeService.getUnitTypeListAll().then(response => {
            console.log(response.data)
            this.setState({
                unitTypeList: response.data,
                selSource: response.data
            })
        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response.status) {
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

   
    editUnitType(unitType) {
        this.props.history.push({
            pathname: "/diamension/editDiamension",
            state: { unitType: unitType }
        });
    }

    addNewUnitType() {
        if (navigator.onLine) {
            this.props.history.push(`/diamension/addDiamension`)
        } else {
            alert("You must be Online.")
        }

    }render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
               {i18n.t('static.common.result',{from,to,size}) }
            </span>
        );

        const columns = [{
            dataField: 'label.label_en',
            text: i18n.t('static.dimension.dimension'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage') ,
            prePageTitle: i18n.t('static.common.prevPage') ,
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage') ,
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
                <h5>{i18n.t(this.props.match.params.message,{entityname})}</h5>
                <h5>{i18n.t(this.state.message,{entityname})}</h5>
            <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>{i18n.t('static.common.listEntity',{entityname})}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Realm" onClick={this.addNewUnitType}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>

                    </CardHeader>
                    <CardBody>
                         <ToolkitProvider
                            keyField="dataSourceTypeId"
                            data={this.state.selSource}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div>
                                        <hr />
                                        <SearchBar {...props.searchProps} />
                                        <ClearSearchButton {...props.searchProps} />
                                        <BootstrapTable noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editUnitType(row);
                                                }
                                            }}
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
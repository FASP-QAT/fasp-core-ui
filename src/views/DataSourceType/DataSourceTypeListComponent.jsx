import React, { Component } from 'react';
import DataSourceTypeService from '../../api/DataSourceTypeService'
import AuthenticationService from '../Common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'


//import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
//import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';
const entityname=i18n.t('static.datasourcetype.datasourcetype');
export default class DataSourceListComponent extends Component {

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
                this.editDataSourceType(row);
            }.bind(this)

        }*/
        this.state = {
            dataSourceList: [],
            message: '',
            selSource: []
        }

        this.editDataSourceType = this.editDataSourceType.bind(this);
        this.addNewDataSourceType = this.addNewDataSourceType.bind(this);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        DataSourceTypeService.getDataSourceTypeList().then(response => {
           console.log(response.data)
            this.setState({
                dataSourceList: response.data,
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

    editDataSourceType(dataSourceType) {
        console.log(dataSourceType)
        this.props.history.push({
            pathname: "/dataSourceType/editDataSourceType",
            state: { dataSourceType: dataSourceType }
        });

    }

    addNewDataSourceType() {

        if (navigator.onLine) {
            this.props.history.push(`/dataSourceType/addDataSourceType`)
        } else {
            alert(i18n.t('static.common.online'))
        }
    }
    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
               {i18n.t('static.common.result',{from,to,size}) }
            </span>
        );

        const columns = [{
            dataField: 'realm.label.label_en',
            text: i18n.t('static.realm.realm'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        },{
            dataField: 'label.label_en',
            text: i18n.t('static.datasourcetype.datasourcetype'),
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'active',
            text: i18n.t('static.common.status'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: (cellContent, row) => {
                return (
                    (row.active ? i18n.t('static.common.active') :i18n.t('static.common.disabled'))
                );
            }
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
                                <a href="javascript:void();" title={i18n.t('static.common.addEntity',{entityname})} onClick={this.addNewDataSourceType}><i className="fa fa-plus-square"></i></a>
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
                                    <div className="TableCust">
                                    <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                        <SearchBar {...props.searchProps} />
                                        <ClearSearchButton {...props.searchProps} />
                                        </div>
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editDataSourceType(row);
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
import React, { Component } from 'react';
import DimensionService from '../../api/DimensionService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import i18n from '../../i18n';
const entityname = i18n.t('static.dimension.dimension');
export default class DimensionListComponent extends Component {

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
                this.editDimension(row);
            }.bind(this)

        }*/
        this.state = {
            dimensionList: [],
            message: '',
            selSource: []
        }
        this.addNewDimension = this.addNewDimension.bind(this);
        this.editDimension = this.editDimension.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    hideFirstComponent() {
        setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentDidMount() {
        this.hideFirstComponent();
        AuthenticationService.setupAxiosInterceptors();
        DimensionService.getDimensionListAll().then(response => {
            if (response.status == 200) {
                console.log(response.data)
                this.setState({
                    dimensionList: response.data,
                    selSource: response.data
                })

            }
            else{
                this.setState({
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }
           
        })
            // .catch(
            //     error => {
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message });
            //         } else {
            //             switch (error.response.status) {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ message: error.response.data.messageCode });
            //                     break;
            //                 default:
            //                     this.setState({ message: 'static.unkownError' });
            //                     break;
            //             }
            //         }
            //     }
            // );
    }


    editDimension(dimension) {
        this.props.history.push({
            pathname: `/diamension/editDiamension/${dimension.dimensionId}`,
            // state: { dimension: dimension }
        });
    }

    addNewDimension() {
        if (navigator.onLine) {
            this.props.history.push(`/diamension/addDiamension`)
        } else {
            alert("You must be Online.")
        }

    }

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }
    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [{
            dataField: 'label',
            text: i18n.t('static.dimension.dimension'),
            sort: true,
            align: 'center',
            headerAlign: 'center',
            formatter: this.formatLabel
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
              <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader className="mb-md-3 pb-lg-1">
                        <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewDimension}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>

                    </CardHeader>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <ToolkitProvider
                            keyField="dimensionId"
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
                                        <BootstrapTable striped hover noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.editDimension(row);
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
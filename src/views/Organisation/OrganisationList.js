import React, { Component } from 'react';
import UserService from "../../api/UserService.js";
import OrganisationService from "../../api/OrganisationService.js";
import AuthenticationService from '../Common/AuthenticationService.js';

import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'

const entityname = i18n.t('static.subfundingsource.subfundingsource');


export default class OrganisationListComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            organisations: [],
            message: "",
            selSource: []
        }
        this.editOrganisation = this.editOrganisation.bind(this);
        this.addOrganisation = this.addOrganisation.bind(this);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        OrganisationService.getOrganisationList()
            .then(response => {
                console.log("response---", response);

                this.setState({
                    organisations: response.data.data,
                    selSource: response.data
                })

            }).catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.message
                            })
                            break
                    }
                }
            );
    }

    // render() {
    //     return (
    //         <div className="organisationList">
    //             <p>{this.props.match.params.message}</p>
    //             <h3>{this.state.message}</h3>
    //             <div>{labels.TITLE_ORGANISATION_LIST}</div>
    //             <button className="btn btn-add" type="button" style={{ marginLeft: '-736px' }} onClick={this.addOrganisation}>{labels.TITLE_ADD_ORGANISATION}</button><br /><br />
    //             <table border="1" align="center">
    //                 <thead>
    //                     <tr>
    //                         <th>Organisation Code</th>
    //                         <th>Organisation Name</th>
    //                         <th>Realm</th>
    //                         {/* <th>Country</th> */}
    //                         <th>Status</th>
    //                     </tr>
    //                 </thead>
    //                 <tbody>
    //                     {
    //                         this.state.organisations.map(organisation =>
    //                             <tr key={organisation.organisationId} onClick={() => this.editOrganisation(organisation)}>
    //                                 <td>{organisation.organisationCode}</td>
    //                                 <td>{organisation.label.label_en}</td>
    //                                 <td>{organisation.realm.label.label_en}</td>
    //                                 {/* <td>
    //                                     {
    //                                         organisation.realmCountryList.map(realmCountry => realmCountry.country.label.label_en)
    //                                     }
    //                                 </td> */}
    //                                 <td>{organisation.active.toString() === "true" ? "Active" : "Disabled"}</td>
    //                             </tr>)
    //                     }
    //                 </tbody>
    //             </table>
    //             <br />
    //         </div>
    //     );
    // }

    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [{
            dataField: 'organisationCode',
            text: 'Organisation Code',
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'label.label_en',
            text: 'Organisation Name',
            sort: true,
            align: 'center',
            headerAlign: 'center'
        }, {
            dataField: 'realm.label.label_en',
            text: 'realm',
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
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i>{i18n.t('static.common.listEntity', { entityname })}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addOrganisation}><i className="fa fa-plus-square"></i></a>
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
                                                    this.editOrganisation(row);
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

    editOrganisation(organisation) {
        this.props.history.push({
            pathname: "/organisation/editOrganisation",
            state: { organisation: organisation }
        });
    }
    addOrganisation() {
        if (navigator.onLine) {
            this.props.history.push(`/organisation/addOrganisation`);
        } else {
            alert("You must be Online.")
        }
    }

}
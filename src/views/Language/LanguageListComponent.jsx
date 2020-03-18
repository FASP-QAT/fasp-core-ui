import React, { Component } from 'react';
import LanguageService from '../../api/LanguageService.js'
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';
// import { HashRouter, Route, Switch } from 'react-router-dom';

export default class LanguageListComponent extends Component {

    constructor(props) {
        super(props);
        this.table = data.rows;
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
                this.editLanguage(row);
            }.bind(this)

        }

        this.state = {
            langaugeList: []
        }
        this.editLanguage = this.editLanguage.bind(this);
        this.addLanguage = this.addLanguage.bind(this);
        this.showStatus = this.showStatus.bind(this);
    }

    editLanguage(language) {
        this.props.history.push({
            pathname: "/language/editLanguage",
            state: { language }
        });
    }

    addLanguage() {
        if (navigator.onLine) {
            this.props.history.push(`/language/addLanguage`)
        } else {
            alert("You must be Online.")
        }
    }

    showStatus(cell, row) {
        if (cell) {
            return "Active";
        } else {
            return "Disabled";
        }
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        LanguageService.getLanguageList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({ langaugeList: response.data })
                } else {
                    this.setState({ message: response.data.messageCode })
                }
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

    render() {
        return (
            <div className="animated">
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.language.languagelist')}</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Language" onClick={this.addLanguage}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.langaugeList} version="4" striped hover pagination search options={this.options}>
                            <TableHeaderColumn isKey dataField="languageName" >{i18n.t('static.language.language')}</TableHeaderColumn>
                            <TableHeaderColumn isKey dataField="languageCode" >{i18n.t('static.language.languageCode')}</TableHeaderColumn>
                            <TableHeaderColumn dataField="active" dataSort>{i18n.t('static.common.status')}</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
                <div>
                    <h6>{i18n.t('this.state.message')}{}</h6>
                    <h6>{i18n.t('this.props.match.params.message')}{}</h6>
                </div>
            </div>
        );
    }
}
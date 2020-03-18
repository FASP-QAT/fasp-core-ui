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
        this.addNewLanguage = this.addNewLanguage.bind(this);
    }

    editLanguage(language) {
        this.props.history.push({
            pathname: "/language/editLanguage",
            state: { language }
        });
    }

    addNewLanguage(){
        if (navigator.onLine) {
            this.props.history.push(`/addLanguage`)
        } else {
            alert(i18n.t('static.common.onlinealerttext'))
        }

    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        LanguageService.getLanguageList()
            .then(response => {
                console.log(response.data)
                this.setState({
                    langaugeList: response.data
                })
            })
            .catch(
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

    render() {

    return (
        <div className="animated">
            <Card>
                <CardHeader>
                    <i className="icon-menu"></i>{i18n.t('static.language.languagelist')}
                </CardHeader>
                <CardBody>
                    <BootstrapTable data={this.state.langaugeList} version="4" striped hover pagination search  options={this.options}>
                        <TableHeaderColumn isKey dataField="languageName" >{i18n.t('static.language.language')}</TableHeaderColumn>
                        <TableHeaderColumn dataField="active" dataSort>{i18n.t('static.common.status')}</TableHeaderColumn>
                    </BootstrapTable>
                </CardBody>
            </Card>
        </div>
    );
    }
}
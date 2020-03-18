
import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import i18n from '../../i18n'

import UserService from "../../api/UserService";
import AuthenticationService from '../common/AuthenticationService.js';

class ListRoleComponent extends Component {
    constructor(props) {
        super(props);
        this.options = {
            sortIndicator: true,
            hideSizePerPage: false,
            paginationSize: 3,
            hidePageListOnlyOnePage: true,
            clearSearch: true,
            alwaysShowAllBtns: false,
            withFirstAndLast: false,
            onRowClick: function (row) {
                this.editRole(row);
            }.bind(this)

        }
        this.state = {
            roleList: [],
            message: ''
        }
        this.editRole = this.editRole.bind(this);
        this.addNewRole = this.addNewRole.bind(this);
    }
    addNewRole() {
        this.props.history.push("/role/addRole");
    }
    editRole(role) {
        this.props.history.push({
            pathname: "/role/editRole",
            state: { role }
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        UserService.getRoleList()
            .then(response => {
                console.log(response);
                this.setState({
                    roleList: response.data
                })
            }).catch(
                error => {
                    // conso
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
                            console.log("Error code unkown");
                            break;
                    }
                }
            );
    }

    showRoleLabel(cell, row) {
        return cell.label_en;
    }

    render() {
        return (
            <div className="animated">
                <h5>{i18n.t(this.props.match.params.message)}</h5>
                <h5>{i18n.t(this.state.message)}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.role.rolelisttext')}</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title="Add Role" onClick={this.addNewRole}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <BootstrapTable data={this.state.roleList} version="4" hover pagination search options={this.options}>
                            <TableHeaderColumn isKey filterFormatted dataField="roleId" dataSort dataAlign="center"><strong>{i18n.t('static.role.roleid')}</strong></TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="label" dataFormat={this.showRoleLabel} dataAlign="center" dataSort><strong>{i18n.t('static.role.rolename')}</strong></TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ListRoleComponent;

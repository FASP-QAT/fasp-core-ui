
import React, { Component } from 'react';
import {
    Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, FormText, Label, Button, Col
} from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../../i18n'

import RealmService from "../../api/RealmService";
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';

class ListUserComponent extends Component {
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
                this.editUser(row);
            }.bind(this)

        }
        this.state = {
            realms: [],
            userList: [],
            message: '',
            selUserList: []
        }
        this.editUser = this.editUser.bind(this);
        this.filterData = this.filterData.bind(this);
        this.addNewUser = this.addNewUser.bind(this);
        this.buttonFormatter = this.buttonFormatter.bind(this);
        this.addAccessControls = this.addAccessControls.bind(this);
    }

    buttonFormatter(cell, row) {
        return <Button type="button" size="sm" color="success" onClick={(event) => this.addAccessControls(event, row)} ><i className="fa fa-check"></i> Add</Button>;
    }
    addAccessControls(event, row) {
        event.stopPropagation();
        console.log("row---", row);
        this.props.history.push({
            pathname: "/user/accessControl",
            state: {
                user: row
            }

        })
    }
    addNewUser() {
        this.props.history.push("/user/addUser");
    }
    filterData() {
        let realmId = document.getElementById("realmId").value;
        if (realmId != 0) {
            const selUserList = this.state.userList.filter(c => c.realm.realmId == realmId)
            this.setState({
                selUserList
            });
        } else {
            this.setState({
                selUserList: this.state.userList
            });
        }
    }
    editUser(user) {
        this.props.history.push({
            pathname: "/user/editUser",
            state: { user }
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == "Success") {
                    this.setState({
                        realms: response.data.data
                    })
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

        UserService.getUserList()
            .then(response => {
                this.setState({
                    userList: response.data,
                    selUserList: response.data
                })
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );
    }

    showRealmLabel(cell, row) {
        return cell.label.label_en;
    }

    showRoleLabel(cell, row) {
        return cell.label.label_en;
    }
    showLanguageLabel(cell, row) {
        return cell.languageName;
    }
    showStatus(cell, row) {
        if (cell) {
            return "Active";
        } else {
            return "Disabled";
        }
    }
    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);
        return (
            <div className="animated">
                <h5>{i18n.t(this.props.match.params.message)}</h5>
                <h5>{i18n.t(this.state.message)}</h5>
                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.user.userlisttext')}</strong>{' '}
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.user.useraddtext')} onClick={this.addNewUser}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Col md="3">
                            <FormGroup>
                                <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realmname')}</Label>
                                <div className="controls">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="realmId"
                                            id="realmId"
                                            bsSize="lg"
                                        >
                                            <option value="0">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <InputGroupAddon addonType="append">
                                            <Button color="secondary" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>
                        <BootstrapTable data={this.state.selUserList} version="4" hover pagination search options={this.options}>
                            <TableHeaderColumn isKey dataField='userId' hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn dataField="username" dataSort dataAlign="center"><strong>{i18n.t('static.user.username')}</strong></TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="realm" dataSort dataFormat={this.showRealmLabel} dataAlign="center" ><strong>{i18n.t('static.realm.realmname')}</strong></TableHeaderColumn>
                            <TableHeaderColumn dataField="emailId" dataSort dataAlign="center"><strong>{i18n.t('static.common.emailid')}</strong></TableHeaderColumn>
                            <TableHeaderColumn dataField="phoneNumber" dataSort dataAlign="center"><strong>{i18n.t('static.common.phoneNumber')}</strong></TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="language" dataSort dataFormat={this.showLanguageLabel} dataAlign="center"><strong>{i18n.t('static.language.language')}</strong></TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="lastLoginDate" dataAlign="center" dataSort><strong>{i18n.t('static.common.lastlogindate')}</strong></TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="faildAttempts" dataAlign="center" dataSort><strong>{i18n.t('static.common.faildAttempts')}</strong></TableHeaderColumn>
                            <TableHeaderColumn filterFormatted dataField="active" dataFormat={this.showStatus} dataAlign="center" dataSort><strong>{i18n.t('static.common.status')}</strong></TableHeaderColumn>
                            <TableHeaderColumn dataField="userId" dataFormat={this.buttonFormatter}>Map Access Controls</TableHeaderColumn>
                        </BootstrapTable>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ListUserComponent;

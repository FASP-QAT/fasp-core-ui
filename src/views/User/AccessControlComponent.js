import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row

} from 'reactstrap';
import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
import ProgramService from "../../api/ProgramService";
import ProductService from "../../api/ProductService"
import OrganisationService from "../../api/OrganisationService"
import HealthAreaService from "../../api/HealthAreaService"
import UserService from "../../api/UserService"
import RealmCountryService from "../../api/RealmCountryService"
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n'

class AccessControlComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: this.props.location.state.user,
            countries: [],
            organisations: [],
            healthAreas: [],
            programs: [],
            realmCountryId: '-1',
            organisationId: '-1',
            healthAreaId: '-1',
            programId: '-1',
            countryName: 'All',
            healthAreaName: 'All',
            organisationName: 'All',
            programName: 'All',
            productName: '',
            selRealmCountry: [],
            realmCountryList: [],
            selOrganisation: [],
            selHealthArea: [],
            selProgram: [],
            rows: this.props.location.state.user.userAclList
        }
        this.addRow = this.addRow.bind(this);
        this.deleteLastRow = this.deleteLastRow.bind(this);
        this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.filterData = this.filterData.bind(this);
        this.filterOrganisation = this.filterOrganisation.bind(this);
        this.filterHealthArea = this.filterHealthArea.bind(this);
        this.filterProgram = this.filterProgram.bind(this);

    }
    filterProgram() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selProgram = this.state.programs.filter(c => c.realmCountry.realm.realmId == realmId)
            this.setState({
                selProgram
            });
        } else {
            this.setState({
                selProgram: this.state.programs
            });
        }
    }
    filterHealthArea() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selHealthArea = this.state.healthAreas.filter(c => c.realm.realmId == realmId)
            this.setState({
                selHealthArea
            });
        } else {
            this.setState({
                selHealthArea: this.state.healthAreas
            });
        }
    }
    filterOrganisation() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selOrganisation = this.state.organisations.filter(c => c.realm.realmId == realmId)
            this.setState({
                selOrganisation
            });
        } else {
            this.setState({
                selOrganisation: this.state.organisations
            });
        }
    }
    filterData() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selRealmCountry = this.state.realmCountryList.filter(c => c.realm.realmId == realmId)
            this.setState({
                selRealmCountry
            });
        } else {
            this.setState({
                selRealmCountry: this.state.realmCountryList
            });
        }
    }
    addRow() {
        if (this.state.realmCountryId != "" && this.state.healthAreaId != "" && this.state.organisationId != "" && this.state.programId != "") {
            // let id = [];
            // id.push(this.state.realmCountryId + "" + this.state.healthAreaId + "" + this.state.organisationId + "" + this.state.programId);
            var json =
            {
                userId: this.state.user.userId,
                realmCountryId: this.state.realmCountryId,
                countryName:
                {
                    label_en: this.state.countryName
                },
                healthAreaId: this.state.healthAreaId,
                healthAreaName:
                {
                    label_en: this.state.healthAreaName
                },
                organisationId: this.state.organisationId,
                organisationName:
                {
                    label_en: this.state.organisationName
                },
                programId: this.state.programId,
                programName:
                {
                    label_en: this.state.programName
                }
            }
            // var array = [];
            // console.log("length---", this.state.rows.length)
            // if (this.state.rows.length > 0) {
            //     for (let i = 0; i <= this.state.rows.length; i++) {
            //         console.log(this.state.rows[i]);
            //         if(this.state.rows[i] != null && this.state.rows[i] != ""){
            //         let newId = this.state.rows[i].realmCountryId + "" + this.state.rows[i].healthAreaId + "" + this.state.rows[i].organisationId + "" + this.state.rows[i].programId;
            //         array.push(newId);
            //         }
            //     }
            //     if (array.length > 0) {
            //     for (let i = 0; i < array.length; i++) {
            //         if (id.indexOf(array[i]) === -1) {
            //             this.state.rows.push(json)
            //         }
            //     }
            // }
            // } else {
                this.state.rows.push(json)
            // }
            // var uniqueNames = [];
            // $.each(this.state.rows, function (i, el) {
            //     if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
            // });
            // console.log("unique name---", uniqueNames);
            this.setState({ rows: this.state.rows })
            // this.setState({ realmCountryId: '', healthAreaId: '', organisationId: '', programId: '', countryName: '', healthAreaName: '', organisationName: '', programName: '' });
        }
    }
    deleteLastRow() {
        this.setState({
            rows: this.state.rows.slice(0, -1)
        });
    }

    handleRemoveSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows.splice(idx, 1);
        this.setState({ rows })
    }

    setTextAndValue = (event) => {

        if (event.target.name === 'realmCountryId') {
            this.setState({ countryName: event.target[event.target.selectedIndex].text });
            this.setState({ realmCountryId: event.target.value })
        } else if (event.target.name === 'healthAreaId') {
            this.setState({ healthAreaName: event.target[event.target.selectedIndex].text });
            this.setState({ healthAreaId: event.target.value })
        } else if (event.target.name === 'organisationId') {
            this.setState({ organisationName: event.target[event.target.selectedIndex].text });
            this.setState({ organisationId: event.target.value })
        }
        else if (event.target.name === 'programId') {
            this.setState({ programName: event.target[event.target.selectedIndex].text });
            this.setState({ programId: event.target.value })
        }
    };
    submitForm() {
        var user = {
            userId: this.state.user.userId,
            userAcls: this.state.rows
        }

        AuthenticationService.setupAxiosInterceptors();
        UserService.accessControls(user)
            .then(response => {
                if (response.status == 200) {
                    this.props.history.push(`/user/listUser/${response.data.messageCode}`)
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
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



    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmCountryService.getRealmCountryListAll()
            .then(response => {
                this.setState({
                    realmCountryList: response.data,
                    selRealmCountry: response.data
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
                                break;
                        }
                    }
                }
            );

        OrganisationService.getOrganisationList().then(response => {
            if (response.status == "200") {
                this.setState({
                    organisations: response.data,
                    selOrganisation: response.data
                });
            } else {
                this.setState({
                    message: response.data.message
                })
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
        HealthAreaService.getHealthAreaList().then(response => {
            if (response.status == "200") {
                this.setState({
                    healthAreas: response.data,
                    selHealthArea: response.data
                });
            } else {
                this.setState({
                    message: response.data.message
                })
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
        ProgramService.getProgramList().then(response => {
            if (response.status == "200") {
                this.setState({
                    programs: response.data,
                    selProgram: response.data
                });
            } else {
                this.setState({
                    message: response.data.message
                })
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
        ProductService.getProductList().then(response => {
            if (response.status == 200) {
                this.setState({
                    productList: response.data
                });
            } else {
                this.setState({
                    message: response.data.messageCode
                })
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
        this.filterData();
        this.filterOrganisation();
        this.filterHealthArea();

    }
    render() {
        const { selProgram } = this.state;
        const { selRealmCountry } = this.state;
        const { selOrganisation } = this.state;
        const { selHealthArea } = this.state;
        let programList = selProgram.length > 0 && selProgram.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {item.label.label_en}
                </option>
            )
        }, this);
        let countryList = selRealmCountry.length > 0 && selRealmCountry.map((item, i) => {
            return (
                <option key={i} value={item.realmCountryId}>
                    {item.country.label.label_en}
                </option>
            )
        }, this);
        let organisationList = selOrganisation.length > 0 && selOrganisation.map((item, i) => {
            return (
                <option key={i} value={item.organisationId}>
                    {item.label.label_en}
                </option>
            )
        }, this);
        let healthAreaList = selHealthArea.length > 0 && selHealthArea.map((item, i) => {
            return (
                <option key={i} value={item.healthAreaId}>
                    {item.label.label_en}
                </option>
            )
        }, this);
        return (
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message)}</h5>
                <Row>
                    <Col sm={12} md={10} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <strong>Add Access Control</strong>
                            </CardHeader>
                            <CardBody>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.user.username')}</Label>
                                    <Input type="text" value={this.state.user.username} name="username" id="username" disabled>
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.program.realmcountry')}</Label>
                                    <Input type="select" name="realmCountryId" id="select" value={this.state.realmCountryId} onChange={event => this.setTextAndValue(event)}>
                                        <option value="-1">All</option>
                                        {countryList}
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.healtharea.healtharea')}</Label>
                                    <Input type="select" name="healthAreaId" id="select" value={this.state.healthAreaId} onChange={event => this.setTextAndValue(event)}>
                                        <option value="-1">All</option>
                                        {healthAreaList}
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.organisation.organisation')}</Label>
                                    <Input type="select" name="organisationId" id="select" value={this.state.organisationId} onChange={event => this.setTextAndValue(event)}>
                                        <option value="-1">All</option>
                                        {organisationList}
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.program.program')}</Label>
                                    <Input type="select" name="programId" id="select" value={this.state.programId} onChange={event => this.setTextAndValue(event)}>
                                        <option value="-1">All</option>
                                        {programList}
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> {i18n.t('static.common.rmlastrow')}</Button>
                                    <Button type="submit" size="sm" color="success" onClick={this.addRow} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                    &nbsp;

                        </FormGroup>
                                <Table responsive>

                                    <thead>
                                        <tr>
<<<<<<< HEAD
=======

>>>>>>> user
                                            <th className="text-left"> {i18n.t('static.program.realmcountry')} </th>
                                            <th className="text-left"> {i18n.t('static.healtharea.healtharea')}</th>
                                            <th className="text-left"> {i18n.t('static.organisation.organisation')} </th>
                                            <th className="text-left">{i18n.t('static.program.program')}</th>
<<<<<<< HEAD
                                            <th className="text-left">{i18n.t('static.common.remove')}</th>
=======
                                            <th className="text-left">{i18n.t('static.common.deleterow')}</th>
>>>>>>> user
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.rows.length > 0
                                            &&
                                            this.state.rows.map((item, idx) => (
                                                <tr id="addr0" key={idx}>
                                                    <td>
                                                        {this.state.rows[idx].realmCountryId != -1 ? this.state.rows[idx].countryName.label_en : "All"}
                                                    </td>
                                                    <td>

                                                        {this.state.rows[idx].healthAreaId != -1 ? this.state.rows[idx].healthAreaName.label_en : "All"}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].organisationId != -1 ? this.state.rows[idx].organisationName.label_en : "All"}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].programId != -1 ? this.state.rows[idx].programName.label_en : "All"}
                                                    </td>
                                                    <td>
                                                        <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} />
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>

                                </Table>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
<<<<<<< HEAD
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.rows.length > 0 && <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
=======
                                    <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.rows.length > 0 && <Button type="submit" size="sm" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
>>>>>>> user
                                    &nbsp;
                                </FormGroup>

                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>

        );
    }
    cancelClicked() {
        this.props.history.push(`/user/listUser/` + i18n.t('static.actionCancelled'))
    }

}

export default AccessControlComponent;
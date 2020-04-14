import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row

} from 'reactstrap';
import DeleteSpecificRow from './TableFeatureTwo';
import ProgramService from "../../api/ProgramService";
import ProductService from "../../api/ProductService"
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitList from '../../api/PlanningUnitService'
import PlanningUnitService from "../../api/PlanningUnitService";
import { boolean } from "yup";
import StatusUpdateButtonFeature from '../../CommonComponent/StatusUpdateButtonFeature';
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature';
import i18n from '../../i18n';

const entityname = i18n.t('static.dashboard.programPlanningUnit')
class AddprogramPlanningUnit extends Component {

    constructor(props) {
        super(props);
        let rows = [];
        if (this.props.location.state.programPlanningUnit.length > 0) {
            rows = this.props.location.state.programPlanningUnit;
        }
        this.state = {
            programPlanningUnit: this.props.location.state.programPlanningUnit,
            planningUnitId: '',
            planningUnitName: '',
            reorderFrequencyInMonths: '',
            rows: rows,
            programList: [],
            planningUnitList: [],
            addRowMessage: '',
            programPlanningUnitId: 0,
            isNew: true,
            programId: this.props.location.state.programId
        }
        this.addRow = this.addRow.bind(this);
        this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.enableRow = this.enableRow.bind(this);
        this.disableRow = this.disableRow.bind(this);
        this.updateRow = this.updateRow.bind(this);

    }
    addRow() {
        let addRow = true;
        if (addRow) {
            this.state.rows.map(item => {
                if (item.planningUnit.id == this.state.planningUnitId) {
                    addRow = false;
                }
            }
            )
        }
        if (addRow == true) {
            var programName = document.getElementById("programId");
            var value = programName.selectedIndex;
            var selectedProgramName = programName.options[value].text;
            this.state.rows.push(
                {

                    planningUnit: {
                        id: this.state.planningUnitId,
                        label: {
                            label_en: this.state.planningUnitName
                        }
                    },
                    program: {
                        id: this.state.programId,
                        label: {
                            label_en: selectedProgramName
                        }
                    },
                    reorderFrequencyInMonths: this.state.reorderFrequencyInMonths,
                    active: true,
                    isNew: this.state.isNew,
                    programPlanningUnitId: this.state.programPlanningUnitId

                })

            this.setState({ rows: this.state.rows, addRowMessage: '' })
        } else {
            this.state.addRowMessage = 'Planning Unit Already Exist In List.'
        }
        this.setState({
            planningUnitId: '',
            reorderFrequencyInMonths: '',
            planningUnitName: '',
            programPlanningUnitId: 0,
            isNew: true
        });

    }

    updateRow(idx) {
        const rows = [...this.state.rows]
        this.setState({
            planningUnitId: this.state.rows[idx].planningUnit.id,
            planningUnitName: this.state.rows[idx].planningUnit.label.label_en,
            reorderFrequencyInMonths: this.state.rows[idx].reorderFrequencyInMonths,
            programPlanningUnitId: this.state.rows[idx].programPlanningUnitId,
            isNew: false
        })
        rows.splice(idx, 1);
        this.setState({ rows });
    }

    enableRow(idx) {
        this.state.rows[idx].active = true;
        this.setState({ rows: this.state.rows })
    }

    disableRow(idx) {
        this.state.rows[idx].active = false;
        this.setState({ rows: this.state.rows })
    }

    handleRemoveSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows.splice(idx, 1);
        this.setState({ rows })
    }

    setTextAndValue = (event) => {

        if (event.target.name === 'reorderFrequencyInMonths') {
            this.setState({ reorderFrequencyInMonths: event.target.value });
        }
        else if (event.target.name === 'planningUnitId') {
            this.setState({ planningUnitName: event.target[event.target.selectedIndex].text });
            this.setState({ planningUnitId: event.target.value })
        }
    };
    submitForm() {
        AuthenticationService.setupAxiosInterceptors();

        ProgramService.addprogramPlanningUnitMapping(this.state.rows)
            .then(response => {
                console.log(response.data);
                if (response.status == "200") {
                    console.log(response);
                    this.props.history.push(`/program/listProgram/` + i18n.t(response.data.messageCode, { entityname }))
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );



    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramList().then(response => {
            console.log(response.data);
            if (response.status == "200") {
                this.setState({
                    programList: response.data
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
                            console.log("Error code unkown");
                            break;
                    }
                }
            }
        );
        PlanningUnitService.getActivePlanningUnitList().then(response => {
            if (response.status == 200) {
                this.setState({
                    planningUnitList: response.data
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
                            console.log("Error code unkown");
                            break;
                    }
                }
            }
        );


    }
    render() {
        const { programList } = this.state;
        const { planningUnitList } = this.state;
        let programs = programList.length > 0 && programList.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {item.label.label_en}
                </option>
            )
        }, this);
        let products = planningUnitList.length > 0 && planningUnitList.map((item, i) => {
            return (
                <option key={i} value={item.planningUnitId}>
                    {item.label.label_en}
                </option>
            )
        }, this);
        return (
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={10} style={{ flexBasis: 'auto' }}>
                        <Card>

                            <CardHeader>
                                <strong>{i18n.t('static.program.mapPlanningUnit')}</strong>
                            </CardHeader>
                            <CardBody>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.program.program')}</Label>
                                    <Input type="select" value={this.state.programPlanningUnit.programId} name="programId" id="programId" disabled>
                                        {programs}
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.planningunit.planningunit')}</Label>
                                    <Input type="select" name="planningUnitId" id="select" value={this.state.planningUnitId} onChange={event => this.setTextAndValue(event)}>
                                        <option value="">Please select</option>
                                        {products}
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="company">{i18n.t('static.program.reorderFrequencyInMonths')}</Label>
                                    <Input type="number" min='0' name="reorderFrequencyInMonths" id="reorderFrequencyInMonths" value={this.state.reorderFrequencyInMonths} placeholder={i18n.t('static.program.programPlanningUnit.reorderFrequencyText')} onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    {/* <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> Remove Last Row</Button> */}
                                    <Button type="submit" size="sm" color="success" onClick={this.addRow} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                    &nbsp;

                        </FormGroup>
                                <h5>{this.state.addRowMessage}</h5>
                                <Table responsive>

                                    <thead>
                                        <tr>

                                            <th className="text-left"> {i18n.t('static.program.program')} </th>
                                            <th className="text-left"> {i18n.t('static.planningunit.planningunit')}</th>
                                            <th className="text-left"> {i18n.t('static.program.reorderFrequencyInMonths')} </th>
                                            <th className="text-left">{i18n.t('static.common.status')}</th>
                                            <th className="text-left">{i18n.t('static.common.update')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.rows.map((item, idx) => (
                                                <tr id="addr0" key={idx}>
                                                    <td>
                                                        {this.state.rows[idx].program.label.label_en}
                                                        {/* {this.state.programPlanningUnit.label.label_en} */}
                                                    </td>
                                                    <td>
                                                        {/* {this.state.rows[idx].label.label_en} */}
                                                        {this.state.rows[idx].planningUnit.label.label_en}
                                                    </td>
                                                    <td>

                                                        {this.state.rows[idx].reorderFrequencyInMonths}
                                                    </td>
                                                    {/* <td>
                                                        {this.state.rows[idx].maxMonth}
                                                    </td> */}
                                                    <td>
                                                        {/* <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} /> */}
                                                        <StatusUpdateButtonFeature removeRow={this.handleRemoveSpecificRow} enableRow={this.enableRow} disableRow={this.disableRow} rowId={idx} status={this.state.rows[idx].active} isRowNew={this.state.rows[idx].isNew} />
                                                    </td>
                                                    <td>
                                                        <UpdateButtonFeature updateRow={this.updateRow} rowId={idx} isRowNew={this.state.rows[idx].isNew} />
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>

                                </Table>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    <Button type="submit" size="sm" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
        this.props.history.push(`/program/listProgram/` + i18n.t('static.message.cancelled', { entityname }))
    }

}

export default AddprogramPlanningUnit;
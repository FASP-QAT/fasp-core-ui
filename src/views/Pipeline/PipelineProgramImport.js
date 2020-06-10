import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardBody, FormGroup, Label, Input, CardFooter, Button } from 'reactstrap';
import i18n from '../../i18n';
import PipelineService from "../../api/PipelineService.js";
import AuthenticationService from '../Common/AuthenticationService.js';
import { confirmAlert } from 'react-confirm-alert';


const entityname = i18n.t('static.dashboard.pipelineProgramImport');
export default class PipelineProgramImport extends Component {

    constructor(props) {
        super(props);
        this.showPipelineProgramInfo = this.showPipelineProgramInfo.bind(this);
        this.state = {
            jsonText: '',
            message: ''
        }
        this.showFile = this.showFile.bind(this);
        this.showPipelineProgramInfo = this.showPipelineProgramInfo.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    componentDidMount() {

    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    showPipelineProgramInfo() {

        confirmAlert({
            title: i18n.t('static.program.confirmsubmit'),
            message: 'Make sure that your program json file do not have  planning units with negative inventory ',
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        var myJson = JSON.parse(this.state.jsonText);
                        var fileName = this.state.fileName;
                        // alert(myJson);
                        // alert(fileName);
                        AuthenticationService.setupAxiosInterceptors();
                        PipelineService.savePipelineJson(myJson, fileName)
                            .then(response => {
                                console.log("response--------->", response)
                                console.log("messageCode-->", response.data.messageCode)
                                if (response.status == 200) {
                                    this.props.history.push('/pipeline/pieplineProgramList/' + 'green/' + i18n.t('static.message.pipelineProgramImportSuccess'))
                                } else {
                                    this.setState({
                                        message: i18n.t('static.program.errortext')
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }

                            })
                    }
                },
                {
                    label: i18n.t('static.program.no'),
                    onClick: () => {
                        this.props.history.push(`/pipeline/pieplineProgramList/` + 'red/' + i18n.t('static.message.cancelled', { entityname }));
                    }
                }
            ]


        });


    }

    showFile = async (e) => {
        e.preventDefault()
        const reader = new FileReader();
        var fileName = e.target.files[0].name;
        // alert(e.target.files[0].name);
        reader.onload = async (e) => {
            const text = (e.target.result)
            console.log(text)
            this.setState({ jsonText: text, fileName: fileName });
        };
        reader.readAsText(e.target.files[0])
    }
    render() {
        return (
            <div className="animated fadeIn">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                {/* <h6></h6> */}
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <strong>{i18n.t('static.program.import')}</strong>
                            </CardHeader>
                            <CardBody>

                                <FormGroup id="fileImportDiv">
                                    <Col md="3">
                                        <Label className="uploadfilelable" htmlFor="file-input">{i18n.t('static.program.fileinput')}</Label>
                                    </Col>
                                    <Col xs="12" md="4">
                                        <Input
                                            type="file"
                                            id="file-input"
                                            name="file-input"
                                            onChange={e => this.showFile(e)}
                                            accept=".json"
                                        />
                                    </Col>

                                    {/* <Col xs="12" md="4" className="custom-file">
                                        <Input
                                            type="file"
                                            id="file-input"
                                            name="file-input"
                                            className="custom-file-input"
                                            onChange={e => this.showFile(e)}
                                            accept=".json"
                                        />
                                            accept=".json" 
                                            />
                                            <label className="custom-file-label" id="fileImportDiv">Choose file</label>
                                    </Col> */}
                                </FormGroup>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>

                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    <Button type="reset" size="md" color="success" className="float-right mr-1"><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                    <Button onClick={this.showPipelineProgramInfo} type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
        this.props.history.push(`/pipeline/pieplineProgramList/` + 'red/' + i18n.t('static.message.cancelled', { entityname }));
    }
}
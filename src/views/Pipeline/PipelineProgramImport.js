import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardBody, FormGroup, Label, Input, CardFooter, Button } from 'reactstrap';
import i18n from '../../i18n';
import PipelineService from "../../api/PipelineService.js";
import AuthenticationService from '../Common/AuthenticationService.js';



export default class PipelineProgramImport extends Component {

    constructor(props) {
        super(props);
        this.showPipelineProgramInfo = this.showPipelineProgramInfo.bind(this);
        this.state = {
            jsonText: ''
        }
        this.showFile = this.showFile.bind(this);
        this.showPipelineProgramInfo = this.showPipelineProgramInfo.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    componentDidMount() {

    }

    showPipelineProgramInfo() {
        var myJson = JSON.parse(this.state.jsonText);
        var fileName=this.state.fileName;

        // alert(myJson);
        // alert(fileName);
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.savePipelineJson(myJson,fileName)
            .then(response => {
                console.log("response--------->", response)
                this.props.history.push('/pipeline/pieplineProgramList')
            })

    }

    showFile = async (e) => {
        e.preventDefault()
        const reader = new FileReader();
        var fileName=e.target.files[0].name;
        // alert(e.target.files[0].name);
        reader.onload = async (e) => {
            const text = (e.target.result)
            console.log(text)
            this.setState({ jsonText: text ,fileName:fileName});
        };
        reader.readAsText(e.target.files[0])
    }
    render() {
        return (
            <div className="animated fadeIn">
                <h6></h6>
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <strong>{i18n.t('static.program.import')}</strong>
                            </CardHeader>
                            <CardBody>
                                <FormGroup id="fileImportDiv">
                                    <Col md="3">
                                        <Label htmlFor="file-input">{i18n.t('static.program.fileinput')}</Label>
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
        this.props.history.push(`/pipeline/pieplineProgramList`);
    }
}
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { Button, Card, CardBody, CardFooter, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import * as Yup from 'yup';
import { API_URL } from '../../Constants';
import PipelineService from "../../api/PipelineService.js";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.dashboard.pipelineProgramImport');
/**
 * Component for pipeline program import
 */
export default class PipelineProgramImport extends Component {
    constructor(props) {
        super(props);
        this.showPipelineProgramInfo = this.showPipelineProgramInfo.bind(this);
        this.state = {
            loading: true,
            jsonText: '',
            message: '',
            toggelView: false,
            fileTypeId: ""
        }
        this.showFile = this.showFile.bind(this);
        this.showPipelineProgramInfo = this.showPipelineProgramInfo.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.toggleModalView = this.toggleModalView.bind(this);
    }
    /**
     * Toggles the modal view.
     */
    toggleModalView() {
        this.setState({ toggelView: !this.state.toggelView });
    }
    /**
     * Displays a confirmation dialog for submitting pipeline program information.
     * If confirmed, saves the JSON data.
     */
    showPipelineProgramInfo() {
        confirmAlert({
            title: i18n.t('static.program.confirmsubmit'),
            message: i18n.t('static.message.negativeInventoryMessage'),
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        var myJson = JSON.parse(this.state.jsonText);
                        var fileName = this.state.fileName;
                        this.setState({ loading: true });
                        PipelineService.savePipelineJson(myJson, fileName)
                            .then(response => {
                                if (response.status == 200) {
                                    this.props.history.push('/pipeline/pieplineProgramList/' + 'green/' + i18n.t('static.message.pipelineProgramImportSuccess'))
                                }
                                else {
                                    this.setState({
                                        message: response.data.messageCode,
                                        loading: false
                                    },
                                        () => {
                                            hideSecondComponent();
                                        })
                                }
                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                            loading: false
                                        });
                                    } else {
                                        switch (error.response ? error.response.status : "") {
                                            case 401:
                                                this.props.history.push(`/login/static.message.sessionExpired`)
                                                break;
                                            case 409:
                                                this.setState({
                                                    message: i18n.t('static.common.accessDenied'),
                                                    loading: false,
                                                    color: "#BA0C2F",
                                                });
                                                break;
                                            case 403:
                                                this.props.history.push(`/accessDenied`)
                                                break;
                                            case 500:
                                            case 404:
                                            case 406:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                });
                                                break;
                                        }
                                    }
                                }
                            );
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
    /**
     * Reads the uploaded JSON file.
     * @param {Event} e - The event object.
     */
    showFile = async (e) => {
        e.preventDefault()
        const reader = new FileReader();
        var fileName = e.target.files[0].name;
        reader.onload = async (e) => {
            const text = (e.target.result)
            this.setState({ jsonText: text, fileName: fileName });
        };
        reader.readAsText(e.target.files[0])
    }
    /**
     * Renders the PipelineProgramImport component.
     * @returns {JSX.Element} The JSX element to render.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <div className="Card-header-addicon">
                                <div className="card-header-actions">
                                    <div className="card-header-action">
                                        <a href="javascript:void();" title={i18n.t('static.pipeline.downLoadConverter')} onClick={this.toggleModalView}><i className="fa fa-download"></i></a>
                                    </div>
                                </div>
                            </div>
                            <CardBody className="pt-lg-0">
                                <FormGroup id="fileImportDiv" className="pipelineimportfile">
                                    <Col md="3">
                                        <Label className="uploadfilelable" htmlFor="file-input">{i18n.t('static.program.fileinputjson')}</Label>
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
                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                    <Button onClick={this.showPipelineProgramInfo} type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    &nbsp;
                                </FormGroup>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
                <Modal isOpen={this.state.toggelView}
                    className={'modal-lg ' + this.props.className}>
                    <ModalHeader toggle={() => this.toggleModalView()} className="ModalHead modal-info-Headher">
                        <strong>{i18n.t('static.pipeline.downLoadConverter')}</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <h5><a href={`${API_URL}/file/pipelineConvertorLinux`}>{i18n.t('static.pipeline.pipelineConvertorLinux')}</a></h5>
                            <br></br>
                            <h5><a href={`${API_URL}/file/pipelineConvertorWindows`}>{i18n.t('static.pipeline.pipelineConvertorWindows')}</a></h5>
                        </ModalBody>
                        <ModalFooter>
                            <FormGroup className="mb-lg-0">
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.toggleModalView}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                &nbsp;
                            </FormGroup>
                        </ModalFooter>
                    </div>
                </Modal>
            </div>
        );
    }
    /**
     * Redirects to the list pipeline program screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/pipeline/pieplineProgramList/` + 'red/' + i18n.t('static.message.cancelled', { entityname }));
    }
    /**
     * Resets the pipeline program details when reset button is clicked.
     */
    resetClicked = () => {
        const file = document.getElementById('file-input');
        file.value = '';
    }
}
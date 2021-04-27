import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardBody, FormGroup, Label, Input, CardFooter, Button, Modal, ModalBody, ModalFooter, ModalHeader, InputGroup, FormFeedback, Form } from 'reactstrap';
import i18n from '../../i18n';
import PipelineService from "../../api/PipelineService.js";
import AuthenticationService from '../Common/AuthenticationService.js';
import { confirmAlert } from 'react-confirm-alert';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

import * as Yup from 'yup';

import { API_URL } from '../../Constants';

const initialValues = {
    fileTypeId: "",
}
const entityname = i18n.t('static.dashboard.pipelineProgramImport');
const validationSchema = function (values) {
    return Yup.object().shape({
        fileTypeId: Yup.string()
            .required("Required"),
    })
}

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

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
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.toggleModalView = this.toggleModalView.bind(this);
        this.deleteProgramConfirmBox = this.deleteProgramConfirmBox.bind(this);
    }

    componentDidMount() {

    }
    touchAll(setTouched, errors) {
        setTouched({
            fileTypeId: true,
        }
        );
        this.validateForm(errors);
    }
    validateForm(errors) {
        this.findFirstError('budgetForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstError(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }
    toggleModalView() {
        this.setState({ toggelView: !this.state.toggelView });
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
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

                        // console.log("myJson programName+++", myJson.programinfo[0].programname);
                        // alert(myJson);
                        // alert(fileName);
                        // AuthenticationService.setupAxiosInterceptors();
                        this.setState({ loading: true });
                        PipelineService.savePipelineJson(myJson, fileName)
                            .then(response => {
                                console.log("response--------->", response);
                                console.log("messageCode-->", response.data.messageCode);

                                if (response.status == 200) {
                                    this.props.history.push('/pipeline/pieplineProgramList/' + 'green/' + i18n.t('static.message.pipelineProgramImportSuccess'))
                                }
                                else {
                                    // alert("in else");
                                    this.setState({
                                        message: response.data.messageCode,
                                        loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }

                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false
                                        });
                                    } else {
                                        switch (error.response ? error.response.status : "") {

                                            case 401:
                                                this.props.history.push(`/login/static.message.sessionExpired`)
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
                                                    // message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                this.deleteProgramConfirmBox(myJson, fileName);
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

    deleteProgramConfirmBox(myJson) {
        confirmAlert({
            title: i18n.t('static.problem.allreadyExist'),
            message: i18n.t('static.pipeline.reImportPipelineProgram'),
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        var programName = myJson.programinfo[0].programname;
                        var fileNameUsed=this.state.fileName;
                        // console.log("in delete confirm+++", programName);
                        PipelineService.deletePipelineProgramData(programName)
                            .then(response => {
                                console.log("delete response+++", response);
                                if (response.status == 200) {
                                    this.setState({ loading: true }, () => {
                                        PipelineService.savePipelineJson(myJson, fileNameUsed)
                                            .then(response => {
                                                console.log("response--------->", response);
                                                console.log("messageCode-->", response.data.messageCode);
                                                if (response.status == 200) {
                                                    this.props.history.push('/pipeline/pieplineProgramList/' + 'green/' + i18n.t('static.message.pipelineProgramImportSuccess'))
                                                }
                                                else {
                                                    // alert("in else");
                                                    this.setState({
                                                        message: response.data.messageCode,
                                                        loading: false
                                                    },
                                                        () => {
                                                            this.hideSecondComponent();
                                                        })
                                                }

                                            }).catch(
                                                error => {
                                                    if (error.message === "Network Error") {
                                                        this.setState({
                                                            message: 'static.unkownError',
                                                            loading: false
                                                        });
                                                    } else {
                                                        switch (error.response ? error.response.status : "") {

                                                            case 401:
                                                                this.props.history.push(`/login/static.message.sessionExpired`)
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
                                                                    // message: error.response.data.messageCode,
                                                                    loading: false
                                                                });
                                                                this.deleteProgramConfirmBox(myJson);
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
                                    });

                                }
                                else {
                                    this.setState({
                                        message: response.data.messageCode,
                                        loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }
                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false
                                        });
                                    } else {
                                        switch (error.response ? error.response.status : "") {

                                            case 401:
                                                this.props.history.push(`/login/static.message.sessionExpired`)
                                                break;
                                            case 403:
                                                this.props.history.push(`/accessDenied`)
                                                break;
                                            case 500: this.setState({
                                                message: error.response.data.messageCode,
                                                loading: false
                                            });
                                            case 404:
                                            case 406:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                break;
                                            case 412:
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
                }, {
                    label: i18n.t('static.program.no'),
                    onClick: () => {
                        this.props.history.push(`/pipeline/pieplineProgramList/` + 'red/' + i18n.t('static.message.cancelled', { entityname }));
                    }
                }
            ]
        })

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
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
                {/* <h6></h6> */}
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <strong>{i18n.t('static.program.import')}</strong>
                            </CardHeader> */}
                            <div className="Card-header-addicon">
                                {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}{' '}</strong> */}
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
                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                    <Button onClick={this.showPipelineProgramInfo} type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    &nbsp;
                                    </FormGroup>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
                {/*  download exe Modal */}
                <Modal isOpen={this.state.toggelView}
                    className={'modal-lg ' + this.props.className, ""}>
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
    cancelClicked() {
        this.props.history.push(`/pipeline/pieplineProgramList/` + 'red/' + i18n.t('static.message.cancelled', { entityname }));
    }
    resetClicked = () => {
        const file = document.getElementById('file-input');
        file.value = '';
    }
}
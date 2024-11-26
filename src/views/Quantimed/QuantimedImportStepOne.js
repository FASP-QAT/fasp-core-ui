import bsCustomFileInput from 'bs-custom-file-input';
import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import React, { Component } from 'react';
import {
    Button,
    CardBody,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label
} from 'reactstrap';
import * as Yup from 'yup';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants';
import QuantimedImportService from '../../api/QuantimedImportService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent } from '../../CommonComponent/JavascriptCommonFunctions';
/**
 * Defines the validation schema for quantimed import step one.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        programId: Yup.string()
            .required(i18n.t('static.program.validselectprogramtext')),
    })
}
// Localized entity name
const entityname = i18n.t('static.quantimed.quantimedImport')
/**
 * Component for Qunatimed Import step one for taking the program details for the import
 */
class QuantimedImportStepOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
            program: {
                programId: "",
                file: "",
                loading: false
            },
            programs: []
        }
        this.dataChange = this.dataChange.bind(this);
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { program } = this.state;
        if (event.target.name == "programId") {
            program.programId = event.target.value;
            this.props.items.program.programId = event.target.value;
        }
        if (event.target.name == "file-input") {
            program.file = event.target.files[0];
            this.props.items.program.filename = event.target.files[0].name;
        }
        this.setState({
            program
        }, () => { });
    }
    /**
     * Retrieves list of program on component mount
     */
    componentDidMount() {
        bsCustomFileInput.init();
        AuthenticationService.setupAxiosInterceptors();
        this.setState({
            loading: true
        })
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "#BA0C2F"
            })
            hideFirstComponent();
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext'),
                    loading: false,
                    color: "#BA0C2F"
                })
                hideFirstComponent()
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && !myResult[i].readonly) {
                        var programJson = {
                            label: myResult[i].programCode + "~v" + myResult[i].version,
                            value: myResult[i].id
                        }
                        proList.push(programJson);
                    }
                }
                proList.sort((a, b) => {
                    var itemLabelA = a.label.toUpperCase();
                    var itemLabelB = b.label.toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    programs: proList,
                    loading: false
                })
            }.bind(this);
        }.bind(this);
    }
    /**
     * Renders the quantimed import step one screen.
     * @returns {JSX.Element} - Quantimed import step one screen.
     */
    render() {
        const { programs } = this.state;
        let programList = programs.length > 0 && programs.map((item, i) => {
            return (
                <option key={i} value={item.value}>
                    {item.label}
                </option>
            )
        }, this);
        return (
            <>
                <Formik
                    enableReinitialize={true}
                    initialValues={{
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        if (window.File && window.FileReader && window.FileList && window.Blob) {
                            if (document.querySelector('input[type=file]').files[0] == undefined) {
                                this.setState({ loading: false })
                                alert(i18n.t('static.program.selectfile'));
                            } else {
                                this.setState({
                                    loading: true
                                })
                                AuthenticationService.setupAxiosInterceptors();
                                QuantimedImportService.importForecastData(this.state.program).then(response => {
                                    if (response.status == 200 || response.status == 201) {
                                        var startDate = new Date(response.data.dtmStart);
                                        var endDate = new Date(response.data.dtmEnd);
                                        this.props.items.dtmStartYear = startDate.getFullYear();
                                        this.props.items.dtmStartMonth = startDate.getMonth() + 1;
                                        this.props.items.dtmEndYear = endDate.getFullYear();
                                        this.props.items.dtmEndMonth = endDate.getMonth() + 1;
                                        this.setState({
                                            message: "", color: "green", loading: false
                                        },
                                            () => {
                                                this.props.items.importData = response.data;
                                                this.props.triggerChildAlert();
                                                this.props.finishedStepOne && this.props.finishedStepOne();
                                            })
                                    } else {
                                        this.setState({
                                            message: i18n.t('static.unkownError'), color: "#BA0C2F", loading: false
                                        },
                                            () => {
                                                hideFirstComponent()
                                            })
                                    }
                                })
                                    .catch(
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
                        }
                    }}
                    render={
                        ({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            isValid,
                            setTouched
                        }) => (
                            <div className="animated fadeIn">
                                <AuthenticationServiceComponent history={this.props.history} />
                                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname }) || this.state.supplyPlanError}</h5>
                                <div style={{ display: this.state.loading ? "none" : "block" }}>
                                    <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='programForm'>
                                        <CardBody>
                                            <FormGroup id="fileImportDiv">
                                                <Col md="4">
                                                    <Label className="uploadfilelable" htmlFor="file-input">{i18n.t('static.quantimed.quantimedImportSelectFileLabel')}<span class="red Reqasterisk">*</span></Label>
                                                </Col>
                                                <Col xs="12" md="4" className="custom-file">
                                                    <Input type="file" className="custom-file-input" id="file-input" name="file-input" accept=".xml" onChange={(e) => { handleChange(e); this.dataChange(e) }} />
                                                    <label className="custom-file-label" id="file-input" data-browse={i18n.t('static.uploadfile.Browse')}>{i18n.t('static.chooseFile.chooseFile')}</label>
                                                </Col>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label htmlFor="select">{i18n.t('static.quantimed.quantimedImportSelectProgramLabel')}<span class="red Reqasterisk">*</span></Label>
                                                <Input
                                                    valid={!errors.programId}
                                                    invalid={touched.programId && !!errors.programId}
                                                    bsSize="sm"
                                                    className="col-md-4"
                                                    onBlur={handleBlur}
                                                    type="select" name="programId" id="programId"
                                                    value={this.state.program.programId}
                                                    onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                >
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {programList}
                                                </Input>
                                                <FormFeedback className="red">{errors.programId}</FormFeedback>
                                            </FormGroup>
                                            <br></br>
                                            <FormGroup className="">
                                                <Button color="info" size="md" className="float-right " type="submit" disabled={!isValid}>Import </Button>
                                            </FormGroup>
                                        </CardBody>
                                    </Form>
                                </div>
                                <div style={{ display: this.state.loading ? "block" : "none" }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                        <div class="align-items-center">
                                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                            <div class="spinner-border blue ml-4" role="status">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )} />
            </>
        );
    }
}
export default QuantimedImportStepOne;
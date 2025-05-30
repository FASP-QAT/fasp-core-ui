import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter, Col } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants';
import JiraTikcetService from '../../api/JiraTikcetService';
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.common.TreeTemplate"))
let summaryText_2 = "Add Tree Template"
/**
 * This const is used to define the validation schema for tree template ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmName: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.realm.realmName')))),
        templateName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.tree.templateNameRequired')),
        details: Yup.string()
            .required(i18n.t('static.report.updateDetails')),
    })
}
/**
 * This component is used to display the tree template form and allow user to submit the update master request in jira
 */
export default class TreeTemplateTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            treeTemplate: {
                summary: summaryText_1,
                realmName: "",
                templateName: "",
                details: "",
                file: "",
                attachFile: "",
                priority: 3
            },
            lang: localStorage.getItem('lang'),
            message: '',
            realms: [],
            realmId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { treeTemplate } = this.state
        if (event.target.name == "summary") {
            treeTemplate.summary = event.target.value;
        }
        if (event.target.name == "realmName") {
            treeTemplate.realmName = event.target.value !== "" ? this.state.realms.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.setState({
                realmId: event.target.value
            })
        }
        if (event.target.name == "templateName") {
            treeTemplate.templateName = event.target.value;
        }
        if (event.target.name == "details") {
            treeTemplate.details = event.target.value;
        }
        if (event.target.name == "attachFile") {
            treeTemplate.file = event.target.files[0];
            treeTemplate.attachFile = event.target.files[0].name;
        }
        this.setState({
            treeTemplate
        }, () => { })
    };
    /**
     * This function is used to get the realm list on page load
     */
    componentDidMount() {
        RealmService.getRealmListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    realms: listArray,
                    realmId: this.props.items.userRealmId, loading: false
                });
                if (this.props.items.userRealmId !== "") {
                    this.setState({
                        realms: (response.data).filter(c => c.realmId == this.props.items.userRealmId)
                    })
                    let { treeTemplate } = this.state;
                    treeTemplate.realmName = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                    this.setState({
                        treeTemplate
                    }, () => {
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
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is called when reset button is clicked to reset the tree template details
     */
    resetClicked() {
        let { treeTemplate } = this.state;
        treeTemplate.realmName = this.props.items.userRealmId !== "" ? this.state.realms.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        treeTemplate.templateName = '';
        treeTemplate.details = '';
        treeTemplate.file = '';
        treeTemplate.attachFile = '';
        treeTemplate.priority = 3;
        this.setState({
            treeTemplate: treeTemplate,
            realmId: this.props.items.userRealmId
        },
            () => { });
    }
    /**
     * This function is used to capitalize the first letter of the unit name
     * @param {*} str This is the name of the unit
     */
    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }
    /**
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { treeTemplate } = this.state;
        treeTemplate.priority = newState;
        this.setState(
            {
                treeTemplate
            }, () => {
                // console.log('priority - state : '+this.state.treeTemplate.priority);
            }
        );
    }

    /**
     * This is used to display the content
     * @returns This returns tree template details form
     */
    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.common.TreeTemplate')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            realmName: this.state.realmId,
                            templateName: this.state.treeTemplate.templateName,
                            details: this.state.treeTemplate.details,
                            priority: 3
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.treeTemplate.summary = summaryText_2;
                            this.state.treeTemplate.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.treeTemplate).then(response => {
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
                                    JiraTikcetService.addIssueAttachment(this.state.treeTemplate, response.data.id).then(response => {
                                    });
                                    this.setState({
                                        message: msg, loading: false
                                    },
                                        () => {
                                            this.resetClicked();
                                            this.hideSecondComponent();
                                        })
                                } else {
                                    this.setState({
                                        message: i18n.t('static.unkownError'), loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }
                                this.props.togglehelp();
                                this.props.toggleSmall(this.state.message);
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
                                setTouched,
                                handleReset
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    <FormGroup>
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.treeTemplate.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.treeTemplate.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="realmName">{i18n.t('static.realm.realmName')}<span className="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="select"
                                            bsSize="sm"
                                            name="realmName"
                                            id="realmName"
                                            valid={!errors.realmName && this.state.treeTemplate.realmName != ''}
                                            invalid={touched.realmName && !!errors.realmName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="templateName">{i18n.t('static.listTreeTemp.templateName')}<span className="red Reqasterisk">*</span></Label>
                                        <Input type="text"
                                            bsSize="sm"
                                            name="templateName"
                                            id="templateName"
                                            valid={!errors.templateName && this.state.treeTemplate.templateName != ''}
                                            invalid={touched.templateName && !!errors.templateName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            required
                                            value={this.Capitalize(this.state.treeTemplate.templateName)}
                                        />
                                        <FormFeedback className="red">{errors.templateName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="details">{i18n.t('static.mt.showDetails')}<span className="red Reqasterisk">*</span></Label>
                                        <Input type="textarea"
                                            bsSize="sm"
                                            name="details"
                                            id="details"
                                            valid={!errors.details && this.state.treeTemplate.details != ''}
                                            invalid={touched.details && !!errors.details}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            required
                                            maxLength={600}
                                            value={this.state.treeTemplate.details}
                                        />
                                        <FormFeedback className="red">{errors.details}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup >
                                        <Col>
                                            <Label className="uploadfilelable" htmlFor="attachFile">{i18n.t('static.ticket.uploadScreenshot')}</Label>
                                        </Col>
                                        <div className="custom-file">
                                            <Input type="file" className="custom-file-input" id="attachFile" name="attachFile" accept=".zip,.png,.jpg,.jpeg"
                                                valid={!errors.attachFile && this.state.treeTemplate.attachFile != ''}
                                                invalid={touched.attachFile && !!errors.attachFile}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                            />
                                            <label className="custom-file-label" id="attachFile" data-browse={i18n.t('static.uploadfile.Browse')} >{this.state.treeTemplate.attachFile}</label>
                                            <FormFeedback className="red">{errors.attachFile}</FormFeedback>
                                        </div>
                                        <br></br><br></br>
                                        <div>
                                            <p>{i18n.t('static.ticket.filesuploadnote')}</p>
                                        </div>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.treeTemplate.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1"><i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
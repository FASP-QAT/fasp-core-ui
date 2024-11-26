import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX } from '../../Constants';
import DataSourceTypeService from '../../api/DataSourceTypeService';
import JiraTikcetService from '../../api/JiraTikcetService';
import ProgramService from '../../api/ProgramService';
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
const summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.datasource.datasource"))
const summaryText_2 = "Add Data Source"
const initialValues = {
    summary: "",
    realmName: "",
    programName: "",
    dataSourceType: "",
    dataSourceName: "",
    notes: "",
    priority: 3
}
/**
 * This const is used to define the validation schema for datasource ticket component
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
        programName: Yup.string()
            .required(i18n.t('static.budget.programtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.program.programMaster')))),
        dataSourceType: Yup.string()
            .required(i18n.t('static.datasource.datasourcetypetext')),
        dataSourceName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.datasource.datasourcetext')),
    })
}
/**
 * This component is used to display the data source form and allow user to submit the master request in jira
 */
export default class DataSourceTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {
                summary: summaryText_1,
                realmName: "",
                programName: "",
                dataSourceType: "",
                dataSourceName: "",
                notes: "",
                priority: 3
            },
            lang: localStorage.getItem('lang'),
            message: '',
            realms: [],
            programs: [],
            dataSourceTypes: [],
            realmId: "",
            programId: '',
            dataSourceTypeId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getDataSourceTypeByRealmId = this.getDataSourceTypeByRealmId.bind(this);
        this.getProgramByRealmId = this.getProgramByRealmId.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { dataSource } = this.state
        if (event.target.name == "summary") {
            dataSource.summary = event.target.value;
        }
        if (event.target.name == "realmName") {
            dataSource.realmName = event.target.value !== "" ? this.state.realms.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.setState({
                realmId: event.target.value
            })
        }
        if (event.target.name == "programName") {
            dataSource.programName = event.target.value !== "" ? this.state.programs.filter(c => c.programId == event.target.value)[0].label.label_en : "";
            this.setState({
                programId: event.target.value
            })
        }
        if (event.target.name == "dataSourceType") {
            dataSource.dataSourceType = event.target.value !== "" ? this.state.dataSourceTypes.filter(c => c.dataSourceTypeId == event.target.value)[0].label.label_en : "";
            this.setState({
                dataSourceTypeId: event.target.value
            })
        }
        if (event.target.name == "dataSourceName") {
            dataSource.dataSourceName = event.target.value;
        }
        if (event.target.name == "notes") {
            dataSource.notes = event.target.value;
        }
        this.setState({
            dataSource
        }, () => { })
    };
    /**
     * This function is used to get list of realms, datasource type and programs
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
                    let { dataSource } = this.state;
                    dataSource.realmName = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                    this.setState({
                        dataSource
                    }, () => {
                        this.getDataSourceTypeByRealmId(this.props.items.userRealmId);
                        this.getProgramByRealmId(this.props.items.userRealmId);
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
     * This function is used to get data source type list when user changes realm
     * @param {*} realmId This is the realm Id based on which data source type list should appear
     */
    getDataSourceTypeByRealmId(realmId) {
        if (realmId != "") {
            DataSourceTypeService.getDataSourceTypeByRealmId(realmId)
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        dataSourceTypes: listArray
                    })
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
    }
    /**
     * This function is used to get program list when user changes realm
     * @param {*} realmId This is the realm Id based on which program list should appear
     */
    getProgramByRealmId(realmId) {
        if (realmId != "") {
            ProgramService.getProgramList(realmId)
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        programs: listArray
                    })
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
    }
    /**
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { dataSource } = this.state;
        dataSource.priority = newState;
        this.setState(
            {
                dataSource
            }, () => {
                // console.log('priority - state : '+this.state.dataSource.priority);
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
     * This function is called when reset button is clicked to reset the data source details
     */
    resetClicked() {
        let { dataSource } = this.state;
        dataSource.realmName = this.props.items.userRealmId !== "" ? this.state.realms.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        dataSource.programName = '';
        dataSource.dataSourceType = '';
        dataSource.dataSourceName = '';
        dataSource.notes = '';
        dataSource.priority = 3;
        this.setState({
            dataSource: dataSource,
            realmId: this.props.items.userRealmId,
            programId: '',
            dataSourceTypeId: ''
        },
            () => { });
    }
    /**
     * This is used to display the content
     * @returns This returns data source details form
     */
    render() {
        const { realms } = this.state;
        const { programs } = this.state;
        const { dataSourceTypes } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        let dataSourceTypeList = dataSourceTypes.length > 0
            && dataSourceTypes.map((item, i) => {
                return (
                    <option key={i} value={item.dataSourceTypeId}>{getLabelText(item.label, this.state.lang)}</option>
                )
            }, this);
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.datasource.datasource')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            realmName: this.props.items.userRealmId,
                            programName: "",
                            dataSourceType: "",
                            dataSourceName: "",
                            notes: "",
                            priority: 3
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.dataSource.summary = summaryText_2;
                            this.state.dataSource.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.dataSource).then(response => {
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
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
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.dataSource.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.dataSource.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmName">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmName" id="realmName"
                                            bsSize="sm"
                                            valid={!errors.realmName && this.state.dataSource.realmName != ''}
                                            invalid={touched.realmName && !!errors.realmName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getDataSourceTypeByRealmId(e.target.value); this.getProgramByRealmId(e.target.value) }}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="programName">{i18n.t('static.program.programMaster')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="programName" id="programName"
                                            bsSize="sm"
                                            valid={!errors.programName && this.state.dataSource.programName != ''}
                                            invalid={touched.programName && !!errors.programName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.programId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {programList}
                                        </Input>
                                        <FormFeedback className="red">{errors.programName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="dataSourceType">{i18n.t('static.datasourcetype.datasourcetype')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="dataSourceType" id="dataSourceType"
                                            bsSize="sm"
                                            valid={!errors.dataSourceType && this.state.dataSource.dataSourceType != ''}
                                            invalid={touched.dataSourceType && !!errors.dataSourceType}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.dataSourceTypeId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {dataSourceTypeList}
                                        </Input>
                                        <FormFeedback className="red">{errors.dataSourceType}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="dataSourceName">{i18n.t('static.datasource.datasource')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="dataSourceName" id="dataSourceName"
                                            bsSize="sm"
                                            valid={!errors.dataSourceName && this.state.dataSource.dataSourceName != ''}
                                            invalid={touched.dataSourceName && !!errors.dataSourceName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.dataSource.dataSourceName}
                                            required />
                                        <FormFeedback className="red">{errors.dataSourceName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.dataSource.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.dataSource.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.dataSource.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import RealmService from '../../api/RealmService';
import getLabelText from '../../CommonComponent/getLabelText';
import { SPACE_REGEX } from '../../Constants';
import PoroductCategoryService from '../../api/PoroductCategoryService';

let summaryText_1 = (i18n.t("static.common.edit") + " " + i18n.t("static.product.productcategory"))
let summaryText_2 = "Edit Planning Unit Category"
let initialValues = {
    summary: summaryText_1,
    realmName: "",
    planningUnitCategoryName: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmName: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.realm.realmName')))),
        planningUnitCategoryName: Yup.string()
            .required(i18n.t('static.common.pleaseSelect').concat(" ").concat((i18n.t('static.product.productcategory')).concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.product.productcategory'))))),
        notes: Yup.string()
            .required(i18n.t('static.program.validnotestext'))
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

export default class EditProductCategoryTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            planningUnitCategory: {
                summary: summaryText_1,
                realmName: "",
                planningUnitCategoryName: "",
                notes: ""
            },
            lang: localStorage.getItem('lang'),
            message: '',
            planningUnitCategories: [],
            planningUnitCategoryId: '',
            realmId: '',
            realms: [],
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getProductCategory = this.getProductCategory.bind(this);
    }

    dataChange(event) {
        let { planningUnitCategory } = this.state
        if (event.target.name == "summary") {
            planningUnitCategory.summary = event.target.value;
        }
        if (event.target.name == "realmName") {
            planningUnitCategory.realmName = event.target.value !== "" ? this.state.realms.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.setState({
                realmId: event.target.value
            })
        }
        if (event.target.name == "planningUnitCategoryName") {
            var outText = "";
            if (event.target.value !== "") {
                var planningUnitCategoryT = this.state.planningUnitCategories.filter(c => c.payloadId == event.target.value)[0];
                outText = planningUnitCategoryT.payload.realm.label.label_en + " | " + planningUnitCategoryT.payload.label.label_en;
            }
            planningUnitCategory.planningUnitCategoryName = outText;
            this.setState({
                planningUnitCategoryId: event.target.value
            })
        }

        if (event.target.name == "notes") {
            planningUnitCategory.notes = event.target.value;
        }
        this.setState({
            planningUnitCategory
        }, () => { })
    };

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            planningUnitCategoryName: true,
            notes: true
        })
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
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
    componentDidMount() {

        RealmService.getRealmListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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

                    let { planningUnitCategory } = this.state;
                    planningUnitCategory.realmName = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                    this.setState({
                        planningUnitCategory
                    }, () => {
                        this.getProductCategory(this.props.items.userRealmId)
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

    getProductCategory(realmId) {
        // AuthenticationService.setupAxiosInterceptors();        
        
        if (realmId !== "") {
            PoroductCategoryService.getProductCategoryListByRealmId(realmId)

                .then(response => {
                    console.log("response product category list ====>", response.data);
                    if (response.status == 200) {
                        console.log("planningUnitCategories", response.data)
                        this.setState({
                            planningUnitCategories: response.data, loading: false
                        });
                        this.setState({ loading: false });

                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
                        })
                        this.hideSecondComponent();
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

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { planningUnitCategory } = this.state;
        // planningUnitCategory.summary = '';
        planningUnitCategory.realmName = this.props.items.userRealmId !== "" ? this.state.realms.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        planningUnitCategory.planningUnitCategoryName = '';
        planningUnitCategory.notes = '';
        this.setState({
            planningUnitCategory: planningUnitCategory,
            planningUnitCategoryId: '',
            realmId: this.props.items.userRealmId
        },
            () => { });
    }

    render() {

        const { planningUnitCategories } = this.state;

        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        let planningUnitCategoryList = planningUnitCategories.length > 0
            && planningUnitCategories.map((item, i) => {
                if(item.level > 1) {
                    return (
                        <option key={i} value={item.payloadId}>
                            {getLabelText(item.payload.label, this.state.lang)}
                        </option>
                    )
                } else {
                    return (
                        <option key={i} value={item.payloadId} disabled={true}>
                            {getLabelText(item.payload.label, this.state.lang)}
                        </option>
                    )
                }                
            }, this);


        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.product.productcategory')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            realmName: this.props.items.userRealmId,
                            planningUnitCategoryName: "",
                            notes: ""
                        }}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.planningUnitCategory.summary = summaryText_2;
                            this.state.planningUnitCategory.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.planningUnitCategory).then(response => {
                                console.log("Response :", response.status, ":", JSON.stringify(response.data));
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
                                                valid={!errors.summary && this.state.planningUnitCategory.summary != ''}
                                                invalid={touched.summary && !!errors.summary}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.planningUnitCategory.summary}
                                                required />
                                            <FormFeedback className="red">{errors.summary}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="realmName">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="select" name="realmName" id="realmName"
                                                bsSize="sm"
                                                valid={!errors.realmName && this.state.planningUnitCategory.realmName != ''}
                                                invalid={touched.realmName && !!errors.realmName}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); this.getProductCategory(e.target.value) }}
                                                onBlur={handleBlur}
                                                value={this.state.realmId}
                                                required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {realmList}
                                            </Input>
                                            <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="planningUnitCategoryName">{i18n.t('static.product.productcategory')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="select" name="planningUnitCategoryName" id="planningUnitCategoryName"
                                                bsSize="sm"
                                                valid={!errors.planningUnitCategoryName && this.state.planningUnitCategory.planningUnitCategoryName != ''}
                                                invalid={touched.planningUnitCategoryName && !!errors.planningUnitCategoryName}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.planningUnitCategoryId}
                                                required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {planningUnitCategoryList}
                                            </Input>
                                            <FormFeedback className="red">{errors.planningUnitCategoryName}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="notes">{i18n.t('static.common.notes')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="textarea" name="notes" id="notes"
                                                bsSize="sm"
                                                valid={!errors.notes && this.state.planningUnitCategory.notes != ''}
                                                invalid={touched.notes && !!errors.notes}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                maxLength={600}
                                                value={this.state.planningUnitCategory.notes}
                                            // required 
                                            />
                                            <FormFeedback className="red">{errors.notes}</FormFeedback>
                                        </FormGroup>
                                        <ModalFooter className="pb-0 pr-0">
                                            <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                            <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                        </ModalFooter>
                                        {/* <br></br><br></br>
                                    <div className={this.props.className}>
                                        <p>{i18n.t('static.ticket.drodownvaluenotfound')}</p>
                                    </div> */}
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
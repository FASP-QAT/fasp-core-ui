import { Formik } from 'formik';
import React, { Component } from 'react';
import {
    Button,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label
} from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants';
import HealthAreaService from "../../api/HealthAreaService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
/**
 * Defines the validation schema for step one of program onboarding.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
    })
}
/**
 * Component for program Onboarding step six for taking the realm details for program
 */
export default class StepOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realmList: [],
            realmId: '',
        }
    }
    /**
     * Reterives realm list on component mount
     */
    componentDidMount() {
        HealthAreaService.getRealmList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmList: listArray
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
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
     * Renders the program onboarding step one screen.
     * @returns {JSX.Element} - Program onboarding step one screen.
     */
    render() {
        const { realmList } = this.state;
        let realms = realmList.length > 0
            && realmList.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <Formik
                    enableReinitialize={true}
                    initialValues={{
                        realmId: this.props.items.program.realm.realmId
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.props.finishedStepOne && this.props.finishedStepOne();
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
                            <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='realmForm'>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label>
                                    <Input
                                        valid={!errors.realmId}
                                        invalid={touched.realmId && !!errors.realmId}
                                        bsSize="sm"
                                        className="col-md-4"
                                        onBlur={handleBlur}
                                        type="select" name="realmId" id="realmId"
                                        value={this.props.items.program.realm.realmId}
                                        onChange={(e) => { handleChange(e); this.props.dataChange(e); this.props.getDependentLists(e) }}
                                    >
                                        <option value="">{i18n.t('static.common.select')}</option>
                                        {realms}
                                    </Input>
                                    <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                </FormGroup>
                                <FormGroup className="pb-3">
                                    <Button color="info" size="md" className="float-left mr-1" type="submit">{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                </FormGroup>
                            </Form>
                        )} />
            </>
        );
    }
}
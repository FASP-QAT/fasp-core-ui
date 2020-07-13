import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import Select from 'react-select';
import '../Forms/ValidationForms/ValidationForms.css'
import AuthenticationService from '../Common/AuthenticationService.js';
import DataSourceService from '../../api/DataSourceService';
import DataSourceTypeService from '../../api/DataSourceTypeService';
import i18n from '../../i18n';
import RealmService from "../../api/RealmService";
import ProgramService from "../../api/ProgramService";
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

const initialValues = {
    realmId: [],
    label: '',
    dataSourceTypeId: '',
    dataSourceTypeList: []
}
const entityname = i18n.t('static.datasource.datasource');

const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        label: Yup.string()
            .required(i18n.t('static.datasource.datasourcetext')),
        dataSourceTypeId: Yup.string()
            .required(i18n.t('static.datasource.datasourcetypetext'))
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


export default class AddDataSource extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            message: '',
            realm: {
                id: ''
            },
            label: {
                label_en: ''
            },
            dataSourceType: {
                id: ''
            },
            program: {
                id: '',
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                }
            },
            dataSourceTypeList: [],
            dataSourceTypeId: '',
            programs: [],
            programId: '',
        }
        this.Capitalize = this.Capitalize.bind(this);

        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.getDataSourceTypeByRealmId = this.getDataSourceTypeByRealmId.bind(this);
        this.getProgramByRealmId = this.getProgramByRealmId.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    dataChange(event) {
        if (event.target.name === "label") {
            this.state.label.label_en = event.target.value
        }
        else if (event.target.name === "dataSourceTypeId") {
            this.state.dataSourceType.id = event.target.value
        }
        if (event.target.name === "realmId") {
            this.state.realm.id = event.target.value;
        }
        if (event.target.name === "programId") {
            this.state.program.id = event.target.value;
        }
        let { dataSource } = this.state
        this.setState(
            {
                dataSource
            }
        )

    };

    touchAll(setTouched, errors) {
        setTouched({
            'label': true,
            'dataSourceTypeId': true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('dataSourceForm', (fieldName) => {
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
        AuthenticationService.setupAxiosInterceptors();

        RealmService.getRealmListAll()
            .then(response => {
                this.setState({
                    realms: response.data
                })
            })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }


    getDataSourceTypeByRealmId(e) {

        AuthenticationService.setupAxiosInterceptors();
        DataSourceTypeService.getDataSourceTypeByRealmId(e.target.value)
            .then(response => {
                console.log("getDataSourceTypeByRealmId---", response.data);
                this.setState({
                    dataSourceTypeList: response.data
                })

            })
    }

    getProgramByRealmId(e) {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramByRealmId(e.target.value)
            .then(response => {
                console.log("getProgramByRealmId---", response.data);
                this.setState({
                    programs: response.data
                })
            })
    }

    Capitalize(str) {
        this.state.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    render() {
        const { realms } = this.state;

        const { programs } = this.state;
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
                        {item.label.label_en}
                    </option>
                )
            }, this);


        const { dataSourceTypeList } = this.state;
        let dataSourceTypes = dataSourceTypeList.length > 0
            && dataSourceTypeList.map((item, i) => {
                return (
                    <option key={i} value={item.dataSourceTypeId}>{item.label.label_en}</option>
                )
            }, this);

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    DataSourceService.addDataSource(this.state)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/dataSource/listDataSource/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                },
                                                    () => {
                                                        this.hideSecondComponent();
                                                    })
                                            }
                                        })
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
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='dataSourceForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="sm"
                                                            valid={!errors.realmId && this.state.realm.id != ''}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getDataSourceTypeByRealmId(e); this.getProgramByRealmId(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.realm.id}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.datasource.datasource')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label && this.state.label.label_en != ''}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="programId">{i18n.t('static.dataSource.program')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            valid={!errors.programId && this.state.program.id != ''}
                                                            invalid={touched.programId && !!errors.programId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.program.id}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {programList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="dataSourceTypeId">{i18n.t('static.datasource.datasourcetype')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="dataSourceTypeId"
                                                            id="dataSourceTypeId"
                                                            bsSize="sm"
                                                            valid={!errors.dataSourceTypeId && this.state.dataSourceType.id != ''}
                                                            invalid={touched.dataSourceTypeId && !!errors.dataSourceTypeId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.dataSourceType.id}
                                                            required
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {dataSourceTypes}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.dataSourceTypeId}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md"color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;

                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />

                        </Card>
                    </Col>
                </Row>
                <div>
                    <h6>{i18n.t(this.state.message)}</h6>
                    <h6>{i18n.t(this.props.match.params.message)}</h6>
                </div>
            </div>
        );
    }

    cancelClicked() {
        this.props.history.push(`/dataSource/listDataSource/` + 'red/'  + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {

        this.state.label.label_en = ''
        this.state.dataSourceType.id = ''
        this.state.realm.id = ''
        this.state.program.id = ''

        let { dataSource } = this.state
        this.setState(
            {
                dataSource
            }
        )

    }

}
import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import CountryService from "../../api/CountryService";
import HealthAreaService from "../../api/HealthAreaService";
import { lang } from "moment";
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText';

let initialValues = {
    realmId: '',
    healthAreaName: ''
}
const entityname = i18n.t('static.datasourcetype.datasourcetype');
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required('select realm'),
        healthAreaName: Yup.string()
            .required('enter health area name')
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


export default class EditHealthAreaComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            countries: [],
            realms: [],
            // healthArea: {
            //     label: {
            //         label_en: ''
            //     },
            //     realm: {
            //         realmId: ''
            //     },
            //     realmCountryArray: []

            // },
            healthArea: this.props.location.state.healthArea,
            message: '',
            lang: localStorage.getItem('lang'),
            realmCountryId: '',
            realmCountryList: []
        }
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        // this.getRealmCountryList = this.getRealmCountryList.bind(this);

        initialValues = {
            // label: this.props.location.state.healthArea.label.label_en,
            healthAreaName: getLabelText(this.state.healthArea.label, lang),
            realmId: this.state.healthArea.realm.realmId
        }

        console.log("state---", this.state);
    }
    dataChange(event) {
        let { healthArea } = this.state
        console.log(event.target.name);
        console.log(event.target.value);
        if (event.target.name === "healthAreaName") {
            healthArea.label.label_en = event.target.value
        } else if (event.target.name === "realmId") {
            healthArea.realm.realmId = event.target.value
        } else if (event.target.name === "active") {
            healthArea.active = event.target.id === "active2" ? false : true
        }
        this.setState({
            healthArea
        }, (
        ) => {
            console.log("state after update---", this.state.healthArea)
        })
    }

    touchAll(setTouched, errors) {
        setTouched({
            realmId: true,
            healthAreaName: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('healthAreaForm', (fieldName) => {
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

        console.log("check---", this.state.healthArea);
        if (!AuthenticationService.checkTypeOfSession()) {
            alert("You can't change your session from online to offline or vice versa.");
            this.props.history.push(`/`)
        }

        AuthenticationService.setupAxiosInterceptors();
        // var realmId = parseInt(this.state.healthArea.realm.realmId);
        // this.getCountryListByRealmId(realmId);
        UserService.getRealmList()
            .then(response => {
                console.log("realm list---", response.data);
                this.setState({
                    realms: response.data
                })
            }).catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.response.data.message
                            })
                            break
                    }
                }
            );

        HealthAreaService.getRealmCountryList(this.props.location.state.healthArea.realm.realmId)
            .then(response => {
                console.log("Realm Country List -------list---", response.data);
                if (response.status == 200) {
                    var json = response.data;
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].realmCountryId, label: getLabelText(json[i].country.label, this.state.lang) }
                    }
                    this.setState({
                        realmCountryList: regList
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response.status) {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );


        // $("#healthAreaForm").validate({
        //     ignore: [],
        //     rules: {
        //         'healthArea.label.label_en': {
        //             required: true
        //         },
        //         'healthArea.realmCountryArray': {
        //             required: true
        //         },
        //         'healthArea.realm.realmId': {
        //             required: true
        //         }
        //     },
        //     errorPlacement: function (error, element) {
        //         error.insertAfter(element);
        //     }
        // });

    }

    updateFieldData(value) {
        let { healthArea } = this.state;
        this.setState({ realmCountryId: value });
        var realmCountryId = value;
        var realmCountryIdArray = [];
        for (var i = 0; i < realmCountryId.length; i++) {
            realmCountryIdArray[i] = realmCountryId[i].value;
        }
        healthArea.realmCountryArray = realmCountryIdArray;
        this.setState({ healthArea: healthArea });
    }

    // getRealmCountryList(e) {
    //     AuthenticationService.setupAxiosInterceptors();
    //     HealthAreaService.getRealmCountryList(e.target.value)
    //         .then(response => {
    //             console.log("Realm Country List list---", response.data);
    //             if (response.status == 200) {
    //                 var json = response.data;
    //                 var regList = [];
    //                 for (var i = 0; i < json.length; i++) {
    //                     regList[i] = { value: json[i].realmCountryId, label: getLabelText(json[i].country.label, this.state.lang) }
    //                 }
    //                 this.setState({
    //                     realmCountryId: '',
    //                     realmCountryList: regList
    //                 })
    //             } else {
    //                 this.setState({
    //                     message: response.data.messageCode
    //                 })
    //             }
    //         }).catch(
    //             error => {
    //                 if (error.message === "Network Error") {
    //                     this.setState({ message: error.message });
    //                 } else {
    //                     switch (error.response.status) {
    //                         case 500:
    //                         case 401:
    //                         case 404:
    //                         case 406:
    //                         case 412:
    //                             this.setState({ message: error.response.data.messageCode });
    //                             break;
    //                         default:
    //                             this.setState({ message: 'static.unkownError' });
    //                             console.log("Error code unkown");
    //                             break;
    //                     }
    //                 }
    //             }
    //         );

    // }

    Capitalize(str) {
        // let { dataSourceType } = this.state
        // dataSourceType.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    // render() {
    //     const { countries } = this.state;
    //     const { realms } = this.state;

    //     let realmList = realms.length > 0
    //         && realms.map((item, i) => {
    //             return (
    //                 <option key={i} value={item.realmId}>
    //                     {(() => {
    //                         switch (this.state.languageId) {
    //                             case 2: return (item.label.label_pr !== null && item.label.label_pr !== "" ? item.label.label_pr : item.label.label_en);
    //                             case 3: return (item.label.label_fr !== null && item.label.label_fr !== "" ? item.label.label_fr : item.label.label_en);
    //                             case 4: return (item.label.label_sp !== null && item.label.label_sp !== "" ? item.label.label_sp : item.label.label_en);
    //                             default: return item.label.label_en;
    //                         }
    //                     })()}
    //                 </option>
    //             )
    //         }, this);

    //     let countryList = countries.length > 0
    //         && countries.map((item, i) => {
    //             return (
    //                 <option key={i} value={item.realmCountryId}>
    //                     {item.country.label.label_en}
    //                 </option>
    //             )
    //         }, this);
    //     return (
    //         <div class="page-container page-navigation-toggled page-container-wide">
    //             <div class="page-content">
    //                 <ul class="breadcrumb">
    //                     <li><a href="#">Home</a></li>
    //                     <li><a href="#">Admin</a></li>
    //                     <li><a href="#">Health Area</a></li>
    //                     <li><a href="#">Update Health Area</a></li>
    //                 </ul>
    //                 <div class="page-content-wrap">
    //                     <div><h5>{this.state.message}</h5></div>
    //                     <div class="row">
    //                         <div class="col-md-12">

    //                             <form name="healthAreaForm" id="healthAreaForm" class="form-horizontal">
    //                                 <div class="panel panel-default">
    //                                     <div class="panel-heading">
    //                                         <h3 class="panel-title">Edit Health Area</h3>
    //                                     </div>
    //                                     <div class="panel-body">
    //                                         <div class="form-group">
    //                                             <label class="req col-md-2 col-xs-12 control-label">Realm</label>
    //                                             <div class="col-md-6 col-xs-12">
    //                                                 <select id="healthArea.realm.realmId" class="form-control select" data-live-search="true" name="healthArea.realm.realmId" onChange={this.dataChange} value={this.state.healthArea.realm.realmId} disabled={true}>
    //                                                     <option value="">-Nothing Selected-</option>
    //                                                     {realmList}
    //                                                 </select>

    //                                             </div>
    //                                         </div>
    //                                         <div class="form-group">
    //                                             <label class="req col-md-2 col-xs-12 control-label">Country</label>
    //                                             <div class="col-md-6 col-xs-12">
    //                                                 <select id="healthArea.realmCountryArray" class="form-control select" data-live-search="true" name="healthArea.realmCountryArray" onChange={this.dataChange} multiple={true} value={this.state.healthArea.realmCountryArray}>
    //                                                     <option value="">-Nothing Selected-</option>
    //                                                     {countryList}
    //                                                 </select>

    //                                             </div>
    //                                         </div>
    //                                         <div class="form-group">
    //                                             <label class="req col-md-2 col-xs-12 control-label">HealthAreaName</label>
    //                                             <div class="col-md-6 col-xs-12">
    //                                                 <input type="text" id="healthArea.label.label_en" class="form-control" name="healthArea.label.label_en" onChange={this.dataChange} value={this.state.healthArea.label.label_en} readOnly={true} />
    //                                             </div>
    //                                         </div>
    //                                         <div className="form-group">
    //                                             <label class="req col-md-2 col-xs-12 control-label">Active</label>
    //                                             <div class="col-md-1 col-xs-12">
    //                                                 <input type="radio" id="healthArea.active1" name="healthArea.active" value={true} checked={this.state.healthArea.active === true} onChange={this.dataChange} /> Active
    //                                                 <input type="radio" id="healthArea.active2" name="healthArea.active" value={false} checked={this.state.healthArea.active === false} onChange={this.dataChange} /> Disabled
    //                                         </div>
    //                                         </div>
    //                                     </div>
    //                                     <div class="panel-footer">
    //                                         <div class="pull-right">
    //                                             <button type="button" className="btn btn-success" onClick={this.updateClicked}>Update</button>
    //                                             <button type="button" className="btn btn-danger" onClick={this.cancelClicked}>Cancel</button><br></br><br></br>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                             </form>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }

    render() {
        const { countries } = this.state;
        const { realms } = this.state;

        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {(() => {
                            switch (this.state.languageId) {
                                case 2: return (item.label.label_pr !== null && item.label.label_pr !== "" ? item.label.label_pr : item.label.label_en);
                                case 3: return (item.label.label_fr !== null && item.label.label_fr !== "" ? item.label.label_fr : item.label.label_en);
                                case 4: return (item.label.label_sp !== null && item.label.label_sp !== "" ? item.label.label_sp : item.label.label_en);
                                default: return item.label.label_en;
                            }
                        })()}
                    </option>
                )
            }, this);

        // let countryList = countries.length > 0
        //     && countries.map((item, i) => {
        //         return (
        //             <option key={i} value={item.realmCountryId}>
        //                 {item.country.label.label_en}
        //             </option>
        //         )
        //     }, this);

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>Edit Health Area</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log("-------------------->" + this.state.healthArea);
                                    HealthAreaService.editHealthArea(this.state.healthArea)
                                        .then(response => {
                                            if (response.data.message != "Failed") {
                                                this.props.history.push(`/healthArea/listHealthArea/` + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.message
                                                })
                                            }
                                        })
                                        .catch(
                                            error => {
                                                switch (error.message) {
                                                    case "Network Error":
                                                        this.setState({
                                                            message: error.message
                                                        })
                                                        break
                                                    default:
                                                        this.setState({
                                                            message: error.response.data.message
                                                        })
                                                        break
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
                                        setTouched
                                    }) => (
                                            <Form onSubmit={handleSubmit} noValidate name='healthAreaForm'>
                                                <CardBody>

                                                    <FormGroup>
                                                        <Label htmlFor="healthAreaName">Label(English) </Label>
                                                        <Input
                                                            type="text" name="healthAreaName" valid={!errors.healthAreaName}
                                                            invalid={touched.healthAreaName && !!errors.healthAreaName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.healthArea.label.label_en}
                                                            id="healthAreaName" placeholder="Health Area Text" />
                                                        <FormFeedback className="red">{errors.healthAreaName}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.realm')}</Label>
                                                        <Input
                                                            value={this.state.healthArea.realm.realmId}
                                                            valid={!errors.realmId}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            disabled
                                                            type="select" name="realmId" id="realmId">
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback>{errors.realmId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.realmcountry')}</Label>
                                                        <Select
                                                            valid={!errors.realmCountryId}
                                                            invalid={touched.realmCountryId && !!errors.realmCountryId}
                                                            onChange={(e) => { handleChange(e); this.updateFieldData(e) }}
                                                            onBlur={handleBlur} name="realmCountryId" id="realmCountryId"
                                                            multi
                                                            options={this.state.realmCountryList}
                                                            value={this.state.healthArea.realmCountryArray}
                                                        />
                                                        <FormFeedback>{errors.realmCountryId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label>{i18n.t('static.common.status')}  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.healthArea.active === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                {i18n.t('static.common.active')}
                                                            </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active2"
                                                                name="active"
                                                                value={false}
                                                                checked={this.state.healthArea.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.common.disabled')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup>

                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-check"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                                                        &nbsp;
                                                      </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />

                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

    // getCountryListByRealmId(realmId) {
    //     console.log("realmId---" + realmId);
    //     CountryService.getRealmCountryListByRealmId(realmId !== "" ? realmId : 0)
    //         .then(response => {
    //             console.log("response---", response.data);
    //             this.setState({
    //                 countries: response.data
    //             })
    //         }).catch(
    //             error => {
    //                 switch (error.message) {
    //                     case "Network Error":
    //                         this.setState({
    //                             message: error.message
    //                         })
    //                         break
    //                     default:
    //                         this.setState({
    //                             message: error.response.data.message
    //                         })
    //                         break
    //                 }
    //             }
    //         );

    // }
    // updateClicked() {
    //     if (navigator.onLine) {
    //         if (AuthenticationService.checkTypeOfSession()) {
    //             if ($("#healthAreaForm").valid()) {
    //                 HealthAreaService.editHealthArea(this.state.healthArea)
    //                     .then(response => {
    //                         console.log("response edit---", response);
    //                         if (response.data.message != "Failed") {
    //                             this.props.history.push(`/healthAreaList/${response.data.message}`)
    //                         } else {
    //                             this.setState({
    //                                 message: response.data.message
    //                             })
    //                         }
    //                     })
    //                     .catch(
    //                         error => {
    //                             switch (error.message) {
    //                                 case "Network Error":
    //                                     this.setState({
    //                                         message: error.message
    //                                     })
    //                                     break
    //                                 default:
    //                                     this.setState({
    //                                         message: error.response.data.message
    //                                     })
    //                                     break
    //                             }
    //                         }
    //                     );
    //             }
    //         } else {
    //             alert("You can't change your session from online to offline or vice versa.");
    //         }
    //     } else {
    //         alert("You must be Online.")
    //     }
    // }

    cancelClicked() {
        this.props.history.push(`/healthArea/listHealthArea/` + i18n.t('static.message.cancelled', { entityname }))
    }

}

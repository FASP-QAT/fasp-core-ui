import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import UnitService from '../../api/UnitService.js';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import EquivalancyUnitService from "../../api/EquivalancyUnitService";
import TracerCategoryService from '../../api/TracerCategoryService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import HealthAreaService from '../../api/HealthAreaService';
import ProgramService from '../../api/ProgramService';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import classNames from 'classnames';
import { SECRET_KEY, SPECIAL_CHARECTER_WITH_NUM, SPACE_REGEX, ALPHABET_NUMBER_REGEX } from '../../Constants';
import getLabelText from '../../CommonComponent/getLabelText';
import CryptoJS from 'crypto-js';
import { Prompt } from 'react-router';
import { unit } from 'mathjs';
import EquivalancyUnit from '../EquivalancyUnit/EquivalancyUnitList';

let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.equivalancyUnit.equivalancyUnit"))
let summaryText_2 = "Add Equivalency Unit Mapping"
const initialValues = {
    summary: "",
    equivalencyUnitId: '',
    healthAreaId: '',
    tracerCategoryId: '',
    forecastingUnitId: '',
    unit: '',
    programId: '',
    notes: '',
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        equivalencyUnitId: Yup.string()
            .required(i18n.t('static.label.fieldRequired')),
        tracerCategoryId: Yup.string()
            .required(i18n.t('static.label.fieldRequired')),
        forecastingUnitId: Yup.string()
            .required(i18n.t('static.label.fieldRequired')),
        conversionToEU: Yup.string()
            .matches(/^\d{1,14}(\.\d{1,4})?$/, i18n.t('static.usagePeriod.conversionTOFUTest'))
            .required(i18n.t('static.label.fieldRequired')).min(0, i18n.t('static.program.validvaluetext')),
        programId: Yup.string()
            .required(i18n.t('static.label.fieldRequired')),

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

export default class OrganisationTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            equivalencyUnit: {
                summary: summaryText_1,
                equivalencyUnit: "",
                tracerCategory: "",
                forecastingUnit: "",
                conversionToEU: '',
                type: '',
                notes: "",
            },
            equivalencyUnitId: '',
            tracerCategoryId: '',
            forecastingUnitId: '',
            typeId: '',
            healthAreaList: [],
            equivalancyUnitList: [],
            tracerCategoryList: [],
            tracerCategoryList1: [],
            forecastingUnitList: [],
            typeList: [],
            roleArray: [],
            unitList: [],
            equivalancyUnitMappingList: [],
            lang: localStorage.getItem('lang'),
            message: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.getHealthAreaList = this.getHealthAreaList.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.getTracerCategoryList = this.getTracerCategoryList.bind(this);
        this.getUnitList = this.getUnitList.bind(this);
        this.getEquivalancyUnitList = this.getEquivalancyUnitList.bind(this);
        this.getTypeList = this.getTypeList.bind(this);
        this.getEquivalancyUnitMappingData = this.getEquivalancyUnitMappingData.bind(this);
        this.getForecastingUnitByTracerCategoriesId = this.getForecastingUnitByTracerCategoriesId.bind(this);
        this.getTypeList = this.getTypeList.bind(this);


    }

    dataChange(event) {
        let { equivalencyUnit } = this.state
        if (event.target.name == "summary") {
            equivalencyUnit.summary = event.target.value;
        }
        if (event.target.name === "equivalencyUnitId") {
            equivalencyUnit.equivalencyUnitName = event.target.value !== "" ? this.state.equivalancyUnitList.filter(c => c.id == event.target.value)[0].name : "";
            this.setState({
                equivalencyUnitId: event.target.value
            })
        }
        if (event.target.name === "tracerCategoryId") {
            equivalencyUnit.tracerCategoryName = event.target.value !== "" ? this.state.tracerCategoryList1.filter(c => c.tracerCategoryId == event.target.value)[0].label.label_en : "";
            this.setState({
                tracerCategoryId: event.target.value
            })
        }
        if (event.target.name === "forecastingUnitId") {
            equivalencyUnit.forecastingUnitName = event.target.value !== "" ? this.state.forecastingUnitList.filter(c => c.id == event.target.value)[0].name : "";
            this.setState({
                forecastingUnitId: event.target.value
            })
        }
        if (event.target.name === "UnitId") {
            equivalencyUnit.unitName = event.target.value !== "" ? this.state.unitList.filter(c => c.id == event.target.value)[0].name : "";
            this.setState({
                unitId: event.target.value
            })
        }

        if (event.target.name == "notes") {
            equivalencyUnit.notes = event.target.value;
        }
        this.setState({
            equivalencyUnit
        }, () => { })
    };

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            equivalencyUnitId: true,
            tracerCategoryId: true,
            forecastingUnitId: true,
            typeId: true,
            conversionToEU: true
            // notes: true,
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
        this.getHealthAreaList();
    }

    getHealthAreaList() {
        HealthAreaService.getHealthAreaList()
            .then(response => {
                if (response.status == 200) {
                    console.log("response---", response.data);
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });

                    let tempList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: getLabelText(listArray[i].label, this.state.lang),
                                id: parseInt(listArray[i].healthAreaId),
                                active: listArray[i].active,
                            }
                            tempList[i] = paJson
                        }
                    }
                    this.setState({
                        healthAreaList: tempList
                    },
                        () => {
                            this.getTracerCategoryList();
                        })
                }
                else {

                    this.setState({
                        message: response.data.messageCode, loading: false
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

    getTracerCategoryList() {
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                if (response.status == 200) {
                    console.log("TracerCategory------->", response.data)
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });

                    let tempList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: getLabelText(listArray[i].label, this.state.lang),
                                id: parseInt(listArray[i].tracerCategoryId),
                                active: listArray[i].active,
                                healthArea: listArray[i].healthArea
                            }
                            tempList[i] = paJson
                        }
                    }

                    this.setState({
                        tracerCategoryList: tempList,
                        tracerCategoryList1: response.data
                        // loading: false
                    },
                        () => {
                            console.log("TracerCategory------->", this.state.tracerCategoryList)
                            // this.getForecastingUnit();
                            this.getUnitList();
                        })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
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

    getUnitList() {
        UnitService.getUnitListAll().then(response => {
            console.log("response------->" + response.data);
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                // listArray = listArray.filter(c => c.active == true);

                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].label, this.state.lang),
                            id: parseInt(listArray[i].unitId),
                            active: listArray[i].active,

                        }
                        tempList[i] = paJson
                    }
                }

                this.setState({
                    unitList: tempList,
                    // loading: false
                },
                    () => {
                        // this.getDataSet();
                        this.getEquivalancyUnitList();
                    })
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
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

    getEquivalancyUnitList() {
        EquivalancyUnitService.getEquivalancyUnitList().then(response => {
            if (response.status == 200) {
                console.log("EQ1------->", response.data);
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].label, this.state.lang),
                            id: parseInt(listArray[i].equivalencyUnitId),
                            active: listArray[i].active,
                            healthAreaList: listArray[i].healthAreaList,
                            realm: listArray[i].realm
                        }
                        tempList[i] = paJson
                    }
                }

                this.setState({
                    equivalancyUnitList: tempList,
                    // loading: false
                },
                    () => {
                        this.getTypeList();
                    })
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }

        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false,
                            color: "#BA0C2F",
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
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                        }
                    }
                }
            );
    }

    getTypeList() {
        ProgramService.getDataSetList()
            .then(response => {
                console.log("PROGRAM---------->", response.data)
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.programCode.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.programCode.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });

                    let tempProgramList = [];
                    if (listArray.length > 0) {
                        for (var i = 0; i < listArray.length; i++) {
                            var paJson = {
                                name: listArray[i].programCode,
                                id: listArray[i].programId,
                                active: listArray[i].active,
                            }
                            tempProgramList[i] = paJson
                        }
                    }

                    let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                    let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                    // console.log("decryptedUser=====>", decryptedUser);

                    var roleList = decryptedUser.roleList;
                    var roleArray = []
                    for (var r = 0; r < roleList.length; r++) {
                        roleArray.push(roleList[r].roleId)
                    }

                    tempProgramList.unshift({
                        // name: 'All',
                        name: i18n.t('static.common.realmLevel'),
                        id: -1,
                        active: true,
                    });


                    this.setState({
                        typeList: tempProgramList,
                        roleArray: roleArray
                        // loading: false
                    }, () => {
                        // console.log("PROGRAM---------->111", this.state.typeList) 
                        this.getEquivalancyUnitMappingData();
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    this.setState({
                        programs: [], loading: false
                    }, () => { })
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
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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

    getEquivalancyUnitMappingData() {
        EquivalancyUnitService.getEquivalancyUnitMappingList().then(response => {
            if (response.status == 200) {
                console.log("response.data---->", response.data);
                let listArray = response.data;

                listArray.sort((a, b) => {
                    if (a.equivalencyUnit.label.label_en === b.equivalencyUnit.label.label_en) {
                        return a.forecastingUnit.label.label_en < b.forecastingUnit.label.label_en ? -1 : 1
                    } else {
                        return a.equivalencyUnit.label.label_en < b.equivalencyUnit.label.label_en ? -1 : 1
                    }
                })

                this.setState({
                    equivalancyUnitMappingList: listArray,
                },
                    () => {
                        // this.buildJexcel()
                        this.getForecastingUnitByTracerCategoriesId();
                        // this.filterData();
                    })

            }
            else {
                this.setState({
                    message: response.data.messageCode, loading: false, color: "#BA0C2F",
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }

        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false,
                            color: "#BA0C2F",
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
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: "#BA0C2F",
                                });
                                break;
                        }
                    }
                }
            );
    }

    getForecastingUnitByTracerCategoriesId() {
        let healthAreaList = [];
        let equivalancyUnitList = this.state.equivalancyUnitList;
        for (var i = 0; i < equivalancyUnitList.length; i++) {
            let localHealthAreaList = equivalancyUnitList[i].healthAreaList;
            localHealthAreaList = localHealthAreaList.map(ele => ele.id)
            healthAreaList = healthAreaList.concat(localHealthAreaList);
        }

        let tracerCategoryIdList = [];
        let tracerCategoryList = this.state.tracerCategoryList;
        for (var i = 0; i < healthAreaList.length; i++) {
            tracerCategoryIdList = tracerCategoryIdList.concat(tracerCategoryList.filter(c => c.healthArea.id == healthAreaList[i]));
        }

        tracerCategoryIdList = tracerCategoryIdList.map(ele => (ele.id).toString());

        let tracerCategoryListOfMappingData = this.state.equivalancyUnitMappingList.map(ele => (ele.tracerCategory.id).toString());

        let newTracerCategoryIdList = tracerCategoryIdList.concat(tracerCategoryListOfMappingData);
        newTracerCategoryIdList = [... new Set(newTracerCategoryIdList)];

        console.log("response------->123", tracerCategoryIdList);
        console.log("response------->124", tracerCategoryListOfMappingData);
        console.log("response------->125", newTracerCategoryIdList);

        ForecastingUnitService.getForecastingUnitByTracerCategoriesId(newTracerCategoryIdList).then(response => {
            console.log("response------->126", response.data);
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });

                let tempList = [];
                if (listArray.length > 0) {
                    for (var i = 0; i < listArray.length; i++) {
                        var paJson = {
                            name: getLabelText(listArray[i].label, this.state.lang) + ' | ' + parseInt(listArray[i].forecastingUnitId),
                            id: parseInt(listArray[i].forecastingUnitId),
                            active: listArray[i].active,
                            tracerCategoryId: listArray[i].tracerCategory.id,
                            unit: listArray[i].unit
                        }
                        tempList[i] = paJson
                    }
                }

                this.setState({
                    forecastingUnitList: tempList,
                    // loading: false
                },
                    () => {
                        // this.getEquivalancyUnit();
                        // this.filterData();
                    })
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
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




    updateFieldData(value) {
        let { equivalencyUnit } = this.state;
        this.setState({ healthAreaId: value });
        var healthAreaId = value;
        var healthAreaIdArray = [];
        for (var i = 0; i < healthAreaId.length; i++) {
            healthAreaIdArray[i] = healthAreaId[i].label;
        }
        equivalencyUnit.healthAreaId = healthAreaIdArray;
        this.setState({ equivalencyUnit: equivalencyUnit });
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { equivalencyUnit } = this.state;
        equivalencyUnit.equivalencyUnitName = '';
        equivalencyUnit.tracerCategoryName = '';
        equivalencyUnit.forecastingUnitName = '';
        equivalencyUnit.typeName = '';
        equivalencyUnit.conversionToEU = '';
        equivalencyUnit.healthAreaName = '';
        equivalencyUnit.unitName = '';
        equivalencyUnit.notes = '';
        this.setState({
            equivalencyUnit: equivalencyUnit,
            equivalencyUnitId: '',
            tracerCategoryId: '',
            forecastingUnitId: '',
            typeId: '',
        },
            () => { });
    }

    render() {

        const { equivalancyUnitList } = this.state;
        let equivalencyUnits = equivalancyUnitList.length > 0
            && equivalancyUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const { tracerCategoryList1 } = this.state;
        let tracerCategoryLists = tracerCategoryList1.length > 0
            && tracerCategoryList1.map((item, i) => {
                return (
                    <option key={i} value={item.tracerCategoryId}>{item.label.label_en}</option>
                )
            }, this);

        const { forecastingUnitList } = this.state;
        let forecastingUnits = forecastingUnitList.length > 0
            && forecastingUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const { typeList } = this.state;
        let types = typeList.length > 0
            && typeList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.equivalencyUnit.equivalencyUnit')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            equivalencyUnitId: this.state.equivalencyUnitId,
                            tracerCategoryId: this.state.tracerCategoryId,
                            forecastingUnitId: this.state.forecastingUnitId,
                            typeId: this.state.typeId,
                            notes: this.state.equivalencyUnit.notes,
                        }}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.equivalencyUnit.summary = summaryText_2;
                            this.state.equivalencyUnit.userLanguageCode = this.state.lang;
                            console.log("SUBMIT---------->", this.state.equivalencyUnit);
                            JiraTikcetService.addEmailRequestIssue(this.state.equivalencyUnit).then(response => {
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
                                handleReset,
                                setFieldValue,
                                setFieldTouched
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.equivalencyUnit.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.equivalencyUnit.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label htmlFor="equivalencyUnitId">{i18n.t('static.equivalancyUnit.equivalancyUnitName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="select"
                                            name="equivalencyUnitId"
                                            id="equivalencyUnitId"
                                            bsSize="sm"
                                            valid={!errors.equivalencyUnitId && this.state.equivalencyUnit.equivalencyUnitName != ''}
                                            invalid={touched.equivalencyUnitId && !!errors.equivalencyUnitId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.equivalencyUnitId}
                                            required
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {equivalencyUnits}
                                        </Input>
                                        <FormFeedback className="red">{errors.equivalencyUnitId}</FormFeedback>
                                    </FormGroup>

                                    < FormGroup >
                                        <Label for="healthAreaName">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="healthAreaName" id="healthAreaName" readOnly={true}
                                            bsSize="sm"
                                            // valid={!errors.healthAreaName && this.state.equivalencyUnit.summary != ''}
                                            // invalid={touched.healthAreaName && !!errors.healthAreaName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.equivalencyUnit.healthAreaName}
                                            required />
                                        <FormFeedback className="red">{errors.healthAreaName}</FormFeedback>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label htmlFor="tracerCategoryId">{i18n.t('static.tracercategory.tracercategory')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="select"
                                            name="tracerCategoryId"
                                            id="tracerCategoryId"
                                            bsSize="sm"
                                            valid={!errors.tracerCategoryId && this.state.equivalencyUnit.tracerCategoryName != ''}
                                            invalid={touched.tracerCategoryId && !!errors.tracerCategoryId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.tracerCategoryId}
                                            required
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {equivalencyUnits}
                                        </Input>
                                        <FormFeedback className="red">{errors.tracerCategoryId}</FormFeedback>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label htmlFor="forecastingUnitId">{i18n.t('static.product.unit1')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="select"
                                            name="forecastingUnitId"
                                            id="forecastingUnitId"
                                            bsSize="sm"
                                            valid={!errors.forecastingUnitId && this.state.equivalencyUnit.forecastingUnitName != ''}
                                            invalid={touched.forecastingUnitId && !!errors.forecastingUnitId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.forecastingUnitId}
                                            required
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {equivalencyUnits}
                                        </Input>
                                        <FormFeedback className="red">{errors.forecastingUnitId}</FormFeedback>
                                    </FormGroup>

                                    < FormGroup >
                                        <Label for="unitName">{i18n.t('static.dashboard.unit')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="unitName" id="unitName" readOnly={true}
                                            bsSize="sm"
                                            // valid={!errors.unitName && this.state.equivalencyUnit.unitName != ''}
                                            // invalid={touched.unitName && !!errors.unitName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.equivalencyUnit.unitName}
                                            required />
                                        <FormFeedback className="red">{errors.unitName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="conversionToEU">{i18n.t('static.equivalencyUnit.conversionToEU')}<span className="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="number"
                                            name="conversionToEU"
                                            id="conversionToEU"
                                            bsSize="sm"
                                            valid={!errors.conversionToEU && this.state.equivalencyUnit.conversionToEU != ''}
                                            invalid={touched.conversionToEU && !!errors.conversionToEU}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.equivalencyUnit.conversionToEU}
                                            required />
                                        <FormFeedback className="red">{errors.conversionToEU}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="typeId">{i18n.t('static.product.unit1')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="select"
                                            name="typeId"
                                            id="typeId"
                                            bsSize="sm"
                                            valid={!errors.typeId && this.state.equivalencyUnit.typeId != ''}
                                            invalid={touched.typeId && !!errors.typeId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.typeId}
                                            required
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {types}
                                        </Input>
                                        <FormFeedback className="red">{errors.typeId}</FormFeedback>
                                    </FormGroup>


                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.equivalencyUnit.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.equivalencyUnit.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>

                                    
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
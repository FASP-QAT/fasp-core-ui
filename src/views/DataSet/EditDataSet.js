import classNames from 'classnames';
import { Formik } from 'formik';
import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import { lang } from "moment";
import React, { Component } from "react";
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import {
    Button,
    Card, CardBody,
    CardFooter,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row
} from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from "../../CommonComponent/JExcelCommonFunctions.js";
import { API_URL, MAX_PROGRAM_CODE_LENGTH } from "../../Constants";
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
import DropdownService from '../../api/DropdownService';
import ProgramService from "../../api/ProgramService";
import i18n from "../../i18n";
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Capitalize, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.program.programMaster');
// Initial values for form fields
let initialValues = {
    programName: '',
    realmId: '',
    realmCountryId: '',
    organisationId: '',
    userId: '',
    healthAreaId: [],
    programNotes: '',
    regionId: [],
    programCode1: ''
}

/**
 * Defines the validation schema for forecast program details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        programName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.dataSet.forecastingProgramName')),
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext')),
        organisationId: Yup.string()
            .required(i18n.t('static.program.validorganisationtext')),
        userId: Yup.string()
            .required(i18n.t('static.program.validmanagertext')),
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext')),
        regionId: Yup.string()
            .required(i18n.t('static.common.regiontext')),
        // programCode1: Yup.string()
        //     .test('programCode', i18n.t('static.programValidation.programCode'),
        //         function (value) {
        //             if (parseInt(document.getElementById("programCode").value.length + value.length) > MAX_PROGRAM_CODE_LENGTH) {
        //                 return false;
        //             } else {
        //                 return true;
        //             }
        //         })
    })
}
/**
 * Component for edit forecast program details.
 */
export default class EditProgram extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uniqueCode: '',
            program: {
                programCode: '<%RC%>-<%TA%>-<%OR%>-',
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realm: {
                    realmId: '',
                },
                realmCountry: {
                    realmCountryId: '',
                    country: {
                        label: {
                            label_en: '',
                            label_sp: '',
                            label_pr: '',
                            label_fr: ''
                        }
                    },
                    realm: {
                        realmId: '',
                        label: {
                            label_en: '',
                            label_sp: '',
                            label_pr: '',
                            label_fr: ''
                        }
                    }
                },
                organisation: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                programManager: {
                    userId: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                healthArea: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                programNotes: '',
                regionArray: [],
                healthAreaArray: []
            },
            regionId: '',
            healthAreaId: '',
            lang: localStorage.getItem('lang'),
            realmList: [],
            realmCountryList: [],
            organisationList: [],
            healthAreaList: [],
            programManagerList: [],
            regionList: [],
            userList: [],
            message: '',
            loading: true,
            healthAreaCode: '',
            organisationCode: '',
            realmCountryCode: '',
            isChanged: false,
        }
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.changeLoading = this.changeLoading.bind(this);
        this.generateHealthAreaCode = this.generateHealthAreaCode.bind(this);
        this.generateOrganisationCode = this.generateOrganisationCode.bind(this);
        this.updateFieldDataHealthArea = this.updateFieldDataHealthArea.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    /**
     * Change message state
     * @param {String} message Message that needs to be changed
     */
    changeMessage(message) {
        this.setState({ message: message })
    }
    /**
     * Change loading state
     * @param {String} message loading state new value
     */
    changeLoading(loading) {
        this.setState({ loading: loading })
    }
    /**
     * Reterives forecast program details,program manager list, region list, organisation list, health area list on component mount
     */
    componentDidMount() {
        ProgramService.getDatasetById(this.props.match.params.dataSetId).then(response => {
            var proObj = response.data;
            var programCode = response.data.programCode;
            var splitCode = programCode.split("-");
            var uniqueCode = splitCode[3];
            var realmCountryCode = splitCode[0];
            var healthAreaCode = splitCode[1];
            var organisationCode = splitCode[2];
            if (splitCode.length > 4) {
                uniqueCode = programCode.substring(programCode.indexOf(splitCode[3]) + 2, programCode.length);
            }
            if (uniqueCode == undefined) {
                uniqueCode = ""
            }
            this.setState({
                program: proObj,
                loading: false,
                uniqueCode: uniqueCode,
                healthAreaCode: healthAreaCode,
                organisationCode: organisationCode,
                realmCountryCode: realmCountryCode
            })
            ProgramService.getProgramManagerListByProgramId(this.props.match.params.dataSetId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.username.toUpperCase();
                            var itemLabelB = b.username.toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            programManagerList: listArray, loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
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
            ProgramService.getRegionList(response.data.realmCountry.realmCountryId)
                .then(response => {
                    if (response.status == 200) {
                        var json = response.data;
                        var regList = [];
                        for (var i = 0; i < json.length; i++) {
                            regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lan) }
                        }
                        regList.sort((a, b) => {
                            var itemLabelA = a.label.toUpperCase();
                            var itemLabelB = b.label.toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            regionList: regList, loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
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
            DropdownService.getOrganisationListByRealmCountryId(response.data.realmCountry.realmCountryId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            organisationList: listArray
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
            ProgramService.getHealthAreaListByRealmCountryId(response.data.realmCountry.realmCountryId)
                .then(response => {
                    if (response.status == 200) {
                        var haList = [];
                        if (AuthenticationService.checkUserACL([this.props.match.params.dataSetId.toString()], "ROLE_BF_UPDATE_TA_FOR_FP")) {
                            var json = response.data;
                            for (var i = 0; i < json.length; i++) {
                                haList[i] = { healthAreaCode: json[i].healthAreaCode, value: json[i].healthAreaId, label: getLabelText(json[i].label, this.state.lang) }
                            }
                        } else {
                            var json = this.state.program.healthAreaList;
                            for (var i = 0; i < json.length; i++) {
                                haList[i] = { healthAreaCode: json[i].code, value: json[i].id, label: getLabelText(json[i].label, this.state.lang) }
                            }
                        }
                        var listArray = haList;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.label.toUpperCase();
                            var itemLabelB = b.label.toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            healthAreaId: '',
                            healthAreaList: listArray
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
            ProgramService.getUserListForProgram(this.props.match.params.dataSetId)
                .then(response => {
                    if (response.status == 200) {
                        let userList = response.data;
                        this.setState({
                            userList: userList,
                        }, () => {
                             this.buildJexcel();
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
     * Generates a health area code based on the selected health ID.
     * @param {Event} event - The change event containing the selected health area ID.
     */
    generateHealthAreaCode(value) {
        var healthAreaId = value;
        let healthAreaCode = ''
        for (var i = 0; i < healthAreaId.length; i++) {
            healthAreaCode += this.state.healthAreaList.filter(c => (c.value == healthAreaId[i].value))[0].healthAreaCode + "/";
        }
        this.setState({
            healthAreaCode: healthAreaCode.slice(0, -1)
        })
    }
    /**
     * Generates a organisation code based on the selected organisation ID.
     * @param {Event} event - The change event containing the selected organisation ID.
     */
    generateOrganisationCode(event) {
        let organisationCode = this.state.organisationList.filter(c => (c.id == event.target.value))[0].code;
        this.setState({
            organisationCode: organisationCode
        })
    }
    /**
     * Handles the change event for regions.
     * @param {Array} event - An array containing the selected region IDs.
     */
    updateFieldData(value) {
        let { program } = this.state;
        this.setState({ regionId: value });
        var regionId = value;
        var regionIdArray = [];
        for (var i = 0; i < regionId.length; i++) {
            regionIdArray[i] = regionId[i].value;
        }
        program.regionArray = regionIdArray;
        this.setState({ program: program, isChanged: true });
    }
    /**
     * Updates the health area field data in the component state.
     * Sets the selected health area ID in the component state and updates the program object with the selected health area IDs.
     * @param {array} value - An array containing the selected health area IDs.
     */
    updateFieldDataHealthArea(value) {
        let { program } = this.state;
        this.setState({ healthAreaId: value });
        var healthAreaId = value;
        var healthAreaIdArray = [];
        for (var i = 0; i < healthAreaId.length; i++) {
            healthAreaIdArray[i] = healthAreaId[i].value;
        }
        program.healthAreaArray = healthAreaIdArray;
        this.setState({ program: program, isChanged: true });
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { program } = this.state;
        if (event.target.name == "programName") {
            program.label.label_en = event.target.value;
        } if (event.target.name == "realmId") {
            program.realm.realmId = event.target.value;
        } if (event.target.name == 'realmCountryId') {
            program.realmCountry.realmCountryId = event.target.value;
        } if (event.target.name == 'organisationId') {
            program.organisation.id = event.target.value;
        }
        if (event.target.name == 'userId') {
            program.programManager.userId = event.target.value;
        }
        if (event.target.name === "active") {
            program.active = event.target.id === "active2" ? false : true
        }
        if (event.target.name == 'programCode1') {
            this.setState({
                uniqueCode: event.target.value
            })
        }
        else if (event.target.name == 'programNotes') {
            program.programNotes = event.target.value;
        }
        this.setState({ program, isChanged: true }, () => {
        })
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
    };
    /**
     * This function is used to build the table the access control
     */
  buildJexcel() {
    var varEL = "";
    let userList = this.state.userList;   
    userList.sort((a, b) => {
        var itemLabelA = a.userId;
        var itemLabelB = b.userId;
        return itemLabelA > itemLabelB ? 1 : -1;
    });
    let userListArr = [];
    var data = [];
    var count = 0;
    for (var j = 0; j < userList.length; j++) {
        data = [];
        data[0] = userList[j].username;
        data[1] = userList[j].orgAndCountry;
        data[2] = userList[j].roleList.map(a => getLabelText(a.label, this.state.lang)).toString().trim().replaceAll(',', ';');
        userListArr[count] = data;
        count++;
    }
    
    this.el = jexcel(document.getElementById("userListTableDiv"), "");
    jexcel.destroy(document.getElementById("userListTableDiv"), true);
    var data = userListArr;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      columns: [
        {
          title: i18n.t("static.user.username"),
          type: "text",
          readOnly: true
        },
        {
          title: i18n.t("static.user.orgAndCountry"),
          type: "text",
          readOnly: true
        },
        {
          title: i18n.t("static.role.role"),
          type: "text",
          readOnly: true
        }
      ],
      pagination: localStorage.getItem("sesRecordCount"),
      filters: true,
      search: true,
      columnSorting: true,
      editable: false,
      wordWrap: true,
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: "top",
      onload: this.loaded,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      copyCompatibility: true,
      parseFormulas: true,
      license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false
    };
    this.el = jexcel(document.getElementById("userListTableDiv"), options);
    varEL = this.el;
    this.setState({
     
    });
  }
    /**
     * Renders the edit forecast program screen.
     * @returns {JSX.Element} - Edit forecast program screen.
     */
    render() {
        const { programManagerList } = this.state;
        let programManagers = programManagerList.length > 0
            && programManagerList.map((item, i) => {
                return (
                    <option key={i} value={item.userId}>
                        {item.username}
                    </option>
                )
            }, this);
        const { organisationList } = this.state;
        let realmOrganisation = organisationList.length > 0
            && organisationList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} loading={this.changeLoading} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    programName: getLabelText(this.state.program.label, lang),
                                    realmId: this.state.program.realmCountry.realm.realmId,
                                    realmCountryId: this.state.program.realmCountry.realmCountryId,
                                    organisationId: this.state.program.organisation.id,
                                    userId: this.state.program.programManager.userId,
                                    healthAreaId: this.state.program.healthAreaArray,
                                    healthAreaArray: this.state.program.healthAreaArray,
                                    programNotes: this.state.program.programNotes,
                                    regionArray: this.state.program.regionArray,
                                    regionId: this.state.program.regionArray,
                                    programCode1: this.state.uniqueCode,
                                    programCode: this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    let pro = this.state.program;
                                    pro.programCode = this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode + (this.state.uniqueCode.toString().length > 0 ? ("-" + this.state.uniqueCode) : "");
                                    ProgramService.editDataset(pro).then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/dataSet/listDataSet/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode, loading: false
                                            },
                                                () => {
                                                    hideSecondComponent();
                                                })
                                        }
                                    }
                                    ).catch(
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
                                        setFieldValue,
                                        setFieldTouched
                                    }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='programForm' autocomplete="off">
                                            <CardBody>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.program.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        value={getLabelText(this.state.program.realmCountry.country.label, this.state.lang)}
                                                        bsSize="sm"
                                                        valid={!errors.realmCountryId}
                                                        invalid={touched.realmCountryId && !!errors.realmCountryId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        disabled
                                                        type="text" name="realmCountryId" id="realmCountryId">
                                                    </Input>
                                                    <FormFeedback>{errors.realmCountryId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.dashboard.healthareaheader')}<span class="red Reqasterisk">*</span></Label>
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.healthAreaId },
                                                            { 'is-invalid': (touched.healthAreaId && !!errors.healthAreaId || this.state.program.healthAreaArray.length == 0) }
                                                        )}
                                                        bsSize="sm"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("healthAreaId", e);
                                                            this.updateFieldDataHealthArea(e);
                                                            this.generateHealthAreaCode(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("healthAreaId", true)}
                                                        multi
                                                        options={this.state.healthAreaList}
                                                        value={this.state.program.healthAreaArray}
                                                        disabled={!AuthenticationService.checkUserACL([this.props.match.params.dataSetId.toString()], "ROLE_BF_UPDATE_TA_FOR_FP") ? true : false}
                                                        name="healthAreaId"
                                                        id="healthAreaId"
                                                    />
                                                    <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.program.organisation')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        valid={!errors.organisationId && this.state.program.organisation.id != ''}
                                                        invalid={touched.organisationId && !!errors.organisationId}
                                                        onBlur={handleBlur}
                                                        bsSize="sm"
                                                        type="select"
                                                        name="organisationId"
                                                        id="organisationId"
                                                        disabled={!AuthenticationService.checkUserACL([this.props.match.params.dataSetId.toString()], "ROLE_BF_UPDATE_ORG_FOR_FP") ? true : false}
                                                        value={this.state.program.organisation.id}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.generateOrganisationCode(e) }}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {realmOrganisation}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.organisationId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="Selectcontrol-bdrNone">
                                                    <Label htmlFor="select">{i18n.t('static.inventory.region')}<span class="red Reqasterisk">*</span></Label>
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.regionId },
                                                            { 'is-invalid': (touched.regionId && !!errors.regionId || this.state.program.regionArray.length == 0) }
                                                        )}
                                                        bsSize="sm"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("regionId", e);
                                                            this.updateFieldData(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("regionId", true)}
                                                        multi
                                                        disabled={true}
                                                        options={this.state.regionList}
                                                        value={this.state.program.regionArray}
                                                    />
                                                    <FormFeedback>{errors.regionId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="company">{i18n.t('static.dataset.forecastingProgram')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="text" name="programName" valid={!errors.programName}
                                                        bsSize="sm"
                                                        invalid={touched.programName && !!errors.programName || !!errors.programName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.program.label.label_en}
                                                        id="programName" />
                                                    <FormFeedback>{errors.programName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup style={{ display: 'flex' }}>
                                                    <Col xs="6" className="pl-0">
                                                        <FormGroup >
                                                            <Label htmlFor="company">{i18n.t('static.program.datasetDisplayName')}</Label>
                                                            <Input
                                                                type="text" name="programCode"
                                                                valid={!errors.programCode1 && this.state.uniqueCode != ''}
                                                                invalid={touched.programCode1 && !!errors.programCode1}
                                                                bsSize="sm"
                                                                disabled
                                                                value={this.state.realmCountryCode + "-" + this.state.healthAreaCode + "-" + this.state.organisationCode}
                                                                id="programCode" />
                                                            <FormFeedback className="red">{errors.programCode1}</FormFeedback>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col xs="1" className="" style={{ marginTop: '32px' }}>
                                                        <i class="fa fa-minus" aria-hidden="true"></i>
                                                    </Col>
                                                    <Col xs="5" className="pr-0">
                                                        <FormGroup className="pt-2">
                                                            <Label htmlFor="company"></Label>
                                                            <Input
                                                                onBlur={handleBlur}
                                                                bsSize="sm"
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                type="text"
                                                                maxLength={6}
                                                                value={this.state.uniqueCode}
                                                                disabled={!AuthenticationService.checkUserACL([this.props.match.params.dataSetId.toString()], "ROLE_BF_UPDATE_PC_FOR_FP") ? true : false}
                                                                name="programCode1" id="programCode1" />
                                                        </FormGroup>
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.program.programmanager')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        value={this.state.program.programManager.userId}
                                                        bsSize="sm"
                                                        valid={!errors.userId}
                                                        invalid={touched.userId && !!errors.userId || this.state.program.programManager.userId == ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur} type="select" name="userId" id="userId">
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {programManagers}
                                                    </Input>
                                                    <FormFeedback>{errors.userId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.program.notes')}</Label>
                                                    <Input
                                                        value={this.state.program.programNotes}
                                                        bsSize="sm"
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        type="textarea" name="programNotes" id="programNotes" />
                                                    <FormFeedback>{errors.programNotes}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label className="P-absltRadio">{i18n.t('static.common.status')}  </Label>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active1"
                                                            name="active"
                                                            value={true}
                                                            checked={this.state.program.active === true}
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
                                                            checked={this.state.program.active === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2">
                                                            {i18n.t('static.dataentry.inactive')}
                                                        </Label>
                                                    </FormGroup>
                                                </FormGroup>
                                            </CardBody>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                    {this.state.isChanged == true && <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>}
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                    &nbsp;
                                                </FormGroup>
                                            </CardFooter>
                                        </Form>
                                    )} />
                        </Card>
                    </Col>
                </Row>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardBody>
                                <div
                                    className=""
                                    style={{
                                        display: "block",
                                    }}
                                    >
                                    <div
                                        style={{ width: '100%' }}
                                        id="userListTableDiv"
                                        className="RowheightForjexceladdRow consumptionDataEntryTable"
                                    ></div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
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
        );
    }
    /**
     * Redirects to the list forecast program screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/dataSet/listDataSet/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the forecast program details when reset button is clicked.
     */
    resetClicked() {
        ProgramService.getDatasetById(this.props.match.params.dataSetId).then(response => {
            var programCode = response.data.programCode;
            var splitCode = programCode.split("-");
            var uniqueCode = splitCode[3];
            var realmCountryCode = splitCode[0];
            var healthAreaCode = splitCode[1];
            var organisationCode = splitCode[2];
            if (uniqueCode == undefined) {
                uniqueCode = ""
            }
            var proObj = response.data;
            this.setState({
                program: proObj,
                uniqueCode: uniqueCode,
                healthAreaCode: healthAreaCode,
                organisationCode: organisationCode,
                realmCountryCode: realmCountryCode,
                isChanged: false
            })
            initialValues = {
                programName: getLabelText(this.state.program.label, lang),
                realmId: this.state.program.realmCountry.realm.realmId,
                realmCountryId: this.state.program.realmCountry.realmCountryId,
                organisationId: this.state.program.organisation.id,
                userId: this.state.program.programManager.userId,
                healthAreaArray: this.state.program.healthAreaArray,
                programNotes: this.state.program.programNotes,
                regionArray: this.state.program.regionArray,
                uniqueCode: this.state.uniqueCode,
                healthAreaArray: this.state.program.healthAreaArray
            }
            ProgramService.getProgramManagerList(response.data.realmCountry.realm.realmId)
                .then(response => {
                    if (response.status == 200) {
                        this.setState({
                            programManagerList: response.data
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
            ProgramService.getRegionList(response.data.realmCountry.realmCountryId)
                .then(response => {
                    if (response.status == 200) {
                        var json = response.data;
                        var regList = [];
                        for (var i = 0; i < json.length; i++) {
                            regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lan) }
                        }
                        this.setState({
                            regionList: regList
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
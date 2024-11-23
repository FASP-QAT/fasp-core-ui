import jexcel from 'jspreadsheet';
import React from "react";
import {
    Button,
    Card, CardBody,
    CardFooter,
    Col,
    FormGroup,
    Row
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { changed, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { API_URL, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
import LabelsService from '../../api/LabelService.js';
import LanguageService from '../../api/LanguageService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const entityname = i18n.t('static.label.labelTranslations');
/**
 * This component is used to show and update static labels
 */
export default class DatabaseTranslations extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            changedFlag: [],
            labelList: [],
            rowId: 1,
            loading: true,
            color: ''
        }
        this.saveData = this.saveData.bind(this)
        this.cancelClicked = this.cancelClicked.bind(this);
        this.loaded = this.loaded.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to get language list and static labels and display in jexcel tabular format
     */
    componentDidMount() {
        LanguageService.getLanguageListActive().then(languageResponse => {
            if (languageResponse.status == 200) {
                LabelsService.getStaticLabelsList().then(response => {
                    if (response.status == 200) {
                        var json = response.data;
                        var languageList = languageResponse.data;
                        this.setState({
                            labelList: json,
                            languageList: languageList
                        })
                        var data = [];
                        var label = [];
                        for (var i = 0; i < json.length; i++) {
                            data = [];
                            data[0] = json[i].staticLabelId;
                            data[1] = json[i].labelCode;
                            data[2] = 0;
                            var k = 3;
                            for (var j = 0; j < languageList.length; j++) {
                                var languageDetails = json[i].staticLabelLanguages.filter(c => c.languageId == languageList[j].languageId);
                                if (languageDetails.length > 0) {
                                    data[k + j] = languageDetails[0].labelText;
                                } else {
                                    data[k + j] = "";
                                }
                            }
                            label[i] = data;
                        }
                        var colHeadersArray = [];
                        colHeadersArray.push({ type: 'hidden', title: `${i18n.t('static.translation.labelId')}` })
                        colHeadersArray.push({ type: 'text', readOnly: true, title: `${i18n.t('static.translation.labelId')}` })
                        colHeadersArray.push({ type: 'hidden', title: `${i18n.t('static.translation.isModified')}`, required: true })
                        for (var l = 0; l < languageList.length; l++) {
                            colHeadersArray.push({ type: 'text', title: languageList[l].label.label_en })
                        }
                        jexcel.destroy(document.getElementById("labelTranslationTable"), true);
                        var options = {
                            data: label,
                            colWidths: [80, 80, 80, 80, 80],
                            columns: colHeadersArray,
                            editable: true,
                            pagination: localStorage.getItem("sesRecordCount"),
                            search: true,
                            columnSorting: true,
                            wordWrap: true,
                            paginationOptions: JEXCEL_PAGINATION_OPTION,
                            allowInsertColumn: false,
                            allowManualInsertColumn: false,
                            onchange: this.changed,
                            oneditionstart: this.editStart,
                            allowDeleteRow: false,
                            onload: this.loaded,
                            filters: true,
                            license: JEXCEL_PRO_KEY,
                            contextMenu: function (obj, x, y, e) {
                                return false;
                            }.bind(this),
                        };
                        this.el = jexcel(document.getElementById("labelTranslationTable"), options);
                        this.setState({
                            loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            loading: false,
                            color: '#BA0C2F'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false,
                                color: '#BA0C2F'
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
                                        loading: false,
                                        color: '#BA0C2F'
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: '#BA0C2F'
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: '#BA0C2F'
                                    });
                                    break;
                            }
                        }
                    }
                );
            } else {
                this.setState({
                    message: languageResponse.data.messageCode,
                    loading: false,
                    color: '#BA0C2F'
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        loading: false,
                        color: '#BA0C2F'
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
                                loading: false,
                                color: '#BA0C2F'
                            });
                            break;
                        case 412:
                            this.setState({
                                message: error.response.data.messageCode,
                                loading: false,
                                color: '#BA0C2F'
                            });
                            break;
                        default:
                            this.setState({
                                message: 'static.unkownError',
                                loading: false,
                                color: '#BA0C2F'
                            });
                            break;
                    }
                }
            }
        );
    };
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[3].classList.add('AsteriskTheadtrTd');
    }
    /**
     * This function is called when submit button of the database translation is clicked and is used to save database translations if all the data is successfully validated.
     */
    saveData = function () {
        this.setState({
            loading: true
        })
        var labelList = this.state.labelList;
        var languageList = this.state.languageList;
        var tableJson = this.el.getJson(null, false);
        var listToUpdate = [];
        for (var j = 0; j < tableJson.length; j++) {
            if ((tableJson[j])[2] == 1) {
                var staticLabelJsonIndex = labelList.findIndex(c => c.staticLabelId == (tableJson[j])[0]);
                var staticLabelLanguagesList = [];
                var k = 3;
                for (var l = 0; l < languageList.length; l++) {
                    var staticLabelLanguageJson = {
                        labelText: (tableJson[j])[k + l],
                        languageId: languageList[l].languageId
                    }
                    staticLabelLanguagesList.push(staticLabelLanguageJson)
                }
                labelList[staticLabelJsonIndex].staticLabelLanguages = staticLabelLanguagesList;
                listToUpdate.push(labelList[staticLabelJsonIndex]);
            }
        }
        if (JSON.stringify(this.el.getComments()).length == 2 || this.el.getComments() == null) {
            LabelsService.saveStaticLabels(listToUpdate).then(response => {
                if (response.status == 200) {
                    let id = AuthenticationService.displayDashboardBasedOnRole();
                    this.setState({
                        message: i18n.t(response.data.messageCode),
                        color: 'green',
                        loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                } else {
                    this.setState({
                        message: response.data.messageCode,
                        loading: false,
                        color: '#BA0C2F'
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false,
                            color: '#BA0C2F'
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
                                    loading: false,
                                    color: '#BA0C2F'
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false,
                                    color: '#BA0C2F'
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false,
                                    color: '#BA0C2F'
                                });
                                break;
                        }
                    }
                }
            );
        } else {
            alert(`${i18n.t('static.label.validData')}`);
        }
    };
    /**
     * This is used to display the content
     * @returns The database translation data in tabular format
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                                <h5 style={{ color: this.state.color }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col xs="12" sm="12">
                        <Card>
                                                        <CardBody className="table-responsive pt-md-1 pb-md-1">
                                                                <div id="labelTranslationTable" style={{ display: this.state.loading ? "none" : "block" }}></div>
                                <Row style={{ display: this.state.loading ? "block" : "none" }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                        <div class="align-items-center">
                                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                            <div class="spinner-border blue ml-4" role="status">
                                            </div>
                                        </div>
                                    </div>
                                </Row>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => this.saveData()} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')} </Button>
                                    &nbsp;
                                </FormGroup>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
    /**
     * This function is called when cancel button is clicked and is redirected to application dashboard screen
     */
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * This function is called when something in the database translation table is changed to add the validations or fill some auto values for the cells
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    changed = function (instance, cell, x, y, value) {
        changed(instance, cell, x, y, value)
        if (x != 2) {
            this.el.setValueFromCoords(2, y, 1, true);
        }
    }.bind(this)
    /**
     * This function is used when the editing for a particular cell starts to format the cell or to update the value or to set some value in state
     * @param {*} instance This is the sheet where the data is being updated
     * @param {*} cell This is the value of the cell whose value is being updated
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    editStart = function (instance, cell, x, y, value) {
        var elInstance = instance;
        elInstance.setValueFromCoords(2, y, 1, true);
    }.bind(this)
}
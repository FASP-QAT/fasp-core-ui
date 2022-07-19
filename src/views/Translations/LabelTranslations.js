import React from "react";
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import "../ProductCategory/style.css"
import {
    Card, CardBody, CardHeader, FormGroup,
    CardFooter, Button, Col, Row
} from 'reactstrap';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import LabelsService from '../../api/LabelService.js';
import LanguageService from '../../api/LanguageService';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";

const entityname = i18n.t('static.label.labelTranslations');
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
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
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
                        console.log("json+++", json);
                        console.log("LanguageList+++", languageList);
                        var data = [];
                        var label = [];
                        for (var i = 0; i < json.length; i++) {
                            data = [];
                            data[0] = json[i].staticLabelId;// A
                            data[1] = json[i].labelCode;// A
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
                        colHeadersArray.push({ type: 'hidden', title: `${i18n.t('static.translation.isModified')}` })
                        for (var l = 0; l < languageList.length; l++) {
                            colHeadersArray.push({ type: 'text', title: languageList[l].label.label_en })
                        }
                        var options = {
                            data: label,
                            colWidths: [80, 80, 80, 80, 80],
                            columns: colHeadersArray,
                            // text: {
                            //     // showingPage: 'Showing {0} to {1} of {1}',
                            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                            //     show: '',
                            //     entries: '',
                            // },
                            editable: true,
                            pagination: localStorage.getItem("sesRecordCount"),
                            search: true,
                            columnSorting: true,
                            // tableOverflow: true,
                            wordWrap: true,
                            paginationOptions: JEXCEL_PAGINATION_OPTION,
                            allowInsertColumn: false,
                            allowManualInsertColumn: false,
                            onchange: this.changed,
                            oneditionstart: this.editStart,
                            allowDeleteRow: false,
                            // tableOverflow: false,
                            onload: this.loaded,
                            filters: true,
                            license: JEXCEL_PRO_KEY,
                            contextMenu: function (obj, x, y, e) {
                                return false;
                            }.bind(this),
                            // tableHeight: '500px',
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
                        console.log("Error+++", error)
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false,
                                color: '#BA0C2F'
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
                console.log("Error1+++", error)
                if (error.message === "Network Error") {
                    this.setState({
                        message: 'static.unkownError',
                        loading: false,
                        color: '#BA0C2F'
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

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);

        // var asterisk = document.getElementsByClassName("resizable")[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;

        var tr = asterisk.firstChild;
        tr.children[3].classList.add('AsteriskTheadtrTd');
    }

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
                console.log("changed------------------");
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
            // AuthenticationService.setupAxiosInterceptors();
            LabelsService.saveStaticLabels(listToUpdate).then(response => {
                if (response.status == 200) {
                    let id = AuthenticationService.displayDashboardBasedOnRole();
                    // this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t(response.data.messageCode))
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
                            message: 'static.unkownError',
                            loading: false,
                            color: '#BA0C2F'
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

    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                {/* <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5> */}
                <h5 style={{ color: this.state.color }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col xs="12" sm="12">
                        <Card>
                            {/* <CardHeader>

                                <strong>{i18n.t('static.label.labelTranslations')}</strong>
                            </CardHeader> */}
                            <CardBody className="table-responsive pt-md-1 pb-md-1">
                                {/* <div id="loader" className="center"></div> */}
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

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    changed = function (instance, cell, x, y, value) {
        console.log("changed function called----------------");
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setComments(col, `${i18n.t('static.label.fieldRequired')}`);
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        if (x != 2) {
            this.el.setValueFromCoords(2, y, 1, true);
        }
    }.bind(this)

    editStart = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        elInstance.setValueFromCoords(2, y, 1, true);
    }.bind(this)
}



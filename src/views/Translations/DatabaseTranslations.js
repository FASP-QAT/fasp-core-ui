import React from "react";
import jexcel from 'jspreadsheet-pro';
import "../../../node_modules/jspreadsheet-pro/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import "../ProductCategory/style.css"
import {
    Card, CardBody, CardHeader, FormGroup,
    CardFooter, Button, Col, Row
} from 'reactstrap';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import LabelsService from '../../api/LabelService.js';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";

const entityname = i18n.t('static.label.databaseTranslations');
export default class DatabaseTranslations extends React.Component {

    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            changedFlag: [],
            labelList: [],
            rowId: 1,
            loading: true
        }
        this.saveData = this.saveData.bind(this)
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        LabelsService.getDatabaseLabelsList().then(response => {
            if (response.status == 200) {
                var json = response.data;
                var data = [];
                var label = [];
                for (var i = 0; i < json.length; i++) {
                    data = [];
                    data[0] = json[i].labelId;// A
                    data[1] = `${i18n.t(json[i].labelFor)}`;//B
                    data[2] = json[i].label_en;//C
                    data[3] = json[i].label_fr;//D
                    data[4] = json[i].label_pr;//E
                    data[5] = json[i].label_sp;//F
                    label[i] = data;
                }
                var options = {
                    data: label,
                    colHeaders: [
                        `${i18n.t('static.translation.labelId')}`,
                        `${i18n.t('static.translation.labelFor')}`,
                        `${i18n.t('static.translation.english')}`,
                        `${i18n.t('static.translation.french')}`,
                        `${i18n.t('static.translation.pourtegese')}`,
                        `${i18n.t('static.translation.spanish')}`,
                    ],
                    colWidths: [80, 80, 80, 80, 80],
                    columns: [
                        { type: 'hidden' },
                        { type: 'text', readOnly: true }
                    ],
                    pagination: localStorage.getItem("sesRecordCount"),
                    search: true,
                    columnSorting: true,
                    tableOverflow: true,
                    wordWrap: true,
                    paginationOptions: JEXCEL_PAGINATION_OPTION,
                    position: 'top',
                    allowInsertColumn: false,
                    allowManualInsertColumn: false,
                    onchange: this.changed,
                    oneditionstart: this.editStart,
                    allowDeleteRow: false,
                    tableOverflow: false,
                    text: {
                        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                        show: '',
                        entries: '',
                    },
                    onload: this.loaded,
                    filters: true,
                    license: JEXCEL_PRO_KEY,
                    contextMenu: function (obj, x, y, e) {
                        return false;
                    }.bind(this),
                    // tableHeight: '500px',
                };
                this.el = jexcel(document.getElementById("databaseTranslationTable"), options);
                this.setState({
                    loading: false
                })
            } else {
                this.setState({
                    message: response.data.messageCode
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
    };

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        tr.children[3].classList.add('AsteriskTheadtrTd');
    }

    saveData = function () {
        var labelList = this.state.labelList;
        var tableJson = this.el.getRowData(this.state.rowId);
        var mapOfLastRow = new Map(Object.entries(tableJson))
        var jsonOfLastRow = {
            labelId: mapOfLastRow.get("0"),
            label_en: mapOfLastRow.get("2"),
            label_sp: mapOfLastRow.get("5"),
            label_fr: mapOfLastRow.get("3"),
            label_pr: mapOfLastRow.get("4")
        }
        labelList[this.state.rowId] = (JSON.stringify(jsonOfLastRow));
        this.setState({
            labelList: labelList
        })
        if (JSON.stringify(this.el.getComments()).length == 2 || this.el.getComments() == null) {
            // AuthenticationService.setupAxiosInterceptors();
            var json = this.state.labelList;
            LabelsService.saveDatabaseLabels(json).then(response => {
                if (response.status == 200) {
                    let id = AuthenticationService.displayDashboardBasedOnRole();
                    this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t(response.data.messageCode))
                } else {
                    this.setState({
                        message: response.data.messageCode
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
        } else {
            alert(`${i18n.t('static.label.validData')}`);
        }
    };

    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>

                    <Col xs="12" sm="12">
                        <Card>
                            {/* <CardHeader>
                                <strong>{i18n.t('static.label.databaseTranslations')}</strong>
                            </CardHeader> */}
                            <CardBody className="table-responsive pt-md-1 pb-md-1">
                                {/* <div id="loader" className="center"></div> */}
                                <div id="databaseTranslationTable" style={{ display: this.state.loading ? "none" : "block" }}>
                                </div>
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
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setComments(col, `${i18n.t('static.label.fieldRequired')}`);
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
            } else {
                this.el.setComments(col, "");
                this.el.setStyle(col, "background-color", "transparent");
            }
        } else if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            this.el.setStyle(col, "background-color", "transparent");
        } else if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            this.el.setStyle(col, "background-color", "transparent");
        } else if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            this.el.setStyle(col, "background-color", "transparent");
        }

        var labelList = this.state.labelList;
        var tableJson = this.el.getRowData(y);
        var map = new Map(Object.entries(tableJson))
        var json = {
            labelId: map.get("0"),
            label_en: map.get("2"),
            label_sp: map.get("5"),
            label_fr: map.get("3"),
            label_pr: map.get("4")
        }
        labelList[y] = (JSON.stringify(json));
        this.setState({
            labelList: labelList
        })
    }.bind(this)

    editStart = function (instance, cell, x, y, value) {
        this.setState({
            rowId: y
        })
    }.bind(this)

}

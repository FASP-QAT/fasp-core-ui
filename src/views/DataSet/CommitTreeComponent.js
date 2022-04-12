import React from "react";
import ReactDOM from 'react-dom';
import {
    Card, CardBody,
    FormFeedback,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalFooter, ModalBody, Row, Table, PopoverBody, Popover
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { DATE_FORMAT_CAP_WITHOUT_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, SECRET_KEY, PENDING_APPROVAL_VERSION_STATUS } from "../../Constants";
import i18n from '../../i18n';
import CryptoJS from 'crypto-js'
import getLabelText from "../../CommonComponent/getLabelText";
import jexcel from 'jexcel-pro';
import { DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import csvicon from '../../assets/img/csv.png';
import { Bar, Line, Pie } from 'react-chartjs-2';
import moment from "moment"
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import DatasetService from "../../api/DatasetService";
import CompareVersionTable from '../CompareVersion/CompareVersionTable.js';
import "../../../node_modules/react-step-progress-bar/styles.css"
import { ProgressBar, Step } from "react-step-progress-bar";
import ProgramService from "../../api/ProgramService";
import AuthenticationService from '../Common/AuthenticationService.js';
import jsPDF from 'jspdf';
import "jspdf-autotable";
import html2canvas from 'html2canvas';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from "../../CommonComponent/Logo";
import { buildJxl1, dataCheck } from '../DataSet/DataCheckComponent.js';
import { buildJxl } from '../DataSet/DataCheckComponent.js';
import { exportPDF, noForecastSelectedClicked, missingMonthsClicked, missingBranchesClicked, nodeWithPercentageChildrenClicked } from '../DataSet/DataCheckComponent.js';

const entityname = i18n.t('static.button.commit');
const initialValues = {
    notes: ''
}

const validationSchema = function (values, t) {
    return Yup.object().shape({
        notes: Yup.string()
            .matches(/^([a-zA-Z0-9\s,\./<>\?;':""[\]\\{}\|`~!@#\$%\^&\*()-_=\+]*)$/, i18n.t("static.label.validData"))
    })
}
const validate = (getValidationSchema) => {
    return (values) => {

        const validationSchema = getValidationSchema(values, i18n.t)
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

export default class CommitTreeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            programId: -1,
            programName: '',
            programList: [],
            showValidation: false,
            versionTypeId: -1,
            programDataLocal: '',
            programDataServer: '',
            programDataDownloaded: '',
            showCompare: false,
            forecastStartDate: '',
            forecastStopDate: '',
            notSelectedPlanningUnitList: [],
            lang: localStorage.getItem("lang"),
            treeScenarioList: [],
            childrenWithoutHundred: [],
            nodeWithPercentageChildren: [],
            consumptionListlessTwelve: [],
            missingMonthList: [],
            treeNodeList: [],
            treeScenarioNotes: [],
            missingBranchesList: [],
            noForecastSelectedList: [],
            datasetPlanningUnit: [],
            progressPer: 0,
            cardStatus: true,
            loading: true,
            treeScenarioListNotHaving100PerChild: []
        }
        this.synchronize = this.synchronize.bind(this);
        this.updateState = this.updateState.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    notesChange(event) {
        this.setState({
            notes: event.target.value
        })
    }

    touchAll(setTouched, errors) {
        setTouched({
            notes: true
        }
        );
        this.validateForm(errors);
    }
    validateForm(errors) {
        this.findFirstError('budgetForm', (fieldName) => {
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

    componentDidMount = function () {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: '#BA0C2F'
            })
            // this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['datasetData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('datasetData');
            var programRequest = programDataOs.getAll();
            programRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: '#BA0C2F'
                })
                // this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programList = [];
                var myResult = programRequest.result;
                for (var i = 0; i < myResult.length; i++) {
                    var datasetDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                    var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                    var datasetJson = JSON.parse(datasetData);
                    var programJson = {
                        name: datasetJson.programCode,
                        id: myResult[i].id,
                        version: datasetJson.currentVersion.versionId,
                        datasetJson: datasetJson
                    }
                    programList.push(programJson)
                }
                var programId = "";
                var event = {
                    target: {
                        value: ""
                    }
                };
                if (programList.length == 1) {
                    programId = programList[0].id;
                    event.target.value = programList[0].id;
                } else if (localStorage.getItem("sesDatasetId") != "" && programList.filter(c => c.id == localStorage.getItem("sesDatasetId")).length > 0) {
                    programId = localStorage.getItem("sesDatasetId");
                    event.target.value = localStorage.getItem("sesDatasetId");
                }
                programList = programList.sort(function (a, b) {
                    a = a.name.toLowerCase();
                    b = b.name.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                this.setState({
                    programList: programList,
                    loading: false,
                    programId: programId
                }, () => {
                    if (programId != "") {
                        this.setProgramId(event);
                    }
                })
            }.bind(this)
        }.bind(this)
    }

    setProgramId(e) {
        this.setState({
            loading: true,
            showCompare: false,
        })
        var programId = e.target.value;
        var myResult = [];
        myResult = this.state.programList;
        localStorage.setItem("sesDatasetId", programId);
        this.setState({
            programId: programId
        })

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: '#BA0C2F'
            })
            // this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['downloadedDatasetData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('downloadedDatasetData');
            var programRequest = programDataOs.get(programId);
            programRequest.onsuccess = function (e) {
                var myResult1 = programRequest.result;
                var datasetDataBytes = CryptoJS.AES.decrypt(myResult1.programData, SECRET_KEY);
                var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                var datasetJson = JSON.parse(datasetData);

                let programData = myResult.filter(c => (c.id == programId));
                this.setState({
                    programDataLocal: programData[0].datasetJson,
                    programCode: programData[0].datasetJson.programCode,
                    version: programData[0].version,
                    pageName: i18n.t('static.button.commit'),
                    programDataDownloaded: datasetJson,
                    programName: programData[0].datasetJson.programCode + '~v' + programData[0].version + ' (local)',
                    programNameOriginal: getLabelText(datasetJson.label, this.state.lang),
                    forecastStartDate: programData[0].datasetJson.currentVersion.forecastStartDate,
                    forecastStopDate: programData[0].datasetJson.currentVersion.forecastStopDate,
                    notes: programData[0].datasetJson.currentVersion.notes
                })

                var programVersionJson = [];
                var json = {
                    programId: programData[0].datasetJson.programId,
                    versionId: '-1'
                }
                programVersionJson = programVersionJson.concat([json]);
                DatasetService.getAllDatasetData(programVersionJson)
                    .then(response => {
                        this.setState({
                            programDataServer: response.data[0],
                            showCompare: true,
                            comparedLatestVersion: response.data[0].currentVersion.versionId
                        })
                    })
                dataCheck(this, programData[0].datasetJson)

            }.bind(this)
        }.bind(this)
    }


    updateState(parameterName, value) {
        console.log("ParameterName$$$", parameterName)
        console.log("Value$$$", value)
        this.setState({
            [parameterName]: value
        }, () => {
            if (parameterName == "treeScenarioList") {
                buildJxl1(this)
            }
            // if (parameterName == "treeScenarioListNotHaving100PerChild") {
            //     buildJxl(this)
            // }
        })
    }

    toggleShowValidation() {
        this.setState({
            showValidation: !this.state.showValidation
        }, () => {
            if (this.state.showValidation) {
                this.setState({
                }, () => {
                    buildJxl(this);
                })
            }
        })
    }

    setVersionTypeId(e) {
        var versionTypeId = e.target.value;
        this.setState({
            versionTypeId: versionTypeId
        })
    }

    redirectToDashbaord(commitRequestId) {
        this.setState({ loading: true });

        const sendGetRequest = async () => {
            try {
                AuthenticationService.setupAxiosInterceptors();
                const resp = await ProgramService.sendNotificationAsync(commitRequestId);
                var curUser = AuthenticationService.getLoggedInUserId();
                if (resp.data.createdBy.userId == curUser && resp.data.status == 2) {
                    this.setState({
                        progressPer: 75
                        , message: i18n.t('static.commitVersion.serverProcessingCompleted'), color: 'green'
                    }, () => {
                        this.hideFirstComponent();
                        this.getLatestProgram({ openModal: true, notificationDetails: resp.data });
                    })
                } else if (resp.data.createdBy.userId == curUser && resp.data.status == 3) {
                    var db1;
                    getDatabase();
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: 'red'
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var transaction = db1.transaction(['datasetDetails'], 'readwrite');
                        var program = transaction.objectStore('datasetDetails');
                        var getRequest = program.get((this.state.programId));
                        getRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                color: 'red'
                            })
                            this.hideFirstComponent()
                        }.bind(this);
                        getRequest.onsuccess = function (event) {
                            var myResult = [];
                            myResult = getRequest.result;
                            myResult.readonly = 0;
                            var transaction1 = db1.transaction(['datasetDetails'], 'readwrite');
                            var program1 = transaction1.objectStore('datasetDetails');
                            var getRequest1 = program1.put(myResult);
                            var message = i18n.t('static.commitTree.commitFailed').concat(" - ").concat(resp.data.failedReason).toString().replaceAll(":", " ");
                            getRequest1.onsuccess = function (e) {
                                this.setState({
                                    message: message,
                                    color: 'red',
                                    loading: false
                                })
                                this.hideFirstComponent()
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }
            } catch (err) {
                // Handle Error Here
                console.error("Error+++", err);
                this.setState({ loading: false });
            }
        };
        sendGetRequest();
    }

    getLatestProgram(notificationDetails) {
        this.setState({ loading: true });
        var updatedJson = [];
        var checkboxesChecked = [];
        var programIdsToSyncArray = [];
        var notificationArray = [];
        notificationArray.push(notificationDetails)
        var programIdsSuccessfullyCommitted = notificationArray;
        for (var i = 0; i < programIdsSuccessfullyCommitted.length; i++) {
            var index = checkboxesChecked.findIndex(c => c.programId == programIdsSuccessfullyCommitted[i].notificationDetails.program.id);
            if (index == -1) {
                checkboxesChecked.push({ programId: programIdsSuccessfullyCommitted[i].notificationDetails.program.id, versionId: -1 })
            }
        }
        DatasetService.getAllDatasetData(checkboxesChecked)
            .then(response => {
                var json = response.data;
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: '#BA0C2F'
                    })
                    // this.hideFirstComponent()
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;

                    var datasetDataTransaction = db1.transaction(['datasetData'], 'readwrite');
                    var datasetDataOs = datasetDataTransaction.objectStore('datasetData');
                    var datasetRequest = datasetDataOs.delete(this.state.programId);

                    datasetDataTransaction.oncomplete = function (event) {
                        var datasetDataTransaction1 = db1.transaction(['downloadedDatasetData'], 'readwrite');
                        var datasetDataOs1 = datasetDataTransaction1.objectStore('downloadedDatasetData');
                        var datasetRequest1 = datasetDataOs1.delete(this.state.programId);

                        datasetDataTransaction1.oncomplete = function (event) {

                            var datasetDataTransaction2 = db1.transaction(['datasetDetails'], 'readwrite');
                            var datasetDataOs2 = datasetDataTransaction2.objectStore('datasetDetails');
                            var datasetRequest2 = datasetDataOs2.delete(this.state.programId);

                            datasetDataTransaction2.oncomplete = function (event) {
                                // var programDataTransaction2 = db1.transaction(['downloadedDatasetData'], 'readwrite');
                                // programDataTransaction2.oncomplete = function (event) {

                                var transactionForSavingData = db1.transaction(['datasetData'], 'readwrite');
                                var programSaveData = transactionForSavingData.objectStore('datasetData');
                                for (var r = 0; r < json.length; r++) {
                                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                    // var version = json[r].requestedProgramVersion;
                                    // if (version == -1) {
                                    var version = json[r].currentVersion.versionId
                                    // }
                                    var item = {
                                        id: json[r].programId + "_v" + version + "_uId_" + userId,
                                        programId: json[r].programId,
                                        version: version,
                                        programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                        programData: (CryptoJS.AES.encrypt(JSON.stringify((json[r])), SECRET_KEY)).toString(),
                                        userId: userId,
                                        programCode: json[r].programCode
                                    };
                                    programIdsToSyncArray.push(json[r].programId + "_v" + version + "_uId_" + userId)
                                    var putRequest = programSaveData.put(item);

                                }
                                transactionForSavingData.oncomplete = function (event) {
                                    var transactionForSavingDownloadedProgramData = db1.transaction(['downloadedDatasetData'], 'readwrite');
                                    var downloadedProgramSaveData = transactionForSavingDownloadedProgramData.objectStore('downloadedDatasetData');
                                    for (var r = 0; r < json.length; r++) {
                                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                        // var version = json[r].requestedProgramVersion;
                                        // if (version == -1) {
                                        //     version = json[r].currentVersion.versionId
                                        // }
                                        var version = json[r].currentVersion.versionId
                                        var item = {
                                            id: json[r].programId + "_v" + version + "_uId_" + userId,
                                            programId: json[r].programId,
                                            version: version,
                                            programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                            programData: (CryptoJS.AES.encrypt(JSON.stringify((json[r])), SECRET_KEY)).toString(),
                                            userId: userId
                                        };
                                        var putRequest = downloadedProgramSaveData.put(item);

                                    }
                                    transactionForSavingDownloadedProgramData.oncomplete = function (event) {
                                        var programQPLDetailsTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                                        var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('datasetDetails');
                                        var programIds = []
                                        for (var r = 0; r < json.length; r++) {
                                            var programQPLDetailsJson = {
                                                id: json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId,
                                                programId: json[r].programId,
                                                version: json[r].currentVersion.versionId,
                                                userId: userId,
                                                programCode: json[r].programCode,
                                                changed: 0
                                            };
                                            var programQPLDetailsRequest = programQPLDetailsOs.put(programQPLDetailsJson);
                                        }
                                        programQPLDetailsTransaction.oncomplete = function (event) {
                                            this.setState({
                                                progressPer: 100,
                                                loading: false
                                            })
                                            this.goToMasterDataSync(programIdsToSyncArray);
                                        }.bind(this)
                                    }.bind(this)
                                }.bind(this);
                            }.bind(this);
                        }.bind(this);
                    }.bind(this);
                }.bind(this);
                // }.bind(this);
            })

    }

    goToMasterDataSync(programIds) {
        this.props.history.push({ pathname: `/syncProgram/green/` + i18n.t('static.message.commitSuccess'), state: { "programIds": programIds } });
    }


    synchronize() {
        this.setState({ showValidation: !this.state.showValidation }, () => {
            this.setState({
                loading: true,
            }, () => {
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var programDataTransaction = db1.transaction(['datasetData'], 'readwrite');
                    var programDataOs = programDataTransaction.objectStore('datasetData');
                    var programRequest = programDataOs.get((this.state.programId));
                    programRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        var programQPLDetailsTransaction1 = db1.transaction(['datasetDetails'], 'readwrite');
                        var programQPLDetailsOs1 = programQPLDetailsTransaction1.objectStore('datasetDetails');
                        var programQPLDetailsGetRequest = programQPLDetailsOs1.get((this.state.programId));
                        programQPLDetailsGetRequest.onsuccess = function (event) {
                            var programQPLDetails = programQPLDetailsGetRequest.result;
                            var datasetDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                            var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                            var datasetJson = JSON.parse(datasetData);
                            var programJson = datasetJson;
                            programJson.currentVersion.versionType = { id: document.getElementById("versionTypeId").value };
                            programJson.currentVersion.notes = document.getElementById("notes").value;;
                            console.log("ProgramJson+++", programJson);
                            console.log("this.state.comparedLatestVersion----", this.state.comparedLatestVersion);
                            //create saveDatasetData in ProgramService
                            DatasetService.saveDatasetData(programJson, this.state.comparedLatestVersion).then(response => {
                                if (response.status == 200) {
                                    var transactionForProgramQPLDetails = db1.transaction(['datasetDetails'], 'readwrite');
                                    var programQPLDetailSaveData = transactionForProgramQPLDetails.objectStore('datasetDetails');
                                    programQPLDetails.readonly = 1;
                                    var putRequest2 = programQPLDetailSaveData.put(programQPLDetails);
                                    localStorage.setItem("sesProgramId", "");
                                    this.setState({
                                        progressPer: 50
                                        , message: i18n.t('static.commitVersion.sendLocalToServerCompleted'), color: 'green'
                                    }, () => {
                                        this.hideFirstComponent();
                                        // getLatestProgram also copy , use getAllDatasetData instead getAllProgramData
                                        this.redirectToDashbaord(response.data);
                                    })
                                } else {
                                    this.setState({
                                        message: response.data.messageCode,
                                        color: "red",
                                        loading: false
                                    })
                                    this.hideFirstComponent();
                                }
                            })
                                .catch(
                                    error => {
                                        if (error.message === "Network Error") {
                                            this.setState({
                                                message: 'static.common.networkError',
                                                color: "red",
                                                loading: false
                                            }, () => {
                                                this.hideFirstComponent();
                                            });
                                        } else {
                                            switch (error.response ? error.response.status : "") {

                                                case 401:
                                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                                    break;
                                                case 403:
                                                    this.props.history.push(`/accessDenied`)
                                                    break;
                                                case 406:
                                                    if (error.response.data.messageCode == 'static.commitVersion.versionIsOutDated') {
                                                        alert(i18n.t("static.commitVersion.versionIsOutDated"));
                                                    }
                                                    this.setState({
                                                        message: error.response.data.messageCode,
                                                        color: "red",
                                                        loading: false
                                                    }, () => {
                                                        this.hideFirstComponent()
                                                        if (error.response.data.messageCode == 'static.commitVersion.versionIsOutDated') {
                                                            var event = {
                                                                target: {
                                                                    value: this.state.programId
                                                                }
                                                            };

                                                            this.setProgramId(event);
                                                        }
                                                    });
                                                    break;
                                                case 500:
                                                case 404:
                                                case 412:
                                                    this.setState({
                                                        message: error.response.data.messageCode,
                                                        loading: false,
                                                        color: "red"
                                                    }, () => {
                                                        this.hideFirstComponent()
                                                    });
                                                    break;
                                                default:
                                                    this.setState({
                                                        message: 'static.unkownError',
                                                        loading: false,
                                                        color: "red"
                                                    }, () => {
                                                        this.hideFirstComponent()
                                                    });
                                                    break;
                                            }
                                        }
                                    }
                                );
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            })
        })

    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    print() {
        this.setState({ loading: true })
        var tableName = document.getElementsByName("jxlTableData")
        for (var t = 0; t < tableName.length; t++) {
            tableName[t].classList.remove('consumptionDataEntryTable');
        }

        var content = document.getElementById("divcontents").innerHTML;
        const styleTags = Array.from(document.getElementsByTagName("style")).map(x => x.outerHTML).join("");
        var pri = document.getElementById("ifmcontentstoprint").contentWindow;
        pri.document.open();
        pri.document.write(content);
        pri.document.write(styleTags);
        pri.document.close();
        pri.focus();
        pri.print();

        for (var t = 0; t < tableName.length; t++) {
            tableName[t].classList.add('consumptionDataEntryTable');
        }


        // var content = document.getElementById("divcontents")
        // html2canvas(content)
        //     .then((canvas) => {
        //         const imgData = canvas.toDataURL('image/png');
        //         const pdf = new jsPDF();
        //         pdf.addImage(imgData, 'JPEG', 0, 0);
        //         // pdf.output('dataurlnewwindow');
        //         pdf.save("download.pdf");
        //     });
        this.setState({ loading: false })
    }

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }

    plusMinusClicked(treeId, scenarioId) {
        var index = this.state.treeScenarioList.findIndex(c => c.treeId == treeId && c.scenarioId == scenarioId);
        var treeScenarioList = this.state.treeScenarioList;
        treeScenarioList[index].checked = !treeScenarioList[index].checked;
        this.setState({
            treeScenarioList: treeScenarioList
        })

    }

    render() {
        const { programList } = this.state;
        let programs = programList.length > 0 && programList.map((item, i) => {
            return (
                <option key={i} value={item.id}>
                    {item.name}~v{item.version}
                </option>
            )
        }, this);

        //No forecast selected
        const { noForecastSelectedList } = this.state;
        let noForecastSelected = noForecastSelectedList.length > 0 ?
            noForecastSelectedList.map((item, i) => {
                return (
                    item.regionList.map(item1 => {
                        return (
                            <li key={i}>
                                <div className="hoverDiv" onClick={() => noForecastSelectedClicked(item.planningUnit.planningUnit.id, item1.id, this)}><span>{getLabelText(item.planningUnit.planningUnit.label, this.state.lang) + " - " + item1.label}</span></div>
                            </li>
                        )
                    }, this)
                )
            }, this) : <span>{i18n.t('static.forecastValidation.noMissingSelectedForecastFound')}</span>;

        //Consumption : missing months
        const { missingMonthList } = this.state;
        let missingMonths = missingMonthList.length > 0 ? missingMonthList.map((item, i) => {
            return (
                <li key={i}>
                    <div className="hoverDiv" onClick={() => missingMonthsClicked(item.planningUnitId, this)}><span>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + ": "}</span></div>{"" + item.monthsArray}
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMissingGaps')}</span>;

        //Consumption : planning unit less 12 month
        const { consumptionListlessTwelve } = this.state;
        let consumption = consumptionListlessTwelve.length > 0 ? consumptionListlessTwelve.map((item, i) => {
            return (
                <li key={i}>
                    <div className="hoverDiv" onClick={() => missingMonthsClicked(item.planningUnitId, this)}><span>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + ": "}</span></div><span>{item.noOfMonths + " month(s)"}</span>
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMonthsHaveLessData')}</span>;

        // Tree Forecast : planing unit missing on tree
        const { notSelectedPlanningUnitList } = this.state;
        let pu = (notSelectedPlanningUnitList.length > 0 && notSelectedPlanningUnitList.filter(c => c.regionsArray.length > 0).length > 0) ? notSelectedPlanningUnitList.filter(c => c.regionsArray.length > 0).map((item, i) => {
            return (
                <li key={i}>
                    <div>{getLabelText(item.planningUnit.label, this.state.lang) + " - " + item.regionsArray}</div>
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMissingPlanningUnitsFound')}</span>;

        // Tree Forecast : branches missing PU
        const { missingBranchesList } = this.state;
        let missingBranches = missingBranchesList.length > 0 ? missingBranchesList.map((item, i) => {
            return (
                <ul>
                    <li key={i}>
                        <div className="hoverDiv" onClick={() => missingBranchesClicked(item.treeId, this)}><span>{getLabelText(item.treeLabel, this.state.lang)}</span></div>
                        {item.flatList.length > 0 && item.flatList.map((item1, j) => {
                            return (
                                <ul>
                                    <li key={j}>
                                        <div><span>{getLabelText(item1.payload.label, this.state.lang) == "" ? i18n.t('static.forecastValidation.editMe') : getLabelText(item1.payload.label, this.state.lang)}</span></div>
                                    </li>
                                </ul>
                            )
                        }, this)}
                    </li>
                </ul>
            )
        }, this) : <ul><span>{i18n.t('static.forecastValidation.noBranchesMissingPU')}</span></ul>;

        //Nodes less than 100%
        let jxlTable = this.state.treeScenarioList.length > 0 && this.state.treeScenarioListNotHaving100PerChild.length > 0 ? this.state.treeScenarioList.map((item1, count) => {
            if (this.state.treeScenarioListNotHaving100PerChild.filter(c => c.treeId == item1.treeId && c.scenarioId == item1.scenarioId).length > 0) {
                var nodeWithPercentageChildren = this.state.nodeWithPercentageChildren.filter(c => c.treeId == item1.treeId && c.scenarioId == item1.scenarioId);
                if (nodeWithPercentageChildren.length > 0) {
                    return (<><span className="hoverDiv" onClick={() => nodeWithPercentageChildrenClicked(item1.treeId, item1.scenarioId, this)}><span>{getLabelText(item1.treeLabel, this.state.lang) + " / " + getLabelText(item1.scenarioLabel, this.state.lang)}</span></span><span className="hoverDiv" onClick={() => this.plusMinusClicked(item1.treeId, item1.scenarioId)}>{item1.checked ? <i className="fa fa-minus treeValidation" ></i> : <i className="fa fa-plus  treeValidation" ></i>}</span><div className="table-responsive">
                        <div id={"tableDiv" + count} className="jexcelremoveReadonlybackground consumptionDataEntryTable" name='jxlTableData' style={{ display: item1.checked ? "block" : "none" }} />
                    </div><br /></>)
                }
            }
        }, this) : <ul><span>{i18n.t('static.forecastValidation.noNodesHaveChildrenLessThanPerc')}</span><br /></ul>

        //Consumption Notes
        const { datasetPlanningUnit } = this.state;
        let consumtionNotes = (datasetPlanningUnit.length > 0 && datasetPlanningUnit.filter(c => c.consuptionForecast.toString() == "true").length > 0) ? datasetPlanningUnit.filter(c => c.consuptionForecast.toString() == "true").map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => missingMonthsClicked(item.planningUnit.id, this)}>
                    <td>{getLabelText(item.planningUnit.label, this.state.lang)}</td>
                    <td>{item.consumptionNotes}</td>
                </tr>
            )
        }, this) : <span>&emsp;&emsp;&emsp;&ensp;{i18n.t('static.forecastValidation.noConsumptionNotesFound')}</span>;

        //Tree scenario Notes
        const { treeScenarioNotes } = this.state;
        let scenarioNotes = treeScenarioNotes.length > 0 ? treeScenarioNotes.map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => nodeWithPercentageChildrenClicked(item.treeId, item.scenarioId, this)}>
                    <td>{getLabelText(item.tree, this.state.lang)}</td>
                    <td>{getLabelText(item.scenario, this.state.lang)}</td>
                    <td>{item.treeNotes}</td>
                    <td>{item.scenarioNotes}</td>
                </tr>
            )
        }, this) : <span>&emsp;&emsp;&emsp;&ensp;{i18n.t('static.forecastValidation.noTreeScenarioNotesFound')}</span>;

        //Tree Nodes Notes
        const { treeNodeList } = this.state;
        let treeNodes = treeNodeList.length > 0 && treeNodeList.filter(c => (c.notes != null && c.notes != "") || (c.madelingNotes != null && c.madelingNotes != "")).length > 0 ? treeNodeList.filter(c => (c.notes != null && c.notes != "") || (c.madelingNotes != null && c.madelingNotes != "")).map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => nodeWithPercentageChildrenClicked(item.treeId, item.scenarioId, this)}>
                    <td>{getLabelText(item.tree, this.state.lang)}</td>
                    <td>{getLabelText(item.node, this.state.lang)}</td>
                    <td>{getLabelText(item.scenario, this.state.lang)}</td>
                    <td><b>{(item.notes != "" && item.notes != null) ? i18n.t('static.commitTree.main') + ": " : ""}</b> {(item.notes != "" && item.notes != null) ? item.notes : ""}
                        <b>{(item.madelingNotes != "" && item.madelingNotes != null) ? i18n.t('static.commitTree.modeling') + ": " : ""}</b> {(item.madelingNotes != "" && item.madelingNotes != null) ? item.madelingNotes : ""}</td>
                </tr>
            )
        }, this) : <span>&emsp;&emsp;&emsp;&ensp;{i18n.t('static.forecastValidation.noTreeNodesNotesFound')}</span>;



        return (
            <div className="animated fadeIn" >
                <h5 id="div1" className={this.state.color}>{i18n.t(this.state.message, { entityname })}</h5>
                {(this.state.cardStatus) &&
                    <Card id="noniframe">
                        <CardBody>
                            <ProgressBar
                                percent={this.state.progressPer}
                                filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
                                style={{ width: '75%' }}
                            >
                                <Step transition="scale">
                                    {({ accomplished }) => (

                                        <img
                                            style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                            width="30"
                                            src="../../../../public/assets/img/numbers/number1.png"
                                        />
                                    )}

                                </Step>

                                <Step transition="scale">
                                    {({ accomplished }) => (
                                        <img
                                            style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                            width="30"
                                            src="../../../../public/assets/img/numbers/number2.png"
                                        />
                                    )}
                                </Step>
                                <Step transition="scale">
                                    {({ accomplished }) => (
                                        <img
                                            style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                            width="30"
                                            src="../../../../public/assets/img/numbers/number3.png"
                                        />
                                    )}

                                </Step>

                                <Step transition="scale">
                                    {({ accomplished }) => (
                                        <img
                                            style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                            width="30"
                                            src="../../../../public/assets/img/numbers/number4.png"
                                        />
                                    )}

                                </Step>

                                <Step transition="scale">
                                    {({ accomplished }) => (
                                        <img
                                            style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                            width="30"
                                            src="../../../../public/assets/img/numbers/number5.png"
                                        />
                                    )}

                                </Step>
                            </ProgressBar>
                            <div className="d-sm-down-none  progressbar">
                                <ul>
                                    <li className="quantimedProgressbartext1">{i18n.t('static.commitVersion.compareData')}</li>
                                    <li className="quantimedProgressbartext2">{i18n.t('static.commitVersion.resolveConflicts')}</li>
                                    <li className="quantimedProgressbartext3">{i18n.t('static.commitVersion.sendingDataToServer')}</li>
                                    <li className="quantimedProgressbartext4">{i18n.t('static.commitTree.serverProcessing')}</li>
                                    <li className="quantimedProgressbartext5">{i18n.t('static.commitVersion.upgradeLocalToLatest')}</li>
                                </ul>
                            </div>
                            <Form name='simpleForm'>
                                <div className=" pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3 ">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.programheader')}</Label>
                                            <div className="controls ">
                                                <Input
                                                    type="select"
                                                    name="programId"
                                                    id="programId"
                                                    bsSize="sm"
                                                    value={this.state.programId}
                                                    onChange={(e) => { this.setProgramId(e); }}
                                                >
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {programs}
                                                </Input>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </div>
                            </Form>
                            <b><div className="mb-2"> <span>{i18n.t('static.commitTree.note')}</span></div></b>
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                {(this.state.showCompare) &&
                                    <>
                                        <div className="col-md-10 pt-lg-1 pb-lg-0 pl-lg-0">
                                            <ul className="legendcommitversion">
                                                {/* <li><span className="lightpinklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.conflicts')}</span></li> */}
                                                <li><span className=" greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')} </span></li>
                                                <li><span className="notawesome legendcolor"></span > <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
                                            </ul>
                                        </div>
                                        <CompareVersionTable ref="conflictChild" page="commit" datasetData={this.state.programDataLocal} datasetData1={this.state.programDataServer} datasetData2={this.state.programDataDownloaded} versionLabel={"V" + this.state.programDataLocal.currentVersion.versionId + "(Local)"} versionLabel1={"V" + this.state.programDataServer.currentVersion.versionId + "(Server)"} updateState={this.updateState} />
                                        <div className='ForecastSummaryTable'>
                                            <div className="table-responsive RemoveStriped commitversionTable CommitTableMarginTop consumptionDataEntryTable">
                                                <div id="tableDiv" />
                                            </div>
                                        </div>
                                    </>
                                }

                                {/* <div className="col-md-12">
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.reset}><i className="fa fa-refresh"></i> Cancel</Button>
                                <Button type="button" color="success" className="mr-1 float-right" size="md" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-check"></i>Next</Button>
                            </div> */}

                                <div>
                                    <Formik
                                        initialValues={initialValues}
                                        validate={validate(validationSchema)}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {
                                            this.toggleShowValidation()
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
                                                setFieldTouched,
                                                setFieldError
                                            }) => (
                                                <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='budgetForm' autocomplete="off">
                                                    <div className="row">
                                                        <FormGroup className="col-md-4">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.versiontype')}</Label>
                                                            <div className="controls ">
                                                                <Input
                                                                    type="select"
                                                                    name="versionTypeId"
                                                                    id="versionTypeId"
                                                                    bsSize="sm"
                                                                    value={this.state.versionTypeId}
                                                                    onChange={(e) => { this.setVersionTypeId(e); }}
                                                                >
                                                                    <option value="1">{i18n.t('static.commitTree.draftVersion')}</option>
                                                                    <option value="2">{i18n.t('static.commitTree.finalVersion')}</option>
                                                                </Input>
                                                            </div>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.program.notes')}</Label>
                                                            <Input
                                                                className="controls"
                                                                type="textarea"
                                                                id="notes"
                                                                name="notes"
                                                                valid={!errors.notes && this.state.notes != ''}
                                                                invalid={touched.notes && !!errors.notes}
                                                                onChange={(e) => { handleChange(e); this.notesChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={this.state.notes}

                                                            />
                                                            <FormFeedback className="red">{errors.notes}</FormFeedback>
                                                        </FormGroup>

                                                        <div className="col-md-12">
                                                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.cancel')}</Button>
                                                            {/* <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.synchronize}><i className="fa fa-check"></i>Commit</Button> */}
                                                            <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.button.commit')}</Button>
                                                        </div>
                                                    </div>
                                                </Form>
                                            )} />
                                </div>
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                        <div class="spinner-border blue ml-4" role="status">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                }
                <iframe id="ifmcontentstoprint" style={{ height: '0px', width: '0px', position: 'absolute' }}></iframe>
                <Modal isOpen={this.state.showValidation}
                    className={'modal-lg ' + this.props.className} id='divcontents'>
                    {/* <ModalHeader toggle={() => this.toggleShowValidation()} className="modalHeaderSupplyPlan">
                        <h3 style={{textAlign:'left'}}><strong>{i18n.t('static.commitTree.forecastValidation')}</strong><i className="fa fa-print pull-right iconClass cursor" onClick={() => this.print()}></i></h3>
                    </ModalHeader> */}
                    <ModalHeader toggle={() => this.toggleShowValidation()} className="modalHeaderSupplyPlan">
                        <div>
                            <img className=" pull-right iconClass cursor ml-lg-2" style={{ height: '22px', width: '22px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => exportPDF(this)} />
                            {/* <i className="fa fa-print pull-right iconClassCommit cursor" onClick={() => this.print()}></i> */}
                            <h3><strong>{i18n.t('static.commitTree.forecastValidation')}</strong></h3>
                        </div>
                    </ModalHeader>
                    <div>
                        <ModalBody className="VersionSettingMode">
                            <span><b>{this.state.programName}</b></span><br />
                            <span><b>{i18n.t('static.common.forecastPeriod')}: </b> {moment(this.state.forecastStartDate).format('MMM-YYYY')} to {moment(this.state.forecastStopDate).format('MMM-YYYY')} </span><br /><br />

                            <span><b>1. {i18n.t('static.commitTree.noForecastSelected')}: </b>(<a href="/#/report/compareAndSelectScenario" target="_blank">{i18n.t('static.commitTree.compare&Select')}</a>, <a href={this.state.programId != -1 && this.state.programId != "" && this.state.programId != undefined ? "/#/forecastReport/forecastSummary/" + this.state.programId.toString().split("_")[0] + "/" + (this.state.programId.toString().split("_")[1]).toString().substring(1) : "/#/forecastReport/forecastSummary/"} target="_blank">{i18n.t('static.commitTree.forecastSummary')}</a>)</span><br />
                            <ul>{noForecastSelected}</ul>

                            <span><b>2. {i18n.t('static.commitTree.consumptionForecast')}: </b>(<a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank">{i18n.t('static.commitTree.dataEntry&Adjustment')}</a>, <a href="/#/extrapolation/extrapolateData" target="_blank">{i18n.t('static.commitTree.extrapolation')}</a>)</span><br />
                            <span>a. {i18n.t('static.commitTree.monthsMissingActualConsumptionValues')}:</span><br />
                            <ul>{missingMonths}</ul>
                            <span>b. {i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues')}:</span><br />
                            <ul>{consumption}</ul>

                            <span><b>3. {i18n.t('static.commitTree.treeForecast')}: </b>(<a href={"/#/dataSet/buildTree/tree/0/" + this.state.programId} target="_blank">{i18n.t('static.common.managetree')}</a>)</span><br />
                            <span>a. {i18n.t('static.commitTree.puThatDoesNotAppearOnAnyTree')}: </span><br />
                            <ul>{pu}</ul>

                            <span>b. {i18n.t('static.commitTree.branchesMissingPlanningUnit')}:</span><br />
                            {missingBranches}

                            <span>c. {i18n.t('static.commitTree.NodesWithChildrenThatDoNotAddUpTo100Prcnt')}:</span><br />
                            {jxlTable}


                            <span><b>4. {i18n.t('static.program.notes')}:</b></span><br />

                            <span>a. {i18n.t('static.forecastMethod.historicalData')}:</span>
                            <div className="">
                                {(datasetPlanningUnit.length > 0 && datasetPlanningUnit.filter(c => c.consuptionForecast.toString() == "true").length > 0) ? <div className="table-wrap table-responsive fixTableHead">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table table-striped1" bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th style={{ width: '30%' }}><b>{i18n.t('static.dashboard.planningunitheader')}</b></th>
                                                <th style={{ width: '80%' }}><b>{i18n.t('static.program.notes')}</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{consumtionNotes}</tbody>
                                    </Table>
                                </div> : <span>{consumtionNotes}</span>}
                            </div><br />
                            <span>b. {i18n.t('static.commitTree.treeScenarios')}:</span>
                            <div className="">
                                {treeScenarioNotes.length > 0 ? <div className="table-wrap table-responsive fixTableHead">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table table-striped1" bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th style={{ width: '15%' }}><b>{i18n.t('static.forecastMethod.tree')}</b></th>
                                                <th style={{ width: '15%' }}><b>{i18n.t('static.whatIf.scenario')}</b></th>
                                                <th style={{ width: '35%' }}><b>{i18n.t('static.dataValidation.treeNotes')}</b></th>
                                                <th style={{ width: '35%' }}><b>{i18n.t('static.dataValidation.scenarioNotes')}</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{scenarioNotes}</tbody>
                                    </Table>
                                </div> : <span>{scenarioNotes}</span>}
                            </div><br />
                            <span>c. {i18n.t('static.commitTree.treeNodes')}:</span>
                            {/* <div className="table-scroll"> */}
                            <div className="">
                                {treeNodeList.length > 0 && treeNodeList.filter(c => (c.notes != null && c.notes != "") || (c.madelingNotes != null && c.madelingNotes != "")).length > 0 ? <div className="table-wrap table-responsive fixTableHead">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table table-striped1" bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th><b>{i18n.t('static.forecastMethod.tree')}</b></th>
                                                <th><b>{i18n.t('static.common.node')}</b></th>
                                                <th><b>{i18n.t('static.whatIf.scenario')}</b></th>
                                                <th><b>{i18n.t('static.program.notes')}</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{treeNodes}</tbody>
                                    </Table>
                                </div> : <span>{treeNodes}</span>}
                            </div>
                            {/* <div className="col-md-12 pb-lg-5 pt-lg-3">
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.synchronize}><i className="fa fa-check"></i>{i18n.t('static.report.ok')}</Button>
                            </div> */}
                        </ModalBody>
                        <div className="col-md-12 pb-lg-5 pt-lg-3">
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.synchronize}><i className="fa fa-check"></i>{i18n.t('static.report.ok')}</Button>
                        </div>
                    </div>
                </Modal >
            </div >
        )
    }
}
import React, { Component, lazy, Suspense } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Row
} from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService.js';
import CountryService from "../../api/CountryService"
import HealthAreaService from "../../api/HealthAreaService"
import ProgramService from "../../api/ProgramService"
import getLabelText from '../../CommonComponent/getLabelText'
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import i18n from '../../i18n';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';

class Program extends Component {

    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
        this.downloadClicked = this.downloadClicked.bind(this);
        this.state = {
            dropdownOpen: false,
            radioSelected: 2,
            countryList: [],
            healthAreaList: [],
            prgList: [],
            versionList: [{ id: 1, name: "v1.1", programId: 1 }, { id: 2, name: "v1.2", programId: 1 }, { id: 3, name: "v1.1", programId: 2 }, { id: 4, name: "v1.2", programId: 3 }],
            lang: localStorage.getItem('lang'),
        };
    }

    componentDidMount() {

        AuthenticationService.setupAxiosInterceptors();
        CountryService.getCountryListActive()
            .then(response => {
                if (response.status == 200) {
                    console.log("RealmCountry", response.data)
                    this.setState({
                        countryList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }).catch(
                error => {
                    console.log("Catch error", error)
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
        HealthAreaService.getHealthAreaList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        healthAreaList: response.data
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

        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    console.log("Response--------------->", response.data)
                    this.setState({
                        prgList: response.data
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


    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
        });
    }

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected,
        });
    }

    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" sm="12">
                        <Card>
                            <CardHeader>
                                <strong>Program</strong>
                            </CardHeader>
                            <CardBody>
                                <div className="table-responsive">
                                    <ul className="tree">
                                        <li>
                                            <input type="checkbox" id="c1" />
                                            <label className="tree_label" htmlFor="c1">Program</label>
                                            <ul>
                                                {
                                                    this.state.countryList.map(item => (
                                                        <li>
                                                            <input type="checkbox" defaultChecked id={"c1-".concat(item.countryId)} />
                                                            <label htmlFor={"c1-".concat(item.countryId)} className="tree_label">{getLabelText(item.label, this.state.lang)}</label>
                                                            <ul>
                                                                {
                                                                    this.state.healthAreaList.map(item1 => (
                                                                        <li>
                                                                            <input type="checkbox" defaultChecked id={"c1-".concat(item.countryId).concat(item1.healthAreaId)} />
                                                                            <label htmlFor={"c1-".concat(item.countryId).concat(item1.healthAreaId)} className="tree_label">{getLabelText(item1.label, this.state.lang)}</label>
                                                                            <ul>
                                                                                {
                                                                                    this.state.prgList.filter(c => c.realmCountry.country.countryId == item.countryId).filter(c => c.healthArea.id == item1.healthAreaId).map(item2 => (
                                                                                        <li>
                                                                                            <span className="tree_label">
                                                                                                <span className="">
                                                                                                    <div className="checkbox m-0">
                                                                                                        <input type="checkbox" name="programCheckBox" value={item2.programId} id={"checkbox_".concat(item.countryId).concat(item1.healthAreaId).concat(item2.programId).concat(".0")} />
                                                                                                        <label htmlFor={"checkbox_".concat(item.countryId).concat(item1.healthAreaId).concat(item2.programId).concat(".0")}>{getLabelText(item2.label, this.state.lang)}<i className="ml-1 fa fa-eye"></i></label>
                                                                                                    </div>
                                                                                                </span>
                                                                                            </span>
                                                                                            <input type="checkbox" defaultChecked id={"fpm".concat(item.countryId).concat(item1.healthAreaId).concat(item2.programId)} />
                                                                                            <label className="arrow_label" htmlFor={"fpm".concat(item.countryId).concat(item1.healthAreaId).concat(item2.programId)}></label>
                                                                                            <ul>
                                                                                                {
                                                                                                    this.state.prgList.filter(c => c.programId == item2.programId).map(item3 => (
                                                                                                        (item3.versionList).map(item4 => (

                                                                                                            <li><span className="tree_label">
                                                                                                                <span className="">
                                                                                                                    <div className="checkbox m-0">
                                                                                                                        <input type="checkbox" value={item4.versionId} name={"versionCheckBox".concat(item2.programId)} id={"kf-v".concat(item.countryId).concat(item1.healthAreaId).concat(item2.programId).concat(item4.versionId)} />
                                                                                                                        <label htmlFor={"kf-v".concat(item.countryId).concat(item1.healthAreaId).concat(item2.programId).concat(item4.versionId)}>{"V~".concat(item4.versionId)}</label>
                                                                                                                    </div>
                                                                                                                </span>
                                                                                                            </span>
                                                                                                            </li>

                                                                                                        ))
                                                                                                    ))}
                                                                                            </ul>
                                                                                        </li>

                                                                                    ))}
                                                                            </ul>
                                                                        </li>

                                                                    ))}
                                                            </ul>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </CardBody>
                            <CardFooter>
                                <Button type="submit" size="md" color="success"><i className="fa fa-dot-circle-o"></i> Import</Button>
                                <Button className="ml-1" type="reset" size="md" color="danger"><i className="fa fa-dot-circle-o"></i> Export</Button>
                                <button className="btn btn-outline-secondary float-right" type="file" onClick={this.downloadClicked}><i className="fa fa-lightbulb-o"></i>&nbsp;Download</button>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>


            </div>
        );
    }

    downloadClicked() {
        var programCheckboxes = document.getElementsByName("programCheckBox");
        var checkboxesChecked = [];
        var programCheckedCount = 0;
        var programInvalidCheckedCount = 0;
        // loop over them all
        for (var i = 0; i < programCheckboxes.length; i++) {
            // And stick the checked ones onto an array...
            if (programCheckboxes[i].checked) {
                programCheckedCount = programCheckedCount + 1;
                console.log("ProgramVersionedCheckedIf", programCheckboxes[i].value)
                var versionCheckboxes = document.getElementsByName("versionCheckBox".concat(programCheckboxes[i].value));
                // loop over them all
                console.log("VersionCheckboxes", versionCheckboxes.length)
                if (versionCheckboxes.length > 0) {
                    var count = 0;
                    for (var j = 0; j < versionCheckboxes.length; j++) {
                        // And stick the checked ones onto an array...
                        if (versionCheckboxes[j].checked) {
                            count = count + 1;
                            var json = {
                                programId: programCheckboxes[i].value,
                                versionId: versionCheckboxes[j].value
                            }
                            checkboxesChecked.push(json);
                        }

                    }
                    if (count == 0) {
                        var json = {
                            programId: programCheckboxes[i].value,
                            versionId: -1
                        }
                        checkboxesChecked.push(json);
                    }

                }
            } else {
                var versionCheckboxes = document.getElementsByName("versionCheckBox".concat(programCheckboxes[i].value));
                // loop over them all
                console.log("VersionCheckboxes", versionCheckboxes.length)
                if (versionCheckboxes.length > 0) {
                    var count = 0;
                    for (var j = 0; j < versionCheckboxes.length; j++) {
                        // And stick the checked ones onto an array...
                        if (versionCheckboxes[j].checked) {
                            count = count + 1;
                        }
                    }
                    if (count > 0) {
                        programInvalidCheckedCount = programInvalidCheckedCount + 1;
                    }
                }
            }
        }
        if (programCheckedCount == 0) {
            alert("Please select atleast one program for download.")
        } else if (programInvalidCheckedCount > 0) {
            alert("Please select program if you are selecting version.")

        } else {
            console.log("Checl boxes checked array", checkboxesChecked)
            console.log("APi call will go here")
            for (var program = 0; program < checkboxesChecked.length; program++) {
                console.log("Program", program)
                console.log("CheckboxCheced", (checkboxesChecked[program]).versionId)
                var version = (checkboxesChecked[program]).versionId;
                if (navigator.onLine) {
                    AuthenticationService.setupAxiosInterceptors();
                    ProgramService.getProgramData(checkboxesChecked[program])
                        .then(response => {
                            var json = response.data;
                            console.log("Program json",json)
                            if (version == -1) {
                                version = json.currentVersion.versionId
                            }
                            console.log("Version",version);
                            console.log("Json", json);
                            console.log("Json length", json.length)
                            var db1;
                            getDatabase();
                            var openRequest = indexedDB.open('fasp', 1);
                            openRequest.onsuccess = function (e) {
                                console.log("in success");
                                db1 = e.target.result;
                                var transaction = db1.transaction(['programData'], 'readwrite');
                                var program = transaction.objectStore('programData');
                                var count = 0;
                                var getRequest = program.getAll();
                                getRequest.onerror = function (event) {
                                    // Handle errors!
                                };
                                getRequest.onsuccess = function (event) {
                                    var myResult = [];
                                    myResult = getRequest.result;
                                    for (var i = 0; i < myResult.length; i++) {
                                        // for (var j = 0; j < json.length; j++) {
                                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                        if (myResult[i].id == json.programId + "_v" + version + "_uId_" + userId) {
                                            count++;
                                        }
                                        // }
                                        console.log("count", count)
                                    }
                                    if (count == 0) {
                                        db1 = e.target.result;
                                        var transactionForSavingData = db1.transaction(['programData'], 'readwrite');
                                        var programSaveData = transactionForSavingData.objectStore('programData');
                                        // for (var i = 0; i < json.length; i++) {
                                        var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json), SECRET_KEY);
                                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                        var item = {
                                            id: json.programId + "_v" + version + "_uId_" + userId,
                                            programId: json.programId,
                                            version: version,
                                            programName: (CryptoJS.AES.encrypt(JSON.stringify((json.label)), SECRET_KEY)).toString(),
                                            programData: encryptedText.toString(),
                                            userId: userId
                                        };
                                        var putRequest = programSaveData.put(item);
                                        putRequest.onerror = function (error) {
                                            this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                        }.bind(this);
                                        // }
                                        transactionForSavingData.oncomplete = function (event) {
                                            console.log("in transaction complete")
                                            this.props.history.push(`/dashboard/` + i18n.t('static.program.downloadsuccess'))
                                        }.bind(this);
                                        transactionForSavingData.onerror = function (event) {
                                            this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                        }.bind(this);
                                        programSaveData.onerror = function (event) {
                                            this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                        }.bind(this)
                                    } else {
                                        confirmAlert({
                                            title: i18n.t('static.program.confirmsubmit'),
                                            message: i18n.t('static.program.programwithsameversion'),
                                            buttons: [
                                                {
                                                    label: i18n.t('static.program.yes'),
                                                    onClick: () => {
                                                        db1 = e.target.result;
                                                        var transactionForOverwrite = db1.transaction(['programData'], 'readwrite');
                                                        var programOverWrite = transactionForOverwrite.objectStore('programData');
                                                        // for (var i = 0; i < json.length; i++) {
                                                        var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json), SECRET_KEY);
                                                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                                        var item = {
                                                            id: json.programId + "_v" + version + "_uId_" + userId,
                                                            programId: json.programId,
                                                            version: version,
                                                            programName: (CryptoJS.AES.encrypt(JSON.stringify((json.label)), SECRET_KEY)).toString(),
                                                            programData: encryptedText.toString(),
                                                            userId: userId
                                                        };
                                                        var putRequest = programOverWrite.put(item);
                                                        putRequest.onerror = function (error) {
                                                            this.props.history.push(`/program/downloadProgram/` + "An error occured please try again.")
                                                        }.bind(this);

                                                        // }
                                                        transactionForOverwrite.oncomplete = function (event) {
                                                            console.log("in transaction complete")
                                                            this.props.history.push(`/dashboard/` + "Program downloaded successfully.")
                                                        }.bind(this);
                                                        transactionForOverwrite.onerror = function (event) {
                                                            this.props.history.push(`/program/downloadProgram/` + "An error occured please try again.")
                                                        }.bind(this);
                                                        transactionForOverwrite.onerror = function (event) {
                                                            this.props.history.push(`/program/downloadProgram/` + "An error occured please try again.")
                                                        }.bind(this)
                                                    }
                                                },
                                                {
                                                    label: i18n.t('static.program.no'),
                                                    onClick: () => {
                                                        this.setState({
                                                            message: i18n.t('static.program.actioncancelled')
                                                        })
                                                        this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.actioncancelled'))
                                                    }
                                                }
                                            ]
                                        });
                                    }
                                }.bind(this)
                            }.bind(this)
                        })
                        .catch(
                            error => {
                                switch (error.message) {
                                    case "Network Error":
                                        this.setState({
                                            message: error.message
                                        })
                                        this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                        break
                                    default:
                                        this.setState({
                                            message: error.response
                                        })
                                        this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                        break
                                }
                            }
                        )

                } else {
                    alert(i18n.t('static.common.online'))
                }
            }

        }

    }
}

export default Program;
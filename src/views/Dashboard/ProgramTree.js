import React, { Component, lazy, Suspense } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Row,
    FormGroup,
    Label,
    InputGroup,
    Input,
    InputGroupAddon
} from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmCountryService from "../../api/RealmCountryService"
import HealthAreaService from "../../api/HealthAreaService"
import ProgramService from "../../api/ProgramService"
import getLabelText from '../../CommonComponent/getLabelText'
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import i18n from '../../i18n';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import RealmService from '../../api/RealmService';

const entityname = i18n.t('static.dashboard.downloadprogram')
class Program extends Component {

    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
        this.downloadClicked = this.downloadClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getTree = this.getTree.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.state = {
            dropdownOpen: false,
            radioSelected: 2,
            countryList: [],
            healthAreaList: [],
            prgList: [],
            realmList: [],
            lang: localStorage.getItem('lang'),
            realmId: AuthenticationService.getRealmId()
        };
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    componentDidMount() {
        if (AuthenticationService.getRealmId() == -1) {
            document.getElementById("realmDiv").style.display = "block"
            AuthenticationService.setupAxiosInterceptors();
            RealmService.getRealmListAll()
                .then(response => {
                    if (response.status == 200) {
                        this.setState({
                            realmList: response.data
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
        } else {
            document.getElementById("realmDiv").style.display = "none"
            this.setState({
                realmId: AuthenticationService.getRealmId()
            })
            this.getTree();
        }

    }

    getTree() {
        console.log(this.state.realmId)
        document.getElementById("treeDiv").style.display = "block";
        AuthenticationService.setupAxiosInterceptors();
        console.log("This.state.realmId", this.state.realmId)
        if (this.state.realmId != "" && this.state.realmId > 0) {
            this.setState({
                message: ""
            })
            RealmCountryService.getRealmCountryForProgram(this.state.realmId)
                .then(response => {
                    if (response.status == 200) {
                        console.log("response.data------------>", response.data)
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
                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
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
            HealthAreaService.getHealthAreaListForProgram(this.state.realmId)
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
                            switch (error.response ? error.response.status : "") {
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
                            switch (error.response ? error.response.status : "") {
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

        } else {
            document.getElementById("treeDiv").style.display = "none";
            this.setState({
                message: i18n.t('static.common.realmtext')
            })
        }
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
        });
    }

    dataChange(event) {
        if (event.target.name === "realmId") {
            this.state.realmId = event.target.value;
        }
    };

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected,
        });
    }

    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

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
            <div className="animated fadeIn">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={10} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <strong>{i18n.t('static.program.download')}</strong>
                            </CardHeader>
                            <CardBody>
                                <Col md="3 pl-0" id="realmDiv">
                                    <FormGroup>
                                        <Label htmlFor="select">{i18n.t('static.program.realm')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    bsSize="sm"
                                                    onChange={(e) => { this.dataChange(e) }}
                                                    type="select" name="realmId" id="realmId">
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {realms}
                                                </Input>
                                                <InputGroupAddon addonType="append">
                                                    <Button color="secondary Gobtn btn-sm" onClick={this.getTree}>{i18n.t('static.common.go')}</Button>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                </Col>
                                {/* </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row id="treeDiv" style={{ display: "none" }}>
                    <Col sm={12} md={10} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardBody> */}
                                <div className="table-responsive" id="treeDiv" style={{ display: "none" }}>
                                    <ul className="tree">
                                        <li>
                                            <input type="checkbox" id="c1" />
                                            <label className="tree_label" htmlFor="c1">{i18n.t('static.program.program')}</label>
                                            <ul>
                                                {
                                                    this.state.countryList.map(item => (
                                                        <li>
                                                            <input type="checkbox" defaultChecked id={"c1-".concat(item.country.countryId)} />
                                                            <label htmlFor={"c1-".concat(item.country.countryId)} className="tree_label">{getLabelText(item.country.label, this.state.lang)}</label>
                                                            <ul>
                                                                {
                                                                    this.state.healthAreaList.map(item1 => (
                                                                        <li>
                                                                            <input type="checkbox" defaultChecked id={"c1-".concat(item.country.countryId).concat(item1.healthAreaId)} />
                                                                            <label htmlFor={"c1-".concat(item.country.countryId).concat(item1.healthAreaId)} className="tree_label">{getLabelText(item1.label, this.state.lang)}</label>
                                                                            <ul>
                                                                                {
                                                                                    this.state.prgList.filter(c => c.realmCountry.country.countryId == item.country.countryId).filter(c => c.healthArea.id == item1.healthAreaId).map(item2 => (
                                                                                        <li>
                                                                                            <span className="tree_label">
                                                                                                <span className="">
                                                                                                    <div className="checkbox m-0">
                                                                                                        <input type="checkbox" name="programCheckBox" value={item2.programId} id={"checkbox_".concat(item.country.countryId).concat(item1.healthAreaId).concat(item2.programId).concat(".0")} />
                                                                                                        <label htmlFor={"checkbox_".concat(item.country.countryId).concat(item1.healthAreaId).concat(item2.programId).concat(".0")}>{getLabelText(item2.label, this.state.lang)}<i className="ml-1 fa fa-eye"></i></label>
                                                                                                    </div>
                                                                                                </span>
                                                                                            </span>
                                                                                            <input type="checkbox" defaultChecked id={"fpm".concat(item.country.countryId).concat(item1.healthAreaId).concat(item2.programId)} />
                                                                                            <label className="arrow_label" htmlFor={"fpm".concat(item.country.countryId).concat(item1.healthAreaId).concat(item2.programId)}></label>
                                                                                            <ul>
                                                                                                {
                                                                                                    this.state.prgList.filter(c => c.programId == item2.programId).map(item3 => (
                                                                                                        (item3.versionList).map(item4 => (

                                                                                                            <li><span className="tree_label">
                                                                                                                <span className="">
                                                                                                                    <div className="checkbox m-0">
                                                                                                                        <input type="checkbox" value={item4.versionId} name={"versionCheckBox".concat(item2.programId)} id={"kf-v".concat(item.country.countryId).concat(item1.healthAreaId).concat(item2.programId).concat(item4.versionId)} />
                                                                                                                        <label htmlFor={"kf-v".concat(item.country.countryId).concat(item1.healthAreaId).concat(item2.programId).concat(item4.versionId)}>{i18n.t('static.program.version').concat(item4.versionId)}</label>
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
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => this.downloadClicked()}><i className="fa fa-check"></i>{i18n.t('static.common.download')}</Button>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>


            </div>
        );
    }

    cancelClicked() {
        this.props.history.push(`/ApplicationDashboard/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
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
                var versionCheckboxes = document.getElementsByName("versionCheckBox".concat(programCheckboxes[i].value));
                // loop over them all
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
            this.setState({
                message: i18n.t('static.program.errorSelectAtleastOneProgram')
            },
                () => {
                    this.hideSecondComponent();
                })
            // this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errorSelectAtleastOneProgram'))
        } else if (programInvalidCheckedCount > 0) {
            this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errorSelectProgramIfYouSelectVersion'))
        } else {
            console.log("Checl boxes checked array", checkboxesChecked)
            var programThenCount = 0;
            for (var i = 0; i < checkboxesChecked.length; i++) {
                // var version = (checkboxesChecked[i]).versionId;
                if (navigator.onLine) {
                    AuthenticationService.setupAxiosInterceptors();
                    ProgramService.getProgramData(checkboxesChecked[i])
                        .then(response => {
                            console.log("ProgramThenCount", programThenCount)
                            console.log("Response data", response.data)
                            var json = response.data;
                            console.log("Json-------->", json);
                            // console("version befor -1 check",version)
                            var version = json.requestedProgramVersion;
                            if (version == -1) {
                                version = json.currentVersion.versionId
                            }
                            console.log("Version", version)
                            var db1;
                            getDatabase();
                            var openRequest = indexedDB.open('fasp', 1);
                            openRequest.onsuccess = function (e) {
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
                                    }
                                    if (count == 0) {
                                        db1 = e.target.result;
                                        var transactionForSavingData = db1.transaction(['programData'], 'readwrite');
                                        var programSaveData = transactionForSavingData.objectStore('programData');

                                        var transactionForSavingDownloadedProgramData = db1.transaction(['downloadedProgramData'], 'readwrite');
                                        var downloadedProgramSaveData = transactionForSavingDownloadedProgramData.objectStore('downloadedProgramData');
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
                                        console.log("Item------------>", item);
                                        var putRequest = programSaveData.put(item);
                                        programThenCount++;
                                        putRequest.onerror = function (error) {
                                            this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                        }.bind(this);

                                        var putRequestDownloadedProgramData = downloadedProgramSaveData.put(item);
                                        // programThenCount++;
                                        putRequestDownloadedProgramData.onerror = function (error) {
                                            this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                        }.bind(this);
                                        // }
                                        transactionForSavingData.oncomplete = function (event) {
                                            console.log("in transaction complete");

                                            // this.props.history.push(`/dashboard/` + i18n.t('static.program.downloadsuccess'))
                                        }.bind(this);
                                        transactionForSavingData.onerror = function (event) {
                                            this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                        }.bind(this);
                                        programSaveData.onerror = function (event) {
                                            this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                        }.bind(this)


                                        transactionForSavingDownloadedProgramData.oncomplete = function (event) {
                                            console.log("in transaction complete");

                                            this.props.history.push(`/dashboard/` + i18n.t('static.program.downloadsuccess'))
                                        }.bind(this);
                                        transactionForSavingDownloadedProgramData.onerror = function (event) {
                                            this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                        }.bind(this);
                                        downloadedProgramSaveData.onerror = function (event) {
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

                                                        var transactionForOverwriteDownloadedProgramData = db1.transaction(['downloadedProgramData'], 'readwrite');
                                                        var programOverWriteForDownloadedProgramData = transactionForOverwriteDownloadedProgramData.objectStore('downloadedProgramData');
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
                                                        console.log("Item------------------>", item)
                                                        var putRequest = programOverWrite.put(item);
                                                        programThenCount++;
                                                        putRequest.onerror = function (error) {
                                                            this.props.history.push(`/program/downloadProgram/` + "An error occured please try again.")
                                                        }.bind(this);

                                                        // }
                                                        transactionForOverwrite.oncomplete = function (event) {
                                                            // this.props.history.push(`/dashboard/` + "Program downloaded successfully.")
                                                        }.bind(this);
                                                        transactionForOverwrite.onerror = function (event) {
                                                            this.props.history.push(`/program/downloadProgram/` + "An error occured please try again.")
                                                        }.bind(this);

                                                        var putRequestDownloadedProgramData = programOverWriteForDownloadedProgramData.put(item);
                                                        // programThenCount++;
                                                        putRequestDownloadedProgramData.onerror = function (error) {
                                                            this.props.history.push(`/program/downloadProgram/` + "An error occured please try again.")
                                                        }.bind(this);

                                                        // }
                                                        transactionForOverwriteDownloadedProgramData.oncomplete = function (event) {
                                                            this.props.history.push(`/dashboard/` + 'green/' + "Program downloaded successfully.")
                                                        }.bind(this);
                                                        transactionForOverwriteDownloadedProgramData.onerror = function (event) {
                                                            this.props.history.push(`/program/downloadProgram/` + "An error occured please try again.")
                                                        }.bind(this);
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
                                if (error.message === "Network Error") {
                                    this.setState({ message: error.message });
                                } else {
                                    switch (error.response ? error.response.status : "") {
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
                                    // switch (error.message) {
                                    //     case "Network Error":
                                    //         this.setState({
                                    //             message: error.message
                                    //         })
                                    //         this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                    //         break
                                    //     default:
                                    //         this.setState({
                                    //             message: error.response
                                    //         })
                                    //         this.props.history.push(`/program/downloadProgram/` + i18n.t('static.program.errortext'))
                                    //         break
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
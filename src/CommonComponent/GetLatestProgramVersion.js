import { getDatabase } from "../CommonComponent/IndexedDbFunctions";
import CryptoJS from 'crypto-js';
import {
    INDEXED_DB_NAME,
    INDEXED_DB_VERSION,
    SECRET_KEY
} from '../Constants.js';
import ProgramService from '../api/ProgramService';
import i18n from '../i18n';
import AuthenticationService from '../views/Common/AuthenticationService';
import React, { Component } from "react";
import { isSiteOnline } from "./JavascriptCommonFunctions";
export default class GetLatestProgramVersion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            executionStatus: 0
        }
        this.getPrograms = this.getPrograms.bind(this);
        this.checkNewerVersions = this.checkNewerVersions.bind(this);
    }
    checkNewerVersions() {
        if (isSiteOnline()) {
            AuthenticationService.setupAxiosInterceptors()
            ProgramService.checkNewerVersions(this.state.programs)
                .then(response => {
                    localStorage.removeItem("sesLatestProgram");
                    localStorage.setItem("sesLatestProgram", response.data);
                })
        }
    }
    componentDidMount() {
        this.getPrograms();
    }
    render() {
        return (
            <></>
        );
    }
    getPrograms() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: '#BA0C2F'
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programQPLDetails'], 'readwrite');
            var program = transaction.objectStore('programQPLDetails');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: '#BA0C2F',
                    loading: false
                })
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var programJson = {
                            programId: myResult[i].programId,
                            versionId: myResult[i].version
                        }
                        proList.push(programJson)
                    }
                }
                this.setState({
                    programs: proList
                })
            }.bind(this);
        }.bind(this)
    }
}
import { getDatabase } from "../CommonComponent/IndexedDbFunctions";

import AuthenticationService from '../views/Common/AuthenticationService';
import i18n from '../i18n';
import {
    SECRET_KEY, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS,
    APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS,
    ON_HOLD_SHIPMENT_STATUS,
    INDEXED_DB_VERSION, INDEXED_DB_NAME

} from '../Constants.js'
import CryptoJS from 'crypto-js';
import ProgramService from '../api/ProgramService';

import React, { Component } from "react";
import { isSiteOnline } from "./JavascriptCommonFunctions";
// import openProblem from '../CommonComponent/openProblem.js';

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
        console.log("T***going to call check newer versions")
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
        console.log("T***get programs called");
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: '#BA0C2F'
            })
            // if (this.props.updateState != undefined) {
            //     this.props.updateState(false);
            // }
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
                // if (this.props.updateState != undefined) {
                //     this.props.updateState(false);
                // }
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        // var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        // var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        // var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        // var programJson1 = JSON.parse(programData);
                        // console.log("programData---", programData);
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
                // if (this.props.updateState != undefined) {
                //     this.props.updateState(false);
                //     this.props.fetchData();
                // }
            }.bind(this);
        }.bind(this)

    }
}
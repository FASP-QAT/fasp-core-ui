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
import moment from 'moment';

import React, { Component } from "react";
// import openProblem from '../CommonComponent/openProblem.js';

export default class ChangeInLocalProgramVersion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            downloadedPrograms: [],
            programs: [],
            programDataLastModifiedDate: '',
            downloadedProgramDataLastModifiedDate: '',
            state1: 0,
            state2: 0,
            state3: 0
        }
        this.checkIfLocalProgramVersionChanged = this.checkIfLocalProgramVersionChanged.bind(this);
        this.getProgramData = this.getProgramData.bind(this);
        this.getDownloadedPrograms = this.getDownloadedPrograms.bind(this);

    }
    render() {
        return (
            <>
                {/* {
                    this.props.func(this, this.state.programDataLastModifiedDate, this.state.downloadedProgramDataLastModifiedDate)
                } */}
            </>
        );
    }

    checkIfLocalProgramVersionChanged() {
        // checkClick = (e, programDataLastModifiedDate, downloadedProgramDataLastModifiedDate) => {
        // e.preventDefault();
        console.log("d---this.state.programDataLastModifiedDate---", this.state.programDataLastModifiedDate);
        console.log("d---downloadedProgramDataLastModifiedDate  ", this.state.downloadedProgramDataLastModifiedDate);
        console.log("d---result local version---", moment(this.state.programDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(this.state.downloadedProgramDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss"))
        localStorage.removeItem("sesLocalVersionChange");
        if (moment(this.state.programDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(this.state.downloadedProgramDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss")) {
            console.log("d---hurrey local version changed-------------------------------------------------------------");
            localStorage.setItem("sesLocalVersionChange", true);
            console.log("d--------in if---------------")
        } else {
            localStorage.setItem("sesLocalVersionChange", false);
            console.log("d--------in else---------------")
        }
        //   }
    }

    componentDidMount() {
        console.log("component did mount change in local program version--------------------------");
        this.getProgramData();
        this.getDownloadedPrograms();
        // this.checkIfLocalProgramVersionChanged();
    }
    // componentDidUpdate(prevState) {
    //     console.log("component did update change in local program version update--------------------------");
    //     if (prevState.programDataLastModifiedDate !== this.state.programDataLastModifiedDate) {
    //         this.getProgramData();
    //         this.getDownloadedPrograms();
    //         this.checkIfLocalProgramVersionChanged();
    //     }
    // }

    getProgramData() {
        console.log("get programs called");
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
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
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
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson1 = JSON.parse(programData);
                        console.log("1---programJson1 program id---", programJson1.programId);
                        console.log("1---programData---", programData);
                        console.log("1---programJson1.consumptionList---", programJson1.consumptionList);
                        console.log("1---programJson1.inventoryList---", programJson1.inventoryList);
                        console.log("1---programJson1.shipmentList---", programJson1.shipmentList);
                        let cmax = moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate)))
                        console.log("1---cmax---", moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))));
                        let imax = moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate)))
                        console.log("1---imax---", moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))));
                        let smax = moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate)))
                        console.log("1---smax---", moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate))));
                        let pmax = moment.max(cmax, imax, smax)
                        console.log("1---pmax---", moment.max(moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate)))));
                        var programJson = {
                            lastModifiedDate: moment.max(moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate))))
                        }
                        proList.push(programJson)
                    }
                }
                // let finalmax = moment.max(proList.map(d => moment(d.lastModifiedDate)))
                // console.log("finalmax---", moment.max(proList.map(d => moment(d.lastModifiedDate))))
                this.setState({
                    programDataLastModifiedDate: moment.max(proList.map(d => moment(d.lastModifiedDate)))
                }, () => {
                    // this.props.func(this, this.state.programDataLastModifiedDate, this.state.downloadedProgramDataLastModifiedDate)
                })
            }.bind(this);
        }.bind(this)

    }
    getDownloadedPrograms() {
        console.log("get programs called");
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
            var transaction = db1.transaction(['downloadedProgramData'], 'readwrite');
            var program = transaction.objectStore('downloadedProgramData');
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
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson1 = JSON.parse(programData);
                        console.log("1---programJson program id 1---", programJson1.programId);
                        console.log("1---programData 1---", programData);
                        console.log("1---programJson.consumptionList 1---", programJson1.consumptionList);
                        console.log("1---programJson.inventoryList 1---", programJson1.inventoryList);
                        console.log("1---programJson.shipmentList 1---", programJson1.shipmentList);
                        let cmax = moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate)))
                        console.log("1---cmax1---", moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))));
                        let imax = moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate)))
                        console.log("1---imax1---", moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))));
                        let smax = moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate)))
                        console.log("1---smax1---", moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate))));
                        let pmax = moment.max(moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate))))
                        console.log("1---pmax1---", moment.max(moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate)))));
                        var programJson = {
                            lastModifiedDate: moment.max(moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate))))
                        }
                        proList.push(programJson)
                    }
                }
                // let finalmax = moment.max(proList.map(d => moment(d.lastModifiedDate)))
                // console.log("finalmax1---", moment.max(proList.map(d => moment(d.lastModifiedDate))))
                this.setState({
                    downloadedProgramDataLastModifiedDate: moment.max(proList.map(d => moment(d.lastModifiedDate)))
                }, () => {
                    // this.props.func(this, this.state.programDataLastModifiedDate, this.state.downloadedProgramDataLastModifiedDate)
                })
            }.bind(this);
        }.bind(this)

    }
}
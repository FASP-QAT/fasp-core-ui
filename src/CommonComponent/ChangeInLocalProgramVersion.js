import CryptoJS from 'crypto-js';
import moment from 'moment';
import React, { Component } from "react";
import { getDatabase } from "../CommonComponent/IndexedDbFunctions";
import {
    INDEXED_DB_NAME,
    INDEXED_DB_VERSION,
    SECRET_KEY
} from '../Constants.js';
import i18n from '../i18n';
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
            </>
        );
    }
    checkIfLocalProgramVersionChanged() {
        localStorage.removeItem("sesLocalVersionChange");
        if (moment(this.state.programDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss") > moment(this.state.downloadedProgramDataLastModifiedDate).format("YYYY-MM-DD HH:mm:ss")) {
            localStorage.setItem("sesLocalVersionChange", true);
        } else {
            localStorage.setItem("sesLocalVersionChange", false);
        }
    }
    componentDidMount() {
        this.getProgramData();
        this.getDownloadedPrograms();
    }
    getProgramData() {
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
                        let cmax = moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate)))
                        let imax = moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate)))
                        let smax = moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate)))
                        let pmax = moment.max(cmax, imax, smax)
                        var programJson = {
                            lastModifiedDate: moment.max(moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate))))
                        }
                        proList.push(programJson)
                    }
                }
                this.setState({
                    programDataLastModifiedDate: moment.max(proList.map(d => moment(d.lastModifiedDate)))
                }, () => {
                })
            }.bind(this);
        }.bind(this)
    }
    getDownloadedPrograms() {
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
                        let cmax = moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate)))
                        let imax = moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate)))
                        let smax = moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate)))
                        let pmax = moment.max(moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate))))
                        var programJson = {
                            lastModifiedDate: moment.max(moment.max(programJson1.consumptionList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.inventoryList.map(d => moment(d.lastModifiedDate))), moment.max(programJson1.shipmentList.map(d => moment(d.lastModifiedDate))))
                        }
                        proList.push(programJson)
                    }
                }
                this.setState({
                    downloadedProgramDataLastModifiedDate: moment.max(proList.map(d => moment(d.lastModifiedDate)))
                }, () => {
                })
            }.bind(this);
        }.bind(this)
    }
}
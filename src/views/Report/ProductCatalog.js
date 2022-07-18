import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { Component, lazy } from 'react';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import {
    Card, CardBody,
    // CardFooter,
    CardHeader, Col, Form, FormGroup, InputGroup, Label, Table, Input
} from 'reactstrap';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import getLabelText from '../../CommonComponent/getLabelText';
import { LOGO } from '../../CommonComponent/Logo.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Online, Offline } from 'react-detect-offline';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, ON_HOLD_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, INDEXED_DB_VERSION, INDEXED_DB_NAME, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, polling } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import TracerCategoryService from '../../api/TracerCategoryService';
import PlanningUnitService from '../../api/PlanningUnitService';
import { BreadcrumbDivider } from "semantic-ui-react";

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ProductService from '../../api/ProductService';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { act } from 'react-test-renderer';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';


// const { getToggledOptions } = utils;
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();
const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

const data = [{ "program": "HIV/AIDS-Malawi-National", "pc": "HIV Rapid Test Kits (RTKs)", "tc": "HIV RTK", "fc": "(Campaign Bulk) LLIN 180x160x170 cm (LxWxH) PBO Rectangular (White)", "UOMCode": "Each", "genericName": "", "MultiplierForecastingUnitToPlanningUnit": "1", "PlanningUnit": "(Campaign Bulk) LLIN 180x160x170 cm (LxWxH) PBO Rectangular (White) 1 Each", "NoOfItems": "3,000", "UOMCodeP": "Each", "MultipliertoForecastingUnit": "1", "Min": "5", "ReorderFrequecy": "4", "ShelfLife": "18", "CatalogPrice": "456,870", "isActive": 'Active' }];


class ProductCatalog extends Component {
    constructor(props) {
        super(props);

        this.toggledata = this.toggledata.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

        this.state = {
            dropdownOpen: false,
            radioSelected: 2,
            lang: localStorage.getItem('lang'),
            procurementAgents: [],
            programValues: [],
            programLabels: [],
            programs: [],
            message: '',
            planningUnits: [],
            versions: [],
            planningUnitList: [],
            productCategoriesOffline: [],
            planningUnitValues: [],
            planningUnitLabels: [],

            procurementAgenttValues: [],
            procurementAgentLabels: [],
            outPutList: [],
            productCategories: [],
            tracerCategories: [],
            loading: true
        };

        this.getPrograms = this.getPrograms.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this);
        this.getTracerCategoryList = this.getTracerCategoryList.bind(this);
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    exportCSV(columns) {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"');
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.tracercategory.tracercategory') + ' : ' + document.getElementById("tracerCategoryId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20').replaceAll('#', '%23')) });

        var A = [this.addDoubleQuoteToRowContent(headers)];
        this.state.outPutList.map(
            ele => A.push(this.addDoubleQuoteToRowContent([
                getLabelText(ele.productCategory.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.tracerCategory.label, this.state.lang) != null ? getLabelText(ele.tracerCategory.label, this.state.lang).replaceAll(' ', '%20') : '',
                getLabelText(ele.forecastingUnit.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.fUnit.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.genericName, this.state.lang) != null ? getLabelText(ele.genericName, this.state.lang).replaceAll(' ', '%20') : '',
                ele.forecastingtoPlanningUnitMultiplier,
                ele.planningUnit.id,
                getLabelText(ele.planningUnit.label, this.state.lang).replaceAll(' ', '%20'),
                getLabelText(ele.pUnit.label, this.state.lang).replaceAll(' ', '%20'),
                ele.minMonthsOfStock,
                ele.reorderFrequencyInMonths,
                ele.shelfLife,
                ele.catalogPrice,
                ele.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')
            ])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.productcatalog') + '.csv';
        document.body.appendChild(a)
        a.click()
    }


    exportPDF = (columns) => {
        const addFooters = doc => {
            const pageCount = doc.internal.getNumberOfPages()

            for (var i = 1; i <= pageCount; i++) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(6)
                doc.setPage(i)
                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })

                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
            }
        }
        const addHeaders = doc => {
            const pageCount = doc.internal.getNumberOfPages()

            for (var i = 1; i <= pageCount; i++) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.productcatalog'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })

                    doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.tracercategory.tracercategory') + ' : ' + document.getElementById("tracerCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })

                }



            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        const title = i18n.t('static.dashboard.productcatalog');
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;

        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text) });
        let data = this.state.outPutList.map(ele => [
            getLabelText(ele.productCategory.label, this.state.lang),
            getLabelText(ele.tracerCategory.label, this.state.lang),
            getLabelText(ele.forecastingUnit.label, this.state.lang),
            getLabelText(ele.fUnit.label, this.state.lang),
            getLabelText(ele.genericName, this.state.lang),
            ele.forecastingtoPlanningUnitMultiplier,
            ele.planningUnit.id,
            getLabelText(ele.planningUnit.label, this.state.lang),
            getLabelText(ele.pUnit.label, this.state.lang),
            ele.minMonthsOfStock,
            ele.reorderFrequencyInMonths,
            ele.shelfLife,
            ele.catalogPrice,
            ele.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')
        ]);

        let content = {
            margin: { top: 90, bottom: 70 },
            startY: 200,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 54.5, halign: 'center' },
            columnStyles: {
                // 0: { cellWidth: 170 },
                // 1: { cellWidth: 171.89 },
                13: { cellWidth: 53 }
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.productcatalog') + '.pdf')
    }


    getTracerCategoryList() {
        var programId = document.getElementById('programId').value;
        if (programId > 0) {


            // AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();
            if (isSiteOnline()) {
                TracerCategoryService.getTracerCategoryByProgramId(realmId, programId).then(response => {

                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            tracerCategories: listArray
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
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
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
                // .catch(error => {
                //     if (error.message === "Network Error") {
                //         this.setState({ message: error.message });
                //     } else {
                //         switch (error.response ? error.response.status : "") {
                //             case 500:
                //             case 401:
                //             case 404:
                //             case 406:
                //             case 412:
                //                 this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                //                 break;
                //             default:
                //                 this.setState({ message: 'static.unkownError' });
                //                 break;
                //         }
                //     }
                // }
                // );
            } else {
                const lan = 'en';
                var db1;
                var storeOS;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                    var planningunitRequest = planningunitOs.getAll();
                    var planningList = []
                    planningunitRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    planningunitRequest.onsuccess = function (e) {
                        var myResult = [];
                        myResult = planningunitRequest.result;
                        // var programId = (document.getElementById("programId").value).split("_")[0];
                        var proList = []

                        for (var i = 0; i < myResult.length; i++) {
                            if (myResult[i].program.id == programId) {

                                proList.push(myResult[i].planningUnit)
                            }
                        }
                        console.log('proList', proList)
                        var planningunitTransaction1 = db1.transaction(['planningUnit'], 'readwrite');
                        var planningunitOs1 = planningunitTransaction1.objectStore('planningUnit');
                        var planningunitRequest1 = planningunitOs1.getAll();
                        //  var pllist = []
                        planningunitRequest1.onerror = function (event) {
                            // Handle errors!
                        };
                        planningunitRequest1.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest1.result;
                            var flList = []
                            console.log(myResult)
                            for (var i = 0; i < myResult.length; i++) {
                                for (var j = 0; j < proList.length; j++) {
                                    if (myResult[i].planningUnitId == proList[j].id) {
                                        console.log(myResult[i].planningUnitId, proList[j].id)

                                        flList.push(myResult[i].forecastingUnit)
                                        planningList.push(myResult[i])
                                    }
                                }
                            }
                            console.log('flList', flList)

                            var tcList = [];
                            flList.filter(function (item) {
                                var i = tcList.findIndex(x => x.tracerCategoryId == item.tracerCategory.id);
                                if (i <= -1 && item.tracerCategory.id != 0) {
                                    tcList.push({ tracerCategoryId: item.tracerCategory.id, label: item.tracerCategory.label });
                                }
                                return null;
                            });

                            console.log('tcList', tcList)
                            var lang = this.state.lang;
                            this.setState({
                                tracerCategories: tcList.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                planningUnitList: planningList
                            }, () => { this.fetchData() })



                        }.bind(this);

                    }.bind(this);
                }.bind(this)
            }

        } else {
            this.setState({
                message: i18n.t('static.common.selectProgram'),
                productCategories: [],
                tracerCategories: []
            })
        }
    }



    getPrograms() {

        // AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        // ProgramService.getProgramByRealmId(realmId)
        if (isSiteOnline()) {
            ProgramService.getProgramList()
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    console.log("sesProgramIdReport----->", localStorage.getItem("sesProgramIdReport"));
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                        this.setState({
                            programs: listArray, loading: false,
                            programId: localStorage.getItem("sesProgramIdReport")
                        }, () => {
                            this.fetchData();
                            this.getProductCategories();
                            this.getTracerCategoryList();
                        })
                    } else {
                        this.setState({
                            programs: listArray, loading: false
                        }, () => { })
                    }

                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => { })
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
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
            // .catch(
            //     error => {
            //         this.setState({
            //             programs: [], loading: false
            //         }, () => { })
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message, loading: false });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }), loading: false });
            //                     break;
            //                 default:
            //                     this.setState({ message: 'static.unkownError', loading: false });
            //                     break;
            //             }
            //         }
            //     }
            // );
        } else {
            console.log('offline')
            this.consolidatedProgramList()
            this.setState({ loading: false })
        }
    }

    consolidatedProgramList = () => {
        const lan = 'en';
        const { programs } = this.state
        var proList = programs;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData.generalData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        console.log(programNameLabel)

                        var f = 0
                        for (var k = 0; k < this.state.programs.length; k++) {
                            if (this.state.programs[k].programId == programData.programId) {
                                f = 1;
                                console.log('already exist')
                            }
                        }
                        if (f == 0) {
                            proList.push(programData)
                        }
                    }


                }
                var lang = this.state.lang;
                if (localStorage.getItem("sesProgramIdReport") != '' && localStorage.getItem("sesProgramIdReport") != undefined) {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = getLabelText(a.label, lang).toLowerCase();
                            b = getLabelText(b.label, lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        programId: localStorage.getItem("sesProgramIdReport")
                    }, () => {
                        this.fetchData();
                        this.getProductCategories();
                        this.getTracerCategoryList();
                    })
                } else {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = getLabelText(a.label, lang).toLowerCase();
                            b = getLabelText(b.label, lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })
                    })
                }


            }.bind(this);

        }.bind(this);


    }



    getProductCategories() {


        let programId = document.getElementById("programId").value
        console.log(programId)
        if (programId > 0) {

            // AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();
            if (isSiteOnline()) {
                ProductService.getProductCategoryListByProgram(realmId, programId)
                    .then(response => {
                        console.log(response.data);
                        // var list = response.data.slice(1);
                        var list = response.data;
                        list.sort((a, b) => {
                            var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        console.log("my list=======", list);

                        this.setState({
                            productCategories: list
                        })
                    }).catch(
                        error => {
                            this.setState({
                                productCategories: []
                            })
                            if (error.message === "Network Error") {
                                this.setState({ message: error.message });
                            } else {
                                switch (error.response ? error.response.status : "") {
                                    case 500:
                                    case 401:
                                    case 404:
                                    case 406:
                                    case 412:
                                        this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                                        break;
                                    default:
                                        this.setState({ message: 'static.unkownError' });
                                        break;
                                }
                            }
                        }
                    );
            } else {
                this.setState({ loading: true })
                var db1;
                var storeOS;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        loading: false
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                    var ppuOs = ppuTransaction.objectStore('programPlanningUnit');
                    var ppuRequest = ppuOs.getAll();
                    ppuRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext')
                        })
                    }.bind(this);

                    ppuRequest.onerror = function (event) {
                        this.setState({
                            loading: false
                        })
                    }.bind(this);
                    ppuRequest.onsuccess = function (e) {
                        var result3 = ppuRequest.result;
                        result3 = result3.filter(c => c.program.id == programId);
                        console.log("4------>", result3);

                        var outPutList = [];
                        var json;
                        for (var i = 0; i < result3.length; i++) {
                            console.log("product category id---", result3[i]);
                            console.log("product category id---", result3[i].productCategory.id);
                            console.log("product category label---", result3[i].productCategory.label.label_en);
                            json = {
                                id: result3[i].productCategory.id,
                                label: getLabelText(result3[i].productCategory.label, this.state.lang)
                            }
                            outPutList = outPutList.concat(json);
                            // outPutList.push(json);
                        }
                        console.log("outPutList-----------", outPutList);
                        // const data = [ /* any list of objects */ ];
                        const set = new Set(outPutList.map(item => JSON.stringify(item)));
                        const dedup = [...set].map(item => JSON.parse(item));
                        console.log(`Removed ${outPutList.length - dedup.length} elements`);
                        console.log("dedup----------------", dedup);
                        var lang = this.state.lang;
                        this.setState({
                            loading: false,
                            productCategoriesOffline: dedup.sort(function (a, b) {
                                a = a.label.toLowerCase();
                                b = b.label.toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })
                        })
                    }.bind(this);
                }.bind(this);
            }
        } else {
            this.setState({
                message: i18n.t('static.common.selectProgram'),
                productCategories: [],
                tracerCategories: []
            })
        }
    }


    buildJexcel() {

        let outPutList = this.state.outPutList;
        // console.log("outPutList---->", outPutList);
        let outPutArray = [];
        let count = 0;

        for (var j = 0; j < outPutList.length; j++) {
            data = [];
            data[0] = getLabelText(outPutList[j].productCategory.label, this.state.lang)
            data[1] = getLabelText(outPutList[j].tracerCategory.label, this.state.lang)
            data[2] = getLabelText(outPutList[j].forecastingUnit.label, this.state.lang)
            data[3] = getLabelText(outPutList[j].fUnit.label, this.state.lang)
            data[4] = getLabelText(outPutList[j].genericName, this.state.lang)
            data[5] = outPutList[j].forecastingtoPlanningUnitMultiplier
            data[6] = getLabelText(outPutList[j].planningUnit.label, this.state.lang)
            data[7] = getLabelText(outPutList[j].pUnit.label, this.state.lang)
            data[8] = outPutList[j].minMonthsOfStock
            data[9] = outPutList[j].reorderFrequencyInMonths
            data[10] = outPutList[j].shelfLife
            data[11] = outPutList[j].catalogPrice
            data[12] = outPutList[j].active;
            outPutArray[count] = data;
            count++;
        }
        // if (outPutList.length == 0) {
        //     data = [];
        //     outPutArray[0] = data;
        // }
        // console.log("outPutArray---->", outPutArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = outPutArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [80, 80, 90, 60, 80, 80, 80, 0, 0, 90, 80, 80, 70],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.dashboard.productcategory'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'text',
                    readOnly: true
                },

                {
                    title: i18n.t('static.forecastingunit.forecastingunit'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.forcastingUOM'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.genericName'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.forecastingtoPlanningUnitMultiplier'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.planningUnit'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.planningUOM'),
                    type: 'text',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.min'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                }, {
                    title: i18n.t('static.report.reorderFrequencyInMonths'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.report.shelfLife'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                }, {
                    title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    readOnly: true,
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },
            ],
            filters: true,
            license: JEXCEL_PRO_KEY,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    fetchData = () => {
        let programId = document.getElementById("programId").value;
        let productCategoryId = document.getElementById("productCategoryId").value;
        let tracerCategoryId = document.getElementById("tracerCategoryId").value;

        let json = {
            "programId": parseInt(document.getElementById("programId").value),
            "productCategoryId": parseInt(document.getElementById("productCategoryId").value) == 0 ? -1 : parseInt(document.getElementById("productCategoryId").value),
            "tracerCategoryId": parseInt(document.getElementById("tracerCategoryId").value),

        }

        if (programId > 0) {
            localStorage.setItem("sesProgramIdReport", programId);
            this.setState({
                programId: programId
            })
            if (isSiteOnline()) {

                this.setState({ loading: true })
                console.log("json---", json);
                // AuthenticationService.setupAxiosInterceptors();
                ReportService.programProductCatalog(json)
                    .then(response => {
                        console.log("-----response", JSON.stringify(response.data));
                        var outPutList = response.data;
                        // var responseData = response.data;
                        this.setState({
                            outPutList: outPutList,
                            message: '',
                            // loading: false
                        },
                            () => { this.buildJexcel() })
                    }).catch(
                        error => {
                            this.setState({
                                outPutList: [],
                                loading: false
                            },
                                () => {
                                    this.el = jexcel(document.getElementById("tableDiv"), '');
                                    this.el.destroy();
                                })
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
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                            loading: false
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
                // .catch(
                //     error => {
                //         this.setState({
                //             outPutList: [],
                //             loading: false
                //         },
                //             () => {
                //                 this.el = jexcel(document.getElementById("tableDiv"), '');
                //                 this.el.destroy();
                //             })

                //         if (error.message === "Network Error") {
                //             this.setState({ message: error.message, loading: false });
                //         } else {
                //             switch (error.response ? error.response.status : "") {
                //                 case 500:
                //                 case 401:
                //                 case 404:
                //                 case 406:
                //                 case 412:
                //                     this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                //                     break;
                //                 default:
                //                     this.setState({ loading: false, message: 'static.unkownError' });
                //                     break;
                //             }
                //         }
                //     }
                // );
            } else {
                this.setState({ loading: true })
                var db1;
                var storeOS;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        loading: false
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var programDataTransaction = db1.transaction(['program'], 'readwrite');
                    var programDataOs = programDataTransaction.objectStore('program');
                    var programRequest = programDataOs.get(parseInt(document.getElementById("programId").value));
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext')
                        })
                    }.bind(this);

                    programRequest.onerror = function (event) {
                        this.setState({
                            loading: false
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        var result = programRequest.result;
                        console.log("1------>", result);

                        var fuTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
                        var fuOs = fuTransaction.objectStore('forecastingUnit');
                        var fuRequest = fuOs.getAll();
                        fuRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext')
                            })
                        }.bind(this);

                        fuRequest.onerror = function (event) {
                            this.setState({
                                loading: false
                            })
                        }.bind(this);
                        fuRequest.onsuccess = function (e) {
                            var result1 = fuRequest.result;
                            console.log("2------>", result1);

                            var puTransaction = db1.transaction(['planningUnit'], 'readwrite');
                            var puOs = puTransaction.objectStore('planningUnit');
                            var puRequest = puOs.getAll();
                            puRequest.onerror = function (event) {
                                this.setState({
                                    message: i18n.t('static.program.errortext')
                                })
                            }.bind(this);

                            puRequest.onerror = function (event) {
                                this.setState({
                                    loading: false
                                })
                            }.bind(this);
                            puRequest.onsuccess = function (e) {
                                var result2 = puRequest.result;
                                console.log("3------>", result2);

                                var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                                var ppuOs = ppuTransaction.objectStore('programPlanningUnit');
                                var ppuRequest = ppuOs.getAll();
                                ppuRequest.onerror = function (event) {
                                    this.setState({
                                        message: i18n.t('static.program.errortext')
                                    })
                                }.bind(this);

                                ppuRequest.onerror = function (event) {
                                    this.setState({
                                        loading: false
                                    })
                                }.bind(this);
                                ppuRequest.onsuccess = function (e) {
                                    // this.setState({ loading: true })
                                    var result3 = ppuRequest.result;
                                    result3 = result3.filter(c => c.program.id == programId);
                                    console.log("4------>", result3);

                                    var outPutList = [];
                                    for (var i = 0; i < result3.length; i++) {
                                        var filteredList = result2.filter(c => c.planningUnitId == result3[i].planningUnit.id);
                                        console.log("5---->", filteredList);
                                        var program = result3[i].program;
                                        var planningUnit = result3[i].planningUnit;
                                        var minMonthOfStock = result3[i].minMonthsOfStock;
                                        var reorderFrequencyInMonths = result3[i].reorderFrequencyInMonths;
                                        var shelfLife = result3[i].shelfLife;
                                        var catalogPrice = result3[i].catalogPrice;
                                        var active = true;

                                        for (var j = 0; j < filteredList.length; j++) {
                                            var productCategory = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).productCategory;
                                            var tracerCategory = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).tracerCategory;
                                            var fUnit = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).unit;
                                            var genericLabel = (result1.filter(c => c.forecastingUnitId == filteredList[j].forecastingUnit.forecastingUnitId)[0]).genericLabel;
                                            var json = {
                                                program: program,
                                                productCategory: productCategory,
                                                tracerCategory: tracerCategory,
                                                forecastingUnit: filteredList[j].forecastingUnit,
                                                fUnit: fUnit,
                                                genericName: genericLabel,
                                                planningUnit: planningUnit,
                                                pUnit: filteredList[j].unit,
                                                forecastingtoPlanningUnitMultiplier: filteredList[j].multiplier,
                                                // noOfItems: 1,
                                                // multiplierOne: 1,
                                                minMonthsOfStock: minMonthOfStock,
                                                reorderFrequencyInMonths: reorderFrequencyInMonths,
                                                shelfLife: shelfLife,
                                                catalogPrice: catalogPrice,
                                                active: active
                                            }
                                            outPutList.push(json);
                                        }
                                    }

                                    if (productCategoryId > 0) {
                                        // console.log("hiiiii1",productCategoryId);
                                        var filteredPc = outPutList.filter(c => c.productCategory.id == productCategoryId);
                                        outPutList = filteredPc;
                                    } else {
                                        outPutList = outPutList;
                                    }
                                    if (tracerCategoryId > 0) {
                                        // console.log("hiiiii2",tracerCategoryId);
                                        var filteredTc = outPutList.filter(c => c.tracerCategory.id == tracerCategoryId);
                                        outPutList = filteredTc;
                                    } else {
                                        outPutList = outPutList;
                                    }
                                    console.log("outPutList------>", outPutList);
                                    this.setState({ outPutList: outPutList, message: '' },
                                        () => { this.buildJexcel() });

                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }

        } else {
            this.setState({ message: i18n.t('static.common.selectProgram'), outPutList: [], programId: '' },
                () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    this.el.destroy();
                });
        }
        // else {
        //     this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), outPutList: [] });

        // }
    }
    componentDidMount() {
        this.getPrograms();
        // setTimeout(function () { //Start the timer
        //     // this.setState({render: true}) //After 1 second, set render to true
        //     this.setState({ loading: false })
        // }.bind(this), 500)
        // this.getProcurementAgent();
        // this.getProductCategories();

    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected,
        });
    }
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const { programs } = this.state;
        const { productCategories } = this.state;
        const { tracerCategories } = this.state;
        const { productCategoriesOffline } = this.state;

        console.log("productCategoriesOffline---", productCategoriesOffline)

        const columns = [


            {
                dataField: 'productCategory.label',
                text: i18n.t('static.dashboard.productcategory'),
                sort: true,
                align: 'left',
                headerAlign: 'left',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'tracerCategory.label',
                text: i18n.t('static.tracercategory.tracercategory'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'forecastingUnit.label',
                text: i18n.t('static.forecastingunit.forecastingunit'),
                sort: true,
                align: 'left',
                headerAlign: 'left',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'fUnit.label',
                text: i18n.t('static.report.forcastingUOM'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'genericName',
                text: i18n.t('static.report.genericName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'forecastingtoPlanningUnitMultiplier',
                text: i18n.t('static.report.forecastingtoPlanningUnitMultiplier'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            }, {
                dataField: 'planningUnit.id',
                text: i18n.t('static.report.qatPID'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center' }
            },
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.report.planningUnit'),
                sort: true,
                align: 'left',
                headerAlign: 'left',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },


            {
                dataField: 'pUnit.label',
                text: i18n.t('static.report.planningUOM'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },

            {
                dataField: 'minMonthsOfStock',
                text: i18n.t('static.report.min'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'reorderFrequencyInMonths',
                text: i18n.t('static.report.reorderFrequencyInMonths'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'shelfLife',
                text: i18n.t('static.report.shelfLife'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'catalogPrice',
                text: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                sort: true,
                align: 'right',
                headerAlign: 'right'
            },
            {
                dataField: 'active',
                text: i18n.t('static.common.status'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: (cellContent, row) => {
                    return (
                        (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
                    );
                }
            }

        ];

        const tabelOptions = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.outPutList.length
            }]
        }
        const checkOnline = localStorage.getItem('sessionType');

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntitypc', { entityname })}</strong>{' '} */}
                        {this.state.outPutList.length > 0 && <div className="card-header-actions">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} />
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV(columns)} />

                        </div>}
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">
                        {/* <div ref={ref}> */}
                        <br />

                        <Col md="12 pl-0">

                            <div className="d-md-flex  Selectdiv2 ">
                                <FormGroup className="mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls SelectField">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                value={this.state.programId}
                                                // onChange={this.filterVersion}
                                                onChange={(e) => { this.fetchData(); this.getProductCategories(); this.getTracerCategoryList(); }}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {programs.length > 0
                                                    && programs.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.programId}>
                                                                {/* {getLabelText(item.label, this.state.lang)} */}
                                                                {(item.programCode)}
                                                            </option>
                                                        )
                                                    }, this)}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                {checkOnline === 'Online' &&
                                    <FormGroup className="tab-ml-1 mt-md-2 mb-md-0">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.productcategory')}</Label>
                                        <div className="controls SelectField">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="productCategoryId"
                                                    id="productCategoryId"
                                                    bsSize="sm"
                                                    onChange={this.fetchData}
                                                // onChange={(e) => { this.getPlanningUnit(); }}
                                                >

                                                    {/* <option value="-1">{i18n.t('static.common.all')}</option> */}
                                                    {/* {productCategories.length > 0
                                                        && productCategories.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
                                                                    {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
                                                                </option>
                                                            )
                                                        }, this)} */}

                                                    {
                                                        (productCategories.length > 0 ? productCategories.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
                                                                    {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
                                                                </option>
                                                            )
                                                        }, this) :
                                                            <option value={-1}>
                                                                {i18n.t('static.common.allCategories')}
                                                            </option>
                                                        )
                                                    }

                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                }
                                {checkOnline === 'Offline' &&
                                    <FormGroup className="tab-ml-1 mt-md-2 mb-md-0">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.productcategory')}</Label>
                                        <div className="controls SelectField">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="productCategoryId"
                                                    id="productCategoryId"
                                                    bsSize="sm"
                                                    onChange={this.fetchData}
                                                // onChange={(e) => { this.getPlanningUnit(); }}
                                                >

                                                    {/* <option value="-1">{i18n.t('static.common.allcategories')}</option> */}
                                                    <option value="-1">{i18n.t('static.common.all')}</option>
                                                    {productCategoriesOffline.length > 0
                                                        && productCategoriesOffline.map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.id}>
                                                                    {item.label}
                                                                </option>
                                                            )
                                                        }, this)}

                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                }
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                    <div className="controls SelectField">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="tracerCategoryId"
                                                id="tracerCategoryId"
                                                bsSize="sm"
                                                onChange={this.fetchData}
                                            // onChange={(e) => { this.getPlanningUnit(); }}
                                            >
                                                <option value="-1">{i18n.t('static.common.all')}</option>
                                                {tracerCategories.length > 0
                                                    && tracerCategories.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.tracerCategoryId}>
                                                                {getLabelText(item.label, this.state.lang)}
                                                            </option>
                                                        )
                                                    }, this)}

                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>

                        </Col>

                        <div>
                            <div id="tableDiv" className="jexcelremoveReadonlybackground consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                            </div>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                    <div class="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>

                    </CardBody>
                </Card>

            </div>
        );
    }
}
export default ProductCatalog
